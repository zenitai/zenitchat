import { memo } from "react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "./reasoning";
import type { MessageProps } from "../types";

export const AssistantMessage = memo(
  ({ message, className, ...props }: MessageProps) => {
    return (
      <div
        data-message-id={message.id}
        className={cn("flex justify-start", className)}
        {...props}
      >
        <div className="group relative w-full max-w-full break-words">
          <div
            role="article"
            aria-label="Assistant message"
            className="prose max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
          >
            <span className="sr-only">Assistant Reply: </span>
            <div className="flex flex-col gap-4">
              {/* Render parts array */}
              {message.parts.map((part, index) => {
                const key = `${message.id}-part-${index}`;

                if (part.type === "text") {
                  return (
                    <Markdown key={key} id={`${message.id}-content-${index}`}>
                      {part.text}
                    </Markdown>
                  );
                }

                if (part.type === "reasoning") {
                  return (
                    <Reasoning
                      key={key}
                      isStreaming={part.state === "streaming"}
                    >
                      <ReasoningTrigger>Reasoning</ReasoningTrigger>
                      <ReasoningContent markdown={true}>
                        {part.text}
                      </ReasoningContent>
                    </Reasoning>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* Assistant message toolbar - positioned absolutely to the left */}
          <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
            {/* Placeholder for MessageToolbar component */}
            <div className="text-xs text-muted-foreground">Toolbar</div>
          </div>
        </div>
      </div>
    );
  },
);

AssistantMessage.displayName = "AssistantMessage";
