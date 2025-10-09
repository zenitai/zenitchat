import { useState, useCallback } from "react";
import { editMessage } from "@/features/chat/edit-message";
import { useConvexFunctions } from "@/features/chat/hooks/use-convex-functions";
import type { ModelConfig } from "@/features/models";

export interface UseMessageEditParams {
  messageId: string;
  threadId?: string;
  messageText: string;
  initialModel?: ModelConfig;
}

export const useMessageEdit = ({
  messageId,
  threadId,
  messageText,
  initialModel,
}: UseMessageEditParams) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const convexFunctions = useConvexFunctions();

  const handleEditSubmit = useCallback(
    async (text: string, model: ModelConfig) => {
      if (!threadId) return;

      // Check if content OR model actually changed
      const trimmedText = text.trim();
      const originalText = messageText.trim();
      const modelChanged = model.id !== initialModel?.id;

      if (trimmedText === originalText && !modelChanged) {
        // No changes made to text OR model, just exit edit mode
        setIsEditing(false);
        setHasChanges(false);
        return;
      }

      try {
        editMessage({
          threadId,
          messageId,
          content: text,
          model: model.id,
          convexFunctions,
        });
        setIsEditing(false);
        setHasChanges(false);
      } catch (error) {
        console.error("Failed to edit message:", error);
      }
    },
    [threadId, messageId, messageText, initialModel?.id, convexFunctions],
  );

  const handleCancelEdit = useCallback(() => {
    if (hasChanges) {
      setShowCancelDialog(true);
    } else {
      setIsEditing(false);
    }
  }, [hasChanges]);

  const handleConfirmCancel = useCallback(() => {
    setIsEditing(false);
    setHasChanges(false);
    setShowCancelDialog(false);
  }, []);

  const handleChange = useCallback(
    (text: string, model: ModelConfig) => {
      const textChanged = text !== messageText;
      const modelChanged = model.id !== initialModel?.id;
      setHasChanges(textChanged || modelChanged);
    },
    [messageText, initialModel?.id],
  );

  return {
    isEditing,
    setIsEditing,
    showCancelDialog,
    setShowCancelDialog,
    hasChanges,
    handleEditSubmit,
    handleCancelEdit,
    handleConfirmCancel,
    handleChange,
  };
};
