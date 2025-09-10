import { ModelCreator, IconMap, GetIconFunction } from "./types";
import {
  OpenAI,
  Google,
  Anthropic,
  Meta,
  Deepseek,
  MoonshotAI,
  Xai,
  Zai,
  Qwen,
} from "./provider-icons";

// Type-safe icon registry
const iconRegistry: IconMap = {
  openai: OpenAI,
  google: Google,
  anthropic: Anthropic,
  meta: Meta,
  deepseek: Deepseek,
  moonshotai: MoonshotAI,
  xai: Xai,
  zai: Zai,
  qwen: Qwen,
} as const;

// Type-safe icon getter
export const getIcon: GetIconFunction = (creator) => {
  return iconRegistry[creator];
};

// Type-safe icon component with proper typing
export const ModelIcon = ({
  creator,
  className,
  size = 24,
}: {
  creator: ModelCreator;
  className?: string;
  size?: number;
}) => {
  const IconComponent = getIcon(creator);

  return <IconComponent className={className} width={size} height={size} />;
};
