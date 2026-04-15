# 要件定義書

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## 1. 機能要件

### 1.1 対象コンポーネント

- ファイル: `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`
- 機能: direct input モード（advanced mode 有効時）でのcron式バリデーション追加

### 1.2 バリデーションルール

| ルールID | ルール名             | 条件                         | エラーメッセージ                                      |
| -------- | -------------------- | ---------------------------- | ----------------------------------------------------- |
| V-1      | 空文字チェック       | 入力値がトリム後空文字       | cron式を入力してください                              |
| V-2      | フィールド数チェック | フィールド数が5でない        | cron式は5つのフィールドが必要です（分 時 日 月 曜日） |
| V-3      | day-of-month下限     | day-of-monthが数値かつ0以下  | 日の値は1〜31の範囲で指定してください                 |
| V-4      | day-of-month上限     | day-of-monthが数値かつ32以上 | 日の値は1〜31の範囲で指定してください                 |

### 1.3 実装スコープ

**スコープ内:**

- `handleDirectInputChange` へのバリデーション追加
- `directInputError` フラグの導入
- direct input モードでのエラーメッセージ表示（`role="alert"`）
- `isFormValid` への `directInputError` の組み込み
- ユニットテスト（Vitest/React Testing Library）

**スコープ外:**

- cronパーサーライブラリ導入（renderer環境制約）
- `cronConverter.ts` 側への変更
- visual モードのバリデーション変更（既実装済み）
- E2E/Playwrightテスト

## 2. 非機能要件

- renderer環境制約: Node.jsモジュール（`cron-parser`等）は使用不可
- 後方互換性: visual モードのバリデーションに影響を与えないこと
- アクセシビリティ: エラーメッセージに `role="alert"` を付与すること
- Optional Prop安全性: `onValidationChange` が undefined でも動作すること

## 3. 前提条件

- TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001（完了済み）: visual モードのバリデーションが既に実装されている
- `VisualCronPicker.tsx` は既に `weeklyError` / `monthlyError` によるバリデーション機構を持つ
- renderer環境制約によりNode.jsモジュールは使用不可
