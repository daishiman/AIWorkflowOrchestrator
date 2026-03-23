# Phase 5: 実装（TDD: Green）— PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 5                       |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | Phase 4（テスト作成）   |

## 目的

Phase 4 で追加した失敗テスト（T-01〜T-06）を全て通す実装を行う（TDD: Green フェーズ）。`apps/desktop/src/main/handlers/llm.ts` の `PROVIDER_CONFIGS` 型定義とデータ定義を変更する。`inferProviderId` は変更しない。

## 実行タスク

### Task 5-1: 対象ファイルの読み込み確認

実装前に `apps/desktop/src/main/handlers/llm.ts` の現行の内容を確認し、変更箇所を特定する：

- L33〜L41: `PROVIDER_CONFIGS` の型定義（`description?: string` 追加位置）
- L43〜L61: OpenAI モデル定義（差し替え位置）
- L62〜L85: Anthropic モデル定義（差し替え位置）
- L86〜L103: Google モデル定義（差し替え位置）
- L104〜L115: xAI モデル定義（差し替え位置）
- L116〜L146: OpenRouter モデル定義（変更しない）

### Task 5-2: 型定義の変更

`PROVIDER_CONFIGS` の型定義に `description?: string` を追加する。

変更箇所: L33〜L41（`models` 配列要素の型定義部分）

```typescript
// 変更前
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    isDefault: boolean;
  }>;
}> = [

// 変更後
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
}> = [
```

### Task 5-3: OpenAI モデル定義の差し替え

`apps/desktop/src/main/handlers/llm.ts` の OpenAI エントリ（`{ id: "openai", ...}` ブロック）を以下に差し替える：

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
},
```

### Task 5-4: Anthropic モデル定義の差し替え

`apps/desktop/src/main/handlers/llm.ts` の Anthropic エントリを以下に差し替える：

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
},
```

### Task 5-5: Google モデル定義の差し替え

`apps/desktop/src/main/handlers/llm.ts` の Google エントリを以下に差し替える：

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
},
```

### Task 5-6: xAI モデル定義の差し替え

`apps/desktop/src/main/handlers/llm.ts` の xAI エントリを以下に差し替える：

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
},
```

### Task 5-7: OpenRouter モデル定義（変更なし）

OpenRouter の `PROVIDER_CONFIGS` エントリは変更しない。既存のまま維持する。

### Task 5-8: `inferProviderId` 確認（変更なし）

`inferProviderId` 関数は変更しない。現行コード（L453〜L466）に `o3`/`o4` パターンが既に含まれているため、追加実装は不要。

### Task 5-9: Green フェーズの確認

実装後に以下を実行し、Phase 4 で追加したテストが全て通ることを確認する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
```

期待する結果:

- `PROVIDER_CONFIGS - モデル定義更新検証` の全テスト（T-01〜T-06）: PASS
- `inferProviderId - 新パターン検証`（T-07〜T-08）: PASS
- 既存テスト全て: PASS

### Task 5-10: TypeScript コンパイル確認

```bash
cd apps/desktop && pnpm typecheck
```

期待する結果: エラー 0 件

## 参照資料

| 資料名           | パス                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計     | `docs/30-workflows/llm-provider-model-modernization/tasks/step-01-seq-task-01-provider-configs-update/phase-2-design.md`        |
| Phase 4 テスト   | `docs/30-workflows/llm-provider-model-modernization/tasks/step-01-seq-task-01-provider-configs-update/phase-4-test-creation.md` |
| 実装対象ファイル | `apps/desktop/src/main/handlers/llm.ts`                                                                                         |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                                                              |

## 成果物

| 成果物               | パス                                    | 形式       |
| -------------------- | --------------------------------------- | ---------- |
| 更新済み実装ファイル | `apps/desktop/src/main/handlers/llm.ts` | TypeScript |

## 完了条件

- [ ] 実装前に `apps/desktop/src/main/handlers/llm.ts` を Read で確認した
- [ ] `PROVIDER_CONFIGS` 型定義に `description?: string` を追加した
- [ ] OpenAI モデル定義を6モデルに差し替えた（`gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.4-pro`, `o3`, `o4-mini`）
- [ ] Anthropic モデル定義を3モデルに差し替えた（`claude-haiku-4-5`, `claude-sonnet-4-6`, `claude-opus-4-6`）
- [ ] Google モデル定義を3モデルに差し替えた（`gemini-3.1-flash-lite-preview`, `gemini-3-flash-preview`, `gemini-3.1-pro-preview`）
- [ ] xAI モデル定義を3モデルに差し替えた（`grok-3-mini`, `grok-4-1-fast-non-reasoning`, `grok-4-1-fast-reasoning`）
- [ ] OpenRouter モデル定義が変更されていない
- [ ] `inferProviderId` が変更されていない
- [ ] Phase 4 追加テスト（T-01〜T-06）が全て PASS した
- [ ] `pnpm typecheck` がエラー 0 件で完了した

## 統合テスト連携

Phase 5 で実装完了後、`handleGetProviders()` の全プロバイダーを対象にした統合確認を実施する。テスト実行コマンド:

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts --reporter=verbose
```

## 次の Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
