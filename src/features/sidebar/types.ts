// Thread type from Convex
export type Thread = {
  threadId: string;
  title: string;
  pinned: boolean;
  lastMessageAt: number;
};

// Thread item data for UI components
export type ThreadItemData = {
  id: string;
  title: string;
  url: string;
};

// Thread group for organizing threads
export type ThreadGroup = {
  title: string;
  items: ThreadItemData[];
};
