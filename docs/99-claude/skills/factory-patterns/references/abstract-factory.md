# Abstract Factory パターン

## 概要

Abstract Factoryは、関連するオブジェクトのファミリーを一貫して生成する生成パターン。
具体的なクラスを指定せずに、関連する製品オブジェクトのファミリーを生成する
インターフェースを提供する。

## パターン構造

```
┌──────────────────────────────────┐
│       AbstractFactory            │
├──────────────────────────────────┤
│ + createProductA(): ProductA     │
│ + createProductB(): ProductB     │
└──────────────────────────────────┘
              △
              │
    ┌─────────┴─────────┐
    │                   │
┌───┴──────────────┐ ┌──┴─────────────┐
│ ConcreteFactory1 │ │ConcreteFactory2│
├──────────────────┤ ├────────────────┤
│ createProductA() │ │createProductA()│
│   → ProductA1    │ │  → ProductA2   │
│ createProductB() │ │createProductB()│
│   → ProductB1    │ │  → ProductB2   │
└──────────────────┘ └────────────────┘
```

## 基本実装

```
# Abstract Factory
interface WorkflowComponentFactory:
  createExecutor(): IWorkflowExecutor
  createValidator(): IValidator
  createLogger(): ILogger
  createMetricsCollector(): IMetricsCollector

# Concrete Factory 1: 本番環境用
ProductionFactory implements WorkflowComponentFactory:
  createExecutor(): IWorkflowExecutor:
    return new ProductionExecutor(this.config)

  createValidator(): IValidator:
    return new StrictValidator()

  createLogger(): ILogger:
    return new StructuredLogger(this.logConfig)

  createMetricsCollector(): IMetricsCollector:
    return new DatadogMetricsCollector(this.metricsConfig)

# Concrete Factory 2: テスト環境用
TestFactory implements WorkflowComponentFactory:
  createExecutor(): IWorkflowExecutor:
    return new MockExecutor()

  createValidator(): IValidator:
    return new LenientValidator()

  createLogger(): ILogger:
    return new ConsoleLogger()

  createMetricsCollector(): IMetricsCollector:
    return new InMemoryMetricsCollector()
```

## ワークフローエンジンへの適用

### パターン1: 環境ベースのファクトリ

```
# 環境に応じたコンポーネントファミリーを生成
interface ExecutorSuiteFactory:
  createCoreExecutor(): IWorkflowExecutor
  createRetryHandler(): IRetryHandler
  createRollbackHandler(): IRollbackHandler
  createProgressReporter(): IProgressReporter

# クラウド環境用
CloudExecutorSuiteFactory implements ExecutorSuiteFactory:
  constructor(
    private cloudConfig: CloudConfig,
    private awsCredentials: AWSCredentials,
  ):
    pass

  createCoreExecutor():
    return new LambdaExecutor(this.cloudConfig, this.awsCredentials)

  createRetryHandler():
    return new ExponentialBackoffRetryHandler(maxRetries: 5)

  createRollbackHandler():
    return new S3RollbackHandler(this.awsCredentials)

  createProgressReporter():
    return new CloudWatchProgressReporter(this.awsCredentials)

# ローカル環境用
LocalExecutorSuiteFactory implements ExecutorSuiteFactory:
  createCoreExecutor():
    return new LocalProcessExecutor()

  createRetryHandler():
    return new SimpleRetryHandler(maxRetries: 3)

  createRollbackHandler():
    return new FileSystemRollbackHandler('./backup')

  createProgressReporter():
    return new ConsoleProgressReporter()
```

### パターン2: ワークフロータイプベースのファクトリ

```
# ワークフロータイプに応じたコンポーネントを生成
interface WorkflowTypeFactory:
  createExecutor(): IWorkflowExecutor
  createInputSchema(): ZodSchema
  createOutputSchema(): ZodSchema
  createDefaultConfig(): WorkflowConfig

# AI処理ワークフロー用
AIWorkflowFactory implements WorkflowTypeFactory:
  constructor(private aiClient: AIClient):
    pass

  createExecutor():
    return new AIAnalysisExecutor(this.aiClient)

  createInputSchema():
    return z.object({
      content: z.string().min(1),
      model: z.enum(['gpt-4', 'claude-3']).optional(),
      temperature: z.number().min(0).max(2).optional(),
    })

  createOutputSchema():
    return z.object({
      result: z.string(),
      confidence: z.number(),
      tokenUsage: z.number(),
    })

  createDefaultConfig():
    return {
      timeout: 60000,
      maxRetries: 3,
      model: 'gpt-4',
    }

# データ処理ワークフロー用
DataWorkflowFactory implements WorkflowTypeFactory:
  constructor(private dataService: DataService):
    pass

  createExecutor():
    return new DataTransformExecutor(this.dataService)

  createInputSchema():
    return z.object({
      source: z.string(),
      transformations: z.array(transformationSchema),
      output: outputConfigSchema,
    })

  createOutputSchema():
    return z.object({
      recordsProcessed: z.number(),
      outputPath: z.string(),
      duration: z.number(),
    })

  createDefaultConfig():
    return {
      timeout: 300000,
      batchSize: 1000,
    }
```

### パターン3: プラグインファクトリ

```
# プラグインシステムでのAbstract Factory
interface PluginComponentFactory:
  createExecutor(): IWorkflowExecutor
  createUI(): IPluginUI
  createSettings(): IPluginSettings
  createHooks(): IPluginHooks

# 認証プラグイン
AuthenticationPluginFactory implements PluginComponentFactory:
  createExecutor():
    return new AuthenticationExecutor(this.authService)

  createUI():
    return new AuthenticationUI()

  createSettings():
    return new AuthenticationSettings()

  createHooks():
    return new AuthenticationHooks()

# 通知プラグイン
NotificationPluginFactory implements PluginComponentFactory:
  createExecutor():
    return new NotificationExecutor(this.notificationService)

  createUI():
    return new NotificationUI()

  createSettings():
    return new NotificationSettings()

  createHooks():
    return new NotificationHooks()
```

## ファクトリの選択

### ファクトリセレクター

```
# 条件に基づいてファクトリを選択
FactorySelector:
  private factories: Map<string, WorkflowComponentFactory>

  constructor():
    this.factories = new Map()
    this.factories.set('production', new ProductionFactory())
    this.factories.set('staging', new StagingFactory())
    this.factories.set('development', new DevelopmentFactory())
    this.factories.set('test', new TestFactory())

  getFactory(environment: string): WorkflowComponentFactory:
    factory = this.factories.get(environment)
    if (!factory):
      throw new UnknownEnvironmentError(environment)
    return factory

# 使用例
selector = new FactorySelector()
factory = selector.getFactory(process.env.NODE_ENV)

executor = factory.createExecutor()
logger = factory.createLogger()
metrics = factory.createMetricsCollector()
```

### 依存注入との組み合わせ

```
# DIコンテナでファクトリを管理
Container:
  registerFactory(env: string, factory: WorkflowComponentFactory):
    this.register(WORKFLOW_FACTORY, factory, { env })

  getFactory(env: string): WorkflowComponentFactory:
    return this.resolve(WORKFLOW_FACTORY, { env })

# 登録
container.registerFactory('production', new ProductionFactory(prodConfig))
container.registerFactory('test', new TestFactory())

# 使用
factory = container.getFactory(currentEnv)
executor = factory.createExecutor()
```

## 利点と適用場面

### 利点

| 利点               | 説明                                             |
| ------------------ | ------------------------------------------------ |
| **一貫性保証**     | 関連オブジェクトが常に一貫したファミリーから生成 |
| **製品の切り替え** | ファクトリを切り替えるだけで製品ファミリーを変更 |
| **分離**           | 具体的なクラスをクライアントから分離             |
| **テスト容易性**   | テスト用ファクトリに置き換えてテスト             |

### 適用場面

| 場面                             | 説明                                       |
| -------------------------------- | ------------------------------------------ |
| **関連オブジェクトのファミリー** | 複数の関連オブジェクトを一緒に使用する     |
| **環境の切り替え**               | 本番/テスト/開発環境で異なるコンポーネント |
| **プラットフォーム対応**         | 複数プラットフォームで異なる実装           |
| **製品バリエーション**           | 製品のバリエーションを管理                 |

## 検証チェックリスト

### 設計時

- [ ] 関連するオブジェクトのファミリーが存在するか？
- [ ] ファミリー間で一貫性が必要か？
- [ ] 製品ファミリーの切り替えが必要か？

### 実装時

- [ ] すべての製品がAbstract Productを実装しているか？
- [ ] ファクトリは一貫したファミリーを生成しているか？
- [ ] クライアントはAbstract Factoryのみに依存しているか？

### レビュー時

- [ ] 新しい製品ファミリーの追加は容易か？
- [ ] 新しい製品タイプの追加は容易か？（注：これは難しい場合がある）
- [ ] テストでモックファクトリに置き換え可能か？

## 関連パターン

| パターン       | 関係                                                         |
| -------------- | ------------------------------------------------------------ |
| Factory Method | Abstract FactoryはFactory Methodを使って実装されることが多い |
| Singleton      | ファクトリはシングルトンとして実装されることがある           |
| Prototype      | 具体的な製品をプロトタイプから生成する場合がある             |
| Builder        | 複雑な製品の構築に使用される                                 |
