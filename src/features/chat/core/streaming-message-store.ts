import type { UIMessage } from "ai";
import { throttle } from "../utils/throttle";

/**
 * Ephemeral store for streaming assistant messages.
 *
 * This implements the external store pattern to prevent React render loops
 * during high-frequency streaming updates. It's similar to ReactChatState from useChat
 * but simplified for just the streaming assistant message.
 */
export class StreamingMessageStore<UI_MESSAGE extends UIMessage = UIMessage> {
  #message: UI_MESSAGE | null = null;
  #messageCallbacks = new Set<() => void>();

  get message(): UI_MESSAGE | null {
    return this.#message;
  }

  set message(newMessage: UI_MESSAGE | null) {
    this.#message = newMessage ? this.snapshot(newMessage) : null;
    this.#callMessageCallbacks();
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
   * Notify all registered callbacks of a message change
   */
  #callMessageCallbacks = () => {
    this.#messageCallbacks.forEach((callback) => callback());
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
