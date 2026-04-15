# 実装ガイド — direct input / custom cron モードへの月次バリデーション追加

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

---

## Part 1: 概念説明（中学生向け）

### cron式バリデーションとは？

**なぜ必要か？**

アプリには「毎日朝9時にバックアップを取る」「毎月15日にレポートを送る」といった
スケジュール設定機能があります。この設定は **cron式** という特殊な書き方で保存されます。

たとえば、目覚まし時計の設定で「毎月0日の朝に起こして」と言っても、
0日なんて日は存在しません。でも今まで、このアプリのdirect inputモード（cron式を
直接キーボードで入力するモード）では、「0日」みたいなありえない設定でも
「OK！保存するね」と言ってしまっていました。

cron式バリデーションとは、こういう**「ありえない設定」を入力した瞬間に見つけて、
わかりやすいエラーメッセージでお知らせする仕組み**です。

**何をするか？**

cron式は「分 時 日 月 曜日」の5つの数字（または記号）でできています。
たとえば `0 9 15 * *` は「毎月15日の9:00に実行」という意味です。

バリデーションは以下の3つをチェックします：

1. **空っぽじゃないか**: 何も入力しないと動かないので、空欄はNG
2. **5つの項目があるか**: 「分 時 日 月 曜日」の5つが必要なのに4つや6つはNG
3. **日にちが1〜31の範囲か**: 0日や32日は存在しないのでNG

ちなみに、`*`（なんでもOK）や `*/2`（2日おき）のような特殊な書き方は
数字じゃないのでチェック対象外です。

**direct inputモードとvisualモードの違い？**

このアプリのスケジュール設定には2つの入力方法があります：

- **visualモード**（見た目で選ぶ）: 「毎日」「毎週月曜日」などをボタンで選ぶ方法。すでにバリデーション済み
- **direct inputモード**（直接入力）: cron式を自分でキーボードで打ち込む方法。今回バリデーションを追加した

---

## Part 2: 技術詳細（開発者向け）

### 変更ファイル

| ファイル                                                                                    | 変更種別 | 内容                                                                                               |
| ------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        | 修正     | バリデーション関数追加・getDirectInputErrorMessage・aria-invalid/aria-describedby・isFormValid統合 |
| `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | 新規     | CV-01〜CV-20 テストケース                                                                          |

### 追加 API

#### `validateCronSyntax(expression: string): boolean`

```typescript
// cron式の構文バリデーション（空文字・フィールド数チェック）
function validateCronSyntax(expression: string): boolean;
```

- `""` → `false`
- `"0 9 * *"` (4フィールド) → `false`
- `"* * * * *"` (5フィールド) → `true`
- `"0  9  15  *  *"` (複数スペース区切り) → `true`

#### `validateCronDayOfMonth(expression: string): boolean`

```typescript
// day-of-monthフィールドが純粋な数値の場合のみ1〜31範囲チェック
function validateCronDayOfMonth(expression: string): boolean;
```

- `"0 9 0 * *"` (dom=0) → `false`
- `"0 9 32 * *"` (dom=32) → `false`
- `"0 9 15 * *"` (dom=15) → `true`
- `"0 9 */2 * *"` (dom=\*/2、非数値) → `true`（スキップ）

#### `getDirectInputErrorMessage(expression: string): string`

| 入力状態                     | 返却メッセージ                                            |
| ---------------------------- | --------------------------------------------------------- |
| 空文字 / スペースのみ        | `"cron式を入力してください"`                              |
| フィールド数 ≠ 5             | `"cron式は5つのフィールドが必要です（分 時 日 月 曜日）"` |
| day-of-month が 1〜31 範囲外 | `"日の値は1〜31の範囲で指定してください"`                 |

### `directInputError` 状態管理フロー

```
directInput（state）
    ↓ onChange
isAdvancedMode（state）
    ↓
directInputError（computed）
  = isAdvancedMode
    ? getDirectInputErrorMessage(directInput) !== ""
    : false
    ↓
isFormValid（computed）
  = !weeklyError && !monthlyError && !directInputError
    ↓ useEffect
onValidationChange?.(isFormValid)
```

### `onValidationChange` 呼び出し条件

| 状態                               | 呼び出し値 |
| ---------------------------------- | ---------- |
| direct input + 有効な cron 式      | `true`     |
| direct input + 空文字              | `false`    |
| direct input + フィールド数 ≠ 5    | `false`    |
| direct input + day-of-month 範囲外 | `false`    |
| visual モード + エラーなし         | `true`     |
| visual モード + weeklyError        | `false`    |
| visual モード + monthlyError       | `false`    |

`onValidationChange` が渡されない場合は optional chaining `?.` により安全にスキップ。

### エラーメッセージの表示条件と `role="alert"`

`directInputError === true` のとき、以下の要素がレンダリングされる:

```tsx
{
  directInputError && (
    <p role="alert" className="text-sm text-red-500 mt-1">
      {getDirectInputErrorMessage(directInput)}
    </p>
  );
}
```

`role="alert"` により ARIA Live Region として機能し、スクリーンリーダーへ即時通知。

### visual モードとの共存（後方互換性）

```typescript
// directInputErrorMessage は isAdvancedMode でのみ生成 → visual モードでは常に空文字
const directInputErrorMessage = isAdvancedMode
  ? getDirectInputErrorMessage(directInput)
  : "";
const directInputError = directInputErrorMessage !== "";

// 既存の weeklyError / monthlyError ロジックは一切変更なし
const isFormValid = !weeklyError && !monthlyError && !directInputError;
```

visual モードでは `directInputError` が常に `false` のため、既存の `weeklyError` / `monthlyError` バリデーションには影響しない。

### `isAdvancedMode` state

```typescript
const [isAdvancedMode, setIsAdvancedMode] = useState(() => {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  const parsed = cronToVisualConfig(trimmed);
  return parsed === null || parsed.frequency === "custom";
});
```

初期モードは `value` から自動判定し、外部 props では制御しない。

### スクリーンショット証跡

| ファイル                                                         | 内容                      |
| ---------------------------------------------------------------- | ------------------------- |
| `outputs/phase-11/screenshots/SC-01_direct-input-initial.png`    | direct input 初期状態     |
| `outputs/phase-11/screenshots/SC-02_empty-input-error.png`       | 空文字エラー              |
| `outputs/phase-11/screenshots/SC-03_syntax-error-4fields.png`    | 4フィールド syntax エラー |
| `outputs/phase-11/screenshots/SC-04_day-of-month-zero-error.png` | day-of-month=0 エラー     |
| `outputs/phase-11/screenshots/SC-05_valid-cron-no-error.png`     | 有効 cron 状態            |
| `outputs/phase-11/screenshots/phase11-capture-metadata.json`     | 取得メタデータ            |
