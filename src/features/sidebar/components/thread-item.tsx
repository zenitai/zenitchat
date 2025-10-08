import { useEffect, MouseEvent, ChangeEvent, KeyboardEvent } from "react";
import { Link } from "react-router";
import {
  Pin,
  PinOff,
  X,
  Sparkles,
  TextCursor,
  Download,
  CornerDownLeft,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useThreadActions } from "../hooks/use-thread-actions";
import { DeleteThreadDialog } from "./delete-thread-dialog";
import { Spinner } from "@/components/ui/spinner";

import type { ThreadItemData } from "../types";

type ThreadItemProps = {
  item: ThreadItemData;
  isActive: boolean;
  isPinned?: boolean;
};

export function ThreadItem({
  item,
  isActive,
  isPinned = false,
}: ThreadItemProps) {
  const {
    isEditing,
    editTitle,
    setEditTitle,
    showDeleteDialog,
    isDeleting,
    isRegeneratingTitle,
    inputRef,
    isSwitchingToEditRef,
    startEditing,
    cancelEditing,
    handleSave,
    handleRename,
    handlePinToggle,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteOpenChange,
    handleRegenerateTitle,
    handleExport,
  } = useThreadActions(item.id);

  const handleDoubleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startEditing(item.title);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSave(item.title);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancelEditing(item.title);
    }
  };

  const handleInputBlur = () => {
    // Only save if actually editing and not switching into edit
    if (!isEditing || isSwitchingToEditRef.current) return;
    handleSave(item.title);
  };

  const handleContextMenuRename = () => {
    handleRename(item.title);
  };

  const handleContextMenuPinToggle = () => {
    handlePinToggle();
  };

  const handleContextMenuDelete = () => {
    handleDeleteClick();
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      // Reset the flag after focusing to allow blur events to work properly
      setTimeout(() => {
        isSwitchingToEditRef.current = false;
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  return (
    <SidebarMenuItem>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <SidebarMenuButton asChild isActive={isActive} className="p-0 h-auto">
            <Link
              className="group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:focus-visible:bg-sidebar-accent"
              data-discover="true"
              to={item.url}
            >
              <div className="relative flex w-full items-center">
                <Tooltip delayDuration={800} skipDelayDuration={400}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full h-auto p-0"
                      onDoubleClick={handleDoubleClick}
                    >
                      <div className="relative w-full flex items-center">
                        {isRegeneratingTitle && <Spinner />}
                        <Input
                          ref={inputRef}
                          id={`thread-title-${item.id}`}
                          aria-label="Thread title"
                          aria-describedby="thread-title-hint"
                          readOnly={!isEditing}
                          tabIndex={isEditing ? 0 : -1}
                          className={`h-full !bg-transparent px-1 py-1 text-sm text-muted-foreground overflow-hidden truncate border-none shadow-none !ring-0 select-none ${
                            isEditing
                              ? "cursor-text pointer-events-auto caret-auto bg-sidebar-accent/50"
                              : "cursor-pointer pointer-events-none caret-transparent"
                          }`}
                          title={isEditing ? undefined : item.title}
                          type="text"
                          value={isEditing ? editTitle : item.title}
                          name={`threadTitle-${item.id}`}
                          onChange={handleInputChange}
                          onKeyDown={handleInputKeyDown}
                          onBlur={handleInputBlur}
                        />
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span>Press</span>
                        <kbd>
                          <CornerDownLeft className="size-3" />
                        </kbd>
                        <span>to save,</span>
                        <kbd>Esc</kbd>
                        <span>to cancel</span>
                      </div>
                    ) : (
                      item.title
                    )}
                  </TooltipContent>
                </Tooltip>
                <div
                  className={`pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end text-muted-foreground transition-transform group-hover/link:translate-x-0 group-hover/link:bg-sidebar-accent ${
                    isEditing ? "hidden" : ""
                  }`}
                >
                  <div className="pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-sidebar-accent to-transparent opacity-0 group-hover/link:opacity-100" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="rounded-md p-1.5 hover:text-foreground/75 hover:bg-foreground/10 dark:hover:bg-foreground/20"
                        tabIndex={-1}
                        data-action={isPinned ? "unpin-thread" : "pin-thread"}
                        aria-label={isPinned ? "Unpin thread" : "Pin thread"}
                        data-state="closed"
                        type="button"
                        onClick={handlePinToggle}
                      >
                        {isPinned ? (
                          <PinOff className="size-4" aria-hidden="true" />
                        ) : (
                          <Pin className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {isPinned ? "Unpin Thread" : "Pin Thread"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="rounded-md p-1.5 hover:text-foreground hover:bg-foreground/10 dark:hover:bg-foreground/20"
                        tabIndex={-1}
                        data-action="thread-delete"
                        aria-label="Delete thread"
                        data-state="closed"
                        type="button"
                        onClick={handleDeleteClick}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Delete Thread</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Link>
          </SidebarMenuButton>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleContextMenuPinToggle}>
            {isPinned ? <PinOff /> : <Pin />}
            {isPinned ? "Unpin" : "Pin"}
          </ContextMenuItem>
          <ContextMenuItem onClick={handleContextMenuRename}>
            <TextCursor className="text-muted-foreground" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleRegenerateTitle}
            disabled={isRegeneratingTitle}
          >
            {isRegeneratingTitle ? <Spinner /> : <Sparkles />}
            Regenerate Title
          </ContextMenuItem>
          <ContextMenuItem onClick={handleContextMenuDelete}>
            <X />
            Delete
          </ContextMenuItem>
          <ContextMenuItem onClick={handleExport}>
            <Download />
            Export
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <DeleteThreadDialog
        open={showDeleteDialog}
        onOpenChange={handleDeleteOpenChange}
        onConfirm={handleDeleteConfirm}
        threadTitle={item.title}
        isPending={isDeleting}
      />
    </SidebarMenuItem>
  );
}
