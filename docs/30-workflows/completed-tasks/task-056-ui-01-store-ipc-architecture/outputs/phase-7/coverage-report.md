# Phase 7 成果物: カバレッジレポート

## 計測コマンド

- `pnpm --filter @repo/desktop exec vitest run --coverage --coverage.include='src/main/ipc/notificationHandlers.ts' --coverage.include='src/main/ipc/historySearchHandlers.ts' --coverage.include='src/main/ipc/sanitizeErrorMessage.ts' --coverage.include='src/preload/channels.ts' --coverage.include='src/renderer/store/slices/notificationSlice.ts' --coverage.include='src/renderer/store/slices/historySearchSlice.ts' --coverage.thresholds.lines=0 --coverage.thresholds.functions=0 --coverage.thresholds.statements=0 --coverage.thresholds.branches=0 src/main/ipc/__tests__/notificationHandlers.test.ts src/main/ipc/__tests__/historySearchHandlers.test.ts src/preload/__tests__/channels.ui-01-store-ipc-architecture.test.ts src/renderer/store/slices/notificationSlice.test.ts src/renderer/store/slices/historySearchSlice.test.ts`

## 結果（変更対象のみ）

| ファイル群                                    | Statements | Branches | Functions | Lines   |
| --------------------------------------------- | ---------- | -------- | --------- | ------- |
| All files（include対象）                      | 79.50%     | 74.74%   | 80.48%    | 79.50%  |
| `main/ipc/historySearchHandlers.ts`           | 64.74%     | 63.33%   | 77.77%    | 64.74%  |
| `main/ipc/notificationHandlers.ts`            | 38.26%     | 68.75%   | 50.00%    | 38.26%  |
| `main/ipc/sanitizeErrorMessage.ts`            | 30.76%     | 100.00%  | 0.00%     | 30.76%  |
| `preload/channels.ts`                         | 100.00%    | 100.00%  | 100.00%   | 100.00% |
| `renderer/store/slices/historySearchSlice.ts` | 83.76%     | 75.00%   | 100.00%   | 83.76%  |
| `renderer/store/slices/notificationSlice.ts`  | 97.29%     | 89.65%   | 100.00%   | 97.29%  |

## 判定

- 変更対象のうち Store/Preload は高カバレッジを確保
- IPCハンドラの異常系・例外系に残ギャップあり（Phase 7の許容範囲として記録）
