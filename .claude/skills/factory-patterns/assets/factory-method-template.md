# Factory Method 実装テンプレート

## 概要

このテンプレートは、Factory Methodパターンを実装するための基本構造を提供します。

## 基本構造

```typescript
import { IWorkflowExecutor, ExecutionContext } from '@/shared/core/interfaces';

/**
 * Creator（抽象クラス）
 * オブジェクト生成のインターフェースを定義
 */
export abstract class {{Creator}}Creator {
  /**
   * Factory Method - サブクラスで具体的な生成を実装
   */
  abstract createExecutor(): IWorkflowExecutor;

  /**
   * ビジネスロジック（Factory Methodを使用）
   */
  async processWorkflow<TInput, TOutput>(
    input: TInput,
    context: ExecutionContext
  ): Promise<TOutput> {
    // Factory Methodでオブジェクトを生成
    const executor = this.createExecutor();

    // 前処理
    this.beforeExecute(input, context);

    // 実行
    const result = await executor.execute(input, context);

    // 後処理
    this.afterExecute(result, context);

    return result as TOutput;
  }

  /**
   * フックメソッド（オプション）
   */
  protected beforeExecute(input: unknown, context: ExecutionContext): void {
    context.logger.info('Starting execution');
  }

  protected afterExecute(result: unknown, context: ExecutionContext): void {
    context.logger.info('Execution completed');
  }
}
```

## Concrete Creator

```typescript
/**
 * Concrete Creator A
 */
export class {{ConcreteCreatorA}} extends {{Creator}}Creator {
  constructor(
    private readonly dependency1: Dependency1,
    private readonly dependency2: Dependency2,
  ) {
    super();
  }

  createExecutor(): IWorkflowExecutor {
    return new {{ProductA}}Executor(
      this.dependency1,
      this.dependency2,
    );
  }

  // オプション: フックメソッドのオーバーライド
  protected afterExecute(result: unknown, context: ExecutionContext): void {
    super.afterExecute(result, context);
    // 追加の後処理
    this.dependency1.recordMetrics(result);
  }
}

/**
 * Concrete Creator B
 */
export class {{ConcreteCreatorB}} extends {{Creator}}Creator {
  constructor(
    private readonly otherDependency: OtherDependency,
  ) {
    super();
  }

  createExecutor(): IWorkflowExecutor {
    return new {{ProductB}}Executor(
      this.otherDependency,
    );
  }
}
```

## Product（Executor）

```typescript
/**
 * Product A
 */
class {{ProductA}}Executor implements IWorkflowExecutor {
  readonly type = '{{TYPE_A}}';
  readonly displayName = '{{表示名A}}';
  readonly description = '{{説明A}}';

  constructor(
    private readonly dependency1: Dependency1,
    private readonly dependency2: Dependency2,
  ) {}

  async execute<TInput, TOutput>(
    input: TInput,
    context: ExecutionContext
  ): Promise<TOutput> {
    context.logger.info(`Executing ${this.type}`, { input });

    // ビジネスロジックの実装
    const result = await this.processLogic(input);

    return result as TOutput;
  }

  private async processLogic<TInput>(input: TInput): Promise<unknown> {
    // 具体的な処理
    throw new Error('Not implemented');
  }
}

/**
 * Product B
 */
class {{ProductB}}Executor implements IWorkflowExecutor {
  readonly type = '{{TYPE_B}}';
  readonly displayName = '{{表示名B}}';
  readonly description = '{{説明B}}';

  constructor(
    private readonly otherDependency: OtherDependency,
  ) {}

  async execute<TInput, TOutput>(
    input: TInput,
    context: ExecutionContext
  ): Promise<TOutput> {
    // 別の実装
    throw new Error('Not implemented');
  }
}
```

## パラメータ化 Factory Method

```typescript
/**
 * パラメータに基づいて異なる製品を生成
 */
export abstract class ParameterizedCreator {
  /**
   * パラメータ化されたFactory Method
   */
  abstract createExecutor(type: string): IWorkflowExecutor;

  /**
   * 型に基づいてワークフローを実行
   */
  async processWorkflow<TInput, TOutput>(
    type: string,
    input: TInput,
    context: ExecutionContext
  ): Promise<TOutput> {
    const executor = this.createExecutor(type);
    return executor.execute(input, context) as Promise<TOutput>;
  }
}

/**
 * 具体的な実装
 */
export class {{Domain}}ExecutorCreator extends ParameterizedCreator {
  constructor(
    private readonly dependencies: Dependencies,
  ) {
    super();
  }

  createExecutor(type: string): IWorkflowExecutor {
    switch (type) {
      case 'TYPE_A':
        return new TypeAExecutor(this.dependencies.dep1);
      case 'TYPE_B':
        return new TypeBExecutor(this.dependencies.dep2);
      case 'TYPE_C':
        return new TypeCExecutor(this.dependencies.dep3);
      default:
        throw new UnknownTypeError(type);
    }
  }
}
```

## 使用例

```typescript
// Concrete Creatorのインスタンス化
const creatorA = new {{ConcreteCreatorA}}(dependency1, dependency2);
const creatorB = new {{ConcreteCreatorB}}(otherDependency);

// ワークフローの実行（Creatorに応じた製品が生成される）
const resultA = await creatorA.processWorkflow(input, context);
const resultB = await creatorB.processWorkflow(input, context);

// パラメータ化バージョン
const paramCreator = new {{Domain}}ExecutorCreator(dependencies);
const resultTypeA = await paramCreator.processWorkflow('TYPE_A', input, context);
const resultTypeB = await paramCreator.processWorkflow('TYPE_B', input, context);
```

## テスト

```typescript
describe('{{Creator}}Creator', () => {
  describe('{{ConcreteCreatorA}}', () => {
    it('should create {{ProductA}}Executor', () => {
      const creator = new {{ConcreteCreatorA}}(mockDep1, mockDep2);
      const executor = creator.createExecutor();

      expect(executor).toBeInstanceOf({{ProductA}}Executor);
      expect(executor.type).toBe('{{TYPE_A}}');
    });

    it('should execute workflow with created executor', async () => {
      const creator = new {{ConcreteCreatorA}}(mockDep1, mockDep2);
      const result = await creator.processWorkflow(mockInput, mockContext);

      expect(result).toBeDefined();
      expect(mockContext.logger.info).toHaveBeenCalled();
    });
  });
});
```

## チェックリスト

### 設計

- [ ] Factory Methodの戻り値型はインターフェース/抽象型か？
- [ ] 各Concrete Creatorは単一の製品タイプに対応しているか？
- [ ] フックメソッドは適切に定義されているか？

### 実装

- [ ] 具体的なクラスはFactory Method内でのみインスタンス化されているか？
- [ ] 依存関係はコンストラクタで注入されているか？
- [ ] エラーハンドリングは適切か？

### テスト

- [ ] 各Concrete Creatorのテストがあるか？
- [ ] Factory Methodが正しい製品を返すことを検証しているか？
- [ ] モック/スタブを使ったテストが容易に書けるか？
