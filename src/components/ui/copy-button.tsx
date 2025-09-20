"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

interface CopyButtonProps {
  content: string;
  className?: string;
  showToast?: boolean;
  ariaLabel?: string;
  data?: unknown; // For copying structured data like JSON
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export default function CopyButton({
  content,
  className,
  showToast = false,
  ariaLabel = "Copy button",
  data,
  variant = "outline",
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      let textToCopy = content;

      // If data is provided, stringify it as JSON
      if (data !== undefined) {
        textToCopy = JSON.stringify(data, null, 2);
      }

      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);

      if (showToast) {
        toast.success("Copied to clipboard");
      }

      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy content: ", err);
      if (showToast) {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleCopy}
      aria-label={isCopied ? "Copied" : ariaLabel}
      className={cn("transition-all duration-200", className)}
    >
      <div className="relative size-4">
        <Copy
          className={cn(
            "absolute inset-0 transition-all duration-200 ease-in-out",
            isCopied ? "scale-0 opacity-0" : "scale-100 opacity-100",
          )}
          aria-hidden="true"
        />
        <Check
          className={cn(
            "absolute inset-0 transition-all duration-200 ease-in-out",
            isCopied ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
          aria-hidden="true"
        />
      </div>
    </Button>
  );
}
