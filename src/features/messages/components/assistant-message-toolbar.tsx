import { useParams } from "react-router";
import CopyButton from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatMessageContent } from "../utils";
import type { MyUIMessage } from "../types";
import { cn } from "@/lib/utils";
import { useConvexFunctions } from "@/features/chat/hooks/use-convex-functions";
import { regenerateMessage } from "@/features/chat/regenerate-message";

interface AssistantMessageToolbarProps {
  parts: MyUIMessage["parts"];
  messageId: string;
  className?: string;
}

export function AssistantMessageToolbar({
  parts,
  messageId,
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

  const handleRegenerate = async () => {
    if (!threadId) return;

    try {
      await regenerateMessage({
        threadId,
        messageId,
        convexFunctions,
      });
    } catch (error) {
      console.error("Failed to regenerate message:", error);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <CopyButton
        content={formattedContent}
        showToast
        ariaLabel="Copy message"
        variant="ghost"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRegenerate}
        aria-label="Regenerate message"
      >
        <RefreshCw className="size-4" />
      </Button>
    </div>
  );
}
