import * as React from "react";
import { Link } from "react-router";
import { Pin, PinOff, X, Sparkles, TextCursor, Download } from "lucide-react";

import { Input } from "@/components/ui/input";
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

export type ThreadItemData = {
  id: string;
  title: string;
  url: string;
};

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
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className="p-0 h-auto">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <Link
              className="group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:focus-visible:bg-sidebar-accent"
              data-discover="true"
              to={item.url}
            >
              <div className="relative flex w-full items-center">
                <Tooltip delayDuration={800} skipDelayDuration={400}>
                  <TooltipTrigger asChild>
                    <button data-state="closed" className="w-full">
                      <div className="relative w-full flex items-center">
                        <Input
                          id={`thread-title-${item.id}`}
                          aria-label="Thread title"
                          aria-describedby="thread-title-hint"
                          aria-readonly="true"
                          readOnly
                          tabIndex={-1}
                          className="h-full !bg-transparent px-1 py-1 text-sm text-muted-foreground cursor-pointer overflow-hidden truncate border-none shadow-none !ring-0 pointer-events-none select-none caret-transparent"
                          title={item.title}
                          type="text"
                          value={item.title}
                          name={`threadTitle-${item.id}`}
                        />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{item.title}</TooltipContent>
                </Tooltip>
                <div className="pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end text-muted-foreground transition-transform group-hover/link:translate-x-0 group-hover/link:bg-sidebar-accent">
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Delete Thread</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Link>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              {isPinned ? <PinOff /> : <Pin />}
              {isPinned ? "Unpin" : "Pin"}
            </ContextMenuItem>
            <ContextMenuItem>
              <TextCursor />
              Rename
            </ContextMenuItem>
            <ContextMenuItem>
              <Sparkles />
              Regenerate Title
            </ContextMenuItem>
            <ContextMenuItem>
              <X />
              Delete
            </ContextMenuItem>
            <ContextMenuItem>
              <Download />
              Export
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
