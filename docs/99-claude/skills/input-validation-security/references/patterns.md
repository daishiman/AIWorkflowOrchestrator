# 入力検証パターン

> **相対パス**: `references/patterns.md`
> **対応仕様**: OWASP ASVS 5.1, CWE-20

---

## Zodによる型安全な検証

### 基本スキーマ定義

```typescript
import { z } from "zod";

// 基本型
export const userInputSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain alphanumeric characters and underscores",
    ),

  email: z.string().email("Invalid email format"),

  age: z
    .number()
    .int("Age must be an integer")
    .min(0, "Age cannot be negative")
    .max(150, "Age must be realistic"),

  role: z.enum(["user", "moderator", "admin"]),

  tags: z.array(z.string().max(50)).max(10, "Maximum 10 tags allowed"),
});

export type UserInput = z.infer<typeof userInputSchema>;
```

### Branded Types（意味的型安全性）

```typescript
// UUIDを文字列と区別
const UUIDSchema = z.string().uuid().brand<"UUID">();
type UUID = z.infer<typeof UUIDSchema>;

// EmailをStringと区別
const EmailSchema = z.string().email().brand<"Email">();
type Email = z.infer<typeof EmailSchema>;

// 使用例: UUID型以外を受け付けない
function findUser(id: UUID): User {
  // id は検証済みのUUID
}
```

---

## エンドポイント別検証パターン

### RESTful API

```typescript
// POST /api/users
const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8).max(128),
  }),
});

// GET /api/users/:id
const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// GET /api/users?search=...&page=1
const listUsersSchema = z.object({
  query: z.object({
    search: z.string().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});
```

### ファイルアップロード

```typescript
const fileUploadSchema = z.object({
  filename: z
    .string()
    .max(255)
    .regex(/^[\w\-. ]+$/, "Invalid filename characters"),

  mimetype: z.enum(["image/jpeg", "image/png", "image/gif", "application/pdf"]),

  size: z.number().max(10 * 1024 * 1024, "File size must be under 10MB"),
});

// Magic bytes検証（拡張子偽装対策）
const MAGIC_BYTES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
};
```

---

## コンテキスト別エンコーディング

### HTMLコンテキスト

```typescript
export function encodeHTML(str: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return str.replace(/[&<>"'/]/g, (char) => entities[char]);
}
```

### JavaScript文字列コンテキスト

```typescript
export function encodeJSString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/<\//g, "<\\/"); // </script> 対策
}
```

### URLコンテキスト

```typescript
export function encodeURLParam(str: string): string {
  return encodeURIComponent(str);
}

// 完全なURL検証
const urlSchema = z
  .string()
  .url()
  .refine(
    (url) => {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    },
    { message: "Only HTTP/HTTPS URLs are allowed" },
  );
```

---

## 高度な検証パターン

### 相互依存バリデーション

```typescript
const dateRangeSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
  });
```

### 条件付きバリデーション

```typescript
const paymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("credit_card"),
    cardNumber: z.string().regex(/^\d{16}$/),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  }),
  z.object({
    method: z.literal("bank_transfer"),
    accountNumber: z.string().min(10).max(20),
    bankCode: z.string().length(4),
  }),
]);
```

### ReDoS対策正規表現

```typescript
// Bad: バックトラック多用（ReDoS脆弱）
const badEmailRegex = /^([a-zA-Z0-9_.+-]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

// Good: シンプルな正規表現 + Zodのemail()
const safeEmailSchema = z
  .string()
  .max(254)
  .email()
  .refine((email) => !email.includes(".."), {
    message: "Invalid email format",
  });
```

---

## ミドルウェア統合

### Expressミドルウェア

```typescript
import { RequestHandler } from "express";
import { z, ZodSchema } from "zod";

export const validate = <T extends ZodSchema>(schema: T): RequestHandler => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Validation failed", {
          errors: error.errors,
          path: req.path,
        });
        return res.status(400).json({
          error: "Invalid input",
          code: "VALIDATION_ERROR",
        });
      }
      next(error);
    }
  };
};
```

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **XSS防止詳細**: See [xss-prevention.md](xss-prevention.md)
- **SQLi防止詳細**: See [sql-injection-prevention.md](sql-injection-prevention.md)
