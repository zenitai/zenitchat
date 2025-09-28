import type { DataUIPart, UIMessageChunk, UIMessage } from "ai";
import type { MyUIMessage } from "@/features/messages/types";
import type { StreamingMessageStore } from "../core/streaming-message-store";
import type {
  UIDataTypesToSchemas,
  InferUIMessageData,
  InferUIMessageMetadata,
  InferUIMessageToolCall,
  StreamingUIMessageState,
} from "../core/types";
import { StandardSchemaV1, Validator } from "@ai-sdk/provider-utils";

/**
 * Options for the chat fetcher function
 */
export interface ChatFetcherOptions {
  messages: MyUIMessage[];
  model: string;
  signal: AbortSignal;
}

/**
 * Function type for fetching chat streams
 */
export interface ChatFetcher {
  (options: ChatFetcherOptions): Promise<ReadableStream<UIMessageChunk>>;
}

/**
 * Active response structure for ongoing chat requests
 */
export type ActiveResponse<UI_MESSAGE extends UIMessage> = {
  state: StreamingUIMessageState<UI_MESSAGE>;
  abortController: AbortController;
};

/**
 * Options for the makeRequest function
 */
export interface MakeRequestOptions {
  store: StreamingMessageStore<MyUIMessage>;
  messages: MyUIMessage[];
  fetchStream: (input: {
    signal: AbortSignal;
  }) => Promise<ReadableStream<UIMessageChunk>>;
  messageId?: string;
  signal?: AbortSignal;
  onFinish?: (options: MakeRequestFinishEvent) => void;
  onError?: (error: unknown) => void;
  onToolCall?: (options: {
    toolCall: InferUIMessageToolCall<MyUIMessage>;
  }) => void | PromiseLike<void>;
  onData?: (dataPart: DataUIPart<InferUIMessageData<MyUIMessage>>) => void;
  messageMetadataSchema?:
    | Validator<InferUIMessageMetadata<MyUIMessage>>
    | StandardSchemaV1<InferUIMessageMetadata<MyUIMessage>>;
  dataPartSchemas?: UIDataTypesToSchemas<InferUIMessageData<MyUIMessage>>;
}

/**
 * Result of a completed makeRequest operation
 */
export interface MakeRequestFinishEvent {
  message: MyUIMessage;
  isAbort: boolean;
  isDisconnect: boolean;
  isError: boolean;
}
