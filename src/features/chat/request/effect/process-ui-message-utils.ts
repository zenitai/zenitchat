/* eslint-disable @typescript-eslint/no-explicit-any */
import { Effect } from "effect";
import { ProcessUIMessageOperationError } from "./types";
import {
  validateTypes,
  Validator,
  StandardSchemaV1,
} from "@ai-sdk/provider-utils";
import { mergeObjects } from "../../utils/merge-objects";
import type {
  InferUIMessageMetadata,
  InferUIMessageTools,
  StreamingUIMessageState,
} from "../../core/types";
import { isToolUIPart } from "../../utils/message-parts";
import type {
  DynamicToolUIPart,
  ToolUIPart,
  UIMessage,
  ProviderMetadata,
} from "ai";
import { StreamingMessageStore } from "../../core/streaming-message-store";

export const getToolInvocation = <UI_MESSAGE extends UIMessage>(
  toolCallId: string,
  state: StreamingUIMessageState<UI_MESSAGE>,
) =>
  Effect.try({
    try: () => {
      const toolInvocations = state.message.parts.filter(isToolUIPart);

      const toolInvocation = toolInvocations.find(
        (invocation) => invocation.toolCallId === toolCallId,
      );

      if (toolInvocation == null) {
        throw new Error(
          "tool-output-error must be preceded by a tool-input-available",
        );
      }

      return toolInvocation;
    },
    catch: (error) =>
      new ProcessUIMessageOperationError({
        reason: "Tool invocation not found",
        message: error instanceof Error ? error.message : String(error),
        originalError: error,
      }),
  });

export const getDynamicToolInvocation = <UI_MESSAGE extends UIMessage>(
  toolCallId: string,
  state: StreamingUIMessageState<UI_MESSAGE>,
) =>
  Effect.try({
    try: () => {
      const toolInvocations = state.message.parts.filter(
        (part) => part.type === "dynamic-tool",
      ) as DynamicToolUIPart[];

      const toolInvocation = toolInvocations.find(
        (invocation) => invocation.toolCallId === toolCallId,
      );

      if (toolInvocation == null) {
        throw new Error(
          "tool-output-error must be preceded by a tool-input-available",
        );
      }

      return toolInvocation;
    },
    catch: (error) =>
      new ProcessUIMessageOperationError({
        reason: "Dynamic tool invocation not found",
        message: error instanceof Error ? error.message : String(error),
        originalError: error,
      }),
  });

export const updateToolPart = <UI_MESSAGE extends UIMessage>(
  options: {
    toolName: keyof InferUIMessageTools<UI_MESSAGE> & string;
    toolCallId: string;
    providerExecuted?: boolean;
  } & (
    | {
        state: "input-streaming";
        input: unknown;
        providerExecuted?: boolean;
      }
    | {
        state: "input-available";
        input: unknown;
        providerExecuted?: boolean;
        providerMetadata?: ProviderMetadata;
      }
    | {
        state: "output-available";
        input: unknown;
        output: unknown;
        providerExecuted?: boolean;
        preliminary?: boolean;
      }
    | {
        state: "output-error";
        input: unknown;
        rawInput?: unknown;
        errorText: string;
        providerExecuted?: boolean;
        providerMetadata?: ProviderMetadata;
      }
  ),
  state: StreamingUIMessageState<UI_MESSAGE>,
) =>
  Effect.try({
    try: () => {
      const part = state.message.parts.find(
        (part) => isToolUIPart(part) && part.toolCallId === options.toolCallId,
      ) as ToolUIPart<InferUIMessageTools<UI_MESSAGE>> | undefined;

      const anyOptions = options as any;
      const anyPart = part as any;

      if (part != null) {
        part.state = options.state;
        anyPart.input = anyOptions.input;
        anyPart.output = anyOptions.output;
        anyPart.errorText = anyOptions.errorText;
        anyPart.rawInput = anyOptions.rawInput;
        anyPart.preliminary = anyOptions.preliminary;

        // once providerExecuted is set, it stays for streaming
        anyPart.providerExecuted =
          anyOptions.providerExecuted ?? part.providerExecuted;

        if (
          anyOptions.providerMetadata != null &&
          part.state === "input-available"
        ) {
          part.callProviderMetadata = anyOptions.providerMetadata;
        }
      } else {
        state.message.parts.push({
          type: `tool-${options.toolName}`,
          toolCallId: options.toolCallId,
          state: options.state,
          input: anyOptions.input,
          output: anyOptions.output,
          rawInput: anyOptions.rawInput,
          errorText: anyOptions.errorText,
          providerExecuted: anyOptions.providerExecuted,
          preliminary: anyOptions.preliminary,
          ...(anyOptions.providerMetadata != null
            ? { callProviderMetadata: anyOptions.providerMetadata }
            : {}),
        } as ToolUIPart<InferUIMessageTools<UI_MESSAGE>>);
      }
    },
    catch: (error) =>
      new ProcessUIMessageOperationError({
        reason: "Failed to update tool part",
        message: error instanceof Error ? error.message : String(error),
        originalError: error,
      }),
  });

export const updateDynamicToolPart = <UI_MESSAGE extends UIMessage>(
  options: {
    toolName: keyof InferUIMessageTools<UI_MESSAGE> & string;
    toolCallId: string;
    providerExecuted?: boolean;
  } & (
    | {
        state: "input-streaming";
        input: unknown;
      }
    | {
        state: "input-available";
        input: unknown;
        providerMetadata?: ProviderMetadata;
      }
    | {
        state: "output-available";
        input: unknown;
        output: unknown;
        preliminary: boolean | undefined;
      }
    | {
        state: "output-error";
        input: unknown;
        errorText: string;
        providerMetadata?: ProviderMetadata;
      }
  ),
  state: StreamingUIMessageState<UI_MESSAGE>,
) =>
  Effect.try({
    try: () => {
      const part = state.message.parts.find(
        (part) =>
          part.type === "dynamic-tool" &&
          part.toolCallId === options.toolCallId,
      ) as DynamicToolUIPart | undefined;

      const anyOptions = options as any;
      const anyPart = part as any;

      if (part != null) {
        part.state = options.state;
        anyPart.toolName = options.toolName;
        anyPart.input = anyOptions.input;
        anyPart.output = anyOptions.output;
        anyPart.errorText = anyOptions.errorText;
        anyPart.rawInput = anyOptions.rawInput ?? anyPart.rawInput;
        anyPart.preliminary = anyOptions.preliminary;

        if (
          anyOptions.providerMetadata != null &&
          part.state === "input-available"
        ) {
          part.callProviderMetadata = anyOptions.providerMetadata;
        }
      } else {
        state.message.parts.push({
          type: "dynamic-tool",
          toolName: options.toolName,
          toolCallId: options.toolCallId,
          state: options.state,
          input: anyOptions.input,
          output: anyOptions.output,
          errorText: anyOptions.errorText,
          preliminary: anyOptions.preliminary,
          ...(anyOptions.providerMetadata != null
            ? { callProviderMetadata: anyOptions.providerMetadata }
            : {}),
        } as DynamicToolUIPart);
      }
    },
    catch: (error) =>
      new ProcessUIMessageOperationError({
        reason: "Failed to update dynamic tool part",
        message: error instanceof Error ? error.message : String(error),
        originalError: error,
      }),
  });

export const updateMessageMetadata = <UI_MESSAGE extends UIMessage>(
  metadata: unknown,
  state: StreamingUIMessageState<UI_MESSAGE>,
  messageMetadataSchema?:
    | Validator<InferUIMessageMetadata<UI_MESSAGE>>
    | StandardSchemaV1<InferUIMessageMetadata<UI_MESSAGE>>,
) =>
  Effect.tryPromise({
    try: async () => {
      if (metadata != null) {
        const mergedMetadata =
          state.message.metadata != null
            ? mergeObjects(state.message.metadata, metadata)
            : metadata;

        if (messageMetadataSchema != null) {
          await validateTypes({
            value: mergedMetadata,
            schema: messageMetadataSchema,
          });
        }

        state.message.metadata =
          mergedMetadata as InferUIMessageMetadata<UI_MESSAGE>;
      }
    },
    catch: (error) =>
      new ProcessUIMessageOperationError({
        reason: "Failed to update message metadata",
        message: error instanceof Error ? error.message : String(error),
        originalError: error,
      }),
  });

export const write = <UI_MESSAGE extends UIMessage>(
  store: StreamingMessageStore<UI_MESSAGE>,
  state: StreamingUIMessageState<UI_MESSAGE>,
) =>
  Effect.try({
    try: () => {
      store.message = state.message;
    },
    catch: (error) =>
      new ProcessUIMessageOperationError({
        reason: "Failed to write streaming message",
        message: error instanceof Error ? error.message : String(error),
        originalError: error,
      }),
  });
