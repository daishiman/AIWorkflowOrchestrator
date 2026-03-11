# Phase 7 カバレッジレポート

## 実行コマンド

```bash
cd apps/desktop
CI=true VITEST_SHARDED_COVERAGE=true pnpm exec vitest run --coverage \
  src/renderer/views/WorkspaceView/WorkspaceView.test.tsx \
  src/renderer/views/WorkspaceView/hooks/useWorkspaceMentionQuery.test.ts \
  src/renderer/views/WorkspaceView/workspaceFileSelection.test.ts
```

## task-scope（WorkspaceView配下）

| 対象                                     | Stmts  | Branch | Funcs  | Lines  |
| ---------------------------------------- | ------ | ------ | ------ | ------ |
| `src/renderer/views/WorkspaceView`       | 83.80% | 77.44% | 65.21% | 83.80% |
| `src/renderer/views/WorkspaceView/hooks` | 73.29% | 72.47% | 73.68% | 73.29% |

## 判定

- 04B 追加対象の主要パス（UI/mention/util）は 80% 前後を確保
- 全体プロジェクト閾値は本コマンドの目的外（task-scope検証）
