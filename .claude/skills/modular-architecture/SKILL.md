---
name: modular-architecture
description: |
  モジュラーアーキテクチャとコンポーネント分割の設計を専門とするスキル。高凝集・低結合の原則に基づいたシステム設計、依存関係の管理、スケーラブルなアーキテクチャパターンの実装を支援します。

  **Anchors**:
  • 『Clean Architecture』（Robert C. Martin）/ 適用: レイヤー分離と依存関係ルール / 目的: ビジネスロジックとインフラストラクチャの分離
  • 『Domain-Driven Design』（Eric Evans）/ 適用: 境界づけられたコンテキストとモジュール設計 / 目的: ドメインモデルの凝集性向上
  • 『Design Patterns』（Gang of Four）/ 適用: モジュール間の結合度管理 / 目的: 柔軟な拡張と変更への対応
  • 『Building Microservices』（Sam Newman）/ 適用: モジュール境界の決定 / 目的: 独立性と再利用性の最大化

  **Triggers**:
  • モジュラーアーキテクチャを設計する必要がある時に使用
  • システムをコンポーネントに分割する必要がある時に使用
  • モジュール間の依存関係を整理する必要がある時に使用
  • 高凝集・低結合の設計原則を適用する時に使用
  • スケーラブルなアーキテクチャパターンを実装する時に使用
  • レイヤーアーキテクチャや境界を定義する時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Modular Architecture

## 概要

モジュラーアーキテクチャとコンポーネント分割の設計を専門とするスキル。高凝集・低結合の原則に基づいたシステム設計、依存関係の管理、スケーラブルなアーキテクチャパターンの実装を支援します。

詳細な手順や背景は `references/Level1_basics.md` から順に参照してください。

## ワークフロー

### Phase 1: アーキテクチャ分析とモジュール設計

**目的**: システムの要件を理解し、適切なモジュール分割を決定する

**アクション**:

1. システム要件とドメイン境界を明確化
2. 機能的凝集性と技術的凝集性を分析
3. `references/Level1_basics.md` で基礎概念を確認
4. モジュール境界の候補を特定

**Task**: `agents/analyze-architecture.md` を参照

### Phase 2: モジュール設計と依存関係の定義

**目的**: モジュールの責務を定義し、依存関係を整理する

**アクション**:

1. 各モジュールの責務と境界を定義
2. モジュール間のインターフェースを設計
3. 依存関係の方向性を決定（依存性逆転の原則を適用）
4. `references/Level2_intermediate.md` で設計パターンを確認
5. `assets/module-interface-template.ts` を参照して実装

**Task**: `agents/design-modules.md` を参照

### Phase 3: 実装と検証

**目的**: 設計に基づいてモジュールを実装し、品質を確認する

**アクション**:

1. モジュール構造を実装
2. 依存関係の循環参照をチェック
3. `scripts/validate-dependencies.mjs` で依存関係を検証
4. `references/Level3_advanced.md` で高度なパターンを確認
5. テストとドキュメントの作成

**Task**: `agents/implement-modules.md` を参照

### Phase 4: 最適化と記録

**目的**: アーキテクチャを最適化し、ナレッジを記録する

**アクション**:

1. パフォーマンスとスケーラビリティを確認
2. `references/Level4_expert.md` でエキスパートパターンを確認
3. アーキテクチャドキュメントの更新
4. `scripts/log_usage.mjs` で使用記録を保存

**Task**: `agents/optimize-architecture.md` を参照

## Task仕様ナビ

| Task                   | 概要                                       | 対応する Phase | リソース                                    |
| ---------------------- | ------------------------------------------ | -------------- | ------------------------------------------- |
| アーキテクチャ分析     | システム要件とドメイン境界の分析           | Phase 1        | Level1_basics.md, cohesion-principles.md    |
| モジュール境界の決定   | 凝集性と結合度に基づいた境界の特定         | Phase 1        | Level1_basics.md, bounded-contexts.md       |
| 責務定義               | 各モジュールの単一責任の明確化             | Phase 2        | Level2_intermediate.md, srp-patterns.md     |
| インターフェース設計   | モジュール間の契約と通信方法の設計         | Phase 2        | Level2_intermediate.md, interface-design.md |
| 依存関係管理           | 依存性逆転の原則に基づいた依存関係の整理   | Phase 2, 3     | Level2_intermediate.md, dip-patterns.md     |
| レイヤーアーキテクチャ | レイヤー分離と責務の配置                   | Phase 2, 3     | Level3_advanced.md, layered-architecture.md |
| モジュール実装         | 設計に基づいたコード実装                   | Phase 3        | module-structure-template.ts                |
| 循環依存の解消         | 依存関係グラフの分析と循環の排除           | Phase 3        | validate-dependencies.mjs                   |
| スケーラビリティ最適化 | パフォーマンスとスケーラビリティの向上     | Phase 4        | Level4_expert.md, scalability-patterns.md   |
| アーキテクチャ文書化   | ADR（Architecture Decision Records）の作成 | Phase 4        | adr-template.md                             |

## ベストプラクティス

### すべきこと

- ビジネスロジックとインフラストラクチャを明確に分離する
- 各モジュールに単一の明確な責任を持たせる
- 依存性逆転の原則を適用し、抽象に依存させる
- モジュール間のインターフェースを明示的に定義する
- 循環依存を避け、依存関係を一方向に保つ
- ドメイン駆動設計の境界づけられたコンテキストを活用する
- アーキテクチャの決定を ADR として文書化する
- テスト容易性を考慮したモジュール設計を行う

### 避けるべきこと

- 神クラスやゴッドオブジェクトを作成する
- 複数の関心事を1つのモジュールに混在させる
- 具体的な実装に直接依存する
- モジュール間の暗黙的な依存関係を許容する
- 循環依存を放置する
- レイヤーを飛び越えた直接アクセスを許可する
- アーキテクチャの決定を文書化せずに進める
- テストを困難にする密結合な設計を採用する

## リソース参照

### リソース読み取り

```bash
# 基礎から専門的内容まで段階的に学習
cat .claude/skills/modular-architecture/references/Level1_basics.md
cat .claude/skills/modular-architecture/references/Level2_intermediate.md
cat .claude/skills/modular-architecture/references/Level3_advanced.md
cat .claude/skills/modular-architecture/references/Level4_expert.md

# パターン別詳細
cat .claude/skills/modular-architecture/references/cohesion-principles.md
cat .claude/skills/modular-architecture/references/coupling-patterns.md
cat .claude/skills/modular-architecture/references/bounded-contexts.md
cat .claude/skills/modular-architecture/references/srp-patterns.md
cat .claude/skills/modular-architecture/references/dip-patterns.md
cat .claude/skills/modular-architecture/references/interface-design.md
cat .claude/skills/modular-architecture/references/layered-architecture.md
cat .claude/skills/modular-architecture/references/scalability-patterns.md
```

### テンプレート参照

```bash
cat .claude/skills/modular-architecture/assets/module-interface-template.ts
cat .claude/skills/modular-architecture/assets/module-structure-template.ts
cat .claude/skills/modular-architecture/assets/adr-template.md
cat .claude/skills/modular-architecture/assets/dependency-graph-template.mmd
```

### スクリプト実行

```bash
node .claude/skills/modular-architecture/scripts/validate-dependencies.mjs --help
node .claude/skills/modular-architecture/scripts/analyze-cohesion.mjs --help
node .claude/skills/modular-architecture/scripts/log_usage.mjs --help
```

## 変更履歴

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に準拠した初期実装 |
