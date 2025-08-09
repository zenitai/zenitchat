import * as React from "react";
import { useLocation } from "react-router";

import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebarHeader } from "./components/app-sidebar-header";
import { ThreadGroup } from "./components/thread-group";
import { PinnedThreadGroup } from "./components/pinned-thread-group";

// Chat threads data structure
type ThreadListItem = {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
};

type ThreadGroup = {
  title: string;
  items: ThreadListItem[];
};

const data: { threadGroups: ThreadGroup[] } = {
  threadGroups: [
    {
      title: "Pinned",
      items: [
        {
          id: "pinned-001",
          title: "Welcome thread",
          url: "/chat/pinned-001",
        },
        {
          id: "pinned-002",
          title: "Team guidelines",
          url: "/chat/pinned-002",
        },
      ],
    },
    {
      title: "Today",
      items: [
        {
          id: "a0b1c2d3-e4f5-6789-abcd-000000000001",
          title: "Quick question",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-000000000001",
          isActive: true,
        },
        {
          id: "a0b1c2d3-e4f5-6789-abcd-000000000002",
          title: "Refactor sidebar layout",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-000000000002",
        },
        {
          id: "a0b1c2d3-e4f5-6789-abcd-000000000003",
          title: "API response caching",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-000000000003",
        },
      ],
    },
    {
      title: "Yesterday",
      items: [
        {
          id: "a0b1c2d3-e4f5-6789-abcd-000000000004",
          title: "Edge runtime notes",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-000000000004",
        },
        {
          id: "a0b1c2d3-e4f5-6789-abcd-000000000005",
          title: "Auth state issues",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-000000000005",
        },
      ],
    },
    {
      title: "Last 7 Days",
      items: [
        {
          id: "a0b1c2d3-e4f5-6789-abcd-000000000006",
          title: "Optimizing images",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-000000000006",
        },
        {
          id: "a0b1c2d3-e4f5-6789-abcd-000000000007",
          title: "Rendering modes",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-000000000007",
        },
        {
          id: "a0b1c2d3-e4f5-6789-abcd-000000000008",
          title: "File conventions",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-000000000008",
        },
      ],
    },
    {
      title: "Last 30 Days",
      items: [
        {
          id: "f44cc25f-7b70-4af6-9bba-1bb7656f875a",
          title: "Greeting",
          url: "/chat/f44cc25f-7b70-4af6-9bba-1bb7656f875a",
        },
        {
          id: "e124f469-b696-4fa3-a895-4e1b45346c6f",
          title: "Greeting",
          url: "/chat/e124f469-b696-4fa3-a895-4e1b45346c6f",
        },
        {
          id: "933a7708-d0ba-4945-9b58-ce8b1af234bf",
          title: "Greeting",
          url: "/chat/933a7708-d0ba-4945-9b58-ce8b1af234bf",
        },
        {
          id: "f6f6270e-086c-4677-be14-441ff4e9b2e5",
          title: "Daytona for code sandboxes",
          url: "/chat/f6f6270e-086c-4677-be14-441ff4e9b2e5",
        },
      ],
    },
    {
      title: "Older",
      items: [
        {
          id: "a0b1c2d3-e4f5-6789-abcd-000000000009",
          title: "Legacy migration plan",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-000000000009",
        },
        {
          id: "a0b1c2d3-e4f5-6789-abcd-00000000000a",
          title: "CI/CD pipeline",
          url: "/chat/a0b1c2d3-e4f5-6789-abcd-00000000000a",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  return (
    <Sidebar className="p-2 bg-sidebar" {...props}>
      <AppSidebarHeader />
      <SidebarContent className="scroll-shadow hidden-scrollbar">
        {/* Thread groups */}
        {data.threadGroups.map((group) =>
          group.title === "Pinned" ? (
            <PinnedThreadGroup
              key={group.title}
              title={group.title}
              items={group.items}
              currentPathname={location.pathname}
            />
          ) : (
            <ThreadGroup
              key={group.title}
              title={group.title}
              items={group.items}
              currentPathname={location.pathname}
            />
          ),
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
