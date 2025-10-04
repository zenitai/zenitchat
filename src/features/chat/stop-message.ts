import { Effect, Fiber } from "effect";
import { peekStreamingStore } from "./core/streaming-registry";

/**
 * Effect that stops the currently streaming message for a thread.
 *
 * This interrupts the Effect fiber, which automatically:
 * - Cancels the HTTP fetch request
 * - Cleans up the stream processing
 * - Triggers the Effect.onInterrupt handler to save partial message
 */
const stopMessageEffect = (threadId: string) =>
  Effect.gen(function* () {
    const store = yield* Effect.sync(() => peekStreamingStore(threadId));

    if (!store) {
      return;
    }

    // Only interrupt if actively streaming or submitted
    if (store.status !== "streaming" && store.status !== "submitted") {
      return;
    }

    if (!store.fiber) {
      return;
    }

    // Interrupt the fiber
    // The interrupted Effect's onInterrupt handler will save the partial message
    // and the ensuring handler will cleanup the store
    yield* Fiber.interrupt(store.fiber);

    // Clear fiber reference
    yield* Effect.sync(() => {
      store.fiber = null;
    });
  });

/**
 * Stop the currently streaming message for a thread.
 *
 * This is a fire-and-forget operation that interrupts the running Effect fiber.
 * The UI doesn't need to wait for interruption to complete.
 *
 * @param threadId - The thread ID to stop streaming for
 */
export const stopMessage = (threadId: string): void => {
  Effect.runFork(stopMessageEffect(threadId));
};
