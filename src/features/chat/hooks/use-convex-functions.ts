import { useMutation, useConvex, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Effect } from "effect";
import { ConvexError } from "../request/types";
import type { MyUIMessage } from "@/features/messages/types";

const formatError = (e: unknown) =>
  e instanceof Error ? e.message : String(e);

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

  const createThreadWithMessagesConvex = useMutation(
    api.messages.createThreadWithMessages,
  ).withOptimisticUpdate((localStore, args) => {
    const { threadId, title, model, messages } = args;
    const now = Date.now();

    // Create new thread
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
  const updateThreadTitleConvex = useMutation(
    api.threads.updateThreadTitle,
  ).withOptimisticUpdate((localStore, args) => {
    const { threadId, title } = args;
    const now = Date.now();

    // Update in threads list if it exists
    const existingThreads = localStore.getQuery(api.threads.getUserThreads, {
      paginationOpts: { numItems: 50, cursor: null },
    });
    if (existingThreads !== undefined) {
      const updatedPage = existingThreads.page.map((thread) =>
        thread.threadId === threadId
          ? { ...thread, title, updatedAt: now, userSetTitle: true }
          : thread,
      );
      localStore.setQuery(
        api.threads.getUserThreads,
        { paginationOpts: { numItems: 50, cursor: null } },
        {
          ...existingThreads,
          page: updatedPage,
        },
      );
    }
  });
  const regenerateFromMessageConvex = useMutation(
    api.messages.regenerateFromMessage,
  ).withOptimisticUpdate((localStore, args) => {
    const { threadId, fromMessageId, messagesToAdd } = args;
    const now = Date.now();

    // Get existing messages
    const existingMessages = localStore.getQuery(
      api.messages.getThreadMessages,
      { threadId },
    );

    if (existingMessages !== undefined) {
      // Find the index of the message to regenerate from
      const startIndex = existingMessages.findIndex(
        (m) => m.messageId === fromMessageId,
      );

      if (startIndex !== -1) {
        // Remove messages from that index onwards
        const remainingMessages = existingMessages.slice(0, startIndex);

        // Convert new messages to the expected format
        const newMessages = messagesToAdd.map((message) => ({
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

        // Set the updated messages list
        localStore.setQuery(api.messages.getThreadMessages, { threadId }, [
          ...remainingMessages,
          ...newMessages,
        ]);
      }
    }
  });

  // One-off query function for getting thread messages
  const fetchThreadMessagesConvex = async (threadId: string) => {
    return await convex.query(api.messages.getThreadMessages, { threadId });
  };

  // Actions
  const generateTitleActionConvex = useAction(api.actions.generateTitle);

  // Effect-wrapped functions using Effect.tryPromise
  const createThread = (args: Parameters<typeof createThreadConvex>[0]) =>
    Effect.tryPromise({
      try: () => createThreadConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "createThread",
          reason: "Failed to create thread",
          message: `Failed to create thread: ${formatError(error)}`,
          originalError: error,
          timestamp: Date.now(),
        }),
    }).pipe(Effect.retry({ times: 2 }));

  const addMessagesToThread = (
    args: Parameters<typeof addMessagesToThreadConvex>[0],
  ) =>
    Effect.tryPromise({
      try: () => addMessagesToThreadConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "addMessagesToThread",
          reason: "Failed to add messages to thread",
          message: `Failed to add messages to thread: ${formatError(error)}`,
          originalError: error,
          timestamp: Date.now(),
        }),
    }).pipe(Effect.retry({ times: 2 }));

  const createThreadWithMessages = (
    args: Parameters<typeof createThreadWithMessagesConvex>[0],
  ) =>
    Effect.tryPromise({
      try: () => createThreadWithMessagesConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "createThreadWithMessages",
          reason: "Failed to create thread with messages",
          message: `Failed to create thread with messages: ${formatError(error)}`,
          originalError: error,
          timestamp: Date.now(),
        }),
    }).pipe(Effect.retry({ times: 2 }));

  const updateMessage = (args: Parameters<typeof updateMessageConvex>[0]) =>
    Effect.tryPromise({
      try: () => updateMessageConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "updateMessage",
          reason: "Failed to update message",
          message: `Failed to update message: ${formatError(error)}`,
          originalError: error,
          timestamp: Date.now(),
        }),
    }).pipe(Effect.retry({ times: 2 }));

  const setMessageError = (args: Parameters<typeof setMessageErrorConvex>[0]) =>
    Effect.tryPromise({
      try: () => setMessageErrorConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "setMessageError",
          reason: "Failed to set message error",
          message: `Failed to set message error: ${formatError(error)}`,
          originalError: error,
          timestamp: Date.now(),
        }),
    }).pipe(Effect.retry({ times: 2 }));

  const updateThread = (args: Parameters<typeof updateThreadConvex>[0]) =>
    Effect.tryPromise({
      try: () => updateThreadConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "updateThread",
          reason: "Failed to update thread",
          message: `Failed to update thread: ${formatError(error)}`,
          originalError: error,
          timestamp: Date.now(),
        }),
    }).pipe(Effect.retry({ times: 2 }));

  const updateThreadTitle = (
    args: Parameters<typeof updateThreadTitleConvex>[0],
  ) =>
    Effect.tryPromise({
      try: () => updateThreadTitleConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "updateThreadTitle",
          reason: "Failed to update thread title",
          message: `Failed to update thread title: ${formatError(error)}`,
          originalError: error,
          timestamp: Date.now(),
        }),
    }).pipe(Effect.retry({ times: 2 }));

  const fetchThreadMessages = (threadId: string) =>
    Effect.tryPromise({
      try: () => fetchThreadMessagesConvex(threadId),
      catch: (error) =>
        new ConvexError({
          operation: "fetchThreadMessages",
          reason: "Failed to fetch thread messages",
          message: `Failed to fetch thread messages: ${formatError(error)}`,
          originalError: error,
          timestamp: Date.now(),
        }),
    }).pipe(Effect.retry({ times: 2 }));

  const regenerateFromMessage = (
    args: Parameters<typeof regenerateFromMessageConvex>[0],
  ) =>
    Effect.tryPromise({
      try: () => regenerateFromMessageConvex(args),
      catch: (error) =>
        new ConvexError({
          operation: "regenerateFromMessage",
          reason: "Failed to regenerate message",
          message: `Failed to regenerate message: ${formatError(error)}`,
          originalError: error,
          timestamp: Date.now(),
        }),
    }).pipe(Effect.retry({ times: 2 }));

  const generateTitle = (message: MyUIMessage) =>
    Effect.tryPromise(() => generateTitleActionConvex({ message })).pipe(
      Effect.retry({ times: 1 }),
      Effect.catchAll(() => {
        // Fallback: extract first 40 chars from message text
        const textContent = message.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(" ")
          .slice(0, 40);

        const fallbackTitle = textContent + "...";

        return Effect.succeed(fallbackTitle);
      }),
    );

  return {
    mutations: {
      createThread,
      createThreadWithMessages,
      addMessagesToThread,
      updateMessage,
      setMessageError,
      updateThread,
      updateThreadTitle,
      regenerateFromMessage,
    },
    queries: {
      fetchThreadMessages,
    },
    actions: {
      generateTitle,
    },
  };
}

// Type helper for the hook return value
export type ConvexFunctions = ReturnType<typeof useConvexFunctions>;
