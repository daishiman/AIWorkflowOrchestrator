# Phase 1 - 受入基準（Acceptance Criteria）

## 作成日

2026-04-13

## 受入基準一覧

| AC番号 | 基準                                                                  | 検証方法              |
| ------ | --------------------------------------------------------------------- | --------------------- |
| AC-1   | weekly + 空曜日で `role="alert"` を持つエラーメッセージが表示される   | テスト PASS           |
| AC-2   | weekly + 空曜日で `onValidationChange(false)` が呼ばれる              | テスト PASS           |
| AC-3   | weekly + 曜日選択時に `onValidationChange(true)` が呼ばれる           | テスト PASS           |
| AC-4   | monthly + `dayOfMonth < 1` でエラーメッセージが表示される             | テスト PASS           |
| AC-5   | monthly + `dayOfMonth > 31` でエラーメッセージが表示される            | テスト PASS           |
| AC-6   | monthly + 無効日付（範囲外）で `onValidationChange(false)` が呼ばれる | テスト PASS           |
| AC-7   | monthly + 有効な日付（1〜31）で `onValidationChange(true)` が呼ばれる | テスト PASS           |
| AC-8   | `onValidationChange` が `undefined` の場合にもエラーなく動作する      | テスト PASS           |
| AC-9   | `pnpm --filter @repo/desktop test` が全件 PASS であること             | `pnpm test` PASS      |
| AC-10  | TypeScript 型チェックが PASS であること                               | `pnpm typecheck` PASS |

## エラーメッセージ文言

| バリデーション種別 | エラーメッセージ                                  |
| ------------------ | ------------------------------------------------- |
| weekly + 空曜日    | `曜日を1つ以上選択してください`（既存実装）       |
| monthly + 範囲外   | `日付は1〜31の範囲で入力してください`（新規追加） |

## 検証テストID対応

| AC番号 | テストID        |
| ------ | --------------- |
| AC-1   | VAL-W-01        |
| AC-2   | VAL-W-02        |
| AC-3   | VAL-W-03        |
| AC-4   | VAL-M-01        |
| AC-5   | VAL-M-02        |
| AC-6   | VAL-M-04        |
| AC-7   | VAL-M-03        |
| AC-8   | VAL-CB-01       |
| AC-9   | 全テスト PASS   |
| AC-10  | 型チェック PASS |
