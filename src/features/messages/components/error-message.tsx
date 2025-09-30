import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: ReactNode;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-900 dark:text-red-400",
        className,
      )}
      role="alert"
    >
      <div className="leading-relaxed">
        <span>{message}</span>
      </div>
    </div>
  );
}
