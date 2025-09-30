import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@/convex/_generated/api";
import { useStreamingAssistant } from "./use-streaming-assistant";
import { convexMessagesToUIMessages } from "@/features/messages/utils";
import type { MyUIMessage } from "@/features/messages/types";

/**
 * Hook that returns the display messages for a thread
 *
 * If streaming:
 * - Returns Convex messages - 1 (removes placeholder assistant message)
 * - Adds the streaming assistant message (from store in buffer, synced via useSyncExternalStore)
 *
 * Otherwise:
 * - Returns Convex messages as-is
 */
export function useDisplayMessages(
  threadId: string | undefined,
): MyUIMessage[] {
  // Get messages from Convex (skip query if no threadId)
  const convexMessages = useQuery(
    api.messages.getThreadMessages,
    threadId ? { threadId } : "skip",
  );

  // Get streaming message if any (always call hook, but pass empty string if no threadId)
  const { streamingMessage } = useStreamingAssistant(threadId || "");

  // Convert Convex messages to UI messages
  const convexUIMessages = convexMessages
    ? convexMessagesToUIMessages(convexMessages)
    : [];

  // Robust streaming detection
  const isStreaming = (() => {
    // Must have both streaming message and Convex messages
    if (!streamingMessage || convexUIMessages.length === 0) {
      return false;
    }

    // Get the last Convex message
    const lastConvexMessage = convexUIMessages[convexUIMessages.length - 1];

    // Check if the streaming message ID matches the last Convex message ID
    const messageIdsMatch = streamingMessage.id === lastConvexMessage.id;

    // Check if the last message is an assistant message (not user)
    const isLastMessageAssistant = lastConvexMessage.role === "assistant";

    return messageIdsMatch && isLastMessageAssistant;
  })();

  if (isStreaming) {
    // Remove the last message (placeholder assistant message) and add streaming message
    const messagesWithoutPlaceholder = convexUIMessages.slice(0, -1);
    return [...messagesWithoutPlaceholder, streamingMessage!]; // We know it's not null due to isStreaming check
  }

  // Return Convex messages as-is (empty array if loading)
  return convexUIMessages;
}
