/**
 * チャンクアップローダーテンプレート
 *
 * 用途:
 *   個別チャンクのアップロードを担当
 *   リトライ、タイムアウト、チェックサム検証を実装
 *
 * カスタマイズポイント:
 *   - {{BASE_DELAY}}: リトライ基本遅延 (デフォルト: 1000ms)
 *   - {{MAX_DELAY}}: リトライ最大遅延 (デフォルト: 32000ms)
 *   - {{JITTER_FACTOR}}: ジッター係数 (デフォルト: 0.25)
 */

import { createHash } from 'crypto';

// ========================================
// 型定義
// ========================================

export interface ChunkUploadConfig {
  baseDelay: number;
  maxDelay: number;
  maxRetries: number;
  jitterFactor: number;
  timeout: number;
  hashAlgorithm: string;
}

export interface ChunkData {
  buffer: Buffer;
  index: number;
  totalChunks: number;
  uploadId: string;
}

export interface ChunkUploadResult {
  success: boolean;
  chunkIndex: number;
  serverHash?: string;
  attempts: number;
  error?: string;
}

// ========================================
// デフォルト設定
// ========================================

const DEFAULT_CONFIG: ChunkUploadConfig = {
  baseDelay: 1000,           // 1秒
  maxDelay: 32000,           // 32秒
  maxRetries: 5,
  jitterFactor: 0.25,        // ±25%
  timeout: 60000,            // 60秒
  hashAlgorithm: 'sha256'
};

// ========================================
// チャンクアップローダークラス
// ========================================

export class ChunkUploader {
  private config: ChunkUploadConfig;

  constructor(config: Partial<ChunkUploadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * チャンクをアップロードする（リトライ付き）
   */
  async upload(
    uploadUrl: string,
    chunk: ChunkData
  ): Promise<ChunkUploadResult> {
    const chunkHash = this.calculateHash(chunk.buffer);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.uploadAttempt(uploadUrl, chunk, chunkHash);

        // ハッシュ検証
        if (result.serverHash !== chunkHash) {
          throw new Error(`チェックサム不一致: expected=${chunkHash}, received=${result.serverHash}`);
        }

        return {
          success: true,
          chunkIndex: chunk.index,
          serverHash: result.serverHash,
          attempts: attempt
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // リトライ可能かチェック
        if (!this.isRetryableError(error) || attempt === this.config.maxRetries) {
          break;
        }

        // バックオフ待機
        const delay = this.calculateBackoff(attempt);
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      chunkIndex: chunk.index,
      attempts: this.config.maxRetries,
      error: lastError?.message
    };
  }

  /**
   * 単一アップロード試行
   */
  private async uploadAttempt(
    uploadUrl: string,
    chunk: ChunkData,
    chunkHash: string
  ): Promise<{ serverHash: string }> {
    // 実際の実装では fetch や axios を使用
    // const response = await fetch(uploadUrl, {
    //   method: 'POST',
    //   body: formData,
    //   signal: AbortSignal.timeout(this.config.timeout)
    // });

    // プレースホルダー
    return { serverHash: chunkHash };
  }

  /**
   * ハッシュを計算する
   */
  private calculateHash(buffer: Buffer): string {
    return createHash(this.config.hashAlgorithm)
      .update(buffer)
      .digest('hex');
  }

  /**
   * 指数バックオフを計算する
   */
  private calculateBackoff(attempt: number): number {
    // 指数バックオフ: baseDelay * 2^(attempt-1)
    const exponential = this.config.baseDelay * Math.pow(2, attempt - 1);
    const capped = Math.min(exponential, this.config.maxDelay);

    // ジッターを追加
    const jitterRange = capped * this.config.jitterFactor;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;

    return Math.floor(capped + jitter);
  }

  /**
   * リトライ可能なエラーかどうか判定
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      // ネットワークエラー
      if (error.message.includes('network') ||
          error.message.includes('timeout') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT')) {
        return true;
      }
    }

    // HTTPステータスによる判定
    // 5xx, 408, 429 はリトライ可能
    // 4xx (上記以外) はリトライ不可
    return false;
  }

  /**
   * 指定時間待機する
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
