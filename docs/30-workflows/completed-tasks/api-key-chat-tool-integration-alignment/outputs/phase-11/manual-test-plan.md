# Phase 11 手動テスト計画

## 対象

- Settings 画面の APIキー管理導線
- AuthKey 表示導線（`saved` / `env-fallback` / `not-set`）

## 実行環境

- コマンド: `node apps/desktop/scripts/capture-task-fix-apikey-chat-tool-integration-phase11.mjs`
- Harness: `/phase11-auth-mode.html`
- 出力先: `outputs/phase-11/screenshots/`

## テストケース

| テストケース | 観点         | 手順                              | 期待結果                                                |
| ------------ | ------------ | --------------------------------- | ------------------------------------------------------- |
| TC-11-01     | 初期表示     | api-keyモードで設定画面を表示     | ApiKeysSection と AuthKeySection が同一画面で確認できる |
| TC-11-02     | 保存操作     | Anthropic APIキー入力 → 保存      | 保存成功フィードバックが表示される                      |
| TC-11-03     | fallback表示 | AuthKey状態を env fallback に切替 | 「環境変数で設定済み」表示が出る                        |

## 画面カバレッジマトリクス

| テストケース | 画面状態     | テーマ | 証跡                                                       | 優先度 |
| ------------ | ------------ | ------ | ---------------------------------------------------------- | ------ |
| TC-11-01     | 初期表示     | Dark   | `screenshots/TC-11-01-settings-apikey-authkey-initial.png` | A      |
| TC-11-02     | 保存成功     | Dark   | `screenshots/TC-11-02-settings-apikey-save-success.png`    | A      |
| TC-11-03     | env fallback | Dark   | `screenshots/TC-11-03-settings-authkey-env-fallback.png`   | A      |
