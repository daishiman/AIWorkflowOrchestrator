# Builder 実装テンプレート

## 概要

このテンプレートは、Builderパターンを実装するための基本構造を提供します。

## 基本構造

```typescript
import { z } from 'zod';
import { IWorkflowExecutor, ExecutionContext } from '@/shared/core/interfaces';

/**
 * 設定インターフェース
 */
interface {{Product}}Config {
  // 必須
  type: string;
  displayName: string;
  description: string;

  // オプション
  inputSchema?: z.ZodSchema;
  outputSchema?: z.ZodSchema;
  retryConfig?: RetryConfig;
  rollbackHandler?: RollbackHandler;
  progressCallback?: ProgressCallback;
  lifecycleHooks?: LifecycleHooks;
  dependencies?: Map<string, unknown>;
}

interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier?: number;
}

interface RollbackHandler {
  rollback(context: ExecutionContext): Promise<void>;
}

type ProgressCallback = (progress: Progress) => void;

interface Progress {
  phase: string;
  percent: number;
  message?: string;
}

interface LifecycleHooks {
  onInitialize?: () => Promise<void>;
  onShutdown?: () => Promise<void>;
}
```

## Fluent Builder

```typescript
/**
 * {{Product}}Builder - Fluent API
 */
export class {{Product}}Builder {
  private config: Partial<{{Product}}Config> = {};
  private dependencies: Map<string, unknown> = new Map();

  // ===== 必須設定 =====

  /**
   * タイプを設定（必須）
   */
  withType(type: string): this {
    this.config.type = type;
    return this;
  }

  /**
   * 表示名を設定（必須）
   */
  withDisplayName(name: string): this {
    this.config.displayName = name;
    return this;
  }

  /**
   * 説明を設定（必須）
   */
  withDescription(description: string): this {
    this.config.description = description;
    return this;
  }

  // ===== スキーマ設定 =====

  /**
   * 入力スキーマを設定
   */
  withInputSchema<T>(schema: z.ZodSchema<T>): this {
    this.config.inputSchema = schema;
    return this;
  }

  /**
   * 出力スキーマを設定
   */
  withOutputSchema<T>(schema: z.ZodSchema<T>): this {
    this.config.outputSchema = schema;
    return this;
  }

  // ===== リトライ設定 =====

  /**
   * リトライを有効化
   */
  withRetry(maxRetries: number, delay: number = 1000): this {
    this.config.retryConfig = { maxRetries, delay };
    return this;
  }

  /**
   * 詳細なリトライ設定
   */
  withRetryConfig(config: RetryConfig): this {
    this.config.retryConfig = config;
    return this;
  }

  // ===== ロールバック設定 =====

  /**
   * ロールバックハンドラを設定
   */
  withRollback(handler: RollbackHandler): this {
    this.config.rollbackHandler = handler;
    return this;
  }

  /**
   * ロールバック関数を設定
   */
  withRollbackFn(fn: (context: ExecutionContext) => Promise<void>): this {
    this.config.rollbackHandler = { rollback: fn };
    return this;
  }

  // ===== 進捗レポート設定 =====

  /**
   * 進捗コールバックを設定
   */
  withProgress(callback: ProgressCallback): this {
    this.config.progressCallback = callback;
    return this;
  }

  // ===== ライフサイクル設定 =====

  /**
   * ライフサイクルフックを設定
   */
  withLifecycle(hooks: LifecycleHooks): this {
    this.config.lifecycleHooks = hooks;
    return this;
  }

  /**
   * 初期化フックを設定
   */
  withInitialize(fn: () => Promise<void>): this {
    this.config.lifecycleHooks = {
      ...this.config.lifecycleHooks,
      onInitialize: fn,
    };
    return this;
  }

  /**
   * 終了フックを設定
   */
  withShutdown(fn: () => Promise<void>): this {
    this.config.lifecycleHooks = {
      ...this.config.lifecycleHooks,
      onShutdown: fn,
    };
    return this;
  }

  // ===== 依存関係設定 =====

  /**
   * 依存関係を追加
   */
  withDependency<T>(key: string, value: T): this {
    this.dependencies.set(key, value);
    return this;
  }

  // ===== 構築 =====

  /**
   * オブジェクトを構築
   * @throws BuilderError 必須フィールドが不足している場合
   */
  build(): {{Product}} {
    this.validate();

    const config: {{Product}}Config = {
      type: this.config.type!,
      displayName: this.config.displayName!,
      description: this.config.description!,
      inputSchema: this.config.inputSchema,
      outputSchema: this.config.outputSchema,
      retryConfig: this.config.retryConfig,
      rollbackHandler: this.config.rollbackHandler,
      progressCallback: this.config.progressCallback,
      lifecycleHooks: this.config.lifecycleHooks,
      dependencies: this.dependencies.size > 0 ? this.dependencies : undefined,
    };

    return new {{Product}}(config);
  }

  /**
   * 検証してからオブジェクトを構築（Result型を返す）
   */
  tryBuild(): Result<{{Product}}, string[]> {
    const errors = this.collectErrors();
    if (errors.length > 0) {
      return Result.err(errors);
    }
    return Result.ok(this.build());
  }

  // ===== 検証 =====

  private validate(): void {
    const errors = this.collectErrors();
    if (errors.length > 0) {
      throw new BuilderError(errors);
    }
  }

  private collectErrors(): string[] {
    const errors: string[] = [];

    if (!this.config.type) {
      errors.push('type is required');
    }
    if (!this.config.displayName) {
      errors.push('displayName is required');
    }
    if (!this.config.description) {
      errors.push('description is required');
    }

    return errors;
  }
}
```

## Step Builder（型安全な順序強制）

```typescript
/**
 * Step Builder - コンパイル時に順序を強制
 */

// ステップインターフェース
interface TypeStep {
  withType(type: string): DisplayNameStep;
}

interface DisplayNameStep {
  withDisplayName(name: string): DescriptionStep;
}

interface DescriptionStep {
  withDescription(description: string): OptionalStep;
}

interface OptionalStep {
  withInputSchema<T>(schema: z.ZodSchema<T>): OptionalStep;
  withOutputSchema<T>(schema: z.ZodSchema<T>): OptionalStep;
  withRetry(maxRetries: number, delay?: number): OptionalStep;
  withRollback(handler: RollbackHandler): OptionalStep;
  withProgress(callback: ProgressCallback): OptionalStep;
  build(): {{Product}};
}

/**
 * Step Builder 実装
 */
export class {{Product}}StepBuilder
  implements TypeStep, DisplayNameStep, DescriptionStep, OptionalStep
{
  private config: Partial<{{Product}}Config> = {};

  // TypeStep
  withType(type: string): DisplayNameStep {
    this.config.type = type;
    return this;
  }

  // DisplayNameStep
  withDisplayName(name: string): DescriptionStep {
    this.config.displayName = name;
    return this;
  }

  // DescriptionStep
  withDescription(description: string): OptionalStep {
    this.config.description = description;
    return this;
  }

  // OptionalStep
  withInputSchema<T>(schema: z.ZodSchema<T>): OptionalStep {
    this.config.inputSchema = schema;
    return this;
  }

  withOutputSchema<T>(schema: z.ZodSchema<T>): OptionalStep {
    this.config.outputSchema = schema;
    return this;
  }

  withRetry(maxRetries: number, delay: number = 1000): OptionalStep {
    this.config.retryConfig = { maxRetries, delay };
    return this;
  }

  withRollback(handler: RollbackHandler): OptionalStep {
    this.config.rollbackHandler = handler;
    return this;
  }

  withProgress(callback: ProgressCallback): OptionalStep {
    this.config.progressCallback = callback;
    return this;
  }

  build(): {{Product}} {
    return new {{Product}}(this.config as {{Product}}Config);
  }
}

// 使用例（順序が強制される）
// const product = new {{Product}}StepBuilder()
//   .withType('TYPE')           // 必須: 最初
//   .withDisplayName('Name')    // 必須: 2番目
//   .withDescription('Desc')    // 必須: 3番目
//   .withRetry(3)               // オプション
//   .build();
```

## Director

```typescript
/**
 * {{Product}}Director - 共通の構築パターンを定義
 */
export class {{Product}}Director {
  constructor(private builder: {{Product}}Builder) {}

  /**
   * シンプルな{{Product}}を構築
   */
  buildSimple(type: string, name: string): {{Product}} {
    return this.builder
      .withType(type)
      .withDisplayName(name)
      .withDescription(`${name}を実行します`)
      .build();
  }

  /**
   * 検証付き{{Product}}を構築
   */
  buildValidating(
    type: string,
    name: string,
    inputSchema: z.ZodSchema,
    outputSchema: z.ZodSchema,
  ): {{Product}} {
    return this.builder
      .withType(type)
      .withDisplayName(name)
      .withDescription(`${name}を実行します（入力検証付き）`)
      .withInputSchema(inputSchema)
      .withOutputSchema(outputSchema)
      .build();
  }

  /**
   * リトライ付き{{Product}}を構築
   */
  buildRetryable(
    type: string,
    name: string,
    maxRetries: number = 3,
  ): {{Product}} {
    return this.builder
      .withType(type)
      .withDisplayName(name)
      .withDescription(`${name}を実行します（リトライ付き）`)
      .withRetry(maxRetries, 1000)
      .build();
  }

  /**
   * フル機能{{Product}}を構築
   */
  buildFullFeatured(config: FullConfig): {{Product}} {
    return this.builder
      .withType(config.type)
      .withDisplayName(config.name)
      .withDescription(config.description)
      .withInputSchema(config.inputSchema)
      .withOutputSchema(config.outputSchema)
      .withRetry(config.maxRetries, config.retryDelay)
      .withRollback(config.rollbackHandler)
      .withProgress(config.progressCallback)
      .withLifecycle(config.lifecycleHooks)
      .build();
  }
}

interface FullConfig {
  type: string;
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
  maxRetries: number;
  retryDelay: number;
  rollbackHandler: RollbackHandler;
  progressCallback: ProgressCallback;
  lifecycleHooks: LifecycleHooks;
}
```

## 使用例

```typescript
// Fluent Builder
const product1 = new {{Product}}Builder()
  .withType('AI_ANALYSIS')
  .withDisplayName('AI分析')
  .withDescription('AIを使用したテキスト分析')
  .withInputSchema(inputSchema)
  .withOutputSchema(outputSchema)
  .withRetry(3, 1000)
  .withProgress(progress => console.log(`${progress.percent}%`))
  .build();

// Step Builder（順序強制）
const product2 = new {{Product}}StepBuilder()
  .withType('DATA_TRANSFORM')
  .withDisplayName('データ変換')
  .withDescription('データ形式を変換')
  .withRetry(5)
  .build();

// Director
const director = new {{Product}}Director(new {{Product}}Builder());
const simple = director.buildSimple('SIMPLE', 'シンプル処理');
const retryable = director.buildRetryable('RETRY', 'リトライ処理', 5);
```

## チェックリスト

### 設計

- [ ] 必須フィールドとオプションフィールドは明確か？
- [ ] メソッドチェーンが可能か（thisを返す）？
- [ ] Step Builderで順序を強制する必要があるか？

### 実装

- [ ] build()で完全なオブジェクトが生成されるか？
- [ ] 必須フィールドの検証があるか？
- [ ] エラーメッセージは明確か？

### テスト

- [ ] 各設定メソッドのテストがあるか？
- [ ] 必須フィールド不足時のエラーをテストしているか？
- [ ] Directorパターンを使用すべきか検討したか？
