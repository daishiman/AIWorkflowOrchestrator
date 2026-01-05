# CONV-03-03: チャンク・埋め込みスキーマ定義 - 受け入れ基準

**タスクID**: CONV-03-03
**作成日**: 2025-12-18
**担当エージェント**: .claude/agents/req-analyst.md
**形式**: Given-When-Then（テスト駆動開発対応）

---

## 1. 型定義に関する受け入れ基準

### AC-01: ChunkingStrategy列挙型の定義

**要件ID**: FR-01

**Given**: チャンキング戦略を型レベルで表現する必要がある
**When**: types.tsでChunkingStrategies列挙型を定義する
**Then**: 以下がすべて満たされている

- [ ] `ChunkingStrategies.FIXED_SIZE` が `"fixed_size"` として定義されている
- [ ] `ChunkingStrategies.SEMANTIC` が `"semantic"` として定義されている
- [ ] `ChunkingStrategies.RECURSIVE` が `"recursive"` として定義されている
- [ ] `ChunkingStrategies.SENTENCE` が `"sentence"` として定義されている
- [ ] `ChunkingStrategies.PARAGRAPH` が `"paragraph"` として定義されている
- [ ] `ChunkingStrategies.MARKDOWN_HEADER` が `"markdown_header"` として定義されている
- [ ] `ChunkingStrategies.CODE_BLOCK` が `"code_block"` として定義されている
- [ ] `ChunkingStrategy` 型が `typeof ChunkingStrategies[keyof typeof ChunkingStrategies]` として型推論可能
- [ ] 列挙型は `as const` で定義されている

**テスト方法**:

```typescript
// 型推論テスト
const strategy: ChunkingStrategy = ChunkingStrategies.RECURSIVE;
// @ts-expect-error - 不正な値は型エラー
const invalid: ChunkingStrategy = "invalid_strategy";
```

---

### AC-02: EmbeddingProvider列挙型の定義

**要件ID**: FR-02

**Given**: 埋め込みプロバイダーを型レベルで表現する必要がある
**When**: types.tsでEmbeddingProviders列挙型を定義する
**Then**: 以下がすべて満たされている

- [ ] `EmbeddingProviders.OPENAI` が `"openai"` として定義されている
- [ ] `EmbeddingProviders.COHERE` が `"cohere"` として定義されている
- [ ] `EmbeddingProviders.VOYAGE` が `"voyage"` として定義されている
- [ ] `EmbeddingProviders.LOCAL` が `"local"` として定義されている
- [ ] `EmbeddingProvider` 型が型推論可能
- [ ] 列挙型は `as const` で定義されている

**テスト方法**:

```typescript
// 型推論テスト
const provider: EmbeddingProvider = EmbeddingProviders.OPENAI;
// @ts-expect-error - 不正な値は型エラー
const invalid: EmbeddingProvider = "aws";
```

---

### AC-03: ChunkEntityインターフェースの定義

**要件ID**: FR-03

**Given**: チャンクを表現するエンティティ型が必要である
**When**: types.tsでChunkEntityインターフェースを定義する
**Then**: 以下がすべて満たされている

- [ ] `id: ChunkId` フィールドが定義されている
- [ ] `fileId: FileId` フィールドが定義されている
- [ ] `content: string` フィールドが定義されている
- [ ] `contextualContent: string | null` フィールドが定義されている
- [ ] `position: ChunkPosition` フィールドが定義されている
- [ ] `strategy: ChunkingStrategy` フィールドが定義されている
- [ ] `tokenCount: number` フィールドが定義されている
- [ ] `hash: string` フィールドが定義されている
- [ ] `Timestamped` インターフェースを継承している
- [ ] `WithMetadata` インターフェースを継承している
- [ ] 全フィールドが `readonly` 修飾子を持つ

**テスト方法**:

```typescript
// イミュータブル性テスト
const chunk: ChunkEntity = {
  /* ... */
};
// @ts-expect-error - readonly違反
chunk.content = "new content";
```

---

### AC-04: ChunkPositionインターフェースの定義

**要件ID**: FR-04

**Given**: チャンクの位置情報を表現する型が必要である
**When**: types.tsでChunkPositionインターフェースを定義する
**Then**: 以下がすべて満たされている

- [ ] `index: number` フィールドが定義されている
- [ ] `startLine: number` フィールドが定義されている
- [ ] `endLine: number` フィールドが定義されている
- [ ] `startChar: number` フィールドが定義されている
- [ ] `endChar: number` フィールドが定義されている
- [ ] `parentHeader: string | null` フィールドが定義されている
- [ ] 全フィールドが `readonly` 修飾子を持つ

**テスト方法**:

```typescript
// 型の完全性テスト
const position: ChunkPosition = {
  index: 0,
  startLine: 1,
  endLine: 10,
  startChar: 0,
  endChar: 500,
  parentHeader: "Introduction",
};
```

---

### AC-05: EmbeddingEntityインターフェースの定義

**要件ID**: FR-05

**Given**: 埋め込みベクトルを表現するエンティティ型が必要である
**When**: types.tsでEmbeddingEntityインターフェースを定義する
**Then**: 以下がすべて満たされている

- [ ] `id: EmbeddingId` フィールドが定義されている
- [ ] `chunkId: ChunkId` フィールドが定義されている
- [ ] `vector: Float32Array` フィールドが定義されている
- [ ] `modelId: string` フィールドが定義されている
- [ ] `dimensions: number` フィールドが定義されている
- [ ] `normalizedMagnitude: number` フィールドが定義されている
- [ ] `Timestamped` インターフェースを継承している
- [ ] 全フィールドが `readonly` 修飾子を持つ

**テスト方法**:

```typescript
// Float32Array型チェック
const embedding: EmbeddingEntity = {
  /* ... */
  vector: new Float32Array([0.1, 0.2, 0.3]),
  /* ... */
};
```

---

### AC-06: ChunkingConfigインターフェースの定義

**要件ID**: FR-06

**Given**: チャンキング設定パラメータを表現する型が必要である
**When**: types.tsでChunkingConfigインターフェースを定義する
**Then**: 以下がすべて満たされている

- [ ] `strategy: ChunkingStrategy` フィールドが定義されている
- [ ] `targetSize: number` フィールドが定義されている
- [ ] `minSize: number` フィールドが定義されている
- [ ] `maxSize: number` フィールドが定義されている
- [ ] `overlapSize: number` フィールドが定義されている
- [ ] `preserveBoundaries: boolean` フィールドが定義されている
- [ ] `includeContext: boolean` フィールドが定義されている
- [ ] 全フィールドが `readonly` 修飾子を持つ

**テスト方法**:

```typescript
// 型の完全性テスト
const config: ChunkingConfig = {
  strategy: ChunkingStrategies.RECURSIVE,
  targetSize: 512,
  minSize: 100,
  maxSize: 1024,
  overlapSize: 50,
  preserveBoundaries: true,
  includeContext: true,
};
```

---

## 2. Zodスキーマに関する受け入れ基準

### AC-07: chunkingStrategySchemaの定義

**要件ID**: FR-01

**Given**: チャンキング戦略のランタイムバリデーションが必要である
**When**: schemas.tsでchunkingStrategySchemaを定義する
**Then**: 以下がすべて満たされている

- [ ] `z.enum(["fixed_size", "semantic", "recursive", "sentence", "paragraph", "markdown_header", "code_block"])` として定義されている
- [ ] 正常値（"recursive"等）でバリデーション成功
- [ ] 異常値（"invalid"）でバリデーションエラー
- [ ] エラーメッセージが明確（"Invalid enum value. Expected 'fixed_size' | 'semantic' | ..."）

**テスト方法**:

```typescript
// 正常系
expect(chunkingStrategySchema.parse("recursive")).toBe("recursive");
// 異常系
expect(() => chunkingStrategySchema.parse("invalid")).toThrow();
```

---

### AC-08: chunkPositionSchemaの定義

**要件ID**: FR-04

**Given**: チャンク位置情報のバリデーションが必要である
**When**: schemas.tsでchunkPositionSchemaを定義する
**Then**: 以下がすべて満たされている

- [ ] `index` は `z.number().int().min(0)` として定義されている
- [ ] `startLine` は `z.number().int().min(1)` として定義されている
- [ ] `endLine` は `z.number().int().min(1)` として定義されている
- [ ] `startChar` は `z.number().int().min(0)` として定義されている
- [ ] `endChar` は `z.number().int().min(0)` として定義されている
- [ ] `parentHeader` は `z.string().nullable()` として定義されている
- [ ] 境界値（index=0、startLine=1）で成功
- [ ] 境界値違反（index=-1、startLine=0）で失敗

**テスト方法**:

```typescript
// 正常系
const validPosition = chunkPositionSchema.parse({
  index: 0,
  startLine: 1,
  endLine: 10,
  startChar: 0,
  endChar: 500,
  parentHeader: null,
});
// 異常系（index < 0）
expect(() => chunkPositionSchema.parse({ index: -1 /* ... */ })).toThrow();
// 異常系（startLine < 1）
expect(() =>
  chunkPositionSchema.parse({ /* ... */ startLine: 0 /* ... */ }),
).toThrow();
```

---

### AC-09: chunkEntitySchemaの定義

**要件ID**: FR-03

**Given**: ChunkEntityのランタイムバリデーションが必要である
**When**: schemas.tsでchunkEntitySchemaを定義する
**Then**: 以下がすべて満たされている

- [ ] `id: uuidSchema` として定義されている
- [ ] `fileId: uuidSchema` として定義されている
- [ ] `content: z.string().min(1)` として定義されている
- [ ] `contextualContent: z.string().nullable()` として定義されている
- [ ] `position: chunkPositionSchema` として定義されている
- [ ] `strategy: chunkingStrategySchema` として定義されている
- [ ] `tokenCount: z.number().int().min(1)` として定義されている
- [ ] `hash: z.string().length(64)` として定義されている（SHA-256は64文字）
- [ ] `metadata: metadataSchema` として定義されている
- [ ] `timestampedSchema` をマージしている
- [ ] 正常値で成功、各フィールドの制約違反で失敗

**テスト方法**:

```typescript
// 正常系
const validChunk = chunkEntitySchema.parse({
  id: "550e8400-e29b-41d4-a716-446655440000",
  fileId: "660e8400-e29b-41d4-a716-446655440000",
  content: "This is a chunk",
  contextualContent: "Context: This is a chunk",
  position: {
    /* ... */
  },
  strategy: "recursive",
  tokenCount: 10,
  hash: "a".repeat(64),
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
});
// 異常系（content空文字）
expect(() =>
  chunkEntitySchema.parse({ /* ... */ content: "" /* ... */ }),
).toThrow();
// 異常系（hash長さ違反）
expect(() =>
  chunkEntitySchema.parse({ /* ... */ hash: "abc" /* ... */ }),
).toThrow();
```

---

### AC-10: chunkingConfigSchemaの定義とrefine検証

**要件ID**: FR-06

**Given**: チャンキング設定のバリデーションが必要である
**When**: schemas.tsでchunkingConfigSchemaを定義する
**Then**: 以下がすべて満たされている

- [ ] `strategy: chunkingStrategySchema` として定義されている
- [ ] `targetSize: z.number().int().min(50).max(2000).default(512)` として定義されている
- [ ] `minSize: z.number().int().min(10).max(1000).default(100)` として定義されている
- [ ] `maxSize: z.number().int().min(100).max(4000).default(1024)` として定義されている
- [ ] `overlapSize: z.number().int().min(0).max(500).default(50)` として定義されている
- [ ] `preserveBoundaries: z.boolean().default(true)` として定義されている
- [ ] `includeContext: z.boolean().default(true)` として定義されている
- [ ] `.refine()` で `minSize <= targetSize && targetSize <= maxSize` を検証
- [ ] 複合条件違反時にエラーメッセージ `"minSize <= targetSize <= maxSize must hold"` が表示される

**テスト方法**:

```typescript
// 正常系（デフォルト値）
const config1 = chunkingConfigSchema.parse({
  strategy: "recursive",
});
expect(config1.targetSize).toBe(512);
expect(config1.minSize).toBe(100);

// 正常系（カスタム値、制約を満たす）
const config2 = chunkingConfigSchema.parse({
  strategy: "fixed_size",
  targetSize: 500,
  minSize: 200,
  maxSize: 800,
  overlapSize: 50,
  preserveBoundaries: false,
  includeContext: true,
});

// 異常系（minSize > targetSize）
expect(() =>
  chunkingConfigSchema.parse({
    strategy: "recursive",
    targetSize: 100,
    minSize: 200,
    maxSize: 500,
  }),
).toThrow("minSize <= targetSize <= maxSize must hold");

// 異常系（targetSize > maxSize）
expect(() =>
  chunkingConfigSchema.parse({
    strategy: "recursive",
    targetSize: 1500,
    minSize: 100,
    maxSize: 1000,
  }),
).toThrow("minSize <= targetSize <= maxSize must hold");
```

---

### AC-11: embeddingModelConfigSchemaの定義

**要件ID**: FR-02

**Given**: 埋め込みモデル設定のバリデーションが必要である
**When**: schemas.tsでembeddingModelConfigSchemaを定義する
**Then**: 以下がすべて満たされている

- [ ] `provider: embeddingProviderSchema` として定義されている
- [ ] `modelId: z.string().min(1)` として定義されている
- [ ] `dimensions: z.number().int().min(64).max(4096)` として定義されている
- [ ] `maxTokens: z.number().int().min(1).max(8192)` として定義されている
- [ ] `batchSize: z.number().int().min(1).max(100)` として定義されている
- [ ] 境界値（dimensions=64、4096）で成功
- [ ] 境界値違反（dimensions=63、4097）で失敗

**テスト方法**:

```typescript
// 正常系
const config = embeddingModelConfigSchema.parse({
  provider: "openai",
  modelId: "text-embedding-3-small",
  dimensions: 1536,
  maxTokens: 8191,
  batchSize: 100,
});

// 異常系（dimensions範囲外）
expect(() =>
  embeddingModelConfigSchema.parse({
    provider: "openai",
    modelId: "custom",
    dimensions: 5000, // > 4096
    maxTokens: 8191,
    batchSize: 100,
  }),
).toThrow();
```

---

### AC-12: embeddingEntitySchemaの定義

**要件ID**: FR-05

**Given**: 埋め込みエンティティのバリデーションが必要である
**When**: schemas.tsでembeddingEntitySchemaを定義する
**Then**: 以下がすべて満たされている

- [ ] `id: uuidSchema` として定義されている
- [ ] `chunkId: uuidSchema` として定義されている
- [ ] `vector: z.array(z.number()).min(64).max(4096)` として定義されている
- [ ] `modelId: z.string().min(1)` として定義されている
- [ ] `dimensions: z.number().int().min(64).max(4096)` として定義されている
- [ ] `normalizedMagnitude: z.number().min(0.99).max(1.01)` として定義されている
- [ ] `timestampedSchema` をマージしている
- [ ] 正規化ベクトル（magnitude ≈ 1.0）で成功
- [ ] 正規化されていないベクトル（magnitude < 0.99 or > 1.01）で失敗

**テスト方法**:

```typescript
// 正常系（正規化済みベクトル）
const embedding = embeddingEntitySchema.parse({
  id: "550e8400-e29b-41d4-a716-446655440000",
  chunkId: "660e8400-e29b-41d4-a716-446655440000",
  vector: [0.6, 0.8], // magnitude = 1.0
  modelId: "text-embedding-3-small",
  dimensions: 2,
  normalizedMagnitude: 1.0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 異常系（normalizedMagnitude範囲外）
expect(() =>
  embeddingEntitySchema.parse({
    /* ... */
    normalizedMagnitude: 1.5, // > 1.01
    /* ... */
  }),
).toThrow();
```

---

### AC-13: batchEmbeddingInputSchemaの定義

**要件ID**: FR-13

**Given**: バッチ埋め込み入力のバリデーションが必要である
**When**: schemas.tsでbatchEmbeddingInputSchemaを定義する
**Then**: 以下がすべて満たされている

- [ ] `chunks: z.array(z.object({ id: uuidSchema, content: z.string().min(1) })).min(1).max(100)` として定義されている
- [ ] `modelConfig: embeddingModelConfigSchema` として定義されている
- [ ] バッチサイズ1件で成功
- [ ] バッチサイズ100件で成功
- [ ] バッチサイズ0件（空配列）で失敗
- [ ] バッチサイズ101件で失敗

**テスト方法**:

```typescript
// 正常系（境界値）
const batch = batchEmbeddingInputSchema.parse({
  chunks: [{ id: "550e8400-...", content: "text" }],
  modelConfig: {
    /* ... */
  },
});

// 異常系（バッチサイズ超過）
const chunks101 = Array(101).fill({ id: "550e8400-...", content: "text" });
expect(() =>
  batchEmbeddingInputSchema.parse({
    chunks: chunks101,
    modelConfig: {
      /* ... */
    },
  }),
).toThrow();
```

---

## 3. ユーティリティ関数に関する受け入れ基準

### AC-14: normalizeVector関数の実装

**要件ID**: FR-07

**Given**: ベクトルをL2正規化する必要がある
**When**: utils.tsでnormalizeVector関数を実装する
**Then**: 以下がすべて満たされている

- [ ] 入力: `Float32Array`、出力: `Float32Array`
- [ ] 正規化後のベクトルの大きさが1.0である（誤差 < 0.0001）
- [ ] ゼロベクトルの場合は元のベクトルをそのまま返す（ゼロ除算回避）
- [ ] 副作用なし（元のベクトルは変更されない）

**テスト方法**:

```typescript
// 正常系
const v = new Float32Array([3, 4]);
const normalized = normalizeVector(v);
expect(normalized[0]).toBeCloseTo(0.6, 5);
expect(normalized[1]).toBeCloseTo(0.8, 5);
expect(vectorMagnitude(normalized)).toBeCloseTo(1.0, 5);

// ゼロベクトル
const zero = new Float32Array([0, 0]);
expect(normalizeVector(zero)).toEqual(zero);

// イミュータブル性
const original = new Float32Array([3, 4]);
const result = normalizeVector(original);
expect(original[0]).toBe(3); // 元のベクトルは変更されない
```

---

### AC-15: cosineSimilarity関数の実装

**要件ID**: FR-07

**Given**: 2つのベクトル間のコサイン類似度を計算する必要がある
**When**: utils.tsでcosineSimilarity関数を実装する
**Then**: 以下がすべて満たされている

- [ ] 入力: 2つの`Float32Array`、出力: `number`（-1〜1）
- [ ] 同一ベクトルの類似度は1.0
- [ ] 直交ベクトルの類似度は0.0
- [ ] 反対方向ベクトルの類似度は-1.0
- [ ] ゼロベクトルが含まれる場合は0.0を返す
- [ ] 次元数が異なる場合は `Error("Vector dimensions must match")` をスロー

**テスト方法**:

```typescript
// 同一ベクトル
const v1 = new Float32Array([1, 2, 3]);
expect(cosineSimilarity(v1, v1)).toBeCloseTo(1.0, 5);

// 直交ベクトル
const v2 = new Float32Array([1, 0]);
const v3 = new Float32Array([0, 1]);
expect(cosineSimilarity(v2, v3)).toBeCloseTo(0.0, 5);

// 反対方向
const v4 = new Float32Array([1, 2]);
const v5 = new Float32Array([-1, -2]);
expect(cosineSimilarity(v4, v5)).toBeCloseTo(-1.0, 5);

// ゼロベクトル
const zero = new Float32Array([0, 0]);
expect(cosineSimilarity(v1, zero)).toBe(0);

// 次元数不一致
expect(() =>
  cosineSimilarity(new Float32Array([1, 2]), new Float32Array([1, 2, 3])),
).toThrow("Vector dimensions must match");
```

---

### AC-16: euclideanDistance関数の実装

**要件ID**: FR-07

**Given**: 2つのベクトル間のユークリッド距離を計算する必要がある
**When**: utils.tsでeuclideanDistance関数を実装する
**Then**: 以下がすべて満たされている

- [ ] 入力: 2つの`Float32Array`、出力: `number`（>= 0）
- [ ] 同一ベクトルの距離は0.0
- [ ] 距離の計算式: `sqrt(sum((a[i] - b[i])^2))`
- [ ] 次元数が異なる場合は `Error("Vector dimensions must match")` をスロー

**テスト方法**:

```typescript
// 同一ベクトル
const v1 = new Float32Array([1, 2, 3]);
expect(euclideanDistance(v1, v1)).toBe(0);

// 距離計算
const v2 = new Float32Array([0, 0]);
const v3 = new Float32Array([3, 4]);
expect(euclideanDistance(v2, v3)).toBeCloseTo(5.0, 5); // sqrt(3^2 + 4^2) = 5

// 次元数不一致
expect(() =>
  euclideanDistance(new Float32Array([1, 2]), new Float32Array([1, 2, 3])),
).toThrow("Vector dimensions must match");
```

---

### AC-17: dotProduct関数の実装

**要件ID**: FR-07

**Given**: 正規化済みベクトルの内積を計算する必要がある
**When**: utils.tsでdotProduct関数を実装する
**Then**: 以下がすべて満たされている

- [ ] 入力: 2つの`Float32Array`、出力: `number`
- [ ] 内積の計算式: `sum(a[i] * b[i])`
- [ ] 正規化済みベクトルの内積 = コサイン類似度
- [ ] 次元数が異なる場合は `Error("Vector dimensions must match")` をスロー

**テスト方法**:

```typescript
// 内積計算
const v1 = new Float32Array([1, 2, 3]);
const v2 = new Float32Array([4, 5, 6]);
expect(dotProduct(v1, v2)).toBe(1 * 4 + 2 * 5 + 3 * 6); // = 32

// 正規化済みベクトルの内積
const n1 = normalizeVector(new Float32Array([1, 2]));
const n2 = normalizeVector(new Float32Array([3, 4]));
const dot = dotProduct(n1, n2);
const cos = cosineSimilarity(
  new Float32Array([1, 2]),
  new Float32Array([3, 4]),
);
expect(dot).toBeCloseTo(cos, 5);
```

---

### AC-18: vectorToBase64とbase64ToVectorの往復変換

**要件ID**: FR-08

**Given**: ベクトルをBase64文字列に変換・復元する必要がある
**When**: utils.tsでvectorToBase64とbase64ToVector関数を実装する
**Then**: 以下がすべて満たされている

- [ ] `vectorToBase64(vector: Float32Array): string` として定義されている
- [ ] `base64ToVector(base64: string): Float32Array` として定義されている
- [ ] 往復変換でデータ損失なし（元のベクトルと完全一致）
- [ ] 空ベクトル（長さ0）でも動作
- [ ] 大きなベクトル（4096次元）でも動作

**テスト方法**:

```typescript
// 往復変換（データ損失なし）
const original = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
const base64 = vectorToBase64(original);
const restored = base64ToVector(base64);
expect(restored).toEqual(original);

// 各要素が完全一致
for (let i = 0; i < original.length; i++) {
  expect(restored[i]).toBe(original[i]);
}

// 空ベクトル
const empty = new Float32Array([]);
expect(base64ToVector(vectorToBase64(empty))).toEqual(empty);

// 大きなベクトル
const large = new Float32Array(4096).fill(0.5);
expect(base64ToVector(vectorToBase64(large)).length).toBe(4096);
```

---

### AC-19: estimateTokenCount関数の実装

**要件ID**: FR-09

**Given**: テキストのトークン数を簡易推定する必要がある
**When**: utils.tsでestimateTokenCount関数を実装する
**Then**: 以下がすべて満たされている

- [ ] 入力: `string`、出力: `number`
- [ ] 英語テキストの推定: 約4文字 = 1トークン
- [ ] 日本語テキストの推定: 約1.5文字 = 1トークン
- [ ] 混在テキストで英語・非英語を分離して計算
- [ ] 空文字列で0を返す

**テスト方法**:

```typescript
// 英語のみ
const english = "hello world"; // 11文字 → 約3トークン
expect(estimateTokenCount(english)).toBeGreaterThanOrEqual(2);
expect(estimateTokenCount(english)).toBeLessThanOrEqual(4);

// 日本語のみ
const japanese = "こんにちは"; // 5文字 → 約3〜4トークン
expect(estimateTokenCount(japanese)).toBeGreaterThanOrEqual(3);
expect(estimateTokenCount(japanese)).toBeLessThanOrEqual(5);

// 混在
const mixed = "Hello こんにちは";
const count = estimateTokenCount(mixed);
expect(count).toBeGreaterThan(0);

// 空文字列
expect(estimateTokenCount("")).toBe(0);
```

---

### AC-20: デフォルト設定の提供

**要件ID**: FR-10

**Given**: 開発者が即座に使えるデフォルト設定が必要である
**When**: utils.tsでdefaultChunkingConfigとdefaultEmbeddingModelConfigsを定義する
**Then**: 以下がすべて満たされている

- [ ] `defaultChunkingConfig: ChunkingConfig` が定義されている
- [ ] `defaultChunkingConfig.strategy` が `ChunkingStrategies.RECURSIVE` である
- [ ] `defaultChunkingConfig.targetSize` が `512` である
- [ ] `defaultChunkingConfig.minSize` が `100` である
- [ ] `defaultChunkingConfig.maxSize` が `1024` である
- [ ] `defaultChunkingConfig.overlapSize` が `50` である
- [ ] `defaultChunkingConfig.preserveBoundaries` が `true` である
- [ ] `defaultChunkingConfig.includeContext` が `true` である
- [ ] `defaultEmbeddingModelConfigs["text-embedding-3-small"]` が定義されている
- [ ] `defaultEmbeddingModelConfigs["text-embedding-3-large"]` が定義されている
- [ ] `defaultEmbeddingModelConfigs["embed-english-v3.0"]` が定義されている
- [ ] `defaultEmbeddingModelConfigs["voyage-large-2"]` が定義されている

**テスト方法**:

```typescript
// デフォルト設定の検証
expect(defaultChunkingConfig.strategy).toBe(ChunkingStrategies.RECURSIVE);
expect(defaultChunkingConfig.targetSize).toBe(512);

// chunkingConfigSchemaでバリデーション成功
expect(() => chunkingConfigSchema.parse(defaultChunkingConfig)).not.toThrow();

// 埋め込みモデル設定の検証
const openaiSmall = defaultEmbeddingModelConfigs["text-embedding-3-small"];
expect(openaiSmall.provider).toBe(EmbeddingProviders.OPENAI);
expect(openaiSmall.dimensions).toBe(1536);

// embeddingModelConfigSchemaでバリデーション成功
expect(() => embeddingModelConfigSchema.parse(openaiSmall)).not.toThrow();
```

---

## 4. 非機能要件に関する受け入れ基準

### AC-21: 型安全性（Branded Types）

**要件ID**: NFR-01

**Given**: 異なるID型の誤用を防ぐ必要がある
**When**: ChunkId、EmbeddingId等をBranded Typesとして定義する
**Then**: 以下がすべて満たされている

- [ ] `ChunkId` 型が `Brand<string, "ChunkId">` として定義されている
- [ ] `EmbeddingId` 型が `Brand<string, "EmbeddingId">` として定義されている
- [ ] `ChunkId` と `string` は構造的に互換性がない（型エラーが発生）
- [ ] `ChunkId` と `EmbeddingId` は互換性がない（型エラーが発生）

**テスト方法**:

```typescript
// 型エラーテスト（コンパイル時）
const chunkId = generateChunkId();
const embeddingId = generateEmbeddingId();

// @ts-expect-error - ChunkId と string は互換性なし
const str: string = chunkId;

// @ts-expect-error - ChunkId と EmbeddingId は互換性なし
const wrongId: EmbeddingId = chunkId;
```

---

### AC-22: イミュータブル設計

**要件ID**: NFR-01

**Given**: エンティティの不変性を保証する必要がある
**When**: 全フィールドにreadonly修飾子を適用する
**Then**: 以下がすべて満たされている

- [ ] `ChunkEntity` の全フィールドが `readonly`
- [ ] `EmbeddingEntity` の全フィールドが `readonly`
- [ ] `ChunkPosition` の全フィールドが `readonly`
- [ ] `ChunkingConfig` の全フィールドが `readonly`
- [ ] フィールドへの代入時に型エラーが発生

**テスト方法**:

```typescript
// 型エラーテスト（コンパイル時）
const chunk: ChunkEntity = {
  /* ... */
};
// @ts-expect-error - readonly違反
chunk.content = "new content";

const config: ChunkingConfig = {
  /* ... */
};
// @ts-expect-error - readonly違反
config.targetSize = 1000;
```

---

### AC-23: Zodスキーマカバレッジ100%

**要件ID**: NFR-02

**Given**: 全型に対応するZodスキーマが必要である
**When**: schemas.tsで全型のスキーマを定義する
**Then**: 以下がすべて満たされている

- [ ] `ChunkingStrategy` → `chunkingStrategySchema`
- [ ] `ChunkPosition` → `chunkPositionSchema`
- [ ] `ChunkEntity` → `chunkEntitySchema`
- [ ] `ChunkOverlap` → `chunkOverlapSchema`
- [ ] `EmbeddingProvider` → `embeddingProviderSchema`
- [ ] `EmbeddingModelConfig` → `embeddingModelConfigSchema`
- [ ] `EmbeddingEntity` → `embeddingEntitySchema`
- [ ] `ChunkingConfig` → `chunkingConfigSchema`
- [ ] `ChunkingResult` → `chunkingResultSchema`
- [ ] `EmbeddingGenerationResult` → `embeddingGenerationResultSchema`
- [ ] バッチ入力 → `batchEmbeddingInputSchema`

**テスト方法**:

```typescript
// 各型のインスタンスをスキーマでバリデーション
const chunk: ChunkEntity = {
  /* ... */
};
expect(() => chunkEntitySchema.parse(chunk)).not.toThrow();

const embedding: EmbeddingEntity = {
  /* ... */
};
expect(() => embeddingEntitySchema.parse(embedding)).not.toThrow();
```

---

### AC-24: テストカバレッジ80%以上

**要件ID**: NFR-05

**Given**: 高品質なコードを保証する必要がある
**When**: 単体テストを作成し、Vitestカバレッジレポートを生成する
**Then**: 以下がすべて満たされている

- [ ] Statements カバレッジ >= 80%
- [ ] Branches カバレッジ >= 80%
- [ ] Functions カバレッジ >= 80%
- [ ] Lines カバレッジ >= 80%
- [ ] 未カバー箇所の理由が明確（意図的な除外、到達不可能なコード等）

**テスト方法**:

```bash
pnpm --filter @repo/shared test:coverage
# coverage/index.html を確認
```

---

### AC-25: TypeScript型エラーゼロ

**要件ID**: NFR-01

**Given**: 型安全性を保証する必要がある
**When**: TypeScript厳格モード（strict: true）で型チェックを実行する
**Then**: 以下がすべて満たされている

- [ ] `tsc --noEmit` で型エラーが0件
- [ ] `any` 型の使用がない
- [ ] `as any` 型アサーションの使用がない
- [ ] 全関数の戻り値型が明示的（型推論に頼らない）

**テスト方法**:

```bash
cd packages/shared
pnpm exec tsc --noEmit
# エラー: 0
```

---

### AC-26: ESLintエラーゼロ

**要件ID**: NFR-04

**Given**: コーディング規約を遵守する必要がある
**When**: ESLintで静的解析を実行する
**Then**: 以下がすべて満たされている

- [ ] `eslint packages/shared/src/types/rag/chunk/` でエラーが0件
- [ ] @typescript-eslint/recommendedルールに準拠
- [ ] Prettierと競合なし

**テスト方法**:

```bash
pnpm --filter @repo/shared lint
# エラー: 0、警告: 0
```

---

## 5. 統合受け入れ基準

### AC-27: バレルエクスポートの動作確認

**要件ID**: FR全般

**Given**: 外部から型・スキーマ・ユーティリティをインポートする必要がある
**When**: index.tsでバレルエクスポートを実装する
**Then**: 以下がすべて満たされている

- [ ] `import { ChunkEntity } from '@repo/shared/types/rag/chunk'` が成功
- [ ] `import { chunkEntitySchema } from '@repo/shared/types/rag/chunk'` が成功
- [ ] `import { normalizeVector } from '@repo/shared/types/rag/chunk'` が成功
- [ ] 型推論が正しく動作（VSCodeの補完で確認）
- [ ] 循環依存がない

**テスト方法**:

```typescript
// 統合インポートテスト
import {
  ChunkEntity,
  ChunkingStrategy,
  EmbeddingEntity,
  chunkEntitySchema,
  embeddingEntitySchema,
  normalizeVector,
  cosineSimilarity,
  defaultChunkingConfig,
} from "@repo/shared/types/rag/chunk";

// 型推論が動作
const chunk: ChunkEntity = {
  /* ... */
};
const similarity = cosineSimilarity(
  new Float32Array([1, 2]),
  new Float32Array([3, 4]),
);
```

---

### AC-28: CONV-03-01との整合性

**要件ID**: アーキテクチャ制約

**Given**: CONV-03-01の基本型を継承する必要がある
**When**: types.tsで型定義を実装する
**Then**: 以下がすべて満たされている

- [ ] `ChunkId`、`EmbeddingId` が `packages/shared/src/types/rag/branded.ts` でエクスポートされている
- [ ] `Timestamped`、`WithMetadata` インターフェースを正しく継承
- [ ] `uuidSchema`、`timestampedSchema`、`metadataSchema` を正しくインポート
- [ ] CONV-03-01で定義されていない新規Branded Typesはbranded.tsに追加

**テスト方法**:

```typescript
// インポートテスト
import { ChunkId, EmbeddingId } from "@repo/shared/types/rag/branded";
import { Timestamped, WithMetadata } from "@repo/shared/types/rag/interfaces";

// 継承確認
const chunk: ChunkEntity = {
  /* ... */
};
const createdAt: Date = chunk.createdAt; // Timestampedより
const metadata: Record<string, unknown> = chunk.metadata; // WithMetadataより
```

---

## 6. エッジケース受け入れ基準

### AC-29: ゼロベクトル処理

**要件ID**: FR-07

**Given**: ゼロベクトルが入力される可能性がある
**When**: ベクトル操作関数を実行する
**Then**: 以下がすべて満たされている

- [ ] `normalizeVector(ゼロベクトル)` は元のベクトルを返す（例外をスローしない）
- [ ] `vectorMagnitude(ゼロベクトル)` は `0` を返す
- [ ] `cosineSimilarity(ゼロベクトル, 任意のベクトル)` は `0` を返す（例外をスローしない）

**テスト方法**:

```typescript
const zero = new Float32Array([0, 0, 0]);
expect(normalizeVector(zero)).toEqual(zero);
expect(vectorMagnitude(zero)).toBe(0);
expect(cosineSimilarity(zero, new Float32Array([1, 2, 3]))).toBe(0);
```

---

### AC-30: 次元数不一致エラー

**要件ID**: FR-07

**Given**: 異なる次元数のベクトルが入力される可能性がある
**When**: ベクトル操作関数（2つのベクトルを取る関数）を実行する
**Then**: 以下がすべて満たされている

- [ ] `cosineSimilarity` で次元数不一致時に `Error("Vector dimensions must match")` をスロー
- [ ] `euclideanDistance` で次元数不一致時に `Error("Vector dimensions must match")` をスロー
- [ ] `dotProduct` で次元数不一致時に `Error("Vector dimensions must match")` をスロー

**テスト方法**:

```typescript
const v1 = new Float32Array([1, 2]);
const v2 = new Float32Array([1, 2, 3]);

expect(() => cosineSimilarity(v1, v2)).toThrow("Vector dimensions must match");
expect(() => euclideanDistance(v1, v2)).toThrow("Vector dimensions must match");
expect(() => dotProduct(v1, v2)).toThrow("Vector dimensions must match");
```

---

### AC-31: 浮動小数点演算の精度

**要件ID**: NFR-03

**Given**: 浮動小数点演算には誤差が伴う
**When**: ベクトル操作関数のテストを作成する
**Then**: 以下がすべて満たされている

- [ ] テストでは `toBeCloseTo(expected, numDigits)` を使用（完全一致ではなく許容範囲）
- [ ] 正規化後のベクトル大きさは `toBeCloseTo(1.0, 5)` で検証（小数点以下5桁）
- [ ] コサイン類似度は `toBeCloseTo(expected, 5)` で検証

**テスト方法**:

```typescript
const v = new Float32Array([3, 4]);
const normalized = normalizeVector(v);
const magnitude = vectorMagnitude(normalized);
// 完全一致ではなく許容範囲で検証
expect(magnitude).toBeCloseTo(1.0, 5);
```

---

## 7. パフォーマンス受け入れ基準

### AC-32: ベクトル操作のパフォーマンス

**要件ID**: NFR-03

**Given**: 大量のベクトル操作が実行される可能性がある
**When**: 1000次元のベクトルで類似度計算を実行する
**Then**: 以下がすべて満たされている

- [ ] 1回の `cosineSimilarity` 呼び出しが < 1ms
- [ ] 1回の `normalizeVector` 呼び出しが < 1ms
- [ ] 1000回の連続呼び出しが < 1秒

**テスト方法**:

```typescript
const v1 = new Float32Array(1000).map(() => Math.random());
const v2 = new Float32Array(1000).map(() => Math.random());

const start = performance.now();
for (let i = 0; i < 1000; i++) {
  cosineSimilarity(v1, v2);
}
const elapsed = performance.now() - start;
expect(elapsed).toBeLessThan(1000); // < 1秒
```

---

### AC-33: Base64変換のパフォーマンス

**要件ID**: NFR-03

**Given**: 大量の埋め込みベクトルを変換する可能性がある
**When**: 1000個の1536次元ベクトルをBase64変換する
**Then**: 以下がすべて満たされている

- [ ] 1000ベクトルの変換が < 100ms
- [ ] 往復変換（1000ベクトル）が < 200ms

**テスト方法**:

```typescript
const vectors = Array(1000)
  .fill(null)
  .map(() => new Float32Array(1536).map(() => Math.random()));

const start = performance.now();
const base64Strings = vectors.map(vectorToBase64);
const elapsed = performance.now() - start;
expect(elapsed).toBeLessThan(100);
```

---

## 8. ドキュメント受け入れ基準

### AC-34: JSDocコメントの完全性

**要件ID**: NFR-04

**Given**: 型定義は自己文書化されている必要がある
**When**: types.tsで型・インターフェースを定義する
**Then**: 以下がすべて満たされている

- [ ] 全インターフェースにJSDocコメントが付いている
- [ ] 全パブリック関数にJSDocコメントが付いている
- [ ] JSDocに `@param`、`@returns`、`@example` が含まれる
- [ ] 複雑なロジックには実装コメントが付いている

**テスト方法**:

- VSCodeでホバー時にJSDocが表示される
- TypeDoc等のドキュメント生成ツールで正しくレンダリングされる

---

## 9. 全体完了基準

### AC-35: 全受け入れ基準の達成

**要件ID**: 全要件

**Given**: タスクCONV-03-03を完了する必要がある
**When**: 全フェーズ（Phase 0〜9）を完了する
**Then**: 以下がすべて満たされている

**型定義（types.ts）**:

- [ ] AC-01: ChunkingStrategy列挙型
- [ ] AC-02: EmbeddingProvider列挙型
- [ ] AC-03: ChunkEntityインターフェース
- [ ] AC-04: ChunkPositionインターフェース
- [ ] AC-05: EmbeddingEntityインターフェース
- [ ] AC-06: ChunkingConfigインターフェース

**Zodスキーマ（schemas.ts）**:

- [ ] AC-07: chunkingStrategySchema
- [ ] AC-08: chunkPositionSchema
- [ ] AC-09: chunkEntitySchema
- [ ] AC-10: chunkingConfigSchemaとrefine検証
- [ ] AC-11: embeddingModelConfigSchema
- [ ] AC-12: embeddingEntitySchema
- [ ] AC-13: batchEmbeddingInputSchema
- [ ] AC-23: Zodスキーマカバレッジ100%

**ユーティリティ関数（utils.ts）**:

- [ ] AC-14: normalizeVector関数
- [ ] AC-15: cosineSimilarity関数
- [ ] AC-16: euclideanDistance関数
- [ ] AC-17: dotProduct関数
- [ ] AC-18: vectorToBase64とbase64ToVectorの往復変換
- [ ] AC-19: estimateTokenCount関数
- [ ] AC-20: デフォルト設定の提供

**非機能要件**:

- [ ] AC-21: 型安全性（Branded Types）
- [ ] AC-22: イミュータブル設計
- [ ] AC-24: テストカバレッジ80%以上
- [ ] AC-25: TypeScript型エラーゼロ
- [ ] AC-26: ESLintエラーゼロ
- [ ] AC-34: JSDocコメントの完全性

**統合**:

- [ ] AC-27: バレルエクスポートの動作確認
- [ ] AC-28: CONV-03-01との整合性

**エッジケース**:

- [ ] AC-29: ゼロベクトル処理
- [ ] AC-30: 次元数不一致エラー
- [ ] AC-31: 浮動小数点演算の精度

**パフォーマンス**:

- [ ] AC-32: ベクトル操作のパフォーマンス
- [ ] AC-33: Base64変換のパフォーマンス

---

## 10. テストシナリオマッピング

各受け入れ基準に対応するテストファイル:

| 受け入れ基準     | テストファイル  | テストケース数（目安）                      |
| ---------------- | --------------- | ------------------------------------------- |
| AC-01, AC-02     | types.test.ts   | 10件（列挙型・型推論）                      |
| AC-03〜06        | types.test.ts   | 20件（インターフェース）                    |
| AC-07〜13, AC-23 | schemas.test.ts | 50件（Zodスキーマ、正常系・異常系・境界値） |
| AC-14〜20        | utils.test.ts   | 40件（ユーティリティ関数、エッジケース）    |
| AC-21, AC-22     | types.test.ts   | 10件（型安全性、コンパイル時エラー）        |
| AC-27, AC-28     | index.test.ts   | 10件（バレルエクスポート、統合）            |
| AC-29〜31        | utils.test.ts   | 15件（エッジケース）                        |
| AC-32, AC-33     | utils.test.ts   | 5件（パフォーマンス）                       |

**総テストケース数（目安）**: 160件

---

## 11. 手動検証項目

以下は自動テストでは検証困難なため、Phase 8（手動テスト検証）で確認:

### MV-01: VSCodeでの型推論動作確認

**Given**: VSCodeでTypeScriptを編集している
**When**: `ChunkEntity` 型の変数を定義する
**Then**: 以下を手動で確認

- [ ] VSCodeの補完で全フィールドが表示される
- [ ] `readonly` フィールドへの代入時に波線エラーが表示される
- [ ] Branded Types（ChunkId、EmbeddingId）でstring代入時に型エラーが表示される

---

### MV-02: Zodスキーマエラーメッセージの確認

**Given**: 不正なデータをバリデーションする
**When**: `chunkingConfigSchema.parse()` に不正な値を渡す
**Then**: 以下を手動で確認

- [ ] エラーメッセージが日本語または英語で分かりやすい
- [ ] どのフィールドがエラーかが明確
- [ ] 期待値が示されている（例: "Expected number, received string"）

---

### MV-03: デフォルト設定の妥当性確認

**Given**: デフォルト設定を使用する
**When**: `defaultChunkingConfig` を実際のチャンキングで使用する
**Then**: 以下を手動で確認

- [ ] 一般的な文書（1000〜5000トークン）で適切なチャンク数が生成される
- [ ] チャンクサイズが512トークン前後である
- [ ] オーバーラップが機能している

---

## 12. 完了の定義（Definition of Done）

タスクCONV-03-03が完了したと判断する基準:

**コード**:

- [ ] types.ts、schemas.ts、utils.ts、index.ts が実装されている
- [ ] 全ファイルが `packages/shared/src/types/rag/chunk/` に配置されている

**テスト**:

- [ ] types.test.ts、schemas.test.ts、utils.test.ts が実装されている
- [ ] 全テストがGreen（成功）状態
- [ ] カバレッジ80%以上

**品質**:

- [ ] TypeScript型エラー0件（`tsc --noEmit`）
- [ ] ESLintエラー0件（`pnpm lint`）
- [ ] Prettierフォーマット適用済み

**レビュー**:

- [ ] Phase 2（設計レビューゲート）でPASS判定
- [ ] Phase 7（最終レビューゲート）でPASS判定

**手動テスト**:

- [ ] Phase 8の全手動テストケースがPASS
- [ ] MV-01〜03の手動検証項目がすべて確認済み

**ドキュメント**:

- [ ] 要件ドキュメント（task-step00-01-requirements.md）が作成されている
- [ ] 受け入れ基準（task-step00-01-acceptance-criteria.md）が作成されている
- [ ] docs/00-requirements/配下の関連ドキュメントが更新されている

**統合**:

- [ ] CONV-03-01との整合性確認済み（AC-28）
- [ ] CONV-04-03、CONV-06-01、CONV-06-02が本タスクの成果物を利用可能

---

## 13. 受け入れ基準の検証マトリクス

| 受け入れ基準 | 検証方法                      | 検証者        | ステータス |
| ------------ | ----------------------------- | ------------- | ---------- |
| AC-01〜06    | 単体テスト（types.test.ts）   | .claude/agents/unit-tester.md  | 未実施     |
| AC-07〜13    | 単体テスト（schemas.test.ts） | .claude/agents/unit-tester.md  | 未実施     |
| AC-14〜20    | 単体テスト（utils.test.ts）   | .claude/agents/unit-tester.md  | 未実施     |
| AC-21〜22    | TypeScript型チェック          | .claude/agents/code-quality.md | 未実施     |
| AC-24        | カバレッジレポート            | .claude/agents/unit-tester.md  | 未実施     |
| AC-25        | `tsc --noEmit`                | .claude/agents/code-quality.md | 未実施     |
| AC-26        | ESLint実行                    | .claude/agents/code-quality.md | 未実施     |
| AC-27〜28    | 統合テスト（index.test.ts）   | .claude/agents/unit-tester.md  | 未実施     |
| AC-29〜31    | エッジケーステスト            | .claude/agents/unit-tester.md  | 未実施     |
| AC-32〜33    | パフォーマンステスト          | .claude/agents/unit-tester.md  | 未実施     |
| AC-34        | コードレビュー                | .claude/agents/code-quality.md | 未実施     |
| MV-01〜03    | 手動検証                      | 実装者        | 未実施     |

---

## 14. 次フェーズへの引き継ぎ事項

### Phase 1（設計）への引き継ぎ

- **AC-01〜06**: 型定義の詳細設計時に各インターフェースのフィールド定義を確定
- **AC-07〜13**: Zodスキーマの詳細設計時にバリデーションルールを確定
- **AC-14〜20**: ユーティリティ関数の詳細設計時にアルゴリズムを確定

### Phase 3（テスト作成）への引き継ぎ

- **全AC**: 各受け入れ基準をテストケースとして実装
- **テストシナリオマッピング**: 160件のテストケース作成を目標

### Phase 6（品質保証）への引き継ぎ

- **AC-24〜26**: 品質ゲートの基準として使用
- **AC-32〜33**: パフォーマンスベンチマークの基準として使用

### Phase 8（手動テスト検証）への引き継ぎ

- **MV-01〜03**: 手動検証チェックリストとして使用

---

## 15. 変更履歴

| 日付       | バージョン | 変更内容 | 変更者       |
| ---------- | ---------- | -------- | ------------ |
| 2025-12-18 | 1.0.0      | 初版作成 | .claude/agents/req-analyst.md |
