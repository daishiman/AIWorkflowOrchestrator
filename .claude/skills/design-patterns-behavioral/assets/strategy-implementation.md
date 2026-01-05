# Strategy Pattern 実装テンプレート

## 概要

このテンプレートは、Strategyパターンを実装するための基本構造を提供します。

## 基本構造

### 1. Strategy インターフェース

```typescript
/**
 * {{StrategyName}} - アルゴリズムの共通インターフェース
 *
 * @description {{アルゴリズムの目的}}
 * @typeParam TInput - 入力型
 * @typeParam TOutput - 出力型
 */
interface I{{StrategyName}}<TInput, TOutput> {
  /**
   * アルゴリズムを実行する
   * @param input - 入力データ
   * @returns 実行結果
   */
  execute(input: TInput): Promise<TOutput>;

  /**
   * オプション: 入力データを検証する
   * @param input - 入力データ
   * @returns 検証結果
   */
  validate?(input: TInput): ValidationResult;
}
```

### 2. Concrete Strategy

```typescript
/**
 * {{ConcreteStrategyName}} - {{アルゴリズムの説明}}
 */
class {{ConcreteStrategyName}} implements I{{StrategyName}}<{{InputType}}, {{OutputType}}> {
  constructor(
    private readonly dependencies: {{DependencyType}}
  ) {}

  async execute(input: {{InputType}}): Promise<{{OutputType}}> {
    // 1. 入力の前処理
    const processedInput = this.preProcess(input);

    // 2. メイン処理
    const result = await this.doExecute(processedInput);

    // 3. 結果の後処理
    return this.postProcess(result);
  }

  validate(input: {{InputType}}): ValidationResult {
    // バリデーションロジック
    return { valid: true };
  }

  private preProcess(input: {{InputType}}): {{ProcessedInputType}} {
    // 前処理ロジック
  }

  private async doExecute(input: {{ProcessedInputType}}): Promise<{{RawOutputType}}> {
    // メイン処理ロジック
  }

  private postProcess(result: {{RawOutputType}}): {{OutputType}} {
    // 後処理ロジック
  }
}
```

### 3. Context

```typescript
/**
 * {{ContextName}} - Strategyを使用するコンテキスト
 */
class {{ContextName}} {
  private strategy: I{{StrategyName}}<{{InputType}}, {{OutputType}}>;

  constructor(strategy: I{{StrategyName}}<{{InputType}}, {{OutputType}}>) {
    this.strategy = strategy;
  }

  /**
   * Strategyを設定する
   */
  setStrategy(strategy: I{{StrategyName}}<{{InputType}}, {{OutputType}}>): void {
    this.strategy = strategy;
  }

  /**
   * Strategyを使用して処理を実行する
   */
  async executeStrategy(input: {{InputType}}): Promise<{{OutputType}}> {
    // オプション: 検証
    if (this.strategy.validate) {
      const validation = this.strategy.validate(input);
      if (!validation.valid) {
        throw new ValidationError(validation.errors);
      }
    }

    // 実行
    return this.strategy.execute(input);
  }
}
```

## ワークフローエンジン向けテンプレート

### IWorkflowExecutor

```typescript
/**
 * ワークフロー実行器のインターフェース
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

### Concrete Executor

```typescript
/**
 * {{ExecutorName}} - {{ワークフローの説明}}
 */
export class {{ExecutorName}} implements IWorkflowExecutor<{{InputType}}, {{OutputType}}> {
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
  ) {}

  async execute(input: {{InputType}}, context: ExecutionContext): Promise<{{OutputType}}> {
    context.logger.info('Starting {{ExecutorName}}', { input });

    try {
      // 1. ビジネスロジックの実行
      const result = await this.processWorkflow(input, context);

      context.logger.info('Completed {{ExecutorName}}', { result });
      return result;
    } catch (error) {
      context.logger.error('Failed {{ExecutorName}}', { error });
      throw error;
    }
  }

  validate(input: {{InputType}}): ValidationResult {
    const result = this.inputSchema.safeParse(input);
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.errors
    };
  }

  canRetry(error: Error): boolean {
    // リトライ可能なエラーの判定
    return error instanceof TransientError;
  }

  private async processWorkflow(
    input: {{InputType}},
    context: ExecutionContext
  ): Promise<{{OutputType}}> {
    // メインのビジネスロジック
  }
}
```

## チェックリスト

- [ ] Strategyインターフェースは最小限のメソッドか？
- [ ] ジェネリクスで型安全性が確保されているか？
- [ ] 各ConcreteStrategyは単一責任か？
- [ ] Contextは適切にStrategyを管理しているか？
- [ ] 依存性は注入可能な設計か？
- [ ] テスト可能な構造になっているか？

## 命名規則

| 要素      | 命名規則              | 例                        |
| --------- | --------------------- | ------------------------- |
| Interface | I + 機能名 + Strategy | IPaymentStrategy          |
| Concrete  | 具体名 + Strategy     | CreditCardPaymentStrategy |
| Context   | 機能名 + Context      | PaymentContext            |
| Executor  | 機能名 + Executor     | AuthenticationExecutor    |
