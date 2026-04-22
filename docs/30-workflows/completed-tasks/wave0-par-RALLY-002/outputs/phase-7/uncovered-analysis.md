# Uncovered Analysis

- 未カバー項目: Electron 実機手動確認、対象 vitest 実測
- 既にカバーした項目: restore/snapshot 優先、requestId 切替、undo 再送信 payload、stale fallback 防止、再マウント初期化
- 理由: worktree 環境の esbuild binary mismatch、Electron 実機未起動
- 推奨: 環境修復後に `ConversationalInterview.restoredPendingRequest.test.tsx` を最優先で再実行する
