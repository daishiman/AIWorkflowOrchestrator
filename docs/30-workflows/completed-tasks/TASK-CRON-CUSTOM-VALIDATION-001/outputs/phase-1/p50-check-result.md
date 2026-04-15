# P50チェック結果 — 既実装コード調査

## ファイル: `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`

## 1. handleDirectInputChange の実装内容

```typescript
const handleDirectInputChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value;
    setDirectInput(val);
    lastEmittedValueRef.current = val;
    onChange(val); // ← バリデーションなしで直接呼び出し
  },
  [disabled, onChange],
);
```

**問題**: 入力値をそのまま `onChange(val)` で渡すのみ。バリデーションは一切実行されない。

## 2. weeklyError / monthlyError の強制 false ロジック

```typescript
const weeklyError =
  !isAdvancedMode && // ← isAdvancedMode=trueなら常にfalse
  config.frequency === "weekly" &&
  config.weekdays.length === 0;

const monthlyError =
  !isAdvancedMode && // ← isAdvancedMode=trueなら常にfalse
  config.frequency === "monthly" &&
  (config.dayOfMonth < 1 || config.dayOfMonth > 31);
```

**問題**: `isAdvancedMode=true`（direct inputモード）の場合、`!isAdvancedMode` が `false` となるため、`weeklyError` / `monthlyError` は常に `false` になる。

## 3. isFormValid の計算ロジック

```typescript
const isFormValid = !weeklyError && !monthlyError;
// directInputError が存在しない
// direct inputモードでは常に true
```

**問題**: `directInputError` が存在しないため、direct inputモードでは `isFormValid` は常に `true`。

## 4. onValidationChange の呼び出し

```typescript
useEffect(() => {
  onValidationChange?.(isFormValid);
}, [isFormValid, onValidationChange]);
```

**問題**: `isFormValid` が常に `true` のため、direct inputモードでは `onValidationChange(true)` が常に通知される。

## 5. 問題ケース一覧

| ケース                              | 現状の挙動                     | 問題                       |
| ----------------------------------- | ------------------------------ | -------------------------- |
| フィールド数不足（"\* \* \* \*"）   | onValidationChange(true)が通知 | 無効なcron式が保存される   |
| day-of-month範囲外（"0 9 0 \* \*"） | onValidationChange(true)が通知 | 無効な日付指定が保存される |
| 空文字入力                          | onValidationChange(true)が通知 | 空文字でバリデーション通過 |
| visual→direct切り替え               | isFormValidがtrueにリセット    | 保存ボタンが誤って活性化   |

## 6. 結論

`directInputError` フラグを新規導入し、`isFormValid` に組み込む必要がある。
バリデーション関数（`validateCronSyntax` / `validateCronDayOfMonth`）を純粋な文字列操作で実装する。
