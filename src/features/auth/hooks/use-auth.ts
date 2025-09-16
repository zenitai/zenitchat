import { useConvexAuth } from "convex/react";
import { useState, useEffect, useMemo } from "react";
import { env } from "@/env";

type UserStatus = "new" | "returning" | "authenticated";

const STORAGE_KEY = `${env.NEXT_PUBLIC_LOCALSTORAGE_PREFIX}_visited`;

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [userStatus, setUserStatus] = useState<UserStatus>("new");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    let hasVisitedBefore: string | null = null;
    try {
      hasVisitedBefore = localStorage.getItem(STORAGE_KEY);
    } catch {
      hasVisitedBefore = null;
    }

    if (isAuthenticated) {
      setUserStatus("authenticated");
    } else if (hasVisitedBefore) {
      setUserStatus("returning");
    } else {
      setUserStatus("new");
      // Don't set localStorage here - let the user action set it
    }

    setIsInitialized(true);
  }, [isAuthenticated]);

  const markAsVisited = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore storage failures (e.g., private mode)
    }
    setUserStatus((prev) => (prev === "authenticated" ? prev : "returning"));
  };

  return useMemo(
    () => ({
      // Auth state from Convex
      isAuthenticated,
      isLoading: isLoading || !isInitialized,

      // User status
      userStatus,
      // UI helpers
      unAuthedNewUser: userStatus === "new" && !isAuthenticated,
      unAuthedReturningUser: userStatus === "returning" && !isAuthenticated,
      // Actions
      markAsVisited,
    }),
    [isAuthenticated, isLoading, isInitialized, userStatus],
  );
}
