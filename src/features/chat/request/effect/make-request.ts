import { Effect, Stream } from "effect";
import { createStreamingUIMessageState } from "../../core/streaming-ui-message-state";
import { MyUIMessage, MessageMetadata } from "@/features/messages/types";
import { type MakeRequestOptions, MakeRequestError } from "./types";
import { processUIMessageStream } from "./process-ui-message";
import { updateMessageMetadata, write } from "./process-ui-message-utils";
import isNetworkError from "is-network-error";

export const makeRequest = (options: MakeRequestOptions) =>
  Effect.flatMap(
    Effect.sync(() => ({
      state: createStreamingUIMessageState<MyUIMessage>({
        lastMessage: options.messages.at(-1),
        messageId: options.messageId ?? crypto.randomUUID(),
      }),
    })),
    (activeResponse) =>
      Effect.gen(function* () {
        const stream = yield* options.fetchStream();

        // Call processUIMessageStream with the required options
        yield* Stream.runDrain(
          processUIMessageStream({
            stream,
            state: activeResponse.state,
            store: options.store,
            messageMetadataSchema: options.messageMetadataSchema,
            dataPartSchemas: options.dataPartSchemas,
          }),
        );

        return activeResponse.state.message;
      }).pipe(
        Effect.catchTag("RequestError", (error) => {
          const errorMessage = error.message || "Request error occurred";
          const errorReason = error.reason;

          // Truncate the request body to prevent memory issues
          const sanitizedError = {
            ...error,
            request: {
              ...error.request,
              body:
                error.request.body &&
                typeof error.request.body === "object" &&
                "body" in error.request.body
                  ? {
                      ...error.request.body,
                      body: "TRUNCATED_BODY",
                    }
                  : error.request.body,
            },
          };

          // Check if it's a network error using is-network-error
          if (isNetworkError(sanitizedError)) {
            return Effect.fail(
              new MakeRequestError({
                type: "network",
                reason:
                  "Unable to connect to the server. Please check your internet connection and try again.",
                message: errorMessage,
                originalError: sanitizedError,
                timestamp: Date.now(),
              }),
            );
          }

          // Handle specific request error reasons
          switch (errorReason) {
            case "Transport":
              return Effect.fail(
                new MakeRequestError({
                  type: "transport",
                  reason: "Connection failed. Please try again in a moment.",
                  message: errorMessage,
                  originalError: sanitizedError,
                  timestamp: Date.now(),
                }),
              );
            case "Encode":
              return Effect.fail(
                new MakeRequestError({
                  type: "encode",
                  reason: "Failed to prepare your request. Please try again.",
                  message: errorMessage,
                  originalError: sanitizedError,
                  timestamp: Date.now(),
                }),
              );
            case "InvalidUrl":
              return Effect.fail(
                new MakeRequestError({
                  type: "invalid_url",
                  reason:
                    "Invalid request configuration. Please refresh the page and try again.",
                  message: errorMessage,
                  originalError: sanitizedError,
                  timestamp: Date.now(),
                }),
              );
            default:
              return Effect.fail(
                new MakeRequestError({
                  type: "unknown",
                  reason: "Something went wrong. Please try again.",
                  message: errorMessage,
                  originalError: sanitizedError,
                  timestamp: Date.now(),
                }),
              );
          }
        }),
        Effect.catchTag("ResponseError", (error) => {
          // Handle specific response error reasons
          switch (error.reason) {
            case "StatusCode":
              return Effect.fail(
                new MakeRequestError({
                  type: "http_status",
                  reason: "Server error occurred. Please try again later.",
                  message: error.message || "Response error occurred",
                  originalError: error,
                  timestamp: Date.now(),
                }),
              );
            case "Decode":
              return Effect.fail(
                new MakeRequestError({
                  type: "response_decode",
                  reason: "Received an invalid response. Please try again.",
                  message: error.message || "Response error occurred",
                  originalError: error,
                  timestamp: Date.now(),
                }),
              );
            case "EmptyBody":
              return Effect.fail(
                new MakeRequestError({
                  type: "empty_response",
                  reason:
                    "Server returned an empty response. Please try again.",
                  message: error.message || "Response error occurred",
                  originalError: error,
                  timestamp: Date.now(),
                }),
              );
            default:
              // This should never be reached due to TypeScript's type system,
              // but included as a safety net for runtime edge cases
              return Effect.fail(
                new MakeRequestError({
                  type: "unknown",
                  reason:
                    "Something went wrong with the server response. Please try again.",
                  message: error.message || "Response error occurred",
                  originalError: error,
                  timestamp: Date.now(),
                }),
              );
          }
        }),
        Effect.catchTag("HttpBodyError", (error) => {
          // Handle specific HTTP body error reasons
          switch (error.reason._tag) {
            case "JsonError":
              return Effect.fail(
                new MakeRequestError({
                  type: "json_error",
                  reason: "Invalid response format. Please try again.",
                  message: "HTTP body error occurred",
                  originalError: error,
                  timestamp: Date.now(),
                }),
              );
            case "SchemaError":
              return Effect.fail(
                new MakeRequestError({
                  type: "schema_error",
                  reason: "Response validation failed. Please try again.",
                  message: "HTTP body error occurred",
                  originalError: error,
                  timestamp: Date.now(),
                }),
              );
            default:
              return Effect.fail(
                new MakeRequestError({
                  type: "unknown",
                  reason:
                    "Something went wrong processing the response. Please try again.",
                  message: "HTTP body error occurred",
                  originalError: error,
                  timestamp: Date.now(),
                }),
              );
          }
        }),
        Effect.catchTag("ProcessUIMessageStreamError", (error) => {
          return Effect.fail(
            new MakeRequestError({
              type: "stream_processing",
              reason: "Failed to process the response. Please try again.",
              message: `Stream processing failed with ${error.count} errors`,
              originalError: error.errors,
              timestamp: Date.now(),
            }),
          );
        }),
        Effect.tapErrorTag("MakeRequestError", (error) =>
          Effect.catchAll(
            Effect.gen(function* () {
              const currentMetadata = activeResponse.state.message.metadata as
                | MessageMetadata
                | undefined;

              yield* updateMessageMetadata(
                {
                  errors: [
                    ...(currentMetadata?.errors ?? []),
                    { message: error.reason },
                  ],
                },
                activeResponse.state,
                options.messageMetadataSchema,
              );

              yield* write(options.store, activeResponse.state);
            }),
            (operationError) => {
              console.warn(
                "Failed to update message metadata or write state:",
                operationError,
              );
              return Effect.void;
            },
          ),
        ),
      ),
  );
