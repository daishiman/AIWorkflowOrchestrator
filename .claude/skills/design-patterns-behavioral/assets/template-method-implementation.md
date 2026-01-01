# Template Method Pattern 実装テンプレート

## 概要

このテンプレートは、Template Methodパターンを実装するための基本構造を提供します。

## 基本構造

### 1. Abstract Class

```typescript
/**
 * {{AbstractClassName}} - アルゴリズムの骨格を定義する抽象クラス
 *
 * @description {{アルゴリズムの目的}}
 * @typeParam TInput - 入力型
 * @typeParam TOutput - 出力型
 */
abstract class {{AbstractClassName}}<TInput, TOutput> {
  /**
   * テンプレートメソッド - アルゴリズムの骨格を定義
   * このメソッドはオーバーライド禁止
   */
  public async execute(input: TInput, context: Context): Promise<TOutput> {
    // 1. 前処理フック
    await this.beforeExecute(input, context);

    // 2. 入力検証
    const validation = this.validate(input);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // 3. 入力の前処理
    const processedInput = await this.preProcess(input, context);

    // 4. メイン処理（抽象メソッド）
    const result = await this.doExecute(processedInput, context);

    // 5. 結果の後処理
    const processedResult = await this.postProcess(result, context);

    // 6. 後処理フック
    await this.afterExecute(processedResult, context);

    return processedResult;
  }

  // ===== 抽象メソッド（サブクラスで必ず実装） =====

  /**
   * メイン処理を実行する
   * @abstract
   */
  protected abstract doExecute(input: TInput, context: Context): Promise<TOutput>;

  // ===== フックメソッド（オプショナルでオーバーライド） =====

  /**
   * 実行前フック
   */
  protected async beforeExecute(input: TInput, context: Context): Promise<void> {
    // デフォルト: 何もしない
  }

  /**
   * 入力検証
   */
  protected validate(input: TInput): ValidationResult {
    // デフォルト: 常に有効
    return { valid: true, errors: [] };
  }

  /**
   * 入力の前処理
   */
  protected async preProcess(input: TInput, context: Context): Promise<TInput> {
    // デフォルト: 入力をそのまま返す
    return input;
  }

  /**
   * 結果の後処理
   */
  protected async postProcess(result: TOutput, context: Context): Promise<TOutput> {
    // デフォルト: 結果をそのまま返す
    return result;
  }

  /**
   * 実行後フック
   */
  protected async afterExecute(result: TOutput, context: Context): Promise<void> {
    // デフォルト: 何もしない
  }
}
```

### 2. Concrete Class

```typescript
/**
 * {{ConcreteClassName}} - {{具体クラスの説明}}
 */
class {{ConcreteClassName}} extends {{AbstractClassName}}<{{InputType}}, {{OutputType}}> {
  constructor(
    private readonly dependencies: {{DependencyType}}
  ) {
    super();
  }

  /**
   * メイン処理の実装
   */
  protected async doExecute(
    input: {{InputType}},
    context: Context
  ): Promise<{{OutputType}}> {
    // 具体的なビジネスロジック
  }

  /**
   * オーバーライド: 入力検証
   */
  protected validate(input: {{InputType}}): ValidationResult {
    // カスタム検証ロジック
    return super.validate(input);
  }

  /**
   * オーバーライド: 前処理
   */
  protected async preProcess(
    input: {{InputType}},
    context: Context
  ): Promise<{{InputType}}> {
    // カスタム前処理
    return input;
  }
}
```

## ワークフローエンジン向けテンプレート

### BaseWorkflowExecutor

```typescript
/**
 * BaseWorkflowExecutor - ワークフロー実行の基底クラス
 *
 * 共通の実行フローを定義し、個別の実装をサブクラスに委ねる
 */
abstract class BaseWorkflowExecutor<
  TInput,
  TOutput,
> implements IWorkflowExecutor<TInput, TOutput> {
  abstract readonly type: string;
  abstract readonly displayName: string;
  abstract readonly description: string;
  abstract readonly inputSchema: z.ZodSchema<TInput>;
  abstract readonly outputSchema: z.ZodSchema<TOutput>;

  /**
   * テンプレートメソッド
   */
  public async execute(
    input: TInput,
    context: ExecutionContext,
  ): Promise<TOutput> {
    const startTime = Date.now();

    try {
      // 1. 実行開始ログ
      await this.logStart(input, context);

      // 2. 入力検証
      await this.validateInput(input, context);

      // 3. 前処理
      const processedInput = await this.preProcess(input, context);

      // 4. メイン処理
      const result = await this.doExecute(processedInput, context);

      // 5. 後処理
      const processedResult = await this.postProcess(result, context);

      // 6. 実行完了ログ
      await this.logComplete(processedResult, context, startTime);

      return processedResult;
    } catch (error) {
      // エラーハンドリング
      await this.handleError(error as Error, context, startTime);
      throw error;
    }
  }

  // ===== 抽象メソッド =====

  /**
   * メイン処理（サブクラスで実装）
   */
  protected abstract doExecute(
    input: TInput,
    context: ExecutionContext,
  ): Promise<TOutput>;

  // ===== フックメソッド =====

  protected async logStart(
    input: TInput,
    context: ExecutionContext,
  ): Promise<void> {
    context.logger.info(`Starting ${this.type}`, {
      workflowId: context.workflowId,
      type: this.type,
    });
  }

  protected async validateInput(
    input: TInput,
    context: ExecutionContext,
  ): Promise<void> {
    const result = this.inputSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(this.type, result.error.errors);
    }
  }

  protected async preProcess(
    input: TInput,
    context: ExecutionContext,
  ): Promise<TInput> {
    return input;
  }

  protected async postProcess(
    result: TOutput,
    context: ExecutionContext,
  ): Promise<TOutput> {
    return result;
  }

  protected async logComplete(
    result: TOutput,
    context: ExecutionContext,
    startTime: number,
  ): Promise<void> {
    const duration = Date.now() - startTime;
    context.logger.info(`Completed ${this.type}`, {
      workflowId: context.workflowId,
      type: this.type,
      durationMs: duration,
    });
  }

  protected async handleError(
    error: Error,
    context: ExecutionContext,
    startTime: number,
  ): Promise<void> {
    const duration = Date.now() - startTime;
    context.logger.error(`Failed ${this.type}`, {
      workflowId: context.workflowId,
      type: this.type,
      error: error.message,
      durationMs: duration,
    });
  }

  // ===== オプショナルメソッド =====

  validate(input: TInput): ValidationResult {
    const result = this.inputSchema.safeParse(input);
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.errors,
    };
  }

  canRetry(error: Error): boolean {
    return false; // デフォルト: リトライ不可
  }
}
```

### 具体的なExecutor

```typescript
/**
 * {{ExecutorName}} - {{ワークフローの説明}}
 */
export class {{ExecutorName}} extends BaseWorkflowExecutor<
  {{InputType}},
  {{OutputType}}
> {
  readonly type = '{{WORKFLOW_TYPE}}';
  readonly displayName = '{{表示名}}';
  readonly description = '{{説明}}';

  readonly inputSchema = z.object({
    // 入力スキーマ定義
  });

  readonly outputSchema = z.object({
    // 出力スキーマ定義
  });

  constructor(
    private readonly aiClient: AIClient,
    private readonly repository: WorkflowRepository
  ) {
    super();
  }

  protected async doExecute(
    input: {{InputType}},
    context: ExecutionContext
  ): Promise<{{OutputType}}> {
    // メインのビジネスロジック
  }

  // 必要に応じてフックをオーバーライド
  protected async preProcess(
    input: {{InputType}},
    context: ExecutionContext
  ): Promise<{{InputType}}> {
    // カスタム前処理
    return input;
  }

  canRetry(error: Error): boolean {
    return error instanceof TransientError;
  }
}
```

## チェックリスト

- [ ] テンプレートメソッドの処理順序は論理的か？
- [ ] 抽象メソッドは必要最小限か？
- [ ] フックメソッドは適切なデフォルト実装を持つか？
- [ ] サブクラスでのオーバーライドは容易か？
- [ ] 共通処理が適切に集約されているか？
- [ ] エラーハンドリングは統一されているか？

## 命名規則

| 要素            | 命名規則                           | 例                     |
| --------------- | ---------------------------------- | ---------------------- |
| Abstract Class  | Base + 機能名                      | BaseWorkflowExecutor   |
| Concrete Class  | 具体名 + 機能名                    | AuthenticationExecutor |
| Template Method | execute, run, process              | execute                |
| Abstract Method | do + 動詞                          | doExecute              |
| Hook Method     | before/after + 動詞, on + イベント | beforeExecute, onError |
