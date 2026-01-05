/**
 * @file コンバーター基底クラス
 * @module @repo/shared/services/conversion/base-converter
 * @description すべてのコンバーター実装で共通する処理を提供する抽象基底クラス
 */

// =============================================================================
// インポート
// =============================================================================

import type {
  IConverter,
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
  ConverterMetadata,
} from "./types";
import { isTextContent, mergeConverterOptions } from "./types";
import type { Result, RAGError } from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";

// =============================================================================
// BaseConverter抽象クラス
// =============================================================================

/**
 * コンバーター基底クラス
 *
 * すべてのコンバーター実装で共通する処理を提供。
 * テンプレートメソッドパターンを適用し、変換フローを標準化。
 *
 * サブクラスは以下を実装する必要がある：
 * - doConvert(): 実際の変換処理
 * - id, name, supportedMimeTypes, priority: メタデータ
 *
 * @example
 * ```typescript
 * export class PlainTextConverter extends BaseConverter {
 *   readonly id = "plain-text-converter";
 *   readonly name = "Plain Text Converter";
 *   readonly supportedMimeTypes = ["text/plain"] as const;
 *   readonly priority = 0;
 *
 *   protected async doConvert(
 *     input: ConverterInput,
 *     options: ConverterOptions
 *   ): Promise<Result<ConverterOutput, RAGError>> {
 *     const text = this.getTextContent(input);
 *     const metadata = MetadataExtractor.extractFromText(text, options);
 *     return ok({ convertedContent: text, extractedMetadata: metadata, processingTime: 0 });
 *   }
 * }
 * ```
 */
export abstract class BaseConverter implements IConverter {
  // ========================================
  // 抽象プロパティ（サブクラスで実装必須）
  // ========================================

  /**
   * コンバーターID（一意）
   *
   * 制約:
   * - 英数字、ハイフン、アンダースコアのみ
   * - ケバブケース推奨
   *
   * 例: "plain-text-converter", "markdown-converter"
   */
  abstract readonly id: string;

  /**
   * コンバーター名（表示用）
   *
   * 例: "Plain Text Converter", "Markdown Converter"
   */
  abstract readonly name: string;

  /**
   * サポートするMIMEタイプのリスト
   *
   * 例: ["text/plain"], ["text/markdown", "text/x-markdown"]
   */
  abstract readonly supportedMimeTypes: readonly string[];

  /**
   * 優先度（高いほど優先）
   *
   * 推奨範囲: 0～100
   * 例: 0（標準）, 10（高優先度）, -10（フォールバック）
   */
  abstract readonly priority: number;

  // ========================================
  // テンプレートメソッド（final扱い）
  // ========================================

  /**
   * ファイルを変換（テンプレートメソッド）
   *
   * 処理フロー:
   * 1. 入力バリデーション
   * 2. オプションのマージ
   * 3. 前処理（preprocess）
   * 4. 処理時間計測開始
   * 5. 実変換処理（doConvert）
   * 6. 処理時間計測終了
   * 7. 後処理（postprocess）
   * 8. Result型でラップして返す
   *
   * サブクラスでオーバーライドしないこと（final扱い）。
   *
   * @param input - 変換対象の入力データ
   * @param options - 変換オプション（省略可）
   * @returns 変換結果またはエラー
   */
  async convert(
    input: ConverterInput,
    options?: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      // 1. 入力バリデーション
      const validationResult = this.validateInput(input);
      if (!validationResult.success) {
        return validationResult as Result<never, RAGError>;
      }

      // 2. オプションのマージ
      const mergedOptions = mergeConverterOptions(options);

      // 3. 前処理
      const preprocessResult = await this.preprocess(input, mergedOptions);
      if (!preprocessResult.success) {
        return preprocessResult as Result<never, RAGError>;
      }
      const preprocessedInput = preprocessResult.data;

      // 4. 処理時間計測開始
      const startTime = performance.now();

      // 5. 実変換処理
      const conversionResult = await this.doConvert(
        preprocessedInput,
        mergedOptions,
      );

      // 6. 処理時間計測終了
      const processingTime = performance.now() - startTime;

      if (!conversionResult.success) {
        return conversionResult;
      }

      // 処理時間を設定
      const outputWithTime: ConverterOutput = {
        ...conversionResult.data,
        processingTime,
      };

      // 7. 後処理
      const postprocessResult = await this.postprocess(
        outputWithTime,
        preprocessedInput,
        mergedOptions,
      );

      return postprocessResult;
    } catch (error) {
      // 8. 予期しないエラーのハンドリング
      return this.handleError(error, input);
    }
  }

  /**
   * このコンバーターで変換可能か判定
   *
   * デフォルト実装:
   * - supportedMimeTypesにinput.mimeTypeが含まれるかチェック
   *
   * サブクラスでオーバーライド可能（追加条件を実装可能）。
   *
   * @param input - 変換対象の入力データ
   * @returns 変換可能な場合true
   */
  canConvert(input: ConverterInput): boolean {
    return this.supportedMimeTypes.includes(input.mimeType);
  }

  /**
   * 推定処理時間を取得（ミリ秒）
   *
   * デフォルト実装:
   * - コンテンツサイズに基づく線形推定（1KB = 1ms）
   *
   * サブクラスでオーバーライド可能（ファイル形式の複雑さを考慮可能）。
   *
   * @param input - 変換対象の入力データ
   * @returns 推定処理時間（ミリ秒）
   */
  estimateProcessingTime(input: ConverterInput): number {
    const contentSize = this.getContentSize(input);
    const sizeInKB = contentSize / 1024;
    return Math.ceil(sizeInKB); // 1KB = 1ms
  }

  // ========================================
  // フックメソッド（サブクラスでオーバーライド可能）
  // ========================================

  /**
   * 前処理フック
   *
   * 変換処理の前に実行される。
   * 入力データの正規化、エンコーディング変換等を実施。
   *
   * デフォルト実装: 入力をそのまま返す
   *
   * サブクラスでオーバーライド可能:
   * - エンコーディング変換
   * - バイナリ→テキスト変換
   * - 入力データの正規化
   *
   * @param input - 変換対象の入力データ
   * @param options - 変換オプション
   * @returns 前処理後の入力データまたはエラー
   */
  protected async preprocess(
    input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterInput, RAGError>> {
    return ok(input);
  }

  /**
   * 後処理フック
   *
   * 変換処理の後に実行される。
   * 出力データの整形、追加メタデータの抽出等を実施。
   *
   * デフォルト実装: 出力をそのまま返す
   *
   * サブクラスでオーバーライド可能:
   * - 出力データの整形
   * - 追加メタデータの抽出
   * - フォーマット正規化
   *
   * @param output - 変換後の出力データ
   * @param input - 変換前の入力データ
   * @param options - 変換オプション
   * @returns 後処理後の出力データまたはエラー
   */
  protected async postprocess(
    output: ConverterOutput,
    _input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    return ok(output);
  }

  // ========================================
  // 抽象メソッド（サブクラスで実装必須）
  // ========================================

  /**
   * 実変換処理（抽象メソッド）
   *
   * サブクラスで実装必須。
   * ファイル形式固有の変換ロジックを実装。
   *
   * 実装ガイドライン:
   * 1. input.contentを適切な形式に変換
   * 2. メタデータを抽出（MetadataExtractorを使用）
   * 3. ConverterOutputを生成
   * 4. Result型でラップして返す
   *
   * エラーハンドリング:
   * - 変換失敗時はResult.errorを返す
   * - 例外をスローしない（catchしてResult.errorに変換）
   *
   * @param input - 前処理済みの入力データ
   * @param options - 変換オプション
   * @returns 変換結果またはエラー
   */
  protected abstract doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>>;

  // ========================================
  // ヘルパーメソッド（protectedで提供）
  // ========================================

  /**
   * 入力データをバリデート
   *
   * 基本的なバリデーションを実施:
   * - fileIdが空でないか
   * - filePathが空でないか
   * - mimeTypeが空でないか
   * - contentが空でないか
   *
   * @param input - 検証する入力データ
   * @returns バリデーション結果
   */
  protected validateInput(input: ConverterInput): Result<void, RAGError> {
    if (!input.fileId) {
      return err(
        createRAGError(ErrorCodes.VALIDATION_ERROR, "fileId is required", {
          converterId: this.id,
        }),
      );
    }

    if (!input.filePath) {
      return err(
        createRAGError(ErrorCodes.VALIDATION_ERROR, "filePath is required", {
          converterId: this.id,
        }),
      );
    }

    if (!input.mimeType) {
      return err(
        createRAGError(ErrorCodes.VALIDATION_ERROR, "mimeType is required", {
          converterId: this.id,
        }),
      );
    }

    if (input.content === null || input.content === undefined) {
      return err(
        createRAGError(ErrorCodes.VALIDATION_ERROR, "content is required", {
          converterId: this.id,
        }),
      );
    }

    return ok(undefined);
  }

  /**
   * エラーハンドリング
   *
   * 予期しないエラーをResult型にラップ。
   *
   * @param error - 発生したエラー
   * @param input - 変換対象の入力データ
   * @returns エラー結果
   */
  protected handleError(
    error: unknown,
    input: ConverterInput,
  ): Result<never, RAGError> {
    return err(
      createRAGError(
        ErrorCodes.CONVERSION_FAILED,
        `Conversion failed for ${this.id}`,
        {
          converterId: this.id,
          fileId: input.fileId,
          mimeType: input.mimeType,
        },
        error as Error,
      ),
    );
  }

  /**
   * コンテンツサイズを取得（バイト）
   *
   * @param input - 入力データ
   * @returns コンテンツサイズ（バイト）
   */
  protected getContentSize(input: ConverterInput): number {
    if (typeof input.content === "string") {
      // 文字列の場合、UTF-8バイトサイズを概算
      return new TextEncoder().encode(input.content).length;
    } else {
      // ArrayBufferの場合
      return input.content.byteLength;
    }
  }

  /**
   * テキストコンテンツを取得
   *
   * input.contentがstring型の場合はそのまま返す。
   * ArrayBuffer型の場合はデコードして返す。
   *
   * @param input - 入力データ
   * @returns テキストコンテンツ
   */
  protected getTextContent(input: ConverterInput): string {
    if (isTextContent(input)) {
      return input.content;
    } else {
      // ArrayBufferの場合のみデコード
      return new TextDecoder(input.encoding).decode(
        input.content as ArrayBuffer,
      );
    }
  }

  // ========================================
  // メタデータ取得（IConverterExtended実装）
  // ========================================

  /**
   * コンバーターのメタデータを取得
   *
   * @returns ConverterMetadata
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
   * サポートしているMIMEタイプか判定
   *
   * @param mimeType - 判定するMIMEタイプ
   * @returns サポートしている場合true
   */
  supportsMimeType(mimeType: string): boolean {
    return this.supportedMimeTypes.includes(mimeType);
  }

  /**
   * コンバーターの説明を取得
   *
   * サブクラスでオーバーライド推奨。
   *
   * @returns 説明文
   */
  protected getDescription(): string {
    return `Converter for ${this.supportedMimeTypes.join(", ")}`;
  }

  /**
   * コンバーターのバージョンを取得
   *
   * サブクラスでオーバーライド可能。
   *
   * @returns バージョン（SemVer形式）
   */
  protected getVersion(): string {
    return "1.0.0";
  }

  /**
   * コンテンツを最大長でトリミング
   *
   * maxLengthが指定されている場合、コンテンツをその長さで切り詰める。
   * 指定がない場合、またはコンテンツが最大長以下の場合はそのまま返す。
   *
   * @param content - トリミング対象のコンテンツ
   * @param maxLength - 最大長（undefinedの場合は制限なし）
   * @returns トリミングされたコンテンツ
   */
  protected trimContent(
    content: string,
    maxLength: number | undefined,
  ): string {
    if (maxLength === undefined || content.length <= maxLength) {
      return content;
    }
    return content.slice(0, maxLength);
  }
}
