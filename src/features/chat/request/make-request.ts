import type { MyUIMessage } from "@/features/messages/types";
import { createStreamingUIMessageState } from "../core/streaming-ui-message-state";
import { processUIMessageStream } from "../core/process-ui-message";
import type { StreamingUIMessageState } from "../core/types";
import { SerialJobExecutor } from "../core/job-executor";
import { consumeStream } from "../utils/consume-stream";
import isNetworkError from "is-network-error";
import type {
  MakeRequestOptions,
  MakeRequestFinishEvent,
  ActiveResponse,
} from "./types";

export async function makeRequest({
  store,
  messages,
  fetchStream,
  messageId,
  signal,
  onFinish,
  onError,
  onToolCall,
  onData,
  messageMetadataSchema,
  dataPartSchemas,
}: MakeRequestOptions): Promise<MakeRequestFinishEvent> {
  const executor = new SerialJobExecutor();

  // Create active response structure for ongoing streaming requests
  const activeResponse: ActiveResponse<MyUIMessage> = {
    state: createStreamingUIMessageState<MyUIMessage>({
      lastMessage: messages.at(-1),
      messageId: messageId ?? crypto.randomUUID(),
    }),
    abortController: new AbortController(),
  };

  let isAbort = false;
  let isDisconnect = false;
  let isError = false;

  // Set up abort listener
  activeResponse.abortController.signal.addEventListener("abort", () => {
    isAbort = true;
  });

  // Handle external signal relay for proper cancellation
  const externalAbortHandler = () => {
    activeResponse.abortController.abort();
  };

  if (signal) {
    if (signal.aborted) {
      activeResponse.abortController.abort();
    } else {
      signal.addEventListener("abort", externalAbortHandler, { once: true });
    }
  }

  try {
    // Get the stream using our fetch function
    const stream = await fetchStream({
      signal: activeResponse.abortController.signal,
    });

    // Run update message job
    const runUpdateMessageJob = (
      job: (options: {
        state: StreamingUIMessageState<MyUIMessage>;
        write: () => void;
      }) => Promise<void>,
    ) =>
      // Serialize job execution to avoid race conditions
      executor.run(() =>
        job({
          state: activeResponse.state,
          write: () => {
            store.message = activeResponse.state.message;
          },
        }),
      );

    await consumeStream({
      stream: processUIMessageStream({
        stream,
        onToolCall,
        onData,
        messageMetadataSchema,
        dataPartSchemas,
        runUpdateMessageJob,
        onError: (error) => {
          throw error;
        },
      }),
      onError: (error) => {
        throw error;
      },
    });
  } catch (err) {
    // Handle abort errors gracefully
    if (isAbort || (err instanceof Error && err.name === "AbortError")) {
      isAbort = true;
      // Don't clear the message - keep what was already streamed
      // Users should see the partial response that was received before abort
      // Don't call onError for abort - it's expected
      const result: MakeRequestFinishEvent = {
        message: activeResponse.state.message,
        isAbort: true,
        isDisconnect: false,
        isError: false,
      };
      onFinish?.(result);
      return result;
    }

    isError = true;

    // Network errors using is-network-error package
    if (isNetworkError(err)) {
      isDisconnect = true;
    }

    // Always keep partial content - users should see what was successfully streamed
    // Even if there was an error, the partial content is still valuable
    // The error will be shown/persisted alongside the partial content
    if (onError && err instanceof Error) {
      onError(err);
    }

    throw err;
  } finally {
    // Clean up external signal listener
    if (signal) {
      signal.removeEventListener("abort", externalAbortHandler);
    }

    // Call onFinish callback for completion handling
    try {
      onFinish?.({
        message: activeResponse.state.message,
        isAbort,
        isDisconnect,
        isError,
      });
    } catch (err) {
      console.error("Error in onFinish callback:", err);
    }
  }

  const result: MakeRequestFinishEvent = {
    message: activeResponse.state.message,
    isAbort,
    isDisconnect,
    isError,
  };

  // Don't throw for abort - return result instead
  return result;
}
