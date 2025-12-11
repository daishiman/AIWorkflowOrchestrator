---
name: domain-driven-design
description: |
    エリック・エヴァンスのドメイン駆動設計（DDD）に基づくドメインモデリングを専門とするスキル。
    Entity、Value Object、Aggregate、Repository Patternを活用して、
    ビジネスロジックを中心に据えた堅牢なドメイン層を設計します。
    専門分野:
    - Entity設計: ライフサイクルと一意性を持つドメインオブジェクトの定義
    - Value Object設計: 不変で置換可能なドメイン概念の型安全な表現
    - Aggregate設計: トランザクション整合性の境界と不変条件の保護
    - Repository Pattern: 永続化の詳細をドメイン層から隠蔽
    使用タイミング:
    - 新しいドメインモデルを設計する時
    - エンティティと値オブジェクトの分類を決定する時
    - 集約境界を定義する時
    - リポジトリインターフェースを設計する時
    Use proactively when designing domain models, creating entities,
    defining aggregates, or establishing repository patterns.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/domain-driven-design/resources/aggregate-patterns.md`: 集約パターンとトランザクション整合性境界の設計
  - `.claude/skills/domain-driven-design/resources/ddd-building-blocks.md`: Entity、Value Object、Aggregate等のDDDビルディングブロック体系
  - `.claude/skills/domain-driven-design/resources/entity-design-guide.md`: エンティティ設計ガイドとライフサイクル管理
  - `.claude/skills/domain-driven-design/resources/repository-interface-design.md`: リポジトリインターフェース設計と永続化抽象化
  - `.claude/skills/domain-driven-design/templates/aggregate-template.ts`: Aggregate実装のTypeScriptテンプレート
  - `.claude/skills/domain-driven-design/templates/entity-template.ts`: Entity実装のTypeScriptテンプレート
  - `.claude/skills/domain-driven-design/templates/repository-interface-template.ts`: Repositoryインターフェースのテンプレート
  - `.claude/skills/domain-driven-design/scripts/analyze-dependencies.mjs`: ドメインモデルの依存関係分析スクリプト
  - `.claude/skills/domain-driven-design/scripts/validate-domain-model.mjs`: ドメインモデル検証スクリプト

version: 1.0.0
---

# Domain-Driven Design

## 概要

このスキルは、エリック・エヴァンスが提唱したドメイン駆動設計（DDD）の戦術的パターンを
実践するための知識を提供します。ビジネスの本質をモデル化し、技術的詳細から独立した
堅牢なドメイン層を構築する方法論です。

**主要な価値**:

- ビジネスロジックを中心に据えた設計（技術的詳細からの独立）
- Entity、Value Object、Aggregate による構造化されたモデル
- 不変条件の保護によるデータ整合性の確保
- リポジトリパターンによる永続化の抽象化

**対象ユーザー**:

- ドメインモデルを設計するエージェント（@domain-modeler）
- ビジネスロジックを実装する開発者
- アーキテクチャを設計するチーム

## リソース構造

```
domain-driven-design/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── entity-design-guide.md                 # エンティティ設計の詳細ガイド
│   ├── aggregate-patterns.md                  # 集約パターンと境界設計
│   ├── repository-interface-design.md         # リポジトリインターフェース設計
│   └── ddd-building-blocks.md                 # DDDビルディングブロック概要
├── scripts/
│   ├── validate-domain-model.mjs              # ドメインモデル検証スクリプト
│   └── analyze-dependencies.mjs               # ドメイン依存関係分析スクリプト
└── templates/
    ├── entity-template.ts                      # エンティティテンプレート
    ├── aggregate-template.ts                   # 集約テンプレート
    └── repository-interface-template.ts        # リポジトリインターフェーステンプレート
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# エンティティ設計ガイド
cat .claude/skills/domain-driven-design/resources/entity-design-guide.md

# 集約パターン
cat .claude/skills/domain-driven-design/resources/aggregate-patterns.md

# リポジトリインターフェース設計
cat .claude/skills/domain-driven-design/resources/repository-interface-design.md

# DDDビルディングブロック概要
cat .claude/skills/domain-driven-design/resources/ddd-building-blocks.md
```

### スクリプト実行

```bash
# ドメインモデルの検証
node .claude/skills/domain-driven-design/scripts/validate-domain-model.mjs src/shared/core/entities/

# 特定のエンティティファイルを検証
node .claude/skills/domain-driven-design/scripts/validate-domain-model.mjs src/shared/core/entities/Workflow.ts

# ドメイン層の依存関係分析（技術的詳細への依存がないか検証）
node .claude/skills/domain-driven-design/scripts/analyze-dependencies.mjs src/shared/core/
```

### テンプレート参照

```bash
# エンティティテンプレート
cat .claude/skills/domain-driven-design/templates/entity-template.ts

# 集約テンプレート
cat .claude/skills/domain-driven-design/templates/aggregate-template.ts

# リポジトリインターフェーステンプレート
cat .claude/skills/domain-driven-design/templates/repository-interface-template.ts
```

## 核心概念

### 1. エンティティ (Entity)

**定義**: ライフサイクルを通じて一意な識別子（ID）によって識別されるドメインオブジェクト

**識別基準**:

- [ ] ライフサイクルを持つか（作成、変更、削除）
- [ ] 一意な識別子（ID）によって区別されるか
- [ ] 属性が変化しても同一性が保たれるか
- [ ] 継続性が重要か（履歴追跡が必要か）

**設計原則**:

- 識別子は不変であること
- ビジネスロジックをエンティティ内にカプセル化
- 状態遷移のルールを明確に定義
- 不変条件（Invariants）を常に保護

### 2. 値オブジェクト (Value Object)

**定義**: 属性の組み合わせで識別され、不変性を持つドメイン概念

**識別基準**:

- [ ] 属性の組み合わせで識別されるか
- [ ] 不変（Immutable）であるべきか
- [ ] 置換可能か（同じ値なら交換可能）
- [ ] 副作用のない振る舞いを持つか

**設計原則**:

- すべてのプロパティを readonly にする
- コンストラクタでバリデーションを実行
- 等価性判定（equals）を実装
- 変更は新しいインスタンスを返す

### 3. 集約 (Aggregate)

**定義**: トランザクション整合性の境界を定義するエンティティと値オブジェクトの集合

**設計原則**:

- **小さな集約**: 必要最小限のオブジェクトのみを含む
- **集約ルート**: 外部からのアクセスは集約ルートを経由
- **ID による参照**: 他の集約は直接参照せず、ID で参照
- **不変条件の保護**: 集約内で常に成立すべきルールを定義

**判断基準**:

- [ ] トランザクション整合性が必要な範囲を特定したか
- [ ] 集約境界が適切なサイズか（大きすぎないか）
- [ ] 不変条件が明確に定義されているか
- [ ] 集約ルートが特定されているか

### 4. リポジトリ (Repository)

**定義**: 集約の永続化と取得を抽象化するインターフェース

**設計原則**:

- コレクション風のインターフェース（add, find, remove）
- ドメインエンティティを引数・戻り値とする
- 永続化の詳細（SQL 等）を隠蔽
- インターフェースはドメイン層、実装はインフラストラクチャ層

## ワークフロー

### Phase 1: ドメイン概念の分類

**目的**: 各ドメイン概念を Entity、Value Object、Aggregate に分類

**ステップ**:

1. ビジネス要件からドメイン概念を抽出
2. 各概念について同一性の重要性を評価
3. Entity/Value Object に分類
4. 集約境界を特定

**判断フロー**:

```
この概念を考える
  ↓
[質問1] ライフサイクルを持つか？
  ├─ Yes → エンティティの可能性高
  └─ No  → 値オブジェクトの可能性高
  ↓
[質問2] 属性が変化しても同一か？
  ├─ Yes → エンティティ
  └─ No  → 値オブジェクト
  ↓
[質問3] 一意な識別子が必要か？
  ├─ Yes → エンティティ
  └─ No  → 値オブジェクト
```

### Phase 2: エンティティ設計

**目的**: 識別されたエンティティの詳細設計

**ステップ**:

1. 一意な識別子（ID）を定義
2. 属性（プロパティ）を定義
3. 不変条件を明確化
4. 状態遷移ルールを定義
5. ビジネスメソッドを設計

**完了条件**:

- [ ] 識別子が定義されているか
- [ ] 不変条件が実装されているか
- [ ] 状態遷移が制御されているか
- [ ] ビジネスロジックがカプセル化されているか

### Phase 3: 集約設計

**目的**: トランザクション整合性の境界を定義

**ステップ**:

1. 集約ルートを特定
2. 集約に含めるエンティティ/値オブジェクトを決定
3. 不変条件を定義
4. 集約間の参照方法を設計（ID による参照）

**判断基準**:

- [ ] 集約が適切なサイズか
- [ ] 不変条件が集約ルートで保護されているか
- [ ] 他の集約への参照が ID によるものか
- [ ] トランザクション境界が明確か

### Phase 4: リポジトリ設計

**目的**: 永続化の抽象化

**ステップ**:

1. 集約ルートごとにリポジトリインターフェースを定義
2. 必要なクエリメソッドを特定
3. コレクション風のメソッド名を使用
4. ドメインエンティティを戻り値とする

**完了条件**:

- [ ] インターフェースがドメイン層に配置されているか
- [ ] 実装の詳細が漏れていないか
- [ ] 戻り値がドメインエンティティか

## いつ使うか

### シナリオ 1: 新しいドメイン概念の追加

**状況**: 新しいビジネス概念をモデル化する必要がある

**適用条件**:

- [ ] ビジネスルールが明確に定義されている
- [ ] 概念がシステムの中核に関わる
- [ ] 永続化が必要

**期待される成果**: Entity/Value Object として設計されたドメインモデル

### シナリオ 2: 既存モデルのリファクタリング

**状況**: 貧血ドメインモデルを改善したい

**適用条件**:

- [ ] ビジネスロジックがサービス層に散在している
- [ ] プリミティブ型が多用されている
- [ ] データと振る舞いが分離している

**期待される成果**: リッチドメインモデルへの改善

### シナリオ 3: 集約境界の見直し

**状況**: パフォーマンスやデータ整合性の問題がある

**適用条件**:

- [ ] 集約が大きすぎてロックが頻発
- [ ] トランザクションが長時間化
- [ ] 不変条件が複数集約にまたがっている

**期待される成果**: 適切なサイズの集約への再設計

## ベストプラクティス

### すべきこと

1. **不変条件を常に保護**:
   - コンストラクタでバリデーション
   - 不正な状態への遷移を防止
   - ビジネスルールをドメイン内にカプセル化

2. **小さな集約を維持**:
   - 必要最小限のオブジェクトを含む
   - 大きな集約は分割を検討
   - ID による参照で集約間を疎結合に

3. **ユビキタス言語を使用**:
   - クラス名、メソッド名にドメイン用語を使用
   - コードがドキュメントになる設計

### 避けるべきこと

1. **プリミティブ型執着**:
   - ❌ `string`型のメールアドレス
   - ✅ `Email`値オブジェクト

2. **貧血ドメインモデル**:
   - ❌ getter/setter のみのエンティティ
   - ✅ ビジネスロジックを含むリッチモデル

3. **集約の肥大化**:
   - ❌ 関連するものをすべて含める
   - ✅ トランザクション境界で必要なもののみ

## トラブルシューティング

### 問題 1: Entity/Value Object の分類が困難

**症状**: 概念をどちらに分類すべきか判断できない

**原因**: 同一性の重要性が不明確

**解決策**:

1. 「この概念の 2 つのインスタンスが同じ属性を持つとき、同一と見なすか？」を自問
2. Yes → Value Object
3. No（別々のものとして追跡する必要がある） → Entity

### 問題 2: 集約が大きくなりすぎる

**症状**: 集約に多くのエンティティが含まれ、パフォーマンスが低下

**原因**: 整合性要件の過剰解釈

**解決策**:

1. 本当にトランザクション整合性が必要か再評価
2. 結果整合性で十分な場合は集約を分割
3. ドメインイベントで集約間を連携

### 問題 3: リポジトリの責務過剰

**症状**: リポジトリにビジネスロジックが混入

**原因**: ドメインサービスとの境界が不明確

**解決策**:

1. リポジトリは CRUD 操作に限定
2. 複雑なクエリはドメインサービスへ
3. ビジネスルールはエンティティ/ドメインサービスへ

## 関連スキル

- **ubiquitous-language** (`.claude/skills/ubiquitous-language/SKILL.md`): ユビキタス言語の確立
- **value-object-patterns** (`.claude/skills/value-object-patterns/SKILL.md`): 値オブジェクト設計パターン
- **domain-services** (`.claude/skills/domain-services/SKILL.md`): ドメインサービス設計
- **bounded-context** (`.claude/skills/bounded-context/SKILL.md`): 境界付けられたコンテキスト

## 参考文献

- **『エリック・エヴァンスのドメイン駆動設計』** エリック・エヴァンス著
  - 第 5 章: ソフトウェアで表現されたモデル
  - 第 6 章: ドメインオブジェクトのライフサイクル

- **『実践ドメイン駆動設計』** ヴォーン・ヴァーノン著
  - 第 5 章: エンティティ
  - 第 6 章: 値オブジェクト
  - 第 10 章: 集約

- **『ドメイン駆動設計入門』** 成瀬允宣著
  - 第 2 章: 値オブジェクト
  - 第 4 章: ドメインサービス

## 変更履歴

| バージョン | 日付       | 変更内容                                                                       |
| ---------- | ---------- | ------------------------------------------------------------------------------ |
| 1.0.0      | 2025-11-25 | 初版作成 - DDD の戦術的パターン（Entity, Value Object, Aggregate, Repository） |
