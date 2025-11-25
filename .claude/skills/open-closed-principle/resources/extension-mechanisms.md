# 拡張メカニズム（Extension Mechanisms）

## 概要

OCPを実現するための具体的な拡張メカニズムを説明する。
適切なメカニズムの選択は、システムの要件と変動の性質に依存する。

## 拡張メカニズム一覧

| メカニズム | 目的 | 複雑さ | 使用場面 |
|-----------|------|--------|---------|
| ポリモーフィズム | 振る舞いの多様性 | 低 | 基本的な型の拡張 |
| Strategy | アルゴリズムの交換 | 低-中 | 処理ロジックの切り替え |
| Template Method | フレームワークの骨格 | 低-中 | 共通フローの定義 |
| Decorator | 機能の動的追加 | 中 | 横断的関心事 |
| Registry/Plugin | 動的な機能追加 | 中-高 | プラグインシステム |
| Event/Observer | 疎結合な通知 | 中 | イベント駆動拡張 |

## 1. ポリモーフィズム

### 基本構造

```
# インターフェースによる抽象化
interface IWorkflowExecutor:
  readonly type: string
  execute(input: Input, context: Context): Promise<Output>

# 具体的な実装
AIExecutor implements IWorkflowExecutor:
  readonly type = 'AI_ANALYSIS'
  execute(input, context):
    # AI固有の処理

DataExecutor implements IWorkflowExecutor:
  readonly type = 'DATA_TRANSFORM'
  execute(input, context):
    # データ処理固有の処理

# 新しいタイプの追加（既存コード修正なし）
NotificationExecutor implements IWorkflowExecutor:
  readonly type = 'NOTIFICATION'
  execute(input, context):
    # 通知固有の処理
```

### 使用場面

- 単純な型の拡張
- 振る舞いが明確に異なる場合
- コンパイル時にタイプが決定する場合

## 2. Strategy パターン

### 基本構造

```
# 戦略インターフェース
interface IRetryStrategy:
  shouldRetry(error: Error, attempt: number): boolean
  getDelay(attempt: number): number

# 具体的な戦略
ExponentialBackoff implements IRetryStrategy:
  shouldRetry(error, attempt):
    return attempt < this.maxAttempts && this.isRetryable(error)

  getDelay(attempt):
    return Math.min(1000 * Math.pow(2, attempt), 30000)

LinearBackoff implements IRetryStrategy:
  shouldRetry(error, attempt):
    return attempt < this.maxAttempts

  getDelay(attempt):
    return this.baseDelay * attempt

# コンテキスト（戦略を使用するクラス）
RetryableExecutor:
  constructor(private retryStrategy: IRetryStrategy):
    pass

  async execute(input, context):
    attempt = 0
    while (true):
      try:
        return await this.doExecute(input, context)
      catch (error):
        if (!this.retryStrategy.shouldRetry(error, attempt)):
          throw error
        await sleep(this.retryStrategy.getDelay(attempt))
        attempt++
```

### 使用場面

- アルゴリズムを実行時に切り替える
- 同じ操作に対して複数の実装がある
- 条件分岐を排除したい

## 3. Template Method パターン

### 基本構造

```
# 抽象クラスでテンプレートを定義
abstract class WorkflowExecutorTemplate:
  # Template Method（変更不可）
  async execute(input: Input, context: Context): Promise<Output>:
    this.validate(input)
    this.beforeExecute(context)

    result = await this.doExecute(input, context)  # 抽象メソッド

    this.afterExecute(result, context)
    return result

  # 抽象メソッド（サブクラスで実装）
  protected abstract doExecute(input: Input, context: Context): Promise<Output>

  # フックメソッド（オプションでオーバーライド）
  protected validate(input: Input): void:
    # デフォルト実装

  protected beforeExecute(context: Context): void:
    context.logger.info('Starting execution')

  protected afterExecute(result: Output, context: Context): void:
    context.logger.info('Execution completed')

# 具体的な実装
AIExecutor extends WorkflowExecutorTemplate:
  protected async doExecute(input, context):
    # AI固有の処理
    return await this.aiClient.analyze(input)

DataExecutor extends WorkflowExecutorTemplate:
  protected async doExecute(input, context):
    # データ処理固有の処理
    return await this.dataService.transform(input)

  # フックをオーバーライド
  protected validate(input):
    super.validate(input)
    this.validateSchema(input)
```

### 使用場面

- 共通の処理フローがある
- フレームワークの骨格を定義する
- 詳細な実装をサブクラスに委譲する

## 4. Decorator パターン

### 基本構造

```
# 基本インターフェース
interface IWorkflowExecutor:
  execute(input: Input, context: Context): Promise<Output>

# 具体的なコンポーネント
BasicExecutor implements IWorkflowExecutor:
  execute(input, context):
    return this.process(input)

# デコレータ基底クラス
abstract class ExecutorDecorator implements IWorkflowExecutor:
  constructor(protected wrapped: IWorkflowExecutor):
    pass

  abstract execute(input: Input, context: Context): Promise<Output>

# 具体的なデコレータ
LoggingDecorator extends ExecutorDecorator:
  execute(input, context):
    context.logger.info('Before execution', { input })
    result = await this.wrapped.execute(input, context)
    context.logger.info('After execution', { result })
    return result

RetryDecorator extends ExecutorDecorator:
  constructor(wrapped: IWorkflowExecutor, private maxRetries: number):
    super(wrapped)

  execute(input, context):
    attempt = 0
    while (true):
      try:
        return await this.wrapped.execute(input, context)
      catch (error):
        if (attempt++ >= this.maxRetries):
          throw error
        await sleep(1000 * attempt)

CachingDecorator extends ExecutorDecorator:
  private cache = new Map()

  execute(input, context):
    key = this.getCacheKey(input)
    if (this.cache.has(key)):
      return this.cache.get(key)
    result = await this.wrapped.execute(input, context)
    this.cache.set(key, result)
    return result

# 使用例（機能を組み合わせ）
executor = new CachingDecorator(
  new RetryDecorator(
    new LoggingDecorator(
      new BasicExecutor()
    ),
    3
  )
)
```

### 使用場面

- 機能を動的に追加する
- 横断的関心事（ロギング、キャッシング、リトライ）
- 継承を避けて機能を組み合わせる

## 5. Registry/Plugin パターン

### 基本構造

```
# レジストリ
ExecutorRegistry:
  private executors: Map<string, () => IWorkflowExecutor> = new Map()

  # 拡張ポイント: 新しいExecutorの登録
  register(type: string, factory: () => IWorkflowExecutor):
    this.executors.set(type, factory)

  create(type: string): IWorkflowExecutor:
    factory = this.executors.get(type)
    if (!factory):
      throw new UnknownTypeError(type)
    return factory()

  listTypes(): string[]:
    return Array.from(this.executors.keys())

# プラグインローダー
PluginLoader:
  constructor(private registry: ExecutorRegistry):
    pass

  # 拡張ポイント: プラグインの動的読み込み
  async loadPlugin(pluginPath: string):
    module = await import(pluginPath)
    plugin = module.default as IPlugin

    for (executor of plugin.executors):
      this.registry.register(executor.type, () => executor)

# プラグインインターフェース
interface IPlugin:
  readonly name: string
  readonly version: string
  readonly executors: IWorkflowExecutor[]

# 使用例
registry = new ExecutorRegistry()
loader = new PluginLoader(registry)

# ビルトインExecutorの登録
registry.register('AI_ANALYSIS', () => new AIExecutor(aiClient))
registry.register('DATA_TRANSFORM', () => new DataExecutor(dataService))

# プラグインからの追加（既存コード修正なし）
await loader.loadPlugin('./plugins/notification-plugin')
await loader.loadPlugin('./plugins/analytics-plugin')
```

### 使用場面

- 動的な機能追加
- サードパーティによる拡張
- 実行時のプラグイン読み込み

## 6. Event/Observer パターン

### 基本構造

```
# イベントエミッター
WorkflowEventEmitter:
  private listeners: Map<string, Set<EventListener>> = new Map()

  # 拡張ポイント: イベントリスナーの登録
  on(event: string, listener: EventListener):
    if (!this.listeners.has(event)):
      this.listeners.set(event, new Set())
    this.listeners.get(event).add(listener)

  off(event: string, listener: EventListener):
    this.listeners.get(event)?.delete(listener)

  emit(event: string, data: unknown):
    for (listener of this.listeners.get(event) || []):
      listener(data)

# ワークフローエンジンでの使用
WorkflowEngine:
  private emitter = new WorkflowEventEmitter()

  # 拡張ポイント: フックの登録
  onBeforeExecute(listener: EventListener):
    this.emitter.on('beforeExecute', listener)

  onAfterExecute(listener: EventListener):
    this.emitter.on('afterExecute', listener)

  onError(listener: EventListener):
    this.emitter.on('error', listener)

  async execute(workflow: Workflow):
    this.emitter.emit('beforeExecute', { workflow })
    try:
      result = await this.doExecute(workflow)
      this.emitter.emit('afterExecute', { workflow, result })
      return result
    catch (error):
      this.emitter.emit('error', { workflow, error })
      throw error

# 使用例（既存コード修正なし）
engine.onBeforeExecute(data => metrics.startTimer(data.workflow.id))
engine.onAfterExecute(data => metrics.endTimer(data.workflow.id))
engine.onError(data => alertService.notify(data.error))
```

### 使用場面

- 疎結合なイベント通知
- 監視・ロギング・メトリクス
- 複数のサブスクライバーがある

## メカニズム選択ガイド

| 要件 | 推奨メカニズム |
|------|---------------|
| 単純な型の拡張 | ポリモーフィズム |
| アルゴリズムの切り替え | Strategy |
| 共通フローの定義 | Template Method |
| 機能の動的追加 | Decorator |
| プラグインシステム | Registry/Plugin |
| 疎結合な通知 | Event/Observer |
| 複数の拡張ポイント | 組み合わせ |

## 検証チェックリスト

- [ ] 拡張メカニズムは要件に適しているか？
- [ ] 既存コードの修正なしに拡張できるか？
- [ ] 拡張方法は明確にドキュメント化されているか？
- [ ] 過度に複雑になっていないか？
- [ ] テストは容易に書けるか？
