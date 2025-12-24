---
name: .claude/skills/few-shot-learning-patterns/SKILL.md
description: |
  Few-Shot Learning（少数例示学習）のパターンとベストプラクティスを提供するスキル。
  効果的な例示の設計、構造化、配置により、AIの出力品質を大幅に向上させます。
  専門分野:
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/domain-specific-patterns.md`: domain-specific-patterns のパターン集
  - `resources/example-design-principles.md`: example-design-principles の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/shot-count-strategies.md`: shot-count-strategies の詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/advanced-few-shot.md`: advanced-few-shot のテンプレート
  - `templates/basic-few-shot.md`: basic-few-shot のテンプレート
  
  Use proactively when handling few shot learning patterns tasks.
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

# Few-Shot Learning Patterns

## 概要

Few-Shot Learning（少数例示学習）のパターンとベストプラクティスを提供するスキル。
効果的な例示の設計、構造化、配置により、AIの出力品質を大幅に向上させます。
専門分野:

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
- AIに特定の出力形式を学習させたい時
- 複雑なタスクの期待出力を示したい時
- 一貫した出力スタイルを確立したい時
- Zero-Shotで十分な結果が得られない時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/few-shot-learning-patterns/resources/Level1_basics.md
cat .claude/skills/few-shot-learning-patterns/resources/Level2_intermediate.md
cat .claude/skills/few-shot-learning-patterns/resources/Level3_advanced.md
cat .claude/skills/few-shot-learning-patterns/resources/Level4_expert.md
cat .claude/skills/few-shot-learning-patterns/resources/domain-specific-patterns.md
cat .claude/skills/few-shot-learning-patterns/resources/example-design-principles.md
cat .claude/skills/few-shot-learning-patterns/resources/legacy-skill.md
cat .claude/skills/few-shot-learning-patterns/resources/shot-count-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/few-shot-learning-patterns/scripts/log_usage.mjs --help
node .claude/skills/few-shot-learning-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/few-shot-learning-patterns/templates/advanced-few-shot.md
cat .claude/skills/few-shot-learning-patterns/templates/basic-few-shot.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
