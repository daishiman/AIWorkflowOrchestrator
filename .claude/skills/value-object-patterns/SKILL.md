---
name: .claude/skills/value-object-patterns/SKILL.md
description: |
  ドメイン駆動設計における値オブジェクトの設計と実装パターンを専門とするスキル。
  
  📖 参照書籍:
  - 『Domain-Driven Design』（Eric Evans）: ドメインモデル
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/common-patterns.md`: Common Patternsリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/validation-strategies.md`: Validation Strategiesリソース
  - `resources/value-object-fundamentals.md`: Value Object Fundamentalsリソース
  - `scripts/detect-primitive-obsession.mjs`: Detect Primitive Obsessionスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/composite-value-object.ts`: Composite Value Objectテンプレート
  - `templates/simple-value-object.ts`: Simple Value Objectテンプレート
  
  Use proactively when handling value object patterns tasks.
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

# Value Object Patterns

## 概要

ドメイン駆動設計における値オブジェクトの設計と実装パターンを専門とするスキル。

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
- resources/Level1_basics.md を参照し、適用範囲を明確にする
- resources/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/value-object-patterns/resources/Level1_basics.md
cat .claude/skills/value-object-patterns/resources/Level2_intermediate.md
cat .claude/skills/value-object-patterns/resources/Level3_advanced.md
cat .claude/skills/value-object-patterns/resources/Level4_expert.md
cat .claude/skills/value-object-patterns/resources/common-patterns.md
cat .claude/skills/value-object-patterns/resources/legacy-skill.md
cat .claude/skills/value-object-patterns/resources/validation-strategies.md
cat .claude/skills/value-object-patterns/resources/value-object-fundamentals.md
```

### スクリプト実行
```bash
node .claude/skills/value-object-patterns/scripts/detect-primitive-obsession.mjs --help
node .claude/skills/value-object-patterns/scripts/log_usage.mjs --help
node .claude/skills/value-object-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/value-object-patterns/templates/composite-value-object.ts
cat .claude/skills/value-object-patterns/templates/simple-value-object.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
