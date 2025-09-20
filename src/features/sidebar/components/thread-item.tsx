import {
  useState,
  useRef,
  useEffect,
  MouseEvent,
  ChangeEvent,
  KeyboardEvent,
} from "react";
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
import { toast } from "sonner";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSwitchingToEditRef = useRef(false);

  const handleDoubleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isSwitchingToEditRef.current = true;
    setIsEditing(true);
    setEditTitle(item.title);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleInputBlur = () => {
    // Don't save if we're switching to edit mode
    if (isSwitchingToEditRef.current) {
      return;
    }
    handleSave();
  };

  const handleSave = () => {
    if (!editTitle.trim()) {
      // Revert to original name when empty
      setEditTitle(item.title);
      setIsEditing(false);
      return;
    }

    if (editTitle.trim() === item.title) {
      setIsEditing(false);
      return;
    }

    if (editTitle.trim().length > 100) {
      toast.error("Thread name cannot exceed 100 characters");
      return;
    }

    // save thread name with useMutation
    toast.success("Thread renamed successfully");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setIsEditing(false);
  };

  const handleContextMenuRename = () => {
    isSwitchingToEditRef.current = true;
    setIsEditing(true);
    setEditTitle(item.title);
  };

  const handlePinToggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Placeholder: Toggle pin status
    toast.success(isPinned ? "Thread unpinned" : "Thread pinned");
    console.log(`${isPinned ? "Unpinning" : "Pinning"} thread:`, item.id);
  };

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Placeholder: Delete thread
    toast.success("Thread deleted");
    console.log("Deleting thread:", item.id);
  };

  const handleContextMenuPinToggle = () => {
    // Placeholder: Toggle pin status
    toast.success(isPinned ? "Thread unpinned" : "Thread pinned");
    console.log(`${isPinned ? "Unpinning" : "Pinning"} thread:`, item.id);
  };

  const handleContextMenuDelete = () => {
    // Placeholder: Delete thread
    toast.success("Thread deleted");
    console.log("Deleting thread:", item.id);
  };

  const handleRegenerateTitle = () => {
    // Placeholder: Regenerate thread title
    toast.success("Title regenerated");
    console.log("Regenerating title for thread:", item.id);
  };

  const handleExport = () => {
    // Placeholder: Export thread
    toast.success("Thread exported");
    console.log("Exporting thread:", item.id);
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
                      <span>
                        Press{" "}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs inline-flex items-center gap-1 align-middle">
                          <CornerDownLeft className="size-3" />
                          Enter
                        </code>{" "}
                        to save,{" "}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs align-middle">
                          Esc
                        </code>{" "}
                        to cancel
                      </span>
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
                        onClick={handleDelete}
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
          <ContextMenuItem onClick={handleRegenerateTitle}>
            <Sparkles />
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
    </SidebarMenuItem>
  );
}
