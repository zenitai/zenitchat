import { Stream } from "effect";
import { HttpServerResponse } from "@effect/platform";
import { createUIMessageStreamResponse } from "ai";
import type { UIMessageChunk } from "ai";

/**
 * Creates a UIMessage error stream that can be processed by the client.
 * Uses AI SDK's official createUIMessageStreamResponse utility
 */
export const createErrorStream = (errorMessage: string) => {
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

  // Use AI SDK's utility to format as SSE
  const response = createUIMessageStreamResponse({
    stream: errorStream,
  });

  // Convert to Effect HttpServerResponse
  return HttpServerResponse.stream(
    Stream.fromReadableStream(
      () => response.body!,
      (error) => new Error(`Error stream failed: ${error}`),
    ),
    {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    },
  );
};
