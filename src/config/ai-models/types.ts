// Core enums for better type safety
export type ModelCreator =
  | "openai"
  | "google"
  | "anthropic"
  | "meta"
  | "deepseek"
  | "moonshotai"
  | "xai"
  | "zai"
  | "qwen";

export type InfrastructureProvider = "vercel" | "openrouter" | "direct";

export type StreamingType = "word" | "line";
export type ModelFeature =
  | "vision"
  | "reasoning"
  | "multimodal"
  | "tool-calling";

export type AttachmentType = "image" | "document" | "audio" | "video";

// Pricing tiers
export type PricingTier = "free" | "standard" | "premium";

// Model specifications
export interface ModelSpecs {
  contextLimit: number;
  outputLimit: number;
  inputCost: number; // cost per 1M input tokens
  outputCost: number; // cost per 1M output tokens
  cacheInputCost: number; // cost per 1M cached input tokens
  reasoningCost: number; // cost per 1M reasoning tokens
  knowledgeCutoff: string; // e.g., "2024-01-01"
  releaseDate: string; // e.g., "2024-01-01"
}

// Infrastructure provider options
export interface VercelGatewayOptions {
  provider: "vercel";
  gateway?: {
    order?: string[];
    only?: string[];
  };
}

export interface OpenRouterOptions {
  provider: "openrouter";
  openrouter?: {
    order?: string[];
    only?: string[];
    sort?: "price" | "throughput" | "latency";
  };
}

export interface DirectOptions {
  provider: "direct";
  apiKey?: string;
  baseURL?: string;
  customHeaders?: Record<string, string>;
}

export type InfrastructureProviderOptions =
  | VercelGatewayOptions
  | OpenRouterOptions
  | DirectOptions;

// Model Config
export interface ModelConfig {
  // Core identification
  id: string;
  creator: ModelCreator; // Who built the model (OpenAI, Anthropic, etc.)
  infrastructureProvider: InfrastructureProvider; // How we access it (Vercel AI Gateway, OpenRouter, etc.)
  model: string; // Actual API model ID for the infrastructure provider

  // Display information
  displayName: string;
  description: string;
  longDescription: string;

  // Specifications and features
  features: ModelFeature[];
  specs: ModelSpecs;

  // File handling
  allowedAttachmentTypes: AttachmentType[];
  allowedMIMETypes: string[];

  // Status flags
  experimental: boolean;
  new: boolean;

  // Streaming and performance
  streaming: StreamingType;
  pricingTier: PricingTier;

  // Infrastructure-specific configuration
  infrastructureProviderOptions: InfrastructureProviderOptions;
  defaultProviderOptions?: Record<string, unknown>;
}

// Icon component type
export interface IconComponent {
  (props: React.SVGProps<SVGSVGElement>): React.JSX.Element;
}

// Type-safe icon mapping
export type IconMap = {
  [K in ModelCreator]: IconComponent;
};

// Icon name mapping for type safety
export const CREATOR_NAMES: Record<ModelCreator, string> = {
  openai: "OpenAI",
  google: "Google",
  anthropic: "Anthropic",
  meta: "Meta",
  deepseek: "Deepseek",
  moonshotai: "MoonshotAI",
  xai: "Xai",
  zai: "Zai",
  qwen: "Qwen",
} as const;

// Type-safe icon getter function
export type GetIconFunction = <T extends ModelCreator>(
  creator: T,
) => IconMap[T];
