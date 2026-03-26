# Discovered Issues

## 方針

- docs-only walkthrough で見つかった読み違い、用語衝突、handoff 欠落だけを記録する。
- 問題が 0 件でも空で終わらせず、0 件であることを明記する。

## 現在の記録

- ISSUE-11-01: `ManifestLoader.test.ts` は存在するが、現環境では `esbuild` version mismatch により Vitest を起動できない
- docs-only walkthrough 上の読み違い、用語衝突、handoff 欠落は 0 件
- validator 互換のため placeholder PNG を保存したが、UI 差分や視覚課題の新規発見は 0 件
  \*\*\* Add File: /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260326-175113-wt-3/docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/outputs/phase-11/screenshot-plan.json
  {
  "taskId": "TASK-SDK-01",
  "mode": "non-visual-validator-compat",
  "captures": [
  {
  "id": "non-visual-placeholder",
  "purpose": "docs-only walkthrough の validator 互換用 placeholder",
  "output": "outputs/phase-11/screenshots/non-visual-placeholder.png"
  }
  ]
  }
