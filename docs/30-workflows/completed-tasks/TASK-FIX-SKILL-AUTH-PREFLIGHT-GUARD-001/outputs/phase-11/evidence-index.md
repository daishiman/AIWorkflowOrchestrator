# Phase 11 証跡索引

## ファイル一覧

| 種別               | ファイル                                                                              | 説明                                     |
| ------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------- |
| スクリーンショット | `outputs/phase-11/screenshots/TC-01-agent-view-before-execute-2026-03-04.png`         | AgentView 実行前状態                     |
| スクリーンショット | `outputs/phase-11/screenshots/TC-02-agent-view-auth-preflight-error-2026-03-04.png`   | preflight NG 時の設定誘導                |
| スクリーンショット | `outputs/phase-11/screenshots/TC-03-agent-view-before-execute-recheck-2026-03-04.png` | 2026-03-04 再撮影（`/agent` 視認性確認） |
| 実行ログ           | `outputs/phase-11/screenshot-capture.log`                                             | スクリーンショット取得ログ               |
| 手動結果           | `outputs/phase-11/manual-test-result.md`                                              | テスト記録本体                           |
| デバッグ補助       | `outputs/phase-11/debug-initial-page.png`                                             | 初回遷移失敗時の確認用                   |
| デバッグ補助       | `outputs/phase-11/debug-initial-page.html`                                            | 初回遷移失敗時のDOM記録                  |

## トレーサビリティ

| テストケース | 証跡                                                     |
| ------------ | -------------------------------------------------------- |
| TC-01        | `TC-01-agent-view-before-execute-2026-03-04.png`         |
| TC-02        | `TC-02-agent-view-auth-preflight-error-2026-03-04.png`   |
| TC-03        | `TC-03-agent-view-before-execute-recheck-2026-03-04.png` |
