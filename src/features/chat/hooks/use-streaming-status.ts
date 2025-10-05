import { useCallback, useSyncExternalStore } from "react";
import {
  getOrCreateStreamingStore,
  peekStreamingStore,
} from "../core/streaming-registry";
import type { ChatStatus } from "../core/streaming-message-store";

/**
 * Hook for subscribing to streaming status changes for a specific thread.
 *
 * This hook manages the status subscription using an external store pattern to prevent
 * React render loops during streaming state transitions.
 *
 * @param threadId - The thread ID to watch for streaming status
 * @returns The current ChatStatus ("submitted" | "streaming" | "ready" | "error")
 *
 * @example
 * ```tsx
 * function ChatInput({ threadId }: { threadId: string }) {
 *   const status = useStreamingStatus(threadId);
 *   const isStreaming = status === "streaming" || status === "submitted";
 *
 *   return (
 *     <button onClick={isStreaming ? handleStop : handleSend}>
 *       {isStreaming ? <SquareIcon /> : <ArrowUpIcon />}
 *     </button>
 *   );
 * }
 * ```
 */
export function useStreamingStatus(threadId: string): ChatStatus {
  const subscribeToStatus = useCallback(
    (update: () => void) => {
      const store = getOrCreateStreamingStore(threadId);
      return store?.["~registerStatusCallback"](update) ?? (() => {});
    },
    [threadId],
  );

  const status = useSyncExternalStore(
    subscribeToStatus,
    () => {
      const store = getOrCreateStreamingStore(threadId);
      return store?.status ?? "ready";
    },
    () => {
      // Server snapshot for SSR to avoid hydration mismatch
      const store = peekStreamingStore(threadId);
      return store?.status ?? "ready";
    },
  );

  return status;
}
