---
name: .claude/skills/design-patterns-behavioral/SKILL.md
description: |
    GoF（Gang of Four）の行動パターンを専門とするスキル。
    エリック・ガンマの『デザインパターン』に基づき、オブジェクト間の通信と
    責務の分散を効果的に設計するパターンを提供します。
    専門分野:
    - Strategy Pattern: アルゴリズムのファミリーをカプセル化し、交換可能にする
    - Template Method Pattern: アルゴリズムの骨格を定義し、サブクラスで詳細を実装
    - Command Pattern: 操作をオブジェクトとしてカプセル化し、実行を遅延または取消可能に
    - Chain of Responsibility: リクエストを処理者のチェーンに沿って渡す
    - Observer Pattern: オブジェクト間の一対多の依存関係を定義
    - State Pattern: オブジェクトの内部状態に応じて動作を変更
    使用タイミング:
    - ワークフローエンジンでアルゴリズムの切り替えが必要な時
    - 共通処理フローを定義し、個別実装を分離したい時
    - 操作の実行、取り消し、キューイングが必要な時
    - イベント駆動アーキテクチャを設計する時
    Use proactively when designing workflow engines, plugin systems,
    or any architecture requiring flexible algorithm selection.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/design-patterns-behavioral/resources/chain-of-responsibility-pattern.md`: リクエスト処理チェーンとミドルウェアパイプラインの設計パターン
  - `.claude/skills/design-patterns-behavioral/resources/command-pattern.md`: 操作のカプセル化とUndo/Redo機能の実装パターン
  - `.claude/skills/design-patterns-behavioral/resources/observer-pattern.md`: 状態変化の自動通知とイベント駆動アーキテクチャの実現
  - `.claude/skills/design-patterns-behavioral/resources/pattern-selection-guide.md`: 適切な行動パターンを選択するための判断フローチャートと比較マトリックス
  - `.claude/skills/design-patterns-behavioral/resources/state-pattern.md`: 状態に応じた振る舞い変更と状態遷移管理
  - `.claude/skills/design-patterns-behavioral/resources/strategy-pattern.md`: アルゴリズムの交換可能性とStrategy実装詳細
  - `.claude/skills/design-patterns-behavioral/resources/template-method-pattern.md`: 共通処理フローの定義とフックポイント設計
  - `.claude/skills/design-patterns-behavioral/templates/strategy-implementation.md`: Strategy パターンの実装テンプレートとコード例
  - `.claude/skills/design-patterns-behavioral/templates/template-method-implementation.md`: Template Method パターンの実装テンプレートとコード例
  - `.claude/skills/design-patterns-behavioral/scripts/validate-pattern-usage.mjs`: パターン使用の適切性を検証するスクリプト

version: 1.0.0
---

# Design Patterns - Behavioral

## 概要

このスキルは、GoF（Gang of Four）が体系化した 23 のデザインパターンのうち、
行動パターン（Behavioral Patterns）に特化した知識を提供します。

行動パターンは、オブジェクト間の通信パターンとアルゴリズムの責務分散に焦点を当て、
柔軟で拡張可能なシステム設計を可能にします。

**主要な価値**:

- アルゴリズムの交換可能性による拡張性の向上
- 共通処理フローの標準化と個別実装の分離
- オブジェクト間の疎結合による保守性の向上

**対象ユーザー**:

- ワークフローエンジンを設計するエージェント
- プラグインシステムを構築する開発者
- 拡張性の高いアーキテクチャを設計するチーム

## リソース構造

```
design-patterns-behavioral/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── strategy-pattern.md                     # Strategyパターン詳細
│   ├── template-method-pattern.md              # Template Methodパターン詳細
│   ├── command-pattern.md                      # Commandパターン詳細
│   ├── chain-of-responsibility-pattern.md      # Chain of Responsibilityパターン詳細
│   ├── observer-pattern.md                     # Observerパターン詳細
│   ├── state-pattern.md                        # Stateパターン詳細
│   └── pattern-selection-guide.md              # パターン選択ガイド
├── scripts/
│   └── validate-pattern-usage.mjs              # パターン使用検証スクリプト
└── templates/
    ├── strategy-implementation.md              # Strategy実装テンプレート
    └── template-method-implementation.md       # Template Method実装テンプレート
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# Strategyパターン詳細
cat .claude/skills/design-patterns-behavioral/resources/strategy-pattern.md

# Template Methodパターン詳細
cat .claude/skills/design-patterns-behavioral/resources/template-method-pattern.md

# Commandパターン詳細
cat .claude/skills/design-patterns-behavioral/resources/command-pattern.md

# Chain of Responsibilityパターン詳細
cat .claude/skills/design-patterns-behavioral/resources/chain-of-responsibility-pattern.md

# Observerパターン詳細
cat .claude/skills/design-patterns-behavioral/resources/observer-pattern.md

# Stateパターン詳細
cat .claude/skills/design-patterns-behavioral/resources/state-pattern.md

# パターン選択ガイド
cat .claude/skills/design-patterns-behavioral/resources/pattern-selection-guide.md
```

### スクリプト実行

```bash
# パターン使用検証
node .claude/skills/design-patterns-behavioral/scripts/validate-pattern-usage.mjs <file.ts>
```

### テンプレート参照

```bash
# Strategy実装テンプレート
cat .claude/skills/design-patterns-behavioral/templates/strategy-implementation.md

# Template Method実装テンプレート
cat .claude/skills/design-patterns-behavioral/templates/template-method-implementation.md
```

---

## 核心知識

### 1. Strategy Pattern（戦略パターン）

**目的**: アルゴリズムのファミリーを定義し、それぞれをカプセル化して交換可能にする

**構成要素**:

- **Strategy（戦略インターフェース）**: アルゴリズムの共通インターフェース
- **ConcreteStrategy（具体的戦略）**: アルゴリズムの具体的実装
- **Context（コンテキスト）**: Strategy を保持し、クライアントとの橋渡しを行う

**適用場面**:

- [ ] 同じ目的を達成する複数のアルゴリズムが存在する
- [ ] アルゴリズムを実行時に切り替える必要がある
- [ ] アルゴリズムの詳細をクライアントから隠蔽したい

**ワークフローエンジンへの適用**:

- IWorkflowExecutor が Strategy Interface
- 各ワークフロー実装（認証、通知等）が Concrete Strategy
- WorkflowEngine が Context

詳細: `resources/strategy-pattern.md`

---

### 2. Template Method Pattern（テンプレートメソッドパターン）

**目的**: アルゴリズムの骨格を定義し、一部の処理をサブクラスに委ねる

**構成要素**:

- **AbstractClass（抽象クラス）**: テンプレートメソッドと抽象メソッドを定義
- **ConcreteClass（具体クラス）**: 抽象メソッドを実装

**Hook Methods（フックメソッド）**:

- オプショナルな拡張ポイント
- デフォルト実装を持ち、必要に応じてオーバーライド

**適用場面**:

- [ ] 複数のクラスに共通のアルゴリズム構造がある
- [ ] アルゴリズムの一部のみが異なる
- [ ] 共通処理を一箇所に集約したい

**ワークフローエンジンへの適用**:

- 共通フロー: 検証 → 前処理 → 実行 → 後処理 → エラーハンドリング
- 各ステップをフックポイントとして提供
- BaseWorkflowExecutor で骨格を定義

詳細: `resources/template-method-pattern.md`

---

### 3. Command Pattern（コマンドパターン）

**目的**: 操作をオブジェクトとしてカプセル化し、実行の遅延・キューイング・取り消しを可能にする

**構成要素**:

- **Command（コマンドインターフェース）**: execute()メソッドを定義
- **ConcreteCommand（具体コマンド）**: 実際の処理を実装
- **Invoker（起動者）**: コマンドの実行を制御
- **Receiver（受信者）**: 実際の処理を行うオブジェクト

**適用場面**:

- [ ] 操作の履歴管理が必要（Undo/Redo）
- [ ] 操作のキューイングやスケジューリングが必要
- [ ] 操作のログ記録が必要

**ワークフローエンジンへの適用**:

- ワークフロー操作を Command としてカプセル化
- 操作履歴の管理とロールバック
- バッチ実行やスケジューリング

詳細: `resources/command-pattern.md`

---

### 4. Chain of Responsibility Pattern（責任の連鎖パターン）

**目的**: リクエストを処理者のチェーンに沿って渡し、適切な処理者が対応

**構成要素**:

- **Handler（ハンドラインターフェース）**: リクエスト処理の共通インターフェース
- **ConcreteHandler（具体ハンドラ）**: 特定のリクエストを処理
- **Client（クライアント）**: チェーンの最初にリクエストを送信

**適用場面**:

- [ ] 複数のオブジェクトがリクエストを処理する可能性がある
- [ ] 処理者を動的に決定したい
- [ ] リクエストの送信者と受信者を疎結合にしたい

**ワークフローエンジンへの適用**:

- バリデーションチェーン
- ミドルウェアパイプライン
- エラーハンドリングチェーン

詳細: `resources/chain-of-responsibility-pattern.md`

---

### 5. Observer Pattern（オブザーバーパターン）

**目的**: オブジェクト間の一対多の依存関係を定義し、状態変化を自動通知

**構成要素**:

- **Subject（サブジェクト）**: 状態を持ち、Observer を管理
- **Observer（オブザーバー）**: 状態変化の通知を受け取るインターフェース
- **ConcreteObserver（具体オブザーバー）**: 通知を受けて処理を行う

**適用場面**:

- [ ] オブジェクトの状態変化を他のオブジェクトに通知したい
- [ ] 通知先を動的に追加・削除したい
- [ ] イベント駆動アーキテクチャを実現したい

**ワークフローエンジンへの適用**:

- ワークフロー状態変化の通知
- ログ記録、メトリクス収集
- UI 更新トリガー

詳細: `resources/observer-pattern.md`

---

### 6. State Pattern（ステートパターン）

**目的**: オブジェクトの内部状態に応じて動作を変更する

**構成要素**:

- **Context（コンテキスト）**: 現在の状態を保持
- **State（状態インターフェース）**: 状態ごとの振る舞いを定義
- **ConcreteState（具体状態）**: 特定の状態での振る舞いを実装

**適用場面**:

- [ ] オブジェクトの振る舞いが状態に依存する
- [ ] 状態遷移のロジックが複雑
- [ ] if-else や switch 文が状態判定で多用されている

**ワークフローエンジンへの適用**:

- ワークフローの状態管理（PENDING → PROCESSING → COMPLETED/FAILED）
- 状態に応じた操作の制限
- 状態遷移の明示的な管理

詳細: `resources/state-pattern.md`

---

## パターン選択ガイド

### 判断フローチャート

```
アルゴリズムを切り替える必要がある？
├─ はい → Strategy Pattern
└─ いいえ
    ↓
共通の処理フローがある？
├─ はい → Template Method Pattern
└─ いいえ
    ↓
操作を履歴管理・取り消しする必要がある？
├─ はい → Command Pattern
└─ いいえ
    ↓
複数のオブジェクトがリクエストを処理する可能性がある？
├─ はい → Chain of Responsibility Pattern
└─ いいえ
    ↓
状態変化を他のオブジェクトに通知する必要がある？
├─ はい → Observer Pattern
└─ いいえ
    ↓
オブジェクトの振る舞いが状態に依存する？
├─ はい → State Pattern
└─ いいえ → 他のパターンを検討
```

### パターン組み合わせ

| 組み合わせ                         | 用途                                |
| ---------------------------------- | ----------------------------------- |
| Strategy + Template Method         | アルゴリズム切り替え + 共通フロー   |
| Strategy + Factory                 | アルゴリズム切り替え + 動的生成     |
| Command + Observer                 | 操作履歴 + 状態通知                 |
| State + Observer                   | 状態管理 + 状態変化通知             |
| Chain of Responsibility + Strategy | パイプライン + アルゴリズム切り替え |

詳細: `resources/pattern-selection-guide.md`

---

## 実装ワークフロー

### Phase 1: パターン選択

1. 要件の分析
2. パターン選択ガイドに基づく判断
3. 適用パターンの決定

**判断基準**:

- [ ] 要件に最も適したパターンが選択されているか？
- [ ] パターンの組み合わせは適切か？
- [ ] 過剰設計になっていないか？

### Phase 2: インターフェース設計

1. パターンの構成要素を特定
2. インターフェースの定義
3. 型パラメータの設計

**判断基準**:

- [ ] インターフェースは最小限か？
- [ ] 型安全性が確保されているか？
- [ ] 拡張性が考慮されているか？

### Phase 3: 実装

1. 抽象クラス/インターフェースの実装
2. 具体クラスの実装
3. コンテキスト/クライアントの実装

**判断基準**:

- [ ] SOLID 原則に準拠しているか？
- [ ] パターンの意図が正しく実現されているか？
- [ ] テスト可能な構造になっているか？

### Phase 4: 検証

1. ユニットテストの作成
2. パターン適用の効果確認
3. リファクタリング

**判断基準**:

- [ ] パターン適用により目的が達成されているか？
- [ ] コードの可読性は向上しているか？
- [ ] パフォーマンスに問題はないか？

---

## 関連スキル

- `.claude/skills/factory-patterns/SKILL.md`: Factory パターンとの組み合わせ
- `.claude/skills/open-closed-principle/SKILL.md`: OCP 準拠設計
- `.claude/skills/interface-segregation/SKILL.md`: インターフェース設計
- `.claude/skills/plugin-architecture/SKILL.md`: プラグインシステム設計

---

## 参考文献

- **『Design Patterns: Elements of Reusable Object-Oriented Software』** Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides 著
- **『Head First デザインパターン』** Eric Freeman, Elisabeth Robson 著
- **『パターン指向リファクタリング入門』** Joshua Kerievsky 著

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                |
| ---------- | ---------- | ----------------------------------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版リリース - 6 つの行動パターン、パターン選択ガイド、実装ワークフロー |
