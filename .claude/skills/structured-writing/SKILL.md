---
name: .claude/skills/structured-writing/SKILL.md
description: |
  DITA、トピックベースライティング、モジュール構造設計に基づく構造化ライティングの専門スキル。
  
  📖 参照書籍:
  - 『Software Requirements』（Karl Wiegers）: 要求分析
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/content-reuse.md`: Content Reuseリソース
  - `references/dita-principles.md`: Dita Principlesリソース
  - `references/information-architecture.md`: Information Architectureリソース
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/modular-design.md`: Modular Designリソース
  - `references/topic-types.md`: Topic Typesリソース
  - `scripts/analyze-structure.mjs`: Analyze Structureスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/concept-topic.md`: Concept Topicテンプレート
  - `assets/reference-topic.md`: Reference Topicテンプレート
  - `assets/task-topic.md`: Task Topicテンプレート
  - `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling structured writing tasks.
---

# Structured Writing

## 概要

DITA、トピックベースライティング、モジュール構造設計に基づく構造化ライティングの専門スキル。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

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
- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/structured-writing/references/Level1_basics.md
cat .claude/skills/structured-writing/references/Level2_intermediate.md
cat .claude/skills/structured-writing/references/Level3_advanced.md
cat .claude/skills/structured-writing/references/Level4_expert.md
cat .claude/skills/structured-writing/references/content-reuse.md
cat .claude/skills/structured-writing/references/dita-principles.md
cat .claude/skills/structured-writing/references/information-architecture.md
cat .claude/skills/structured-writing/references/legacy-skill.md
cat .claude/skills/structured-writing/references/modular-design.md
cat .claude/skills/structured-writing/references/topic-types.md
```

### スクリプト実行
```bash
node .claude/skills/structured-writing/scripts/analyze-structure.mjs --help
node .claude/skills/structured-writing/scripts/log_usage.mjs --help
node .claude/skills/structured-writing/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/structured-writing/assets/concept-topic.md
cat .claude/skills/structured-writing/assets/reference-topic.md
cat .claude/skills/structured-writing/assets/task-topic.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
