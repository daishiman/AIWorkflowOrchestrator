# Plugin Lifecycle（プラグインライフサイクル）

## 概要

プラグインライフサイクルは、プラグインの状態遷移を管理する仕組み。
初期化、実行、破棄を適切に制御し、リソースの効率的な管理を実現する。

## ライフサイクルフェーズ

```
┌──────────┐    load()    ┌──────────┐
│ UNLOADED │─────────────▶│  LOADED  │
└──────────┘              └────┬─────┘
     ▲                         │
     │                   initialize()
     │                         │
     │                         ▼
     │                  ┌──────────────┐
     │                  │ INITIALIZED  │
     │                  └──────┬───────┘
     │                         │
     │                    activate()
     │                         │
     │                         ▼
     │                    ┌────────┐
     │    unload()        │ ACTIVE │
     │◀───────────────────┤        │
     │                    └───┬────┘
     │                        │
     │                  deactivate()
     │                        │
     │                        ▼
     │                   ┌─────────┐
     └───────────────────┤ STOPPED │
                         └─────────┘
```

## ライフサイクルインターフェース

```
IPluginLifecycle:
  # ロード時に呼ばれる（設定の読み込み等）
  onLoad?(): Promise<void>

  # 初期化時に呼ばれる（依存関係の解決等）
  onInitialize?(): Promise<void>

  # 有効化時に呼ばれる（リソースの確保等）
  onActivate?(): Promise<void>

  # 無効化時に呼ばれる（リソースの解放等）
  onDeactivate?(): Promise<void>

  # アンロード時に呼ばれる（クリーンアップ等）
  onUnload?(): Promise<void>
```

## ライフサイクルマネージャー

```
PluginLifecycleManager:
  - plugins: Map<string, PluginState>

  async load(plugin: IPlugin): Promise<void>
    if plugin.onLoad:
      await plugin.onLoad()
    this.plugins.set(plugin.id, {
      plugin,
      status: 'LOADED'
    })

  async initialize(pluginId: string): Promise<void>
    state = this.plugins.get(pluginId)
    if state.status !== 'LOADED':
      throw new InvalidStateTransitionError()

    if state.plugin.onInitialize:
      await state.plugin.onInitialize()
    state.status = 'INITIALIZED'

  async activate(pluginId: string): Promise<void>
    state = this.plugins.get(pluginId)
    if state.status !== 'INITIALIZED':
      throw new InvalidStateTransitionError()

    if state.plugin.onActivate:
      await state.plugin.onActivate()
    state.status = 'ACTIVE'

  async deactivate(pluginId: string): Promise<void>
    state = this.plugins.get(pluginId)
    if state.status !== 'ACTIVE':
      throw new InvalidStateTransitionError()

    if state.plugin.onDeactivate:
      await state.plugin.onDeactivate()
    state.status = 'STOPPED'

  async unload(pluginId: string): Promise<void>
    state = this.plugins.get(pluginId)
    if state.status === 'ACTIVE':
      await this.deactivate(pluginId)

    if state.plugin.onUnload:
      await state.plugin.onUnload()
    this.plugins.delete(pluginId)
```

## ワークフローエンジンへの適用

### ExecutorLifecycle

```
IExecutorLifecycle:
  # 初期化時（DIコンテナからの依存解決後）
  onInitialize?(context: InitContext): Promise<void>

  # シャットダウン時（リソース解放）
  onShutdown?(): Promise<void>
```

### 実装例

```
DatabaseExecutor implements IWorkflowExecutor, IExecutorLifecycle:
  private connection: DatabaseConnection

  async onInitialize(context: InitContext): Promise<void>
    # データベース接続を確立
    this.connection = await context.db.connect()
    logger.info('Database connection established')

  async execute(input: Input, context: ExecutionContext): Promise<Output>
    # 実行ロジック
    return await this.connection.query(...)

  async onShutdown(): Promise<void>
    # 接続を閉じる
    await this.connection.close()
    logger.info('Database connection closed')
```

### エンジンのライフサイクル管理

```
WorkflowEngine:
  private executors: Map<string, IWorkflowExecutor>

  async startup(): Promise<void>
    for executor of this.executors.values():
      if this.hasLifecycle(executor):
        await executor.onInitialize(this.context)

  async shutdown(): Promise<void>
    for executor of this.executors.values():
      if this.hasLifecycle(executor):
        await executor.onShutdown()

  private hasLifecycle(executor: IWorkflowExecutor): executor is IExecutorLifecycle
    return 'onInitialize' in executor || 'onShutdown' in executor
```

## エラーハンドリング

### 初期化失敗時の処理

```
SafeLifecycleManager:
  async initializeAll(plugins: IPlugin[]): Promise<InitResult>
    successful: IPlugin[] = []
    failed: { plugin: IPlugin, error: Error }[] = []

    for plugin of plugins:
      try:
        await this.initialize(plugin)
        successful.push(plugin)
      catch error:
        failed.push({ plugin, error })
        # 失敗したプラグインはロールバック
        await this.safeUnload(plugin)

    return { successful, failed }

  async safeUnload(plugin: IPlugin): Promise<void>
    try:
      await this.unload(plugin)
    catch error:
      logger.error('Failed to unload plugin', { plugin: plugin.id, error })
```

### グレースフルシャットダウン

```
GracefulShutdown:
  async shutdown(manager: LifecycleManager, timeout: number): Promise<void>
    plugins = manager.getActivePlugins()

    # タイムアウト付きでシャットダウン
    await Promise.race([
      this.shutdownAll(manager, plugins),
      this.timeout(timeout)
    ])

  private async shutdownAll(manager: LifecycleManager, plugins: IPlugin[]): Promise<void>
    await Promise.allSettled(
      plugins.map(p => manager.deactivate(p.id))
    )

  private timeout(ms: number): Promise<never>
    return new Promise((_, reject) =>
      setTimeout(() => reject(new TimeoutError()), ms)
    )
```

## 状態遷移の検証

```
LifecycleValidator:
  VALID_TRANSITIONS = {
    'UNLOADED': ['LOADED'],
    'LOADED': ['INITIALIZED', 'UNLOADED'],
    'INITIALIZED': ['ACTIVE', 'STOPPED'],
    'ACTIVE': ['STOPPED'],
    'STOPPED': ['UNLOADED', 'ACTIVE']  # 再アクティブ化も可能
  }

  canTransition(from: Status, to: Status): boolean
    return this.VALID_TRANSITIONS[from]?.includes(to) ?? false

  validateTransition(from: Status, to: Status): void
    if !this.canTransition(from, to):
      throw new InvalidStateTransitionError(from, to)
```

## 検証チェックリスト

- [ ] ライフサイクルフェーズは明確に定義されているか？
- [ ] 状態遷移は検証されているか？
- [ ] リソースのクリーンアップは適切か？
- [ ] エラー時のロールバックは実装されているか？
- [ ] グレースフルシャットダウンはサポートされているか？

## 関連パターン

| パターン | 関係 |
|---------|------|
| State | 状態遷移の管理 |
| Template Method | ライフサイクルフックの定義 |
| Observer | 状態変化の通知 |
