# TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 実装ガイド

## 概要

`VisualCronPicker` コンポーネントに UI バリデーション機能を追加した。
週次（weekly）空曜日エラーおよび月次（monthly）日付範囲エラーを UI 層で検出し、
`onValidationChange` コールバックを通じて親コンポーネントへ通知できるようになった。

## 変更ファイル

### 修正: `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`

**追加内容:**

1. **`onValidationChange` プロップ**（`VisualCronPickerProps` への追加）

   ```typescript
   onValidationChange?: (isValid: boolean) => void;
   ```

   - Optional により既存の呼び出し元は変更不要（後方互換性確保）

2. **`monthlyError` フラグ**

   ```typescript
   const monthlyError =
     !isAdvancedMode &&
     config.frequency === "monthly" &&
     (config.dayOfMonth < 1 || config.dayOfMonth > 31);
   ```

3. **`isFormValid` と通知 `useEffect`**

   ```typescript
   const isFormValid = !weeklyError && !monthlyError;
   useEffect(() => {
     onValidationChange?.(isFormValid);
   }, [isFormValid, onValidationChange]);
   ```

4. **`monthlyError` エラーメッセージ DOM**
   ```tsx
   {
     monthlyError && (
       <p role="alert" className="text-red-500 text-sm mt-1">
         日付は1〜31の範囲で入力してください
       </p>
     );
   }
   ```

### 新規: `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`

17 テストケース（VAL-W-01〜EXP-CB-02）を追加。

| グループ                    | テスト数 | 内容          |
| --------------------------- | -------- | ------------- |
| weekly 空曜日バリデーション | 3        | VAL-W-01〜03  |
| monthly 日付バリデーション  | 4        | VAL-M-01〜04  |
| onValidationChange なし     | 1        | VAL-CB-01     |
| dayOfMonth 境界値テスト     | 4        | EXP-B-01〜04  |
| weekly 複合ケース           | 1        | EXP-C-01      |
| アクセシビリティ            | 2        | EXP-A-01〜02  |
| コールバック呼び出し回数    | 2        | EXP-CB-01〜02 |

## 使用方法

### 基本的な使い方（後方互換 — 変更不要）

```tsx
<VisualCronPicker value={cronExpression} onChange={handleCronChange} />
```

### バリデーション通知を受け取る場合

```tsx
const [isScheduleValid, setIsScheduleValid] = useState(true);

<VisualCronPicker
  value={cronExpression}
  onChange={handleCronChange}
  onValidationChange={setIsScheduleValid}
/>

<button disabled={!isScheduleValid}>保存</button>
```

## バリデーション仕様

| モード  | 無効条件                    | エラーメッセージ                        |
| ------- | --------------------------- | --------------------------------------- |
| weekly  | 曜日が1つも選択されていない | 「曜日を1つ以上選択してください」       |
| monthly | dayOfMonth < 1 または > 31  | 「日付は1〜31の範囲で入力してください」 |

## 受入基準（全件達成）

| AC    | 内容                                           | 状態 |
| ----- | ---------------------------------------------- | ---- |
| AC-1  | weekly 空曜日でエラーメッセージ表示            | ✓    |
| AC-2  | weekly 空曜日で `onValidationChange(false)`    | ✓    |
| AC-3  | weekly 曜日選択で `onValidationChange(true)`   | ✓    |
| AC-4  | monthly dayOfMonth < 1 でエラーメッセージ      | ✓    |
| AC-5  | monthly dayOfMonth > 31 でエラーメッセージ     | ✓    |
| AC-6  | monthly 無効日付で `onValidationChange(false)` | ✓    |
| AC-7  | monthly 有効日付で `onValidationChange(true)`  | ✓    |
| AC-8  | `onValidationChange` 未指定でも動作            | ✓    |
| AC-9  | `pnpm --filter @repo/desktop test` 全件 PASS   | ✓    |
| AC-10 | TypeScript 型チェック PASS                     | ✓    |

## Phase 11 スクリーンショット証跡

| シーン                | ファイル                                                                |
| --------------------- | ----------------------------------------------------------------------- |
| weekly + 空曜日       | `outputs/phase-11/screenshots/scene-01-weekly-empty-weekdays-error.png` |
| weekly + 曜日選択済み | `outputs/phase-11/screenshots/scene-02-weekly-valid-weekdays-ok.png`    |
| monthly + 無効日付    | `outputs/phase-11/screenshots/scene-03-monthly-invalid-date-error.png`  |
| monthly + 有効日付    | `outputs/phase-11/screenshots/scene-04-monthly-valid-date-ok.png`       |

| 付随証跡             | ファイル                                                     |
| -------------------- | ------------------------------------------------------------ |
| 撮影計画             | `outputs/phase-11/screenshot-plan.json`                      |
| カバレッジ           | `outputs/phase-11/screenshot-coverage.md`                    |
| キャプチャメタデータ | `outputs/phase-11/screenshots/phase11-capture-metadata.json` |

monthly の無効値は visual mode の初期値注入で再現した。直接入力モードは本タスクの範囲外であるため、別タスクへ分離する。

## 関連 Issue

- GitHub Issue #2109
- 依存元タスク: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001（cronConverter.ts のガード処理）
