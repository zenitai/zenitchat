import { memo, useMemo, useState } from "react";
import { PaperclipIcon, GlobeIcon } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { UserMessageToolbar } from "./user-message-toolbar";
import { ChatInputEdit } from "@/features/chat-input";
import { editMessage } from "@/features/chat/edit-message";
import { useConvexFunctions } from "@/features/chat/hooks/use-convex-functions";
import { getModelById } from "@/features/models";
import { cn } from "@/lib/utils";
import type { MessageProps } from "../types";

export const UserMessage = memo(
  ({ message, threadId, className, ...props }: MessageProps) => {
    const [isEditing, setIsEditing] = useState(false);
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

    const handleEditSubmit = async (text: string) => {
      if (!threadId) return;

      try {
        await editMessage({
          threadId,
          messageId: message.id,
          content: text,
          convexFunctions,
        });
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to edit message:", error);
      }
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
          className="group relative inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 px-4 py-3 text-left"
        >
          <span className="sr-only">Your message: </span>

          {isEditing ? (
            // EDIT MODE: Full chat input
            <div className="min-w-[400px]">
              <ChatInputEdit.Root
                initialText={messageText}
                initialModel={initialModel}
                onSubmit={handleEditSubmit}
              >
                <ChatInputEdit.Container>
                  <ChatInputEdit.Form>
                    <ChatInputEdit.Textarea />
                    <ChatInputEdit.Toolbar>
                      <ChatInputEdit.Tools>
                        <ChatInputEdit.ModelSelector />
                        <ChatInputEdit.Button
                          variant="outline"
                          aria-label="Attach file"
                        >
                          <PaperclipIcon className="size-4" />
                        </ChatInputEdit.Button>
                        <ChatInputEdit.Button
                          variant="outline"
                          aria-label="Search web"
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
          <div className="absolute right-0 mt-5 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100 max-md:opacity-100">
            <UserMessageToolbar
              parts={message.parts}
              isEditing={isEditing}
              onEditClick={() => setIsEditing(true)}
              onCancelEdit={() => setIsEditing(false)}
            />
          </div>
        </div>
      </div>
    );
  },
);

UserMessage.displayName = "UserMessage";
