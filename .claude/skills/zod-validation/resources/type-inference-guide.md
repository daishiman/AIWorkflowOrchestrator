# 型推論ガイド

## 概要

Zodの強力な型推論機能を活用して、ランタイムバリデーションとコンパイル時の型安全性を
同時に実現する方法を解説します。

## 基本的な型推論

### z.infer の使用

```typescript
import { z } from "zod";

// スキーマ定義
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  roles: z.array(z.enum(["admin", "user", "guest"])),
});

// 型推論
type User = z.infer<typeof userSchema>;
/*
type User = {
  id: string;
  email: string;
  age?: number | undefined;
  roles: ('admin' | 'user' | 'guest')[];
}
*/
```

### 入力型と出力型の分離

```typescript
const transformSchema = z.object({
  name: z.string().transform((s) => s.trim().toLowerCase()),
  birthYear: z.string().transform((s) => parseInt(s, 10)),
  createdAt: z.coerce.date(),
});

// 入力型（変換前の型）
type TransformInput = z.input<typeof transformSchema>;
/*
type TransformInput = {
  name: string;
  birthYear: string;
  createdAt: string | number | Date;
}
*/

// 出力型（変換後の型）
type TransformOutput = z.output<typeof transformSchema>;
/*
type TransformOutput = {
  name: string;
  birthYear: number;
  createdAt: Date;
}
*/

// z.infer は z.output のエイリアス
type InferredType = z.infer<typeof transformSchema>;
// → TransformOutput と同じ
```

## 高度な型推論パターン

### ジェネリック関数での使用

```typescript
// バリデーション関数をジェネリック化
function validate<T extends z.ZodSchema>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

// 使用例
const user = validate(userSchema, rawData);
// user の型は自動的に User 型として推論される

// 安全な解析版
function safeValidate<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
): z.SafeParseReturnType<z.input<T>, z.output<T>> {
  return schema.safeParse(data);
}
```

### 条件付き型との組み合わせ

```typescript
// 条件付きスキーマの型推論
type SchemaType<S extends z.ZodSchema> = z.infer<S>;

// 配列要素の型を取得
type ArrayElement<S extends z.ZodArray<z.ZodTypeAny>> =
  S extends z.ZodArray<infer E> ? z.infer<E> : never;

const numbersSchema = z.array(z.number());
type NumberElement = ArrayElement<typeof numbersSchema>;
// → number
```

### オブジェクトスキーマの部分型

```typescript
const fullSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.date(),
});

// Pick による部分型
const loginSchema = fullSchema.pick({ email: true, password: true });
type LoginInput = z.infer<typeof loginSchema>;
// → { email: string; password: string }

// Omit による部分型
const publicSchema = fullSchema.omit({ password: true });
type PublicUser = z.infer<typeof publicSchema>;
// → { id: string; name: string; email: string; createdAt: Date }

// Partial による全オプショナル化
const updateSchema = fullSchema.partial();
type UpdateInput = z.infer<typeof updateSchema>;
// → { id?: string; name?: string; ... } （すべてオプショナル）

// Required による全必須化
const requiredSchema = updateSchema.required();
type RequiredInput = z.infer<typeof requiredSchema>;
// → 元の型に戻る
```

## Discriminated Union の型推論

### 基本的な使用法

```typescript
const resultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    data: z.object({
      id: z.string(),
      value: z.number(),
    }),
  }),
  z.object({
    status: z.literal("error"),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  }),
]);

type Result = z.infer<typeof resultSchema>;
/*
type Result =
  | { status: 'success'; data: { id: string; value: number } }
  | { status: 'error'; error: { code: string; message: string } };
*/

// 型ガードとして使用
function handleResult(result: Result) {
  if (result.status === "success") {
    // TypeScript は result.data にアクセス可能と認識
    console.log(result.data.id);
  } else {
    // result.status === 'error' の場合
    console.log(result.error.message);
  }
}
```

### 複数の判別フィールド

```typescript
// APIレスポンスの型付け
const apiResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("user"),
    payload: z.object({
      userId: z.string(),
      email: z.string(),
    }),
  }),
  z.object({
    type: z.literal("product"),
    payload: z.object({
      productId: z.string(),
      price: z.number(),
    }),
  }),
  z.object({
    type: z.literal("order"),
    payload: z.object({
      orderId: z.string(),
      items: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number(),
        }),
      ),
    }),
  }),
]);

type ApiResponse = z.infer<typeof apiResponseSchema>;
```

## 再帰型の型推論

### 基本的な再帰型

```typescript
// 型を先に定義
interface Category {
  id: string;
  name: string;
  children?: Category[];
}

// ZodType を使用して型を明示
const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    children: z.array(categorySchema).optional(),
  }),
);

// 型推論
type CategoryType = z.infer<typeof categorySchema>;
// → Category インターフェースと一致
```

### 相互再帰

```typescript
interface Person {
  name: string;
  friends: Person[];
  bestFriend?: Person;
}

const personSchema: z.ZodType<Person> = z.lazy(() =>
  z.object({
    name: z.string(),
    friends: z.array(personSchema),
    bestFriend: personSchema.optional(),
  }),
);
```

## ブランド型による型安全性強化

### ブランド型の定義

```typescript
// 異なるIDを型レベルで区別
const userIdSchema = z.string().uuid().brand<"UserId">();
const postIdSchema = z.string().uuid().brand<"PostId">();

type UserId = z.infer<typeof userIdSchema>;
type PostId = z.infer<typeof postIdSchema>;

// 関数シグネチャで型安全性を確保
function getUser(id: UserId): Promise<User> {
  // ...
}

function getPost(id: PostId): Promise<Post> {
  // ...
}

// 使用例
const userId = userIdSchema.parse("123e4567-e89b-12d3-a456-426614174000");
const postId = postIdSchema.parse("987fcdeb-51a2-3c4d-b5e6-789012345678");

getUser(userId); // ✅ OK
getUser(postId); // ❌ 型エラー: PostId は UserId に代入できない
```

### 名目型の実現

```typescript
// メールアドレスのブランド型
const emailSchema = z.string().email().brand<"Email">();
type Email = z.infer<typeof emailSchema>;

// 正の整数のブランド型
const positiveIntSchema = z.number().int().positive().brand<"PositiveInt">();
type PositiveInt = z.infer<typeof positiveIntSchema>;

// 通貨金額のブランド型
const moneySchema = z.number().nonnegative().brand<"Money">();
type Money = z.infer<typeof moneySchema>;
```

## 型推論のベストプラクティス

### 1. スキーマと型を一元管理

```typescript
// ✅ スキーマから型を導出（単一の真実の源）
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});
export type User = z.infer<typeof userSchema>;

// ❌ スキーマと型を別々に定義（不整合のリスク）
export interface BadUser {
  id: string;
  email: string;
  name: string;
}
export const badUserSchema = z.object({
  // 手動で同期する必要がある
});
```

### 2. エクスポート戦略

```typescript
// schema.ts
import { z } from "zod";

// スキーマをエクスポート
export const userSchema = z.object({
  /* ... */
});
export const postSchema = z.object({
  /* ... */
});

// 型もエクスポート
export type User = z.infer<typeof userSchema>;
export type Post = z.infer<typeof postSchema>;

// 使用側
import { userSchema, User, postSchema, Post } from "./schema";
```

### 3. 型アサーションの回避

```typescript
// ❌ 型アサーションは避ける
const user = data as User;

// ✅ スキーマでバリデーション
const user = userSchema.parse(data);

// ✅ 安全な解析
const result = userSchema.safeParse(data);
if (result.success) {
  const user = result.data; // 型が保証される
}
```

## 型推論のトラブルシューティング

### 循環参照エラー

```typescript
// ❌ 直接の自己参照はエラー
const badSchema = z.object({
  children: z.array(badSchema), // Error
});

// ✅ z.lazy() を使用
const goodSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    children: z.array(goodSchema),
  }),
);
```

### 型の絞り込みが効かない場合

```typescript
// union の場合は discriminatedUnion を検討
const schema = z.union([
  z.object({ type: z.literal("a"), dataA: z.string() }),
  z.object({ type: z.literal("b"), dataB: z.number() }),
]);

// ✅ discriminatedUnion で型の絞り込みが効く
const betterSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), dataA: z.string() }),
  z.object({ type: z.literal("b"), dataB: z.number() }),
]);
```

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
