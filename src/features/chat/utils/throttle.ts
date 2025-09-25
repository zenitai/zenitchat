import throttleFunction from "throttleit";

/**
 * Throttle utility function using throttleit
 * Prevents excessive re-renders during fast streaming updates
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  waitMs: number | undefined,
): T {
  return waitMs != null ? throttleFunction(fn, waitMs) : fn;
}
