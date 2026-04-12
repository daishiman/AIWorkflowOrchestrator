# カバレッジレポート - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## 計測コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage --coverage.provider=v8 \
  "--coverage.include=src/renderer/utils/scheduleConfigValidator.ts" \
  src/__tests__/utils/scheduleConfigValidator.test.ts \
  src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

実行日時: 2026-04-12

## カバレッジ結果

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    86.84 |     100 |     100 |
 ...igValidator.ts |     100 |    86.84 |     100 |     100 | 42,46-49,51,61
-------------------|---------|----------|---------|---------|-------------------
```

## 目標値との比較

| 指標               | 結果   | 目標  | 判定    |
| ------------------ | ------ | ----- | ------- |
| Line coverage      | 100%   | ≥ 90% | PASS ✅ |
| Branch coverage    | 86.84% | ≥ 85% | PASS ✅ |
| Function coverage  | 100%   | -     | PASS ✅ |
| Statement coverage | 100%   | -     | PASS ✅ |

## 未カバー行の分析

未カバー行（42, 46-49, 51, 61）はすべて既存の `isValidCronField` 関数内の防御コードで、本タスクの変更対象外：

- 行42: `if (parts.length === 0) return false;` — `"".split(",")` は `[""]` を返すためこの分岐に到達しない
- 行46: `if (!trimmed) return false;` — 空フィールドパーツの防御
- 行48-49: stepPart の数値チェック
- 行51: step値の範囲チェック
- 行61: 不正な範囲形式の防御

**新規追加の semantic チェックブロック（options.semantic 分岐）は 100% カバー済み。**

## AC-4 充足確認: PASS（カバレッジ 100%/86.84% / 目標 90%/85%）

- Phase 4 前: semantic validation テストなし（0件）
- Phase 6 後: TC-01〜TC-16 計16件の semantic バリデーションテスト追加
