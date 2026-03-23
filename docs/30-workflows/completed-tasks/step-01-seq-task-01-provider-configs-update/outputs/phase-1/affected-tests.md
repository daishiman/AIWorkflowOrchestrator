# Phase 1 影響テスト一覧 — TASK-LLM-MOD-01

## 影響を受けるテスト

### apps/desktop/src/main/handlers/**tests**/llm.test.ts

| テスト箇所                              | 参照する旧モデルID | 影響度 | 対応方針                                           |
| --------------------------------------- | ------------------ | ------ | -------------------------------------------------- |
| L89: `handleSetSelectedConfig` のテスト | `gpt-4o` (modelId) | 低     | テスト内のフィクスチャ値。機能テストのため影響なし |
| L252: `validRequest` 定数               | `gpt-4o` (modelId) | 低     | テスト内のフィクスチャ値。機能テストのため影響なし |
| L264: mockAdapter.sendChat              | `gpt-4o` (model)   | 低     | テスト内のフィクスチャ値。機能テストのため影響なし |
| L364: stream validRequest               | `gpt-4o` (modelId) | 低     | テスト内のフィクスチャ値。機能テストのため影響なし |

## 判定

既存テスト内の `gpt-4o` 参照は全てテストフィクスチャ（テストデータ）として使用されており、`PROVIDER_CONFIGS` のモデル一覧を検証するテストではない。`handleSendChat` や `handleStreamChat` は `providerId` が明示的に指定されている（`providerId: "openai"`）ため、`inferProviderId` は呼ばれず、モデルID の値が `PROVIDER_CONFIGS` に存在するかの検証は行わない。

**結論**: 既存テストは Phase 5 の実装変更後も全て PASS する（テストフィクスチャの旧モデルID更新は Task04 のスコープ）。
