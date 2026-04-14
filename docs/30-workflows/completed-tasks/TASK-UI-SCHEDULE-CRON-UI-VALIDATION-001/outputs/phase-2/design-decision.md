# Phase 2 - 設計決定記録

## 作成日

2026-04-13

## 設計決定一覧

| 決定事項                         | 選択                                          | 理由                                                           |
| -------------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `onValidationChange` の必須/任意 | Optional（`?`）                               | 後方互換性の確保。既存の呼び出し元を変更しない                 |
| `monthlyError` の判定場所        | `VisualCronPicker.tsx` 内                     | バリデーション状態の集約。DayOfMonthSelector は UI に専念      |
| `isFormValid` の計算式           | `!weeklyError && !monthlyError`               | 両エラーフラグの否定 AND。将来のバリデーション追加に対応できる |
| 通知タイミング                   | `useEffect`（`isFormValid` 変化後）           | React の推奨パターン。状態と通知の一貫性を確保                 |
| undefined 安全対策               | Optional チェーン（`onValidationChange?.()`） | AC-8 対応。ランタイムエラーを防ぐ最小コスト実装                |
| `DayOfMonthSelector` の変更      | なし                                          | 責務分担の明確化。バリデーションは VisualCronPicker が所有     |

## `onValidationChange` プロップ設計

### 変更前

```typescript
interface VisualCronPickerProps {
  value?: string;
  onChange: (cron: string) => void;
  disabled?: boolean;
  showAdvancedToggle?: boolean;
  className?: string;
  // onValidationChange は存在しない
}
```

### 変更後

```typescript
interface VisualCronPickerProps {
  value?: string;
  onChange: (cron: string) => void;
  disabled?: boolean;
  showAdvancedToggle?: boolean;
  className?: string;
  /**
   * バリデーション状態が変化したときに呼び出されるコールバック（省略可能）
   * @param isValid - フォーム全体のバリデーション結果（true: 有効, false: 無効）
   */
  onValidationChange?: (isValid: boolean) => void;
}
```

## `monthlyError` 判定条件

```typescript
const monthlyError =
  !isAdvancedMode &&
  config.frequency === "monthly" &&
  (config.dayOfMonth < 1 || config.dayOfMonth > 31);
```

### エラーメッセージ DOM

```tsx
{
  monthlyError && (
    <p role="alert" className="text-red-500 text-sm mt-1">
      日付は1〜31の範囲で入力してください
    </p>
  );
}
```

## `isFormValid` 状態計算

```typescript
const isFormValid = !weeklyError && !monthlyError;
```

- `weeklyError` と `monthlyError` は排他的（同時に true にならない）
- しかし否定 AND で表現することで将来の第3バリデーション追加にも対応

## `useEffect` による通知パターン

```typescript
useEffect(() => {
  onValidationChange?.(isFormValid);
}, [isFormValid, onValidationChange]);
```

### 依存配列の選択理由

| 依存項目             | 理由                                       |
| -------------------- | ------------------------------------------ |
| `isFormValid`        | バリデーション状態が変化したときのみ通知   |
| `onValidationChange` | コールバック参照の変化も追跡（安全のため） |

## DayOfMonthSelector の責務分担

| コンポーネント       | 責務                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `DayOfMonthSelector` | `dayOfMonth` の入力 UI 提供（値変更を親に通知するのみ）          |
| `VisualCronPicker`   | `dayOfMonth` の範囲チェック（`monthlyError` フラグを保有・管理） |
