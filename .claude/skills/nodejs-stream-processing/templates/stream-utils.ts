/**
 * Node.js ストリームユーティリティ
 *
 * 大容量ファイル処理とバックプレッシャー管理のためのヘルパー
 */

import { createReadStream, createWriteStream, stat } from 'fs';
import { stat as statPromise } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { Transform, TransformCallback, Readable, Writable } from 'stream';
import { createGzip, createGunzip } from 'zlib';

// ============================================================
// 型定義
// ============================================================

export interface StreamProgress {
  bytesProcessed: number;
  totalBytes: number;
  percent: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  bytesPerSecond: number;
}

export type ProgressCallback = (progress: StreamProgress) => void;

export interface CopyOptions {
  highWaterMark?: number;
  onProgress?: ProgressCallback;
  progressInterval?: number;
}

// ============================================================
// 進捗追跡 Transform
// ============================================================

/**
 * 進捗追跡用のTransformストリーム
 */
export class ProgressTracker extends Transform {
  private bytesProcessed = 0;
  private startTime = Date.now();
  private lastProgressTime = 0;

  constructor(
    private totalBytes: number,
    private onProgress: ProgressCallback,
    private progressIntervalMs: number = 100
  ) {
    super();
  }

  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    this.bytesProcessed += chunk.length;
    this.push(chunk);

    const now = Date.now();
    if (now - this.lastProgressTime >= this.progressIntervalMs) {
      this.emitProgress();
      this.lastProgressTime = now;
    }

    callback();
  }

  _flush(callback: TransformCallback): void {
    // 最終進捗を報告
    this.emitProgress();
    callback();
  }

  private emitProgress(): void {
    const elapsedMs = Date.now() - this.startTime;
    const bytesPerSecond = elapsedMs > 0
      ? (this.bytesProcessed / elapsedMs) * 1000
      : 0;
    const remainingBytes = this.totalBytes - this.bytesProcessed;
    const estimatedRemainingMs = bytesPerSecond > 0
      ? (remainingBytes / bytesPerSecond) * 1000
      : 0;

    this.onProgress({
      bytesProcessed: this.bytesProcessed,
      totalBytes: this.totalBytes,
      percent: this.totalBytes > 0
        ? (this.bytesProcessed / this.totalBytes) * 100
        : 0,
      elapsedMs,
      estimatedRemainingMs,
      bytesPerSecond,
    });
  }
}

// ============================================================
// 行処理 Transform
// ============================================================

/**
 * 行単位で処理するTransformストリーム
 */
export abstract class LineTransform extends Transform {
  private buffer = '';

  constructor() {
    super({ objectMode: false });
  }

  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');

    // 最後の不完全な行を保持
    this.buffer = lines.pop() || '';

    try {
      for (const line of lines) {
        const processed = this.processLine(line);
        if (processed !== null) {
          this.push(processed + '\n');
        }
      }
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }

  _flush(callback: TransformCallback): void {
    try {
      if (this.buffer) {
        const processed = this.processLine(this.buffer);
        if (processed !== null) {
          this.push(processed);
        }
      }
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }

  /**
   * 各行を処理する（サブクラスで実装）
   * @returns 処理後の行、またはnullで行をスキップ
   */
  protected abstract processLine(line: string): string | null;
}

// ============================================================
// バッチ処理 Transform
// ============================================================

/**
 * チャンクをバッチにまとめるTransformストリーム
 */
export class BatchTransform<T> extends Transform {
  private batch: T[] = [];

  constructor(
    private batchSize: number,
    private processBatch: (batch: T[]) => Promise<Buffer | string>
  ) {
    super({ objectMode: true });
  }

  async _transform(
    item: T,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): Promise<void> {
    this.batch.push(item);

    if (this.batch.length >= this.batchSize) {
      try {
        const result = await this.processBatch(this.batch);
        this.push(result);
        this.batch = [];
        callback();
      } catch (error) {
        callback(error as Error);
      }
    } else {
      callback();
    }
  }

  async _flush(callback: TransformCallback): Promise<void> {
    if (this.batch.length > 0) {
      try {
        const result = await this.processBatch(this.batch);
        this.push(result);
        callback();
      } catch (error) {
        callback(error as Error);
      }
    } else {
      callback();
    }
  }
}

// ============================================================
// ファイル操作ユーティリティ
// ============================================================

/**
 * 進捗付きでファイルをコピー
 */
export async function copyFileWithProgress(
  source: string,
  destination: string,
  options: CopyOptions = {}
): Promise<void> {
  const {
    highWaterMark = 64 * 1024,
    onProgress,
    progressInterval = 100,
  } = options;

  const stats = await statPromise(source);

  const readStream = createReadStream(source, { highWaterMark });
  const writeStream = createWriteStream(destination);

  if (onProgress) {
    const progressTracker = new ProgressTracker(
      stats.size,
      onProgress,
      progressInterval
    );

    await pipeline(readStream, progressTracker, writeStream);
  } else {
    await pipeline(readStream, writeStream);
  }
}

/**
 * ファイルを圧縮
 */
export async function compressFile(
  source: string,
  destination: string,
  options: CopyOptions = {}
): Promise<void> {
  const { highWaterMark = 64 * 1024, onProgress, progressInterval = 100 } = options;

  const stats = await statPromise(source);

  const streams: (Readable | Transform | Writable)[] = [
    createReadStream(source, { highWaterMark }),
  ];

  if (onProgress) {
    streams.push(new ProgressTracker(stats.size, onProgress, progressInterval));
  }

  streams.push(createGzip());
  streams.push(createWriteStream(destination));

  await pipeline(...streams as [Readable, ...Transform[], Writable]);
}

/**
 * ファイルを展開
 */
export async function decompressFile(
  source: string,
  destination: string
): Promise<void> {
  await pipeline(
    createReadStream(source),
    createGunzip(),
    createWriteStream(destination)
  );
}

// ============================================================
// メモリ効率的な処理
// ============================================================

/**
 * 大容量ファイルを行単位で処理
 */
export async function processLargeFile(
  filePath: string,
  processLine: (line: string, lineNumber: number) => Promise<void>
): Promise<number> {
  let lineNumber = 0;
  let buffer = '';

  const readable = createReadStream(filePath, {
    encoding: 'utf8',
    highWaterMark: 64 * 1024,
  });

  for await (const chunk of readable) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      await processLine(line, ++lineNumber);
    }
  }

  // 残りのバッファを処理
  if (buffer) {
    await processLine(buffer, ++lineNumber);
  }

  return lineNumber;
}

/**
 * ストリームをBufferに変換（サイズ制限付き）
 */
export async function streamToBuffer(
  stream: Readable,
  maxSize: number = 100 * 1024 * 1024 // デフォルト100MB
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalSize = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalSize += buffer.length;

    if (totalSize > maxSize) {
      throw new Error(`Stream exceeds maximum size of ${maxSize} bytes`);
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

// ============================================================
// バックプレッシャー対応書き込み
// ============================================================

/**
 * バックプレッシャーを考慮した書き込み
 */
export async function writeWithBackpressure(
  writable: Writable,
  data: Buffer | string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ok = writable.write(data);

    if (ok) {
      resolve();
    } else {
      writable.once('drain', resolve);
      writable.once('error', reject);
    }
  });
}

/**
 * 複数チャンクをバックプレッシャー対応で書き込み
 */
export async function writeChunksWithBackpressure(
  writable: Writable,
  chunks: Iterable<Buffer | string>
): Promise<void> {
  for (const chunk of chunks) {
    await writeWithBackpressure(writable, chunk);
  }
}

// ============================================================
// 使用例
// ============================================================

/*
import {
  copyFileWithProgress,
  processLargeFile,
  LineTransform,
  ProgressTracker,
} from './stream-utils';

// 1. 進捗付きファイルコピー
await copyFileWithProgress('./large-file.bin', './copy.bin', {
  onProgress: (progress) => {
    console.log(`${progress.percent.toFixed(1)}% complete`);
  },
});

// 2. 大容量ファイルの行処理
const lineCount = await processLargeFile('./huge.log', async (line, num) => {
  if (line.includes('ERROR')) {
    console.log(`Line ${num}: ${line}`);
  }
});

// 3. カスタム行処理
class FilterTransform extends LineTransform {
  protected processLine(line: string): string | null {
    return line.includes('important') ? line : null;
  }
}

await pipeline(
  createReadStream('./input.txt'),
  new FilterTransform(),
  createWriteStream('./filtered.txt')
);
*/
