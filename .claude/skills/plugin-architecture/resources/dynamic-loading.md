# Dynamic Loading（動的ロード）

## 概要

動的ロードは、プラグインを実行時に読み込む仕組み。
起動時のロード時間を短縮し、必要なプラグインのみを読み込むことで効率化を図る。

## ロード方式

### 1. Eager Loading（即時ロード）

アプリケーション起動時に全プラグインを読み込む。

```
EagerLoader:
  load(registry: Registry): void
    plugins = [
      new AuthenticationExecutor(),
      new NotificationExecutor(),
      new AnalyticsExecutor()
    ]
    for plugin in plugins:
      registry.register(plugin)
```

**利点**:
- 起動後の遅延なし
- 依存関係の早期検出
- シンプルな実装

**欠点**:
- 起動時間の増加
- 使わないプラグインも読み込み
- メモリ使用量の増加

### 2. Lazy Loading（遅延ロード）

プラグインが必要になった時点で読み込む。

```
LazyLoader:
  - factories: Map<string, () => Plugin>
  - loaded: Map<string, Plugin>

  register(key: string, factory: () => Plugin): void
    this.factories.set(key, factory)

  get(key: string): Plugin
    if !this.loaded.has(key):
      factory = this.factories.get(key)
      plugin = factory()
      this.loaded.set(key, plugin)
    return this.loaded.get(key)
```

**利点**:
- 起動時間の短縮
- メモリ効率の向上
- 使用するプラグインのみ読み込み

**欠点**:
- 初回アクセス時の遅延
- 依存関係の遅延検出
- 実装の複雑化

### 3. On-Demand Loading（オンデマンドロード）

明示的な要求時にのみ読み込む。

```
OnDemandLoader:
  async load(pluginPath: string): Promise<Plugin>
    module = await import(pluginPath)
    return module.default
```

**利点**:
- 最小限のリソース使用
- 外部プラグインのサポート
- 柔軟な構成

**欠点**:
- 非同期処理の複雑さ
- エラーハンドリングの難しさ
- パス管理の必要性

## 自動登録パターン

### ディレクトリスキャン

```
AutoLoader:
  async loadFromDirectory(directory: string, registry: Registry): Promise<void>
    files = await glob(`${directory}/**/*-executor.ts`)

    for file in files:
      try:
        module = await import(file)
        if this.isValidExecutor(module.default):
          registry.register(module.default)
          logger.info(`Loaded: ${file}`)
      catch error:
        logger.error(`Failed to load: ${file}`, error)

  isValidExecutor(obj: unknown): obj is IWorkflowExecutor
    return obj
      && typeof obj.type === 'string'
      && typeof obj.execute === 'function'
```

### 設定ファイルベース

```
ConfigBasedLoader:
  async load(configPath: string, registry: Registry): Promise<void>
    config = await loadConfig(configPath)

    for entry in config.plugins:
      if entry.enabled:
        module = await import(entry.path)
        registry.register(module.default)
```

## ワークフローエンジンへの適用

### プラグイン初期化フロー

```
initializeWorkflowEngine():
  registry = new WorkflowRegistry()

  # 1. 組み込みプラグインの登録（Eager）
  registerBuiltInExecutors(registry)

  # 2. ユーザープラグインの登録（Config-based）
  await loadUserPlugins(registry)

  # 3. 検証
  validateRegistry(registry)

  return createEngine(registry)
```

### 登録ファイルパターン

```
# features/registry.ts

import { WorkflowRegistry } from '@/shared/core'
import { AuthenticationExecutor } from './authentication/executor'
import { NotificationExecutor } from './notification/executor'
import { AnalyticsExecutor } from './analytics/executor'

export function registerAllExecutors(registry: WorkflowRegistry): void
  registry.register(new AuthenticationExecutor())
  registry.register(new NotificationExecutor())
  registry.register(new AnalyticsExecutor())

# 新機能追加時はここに1行追加するのみ
# registry.register(new NewFeatureExecutor())
```

## エラーハンドリング

### ロード失敗時の処理

```
SafeLoader:
  async load(path: string): Promise<Plugin | null>
    try:
      module = await import(path)
      return module.default
    catch error:
      if error.code === 'MODULE_NOT_FOUND':
        logger.warn(`Plugin not found: ${path}`)
        return null
      throw error
```

### 必須プラグインの検証

```
validateRequiredPlugins(registry: Registry, required: string[]): void
  missing = required.filter(key => !registry.has(key))
  if missing.length > 0:
    throw new MissingPluginsError(missing)
```

## パフォーマンス考慮

### ロード時間の測定

```
MeasuredLoader:
  async load(path: string): Promise<Plugin>
    start = performance.now()
    plugin = await import(path)
    duration = performance.now() - start
    metrics.recordLoadTime(path, duration)
    return plugin.default
```

### キャッシュ戦略

```
CachedLoader:
  - cache: Map<string, Plugin>

  async load(path: string): Promise<Plugin>
    if this.cache.has(path):
      return this.cache.get(path)

    plugin = await this.doLoad(path)
    this.cache.set(path, plugin)
    return plugin
```

## 検証チェックリスト

- [ ] ロード方式は用途に適しているか？
- [ ] エラーハンドリングは適切か？
- [ ] 必須プラグインの検証は行われているか？
- [ ] パフォーマンスへの影響は許容範囲か？
- [ ] ホットリロードは必要か？

## 関連パターン

| パターン | 関係 |
|---------|------|
| Registry | ロードしたプラグインの管理 |
| Factory | プラグインの生成 |
| Proxy | 遅延ロードの実装 |
