# RAG基本型・共通インターフェース - 要件定義書

**タスクID**: CONV-03-01
**作成日**: 2025-12-16
**Phase**: 0 (要件定義)
**サブタスク**: T-00-1

---

## 1. 概要

### 1.1 目的

HybridRAGパイプライン全体で使用する基本型、共通インターフェース、ユーティリティ型を定義する。
すべてのサブタスク（CONV-03-02〜05）の基盤となる型システムを構築する。

### 1.2 背景

RAG（Retrieval-Augmented Generation）パイプラインを型安全に実装するためには、統一された型システムが必要。
以下の課題を解決する：

- **エラーハンドリングの一貫性**: 例外ではなく型安全なResult型でエラーを表現
- **ID型の混同**: FileIdとChunkIdなど、異なるIDの誤用を防止
- **共通パターンの抽象化**: Repository、Converter等の共通インターフェース提供
- **ランタイム検証**: Zodスキーマによる実行時型チェック

### 1.3 スコープ

#### 対象範囲

- Result型の定義（Railway Oriented Programming）
- Branded Types（型安全なID定義）
- 共通エラー型（RAGError、ErrorCodes）
- 共通インターフェース（Repository、Converter、SearchStrategy等）
- Zodスキーマ基盤（バリデーションルール）
- バレルエクスポート（`index.ts`）

#### 対象外

- 具体的なドメイン型（File、Chunk、Entity等）は CONV-03-02〜05 で定義
- データベーススキーマ定義
- API エンドポイント定義

---

## 2. Result型要件

### 2.1 概要

Railway Oriented Programming パターンに基づくエラーハンドリング型。
`try-catch` による例外処理ではなく、成功/失敗を型で表現する。

### 2.2 型定義要件

#### 2.2.1 基本型構造

```typescript
// Discriminated Union による型安全な判別
type Result<T, E = Error> = Success<T> | Failure<E>;

interface Success<T> {
  readonly success: true; // 判別子
  readonly data: T;
}

interface Failure<E> {
  readonly success: false; // 判別子
  readonly error: E;
}
```

**要件**:

- `success` フィールドによる判別（Discriminated Union）
- `readonly` 修飾子による不変性保証
- ジェネリック型パラメータ `T`（成功値の型）、`E`（エラーの型、デフォルト `Error`）

#### 2.2.2 コンストラクタ関数

```typescript
function ok<T>(data: T): Success<T>;
function err<E>(error: E): Failure<E>;
```

**要件**:

- 簡潔な成功値/エラー値の生成
- 型推論が正しく機能すること

#### 2.2.3 型ガード関数

```typescript
function isOk<T, E>(result: Result<T, E>): result is Success<T>;
function isErr<T, E>(result: Result<T, E>): result is Failure<E>;
```

**要件**:

- TypeScript の Type Predicate (`is` 構文) を使用
- 型の絞り込みが正しく機能すること

### 2.3 モナド的操作要件

#### 2.3.1 map 操作

```typescript
function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>;
```

**要件**:

- 成功値に関数を適用
- エラーはそのまま伝播
- 関数型プログラミングスタイルのサポート

#### 2.3.2 flatMap 操作（bind / chain）

```typescript
function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E>;
```

**要件**:

- Result を返す関数の合成
- ネストした Result の平坦化
- エラー伝播の保証

#### 2.3.3 mapErr 操作

```typescript
function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F>;
```

**要件**:

- エラー値の変換
- 成功値はそのまま保持

#### 2.3.4 all 操作

```typescript
function all<T, E>(results: Result<T, E>[]): Result<T[], E>;
```

**要件**:

- 複数の Result を統合
- 1つでもエラーがあれば最初のエラーを返す
- すべて成功なら成功値の配列を返す

### 2.4 使用パターン例

```typescript
// パターン1: 基本的な成功/失敗
const result = ok(42);
const error = err(new Error("Failed"));

// パターン2: 型ガードによる分岐
if (isOk(result)) {
  console.log(result.data); // 型は Success<number>
} else {
  console.log(result.error); // 型は Failure<Error>
}

// パターン3: map チェーン
const doubled = map(result, (x) => x * 2);

// パターン4: flatMap による複数操作の合成
const processed = flatMap(result, (x) =>
  x > 0 ? ok(x * 2) : err(new Error("Negative")),
);

// パターン5: 複数Result の統合
const results = [ok(1), ok(2), ok(3)];
const combined = all(results); // ok([1, 2, 3])
```

### 2.5 制約事項

- すべての関数は副作用を持たない（純粋関数）
- Result 型のネストは避ける（`Result<Result<T, E>, E>` は禁止）
- エラー型 `E` は `Error` を継承することを推奨（必須ではない）

---

## 3. Branded Types要件

### 3.1 概要

TypeScript の構造的型システムでは、異なる意味を持つ同じプリミティブ型（例: `string`）を区別できない。
Branded Types パターンにより、コンパイル時に異なるIDの誤用を検出する。

### 3.2 型定義要件

#### 3.2.1 Brand型の基盤

```typescript
declare const brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [brand]: B };
```

**要件**:

- `unique symbol` による名目的型付け（Nominal Typing）
- 実行時のオーバーヘッドなし（型レベルのみ）
- `readonly` による不変性保証

#### 3.2.2 ID型の定義

```typescript
type FileId = Brand<string, "FileId">;
type ChunkId = Brand<string, "ChunkId">;
type ConversionId = Brand<string, "ConversionId">;
type EntityId = Brand<string, "EntityId">;
type RelationId = Brand<string, "RelationId">;
type CommunityId = Brand<string, "CommunityId">;
type EmbeddingId = Brand<string, "EmbeddingId">;
```

**要件**:

- すべて `string` ベースのUUID
- 各ID型は互換性がない（型安全性）
- 将来的に追加可能な拡張性

### 3.3 ID生成関数要件

#### 3.3.1 型キャスト関数

```typescript
function createFileId(id: string): FileId;
function createChunkId(id: string): ChunkId;
// ... 各ID型に対応
```

**要件**:

- 既存の文字列をID型に変換
- 主にデータベースから取得した値の変換に使用
- バリデーションは呼び出し側の責務

#### 3.3.2 UUID生成関数

```typescript
function generateUUID(): string;
function generateFileId(): FileId;
function generateChunkId(): ChunkId;
// ... 各ID型に対応
```

**要件**:

- `crypto.randomUUID()` を使用（Node.js 標準）
- 新規エンティティ作成時に使用
- 生成されたIDは一意性が保証される

### 3.4 使用パターン例

```typescript
// パターン1: 新規ID生成
const newFileId = generateFileId();

// パターン2: 既存ID変換
const existingId = "550e8400-e29b-41d4-a716-446655440000";
const fileId = createFileId(existingId);

// パターン3: 型安全性の検証（コンパイルエラー）
const fileId = generateFileId();
const chunkId = generateChunkId();
// fileId = chunkId; // ❌ TypeScript エラー: Type 'ChunkId' is not assignable to type 'FileId'
```

### 3.5 制約事項

- IDは常にUUID v4形式（36文字）
- 実行時にはブランド情報は存在しない（型レベルのみ）
- ブラウザ環境では `crypto.randomUUID()` の polyfill が必要な場合がある

---

## 4. エラー型要件

### 4.1 概要

RAGパイプライン全体で一貫したエラーハンドリングを実現するための共通エラー型。

### 4.2 基本エラー型要件

#### 4.2.1 BaseError インターフェース

```typescript
interface BaseError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
}
```

**要件**:

- `code`: エラー識別子（ErrorCodes 定数から選択）
- `message`: 人間が読めるエラーメッセージ
- `timestamp`: エラー発生時刻
- `context`: 追加のコンテキスト情報（オプショナル）

#### 4.2.2 RAGError インターフェース

```typescript
interface RAGError extends BaseError {
  readonly code: ErrorCode;
  readonly cause?: Error;
}
```

**要件**:

- `ErrorCode` 型による型安全なエラーコード
- `cause`: 元の例外（Error チェーンのサポート）

### 4.3 エラーコード体系要件

#### 4.3.1 ErrorCodes 定数オブジェクト

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

type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

**要件**:

- `as const` による型安全性
- エラーコードは大文字のSNAKE_CASE
- カテゴリ別の整理（ファイル、DB、埋め込み等）
- 将来的な追加を考慮した拡張性

### 4.4 エラー生成関数要件

```typescript
function createRAGError(
  code: ErrorCode,
  message: string,
  context?: Record<string, unknown>,
  cause?: Error,
): RAGError;
```

**要件**:

- 簡潔なエラーオブジェクト生成
- `timestamp` は自動設定（`new Date()`）
- すべてのパラメータは型安全

### 4.5 使用パターン例

```typescript
// パターン1: 基本的なエラー生成
const error = createRAGError(
  ErrorCodes.FILE_NOT_FOUND,
  "File not found: input.pdf",
);

// パターン2: コンテキスト付きエラー
const error = createRAGError(
  ErrorCodes.CONVERSION_FAILED,
  "PDF conversion failed",
  { filePath: "/path/to/file.pdf", pageCount: 10 },
);

// パターン3: 元の例外を保持
try {
  await readFile(path);
} catch (e) {
  return err(
    createRAGError(
      ErrorCodes.FILE_READ_ERROR,
      "Failed to read file",
      { path },
      e instanceof Error ? e : undefined,
    ),
  );
}
```

### 4.6 制約事項

- 詳細エラーメッセージは日本語（ローカライズは上位レイヤーで実施）
- `context` オブジェクトには機密情報を含めない
- `cause` は `Error` インスタンスまたは `undefined`

---

## 5. 共通インターフェース要件

### 5.1 概要

RAGパイプラインの各コンポーネントが実装すべき共通インターフェースを定義。
依存性逆転の原則（DIP）に基づき、抽象に依存する設計を実現する。

### 5.2 Timestamped インターフェース

```typescript
interface Timestamped {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

**要件**:

- エンティティの作成・更新日時を表現
- すべてのドメインエンティティで使用

### 5.3 WithMetadata インターフェース

```typescript
interface WithMetadata {
  readonly metadata: Record<string, unknown>;
}
```

**要件**:

- 追加の任意情報を格納
- スキーマ変更なしで柔軟性を確保

### 5.4 PaginationParams / PaginatedResult

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

**要件**:

- `limit`: 取得件数（1〜100）
- `offset`: スキップ件数（0〜）
- `hasMore`: 次ページの有無

### 5.5 AsyncStatus 型

```typescript
type AsyncStatus = "pending" | "processing" | "completed" | "failed";
```

**要件**:

- 非同期処理の状態を表現
- ファイル変換、埋め込み生成等で使用

### 5.6 Repository<T, ID> インターフェース

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

**要件**:

- CRUDの標準インターフェース
- すべての操作は `Result` 型を返す
- `findById` は存在しない場合 `ok(null)` を返す
- `create` は自動生成フィールド（id, createdAt, updatedAt）を除外

### 5.7 Converter<TInput, TOutput> インターフェース

```typescript
interface Converter<TInput, TOutput> {
  readonly supportedTypes: readonly string[];
  canConvert(input: TInput): boolean;
  convert(input: TInput): Promise<Result<TOutput, RAGError>>;
}
```

**要件**:

- `supportedTypes`: サポートするファイル拡張子（例: `["pdf", "docx"]`）
- `canConvert`: 変換可能かの事前チェック
- `convert`: 実際の変換処理

### 5.8 SearchStrategy<TQuery, TResult> インターフェース

```typescript
interface SearchStrategy<TQuery, TResult> {
  readonly name: string;
  search(query: TQuery): Promise<Result<TResult[], RAGError>>;
}
```

**要件**:

- `name`: 検索戦略の識別子（例: "vector", "graph", "keyword"）
- `search`: 検索実行

### 5.9 使用パターン例

```typescript
// パターン1: Repository 実装
class FileRepository implements Repository<File, FileId> {
  async findById(id: FileId): Promise<Result<File | null, RAGError>> {
    // 実装
  }
  // ...
}

// パターン2: Converter 実装
class PDFConverter implements Converter<Buffer, string> {
  readonly supportedTypes = ["pdf"] as const;

  canConvert(input: Buffer): boolean {
    return input.byteLength > 0;
  }

  async convert(input: Buffer): Promise<Result<string, RAGError>> {
    // PDF → テキスト変換
  }
}
```

### 5.10 制約事項

- すべての非同期操作は `Promise<Result<T, RAGError>>` を返す
- インターフェースは実装の詳細を漏らさない
- ジェネリック型パラメータは明示的に指定

---

## 6. Zodスキーマ要件

### 6.1 概要

TypeScript の型定義とランタイム検証を統合するため、Zodスキーマを定義。
型推論により、スキーマから TypeScript 型を生成可能。

### 6.2 共通スキーマ要件

#### 6.2.1 UUID スキーマ

```typescript
const uuidSchema = z.string().uuid();
```

**要件**:

- UUID v4 形式の検証
- エラーメッセージは明確であること

#### 6.2.2 Timestamped スキーマ

```typescript
const timestampedSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

**要件**:

- `Date` オブジェクトの検証
- ISO 8601 文字列からの変換をサポート

#### 6.2.3 Metadata スキーマ

```typescript
const metadataSchema = z.record(z.unknown());
```

**要件**:

- 任意のキー・値を許容
- 深いネストも可能

#### 6.2.4 PaginationParams スキーマ

```typescript
const paginationParamsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});
```

**要件**:

- `limit` は 1〜100 の整数、デフォルト 20
- `offset` は 0以上の整数、デフォルト 0

#### 6.2.5 AsyncStatus スキーマ

```typescript
const asyncStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);
```

**要件**:

- 4つの状態のみ許可
- 型推論により `AsyncStatus` 型を生成

#### 6.2.6 ErrorCode スキーマ

```typescript
const errorCodeSchema = z.enum([
  "FILE_NOT_FOUND",
  "FILE_READ_ERROR",
  // ... 全エラーコード
]);
```

**要件**:

- `ErrorCodes` 定数と完全に一致
- 型推論により `ErrorCode` 型を生成

#### 6.2.7 RAGError スキーマ

```typescript
const ragErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
  timestamp: z.date(),
  context: z.record(z.unknown()).optional(),
});
```

**要件**:

- `RAGError` インターフェースと完全に一致
- `cause` フィールドは含めない（循環参照の可能性）

### 6.3 使用パターン例

```typescript
// パターン1: バリデーション
const result = paginationParamsSchema.safeParse({ limit: 50, offset: 10 });
if (!result.success) {
  console.error(result.error);
}

// パターン2: 型推論
type PaginationParams = z.infer<typeof paginationParamsSchema>;

// パターン3: デフォルト値の適用
const params = paginationParamsSchema.parse({}); // { limit: 20, offset: 0 }
```

### 6.4 制約事項

- スキーマは TypeScript 型と完全に一致すること
- 循環参照を避けること
- エラーメッセージはカスタマイズ可能であること

---

## 7. バレルエクスポート要件

### 7.1 概要

すべての型定義を `index.ts` でまとめてエクスポートし、利用者が単一のインポートパスで全ての型にアクセスできるようにする。

### 7.2 エクスポート要件

```typescript
// packages/shared/src/types/rag/index.ts

export * from "./result";
export * from "./branded";
export * from "./errors";
export * from "./interfaces";
export * from "./schemas";
```

**要件**:

- すべてのファイルから `export *` で再エクスポート
- 名前衝突がないこと
- 循環依存がないこと

### 7.3 使用パターン例

```typescript
// 利用側のコード
import {
  Result,
  ok,
  err,
  map,
  FileId,
  generateFileId,
  RAGError,
  ErrorCodes,
  createRAGError,
  Repository,
  Converter,
  SearchStrategy,
  uuidSchema,
  paginationParamsSchema,
} from "@repo/shared/types/rag";
```

### 7.4 制約事項

- インポートパスは `@repo/shared/types/rag` に統一
- 個別ファイルからの直接インポートは非推奨
- Tree Shaking が正しく機能すること

---

## 8. 受け入れ基準

### 8.1 機能要件

- [ ] `Result<T, E>` 型が定義され、`ok`/`err` コンストラクタが実装されている
- [ ] `map`, `flatMap`, `mapErr`, `all` ユーティリティが実装されている
- [ ] Branded Types（FileId, ChunkId等）が定義されている
- [ ] ID生成関数（`generateXXXId`）が実装されている
- [ ] 共通エラー型 `RAGError` とエラーコードが定義されている
- [ ] `Repository`, `Converter`, `SearchStrategy` インターフェースが定義されている
- [ ] Zodスキーマ（基盤部分）が定義されている
- [ ] 全エクスポートが `index.ts` でまとめられている

### 8.2 品質要件

- [ ] すべての型に JSDoc コメントが付与されている
- [ ] 単体テストが作成され、カバレッジ 80% 以上
- [ ] TypeScript の厳格モード（strict: true）でエラーがない
- [ ] Lint エラーがない
- [ ] すべての型が `readonly` 修飾子を使用している

### 8.3 非機能要件

- [ ] Result型のモナド操作がO(1)で動作する
- [ ] Branded Typesに実行時オーバーヘッドがない
- [ ] Zodスキーマのパース速度が十分高速（1万件/秒以上）

---

## 9. 制約事項

### 9.1 技術的制約

- TypeScript 5.x 以上
- Zod 3.x 以上
- Node.js 20.x 以上（`crypto.randomUUID()` サポート）
- Vitest によるテスト実行

### 9.2 設計制約

- すべての型は `readonly` 修飾子を使用
- Result型のネストは禁止
- 例外の使用は最小限（基本的に Result 型を使用）
- 循環依存の禁止

### 9.3 運用制約

- エラーコードの追加は後方互換性を保つ
- Branded Typesの追加は自由
- インターフェースの変更は慎重に検討

---

## 10. 参考資料

### 10.1 技術文献

- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/) - Scott Wlaschin
- [TypeScript Branded Types](https://egghead.io/blog/using-branded-types-in-typescript) - Marius Schulz
- [Zod Documentation](https://zod.dev/) - Colin McDonnell

### 10.2 プロジェクト内資料

- `docs/00-requirements/master_system_design.md` - システム設計原則
- `docs/30-workflows/rag-base-types/task-rag-base-types.md` - タスク仕様書
- `.claude/agents/schema-def.md` - スキーマ定義エージェント
- `.claude/skills/zod-validation/SKILL.md` - Zodバリデーションスキル
- `.claude/skills/type-safety-patterns/SKILL.md` - 型安全性パターン

---

## 11. 用語集

| 用語                                 | 定義                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Railway Oriented Programming         | 成功パスとエラーパスを並行する線路に見立てたプログラミングパターン      |
| Branded Types                        | プリミティブ型に名目的な型情報を付与するTypeScriptパターン              |
| Discriminated Union                  | 判別子フィールドにより型を区別するTypeScriptの型パターン                |
| Type Predicate                       | `is` 構文を使った型ガード関数の戻り値型                                 |
| Monad                                | 値をラップし、連鎖可能な操作を提供する関数型プログラミングの概念        |
| DIP (Dependency Inversion Principle) | 具象ではなく抽象に依存すべきというSOLID原則の1つ                        |
| Barrel Export                        | 複数のモジュールを1つのインデックスファイルで再エクスポートするパターン |

---

**レビュー日**: （未実施）
**承認者**: （未定）
**次のフェーズ**: Phase 1 - 型システム設計（T-01-1）
