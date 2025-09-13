import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ModelIcon } from "@/config/ai-models";
import type { ModelConfig } from "@/config/ai-models/types";
import { FeatureBadge } from "./feature-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStatusIndicators } from "../utils/status-indicators";

interface ModelRowProps {
  model: ModelConfig;
  onSelect: (model: ModelConfig) => void;
}

export const ModelRow = ({ model, onSelect }: ModelRowProps) => {
  // Build status indicators
  const statusIndicators = getStatusIndicators(model);
  const highestPriority = statusIndicators[0];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuItem
          key={model.id}
          onClick={() => onSelect(model)}
          className="flex items-center gap-3 p-3 cursor-pointer"
        >
          <div className="flex-shrink-0">
            <ModelIcon creator={model.creator} className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate text-foreground/80">
                {model.displayName}
              </span>
              <div className="flex items-center gap-1">
                {highestPriority ? (
                  <highestPriority.icon
                    className={`size-3.5 ${highestPriority.color ?? ""}`}
                  />
                ) : null}
              </div>
            </div>
          </div>
          {model.features.length > 0 && (
            <div className="flex gap-1 flex-shrink-0">
              {model.features.map((feature) => (
                <FeatureBadge key={feature} feature={feature} />
              ))}
            </div>
          )}
        </DropdownMenuItem>
      </TooltipTrigger>
      {statusIndicators.length > 0 && (
        <TooltipContent sideOffset={4}>
          <div className="flex items-center gap-1">
            {statusIndicators.map((status, index) => {
              const Icon = status.icon;
              return (
                <div key={status.label} className="flex items-center gap-1">
                  <Icon className="size-3" />
                  <span className="text-xs">{status.label}</span>
                  {index < statusIndicators.length - 1 && (
                    <span className="text-xs text-muted-foreground">•</span>
                  )}
                </div>
              );
            })}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
};
