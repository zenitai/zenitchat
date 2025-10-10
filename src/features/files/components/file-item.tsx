import { RotateCcw, Trash2, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isImage, getFileIcon, truncateFilename } from "../utils";
import type { FileItemProps } from "../types";

export function FileItem({
  file,
  onRemove,
  onMarkForDeletion,
  onRestore,
  onClick,
}: FileItemProps) {
  const isImageFile = isImage(file.mediaType);
  const isUploading = file.status === "uploading";
  const isMarkedForDeletion = file.status === "marked-for-deletion";
  const FileIcon = getFileIcon(file.mediaType);
  const showImageThumbnail = isImageFile && file.url && !isUploading;

  const handleClick = () => {
    if (!isUploading && onClick) {
      onClick();
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isMarkedForDeletion && onRestore) {
      onRestore();
    } else if (isMarkedForDeletion && onMarkForDeletion) {
      return;
    } else if (onRemove) {
      onRemove();
    } else if (onMarkForDeletion) {
      onMarkForDeletion();
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "group relative h-12 shrink-0 rounded-xl border border-secondary-foreground/[0.08] bg-secondary-foreground/[0.02]",
            !isUploading && "hover:bg-secondary-foreground/10 cursor-pointer",
            isUploading && "cursor-default",
            showImageThumbnail ? "w-12 justify-center p-0" : "gap-2 px-3.5",
          )}
          onClick={handleClick}
        >
          {showImageThumbnail ? (
            <div className="relative size-10 overflow-hidden rounded-lg">
              <Image
                src={file.url!}
                alt={file.filename}
                fill
                sizes="40px"
                className={cn("object-cover", isMarkedForDeletion && "blur-sm")}
              />
              {isMarkedForDeletion && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Trash2 className="size-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ) : (
            <>
              {isUploading ? (
                <Spinner className="shrink-0" />
              ) : (
                <FileIcon className="size-4 shrink-0" />
              )}
              <span
                className="flex-1 truncate pr-1 text-sm"
                title={file.filename}
              >
                {truncateFilename(file.filename, 30)}
              </span>
            </>
          )}

          {isMarkedForDeletion && !showImageThumbnail && (
            <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] backdrop-blur-sm bg-background/50">
              <Trash2 className="size-4 text-muted-foreground" />
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute -right-1 -top-1 cursor-pointer rounded-full bg-secondary p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                onClick={handleRemoveClick}
              >
                {isMarkedForDeletion ? (
                  <RotateCcw className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isMarkedForDeletion ? "Restore file" : "Remove file"}
            </TooltipContent>
          </Tooltip>
        </Button>
      </TooltipTrigger>
      {isMarkedForDeletion && (
        <TooltipContent>This file will be removed</TooltipContent>
      )}
    </Tooltip>
  );
}
