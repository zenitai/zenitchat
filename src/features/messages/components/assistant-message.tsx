import { memo } from "react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "./reasoning";
import { AssistantMessageToolbar } from "./assistant-message-toolbar";
import { ErrorMessage } from "./error-message";
import { Brain } from "lucide-react";
import type { MessageProps } from "../types";
import { TextShimmer } from "@/components/ui/text-shimmer";

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
            className="prose prose-custom assistant-message max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
          >
            <span className="sr-only">Assistant Reply: </span>
            <div className="flex flex-col gap-4">
              {/* Render parts array */}
              {message.parts.map((part, index) => {
                const key = `${message.id}-${part.type}-${index}`;

                if (part.type === "text") {
                  return (
                    <Markdown key={key} id={`${message.id}-content-${index}`}>
                      {part.text}
                    </Markdown>
                  );
                }

                if (part.type === "reasoning") {
                  const isStreaming = part.state === "streaming";
                  return (
                    <Reasoning key={key} isStreaming={isStreaming}>
                      <ReasoningTrigger className="py-4">
                        <div className="flex items-center gap-2">
                          <Brain className="size-4" />
                          {isStreaming ? (
                            <TextShimmer as="span" duration={1.5}>
                              Reasoning
                            </TextShimmer>
                          ) : (
                            <span>Reasoning</span>
                          )}
                        </div>
                      </ReasoningTrigger>
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

          {/* Show error message if errors exist in metadata */}
          {message.metadata?.errors && message.metadata.errors.length > 0 && (
            <div className="mt-4">
              {message.metadata.errors.map((error, index) => (
                <ErrorMessage
                  key={`error-${message.id}-${index}`}
                  message={error.message}
                />
              ))}
            </div>
          )}

          {/* Assistant message toolbar - positioned absolutely to the left */}
          <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
            <AssistantMessageToolbar
              parts={message.parts}
              messageId={message.id}
            />
          </div>
        </div>
      </div>
    );
  },
);

AssistantMessage.displayName = "AssistantMessage";
