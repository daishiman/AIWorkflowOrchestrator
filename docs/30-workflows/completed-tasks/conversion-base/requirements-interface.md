# コンバーターインターフェース - 詳細仕様書

## 1. 概要

### 1.1 目的

ファイル変換処理の共通インターフェースを定義し、すべてのコンバーター実装が統一された方法で提供されることを保証する。

### 1.2 スコープ

本ドキュメントでは以下のインターフェース・型定義の詳細仕様を記述する：

- `IConverter` - コンバーターインターフェース
- `ConverterInput` - コンバーター入力型
- `ConverterOutput` - コンバーター出力型
- `ConverterOptions` - コンバーターオプション型
- `ConverterMetadata` - コンバーターメタデータ型

---

## 2. 型定義仕様

### 2.1 ConverterInput

**説明**: コンバーターへの入力データを表す型

#### プロパティ

| プロパティ名 | 型                        | 必須 | 説明                                            |
| ------------ | ------------------------- | ---- | ----------------------------------------------- |
| `fileId`     | `FileId`                  | ✓    | ファイルの一意識別子（Branded Type）            |
| `filePath`   | `string`                  | ✓    | ファイルのパス                                  |
| `mimeType`   | `string`                  | ✓    | MIMEタイプ（例: "text/plain", "text/markdown"） |
| `content`    | `ArrayBuffer \| string`   | ✓    | ファイルの内容（バイナリまたはテキスト）        |
| `encoding`   | `string`                  | ✓    | 文字エンコーディング（例: "utf-8"）             |
| `metadata`   | `Record<string, unknown>` | -    | 追加メタデータ（オプション）                    |

#### TypeScript定義

```typescript
export interface ConverterInput {
  readonly fileId: FileId;
  readonly filePath: string;
  readonly mimeType: string;
  readonly content: ArrayBuffer | string;
  readonly encoding: string;
  readonly metadata?: Record<string, unknown>;
}
```

#### 制約・バリデーション

- `fileId`: FileId型のBranded Type（空文字列不可）
- `filePath`: 空文字列不可
- `mimeType`: 有効なMIMEタイプ形式（例: "type/subtype"）
- `content`: 空でないこと
- `encoding`: 有効なエンコーディング名（例: "utf-8", "shift-jis"）

#### 使用例

```typescript
const input: ConverterInput = {
  fileId: "file_abc123" as FileId,
  filePath: "/path/to/document.md",
  mimeType: "text/markdown",
  content: "# Hello World\n\nThis is a test.",
  encoding: "utf-8",
  metadata: {
    author: "John Doe",
    createdAt: "2025-12-20T00:00:00Z",
  },
};
```

---

### 2.2 ConverterOutput

**説明**: コンバーターからの出力データを表す型

#### プロパティ

| プロパティ名        | 型                  | 必須 | 説明                       |
| ------------------- | ------------------- | ---- | -------------------------- |
| `convertedContent`  | `string`            | ✓    | 変換後のテキストコンテンツ |
| `extractedMetadata` | `ExtractedMetadata` | ✓    | 抽出されたメタデータ       |
| `processingTime`    | `number`            | ✓    | 処理時間（ミリ秒）         |

#### TypeScript定義

```typescript
export interface ConverterOutput {
  readonly convertedContent: string;
  readonly extractedMetadata: ExtractedMetadata;
  readonly processingTime: number; // ms
}
```

#### 制約・バリデーション

- `convertedContent`: 空文字列可（空ファイルの場合）
- `extractedMetadata`: ExtractedMetadata型に準拠
- `processingTime`: 0以上の数値

#### 使用例

```typescript
const output: ConverterOutput = {
  convertedContent: "# Hello World\n\nThis is a test.",
  extractedMetadata: {
    title: "Hello World",
    author: null,
    language: "en",
    wordCount: 5,
    lineCount: 3,
    charCount: 32,
    headers: ["# Hello World"],
    codeBlocks: 0,
    links: [],
    custom: {},
  },
  processingTime: 12.5,
};
```

---

### 2.3 ConverterOptions

**説明**: コンバーターの動作をカスタマイズするオプション

#### プロパティ

| プロパティ名         | 型                        | 必須 | デフォルト | 説明                                    |
| -------------------- | ------------------------- | ---- | ---------- | --------------------------------------- |
| `preserveFormatting` | `boolean`                 | -    | `false`    | フォーマットを保持するか                |
| `extractLinks`       | `boolean`                 | -    | `true`     | リンクを抽出するか                      |
| `extractHeaders`     | `boolean`                 | -    | `true`     | 見出しを抽出するか                      |
| `maxContentLength`   | `number`                  | -    | なし       | コンテンツの最大長（文字数）            |
| `language`           | `string`                  | -    | なし       | 言語ヒント（ISO 639-1形式: "ja", "en"） |
| `custom`             | `Record<string, unknown>` | -    | `{}`       | カスタムオプション                      |

#### TypeScript定義

```typescript
export interface ConverterOptions {
  readonly preserveFormatting?: boolean;
  readonly extractLinks?: boolean;
  readonly extractHeaders?: boolean;
  readonly maxContentLength?: number;
  readonly language?: string; // ISO 639-1形式
  readonly custom?: Record<string, unknown>;
}
```

#### 制約・バリデーション

- `maxContentLength`: 1以上の整数
- `language`: ISO 639-1形式（2文字: "ja", "en", "fr"等）

#### 使用例

```typescript
const options: ConverterOptions = {
  preserveFormatting: true,
  extractLinks: true,
  extractHeaders: true,
  maxContentLength: 100000,
  language: "ja",
  custom: {
    removeCodeBlocks: false,
    highlightSyntax: true,
  },
};
```

---

### 2.4 ConverterMetadata

**説明**: コンバーターの静的メタデータ

#### プロパティ

| プロパティ名         | 型                  | 必須 | 説明                     |
| -------------------- | ------------------- | ---- | ------------------------ |
| `id`                 | `string`            | ✓    | コンバーターID（一意）   |
| `name`               | `string`            | ✓    | コンバーター名（表示用） |
| `description`        | `string`            | ✓    | コンバーターの説明       |
| `version`            | `string`            | ✓    | バージョン（SemVer形式） |
| `supportedMimeTypes` | `readonly string[]` | ✓    | サポートMIMEタイプリスト |
| `priority`           | `number`            | ✓    | 優先度（高いほど優先）   |

#### TypeScript定義

```typescript
export interface ConverterMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly supportedMimeTypes: readonly string[];
  readonly priority: number;
}
```

#### 制約・バリデーション

- `id`: 空文字列不可、英数字・ハイフン・アンダースコアのみ
- `version`: SemVer形式（例: "1.0.0"）
- `supportedMimeTypes`: 最低1つのMIMEタイプを含む
- `priority`: 整数（通常0～100）

#### 使用例

```typescript
const metadata: ConverterMetadata = {
  id: "markdown-converter",
  name: "Markdown Converter",
  description: "Converts Markdown files to plain text",
  version: "1.0.0",
  supportedMimeTypes: ["text/markdown", "text/x-markdown"],
  priority: 10,
};
```

---

## 3. IConverter インターフェース仕様

### 3.1 概要

すべてのコンバーター実装が準拠すべき基本インターフェース。

### 3.2 TypeScript定義

```typescript
export interface IConverter {
  /** コンバーターID */
  readonly id: string;

  /** コンバーター名 */
  readonly name: string;

  /** サポートするMIMEタイプ */
  readonly supportedMimeTypes: readonly string[];

  /** 優先度（高いほど優先） */
  readonly priority: number;

  /**
   * このコンバーターで変換可能か判定
   */
  canConvert(input: ConverterInput): boolean;

  /**
   * ファイルを変換
   */
  convert(
    input: ConverterInput,
    options?: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>>;

  /**
   * 推定処理時間を取得（ms）
   */
  estimateProcessingTime(input: ConverterInput): number;
}
```

### 3.3 プロパティ詳細

#### id: string

- **型**: `string`
- **必須**: ✓
- **説明**: コンバーターの一意識別子
- **制約**:
  - 空文字列不可
  - 英数字・ハイフン・アンダースコアのみ
  - 他のコンバーターと重複不可
- **例**: `"text-plain-converter"`, `"markdown-converter"`

#### name: string

- **型**: `string`
- **必須**: ✓
- **説明**: コンバーターの表示名
- **制約**: 空文字列不可
- **例**: `"Plain Text Converter"`, `"Markdown Converter"`

#### supportedMimeTypes: readonly string[]

- **型**: `readonly string[]`
- **必須**: ✓
- **説明**: このコンバーターがサポートするMIMEタイプのリスト
- **制約**: 最低1つのMIMEタイプを含む
- **例**: `["text/plain"]`, `["text/markdown", "text/x-markdown"]`

#### priority: number

- **型**: `number`
- **必須**: ✓
- **説明**: コンバーターの優先度（複数の候補がある場合に使用）
- **制約**: 整数（推奨範囲: 0～100）
- **デフォルト**: `0`
- **例**: `0`（標準）, `10`（高優先度）

### 3.4 メソッド詳細

#### canConvert(input: ConverterInput): boolean

**説明**: 指定された入力をこのコンバーターで変換可能か判定する

**パラメータ**:

- `input: ConverterInput` - 変換対象の入力データ

**戻り値**:

- `boolean` - 変換可能な場合 `true`、不可能な場合 `false`

**実装ガイドライン**:

- 基本実装: `supportedMimeTypes`に含まれるかチェック
- カスタム実装: ファイルサイズ、エンコーディング等の追加条件チェック可能

**使用例**:

```typescript
const converter: IConverter = ...;
const input: ConverterInput = {
  fileId: "file_123" as FileId,
  filePath: "/path/to/file.md",
  mimeType: "text/markdown",
  content: "# Title",
  encoding: "utf-8"
};

if (converter.canConvert(input)) {
  // 変換処理を実行
}
```

---

#### convert(input: ConverterInput, options?: ConverterOptions): Promise<Result<ConverterOutput, RAGError>>

**説明**: ファイルを変換する

**パラメータ**:

- `input: ConverterInput` - 変換対象の入力データ
- `options?: ConverterOptions` - 変換オプション（省略可）

**戻り値**:

- `Promise<Result<ConverterOutput, RAGError>>` - 変換結果またはエラー

**エラーケース**:

- `ErrorCodes.CONVERSION_FAILED` - 変換処理中のエラー
- `ErrorCodes.INVALID_INPUT` - 入力データが不正
- `ErrorCodes.UNSUPPORTED_FORMAT` - サポートされていない形式

**実装ガイドライン**:

1. 入力バリデーション
2. 前処理（オプション）
3. 実変換処理
4. 後処理（オプション）
5. Result型でラップして返す

**使用例**:

```typescript
const result = await converter.convert(input, {
  preserveFormatting: true,
  extractHeaders: true,
});

if (result.success) {
  console.log("変換成功:", result.data.convertedContent);
} else {
  console.error("変換失敗:", result.error.message);
}
```

---

#### estimateProcessingTime(input: ConverterInput): number

**説明**: 変換処理の推定時間をミリ秒単位で返す

**パラメータ**:

- `input: ConverterInput` - 変換対象の入力データ

**戻り値**:

- `number` - 推定処理時間（ミリ秒）

**実装ガイドライン**:

- デフォルト実装: コンテンツサイズに基づく線形推定（1KB = 1ms）
- カスタム実装: ファイル形式の複雑さを考慮した推定

**使用例**:

```typescript
const estimatedTime = converter.estimateProcessingTime(input);
console.log(`推定処理時間: ${estimatedTime}ms`);
```

---

## 4. エラーハンドリング方針

### 4.1 Result型の使用

すべてのエラーは例外をスローせず、Result型でラップして返す。

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

### 4.2 エラーコード

変換処理で使用する主なエラーコード：

| エラーコード          | 説明               | 使用ケース               |
| --------------------- | ------------------ | ------------------------ |
| `CONVERSION_FAILED`   | 変換処理失敗       | 変換中の予期しないエラー |
| `INVALID_INPUT`       | 入力データ不正     | バリデーションエラー     |
| `UNSUPPORTED_FORMAT`  | 非サポート形式     | MIMEタイプ不一致等       |
| `TIMEOUT`             | タイムアウト       | 処理時間超過             |
| `CONVERTER_NOT_FOUND` | コンバーター未発見 | レジストリに該当なし     |

### 4.3 エラーメッセージのガイドライン

- **明確性**: 何が問題かを明示
- **具体性**: エラーの原因を特定可能に
- **機密情報**: 内部実装の詳細を漏らさない
- **多言語**: 可能な限り英語で記述

**良い例**:

```typescript
createRAGError(
  ErrorCodes.CONVERSION_FAILED,
  "Failed to convert Markdown file: Invalid syntax at line 42",
  { converterId: "markdown-converter", fileId: input.fileId },
);
```

**悪い例**:

```typescript
// ❌ 曖昧
createRAGError(ErrorCodes.CONVERSION_FAILED, "Error");

// ❌ 機密情報漏洩
createRAGError(
  ErrorCodes.CONVERSION_FAILED,
  "Database connection failed at /var/lib/mysql",
);
```

---

## 5. 拡張性の考慮

### 5.1 カスタムオプションの追加

`ConverterOptions.custom`フィールドを使用して、コンバーター固有のオプションを追加可能。

```typescript
const options: ConverterOptions = {
  custom: {
    // PDFコンバーター専用オプション
    extractImages: true,
    ocrEnabled: false,
    // Markdownコンバーター専用オプション
    gfmMode: true,
    mathSupport: true,
  },
};
```

### 5.2 メタデータの拡張

`ExtractedMetadata.custom`フィールドを使用して、追加メタデータを格納可能。

```typescript
const metadata: ExtractedMetadata = {
  title: "Document Title",
  // ... 標準フィールド
  custom: {
    // 独自メタデータ
    readingTime: 5, // 分
    difficulty: "intermediate",
    tags: ["tutorial", "typescript"],
  },
};
```

---

## 6. 使用例（総合）

### 6.1 カスタムコンバーターの実装

```typescript
import { BaseConverter } from "./base-converter";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
} from "./types";
import type { Result, RAGError } from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";

export class PlainTextConverter extends BaseConverter {
  readonly id = "plain-text-converter";
  readonly name = "Plain Text Converter";
  readonly supportedMimeTypes = ["text/plain"] as const;
  readonly priority = 0;

  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      // 文字列変換
      const text =
        typeof input.content === "string"
          ? input.content
          : new TextDecoder(input.encoding).decode(input.content);

      // メタデータ抽出
      const extractedMetadata = MetadataExtractor.extractFromText(text);

      return ok({
        convertedContent: text,
        extractedMetadata,
        processingTime: 0, // BaseConverterが自動計測
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `Failed to convert plain text file`,
          { converterId: this.id, fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }

  protected getDescription(): string {
    return "Converts plain text files to searchable format";
  }
}
```

### 6.2 レジストリへの登録と使用

```typescript
import { globalConverterRegistry } from "./converter-registry";
import { PlainTextConverter } from "./plain-text-converter";

// コンバーター登録
const converter = new PlainTextConverter();
globalConverterRegistry.register(converter);

// 変換実行
const input: ConverterInput = {
  fileId: "file_123" as FileId,
  filePath: "/path/to/file.txt",
  mimeType: "text/plain",
  content: "Hello, World!",
  encoding: "utf-8",
};

const converterResult = globalConverterRegistry.findConverter(input);
if (converterResult.success) {
  const result = await converterResult.data.convert(input);
  if (result.success) {
    console.log("変換成功:", result.data);
  }
}
```

---

## 7. 型チェックとバリデーション

### 7.1 TypeScriptによる型チェック

すべてのインターフェースはTypeScriptの型システムで検証される。

```typescript
// ✓ 正しい実装
const input: ConverterInput = {
  fileId: "file_123" as FileId,
  filePath: "/path/to/file.txt",
  mimeType: "text/plain",
  content: "Hello",
  encoding: "utf-8",
};

// ✗ 型エラー: fileIdが欠けている
const invalidInput: ConverterInput = {
  filePath: "/path/to/file.txt",
  mimeType: "text/plain",
  content: "Hello",
  encoding: "utf-8",
};
```

### 7.2 ランタイムバリデーション（推奨）

Zodを使用したランタイムバリデーション（将来拡張）:

```typescript
import { z } from "zod";

const ConverterInputSchema = z.object({
  fileId: z.string().min(1),
  filePath: z.string().min(1),
  mimeType: z.string().regex(/^[\w-]+\/[\w-]+$/),
  content: z.union([z.instanceof(ArrayBuffer), z.string()]),
  encoding: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

// 使用例
const result = ConverterInputSchema.safeParse(input);
if (!result.success) {
  console.error("バリデーションエラー:", result.error);
}
```

---

## 8. 変更履歴

| 日付       | バージョン | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 2025-12-20 | 1.0.0      | AI     | 初版作成 |
