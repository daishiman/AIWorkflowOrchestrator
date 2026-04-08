# エラーメッセージ設計

## タスク: UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001

## エラーメッセージ定数一覧

```typescript
export const SKILL_INFO_VALIDATION_MESSAGES = {
  skillName: {
    required: "スキル名を入力してください",
    maxLength: "スキル名は100文字以内で入力してください",
  },
  purpose: {
    minLength: "目的は10文字以上で入力してください",
    maxLength: "目的は500文字以内で入力してください",
  },
} as const;
```

## メッセージ一覧

| フィールド  | キー        | メッセージ                              | 発火条件                 |
| ----------- | ----------- | --------------------------------------- | ------------------------ |
| `skillName` | `required`  | スキル名を入力してください              | trim後が空文字列（`""`） |
| `skillName` | `maxLength` | スキル名は100文字以内で入力してください | trim後が101文字以上      |
| `purpose`   | `minLength` | 目的は10文字以上で入力してください      | trim後が9文字以下        |
| `purpose`   | `maxLength` | 目的は500文字以内で入力してください     | trim後が501文字以上      |

## 設計方針

- 全メッセージを日本語で定義（AC-4 準拠）
- メッセージに文字数制限の数値を含める（ユーザーが修正方法を理解できるよう）
- `as const` で型を厳密化し、メッセージの誤変更を防止
- ハードコードを排除し、テストでも `SKILL_INFO_VALIDATION_MESSAGES` 定数を参照する
