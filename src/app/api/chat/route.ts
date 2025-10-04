import {
  HttpApp,
  HttpServerResponse,
  HttpServerRequest,
} from "@effect/platform";
import { Effect, ManagedRuntime, Logger, Stream } from "effect";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  smoothStream,
} from "ai";
import { validateRequestBody, validateMessages } from "./utils/validator";
import { createErrorStream } from "./utils/create-error-stream";
import { transformError } from "./utils/ai-errors";
import { extractMessageMetadata } from "./utils/extract-message-metadata";

export const maxDuration = 30;

// Define the app that handles AI streaming
const app = Effect.gen(function* () {
  yield* Effect.log("Received POST request to /api/chat");

  // Get the request and parse body
  const req = yield* HttpServerRequest.HttpServerRequest;
  const rawBody = yield* req.json;

  // Validate request structure
  const requestBody = yield* validateRequestBody(rawBody);

  // Extract values with defaults
  const messages = requestBody.messages;
  const model = requestBody.model;

  // Validate messages content
  const validatedMessages = yield* validateMessages(messages);

  yield* Effect.logInfo(
    `Validation successful. Processing AI request with model: ${model}`,
  );

  // Call streamText from AI SDK with validated messages
  // Model is validated by Zod refine, safe to use as-is
  const result = streamText({
    model: model,
    system: "You are a helpful assistant.",
    messages: convertToModelMessages(validatedMessages),
    stopWhen: [stepCountIs(5)],
    experimental_transform: smoothStream({
      delayInMs: 10,
      chunking: "word",
    }),
  });

  // Get the UI message stream response with error transformation
  // messageMetadata callback extracts data to send in start/finish events
  const streamResponse = result.toUIMessageStreamResponse({
    onError: (error) => {
      return transformError(error);
    },
    messageMetadata: extractMessageMetadata,
  });

  yield* Effect.log("Sending AI stream response");

  // Convert ReadableStream from Response.body to Effect Stream
  // Transfer headers from AI SDK response - they're already correct (text/event-stream, etc.)
  return yield* HttpServerResponse.stream(
    Stream.fromReadableStream(
      () => streamResponse.body!,
      (err) => new Error(`Stream error: ${err}`),
    ),
    {
      status: streamResponse.status,
      headers: Object.fromEntries(streamResponse.headers.entries()),
    },
  );
});

// Create a managed runtime with pretty logging
const managedRuntime = ManagedRuntime.make(Logger.pretty);
const runtime = await managedRuntime.runtime();

// Convert the app to a web handler using the runtime
const effectHandler = HttpApp.toWebHandlerRuntime(runtime)(
  app.pipe(
    Effect.catchTag("ValidationError", (error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Validation failed: ${error.reason}`);
        // Send error through UIMessage error stream channel
        return yield* createErrorStream(error.reason);
      }),
    ),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError("Unexpected error occurred.", error);
        // Send generic error through error stream
        return yield* createErrorStream(
          "An unexpected error occurred. Please try again.",
        );
      }),
    ),
  ),
);

// Adapt to Next.js route handler signature (ignores context param since we have no dynamic routes)
// We might wanna do something about it later...
export const POST = (
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: { params: Promise<Record<string, string | string[]>> },
): Promise<Response> => effectHandler(request);
