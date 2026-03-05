# Phase 4 テスト実行計画

## 1. 実行順序

1. Unit: Storeスライス/IPCハンドラ
2. Integration: View + Store + preload mock
3. Manual-precheck: 画面遷移とスクリーンショット用シナリオ

## 2. 実行コマンド

```bash
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/notificationHandlers.test.ts src/main/ipc/__tests__/historySearchHandlers.test.ts src/renderer/store/slices/notificationSlice.test.ts src/renderer/store/slices/historySearchSlice.test.ts src/preload/__tests__/channels.ui-01-store-ipc-architecture.test.ts
```

```bash
cd apps/desktop
pnpm vitest run --coverage --coverage.include='src/main/ipc/notificationHandlers.ts' --coverage.include='src/main/ipc/historySearchHandlers.ts' --coverage.include='src/renderer/store/slices/notificationSlice.ts' --coverage.include='src/renderer/store/slices/historySearchSlice.ts' --coverage.thresholds.lines=0 --coverage.thresholds.functions=0 --coverage.thresholds.branches=0 --coverage.thresholds.statements=0 src/main/ipc/__tests__/notificationHandlers.test.ts src/main/ipc/__tests__/historySearchHandlers.test.ts src/renderer/store/slices/notificationSlice.test.ts src/renderer/store/slices/historySearchSlice.test.ts
```

## 3. 証跡採取

- 自動テスト結果: `outputs/phase-7/coverage-report.md` に実測値転記
- 手動証跡: `outputs/phase-11/screenshots/*.png`
- 実行ログ要約: `outputs/phase-6/test-expansion-summary.md`

## 4. 失敗時切り分け

- IPC失敗: sender検証 → P42入力 → service mock の順に確認。
- Store失敗: beforeEach初期化漏れ、状態リーク、非同期await漏れを確認。
- UI失敗: preload mockの返却型/DOM待機条件を確認。
