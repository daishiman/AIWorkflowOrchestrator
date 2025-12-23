# コンバーター型定義 - 詳細設計書

## 1. 概要

### 1.1 目的

ファイル変換基盤の型定義（types.ts）の実装レベルの詳細設計を提供し、型安全性を確保しながら拡張可能な設計を実現する。

### 1.2 設計方針

| 方針           | 内容                                                            |
| -------------- | --------------------------------------------------------------- |
| 型安全性       | TypeScript strictモードに準拠し、コンパイル時エラー検出を最大化 |
| 不変性         | すべてのプロパティをreadonlyとし、イミュータブルな設計          |
| 拡張性         | customフィールドによる将来拡張をサポート                        |
| バリデーション | Zodスキーマによるランタイムバリデーション（将来実装）           |
| 一貫性         | RAGシステム全体の型定義規約に準拠                               |

### 1.3 依存型定義

本モジュールが依存する外部型定義：

| 型名                | インポート元                    | 用途                           | 備考                               |
| ------------------- | ------------------------------- | ------------------------------ | ---------------------------------- |
| `FileId`            | `../../types/rag/branded.ts`    | ファイル識別子（Branded Type） | ConversionIdも同じファイルに定義   |
| `Result`            | `../../types/rag/result.ts`     | 成功/失敗の結果型              | ok(), err()ヘルパー関数も含む      |
| `RAGError`          | `../../types/rag/errors.ts`     | エラー型                       | ErrorCodesも同じファイルに定義     |
| `ExtractedMetadata` | （新規定義 - types.tsに含める） | 抽出メタデータ型               | 本モジュールで定義（外部依存なし） |

### 1.4 正確なインポートパス

```typescript
// types.ts の実際のインポート文
import type { FileId, ConversionId } from "../../types/rag/branded";
import type { Result } from "../../types/rag/result";
import type { RAGError } from "../../types/rag/errors";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";
```

**注意**: 設計書の初版では `entities.ts` からのインポートとしていましたが、実際は `branded.ts` が正しいパスです。

---

## 2. 型定義詳細設計

### 2.1 ConverterInput

#### 2.1.1 型定義

```typescript
/**
 * コンバーターへの入力データ
 *
 * ファイル変換に必要なすべての情報を含むイミュータブルなオブジェクト。
 * すべてのプロパティはreadonlyで、変更不可。
 */
export interface ConverterInput {
  /**
   * ファイルの一意識別子
   *
   * Branded Typeとして定義され、通常の文字列と区別される。
   * RAGシステム全体で一意性が保証される。
   */
  readonly fileId: FileId;

  /**
   * ファイルの絶対パス
   *
   * 制約:
   * - 空文字列不可
   * - 有効なファイルパス形式
   *
   * 例: "/Users/user/documents/file.md"
   */
  readonly filePath: string;

  /**
   * MIMEタイプ
   *
   * 制約:
   * - RFC 6838形式: "type/subtype"
   * - 空文字列不可
   *
   * 例: "text/plain", "text/markdown", "application/pdf"
   */
  readonly mimeType: string;

  /**
   * ファイルの内容
   *
   * - テキストファイル: string型
   * - バイナリファイル: ArrayBuffer型
   *
   * 変換処理で適切に型判定して処理する必要がある。
   */
  readonly content: ArrayBuffer | string;

  /**
   * 文字エンコーディング
   *
   * 制約:
   * - WHATWG Encoding Standard準拠
   * - 空文字列不可
   *
   * 例: "utf-8", "shift-jis", "iso-8859-1"
   * デフォルト: "utf-8"
   */
  readonly encoding: string;

  /**
   * 追加メタデータ（オプション）
   *
   * ファイルシステムから取得したメタデータや、
   * ユーザー定義のカスタム情報を格納。
   *
   * 例:
   * {
   *   author: "John Doe",
   *   createdAt: "2025-12-20T00:00:00Z",
   *   tags: ["important", "draft"]
   * }
   */
  readonly metadata?: Record<string, unknown>;
}
```

#### 2.1.2 バリデーションルール

| フィールド | 必須 | 型制約                  | 値制約                   |
| ---------- | ---- | ----------------------- | ------------------------ |
| fileId     | ✓    | FileId (Branded Type)   | 空文字列不可             |
| filePath   | ✓    | string                  | 空文字列不可、有効なパス |
| mimeType   | ✓    | string                  | RFC 6838形式             |
| content    | ✓    | ArrayBuffer \| string   | 空でないこと             |
| encoding   | ✓    | string                  | WHATWG Encoding準拠      |
| metadata   | -    | Record<string, unknown> | -                        |

#### 2.1.3 型ガード関数

```typescript
/**
 * contentがstring型か判定
 */
export function isTextContent(
  input: ConverterInput,
): input is ConverterInput & { content: string } {
  return typeof input.content === "string";
}

/**
 * contentがArrayBuffer型か判定
 */
export function isBinaryContent(
  input: ConverterInput,
): input is ConverterInput & { content: ArrayBuffer } {
  return input.content instanceof ArrayBuffer;
}
```

#### 2.1.4 ファクトリ関数

```typescript
/**
 * ConverterInputを生成するファクトリ関数
 *
 * バリデーションを行い、Result型で返す。
 */
export function createConverterInput(params: {
  fileId: FileId;
  filePath: string;
  mimeType: string;
  content: ArrayBuffer | string;
  encoding: string;
  metadata?: Record<string, unknown>;
}): Result<ConverterInput, RAGError> {
  // バリデーション実装は後続フェーズで追加
  return ok(params);
}
```

---

### 2.2 ConverterOutput

#### 2.2.1 型定義

```typescript
/**
 * コンバーターからの出力データ
 *
 * 変換後のテキストコンテンツと抽出されたメタデータ、
 * 処理時間を含むイミュータブルなオブジェクト。
 */
export interface ConverterOutput {
  /**
   * 変換後のテキストコンテンツ
   *
   * すべてのコンバーターは最終的にプレーンテキストを出力する。
   * 空文字列可（空ファイルの場合）。
   *
   * 制約:
   * - 必ずstring型
   * - 改行・空白文字を保持
   */
  readonly convertedContent: string;

  /**
   * 抽出されたメタデータ
   *
   * タイトル、見出し、リンク等、RAG検索に必要な構造化情報。
   * ExtractedMetadata型に準拠。
   */
  readonly extractedMetadata: ExtractedMetadata;

  /**
   * 処理時間（ミリ秒）
   *
   * 実際の変換処理にかかった時間。
   * BaseConverterが自動計測する。
   *
   * 制約:
   * - 0以上の数値
   * - 小数点含む（高精度計測）
   */
  readonly processingTime: number;
}
```

#### 2.2.2 バリデーションルール

| フィールド        | 必須 | 型制約            | 値制約                        |
| ----------------- | ---- | ----------------- | ----------------------------- |
| convertedContent  | ✓    | string            | （空文字列可）                |
| extractedMetadata | ✓    | ExtractedMetadata | ExtractedMetadataの制約に準拠 |
| processingTime    | ✓    | number            | 0以上                         |

#### 2.2.3 ファクトリ関数

```typescript
/**
 * ConverterOutputを生成するファクトリ関数
 */
export function createConverterOutput(
  convertedContent: string,
  extractedMetadata: ExtractedMetadata,
  processingTime: number,
): ConverterOutput {
  return {
    convertedContent,
    extractedMetadata,
    processingTime,
  };
}
```

---

### 2.3 ConverterOptions

#### 2.3.1 型定義

```typescript
/**
 * コンバーターの動作をカスタマイズするオプション
 *
 * すべてのフィールドはオプショナルで、デフォルト値が定義される。
 * コンバーター実装は必要なオプションのみを参照する。
 */
export interface ConverterOptions {
  /**
   * フォーマットを保持するか
   *
   * true: 空白・改行・インデントを可能な限り保持
   * false: 余分な空白を削除し、正規化
   *
   * デフォルト: false
   */
  readonly preserveFormatting?: boolean;

  /**
   * リンクを抽出するか
   *
   * true: URL、相対パスを抽出してメタデータに含める
   * false: リンク抽出をスキップ
   *
   * デフォルト: true
   */
  readonly extractLinks?: boolean;

  /**
   * 見出しを抽出するか
   *
   * true: Markdown見出し、HTML h1-h6等を抽出
   * false: 見出し抽出をスキップ
   *
   * デフォルト: true
   */
  readonly extractHeaders?: boolean;

  /**
   * コンテンツの最大長（文字数）
   *
   * 指定された文字数を超える場合、切り詰める。
   * undefinedの場合、制限なし。
   *
   * 制約: 1以上の整数
   */
  readonly maxContentLength?: number;

  /**
   * 言語ヒント（ISO 639-1形式）
   *
   * メタデータ抽出や言語検出の精度向上に使用。
   *
   * 例: "ja", "en", "fr"
   * デフォルト: undefined（自動検出）
   */
  readonly language?: string;

  /**
   * カスタムオプション
   *
   * コンバーター固有のオプションを格納。
   * 型安全性は失われるが、柔軟な拡張が可能。
   *
   * 例:
   * {
   *   // PDFコンバーター専用
   *   extractImages: true,
   *   ocrEnabled: false,
   *   // Markdownコンバーター専用
   *   gfmMode: true,
   *   mathSupport: true
   * }
   */
  readonly custom?: Record<string, unknown>;
}
```

#### 2.3.2 デフォルト値定義

```typescript
/**
 * ConverterOptionsのデフォルト値
 */
export const DEFAULT_CONVERTER_OPTIONS: Required<
  Omit<ConverterOptions, "maxContentLength" | "language" | "custom">
> &
  Pick<ConverterOptions, "custom"> = {
  preserveFormatting: false,
  extractLinks: true,
  extractHeaders: true,
  custom: {},
};
```

#### 2.3.3 ヘルパー関数

```typescript
/**
 * オプションをデフォルト値とマージ
 */
export function mergeConverterOptions(
  options?: ConverterOptions,
): ConverterOptions {
  return {
    ...DEFAULT_CONVERTER_OPTIONS,
    ...options,
    custom: {
      ...DEFAULT_CONVERTER_OPTIONS.custom,
      ...options?.custom,
    },
  };
}
```

---

### 2.4 ConverterMetadata

#### 2.4.1 型定義

```typescript
/**
 * コンバーターの静的メタデータ
 *
 * コンバーターの識別情報と能力を表す。
 * 各コンバーター実装で定義され、実行時に変更されない。
 */
export interface ConverterMetadata {
  /**
   * コンバーターID（一意）
   *
   * 制約:
   * - 英数字、ハイフン、アンダースコアのみ
   * - 空文字列不可
   * - ケバブケース推奨
   *
   * 例: "plain-text-converter", "markdown-converter"
   */
  readonly id: string;

  /**
   * コンバーター名（表示用）
   *
   * UI等で表示される人間可読な名前。
   *
   * 例: "Plain Text Converter", "Markdown Converter"
   */
  readonly name: string;

  /**
   * コンバーターの説明
   *
   * 機能と用途を簡潔に説明。
   *
   * 例: "Converts plain text files to searchable format"
   */
  readonly description: string;

  /**
   * バージョン（SemVer形式）
   *
   * 制約:
   * - Semantic Versioning 2.0.0準拠
   * - 形式: "major.minor.patch"
   *
   * 例: "1.0.0", "2.1.3"
   */
  readonly version: string;

  /**
   * サポートするMIMEタイプのリスト
   *
   * 制約:
   * - 最低1つ以上のMIMEタイプを含む
   * - RFC 6838形式
   * - readonly配列（イミュータブル）
   *
   * 例: ["text/plain"], ["text/markdown", "text/x-markdown"]
   */
  readonly supportedMimeTypes: readonly string[];

  /**
   * 優先度（高いほど優先）
   *
   * 複数のコンバーターが同じMIMEタイプをサポートする場合、
   * 優先度が高いものが選択される。
   *
   * 制約:
   * - 整数
   * - 推奨範囲: 0～100
   *
   * 例:
   * - 0: 標準優先度
   * - 10: 高優先度
   * - -10: 低優先度（フォールバック用）
   */
  readonly priority: number;
}
```

#### 2.4.2 バリデーションルール

| フィールド         | 必須 | 型制約            | 値制約                               |
| ------------------ | ---- | ----------------- | ------------------------------------ |
| id                 | ✓    | string            | 英数字・ハイフン・アンダースコアのみ |
| name               | ✓    | string            | 空文字列不可                         |
| description        | ✓    | string            | 空文字列不可                         |
| version            | ✓    | string            | SemVer形式                           |
| supportedMimeTypes | ✓    | readonly string[] | 1つ以上、RFC 6838形式                |
| priority           | ✓    | number            | 整数                                 |

---

### 2.5 IConverter インターフェース

#### 2.5.1 型定義

```typescript
/**
 * コンバーターインターフェース
 *
 * すべてのコンバーター実装が準拠すべき共通インターフェース。
 * BaseConverterが基本実装を提供し、サブクラスで拡張する。
 */
export interface IConverter {
  /**
   * コンバーターID
   *
   * ConverterMetadata.idと同じ値を返す。
   */
  readonly id: string;

  /**
   * コンバーター名
   *
   * ConverterMetadata.nameと同じ値を返す。
   */
  readonly name: string;

  /**
   * サポートするMIMEタイプ
   *
   * ConverterMetadata.supportedMimeTypesと同じ値を返す。
   */
  readonly supportedMimeTypes: readonly string[];

  /**
   * 優先度
   *
   * ConverterMetadata.priorityと同じ値を返す。
   */
  readonly priority: number;

  /**
   * このコンバーターで変換可能か判定
   *
   * 基本実装:
   * - supportedMimeTypesにinput.mimeTypeが含まれるかチェック
   *
   * カスタム実装:
   * - ファイルサイズ、エンコーディング等の追加条件チェック可能
   *
   * @param input - 変換対象の入力データ
   * @returns 変換可能な場合true、不可能な場合false
   */
  canConvert(input: ConverterInput): boolean;

  /**
   * ファイルを変換
   *
   * 実装ガイドライン:
   * 1. 入力バリデーション
   * 2. 前処理（preprocess）
   * 3. 実変換処理（doConvert）
   * 4. 後処理（postprocess）
   * 5. Result型でラップして返す
   *
   * エラーケース:
   * - CONVERSION_FAILED: 変換処理中のエラー
   * - INVALID_INPUT: 入力データが不正
   * - UNSUPPORTED_FORMAT: サポートされていない形式
   *
   * @param input - 変換対象の入力データ
   * @param options - 変換オプション（省略可）
   * @returns 変換結果またはエラー
   */
  convert(
    input: ConverterInput,
    options?: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>>;

  /**
   * 推定処理時間を取得（ミリ秒）
   *
   * デフォルト実装:
   * - コンテンツサイズに基づく線形推定（1KB = 1ms）
   *
   * カスタム実装:
   * - ファイル形式の複雑さを考慮した推定
   *
   * @param input - 変換対象の入力データ
   * @returns 推定処理時間（ミリ秒）
   */
  estimateProcessingTime(input: ConverterInput): number;
}
```

#### 2.5.2 拡張メソッド（BaseConverterで提供）

```typescript
/**
 * IConverterの拡張インターフェース（BaseConverterが実装）
 */
export interface IConverterExtended extends IConverter {
  /**
   * コンバーターのメタデータを取得
   *
   * @returns ConverterMetadata
   */
  getMetadata(): ConverterMetadata;

  /**
   * サポートしているMIMEタイプか判定
   *
   * @param mimeType - 判定するMIMEタイプ
   * @returns サポートしている場合true
   */
  supportsMimeType(mimeType: string): boolean;
}
```

---

## 3. Result型との統合

### 3.1 Result型の定義（参照）

```typescript
/**
 * 成功または失敗を表す型
 *
 * 例外をスローせず、型安全にエラーハンドリングを実現。
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

### 3.2 ヘルパー関数

```typescript
/**
 * 成功結果を生成
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * 失敗結果を生成
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
```

### 3.3 使用例

```typescript
// 変換成功
const successResult = ok<ConverterOutput>({
  convertedContent: "Hello, World!",
  extractedMetadata: {
    /* ... */
  },
  processingTime: 10.5,
});

// 変換失敗
const errorResult = err<RAGError>(
  createRAGError(ErrorCodes.CONVERSION_FAILED, "Failed to convert file", {
    converterId: "plain-text-converter",
  }),
);
```

### 3.4 RAGError型の定義（参照）

既存の`RAGError`型（`packages/shared/src/types/rag/errors.ts`）:

```typescript
export interface RAGError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
  readonly cause?: Error;
}
```

**統合方針**:

- 新規設計は既存の`RAGError`をそのまま使用
- クラスベースのエラー型（`ConversionError extends Error`）は採用しない
- 既存のインターフェースベース設計と一貫性を保つ

**理由**:

- RAGシステム全体で統一されたエラー型
- Result型との組み合わせで型安全なエラーハンドリングが実現
- `createRAGError()`ファクトリ関数で簡潔に生成可能

---

## 4. 型安全性パターン

### 4.1 Branded Type（FileId）

```typescript
/**
 * FileId型の定義例（既存）
 *
 * 通常の文字列と区別され、型安全性が向上。
 */
export type FileId = string & { readonly __brand: "FileId" };

/**
 * FileIdを生成（既存）
 */
export function createFileId(id: string): FileId {
  return id as FileId;
}
```

### 4.2 Discriminated Union

```typescript
/**
 * contentフィールドの型判定を型安全に実行
 */
export type TextConverterInput = ConverterInput & { content: string };
export type BinaryConverterInput = ConverterInput & { content: ArrayBuffer };

function processInput(input: ConverterInput) {
  if (isTextContent(input)) {
    // input.contentはstring型として扱われる
    const text: string = input.content;
  } else if (isBinaryContent(input)) {
    // input.contentはArrayBuffer型として扱われる
    const buffer: ArrayBuffer = input.content;
  }
}
```

### 4.3 Readonly配列

```typescript
/**
 * supportedMimeTypesをreadonlyで定義し、不変性を保証
 */
const converter = {
  supportedMimeTypes: ["text/plain", "text/markdown"] as const,
};

// ❌ コンパイルエラー
// converter.supportedMimeTypes.push("text/html");

// ✓ OK（読み取り専用）
const types: readonly string[] = converter.supportedMimeTypes;
```

---

## 5. Zodバリデーションスキーマ（将来実装）

### 5.1 ConverterInputスキーマ

```typescript
import { z } from "zod";

/**
 * ConverterInputのZodスキーマ
 *
 * ランタイムバリデーションに使用（将来実装）。
 */
export const ConverterInputSchema = z.object({
  fileId: z.string().min(1),
  filePath: z.string().min(1),
  mimeType: z.string().regex(/^[\w-]+\/[\w-]+$/),
  content: z.union([z.instanceof(ArrayBuffer), z.string()]),
  encoding: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * スキーマから型を推論
 */
export type ConverterInputValidated = z.infer<typeof ConverterInputSchema>;
```

### 5.2 ConverterOptionsスキーマ

```typescript
/**
 * ConverterOptionsのZodスキーマ
 */
export const ConverterOptionsSchema = z.object({
  preserveFormatting: z.boolean().optional(),
  extractLinks: z.boolean().optional(),
  extractHeaders: z.boolean().optional(),
  maxContentLength: z.number().int().min(1).optional(),
  language: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional(),
  custom: z.record(z.unknown()).optional(),
});
```

### 5.3 バリデーション関数

```typescript
/**
 * ConverterInputをバリデート
 *
 * @param input - 検証する入力データ
 * @returns バリデーション結果
 */
export function validateConverterInput(
  input: unknown,
): Result<ConverterInput, RAGError> {
  const result = ConverterInputSchema.safeParse(input);

  if (!result.success) {
    return err(
      createRAGError(ErrorCodes.INVALID_INPUT, "Invalid converter input", {
        zodError: result.error,
      }),
    );
  }

  return ok(result.data as ConverterInput);
}
```

---

## 6. 実装ガイドライン

### 6.1 ファイル構成

```
packages/shared/src/services/conversion/
├── types.ts                 # 本設計書の実装
├── types.test.ts           # 型定義のテスト
└── schemas.ts              # Zodスキーマ（将来実装）
```

### 6.2 インポート順序

```typescript
// 1. 外部依存
import type { Result } from "../../types/rag/result";
import type { RAGError } from "../../types/rag/errors";
import type { FileId } from "../../types/rag/entities";
import type { ExtractedMetadata } from "../../types/rag/metadata";

// 2. 型定義
export interface ConverterInput { /* ... */ }
export interface ConverterOutput { /* ... */ }
export interface ConverterOptions { /* ... */ }
export interface ConverterMetadata { /* ... */ }
export interface IConverter { /* ... */ }

// 3. 定数
export const DEFAULT_CONVERTER_OPTIONS = { /* ... */ };

// 4. ヘルパー関数
export function isTextContent(input: ConverterInput): /* ... */ { /* ... */ }
export function isBinaryContent(input: ConverterInput): /* ... */ { /* ... */ }
export function mergeConverterOptions(options?: ConverterOptions): /* ... */ { /* ... */ }

// 5. ファクトリ関数
export function createConverterInput(params: /* ... */): /* ... */ { /* ... */ }
export function createConverterOutput(/* ... */): /* ... */ { /* ... */ }
```

### 6.3 コメント規約

```typescript
/**
 * 型・インターフェースのJSDocコメント
 *
 * - 1行目: 簡潔な説明
 * - 空行
 * - 詳細説明（複数行可）
 * - 空行
 * - 制約・注意事項
 * - 例
 */
```

### 6.4 命名規約

| 要素             | 規約                                            | 例                                       |
| ---------------- | ----------------------------------------------- | ---------------------------------------- |
| インターフェース | PascalCase、I接頭辞（公開インターフェースのみ） | `IConverter`                             |
| 型エイリアス     | PascalCase                                      | `ConverterInput`                         |
| 定数             | UPPER_SNAKE_CASE                                | `DEFAULT_CONVERTER_OPTIONS`              |
| 関数             | camelCase                                       | `isTextContent`, `mergeConverterOptions` |
| ファクトリ関数   | create接頭辞                                    | `createConverterInput`                   |
| 型ガード         | is接頭辞                                        | `isTextContent`, `isBinaryContent`       |

---

## 7. テスト設計

### 7.1 型定義テスト

```typescript
import { describe, it, expect } from "vitest";
import type { ConverterInput, ConverterOutput } from "./types";

describe("ConverterInput", () => {
  it("should accept valid input", () => {
    const input: ConverterInput = {
      fileId: "file_123" as FileId,
      filePath: "/path/to/file.txt",
      mimeType: "text/plain",
      content: "Hello, World!",
      encoding: "utf-8",
    };

    expect(input).toBeDefined();
  });

  it("should reject invalid input at compile time", () => {
    // @ts-expect-error - fileIdが欠けている
    const invalidInput: ConverterInput = {
      filePath: "/path/to/file.txt",
      mimeType: "text/plain",
      content: "Hello, World!",
      encoding: "utf-8",
    };
  });
});
```

### 7.2 型ガード関数テスト

```typescript
describe("isTextContent", () => {
  it("should return true for string content", () => {
    const input: ConverterInput = {
      fileId: "file_123" as FileId,
      filePath: "/path/to/file.txt",
      mimeType: "text/plain",
      content: "Hello",
      encoding: "utf-8",
    };

    expect(isTextContent(input)).toBe(true);
  });

  it("should return false for ArrayBuffer content", () => {
    const buffer = new ArrayBuffer(10);
    const input: ConverterInput = {
      fileId: "file_123" as FileId,
      filePath: "/path/to/file.bin",
      mimeType: "application/octet-stream",
      content: buffer,
      encoding: "utf-8",
    };

    expect(isTextContent(input)).toBe(false);
  });
});
```

### 7.3 ヘルパー関数テスト

```typescript
describe("mergeConverterOptions", () => {
  it("should merge with default options", () => {
    const options: ConverterOptions = {
      preserveFormatting: true,
    };

    const merged = mergeConverterOptions(options);

    expect(merged.preserveFormatting).toBe(true);
    expect(merged.extractLinks).toBe(true); // デフォルト値
    expect(merged.extractHeaders).toBe(true); // デフォルト値
  });

  it("should deep merge custom options", () => {
    const options: ConverterOptions = {
      custom: { foo: "bar" },
    };

    const merged = mergeConverterOptions(options);

    expect(merged.custom).toEqual({ foo: "bar" });
  });
});
```

---

## 8. パフォーマンス考慮事項

### 8.1 イミュータブル設計

すべてのプロパティをreadonlyとすることで、意図しない変更を防止し、予測可能な動作を保証。

### 8.2 型推論の最適化

```typescript
// ✓ 良い例: 型推論を活用
const input = {
  fileId: "file_123" as FileId,
  filePath: "/path/to/file.txt",
  mimeType: "text/plain",
  content: "Hello",
  encoding: "utf-8",
} satisfies ConverterInput;

// ✗ 悪い例: 冗長な型注釈
const input: ConverterInput = {
  fileId: "file_123" as FileId,
  filePath: "/path/to/file.txt",
  mimeType: "text/plain",
  content: "Hello" as string,
  encoding: "utf-8" as string,
};
```

### 8.3 メモリ効率

```typescript
// contentがArrayBufferの場合、コピーを避ける
function processContent(input: ConverterInput): string {
  if (isTextContent(input)) {
    return input.content; // 文字列はそのまま返す
  } else {
    // ArrayBufferをデコードするが、元のバッファは保持
    return new TextDecoder(input.encoding).decode(input.content);
  }
}
```

---

## 9. マイグレーション戦略

### 9.1 フェーズ1: 基本型定義

- ConverterInput, ConverterOutput, ConverterOptions, ConverterMetadata, IConverterを実装
- 型ガード関数、ヘルパー関数を実装
- 単体テストを作成

### 9.2 フェーズ2: Zodスキーマ（将来）

- ConverterInputSchema, ConverterOptionsSchemaを実装
- バリデーション関数を実装
- バリデーションテストを作成

### 9.3 フェーズ3: 最適化（将来）

- パフォーマンスプロファイリング
- 型推論の最適化
- メモリ効率の改善

---

## 9A. 既存型定義との関係性と統合方針

### 9A.1 既存ファイル型定義との関係

#### 既存型: FileEntity (packages/shared/src/types/rag/file/types.ts)

既存のRAGシステムには`FileEntity`が定義されており、ファイルのメタデータを表現しています。

```typescript
// 既存の型定義（参照）
export interface FileEntity {
  readonly id: FileId;
  readonly path: string;
  readonly mimeType: string;
  readonly size: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  // ... 他のフィールド
}
```

#### 新規型: ConverterInput

`ConverterInput`は変換処理に必要な一時的なデータコンテナです。

**関係性**:

- `FileEntity` → `ConverterInput`への変換が必要
- `FileEntity`は永続化されるエンティティ
- `ConverterInput`は変換処理のための値オブジェクト

**変換関数**:

```typescript
/**
 * FileEntityからConverterInputを生成
 *
 * @param file - ファイルエンティティ
 * @param content - ファイルの内容（別途読み込み）
 * @returns ConverterInput
 */
export function createConverterInputFromFile(
  file: FileEntity,
  content: ArrayBuffer | string,
): ConverterInput {
  return {
    fileId: file.id,
    filePath: file.path,
    mimeType: file.mimeType,
    content,
    encoding: file.encoding ?? "utf-8",
    metadata: {
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      size: file.size,
    },
  };
}
```

---

### 9A.2 既存変換結果型との関係

#### 既存型: ConversionResult (packages/shared/src/types/rag/file/types.ts - 推定)

既存システムに変換結果を表す型が存在する可能性があります。

**新規型との区別**:

| 型名               | 用途                        | スコープ           | 含むフィールド                                                               |
| ------------------ | --------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `ConverterOutput`  | 変換処理の出力（内部用）    | ドメイン層         | convertedContent, extractedMetadata, processingTime                          |
| `ConversionResult` | 変換結果の永続化（外部API） | アプリケーション層 | conversionId, fileId, originalContent, convertedContent, metadata, createdAt |

**変換関数**:

```typescript
/**
 * ConverterOutputからConversionResultを生成
 *
 * @param output - 変換出力
 * @param conversionId - 変換ID
 * @param fileId - ファイルID
 * @param originalContent - 元のコンテンツ
 * @returns ConversionResult
 */
export function createConversionResult(
  output: ConverterOutput,
  conversionId: ConversionId,
  fileId: FileId,
  originalContent: string,
): ConversionResult {
  return {
    conversionId,
    fileId,
    originalContent,
    convertedContent: output.convertedContent,
    metadata: output.extractedMetadata,
    processingTime: output.processingTime,
    createdAt: new Date(),
  };
}
```

---

### 9A.3 エラーコードの修正

#### 設計書で使用していたが既存にないエラーコード

| 設計書のコード  | 既存コード（代用）    | 変更箇所                                     |
| --------------- | --------------------- | -------------------------------------------- |
| `INVALID_INPUT` | `VALIDATION_ERROR`    | design-base-converter.md, design-registry.md |
| `NOT_FOUND`     | `CONVERTER_NOT_FOUND` | design-registry.md                           |

#### 追加が必要なエラーコード

| エラーコード         | 用途                 | 追加先                                  |
| -------------------- | -------------------- | --------------------------------------- |
| `TIMEOUT`            | 変換処理タイムアウト | packages/shared/src/types/rag/errors.ts |
| `RESOURCE_EXHAUSTED` | 同時実行数超過       | packages/shared/src/types/rag/errors.ts |

**実装時の対応**:

1. `errors.ts`に`TIMEOUT`と`RESOURCE_EXHAUSTED`を追加
2. 設計書のエラーコードを既存コードに統一（詳細は`error-codes-analysis.md`参照）

---

### 9A.4 ExtractedMetadata型の定義場所

**設計方針**: `ExtractedMetadata`は変換モジュール固有の型のため、`packages/shared/src/services/conversion/types.ts`に定義します。

**理由**:

- RAGシステム全体で共通の型ではない
- 変換処理のドメイン概念
- 他モジュールから直接参照されない（ConverterOutputを通じて間接的に参照）

**型定義**:

```typescript
/**
 * 抽出されたメタデータ
 *
 * テキストから自動抽出される構造化情報。
 * MetadataExtractorが生成する。
 */
export interface ExtractedMetadata {
  readonly title: string | null;
  readonly author: string | null;
  readonly language: "ja" | "en";
  readonly wordCount: number;
  readonly lineCount: number;
  readonly charCount: number;
  readonly headers: Array<{ level: number; text: string }>;
  readonly codeBlocks: number;
  readonly links: string[];
  readonly custom: Record<string, unknown>;
}
```

---

### 9A.5 型定義の配置戦略

```
packages/shared/src/
├── types/rag/              # RAGシステム共通型
│   ├── branded.ts          # FileId, ConversionId等のBranded Type
│   ├── result.ts           # Result型
│   ├── errors.ts           # RAGError, ErrorCodes
│   └── file/
│       └── types.ts        # FileEntity（既存）
└── services/conversion/    # 変換モジュール
    └── types.ts            # ConverterInput, ConverterOutput, ExtractedMetadata等（新規）
```

**原則**:

- **共通型**: `types/rag/`に配置（システム全体で使用）
- **モジュール固有型**: `services/conversion/types.ts`に配置（変換モジュール内でのみ使用）

---

## 10. 変更履歴

| 日付       | バージョン | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 2025-12-20 | 1.0.0      | AI     | 初版作成 |

---

## 11. 完了条件チェックリスト

- [ ] ConverterInput/Output/Optionsの詳細設計が完了
- [ ] IConverterインターフェースの設計が完了
- [ ] ConverterMetadataの設計が完了
- [ ] Result型との統合方針が明確
- [ ] 型安全性パターンが適用されている
- [ ] Zodバリデーションスキーマ（将来実装）が設計されている
- [ ] 実装ガイドラインが明確
- [ ] テスト設計が完了
