import type { MyUIMessage } from "./types";

/**
 * Format message parts into nicely formatted text for copying
 */
export function formatMessageContent(parts: MyUIMessage["parts"]): string {
  const textParts = parts.filter((part) => part.type === "text");
  const reasoningParts = parts.filter((part) => part.type === "reasoning");

  // If there's only text and no reasoning, just return the text as-is
  if (textParts.length > 0 && reasoningParts.length === 0) {
    return textParts.map((part) => part.text.trim()).join("\n\n");
  }

  // If there's reasoning involved, use structured formatting
  const formattedParts = parts
    .map((part) => {
      if (part.type === "text") {
        return `**Response:**\n${part.text.trim()}`;
      }
      if (part.type === "reasoning") {
        return `**Reasoning:**\n${part.text.trim()}`;
      }
      return "";
    })
    .filter(Boolean);

  if (formattedParts.length === 0) {
    return "";
  }

  return formattedParts.join("\n\n---\n\n");
}
