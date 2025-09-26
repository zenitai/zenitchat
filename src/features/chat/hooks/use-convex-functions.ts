import { useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook that provides all Convex mutations and queries needed for message operations
 * This centralizes all Convex operations for better integration, optimistic updates,
 * loading states, and error handling
 */
export function useConvexFunctions() {
  const convex = useConvex();

  const createThread = useMutation(
    api.threads.createThread,
  ).withOptimisticUpdate((localStore, args) => {
    const { threadId, title, model } = args;
    const now = Date.now();
    const newThread = {
      _id: crypto.randomUUID() as Id<"threads">,
      _creationTime: now,
      threadId,
      title,
      userId: "temp-user" as Id<"users">,
      model,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      generationStatus: "submitted" as const,
      userSetTitle: false,
      pinned: false,
    };

    // Add to threads list if it exists
    const existingThreads = localStore.getQuery(api.threads.getUserThreads, {
      paginationOpts: { numItems: 50, cursor: null },
    });
    if (existingThreads !== undefined) {
      localStore.setQuery(
        api.threads.getUserThreads,
        { paginationOpts: { numItems: 50, cursor: null } },
        {
          ...existingThreads,
          page: [newThread, ...existingThreads.page],
        },
      );
    }
  });

  const addMessagesToThread = useMutation(
    api.messages.addMessagesToThread,
  ).withOptimisticUpdate((localStore, args) => {
    const { threadId, messages } = args;
    const now = Date.now();

    // Convert messages to the expected format
    const newMessages = messages.map((message) => ({
      _id: crypto.randomUUID() as Id<"messages">,
      _creationTime: now,
      messageId: message.messageId,
      threadId,
      userId: "temp-user" as Id<"users">,
      role: message.role,
      parts: message.parts,
      createdAt: now,
      updatedAt: now,
      generationStatus: message.generationStatus || "submitted",
      attachmentIds: message.attachmentIds || [],
      metadata: message.metadata,
    }));

    // Add to thread messages if it exists
    const existingMessages = localStore.getQuery(
      api.messages.getThreadMessages,
      { threadId },
    );
    if (existingMessages !== undefined) {
      localStore.setQuery(api.messages.getThreadMessages, { threadId }, [
        ...existingMessages,
        ...newMessages,
      ]);
    }
  });
  const updateMessage = useMutation(api.messages.updateMessage);
  const setMessageError = useMutation(api.messages.setMessageError);
  const updateThread = useMutation(api.threads.updateThread);

  // One-off query function for getting thread messages
  const fetchThreadMessages = async (threadId: string) => {
    return await convex.query(api.messages.getThreadMessages, { threadId });
  };

  return {
    mutations: {
      createThread,
      addMessagesToThread,
      updateMessage,
      setMessageError,
      updateThread,
    },
    queries: {
      fetchThreadMessages,
    },
  };
}

// Type helper for the hook return value
export type ConvexFunctions = ReturnType<typeof useConvexFunctions>;
