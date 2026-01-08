# スキーマパターン

> Zodスキーマ定義のパターンと実装例
> **相対パス**: `references/schema-patterns.md`

---

## プリミティブ型

### 基本型

```typescript
import { z } from "zod";

// 文字列
const stringSchema = z.string();
const emailSchema = z.string().email();
const urlSchema = z.string().url();
const uuidSchema = z.string().uuid();

// 数値
const numberSchema = z.number();
const intSchema = z.number().int();
const positiveSchema = z.number().positive();
const rangeSchema = z.number().min(0).max(100);

// 真偽値
const booleanSchema = z.boolean();

// 日付
const dateSchema = z.date();
const dateStringSchema = z.string().datetime();
```

### 制約付き文字列

```typescript
// 長さ制限
const username = z
  .string()
  .min(3, "ユーザー名は3文字以上")
  .max(20, "ユーザー名は20文字以下");

// 正規表現
const alphanumeric = z.string().regex(/^[a-zA-Z0-9]+$/, "英数字のみ");

// トリム + 変換
const trimmedString = z.string().trim();
const lowercaseEmail = z.string().email().toLowerCase();
```

---

## 複合型

### オブジェクト

```typescript
// 基本オブジェクト
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

// 型推論
type User = z.infer<typeof userSchema>;
// { id: string; name: string; email: string; age?: number | undefined }
```

### 配列

```typescript
// 基本配列
const tagsSchema = z.array(z.string());

// 長さ制限
const limitedTags = z.array(z.string()).min(1).max(5);

// 非空配列
const nonEmptyTags = z.array(z.string()).nonempty();
```

### ネストオブジェクト

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string().regex(/^\d{3}-\d{4}$/),
});

const userWithAddressSchema = z.object({
  name: z.string(),
  address: addressSchema,
});
```

---

## ユニオン・判別型

### 基本ユニオン

```typescript
// 文字列リテラルユニオン
const statusSchema = z.enum(["pending", "active", "completed"]);
type Status = z.infer<typeof statusSchema>;

// 複数型ユニオン
const idSchema = z.union([z.string(), z.number()]);
```

### Discriminated Union（判別ユニオン）

```typescript
const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("click"),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal("keypress"),
    key: z.string(),
  }),
]);

type Event = z.infer<typeof eventSchema>;
// { type: 'click'; x: number; y: number } | { type: 'keypress'; key: string }
```

### Success/Error レスポンスパターン（API応答に最適）

```typescript
// 成功時のレスポンス
const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    content: z.string(),
  }),
});

// 失敗時のレスポンス
const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum(["NOT_FOUND", "UNAUTHORIZED", "TIMEOUT"]),
    message: z.string(),
    retryable: z.boolean(),
  }),
});

// Discriminated Union（"success" で判別）
const apiResponseSchema = z.discriminatedUnion("success", [
  successResponseSchema,
  errorResponseSchema,
]);

type ApiResponse = z.infer<typeof apiResponseSchema>;

// 使用例：型推論が効く
function handleResponse(response: ApiResponse) {
  if (response.success) {
    // TypeScriptは response.data の存在を認識
    console.log(response.data.content);
  } else {
    // TypeScriptは response.error の存在を認識
    console.error(response.error.message);
  }
}
```

> **実装事例**: `packages/shared/src/types/llm/schemas/response.ts` の `LLMChatResponseSchema`

---

## 再利用パターン

### 共通スキーマの抽出

```typescript
// 共通フィールド
const timestampFields = {
  createdAt: z.date(),
  updatedAt: z.date(),
};

// 共通IDフィールド
const idField = z.string().uuid();

// 合成
const entitySchema = z.object({
  id: idField,
  ...timestampFields,
});
```

### スキーマの拡張

```typescript
const baseUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

// 拡張
const userWithEmailSchema = baseUserSchema.extend({
  email: z.string().email(),
});

// 一部省略
const userUpdateSchema = baseUserSchema.partial();

// 特定フィールドのみ
const userNameSchema = baseUserSchema.pick({ name: true });
```

### スキーマの合成

```typescript
// merge
const combinedSchema = userSchema.merge(addressSchema);

// intersection
const strictUserSchema = userSchema.and(
  z.object({
    verified: z.literal(true),
  }),
);
```

---

## オプショナル・Nullable

```typescript
// オプショナル（undefinedを許容）
const optionalAge = z.number().optional();
// number | undefined

// Nullable（nullを許容）
const nullableAge = z.number().nullable();
// number | null

// 両方を許容
const optionalNullableAge = z.number().optional().nullable();
// number | null | undefined

// デフォルト値
const ageWithDefault = z.number().default(0);
// 入力がundefinedの場合0になる
```

---

## 変換・プリプロセス

### transform

```typescript
// 文字列を数値に変換
const numericString = z
  .string()
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().int().positive());

// 日付文字列をDateに変換
const dateFromString = z
  .string()
  .datetime()
  .transform((str) => new Date(str));
```

### preprocess

```typescript
// 入力の前処理
const coercedNumber = z.preprocess(
  (val) => (typeof val === "string" ? parseInt(val, 10) : val),
  z.number(),
);
```

### coerce（強制変換）

```typescript
// 自動型変換
const coercedString = z.coerce.string();
const coercedNumber = z.coerce.number();
const coercedBoolean = z.coerce.boolean();
const coercedDate = z.coerce.date();
```

---

## 関連リソース

- **バリデーションパターン**: See [validation-patterns.md](validation-patterns.md)
- **スキーマテンプレート**: See [../assets/schema-template.ts](../assets/schema-template.ts)
