import { useRef, useCallback, useLayoutEffect } from "react";

// Hook for chat input container height calculation and reporting
interface UseChatInputHeightProps {
  onHeightChange?: (height: number) => void;
  currentValue: string;
}

export function useChatInputHeight({
  onHeightChange,
  currentValue,
}: UseChatInputHeightProps) {
  // Simple ref for the container
  const chatInputContainerRef = useRef<HTMLDivElement>(null);

  // Calculate and report total height when content changes
  const calculateAndReportHeight = useCallback(() => {
    if (chatInputContainerRef.current && onHeightChange) {
      const totalHeight = chatInputContainerRef.current.offsetHeight;
      onHeightChange(totalHeight);
    }
  }, [onHeightChange]);

  // Measure height after DOM updates
  useLayoutEffect(() => {
    calculateAndReportHeight();
  }, [calculateAndReportHeight, currentValue]);

  return {
    chatInputContainerRef,
    calculateAndReportHeight,
  };
}
