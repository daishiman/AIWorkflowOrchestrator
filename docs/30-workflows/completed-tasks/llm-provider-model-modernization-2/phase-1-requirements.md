# Phase 1: 要件定義 - LLM Provider & Model Modernization

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 1                                |
| 機能名 | llm-provider-model-modernization |
| 作成日 | 2026-03-23                       |

## 目的

LLM プロバイダーのモデル定義を最新 API に準拠させるための要件を明文化し、受け入れ基準を定義する。

## P50チェック: 既実装状態の調査

```bash
git log --oneline -20 -- apps/desktop/src/main/handlers/llm.ts
git log --oneline -10 -- apps/desktop/src/main/adapters/llm/
grep -n "PROVIDER_CONFIGS" apps/desktop/src/main/handlers/llm.ts
grep -n "inferProviderId" apps/desktop/src/main/handlers/llm.ts
```

**調査結果**: PROVIDER_CONFIGS にはレガシーモデル（GPT-4o, Claude 3.x, Gemini 1.5, Grok Beta）がハードコードされており、最新プロバイダー API と乖離している。

## 機能要件 (FR)

### FR-01: PROVIDER_CONFIGS モデル定義の最新化

| プロバイダー | 削除するモデル                                               | 追加するモデル                                                                                                    | 優先度 |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------ |
| OpenAI       | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`                       | `gpt-5.4` (default, 1.05M ctx), `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.4-pro`, `o3`, `o4-mini`                    | 必須   |
| Anthropic    | `claude-3-5-sonnet-*`, `claude-3-opus-*`, `claude-3-haiku-*` | `claude-sonnet-4-6` (default), `claude-opus-4-6`, `claude-haiku-4-5`（変更なし）                                  | 必須   |
| Google       | `gemini-1.5-pro`, `gemini-1.5-flash`                         | `gemini-3-flash-preview` (default, 1M ctx), `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite-preview`             | 必須   |
| xAI          | `grok-beta`                                                  | `grok-3-mini` (速度重視), `grok-4-1-fast-non-reasoning` (default, バランス), `grok-4-1-fast-reasoning` (精度重視) | 必須   |

> **注記**: Gemini 2.5 は 2026年6月17日廃止予定のため Gemini 3系に移行。GPT-4.1 は ChatGPT から退役済みのため gpt-5.4 系を採用。

### FR-02: inferProviderId パターン追加

`o3`/`o4` プレフィックスを OpenAI にマッピングする条件分岐を追加する。また `gpt-5` プレフィックスも OpenAI にマッピングされることを確認する（既存の `gpt-` パターンで対応可能か検証すること）。

### FR-03: AnthropicAdapter ヘルスチェックモデル更新

ヘルスチェックのモデル ID を `claude-3-haiku-20240307` から `claude-haiku-4-5` に更新する。

### FR-04: GoogleAdapter system_instruction 対応

systemPrompt を `user` ロール埋め込みワークアラウンドから `system_instruction` フィールドに移行する。

### FR-05: テスト期待値更新

全テストファイルのモデル ID 期待値を新定義に合致させ、新規テストケース（`o3`/`o4` 推論、`system_instruction`）を追加する。

### FR-06: 共有型スキーマ拡張（オプション）

`PROVIDER_CONFIGS` の型定義に `description?: string` を追加し、`LLMModelSchema` との整合性を確保する。

## 非機能要件 (NFR)

### NFR-01: 後方互換性

- ユーザーが保存済みの設定（選択済みプロバイダー/モデル）が無効になった場合、デフォルトモデルにフォールバックすること
- OpenRouter プロバイダーの設定は変更しないこと

### NFR-02: 型安全性

- TypeScript コンパイルが全モジュールで PASS すること
- `PROVIDER_CONFIGS` の型と `LLMModelSchema` の整合性が維持されること

### NFR-03: テスト網羅性

- 変更対象の全ファイルに対してテストが PASS すること
- 新規追加モデル（o3, o4-mini 等）に対するテストケースが存在すること

## 受け入れ基準 (AC)

- AC-01: `handleGetProviders` が返すプロバイダーリストに最新モデルのみが含まれる
- AC-02: `inferProviderId("o3")` が `"openai"` を返す
- AC-03: `inferProviderId("o4-mini")` が `"openai"` を返す
- AC-04: `inferProviderId("gpt-5.4")` が `"openai"` を返す（`gpt-` プレフィックスで対応可能か確認）
- AC-05: AnthropicAdapter のヘルスチェックが `claude-haiku-4-5` を使用する
- AC-06: GoogleAdapter が systemPrompt を `system_instruction` フィールドで送信する（Gemini 3 API 対応）
- AC-07: GoogleAdapter が systemPrompt なしの場合に `system_instruction` を省略する
- AC-08: OpenAI プロバイダーのデフォルトモデルが `gpt-5.4` である
- AC-09: Google プロバイダーのデフォルトモデルが `gemini-3-flash-preview` である
- AC-10: xAI プロバイダーのデフォルトモデルが `grok-4-1-fast-non-reasoning` である（バランス重視）
- AC-11: `pnpm typecheck` が PASS する
- AC-12: `pnpm vitest run` で全テストが PASS する

## スコープ

### 含む

- `PROVIDER_CONFIGS` のモデル定義更新
- `inferProviderId` のパターン追加
- `AnthropicAdapter` のヘルスチェックモデル更新
- `GoogleAdapter` の `system_instruction` 対応
- テスト期待値更新
- 共有型スキーマの `description` フィールド追加検討

### 含まない

- OpenRouter プロバイダーの変更
- Renderer 側 UI の変更（モデル選択 UI は既存のまま動作する）
- o-Series の `temperature` / `max_completion_tokens` 特殊対応（後続タスク候補）
- Anthropic `effort` パラメータ対応（後続タスク候補）
- Google APIバージョンの `v1beta` 移行の最終判断（Task03 内で調査・判断）

## 関連ファイル一覧

| ファイル                                                 | 責務                              | 修正要否 |
| -------------------------------------------------------- | --------------------------------- | -------- |
| `apps/desktop/src/main/handlers/llm.ts`                  | PROVIDER_CONFIGS, inferProviderId | 必須     |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` | ヘルスチェックモデル              | 必須     |
| `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`    | system_instruction 対応           | 必須     |
| `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`    | 確認のみ                          | 確認     |
| `apps/desktop/src/main/adapters/llm/xAIAdapter.ts`       | 確認のみ                          | 確認     |
| `packages/shared/src/types/llm/schemas/provider.ts`      | LLMModelSchema                    | 検討     |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`   | テスト期待値                      | 必須     |
| `apps/desktop/src/main/adapters/llm/__tests__/*.test.ts` | Adapter テスト                    | 必須     |

## 参照資料

| 資料名             | パス                               | 内容                       |
| ------------------ | ---------------------------------- | -------------------------- |
| OpenAI 調査        | `research/openai-models.md`        | OpenAI 最新モデル・API仕様 |
| Anthropic 調査     | `research/anthropic-models.md`     | Anthropic 最新モデル・API  |
| Google 調査        | `research/google-models.md`        | Gemini 最新モデル・API     |
| xAI 調査           | `research/xai-models.md`           | xAI 最新モデル・API        |
| アーキテクチャ概要 | `.claude/rules/01-architecture.md` | レイヤー依存方向           |
| コード品質ルール   | `.claude/rules/02-code-quality.md` | テスト・型安全基準         |

## 成果物

| 成果物     | パス                                    | 説明         |
| ---------- | --------------------------------------- | ------------ |
| 要件定義書 | `phase-1-requirements.md`（本ファイル） | 要件・AC定義 |

## 完了条件

- [x] 全機能要件が明文化されている
- [x] 受け入れ基準が検証可能な形式で定義されている
- [x] スコープの含む/含まないが明確に区分されている
- [x] 関連ファイル一覧が特定されている

## 次のPhase

Phase 2: 設計
