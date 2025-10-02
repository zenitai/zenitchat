import { FlaskConical, Gem, Key, Sparkles, LucideIcon } from "lucide-react";
import type { ModelConfig } from "@/features/models";

export interface StatusIndicator {
  icon: LucideIcon;
  label: string;
  color?: string;
}

export const getStatusIndicators = (model: ModelConfig): StatusIndicator[] => {
  const statusIndicators: StatusIndicator[] = [];

  // Add in priority order: BYOK > Premium > New > Experimental
  if (model.pricingTier === "byok") {
    statusIndicators.push({
      icon: Key,
      label: "BYOK",
      color: "text-green-500",
    });
  }

  if (model.pricingTier === "premium") {
    statusIndicators.push({
      icon: Gem,
      label: "Premium",
      color: "text-blue-500",
    });
  }

  if (model.new) {
    statusIndicators.push({
      icon: Sparkles,
      label: "New",
      color:
        "text-[#ffb525f7] drop-shadow-[0px_3px_8px_#ffae1082] dark:text-amber-200/80 dark:drop-shadow-[0px_3px_8px_rgba(186,130,21,0.62)]",
    });
  }

  if (model.experimental) {
    statusIndicators.push({
      icon: FlaskConical,
      label: "Experimental",
      color: "text-purple-500",
    });
  }

  return statusIndicators;
};
