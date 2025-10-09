import { memo, useMemo } from "react";
import { PaperclipIcon, GlobeIcon } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { UserMessageToolbar } from "./user-message-toolbar";
import { ChatInputEdit } from "@/features/chat-input";
import { getModelById } from "@/features/models";
import { useMessageEdit } from "../hooks/use-message-edit";
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

    const {
      isEditing,
      setIsEditing,
      showCancelDialog,
      setShowCancelDialog,
      handleEditSubmit,
      handleCancelEdit,
      handleConfirmCancel,
      handleChange,
    } = useMessageEdit({
      messageId: message.id,
      threadId,
      messageText,
      initialModel,
    });

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
                onChange={handleChange}
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
