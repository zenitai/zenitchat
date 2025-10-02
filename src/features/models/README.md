# Models Feature

A comprehensive model management system providing model configurations, icons, and utilities.

## 📁 Directory Structure

```
src/features/models/
├── components/
│   └── feature-badge.tsx    # Model feature badges (vision, reasoning, etc.)
├── icons/
│   ├── openai.tsx           # Individual creator icons
│   ├── google.tsx
│   ├── anthropic.tsx
│   ├── ...                  # More creator icons
│   ├── icon-registry.tsx    # ModelIcon component
│   └── index.ts             # Icon exports
├── constants.ts             # Shared constants (ALL_MODELS, CREATOR_NAMES)
├── google.ts                # Google model configurations
├── openai.ts                # OpenAI model configurations
├── ...                      # More model configurations
├── types.ts                 # TypeScript type definitions
├── utils.ts                 # Utility functions
└── index.ts                 # Main exports (public API)
```

## 🚀 Quick Usage

```typescript
import {
  ModelIcon,           // Creator icons (OpenAI logo, Google logo, etc.)
  FeatureBadge,        // Feature badges (vision, reasoning, etc.)
  ALL_MODELS,          // All available models
  getModelById,        // Find model by ID
  type ModelConfig     // Model type definition
} from "@/features/models";

// Show creator icon
<ModelIcon creator="openai" className="size-6" />

// Show feature badges
<FeatureBadge feature="vision" />

// Get model data
const model = getModelById("openai/gpt-4o");
```

# Adding New Model Creators

This guide shows how to add a completely new model creator that doesn't exist in the system yet.

## 🚀 Quick Steps

### 1. Add Creator Type

Add the new creator to the `ModelCreator` type in `src/features/models/types.ts`:

```typescript
export type ModelCreator =
  | "openai"
  | "google"
  | "anthropic"
  | "meta"
  | "deepseek"
  | "moonshotai"
  | "xai"
  | "zai"
  | "qwen"
  | "stealth"
  | "perplexity"; // ← Add your new creator here
```

### 2. Create Creator File

Create `src/features/models/{creator}.ts` with your models:

```typescript
// src/features/models/perplexity.ts
import type { ModelConfig } from "./types";

export const PERPLEXITY_MODELS = [
  {
    id: "perplexity/llama-3.1-sonar-large",
    creator: "perplexity",
    infrastructureProvider: "vercel",
    model: "llama-3.1-sonar-large-128k-online",
    displayName: "Llama 3.1 Sonar Large",
    description: "Large reasoning model with web search",
    longDescription: "Perplexity's large model with real-time web access...",
    features: ["tool-calling"],
    specs: {
      contextLimit: 127072,
      outputLimit: 8192,
      inputCost: 1,
      outputCost: 1,
      knowledgeCutoff: "2024-10-01",
      releaseDate: "2024-09-01",
    },
    allowedAttachmentTypes: [],
    allowedMIMETypes: [],
    experimental: false,
    new: true,
    streaming: "word",
    pricingTier: "standard",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  // Add more models here...
] as const satisfies readonly ModelConfig[];
```

### 3. Add Creator Icon

Create `src/features/models/icons/{creator}.tsx`:

```typescript
// src/features/models/icons/perplexity.tsx
import type { SVGProps } from "react";

export const Perplexity = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
    />
  </svg>
);
```

### 4. Export Icon

Add to `src/features/models/icons/index.ts`:

```typescript
export { Meta } from "./meta";
export { Zai } from "./zai";
export { Xai } from "./xai";
export { OpenAI } from "./openai";
export { Google } from "./google";
export { Anthropic } from "./anthropic";
export { MoonshotAI } from "./moonshotai";
export { Deepseek } from "./deepseek";
export { Qwen } from "./qwen";
export { Stealth } from "./stealth";
export { Perplexity } from "./perplexity"; // ← Add this line
export { ModelIcon } from "./icon-registry";
```

### 5. Update Icon Registry

Add to `src/features/models/icons/icon-registry.tsx`:

```typescript
// Add import
import { Perplexity } from "./perplexity";

// Add to iconRegistry object
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
  perplexity: Perplexity, // ← Add this line
} as const;
```

### 6. Add Display Name

Add to `CREATOR_NAMES` in `src/features/models/constants.ts`:

```typescript
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
  perplexity: "Perplexity", // ← Add this line
} as const;
```

### 7. Include in ALL_MODELS

Import and add to `src/features/models/constants.ts`:

```typescript
import { OPENAI_MODELS } from "./openai";
import { GOOGLE_MODELS } from "./google";
import { PERPLEXITY_MODELS } from "./perplexity"; // ← Add this import

export const ALL_MODELS = [
  ...OPENAI_MODELS,
  ...GOOGLE_MODELS,
  ...PERPLEXITY_MODELS, // ← Add this line
];
```

### 8. Export Models from Main Index

Add to `src/features/models/index.ts` in the "Actual models" section:

```typescript
// ============================================================================
// Actual models
// ============================================================================
export { OPENAI_MODELS } from "./openai";
export { GOOGLE_MODELS } from "./google";
export { PERPLEXITY_MODELS } from "./perplexity"; // ← Add this line
```

## ✅ That's it!

Your new creator is now fully integrated. The system will automatically:

- Show the creator in dropdowns and filters
- Display the correct icon
- Include models in searches and listings
- Provide proper type safety

## 📝 Notes

### Adding Models to Existing Creator (No Models Yet)

If the creator already exists in the system but has no models yet (like Anthropic), just:

1. Create the `{creator}.ts` file (step 2)
2. Add to `ALL_MODELS` (step 7)

The creator type, icon, and display name already exist - no need to touch them.

### Adding Models to Existing Creator with Models

If the creator already has models, just add new models to the existing `{creator}.ts` file:

```typescript
// src/features/models/openai.ts
export const OPENAI_MODELS = [
  // ... existing models
  {
    id: "openai/new-model",
    creator: "openai",
    // ... model config
  },
] as const satisfies readonly ModelConfig[];
```

No other changes needed - the system automatically picks up new models!
