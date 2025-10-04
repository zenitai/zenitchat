import type { UIMessage } from "ai";
import type { RuntimeFiber } from "effect/Fiber";
import { throttle } from "../utils/throttle";

export type ChatStatus = "submitted" | "streaming" | "ready" | "error";

export type ChatFiber<UI_MESSAGE extends UIMessage = UIMessage> = RuntimeFiber<
  UI_MESSAGE | void,
  never
>;

/**
 * Ephemeral store for streaming assistant messages with status tracking.
 *
 * This implements the external store pattern to prevent React render loops
 * during high-frequency streaming updates. It's similar to ReactChatState from useChat
 * but adapted for our Effect.ts-based architecture.
 *
 * Tracks:
 * - message: The streaming assistant message content
 * - status: Current chat status (submitted/streaming/ready/error)
 * - fiber: Effect fiber for interruption (stop functionality)
 */
export class StreamingMessageStore<UI_MESSAGE extends UIMessage = UIMessage> {
  #message: UI_MESSAGE | null = null;
  #status: ChatStatus = "ready";
  #fiber: ChatFiber<UI_MESSAGE> | null = null;

  #messageCallbacks = new Set<() => void>();
  #statusCallbacks = new Set<() => void>();

  get message(): UI_MESSAGE | null {
    return this.#message;
  }

  set message(newMessage: UI_MESSAGE | null) {
    this.#message = newMessage ? this.snapshot(newMessage) : null;
    this.#callMessageCallbacks();
  }

  get status(): ChatStatus {
    return this.#status;
  }

  set status(newStatus: ChatStatus) {
    this.#status = newStatus;
    this.#callStatusCallbacks();
  }

  get fiber(): ChatFiber<UI_MESSAGE> | null {
    return this.#fiber;
  }

  set fiber(newFiber: ChatFiber<UI_MESSAGE> | null) {
    this.#fiber = newFiber;
  }

  /**
   * Deep clone values to ensure React Compiler detects nested changes
   */
  snapshot = <T>(value: T): T => structuredClone(value);

  /**
   * Register a callback to be notified when the message changes.
   * Returns an unsubscribe function.
   */
  "~registerMessageCallback" = (
    onChange: () => void,
    throttleWaitMs?: number,
  ): (() => void) => {
    const callback = throttleWaitMs
      ? throttle(onChange, throttleWaitMs)
      : onChange;
    this.#messageCallbacks.add(callback);
    return () => this.#messageCallbacks.delete(callback);
  };

  /**
   * Register a callback to be notified when the status changes.
   * Returns an unsubscribe function.
   */
  "~registerStatusCallback" = (onChange: () => void): (() => void) => {
    this.#statusCallbacks.add(onChange);
    return () => this.#statusCallbacks.delete(onChange);
  };

  /**
   * Notify all registered callbacks of a message change
   */
  #callMessageCallbacks = () => {
    this.#messageCallbacks.forEach((callback) => callback());
  };

  /**
   * Notify all registered callbacks of a status change
   */
  #callStatusCallbacks = () => {
    this.#statusCallbacks.forEach((callback) => callback());
  };
}

/**
 * Factory function to create a new streaming message store
 */
export function createStreamingMessageStore<
  UI_MESSAGE extends UIMessage = UIMessage,
>(): StreamingMessageStore<UI_MESSAGE> {
  return new StreamingMessageStore<UI_MESSAGE>();
}
