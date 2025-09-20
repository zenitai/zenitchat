import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function useThreadActions(threadId: string) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSwitchingToEditRef = useRef(false);

  const updateThreadTitle = useMutation(
    api.threads.updateThreadTitle,
  ).withOptimisticUpdate((localStore, args) => {
    const { threadId, title } = args;
    const existingThreads = localStore.getQuery(api.threads.getUserThreads, {
      paginationOpts: { numItems: 100, cursor: null },
    });

    if (existingThreads) {
      // Check if the thread exists in the current page
      const threadExists = existingThreads.page.some(
        (thread) => thread.threadId === threadId,
      );

      if (threadExists) {
        // Only update if thread is in current page
        const updatedThreads = existingThreads.page.map((thread) =>
          thread.threadId === threadId ? { ...thread, title } : thread,
        );
        localStore.setQuery(
          api.threads.getUserThreads,
          {
            paginationOpts: { numItems: 200, cursor: null },
          },
          {
            ...existingThreads,
            page: updatedThreads,
          },
        );
      }
      // If thread not in current page, do nothing (no optimistic update)
    }
  });

  const toggleThreadPinned = useMutation(
    api.threads.toggleThreadPinned,
  ).withOptimisticUpdate((localStore, args) => {
    const { threadId } = args;
    const existingThreads = localStore.getQuery(api.threads.getUserThreads, {
      paginationOpts: { numItems: 100, cursor: null },
    });

    if (existingThreads) {
      // Check if the thread exists in the current page
      const threadExists = existingThreads.page.some(
        (thread) => thread.threadId === threadId,
      );

      if (threadExists) {
        // Only update if thread is in current page
        const updatedThreads = existingThreads.page.map((thread) =>
          thread.threadId === threadId
            ? { ...thread, pinned: !thread.pinned }
            : thread,
        );
        localStore.setQuery(
          api.threads.getUserThreads,
          {
            paginationOpts: { numItems: 200, cursor: null },
          },
          {
            ...existingThreads,
            page: updatedThreads,
          },
        );
      }
      // If thread not in current page, do nothing (no optimistic update)
    }
  });

  const deleteThread = useMutation(
    api.threads.deleteThread,
  ).withOptimisticUpdate((localStore, args) => {
    const { threadId } = args;
    const existingThreads = localStore.getQuery(api.threads.getUserThreads, {
      paginationOpts: { numItems: 100, cursor: null },
    });

    if (existingThreads) {
      // Check if the thread exists in the current page
      const threadExists = existingThreads.page.some(
        (thread) => thread.threadId === threadId,
      );

      if (threadExists) {
        // Only update if thread is in current page
        const updatedThreads = existingThreads.page.filter(
          (thread) => thread.threadId !== threadId,
        );
        localStore.setQuery(
          api.threads.getUserThreads,
          {
            paginationOpts: { numItems: 200, cursor: null },
          },
          {
            ...existingThreads,
            page: updatedThreads,
          },
        );
      }
      // If thread not in current page, do nothing (no optimistic update)
    }
  });

  const startEditing = (currentTitle: string) => {
    isSwitchingToEditRef.current = true;
    setIsEditing(true);
    setEditTitle(currentTitle);
  };

  const cancelEditing = (originalTitle: string) => {
    setEditTitle(originalTitle);
    setIsEditing(false);
  };

  const handleSave = async (originalTitle: string) => {
    if (!editTitle.trim()) {
      // Revert to original name when empty
      setEditTitle(originalTitle);
      setIsEditing(false);
      return;
    }

    if (editTitle.trim() === originalTitle) {
      setIsEditing(false);
      return;
    }

    if (editTitle.trim().length > 100) {
      toast.error("Thread name cannot exceed 100 characters");
      return;
    }

    try {
      await updateThreadTitle({
        threadId,
        title: editTitle.trim(),
      });
      toast.success("Thread renamed successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to rename thread");
      console.error("Error renaming thread:", error);
    }
  };

  const handleRename = (originalTitle: string) => {
    startEditing(originalTitle);
  };

  const handlePinToggle = async () => {
    try {
      await toggleThreadPinned({ threadId });
    } catch (error) {
      toast.error("Failed to update pin status");
      console.error("Error toggling thread pin:", error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteThread({ threadId });
      toast.success("Thread deleted");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete thread");
      console.error("Error deleting thread:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const handleRegenerateTitle = () => {
    toast.success("Regenerate title not implemented yet");
  };

  const handleExport = () => {
    toast.success("Export not implemented yet");
  };

  return {
    // State
    isEditing,
    editTitle,
    setEditTitle,
    showDeleteDialog,
    inputRef,
    isSwitchingToEditRef,

    // Handlers
    startEditing,
    cancelEditing,
    handleSave,
    handleRename,
    handlePinToggle,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRegenerateTitle,
    handleExport,
  };
}
