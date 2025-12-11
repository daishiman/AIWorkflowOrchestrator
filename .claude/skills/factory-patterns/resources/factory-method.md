# Factory Method パターン

## 概要

Factory Methodは、オブジェクトの生成をサブクラスに委譲する生成パターン。
スーパークラスでオブジェクト生成のインターフェースを定義し、
サブクラスで具体的なインスタンスを決定する。

## パターン構造

```
┌─────────────────────────────┐
│         Creator             │
├─────────────────────────────┤
│ + factoryMethod(): Product  │ ← 抽象メソッド
│ + operation(): void         │ ← factoryMethodを使用
└─────────────────────────────┘
              △
              │
    ┌─────────┴─────────┐
    │                   │
┌───┴───────────────┐ ┌─┴─────────────────┐
│ ConcreteCreatorA  │ │ ConcreteCreatorB  │
├───────────────────┤ ├───────────────────┤
│ + factoryMethod() │ │ + factoryMethod() │
│   returns         │ │   returns         │
│   ProductA        │ │   ProductB        │
└───────────────────┘ └───────────────────┘
```

## 基本実装

```
# Creator（抽象クラス）
abstract ExecutorCreator:
  # Factory Method（サブクラスで実装）
  abstract createExecutor(): IWorkflowExecutor

  # Template Method（Factory Methodを使用）
  executeWorkflow(input: Input, context: Context): Promise<Output>:
    executor = this.createExecutor()
    return executor.execute(input, context)

# Concrete Creator A
AIExecutorCreator extends ExecutorCreator:
  createExecutor(): IWorkflowExecutor:
    return new AIAnalysisExecutor(this.aiClient)

# Concrete Creator B
DataExecutorCreator extends ExecutorCreator:
  createExecutor(): IWorkflowExecutor:
    return new DataProcessingExecutor(this.dataService)

# 使用例
aiCreator = new AIExecutorCreator(aiClient)
result = await aiCreator.executeWorkflow(input, context)
```

## ワークフローエンジンへの適用

### パターン1: 型ベースのFactory Method

```
# 型情報に基づいてExecutorを生成
abstract WorkflowCreator:
  abstract createExecutor(type: string): IWorkflowExecutor

  processWorkflow(type: string, input: Input, context: Context):
    executor = this.createExecutor(type)
    validation = this.validate(executor, input)
    if (!validation.valid):
      throw new ValidationError(validation.errors)
    return executor.execute(input, context)

# AI処理用Creator
AIWorkflowCreator extends WorkflowCreator:
  constructor(private aiClient: AIClient):
    pass

  createExecutor(type: string): IWorkflowExecutor:
    switch (type):
      case 'SENTIMENT_ANALYSIS':
        return new SentimentAnalysisExecutor(this.aiClient)
      case 'TEXT_SUMMARIZATION':
        return new TextSummarizationExecutor(this.aiClient)
      case 'ENTITY_EXTRACTION':
        return new EntityExtractionExecutor(this.aiClient)
      default:
        throw new UnknownTypeError(type)

# データ処理用Creator
DataWorkflowCreator extends WorkflowCreator:
  constructor(private dataService: DataService):
    pass

  createExecutor(type: string): IWorkflowExecutor:
    switch (type):
      case 'CSV_IMPORT':
        return new CSVImportExecutor(this.dataService)
      case 'DATA_TRANSFORM':
        return new DataTransformExecutor(this.dataService)
      default:
        throw new UnknownTypeError(type)
```

### パターン2: パラメータ化Factory Method

```
# 設定に基づいてカスタマイズされたExecutorを生成
abstract ConfigurableCreator:
  abstract createExecutor(config: ExecutorConfig): IWorkflowExecutor

RetryableExecutorCreator extends ConfigurableCreator:
  createExecutor(config: ExecutorConfig): IWorkflowExecutor:
    baseExecutor = this.createBaseExecutor(config.type)

    if (config.retry?.enabled):
      return new RetryingExecutorDecorator(
        baseExecutor,
        config.retry.maxAttempts,
        config.retry.delay
      )

    return baseExecutor

  private createBaseExecutor(type: string): IWorkflowExecutor:
    # 基本Executorを生成
```

### パターン3: Template Method との組み合わせ

```
# Factory MethodとTemplate Methodの組み合わせ
abstract WorkflowProcessor:
  # Template Method
  async process(input: Input, context: Context): Promise<Output>:
    this.beforeProcess(input, context)

    executor = this.createExecutor()  # Factory Method
    result = await executor.execute(input, context)

    this.afterProcess(result, context)
    return result

  # Factory Method（サブクラスで実装）
  abstract createExecutor(): IWorkflowExecutor

  # Hook Methods（オプショナルでオーバーライド）
  beforeProcess(input: Input, context: Context): void:
    context.logger.info('Starting process')

  afterProcess(result: Output, context: Context): void:
    context.logger.info('Process completed')

# 具象クラス
NotificationProcessor extends WorkflowProcessor:
  createExecutor(): IWorkflowExecutor:
    return new NotificationExecutor(this.notificationService)

  afterProcess(result: Output, context: Context): void:
    super.afterProcess(result, context)
    this.metrics.recordNotification(result)
```

## 利点と適用場面

### 利点

| 利点                 | 説明                                   |
| -------------------- | -------------------------------------- |
| **生成と使用の分離** | オブジェクト生成のロジックを分離       |
| **拡張性**           | 新しい製品タイプの追加が容易           |
| **カプセル化**       | 具体的なクラスをクライアントから隠蔽   |
| **柔軟性**           | 実行時に生成するオブジェクトを決定可能 |

### 適用場面

| 場面                       | 説明                                       |
| -------------------------- | ------------------------------------------ |
| **クラスを事前に知らない** | 生成するオブジェクトのクラスが実行時に決定 |
| **サブクラスへの委譲**     | 生成処理をサブクラスでカスタマイズしたい   |
| **拡張ポイントの提供**     | フレームワークで拡張ポイントを提供したい   |
| **条件分岐の排除**         | 複雑なif-else/switch文を排除したい         |

## 実装のバリエーション

### バリエーション1: 静的Factory Method

```
# クラスメソッドとしてのFactory Method
ExecutorFactory:
  static createFromConfig(config: Config): IWorkflowExecutor:
    switch (config.type):
      case 'AI':
        return ExecutorFactory.createAIExecutor(config)
      case 'DATA':
        return ExecutorFactory.createDataExecutor(config)
      default:
        throw new UnknownTypeError(config.type)

  private static createAIExecutor(config: Config): IWorkflowExecutor:
    return new AIExecutor(config.aiOptions)

  private static createDataExecutor(config: Config): IWorkflowExecutor:
    return new DataExecutor(config.dataOptions)
```

### バリエーション2: 非同期Factory Method

```
# 非同期でExecutorを生成（依存関係の解決が必要な場合）
abstract AsyncExecutorCreator:
  abstract createExecutorAsync(): Promise<IWorkflowExecutor>

  async processWorkflow(input: Input, context: Context):
    executor = await this.createExecutorAsync()
    return executor.execute(input, context)

DatabaseExecutorCreator extends AsyncExecutorCreator:
  async createExecutorAsync(): Promise<IWorkflowExecutor>:
    connection = await this.connectionPool.acquire()
    return new DatabaseExecutor(connection)
```

## 検証チェックリスト

### 設計時

- [ ] 生成するオブジェクトの種類は複数あるか？
- [ ] 生成ロジックをカプセル化する必要があるか？
- [ ] サブクラスで生成をカスタマイズする必要があるか？

### 実装時

- [ ] Factory Methodの戻り値型は抽象型/インターフェースか？
- [ ] 具象クラスはFactory Method内でのみインスタンス化されているか？
- [ ] クライアントはFactory Methodの戻り値のみに依存しているか？

### レビュー時

- [ ] 新しいタイプの追加は既存コードの修正なしに可能か？
- [ ] 各Creatorは単一責任原則を守っているか？
- [ ] テストが容易に書けるか？

## 関連パターン

| パターン         | 関係                                             |
| ---------------- | ------------------------------------------------ |
| Abstract Factory | 複数の関連オブジェクトを生成する場合に使用       |
| Template Method  | Factory Methodと組み合わせて使用されることが多い |
| Prototype        | Factory Methodの代替として使用可能               |
| Singleton        | Factory Methodでシングルトンを返す場合がある     |
