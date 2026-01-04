# ISP原則（Interface Segregation Principle）

## 定義

**ISP**: クライアントは、自分が使用しないメソッドに依存することを強制されるべきではない。

Robert C. Martinによる定義:

> "Clients should not be forced to depend upon interfaces that they do not use."

## ISPの本質

### 問題: 肥大化インターフェース

```
# 肥大化インターフェース（Fat Interface）の問題
IWorkflowService:
  + createWorkflow(): Workflow
  + executeWorkflow(): Result
  + pauseWorkflow(): void
  + resumeWorkflow(): void
  + cancelWorkflow(): void
  + getWorkflowStatus(): Status
  + validateWorkflow(): ValidationResult
  + rollbackWorkflow(): void
  + scheduleWorkflow(): void
  + getWorkflowMetrics(): Metrics
  + exportWorkflow(): ExportData
  + importWorkflow(): void
```

**問題点**:

- 実装クラスが不要なメソッドを実装する必要
- 変更の影響範囲が広い
- テストが複雑化
- 再利用が困難

### 解決: インターフェース分離

```
# 分離されたインターフェース
IWorkflowExecutor:
  + createWorkflow(): Workflow
  + executeWorkflow(): Result

IWorkflowLifecycle:
  + pauseWorkflow(): void
  + resumeWorkflow(): void
  + cancelWorkflow(): void

IWorkflowMonitor:
  + getWorkflowStatus(): Status
  + getWorkflowMetrics(): Metrics

IWorkflowValidator:
  + validateWorkflow(): ValidationResult

IWorkflowRecovery:
  + rollbackWorkflow(): void

IWorkflowScheduler:
  + scheduleWorkflow(): void

IWorkflowPortability:
  + exportWorkflow(): ExportData
  + importWorkflow(): void
```

## ISPの利点

| 利点             | 説明                                                   |
| ---------------- | ------------------------------------------------------ |
| **疎結合**       | クライアントは必要なインターフェースのみに依存         |
| **変更の局所化** | インターフェース変更の影響範囲が限定                   |
| **テスト容易性** | 小さなインターフェースはモック作成が容易               |
| **再利用性**     | 独立したインターフェースは他のコンテキストで再利用可能 |
| **理解容易性**   | 小さなインターフェースは理解しやすい                   |

## ISP違反の兆候

### 1. 空実装（Empty Implementation）

```
# ISP違反の兆候
SimpleWorkflowExecutor implements IWorkflowService:
  createWorkflow(): Workflow { ... }
  executeWorkflow(): Result { ... }

  # 使用しないメソッドの空実装
  pauseWorkflow(): void { }  # 空
  resumeWorkflow(): void { }  # 空
  rollbackWorkflow(): void { }  # 空
```

### 2. 例外スロー（NotImplementedException）

```
# ISP違反の兆候
BasicWorkflowExecutor implements IWorkflowService:
  scheduleWorkflow(): void {
    throw new NotImplementedError("Scheduling not supported")
  }

  getWorkflowMetrics(): Metrics {
    throw new NotImplementedError("Metrics not available")
  }
```

### 3. 条件付き実装

```
# ISP違反の兆候
ConditionalExecutor implements IWorkflowService:
  rollbackWorkflow(): void {
    if (this.supportsRollback) {
      # 実際の実装
    } else {
      # 何もしないか例外
    }
  }
```

## 分離の判断基準

### インターフェースを分離すべき場合

| 条件                   | 説明                                     |
| ---------------------- | ---------------------------------------- |
| **異なるクライアント** | 異なるクライアントが異なるメソッドを使用 |
| **異なる変更理由**     | メソッドグループごとに異なる変更理由     |
| **低凝集性**           | メソッド間の関連性が低い                 |
| **部分的実装**         | 一部の実装クラスで空実装や例外           |

### インターフェースを分離すべきでない場合

| 条件                 | 説明                                         |
| -------------------- | -------------------------------------------- |
| **高凝集性**         | すべてのメソッドが密接に関連                 |
| **同一クライアント** | すべてのクライアントがすべてのメソッドを使用 |
| **同一変更理由**     | すべてのメソッドが同じ理由で変更される       |
| **過度な分離**       | 1メソッド1インターフェースは避ける           |

## 適切な粒度

### 粗すぎる（Too Coarse）

```
# 悪い例: 1つの巨大インターフェース
IEverything:
  + method1()
  + method2()
  # ... 50個のメソッド
```

### 細かすぎる（Too Fine）

```
# 悪い例: 1メソッド1インターフェース
ICanCreate:
  + create()

ICanRead:
  + read()

ICanUpdate:
  + update()

ICanDelete:
  + delete()
```

### 適切な粒度

```
# 良い例: 役割ベースの分離
IRepository<T>:
  + findById(id): T
  + findAll(): T[]
  + save(entity: T): void
  + delete(entity: T): void

IReadOnlyRepository<T>:
  + findById(id): T
  + findAll(): T[]
```

## 検証チェックリスト

### ISP準拠確認

- [ ] 空実装がないか？
- [ ] NotImplementedExceptionをスローするメソッドがないか？
- [ ] 条件付きで動作するメソッドがないか？
- [ ] すべてのクライアントがすべてのメソッドを使用しているか？
- [ ] インターフェースの各メソッドは同じ変更理由を持つか？

### 分離品質確認

- [ ] 分離されたインターフェースは適切な粒度か？
- [ ] インターフェースの命名は役割を反映しているか？
- [ ] インターフェース間に不必要な依存関係がないか？
- [ ] 拡張ポイントとして適切に機能するか？

## 参考文献

- **『アジャイルソフトウェア開発の奥義』** Robert C. Martin著
- **『Clean Architecture』** Robert C. Martin著
- **SOLID原則**: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
