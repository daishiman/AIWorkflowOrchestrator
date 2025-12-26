/**
 * 埋め込みサービス
 *
 * @description Application Layerのファサード。プロバイダーの選択、フォールバック、メトリクス収集を行う
 */

import type {
  EmbeddingModelId,
  EmbedOptions,
  BatchEmbedOptions,
  EmbeddingResult,
  BatchEmbeddingResult,
} from "./types/embedding.types";
import type { IEmbeddingProvider } from "./providers/interfaces";
import { MetricsCollector } from "./utils/metrics-collector";
import { EmbeddingError } from "./types/errors";

/**
 * 埋め込みサービス設定
 */
export interface EmbeddingServiceConfig {
  /** プロバイダー配列 */
  providers: IEmbeddingProvider[];
  /** フォールバックチェーン（モデルID配列） */
  fallbackChain: EmbeddingModelId[];
  /** メトリクス収集（省略時は新規作成） */
  metricsCollector?: MetricsCollector;
}

/**
 * 埋め込みサービス
 */
export class EmbeddingService {
  private providers: Map<EmbeddingModelId, IEmbeddingProvider>;
  private fallbackChain: EmbeddingModelId[];
  private metricsCollector: MetricsCollector;

  constructor(config: EmbeddingServiceConfig) {
    this.providers = new Map(config.providers.map((p) => [p.modelId, p]));
    this.fallbackChain = config.fallbackChain;
    this.metricsCollector = config.metricsCollector || new MetricsCollector();

    // フォールバックチェーンに含まれるモデルが全て利用可能か検証
    for (const modelId of this.fallbackChain) {
      if (!this.providers.has(modelId)) {
        throw new EmbeddingError(
          `Fallback chain includes unavailable model: ${modelId}`,
        );
      }
    }
  }

  /**
   * 埋め込み生成
   *
   * @param text - 埋め込み対象テキスト
   * @param modelId - モデルID（省略時はフォールバックチェーンの先頭）
   * @param options - 埋め込みオプション
   * @returns 埋め込み結果
   */
  async embed(
    text: string,
    modelId?: EmbeddingModelId,
    options?: EmbedOptions,
  ): Promise<EmbeddingResult> {
    const targetModel = modelId || this.fallbackChain[0];
    const provider = this.getProvider(targetModel);

    try {
      return await provider.embed(text, options);
    } catch (error) {
      // フォールバック試行
      return await this.fallback(text, targetModel, options, error);
    }
  }

  /**
   * バッチ埋め込み生成
   *
   * @param texts - 埋め込み対象テキスト配列
   * @param modelId - モデルID（省略時はフォールバックチェーンの先頭）
   * @param options - バッチ埋め込みオプション
   * @returns バッチ埋め込み結果
   */
  async embedBatch(
    texts: string[],
    modelId?: EmbeddingModelId,
    options?: BatchEmbedOptions,
  ): Promise<BatchEmbeddingResult> {
    const targetModel = modelId || this.fallbackChain[0];
    const provider = this.getProvider(targetModel);

    try {
      return await provider.embedBatch(texts, options);
    } catch (error) {
      // バッチ処理でもフォールバック試行
      console.warn(
        `Batch embedding failed for model ${targetModel}, attempting fallback`,
      );
      return await this.fallbackBatch(texts, targetModel, options, error);
    }
  }

  /**
   * フォールバック処理（単一埋め込み）
   *
   * @param text - 埋め込み対象テキスト
   * @param failedModel - 失敗したモデルID
   * @param options - 埋め込みオプション
   * @param originalError - 元のエラー
   * @returns 埋め込み結果
   */
  private async fallback(
    text: string,
    failedModel: EmbeddingModelId,
    options?: EmbedOptions,
    originalError?: unknown,
  ): Promise<EmbeddingResult> {
    const fallbackModels = this.fallbackChain.filter(
      (id) => id !== failedModel,
    );

    for (const modelId of fallbackModels) {
      try {
        const provider = this.getProvider(modelId);
        const result = await provider.embed(text, options);

        // フォールバック成功をログ
        console.warn(
          `Fallback to ${modelId} succeeded after ${failedModel} failed`,
        );

        return result;
      } catch (error) {
        // 次のモデルを試行
        console.warn(`Fallback to ${modelId} also failed:`, error);
        continue;
      }
    }

    // すべてのフォールバックが失敗
    throw new EmbeddingError(
      `All embedding providers failed. Original error: ${originalError instanceof Error ? originalError.message : String(originalError)}`,
      { cause: originalError },
    );
  }

  /**
   * フォールバック処理（バッチ埋め込み）
   *
   * @param texts - 埋め込み対象テキスト配列
   * @param failedModel - 失敗したモデルID
   * @param options - バッチ埋め込みオプション
   * @param originalError - 元のエラー
   * @returns バッチ埋め込み結果
   */
  private async fallbackBatch(
    texts: string[],
    failedModel: EmbeddingModelId,
    options?: BatchEmbedOptions,
    originalError?: unknown,
  ): Promise<BatchEmbeddingResult> {
    const fallbackModels = this.fallbackChain.filter(
      (id) => id !== failedModel,
    );

    for (const modelId of fallbackModels) {
      try {
        const provider = this.getProvider(modelId);
        const result = await provider.embedBatch(texts, options);

        // フォールバック成功をログ
        console.warn(
          `Batch fallback to ${modelId} succeeded after ${failedModel} failed`,
        );

        return result;
      } catch (error) {
        // 次のモデルを試行
        console.warn(`Batch fallback to ${modelId} also failed:`, error);
        continue;
      }
    }

    // すべてのフォールバックが失敗
    throw new EmbeddingError(
      `All batch embedding providers failed. Original error: ${originalError instanceof Error ? originalError.message : String(originalError)}`,
      { cause: originalError },
    );
  }

  /**
   * プロバイダーを取得
   *
   * @param modelId - モデルID
   * @returns プロバイダーインスタンス
   */
  private getProvider(modelId: EmbeddingModelId): IEmbeddingProvider {
    const provider = this.providers.get(modelId);
    if (!provider) {
      throw new EmbeddingError(`Provider not found for model: ${modelId}`);
    }
    return provider;
  }

  /**
   * ヘルスチェック（全プロバイダー）
   *
   * @returns モデルIDとヘルスチェック結果のマップ
   */
  async healthCheckAll(): Promise<Map<EmbeddingModelId, boolean>> {
    const results = new Map<EmbeddingModelId, boolean>();

    for (const [modelId, provider] of this.providers) {
      try {
        const isHealthy = await provider.healthCheck();
        results.set(modelId, isHealthy);
      } catch (error) {
        console.error(`Health check failed for ${modelId}:`, error);
        results.set(modelId, false);
      }
    }

    return results;
  }

  /**
   * 利用可能なプロバイダー一覧を取得
   *
   * @returns モデルID配列
   */
  getAvailableProviders(): EmbeddingModelId[] {
    return Array.from(this.providers.keys());
  }

  /**
   * メトリクス収集を取得
   *
   * @returns メトリクス収集インスタンス
   */
  getMetricsCollector(): MetricsCollector {
    return this.metricsCollector;
  }

  /**
   * フォールバックチェーンを取得
   *
   * @returns フォールバックチェーン
   */
  getFallbackChain(): EmbeddingModelId[] {
    return [...this.fallbackChain];
  }

  /**
   * フォールバックチェーンを更新
   *
   * @param newChain - 新しいフォールバックチェーン
   */
  setFallbackChain(newChain: EmbeddingModelId[]): void {
    // 新しいチェーンに含まれるモデルが全て利用可能か検証
    for (const modelId of newChain) {
      if (!this.providers.has(modelId)) {
        throw new EmbeddingError(
          `Fallback chain includes unavailable model: ${modelId}`,
        );
      }
    }

    this.fallbackChain = newChain;
  }
}
