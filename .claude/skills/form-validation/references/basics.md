# フォームバリデーションの基本概念

## バリデーション層

### 1. クライアント側バリデーション

ユーザー体験の向上が目的。即時フィードバックを提供するが、セキュリティは保証しない。

| 目的     | 内容                           |
| -------- | ------------------------------ |
| UX向上   | リアルタイムエラー表示         |
| 負荷軽減 | 不正リクエストを事前にブロック |
| 即時性   | ブラウザで即座に検証           |

### 2. サーバー側バリデーション

セキュリティと整合性の保証が目的。クライアント側バリデーションを迂回する攻撃に対応。

| 目的         | 内容                 |
| ------------ | -------------------- |
| セキュリティ | 不正入力からの保護   |
| 整合性       | ビジネスルールの強制 |
| 必須性       | 常に実行（省略不可） |

## バリデーション種類

### 形式チェック

```typescript
// メールアドレス
const emailSchema = z.string().email();

// URL
const urlSchema = z.string().url();

// UUID
const uuidSchema = z.string().uuid();
```

### 範囲チェック

```typescript
// 文字列長
const nameSchema = z.string().min(1).max(100);

// 数値範囲
const ageSchema = z.number().min(0).max(150);

// 日付範囲
const dateSchema = z.date().min(new Date("2000-01-01"));
```

### パターンチェック

```typescript
// 正規表現
const phoneSchema = z.string().regex(/^\d{3}-\d{4}-\d{4}$/);

// カスタムバリデーション
const passwordSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), "大文字を含める必要があります")
  .refine((val) => /[0-9]/.test(val), "数字を含める必要があります");
```

## エラーメッセージ設計

### 良いメッセージ

| 原則     | 例                                 |
| -------- | ---------------------------------- |
| 具体的   | 「8文字以上で入力してください」    |
| 行動指示 | 「正しいメールアドレス形式で入力」 |
| 位置明確 | フィールド直下にエラーを表示       |

### 避けるべきメッセージ

| 問題     | 例                                       |
| -------- | ---------------------------------------- |
| 曖昧     | 「エラーが発生しました」                 |
| 技術用語 | 「バリデーションエラー: invalid format」 |
| 責める   | 「入力が間違っています」                 |

## Zodの基本

```typescript
import { z } from "zod";

// スキーマ定義
const userSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  age: z.number().min(0).max(150).optional(),
});

// 型推論
type User = z.infer<typeof userSchema>;

// 検証
const result = userSchema.safeParse(input);
if (result.success) {
  // result.data: User
} else {
  // result.error.issues: ZodIssue[]
}
```

## 参考文献

- 『Designing Data-Intensive Applications』（Martin Kleppmann）
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）
- Zod Documentation: https://zod.dev/
