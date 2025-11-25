# OCP準拠パターン（OCP-Compliant Patterns）

## 概要

OCP（開放閉鎖原則）に準拠した設計パターンとその適用方法を説明する。
これらのパターンを適切に組み合わせることで、拡張性の高いシステムを構築できる。

## パターン一覧

| パターン | 目的 | OCP貢献 |
|---------|------|---------|
| Strategy | 振る舞いの交換 | アルゴリズムを拡張ポイント化 |
| Template Method | フレームワーク骨格 | 変動部分を拡張ポイント化 |
| Factory Method | オブジェクト生成 | 生成を拡張ポイント化 |
| Abstract Factory | ファミリー生成 | 製品ファミリーを拡張ポイント化 |
| Decorator | 機能追加 | 横断的機能を拡張ポイント化 |
| Chain of Responsibility | 処理チェーン | ハンドラを拡張ポイント化 |
| Command | 操作のカプセル化 | 操作を拡張ポイント化 |

## ワークフローエンジンでの適用

### 1. Strategy + Registry

```
# ワークフロータイプごとの戦略
interface IWorkflowStrategy:
  readonly type: string
  canHandle(workflow: Workflow): boolean
  execute(workflow: Workflow, context: Context): Promise<Result>

# 戦略レジストリ
StrategyRegistry:
  private strategies: Map<string, IWorkflowStrategy> = new Map()

  # 拡張ポイント
  register(strategy: IWorkflowStrategy):
    this.strategies.set(strategy.type, strategy)

  findStrategy(workflow: Workflow): IWorkflowStrategy:
    strategy = this.strategies.get(workflow.type)
    if (!strategy):
      throw new UnknownTypeError(workflow.type)
    return strategy

# ワークフローエンジン（OCPに準拠：修正不要）
WorkflowEngine:
  constructor(private registry: StrategyRegistry):
    pass

  async execute(workflow: Workflow, context: Context): Promise<Result>:
    strategy = this.registry.findStrategy(workflow)
    return strategy.execute(workflow, context)

# 新しい戦略の追加（既存コード修正なし）
AIStrategy implements IWorkflowStrategy:
  readonly type = 'AI_ANALYSIS'
  canHandle(workflow): return workflow.type === 'AI_ANALYSIS'
  execute(workflow, context): # AI処理

registry.register(new AIStrategy())
registry.register(new DataStrategy())
registry.register(new NotificationStrategy())  # 新規追加
```

### 2. Template Method + Hook

```
# テンプレートを定義（OCPに準拠：修正不要）
abstract class ExecutorTemplate:
  async execute(input: Input, context: Context): Promise<Output>:
    # 前処理
    await this.beforeExecute(input, context)
    validatedInput = this.validate(input)

    # 主処理（サブクラスで実装）
    result = await this.doExecute(validatedInput, context)

    # 後処理
    await this.afterExecute(result, context)
    return result

  # 抽象メソッド（サブクラスで実装必須）
  protected abstract doExecute(input: Input, context: Context): Promise<Output>

  # フックメソッド（オプションでオーバーライド）
  protected async beforeExecute(input: Input, context: Context): Promise<void>:
    context.logger.info('Starting execution')

  protected validate(input: Input): Input:
    return input  # デフォルトは検証なし

  protected async afterExecute(result: Output, context: Context): Promise<void>:
    context.logger.info('Execution completed')

# 具体的な実装（既存コード修正なし）
AIExecutor extends ExecutorTemplate:
  protected async doExecute(input, context):
    return await this.aiClient.analyze(input)

  protected validate(input):
    result = this.inputSchema.safeParse(input)
    if (!result.success):
      throw new ValidationError(result.error)
    return result.data

DataExecutor extends ExecutorTemplate:
  protected async doExecute(input, context):
    return await this.dataService.transform(input)

  protected async afterExecute(result, context):
    await super.afterExecute(result, context)
    await this.metricsService.record(result)
```

### 3. Chain of Responsibility

```
# ミドルウェアチェーン
interface IMiddleware:
  execute(input: Input, context: Context, next: NextFunction): Promise<Output>

type NextFunction = (input: Input, context: Context) => Promise<Output>

# ミドルウェアチェーン（OCPに準拠：修正不要）
MiddlewareChain:
  private middlewares: IMiddleware[] = []

  # 拡張ポイント
  use(middleware: IMiddleware):
    this.middlewares.push(middleware)

  async execute(input: Input, context: Context, finalHandler: NextFunction): Promise<Output>:
    chain = this.middlewares.reduceRight(
      (next, middleware) => (inp, ctx) => middleware.execute(inp, ctx, next),
      finalHandler
    )
    return chain(input, context)

# ミドルウェア（既存コード修正なし）
LoggingMiddleware implements IMiddleware:
  async execute(input, context, next):
    context.logger.info('Before', { input })
    result = await next(input, context)
    context.logger.info('After', { result })
    return result

ValidationMiddleware implements IMiddleware:
  async execute(input, context, next):
    this.validate(input)
    return next(input, context)

AuthenticationMiddleware implements IMiddleware:
  async execute(input, context, next):
    if (!this.isAuthenticated(context)):
      throw new AuthenticationError()
    return next(input, context)

# 使用
chain = new MiddlewareChain()
chain.use(new LoggingMiddleware())
chain.use(new ValidationMiddleware())
chain.use(new AuthenticationMiddleware())
chain.use(new RateLimitMiddleware())  # 新規追加
```

### 4. Factory + Registry

```
# ファクトリインターフェース
interface IExecutorFactory:
  readonly type: string
  create(config?: Config): IWorkflowExecutor

# ファクトリレジストリ（OCPに準拠：修正不要）
ExecutorFactoryRegistry:
  private factories: Map<string, IExecutorFactory> = new Map()

  # 拡張ポイント
  register(factory: IExecutorFactory):
    this.factories.set(factory.type, factory)

  create(type: string, config?: Config): IWorkflowExecutor:
    factory = this.factories.get(type)
    if (!factory):
      throw new UnknownTypeError(type)
    return factory.create(config)

# 具体的なファクトリ（既存コード修正なし）
AIExecutorFactory implements IExecutorFactory:
  readonly type = 'AI_ANALYSIS'

  constructor(private aiClient: AIClient):
    pass

  create(config?: Config): IWorkflowExecutor:
    return new AIExecutor(this.aiClient, config)

DataExecutorFactory implements IExecutorFactory:
  readonly type = 'DATA_TRANSFORM'

  constructor(private dataService: DataService):
    pass

  create(config?: Config): IWorkflowExecutor:
    return new DataExecutor(this.dataService, config)

# 登録
registry = new ExecutorFactoryRegistry()
registry.register(new AIExecutorFactory(aiClient))
registry.register(new DataExecutorFactory(dataService))
registry.register(new NotificationExecutorFactory(notificationService))  # 新規追加
```

### 5. Command + Invoker

```
# コマンドインターフェース
interface IWorkflowCommand:
  readonly name: string
  execute(context: Context): Promise<Result>
  undo?(context: Context): Promise<void>

# コマンドインボーカー（OCPに準拠：修正不要）
WorkflowInvoker:
  private history: IWorkflowCommand[] = []

  async execute(command: IWorkflowCommand, context: Context): Promise<Result>:
    result = await command.execute(context)
    this.history.push(command)
    return result

  async undo(context: Context): Promise<void>:
    command = this.history.pop()
    if (command?.undo):
      await command.undo(context)

# 具体的なコマンド（既存コード修正なし）
CreateWorkflowCommand implements IWorkflowCommand:
  readonly name = 'CREATE_WORKFLOW'

  constructor(private workflow: Workflow, private repository: WorkflowRepository):
    pass

  async execute(context):
    return await this.repository.create(this.workflow)

  async undo(context):
    await this.repository.delete(this.workflow.id)

ExecuteWorkflowCommand implements IWorkflowCommand:
  readonly name = 'EXECUTE_WORKFLOW'

  constructor(private workflowId: string, private engine: WorkflowEngine):
    pass

  async execute(context):
    return await this.engine.execute(this.workflowId, context)
```

### 6. Decorator + Builder

```
# デコレータ（OCPに準拠：修正不要）
abstract class ExecutorDecorator implements IWorkflowExecutor:
  constructor(protected wrapped: IWorkflowExecutor):
    this.type = wrapped.type
    this.displayName = wrapped.displayName
    this.description = wrapped.description

  readonly type: string
  readonly displayName: string
  readonly description: string

  abstract execute(input: Input, context: Context): Promise<Output>

# 具体的なデコレータ（既存コード修正なし）
RetryDecorator extends ExecutorDecorator:
  constructor(wrapped: IWorkflowExecutor, private maxRetries: number):
    super(wrapped)

  async execute(input, context):
    # リトライロジック

CachingDecorator extends ExecutorDecorator:
  async execute(input, context):
    # キャッシングロジック

MetricsDecorator extends ExecutorDecorator:
  async execute(input, context):
    # メトリクス収集ロジック

# ビルダーでデコレータを組み合わせ
ExecutorBuilder:
  private executor: IWorkflowExecutor

  constructor(baseExecutor: IWorkflowExecutor):
    this.executor = baseExecutor

  withRetry(maxRetries: number): this:
    this.executor = new RetryDecorator(this.executor, maxRetries)
    return this

  withCaching(): this:
    this.executor = new CachingDecorator(this.executor)
    return this

  withMetrics(): this:
    this.executor = new MetricsDecorator(this.executor)
    return this

  build(): IWorkflowExecutor:
    return this.executor

# 使用
executor = new ExecutorBuilder(new AIExecutor(aiClient))
  .withRetry(3)
  .withCaching()
  .withMetrics()
  .build()
```

## パターンの組み合わせ

```
# 推奨される組み合わせ

# 1. Strategy + Template Method
#    - 戦略ごとに共通フローを持つ場合

# 2. Factory + Registry
#    - 動的なオブジェクト生成と登録

# 3. Chain of Responsibility + Decorator
#    - 横断的関心事の処理

# 4. Command + Strategy
#    - 操作のカプセル化と多様性

# 5. Observer + Command
#    - イベント駆動のコマンド実行
```

## 検証チェックリスト

### パターン選択

- [ ] 変動する部分に適切なパターンを選択したか？
- [ ] パターンの組み合わせは適切か？
- [ ] 過度に複雑になっていないか？

### 実装

- [ ] 拡張ポイントは明確か？
- [ ] 既存コードの修正なしに拡張できるか？
- [ ] インターフェースは安定しているか？

### テスト

- [ ] 各パターンのテストが書けるか？
- [ ] モックの作成は容易か？
- [ ] 新しい実装のテストは容易か？
