import { Effect, Stream } from "effect";
import { HttpServerResponse } from "@effect/platform";
import { createUIMessageStreamResponse } from "ai";
import type { UIMessageChunk } from "ai";

/**
 * Creates a UIMessage error stream that can be processed by the client.
 * Uses AI SDK's official createUIMessageStreamResponse utility
 */
export const createErrorStream = (errorMessage: string) =>
  Effect.sync(() => {
    const errorChunk: UIMessageChunk = {
      type: "error",
      errorText: errorMessage,
    };

    // Create a ReadableStream with a single error chunk
    const errorStream = new ReadableStream<UIMessageChunk>({
      start(controller) {
        controller.enqueue(errorChunk);
        controller.close();
      },
    });

    // Use AI SDK's official utility to format as SSE
    // It sets all correct headers: Content-Type: text/event-stream, etc.
    const response = createUIMessageStreamResponse({
      stream: errorStream,
    });

    // Convert to Effect HttpServerResponse
    // Headers are already set by createUIMessageStreamResponse - don't override them!
    return HttpServerResponse.stream(
      Stream.fromReadableStream(
        () => response.body!,
        (error) => new Error(`Error stream failed: ${error}`),
      ),
    );
  });
