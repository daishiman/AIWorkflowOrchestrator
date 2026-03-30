# Implementation Guide

## Part 1: 中学生向けの説明

なぜこの task が必要かというと、プログラムの中で使うモデル名の一覧だけ先に新しくなって、テストの問題文や答えが古いままだと、あとから見た人が「どれが今の正解なのか」を見失うからです。

たとえば、学校の時間割が新しくなったのに、壁に貼ってある確認表だけ去年のままだとします。授業そのものは正しく進んでいても、確認表を見た人は古い教室へ行ってしまいます。今回の task は、その確認表が今の時間割に追いついているかを見直し、足りない記録をそろえて迷子を防ぐ作業です。

この wave では新しい機能を足したのではなく、すでに入っていた OpenAI / Anthropic / Google 関連のテスト証跡と完了記録を current facts に合わせて並べ直しました。画面変更はないのでスクリーンショット撮影は不要でしたが、代わりに NON_VISUAL の確認記録を残しています。

## Part 2: 技術詳細

### 目的

- `provider-registry.ts` を SSoT とする current facts を task workflow 側の close-out に同期する
- handler / adapter test が何を保証しているかを追跡可能にする
- Phase 11/12 の成果物台帳と unassigned-task / issue 導線を current root へそろえる

### 関連する型とインターフェース

```ts
type ProviderIdUnion = "openai" | "anthropic" | "google" | "xai" | "openrouter";

interface LLMModel {
  id: string;
  name: string;
  contextWindow?: number;
  isAvailable?: boolean;
}

interface LLMProvider {
  id: ProviderIdUnion;
  name: string;
  models: LLMModel[];
}
```

### 参照実装

- provider catalog: `packages/shared/src/types/llm/schemas/provider-registry.ts`
- provider schema: `packages/shared/src/types/llm/schemas/provider.ts`
- provider handler: `apps/desktop/src/main/handlers/llm.ts`
- Google adapter: `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`

### API シグネチャ

```ts
export function inferProviderId(modelId: string): ProviderIdUnion | null;

export async function handleGetProviders(): Promise<LLMProvider[]>;
```

### 使用例

```ts
const providerId = inferProviderId("o4-mini");
// => "openai"

const providers = await handleGetProviders();
const openai = providers.find((provider) => provider.id === "openai");
const modelIds = openai?.models.map((model) => model.id) ?? [];
// modelIds includes: gpt-5.4, gpt-5.4-mini, gpt-5.4-nano, gpt-5.4-pro, o3, o4-mini
```

### 既存証跡

- `apps/desktop/src/main/handlers/__tests__/llm.test.ts`: `o3` / `o4-mini` の OpenAI 解決を確認
- `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts`: `claude-haiku-4-5` health check を確認
- `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`: `system_instruction` 生成を確認

### 設定値と定数

| 項目                         | 値 / 役割                                                                 |
| ---------------------------- | ------------------------------------------------------------------------- |
| OpenAI current models        | `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.4-pro`, `o3`, `o4-mini` |
| Anthropic health check model | `claude-haiku-4-5`                                                        |
| Google request field         | `system_instruction`                                                      |
| Phase 11 mode                | `NON_VISUAL`                                                              |

### エラーハンドリングとエッジケース

- 空の `systemPrompt` は `system_instruction` を生成しない
- `inferProviderId()` は unknown model に対して `null` を返す
- current environment では `pnpm vitest run` が `esbuild binary mismatch` で再実行不能だったため、historical acceptance evidence と grep を併用した

### スクリーンショット参照

- UI 変更なしのため Phase 11 は `outputs/phase-11/screenshot-plan.json` に `non_visual` を記録
- 手動確認結果は `outputs/phase-11/manual-test-result.md` を参照
