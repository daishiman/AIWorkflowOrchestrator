# 統合パターン

> Zodをフォームライブラリ・APIフレームワークに統合するパターン集
> **相対パス**: `references/integration-patterns.md`

---

## React Hook Form統合

### 基本セットアップ

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// スキーマ定義
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// フォームコンポーネント
function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // フォーカス離脱時にバリデーション
  });

  const onSubmit = async (data: LoginFormData) => {
    // data は型安全
    await login(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        ログイン
      </button>
    </form>
  );
}
```

### バリデーションモード

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: "onBlur", // フォーカス離脱時（推奨）
  // mode: 'onChange', // 入力ごと（リアルタイム）
  // mode: 'onSubmit', // 送信時のみ
  // mode: 'all',      // すべてのイベント
});
```

| モード   | 使用場面                               |
| -------- | -------------------------------------- |
| onBlur   | 一般的なフォーム（推奨）               |
| onChange | リアルタイムフィードバックが必要時     |
| onSubmit | パフォーマンス重視、シンプルなフォーム |
| all      | 最も厳密なバリデーション               |

### デフォルト値

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    email: "",
    role: "user", // スキーマのデフォルトと一致させる
  },
});
```

### 非同期バリデーション

```typescript
const emailSchema = z
  .string()
  .email()
  .refine(
    async (email) => {
      const exists = await checkEmailExists(email);
      return !exists;
    },
    { message: "このメールアドレスは既に使用されています" },
  );

// useFormで非同期を有効化
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: "onBlur",
});
```

---

## Controllerパターン

### カスタムコンポーネント連携

```tsx
import { Controller } from 'react-hook-form';

function FormWithCustomInput() {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="date"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            selected={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
          {error && <span>{error.message}</span>}
        )}
      />
    </form>
  );
}
```

### 選択肢（Select/Radio）

```tsx
<Controller
  name="role"
  control={control}
  render={({ field }) => (
    <select {...field}>
      <option value="user">ユーザー</option>
      <option value="admin">管理者</option>
    </select>
  )}
/>
```

---

## Next.js App Router統合

### Route Handler（POST）

```typescript
// app/api/users/route.ts
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const createUserSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力"),
  role: z.enum(["user", "admin"]).default("user"),
});

type CreateUserRequest = z.infer<typeof createUserSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "バリデーションエラー",
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    // result.data は CreateUserRequest 型
    const user = await createUser(result.data);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "サーバーエラー" },
      },
      { status: 500 },
    );
  }
}
```

### Route Handler（GET + クエリパラメータ）

```typescript
// app/api/users/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
  });

  const result = querySchema.safeParse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search"),
  });

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_QUERY", details: result.error.flatten() },
      },
      { status: 400 },
    );
  }

  const { page, limit, search } = result.data;
  const users = await getUsers({ page, limit, search });

  return NextResponse.json({ success: true, data: users });
}
```

### 動的パラメータ検証

```typescript
// app/api/users/[id]/route.ts
const paramsSchema = z.object({
  id: z.string().uuid("有効なUUIDを指定してください"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const result = paramsSchema.safeParse(params);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_ID" } },
      { status: 400 },
    );
  }

  const user = await getUserById(result.data.id);
  // ...
}
```

---

## 外部API呼び出し検証

### レスポンス検証

```typescript
const externalApiResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
    }),
  ),
  meta: z.object({
    total: z.number(),
    page: z.number(),
  }),
});

type ExternalApiResponse = z.infer<typeof externalApiResponseSchema>;

async function fetchExternalData(): Promise<ExternalApiResponse> {
  const response = await fetch("https://api.external.com/users");
  const json = await response.json();

  // 外部APIは信頼できないので厳密検証
  return externalApiResponseSchema.parse(json);
}
```

### エラーハンドリング付き

```typescript
async function fetchExternalDataSafe() {
  try {
    const response = await fetch("https://api.external.com/users");
    const json = await response.json();
    const result = externalApiResponseSchema.safeParse(json);

    if (!result.success) {
      console.error("外部APIレスポンス形式エラー:", result.error);
      throw new Error("外部APIレスポンスが期待した形式ではありません");
    }

    return result.data;
  } catch (error) {
    // ネットワークエラーまたはパースエラー
    throw error;
  }
}
```

---

## エラーレスポンス標準化

### 統一エラーフォーマット

```typescript
// types/api.ts
const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.array(z.string())).optional(),
  }),
});

// ユーティリティ関数
function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, string[]>,
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status },
  );
}

function createValidationErrorResponse(error: z.ZodError) {
  return createErrorResponse(
    "VALIDATION_ERROR",
    "リクエストの検証に失敗しました",
    400,
    error.flatten().fieldErrors,
  );
}
```

---

## 関連リソース

- **スキーマパターン**: See [schema-patterns.md](schema-patterns.md)
- **バリデーションパターン**: See [validation-patterns.md](validation-patterns.md)
- **フォームテンプレート**: See [../assets/form-validation-template.tsx](../assets/form-validation-template.tsx)
- **APIテンプレート**: See [../assets/api-schema-template.ts](../assets/api-schema-template.ts)
