# Zod 統合ガイド

## 概要

ZodはTypeScriptファーストのスキーマ宣言・検証ライブラリです。
AI出力の型安全な処理に最適です。

## 基本パターン

### シンプルなスキーマ

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(["admin", "user", "guest"]),
  createdAt: z.string().datetime()
});

// 型を自動推論
type User = z.infer<typeof UserSchema>;
```

### ネストスキーマ

```typescript
const ProfileSchema = z.object({
  bio: z.string().max(500),
  avatar: z.string().url().optional(),
  social: z.object({
    twitter: z.string().optional(),
    github: z.string().optional()
  }).optional()
});

const UserWithProfileSchema = UserSchema.extend({
  profile: ProfileSchema.optional()
});
```

### 配列スキーマ

```typescript
const ItemSchema = z.object({
  id: z.string(),
  value: z.number()
});

const ItemListSchema = z.object({
  items: z.array(ItemSchema).min(1).max(100),
  total: z.number().int().min(0)
});
```

## AI出力向けスキーマ

### 分析結果スキーマ

```typescript
const AnalysisResultSchema = z.object({
  summary: z.string().max(500),
  findings: z.array(z.object({
    category: z.enum(["issue", "suggestion", "info"]),
    description: z.string(),
    severity: z.enum(["high", "medium", "low"]),
    location: z.string().optional()
  })).max(20),
  confidence: z.number().min(0).max(1),
  metadata: z.object({
    processingTime: z.number(),
    modelVersion: z.string()
  }).optional()
});

type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
```

### 生成コンテンツスキーマ

```typescript
const GeneratedContentSchema = z.object({
  title: z.string().max(100),
  content: z.string().max(10000),
  tags: z.array(z.string()).max(10),
  metadata: z.object({
    wordCount: z.number().int().min(0),
    readingTime: z.number().int().min(0),
    language: z.enum(["ja", "en"])
  })
});
```

## バリデーションパターン

### 基本的な検証

```typescript
const result = AnalysisResultSchema.safeParse(aiOutput);

if (result.success) {
  // 型安全に使用可能
  const data: AnalysisResult = result.data;
} else {
  // エラーハンドリング
  console.error(result.error.format());
}
```

### エラー処理

```typescript
import { z, ZodError } from "zod";

try {
  const data = AnalysisResultSchema.parse(aiOutput);
  return data;
} catch (error) {
  if (error instanceof ZodError) {
    // 詳細なエラー情報
    const issues = error.issues.map(issue => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code
    }));

    // AIに修正を依頼するためのフィードバック生成
    return generateCorrectionPrompt(issues);
  }
  throw error;
}
```

### カスタムバリデーション

```typescript
const PositiveNumberSchema = z.number().refine(
  (val) => val > 0,
  { message: "正の数である必要があります" }
);

const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: "開始日は終了日より前である必要があります" }
);
```

## Vercel AI SDK との統合

### generateObject の使用

```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const result = await generateObject({
  model: openai("gpt-4"),
  schema: AnalysisResultSchema,
  prompt: "以下のテキストを分析してください..."
});

// result.object は型安全
const analysis: AnalysisResult = result.object;
```

### streamObject の使用

```typescript
import { streamObject } from "ai";

const { partialObjectStream } = await streamObject({
  model: openai("gpt-4"),
  schema: AnalysisResultSchema,
  prompt: "以下のテキストを分析してください..."
});

for await (const partialObject of partialObjectStream) {
  // 部分的なオブジェクトをストリーミング処理
  console.log(partialObject);
}
```

## トランスフォームパターン

### 入力の変換

```typescript
const InputSchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  amount: z.string().transform((val) => parseFloat(val))
});
```

### デフォルト値

```typescript
const ConfigSchema = z.object({
  maxRetries: z.number().default(3),
  timeout: z.number().default(30000),
  debug: z.boolean().default(false)
});
```

## エラーメッセージのカスタマイズ

```typescript
const UserInputSchema = z.object({
  name: z.string({
    required_error: "名前は必須です",
    invalid_type_error: "名前は文字列である必要があります"
  }).min(1, "名前は1文字以上必要です"),

  age: z.number({
    required_error: "年齢は必須です"
  }).min(0, "年齢は0以上である必要があります")
    .max(150, "年齢は150以下である必要があります")
});
```

## ベストプラクティス

### 1. スキーマの再利用

```typescript
// 共通スキーマ
const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0)
});

// 拡張して使用
const UserListSchema = PaginationSchema.extend({
  users: z.array(UserSchema)
});
```

### 2. 部分的なスキーマ

```typescript
// 完全なスキーマ
const FullUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  password: z.string()
});

// 更新用（idとpasswordを除外）
const UpdateUserSchema = FullUserSchema.omit({
  id: true,
  password: true
}).partial();
```

### 3. 判別共用体

```typescript
const ResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    data: z.object({ result: z.string() })
  }),
  z.object({
    status: z.literal("error"),
    error: z.object({
      code: z.string(),
      message: z.string()
    })
  })
]);
```
