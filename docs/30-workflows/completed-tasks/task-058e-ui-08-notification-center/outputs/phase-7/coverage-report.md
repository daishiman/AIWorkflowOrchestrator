# Phase 7 カバレッジレポート

## 実行コマンド

```bash
PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/pnpm exec vitest run --coverage \
  --coverage.include=src/renderer/components/organisms/NotificationCenter/index.tsx \
  --coverage.include=src/renderer/store/slices/notificationSlice.ts \
  --coverage.include=src/main/ipc/notificationHandlers.ts \
  --coverage.include=src/preload/channels.ts \
  src/renderer/components/organisms/NotificationCenter/NotificationCenter.test.tsx \
  src/renderer/store/slices/notificationSlice.test.ts \
  src/main/ipc/notificationHandlers.test.ts \
  src/main/ipc/__tests__/notificationHandlers.test.ts \
  src/preload/channels.test.ts \
  src/preload/__tests__/channels.ui-01-store-ipc-architecture.test.ts
```

## 集計結果

| 対象                           | Stmts  | Branch | Funcs  | Lines  | 判定 |
| ------------------------------ | ------ | ------ | ------ | ------ | ---- |
| All files (include限定)        | 92.94  | 81.77  | 94.44  | 92.94  | PASS |
| `NotificationCenter/index.tsx` | 89.69  | 79.41  | 90.47  | 89.69  | PASS |
| `notificationSlice.ts`         | 98.61  | 92.68  | 100.00 | 98.61  | PASS |
| `notificationHandlers.ts`      | 83.16  | 78.33  | 93.75  | 83.16  | PASS |
| `preload/channels.ts`          | 100.00 | 100.00 | 100.00 | 100.00 | PASS |

## Gate

| 指標     | 下限 | 結果 |
| -------- | ---- | ---- |
| Line     | 80   | PASS |
| Branch   | 60   | PASS |
| Function | 80   | PASS |
