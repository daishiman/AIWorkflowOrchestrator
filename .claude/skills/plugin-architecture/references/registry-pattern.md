# Registry Pattern（レジストリパターン）

## 概要

Registryパターンは、オブジェクトの登録と取得を一元管理するパターン。
グローバルなアクセスポイントを提供し、プラグインの動的管理を可能にする。

## パターン構造

```
┌─────────────────────────────────────┐
│             Registry                │
├─────────────────────────────────────┤
│ - plugins: Map<Key, Plugin>         │
├─────────────────────────────────────┤
│ + register(key, plugin): void       │
│ + get(key): Plugin | undefined      │
│ + has(key): boolean                 │
│ + list(): Key[]                     │
│ + unregister(key): boolean          │
└─────────────────────────────────────┘
              ▲
              │ uses
┌─────────────┴─────────────┐
│                           │
┌──────┴──────┐      ┌──────┴──────┐
│  Plugin A   │      │  Plugin B   │
└─────────────┘      └─────────────┘
```

## 基本実装

### シンプルなレジストリ

```
SimpleRegistry:
  - plugins: Map<string, Plugin> = new Map()

  register(key: string, plugin: Plugin): void
    if this.plugins.has(key):
      throw new DuplicateKeyError(key)
    this.plugins.set(key, plugin)

  get(key: string): Plugin | undefined
    return this.plugins.get(key)

  has(key: string): boolean
    return this.plugins.has(key)

  list(): string[]
    return Array.from(this.plugins.keys())

  unregister(key: string): boolean
    return this.plugins.delete(key)
```

### 型安全なレジストリ

```
TypeSafeRegistry<TKey extends string, TPlugin>:
  - plugins: Map<TKey, TPlugin> = new Map()

  register(key: TKey, plugin: TPlugin): void
    this.plugins.set(key, plugin)

  get(key: TKey): TPlugin | undefined
    return this.plugins.get(key)

  getOrThrow(key: TKey): TPlugin
    const plugin = this.get(key)
    if (!plugin):
      throw new PluginNotFoundError(key)
    return plugin
```

## ワークフローエンジンへの適用

### WorkflowRegistry

```
WorkflowRegistry:
  - executors: Map<string, IWorkflowExecutor>
  - initialized: boolean = false

  register(executor: IWorkflowExecutor): void
    key = executor.type
    if this.executors.has(key):
      logger.warn(`Overwriting executor: ${key}`)
    this.executors.set(key, executor)
    logger.info(`Registered executor: ${key}`)

  get(type: string): IWorkflowExecutor | undefined
    return this.executors.get(type)

  getOrThrow(type: string): IWorkflowExecutor
    executor = this.get(type)
    if (!executor):
      throw new UnknownWorkflowTypeError(type, this.listTypes())
    return executor

  has(type: string): boolean
    return this.executors.has(type)

  listTypes(): string[]
    return Array.from(this.executors.keys())

  listExecutors(): IWorkflowExecutor[]
    return Array.from(this.executors.values())

  clear(): void
    this.executors.clear()
    this.initialized = false
```

### 使用例

```
# 初期化
registry = new WorkflowRegistry()

# 登録
registry.register(new AuthenticationExecutor())
registry.register(new NotificationExecutor())
registry.register(new AnalyticsExecutor())

# 取得
executor = registry.getOrThrow('AUTHENTICATION')
result = await executor.execute(input, context)

# リスト
types = registry.listTypes()
# ['AUTHENTICATION', 'NOTIFICATION', 'ANALYTICS']
```

## 設計上の考慮事項

### 1. キーの一意性

**問題**: 同じキーで複数のプラグインを登録しようとした場合

**解決策**:

- 例外をスロー（厳格）
- 警告を出して上書き（緩和）
- 設定で制御可能に

### 2. スレッドセーフティ

**問題**: 並行アクセス時のレースコンディション

**解決策**:

- 不変性の確保（登録後は変更不可）
- ロック機構の導入
- Copy-on-Writeパターン

### 3. 遅延初期化

**問題**: 大量のプラグインの初期化コスト

**解決策**:

- プラグインファクトリの登録
- 実際の使用時にインスタンス化
- キャッシュ戦略

```
LazyRegistry:
  - factories: Map<string, () => Plugin>
  - instances: Map<string, Plugin>

  register(key: string, factory: () => Plugin): void
    this.factories.set(key, factory)

  get(key: string): Plugin | undefined
    if !this.instances.has(key):
      factory = this.factories.get(key)
      if factory:
        this.instances.set(key, factory())
    return this.instances.get(key)
```

## エラーハンドリング

### カスタムエラー

```
PluginNotFoundError:
  constructor(key: string, availableKeys: string[])
    message = `Plugin '${key}' not found. Available: ${availableKeys.join(', ')}`
    super(message)

DuplicateKeyError:
  constructor(key: string)
    message = `Plugin with key '${key}' is already registered`
    super(message)
```

### エラーハンドリング戦略

| 状況           | 戦略                   | 理由       |
| -------------- | ---------------------- | ---------- |
| 未登録キー取得 | undefinedまたは例外    | 用途による |
| 重複登録       | 警告＋上書きまたは例外 | 環境による |
| 初期化失敗     | 例外＋ロールバック     | 整合性確保 |

## 検証チェックリスト

- [ ] キーの一意性は保証されているか？
- [ ] 型安全性が確保されているか？
- [ ] エラーハンドリングは適切か？
- [ ] 未登録キーへのアクセスは処理されているか？
- [ ] リスト機能が提供されているか？
- [ ] クリア・リセット機能が必要か？

## 関連パターン

| パターン             | 関係                 |
| -------------------- | -------------------- |
| Singleton            | レジストリ自体の管理 |
| Factory              | プラグイン生成       |
| Service Locator      | サービス検索         |
| Dependency Injection | 依存解決             |
