# Command Pattern（コマンドパターン）

## 概要

Commandパターンは、リクエストをオブジェクトとしてカプセル化し、
異なるリクエストでクライアントをパラメータ化する。
リクエストのキューイング、ログ記録、取り消し操作をサポートする。

## パターン構造

```
┌──────────────┐      ┌─────────────────┐
│   Client     │─────▶│    Invoker      │
└──────────────┘      ├─────────────────┤
                      │ - command       │
                      │ + setCommand()  │
                      │ + execute()     │
                      └────────┬────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │  <<interface>>  │
                      │    Command      │
                      ├─────────────────┤
                      │ + execute()     │
                      │ + undo()        │
                      └────────△────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────┴───┐   ┌───────┴────┐   ┌───────┴────┐
     │ConcreteCmd1│   │ConcreteCmd2│   │ConcreteCmd3│
     ├────────────┤   ├────────────┤   ├────────────┤
     │ - receiver │   │ - receiver │   │ - receiver │
     │ + execute()│   │ + execute()│   │ + execute()│
     │ + undo()   │   │ + undo()   │   │ + undo()   │
     └────────────┘   └────────────┘   └────────────┘
           │                 │                │
           ▼                 ▼                ▼
     ┌──────────┐     ┌──────────┐     ┌──────────┐
     │Receiver A│     │Receiver B│     │Receiver C│
     └──────────┘     └──────────┘     └──────────┘
```

## 構成要素

### 1. Command（コマンドインターフェース）

操作を実行するためのインターフェースを宣言。

**必須メソッド**:
- `execute()`: 操作を実行

**オプショナルメソッド**:
- `undo()`: 操作を取り消し
- `canExecute()`: 実行可能か判定

### 2. ConcreteCommand（具体コマンド）

Receiverとアクションの結びつきを定義。

**責務**:
- Receiverへの参照を保持
- execute()でReceiverのメソッドを呼び出し
- undo()のための状態を保持

### 3. Invoker（起動者）

コマンドの実行を要求する。

**責務**:
- コマンドの保持
- コマンドの実行トリガー
- 履歴管理（オプション）

### 4. Receiver（受信者）

実際の処理を行うオブジェクト。

**責務**:
- ビジネスロジックの実装
- コマンドからの呼び出しを受け付け

## ワークフローエンジンへの適用

### ワークフローコマンド

```
WorkflowCommand:
  - workflowId: string
  - executor: IWorkflowExecutor
  - input: unknown
  - context: ExecutionContext
  - result?: unknown
  - error?: Error

  + execute(): Promise<void>
  + undo(): Promise<void>
  + canRetry(): boolean
  + getResult(): unknown
```

### コマンド履歴管理

```
CommandHistory:
  - executedCommands: WorkflowCommand[]
  - undoneCommands: WorkflowCommand[]

  + execute(command: WorkflowCommand): void
  + undo(): void
  + redo(): void
  + canUndo(): boolean
  + canRedo(): boolean
  + getHistory(): WorkflowCommand[]
```

### 実行フロー

```
1. クライアントがWorkflowCommandを作成
2. InvokerにCommandを設定
3. Invoker.execute()を呼び出し
4. CommandがExecutor（Receiver）のメソッドを呼び出し
5. 結果をCommandに保存
6. 必要に応じてundo()で取り消し
```

## Undo/Redo実装

### Undo可能なコマンドの設計

```
UndoableCommand:
  - previousState: unknown  # 実行前の状態を保存

  execute():
    1. previousState = 現在の状態を保存
    2. 新しい操作を実行

  undo():
    1. previousStateから状態を復元
```

### Memento との組み合わせ

```
CommandWithMemento:
  - memento: Memento  # 状態のスナップショット

  execute():
    1. memento = originator.createMemento()
    2. 操作を実行

  undo():
    1. originator.restore(memento)
```

## 利点

- **操作の遅延実行**: コマンドをキューに入れて後で実行
- **Undo/Redo**: 操作の取り消しとやり直し
- **トランザクション**: 複数のコマンドをまとめて実行
- **ログ記録**: コマンドの履歴を記録
- **疎結合**: InvokerとReceiverを分離

## 欠点

- **クラス数の増加**: 各操作にコマンドクラスが必要
- **複雑性の増加**: 単純な操作には過剰
- **状態管理**: Undoのための状態保持が複雑

## マクロコマンド（Composite Command）

複数のコマンドをまとめて実行する。

```
MacroCommand:
  - commands: Command[]

  execute():
    for each command in commands:
      command.execute()

  undo():
    for each command in commands.reverse():
      command.undo()
```

## 検証チェックリスト

- [ ] Commandインターフェースは適切に定義されているか？
- [ ] Undo操作が必要な場合、状態は適切に保存されているか？
- [ ] InvokerとReceiverは疎結合か？
- [ ] マクロコマンドが必要な場合、Compositeパターンを適用しているか？
- [ ] コマンドの履歴管理は適切か？

## 関連パターン

| パターン | 関係 |
|---------|------|
| Composite | マクロコマンドの実装 |
| Memento | Undoのための状態保存 |
| Prototype | コマンドのコピー |
| Chain of Responsibility | コマンドの処理チェーン |
