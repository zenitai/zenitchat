import { useCallback, useRef, useSyncExternalStore } from "react";
import { peekStreamingStore } from "../core/streaming-registry";
import type { MyUIMessage } from "@/features/messages/types";

interface UseStreamingAssistantOptions {
  throttleMs?: number;
}

/**
 * Hook for streaming AI assistant conversations with optimistic UI updates
 *
 * This hook manages the streaming state using an external store pattern to prevent
 * React render loops during high-frequency streaming updates.
 */
export function useStreamingAssistant(
  threadId: string,
  options?: UseStreamingAssistantOptions,
): {
  streamingMessage: MyUIMessage | null;
} {
  const { throttleMs } = options || {};
  const storeRef = useRef(peekStreamingStore(threadId));

  const subscribeToStreamingMessage = useCallback(
    (update: () => void) =>
      storeRef.current?.["~registerMessageCallback"](update, throttleMs) ??
      (() => {}),
    [throttleMs],
  );

  const streamingMessage = useSyncExternalStore(
    subscribeToStreamingMessage,
    () => storeRef.current?.message ?? null,
  );

  return {
    streamingMessage,
  };
}
