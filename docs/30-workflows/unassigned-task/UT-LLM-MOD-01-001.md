# UT-LLM-MOD-01-001: 保存済みユーザー設定の移行戦略

## メタ情報

| 項目         | 値                                      |
| ------------ | --------------------------------------- |
| タスクID     | UT-LLM-MOD-01-001                       |
| 由来         | TASK-LLM-MOD-01 Phase 3 未解決事項 U-01 |
| 優先度       | 中                                      |
| 発見日       | 2026-03-23                              |
| issue_number | 1520                                    |

## 目的

ユーザーが設定画面で旧モデルID（例: `gpt-4o`）を選択・保存している場合、`PROVIDER_CONFIGS` から削除された後に設定読み込みで不正モデルIDが検出される。Renderer側での検出・フォールバック処理を追加する。

## 対応方針

Renderer側（llmSlice等）のモデル選択ロジックで、保存済みモデルIDが `PROVIDER_CONFIGS` に存在しない場合にデフォルトモデルへフォールバックする処理を追加する。

## 対象ファイル

- `apps/desktop/src/renderer/stores/slices/llmSlice.ts`
- `apps/desktop/src/main/handlers/llm.ts`（`handleSetSelectedConfig` のモデルID存在確認）

## 完了条件

- [ ] 旧モデルIDが保存されている場合、デフォルトモデルにフォールバックする
- [ ] フォールバック時にユーザーに通知する（ガイダンスバナー等）
- [ ] テストで旧モデルID→フォールバックのシナリオをカバー
