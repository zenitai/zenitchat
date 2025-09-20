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

  const updateThreadTitle = useMutation(api.threads.updateThreadTitle);
  const toggleThreadPinned = useMutation(api.threads.toggleThreadPinned);
  const deleteThread = useMutation(api.threads.deleteThread);

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
