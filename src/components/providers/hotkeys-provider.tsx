"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useLocation } from "react-router";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

export function HotkeysProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  // Mod+Shift+O - Navigate to home (only if not already there)
  useHotkeys("mod+shift+o", (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
    }
  });

  // M - Toggle theme (disabled when typing in inputs)
  useHotkeys(
    "m",
    () => {
      setTheme(theme === "dark" ? "light" : "dark");
    },
    { enableOnFormTags: false },
  );

  return <>{children}</>;
}
