# エラーメッセージ設計

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## エラーメッセージ種別

| エラー種別         | エラーメッセージ                                      | 表示条件                            |
| ------------------ | ----------------------------------------------------- | ----------------------------------- |
| 空文字             | cron式を入力してください                              | directInputがトリム後空文字         |
| フィールド数不正   | cron式は5つのフィールドが必要です（分 時 日 月 曜日） | フィールド数が5でない               |
| day-of-month範囲外 | 日の値は1〜31の範囲で指定してください                 | day-of-monthが数値かつ1〜31の範囲外 |

## エラーメッセージ取得関数

```typescript
function getDirectInputErrorMessage(expression: string): string {
  const trimmed = expression.trim();
  if (!trimmed) return "cron式を入力してください";
  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5)
    return "cron式は5つのフィールドが必要です（分 時 日 月 曜日）";
  const dom = fields[2];
  if (/^\d+$/.test(dom)) {
    const num = parseInt(dom, 10);
    if (num < 1 || num > 31) return "日の値は1〜31の範囲で指定してください";
  }
  return "";
}
```

## エラーメッセージ表示設計

```tsx
{
  directInputError && (
    <p role="alert" className="text-sm text-red-500 mt-1">
      {getDirectInputErrorMessage(directInput)}
    </p>
  );
}
```

**設計判断:**

- `role="alert"`: スクリーンリーダーへの即時アナウンス（アクセシビリティ対応）
- `text-sm text-red-500 mt-1`: 既存の `monthlyError` メッセージと同一スタイル
- `directInputError` フラグが true の場合のみ表示（条件付きレンダリング）
- direct input セクション（`showDirectInput && (...)`）の直下に配置
