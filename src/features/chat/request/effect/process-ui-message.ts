/* eslint-disable @typescript-eslint/no-explicit-any */
import { Effect, Stream } from "effect";
import {
  StandardSchemaV1,
  validateTypes,
  Validator,
} from "@ai-sdk/provider-utils";
import { parsePartialJson } from "../../utils/parse-partial-json";
import {
  isDataUIMessageChunk,
  isToolUIPart,
  getToolName,
} from "../../utils/message-parts";
import {
  updateToolPart,
  updateDynamicToolPart,
  getToolInvocation,
  getDynamicToolInvocation,
  updateMessageMetadata,
  write,
} from "./process-ui-message-utils";
import {
  MakeRequestError,
  ProcessUIMessageStreamError,
  ProcessUIMessageOperationError,
} from "./types";

import type {
  DataUIPart,
  ReasoningUIPart,
  TextUIPart,
  UIMessage,
  UIMessageChunk,
} from "ai";

import type {
  InferUIMessageData,
  InferUIMessageMetadata,
  UIDataTypesToSchemas,
  DataUIMessageChunk,
  InferUIMessageChunk,
  StreamingUIMessageState,
} from "../../core/types";
import { StreamingMessageStore } from "../../core/streaming-message-store";

interface ProcessUIMessageStreamOptions<UI_MESSAGE extends UIMessage> {
  stream: Stream.Stream<UIMessageChunk>;
  state: StreamingUIMessageState<UI_MESSAGE>;
  store: StreamingMessageStore<UI_MESSAGE>;
  messageMetadataSchema?:
    | Validator<InferUIMessageMetadata<UI_MESSAGE>>
    | StandardSchemaV1<InferUIMessageMetadata<UI_MESSAGE>>;
  dataPartSchemas?: UIDataTypesToSchemas<InferUIMessageData<UI_MESSAGE>>;
}

export const processUIMessageStream = <UI_MESSAGE extends UIMessage>(
  options: ProcessUIMessageStreamOptions<UI_MESSAGE>,
) => {
  const operationErrors: ProcessUIMessageOperationError[] = [];

  const processedStream = Stream.mapEffect(
    options.stream,
    (chunk) =>
      Effect.catchAll(
        Effect.gen(function* () {
          console.log("Processing chunk:", chunk);

          switch (chunk.type) {
            case "text-start": {
              const textPart: TextUIPart = {
                type: "text",
                text: "",
                providerMetadata: chunk.providerMetadata,
                state: "streaming",
              };
              options.state.activeTextParts[chunk.id] = textPart;
              options.state.message.parts.push(textPart);
              yield* write(options.store, options.state);
              break;
            }

            case "text-delta": {
              const textPart = options.state.activeTextParts[chunk.id];
              textPart.text += chunk.delta;
              textPart.providerMetadata =
                chunk.providerMetadata ?? textPart.providerMetadata;
              yield* write(options.store, options.state);
              break;
            }

            case "text-end": {
              const textPart = options.state.activeTextParts[chunk.id];
              textPart.state = "done";
              textPart.providerMetadata =
                chunk.providerMetadata ?? textPart.providerMetadata;
              delete options.state.activeTextParts[chunk.id];
              yield* write(options.store, options.state);
              break;
            }

            case "reasoning-start": {
              const reasoningPart: ReasoningUIPart = {
                type: "reasoning",
                text: "",
                providerMetadata: chunk.providerMetadata,
                state: "streaming",
              };
              options.state.activeReasoningParts[chunk.id] = reasoningPart;
              options.state.message.parts.push(reasoningPart);
              yield* write(options.store, options.state);
              break;
            }

            case "reasoning-delta": {
              const reasoningPart =
                options.state.activeReasoningParts[chunk.id];
              reasoningPart.text += chunk.delta;
              reasoningPart.providerMetadata =
                chunk.providerMetadata ?? reasoningPart.providerMetadata;
              yield* write(options.store, options.state);
              break;
            }

            case "reasoning-end": {
              const reasoningPart =
                options.state.activeReasoningParts[chunk.id];
              reasoningPart.providerMetadata =
                chunk.providerMetadata ?? reasoningPart.providerMetadata;
              reasoningPart.state = "done";
              delete options.state.activeReasoningParts[chunk.id];
              yield* write(options.store, options.state);
              break;
            }

            case "file": {
              options.state.message.parts.push({
                type: "file",
                mediaType: chunk.mediaType,
                url: chunk.url,
              });
              yield* write(options.store, options.state);
              break;
            }

            case "source-url": {
              options.state.message.parts.push({
                type: "source-url",
                sourceId: chunk.sourceId,
                url: chunk.url,
                title: chunk.title,
                providerMetadata: chunk.providerMetadata,
              });
              yield* write(options.store, options.state);
              break;
            }

            case "source-document": {
              options.state.message.parts.push({
                type: "source-document",
                sourceId: chunk.sourceId,
                mediaType: chunk.mediaType,
                title: chunk.title,
                filename: chunk.filename,
                providerMetadata: chunk.providerMetadata,
              });
              yield* write(options.store, options.state);
              break;
            }

            case "tool-input-start": {
              const toolInvocations =
                options.state.message.parts.filter(isToolUIPart);

              // add the partial tool call to the map
              options.state.partialToolCalls[chunk.toolCallId] = {
                text: "",
                toolName: chunk.toolName,
                index: toolInvocations.length,
                dynamic: chunk.dynamic,
              };

              if (chunk.dynamic) {
                yield* updateDynamicToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: chunk.toolName,
                    state: "input-streaming",
                    input: undefined,
                  },
                  options.state,
                );
              } else {
                yield* updateToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: chunk.toolName,
                    state: "input-streaming",
                    input: undefined,
                    providerExecuted: chunk.providerExecuted,
                  },
                  options.state,
                );
              }

              yield* write(options.store, options.state);
              break;
            }

            case "tool-input-delta": {
              const partialToolCall =
                options.state.partialToolCalls[chunk.toolCallId];

              partialToolCall.text += chunk.inputTextDelta;

              const { value: partialArgs } = yield* Effect.tryPromise({
                try: () => parsePartialJson(partialToolCall.text),
                catch: (error) =>
                  new ProcessUIMessageOperationError({
                    reason: "Failed to parse partial JSON for tool input delta",
                    message:
                      error instanceof Error ? error.message : String(error),
                    originalError: error,
                  }),
              });

              if (partialToolCall.dynamic) {
                yield* updateDynamicToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: partialToolCall.toolName,
                    state: "input-streaming",
                    input: partialArgs,
                  },
                  options.state,
                );
              } else {
                yield* updateToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: partialToolCall.toolName,
                    state: "input-streaming",
                    input: partialArgs,
                  },
                  options.state,
                );
              }

              yield* write(options.store, options.state);
              break;
            }

            case "tool-input-available": {
              if (chunk.dynamic) {
                yield* updateDynamicToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: chunk.toolName,
                    state: "input-available",
                    input: chunk.input,
                    providerMetadata: chunk.providerMetadata,
                  },
                  options.state,
                );
              } else {
                yield* updateToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: chunk.toolName,
                    state: "input-available",
                    input: chunk.input,
                    providerExecuted: chunk.providerExecuted,
                    providerMetadata: chunk.providerMetadata,
                  },
                  options.state,
                );
              }

              yield* write(options.store, options.state);
              break;
            }

            // invoke the onToolCall callback if it exists. This is blocking.
            // In the future we should make this non-blocking, which
            // requires additional state management for error handling etc.
            // Skip calling onToolCall for provider-executed tools since they are already executed
            // if (onToolCall && !chunk.providerExecuted) {
            //   await onToolCall({
            //     toolCall: chunk as InferUIMessageToolCall<UI_MESSAGE>,
            //   });
            // }

            case "tool-input-error": {
              if (chunk.dynamic) {
                yield* updateDynamicToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: chunk.toolName,
                    state: "output-error",
                    input: chunk.input,
                    errorText: chunk.errorText,
                    providerMetadata: chunk.providerMetadata,
                  },
                  options.state,
                );
              } else {
                yield* updateToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: chunk.toolName,
                    state: "output-error",
                    input: undefined,
                    rawInput: chunk.input,
                    errorText: chunk.errorText,
                    providerExecuted: chunk.providerExecuted,
                    providerMetadata: chunk.providerMetadata,
                  },
                  options.state,
                );
              }

              yield* write(options.store, options.state);
              break;
            }

            case "tool-output-available": {
              if (chunk.dynamic) {
                const toolInvocation = yield* getDynamicToolInvocation(
                  chunk.toolCallId,
                  options.state,
                );

                yield* updateDynamicToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: toolInvocation.toolName,
                    state: "output-available",
                    input: (toolInvocation as any).input,
                    output: chunk.output,
                    preliminary: chunk.preliminary,
                  },
                  options.state,
                );
              } else {
                const toolInvocation = yield* getToolInvocation(
                  chunk.toolCallId,
                  options.state,
                );

                yield* updateToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: getToolName(toolInvocation),
                    state: "output-available",
                    input: (toolInvocation as any).input,
                    output: chunk.output,
                    providerExecuted: chunk.providerExecuted,
                    preliminary: chunk.preliminary,
                  },
                  options.state,
                );
              }

              yield* write(options.store, options.state);
              break;
            }

            case "tool-output-error": {
              if (chunk.dynamic) {
                const toolInvocation = yield* getDynamicToolInvocation(
                  chunk.toolCallId,
                  options.state,
                );

                yield* updateDynamicToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: toolInvocation.toolName,
                    state: "output-error",
                    input: (toolInvocation as any).input,
                    errorText: chunk.errorText,
                  },
                  options.state,
                );
              } else {
                const toolInvocation = yield* getToolInvocation(
                  chunk.toolCallId,
                  options.state,
                );

                yield* updateToolPart(
                  {
                    toolCallId: chunk.toolCallId,
                    toolName: getToolName(toolInvocation),
                    state: "output-error",
                    input: (toolInvocation as any).input,
                    rawInput: (toolInvocation as any).rawInput,
                    errorText: chunk.errorText,
                  },
                  options.state,
                );
              }

              yield* write(options.store, options.state);
              break;
            }

            case "start-step": {
              // add a step boundary part to the message
              options.state.message.parts.push({ type: "step-start" });
              break;
            }

            case "finish-step": {
              // reset the current text and reasoning parts
              options.state.activeTextParts = {};
              options.state.activeReasoningParts = {};
              break;
            }

            case "start": {
              if (chunk.messageId != null) {
                options.state.message.id = chunk.messageId;
              }

              yield* updateMessageMetadata(
                chunk.messageMetadata,
                options.state,
                options.messageMetadataSchema,
              );

              if (chunk.messageId != null || chunk.messageMetadata != null) {
                yield* write(options.store, options.state);
              }
              break;
            }

            case "finish": {
              yield* updateMessageMetadata(
                chunk.messageMetadata,
                options.state,
                options.messageMetadataSchema,
              );
              if (chunk.messageMetadata != null) {
                yield* write(options.store, options.state);
              }
              break;
            }

            case "message-metadata": {
              yield* updateMessageMetadata(
                chunk.messageMetadata,
                options.state,
                options.messageMetadataSchema,
              );
              if (chunk.messageMetadata != null) {
                yield* write(options.store, options.state);
              }
              break;
            }

            case "error": {
              const message =
                chunk.errorText ??
                "Something went wrong while processing your request";
              const makeRequestError = new MakeRequestError({
                type: "api_error",
                reason: message,
                message,
                originalError: chunk,
              });

              return yield* Effect.fail(makeRequestError);
            }

            default: {
              if (isDataUIMessageChunk(chunk)) {
                // validate data chunk if dataPartSchemas is provided
                if (options.dataPartSchemas?.[chunk.type] != null) {
                  const schema = options.dataPartSchemas[chunk.type];
                  yield* Effect.tryPromise({
                    try: () =>
                      validateTypes({
                        value: chunk.data,
                        schema: schema,
                      }),
                    catch: (error) =>
                      new ProcessUIMessageOperationError({
                        reason: "Failed to validate data chunk",
                        message:
                          error instanceof Error
                            ? error.message
                            : String(error),
                        originalError: error,
                      }),
                  });
                }

                // cast, validation is done above
                const dataChunk = chunk as DataUIMessageChunk<
                  InferUIMessageData<UI_MESSAGE>
                >;

                // transient parts are not added to the message state
                if (dataChunk.transient) {
                  // options.onData?.(dataChunk);
                  // onData callback removed for now
                  break;
                }

                const existingUIPart =
                  dataChunk.id != null
                    ? (options.state.message.parts.find(
                        (chunkArg) =>
                          dataChunk.type === chunkArg.type &&
                          dataChunk.id === chunkArg.id,
                      ) as
                        | DataUIPart<InferUIMessageData<UI_MESSAGE>>
                        | undefined)
                    : undefined;

                if (existingUIPart != null) {
                  existingUIPart.data = dataChunk.data;
                } else {
                  options.state.message.parts.push(dataChunk);
                }

                // options.onData?.(dataChunk);
                // onData callback removed for now

                yield* write(options.store, options.state);
              }
            }
          }
          return chunk as InferUIMessageChunk<UI_MESSAGE>;
        }),
        (error) => {
          if (error instanceof ProcessUIMessageOperationError) {
            return Effect.sync(() => {
              operationErrors.push(error);
              return chunk as InferUIMessageChunk<UI_MESSAGE>;
            });
          }

          return Effect.fail(error);
        },
      ),
    { concurrency: 1 },
  );

  return Stream.mapEffect(processedStream, (chunk) =>
    Effect.gen(function* () {
      if (operationErrors.length > 0) {
        return yield* Effect.fail(
          new ProcessUIMessageStreamError({
            errors: operationErrors.slice(),
            count: operationErrors.length,
          }),
        );
      }
      return chunk;
    }),
  );
};
