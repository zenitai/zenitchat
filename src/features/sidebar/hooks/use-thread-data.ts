import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { usePaginatedQuery } from "convex/react";
import { env } from "@/env";

const LOCAL_STORAGE_KEY = `${env.NEXT_PUBLIC_LOCALSTORAGE_PREFIX}-threads`;

const getCachedThreads = () => {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

export function useThreadData() {
  const {
    results: threadsFromConvex,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.threads.getUserThreads,
    {},
    { initialNumItems: 100 },
  );

  const threadsFromLocalStorage = getCachedThreads();

  useEffect(() => {
    if (threadsFromConvex && typeof window !== "undefined") {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(threadsFromConvex),
        );
      } catch (error) {
        console.warn("Failed to cache threads to localStorage:", error);
      }
    }
  }, [threadsFromConvex]);

  return {
    threads: threadsFromConvex || threadsFromLocalStorage,
    status,
    loadMore,
  };
}
