# バリデーションパターン

> Zodバリデーション実装のパターンと実践例
> **相対パス**: `references/validation-patterns.md`

---

## parse vs safeParse

### parse（例外をスロー）

```typescript
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

// 成功時: パースされたデータを返す
// 失敗時: ZodErrorをスロー
try {
  const data = schema.parse({ name: "John", age: 30 });
  console.log(data); // { name: 'John', age: 30 }
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors);
  }
}
```

### safeParse（例外をスローしない）

```typescript
// 推奨: ユーザー入力のバリデーションに使用
const result = schema.safeParse({ name: "John", age: "invalid" });

if (result.success) {
  // result.data は型安全
  console.log(result.data);
} else {
  // result.error は ZodError
  console.error(result.error.errors);
}
```

### 使い分け基準

| 方式       | 使用場面                                    |
| ---------- | ------------------------------------------- |
| parse      | 信頼できるデータ（内部処理、環境変数）      |
| safeParse  | 信頼できないデータ（ユーザー入力、API応答） |
| parseAsync | 非同期バリデーションが必要な場合            |

---

## エラーハンドリング

### ZodError構造

```typescript
interface ZodError {
  issues: ZodIssue[];
  errors: ZodIssue[]; // issuesのエイリアス
  format(): ZodFormattedError;
  flatten(): FlattenedError;
}

interface ZodIssue {
  code: string;
  path: (string | number)[];
  message: string;
}
```

### エラーフォーマット

```typescript
function formatErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    formatted[path] = issue.message;
  }

  return formatted;
}

// 使用例
const result = schema.safeParse(invalidData);
if (!result.success) {
  const errors = formatErrors(result.error);
  // { 'user.email': 'Invalid email', 'user.age': 'Expected number' }
}
```

### flatten/format メソッド

```typescript
// flatten: フラットな構造に変換
const flatErrors = result.error.flatten();
// {
//   formErrors: string[],
//   fieldErrors: { [field: string]: string[] }
// }

// format: ネスト構造を保持
const formattedErrors = result.error.format();
// {
//   _errors: string[],
//   fieldName: { _errors: string[] }
// }
```

---

## カスタムバリデーション

### refine（単純なカスタムチェック）

```typescript
// 基本形
const passwordSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), {
    message: "大文字を含める必要があります",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "数字を含める必要があります",
  });

// パスとカスタムコード
const confirmPasswordSchema = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "パスワードが一致しません",
    path: ["confirm"], // エラーを特定フィールドに関連付け
  });
```

### superRefine（複雑なカスタムチェック）

```typescript
const complexSchema = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 8,
      type: "string",
      inclusive: true,
      message: "8文字以上必要です",
    });
  }

  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "大文字を含める必要があります",
    });
  }

  // 複数のエラーを返せる
});
```

### refine vs superRefine

| 方式        | 使用場面                                   |
| ----------- | ------------------------------------------ |
| refine      | 単一条件、単一エラーメッセージ             |
| superRefine | 複数条件、複数エラー、カスタムエラーコード |

---

## 非同期バリデーション

### parseAsync / safeParseAsync

```typescript
// 非同期refine
const uniqueEmailSchema = z
  .string()
  .email()
  .refine(
    async (email) => {
      const exists = await checkEmailExists(email);
      return !exists;
    },
    { message: "このメールアドレスは既に使用されています" },
  );

// 使用
const result = await uniqueEmailSchema.safeParseAsync("test@example.com");
```

### 注意点

```typescript
// 非同期バリデーションはパフォーマンスに影響
// 必要な場合のみ使用し、可能な限りクライアント側で事前チェック

// 良い例: DBへの重複チェック
const schema = z
  .object({
    email: z.string().email(), // 同期バリデーション
  })
  .refine(async (data) => !(await checkEmailExists(data.email)), {
    message: "Email already in use",
    path: ["email"],
  });

// 悪い例: 単純な形式チェックを非同期に
// z.string().refine(async (val) => val.length > 0) // 不要
```

---

## フォーム統合

### react-hook-form + @hookform/resolvers

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力'),
  password: z.string().min(8, '8文字以上'),
});

type FormData = z.infer<typeof formSchema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
    </form>
  );
}
```

---

## APIバリデーション

### リクエストバリデーション

```typescript
// スキーマ定義
const createUserRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "user"]).default("user"),
});

// APIハンドラ
async function createUserHandler(req: Request) {
  const result = createUserRequestSchema.safeParse(req.body);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      }),
      { status: 400 },
    );
  }

  // result.data は型安全
  const user = await createUser(result.data);
  return new Response(JSON.stringify(user), { status: 201 });
}
```

### レスポンスバリデーション

```typescript
const apiResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
  }),
  meta: z
    .object({
      total: z.number(),
    })
    .optional(),
});

async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const json = await response.json();

  // 外部APIレスポンスを検証
  return apiResponseSchema.parse(json);
}
```

---

## 関連リソース

- **スキーマパターン**: See [schema-patterns.md](schema-patterns.md)
- **APIスキーマテンプレート**: See [../assets/api-schema-template.ts](../assets/api-schema-template.ts)
