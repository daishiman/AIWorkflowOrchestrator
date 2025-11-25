# Builder パターン

## 概要

Builderは、複雑なオブジェクトを段階的に構築する生成パターン。
同じ構築プロセスで異なる表現を生成でき、
オブジェクトの構築をその表現から分離する。

## パターン構造

```
┌─────────────────────────────────┐
│           Director              │
├─────────────────────────────────┤
│ - builder: Builder              │
│ + construct(): void             │
└─────────────────────────────────┘
              │
              ▼ uses
┌─────────────────────────────────┐
│           Builder               │
├─────────────────────────────────┤
│ + buildPartA(): Builder         │
│ + buildPartB(): Builder         │
│ + buildPartC(): Builder         │
│ + getResult(): Product          │
└─────────────────────────────────┘
              △
              │
    ┌─────────┴─────────┐
    │                   │
┌───┴───────────────┐ ┌─┴─────────────────┐
│ ConcreteBuilderA  │ │ ConcreteBuilderB  │
├───────────────────┤ ├───────────────────┤
│ + buildPartA()    │ │ + buildPartA()    │
│ + buildPartB()    │ │ + buildPartB()    │
│ + getResult()     │ │ + getResult()     │
│   → ProductA      │ │   → ProductB      │
└───────────────────┘ └───────────────────┘
```

## 基本実装

```
# Builder インターフェース
interface ExecutorBuilder<T extends IWorkflowExecutor>:
  withType(type: string): this
  withDisplayName(name: string): this
  withDescription(description: string): this
  withInputSchema(schema: ZodSchema): this
  withOutputSchema(schema: ZodSchema): this
  build(): T

# Concrete Builder
GenericExecutorBuilder implements ExecutorBuilder<GenericExecutor>:
  private type: string
  private displayName: string
  private description: string
  private inputSchema: ZodSchema
  private outputSchema: ZodSchema

  withType(type: string): this:
    this.type = type
    return this

  withDisplayName(name: string): this:
    this.displayName = name
    return this

  withDescription(description: string): this:
    this.description = description
    return this

  withInputSchema(schema: ZodSchema): this:
    this.inputSchema = schema
    return this

  withOutputSchema(schema: ZodSchema): this:
    this.outputSchema = schema
    return this

  build(): GenericExecutor:
    this.validate()
    return new GenericExecutor(
      this.type,
      this.displayName,
      this.description,
      this.inputSchema,
      this.outputSchema,
    )

  private validate(): void:
    if (!this.type):
      throw new BuilderError('type is required')
    if (!this.displayName):
      throw new BuilderError('displayName is required')
```

## ワークフローエンジンへの適用

### パターン1: フル機能Executorビルダー

```
# 多機能なExecutorを段階的に構築
ExecutorBuilder:
  private type: string
  private displayName: string
  private description: string
  private inputSchema?: ZodSchema
  private outputSchema?: ZodSchema
  private retryConfig?: RetryConfig
  private rollbackHandler?: RollbackHandler
  private progressCallback?: ProgressCallback
  private lifecycleHooks?: LifecycleHooks
  private dependencies: Map<string, unknown> = new Map()

  # 基本設定
  withType(type: string): this:
    this.type = type
    return this

  withDisplayName(name: string): this:
    this.displayName = name
    return this

  withDescription(description: string): this:
    this.description = description
    return this

  # スキーマ設定
  withInputSchema(schema: ZodSchema): this:
    this.inputSchema = schema
    return this

  withOutputSchema(schema: ZodSchema): this:
    this.outputSchema = schema
    return this

  # リトライ設定
  withRetry(config: RetryConfig): this:
    this.retryConfig = config
    return this

  withRetry(maxRetries: number, delay: number): this:
    this.retryConfig = { maxRetries, delay }
    return this

  # ロールバック設定
  withRollback(handler: RollbackHandler): this:
    this.rollbackHandler = handler
    return this

  # 進捗レポート設定
  withProgress(callback: ProgressCallback): this:
    this.progressCallback = callback
    return this

  # ライフサイクル設定
  withLifecycle(hooks: LifecycleHooks): this:
    this.lifecycleHooks = hooks
    return this

  # 依存関係設定
  withDependency<T>(key: string, value: T): this:
    this.dependencies.set(key, value)
    return this

  # 構築
  build(): IWorkflowExecutor:
    this.validateRequired()

    executor = new ConfigurableExecutor(
      this.type,
      this.displayName,
      this.description,
    )

    if (this.inputSchema):
      executor.setInputSchema(this.inputSchema)
    if (this.outputSchema):
      executor.setOutputSchema(this.outputSchema)
    if (this.retryConfig):
      executor.enableRetry(this.retryConfig)
    if (this.rollbackHandler):
      executor.enableRollback(this.rollbackHandler)
    if (this.progressCallback):
      executor.enableProgress(this.progressCallback)
    if (this.lifecycleHooks):
      executor.setLifecycleHooks(this.lifecycleHooks)

    for ([key, value] of this.dependencies):
      executor.injectDependency(key, value)

    return executor

# 使用例
executor = new ExecutorBuilder()
  .withType('AI_ANALYSIS')
  .withDisplayName('AI分析')
  .withDescription('AIを使用したテキスト分析')
  .withInputSchema(inputSchema)
  .withOutputSchema(outputSchema)
  .withRetry(3, 1000)
  .withProgress(progress => console.log(`${progress.percent}%`))
  .withDependency('aiClient', aiClient)
  .build()
```

### パターン2: Directorの使用

```
# Directorで共通の構築パターンを定義
ExecutorDirector:
  constructor(private builder: ExecutorBuilder):
    pass

  # 基本的なExecutor
  buildSimpleExecutor(type: string, name: string): IWorkflowExecutor:
    return this.builder
      .withType(type)
      .withDisplayName(name)
      .withDescription(`${name}を実行します`)
      .build()

  # 検証付きExecutor
  buildValidatingExecutor(
    type: string,
    name: string,
    inputSchema: ZodSchema,
    outputSchema: ZodSchema,
  ): IWorkflowExecutor:
    return this.builder
      .withType(type)
      .withDisplayName(name)
      .withDescription(`${name}を実行します（入力検証付き）`)
      .withInputSchema(inputSchema)
      .withOutputSchema(outputSchema)
      .build()

  # リトライ付きExecutor
  buildRetryableExecutor(
    type: string,
    name: string,
    maxRetries: number = 3,
  ): IWorkflowExecutor:
    return this.builder
      .withType(type)
      .withDisplayName(name)
      .withDescription(`${name}を実行します（リトライ付き）`)
      .withRetry(maxRetries, 1000)
      .build()

  # フル機能Executor
  buildFullFeaturedExecutor(config: FullConfig): IWorkflowExecutor:
    return this.builder
      .withType(config.type)
      .withDisplayName(config.name)
      .withDescription(config.description)
      .withInputSchema(config.inputSchema)
      .withOutputSchema(config.outputSchema)
      .withRetry(config.retryConfig)
      .withRollback(config.rollbackHandler)
      .withProgress(config.progressCallback)
      .withLifecycle(config.lifecycleHooks)
      .build()

# 使用例
director = new ExecutorDirector(new ExecutorBuilder())
simpleExecutor = director.buildSimpleExecutor('SIMPLE', 'シンプル処理')
validatingExecutor = director.buildValidatingExecutor(
  'VALIDATING',
  '検証付き処理',
  inputSchema,
  outputSchema,
)
```

### パターン3: Fluent Builder with Validation

```
# 検証付きFluent Builder
ValidatingExecutorBuilder:
  private config: Partial<ExecutorConfig> = {}
  private errors: string[] = []

  withType(type: string): this:
    if (!type || type.length === 0):
      this.errors.push('type is required and cannot be empty')
    this.config.type = type
    return this

  withDisplayName(name: string): this:
    if (!name || name.length === 0):
      this.errors.push('displayName is required and cannot be empty')
    if (name && name.length > 100):
      this.errors.push('displayName must be 100 characters or less')
    this.config.displayName = name
    return this

  withRetry(maxRetries: number, delay: number): this:
    if (maxRetries < 0):
      this.errors.push('maxRetries must be non-negative')
    if (delay < 0):
      this.errors.push('delay must be non-negative')
    this.config.retryConfig = { maxRetries, delay }
    return this

  # 検証メソッド
  validate(): ValidationResult:
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
    }

  # 検証して構築（エラーがあれば例外）
  build(): IWorkflowExecutor:
    result = this.validate()
    if (!result.valid):
      throw new BuilderValidationError(result.errors)

    return this.createExecutor()

  # 検証して構築（Resultを返す）
  tryBuild(): Result<IWorkflowExecutor, string[]>:
    result = this.validate()
    if (!result.valid):
      return Result.err(result.errors)

    return Result.ok(this.createExecutor())

  private createExecutor(): IWorkflowExecutor:
    # 実際の構築ロジック
```

## Step Builderパターン

```
# 必須ステップを強制するStep Builder
interface TypeStep:
  withType(type: string): DisplayNameStep

interface DisplayNameStep:
  withDisplayName(name: string): DescriptionStep

interface DescriptionStep:
  withDescription(description: string): OptionalStep

interface OptionalStep:
  withRetry(config: RetryConfig): OptionalStep
  withRollback(handler: RollbackHandler): OptionalStep
  build(): IWorkflowExecutor

# 実装
StepExecutorBuilder implements TypeStep, DisplayNameStep, DescriptionStep, OptionalStep:
  private config: ExecutorConfig = {}

  # TypeStep
  withType(type: string): DisplayNameStep:
    this.config.type = type
    return this

  # DisplayNameStep
  withDisplayName(name: string): DescriptionStep:
    this.config.displayName = name
    return this

  # DescriptionStep
  withDescription(description: string): OptionalStep:
    this.config.description = description
    return this

  # OptionalStep
  withRetry(config: RetryConfig): OptionalStep:
    this.config.retryConfig = config
    return this

  withRollback(handler: RollbackHandler): OptionalStep:
    this.config.rollbackHandler = handler
    return this

  build(): IWorkflowExecutor:
    return new ConfigurableExecutor(this.config)

# 使用例（コンパイル時に順序が強制される）
executor = new StepExecutorBuilder()
  .withType('AI_ANALYSIS')      # 必須: 最初
  .withDisplayName('AI分析')     # 必須: 2番目
  .withDescription('AI分析処理') # 必須: 3番目
  .withRetry({ maxRetries: 3 }) # オプション
  .build()

# コンパイルエラー: withDisplayNameの前にwithRetryは呼べない
# executor = new StepExecutorBuilder()
#   .withType('AI_ANALYSIS')
#   .withRetry({ maxRetries: 3 })  # エラー!
```

## 利点と適用場面

### 利点

| 利点 | 説明 |
|------|------|
| **段階的構築** | 複雑なオブジェクトを段階的に構築可能 |
| **可読性** | Fluent interfaceで読みやすいコード |
| **柔軟性** | オプショナルなパラメータを自由に設定 |
| **不変性** | イミュータブルなオブジェクトの構築に最適 |
| **検証** | 構築前に検証が可能 |

### 適用場面

| 場面 | 説明 |
|------|------|
| **多くのパラメータ** | コンストラクタのパラメータが多い |
| **オプショナルパラメータ** | 多くのオプショナルパラメータがある |
| **不変オブジェクト** | イミュータブルなオブジェクトを構築 |
| **複雑な構築** | 構築ロジックが複雑 |
| **設定オブジェクト** | 設定やコンフィグの構築 |

## 検証チェックリスト

### 設計時

- [ ] コンストラクタのパラメータは4つ以上か？
- [ ] オプショナルなパラメータが多いか？
- [ ] 構築ステップの順序が重要か？

### 実装時

- [ ] メソッドチェーンが可能か（thisを返す）？
- [ ] 必須パラメータの検証があるか？
- [ ] build()で完全なオブジェクトが生成されるか？

### レビュー時

- [ ] Builderの使用方法は明確か？
- [ ] 不正な状態のオブジェクトは生成されないか？
- [ ] Directorパターンで共通構築を抽出できるか？

## 関連パターン

| パターン | 関係 |
|---------|------|
| Abstract Factory | 複雑なオブジェクトの構築に使用 |
| Composite | 複合オブジェクトの構築に使用 |
| Factory Method | Builderの生成に使用することがある |
| Prototype | 構築の代替手段 |
