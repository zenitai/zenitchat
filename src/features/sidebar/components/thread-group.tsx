import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ThreadItem, ThreadItemData } from "./thread-item";

type ThreadGroupProps = {
  title: string;
  items: ThreadItemData[];
  currentPathname: string;
};

export function ThreadGroup({
  title,
  items,
  currentPathname,
}: ThreadGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="select-none outline-none ring-sidebar-ring ease-snappy focus-visible:ring-2 px-1.5 text-heading leading-tight-xs">
        <span>{title}</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <span
              key={item.id}
              data-state="closed"
              style={{ userSelect: "none" }}
            >
              <ThreadItem item={item} isActive={currentPathname === item.url} />
            </span>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
