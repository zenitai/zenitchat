import { memo } from "react";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import type { MessageProps } from "../types";

export const UserMessage = memo(
  ({ message, className, ...props }: MessageProps) => {
    return (
      <div
        data-message-id={message.messageId}
        className={cn("flex justify-end", className)}
        {...props}
      >
        <div
          role="article"
          aria-label="Your message"
          className="group relative inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 px-4 py-3 text-left"
        >
          <span className="sr-only">Your message: </span>
          <div className="prose prose-pink user-message max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
            {message.parts
              .filter((part) => part.type === "text")
              .map((part, index) => (
                <Markdown
                  key={`${message.messageId}-text-${index}`}
                  id={`${message.messageId}-text-${index}`}
                >
                  {part.text}
                </Markdown>
              ))}
          </div>
          {/* User message toolbar - positioned absolutely to the right */}
          <div className="absolute right-0 mt-5 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
            {/* Placeholder for MessageToolbar component */}
            <div className="text-xs text-muted-foreground">Toolbar</div>
          </div>
        </div>
      </div>
    );
  },
);

UserMessage.displayName = "UserMessage";
