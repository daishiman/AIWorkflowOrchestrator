/**
 * @file LLM Provider Registry - Single Source of Truth
 * @description 全プロバイダー/モデル情報の唯一の定義元。
 *   新プロバイダー追加時はこのファイルの PROVIDER_CONFIGS にエントリを追加するだけで、
 *   LLMProviderIdSchema と inferProviderId が自動的に追従する。
 * @feature chat-multi-llm-switching
 */

export interface ProviderConfigEntry {
  readonly id: string;
  readonly name: string;
  readonly modelPrefixes: readonly string[];
  readonly specialMatcher?: (modelId: string) => boolean;
  readonly models: readonly ProviderModelEntry[];
}

export interface ProviderModelEntry {
  readonly id: string;
  readonly name: string;
  readonly contextWindow: number;
  readonly isDefault: boolean;
  readonly description?: string;
}

/**
 * PROVIDER_CONFIGS - Single Source of Truth
 *
 * 新プロバイダー追加手順:
 * 1. この配列に新エントリを追加する（スキーマ層は自動追従）
 * 2. LLMAdapterFactory に対応アダプターを追加する
 */
export const PROVIDER_CONFIGS = [
  {
    id: "openai",
    name: "OpenAI",
    modelPrefixes: ["gpt-", "o3", "o4"],
    models: [
      {
        id: "gpt-5.4",
        name: "GPT-5.4",
        contextWindow: 1050000,
        isDefault: true,
        description:
          "OpenAI最新フラッグシップモデル。コンテキストウィンドウ1.05M tokens",
      },
      {
        id: "gpt-5.4-mini",
        name: "GPT-5.4 mini",
        contextWindow: 1050000,
        isDefault: false,
        description: "GPT-5.4の軽量版。高速・低コスト",
      },
      {
        id: "gpt-5.4-nano",
        name: "GPT-5.4 nano",
        contextWindow: 1050000,
        isDefault: false,
        description: "GPT-5.4の超軽量版。最速・最低コスト",
      },
      {
        id: "gpt-5.4-pro",
        name: "GPT-5.4 Pro",
        contextWindow: 1050000,
        isDefault: false,
        description: "GPT-5.4の高性能版。複雑なタスク向け",
      },
      {
        id: "o3",
        name: "o3",
        contextWindow: 200000,
        isDefault: false,
        description: "高度な推論タスク向け。思考連鎖を内部実行",
      },
      {
        id: "o4-mini",
        name: "o4-mini",
        contextWindow: 200000,
        isDefault: false,
        description: "o4シリーズの軽量推論モデル",
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    modelPrefixes: ["claude-"],
    models: [
      {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
        contextWindow: 200000,
        isDefault: true,
        description: "Anthropicの最新バランスモデル。高性能・高速",
      },
      {
        id: "claude-opus-4-6",
        name: "Claude Opus 4.6",
        contextWindow: 200000,
        isDefault: false,
        description: "Anthropicの最高性能モデル。複雑なタスク向け",
      },
      {
        id: "claude-haiku-4-5",
        name: "Claude Haiku 4.5",
        contextWindow: 200000,
        isDefault: false,
        description: "Anthropicの高速軽量モデル。シンプルなタスク向け",
      },
    ],
  },
  {
    id: "google",
    name: "Google",
    modelPrefixes: ["gemini-"],
    models: [
      {
        id: "gemini-3.1-flash-lite-preview",
        name: "Gemini 3.1 Flash-Lite",
        contextWindow: 1048576,
        isDefault: false,
        description: "Google最速・最低コストモデル（速度重視）",
      },
      {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash",
        contextWindow: 1048576,
        isDefault: true,
        description:
          "Google高速バランスモデル。1Mトークンコンテキスト対応（Gemini 2.5は2026年6月廃止予定）",
      },
      {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro",
        contextWindow: 1048576,
        isDefault: false,
        description: "Google最高性能モデル。複雑な推論・長文対応（精度重視）",
      },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    modelPrefixes: ["grok-"],
    models: [
      {
        id: "grok-3-mini",
        name: "Grok 3 Mini",
        contextWindow: 131072,
        isDefault: false,
        description: "Grok 3の軽量版。高速・低コスト（速度重視）",
      },
      {
        id: "grok-4-1-fast-non-reasoning",
        name: "Grok 4.1 Fast",
        contextWindow: 2097152,
        isDefault: true,
        description:
          "xAI最新高速モデル（非推論）。2Mトークンコンテキスト対応（バランス）",
      },
      {
        id: "grok-4-1-fast-reasoning",
        name: "Grok 4.1 Fast Reasoning",
        contextWindow: 2097152,
        isDefault: false,
        description:
          "xAI最新高速推論モデル。2Mトークンコンテキスト対応（精度重視）",
      },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    modelPrefixes: [],
    specialMatcher: (modelId: string) => modelId.includes("/"),
    models: [
      {
        id: "openai/gpt-4o",
        name: "GPT-4o (via OpenRouter)",
        contextWindow: 128000,
        isDefault: true,
      },
      {
        id: "anthropic/claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet (via OpenRouter)",
        contextWindow: 200000,
        isDefault: false,
      },
      {
        id: "google/gemini-pro-1.5",
        name: "Gemini 1.5 Pro (via OpenRouter)",
        contextWindow: 2097152,
        isDefault: false,
      },
      {
        id: "meta-llama/llama-3.1-405b-instruct",
        name: "Llama 3.1 405B (via OpenRouter)",
        contextWindow: 131072,
        isDefault: false,
      },
    ],
  },
] as const satisfies readonly ProviderConfigEntry[];

/** PROVIDER_CONFIGS から抽出されるプロバイダーIDリテラル型 */
export type ProviderIdUnion = (typeof PROVIDER_CONFIGS)[number]["id"];

/**
 * PROVIDER_CONFIGS から自動導出されるプロバイダーID tuple。
 * z.enum() に必要な [string, ...string[]] 形式を満たしつつ、
 * リテラル型ユニオンを維持する。
 */
const _providerIds = PROVIDER_CONFIGS.map((p) => p.id);
if (_providerIds.length === 0) {
  throw new Error("PROVIDER_CONFIGS must contain at least one provider");
}
export const PROVIDER_IDS = _providerIds as [
  ProviderIdUnion,
  ...ProviderIdUnion[],
];

/**
 * PROVIDER_CONFIGS から自動導出されるプロバイダーID推定関数。
 * モデルIDからプロバイダーIDを推定する。
 *
 * マッチング優先順位:
 * 1. specialMatcher（定義されている場合） — OpenRouter等のメタプロバイダーは
 *    他プロバイダーの prefix にもマッチし得るため、先に評価する
 * 2. modelPrefixes による prefix マッチング
 */
export function inferProviderId(modelId: string): ProviderIdUnion | null {
  for (const provider of PROVIDER_CONFIGS) {
    if ("specialMatcher" in provider && provider.specialMatcher(modelId)) {
      return provider.id;
    }
    if (provider.modelPrefixes.some((prefix) => modelId.startsWith(prefix))) {
      return provider.id;
    }
  }
  return null;
}
