# Phase 2 - コード変更差分イメージ

## 変更ファイル一覧

| ファイル                                                                              | 変更種別 |
| ------------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                  | 修正     |
| `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` | 新規     |

## `VisualCronPicker.tsx` 変更差分

### 変更点 1: Props インターフェースへの `onValidationChange` 追加

```diff
 interface VisualCronPickerProps {
   value?: string;
   onChange: (cron: string) => void;
   disabled?: boolean;
   showAdvancedToggle?: boolean;
   className?: string;
+  /**
+   * バリデーション状態が変化したときに呼び出されるコールバック（省略可能）
+   * @param isValid - フォーム全体のバリデーション結果（true: 有効, false: 無効）
+   */
+  onValidationChange?: (isValid: boolean) => void;
 }
```

### 変更点 2: コンポーネント関数引数への `onValidationChange` 追加

```diff
 export const VisualCronPicker: React.FC<VisualCronPickerProps> = memo(
   ({
     value,
     onChange,
     disabled = false,
     showAdvancedToggle = true,
     className,
+    onValidationChange,
   }) => {
```

### 変更点 3: `monthlyError` フラグ追加（`weeklyError` の近傍）

```diff
 const weeklyError =
   !isAdvancedMode &&
   config.frequency === "weekly" &&
   config.weekdays.length === 0;

+const monthlyError =
+  !isAdvancedMode &&
+  config.frequency === "monthly" &&
+  (config.dayOfMonth < 1 || config.dayOfMonth > 31);
```

### 変更点 4: `isFormValid` + `useEffect` 追加

```diff
+const isFormValid = !weeklyError && !monthlyError;
+
+useEffect(() => {
+  onValidationChange?.(isFormValid);
+}, [isFormValid, onValidationChange]);
```

### 変更点 5: `monthlyError` エラーメッセージ DOM 追加

```diff
 {showDayOfMonth && (
   <DayOfMonthSelector
     value={config.dayOfMonth}
     onChange={(day) => updateConfig({ dayOfMonth: day })}
     disabled={disabled}
   />
+  {monthlyError && (
+    <p role="alert" className="text-red-500 text-sm mt-1">
+      日付は1〜31の範囲で入力してください
+    </p>
+  )}
 )}
```

## IPC 関連への影響

**なし** — UI コンポーネントのみの変更。IPC ハンドラへの影響なし。
