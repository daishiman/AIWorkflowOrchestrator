# 分離インターフェース実装テンプレート

## 概要

このテンプレートは、ISPに基づいてインターフェースを分離する際の実装パターンを提供します。

## コアインターフェース

```typescript
/**
 * IWorkflowExecutor - ワークフロー実行の最小インターフェース
 *
 * すべてのExecutorが実装する必須のコアインターフェース。
 * ISPに基づき、実行に必要な最小限のメンバーのみを定義。
 *
 * @typeParam TInput - 入力の型
 * @typeParam TOutput - 出力の型
 */
export interface IWorkflowExecutor<TInput = unknown, TOutput = unknown> {
  /** ワークフロータイプの一意識別子 */
  readonly type: string;

  /** ユーザー向け表示名 */
  readonly displayName: string;

  /** ワークフローの説明 */
  readonly description: string;

  /**
   * ワークフローを実行する
   * @param input - 入力データ
   * @param context - 実行コンテキスト
   * @returns 実行結果
   */
  execute(input: TInput, context: ExecutionContext): Promise<TOutput>;
}
```

## 拡張インターフェース

### 検証機能

```typescript
import { z } from "zod";

/**
 * IValidatable - 入力検証機能
 *
 * 入力データの検証が必要なExecutorが実装する。
 * スキーマベースの検証とカスタム検証をサポート。
 *
 * @typeParam TInput - 検証対象の入力型
 */
export interface IValidatable<TInput = unknown> {
  /** 入力スキーマ（Zod） */
  readonly inputSchema: z.ZodSchema<TInput>;

  /** 出力スキーマ（Zod） */
  readonly outputSchema: z.ZodSchema<unknown>;

  /**
   * 入力を検証する
   * @param input - 検証対象の入力
   * @returns 検証結果
   */
  validate(input: TInput): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  path: string[];
  message: string;
  code: string;
}
```

### リトライ機能

```typescript
/**
 * IRetryable - リトライ機能
 *
 * エラー時のリトライが必要なExecutorが実装する。
 * リトライ可能なエラーの判定とリトライ間隔を提供。
 */
export interface IRetryable {
  /** 最大リトライ回数 */
  readonly maxRetries: number;

  /**
   * エラーがリトライ可能か判定する
   * @param error - 発生したエラー
   * @returns リトライ可能な場合true
   */
  canRetry(error: Error): boolean;

  /**
   * リトライまでの待機時間を取得する
   * @param attempt - 現在の試行回数（0始まり）
   * @returns 待機時間（ミリ秒）
   */
  getRetryDelay(attempt: number): number;
}
```

### ロールバック機能

```typescript
/**
 * IRollbackable - ロールバック機能
 *
 * エラー時のロールバックが必要なExecutorが実装する。
 * トランザクション的な操作を提供。
 */
export interface IRollbackable {
  /** セーフポイントをサポートするか */
  readonly supportsSafepoint: boolean;

  /**
   * 実行をロールバックする
   * @param context - 実行コンテキスト
   */
  rollback(context: ExecutionContext): Promise<void>;

  /**
   * セーフポイントを作成する（オプショナル）
   * @param name - セーフポイント名
   */
  createSafepoint?(name: string): Promise<void>;

  /**
   * 特定のセーフポイントにロールバックする（オプショナル）
   * @param name - セーフポイント名
   */
  rollbackToSafepoint?(name: string): Promise<void>;
}
```

### 進捗レポート機能

```typescript
/**
 * IProgressReporter - 進捗レポート機能
 *
 * 長時間実行処理の進捗報告が必要なExecutorが実装する。
 */
export interface IProgressReporter {
  /** 進捗レポートをサポートするか */
  readonly supportsProgress: boolean;

  /**
   * 進捗を報告する
   * @param progress - 進捗情報
   */
  onProgress(progress: Progress): void;
}

interface Progress {
  /** 現在のフェーズ */
  phase: string;
  /** 完了率（0-100） */
  percent: number;
  /** 追加メッセージ */
  message?: string;
}
```

### メトリクス提供機能

```typescript
/**
 * IMetricsProvider - メトリクス提供機能
 *
 * 実行メトリクスの収集が必要なExecutorが実装する。
 */
export interface IMetricsProvider {
  /**
   * 現在のメトリクスを取得する
   * @returns 実行メトリクス
   */
  getMetrics(): ExecutorMetrics;

  /**
   * メトリクスをリセットする
   */
  resetMetrics(): void;
}

interface ExecutorMetrics {
  /** 実行回数 */
  executionCount: number;
  /** 成功回数 */
  successCount: number;
  /** 失敗回数 */
  failureCount: number;
  /** 平均実行時間（ミリ秒） */
  averageExecutionTime: number;
  /** 最終実行時刻 */
  lastExecutionTime?: Date;
}
```

### ライフサイクル管理機能

```typescript
/**
 * ILifecycleAware - ライフサイクル管理機能
 *
 * 初期化・終了処理が必要なExecutorが実装する。
 */
export interface ILifecycleAware {
  /**
   * 初期化処理
   * @returns 初期化完了のPromise
   */
  onInitialize(): Promise<void>;

  /**
   * 終了処理
   * @returns 終了完了のPromise
   */
  onShutdown(): Promise<void>;
}
```

### スケジューリング機能

```typescript
/**
 * ISchedulable - スケジューリング機能
 *
 * 定期実行が必要なExecutorが実装する。
 */
export interface ISchedulable {
  /**
   * Cron式を取得する
   * @returns Cron式
   */
  getCronExpression(): string;

  /**
   * 次の実行予定時刻を取得する
   * @returns 次の実行予定時刻
   */
  getNextExecutionTime(): Date;

  /**
   * スケジュールを有効化/無効化する
   * @param enabled - 有効にする場合true
   */
  setScheduleEnabled?(enabled: boolean): void;
}
```

## 型ガード

```typescript
/**
 * 型ガードユーティリティ
 */
export function isValidatable(
  executor: IWorkflowExecutor,
): executor is IWorkflowExecutor & IValidatable {
  return "validate" in executor && "inputSchema" in executor;
}

export function isRetryable(
  executor: IWorkflowExecutor,
): executor is IWorkflowExecutor & IRetryable {
  return "canRetry" in executor && "maxRetries" in executor;
}

export function isRollbackable(
  executor: IWorkflowExecutor,
): executor is IWorkflowExecutor & IRollbackable {
  return "rollback" in executor;
}

export function isProgressReporter(
  executor: IWorkflowExecutor,
): executor is IWorkflowExecutor & IProgressReporter {
  return "onProgress" in executor && "supportsProgress" in executor;
}

export function isMetricsProvider(
  executor: IWorkflowExecutor,
): executor is IWorkflowExecutor & IMetricsProvider {
  return "getMetrics" in executor && "resetMetrics" in executor;
}

export function isLifecycleAware(
  executor: IWorkflowExecutor,
): executor is IWorkflowExecutor & ILifecycleAware {
  return "onInitialize" in executor && "onShutdown" in executor;
}

export function isSchedulable(
  executor: IWorkflowExecutor,
): executor is IWorkflowExecutor & ISchedulable {
  return "getCronExpression" in executor && "getNextExecutionTime" in executor;
}
```

## 実装例

### シンプルなExecutor

```typescript
export class SimpleTextExecutor implements IWorkflowExecutor<
  TextInput,
  TextOutput
> {
  readonly type = "TEXT_PROCESS";
  readonly displayName = "テキスト処理";
  readonly description = "シンプルなテキスト処理を実行";

  async execute(
    input: TextInput,
    context: ExecutionContext,
  ): Promise<TextOutput> {
    context.logger.info("Processing text", { length: input.text.length });
    return {
      result: input.text.toUpperCase(),
      processedAt: new Date(),
    };
  }
}
```

### 検証付きExecutor

```typescript
export class ValidatingExecutor
  implements IWorkflowExecutor<DataInput, DataOutput>, IValidatable<DataInput>
{
  readonly type = "VALIDATING_PROCESS";
  readonly displayName = "検証付き処理";
  readonly description = "入力検証を行う処理";

  readonly inputSchema = z.object({
    data: z.string().min(1).max(1000),
    options: z
      .object({
        format: z.enum(["json", "xml", "csv"]),
      })
      .optional(),
  });

  readonly outputSchema = z.object({
    result: z.string(),
    format: z.string(),
  });

  validate(input: DataInput): ValidationResult {
    const result = this.inputSchema.safeParse(input);
    return {
      valid: result.success,
      errors: result.success
        ? []
        : result.error.errors.map((e) => ({
            path: e.path.map(String),
            message: e.message,
            code: e.code,
          })),
    };
  }

  async execute(
    input: DataInput,
    context: ExecutionContext,
  ): Promise<DataOutput> {
    // 実装
  }
}
```

### フル機能Executor

```typescript
export class FullFeaturedExecutor
  implements
    IWorkflowExecutor<ComplexInput, ComplexOutput>,
    IValidatable<ComplexInput>,
    IRetryable,
    IRollbackable,
    IProgressReporter,
    IMetricsProvider,
    ILifecycleAware
{
  readonly type = "FULL_FEATURED";
  readonly displayName = "フル機能処理";
  readonly description = "すべての機能を持つ処理";

  // IValidatable
  readonly inputSchema = complexInputSchema;
  readonly outputSchema = complexOutputSchema;

  // IRetryable
  readonly maxRetries = 3;

  // IRollbackable
  readonly supportsSafepoint = true;

  // IProgressReporter
  readonly supportsProgress = true;

  // 内部状態
  private metrics: ExecutorMetrics = this.createInitialMetrics();
  private connection?: DatabaseConnection;

  // 実装は省略...
}
```

## チェックリスト

### インターフェース設計

- [ ] コアインターフェースは最小限か？
- [ ] 拡張インターフェースは単一の責任を持つか？
- [ ] インターフェースの命名は役割を反映しているか？

### 実装

- [ ] 必要なインターフェースのみ実装しているか？
- [ ] 型ガードが提供されているか？
- [ ] 各インターフェースが独立してテスト可能か？

### 互換性

- [ ] 既存の実装との後方互換性は維持されているか？
- [ ] 移行パスは明確か？
