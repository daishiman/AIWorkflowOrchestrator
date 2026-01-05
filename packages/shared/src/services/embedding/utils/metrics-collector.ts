/**
 * メトリクス収集クラス
 *
 * @description 埋め込みリクエストのメトリクスを収集・分析
 */

import type {
  EmbeddingMetric,
  EmbeddingModelId,
} from "../types/embedding.types";

/**
 * 統計情報
 */
export interface EmbeddingStatistics {
  /** 総リクエスト数 */
  totalRequests: number;
  /** 成功率 */
  successRate: number;
  /** 平均処理時間（ミリ秒） */
  avgProcessingTime: number;
  /** 総トークン数 */
  totalTokens: number;
}

/**
 * メトリクス収集クラス
 */
export class MetricsCollector {
  private metrics: {
    embeddings: Array<EmbeddingMetric & { timestamp: number }>;
  };

  constructor() {
    this.metrics = { embeddings: [] };
  }

  /**
   * 埋め込みメトリクスを記録
   *
   * @param metric - 記録するメトリクス
   */
  recordEmbedding(metric: EmbeddingMetric): void {
    this.metrics.embeddings.push({
      ...metric,
      timestamp: Date.now(),
    });
  }

  /**
   * 統計情報を取得
   *
   * @returns 統計情報
   */
  getStatistics(): EmbeddingStatistics {
    const embeddings = this.metrics.embeddings;

    if (embeddings.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        avgProcessingTime: 0,
        totalTokens: 0,
      };
    }

    return {
      totalRequests: embeddings.length,
      successRate:
        embeddings.filter((e) => e.success).length / embeddings.length,
      avgProcessingTime:
        embeddings.reduce((sum, e) => sum + e.processingTimeMs, 0) /
        embeddings.length,
      totalTokens: embeddings.reduce((sum, e) => sum + e.tokenCount, 0),
    };
  }

  /**
   * モデル別統計情報を取得
   *
   * @param modelId - モデルID
   * @returns モデル別統計情報
   */
  getStatisticsByModel(modelId: EmbeddingModelId): EmbeddingStatistics {
    const embeddings = this.metrics.embeddings.filter(
      (e) => e.modelId === modelId,
    );

    if (embeddings.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        avgProcessingTime: 0,
        totalTokens: 0,
      };
    }

    return {
      totalRequests: embeddings.length,
      successRate:
        embeddings.filter((e) => e.success).length / embeddings.length,
      avgProcessingTime:
        embeddings.reduce((sum, e) => sum + e.processingTimeMs, 0) /
        embeddings.length,
      totalTokens: embeddings.reduce((sum, e) => sum + e.tokenCount, 0),
    };
  }

  /**
   * メトリクスをクリア
   */
  clear(): void {
    this.metrics.embeddings = [];
  }

  /**
   * 期間を指定してメトリクスを取得
   *
   * @param startTime - 開始時刻（ミリ秒）
   * @param endTime - 終了時刻（ミリ秒）
   * @returns 期間内のメトリクス
   */
  getMetricsByTimeRange(
    startTime: number,
    endTime: number,
  ): Array<EmbeddingMetric & { timestamp: number }> {
    return this.metrics.embeddings.filter(
      (e) => e.timestamp >= startTime && e.timestamp <= endTime,
    );
  }
}
