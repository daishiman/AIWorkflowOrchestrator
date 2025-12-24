---
name: .claude/skills/use-case-modeling/SKILL.md
description: |
  ユースケース駆動の要件分析スキル。ユーザーとシステムの対話を構造化し、

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/use-case-modeling/resources/actor-identification.md`: Actor Identificationリソース
  - `.claude/skills/use-case-modeling/resources/scenario-patterns.md`: Scenario Patternsリソース
  - `.claude/skills/use-case-modeling/resources/use-case-relationships.md`: Use Case Relationshipsリソース

  - `.claude/skills/use-case-modeling/templates/use-case-template.md`: Use Caseテンプレート

  - `.claude/skills/use-case-modeling/scripts/validate-use-case.mjs`: Validate Use Caseスクリプト

version: 1.0.0
---

# Use Case Modeling

## 概要

このスキルは、ユースケース駆動の要件分析手法を提供します。
ユーザーとシステムの対話を構造化し、明確なシナリオとして可視化することで、
実装の方向性を定め、ステークホルダー間の認識を統一します。

**核心概念**:

- **アクター中心**: ユーザー視点での要件定義
- **ゴール指向**: 達成したいことを明確化
- **フロー網羅**: 正常系・代替系・例外系を完全にカバー
- **状態明確化**: 事前条件・事後条件の定義

**主要な価値**:

- ユーザーの視点から要件を可視化
- シナリオベースのテストケース設計への直結
- ステークホルダーとの共通理解の形成

**プロジェクト固有の適用**（master_system_design.md 準拠）:

このスキルは以下のプロジェクト要件を反映してユースケースを設計します:

- **ハイブリッドアーキテクチャ**（第4.1, 5.1節）:
  - アクター分離: shared/ と features/ の責務に基づくアクター分類
  - 機能プラグイン: features/[機能名]/ ごとの独立したユースケース
  - 共通インフラ: shared/infrastructure からの AI、DB、Discord 利用を前提

- **TDD原則**（第1.5, 2.4節）:
  - ユースケース → テスト → 実装の順序を厳守
  - ユースケース記述がテストケース設計の起点となる
  - 受け入れ基準との整合性を必須とする

- **テスト戦略**（第2.4節）:
  - テストピラミッド: 静的テスト（100%）→ ユニットテスト（60%）→ 統合テスト → E2E
  - ユースケースフローが Vitest（ユニット）と Playwright（E2E）テストに対応
  - features/[機能名]/**tests**/ への配置を前提とした記述

- **アクター定義**（第1.3節）:
  - 開発者: 機能プラグインを追加実装する者
  - 運用者: システムの監視・保守を行う者
  - エンドユーザー: Discord/LINE経由でワークフローを実行する者

## リソース構造

```
use-case-modeling/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── actor-identification.md                 # アクター特定ガイド
│   ├── flow-design-patterns.md                 # フロー設計パターン
│   ├── granularity-guide.md                    # 粒度設計ガイド
│   └── scenario-coverage.md                    # シナリオ網羅性ガイド
├── scripts/
│   └── validate-usecase.mjs                    # ユースケース検証スクリプト
└── templates/
    └── usecase-template.md                     # ユースケーステンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# アクター特定ガイド
cat .claude/skills/use-case-modeling/resources/actor-identification.md

# フロー設計パターン
cat .claude/skills/use-case-modeling/resources/flow-design-patterns.md

# 粒度設計ガイド
cat .claude/skills/use-case-modeling/resources/granularity-guide.md

# シナリオ網羅性ガイド
cat .claude/skills/use-case-modeling/resources/scenario-coverage.md
```

### テンプレート参照

```bash
# ユースケーステンプレート
cat .claude/skills/use-case-modeling/templates/usecase-template.md
```

## いつ使うか

### シナリオ 1: ユーザーストーリーの詳細化

**状況**: 「〜として、〜したい」形式のストーリーを詳細化

**適用条件**:

- [ ] ユーザーストーリーが存在
- [ ] 具体的な操作フローが不明確
- [ ] 実装可能な詳細度が必要

**期待される成果**: UC-XXX 形式のユースケース記述

### シナリオ 2: システム対話の設計

**状況**: ユーザーとシステムの対話を設計する

**適用条件**:

- [ ] 対話型の機能を設計
- [ ] 複数のシナリオが想定される
- [ ] エラーケースの洗い出しが必要

**期待される成果**: 基本フロー・代替フロー・例外フローの完全な記述

## ワークフロー

### Phase 1: アクターの特定

**目的**: システムを使用するアクターを明確化

**ステップ**:

1. プライマリアクターの特定
   - システムのゴールを達成するユーザー
2. セカンダリアクターの特定
   - システムに情報を提供する外部システム
   - システムから情報を受け取る外部システム
3. アクターの役割と権限の定義

**判断基準**:

- [ ] すべてのアクターが特定されているか？
- [ ] 各アクターの役割が明確か？
- [ ] 権限の違いが反映されているか？

**リソース**: `resources/actor-identification.md`

### Phase 2: ゴールの定義

**目的**: 各アクターが達成したいゴールを明確化

**ステップ**:

1. アクターごとのゴール洗い出し
2. ゴールの階層化（高レベル・低レベル）
3. ユースケースの範囲決定

**判断基準**:

- [ ] ゴールが明確で達成可能か？
- [ ] ゴールの粒度が適切か？
- [ ] ユースケースの範囲が明確か？

### Phase 3: フローの設計

**目的**: ユーザーとシステムの対話を設計

**ステップ**:

1. 基本フロー（ハッピーパス）の記述
2. 代替フロー（条件分岐）の特定と記述
3. 例外フロー（エラー）の特定と記述
4. 事前条件・事後条件の定義

**判断基準**:

- [ ] 基本フローが論理的な順序か？
- [ ] 代替フローと例外フローが区別されているか？
- [ ] 事前条件・事後条件が明確か？

**リソース**: `resources/flow-design-patterns.md`

### Phase 4: シナリオの検証

**目的**: シナリオの網羅性と整合性を検証

**ステップ**:

1. シナリオの網羅性確認
2. ユースケース間の整合性確認
3. テストケースへの変換可能性確認

**判断基準**:

- [ ] すべてのシナリオがカバーされているか？
- [ ] ユースケース間で矛盾がないか？
- [ ] テストケースに変換可能か？

## ユースケース記述フォーマット

```markdown
## ユースケース: [名前]

**ID**: UC-XXX
**アクター**: [プライマリアクター]、[セカンダリアクター]
**ゴール**: [ユーザーが達成したいこと]

**事前条件**:

- [実行前に満たすべき状態]

**基本フロー**（正常系）:

1. [アクター]が[アクション]
2. システムが[応答]
3. ...

**代替フロー**（条件分岐）:

- 2a. [条件]の場合: [代替処理]

**例外フロー**（エラー）:

- E1. [エラー条件]: [エラー処理]

**事後条件**:

- [実行後の期待状態]
```

## ベストプラクティス

### すべきこと

1. **適切な粒度**:
   - 1 ユースケース = 1 つの明確なゴール
   - 5-15 ステップ程度のフロー

2. **能動態で記述**:
   - ✅ 「ユーザーがログインボタンをクリックする」
   - ❌ 「ログインボタンがクリックされる」

3. **システム応答の明示**:
   - ユーザーアクションごとにシステム応答を記述

### 避けるべきこと

1. **UI の詳細**:
   - ❌ 「青いボタンを押す」
   - ✅ 「ログインボタンをクリックする」

2. **技術的詳細**:
   - ❌ 「SQL クエリを実行」
   - ✅ 「データを取得」

3. **粒度の不統一**:
   - 大きすぎ: 複数のゴールを含む
   - 小さすぎ: 1 つの画面操作

## 関連スキル

- **.claude/skills/requirements-engineering/SKILL.md** (`.claude/skills/requirements-engineering/SKILL.md`): 要件工学
- **.claude/skills/acceptance-criteria-writing/SKILL.md** (`.claude/skills/acceptance-criteria-writing/SKILL.md`): 受け入れ基準
- **.claude/skills/interview-techniques/SKILL.md** (`.claude/skills/interview-techniques/SKILL.md`): ヒアリング技法

## メトリクス

### フロー網羅性

**測定方法**: (カバーされたフロー数 / 必要なフロー数) × 100
**目標**: >95%

### ユースケース品質スコア

- アクターの明確さ (0-10)
- ゴールの明確さ (0-10)
- フローの論理性 (0-10)
- 条件の網羅性 (0-10)
  **目標**: 平均 8 点以上

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-25 | 初版作成 |

## 参考文献

- **『Writing Effective Use Cases』** Alistair Cockburn 著
- **『User Story Mapping』** Jeff Patton 著
