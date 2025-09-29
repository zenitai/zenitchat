import type { UIMessageChunk } from "ai";
import type { MyUIMessage } from "@/features/messages/types";
import type { StreamingMessageStore } from "../core/streaming-message-store";
import type {
  UIDataTypesToSchemas,
  InferUIMessageData,
  InferUIMessageMetadata,
} from "../core/types";
import { StandardSchemaV1, Validator } from "@ai-sdk/provider-utils";
import type { Effect, Stream } from "effect";
import { Data } from "effect";
import type { HttpClient } from "@effect/platform";
import type { HttpBody } from "@effect/platform";
import type { HttpClientError } from "@effect/platform/HttpClientError";

// ============================================================================
// OPTIONS
// ============================================================================

/**
 * Options for the chat fetcher function
 *
 * This is the same as the ChatFetcherOptions interface in the regular types file
 * but without the signal parameter since we're using Effect for concurrency
 */
export interface ChatFetcherOptions {
  messages: MyUIMessage[];
  model: string;
}

export type ChatFetcherResult = Effect.Effect<
  Stream.Stream<UIMessageChunk, never, never>,
  HttpClientError | HttpBody.HttpBodyError,
  HttpClient.HttpClient
>;

export type ChatFetcher = (options: ChatFetcherOptions) => ChatFetcherResult;

export interface MakeRequestOptions {
  store: StreamingMessageStore<MyUIMessage>;
  messages: MyUIMessage[];
  messageId?: string;
  fetchStream: () => ChatFetcherResult;
  messageMetadataSchema?:
    | Validator<InferUIMessageMetadata<MyUIMessage>>
    | StandardSchemaV1<InferUIMessageMetadata<MyUIMessage>>;
  dataPartSchemas?: UIDataTypesToSchemas<InferUIMessageData<MyUIMessage>>;
  //onToolCall will go here
  //onData will go here
}

// ============================================================================
// ERRORS
// ============================================================================

export class MakeRequestError extends Data.TaggedError("MakeRequestError")<{
  readonly type:
    | "network"
    | "transport"
    | "encode"
    | "invalid_url"
    | "http_status"
    | "response_decode"
    | "empty_response"
    | "json_error"
    | "schema_error"
    | "stream_processing"
    | "api_error"
    | "abort"
    | "unknown";
  readonly reason: string;
  readonly message: string;
  readonly originalError?: unknown;
  readonly timestamp: number;
}> {}

export class ProcessUIMessageOperationError extends Data.TaggedError(
  "ProcessUIMessageOperationError",
)<{
  readonly reason: string;
  readonly message: string;
  readonly originalError?: unknown;
}> {}

export class ProcessUIMessageStreamError extends Data.TaggedError(
  "ProcessUIMessageStreamError",
)<{
  readonly errors: ProcessUIMessageOperationError[];
  readonly count: number;
}> {}

export class ConvexError extends Data.TaggedError("ConvexError")<{
  readonly operation: string;
  readonly reason: string;
  readonly message: string;
  readonly originalError: unknown;
  readonly timestamp: number;
}> {}
