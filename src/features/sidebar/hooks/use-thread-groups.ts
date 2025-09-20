import { useMemo } from "react";
import { ThreadGroup, Thread } from "../types";

export function useThreadGroups(threads: Thread[] | undefined) {
  return useMemo(() => {
    if (!threads) return { threadGroups: [] };

    // Precompute date boundaries once
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Single pass bucketing - O(n) instead of O(7n)
    const groups = {
      pinned: [] as Thread[],
      today: [] as Thread[],
      yesterday: [] as Thread[],
      lastWeek: [] as Thread[],
      lastMonth: [] as Thread[],
      older: [] as Thread[],
    };

    for (const thread of threads) {
      if (thread.pinned) {
        groups.pinned.push(thread);
      } else {
        // Precompute thread date once per thread
        const threadDate = new Date(thread.lastMessageAt);

        if (threadDate >= today) {
          groups.today.push(thread);
        } else if (threadDate >= yesterday) {
          groups.yesterday.push(thread);
        } else if (threadDate >= lastWeek) {
          groups.lastWeek.push(thread);
        } else if (threadDate >= lastMonth) {
          groups.lastMonth.push(thread);
        } else {
          groups.older.push(thread);
        }
      }
    }

    // Sort groups by lastMessageAt desc for stable UX
    const byDateDesc = (a: Thread, b: Thread) =>
      b.lastMessageAt - a.lastMessageAt;
    groups.pinned.sort(byDateDesc);
    groups.today.sort(byDateDesc);
    groups.yesterday.sort(byDateDesc);
    groups.lastWeek.sort(byDateDesc);
    groups.lastMonth.sort(byDateDesc);
    groups.older.sort(byDateDesc);

    // Build thread groups only for non-empty buckets
    const threadGroups: ThreadGroup[] = [];

    if (groups.pinned.length > 0) {
      threadGroups.push({
        title: "Pinned",
        items: groups.pinned.map((thread) => ({
          id: thread.threadId,
          title: thread.title,
          url: `/chat/${thread.threadId}`,
        })),
      });
    }

    if (groups.today.length > 0) {
      threadGroups.push({
        title: "Today",
        items: groups.today.map((thread) => ({
          id: thread.threadId,
          title: thread.title,
          url: `/chat/${thread.threadId}`,
        })),
      });
    }

    if (groups.yesterday.length > 0) {
      threadGroups.push({
        title: "Yesterday",
        items: groups.yesterday.map((thread) => ({
          id: thread.threadId,
          title: thread.title,
          url: `/chat/${thread.threadId}`,
        })),
      });
    }

    if (groups.lastWeek.length > 0) {
      threadGroups.push({
        title: "Last 7 Days",
        items: groups.lastWeek.map((thread) => ({
          id: thread.threadId,
          title: thread.title,
          url: `/chat/${thread.threadId}`,
        })),
      });
    }

    if (groups.lastMonth.length > 0) {
      threadGroups.push({
        title: "Last 30 Days",
        items: groups.lastMonth.map((thread) => ({
          id: thread.threadId,
          title: thread.title,
          url: `/chat/${thread.threadId}`,
        })),
      });
    }

    if (groups.older.length > 0) {
      threadGroups.push({
        title: "Older",
        items: groups.older.map((thread) => ({
          id: thread.threadId,
          title: thread.title,
          url: `/chat/${thread.threadId}`,
        })),
      });
    }

    return { threadGroups };
  }, [threads]);
}
