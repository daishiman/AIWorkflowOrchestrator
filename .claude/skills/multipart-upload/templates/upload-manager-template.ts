/**
 * アップロードマネージャーテンプレート
 *
 * 用途:
 *   大容量ファイルのマルチパートアップロードを管理する
 *   チャンク分割、進捗追跡、エラーハンドリングを統合
 *
 * カスタマイズポイント:
 *   - {{CHUNK_SIZE}}: チャンクサイズ (デフォルト: 5MB)
 *   - {{MAX_RETRIES}}: 最大リトライ回数 (デフォルト: 5)
 *   - {{HASH_ALGORITHM}}: ハッシュアルゴリズム (デフォルト: sha256)
 */

import { createReadStream, statSync } from 'fs';
import { createHash } from 'crypto';
import FormData from 'form-data';

// ========================================
// 型定義
// ========================================

export interface UploadConfig {
  chunkSize: number;
  maxRetries: number;
  hashAlgorithm: string;
  timeout: number;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number;
  estimatedTime: number;
  currentChunk: number;
  totalChunks: number;
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error';
}

export interface ChunkInfo {
  index: number;
  start: number;
  end: number;
  size: number;
  hash?: string;
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  serverHash?: string;
  error?: string;
}

// ========================================
// デフォルト設定
// ========================================

const DEFAULT_CONFIG: UploadConfig = {
  chunkSize: 5 * 1024 * 1024,  // 5MB
  maxRetries: 5,
  hashAlgorithm: 'sha256',
  timeout: 180000  // 3分
};

// ========================================
// アップロードマネージャークラス
// ========================================

export class UploadManager {
  private config: UploadConfig;
  private abortController: AbortController | null = null;

  constructor(config: Partial<UploadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * ファイルをアップロードする
   */
  async upload(filePath: string, uploadUrl: string): Promise<UploadResult> {
    this.abortController = new AbortController();

    try {
      // 1. ファイル情報を取得
      const fileSize = statSync(filePath).size;
      const fileHash = await this.calculateFileHash(filePath);

      // 2. チャンクを計算
      const chunks = this.calculateChunks(fileSize);

      // 3. 進捗を初期化
      this.emitProgress({
        loaded: 0,
        total: fileSize,
        percentage: 0,
        speed: 0,
        estimatedTime: 0,
        currentChunk: 0,
        totalChunks: chunks.length,
        status: 'preparing'
      });

      // 4. チャンクをアップロード
      for (const chunk of chunks) {
        await this.uploadChunk(filePath, uploadUrl, chunk, fileHash, chunks.length);
      }

      // 5. 完了
      return {
        success: true,
        fileId: 'file-id-from-server'  // サーバーからの応答を設定
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * アップロードをキャンセルする
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * ファイルハッシュを計算する
   */
  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash(this.config.hashAlgorithm);
      const stream = createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * チャンクを計算する
   */
  private calculateChunks(fileSize: number): ChunkInfo[] {
    const { chunkSize } = this.config;
    const totalChunks = Math.ceil(fileSize / chunkSize);
    const chunks: ChunkInfo[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      chunks.push({
        index: i,
        start,
        end,
        size: end - start
      });
    }

    return chunks;
  }

  /**
   * チャンクをアップロードする
   */
  private async uploadChunk(
    filePath: string,
    uploadUrl: string,
    chunk: ChunkInfo,
    fileHash: string,
    totalChunks: number
  ): Promise<void> {
    const formData = new FormData();
    const stream = createReadStream(filePath, {
      start: chunk.start,
      end: chunk.end - 1
    });

    formData.append('chunk', stream);
    formData.append('chunkIndex', chunk.index.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileHash', fileHash);

    // ここでHTTPリクエストを実行
    // 実際の実装では axios や fetch を使用
    // await axios.post(uploadUrl, formData, { ... });
  }

  /**
   * 進捗を通知する
   */
  private emitProgress(progress: UploadProgress): void {
    if (this.config.onProgress) {
      this.config.onProgress(progress);
    }
  }
}
