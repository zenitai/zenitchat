import { Micro, Data, Stream, Option } from "effect";
import { createParser, type EventSourceMessage } from "eventsource-parser";
import type { UIMessageChunk } from "ai";
import { uiMessageChunkSchema } from "../request/schemas";
import { safeParseJSON, type ParseResult } from "@ai-sdk/provider-utils";
import type { ResponseError } from "@effect/platform/HttpClientError";
export class StreamParseError extends Data.TaggedError("StreamParseError")<{
  readonly message: string;
  readonly cause?: Error;
  readonly type:
    | "parser_not_initialized"
    | "parser_error"
    | "missing_data"
    | "parse_failed";
}> {}

interface ParserState {
  parser: ReturnType<typeof createParser> | null;
  events: Array<EventSourceMessage>;
  error: Error | null;
}

export const createParserState = (): ParserState => {
  const state: ParserState = { parser: null, events: [], error: null };

  state.parser = createParser({
    onEvent(event) {
      state.events.push(event);
    },
    onError(error) {
      state.error =
        error instanceof Error
          ? error
          : new Error(String(error ?? "Unknown parser error"));
    },
  });

  return state;
};

export const parseEventStreamChunk = (state: ParserState, chunk: string) =>
  Micro.try({
    try: () => {
      if (!state.parser) {
        throw new StreamParseError({
          message: "Parser not initialized",
          type: "parser_not_initialized",
        });
      }

      state.events = [];
      state.error = null;
      state.parser.feed(chunk);

      if (state.error) {
        throw new StreamParseError({
          message: "Parser error occurred",
          cause: state.error,
          type: "parser_error",
        });
      }

      const events = state.events;
      state.events = [];
      return events;
    },
    catch: (error) => {
      if (error instanceof StreamParseError) {
        return error;
      }
      return new StreamParseError({
        message: "Unexpected error in collectEvents",
        cause: error instanceof Error ? error : new Error(String(error)),
        type: "parser_error",
      });
    },
  });

export const safeParseEventData = (
  event: EventSourceMessage,
): Micro.Micro<ParseResult<UIMessageChunk>, StreamParseError, never> =>
  Micro.tryPromise({
    try: async () => {
      if (event.data == null) {
        throw new StreamParseError({
          message: "Missing event data in SSE message",
          type: "missing_data",
        });
      }

      // Return the ParseResult directly instead of throwing on failure
      return await safeParseJSON({
        text: event.data,
        schema: uiMessageChunkSchema,
      });
    },
    catch: (error) => {
      if (error instanceof StreamParseError) {
        return error;
      }
      return new StreamParseError({
        message: "Failed to parse chat stream payload",
        cause: error instanceof Error ? error : new Error(String(error)),
        type: "parse_failed",
      });
    },
  });

/**
 * Processes a raw HTTP response stream into a stream of UIMessageChunk objects.
 * This abstracts all the stream processing logic including:
 * - Decoding text from the response stream
 * - Parsing SSE event stream chunks
 * - Flattening parsed events
 * - Filtering out "[DONE]" events from OpenAI
 * - Safely parsing event data
 * - Filtering out failed parses
 */
export const processChatStream = (
  responseStream: Stream.Stream<
    Uint8Array<ArrayBufferLike>,
    ResponseError,
    never
  >,
) => {
  const parserState = createParserState();

  // Decode text from response stream
  const decodedStream = Stream.decodeText(responseStream);

  // Parse event stream chunks
  const parsedStream = Stream.mapEffect(decodedStream, (chunk) =>
    parseEventStreamChunk(parserState, chunk),
  );

  // Flatten parsed events
  const flattenedStream = Stream.flatMap(parsedStream, (events) =>
    Stream.fromIterable(events),
  );

  // Filter out "[DONE]" events
  const filteredStream = Stream.filter(
    flattenedStream,
    (event) => event.data !== "[DONE]",
  );

  // Parse event data safely
  const dataStream = Stream.mapEffect(filteredStream, safeParseEventData);

  // Filter out failed parses, keeping only successful ones
  const messageStream = Stream.filterMap(dataStream, (parseResult) => {
    if (parseResult.success) {
      return Option.some(parseResult.value);
    } else {
      // Log the error but don't include this chunk
      console.warn("Failed to parse chunk:", parseResult.error.message);
      return Option.none();
    }
  });

  return messageStream;
};
