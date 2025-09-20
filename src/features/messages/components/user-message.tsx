import { memo, useMemo } from "react";
import { Markdown } from "@/components/ui/markdown";
import { UserMessageToolbar } from "./user-message-toolbar";
import { cn } from "@/lib/utils";
import type { MessageProps } from "../types";

export const UserMessage = memo(
  ({ message, className, ...props }: MessageProps) => {
    const textParts = useMemo(
      () => message.parts.filter((part) => part.type === "text"),
      [message.parts],
    );

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
          {/* User message toolbar - positioned absolutely to the right */}
          <div className="absolute right-0 mt-5 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
            <UserMessageToolbar parts={message.parts} />
          </div>
        </div>
      </div>
    );
  },
);

UserMessage.displayName = "UserMessage";
