import { parseJsonEventStream, ParseResult } from "@ai-sdk/provider-utils";
import type { UIMessageChunk } from "ai";
import { uiMessageChunkSchema } from "./schemas";
import type { ChatFetcherOptions, ChatFetcher } from "./types";

/**
 * Default chat fetcher that makes a POST request to /api/chat
 * and processes the response stream into UIMessageChunks
 */
export const defaultChatFetcher: ChatFetcher = async ({
  messages,
  model,
  signal,
}: ChatFetcherOptions): Promise<ReadableStream<UIMessageChunk>> => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: message.parts,
        metadata: message.metadata,
      })),
      model,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to start streaming response");
  }

  return parseJsonEventStream({
    stream: response.body,
    schema: uiMessageChunkSchema,
  }).pipeThrough(
    new TransformStream<ParseResult<UIMessageChunk>, UIMessageChunk>({
      async transform(chunk, controller) {
        if (!chunk.success) {
          throw chunk.error;
        }
        controller.enqueue(chunk.value);
      },
    }),
  );
};
