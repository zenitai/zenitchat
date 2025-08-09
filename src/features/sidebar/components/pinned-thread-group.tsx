import * as React from "react";
import { PinOff } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ThreadItem, ThreadItemData } from "./thread-item";

type PinnedThreadGroupProps = {
  title: string;
  items: ThreadItemData[];
  currentPathname: string;
};

export function PinnedThreadGroup({
  title,
  items,
  currentPathname,
}: PinnedThreadGroupProps) {
  return (
    <SidebarGroup>
      <Accordion type="single" collapsible defaultValue="pinned">
        <AccordionItem value="pinned" className="border-0">
          <AccordionTrigger className="flex h-8 items-center rounded-md px-1.5 text-xs font-medium no-underline hover:no-underline [&>svg]:translate-y-0">
            <span className="flex items-center gap-1.5">
              <PinOff className="size-3.5" />
              {title}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-0 pb-0">
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <span
                    key={item.id}
                    data-state="closed"
                    style={{ userSelect: "none" }}
                  >
                    <ThreadItem
                      item={item}
                      isActive={currentPathname === item.url}
                      isPinned
                    />
                  </span>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </SidebarGroup>
  );
}
