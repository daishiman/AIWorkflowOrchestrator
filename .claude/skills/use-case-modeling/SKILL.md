---
name: .claude/skills/use-case-modeling/SKILL.md
description: |
  ユースケース駆動の要件分析スキル。ユーザーとシステムの対話を構造化し、
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/actor-identification.md`: Actor Identificationリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/scenario-patterns.md`: Scenario Patternsリソース
  - `resources/use-case-relationships.md`: Use Case Relationshipsリソース
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-use-case.mjs`: Validate Use Caseスクリプト
  - `templates/use-case-template.md`: Use Caseテンプレート
  
  Use proactively when handling use case modeling tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Use Case Modeling

## 概要

ユースケース駆動の要件分析スキル。ユーザーとシステムの対話を構造化し、

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
cat .claude/skills/use-case-modeling/resources/Level1_basics.md
cat .claude/skills/use-case-modeling/resources/Level2_intermediate.md
cat .claude/skills/use-case-modeling/resources/Level3_advanced.md
cat .claude/skills/use-case-modeling/resources/Level4_expert.md
cat .claude/skills/use-case-modeling/resources/actor-identification.md
cat .claude/skills/use-case-modeling/resources/legacy-skill.md
cat .claude/skills/use-case-modeling/resources/scenario-patterns.md
cat .claude/skills/use-case-modeling/resources/use-case-relationships.md
```

### スクリプト実行
```bash
node .claude/skills/use-case-modeling/scripts/log_usage.mjs --help
node .claude/skills/use-case-modeling/scripts/validate-skill.mjs --help
node .claude/skills/use-case-modeling/scripts/validate-use-case.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/use-case-modeling/templates/use-case-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
