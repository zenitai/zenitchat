import { useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getModelsByCreator, ModelIcon } from "@/config/ai-models";
import { ALL_CREATORS, CREATOR_NAMES } from "@/config/ai-models/types";
import { FeatureBadge } from "@/features/chat-input/model-selector/components/feature-badge";

interface RegenerateDropdownProps {
  currentModel?: string;
  onRegenerate: (modelId?: string) => void;
}

export function RegenerateDropdown({
  currentModel,
  onRegenerate,
}: RegenerateDropdownProps) {
  // Get only creators that have models available (memoized since data is static)
  const creators = useMemo(
    () =>
      ALL_CREATORS.filter((creator) => {
        const models = getModelsByCreator(creator);
        return models.length > 0;
      }),
    [],
  );

  const handleRetry = () => {
    onRegenerate(currentModel);
  };

  const handleRegenerateWithModel = (modelId: string) => {
    onRegenerate(modelId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Regenerate message">
          <RefreshCw className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleRetry}>
          <RefreshCw size={16} className="opacity-60" aria-hidden="true" />
          <span>Retry same</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {creators.map((creator) => {
          const creatorModels = getModelsByCreator(creator);

          return (
            <DropdownMenuSub key={creator}>
              <DropdownMenuSubTrigger className="gap-2">
                <ModelIcon creator={creator} className="size-4 opacity-60" />
                <span>{CREATOR_NAMES[creator]}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  className="min-w-[280px] max-w-[calc(100vw-2rem)] max-h-[400px] overflow-y-auto custom-scrollbar max-md:min-w-[200px]"
                  sideOffset={8}
                  alignOffset={0}
                  collisionPadding={16}
                >
                  {creatorModels.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => handleRegenerateWithModel(model.id)}
                      className="flex items-center gap-3 py-2 px-3 cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        <ModelIcon creator={model.creator} className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate text-foreground/80">
                          {model.displayName}
                        </span>
                      </div>
                      {model.features.length > 0 && (
                        <div className="flex gap-1 flex-shrink-0 max-md:hidden">
                          {model.features.map((feature) => (
                            <FeatureBadge key={feature} feature={feature} />
                          ))}
                        </div>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
