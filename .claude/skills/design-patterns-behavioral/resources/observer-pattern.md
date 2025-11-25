# Observer Pattern（オブザーバーパターン）

## 概要

Observerパターンは、オブジェクト間の一対多の依存関係を定義し、
あるオブジェクトの状態が変化したとき、依存するすべてのオブジェクトに自動的に通知する。

## パターン構造

```
┌─────────────────────┐       ┌─────────────────────┐
│      Subject        │       │   <<interface>>     │
├─────────────────────┤       │     Observer        │
│ - observers: List   │──────▶├─────────────────────┤
├─────────────────────┤       │ + update(state)     │
│ + attach(observer)  │       └──────────△──────────┘
│ + detach(observer)  │                  │
│ + notify()          │         ┌────────┴────────┐
│ + getState()        │         │                 │
│ + setState()        │    ┌────┴────┐      ┌────┴────┐
└─────────────────────┘    │ObserverA│      │ObserverB│
                           └─────────┘      └─────────┘
```

## 構成要素

### 1. Subject（サブジェクト）

観察対象となるオブジェクト。

**責務**:
- Observerのリストを管理
- 状態変化時にObserverに通知
- attach/detach操作の提供

### 2. Observer（オブザーバー）

状態変化の通知を受け取るインターフェース。

**責務**:
- 通知を受け取るメソッドを定義
- Subjectの状態に応じた処理を実行

### 3. ConcreteObserver（具体オブザーバー）

Observerインターフェースの具体的な実装。

**責務**:
- 通知を受けて具体的な処理を実行
- 必要に応じてSubjectの状態を参照

## 通知方式

### Push Model（プッシュ型）

Subjectが変更情報をObserverに送信。

```
notify():
  state = getState()
  for observer in observers:
    observer.update(state)
```

**利点**: Observerが必要な情報を即座に取得
**欠点**: 不要な情報も送信される可能性

### Pull Model（プル型）

Observerが必要な情報をSubjectから取得。

```
notify():
  for observer in observers:
    observer.update(this)  # Subject自体を渡す

# Observer側
update(subject):
  data = subject.getState()  # 必要な情報を取得
  process(data)
```

**利点**: Observerが必要な情報のみ取得
**欠点**: Subjectへの依存が増加

## ワークフローエンジンへの適用

### ワークフロー状態変化の通知

```
WorkflowSubject:
  - status: WorkflowStatus
  - observers: WorkflowObserver[]

  + addObserver(observer: WorkflowObserver): void
  + removeObserver(observer: WorkflowObserver): void
  + setStatus(status: WorkflowStatus): void
    this.status = status
    notify()

  - notify():
    for observer in observers:
      observer.onStatusChange(this.id, this.status)
```

### 具体オブザーバーの例

```
LoggingObserver implements WorkflowObserver:
  onStatusChange(workflowId, status):
    logger.info(`Workflow ${workflowId} changed to ${status}`)

MetricsObserver implements WorkflowObserver:
  onStatusChange(workflowId, status):
    metrics.recordStatusChange(workflowId, status)

NotificationObserver implements WorkflowObserver:
  onStatusChange(workflowId, status):
    if status === 'FAILED':
      notificationService.sendAlert(workflowId)
```

### イベント駆動アーキテクチャ

```
EventEmitter:
  - listeners: Map<EventType, Listener[]>

  + on(event: EventType, listener: Listener): void
  + off(event: EventType, listener: Listener): void
  + emit(event: EventType, data: any): void
    for listener in listeners.get(event):
      listener(data)
```

## 実装上の考慮事項

### メモリリーク防止

```
# WeakRefを使用した実装
WeakObserverList:
  - observers: WeakRef<Observer>[]

  notify():
    for ref in observers:
      observer = ref.deref()
      if observer:
        observer.update()
      else:
        # GCされたobserverを削除
        removeDeadReferences()
```

### 順序の保証

```
# 優先度付きObserver
PriorityObserver:
  observer: Observer
  priority: number

OrderedSubject:
  - observers: PriorityObserver[]  # priorityでソート

  notify():
    sortedObservers = observers.sortBy(o => o.priority)
    for po in sortedObservers:
      po.observer.update()
```

### 非同期通知

```
AsyncSubject:
  async notify():
    await Promise.all(
      observers.map(o => o.update())
    )

# または順次実行
  async notifySequential():
    for observer in observers:
      await observer.update()
```

## 利点

- **疎結合**: SubjectとObserverの分離
- **動的な関係**: 実行時にObserverを追加・削除可能
- **ブロードキャスト**: 複数のObserverに一斉通知
- **拡張性**: 新しいObserverの追加が容易

## 欠点

- **更新の連鎖**: ObserverがSubjectを更新すると無限ループの可能性
- **メモリリーク**: Observerの解除忘れ
- **順序の不確定**: 通知の順序が保証されない
- **パフォーマンス**: 多数のObserverがいると通知が遅延

## 検証チェックリスト

- [ ] SubjectとObserverは疎結合か？
- [ ] Observerの解除は適切に行われているか？
- [ ] 通知の順序に依存していないか？
- [ ] 更新の連鎖は防止されているか？
- [ ] メモリリークの対策はされているか？

## 関連パターン

| パターン | 関係 |
|---------|------|
| Mediator | オブジェクト間の通信を仲介 |
| Singleton | グローバルなSubjectの管理 |
| State | 状態変化に応じた通知 |
