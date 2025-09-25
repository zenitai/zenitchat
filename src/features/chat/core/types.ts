import type {
  UIMessage,
  UITools,
  UIDataTypes,
  UIMessageChunk,
  ReasoningUIPart,
  TextUIPart,
} from "ai";
import type { ValueOf } from "../utils/value-of";
import { StandardSchemaV1, ToolCall, Validator } from "@ai-sdk/provider-utils";

/**
 * A job is an asynchronous function that returns a Promise<void>
 * Used by SerialJobExecutor to process streaming updates sequentially
 */
export type Job = () => Promise<void>;

/**
 * State container for streaming UI messages during processing
 * Tracks active text parts, reasoning parts, and partial tool calls
 */
export type StreamingUIMessageState<UI_MESSAGE extends UIMessage> = {
  message: UI_MESSAGE;
  activeTextParts: Record<string, TextUIPart>;
  activeReasoningParts: Record<string, ReasoningUIPart>;
  partialToolCalls: Record<
    string,
    { text: string; index: number; toolName: string; dynamic?: boolean }
  >;
};

/**
 * Function type for handling errors during streaming
 */
export type ErrorHandler = (error: unknown) => void;

/**
 * Maps UI data types to their corresponding validation schemas
 */
export type UIDataTypesToSchemas<T extends UIDataTypes> = {
  [K in keyof T]: Validator<T[K]> | StandardSchemaV1<T[K]>;
};

/**
 * Represents a data chunk in a UI message stream
 */
export type DataUIMessageChunk<DATA_TYPES extends UIDataTypes> = ValueOf<{
  [NAME in keyof DATA_TYPES & string]: {
    type: `data-${NAME}`;
    id?: string;
    data: DATA_TYPES[NAME];
    transient?: boolean;
  };
}>;

/**
 * Infers the UI message chunk type from a UI message type
 */
export type InferUIMessageChunk<T extends UIMessage> = UIMessageChunk<
  InferUIMessageMetadata<T>,
  InferUIMessageData<T>
>;

/**
 * Infers the metadata type from a UI message type
 */
export type InferUIMessageMetadata<T extends UIMessage> =
  T extends UIMessage<infer METADATA> ? METADATA : unknown;

/**
 * Infers the data types from a UI message type
 */
export type InferUIMessageData<T extends UIMessage> =
  T extends UIMessage<unknown, infer DATA_TYPES> ? DATA_TYPES : UIDataTypes;

/**
 * Infers the tools type from a UI message type
 */
export type InferUIMessageTools<T extends UIMessage> =
  T extends UIMessage<unknown, UIDataTypes, infer TOOLS> ? TOOLS : UITools;

/**
 * Infers the tool output types from a UI message type
 */
export type InferUIMessageToolOutputs<UI_MESSAGE extends UIMessage> =
  InferUIMessageTools<UI_MESSAGE>[keyof InferUIMessageTools<UI_MESSAGE>]["output"];

/**
 * Infers the tool call type from a UI message type
 * Supports both static and dynamic tool calls
 */
export type InferUIMessageToolCall<UI_MESSAGE extends UIMessage> =
  | ValueOf<{
      [NAME in keyof InferUIMessageTools<UI_MESSAGE>]: ToolCall<
        NAME & string,
        InferUIMessageTools<UI_MESSAGE>[NAME] extends { input: infer INPUT }
          ? INPUT
          : never
      > & { dynamic?: false };
    }>
  | (ToolCall<string, unknown> & { dynamic: true });
