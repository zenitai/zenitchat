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
  const { streamingMessage } = useStreamingAssistant(threadId ?? "");

  // Convert Convex messages to UI messages
  const convexUIMessages = convexMessages
    ? convexMessagesToUIMessages(convexMessages)
    : [];

  if (!streamingMessage) {
    return convexUIMessages;
  }

  const placeholderIndex = convexUIMessages.findIndex(
    (message) => message.id === streamingMessage.id,
  );

  if (placeholderIndex >= 0) {
    const updatedMessages = convexUIMessages.slice();
    updatedMessages[placeholderIndex] = streamingMessage;
    return updatedMessages;
  }

  return [...convexUIMessages, streamingMessage];
}
