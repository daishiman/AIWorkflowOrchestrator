# Phase 7 カバレッジレポート

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage --coverage.provider=v8 \
  --coverage.reportsDirectory=coverage-task-056c \
  --coverage.include=src/renderer/store/slices/notificationSlice.ts \
  --coverage.include=src/renderer/store/slices/historySearchSlice.ts \
  --coverage.include=src/main/ipc/notificationHandlers.ts \
  --coverage.include=src/main/ipc/historySearchHandlers.ts \
  --coverage.include=src/preload/channels.ts \
  src/renderer/store/slices/notificationSlice.test.ts \
  src/renderer/store/slices/historySearchSlice.test.ts \
  src/main/ipc/notificationHandlers.test.ts \
  src/main/ipc/historySearchHandlers.test.ts \
  src/preload/channels.test.ts
```

## 集計（対象スコープ）

| 指標       | 値     |
| ---------- | ------ |
| Statements | 87.45% |
| Branches   | 65.11% |
| Functions  | 80.39% |
| Lines      | 87.45% |

## ファイル別抜粋

| ファイル                   | Stmts  | Branch | Funcs  |
| -------------------------- | ------ | ------ | ------ |
| `notificationSlice.ts`     | 75.75% | 83.33% | 64.28% |
| `historySearchSlice.ts`    | 93.93% | 100%   | 80%    |
| `notificationHandlers.ts`  | 63.59% | 60.86% | 80%    |
| `historySearchHandlers.ts` | 87.57% | 53.06% | 100%   |
| `channels.ts`              | 100%   | 100%   | 100%   |
