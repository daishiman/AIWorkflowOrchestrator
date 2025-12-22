/**
 * @file 変換サービス
 * @module @repo/shared/services/conversion/conversion-service
 * @description ファイル変換処理を統括し、タイムアウト・同時実行制御・バッチ変換を提供
 */

// =============================================================================
// インポート
// =============================================================================

import type { ConverterRegistry } from "./converter-registry";
import { globalConverterRegistry } from "./converter-registry";
import type {
  IConverter,
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
  ConversionServiceOptions,
  ConversionServiceSettings,
  BatchConversionResult,
  BatchConversionSummary,
} from "./types";
import type { Result, RAGError } from "../../types/rag";
import { err, createRAGError, ErrorCodes } from "../../types/rag";
import type { FileId } from "../../types/rag/branded";

// =============================================================================
// ConversionServiceクラス
// =============================================================================

/**
 * 変換サービス
 *
 * ファイル変換処理を統括し、以下の機能を提供：
 * - 単一ファイル変換
 * - バッチ変換
 * - タイムアウト管理
 * - 同時実行数制限
 *
 * アプリケーションサービス層に位置し、
 * BaseConverterとConverterRegistryを統合。
 *
 * @example
 * ```typescript
 * const service = new ConversionService(registry, {
 *   defaultTimeout: 60000,
 *   maxConcurrentConversions: 5,
 * });
 *
 * const result = await service.convert(input, options);
 * if (result.success) {
 *   console.log(result.data.convertedContent);
 * }
 * ```
 */
export class ConversionService {
  // ========================================
  // プライベートフィールド
  // ========================================

  /**
   * コンバーターレジストリ
   *
   * 依存性注入で受け取る。
   */
  private readonly registry: ConverterRegistry;

  /**
   * デフォルトタイムアウト（ミリ秒）
   */
  private readonly defaultTimeout: number;

  /**
   * 最大同時実行数
   */
  private readonly maxConcurrentConversions: number;

  /**
   * 現在実行中の変換数
   */
  private currentConversions: number;

  // ========================================
  // コンストラクタ
  // ========================================

  /**
   * コンストラクタ
   *
   * @param registry - コンバーターレジストリ（依存性注入）
   * @param options - サービスオプション
   */
  constructor(registry: ConverterRegistry, options?: ConversionServiceOptions) {
    this.registry = registry;
    this.defaultTimeout = options?.defaultTimeout ?? 60000; // デフォルト60秒
    this.maxConcurrentConversions = options?.maxConcurrentConversions ?? 5;
    this.currentConversions = 0;
  }

  // ========================================
  // 単一ファイル変換
  // ========================================

  /**
   * 単一ファイルを変換
   *
   * 処理フロー:
   * 1. 同時実行数チェック
   * 2. コンバーター検索（ConverterRegistry）
   * 3. タイムアウト付き変換実行
   * 4. エラーハンドリング
   *
   * @param input - 変換対象の入力データ
   * @param options - 変換オプション
   * @returns 変換結果またはエラー
   */
  async convert(
    input: ConverterInput,
    options?: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    // 1. 同時実行数チェック
    if (this.currentConversions >= this.maxConcurrentConversions) {
      return err(
        createRAGError(
          ErrorCodes.RESOURCE_EXHAUSTED,
          `Maximum concurrent conversions reached: ${this.maxConcurrentConversions}`,
          {
            currentConversions: this.currentConversions,
            maxConcurrentConversions: this.maxConcurrentConversions,
          },
        ),
      );
    }

    try {
      // 同時実行数をインクリメント
      this.currentConversions++;

      // 2. コンバーター検索
      const converterResult = this.registry.findConverter(input);
      if (!converterResult.success) {
        return converterResult;
      }

      const converter = converterResult.data;

      // 3. タイムアウト付き変換実行
      const timeout = options?.timeout ?? this.defaultTimeout;
      const result = await this.convertWithTimeout(
        converter,
        input,
        options,
        timeout,
      );

      return result;
    } finally {
      // 同時実行数をデクリメント（必ず実行）
      this.currentConversions--;
    }
  }

  /**
   * タイムアウト付きで変換を実行
   *
   * Promise.race()を使用してタイムアウトを実現。
   *
   * @param converter - 使用するコンバーター
   * @param input - 変換対象の入力データ
   * @param options - 変換オプション
   * @param timeout - タイムアウト時間（ミリ秒）
   * @returns 変換結果またはエラー
   */
  private async convertWithTimeout(
    converter: IConverter,
    input: ConverterInput,
    options: ConverterOptions | undefined,
    timeout: number,
  ): Promise<Result<ConverterOutput, RAGError>> {
    // タイムアウトPromise
    const timeoutPromise = new Promise<Result<never, RAGError>>((resolve) => {
      setTimeout(() => {
        resolve(
          err(
            createRAGError(
              ErrorCodes.TIMEOUT,
              `Conversion timeout after ${timeout}ms`,
              {
                converterId: converter.id,
                fileId: input.fileId,
                timeout,
              },
            ),
          ),
        );
      }, timeout);
    });

    // 変換Promise
    const conversionPromise = converter.convert(input, options);

    // Promise.race()でタイムアウトを実現
    const result = await Promise.race([conversionPromise, timeoutPromise]);

    return result;
  }

  // ========================================
  // バッチ変換
  // ========================================

  /**
   * 複数ファイルを一括変換
   *
   * Promise.allSettled()を使用し、一部のファイルが失敗しても
   * 他のファイルの変換を継続。
   *
   * 同時実行数制限を考慮し、チャンク単位で処理。
   *
   * @param inputs - 変換対象の入力データ配列
   * @param options - 変換オプション
   * @returns 変換結果の配列（成功・失敗を含む）
   */
  async convertBatch(
    inputs: ConverterInput[],
    options?: ConverterOptions,
  ): Promise<BatchConversionResult[]> {
    const results: BatchConversionResult[] = [];

    // チャンクサイズは同時実行数と同じ
    const chunkSize = this.maxConcurrentConversions;

    // チャンク単位で処理
    for (let i = 0; i < inputs.length; i += chunkSize) {
      const chunk = inputs.slice(i, i + chunkSize);

      // チャンク内の変換を並列実行
      const chunkResults = await Promise.allSettled(
        chunk.map((input) => this.convert(input, options)),
      );

      // 結果を集約
      for (let j = 0; j < chunkResults.length; j++) {
        const input = chunk[j];
        const promiseResult = chunkResults[j];

        if (promiseResult.status === "fulfilled") {
          const conversionResult = promiseResult.value;

          if (conversionResult.success) {
            results.push({
              input,
              status: "success",
              output: conversionResult.data,
            });
          } else {
            results.push({
              input,
              status: "error",
              error: conversionResult.error,
            });
          }
        } else {
          // Promise自体が拒否された（通常は発生しない）
          results.push({
            input,
            status: "error",
            error: createRAGError(
              ErrorCodes.INTERNAL_ERROR,
              "Unexpected promise rejection",
              { fileId: input.fileId },
              promiseResult.reason as Error,
            ),
          });
        }
      }
    }

    return results;
  }

  // ========================================
  // ユーティリティメソッド
  // ========================================

  /**
   * 変換可能性を確認
   *
   * @param input - 変換対象の入力データ
   * @returns 変換可能な場合true
   */
  canConvert(input: ConverterInput): boolean {
    const converterResult = this.registry.findConverter(input);
    return converterResult.success;
  }

  /**
   * 推定処理時間を取得
   *
   * @param input - 変換対象の入力データ
   * @returns 推定処理時間（ミリ秒）、コンバーターが見つからない場合はnull
   */
  estimateProcessingTime(input: ConverterInput): number | null {
    const converterResult = this.registry.findConverter(input);

    if (!converterResult.success) {
      return null;
    }

    return converterResult.data.estimateProcessingTime(input);
  }

  /**
   * サポートしているMIMEタイプ一覧を取得
   *
   * @returns MIMEタイプの配列
   */
  getSupportedMimeTypes(): string[] {
    return this.registry.getSupportedMimeTypes();
  }

  /**
   * 現在の同時実行数を取得
   *
   * @returns 実行中の変換数
   */
  getCurrentConversions(): number {
    return this.currentConversions;
  }

  /**
   * サービス設定を取得
   *
   * @returns サービス設定
   */
  getSettings(): ConversionServiceSettings {
    return {
      defaultTimeout: this.defaultTimeout,
      maxConcurrentConversions: this.maxConcurrentConversions,
      currentConversions: this.currentConversions,
    };
  }
}

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * バッチ変換結果を集計
 *
 * @param results - バッチ変換結果
 * @returns 集計情報
 *
 * @example
 * ```typescript
 * const results = await service.convertBatch(inputs);
 * const summary = summarizeBatchResults(results);
 * console.log(`成功: ${summary.success}, 失敗: ${summary.failed}`);
 * ```
 */
export function summarizeBatchResults(
  results: BatchConversionResult[],
): BatchConversionSummary {
  let successCount = 0;
  let failedCount = 0;
  let totalTime = 0;
  const errorList: Array<{ fileId: FileId; error: RAGError }> = [];

  for (const result of results) {
    if (result.status === "success") {
      successCount++;
      totalTime += result.output.processingTime;
    } else {
      failedCount++;
      errorList.push({
        fileId: result.input.fileId,
        error: result.error,
      });
    }
  }

  return {
    total: results.length,
    success: successCount,
    failed: failedCount,
    totalProcessingTime: totalTime,
    errors: errorList,
  };
}

// =============================================================================
// グローバルインスタンス
// =============================================================================

/**
 * グローバル変換サービス
 *
 * アプリケーション全体で共有されるシングルトンインスタンス。
 * globalConverterRegistryを使用。
 *
 * @example
 * ```typescript
 * import { globalConversionService } from './conversion-service';
 *
 * const result = await globalConversionService.convert(input);
 * ```
 */
export const globalConversionService = new ConversionService(
  globalConverterRegistry,
  {
    defaultTimeout: 60000, // 60秒
    maxConcurrentConversions: 5,
  },
);

/**
 * カスタム設定でサービスインスタンスを作成
 *
 * @param registry - コンバーターレジストリ
 * @param options - サービスオプション
 * @returns ConversionServiceインスタンス
 *
 * @example
 * ```typescript
 * const customRegistry = createTestRegistry();
 * const customService = createConversionService(customRegistry, {
 *   defaultTimeout: 30000,
 *   maxConcurrentConversions: 10,
 * });
 * ```
 */
export function createConversionService(
  registry: ConverterRegistry,
  options?: ConversionServiceOptions,
): ConversionService {
  return new ConversionService(registry, options);
}
