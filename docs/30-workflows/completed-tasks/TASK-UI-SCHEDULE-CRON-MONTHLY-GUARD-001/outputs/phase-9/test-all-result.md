# 全テスト結果 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 実行コマンド

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

## 結果

- Test Files: **1 passed**
- Tests: **22 passed (22)**
- 失敗: 0 件

## AC 別テスト確認

| AC   | TC                                       | 結果            |
| ---- | ---------------------------------------- | --------------- |
| AC-1 | TC-11 (`dayOfMonth=0` → `""`)            | ✅ Pass         |
| AC-2 | TC-12 (`dayOfMonth=32` → `""`)           | ✅ Pass         |
| AC-3 | TC-13 (`dayOfMonth=-1` → `""`)           | ✅ Pass         |
| AC-4 | TC-14 (`dayOfMonth=1` → `"0 9 1 * *"`)   | ✅ Pass         |
| AC-5 | TC-15 (`dayOfMonth=31` → `"0 9 31 * *"`) | ✅ Pass         |
| AC-6 | 既存テスト全件                           | ✅ Pass (17 件) |
