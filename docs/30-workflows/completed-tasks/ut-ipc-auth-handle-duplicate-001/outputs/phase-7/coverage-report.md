# Phase 7 カバレッジレポート

## 実行コマンド

```bash
cd apps/desktop
./node_modules/.bin/vitest run \
  src/main/ipc/authHandlers.test.ts \
  src/main/ipc/__tests__/ipc-double-registration.test.ts \
  --coverage \
  --coverage.include=src/main/ipc/authHandlers.ts \
  --coverage.include=src/main/ipc/index.ts \
  --coverage.thresholds.lines=0 \
  --coverage.thresholds.functions=0 \
  --coverage.thresholds.statements=0 \
  --coverage.thresholds.branches=0
```

## 計測結果

| 対象              | Statements | Branches | Functions | Lines  |
| ----------------- | ---------- | -------- | --------- | ------ |
| `authHandlers.ts` | 77.16%     | 73.33%   | 46.15%    | 77.16% |

## 判定

- カバレッジ計測: 完了
- 主要分岐（AUTH 5チャネル登録/回帰）: 検証済み
- 補完優先度設定: `uncovered-items.md` に記録
