# スキーマ定義パターン

## 概要

Zodスキーマ定義における実践的なパターンと設計原則をまとめています。
堅牢で再利用可能なスキーマを効率的に構築するための指針を提供します。

## プリミティブ型パターン

### 文字列型

```typescript
import { z } from "zod";

// 基本的な文字列制約
const stringPatterns = {
  // 長さ制約
  username: z.string().min(3).max(50),

  // 正規表現パターン
  slug: z.string().regex(/^[a-z0-9-]+$/),

  // 組み込みバリデーター
  email: z.string().email(),
  url: z.string().url(),
  uuid: z.string().uuid(),
  cuid: z.string().cuid(),

  // 日付文字列
  dateString: z.string().datetime(),

  // 空白除去
  trimmedString: z.string().trim(),

  // 大文字/小文字変換
  lowercase: z.string().toLowerCase(),
  uppercase: z.string().toUpperCase(),
};
```

### 数値型

```typescript
const numberPatterns = {
  // 整数
  integer: z.number().int(),

  // 範囲制約
  percentage: z.number().min(0).max(100),

  // 符号制約
  positiveInt: z.number().int().positive(),
  nonNegative: z.number().nonnegative(),

  // 有限数
  finite: z.number().finite(),

  // 安全な整数
  safeInt: z.number().safe(),

  // 倍数
  multipleOf10: z.number().multipleOf(10),
};
```

### 真偽値・日付型

```typescript
const otherPrimitives = {
  // 真偽値
  isActive: z.boolean(),

  // 日付
  createdAt: z.date(),

  // 文字列からの日付変換
  dateFromString: z.coerce.date(),

  // リテラル
  status: z.literal("active"),

  // null/undefined
  nullable: z.string().nullable(),
  optional: z.string().optional(),
  nullish: z.string().nullish(), // null | undefined
};
```

## オブジェクト型パターン

### 基本構造

```typescript
// 標準的なオブジェクトスキーマ
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  age: z.number().int().positive().optional(),
});

// 型推論
type User = z.infer<typeof userSchema>;
```

### 厳格モード

```typescript
// 追加プロパティを拒否
const strictSchema = z
  .object({
    name: z.string(),
  })
  .strict();

// 追加プロパティを許可（型には含まれない）
const looseSchema = z
  .object({
    name: z.string(),
  })
  .passthrough();

// 追加プロパティを除去
const stripSchema = z
  .object({
    name: z.string(),
  })
  .strip();
```

### ネストとフラット化

```typescript
// ネストされた構造
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
});

const personSchema = z.object({
  name: z.string(),
  address: addressSchema,
});

// フラット化が必要な場合
const flatPersonSchema = z.object({
  name: z.string(),
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
});
```

## 配列型パターン

```typescript
const arrayPatterns = {
  // 基本配列
  strings: z.array(z.string()),

  // 要素数制約
  nonEmpty: z.array(z.string()).nonempty(),
  limitedSize: z.array(z.string()).min(1).max(10),

  // ユニークな要素（カスタムバリデーション）
  uniqueStrings: z
    .array(z.string())
    .refine((items) => new Set(items).size === items.length, {
      message: "重複する要素があります",
    }),

  // タプル型
  coordinate: z.tuple([z.number(), z.number()]),
  namedTuple: z.tuple([z.string(), z.number(), z.boolean()]),
};
```

## ユニオン型パターン

### 基本ユニオン

```typescript
// 単純なユニオン
const stringOrNumber = z.union([z.string(), z.number()]);

// 列挙型
const status = z.enum(["pending", "approved", "rejected"]);

// ネイティブEnum
enum UserRole {
  Admin = "admin",
  User = "user",
  Guest = "guest",
}
const roleSchema = z.nativeEnum(UserRole);
```

### Discriminated Union

```typescript
// タグ付きユニオン（推奨パターン）
const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("click"),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal("scroll"),
    scrollY: z.number(),
  }),
  z.object({
    type: z.literal("keypress"),
    key: z.string(),
  }),
]);

type Event = z.infer<typeof eventSchema>;
// → { type: 'click'; x: number; y: number } | { type: 'scroll'; scrollY: number } | { type: 'keypress'; key: string }
```

## スキーマ合成パターン

### 拡張 (extend)

```typescript
const baseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
});

const userSchema = baseSchema.extend({
  email: z.string().email(),
  name: z.string(),
});
```

### マージ (merge)

```typescript
const schemaA = z.object({ a: z.string() });
const schemaB = z.object({ b: z.number() });

const mergedSchema = schemaA.merge(schemaB);
// → { a: string; b: number }
```

### 選択と除外

```typescript
const fullUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  password: z.string(),
  name: z.string(),
  createdAt: z.date(),
});

// 選択
const loginSchema = fullUserSchema.pick({
  email: true,
  password: true,
});

// 除外
const publicUserSchema = fullUserSchema.omit({
  password: true,
});

// 部分的（すべてオプショナル）
const updateUserSchema = fullUserSchema.partial();

// 必須化
const requiredSchema = updateUserSchema.required();

// 深い部分的
const deepPartialSchema = fullUserSchema.deepPartial();
```

## レコード・マップパターン

```typescript
// キーと値の型を指定
const stringRecord = z.record(z.string());
// → Record<string, string>

const typedRecord = z.record(z.string(), z.number());
// → Record<string, number>

// キーの制約
const enumKeyRecord = z.record(z.enum(["a", "b", "c"]), z.number());
```

## 再帰型パターン

```typescript
// 自己参照型
interface Category {
  name: string;
  children?: Category[];
}

const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(categorySchema).optional(),
  }),
);

// JSON型
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(jsonSchema),
  ]),
);
```

## デフォルト値パターン

```typescript
const configSchema = z.object({
  // デフォルト値
  timeout: z.number().default(5000),
  retries: z.number().default(3),

  // 動的デフォルト
  id: z.string().default(() => crypto.randomUUID()),
  createdAt: z.date().default(() => new Date()),

  // オプショナルとデフォルトの組み合わせ
  options: z
    .object({
      verbose: z.boolean(),
    })
    .optional()
    .default({ verbose: false }),
});
```

## ベストプラクティス

### 1. スキーマの再利用性

```typescript
// ✅ 再利用可能な基本パーツを定義
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);
const uuidSchema = z.string().uuid();

// 基本エンティティスキーマ
const baseEntitySchema = z.object({
  id: uuidSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// 機能固有スキーマで再利用
const userSchema = baseEntitySchema.extend({
  email: emailSchema,
  password: passwordSchema,
});
```

### 2. ブランド型による型安全性強化

```typescript
// ブランド型で異なるID型を区別
const userIdSchema = z.string().uuid().brand<"UserId">();
const postIdSchema = z.string().uuid().brand<"PostId">();

type UserId = z.infer<typeof userIdSchema>;
type PostId = z.infer<typeof postIdSchema>;

// 型エラー: UserIdとPostIdは異なる型
// const userId: UserId = postId; // Error
```

### 3. 入力型と出力型の分離

```typescript
const userSchema = z.object({
  name: z.string().transform((s) => s.trim()),
  age: z.coerce.number(),
});

// 入力型（変換前）
type UserInput = z.input<typeof userSchema>;
// → { name: string; age: unknown }

// 出力型（変換後）
type UserOutput = z.output<typeof userSchema>;
// → { name: string; age: number }
```

## アンチパターン

### 避けるべき実装

```typescript
// ❌ any/unknownの乱用
const badSchema = z.object({
  data: z.any(), // 型安全性が失われる
});

// ❌ 過度に複雑なカスタムバリデーション
const overComplexSchema = z.string().refine((s) => {
  // 複雑なロジックはスキーマの外に出す
  return someComplexValidation(s);
});

// ❌ 深すぎるネスト
const deepNestedSchema = z.object({
  a: z.object({
    b: z.object({
      c: z.object({
        d: z.object({
          // フラット化を検討
        }),
      }),
    }),
  }),
});

// ❌ 重複したスキーマ定義
const schema1 = z.object({ email: z.string().email() });
const schema2 = z.object({ email: z.string().email() }); // 再利用すべき
```

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
