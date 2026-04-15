# テスト仕様書（Phase 4 TDD RED）

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## テストマトリクス CV-01〜CV-12

| TC番号 | AC対応 | テスト名                                      | 入力                       | 期待結果                               |
| ------ | ------ | --------------------------------------------- | -------------------------- | -------------------------------------- |
| CV-01  | AC-1   | 空文字入力時にエラー表示                      | `""`                       | エラー表示 + onValidationChange(false) |
| CV-02  | AC-2   | フィールド数不足時にエラー表示                | `"0 9 * *"`（4フィールド） | エラー表示 + onValidationChange(false) |
| CV-03  | AC-3   | day-of-month=0でエラー表示                    | `"0 9 0 * *"`              | エラー表示 + onValidationChange(false) |
| CV-04  | AC-4   | day-of-month=32でエラー表示                   | `"0 9 32 * *"`             | エラー表示 + onValidationChange(false) |
| CV-05  | AC-5   | 有効なcron式でエラーなし                      | `"0 9 15 * *"`             | エラーなし + onValidationChange(true)  |
| CV-06  | AC-5   | every-minuteで有効                            | `"* * * * *"`              | エラーなし + onValidationChange(true)  |
| CV-07  | AC-6   | dom=\*/2でエラーなし                          | `"0 9 */2 * *"`            | エラーなし + onValidationChange(true)  |
| CV-08  | AC-6   | dom=1-15区間でエラーなし                      | `"0 9 1-15 * *"`           | エラーなし + onValidationChange(true)  |
| CV-09  | AC-7   | visual→direct切り替え（初期値有効）           | モード切替                 | onValidationChange(true)               |
| CV-10  | AC-7   | visual→direct切り替え（バリデーション再計算） | モード切替                 | onValidationChangecalled               |
| CV-11  | AC-8   | onValidationChange=undefinedでレンダリング    | props省略                  | エラーなく動作                         |
| CV-12  | AC-1   | 半角スペースのみ入力時にエラー表示            | `"   "`                    | エラー表示 + onValidationChange(false) |

## テストファイル

`apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx`

## RED確認証跡

- 実装前（Phase 5実施前）にテストを実行
- CV-01〜CV-12が全てFAILすること（バリデーション未実装・role="alert"要素未出力）
- 既存テスト（VisualCronPicker.validation.test.tsx）は全PASS維持

## 追加テストケース CV-13〜CV-20（Phase 6分も同ファイルに含む）

| TC番号 | カテゴリ       | テスト名                      | 入力               | 期待結果                               |
| ------ | -------------- | ----------------------------- | ------------------ | -------------------------------------- |
| CV-13  | 境界値         | day-of-month=1（最小有効値）  | `"0 9 1 * *"`      | エラーなし + onValidationChange(true)  |
| CV-14  | 境界値         | day-of-month=31（最大有効値） | `"0 9 31 * *"`     | エラーなし + onValidationChange(true)  |
| CV-15  | 空白           | タブ文字のみ                  | `"\t"`             | エラー表示 + onValidationChange(false) |
| CV-16  | 空白           | 複数スペース区切り            | `"0  9  15  *  *"` | エラーなし + onValidationChange(true)  |
| CV-17  | 特殊フィールド | dom=1,15（カンマリスト）      | `"0 9 1,15 * *"`   | エラーなし + onValidationChange(true)  |
| CV-18  | 特殊フィールド | dom=L（月末指定）             | `"0 9 L * *"`      | エラーなし + onValidationChange(true)  |
| CV-19  | エッジケース   | 6フィールドcron式（秒付き）   | `"0 0 9 15 * *"`   | エラー表示 + onValidationChange(false) |
| CV-20  | エッジケース   | 先頭・末尾スペースあり        | `" 0 9 15 * * "`   | エラーなし + onValidationChange(true)  |
