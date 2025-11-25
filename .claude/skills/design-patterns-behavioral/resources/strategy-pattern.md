# Strategy Pattern（戦略パターン）

## 概要

Strategyパターンは、アルゴリズムのファミリーを定義し、それぞれをカプセル化して交換可能にする。
クライアントから独立してアルゴリズムを変更できるようにする。

## パターン構造

```
┌─────────────────────┐
│      Context        │
├─────────────────────┤
│ - strategy: Strategy│
├─────────────────────┤
│ + setStrategy()     │
│ + executeStrategy() │
└─────────────────────┘
         │
         │ has-a
         ▼
┌─────────────────────┐
│   <<interface>>     │
│     Strategy        │
├─────────────────────┤
│ + execute()         │
└─────────────────────┘
         △
         │ implements
    ┌────┴────┐
    │         │
┌───┴───┐ ┌───┴───┐
│StratA │ │StratB │
└───────┘ └───────┘
```

## 構成要素

### 1. Strategy（戦略インターフェース）

アルゴリズムの共通インターフェースを定義する。

**設計原則**:
- 最小限のメソッドシグネチャ
- ジェネリクスによる型安全性
- 明確な入出力定義

**TypeScript定義の概念**:
```
interface IStrategy<TInput, TOutput>:
  - execute(input: TInput): Promise<TOutput>
  - オプショナル: validate(input: TInput): boolean
```

### 2. ConcreteStrategy（具体的戦略）

アルゴリズムの具体的な実装を提供する。

**設計原則**:
- 単一責任の原則（SRP）遵守
- 状態を持たない（Stateless）が望ましい
- テスト可能な設計

### 3. Context（コンテキスト）

Strategyを保持し、クライアントとの橋渡しを行う。

**設計原則**:
- Strategyの切り替え機能を提供
- Strategyの詳細を隠蔽
- 共通処理の集約

## 適用場面

### 推奨される状況

| 状況 | 説明 |
|------|------|
| 複数アルゴリズム | 同じ目的を達成する複数の方法が存在 |
| 実行時切り替え | アルゴリズムを動的に選択する必要がある |
| 条件分岐の排除 | if-else/switchによるアルゴリズム選択を排除 |
| 拡張性確保 | 新しいアルゴリズムの追加を容易に |

### 避けるべき状況

| 状況 | 理由 |
|------|------|
| アルゴリズムが1つのみ | 過剰設計になる |
| 切り替えが不要 | 複雑性のみが増加 |
| アルゴリズムの変動が少ない | YAGNI原則違反 |

## ワークフローエンジンへの適用

### IWorkflowExecutor as Strategy

```
IWorkflowExecutor<TInput, TOutput>:
  - type: string (識別子)
  - displayName: string (表示名)
  - description: string (説明)
  - inputSchema: ZodSchema (入力検証)
  - outputSchema: ZodSchema (出力検証)
  - execute(input: TInput, context: ExecutionContext): Promise<TOutput>
  - validate?(input: TInput): ValidationResult
  - canRetry?(error: Error): boolean
```

### WorkflowEngine as Context

```
WorkflowEngine:
  - registry: Map<string, IWorkflowExecutor>
  - getExecutor(type: string): IWorkflowExecutor
  - execute(type: string, input: unknown): Promise<unknown>
```

### 実行フロー

```
1. クライアントがWorkflowEngineにリクエスト
2. WorkflowEngineがtypeからExecutorを取得
3. Executorのexecuteメソッドを呼び出し
4. 結果をクライアントに返却
```

## 利点

- **柔軟性**: アルゴリズムの実行時切り替え
- **テスト容易性**: 各アルゴリズムを独立してテスト可能
- **拡張性**: 新しいアルゴリズムの追加がOCPに準拠
- **保守性**: アルゴリズムの変更が局所化

## 欠点

- **クラス数増加**: 各アルゴリズムに対応するクラスが必要
- **オーバーヘッド**: 単純なケースでは過剰設計
- **クライアントの認識**: クライアントがStrategy違いを認識する必要

## 検証チェックリスト

- [ ] Strategyインターフェースは最小限か？
- [ ] 各ConcreteStrategyは単一責任か？
- [ ] Contextは適切にStrategyを管理しているか？
- [ ] 新しいStrategyの追加は既存コード変更不要か？
- [ ] Strategyの切り替えは実行時に可能か？

## 関連パターン

| パターン | 関係 |
|---------|------|
| Factory Method | Strategyの生成に使用 |
| Template Method | 共通処理との組み合わせ |
| State | 状態に応じたStrategy切り替え |
| Decorator | Strategyの機能拡張 |
