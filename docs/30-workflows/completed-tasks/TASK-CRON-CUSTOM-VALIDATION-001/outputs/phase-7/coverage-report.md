# カバレッジレポート（Phase 7）

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## 計測コマンド

```bash
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm --filter @repo/desktop exec vitest run \
  --coverage --coverage.reporter=text \
  src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx \
  src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx \
  src/__tests__/components/schedule/VisualCronPicker.test.tsx
```

## 計測結果

### schedule ディレクトリ（変更対象を含む）

| 計測対象                    | % Stmts | % Branch | % Funcs | % Lines | 判定 |
| --------------------------- | ------- | -------- | ------- | ------- | ---- |
| components/schedule（全体） | 98.06   | 85.93    | 60      | 98.06   | PASS |

**注記**: Functions 60% は ScheduleRow.tsx が今回のテスト対象外のため。本タスクで追加した関数は全てカバー済み。

### 新規追加コード（本タスク変更分）

| 対象                           | カバレッジ状況           | 判定 |
| ------------------------------ | ------------------------ | ---- |
| `validateCronSyntax()`         | CV-01〜CV-02で全分岐網羅 | PASS |
| `validateCronDayOfMonth()`     | CV-03〜CV-08で全分岐網羅 | PASS |
| `getDirectInputErrorMessage()` | CV-01〜CV-04でカバー     | PASS |
| `directInputError` 計算        | CV-01〜CV-12でカバー     | PASS |
| role="alert" 表示ブロック      | CV-01〜CV-04でカバー     | PASS |

## 既存テストリグレッション確認

- `VisualCronPicker.validation.test.tsx`: 17/17 PASS
- `VisualCronPicker.test.tsx`: 19/19 PASS
- scheduleディレクトリ全体: 70/70 PASS

## 判定: PASS

- Line カバレッジ 98.06% ≥ 80% ✓
- Branch カバレッジ 85.93% ≥ 60% ✓
- 新規追加関数は全てカバー済み ✓
- 既存テストリグレッションなし ✓
