# Registry Factory パターン

## 概要

Registry Factoryは、型情報（通常は文字列キー）に基づいて
オブジェクトを動的に生成するパターン。
Factory MethodとRegistryパターンを組み合わせたもので、
プラグインシステムや拡張可能なアーキテクチャで広く使用される。

## パターン構造

```
┌────────────────────────────────────────┐
│          RegistryFactory<T>            │
├────────────────────────────────────────┤
│ - registry: Map<string, () => T>       │
├────────────────────────────────────────┤
│ + register(key, factory): void         │
│ + create(key): T                       │
│ + has(key): boolean                    │
│ + list(): string[]                     │
│ + unregister(key): void                │
└────────────────────────────────────────┘
              △
              │ uses
    ┌─────────┴─────────┐
    │                   │
┌───┴───┐           ┌───┴───┐
│Client1│           │Client2│
└───────┘           └───────┘
```

## 基本実装

```
# 型安全なRegistry Factory
RegistryFactory<T>:
  private registry: Map<string, () => T> = new Map()

  # ファクトリ関数を登録
  register(key: string, factory: () => T): void:
    if (this.registry.has(key)):
      throw new DuplicateKeyError(key)
    this.registry.set(key, factory)

  # キーに基づいてオブジェクトを生成
  create(key: string): T:
    factory = this.registry.get(key)
    if (!factory):
      throw new UnknownKeyError(key, this.list())
    return factory()

  # 登録されているか確認
  has(key: string): boolean:
    return this.registry.has(key)

  # 登録されているキーの一覧
  list(): string[]:
    return Array.from(this.registry.keys())

  # 登録解除
  unregister(key: string): boolean:
    return this.registry.delete(key)

  # 登録数
  get size(): number:
    return this.registry.size
```

## ワークフローエンジンへの適用

### パターン1: ExecutorRegistry

```
# ワークフロータイプに基づいてExecutorを生成
ExecutorRegistry:
  private factories: Map<string, ExecutorFactory> = new Map()

  # ファクトリを登録
  register(type: string, factory: ExecutorFactory): void:
    if (this.factories.has(type)):
      console.warn(`Overwriting executor for type: ${type}`)
    this.factories.set(type, factory)

  # Executorを生成
  create(type: string, config?: ExecutorConfig): IWorkflowExecutor:
    factory = this.factories.get(type)
    if (!factory):
      throw new UnknownWorkflowTypeError(
        type,
        this.listTypes()
      )
    return factory.create(config)

  # 型が登録されているか確認
  hasType(type: string): boolean:
    return this.factories.has(type)

  # 登録されている型の一覧
  listTypes(): string[]:
    return Array.from(this.factories.keys())

  # Executorの情報を取得
  getExecutorInfo(): ExecutorInfo[]:
    return Array.from(this.factories.entries()).map(([type, factory]) => ({
      type,
      displayName: factory.getDisplayName(),
      description: factory.getDescription(),
    }))

# ファクトリインターフェース
interface ExecutorFactory:
  create(config?: ExecutorConfig): IWorkflowExecutor
  getDisplayName(): string
  getDescription(): string

# 具体的なファクトリ
AIAnalysisExecutorFactory implements ExecutorFactory:
  constructor(private aiClient: AIClient):
    pass

  create(config?: ExecutorConfig): IWorkflowExecutor:
    return new AIAnalysisExecutor(this.aiClient, config)

  getDisplayName(): string:
    return 'AI分析'

  getDescription(): string:
    return 'AIを使用してテキストを分析します'

# 登録
registry = new ExecutorRegistry()
registry.register('AI_ANALYSIS', new AIAnalysisExecutorFactory(aiClient))
registry.register('DATA_TRANSFORM', new DataTransformExecutorFactory(dataService))

# 使用
executor = registry.create('AI_ANALYSIS', { model: 'gpt-4' })
```

### パターン2: 依存注入との統合

```
# DIコンテナと統合したRegistry Factory
DIAwareExecutorRegistry:
  private types: Map<string, {
    executorClass: Constructor<IWorkflowExecutor>,
    dependencies: symbol[],
  }> = new Map()

  constructor(private container: Container):
    pass

  # クラスと依存関係を登録
  register<T extends IWorkflowExecutor>(
    type: string,
    executorClass: Constructor<T>,
    dependencies: symbol[],
  ): void:
    this.types.set(type, { executorClass, dependencies })

  # 依存関係を解決してExecutorを生成
  create(type: string): IWorkflowExecutor:
    entry = this.types.get(type)
    if (!entry):
      throw new UnknownTypeError(type)

    # 依存関係を解決
    deps = entry.dependencies.map(token => this.container.resolve(token))

    # Executorをインスタンス化
    return new entry.executorClass(...deps)

# 登録
registry = new DIAwareExecutorRegistry(container)
registry.register(
  'AI_ANALYSIS',
  AIAnalysisExecutor,
  [AI_CLIENT, LOGGER, METRICS]
)
registry.register(
  'AUTHENTICATION',
  AuthenticationExecutor,
  [AUTH_SERVICE, USER_REPO]
)

# 使用（依存関係は自動解決）
executor = registry.create('AI_ANALYSIS')
```

### パターン3: 設定ベースの登録

```
# 設定ファイルからの動的登録
ConfigurableExecutorRegistry:
  private registry: ExecutorRegistry = new ExecutorRegistry()

  constructor(private container: Container):
    pass

  # 設定から一括登録
  loadFromConfig(config: RegistryConfig): void:
    for (entry of config.executors):
      factory = this.createFactory(entry)
      this.registry.register(entry.type, factory)

  private createFactory(entry: ExecutorEntry): ExecutorFactory:
    return {
      create: (config) => this.instantiate(entry, config),
      getDisplayName: () => entry.displayName,
      getDescription: () => entry.description,
    }

  private instantiate(entry: ExecutorEntry, config?: ExecutorConfig):
    ExecutorClass = this.resolveClass(entry.className)
    deps = entry.dependencies.map(d => this.container.resolve(d))
    return new ExecutorClass(...deps, config)

  private resolveClass(className: string): Constructor<IWorkflowExecutor>:
    # クラス名から実際のクラスを解決
    return classRegistry.get(className)

# 設定ファイル例（YAML）
# executors:
#   - type: AI_ANALYSIS
#     className: AIAnalysisExecutor
#     displayName: AI分析
#     description: AIを使用したテキスト分析
#     dependencies:
#       - AI_CLIENT
#       - LOGGER
#   - type: DATA_TRANSFORM
#     className: DataTransformExecutor
#     displayName: データ変換
#     description: データの変換処理
#     dependencies:
#       - DATA_SERVICE
```

### パターン4: 遅延登録（Lazy Registration）

```
# 必要になるまでファクトリをインスタンス化しない
LazyExecutorRegistry:
  private registrations: Map<string, LazyRegistration> = new Map()
  private instances: Map<string, ExecutorFactory> = new Map()

  # 遅延登録
  registerLazy(
    type: string,
    factoryLoader: () => Promise<ExecutorFactory>,
  ): void:
    this.registrations.set(type, {
      loader: factoryLoader,
      loaded: false,
    })

  # 必要時にロード
  async create(type: string, config?: ExecutorConfig): Promise<IWorkflowExecutor>:
    factory = await this.getFactory(type)
    return factory.create(config)

  private async getFactory(type: string): Promise<ExecutorFactory>:
    # キャッシュをチェック
    if (this.instances.has(type)):
      return this.instances.get(type)!

    # 登録をチェック
    registration = this.registrations.get(type)
    if (!registration):
      throw new UnknownTypeError(type)

    # ロード
    factory = await registration.loader()
    this.instances.set(type, factory)
    registration.loaded = true

    return factory

# 使用例（動的インポートとの組み合わせ）
registry = new LazyExecutorRegistry()

registry.registerLazy('AI_ANALYSIS', async () => {
  module = await import('./executors/ai-analysis')
  return new module.AIAnalysisExecutorFactory(aiClient)
})

registry.registerLazy('HEAVY_PROCESSING', async () => {
  module = await import('./executors/heavy-processing')
  return new module.HeavyProcessingExecutorFactory()
})

# 必要になるまでロードされない
executor = await registry.create('AI_ANALYSIS')
```

## 登録パターン

### 自動登録（デコレータ使用）

```
# デコレータでの自動登録
@RegisterExecutor('AI_ANALYSIS')
class AIAnalysisExecutor implements IWorkflowExecutor:
  # ...

# デコレータ実装
function RegisterExecutor(type: string):
  return function (target: Constructor<IWorkflowExecutor>):
    globalRegistry.register(type, () => new target())
    return target
```

### モジュール登録

```
# モジュールごとに登録関数を定義
# ai-module/index.ts
export function registerAIExecutors(registry: ExecutorRegistry, deps: Dependencies):
  registry.register('AI_ANALYSIS', new AIAnalysisFactory(deps.aiClient))
  registry.register('AI_SUMMARIZATION', new AISummarizationFactory(deps.aiClient))
  registry.register('AI_TRANSLATION', new AITranslationFactory(deps.aiClient))

# data-module/index.ts
export function registerDataExecutors(registry: ExecutorRegistry, deps: Dependencies):
  registry.register('DATA_TRANSFORM', new DataTransformFactory(deps.dataService))
  registry.register('DATA_VALIDATION', new DataValidationFactory(deps.dataService))

# アプリケーション起動時
registry = new ExecutorRegistry()
registerAIExecutors(registry, dependencies)
registerDataExecutors(registry, dependencies)
```

## 利点と適用場面

### 利点

| 利点 | 説明 |
|------|------|
| **動的生成** | 実行時に型に基づいてオブジェクトを生成 |
| **拡張性** | 新しい型の追加が容易 |
| **分離** | 生成ロジックとビジネスロジックの分離 |
| **プラグイン対応** | プラグインシステムの基盤として最適 |

### 適用場面

| 場面 | 説明 |
|------|------|
| **プラグインシステム** | 動的にプラグインを登録・生成 |
| **設定ベース生成** | 設定ファイルに基づくオブジェクト生成 |
| **タイプセレクタ** | UIでのタイプ選択に基づく生成 |
| **拡張可能アーキテクチャ** | サードパーティによる拡張をサポート |

## 検証チェックリスト

### 設計時

- [ ] 実行時に型を決定する必要があるか？
- [ ] 新しい型の追加が頻繁に行われるか？
- [ ] プラグインやモジュールによる拡張が必要か？

### 実装時

- [ ] 重複登録の処理は適切か？
- [ ] 未登録キーのエラー処理は適切か？
- [ ] 型安全性は確保されているか？

### レビュー時

- [ ] 登録されている型のリストは取得可能か？
- [ ] 依存関係の解決は適切か？
- [ ] テストでモックに置き換え可能か？

## 関連パターン

| パターン | 関係 |
|---------|------|
| Factory Method | 各キーに対応するファクトリメソッドを提供 |
| Singleton | Registryはシングルトンとして実装されることが多い |
| Service Locator | 類似のパターン（ただしSLはアンチパターンとされることも） |
| Dependency Injection | DIコンテナとの統合で使用 |
