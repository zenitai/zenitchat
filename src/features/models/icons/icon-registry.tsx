import type { SVGProps, JSX } from "react";
import type { ModelCreator } from "../types";
import { OpenAI } from "./openai";
import { Google } from "./google";
import { Anthropic } from "./anthropic";
import { Meta } from "./meta";
import { Deepseek } from "./deepseek";
import { MoonshotAI } from "./moonshotai";
import { Xai } from "./xai";
import { Zai } from "./zai";
import { Qwen } from "./qwen";
import { Stealth } from "./stealth";

// Icon component type
interface IconComponent {
  (props: SVGProps<SVGSVGElement>): JSX.Element;
}

// Type-safe icon mapping
type IconMap = {
  [K in ModelCreator]: IconComponent;
};

type GetIconFunction = <T extends ModelCreator>(creator: T) => IconMap[T];

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
  stealth: Stealth,
} as const;

// Type-safe icon getter
const getIcon: GetIconFunction = (creator) => {
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
