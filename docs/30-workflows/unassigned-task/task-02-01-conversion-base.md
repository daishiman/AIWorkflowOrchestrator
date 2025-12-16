# CONV-02-01: ファイル変換基盤・インターフェース

## 概要

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | CONV-02-01                                 |
| タスク名 | ファイル変換基盤・インターフェース         |
| 依存     | CONV-01, CONV-03-02                        |
| 規模     | 中                                         |
| 出力場所 | `packages/shared/src/services/conversion/` |

## 目的

ファイル変換処理の基盤となるインターフェース、抽象クラス、レジストリを実装する。
各種コンバーター（CONV-02-02, CONV-02-03）の共通基盤となる。

## 成果物

### 1. コンバーターインターフェース

```typescript
// packages/shared/src/services/conversion/types.ts

import type { FileId, ConversionId } from "../../types/rag/branded";
import type {
  FileEntity,
  ConversionResult,
  ExtractedMetadata,
} from "../../types/rag/file";
import type { Result, RAGError } from "../../types/rag";

/**
 * コンバーター入力
 */
export interface ConverterInput {
  readonly fileId: FileId;
  readonly filePath: string;
  readonly mimeType: string;
  readonly content: ArrayBuffer | string;
  readonly encoding: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * コンバーター出力
 */
export interface ConverterOutput {
  readonly convertedContent: string;
  readonly extractedMetadata: ExtractedMetadata;
  readonly processingTime: number; // ms
}

/**
 * コンバーターオプション
 */
export interface ConverterOptions {
  readonly preserveFormatting?: boolean;
  readonly extractLinks?: boolean;
  readonly extractHeaders?: boolean;
  readonly maxContentLength?: number;
  readonly language?: string; // 言語ヒント
  readonly custom?: Record<string, unknown>;
}

/**
 * コンバーターインターフェース
 */
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

/**
 * コンバーターメタデータ
 */
export interface ConverterMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly supportedMimeTypes: readonly string[];
  readonly priority: number;
}
```

### 2. 抽象コンバータークラス

```typescript
// packages/shared/src/services/conversion/base-converter.ts

import type {
  IConverter,
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
  ConverterMetadata,
} from "./types";
import type { Result, RAGError } from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";

/**
 * 抽象コンバータークラス
 * 各コンバーターはこのクラスを継承して実装
 */
export abstract class BaseConverter implements IConverter {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly supportedMimeTypes: readonly string[];
  readonly priority: number = 0;

  /**
   * 変換可能かどうかを判定
   */
  canConvert(input: ConverterInput): boolean {
    return this.supportedMimeTypes.includes(input.mimeType);
  }

  /**
   * 変換処理のラッパー
   * 前処理・後処理・エラーハンドリングを共通化
   */
  async convert(
    input: ConverterInput,
    options: ConverterOptions = {},
  ): Promise<Result<ConverterOutput, RAGError>> {
    const startTime = performance.now();

    try {
      // 前処理
      const preprocessed = await this.preprocess(input, options);
      if (!preprocessed.success) return preprocessed;

      // 実変換処理
      const converted = await this.doConvert(preprocessed.data, options);
      if (!converted.success) return converted;

      // 後処理
      const postprocessed = await this.postprocess(converted.data, options);
      if (!postprocessed.success) return postprocessed;

      const processingTime = performance.now() - startTime;

      return ok({
        ...postprocessed.data,
        processingTime,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `Conversion failed: ${this.id}`,
          { converterId: this.id, fileId: input.fileId },
          error as Error,
        ),
      );
    }
  }

  /**
   * 推定処理時間（デフォルト実装）
   */
  estimateProcessingTime(input: ConverterInput): number {
    const contentLength =
      typeof input.content === "string"
        ? input.content.length
        : input.content.byteLength;

    // デフォルト: 1KB あたり 1ms
    return Math.ceil(contentLength / 1024);
  }

  /**
   * メタデータ取得
   */
  getMetadata(): ConverterMetadata {
    return {
      id: this.id,
      name: this.name,
      description: this.getDescription(),
      version: this.getVersion(),
      supportedMimeTypes: this.supportedMimeTypes,
      priority: this.priority,
    };
  }

  /**
   * 前処理（サブクラスでオーバーライド可能）
   */
  protected async preprocess(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterInput, RAGError>> {
    return ok(input);
  }

  /**
   * 後処理（サブクラスでオーバーライド可能）
   */
  protected async postprocess(
    output: ConverterOutput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    return ok(output);
  }

  /**
   * 実変換処理（サブクラスで必須実装）
   */
  protected abstract doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>>;

  /**
   * 説明取得（サブクラスでオーバーライド可能）
   */
  protected getDescription(): string {
    return `Converter for ${this.supportedMimeTypes.join(", ")}`;
  }

  /**
   * バージョン取得（サブクラスでオーバーライド可能）
   */
  protected getVersion(): string {
    return "1.0.0";
  }
}
```

### 3. コンバーターレジストリ

```typescript
// packages/shared/src/services/conversion/converter-registry.ts

import type { IConverter, ConverterInput, ConverterMetadata } from "./types";
import type { Result, RAGError } from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";

/**
 * コンバーターレジストリ
 * 利用可能なコンバーターを管理し、適切なコンバーターを選択
 */
export class ConverterRegistry {
  private converters: Map<string, IConverter> = new Map();

  /**
   * コンバーターを登録
   */
  register(converter: IConverter): void {
    if (this.converters.has(converter.id)) {
      console.warn(
        `Converter ${converter.id} is already registered. Overwriting.`,
      );
    }
    this.converters.set(converter.id, converter);
  }

  /**
   * コンバーターを登録解除
   */
  unregister(converterId: string): boolean {
    return this.converters.delete(converterId);
  }

  /**
   * IDでコンバーターを取得
   */
  get(converterId: string): IConverter | undefined {
    return this.converters.get(converterId);
  }

  /**
   * 入力に対して最適なコンバーターを取得
   * 複数の候補がある場合は優先度順でソート
   */
  findConverter(input: ConverterInput): Result<IConverter, RAGError> {
    const candidates = Array.from(this.converters.values())
      .filter((converter) => converter.canConvert(input))
      .sort((a, b) => b.priority - a.priority);

    if (candidates.length === 0) {
      return err(
        createRAGError(
          ErrorCodes.CONVERTER_NOT_FOUND,
          `No converter found for MIME type: ${input.mimeType}`,
          { mimeType: input.mimeType },
        ),
      );
    }

    return ok(candidates[0]);
  }

  /**
   * 入力に対して利用可能な全コンバーターを取得
   */
  findAllConverters(input: ConverterInput): IConverter[] {
    return Array.from(this.converters.values())
      .filter((converter) => converter.canConvert(input))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * MIMEタイプに対応するコンバーターを取得
   */
  getConvertersForMimeType(mimeType: string): IConverter[] {
    return Array.from(this.converters.values())
      .filter((converter) => converter.supportedMimeTypes.includes(mimeType))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * 登録済みコンバーター一覧を取得
   */
  listConverters(): ConverterMetadata[] {
    return Array.from(this.converters.values()).map((converter) => ({
      id: converter.id,
      name: converter.name,
      description: "", // BaseConverter以外は直接取得できない
      version: "",
      supportedMimeTypes: converter.supportedMimeTypes,
      priority: converter.priority,
    }));
  }

  /**
   * サポートされるMIMEタイプ一覧を取得
   */
  getSupportedMimeTypes(): string[] {
    const mimeTypes = new Set<string>();
    for (const converter of this.converters.values()) {
      for (const mimeType of converter.supportedMimeTypes) {
        mimeTypes.add(mimeType);
      }
    }
    return Array.from(mimeTypes).sort();
  }

  /**
   * 登録済みコンバーター数を取得
   */
  get size(): number {
    return this.converters.size;
  }

  /**
   * 全コンバーターをクリア
   */
  clear(): void {
    this.converters.clear();
  }
}

/**
 * グローバルレジストリインスタンス
 */
export const globalConverterRegistry = new ConverterRegistry();
```

### 4. 変換サービス

```typescript
// packages/shared/src/services/conversion/conversion-service.ts

import type { FileId, ConversionId } from "../../types/rag/branded";
import type { ConversionResult } from "../../types/rag/file";
import type { Result, RAGError } from "../../types/rag";
import type {
  ConverterInput,
  ConverterOptions,
  ConverterOutput,
} from "./types";
import {
  ok,
  err,
  createRAGError,
  ErrorCodes,
  generateConversionId,
} from "../../types/rag";
import {
  ConverterRegistry,
  globalConverterRegistry,
} from "./converter-registry";

/**
 * 変換サービス設定
 */
export interface ConversionServiceConfig {
  readonly maxConcurrentConversions?: number;
  readonly timeoutMs?: number;
  readonly retryCount?: number;
  readonly cacheEnabled?: boolean;
}

/**
 * 変換サービス
 * ファイル変換処理を統括
 */
export class ConversionService {
  private readonly registry: ConverterRegistry;
  private readonly config: Required<ConversionServiceConfig>;
  private activeConversions: number = 0;

  constructor(
    registry: ConverterRegistry = globalConverterRegistry,
    config: ConversionServiceConfig = {},
  ) {
    this.registry = registry;
    this.config = {
      maxConcurrentConversions: config.maxConcurrentConversions ?? 5,
      timeoutMs: config.timeoutMs ?? 60000,
      retryCount: config.retryCount ?? 1,
      cacheEnabled: config.cacheEnabled ?? true,
    };
  }

  /**
   * ファイルを変換
   */
  async convert(
    input: ConverterInput,
    options?: ConverterOptions,
  ): Promise<Result<ConversionResult, RAGError>> {
    // 同時実行数チェック
    if (this.activeConversions >= this.config.maxConcurrentConversions) {
      return err(
        createRAGError(
          ErrorCodes.INTERNAL_ERROR,
          "Max concurrent conversions reached",
          {
            active: this.activeConversions,
            max: this.config.maxConcurrentConversions,
          },
        ),
      );
    }

    // コンバーター取得
    const converterResult = this.registry.findConverter(input);
    if (!converterResult.success) return converterResult;

    const converter = converterResult.data;
    const conversionId = generateConversionId();

    try {
      this.activeConversions++;

      // タイムアウト付きで変換実行
      const result = await this.executeWithTimeout(
        converter.convert(input, options),
        this.config.timeoutMs,
      );

      if (!result.success) return result;

      return ok({
        conversionId,
        fileId: input.fileId,
        originalContent:
          typeof input.content === "string"
            ? input.content
            : new TextDecoder().decode(input.content),
        convertedContent: result.data.convertedContent,
        extractedMetadata: result.data.extractedMetadata,
      });
    } finally {
      this.activeConversions--;
    }
  }

  /**
   * 複数ファイルを一括変換
   */
  async convertBatch(
    inputs: ConverterInput[],
    options?: ConverterOptions,
  ): Promise<Result<ConversionResult, RAGError>[]> {
    // 並列実行（同時実行数制限付き）
    const results: Result<ConversionResult, RAGError>[] = [];
    const batchSize = this.config.maxConcurrentConversions;

    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((input) => this.convert(input, options)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 変換可能かどうかを確認
   */
  canConvert(mimeType: string): boolean {
    return this.registry.getSupportedMimeTypes().includes(mimeType);
  }

  /**
   * 推定処理時間を取得
   */
  estimateProcessingTime(input: ConverterInput): Result<number, RAGError> {
    const converterResult = this.registry.findConverter(input);
    if (!converterResult.success) return converterResult;

    return ok(converterResult.data.estimateProcessingTime(input));
  }

  /**
   * タイムアウト付き実行
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Conversion timed out after ${timeoutMs}ms`)),
          timeoutMs,
        ),
      ),
    ]);
  }

  /**
   * アクティブな変換数を取得
   */
  get activeCount(): number {
    return this.activeConversions;
  }
}
```

### 5. メタデータ抽出ユーティリティ

````typescript
// packages/shared/src/services/conversion/metadata-extractor.ts

import type { ExtractedMetadata } from "../../types/rag/file";

/**
 * メタデータ抽出ユーティリティ
 */
export const MetadataExtractor = {
  /**
   * テキストからメタデータを抽出
   */
  extractFromText(content: string): ExtractedMetadata {
    const lines = content.split("\n");
    const words = content.split(/\s+/).filter((w) => w.length > 0);

    return {
      title: this.extractTitle(content),
      author: null,
      language: this.detectLanguage(content),
      wordCount: words.length,
      lineCount: lines.length,
      charCount: content.length,
      headers: this.extractHeaders(content),
      codeBlocks: this.countCodeBlocks(content),
      links: this.extractLinks(content),
      custom: {},
    };
  },

  /**
   * タイトル抽出（最初の見出しまたは最初の行）
   */
  extractTitle(content: string): string | null {
    // Markdown見出し
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();

    // 最初の非空行
    const firstLine = content
      .split("\n")
      .find((line) => line.trim().length > 0);
    if (firstLine && firstLine.length <= 100) {
      return firstLine.trim();
    }

    return null;
  },

  /**
   * 見出し抽出（Markdown形式）
   */
  extractHeaders(content: string): string[] {
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    const headers: string[] = [];
    let match;

    while ((match = headerRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      headers.push(`${"#".repeat(level)} ${text}`);
    }

    return headers;
  },

  /**
   * コードブロック数をカウント
   */
  countCodeBlocks(content: string): number {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = content.match(codeBlockRegex);
    return matches ? matches.length : 0;
  },

  /**
   * リンク抽出
   */
  extractLinks(content: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
    const matches = content.match(urlRegex);
    return matches ? [...new Set(matches)] : []; // 重複排除
  },

  /**
   * 言語検出（簡易版）
   */
  detectLanguage(content: string): string | null {
    // 日本語判定
    const japaneseChars = content.match(
      /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g,
    );
    if (japaneseChars && japaneseChars.length > content.length * 0.1) {
      return "ja";
    }

    // 英語判定（デフォルト）
    const englishChars = content.match(/[a-zA-Z]/g);
    if (englishChars && englishChars.length > content.length * 0.5) {
      return "en";
    }

    return null;
  },
};
````

### 6. バレルエクスポート

```typescript
// packages/shared/src/services/conversion/index.ts

export * from "./types";
export * from "./base-converter";
export * from "./converter-registry";
export * from "./conversion-service";
export * from "./metadata-extractor";
```

## ディレクトリ構造

```
packages/shared/src/services/conversion/
├── index.ts              # バレルエクスポート
├── types.ts              # 型定義
├── base-converter.ts     # 抽象コンバーター
├── converter-registry.ts # レジストリ
├── conversion-service.ts # 変換サービス
└── metadata-extractor.ts # メタデータ抽出
```

## 受け入れ条件

- [ ] `IConverter` インターフェースが定義されている
- [ ] `BaseConverter` 抽象クラスが実装されている
- [ ] `ConverterRegistry` がコンバーターの登録・検索を行える
- [ ] `ConversionService` が変換処理を統括できる
- [ ] タイムアウト・同時実行数制限が実装されている
- [ ] `MetadataExtractor` がテキストからメタデータを抽出できる
- [ ] バッチ変換が実装されている
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-01: ファイル選択機能
- CONV-03-02: ファイル・変換スキーマ定義

### このタスクに依存するもの

- CONV-02-02: テキスト系コンバーター実装
- CONV-02-03: Markdown/コードコンバーター実装

## 備考

- コンバーターはプラグイン形式で追加可能な設計
- `priority` により、同一MIMEタイプに対して複数のコンバーターがある場合の優先順位を制御
- `globalConverterRegistry` はシングルトンとして提供（テスト時は個別インスタンス使用可能）
- メタデータ抽出は簡易版で、必要に応じて拡張可能
