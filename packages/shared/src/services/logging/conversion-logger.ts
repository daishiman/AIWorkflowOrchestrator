/**
 * ConversionLogger サービス実装
 *
 * ファイル変換処理のログ記録サービス。
 * バッファリングと自動フラッシュ機能を持ち、LogRepositoryを通じてDB永続化を行う。
 *
 * @see docs/30-workflows/logging-service/outputs/phase-2/architecture-design.md
 */

import {
  type ConversionLog,
  type ConversionLogInput,
  type IConversionLogger,
  type ILogRepository,
  type ConversionLoggerOptions,
  type LogLevel,
  type Result,
  conversionLogInputSchema,
  ok,
  err,
} from "./types";

/**
 * デフォルト設定
 */
const DEFAULT_BUFFER_SIZE = 100;
const DEFAULT_FLUSH_INTERVAL_MS = 5000;

/**
 * ConversionLogger クラス
 *
 * @description
 * - バッファリングによる効率的なログ記録
 * - サイズベース・時間ベースの自動フラッシュ
 * - Result型によるエラーハンドリング
 * - 依存性注入によるテスタビリティ確保
 */
export class ConversionLogger implements IConversionLogger {
  private readonly repository: ILogRepository;
  private readonly bufferSize: number;
  private readonly flushIntervalMs: number;
  private buffer: ConversionLog[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private disposed = false;

  /**
   * ConversionLoggerを作成
   *
   * @param repository - ログ永続化用リポジトリ
   * @param options - オプション設定
   */
  constructor(repository: ILogRepository, options?: ConversionLoggerOptions) {
    this.repository = repository;
    this.bufferSize = options?.bufferSize ?? DEFAULT_BUFFER_SIZE;
    this.flushIntervalMs =
      options?.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;

    // 時間ベース自動フラッシュタイマーを開始
    this.startFlushTimer();
  }

  /**
   * INFOレベルのログを記録
   */
  async info(input: ConversionLogInput): Promise<Result<ConversionLog>> {
    return this.log("info", input);
  }

  /**
   * WARNレベルのログを記録
   */
  async warn(input: ConversionLogInput): Promise<Result<ConversionLog>> {
    return this.log("warn", input);
  }

  /**
   * ERRORレベルのログを記録
   *
   * @param input - ログ入力データ
   * @param error - オプションのErrorオブジェクト（スタックトレース取得用）
   */
  async error(
    input: ConversionLogInput,
    error?: Error,
  ): Promise<Result<ConversionLog>> {
    return this.log("error", input, error);
  }

  /**
   * 複数ログを一括記録
   */
  async batch(
    logs: Array<{ level: LogLevel; input: ConversionLogInput }>,
  ): Promise<Result<ConversionLog[]>> {
    const results: ConversionLog[] = [];

    for (const { level, input } of logs) {
      const result = await this.log(level, input);
      if (!result.success) {
        return err(result.error);
      }
      results.push(result.data);
    }

    return ok(results);
  }

  /**
   * バッファ内のログを手動でフラッシュ
   */
  async flush(): Promise<Result<void>> {
    if (this.buffer.length === 0) {
      return ok(undefined);
    }

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    const result = await this.repository.bulkInsert(logsToFlush);
    if (!result.success) {
      // 失敗時はバッファを復元
      this.buffer = [...logsToFlush, ...this.buffer];
      return err(result.error);
    }

    return ok(undefined);
  }

  /**
   * リソースを解放（タイマー停止、最終フラッシュ）
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.stopFlushTimer();

    // 同期的に最終フラッシュを試行（dispose後は非同期処理不可のため）
    if (this.buffer.length > 0) {
      const logsToFlush = [...this.buffer];
      this.buffer = [];
      // 同期的にPromiseを開始（結果は無視）
      this.repository.bulkInsert(logsToFlush).catch(() => {
        // エラーは無視（disposeは同期メソッドのため）
      });
    }
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * ログを記録（共通処理）
   */
  private async log(
    level: LogLevel,
    input: ConversionLogInput,
    error?: Error,
  ): Promise<Result<ConversionLog>> {
    // 入力バリデーション
    const validation = conversionLogInputSchema.safeParse(input);
    if (!validation.success) {
      return err(new Error(`Validation error: ${validation.error.message}`));
    }

    // ConversionLogを生成
    const log: ConversionLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      fileId: input.fileId,
      fileName: input.fileName,
      conversionId: input.conversionId,
      action: input.action,
      message: input.message,
      details: input.details,
      durationMs: input.durationMs,
      errorStack: error?.stack,
    };

    // バッファに追加
    this.buffer.push(log);

    // サイズベース自動フラッシュ
    if (this.bufferSize > 0 && this.buffer.length >= this.bufferSize) {
      const flushResult = await this.flush();
      if (!flushResult.success) {
        return err(flushResult.error);
      }
    } else if (this.bufferSize === 0) {
      // bufferSize=0は即時フラッシュ
      const flushResult = await this.flush();
      if (!flushResult.success) {
        return err(flushResult.error);
      }
    }

    return ok(log);
  }

  /**
   * 自動フラッシュタイマーを開始
   */
  private startFlushTimer(): void {
    if (this.flushIntervalMs <= 0) {
      return;
    }

    this.flushTimer = setInterval(async () => {
      if (this.buffer.length > 0 && !this.disposed) {
        await this.flush();
      }
    }, this.flushIntervalMs);
  }

  /**
   * 自動フラッシュタイマーを停止
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
