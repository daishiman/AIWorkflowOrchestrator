# Service Locator（サービスロケーター）

## 概要

Service Locatorは、サービスの動的な検索と取得を提供するパターン。
DIコンテナの代替として使用されることがあるが、依存関係が隠蔽されるため
アンチパターンとされることも多い。

**注意**: 可能な限りDependency Injectionを優先し、
Service Locatorは限定的な場面でのみ使用すること。

## パターン構造

```
┌─────────────────────────────┐
│      Service Locator        │
├─────────────────────────────┤
│ - services: Map<Token, Svc> │
├─────────────────────────────┤
│ + register(token, service)  │
│ + locate(token): Service    │
│ + isRegistered(token): bool │
└─────────────────────────────┘
              ▲
              │ uses
    ┌─────────┴─────────┐
    │                   │
┌───┴───┐          ┌────┴────┐
│Client1│          │ Client2 │
└───────┘          └─────────┘
```

## 基本実装

```
ServiceLocator:
  private static instance: ServiceLocator
  private services: Map<symbol, unknown> = new Map()

  # シングルトンアクセス
  static getInstance(): ServiceLocator
    if !ServiceLocator.instance:
      ServiceLocator.instance = new ServiceLocator()
    return ServiceLocator.instance

  # サービス登録
  register<T>(token: symbol, service: T): void
    this.services.set(token, service)

  # サービス取得
  locate<T>(token: symbol): T
    service = this.services.get(token)
    if !service:
      throw new ServiceNotFoundError(token)
    return service as T

  # 存在確認
  isRegistered(token: symbol): boolean
    return this.services.has(token)
```

## 使用例

```
# トークン定義
const LOGGER = Symbol('Logger')
const AI_CLIENT = Symbol('AIClient')

# 登録
locator = ServiceLocator.getInstance()
locator.register(LOGGER, new StructuredLogger())
locator.register(AI_CLIENT, new OpenAIClient())

# 使用（クライアント側）
class SomeExecutor:
  execute():
    logger = ServiceLocator.getInstance().locate<Logger>(LOGGER)
    logger.info('Executing...')
```

## DIとの比較

| 観点 | Service Locator | Dependency Injection |
|------|-----------------|---------------------|
| 依存の明示性 | 隠蔽される | 明示的 |
| テスト容易性 | 困難 | 容易 |
| 結合度 | 高い（Locatorに依存） | 低い |
| コードの追跡 | 困難 | 容易 |
| 推奨度 | 限定的 | 推奨 |

## 使用すべき場面

### 適切な使用場面

1. **レガシーコードとの統合**
   - DIを導入できない既存システム
   - 段階的なリファクタリング

2. **フレームワーク内部**
   - ユーザーに見えない内部実装
   - プラグインシステムの基盤

3. **動的なサービス解決**
   - 実行時に決定されるサービス
   - 設定ベースのサービス切り替え

### 避けるべき場面

1. **通常のアプリケーションコード**
   - DIを使用すべき

2. **テストが重要なコード**
   - モックの注入が困難

3. **依存関係が明確であるべきコード**
   - 依存が隠蔽される

## ワークフローエンジンでの限定的使用

### 推奨: DIベースの設計

```
# 推奨: Constructor Injection
AuthenticationExecutor:
  constructor(
    private aiClient: AIClient,
    private logger: Logger
  )

  execute(input: Input): Promise<Output>
    this.logger.info('Starting authentication')
    # ...
```

### 限定的使用: フレームワーク内部

```
# 限定的使用: プラグインローダー内部
PluginLoader:
  private locator: ServiceLocator

  loadPlugin(path: string): IPlugin
    module = import(path)
    plugin = module.default

    # プラグインが必要とするサービスを注入
    if this.needsLogger(plugin):
      plugin.setLogger(this.locator.locate(LOGGER))

    return plugin
```

## ベストプラクティス

### 1. スコープの限定

```
# 悪い例: グローバルなService Locator
class SomeClass:
  doSomething():
    service = GlobalLocator.locate(SERVICE)

# 良い例: スコープ限定のLocator
class SomeClass:
  constructor(private locator: ServiceLocator) {}

  doSomething():
    service = this.locator.locate(SERVICE)
```

### 2. 型安全性の確保

```
# 型安全なService Locator
TypeSafeLocator:
  locate<T>(token: Token<T>): T
    service = this.services.get(token)
    if !service:
      throw new ServiceNotFoundError(token)
    return service
```

### 3. テスト時の置換

```
# テスト用モック
TestServiceLocator extends ServiceLocator:
  static setupForTest():
    locator = new TestServiceLocator()
    locator.register(LOGGER, new MockLogger())
    locator.register(AI_CLIENT, new MockAIClient())
    return locator
```

## 検証チェックリスト

- [ ] DIで代替できないか検討したか？
- [ ] 使用範囲は限定されているか？
- [ ] 型安全性は確保されているか？
- [ ] テスト時の置換方法は用意されているか？
- [ ] 依存関係が追跡可能か？

## 関連パターン

| パターン | 関係 |
|---------|------|
| Dependency Injection | 推奨される代替 |
| Registry | サービス管理の類似パターン |
| Factory | サービス生成との組み合わせ |
| Singleton | Locator自体の管理 |
