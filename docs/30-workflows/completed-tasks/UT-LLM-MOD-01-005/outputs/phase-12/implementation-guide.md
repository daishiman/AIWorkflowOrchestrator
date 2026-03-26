# 実装ガイド: PROVIDER_CONFIGS SSoT 化

## Part 1: 中学生向け説明

### なぜ必要か

AI の設定を 3 冊の名簿に分けて持つと、1 つだけ書き換えて残りを忘れる事故が起きます。今回の変更前は、プロバイダー一覧、モデル名からプロバイダーを推定するルール、有効なプロバイダー ID 一覧が別々に管理されており、新しいプロバイダーやモデルを足すたびに 3 箇所を同時に直す必要がありました。

### 日常生活での例え

たとえば、教室の名簿、保健室の名簿、図書室の名簿がそれぞれ別にあって、転校生が来るたびに全部を書き直すイメージです。1 冊でも書き忘れると「その人はいないこと」になってしまいます。だから、本当の名簿は 1 冊だけにして、ほかはその 1 冊を見に行くほうが安全です。

### 何をしたか

- `provider-registry.ts` に `PROVIDER_CONFIGS` を集約し、プロバイダーとモデルの正本を 1 箇所にした
- `inferProviderId()` はその正本から推定ルールを読む形に変更した
- `LLMProviderIdSchema` は `PROVIDER_IDS` を経由して自動生成するようにした
- その結果、新しいプロバイダー追加時の主変更点は `PROVIDER_CONFIGS` の 1 エントリ追加に集約された

## Part 2: 開発者向け詳細

### 型定義

```ts
export interface ProviderModelEntry {
  readonly id: string;
  readonly name: string;
  readonly contextWindow: number;
  readonly isDefault: boolean;
  readonly description?: string;
}

export interface ProviderConfigEntry {
  readonly id: string;
  readonly name: string;
  readonly modelPrefixes: readonly string[];
  readonly specialMatcher?: (modelId: string) => boolean;
  readonly models: readonly ProviderModelEntry[];
}

export type ProviderIdUnion = (typeof PROVIDER_CONFIGS)[number]["id"];
```

### APIシグネチャ

```ts
export const PROVIDER_IDS = _providerIds as [
  ProviderIdUnion,
  ...ProviderIdUnion[],
];

export const LLMProviderIdSchema = z.enum(PROVIDER_IDS);

export function inferProviderId(modelId: string): ProviderIdUnion | null;
```

### 使用例

```ts
import {
  PROVIDER_CONFIGS,
  PROVIDER_IDS,
  inferProviderId,
  LLMProviderIdSchema,
} from "@repo/shared/types/llm/schemas";

const providerId = inferProviderId("claude-sonnet-4-6");
const parsed = LLMProviderIdSchema.parse(providerId);

console.log(PROVIDER_IDS);
console.log(
  PROVIDER_CONFIGS.find((provider) => provider.id === parsed)?.models,
);
```

```bash
pnpm vitest run packages/shared/src/types/llm/schemas/__tests__/provider-registry.test.ts
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

### 導出チェーン

```text
provider-registry.ts
  PROVIDER_CONFIGS
    -> PROVIDER_IDS
    -> inferProviderId()
provider.ts
  LLMProviderIdSchema = z.enum(PROVIDER_IDS)
index.ts
  re-export PROVIDER_CONFIGS / PROVIDER_IDS / inferProviderId
llm.ts
  import { PROVIDER_CONFIGS, inferProviderId } from @repo/shared
```

### エラーハンドリング

- `PROVIDER_CONFIGS` が空配列になると `PROVIDER_IDS` 導出時に例外を投げ、空の enum 生成を防ぐ
- `inferProviderId()` は unknown model に対して `null` を返し、呼び出し側が `MODEL_NOT_FOUND` に変換する
- `handleGetProviders()` は `readonly models` を `LLMProvider[]` の mutable surface へ橋渡しするために `[...config.models]` を使う

### エッジケース

- OpenRouter のような `"provider/model"` 形式は `specialMatcher` を prefix 判定より先に評価し、`openai/...` が `openai` へ誤判定されるのを防ぐ
- `specialMatcher` は optional なので、`"specialMatcher" in provider` で narrowing してから呼び出す
- `z.enum()` は `[string, ...string[]]` を要求するため、`PROVIDER_IDS` は tuple cast で保持する
- `inferProviderId()` は大文字小文字を区別するため、`GPT-5.4` のような大文字混在は `null` を返す

### 設定と定数

| 項目                  | 役割                      | 備考                                       |
| --------------------- | ------------------------- | ------------------------------------------ |
| `PROVIDER_CONFIGS`    | プロバイダー / モデル正本 | 新規 provider 追加の主変更点               |
| `modelPrefixes`       | prefix ベース推定ルール   | `gpt-`, `claude-`, `gemini-`, `grok-` など |
| `specialMatcher`      | prefix では表せないルール | OpenRouter の `"provider/model"` 形式      |
| `PROVIDER_IDS`        | `z.enum()` 用 tuple       | `PROVIDER_CONFIGS.map((p) => p.id)` 由来   |
| `LLMProviderIdSchema` | runtime validation        | `z.enum(PROVIDER_IDS)`                     |

### 新規プロバイダー追加手順

1. `provider-registry.ts` の `PROVIDER_CONFIGS` に新エントリを追加する
2. `LLMAdapterFactory` に対応アダプターを登録する
3. `provider-registry.test.ts` と既存 schema test を再実行する
4. Phase 12 では system spec の重複テーブルを直接増やさず、`provider-registry.ts` 正本または代表例へ同期する
