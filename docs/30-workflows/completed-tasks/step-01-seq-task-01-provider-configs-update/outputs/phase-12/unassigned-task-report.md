# 未タスク検出レポート — TASK-LLM-MOD-01

## 検出日: 2026-03-23

## 検出件数: 3件

### UT-LLM-MOD-01-001: 保存済みユーザー設定の移行戦略

- **由来**: Phase 3 未解決事項 U-01
- **内容**: ユーザーが設定画面で旧モデルID（例: `gpt-4o`）を選択・保存している場合、`PROVIDER_CONFIGS` から削除された後に設定読み込みで不正モデルIDが検出される。Renderer側での検出・フォールバック処理が必要
- **優先度**: 中
- **対応方針**: Renderer側（llmSlice等）のモデル選択ロジックで、保存済みモデルIDが `PROVIDER_CONFIGS` に存在しない場合にデフォルトモデルへフォールバックする処理を追加する

### UT-LLM-MOD-01-002: LLMProvider 共有型への description フィールド追加

- **由来**: Phase 3 未解決事項 U-02
- **内容**: `packages/shared/src/types/llm/schemas.ts` の `LLMProvider` 型に `description?: string` を追加し、Renderer側でツールチップ等の表示に利用可能にする
- **優先度**: 低
- **対応方針**: `LLMProvider` の `models` 配列要素型に `description?: string` を追加。Preload型定義も同時更新（P32対策）

### UT-LLM-MOD-01-003: 既存テストのモデルIDフィクスチャ更新

- **由来**: Phase 1 影響テスト調査
- **内容**: 既存テスト内の `validRequest.modelId: "gpt-4o"` 等のフィクスチャ値を新モデルIDに更新する（機能影響はないが可読性・保守性の向上のため）
- **優先度**: 低
- **対応方針**: Task04（既存テスト期待値更新）のスコープで対応
