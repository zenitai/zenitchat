import { memo, useMemo, useState } from "react";
import { PaperclipIcon, GlobeIcon } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { UserMessageToolbar } from "./user-message-toolbar";
import { ChatInputEdit } from "@/features/chat-input";
import { editMessage } from "@/features/chat/edit-message";
import { useConvexFunctions } from "@/features/chat/hooks/use-convex-functions";
import { getModelById, type ModelConfig } from "@/features/models";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { MessageProps } from "../types";

export const UserMessage = memo(
  ({ message, threadId, className, ...props }: MessageProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const convexFunctions = useConvexFunctions();

    const textParts = useMemo(
      () => message.parts.filter((part) => part.type === "text"),
      [message.parts],
    );

    // Extract text for editing
    const messageText = useMemo(
      () => textParts.map((part) => part.text).join("\n"),
      [textParts],
    );

    // Get initial model from metadata if available
    const initialModel = useMemo(
      () =>
        message.metadata?.model
          ? getModelById(message.metadata.model)
          : undefined,
      [message.metadata?.model],
    );

    const handleEditSubmit = async (text: string, model: ModelConfig) => {
      if (!threadId) return;

      // Check if content actually changed
      const trimmedText = text.trim();
      const originalText = messageText.trim();

      if (trimmedText === originalText) {
        // No changes made, just exit edit mode
        setIsEditing(false);
        setHasChanges(false);
        return;
      }

      try {
        editMessage({
          threadId,
          messageId: message.id,
          content: text,
          model: model.id,
          convexFunctions,
        });
        setIsEditing(false);
        setHasChanges(false);
      } catch (error) {
        console.error("Failed to edit message:", error);
      }
    };

    const handleCancelEdit = () => {
      if (hasChanges) {
        setShowCancelDialog(true);
      } else {
        setIsEditing(false);
      }
    };

    const handleConfirmCancel = () => {
      setIsEditing(false);
      setHasChanges(false);
      setShowCancelDialog(false);
    };

    return (
      <div
        data-message-id={message.id}
        className={cn("flex justify-end", className)}
        {...props}
      >
        <div
          role="article"
          aria-label="Your message"
          className={cn(
            "group relative break-words rounded-xl border border-secondary/50 text-left",
            isEditing
              ? "w-full max-sm:max-w-[95%] sm:max-w-[80%] bg-secondary/30 shadow-[inset_0px_4px_6px_#000] shadow-foreground/10 dark:shadow-background/60"
              : "inline-block max-w-[80%] px-4 py-3 bg-secondary/50",
          )}
        >
          <span className="sr-only">Your message: </span>

          {isEditing ? (
            // EDIT MODE: Full chat input
            <div className="w-full">
              <ChatInputEdit.Root
                initialText={messageText}
                initialModel={initialModel}
                onSubmit={handleEditSubmit}
                onChange={(text, model) => {
                  const textChanged = text !== messageText;
                  const modelChanged =
                    model.id !== (message.metadata?.model || initialModel?.id);
                  setHasChanges(textChanged || modelChanged);
                }}
              >
                <ChatInputEdit.Container>
                  <ChatInputEdit.Form className="!bg-transparent !border-0 !shadow-none !rounded-none max-sm:!px-1">
                    <ChatInputEdit.Textarea />
                    <ChatInputEdit.Toolbar>
                      <ChatInputEdit.Tools>
                        <ChatInputEdit.ModelSelector variant="compact" />
                        <ChatInputEdit.Button
                          variant="outline"
                          aria-label="Attach file"
                          className="max-sm:hidden"
                        >
                          <PaperclipIcon className="size-4" />
                        </ChatInputEdit.Button>
                        <ChatInputEdit.Button
                          variant="outline"
                          aria-label="Search web"
                          className="max-sm:hidden"
                        >
                          <GlobeIcon className="size-4" />
                        </ChatInputEdit.Button>
                      </ChatInputEdit.Tools>
                      <ChatInputEdit.Tools>
                        <ChatInputEdit.Submit />
                      </ChatInputEdit.Tools>
                    </ChatInputEdit.Toolbar>
                  </ChatInputEdit.Form>
                </ChatInputEdit.Container>
              </ChatInputEdit.Root>
            </div>
          ) : (
            // NORMAL MODE: Message display
            <div className="prose prose-custom user-message max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
              {textParts.map((part, index) => (
                <Markdown
                  key={`${message.id}-text-${index}`}
                  id={`${message.id}-text-${index}`}
                >
                  {part.text}
                </Markdown>
              ))}
            </div>
          )}

          {/* Toolbar - always visible */}
          <div
            className={cn(
              "absolute right-0 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100 max-md:opacity-100",
              isEditing ? "mt-2" : "mt-5",
            )}
          >
            <UserMessageToolbar
              parts={message.parts}
              isEditing={isEditing}
              onEditClick={() => setIsEditing(true)}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        </div>

        {/* Cancel Edits Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel edits?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to discard your edits?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep editing</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCancel}>
                Yes, discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  },
);

UserMessage.displayName = "UserMessage";
