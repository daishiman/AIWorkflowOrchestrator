# 役割ベースインターフェース設計（Role Interface Design）

## 概要

役割ベースインターフェース設計は、クライアントの役割（Role）に基づいてインターフェースを分離する手法。
ISPを実践する上で最も効果的なアプローチの一つ。

## 基本概念

### 役割インターフェースとは

```
# 従来のヘッダーインターフェース
IWorkflowService:
  + createWorkflow(): Workflow
  + executeWorkflow(): Result
  + getStatus(): Status
  + validateWorkflow(): ValidationResult
  + rollbackWorkflow(): void
  + getMetrics(): Metrics

# 役割ベースインターフェース
IWorkflowCreator:        # 作成者の役割
  + createWorkflow(): Workflow

IWorkflowExecutor:       # 実行者の役割
  + executeWorkflow(): Result

IWorkflowMonitor:        # 監視者の役割
  + getStatus(): Status
  + getMetrics(): Metrics

IWorkflowValidator:      # 検証者の役割
  + validateWorkflow(): ValidationResult

IWorkflowRecovery:       # リカバリ担当の役割
  + rollbackWorkflow(): void
```

### 役割の特定方法

| ステップ | 説明 | 例 |
|---------|------|-----|
| 1. クライアント特定 | インターフェースを使用するすべてのクライアントを列挙 | Controller, Scheduler, Monitor |
| 2. 使用パターン分析 | 各クライアントが使用するメソッドを分析 | Controllerはcreate/executeを使用 |
| 3. 役割グループ化 | 同様のメソッドセットを使用するクライアントをグループ化 | 実行関連、監視関連 |
| 4. インターフェース抽出 | 各役割グループに対応するインターフェースを定義 | IWorkflowExecutor, IWorkflowMonitor |

## ワークフローエンジンの役割設計

### コアインターフェース（必須）

```
# すべてのExecutorが実装する最小インターフェース
IWorkflowExecutor<TInput, TOutput>:
  + readonly type: string
  + readonly displayName: string
  + readonly description: string
  + execute(input: TInput, context: ExecutionContext): Promise<TOutput>
```

### 拡張インターフェース（オプショナル）

```
# 検証機能を持つExecutor用
IValidatable<TInput>:
  + validate(input: TInput): ValidationResult
  + readonly inputSchema: ZodSchema<TInput>
  + readonly outputSchema: ZodSchema<TOutput>

# リトライ機能を持つExecutor用
IRetryable:
  + canRetry(error: Error): boolean
  + getRetryDelay(attempt: number): number
  + readonly maxRetries: number

# ロールバック機能を持つExecutor用
IRollbackable:
  + rollback(context: ExecutionContext): Promise<void>
  + readonly supportsSafepoint: boolean

# 進捗レポート機能を持つExecutor用
IProgressReporter:
  + onProgress(progress: Progress): void
  + readonly supportsProgress: boolean

# メトリクス提供機能を持つExecutor用
IMetricsProvider:
  + getMetrics(): ExecutorMetrics
  + resetMetrics(): void

# ライフサイクル管理機能を持つExecutor用
ILifecycleAware:
  + onInitialize(): Promise<void>
  + onShutdown(): Promise<void>

# スケジューリング機能を持つExecutor用
ISchedulable:
  + getCronExpression(): string
  + getNextExecutionTime(): Date
```

## 実装パターン

### パターン1: 最小実装

```
# シンプルなExecutor（コアのみ実装）
SimpleTextExecutor implements IWorkflowExecutor<TextInput, TextOutput>:
  readonly type = 'TEXT_PROCESS'
  readonly displayName = 'テキスト処理'
  readonly description = 'シンプルなテキスト処理を実行'

  execute(input: TextInput, context: ExecutionContext):
    # 実行ロジック
    return { result: process(input.text) }
```

### パターン2: 検証付き実装

```
# 検証機能付きExecutor
ValidatingExecutor implements IWorkflowExecutor, IValidatable:
  readonly type = 'VALIDATED_PROCESS'
  readonly displayName = '検証付き処理'
  readonly description = '入力検証を行う処理'

  readonly inputSchema = z.object({
    data: z.string().min(1),
    options: z.object({...}).optional(),
  })

  readonly outputSchema = z.object({
    result: z.string(),
    metadata: z.object({...}),
  })

  validate(input): ValidationResult:
    result = this.inputSchema.safeParse(input)
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.errors,
    }

  execute(input, context):
    # 実行ロジック
```

### パターン3: フル機能実装

```
# すべての機能を持つExecutor
FullFeaturedExecutor implements
  IWorkflowExecutor,
  IValidatable,
  IRetryable,
  IRollbackable,
  IProgressReporter,
  IMetricsProvider,
  ILifecycleAware:

  # コア
  readonly type = 'FULL_FEATURED'
  readonly displayName = 'フル機能処理'
  readonly description = 'すべての機能を持つ処理'

  # IValidatable
  readonly inputSchema = ...
  readonly outputSchema = ...
  validate(input): ValidationResult { ... }

  # IRetryable
  readonly maxRetries = 3
  canRetry(error): boolean { ... }
  getRetryDelay(attempt): number { ... }

  # IRollbackable
  readonly supportsSafepoint = true
  rollback(context): Promise<void> { ... }

  # IProgressReporter
  readonly supportsProgress = true
  onProgress(progress): void { ... }

  # IMetricsProvider
  getMetrics(): ExecutorMetrics { ... }
  resetMetrics(): void { ... }

  # ILifecycleAware
  onInitialize(): Promise<void> { ... }
  onShutdown(): Promise<void> { ... }

  # コア実装
  execute(input, context): Promise<Output> { ... }
```

## 役割の組み合わせパターン

### 一般的な組み合わせ

| Executor種類 | 実装するインターフェース |
|-------------|------------------------|
| **シンプル** | IWorkflowExecutor |
| **検証付き** | IWorkflowExecutor + IValidatable |
| **リトライ付き** | IWorkflowExecutor + IRetryable |
| **トランザクション** | IWorkflowExecutor + IValidatable + IRollbackable |
| **監視付き** | IWorkflowExecutor + IProgressReporter + IMetricsProvider |
| **スケジュール** | IWorkflowExecutor + ISchedulable + ILifecycleAware |
| **フル機能** | すべて |

## 型ガードの実装

```
# 役割の判定
function isValidatable(executor: IWorkflowExecutor): executor is IValidatable:
  return 'validate' in executor && 'inputSchema' in executor

function isRetryable(executor: IWorkflowExecutor): executor is IRetryable:
  return 'canRetry' in executor && 'maxRetries' in executor

function isRollbackable(executor: IWorkflowExecutor): executor is IRollbackable:
  return 'rollback' in executor

function isProgressReporter(executor: IWorkflowExecutor): executor is IProgressReporter:
  return 'onProgress' in executor && 'supportsProgress' in executor

# 使用例
function executeWithValidation(executor: IWorkflowExecutor, input: unknown):
  if (isValidatable(executor)):
    result = executor.validate(input)
    if (!result.valid):
      throw new ValidationError(result.errors)

  return executor.execute(input, context)
```

## 設計チェックリスト

### 役割特定

- [ ] すべてのクライアントを特定したか？
- [ ] 各クライアントの使用パターンを分析したか？
- [ ] 役割グループを適切に定義したか？

### インターフェース設計

- [ ] 各インターフェースは単一の役割を表しているか？
- [ ] インターフェースの命名は役割を反映しているか？
- [ ] インターフェースの粒度は適切か？

### 実装

- [ ] 実装クラスは必要なインターフェースのみ実装しているか？
- [ ] 型ガードが適切に提供されているか？
- [ ] 拡張ポイントとして機能するか？

## 関連ドキュメント

- `isp-principles.md`: ISP原則の詳細
- `fat-interface-detection.md`: 肥大化インターフェースの検出
- `interface-composition.md`: インターフェースの組み合わせ方法
