import { useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Micro } from "effect";

export class ConvexError extends Micro.TaggedError("ConvexError")<{
  readonly operation: string;
  readonly errorMessage: string;
  readonly originalError: unknown;
}> {}

/**
 * Hook that provides all Convex mutations and queries needed for message operations
 * This centralizes all Convex operations for better integration, optimistic updates,
 * loading states, and error handling
 */
export function useConvexFunctions() {
  const convex = useConvex();

  const createThreadConvex = useMutation(
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

  const addMessagesToThreadConvex = useMutation(
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
  const updateMessageConvex = useMutation(api.messages.updateMessage);
  const setMessageErrorConvex = useMutation(api.messages.setMessageError);
  const updateThreadConvex = useMutation(api.threads.updateThread);

  // One-off query function for getting thread messages
  const fetchThreadMessagesConvex = async (threadId: string) => {
    return await convex.query(api.messages.getThreadMessages, { threadId });
  };

  // Effect-wrapped functions using Micro.tryPromise
  const createThread = (args: Parameters<typeof createThreadConvex>[0]) =>
    Micro.tryPromise({
      try: () => createThreadConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "createThread",
          errorMessage: `Failed to create thread: ${error instanceof Error ? JSON.stringify(error) : String(error)}`,
          originalError: error,
        }),
    });
  const addMessagesToThread = (
    args: Parameters<typeof addMessagesToThreadConvex>[0],
  ) =>
    Micro.tryPromise({
      try: () => addMessagesToThreadConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "addMessagesToThread",
          errorMessage: `Failed to add messages to thread: ${error instanceof Error ? JSON.stringify(error) : String(error)}`,
          originalError: error,
        }),
    });
  const updateMessage = (args: Parameters<typeof updateMessageConvex>[0]) =>
    Micro.tryPromise({
      try: () => updateMessageConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "updateMessage",
          errorMessage: `Failed to update message: ${error instanceof Error ? JSON.stringify(error) : String(error)}`,
          originalError: error,
        }),
    });
  const setMessageError = (args: Parameters<typeof setMessageErrorConvex>[0]) =>
    Micro.tryPromise({
      try: () => setMessageErrorConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "setMessageError",
          errorMessage: `Failed to set message error: ${error instanceof Error ? JSON.stringify(error) : String(error)}`,
          originalError: error,
        }),
    });
  const updateThread = (args: Parameters<typeof updateThreadConvex>[0]) =>
    Micro.tryPromise({
      try: () => updateThreadConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "updateThread",
          errorMessage: `Failed to update thread: ${error instanceof Error ? JSON.stringify(error) : String(error)}`,
          originalError: error,
        }),
    });
  const fetchThreadMessages = (threadId: string) =>
    Micro.tryPromise({
      try: () => fetchThreadMessagesConvex(threadId),
      catch: (error) =>
        new ConvexError({
          operation: "fetchThreadMessages",
          errorMessage: `Failed to fetch thread messages: ${error instanceof Error ? JSON.stringify(error) : String(error)}`,
          originalError: error,
        }),
    });

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
