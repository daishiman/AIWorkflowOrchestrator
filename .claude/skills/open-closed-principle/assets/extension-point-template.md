# 拡張ポイント実装テンプレート

## 概要

このテンプレートは、OCP（開放閉鎖原則）に準拠した拡張ポイントを実装するための基本構造を提供します。

## 基本構造: Strategy + Registry

```typescript
import { IWorkflowExecutor, ExecutionContext } from "@/shared/core/interfaces";

// ===== インターフェース定義 =====

/**
 * ワークフロー実行戦略
 * 拡張ポイント: 新しいワークフロータイプを追加
 */
export interface IWorkflowStrategy<TInput = unknown, TOutput = unknown> {
  /** ワークフロータイプ識別子 */
  readonly type: string;

  /** 表示名 */
  readonly displayName: string;

  /** 説明 */
  readonly description: string;

  /**
   * ワークフローを実行
   */
  execute(input: TInput, context: ExecutionContext): Promise<TOutput>;

  /**
   * 入力を検証（オプション）
   */
  validate?(input: TInput): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ===== レジストリ実装 =====

/**
 * 戦略レジストリ
 * 拡張ポイント: register() で新しい戦略を登録
 */
export class StrategyRegistry<T extends IWorkflowStrategy> {
  private strategies: Map<string, T> = new Map();

  /**
   * 拡張ポイント: 新しい戦略を登録
   */
  register(strategy: T): void {
    if (this.strategies.has(strategy.type)) {
      console.warn(`Overwriting strategy for type: ${strategy.type}`);
    }
    this.strategies.set(strategy.type, strategy);
    console.log(`Registered strategy: ${strategy.type}`);
  }

  /**
   * 戦略を取得
   */
  get(type: string): T {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new UnknownStrategyError(type, this.listTypes());
    }
    return strategy;
  }

  /**
   * 戦略が存在するか確認
   */
  has(type: string): boolean {
    return this.strategies.has(type);
  }

  /**
   * 登録されているタイプの一覧
   */
  listTypes(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * 戦略の情報一覧
   */
  listStrategies(): StrategyInfo[] {
    return Array.from(this.strategies.values()).map((s) => ({
      type: s.type,
      displayName: s.displayName,
      description: s.description,
    }));
  }
}

interface StrategyInfo {
  type: string;
  displayName: string;
  description: string;
}

class UnknownStrategyError extends Error {
  constructor(type: string, availableTypes: string[]) {
    const available =
      availableTypes.length > 0
        ? `Available types: ${availableTypes.join(", ")}`
        : "No strategies registered";
    super(`Unknown strategy type: '${type}'. ${available}`);
    this.name = "UnknownStrategyError";
  }
}
```

## ワークフローエンジン実装

```typescript
/**
 * ワークフローエンジン
 * OCP準拠: 新しいワークフロータイプの追加で既存コードを修正しない
 */
export class WorkflowEngine {
  constructor(
    private readonly registry: StrategyRegistry<IWorkflowStrategy>,
    private readonly middlewareChain?: MiddlewareChain,
  ) {}

  /**
   * ワークフローを実行
   */
  async execute<TInput, TOutput>(
    type: string,
    input: TInput,
    context: ExecutionContext,
  ): Promise<TOutput> {
    const strategy = this.registry.get(type);

    // 検証（オプション）
    if (strategy.validate) {
      const validation = strategy.validate(input);
      if (!validation.valid) {
        throw new ValidationError(validation.errors);
      }
    }

    // ミドルウェアチェーンがある場合
    if (this.middlewareChain) {
      return this.middlewareChain.execute(
        input,
        context,
        (i, c) => strategy.execute(i, c) as Promise<TOutput>,
      );
    }

    // 直接実行
    return strategy.execute(input, context) as Promise<TOutput>;
  }
}
```

## ミドルウェアチェーン（拡張ポイント）

```typescript
/**
 * ミドルウェアインターフェース
 * 拡張ポイント: 新しいミドルウェアを追加
 */
export interface IMiddleware<TInput = unknown, TOutput = unknown> {
  execute(
    input: TInput,
    context: ExecutionContext,
    next: (input: TInput, context: ExecutionContext) => Promise<TOutput>,
  ): Promise<TOutput>;
}

/**
 * ミドルウェアチェーン
 * OCP準拠: use() で新しいミドルウェアを追加
 */
export class MiddlewareChain<TInput = unknown, TOutput = unknown> {
  private middlewares: IMiddleware<TInput, TOutput>[] = [];

  /**
   * 拡張ポイント: ミドルウェアを追加
   */
  use(middleware: IMiddleware<TInput, TOutput>): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * チェーンを実行
   */
  async execute(
    input: TInput,
    context: ExecutionContext,
    finalHandler: (
      input: TInput,
      context: ExecutionContext,
    ) => Promise<TOutput>,
  ): Promise<TOutput> {
    const chain = this.middlewares.reduceRight(
      (next, middleware) => (i: TInput, c: ExecutionContext) =>
        middleware.execute(i, c, next),
      finalHandler,
    );
    return chain(input, context);
  }
}
```

## イベントフック（拡張ポイント）

```typescript
/**
 * イベントタイプ
 */
type WorkflowEvent = "beforeExecute" | "afterExecute" | "onError";

/**
 * イベントリスナー
 */
type EventListener<T = unknown> = (data: T) => void | Promise<void>;

/**
 * イベントエミッター
 * 拡張ポイント: on() でイベントリスナーを登録
 */
export class WorkflowEventEmitter {
  private listeners: Map<string, Set<EventListener>> = new Map();

  /**
   * 拡張ポイント: イベントリスナーを登録
   */
  on<T>(event: WorkflowEvent, listener: EventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventListener);

    // アンサブスクライブ関数を返す
    return () => this.off(event, listener);
  }

  /**
   * イベントリスナーを解除
   */
  off<T>(event: WorkflowEvent, listener: EventListener<T>): void {
    this.listeners.get(event)?.delete(listener as EventListener);
  }

  /**
   * イベントを発火
   */
  async emit<T>(event: WorkflowEvent, data: T): Promise<void> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    for (const listener of eventListeners) {
      await listener(data);
    }
  }
}
```

## 使用例

```typescript
// ===== 具体的な戦略の実装 =====

class AIAnalysisStrategy implements IWorkflowStrategy<AIInput, AIOutput> {
  readonly type = "AI_ANALYSIS";
  readonly displayName = "AI分析";
  readonly description = "AIを使用したテキスト分析";

  constructor(private readonly aiClient: AIClient) {}

  async execute(input: AIInput, context: ExecutionContext): Promise<AIOutput> {
    return await this.aiClient.analyze(input.text);
  }

  validate(input: AIInput): ValidationResult {
    // 検証ロジック
  }
}

class DataTransformStrategy implements IWorkflowStrategy<
  DataInput,
  DataOutput
> {
  readonly type = "DATA_TRANSFORM";
  readonly displayName = "データ変換";
  readonly description = "データ形式の変換";

  constructor(private readonly dataService: DataService) {}

  async execute(
    input: DataInput,
    context: ExecutionContext,
  ): Promise<DataOutput> {
    return await this.dataService.transform(input);
  }
}

// ===== セットアップ =====

// レジストリの作成
const registry = new StrategyRegistry<IWorkflowStrategy>();

// 戦略の登録（既存コード修正なし）
registry.register(new AIAnalysisStrategy(aiClient));
registry.register(new DataTransformStrategy(dataService));

// ミドルウェアチェーンの作成
const middlewareChain = new MiddlewareChain()
  .use(new LoggingMiddleware())
  .use(new ValidationMiddleware())
  .use(new MetricsMiddleware());

// エンジンの作成
const engine = new WorkflowEngine(registry, middlewareChain);

// イベントハンドラの登録
const emitter = new WorkflowEventEmitter();
emitter.on("beforeExecute", (data) => console.log("Starting:", data));
emitter.on("afterExecute", (data) => console.log("Completed:", data));
emitter.on("onError", (data) => alertService.notify(data.error));

// ===== 新しいタイプの追加（既存コード修正なし） =====

class NotificationStrategy implements IWorkflowStrategy {
  readonly type = "NOTIFICATION";
  readonly displayName = "通知";
  readonly description = "通知の送信";

  async execute(input, context) {
    // 通知ロジック
  }
}

registry.register(new NotificationStrategy());

// 新しいミドルウェアの追加（既存コード修正なし）
middlewareChain.use(new RateLimitMiddleware());
```

## チェックリスト

### 拡張ポイント設計

- [ ] インターフェースは安定しているか？
- [ ] register/use メソッドで新機能を追加できるか？
- [ ] 既存コードの修正なしに拡張できるか？

### 実装

- [ ] 各拡張ポイントは明確にドキュメント化されているか？
- [ ] 型安全性は確保されているか？
- [ ] エラーハンドリングは適切か？

### テスト

- [ ] 新しい戦略/ミドルウェアのテストは容易に書けるか？
- [ ] モックの作成は容易か？
- [ ] 拡張ポイントのテストがあるか？
