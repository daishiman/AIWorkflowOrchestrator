# フォームバリデーション実装パターン

## React Hook Form + Zod統合

### 基本設定

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力'),
  password: z.string().min(8, '8文字以上'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">ログイン</button>
    </form>
  );
}
```

## サーバー側バリデーション

### API Route + Zod

```typescript
// Next.js API Route
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  // result.data は型安全
  const user = await createUser(result.data);
  return NextResponse.json(user, { status: 201 });
}
```

## 非同期バリデーション

### メールアドレスの重複チェック

```typescript
const emailSchema = z
  .string()
  .email()
  .superRefine(async (email, ctx) => {
    const exists = await checkEmailExists(email);
    if (exists) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "このメールアドレスは既に使用されています",
      });
    }
  });
```

## 条件付きバリデーション

### フィールド間の依存

```typescript
const schema = z
  .object({
    paymentMethod: z.enum(["credit", "bank", "cash"]),
    cardNumber: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "credit") {
        return !!data.cardNumber && data.cardNumber.length === 16;
      }
      return true;
    },
    {
      message: "クレジットカード番号（16桁）が必要です",
      path: ["cardNumber"],
    },
  );
```

## エラーハンドリング

### フィールドエラー表示コンポーネント

```tsx
function FieldError({ error }: { error?: FieldError }) {
  if (!error) return null;

  return (
    <p className="text-red-500 text-sm mt-1" role="alert">
      {error.message}
    </p>
  );
}
```

### フォーム全体エラー

```tsx
function FormErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-red-50 p-4 rounded" role="alert">
      <ul>
        {errors.map((error, i) => (
          <li key={i} className="text-red-700">
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## テストパターン

### Zodスキーマのテスト

```typescript
import { describe, it, expect } from "vitest";

describe("userSchema", () => {
  it("有効なデータを受け入れる", () => {
    const result = userSchema.safeParse({
      name: "John",
      email: "john@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("無効なメールを拒否する", () => {
    const result = userSchema.safeParse({
      name: "John",
      email: "invalid-email",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["email"]);
  });

  it("空の名前を拒否する", () => {
    const result = userSchema.safeParse({
      name: "",
      email: "john@example.com",
    });
    expect(result.success).toBe(false);
  });
});
```

## 国際化対応

```typescript
// i18n対応エラーメッセージ
const schema = z.object({
  name: z.string().min(1, { message: "validation.name.required" }),
  email: z.string().email({ message: "validation.email.invalid" }),
});

// エラー表示時に翻訳
function getLocalizedMessage(key: string, locale: string): string {
  return translations[locale][key] || key;
}
```
