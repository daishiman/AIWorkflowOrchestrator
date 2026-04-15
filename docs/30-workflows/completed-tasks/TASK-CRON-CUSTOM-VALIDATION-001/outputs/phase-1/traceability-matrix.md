# トレーサビリティ行列

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

| AC番号 | バリデーションルール               | 対象コード箇所                                      | テストケース |
| ------ | ---------------------------------- | --------------------------------------------------- | ------------ |
| AC-1   | V-1（空文字チェック）              | `handleDirectInputChange` + `directInputError` 計算 | CV-01, CV-12 |
| AC-2   | V-2（フィールド数チェック）        | `validateCronSyntax` 関数                           | CV-02, CV-19 |
| AC-3   | V-3（day-of-month下限）            | `validateCronDayOfMonth` 関数                       | CV-03        |
| AC-4   | V-4（day-of-month上限）            | `validateCronDayOfMonth` 関数                       | CV-04        |
| AC-5   | 全ルールPASS                       | `directInputError` が false                         | CV-05, CV-06 |
| AC-6   | V-3/V-4（非数値スキップ）          | `validateCronDayOfMonth` 数値判定                   | CV-07, CV-08 |
| AC-7   | モード切替時再計算                 | `isAdvancedMode` 変更時の派生計算                   | CV-09, CV-10 |
| AC-8   | `onValidationChange` undefined安全 | optional chaining `?.`                              | CV-11        |
