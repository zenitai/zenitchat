import { useParams } from "react-router";
import CopyButton from "@/components/ui/copy-button";
import { formatMessageContent } from "../utils";
import type { MyUIMessage } from "../types";
import { cn } from "@/lib/utils";
import { useConvexFunctions } from "@/features/chat/hooks/use-convex-functions";
import { regenerateMessage } from "@/features/chat/regenerate-message";
import { RegenerateDropdown } from "./regenerate-dropdown";
import { getModelById } from "@/features/models";

interface AssistantMessageToolbarProps {
  parts: MyUIMessage["parts"];
  messageId: string;
  currentModel?: string;
  className?: string;
}

export function AssistantMessageToolbar({
  parts,
  messageId,
  currentModel,
  className,
}: AssistantMessageToolbarProps) {
  const { threadId } = useParams<{ threadId: string }>();
  const convexFunctions = useConvexFunctions();

  // Check if any part is still streaming
  const isStreaming = parts.some(
    (part) => "state" in part && part.state === "streaming",
  );

  // Don't show toolbar during streaming
  if (isStreaming) {
    return null;
  }

  const formattedContent = formatMessageContent(parts);

  // Get model display name
  const modelDisplayName = currentModel
    ? getModelById(currentModel)?.displayName
    : undefined;

  const handleRegenerate = async (modelId?: string) => {
    if (!threadId) return;

    try {
      await regenerateMessage({
        threadId,
        messageId,
        model: modelId,
        convexFunctions,
      });
    } catch (error) {
      console.error("Failed to regenerate message:", error);
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <CopyButton
        content={formattedContent}
        showToast
        ariaLabel="Copy message"
        variant="ghost"
        tooltipText="Copy message"
      />
      <RegenerateDropdown
        currentModel={currentModel}
        onRegenerate={handleRegenerate}
      />
      {modelDisplayName && (
        <span className="text-xs text-muted-foreground whitespace-nowrap max-sm:hidden">
          {modelDisplayName}
        </span>
      )}
    </div>
  );
}
