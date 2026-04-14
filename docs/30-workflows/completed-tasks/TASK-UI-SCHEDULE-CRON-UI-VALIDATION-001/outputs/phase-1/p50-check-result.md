# Phase 1 - P50チェック結果

## 実行日時

2026-04-13

## 確認コマンド

```bash
grep -n "value\|onChange\|weeklyError\|isAdvancedMode\|directInput\|showAdvancedToggle\|onValidationChange\|monthlyError\|isFormValid" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

## 確認結果

| 項目                               | 状態                       | 行番号   |
| ---------------------------------- | -------------------------- | -------- |
| `onValidationChange` プロップ      | **未定義**（追加対象）     | —        |
| `value` ベースの制御コンポーネント | **確認済み**               | L32, L79 |
| `weeklyError` フラグ               | **実装済み**               | L198-201 |
| `monthlyError` フラグ              | **未実装**（新規追加対象） | —        |
| `isFormValid` 状態                 | **未実装**（新規追加対象） | —        |
| `DayOfMonthSelector` 使用          | **確認済み**               | L254-259 |

## 確認詳細

### `VisualCronPickerProps` インターフェース（L29-36）

```typescript
interface VisualCronPickerProps {
  value?: string;
  onChange: (cron: string) => void;
  disabled?: boolean;
  showAdvancedToggle?: boolean;
  className?: string;
  // onValidationChange は存在しない ← 追加対象
}
```

### `weeklyError` 既存実装（L198-201）

```typescript
const weeklyError =
  !isAdvancedMode &&
  config.frequency === "weekly" &&
  config.weekdays.length === 0;
```

エラー表示 DOM（L233-238）:

```tsx
{
  weeklyError && (
    <p role="alert" className="text-xs text-red-500 mt-1">
      曜日を1つ以上選択してください
    </p>
  );
}
```

### `monthlyError` 未実装の確認

`monthlyError` に関するコードが存在しないことを確認。
`dayOfMonth` の範囲チェックは実装されていない。

## 結論

- `onValidationChange` プロップ: 未定義 → **追加必要**
- `weeklyError`: 既存実装済み → **通知処理のみ追加**
- `monthlyError`: 未実装 → **新規追加**
- `isFormValid`: 未実装 → **新規追加**
