import { ModelConfig } from "./types";

export const OPENAI_MODELS: ModelConfig[] = [
  {
    id: "openai/gpt-4o",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-4o",
    displayName: "GPT-4o",
    description:
      "GPT-4o from OpenAI has broad general knowledge and domain expertise allowing it to follow complex instructions in natural language and solve difficult problems accurately. It matches GPT-4 Turbo performance with a faster and cheaper API.",
    longDescription:
      "GPT-4o from OpenAI has broad general knowledge and domain expertise allowing it to follow complex instructions in natural language and solve difficult problems accurately. It matches GPT-4 Turbo performance with a faster and cheaper API.",
    features: ["vision", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 128000,
      outputLimit: 16384,
      inputCost: 2.5,
      outputCost: 10,
      cacheInputCost: 1.25,
      knowledgeCutoff: "2023-09",
      releaseDate: "2024-05-13",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "standard",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/gpt-4o-mini",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-4o-mini",
    displayName: "GPT-4o mini",
    description:
      "GPT-4o mini from OpenAI is their most advanced and cost-efficient small model. It is multi-modal (accepting text or image inputs and outputting text) and has higher intelligence than gpt-3.5-turbo but is just as fast.",
    longDescription:
      "GPT-4o mini from OpenAI is their most advanced and cost-efficient small model. It is multi-modal (accepting text or image inputs and outputting text) and has higher intelligence than gpt-3.5-turbo but is just as fast.",
    features: ["vision", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 128000,
      outputLimit: 16384,
      inputCost: 0.15,
      outputCost: 0.6,
      cacheInputCost: 0.075,
      knowledgeCutoff: "2023-09",
      releaseDate: "2024-07-18",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "free",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/gpt-4.1",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-4.1",
    displayName: "GPT-4.1",
    description:
      "GPT 4.1 is OpenAI's flagship model for complex tasks. It is well suited for problem solving across domains.",
    longDescription:
      "GPT 4.1 is OpenAI's flagship model for complex tasks. It is well suited for problem solving across domains.",
    features: ["vision", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 1047576,
      outputLimit: 32768,
      inputCost: 2,
      outputCost: 8,
      cacheInputCost: 0.5,
      knowledgeCutoff: "2024-04",
      releaseDate: "2025-04-14",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "standard",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/gpt-4.1-mini",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-4.1-mini",
    displayName: "GPT-4.1 mini",
    description:
      "GPT 4.1 mini provides a balance between intelligence, speed, and cost that makes it an attractive model for many use cases.",
    longDescription:
      "GPT 4.1 mini provides a balance between intelligence, speed, and cost that makes it an attractive model for many use cases.",
    features: ["vision", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 1047576,
      outputLimit: 32768,
      inputCost: 0.4,
      outputCost: 1.6,
      cacheInputCost: 0.1,
      knowledgeCutoff: "2024-04",
      releaseDate: "2025-04-14",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "free",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/gpt-4.1-nano",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-4.1-nano",
    displayName: "GPT-4.1 nano",
    description:
      "GPT-4.1 nano is the fastest, most cost-effective GPT 4.1 model.",
    longDescription:
      "GPT-4.1 nano is the fastest, most cost-effective GPT 4.1 model.",
    features: ["vision", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 1047576,
      outputLimit: 32768,
      inputCost: 0.1,
      outputCost: 0.4,
      cacheInputCost: 0.025,
      knowledgeCutoff: "2024-04",
      releaseDate: "2025-04-14",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "free",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/gpt-5",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-5",
    displayName: "GPT-5",
    description:
      "GPT-5 is OpenAI's flagship language model that excels at complex reasoning, broad real-world knowledge, code-intensive, and multi-step agentic tasks.",
    longDescription:
      "GPT-5 is OpenAI's flagship language model that excels at complex reasoning, broad real-world knowledge, code-intensive, and multi-step agentic tasks.",
    features: ["vision", "reasoning", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 400000,
      outputLimit: 128000,
      inputCost: 1.25,
      outputCost: 10,
      cacheInputCost: 0.125,
      knowledgeCutoff: "2024-09-30",
      releaseDate: "2025-08-07",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "premium",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/gpt-5-mini",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-5-mini",
    displayName: "GPT-5 mini",
    description:
      "GPT-5 mini is a cost optimized model that excels at reasoning/chat tasks. It offers an optimal balance between speed, cost, and capability.",
    longDescription:
      "GPT-5 mini is a cost optimized model that excels at reasoning/chat tasks. It offers an optimal balance between speed, cost, and capability.",
    features: ["vision", "reasoning", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 400000,
      outputLimit: 128000,
      inputCost: 0.25,
      outputCost: 2,
      cacheInputCost: 0.025,
      knowledgeCutoff: "2024-05-30",
      releaseDate: "2025-08-07",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "free",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/gpt-5-nano",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-5-nano",
    displayName: "GPT-5 nano",
    description:
      "GPT-5 nano is a high throughput model that excels at simple instruction or classification tasks.",
    longDescription:
      "GPT-5 nano is a high throughput model that excels at simple instruction or classification tasks.",
    features: ["vision", "reasoning", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 400000,
      outputLimit: 128000,
      inputCost: 0.05,
      outputCost: 0.4,
      cacheInputCost: 0.005,
      knowledgeCutoff: "2024-05-30",
      releaseDate: "2025-08-07",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "free",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/o3",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/o3",
    displayName: "o3",
    description:
      "OpenAI's o3 is their most powerful reasoning model, setting new state-of-the-art benchmarks in coding, math, science, and visual perception. It excels at complex queries requiring multi-faceted analysis, with particular strength in analyzing images, charts, and graphics.",
    longDescription:
      "OpenAI's o3 is their most powerful reasoning model, setting new state-of-the-art benchmarks in coding, math, science, and visual perception. It excels at complex queries requiring multi-faceted analysis, with particular strength in analyzing images, charts, and graphics.",
    features: ["vision", "reasoning", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 200000,
      outputLimit: 100000,
      inputCost: 2,
      outputCost: 8,
      cacheInputCost: 0.5,
      knowledgeCutoff: "2024-05",
      releaseDate: "2025-04-16",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "standard",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/o3-mini",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/o3-mini",
    displayName: "o3-mini",
    description:
      "o3-mini is OpenAI's most recent small reasoning model, providing high intelligence at the same cost and latency targets of o1-mini.",
    longDescription:
      "o3-mini is OpenAI's most recent small reasoning model, providing high intelligence at the same cost and latency targets of o1-mini.",
    features: ["vision", "reasoning", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 200000,
      outputLimit: 100000,
      inputCost: 1.1,
      outputCost: 4.4,
      cacheInputCost: 0.55,
      knowledgeCutoff: "2024-05",
      releaseDate: "2024-12-20",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "standard",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/gpt-oss-20b",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-oss-20b",
    displayName: "gpt-oss-20b",
    description:
      "A compact, open-weight language model optimized for low-latency and resource-constrained environments, including local and edge deployments",
    longDescription:
      "A compact, open-weight language model optimized for low-latency and resource-constrained environments, including local and edge deployments",
    features: ["vision", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 131072,
      outputLimit: 32768,
      inputCost: 0.1,
      outputCost: 0.5,
      knowledgeCutoff: "2024-01-01",
      releaseDate: "2024-01-01",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "free",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
  {
    id: "openai/gpt-oss-120b",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/gpt-oss-120b",
    displayName: "gpt-oss-120b",
    description:
      "Extremely capable general-purpose LLM with strong, controllable reasoning capabilities",
    longDescription:
      "Extremely capable general-purpose LLM with strong, controllable reasoning capabilities",
    features: [],
    specs: {
      contextLimit: 131072,
      outputLimit: 32768,
      inputCost: 0.1,
      outputCost: 0.5,
      knowledgeCutoff: "2024-01-01",
      releaseDate: "2024-01-01",
    },
    allowedAttachmentTypes: [],
    allowedMIMETypes: [],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "free",
    infrastructureProviderOptions: {
      provider: "vercel",
      gateway: {
        order: ["cerebras"],
        only: ["cerebras", "groq", "fireworks"],
      },
    },
  },
  {
    id: "openai/o4-mini",
    creator: "openai",
    infrastructureProvider: "vercel",
    model: "openai/o4-mini",
    displayName: "o4-mini",
    description:
      "OpenAI's o4-mini delivers fast, cost-efficient reasoning with exceptional performance for its size, particularly excelling in math (best-performing on AIME benchmarks), coding, and visual tasks.",
    longDescription:
      "OpenAI's o4-mini delivers fast, cost-efficient reasoning with exceptional performance for its size, particularly excelling in math (best-performing on AIME benchmarks), coding, and visual tasks.",
    features: ["vision", "reasoning", "multimodal", "tool-calling"],
    specs: {
      contextLimit: 200000,
      outputLimit: 100000,
      inputCost: 1.1,
      outputCost: 4.4,
      cacheInputCost: 0.275,
      knowledgeCutoff: "2024-05",
      releaseDate: "2025-04-16",
    },
    allowedAttachmentTypes: ["image", "document"],
    allowedMIMETypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    experimental: false,
    new: false,
    streaming: "word",
    pricingTier: "standard",
    infrastructureProviderOptions: {
      provider: "vercel",
    },
  },
] as const;

// Export individual models for convenience
export const OPENAI_GPT_4O = OPENAI_MODELS[0];
export const OPENAI_GPT_4O_MINI = OPENAI_MODELS[1];
export const OPENAI_GPT_4_1 = OPENAI_MODELS[2];
export const OPENAI_GPT_4_1_MINI = OPENAI_MODELS[3];
export const OPENAI_GPT_4_1_NANO = OPENAI_MODELS[4];
export const OPENAI_GPT_5 = OPENAI_MODELS[5];
export const OPENAI_GPT_5_MINI = OPENAI_MODELS[6];
export const OPENAI_GPT_5_NANO = OPENAI_MODELS[7];
export const OPENAI_O3 = OPENAI_MODELS[8];
export const OPENAI_O3_MINI = OPENAI_MODELS[9];
export const OPENAI_GPT_OSS_20B = OPENAI_MODELS[10];
export const OPENAI_GPT_OSS_120B = OPENAI_MODELS[11];
export const OPENAI_O4_MINI = OPENAI_MODELS[12];
