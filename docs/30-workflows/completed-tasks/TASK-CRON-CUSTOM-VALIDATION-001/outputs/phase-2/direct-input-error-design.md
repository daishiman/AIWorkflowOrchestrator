# directInputError フラグ設計

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## directInputError フラグの計算ロジック

```typescript
const directInputError =
  isAdvancedMode &&
  (!validateCronSyntax(directInput) || !validateCronDayOfMonth(directInput));
```

**設計判断:**

- `isAdvancedMode` が false の場合は常に false → visual モードのバリデーションに影響しない（AC-6後方互換）
- `directInput` 状態の変更に応じてリアクティブに再計算される（computed value相当）
- 空文字・syntax不正・day-of-month範囲外の3パターンをカバー（V-1〜V-4）

## isFormValid への組み込み

**現行:**

```typescript
const isFormValid = !weeklyError && !monthlyError;
```

**変更後:**

```typescript
const isFormValid = !weeklyError && !monthlyError && !directInputError;
```

**設計判断:**

- `weeklyError` / `monthlyError` は `!isAdvancedMode` 条件で制御 → directモードでは常に false
- `directInputError` は `isAdvancedMode` 条件で制御 → visualモードでは常に false
- 各モードで適切なバリデーションのみが `isFormValid` に影響する（互いに独立）

## モード切替時のバリデーション再計算

- `directInputError` は `isAdvancedMode` と `directInput` の派生状態として計算
- `isAdvancedMode` が `true` に変更された時点で `directInput` の現在値に基づいてバリデーションが自動再計算
- `isFormValid` の変更を `useEffect` で監視して `onValidationChange` に通知する既存パターンをそのまま利用

```typescript
useEffect(() => {
  onValidationChange?.(isFormValid);
}, [isFormValid, onValidationChange]);
```
