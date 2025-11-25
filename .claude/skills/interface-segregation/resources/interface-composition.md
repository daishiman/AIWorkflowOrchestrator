# インターフェースの組み合わせ（Interface Composition）

## 概要

インターフェース分離後、適切に組み合わせて使用する方法を説明する。
分離されたインターフェースを効果的に利用することで、柔軟で拡張可能な設計を実現する。

## 組み合わせパターン

### パターン1: 直接実装（Direct Implementation）

```
# 必要なインターフェースを直接実装
AuthenticationExecutor implements
  IWorkflowExecutor<AuthInput, AuthOutput>,
  IValidatable<AuthInput>,
  IRetryable:

  # IWorkflowExecutor
  readonly type = 'AUTHENTICATION'
  readonly displayName = '認証'
  readonly description = '認証処理を実行'
  execute(input, context): Promise<AuthOutput> { ... }

  # IValidatable
  readonly inputSchema = authInputSchema
  readonly outputSchema = authOutputSchema
  validate(input): ValidationResult { ... }

  # IRetryable
  readonly maxRetries = 3
  canRetry(error): boolean { ... }
  getRetryDelay(attempt): number { ... }
```

### パターン2: ミックスイン（Mixin Pattern）

```
# 機能をミックスインとして提供
ValidationMixin:
  validate(input: TInput): ValidationResult:
    result = this.inputSchema.safeParse(input)
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.errors,
    }

RetryMixin:
  private retryCount = 0

  canRetry(error: Error): boolean:
    if (this.retryCount >= this.maxRetries):
      return false
    return this.isRetryableError(error)

  getRetryDelay(attempt: number): number:
    return Math.min(1000 * Math.pow(2, attempt), 30000)

# ミックスインを組み合わせた実装
ExecutorWithMixins extends applyMixins(BaseExecutor, [ValidationMixin, RetryMixin]):
  # ミックスインの機能を継承
```

### パターン3: デコレータ（Decorator Pattern）

```
# 基本Executor
BaseExecutor implements IWorkflowExecutor:
  execute(input, context): Promise<Output>:
    return this.process(input)

# 検証デコレータ
ValidatingDecorator implements IWorkflowExecutor:
  constructor(private wrapped: IWorkflowExecutor & IValidatable):
    pass

  execute(input, context): Promise<Output>:
    result = this.wrapped.validate(input)
    if (!result.valid):
      throw new ValidationError(result.errors)
    return this.wrapped.execute(input, context)

# リトライデコレータ
RetryingDecorator implements IWorkflowExecutor:
  constructor(private wrapped: IWorkflowExecutor & IRetryable):
    pass

  execute(input, context): Promise<Output>:
    attempt = 0
    while (true):
      try:
        return await this.wrapped.execute(input, context)
      catch (error):
        if (!this.wrapped.canRetry(error)):
          throw error
        attempt++
        await sleep(this.wrapped.getRetryDelay(attempt))

# デコレータの組み合わせ
executor = new RetryingDecorator(
  new ValidatingDecorator(
    new AuthenticationExecutor()
  )
)
```

### パターン4: コンポジション（Composition）

```
# 機能を委譲で組み合わせ
ComposedExecutor implements
  IWorkflowExecutor,
  IValidatable,
  IRetryable,
  IMetricsProvider:

  private validator: Validator
  private retryHandler: RetryHandler
  private metricsCollector: MetricsCollector

  constructor(
    validator: Validator,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ):
    this.validator = validator
    this.retryHandler = retryHandler
    this.metricsCollector = metricsCollector

  # IValidatable - 委譲
  validate(input): ValidationResult:
    return this.validator.validate(input)

  # IRetryable - 委譲
  canRetry(error): boolean:
    return this.retryHandler.canRetry(error)

  # IMetricsProvider - 委譲
  getMetrics(): ExecutorMetrics:
    return this.metricsCollector.getMetrics()

  # コア機能
  execute(input, context): Promise<Output>:
    this.metricsCollector.startExecution()
    try:
      result = await this.processWithRetry(input, context)
      this.metricsCollector.recordSuccess()
      return result
    catch (error):
      this.metricsCollector.recordFailure(error)
      throw error
```

## 型の組み合わせ

### ユニオン型とインターセクション型

```
# インターセクション型で複数インターフェースを要求
type ValidatableExecutor = IWorkflowExecutor & IValidatable
type RetryableExecutor = IWorkflowExecutor & IRetryable
type FullFeaturedExecutor = IWorkflowExecutor & IValidatable & IRetryable & IRollbackable

# 関数パラメータでの使用
function executeWithValidation(
  executor: IWorkflowExecutor & IValidatable,
  input: unknown
): Promise<Output>:
  validation = executor.validate(input)
  if (!validation.valid):
    throw new ValidationError(validation.errors)
  return executor.execute(input, context)
```

### 条件付き型

```
# 型ガードを使用した条件付き処理
function executeExecutor<T extends IWorkflowExecutor>(
  executor: T,
  input: unknown,
  context: ExecutionContext
): Promise<unknown>:

  # 検証機能がある場合
  if (isValidatable(executor)):
    validation = executor.validate(input)
    if (!validation.valid):
      throw new ValidationError(validation.errors)

  # 進捗レポート機能がある場合
  if (isProgressReporter(executor)):
    executor.onProgress({ phase: 'starting', percent: 0 })

  try:
    result = await executor.execute(input, context)

    if (isProgressReporter(executor)):
      executor.onProgress({ phase: 'completed', percent: 100 })

    return result
  catch (error):
    # リトライ機能がある場合
    if (isRetryable(executor) && executor.canRetry(error)):
      return retryExecution(executor, input, context)

    # ロールバック機能がある場合
    if (isRollbackable(executor)):
      await executor.rollback(context)

    throw error
```

## ファクトリパターンとの組み合わせ

```
# インターフェースの組み合わせに応じたファクトリ
ExecutorFactory:
  createSimple(type: string): IWorkflowExecutor:
    return new SimpleExecutor(type)

  createValidating(type: string, schema: ZodSchema): IWorkflowExecutor & IValidatable:
    return new ValidatingExecutor(type, schema)

  createRetryable(type: string, config: RetryConfig): IWorkflowExecutor & IRetryable:
    return new RetryableExecutor(type, config)

  createFullFeatured(
    type: string,
    schema: ZodSchema,
    retryConfig: RetryConfig,
    lifecycleHooks: LifecycleHooks
  ): FullFeaturedExecutor:
    return new FullFeaturedExecutorImpl(type, schema, retryConfig, lifecycleHooks)
```

## 組み合わせの指針

### 推奨される組み合わせ

| ユースケース | 推奨組み合わせ |
|-------------|---------------|
| **単純処理** | IWorkflowExecutor のみ |
| **外部API連携** | IWorkflowExecutor + IRetryable |
| **ユーザー入力処理** | IWorkflowExecutor + IValidatable |
| **トランザクション処理** | IWorkflowExecutor + IValidatable + IRollbackable |
| **長時間処理** | IWorkflowExecutor + IProgressReporter |
| **バッチ処理** | IWorkflowExecutor + ISchedulable + ILifecycleAware |
| **監視対象処理** | IWorkflowExecutor + IMetricsProvider |

### 避けるべき組み合わせ

| 組み合わせ | 問題 |
|-----------|------|
| IRollbackable + ISchedulable | スケジュール実行中のロールバックは複雑 |
| IProgressReporter のみ | 進捗レポートだけでは意味がない |
| すべてのインターフェース | 本当に必要か検討すべき |

## チェックリスト

### 組み合わせ設計

- [ ] 組み合わせるインターフェースは互いに補完関係にあるか？
- [ ] 過剰な組み合わせになっていないか？
- [ ] 各インターフェースの責任が明確か？

### 実装

- [ ] 組み合わせ方法は適切か（直接/ミックスイン/デコレータ/コンポジション）？
- [ ] 型安全性が保たれているか？
- [ ] 型ガードが適切に提供されているか？

### テスト

- [ ] 各インターフェースが独立してテスト可能か？
- [ ] 組み合わせた状態でのテストが可能か？
- [ ] モックが容易に作成できるか？

## 関連ドキュメント

- `isp-principles.md`: ISP原則の詳細
- `role-interface-design.md`: 役割ベースインターフェース設計
- `fat-interface-detection.md`: 肥大化インターフェースの検出
