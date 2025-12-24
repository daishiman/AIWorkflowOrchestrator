---
name: .claude/skills/interface-segregation/SKILL.md
description: |
  SOLID原則のインターフェース分離原則（ISP）を専門とするスキル。
  Robert C. Martinの『アジャイルソフトウェア開発の奥義』に基づき、
  クライアントが使用しないメソッドへの依存を強制しない、
  小さく焦点を絞ったインターフェース設計を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/interface-segregation/resources/fat-interface-detection.md`: 空実装/例外スロー/条件付き実装による肥大化検出手法
  - `.claude/skills/interface-segregation/resources/interface-composition.md`: allOf/extends/mixinによる小インターフェース組み合わせパターン
  - `.claude/skills/interface-segregation/resources/isp-principles.md`: クライアント固有インターフェース分離とSOLID準拠設計
  - `.claude/skills/interface-segregation/resources/role-interface-design.md`: 役割ベース（IValidatable/IRetryable等）インターフェース設計手法
  - `.claude/skills/interface-segregation/scripts/analyze-interface.mjs`: インターフェース凝集性とISP違反の自動検出
  - `.claude/skills/interface-segregation/templates/segregated-interface-template.md`: コア+拡張インターフェース分離設計テンプレート

  専門分野:
  - ISP原則: クライアント固有のインターフェース分離
  - Role Interface: 役割ベースのインターフェース設計
  - Fat Interface: 肥大化インターフェースの検出と分割
  - Interface Cohesion: インターフェースの凝集性設計

  使用タイミング:
  - IWorkflowExecutorのようなコアインターフェースを設計する時
  - 既存インターフェースの肥大化を検出した時
  - 複数のクライアントが異なる機能を必要とする時
  - インターフェースの分割を検討する時

  Use proactively when designing core interfaces, detecting fat interfaces,
version: 1.0.0
---

# Interface Segregation Principle (ISP)

## 概要

このスキルは、SOLID 原則の一つであるインターフェース分離原則（ISP）に関する知識を提供します。

**ISP の定義**: クライアントは、自分が使用しないメソッドに依存することを強制されるべきではない。

**主要な価値**:

- 必要最小限のインターフェースによる疎結合
- クライアント固有のインターフェースによる柔軟性
- 肥大化インターフェースの回避

**対象ユーザー**:

- ワークフローエンジンのインターフェースを設計するエージェント
- 既存インターフェースをリファクタリングする開発者
- SOLID 原則に準拠した設計を行うチーム

## リソース構造

```
interface-segregation/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── isp-principles.md                       # ISP原則の詳細
│   ├── fat-interface-detection.md              # 肥大化インターフェースの検出
│   ├── role-interface-design.md                # 役割ベースインターフェース設計
│   └── interface-composition.md                # インターフェースの組み合わせ
├── scripts/
│   └── analyze-interface.mjs                   # インターフェース分析スクリプト
└── templates/
    └── segregated-interface-template.md        # 分離インターフェーステンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# ISP原則詳細
cat .claude/skills/interface-segregation/resources/isp-principles.md

# 肥大化インターフェースの検出
cat .claude/skills/interface-segregation/resources/fat-interface-detection.md

# 役割ベースインターフェース設計
cat .claude/skills/interface-segregation/resources/role-interface-design.md

# インターフェースの組み合わせ
cat .claude/skills/interface-segregation/resources/interface-composition.md
```

### スクリプト実行

```bash
# インターフェース分析
node .claude/skills/interface-segregation/scripts/analyze-interface.mjs <file.ts>
```

### テンプレート参照

```bash
# 分離インターフェーステンプレート
cat .claude/skills/interface-segregation/templates/segregated-interface-template.md
```

---

## 核心知識

### 1. ISP 原則の本質

**問題**: 肥大化したインターフェース（Fat Interface）

```
# 悪い例: 肥大化インターフェース
IWorkflowExecutor:
  + type: string
  + execute(): Promise<Output>
  + validate(): ValidationResult
  + rollback(): Promise<void>        # すべての実装者が必要か？
  + onProgress(): void               # すべての実装者が必要か？
  + getMetrics(): Metrics            # すべての実装者が必要か？
  + scheduleRetry(): void            # すべての実装者が必要か？
```

**解決**: 小さく焦点を絞ったインターフェース

```
# 良い例: 分離されたインターフェース
IWorkflowExecutor:
  + type: string
  + execute(): Promise<Output>

IValidatable:
  + validate(): ValidationResult

IRollbackable:
  + rollback(): Promise<void>

IProgressReporter:
  + onProgress(): void

IMetricsProvider:
  + getMetrics(): Metrics
```

### 2. 分離の判断基準

**インターフェースを分離すべき兆候**:

| 兆候               | 説明                                     |
| ------------------ | ---------------------------------------- |
| 空実装             | 一部の実装クラスでメソッドが空           |
| 例外スロー         | `NotImplementedError` が発生             |
| 条件付き実装       | 特定の条件でのみ機能する                 |
| 異なるクライアント | 異なるクライアントが異なるメソッドを使用 |

**分離のメリット**:

- 実装クラスの負担軽減
- 変更の影響範囲の限定
- テストの簡素化
- 再利用性の向上

### 3. ワークフローエンジンへの適用

**コアインターフェース（必須）**:

```
IWorkflowExecutor<TInput, TOutput>:
  + readonly type: string
  + readonly displayName: string
  + readonly description: string
  + execute(input: TInput, context: ExecutionContext): Promise<TOutput>
```

**拡張インターフェース（オプショナル）**:

```
# 入力検証が必要な場合のみ実装
IValidatable<TInput>:
  + validate(input: TInput): ValidationResult

# リトライ判定が必要な場合のみ実装
IRetryable:
  + canRetry(error: Error): boolean

# ロールバック機能が必要な場合のみ実装
IRollbackable:
  + rollback(context: ExecutionContext): Promise<void>

# 進捗レポートが必要な場合のみ実装
IProgressReporter:
  + onProgress(progress: Progress): void

# メトリクス提供が必要な場合のみ実装
IMetricsProvider:
  + getMetrics(): ExecutorMetrics
```

**実装例**:

```
# シンプルな実装（コアのみ）
SimpleExecutor implements IWorkflowExecutor:
  # executeのみ実装

# 検証付き実装
ValidatingExecutor implements IWorkflowExecutor, IValidatable:
  # execute + validate を実装

# フル機能実装
FullFeaturedExecutor implements
  IWorkflowExecutor,
  IValidatable,
  IRetryable,
  IRollbackable,
  IProgressReporter:
  # すべてを実装
```

### 4. インターフェースの凝集性

**高凝集なインターフェース**:

- 関連するメソッドのみを含む
- 単一の責任を持つ
- クライアントが全てのメソッドを使用する

**凝集性の指標**:

| 指標       | 高凝集     | 低凝集     |
| ---------- | ---------- | ---------- |
| メソッド数 | 1-5 個     | 10 個以上  |
| 使用率     | 80%以上    | 50%未満    |
| 変更頻度   | 同時に変更 | 個別に変更 |

---

## 実装ワークフロー

### Phase 1: インターフェース分析

1. 既存インターフェースの特定
2. メソッドの使用状況調査
3. クライアントごとの依存関係マッピング

**判断基準**:

- [ ] 全クライアントが全メソッドを使用しているか？
- [ ] 空実装や例外スローがないか？
- [ ] メソッド間の凝集性は高いか？

### Phase 2: 分離設計

1. 役割ベースのグループ分け
2. コアインターフェースの特定
3. 拡張インターフェースの設計

**判断基準**:

- [ ] 各インターフェースは単一の責任を持つか？
- [ ] インターフェースの命名は役割を反映しているか？
- [ ] 適切な粒度か（細かすぎず、粗すぎず）？

### Phase 3: 実装適用

1. 既存実装のインターフェース対応
2. 必要なインターフェースのみ実装
3. クライアントコードの更新

**判断基準**:

- [ ] 実装クラスは必要なインターフェースのみ実装しているか？
- [ ] クライアントは使用するインターフェースのみに依存しているか？
- [ ] 後方互換性は維持されているか？

### Phase 4: 検証

1. ISP 準拠の確認
2. テストの更新
3. ドキュメントの更新

**判断基準**:

- [ ] 空実装が排除されたか？
- [ ] 各インターフェースの凝集性は高いか？
- [ ] テストカバレッジは維持されているか？

---

## アンチパターン

### 1. 肥大化インターフェース（Fat Interface）

```
# 悪い例
IDoEverything:
  + methodA()
  + methodB()
  + methodC()
  # ... 20個のメソッド

# 結果: 多くの実装で空メソッドや例外が発生
```

### 2. 過度な分離（Interface Explosion）

```
# 悪い例: 1メソッド1インターフェース
ICanExecute:
  + execute()

ICanValidate:
  + validate()

IHasType:
  + type: string

# 結果: インターフェースが多すぎて管理困難
```

### 3. マーカーインターフェース乱用

```
# 悪い例: 空のインターフェース
ISpecialExecutor:
  # メソッドなし、マーキング目的のみ

# 結果: 型チェックの意味が薄れる
```

---

## 関連スキル

- `.claude/skills/solid-principles/SKILL.md`: SOLID 原則全般
- `.claude/skills/design-patterns-behavioral/SKILL.md`: 行動パターン
- `.claude/skills/open-closed-principle/SKILL.md`: OCP 準拠設計
- `.claude/skills/factory-patterns/SKILL.md`: Factory 実装

---

## 参考文献

- **『アジャイルソフトウェア開発の奥義』** Robert C. Martin 著
- **『Clean Architecture』** Robert C. Martin 著
- **『Design Patterns』** Erich Gamma 他著

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                    |
| ---------- | ---------- | ----------------------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版リリース - ISP 原則、分離設計、ワークフローエンジン適用 |
