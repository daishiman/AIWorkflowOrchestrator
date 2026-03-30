# Phase 5: 実装 — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase番号 | 5                     |
| 機能名    | schema-extension      |
| タスクID  | TASK-LLM-MOD-05       |
| 作成日    | 2026-03-23            |
| 依存Phase | Phase 4（テスト作成） |

## 変更内容

### ファイル: `packages/shared/src/types/llm/schemas/provider-registry.ts`

OpenRouter の4モデルに `description` を追加。

| モデルID                           | description                                                     |
| ---------------------------------- | --------------------------------------------------------------- |
| openai/gpt-4o                      | OpenRouter経由のGPT-4o。APIキー統合で複数プロバイダーを一元管理 |
| anthropic/claude-3.5-sonnet        | OpenRouter経由のClaude 3.5 Sonnet。高性能バランスモデル         |
| google/gemini-pro-1.5              | OpenRouter経由のGemini 1.5 Pro。2Mトークンコンテキスト対応      |
| meta-llama/llama-3.1-405b-instruct | OpenRouter経由のLlama 3.1 405B。オープンソース最大規模モデル    |

## 変更不要だった部分

- `LLMModelSchema` (provider.ts:30): `description: z.string().optional()` 定義済み
- `ProviderModelEntry` (provider-registry.ts:22): `description?: string` 定義済み
- `handleGetProviders()` (llm.ts:90-106): `models: [...config.models]` で自動伝搬
- OpenAI/Anthropic/Google/xAI のモデル: 全て description 設定済み

## Green 確認

- TS-A-01~A-04: 全 PASS
- TS-B-01, TS-B-02: 全 PASS
- 既存テスト59件: 全 PASS（1件 skip は既存）

## 次のPhase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
