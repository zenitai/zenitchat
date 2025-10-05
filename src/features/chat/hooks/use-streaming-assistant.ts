import { useCallback, useSyncExternalStore } from "react";
import {
  getOrCreateStreamingStore,
  peekStreamingStore,
} from "../core/streaming-registry";
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
  pendingUserMessage: MyUIMessage | null;
  clearPendingUserMessage: () => void;
} {
  const { throttleMs } = options || {};

  const subscribeToStreamingMessage = useCallback(
    (update: () => void) => {
      const store = getOrCreateStreamingStore(threadId);
      return (
        store?.["~registerMessageCallback"](update, throttleMs) ?? (() => {})
      );
    },
    [threadId, throttleMs],
  );

  const subscribeToPendingUserMessage = useCallback(
    (update: () => void) => {
      const store = getOrCreateStreamingStore(threadId);
      return (
        store?.["~registerPendingUserMessageCallback"](update) ?? (() => {})
      );
    },
    [threadId],
  );

  const streamingMessage = useSyncExternalStore(
    subscribeToStreamingMessage,
    () => {
      const store = getOrCreateStreamingStore(threadId);
      return store?.message ?? null;
    },
    () => {
      // Server snapshot for SSR to avoid hydration mismatch
      const store = peekStreamingStore(threadId);
      return store?.message ?? null;
    },
  );

  const pendingUserMessage = useSyncExternalStore(
    subscribeToPendingUserMessage,
    () => {
      const store = getOrCreateStreamingStore(threadId);
      return store?.pendingUserMessage ?? null;
    },
    () => {
      // Server snapshot for SSR to avoid hydration mismatch
      const store = peekStreamingStore(threadId);
      return store?.pendingUserMessage ?? null;
    },
  );

  const clearPendingUserMessage = useCallback(() => {
    const store = getOrCreateStreamingStore(threadId);
    if (store) store.pendingUserMessage = null;
  }, [threadId]);

  return {
    streamingMessage,
    pendingUserMessage,
    clearPendingUserMessage,
  };
}
