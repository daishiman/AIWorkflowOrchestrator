# CONV-03-01: 基本型・共通インターフェース定義

## 概要

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | CONV-03-01                       |
| タスク名 | 基本型・共通インターフェース定義 |
| 依存     | なし                             |
| 規模     | 小                               |
| 出力場所 | `packages/shared/src/types/rag/` |

## 目的

HybridRAGパイプライン全体で使用する基本型、共通インターフェース、ユーティリティ型を定義する。
すべてのサブタスク（CONV-03-02〜05）の基盤となる。

## 成果物

### 1. Result型（エラーハンドリング）

```typescript
// packages/shared/src/types/rag/result.ts

/**
 * Result型 - 成功/失敗を型安全に表現
 * Railway Oriented Programming パターン
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

// コンストラクタ関数
export const ok = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

export const err = <E>(error: E): Failure<E> => ({
  success: false,
  error,
});

// ユーティリティ関数
export const isOk = <T, E>(result: Result<T, E>): result is Success<T> =>
  result.success === true;

export const isErr = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result.success === false;

// モナド的操作
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (isOk(result) ? ok(fn(result.data)) : result);

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => (isOk(result) ? fn(result.data) : result);

export const mapErr = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> => (isErr(result) ? err(fn(result.error)) : result);

// 複数Result操作
export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = [];
  for (const result of results) {
    if (isErr(result)) return result;
    values.push(result.data);
  }
  return ok(values);
};
```

### 2. Branded Types（型安全なID）

```typescript
// packages/shared/src/types/rag/branded.ts

/**
 * Branded Types - プリミティブ型に型情報を付与
 * ID混同を防ぐ
 */
declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

// ID型定義
export type FileId = Brand<string, "FileId">;
export type ChunkId = Brand<string, "ChunkId">;
export type ConversionId = Brand<string, "ConversionId">;
export type EntityId = Brand<string, "EntityId">;
export type RelationId = Brand<string, "RelationId">;
export type CommunityId = Brand<string, "CommunityId">;
export type EmbeddingId = Brand<string, "EmbeddingId">;

// ID生成関数
export const createFileId = (id: string): FileId => id as FileId;
export const createChunkId = (id: string): ChunkId => id as ChunkId;
export const createConversionId = (id: string): ConversionId =>
  id as ConversionId;
export const createEntityId = (id: string): EntityId => id as EntityId;
export const createRelationId = (id: string): RelationId => id as RelationId;
export const createCommunityId = (id: string): CommunityId => id as CommunityId;
export const createEmbeddingId = (id: string): EmbeddingId => id as EmbeddingId;

// UUID生成ユーティリティ
export const generateUUID = (): string => crypto.randomUUID();

export const generateFileId = (): FileId => createFileId(generateUUID());
export const generateChunkId = (): ChunkId => createChunkId(generateUUID());
export const generateConversionId = (): ConversionId =>
  createConversionId(generateUUID());
export const generateEntityId = (): EntityId => createEntityId(generateUUID());
export const generateRelationId = (): RelationId =>
  createRelationId(generateUUID());
export const generateCommunityId = (): CommunityId =>
  createCommunityId(generateUUID());
export const generateEmbeddingId = (): EmbeddingId =>
  createEmbeddingId(generateUUID());
```

### 3. 共通エラー型

```typescript
// packages/shared/src/types/rag/errors.ts

/**
 * 共通エラー型定義
 */
export interface BaseError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
}

// エラーコード列挙
export const ErrorCodes = {
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

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// 具象エラー型
export interface RAGError extends BaseError {
  readonly code: ErrorCode;
  readonly cause?: Error;
}

// エラー生成関数
export const createRAGError = (
  code: ErrorCode,
  message: string,
  context?: Record<string, unknown>,
  cause?: Error,
): RAGError => ({
  code,
  message,
  timestamp: new Date(),
  context,
  cause,
});
```

### 4. 共通インターフェース

```typescript
// packages/shared/src/types/rag/interfaces.ts

import type { Result } from "./result";
import type { RAGError } from "./errors";

/**
 * タイムスタンプ付きエンティティ
 */
export interface Timestamped {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * メタデータ付きエンティティ
 */
export interface WithMetadata {
  readonly metadata: Record<string, unknown>;
}

/**
 * ページネーション
 */
export interface PaginationParams {
  readonly limit: number;
  readonly offset: number;
}

export interface PaginatedResult<T> {
  readonly items: T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
}

/**
 * 非同期処理の状態
 */
export type AsyncStatus = "pending" | "processing" | "completed" | "failed";

/**
 * 汎用リポジトリインターフェース
 */
export interface Repository<T, ID> {
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

/**
 * 変換器インターフェース
 */
export interface Converter<TInput, TOutput> {
  readonly supportedTypes: readonly string[];
  canConvert(input: TInput): boolean;
  convert(input: TInput): Promise<Result<TOutput, RAGError>>;
}

/**
 * 検索戦略インターフェース
 */
export interface SearchStrategy<TQuery, TResult> {
  readonly name: string;
  search(query: TQuery): Promise<Result<TResult[], RAGError>>;
}
```

### 5. Zodスキーマ基盤

```typescript
// packages/shared/src/types/rag/schemas.ts

import { z } from "zod";

/**
 * 共通Zodスキーマ
 */

// UUID形式バリデーション
export const uuidSchema = z.string().uuid();

// タイムスタンプスキーマ
export const timestampedSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

// メタデータスキーマ
export const metadataSchema = z.record(z.unknown());

// ページネーションスキーマ
export const paginationParamsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// 非同期ステータススキーマ
export const asyncStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

// エラーコードスキーマ
export const errorCodeSchema = z.enum([
  "FILE_NOT_FOUND",
  "FILE_READ_ERROR",
  "FILE_WRITE_ERROR",
  "UNSUPPORTED_FILE_TYPE",
  "CONVERSION_FAILED",
  "CONVERTER_NOT_FOUND",
  "DB_CONNECTION_ERROR",
  "DB_QUERY_ERROR",
  "DB_TRANSACTION_ERROR",
  "RECORD_NOT_FOUND",
  "EMBEDDING_GENERATION_ERROR",
  "EMBEDDING_PROVIDER_ERROR",
  "SEARCH_ERROR",
  "QUERY_PARSE_ERROR",
  "ENTITY_EXTRACTION_ERROR",
  "RELATION_EXTRACTION_ERROR",
  "COMMUNITY_DETECTION_ERROR",
  "VALIDATION_ERROR",
  "INTERNAL_ERROR",
]);

// RAGエラースキーマ
export const ragErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
  timestamp: z.date(),
  context: z.record(z.unknown()).optional(),
});
```

### 6. バレルエクスポート

```typescript
// packages/shared/src/types/rag/index.ts

export * from "./result";
export * from "./branded";
export * from "./errors";
export * from "./interfaces";
export * from "./schemas";
```

## ディレクトリ構造

```
packages/shared/src/types/rag/
├── index.ts          # バレルエクスポート
├── result.ts         # Result型
├── branded.ts        # Branded Types
├── errors.ts         # エラー型
├── interfaces.ts     # 共通インターフェース
└── schemas.ts        # Zodスキーマ
```

## 受け入れ条件

- [ ] `Result<T, E>` 型が定義され、`ok`/`err` コンストラクタが実装されている
- [ ] `map`, `flatMap`, `mapErr`, `all` ユーティリティが実装されている
- [ ] Branded Types（FileId, ChunkId等）が定義されている
- [ ] ID生成関数が実装されている
- [ ] 共通エラー型 `RAGError` とエラーコードが定義されている
- [ ] `Repository`, `Converter`, `SearchStrategy` インターフェースが定義されている
- [ ] Zodスキーマ（基盤部分）が定義されている
- [ ] 全エクスポートが `index.ts` でまとめられている
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- なし（最初に実装）

### このタスクに依存するもの

- CONV-03-02: ファイル・変換スキーマ定義
- CONV-03-03: チャンク・埋め込みスキーマ定義
- CONV-03-04: エンティティ・関係スキーマ定義
- CONV-03-05: 検索クエリ・結果スキーマ定義
- その他すべてのCONVタスク

## 備考

- すべての型は `readonly` 修飾子を使用し、イミュータブル設計を徹底
- Result型はモナド的操作をサポートし、関数型プログラミングスタイルを可能にする
- Branded Typesにより、異なるIDの誤用をコンパイル時に検出可能
