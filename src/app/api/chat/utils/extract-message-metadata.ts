import type { TextStreamPart, ToolSet } from "ai";
import type { MessageMetadata } from "@/features/messages/types";

/**
 * Extracts message metadata from stream parts.
 * Called for each stream to attach metadata to the message.
 *
 * Called on start and finish events by AI SDK.
 */
export function extractMessageMetadata({
  part,
}: {
  part: TextStreamPart<ToolSet>;
}): Partial<MessageMetadata> | undefined {
  // Only process finish events
  if (part.type !== "finish") {
    return undefined;
  }

  const metadata: Partial<MessageMetadata> = {
    tokens: {
      input: part.totalUsage.inputTokens,
      output: part.totalUsage.outputTokens,
      reasoning: part.totalUsage.reasoningTokens,
      total: part.totalUsage.totalTokens,
    },
  };

  // Convert problematic finish reasons to user-facing errors
  if (part.finishReason === "length") {
    metadata.errors = [
      {
        message:
          "Response was cut off because the model reached its maximum output length. Consider creating a new thread.",
      },
    ];
  } else if (part.finishReason === "content-filter") {
    metadata.errors = [
      {
        message:
          "Response was blocked by model provider's content filter. Please rephrase your request.",
      },
    ];
  }

  return metadata;
}
