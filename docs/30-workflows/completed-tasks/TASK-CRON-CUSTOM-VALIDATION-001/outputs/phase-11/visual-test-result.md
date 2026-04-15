# VISUAL証跡（Phase 11）

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## VISUAL証跡の要点

### role="alert" の実装確認

`VisualCronPicker.tsx` の `directInputError` フラグが true のとき、以下の要素がレンダリングされる:

```tsx
{
  directInputError && (
    <p role="alert" className="text-sm text-red-500 mt-1">
      {getDirectInputErrorMessage(directInput)}
    </p>
  );
}
```

この要素の存在・非存在は React Testing Library の `screen.getByRole("alert")` / `screen.queryByRole("alert")` で検証済み（CV-01〜CV-12、20件全 GREEN）。

## スクリーンショット証跡

- `outputs/phase-11/screenshots/SC-01_direct-input-initial.png`
- `outputs/phase-11/screenshots/SC-02_empty-input-error.png`
- `outputs/phase-11/screenshots/SC-03_syntax-error-4fields.png`
- `outputs/phase-11/screenshots/SC-04_day-of-month-zero-error.png`
- `outputs/phase-11/screenshots/SC-05_valid-cron-no-error.png`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`

### エラーメッセージの種別

| 入力状態                 | 表示メッセージ                                        |
| ------------------------ | ----------------------------------------------------- |
| 空文字 / スペースのみ    | cron式を入力してください                              |
| フィールド数≠5           | cron式は5つのフィールドが必要です（分 時 日 月 曜日） |
| day-of-month 1〜31範囲外 | 日の値は1〜31の範囲で指定してください                 |

### スタイル一貫性

エラーメッセージのスタイル: `text-sm text-red-500 mt-1`
→ 既存の `monthlyError` メッセージ（`text-red-500 text-sm mt-1`）と統一済み。

## 判定: PASS（ユニットテスト + 実機スクリーンショット）
