# Phase 2: 設計 — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 2                       |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | Phase 1（要件定義）     |

## 目的

Phase 1 で確定した要件（R-01〜R-07）を満たすための具体的な変更設計を定義する。型定義の変更箇所、データ定数の差し替え内容、`inferProviderId` のロジック変更を設計書として確定する。

## 実行タスク

### Task 2-1: 型定義設計

**変更箇所**: `apps/desktop/src/main/handlers/llm.ts` L33〜L41

現行の型定義:

```typescript
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    isDefault: boolean;
  }>;
}> = [...]
```

変更後の型定義:

```typescript
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    isDefault: boolean;
    description?: string;
  }>;
}> = [...]
```

変更点: `models` 配列要素に `description?: string` を追加する。他のフィールドは変更しない。

### Task 2-2: PROVIDER_CONFIGS データ設計

#### OpenAI（差し替え）

```typescript
{
  id: "openai",
  name: "OpenAI",
  models: [
    {
      id: "gpt-5.4",
      name: "GPT-5.4",
      contextWindow: 1050000,
      isDefault: true,
      description: "OpenAI最新フラッグシップモデル。コンテキストウィンドウ1.05M tokens",
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
}
```

#### Anthropic（差し替え）

```typescript
{
  id: "anthropic",
  name: "Anthropic",
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
}
```

#### Google（差し替え）

速度重視/バランス/精度重視の3モデル構成:

```typescript
{
  id: "google",
  name: "Google",
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
      description: "Google高速バランスモデル。1Mトークンコンテキスト対応（Gemini 2.5は2026年6月廃止予定）",
    },
    {
      id: "gemini-3.1-pro-preview",
      name: "Gemini 3.1 Pro",
      contextWindow: 1048576,
      isDefault: false,
      description: "Google最高性能モデル。複雑な推論・長文対応（精度重視）",
    },
  ],
}
```

#### xAI（差し替え）

速度重視/バランス/精度重視の3モデル構成:

```typescript
{
  id: "xai",
  name: "xAI",
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
      description: "xAI最新高速モデル（非推論）。2Mトークンコンテキスト対応（バランス）",
    },
    {
      id: "grok-4-1-fast-reasoning",
      name: "Grok 4.1 Fast Reasoning",
      contextWindow: 2097152,
      isDefault: false,
      description: "xAI最新高速推論モデル。2Mトークンコンテキスト対応（精度重視）",
    },
  ],
}
```

#### OpenRouter（変更なし）

既存の定義をそのまま維持する。

### Task 2-3: `inferProviderId` 設計

**現行実装**（`apps/desktop/src/main/handlers/llm.ts` L453〜L466）:

```typescript
function inferProviderId(modelId: string): LLMProviderId | null {
  if (
    modelId.startsWith("gpt-") ||
    modelId.startsWith("o3") ||
    modelId.startsWith("o4")
  )
    return "openai";
  if (modelId.startsWith("claude-")) return "anthropic";
  if (modelId.startsWith("gemini-")) return "google";
  if (modelId.startsWith("grok-")) return "xai";
  if (modelId.includes("/")) return "openrouter";
  return null;
}
```

**設計判断**: 現行コードはすでに `o3`/`o4` プレフィックスを含んでいる。要件 R-07 は既存実装で満たされている。

**変更内容**: `inferProviderId` への変更は不要。現行のまま維持する。

**理由**: 新モデル `o3`, `o4-mini` はそれぞれ `o3`/`o4` プレフィックスを持つため、既存のパターンマッチで正しく `openai` に解決される。

### Task 2-4: 変更ファイル一覧

| ファイルパス                            | 変更種別 | 変更内容                                   |
| --------------------------------------- | -------- | ------------------------------------------ |
| `apps/desktop/src/main/handlers/llm.ts` | 更新     | PROVIDER_CONFIGS の型定義 + データ差し替え |

変更しないファイル（本タスクのスコープ外）:

- `apps/desktop/src/main/handlers/__tests__/llm.test.ts`（Task04 で対応）
- `packages/shared/src/types/llm/schemas.ts`
- `apps/desktop/src/preload/types.ts`

### Task 2-5: 差し替え前後のモデル数比較

| プロバイダー | 現行モデル数 | 変更後モデル数 | 差分 | 構成方針                              |
| ------------ | ------------ | -------------- | ---- | ------------------------------------- |
| OpenAI       | 3            | 6              | +3   | gpt-5.4系4モデル + o3/o4-mini 2モデル |
| Anthropic    | 3            | 3              | 0    | 速度重視/バランス/精度重視            |
| Google       | 2            | 3              | +1   | 速度重視/バランス/精度重視            |
| xAI          | 1            | 3              | +2   | 速度重視/バランス/精度重視            |
| OpenRouter   | 4            | 4              | 0    | 変更なし                              |
| 合計         | 13           | 19             | +6   |                                       |

### Task 2-6: IPC レスポンス形式への影響確認

`handleGetProviders()` は `LLMProvider[]` 型を返す。`LLMProvider` 型の定義（`packages/shared/src/types/llm/schemas.ts`）に `description` フィールドが含まれていない場合、Renderer 側へ送信される際に `description` は structured clone の過程で保持される（JavaScript オブジェクトとして扱われるため）。

`LLMProvider` 型定義に `description` を追加するかどうかは設計判断事項:

- **本タスクのスコープ**: `llm.ts` 内のローカル型定義に `description` を追加するのみ
- `LLMProvider` 共有型への追加は別タスクとして分離する（スコープ外）

## 参照資料

| 資料名           | パス                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-1-requirements.md` |
| 現行実装         | `apps/desktop/src/main/handlers/llm.ts`                                                 |
| 共有型定義       | `packages/shared/src/types/llm/schemas.ts`                                              |

## 成果物

| 成果物               | パス                                                                                      | 形式     |
| -------------------- | ----------------------------------------------------------------------------------------- | -------- |
| 設計書（本ファイル） | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-2/design.md` | Markdown |

## 完了条件

- [ ] 型定義の変更箇所（`description?: string` 追加位置）を特定した
- [ ] 全 4 プロバイダーの新モデルリストをコード形式で定義した（id, name, contextWindow, isDefault, description）
- [ ] `inferProviderId` が変更不要であることを現行コードで確認し、根拠を記載した
- [ ] 変更対象ファイルが `apps/desktop/src/main/handlers/llm.ts` 1ファイルのみであることを確認した
- [ ] OpenRouter が変更スコープ外であることを明記した

## 統合テスト連携

Phase 2 では統合テストは実施しない。Phase 4 でテストを設計する際に、本 Phase のデータ設計（Task 2-2）をテストの期待値として使用する。

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                       | 仕様参照先                                   |
| -------------- | ------------------------------ | -------------------------------------------- |
| アーキテクチャ | Main Process のデータ定義変更  | `aiworkflow-requirements: architecture-*.md` |
| API設計        | IPC レスポンス形式への影響確認 | `aiworkflow-requirements: api-*.md`          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次の Phase

Phase 3: 設計レビュー（`phase-3-design-review.md`）
