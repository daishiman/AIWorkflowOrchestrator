# State Pattern（ステートパターン）

## 概要

Stateパターンは、オブジェクトの内部状態が変化したときに、その動作を変更できるようにする。
オブジェクトはそのクラスが変わったかのように見える。

## パターン構造

```
┌─────────────────────────┐
│        Context          │
├─────────────────────────┤
│ - state: State          │
├─────────────────────────┤
│ + request()             │
│ + setState(state)       │
└───────────┬─────────────┘
            │
            │ delegates to
            ▼
┌─────────────────────────┐
│     <<interface>>       │
│         State           │
├─────────────────────────┤
│ + handle(context)       │
└───────────△─────────────┘
            │
    ┌───────┼───────┐
    │       │       │
┌───┴───┐ ┌─┴─┐ ┌───┴───┐
│StateA │ │ B │ │StateC │
└───────┘ └───┘ └───────┘
```

## 構成要素

### 1. Context（コンテキスト）

クライアントにとって関心のあるインターフェースを定義。

**責務**:
- 現在の状態を保持
- 状態の切り替えを行う
- 状態に依存する操作を状態オブジェクトに委譲

### 2. State（状態インターフェース）

状態ごとの振る舞いを定義するインターフェース。

**責務**:
- 状態固有の操作を宣言
- 必要に応じて状態遷移を実行

### 3. ConcreteState（具体状態）

特定の状態における振る舞いを実装。

**責務**:
- 状態固有のロジックを実装
- 次の状態への遷移条件を定義

## ワークフローエンジンへの適用

### ワークフロー状態

```
WorkflowStatus:
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
```

### 状態インターフェース

```
WorkflowState:
  + canStart(): boolean
  + canCancel(): boolean
  + canRetry(): boolean
  + start(context: WorkflowContext): void
  + cancel(context: WorkflowContext): void
  + complete(context: WorkflowContext, result: unknown): void
  + fail(context: WorkflowContext, error: Error): void
```

### 具体状態の実装

```
PendingState implements WorkflowState:
  canStart(): true
  canCancel(): true
  canRetry(): false

  start(context):
    context.beginExecution()
    context.setState(new ProcessingState())

  cancel(context):
    context.markCancelled()
    context.setState(new CancelledState())

ProcessingState implements WorkflowState:
  canStart(): false  # 既に開始済み
  canCancel(): true
  canRetry(): false

  complete(context, result):
    context.saveResult(result)
    context.setState(new CompletedState())

  fail(context, error):
    context.saveError(error)
    context.setState(new FailedState())

FailedState implements WorkflowState:
  canStart(): false
  canCancel(): false
  canRetry(): true

  retry(context):
    context.resetForRetry()
    context.setState(new PendingState())
    context.state.start(context)
```

### コンテキスト

```
WorkflowContext:
  - state: WorkflowState
  - workflowId: string
  - data: unknown

  + setState(state: WorkflowState): void
  + start(): void
    if state.canStart():
      state.start(this)
    else:
      throw new InvalidStateTransitionError()

  + cancel(): void
    if state.canCancel():
      state.cancel(this)
    else:
      throw new InvalidStateTransitionError()
```

## 状態遷移図

```
                ┌─────────┐
      start()   │ PENDING │   cancel()
   ┌───────────▶├─────────┤──────────────┐
   │            │         │              │
   │            └────┬────┘              │
   │                 │                   │
   │            start()                  │
   │                 │                   ▼
   │                 ▼              ┌─────────┐
   │         ┌──────────────┐       │CANCELLED│
   │         │  PROCESSING  │       └─────────┘
   │         ├──────────────┤
   │         │              │
   │         └──────┬───────┘
   │                │
   │     ┌──────────┴──────────┐
   │     │                     │
   │ complete()             fail()
   │     │                     │
   │     ▼                     ▼
   │ ┌─────────┐          ┌─────────┐
   │ │COMPLETED│          │ FAILED  │
   │ └─────────┘          ├─────────┤
   │                      │         │
   │                      └────┬────┘
   │                           │
   │                      retry()
   │                           │
   └───────────────────────────┘
```

## if-elseとの比較

### if-elseによる実装（非推奨）

```
process(action):
  if status === 'PENDING':
    if action === 'start':
      // 開始処理
    else if action === 'cancel':
      // キャンセル処理
  else if status === 'PROCESSING':
    if action === 'complete':
      // 完了処理
    else if action === 'fail':
      // 失敗処理
  // ... 状態が増えるたびに複雑化
```

### Stateパターンによる実装（推奨）

```
process(action):
  state.handle(this, action)  # 状態オブジェクトに委譲
```

## 利点

- **状態の明示化**: 各状態が独立したクラス
- **遷移の局所化**: 状態遷移ロジックが状態クラスに集中
- **拡張の容易さ**: 新しい状態の追加が容易
- **条件分岐の排除**: if-elseやswitchを削減

## 欠点

- **クラス数の増加**: 各状態にクラスが必要
- **状態間の知識**: 状態クラスが互いを知る必要がある場合も
- **単純なケースでは過剰**: 状態が少ない場合は不要

## 検証チェックリスト

- [ ] 各状態クラスは単一の責任を持つか？
- [ ] 状態遷移は明確に定義されているか？
- [ ] 無効な状態遷移は適切にエラーハンドリングされるか？
- [ ] 状態遷移図はドキュメント化されているか？
- [ ] Contextは状態の詳細を知らないか？

## 関連パターン

| パターン | 関係 |
|---------|------|
| Strategy | 状態ではなくアルゴリズムを切り替え |
| Singleton | 状態オブジェクトの共有 |
| Flyweight | 状態オブジェクトの軽量化 |
