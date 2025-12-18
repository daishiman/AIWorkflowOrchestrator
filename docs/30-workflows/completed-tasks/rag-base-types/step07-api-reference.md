# Phase 7: APIリファレンス

**タスクID**: CONV-03-01
**フェーズ**: Phase 7 - ドキュメント化・統合
**実施日時**: 2025-12-16
**ステータス**: ✅ 完了

---

## 概要

RAG基本型・共通インターフェースのAPIリファレンスです。

```typescript
// 推奨インポート方法
import {
  // Result型
  ok,
  err,
  isOk,
  isErr,
  map,
  flatMap,
  mapErr,
  all,
  type Result,
  type Success,
  type Failure,

  // Branded Types
  createFileId,
  generateFileId,
  type FileId,
  type ChunkId,
  type EntityId,

  // エラー型
  ErrorCodes,
  createRAGError,
  type ErrorCode,
  type RAGError,

  // インターフェース
  type Repository,
  type Converter,
  type SearchStrategy,

  // Zodスキーマ
  uuidSchema,
  ragErrorSchema,
} from "@repo/shared/types/rag";
```

---

## 1. Result型

Railway Oriented Programmingパターンによるエラーハンドリング。

### 型定義

```typescript
interface Success<T> {
  readonly success: true;
  readonly data: T;
}

interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

type Result<T, E = Error> = Success<T> | Failure<E>;
```

### コンストラクタ

#### `ok<T>(data: T): Success<T>`

成功値を生成します。

```typescript
const result = ok(42); // Success<number>
const user = ok({ id: 1 }); // Success<{ id: number }>
```

#### `err<E>(error: E): Failure<E>`

エラー値を生成します。

```typescript
const result = err(new Error("Failed")); // Failure<Error>
const validation = err("Invalid input"); // Failure<string>
```

### 型ガード

#### `isOk<T, E>(result: Result<T, E>): result is Success<T>`

結果が成功かどうかを判定します。

```typescript
const result: Result<number, string> = ok(42);
if (isOk(result)) {
  console.log(result.data * 2); // 型安全にアクセス可能
}
```

#### `isErr<T, E>(result: Result<T, E>): result is Failure<E>`

結果が失敗かどうかを判定します。

```typescript
const result: Result<number, string> = err("error");
if (isErr(result)) {
  console.error(result.error); // 型安全にアクセス可能
}
```

### モナド操作

#### `map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>`

成功値に関数を適用します（Functor map）。

```typescript
map(ok(2), (x) => x * 2); // ok(4)
map(err("fail"), (x) => x * 2); // err("fail") - 変換スキップ
```

#### `flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E>`

成功値にResult返却関数を適用します（Monad bind）。

```typescript
const divide = (a: number, b: number): Result<number, string> =>
  b === 0 ? err("Division by zero") : ok(a / b);

flatMap(ok(10), (x) => divide(x, 2)); // ok(5)
flatMap(ok(10), (x) => divide(x, 0)); // err("Division by zero")
```

#### `mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F>`

エラー値に関数を適用します。

```typescript
mapErr(err("simple"), (e) => new Error(e)); // err(Error("simple"))
mapErr(ok(42), (e) => new Error(e)); // ok(42) - 変換スキップ
```

#### `all<T, E>(results: Result<T, E>[]): Result<T[], E>`

複数のResultを統合します。

```typescript
all([ok(1), ok(2), ok(3)]); // ok([1, 2, 3])
all([ok(1), err("fail"), ok(3)]); // err("fail")
all([]); // ok([])
```

---

## 2. Branded Types

名目的型付けによるID型の誤用防止。

### 基底型

```typescript
type Brand<T, B extends string> = T & { readonly [brand]: B };
```

### ID型一覧

| 型名           | 説明                                     |
| -------------- | ---------------------------------------- |
| `FileId`       | ファイルを一意に識別                     |
| `ChunkId`      | チャンク（分割テキスト）を一意に識別     |
| `ConversionId` | 変換プロセスを一意に識別                 |
| `EntityId`     | エンティティ（グラフノード）を一意に識別 |
| `RelationId`   | 関係（グラフエッジ）を一意に識別         |
| `CommunityId`  | コミュニティ（クラスタ）を一意に識別     |
| `EmbeddingId`  | 埋め込みベクトルを一意に識別             |

### 型キャスト関数

既存の文字列をID型に変換します。

```typescript
const fileId = createFileId("550e8400-e29b-41d4-a716-446655440000");
const chunkId = createChunkId("existing-uuid");
const entityId = createEntityId("entity-uuid");
// 他: createConversionId, createRelationId, createCommunityId, createEmbeddingId
```

### UUID生成関数

新規IDを生成します（UUID v4形式）。

```typescript
const newFileId = generateFileId();
const newChunkId = generateChunkId();
const newEntityId = generateEntityId();
// 他: generateConversionId, generateRelationId, generateCommunityId, generateEmbeddingId

// 汎用UUID生成
const uuid = generateUUID(); // string型
```

### 型安全性の例

```typescript
const fileId: FileId = generateFileId();
const chunkId: ChunkId = generateChunkId();

// コンパイルエラー: FileIdとChunkIdは互換性がない
// const wrongAssignment: FileId = chunkId;

function processFile(id: FileId) {
  /* ... */
}
processFile(fileId); // OK
// processFile(chunkId); // コンパイルエラー
```

---

## 3. エラー型

### ErrorCodes定数

```typescript
const ErrorCodes = {
  // ファイル関連
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_READ_ERROR: "FILE_READ_ERROR",
  FILE_WRITE_ERROR: "FILE_WRITE_ERROR",
  UNSUPPORTED_FILE_TYPE: "UNSUPPORTED_FILE_TYPE",

  // 変換関連
  CONVERSION_FAILED: "CONVERSION_FAILED",
  CONVERTER_NOT_FOUND: "CONVERTER_NOT_FOUND",

  // データベース関連
  DB_CONNECTION_ERROR: "DB_CONNECTION_ERROR",
  DB_QUERY_ERROR: "DB_QUERY_ERROR",
  DB_TRANSACTION_ERROR: "DB_TRANSACTION_ERROR",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",

  // 埋め込み関連
  EMBEDDING_GENERATION_ERROR: "EMBEDDING_GENERATION_ERROR",
  EMBEDDING_PROVIDER_ERROR: "EMBEDDING_PROVIDER_ERROR",

  // 検索関連
  SEARCH_ERROR: "SEARCH_ERROR",
  QUERY_PARSE_ERROR: "QUERY_PARSE_ERROR",

  // グラフ関連
  ENTITY_EXTRACTION_ERROR: "ENTITY_EXTRACTION_ERROR",
  RELATION_EXTRACTION_ERROR: "RELATION_EXTRACTION_ERROR",
  COMMUNITY_DETECTION_ERROR: "COMMUNITY_DETECTION_ERROR",

  // 汎用
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
```

### 型定義

```typescript
type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

interface BaseError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
}

interface RAGError extends BaseError {
  readonly code: ErrorCode;
  readonly cause?: Error;
}
```

### ファクトリ関数

#### `createRAGError(code, message, context?, cause?): RAGError`

```typescript
// 基本的な使用
const error = createRAGError(
  ErrorCodes.FILE_NOT_FOUND,
  "File not found: input.pdf",
);

// コンテキスト付き
const error = createRAGError(ErrorCodes.DB_QUERY_ERROR, "Query failed", {
  query: "SELECT * FROM files",
  params: [],
});

// 原因エラー付き
try {
  await readFile(path);
} catch (e) {
  throw createRAGError(
    ErrorCodes.FILE_READ_ERROR,
    "Failed to read file",
    { path },
    e as Error,
  );
}
```

---

## 4. 共通インターフェース

### ミックスイン

```typescript
interface Timestamped {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface WithMetadata {
  readonly metadata: Record<string, unknown>;
}
```

### ページネーション

```typescript
interface PaginationParams {
  readonly limit: number;
  readonly offset: number;
}

interface PaginatedResult<T> {
  readonly items: T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
}
```

### 非同期ステータス

```typescript
type AsyncStatus = "pending" | "processing" | "completed" | "failed";
```

### Repository パターン

DIP準拠のリポジトリインターフェース。

```typescript
interface Repository<T, ID> {
  findById(id: ID): Promise<Result<T | null, RAGError>>;
  findAll(
    params?: PaginationParams,
  ): Promise<Result<PaginatedResult<T>, RAGError>>;
  create(
    entity: Omit<T, "id" | "createdAt" | "updatedAt">,
  ): Promise<Result<T, RAGError>>;
  update(id: ID, entity: Partial<T>): Promise<Result<T, RAGError>>;
  delete(id: ID): Promise<Result<void, RAGError>>;
}
```

**使用例:**

```typescript
interface User extends Timestamped {
  id: UserId;
  name: string;
  email: string;
}

interface UserRepository extends Repository<User, UserId> {
  findByEmail(email: string): Promise<Result<User | null, RAGError>>;
}
```

### Converter パターン

ファイル変換の抽象。

```typescript
interface Converter<TInput, TOutput> {
  readonly supportedTypes: readonly string[];
  canConvert(input: TInput): boolean;
  convert(input: TInput): Promise<Result<TOutput, RAGError>>;
}
```

**使用例:**

```typescript
interface PDFInput {
  path: string;
  content: Buffer;
}

interface TextOutput {
  text: string;
  pageCount: number;
}

class PDFConverter implements Converter<PDFInput, TextOutput> {
  readonly supportedTypes = ["pdf"] as const;

  canConvert(input: PDFInput): boolean {
    return input.path.endsWith(".pdf");
  }

  async convert(input: PDFInput): Promise<Result<TextOutput, RAGError>> {
    // 変換ロジック
  }
}
```

### SearchStrategy パターン

検索アルゴリズムの抽象。

```typescript
interface SearchStrategy<TQuery, TResult> {
  readonly name: string;
  search(query: TQuery): Promise<Result<TResult[], RAGError>>;
}
```

**使用例:**

```typescript
interface VectorQuery {
  embedding: number[];
  topK: number;
}

interface VectorResult {
  id: string;
  score: number;
  content: string;
}

class VectorSearchStrategy implements SearchStrategy<
  VectorQuery,
  VectorResult
> {
  readonly name = "vector-search";

  async search(query: VectorQuery): Promise<Result<VectorResult[], RAGError>> {
    // ベクトル検索ロジック
  }
}
```

---

## 5. Zodスキーマ

ランタイム検証と型推論の統合。

### 基本スキーマ

```typescript
// UUID v4形式のバリデーション
const uuidSchema = z.string().uuid();
type UUID = z.infer<typeof uuidSchema>;

// タイムスタンプ
const timestampedSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// メタデータ
const metadataSchema = z.record(z.string(), z.unknown());

// ページネーション
const paginationParamsSchema = z.object({
  limit: z.number().int().min(1).default(20),
  offset: z.number().int().min(0).default(0),
});

// 非同期ステータス
const asyncStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);
```

### エラースキーマ

```typescript
// エラーコード
const errorCodeSchema = z.enum([...Object.values(ErrorCodes)]);

// RAGエラー
const ragErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string().min(1),
  timestamp: z.coerce.date(),
  context: metadataSchema.optional(),
});
```

### 使用例

```typescript
// バリデーション
const validUUID = uuidSchema.parse("550e8400-e29b-41d4-a716-446655440000");

// デフォルト値付きパース
const params = paginationParamsSchema.parse({});
// { limit: 20, offset: 0 }

// 安全なパース
const result = ragErrorSchema.safeParse(data);
if (result.success) {
  console.log(result.data.code);
} else {
  console.error(result.error.issues);
}
```

---

## 6. パッケージ統合

### インポートパス

```typescript
// 推奨: 単一インポートパス
import { ok, err, FileId, ErrorCodes } from "@repo/shared/types/rag";

// 代替: types全体からアクセス
import { ok, err, FileId, ErrorCodes } from "@repo/shared/types";
```

### package.json エクスポート

```json
{
  "exports": {
    "./types/rag": {
      "types": "./dist/types/rag/index.d.ts",
      "import": "./dist/types/rag/index.js"
    }
  }
}
```

---

## 7. ベストプラクティス

### Result型の活用

```typescript
// ❌ 例外を投げる
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

// ✅ Resultで失敗を表現
function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? err("Division by zero") : ok(a / b);
}
```

### チェーン処理

```typescript
const processData = (input: string): Result<Output, RAGError> =>
  pipe(
    validateInput(input),
    (result) => flatMap(result, parseData),
    (result) => flatMap(result, transformData),
    (result) => flatMap(result, saveData),
  );

// またはResult操作を連続して使用
const result = validateInput(input);
const parsed = flatMap(result, parseData);
const transformed = flatMap(parsed, transformData);
const saved = flatMap(transformed, saveData);
```

### Branded Typesの活用

```typescript
// ❌ 文字列でIDを扱う
function getFile(id: string): Promise<File> {
  /* ... */
}
getFile(userId); // 誤ってUserIdを渡してもエラーにならない

// ✅ Branded Typeで型安全に
function getFile(id: FileId): Promise<File> {
  /* ... */
}
getFile(fileId); // OK
// getFile(userId);  // コンパイルエラー
```

---

**作成者**: Claude Code
**作成日**: 2025-12-16
