# UIビジュアルレビュー（Phase 11）

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## レイアウト確認

エラーメッセージは `<input>` の直下（`mt-1`）に配置:

```tsx
<input ... />
{directInputError && (
  <p role="alert" className="text-sm text-red-500 mt-1">
    ...
  </p>
)}
```

既存の `weeklyError` / `monthlyError` の配置パターンと同一。レイアウト崩れなし。

## タイポグラフィ

- `text-sm`: 既存エラーメッセージと統一（12〜14px）
- `text-red-500`: Tailwind の標準エラー色、コントラスト比は WCAG AA 準拠
- フォントファミリーはアプリの CSS 変数を継承

## アクセシビリティ

- `role="alert"`: スクリーンリーダーへの即時通知（ARIA Live Region）
- 既存の weekly/monthly エラー要素も同じ `role="alert"` を使用しており統一性あり

## 後退確認

visual モードでは `directInputError` が常に `false` であるため、
エラーメッセージは表示されない。既存の weeklyError / monthlyError 表示に影響なし。

## スクリーンショット確認

- `outputs/phase-11/screenshots/SC-01_direct-input-initial.png`
- `outputs/phase-11/screenshots/SC-02_empty-input-error.png`
- `outputs/phase-11/screenshots/SC-03_syntax-error-4fields.png`
- `outputs/phase-11/screenshots/SC-04_day-of-month-zero-error.png`
- `outputs/phase-11/screenshots/SC-05_valid-cron-no-error.png`

## 判定: PASS
