# Dependency Injection（依存性注入）

## 概要

依存性注入（DI）は、オブジェクトの依存関係を外部から注入するパターン。
疎結合な設計を実現し、テスト容易性と柔軟性を向上させる。

## 注入パターン

### 1. Constructor Injection（コンストラクタ注入）

依存関係をコンストラクタで受け取る。**推奨**

```
AuthenticationExecutor:
  constructor(
    private aiClient: AIClient,
    private userRepository: UserRepository,
    private logger: Logger
  )

  async execute(input: AuthInput, context: ExecutionContext): Promise<AuthOutput>
    this.logger.info('Starting authentication')
    user = await this.userRepository.findByEmail(input.email)
    # ...
```

**利点**:

- 依存関係が明示的
- 不変性の確保
- 必須依存の保証

**欠点**:

- 依存が多いとコンストラクタが長い
- 循環依存の検出が遅れることも

### 2. Setter Injection（セッター注入）

依存関係をsetterメソッドで設定する。

```
NotificationExecutor:
  private notificationService: NotificationService

  setNotificationService(service: NotificationService): void
    this.notificationService = service

  async execute(input: NotifyInput): Promise<NotifyOutput>
    if !this.notificationService:
      throw new DependencyNotSetError('notificationService')
    # ...
```

**利点**:

- オプショナルな依存に適切
- 後から依存を変更可能

**欠点**:

- 依存が設定されていない状態がありうる
- 不変性が損なわれる

### 3. Interface Injection（インターフェース注入）

依存関係を受け取るインターフェースを定義する。

```
interface ILoggerAware:
  setLogger(logger: Logger): void

AnalyticsExecutor implements ILoggerAware:
  private logger: Logger

  setLogger(logger: Logger): void
    this.logger = logger
```

**利点**:

- 依存注入の契約を明確化
- フレームワークによる自動注入

**欠点**:

- インターフェースの増加
- 実装の複雑化

## DIコンテナ

### 基本構造

```
Container:
  - services: Map<Token, ServiceFactory>
  - singletons: Map<Token, Service>

  # 登録
  register<T>(token: Token<T>, factory: () => T, options?: Options): void
    this.services.set(token, { factory, options })

  # 解決
  resolve<T>(token: Token<T>): T
    entry = this.services.get(token)
    if !entry:
      throw new ServiceNotFoundError(token)

    if entry.options?.singleton:
      if !this.singletons.has(token):
        this.singletons.set(token, entry.factory())
      return this.singletons.get(token)

    return entry.factory()
```

### トークンベースの登録

```
# トークン定義
const AI_CLIENT = Symbol('AIClient')
const USER_REPO = Symbol('UserRepository')
const LOGGER = Symbol('Logger')

# 登録
container.register(AI_CLIENT, () => new OpenAIClient(), { singleton: true })
container.register(USER_REPO, () => new UserRepository(container.resolve(DB)))
container.register(LOGGER, () => new StructuredLogger())

# 解決
aiClient = container.resolve(AI_CLIENT)
```

## ワークフローエンジンへの適用

### ExecutorFactory

```
ExecutorFactory:
  constructor(
    private container: Container,
    private registry: WorkflowRegistry
  )

  create(type: string): IWorkflowExecutor
    ExecutorClass = this.registry.get(type)
    if !ExecutorClass:
      throw new UnknownWorkflowTypeError(type)

    # 依存関係を解決して注入
    return new ExecutorClass(
      this.container.resolve(AI_CLIENT),
      this.container.resolve(WORKFLOW_REPO),
      this.container.resolve(LOGGER)
    )
```

### 設定例

```
# container.ts

export function configureContainer(): Container
  container = new Container()

  # Infrastructure
  container.register(DB, () => createDatabaseConnection(), { singleton: true })
  container.register(AI_CLIENT, () => new OpenAIClient(), { singleton: true })
  container.register(LOGGER, () => new StructuredLogger(), { singleton: true })

  # Repositories
  container.register(WORKFLOW_REPO, () =>
    new WorkflowRepository(container.resolve(DB))
  )
  container.register(USER_REPO, () =>
    new UserRepository(container.resolve(DB))
  )

  return container
```

## 循環依存の解決

### 問題

```
# 循環依存
ServiceA depends on ServiceB
ServiceB depends on ServiceA
```

### 解決策

1. **設計の見直し**: 共通の依存を抽出
2. **遅延解決**: Proxyパターンの使用
3. **インターフェース分離**: 依存を抽象化

```
# 遅延解決の例
LazyResolver<T>:
  constructor(private container: Container, private token: Token<T>)

  get(): T
    return this.container.resolve(this.token)

ServiceA:
  constructor(private serviceBResolver: LazyResolver<ServiceB>)

  doSomething():
    serviceB = this.serviceBResolver.get()
    # ...
```

## スコープ管理

### Singleton

アプリケーション全体で1つのインスタンス。

```
container.register(AI_CLIENT, () => new OpenAIClient(), {
  scope: 'singleton'
})
```

### Transient

毎回新しいインスタンスを生成。

```
container.register(REQUEST_HANDLER, () => new RequestHandler(), {
  scope: 'transient'
})
```

### Scoped

特定のスコープ内で1つのインスタンス。

```
container.register(DB_TRANSACTION, () => new Transaction(), {
  scope: 'scoped'
})

# リクエストスコープ
requestScope = container.createScope()
tx = requestScope.resolve(DB_TRANSACTION)
```

## 検証チェックリスト

- [ ] 依存関係は明示的に宣言されているか？
- [ ] Constructor Injectionが優先されているか？
- [ ] 循環依存は発生していないか？
- [ ] スコープは適切に設定されているか？
- [ ] テスト時のモック注入は容易か？

## 関連パターン

| パターン        | 関係                     |
| --------------- | ------------------------ |
| Factory         | 依存解決を伴う生成       |
| Service Locator | 依存の動的検索（代替案） |
| Strategy        | 依存の実行時切り替え     |
