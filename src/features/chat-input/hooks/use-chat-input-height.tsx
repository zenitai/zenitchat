import { useRef, useCallback, useLayoutEffect } from "react";
import { useChatInputActions } from "../store";

// Hook for chat input container height calculation and reporting
interface UseChatInputHeightProps {
  currentValue: string;
}

export function useChatInputHeight({ currentValue }: UseChatInputHeightProps) {
  // Simple ref for the container
  const chatInputContainerRef = useRef<HTMLDivElement>(null);
  const { setInputHeight } = useChatInputActions();

  // Calculate and report total height when content changes
  const calculateAndReportHeight = useCallback(() => {
    if (chatInputContainerRef.current) {
      const totalHeight = chatInputContainerRef.current.offsetHeight;
      setInputHeight(totalHeight);
    }
  }, [setInputHeight]);

  // Measure height after DOM updates
  useLayoutEffect(() => {
    calculateAndReportHeight();
  }, [calculateAndReportHeight, currentValue]);

  return {
    chatInputContainerRef,
    calculateAndReportHeight,
  };
}
