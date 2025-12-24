---
name: .claude/skills/factory-patterns/SKILL.md
description: |
    GoFのFactory系パターンを専門とするスキル。
    Erich Gammaの『Design Patterns』に基づき、
    オブジェクト生成の柔軟性と拡張性を提供する設計パターンを提供します。
    専門分野:
    - Factory Method: サブクラスにインスタンス化を委譲
    - Abstract Factory: 関連オブジェクトファミリーの生成
    - Builder: 複雑なオブジェクトの段階的構築
    - Registry Factory: 型安全な動的オブジェクト生成
    使用タイミング:
    - IWorkflowExecutorの動的生成が必要な時
    - 設定ベースのオブジェクト生成を実装する時
    - 複雑なExecutorの段階的構築が必要な時
    - 新しいワークフロータイプを追加する時
    Use proactively when implementing executor factories, builder patterns,
    or dynamic object creation for workflow engines.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/factory-patterns/resources/abstract-factory.md`: 関連オブジェクトファミリーの生成パターン
  - `.claude/skills/factory-patterns/resources/builder-pattern.md`: 複雑なオブジェクトの段階的構築パターン
  - `.claude/skills/factory-patterns/resources/factory-method.md`: サブクラスによるインスタンス化の委譲パターン
  - `.claude/skills/factory-patterns/resources/registry-factory.md`: 型安全な動的オブジェクト生成とレジストリ管理
  - `.claude/skills/factory-patterns/templates/builder-template.md`: Builderパターンの実装テンプレート
  - `.claude/skills/factory-patterns/templates/factory-method-template.md`: Factory Methodパターンの実装テンプレート
  - `.claude/skills/factory-patterns/scripts/generate-factory.mjs`: Factoryコード生成スクリプト

version: 1.0.0
---

# Factory Patterns

## 概要

このスキルは、GoF の Factory 系パターンに関する知識を提供します。

**主要パターン**:

- **Factory Method**: インスタンス化をサブクラスに委譲
- **Abstract Factory**: 関連オブジェクトのファミリーを生成
- **Builder**: 複雑なオブジェクトを段階的に構築
- **Registry Factory**: 型安全な動的オブジェクト生成

**対象ユーザー**:

- ワークフローエンジンのファクトリを実装するエージェント
- 動的な Executor 生成を必要とする開発者
- オブジェクト生成の柔軟性を高めたいチーム

## リソース構造

```
factory-patterns/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── factory-method.md                       # Factory Methodパターン
│   ├── abstract-factory.md                     # Abstract Factoryパターン
│   ├── builder-pattern.md                      # Builderパターン
│   └── registry-factory.md                     # Registry Factoryパターン
├── scripts/
│   └── generate-factory.mjs                    # ファクトリ生成スクリプト
└── templates/
    ├── factory-method-template.md              # Factory Methodテンプレート
    └── builder-template.md                     # Builderテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Factory Methodパターン
cat .claude/skills/factory-patterns/resources/factory-method.md

# Abstract Factoryパターン
cat .claude/skills/factory-patterns/resources/abstract-factory.md

# Builderパターン
cat .claude/skills/factory-patterns/resources/builder-pattern.md

# Registry Factoryパターン
cat .claude/skills/factory-patterns/resources/registry-factory.md
```

### スクリプト実行

```bash
# ファクトリコード生成
node .claude/skills/factory-patterns/scripts/generate-factory.mjs <type> <name>
```

### テンプレート参照

```bash
# Factory Methodテンプレート
cat .claude/skills/factory-patterns/templates/factory-method-template.md

# Builderテンプレート
cat .claude/skills/factory-patterns/templates/builder-template.md
```

---

## 核心知識

### 1. Factory Method パターン

**目的**: オブジェクトの生成をサブクラスに委譲する

```
# 構造
Creator:
  + factoryMethod(): Product
  + operation(): void

ConcreteCreatorA:
  + factoryMethod(): ProductA

ConcreteCreatorB:
  + factoryMethod(): ProductB

# ワークフローエンジンでの適用
ExecutorFactory:
  + createExecutor(type: string): IWorkflowExecutor

AIExecutorFactory extends ExecutorFactory:
  + createExecutor(type: string): AIWorkflowExecutor

DataExecutorFactory extends ExecutorFactory:
  + createExecutor(type: string): DataWorkflowExecutor
```

**使用場面**:

- 生成するオブジェクトのクラスを事前に知らない
- サブクラスに生成処理を委譲したい
- オブジェクト生成のカスタマイズポイントを提供したい

### 2. Abstract Factory パターン

**目的**: 関連するオブジェクトのファミリーを一貫して生成する

```
# 構造
AbstractFactory:
  + createProductA(): AbstractProductA
  + createProductB(): AbstractProductB

ConcreteFactory1:
  + createProductA(): ProductA1
  + createProductB(): ProductB1

ConcreteFactory2:
  + createProductA(): ProductA2
  + createProductB(): ProductB2

# ワークフローエンジンでの適用
WorkflowComponentFactory:
  + createExecutor(): IWorkflowExecutor
  + createValidator(): IValidator
  + createLogger(): ILogger

ProductionFactory implements WorkflowComponentFactory:
  # 本番用コンポーネントを生成

TestFactory implements WorkflowComponentFactory:
  # テスト用モックコンポーネントを生成
```

**使用場面**:

- 関連するオブジェクトのファミリーを一貫して生成
- 製品のバリエーション（本番/テスト）を切り替え
- システム全体で一貫したオブジェクト構成を保証

### 3. Builder パターン

**目的**: 複雑なオブジェクトを段階的に構築する

```
# 構造
Builder:
  + setPartA(): Builder
  + setPartB(): Builder
  + build(): Product

# ワークフローエンジンでの適用
ExecutorBuilder:
  + withType(type: string): ExecutorBuilder
  + withDisplayName(name: string): ExecutorBuilder
  + withInputSchema(schema: ZodSchema): ExecutorBuilder
  + withOutputSchema(schema: ZodSchema): ExecutorBuilder
  + withRetry(config: RetryConfig): ExecutorBuilder
  + withRollback(handler: RollbackHandler): ExecutorBuilder
  + build(): IWorkflowExecutor

# 使用例
executor = new ExecutorBuilder()
  .withType('AI_ANALYSIS')
  .withDisplayName('AI分析')
  .withInputSchema(inputSchema)
  .withRetry({ maxRetries: 3, delay: 1000 })
  .build()
```

**使用場面**:

- オブジェクトの構築ステップが複雑
- 同じ構築プロセスで異なる表現を生成
- 構築の各ステップを明示的に制御したい

### 4. Registry Factory パターン

**目的**: 型情報に基づいて動的にオブジェクトを生成する

```
# 構造
RegistryFactory<T>:
  private registry: Map<string, () => T>
  + register(key: string, factory: () => T): void
  + create(key: string): T
  + has(key: string): boolean
  + list(): string[]

# ワークフローエンジンでの適用
ExecutorRegistry:
  private factories: Map<string, () => IWorkflowExecutor>

  register(type: string, factory: () => IWorkflowExecutor):
    this.factories.set(type, factory)

  create(type: string): IWorkflowExecutor:
    factory = this.factories.get(type)
    if (!factory):
      throw new UnknownTypeError(type)
    return factory()
```

**使用場面**:

- 実行時に型に基づいてオブジェクトを生成
- 拡張可能なプラグインシステム
- 設定ベースのオブジェクト生成

---

## パターン選択ガイド

| 要件                             | 推奨パターン              |
| -------------------------------- | ------------------------- |
| サブクラスで生成をカスタマイズ   | Factory Method            |
| 関連オブジェクトをまとめて生成   | Abstract Factory          |
| 複雑なオブジェクトを段階的に構築 | Builder                   |
| 文字列キーで動的に生成           | Registry Factory          |
| 生成とビジネスロジックを分離     | Factory Method + Strategy |
| テスト容易性を高める             | Abstract Factory          |

---

## 実装ワークフロー

### Phase 1: 要件分析

1. 生成するオブジェクトの種類を特定
2. 生成の複雑さを評価
3. 拡張性の要件を確認

**判断基準**:

- [ ] オブジェクトの種類は固定か動的か？
- [ ] 構築ステップは複雑か単純か？
- [ ] 関連オブジェクトのファミリーがあるか？

### Phase 2: パターン選択

1. 要件に基づいてパターンを選択
2. パターンの組み合わせを検討
3. 実装の複雑さを評価

**判断基準**:

- [ ] 選択したパターンは要件を満たすか？
- [ ] 過度に複雑になっていないか？
- [ ] 拡張ポイントは適切か？

### Phase 3: 実装

1. インターフェースの定義
2. 具象クラスの実装
3. クライアントコードの統合

**判断基準**:

- [ ] インターフェースは明確か？
- [ ] 依存関係は適切に管理されているか？
- [ ] テストが書けるか？

### Phase 4: 検証

1. ユニットテストの作成
2. 統合テストの作成
3. パターンの効果を確認

**判断基準**:

- [ ] 新しいタイプの追加が容易か？
- [ ] テストが容易に書けるか？
- [ ] コードの可読性は向上したか？

---

## アンチパターン

### 1. 過剰なファクトリ（Factory Overkill）

```
# 悪い例: 単純なオブジェクトにファクトリを使用
StringFactory:
  createString(value: string): string:
    return value

# 良い例: 直接生成
str = "hello"
```

### 2. God Factory

```
# 悪い例: すべてを生成する巨大ファクトリ
UniversalFactory:
  createUser(): User
  createProduct(): Product
  createOrder(): Order
  createPayment(): Payment
  # ... 50種類の生成メソッド

# 良い例: 責任を分離
UserFactory:
  createUser(): User

ProductFactory:
  createProduct(): Product
```

### 3. 隠れた依存関係

```
# 悪い例: ファクトリ内で依存関係を隠蔽
ExecutorFactory:
  create():
    return new Executor(
      GlobalConfig.getInstance(),  # 隠れた依存
      ServiceLocator.getLogger(),  # 隠れた依存
    )

# 良い例: 明示的な依存関係
ExecutorFactory:
  constructor(config: Config, logger: Logger):
    this.config = config
    this.logger = logger

  create():
    return new Executor(this.config, this.logger)
```

---

## 関連スキル

- `.claude/skills/design-patterns-behavioral/SKILL.md`: 行動パターン
- `.claude/skills/plugin-architecture/SKILL.md`: プラグインアーキテクチャ
- `.claude/skills/interface-segregation/SKILL.md`: ISP 準拠設計
- `.claude/skills/open-closed-principle/SKILL.md`: OCP 準拠設計

---

## 参考文献

- **『Design Patterns』** Erich Gamma 他著（GoF 本）
- **『Head First Design Patterns』** Eric Freeman 著
- **『Clean Architecture』** Robert C. Martin 著

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                   |
| ---------- | ---------- | -------------------------------------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版リリース - Factory Method、Abstract Factory、Builder、Registry Factory |
