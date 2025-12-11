# Template Method Pattern（テンプレートメソッドパターン）

## 概要

Template Methodパターンは、アルゴリズムの骨格を定義し、一部の処理をサブクラスに委ねる。
アルゴリズムの構造を変更せずに、特定のステップを再定義できる。

## パターン構造

```
┌─────────────────────────────┐
│      AbstractClass          │
├─────────────────────────────┤
│ + templateMethod()          │ ← アルゴリズムの骨格
│ # primitiveOperation1()     │ ← 抽象メソッド（必須実装）
│ # primitiveOperation2()     │ ← 抽象メソッド（必須実装）
│ # hook()                    │ ← フックメソッド（オプショナル）
└─────────────────────────────┘
              △
              │ extends
     ┌────────┴────────┐
     │                 │
┌────┴────┐      ┌─────┴────┐
│ ConcreteA│      │ ConcreteB│
├─────────┤      ├──────────┤
│ prim1() │      │ prim1()  │
│ prim2() │      │ prim2()  │
│ hook()  │      │          │ ← hookはオプショナル
└─────────┘      └──────────┘
```

## 構成要素

### 1. AbstractClass（抽象クラス）

テンプレートメソッドと抽象メソッドを定義する。

**テンプレートメソッド**:

- アルゴリズムの骨格を定義
- 処理の順序を固定
- finalとして宣言（オーバーライド禁止）

**抽象メソッド（Primitive Operations）**:

- サブクラスで必ず実装が必要
- アルゴリズムの変動部分を表現

**フックメソッド（Hook Methods）**:

- デフォルト実装を持つ
- サブクラスで任意にオーバーライド可能
- 拡張ポイントを提供

### 2. ConcreteClass（具体クラス）

抽象メソッドを実装し、必要に応じてフックをオーバーライド。

## テンプレートメソッドの構造

```
templateMethod() {
  // 不変の処理
  step1()

  // 変動する処理（抽象メソッド）
  primitiveOperation1()

  // 拡張ポイント（フック）
  if (hook()) {
    optionalStep()
  }

  // 変動する処理（抽象メソッド）
  primitiveOperation2()

  // 不変の処理
  step2()
}
```

## ワークフローエンジンへの適用

### BaseWorkflowExecutor

```
BaseWorkflowExecutor<TInput, TOutput>:

  # テンプレートメソッド（オーバーライド禁止）
  final execute(input: TInput, context: ExecutionContext): Promise<TOutput>
    1. beforeExecute(input, context)     # フック
    2. validate(input)                   # 抽象メソッド（任意）
    3. preProcess(input, context)        # フック
    4. doExecute(input, context)         # 抽象メソッド（必須）
    5. postProcess(result, context)      # フック
    6. afterExecute(result, context)     # フック
    7. return result

  # 抽象メソッド（サブクラスで実装）
  abstract doExecute(input: TInput, context: ExecutionContext): Promise<TOutput>

  # フックメソッド（オプショナルでオーバーライド）
  protected beforeExecute(input: TInput, context: ExecutionContext): void { }
  protected validate(input: TInput): ValidationResult { return { valid: true } }
  protected preProcess(input: TInput, context: ExecutionContext): TInput { return input }
  protected postProcess(result: TOutput, context: ExecutionContext): TOutput { return result }
  protected afterExecute(result: TOutput, context: ExecutionContext): void { }
```

### 実行フロー

```
execute() が呼ばれる
    │
    ▼
beforeExecute() ← ログ開始、メトリクス初期化
    │
    ▼
validate() ← 入力検証
    │
    ▼
preProcess() ← 入力の前処理、変換
    │
    ▼
doExecute() ← メイン処理（サブクラスで実装）
    │
    ▼
postProcess() ← 出力の後処理、変換
    │
    ▼
afterExecute() ← ログ終了、メトリクス記録
    │
    ▼
結果を返却
```

## フックメソッドの設計

### フックの種類

| 種類       | 目的             | 例                          |
| ---------- | ---------------- | --------------------------- |
| 通知フック | 処理の前後で通知 | beforeExecute, afterExecute |
| 変換フック | データを変換     | preProcess, postProcess     |
| 判断フック | 処理の分岐を決定 | shouldRetry, canProceed     |
| 検証フック | 条件を検証       | validate, checkPrecondition |

### フック設計の原則

1. **デフォルトは何もしない**: 空の実装または透過的な処理
2. **副作用を最小化**: フックは主処理に影響を与えすぎない
3. **明確な命名**: 目的が明確にわかる名前
4. **適切な粒度**: 細かすぎず、粗すぎない

## 利点

- **コードの再利用**: 共通処理を一箇所に集約
- **アルゴリズムの一貫性**: 処理順序を保証
- **拡張の容易さ**: フックポイントでカスタマイズ
- **制御の逆転**: フレームワークがフローを制御（Hollywood Principle）

## 欠点

- **継承の制約**: 多重継承が困難な言語では制限
- **フック数の増加**: 拡張ポイントが多すぎると複雑化
- **テンプレートの硬直性**: アルゴリズム構造の変更が困難

## Strategyパターンとの比較

| 観点   | Template Method    | Strategy               |
| ------ | ------------------ | ---------------------- |
| 構造   | 継承ベース         | 委譲ベース             |
| 粒度   | アルゴリズムの一部 | アルゴリズム全体       |
| 柔軟性 | コンパイル時に決定 | 実行時に切り替え可能   |
| 用途   | 共通フローの定義   | アルゴリズムの切り替え |

## 検証チェックリスト

- [ ] テンプレートメソッドはオーバーライド不可か？
- [ ] 抽象メソッドは必要最小限か？
- [ ] フックメソッドは適切なデフォルト実装を持つか？
- [ ] 処理の順序は論理的か？
- [ ] 継承階層は適切な深さか？

## 関連パターン

| パターン       | 関係                         |
| -------------- | ---------------------------- |
| Strategy       | 委譲でアルゴリズムを切り替え |
| Factory Method | 生成処理のテンプレート化     |
| Hook           | フックポイントの実装方法     |
