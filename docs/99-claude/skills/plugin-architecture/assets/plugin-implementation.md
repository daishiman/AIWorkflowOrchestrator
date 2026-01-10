# Plugin 実装テンプレート

## 概要

このテンプレートは、ワークフローエンジンのプラグイン（Executor）を実装するための基本構造を提供します。

## IWorkflowExecutor インターフェース

```typescript
import { z } from "zod";

/**
 * 実行コンテキスト
 */
interface ExecutionContext {
  /** ワークフローID */
  workflowId: string;
  /** ユーザーID */
  userId: string;
  /** ロガー */
  logger: Logger;
  /** 中断シグナル */
  abortSignal?: AbortSignal;
}

/**
 * 検証結果
 */
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * ワークフロー実行器インターフェース
 */
interface IWorkflowExecutor<TInput = unknown, TOutput = unknown> {
  /** ワークフロータイプ識別子 */
  readonly type: string;

  /** 表示名 */
  readonly displayName: string;

  /** 説明 */
  readonly description: string;

  /** 入力スキーマ（Zod） */
  readonly inputSchema: z.ZodSchema<TInput>;

  /** 出力スキーマ（Zod） */
  readonly outputSchema: z.ZodSchema<TOutput>;

  /**
   * ワークフローを実行する
   */
  execute(input: TInput, context: ExecutionContext): Promise<TOutput>;

  /**
   * オプション: 入力を検証する
   */
  validate?(input: TInput): ValidationResult;

  /**
   * オプション: エラーがリトライ可能か判定する
   */
  canRetry?(error: Error): boolean;
}
```

## 基本的なExecutor実装

```typescript
/**
 * {{ExecutorName}} - {{説明}}
 */
export class {{ExecutorName}} implements IWorkflowExecutor<{{InputType}}, {{OutputType}}> {
  readonly type = '{{WORKFLOW_TYPE}}';
  readonly displayName = '{{表示名}}';
  readonly description = '{{説明}}';

  readonly inputSchema = z.object({
    // 入力フィールドの定義
    // field1: z.string(),
    // field2: z.number().optional(),
  });

  readonly outputSchema = z.object({
    // 出力フィールドの定義
    // result: z.string(),
    // metadata: z.object({...}),
  });

  constructor(
    private readonly aiClient: AIClient,
    private readonly repository: WorkflowRepository,
  ) {}

  async execute(
    input: {{InputType}},
    context: ExecutionContext
  ): Promise<{{OutputType}}> {
    context.logger.info(`Starting ${this.type}`, {
      workflowId: context.workflowId,
      input: this.sanitizeInput(input),
    });

    try {
      // 1. ビジネスロジックの実行
      const result = await this.processWorkflow(input, context);

      context.logger.info(`Completed ${this.type}`, {
        workflowId: context.workflowId,
      });

      return result;

    } catch (error) {
      context.logger.error(`Failed ${this.type}`, {
        workflowId: context.workflowId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  validate(input: {{InputType}}): ValidationResult {
    const result = this.inputSchema.safeParse(input);
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.errors,
    };
  }

  canRetry(error: Error): boolean {
    // リトライ可能なエラーの判定
    // 例: ネットワークエラー、タイムアウト、レート制限
    if (error instanceof TransientError) return true;
    if (error.message.includes('timeout')) return true;
    if (error.message.includes('rate limit')) return true;
    return false;
  }

  private async processWorkflow(
    input: {{InputType}},
    context: ExecutionContext
  ): Promise<{{OutputType}}> {
    // メインのビジネスロジックを実装
    throw new Error('Not implemented');
  }

  private sanitizeInput(input: {{InputType}}): Record<string, unknown> {
    // ログ出力用にセンシティブ情報を除去
    return {
      ...input,
      // password: '[REDACTED]',
    };
  }
}
```

## AI連携Executor実装

```typescript
/**
 * AIAnalysisExecutor - AIを使用した分析ワークフロー
 */
export class AIAnalysisExecutor implements IWorkflowExecutor<
  AnalysisInput,
  AnalysisOutput
> {
  readonly type = "AI_ANALYSIS";
  readonly displayName = "AI分析";
  readonly description = "AIを使用してコンテンツを分析します";

  readonly inputSchema = z.object({
    content: z.string().min(1),
    analysisType: z.enum(["sentiment", "summary", "keywords"]),
    options: z
      .object({
        language: z.string().default("ja"),
        maxLength: z.number().optional(),
      })
      .optional(),
  });

  readonly outputSchema = z.object({
    result: z.string(),
    confidence: z.number(),
    metadata: z.object({
      model: z.string(),
      tokenUsage: z.number(),
      processingTime: z.number(),
    }),
  });

  constructor(
    private readonly aiClient: AIClient,
    private readonly repository: WorkflowRepository,
  ) {}

  async execute(
    input: AnalysisInput,
    context: ExecutionContext,
  ): Promise<AnalysisOutput> {
    const startTime = Date.now();

    // AIクライアントを使用して分析
    const response = await this.aiClient.analyze({
      content: input.content,
      type: input.analysisType,
      options: input.options,
    });

    // 結果を保存
    await this.repository.saveResult(context.workflowId, {
      input,
      output: response,
    });

    return {
      result: response.text,
      confidence: response.confidence,
      metadata: {
        model: response.model,
        tokenUsage: response.usage.totalTokens,
        processingTime: Date.now() - startTime,
      },
    };
  }

  canRetry(error: Error): boolean {
    // AIサービスのレート制限やタイムアウトはリトライ可能
    return (
      error.message.includes("rate_limit") ||
      error.message.includes("timeout") ||
      error.message.includes("503")
    );
  }
}
```

## ライフサイクル対応Executor

```typescript
/**
 * DatabaseExecutor - データベース接続を必要とするExecutor
 */
export class DatabaseExecutor
  implements IWorkflowExecutor<DbInput, DbOutput>, IExecutorLifecycle
{
  readonly type = "DATABASE_OPERATION";
  readonly displayName = "データベース操作";
  readonly description = "データベースに対する操作を実行します";

  // スキーマ定義...

  private connection?: DatabaseConnection;

  constructor(
    private readonly connectionFactory: () => Promise<DatabaseConnection>,
  ) {}

  async onInitialize(): Promise<void> {
    this.connection = await this.connectionFactory();
    console.log("Database connection established");
  }

  async onShutdown(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      console.log("Database connection closed");
    }
  }

  async execute(input: DbInput, context: ExecutionContext): Promise<DbOutput> {
    if (!this.connection) {
      throw new Error("Executor not initialized");
    }

    return await this.connection.transaction(async (tx) => {
      // トランザクション内でデータベース操作
      return await this.processWithTransaction(tx, input, context);
    });
  }

  private async processWithTransaction(
    tx: Transaction,
    input: DbInput,
    context: ExecutionContext,
  ): Promise<DbOutput> {
    // 実装
  }
}
```

## レジストリへの登録

```typescript
// src/features/registry.ts

import { WorkflowRegistry } from '@/shared/core/registry';
import { {{ExecutorName}} } from './{{feature}}/executor';

export function registerAllExecutors(
  registry: WorkflowRegistry,
  container: Container
): void {
  // 依存関係を解決してExecutorを登録
  registry.register(new {{ExecutorName}}(
    container.resolve(AI_CLIENT),
    container.resolve(WORKFLOW_REPO),
  ));

  // 他のExecutorも同様に登録
}
```

## チェックリスト

- [ ] typeは一意で明確か？
- [ ] inputSchemaとoutputSchemaは適切に定義されているか？
- [ ] エラーハンドリングは適切か？
- [ ] ログ出力は十分か？
- [ ] センシティブ情報は適切に扱われているか？
- [ ] canRetryは適切に実装されているか？
- [ ] 依存関係はコンストラクタで注入されているか？
