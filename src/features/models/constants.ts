import { OPENAI_MODELS } from "./openai";
import { GOOGLE_MODELS } from "./google";
import type { ModelCreator } from "./types";

export const ALL_MODELS = [...OPENAI_MODELS, ...GOOGLE_MODELS];

// Default model configuration
export const DEFAULT_MODEL =
  ALL_MODELS.find((m) => m.id === "openai/gpt-5-mini") ?? ALL_MODELS[0];

// Default favorite models for new users
// This is shared between Convex backend and frontend
export const DEFAULT_FAVORITE_MODELS = [
  "google/gemini-2.0-flash",
  "google/gemini-2.5-flash",
  "openai/gpt-5-mini",
  "openai/o4-mini",
];

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
  stealth: "Stealth",
} as const;

// Array of all model creators for iteration
// Derived from CREATOR_NAMES keys to automatically stay in sync
export const ALL_CREATORS = Object.keys(CREATOR_NAMES) as ModelCreator[];
