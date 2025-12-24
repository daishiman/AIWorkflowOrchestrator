---
name: .claude/skills/domain-driven-design/SKILL.md
description: |
  エリック・エヴァンスのドメイン駆動設計（DDD）に基づくドメインモデリングを専門とするスキル。
  Entity、Value Object、Aggregate、Repository Patternを活用して、
  ビジネスロジックを中心に据えた堅牢なドメイン層を設計します。
  
  📖 参照書籍:
  - 『Domain-Driven Design』（Eric Evans）: ドメインモデル
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/aggregate-patterns.md`: aggregate-patterns のパターン集
  - `resources/ddd-building-blocks.md`: ddd-building-blocks の詳細ガイド
  - `resources/entity-design-guide.md`: entity-design-guide のガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/repository-interface-design.md`: repository-interface-design の詳細ガイド
  - `scripts/analyze-dependencies.mjs`: 依存関係を分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-domain-model.mjs`: domainmodelを検証するスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/aggregate-template.ts`: aggregate-template のテンプレート
  - `templates/entity-template.ts`: entity-template のテンプレート
  - `templates/repository-interface-template.ts`: repository-interface-template のテンプレート
  
  Use proactively when handling domain driven design tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Domain-Driven Design"
    author: "Eric Evans"
    concepts:
      - "ドメインモデル"
      - "境界づけられたコンテキスト"
---

# Domain-Driven Design

## 概要

エリック・エヴァンスのドメイン駆動設計（DDD）に基づくドメインモデリングを専門とするスキル。
Entity、Value Object、Aggregate、Repository Patternを活用して、
ビジネスロジックを中心に据えた堅牢なドメイン層を設計します。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- 新しいドメインモデルを設計する時
- エンティティと値オブジェクトの分類を決定する時
- 集約境界を定義する時
- リポジトリインターフェースを設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/domain-driven-design/resources/Level1_basics.md
cat .claude/skills/domain-driven-design/resources/Level2_intermediate.md
cat .claude/skills/domain-driven-design/resources/Level3_advanced.md
cat .claude/skills/domain-driven-design/resources/Level4_expert.md
cat .claude/skills/domain-driven-design/resources/aggregate-patterns.md
cat .claude/skills/domain-driven-design/resources/ddd-building-blocks.md
cat .claude/skills/domain-driven-design/resources/entity-design-guide.md
cat .claude/skills/domain-driven-design/resources/legacy-skill.md
cat .claude/skills/domain-driven-design/resources/repository-interface-design.md
```

### スクリプト実行
```bash
node .claude/skills/domain-driven-design/scripts/analyze-dependencies.mjs --help
node .claude/skills/domain-driven-design/scripts/log_usage.mjs --help
node .claude/skills/domain-driven-design/scripts/validate-domain-model.mjs --help
node .claude/skills/domain-driven-design/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/domain-driven-design/templates/aggregate-template.ts
cat .claude/skills/domain-driven-design/templates/entity-template.ts
cat .claude/skills/domain-driven-design/templates/repository-interface-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
