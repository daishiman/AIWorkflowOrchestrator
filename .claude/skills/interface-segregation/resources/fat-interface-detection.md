# 肥大化インターフェースの検出（Fat Interface Detection）

## 概要

肥大化インターフェース（Fat Interface）は、ISP違反の典型的なパターン。
このドキュメントでは、肥大化インターフェースの検出方法と分析手法を説明する。

## 検出指標

### 1. 定量的指標

| 指標             | しきい値       | 説明                               |
| ---------------- | -------------- | ---------------------------------- |
| **メソッド数**   | 7以上          | インターフェースが大きすぎる可能性 |
| **プロパティ数** | 10以上         | 責任が多すぎる可能性               |
| **パラメータ数** | 5以上/メソッド | メソッドが複雑すぎる               |
| **実装クラス数** | 5以上          | 分離の価値が高い                   |

### 2. 定性的指標

```
# 肥大化の兆候チェックリスト

□ 空実装の存在
  - メソッド本体が空
  - 単なるreturn文のみ

□ 例外スローの存在
  - NotImplementedException
  - UnsupportedOperationException

□ 条件付き実装
  - if (this.supports...) パターン
  - フラグベースの分岐

□ 異なるクライアントパターン
  - クライアントAはメソッド1-3を使用
  - クライアントBはメソッド4-6を使用

□ 命名の不一致
  - メソッド名が異なるドメインを示唆
  - 動詞の種類が混在（create/validate/notify）
```

## 検出パターン

### パターン1: メソッド使用率分析

```
# 各実装クラスのメソッド使用率を計算
Interface IWorkflowService:
  method1() # 使用: 5/5実装 = 100%
  method2() # 使用: 5/5実装 = 100%
  method3() # 使用: 3/5実装 = 60%
  method4() # 使用: 2/5実装 = 40%
  method5() # 使用: 1/5実装 = 20%

# 使用率が低いメソッドは分離候補
分離候補: method3, method4, method5
```

### パターン2: 変更頻度分析

```
# 変更履歴から変更頻度を分析
Interface IWorkflowService:
  method1() # 変更: 10回（ビジネスロジック）
  method2() # 変更: 10回（ビジネスロジック）
  method3() # 変更: 2回（監視機能）
  method4() # 変更: 2回（監視機能）
  method5() # 変更: 5回（永続化）

# 異なる変更理由を持つメソッドグループ
グループA: method1, method2（ビジネスロジック）
グループB: method3, method4（監視機能）
グループC: method5（永続化）
```

### パターン3: クライアント依存分析

```
# クライアントごとの使用メソッドをマッピング
クライアント: WorkflowController
  使用: createWorkflow, executeWorkflow, getStatus

クライアント: SchedulerService
  使用: scheduleWorkflow, cancelSchedule

クライアント: MonitoringDashboard
  使用: getMetrics, getStatus

クライアント: AdminPanel
  使用: exportWorkflow, importWorkflow

# 各クライアントが異なるメソッドセットを使用
→ インターフェース分離の強い候補
```

## 肥大化インターフェースの例

### 悪い例: 肥大化したIWorkflowExecutor

```
# 肥大化インターフェース
IWorkflowExecutor:
  # コア機能
  + type: string
  + displayName: string
  + description: string
  + execute(input, context): Promise<Output>

  # 検証機能（すべてのExecutorが必要？）
  + validate(input): ValidationResult
  + validateSchema(schema): boolean

  # ライフサイクル機能（すべてのExecutorが必要？）
  + onInitialize(): Promise<void>
  + onShutdown(): Promise<void>

  # リカバリ機能（すべてのExecutorが必要？）
  + rollback(context): Promise<void>
  + canRetry(error): boolean
  + getRetryDelay(): number

  # 監視機能（すべてのExecutorが必要？）
  + onProgress(callback): void
  + getMetrics(): ExecutorMetrics

  # スケジューリング機能（すべてのExecutorが必要？）
  + getCronExpression(): string
  + getNextExecutionTime(): Date
```

### 分析結果

```
# 実装クラスごとの使用状況

SimpleExecutor:
  ✓ type, displayName, description, execute
  ✗ validate（空実装）
  ✗ onInitialize, onShutdown（空実装）
  ✗ rollback, canRetry, getRetryDelay（例外スロー）
  ✗ onProgress, getMetrics（空実装）
  ✗ getCronExpression, getNextExecutionTime（例外スロー）

ValidatingExecutor:
  ✓ type, displayName, description, execute
  ✓ validate, validateSchema
  ✗ その他（空実装または例外）

ScheduledExecutor:
  ✓ type, displayName, description, execute
  ✓ getCronExpression, getNextExecutionTime
  ✗ その他（空実装または例外）

# 結論: 明確なISP違反
```

## 検出ツール

### コード分析スクリプト

```
# 検出ロジック（疑似コード）
analyze_interface(interface_file):
  methods = extract_methods(interface_file)
  implementations = find_implementations(interface_file)

  results = {
    method_count: methods.length,
    impl_count: implementations.length,
    usage_matrix: [],
    empty_impl_count: 0,
    exception_count: 0,
  }

  for impl in implementations:
    for method in methods:
      usage = analyze_method_usage(impl, method)
      if usage.is_empty:
        results.empty_impl_count++
      if usage.throws_not_implemented:
        results.exception_count++
      results.usage_matrix.append({impl, method, usage})

  return results
```

### 検出結果の解釈

| スコア         | 状態   | アクション |
| -------------- | ------ | ---------- |
| 0-20% 空実装   | 良好   | 現状維持   |
| 20-50% 空実装  | 要注意 | 分離を検討 |
| 50%以上 空実装 | 要改善 | 即座に分離 |

## 検出チェックリスト

### 静的分析

- [ ] インターフェースのメソッド数は7未満か？
- [ ] すべての実装クラスがすべてのメソッドを使用しているか？
- [ ] 空実装やNotImplementedExceptionがないか？
- [ ] メソッド名は同一ドメインを示しているか？

### 動的分析

- [ ] 各メソッドの変更頻度は同程度か？
- [ ] メソッドグループごとに異なる変更理由がないか？
- [ ] 異なるクライアントが異なるメソッドセットを使用していないか？

### アーキテクチャ分析

- [ ] インターフェースは単一の責任を持っているか？
- [ ] 将来の拡張で更に肥大化する可能性はないか？
- [ ] 分離することでテスト容易性が向上するか？

## 関連ドキュメント

- `isp-principles.md`: ISP原則の詳細
- `role-interface-design.md`: 役割ベースのインターフェース設計
- `interface-composition.md`: インターフェースの組み合わせ方法
