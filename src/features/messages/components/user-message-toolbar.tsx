import CopyButton from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { SquarePen, PenOff } from "lucide-react";
import { formatMessageContent } from "../utils";
import type { MyUIMessage } from "../types";
import { cn } from "@/lib/utils";

interface UserMessageToolbarProps {
  parts: MyUIMessage["parts"];
  className?: string;
  isEditing: boolean;
  onEditClick: () => void;
  onCancelEdit: () => void;
}

export function UserMessageToolbar({
  parts,
  className,
  isEditing,
  onEditClick,
  onCancelEdit,
}: UserMessageToolbarProps) {
  const formattedContent = formatMessageContent(parts);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {isEditing ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancelEdit}
          aria-label="Cancel editing"
        >
          <PenOff className="size-4" />
        </Button>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEditClick}
            aria-label="Edit message"
          >
            <SquarePen className="size-4" />
          </Button>
          <CopyButton
            content={formattedContent}
            showToast
            ariaLabel="Copy message"
            variant="ghost"
          />
        </>
      )}
    </div>
  );
}
