import { Eye, Brain, FileBox, Wrench, type LucideIcon } from "lucide-react";
import type { ModelFeature } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FeatureBadgeProps {
  feature: ModelFeature;
  className?: string;
}

// Feature icon mapping
const featureIcons = {
  vision: Eye,
  reasoning: Brain,
  multimodal: FileBox,
  "tool-calling": Wrench,
} satisfies Record<ModelFeature, LucideIcon>;

// Feature colors (HSL values)
const featureColors = {
  vision: { light: "hsl(168 54% 52%)", dark: "hsl(168 54% 74%)" },
  reasoning: { light: "hsl(263 58% 53%)", dark: "hsl(263 58% 75%)" },
  multimodal: { light: "hsl(237 55% 57%)", dark: "hsl(237 75% 77%)" },
  "tool-calling": { light: "hsl(0 72% 51%)", dark: "hsl(0 72% 71%)" },
} satisfies Record<ModelFeature, { light: string; dark: string }>;

// Feature display names mapping
const featureDisplayNames = {
  vision: "Can see and analyze images",
  reasoning: "Advanced thinking capabilities",
  multimodal: "Supports multiple input types",
  "tool-calling": "Can use external tools and APIs",
} satisfies Record<ModelFeature, string>;

export const FeatureBadge = ({
  feature,
  className = "",
}: FeatureBadgeProps) => {
  const IconComponent = featureIcons[feature];
  const colors = featureColors[feature];
  const displayName = featureDisplayNames[feature];

  if (!IconComponent || !colors) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md",
            className,
          )}
          style={
            {
              "--color-dark": colors.dark,
              "--color": colors.light,
              color: colors.dark,
            } as React.CSSProperties
          }
        >
          <div
            className="absolute inset-0 opacity-20 dark:opacity-20"
            style={{ backgroundColor: colors.dark }}
          />
          <IconComponent
            className="h-4 w-4 brightness-75 dark:filter-none relative z-10"
            style={{ color: colors.dark }}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent sideOffset={4}>
        <p>{displayName}</p>
      </TooltipContent>
    </Tooltip>
  );
};
