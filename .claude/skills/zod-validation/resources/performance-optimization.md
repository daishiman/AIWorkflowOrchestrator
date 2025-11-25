# パフォーマンス最適化

## 概要

大規模なデータセットや高頻度のバリデーションにおけるZodのパフォーマンスを
最適化するためのテクニックを解説します。

## 基本的な最適化原則

### 1. スキーマのキャッシュ

```typescript
// ❌ 毎回スキーマを作成（非効率）
function validateUser(data: unknown) {
  const schema = z.object({
    id: z.string(),
    name: z.string(),
  });
  return schema.parse(data);
}

// ✅ スキーマを再利用（推奨）
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

function validateUser(data: unknown) {
  return userSchema.parse(data);
}
```

### 2. 不要な検証の回避

```typescript
// ❌ 内部データにも検証を適用
function internalProcess(data: InternalData) {
  const validated = schema.parse(data); // 不要な検証
  return process(validated);
}

// ✅ 境界（API、ユーザー入力）でのみ検証
function apiHandler(request: Request) {
  const validated = schema.parse(request.body); // 外部入力を検証
  return internalProcess(validated); // 内部では検証済みデータを使用
}
```

## スキーマ設計の最適化

### 1. フラットな構造を優先

```typescript
// ❌ 深いネストは遅い
const deepSchema = z.object({
  level1: z.object({
    level2: z.object({
      level3: z.object({
        level4: z.object({
          value: z.string(),
        }),
      }),
    }),
  }),
});

// ✅ フラットな構造は速い
const flatSchema = z.object({
  level1_level2_level3_level4_value: z.string(),
});

// または必要な深さのみ
const optimalSchema = z.object({
  nested: z.object({
    value: z.string(),
  }),
});
```

### 2. 配列のサイズ制限

```typescript
// ❌ 無制限の配列
const unboundedSchema = z.array(z.object({
  id: z.string(),
  data: z.string(),
}));

// ✅ サイズを制限
const boundedSchema = z.array(z.object({
  id: z.string(),
  data: z.string(),
})).max(1000); // 上限を設定

// より効率的な検証
const efficientArraySchema = z.array(z.string()).min(1).max(100);
```

### 3. strict() の適切な使用

```typescript
// strict() は追加のチェックを行うため遅くなる可能性
const strictSchema = z.object({
  name: z.string(),
}).strict(); // 追加プロパティがあるとエラー

// passthrough() は追加プロパティを許可（高速）
const passthroughSchema = z.object({
  name: z.string(),
}).passthrough();

// strip() は追加プロパティを除去（デフォルト動作と同じ）
const stripSchema = z.object({
  name: z.string(),
}).strip();
```

## バリデーション戦略の最適化

### 1. 早期失敗 (Early Return)

```typescript
// ❌ すべての検証を実行
const slowSchema = z.object({
  required1: z.string(),
  required2: z.string(),
  optional1: z.string().optional(),
  optional2: z.string().optional(),
  // 多くのオプションフィールド
});

// ✅ 重要なフィールドを先に検証
const fastSchema = z.object({
  // 必須フィールドを先に（早期失敗）
  required1: z.string(),
  required2: z.string(),
}).and(z.object({
  optional1: z.string().optional(),
  optional2: z.string().optional(),
}));
```

### 2. coerce vs transform

```typescript
// coerce は組み込みの型変換を使用（高速）
const coerceSchema = z.coerce.number();
const coerceDateSchema = z.coerce.date();

// transform はカスタム変換を実行（柔軟だが遅い場合がある）
const transformSchema = z.string().transform((s) => parseInt(s, 10));

// パフォーマンスが重要な場合は coerce を優先
```

### 3. 条件付きスキーマの最適化

```typescript
// ❌ union は順番に試行（遅い可能性）
const unionSchema = z.union([
  z.object({ type: z.literal('a'), dataA: z.string() }),
  z.object({ type: z.literal('b'), dataB: z.number() }),
  z.object({ type: z.literal('c'), dataC: z.boolean() }),
]);

// ✅ discriminatedUnion は判別フィールドで直接判定（高速）
const discriminatedSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('a'), dataA: z.string() }),
  z.object({ type: z.literal('b'), dataB: z.number() }),
  z.object({ type: z.literal('c'), dataC: z.boolean() }),
]);
```

## 大規模データの処理

### 1. バッチ処理

```typescript
// ❌ 個別に検証（遅い）
async function validateItems(items: unknown[]) {
  const results = [];
  for (const item of items) {
    results.push(itemSchema.parse(item));
  }
  return results;
}

// ✅ 配列として一括検証
async function validateItemsBatch(items: unknown[]) {
  const arraySchema = z.array(itemSchema);
  return arraySchema.parse(items);
}
```

### 2. ストリーミング検証

```typescript
// 大量データの逐次処理
async function* validateStream(
  dataStream: AsyncIterable<unknown>
): AsyncGenerator<ValidatedItem> {
  for await (const chunk of dataStream) {
    try {
      yield itemSchema.parse(chunk);
    } catch (error) {
      // エラーをログに記録して続行
      console.error('Validation error:', error);
    }
  }
}
```

### 3. Web Worker での非同期検証

```typescript
// メインスレッドをブロックしない検証
// worker.ts
self.onmessage = (event) => {
  const { data, schemaType } = event.data;
  const schema = getSchema(schemaType);
  const result = schema.safeParse(data);
  self.postMessage(result);
};

// main.ts
const worker = new Worker('./worker.ts');
worker.postMessage({ data: largeData, schemaType: 'user' });
worker.onmessage = (event) => {
  const result = event.data;
  // 結果を処理
};
```

## safeParse vs parse

### safeParse の利点

```typescript
// parse は例外をスローする
try {
  const result = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    // エラー処理
  }
}

// safeParse は例外をスローしない（若干高速）
const result = schema.safeParse(data);
if (result.success) {
  const data = result.data;
} else {
  const errors = result.error;
}

// 大量のバリデーションでは safeParse が推奨
function validateMany(items: unknown[]) {
  return items.map((item) => {
    const result = schema.safeParse(item);
    return result.success ? result.data : null;
  }).filter(Boolean);
}
```

## ベンチマーク指針

### パフォーマンス測定

```typescript
// 簡易ベンチマーク
function benchmark(name: string, fn: () => void, iterations = 10000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms for ${iterations} iterations`);
  console.log(`Average: ${((end - start) / iterations).toFixed(4)}ms per iteration`);
}

// 使用例
benchmark('userSchema.parse', () => {
  userSchema.parse({
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
  });
});
```

### 最適化の優先度

1. **高優先度**: スキーマの再利用、discriminatedUnion の使用
2. **中優先度**: フラット構造、配列サイズ制限
3. **低優先度**: Web Worker、ストリーミング処理

## アンチパターン

```typescript
// ❌ 動的スキーマ生成
function createSchema(fields: string[]) {
  const shape: Record<string, z.ZodString> = {};
  fields.forEach((f) => { shape[f] = z.string(); });
  return z.object(shape); // 毎回新しいスキーマを作成
}

// ❌ 過度な refine チェーン
const overRefineSchema = z.string()
  .refine(check1)
  .refine(check2)
  .refine(check3)
  .refine(check4)
  .refine(check5); // 各 refine で関数呼び出し

// ✅ まとめて検証
const optimizedSchema = z.string().refine((val) => {
  return check1(val) && check2(val) && check3(val);
});

// ❌ 不要な transform
const unnecessaryTransform = z.string()
  .transform((s) => s) // 何もしない transform
  .transform((s) => s.trim())
  .transform((s) => s); // 何もしない transform

// ✅ 必要な変換のみ
const minimalTransform = z.string().transform((s) => s.trim());
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
