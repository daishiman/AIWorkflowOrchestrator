---
name: .claude/skills/dependency-analysis/SKILL.md
description: |
  ソフトウェアの依存関係分析と循環参照検出を専門とするスキル。
  依存関係グラフの構築、循環依存の検出、安定度メトリクスの算出により、
  アーキテクチャの健全性を評価します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/circular-dependency.md`: circular-dependency の詳細ガイド
  - `resources/dependency-graph.md`: dependency-graph の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/stability-metrics.md`: stability-metrics の詳細ガイド
  - `scripts/analyze-dependencies.mjs`: 依存関係を分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/dependency-report.md`: dependency-report のテンプレート
  
  Use proactively when handling dependency analysis tasks.
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

# Dependency Analysis

## 概要

ソフトウェアの依存関係分析と循環参照検出を専門とするスキル。
依存関係グラフの構築、循環依存の検出、安定度メトリクスの算出により、
アーキテクチャの健全性を評価します。

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
- モジュール間の依存関係を可視化する時
- 循環参照を検出・解消する時
- アーキテクチャの安定性を評価する時
- リファクタリングの影響範囲を分析する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/dependency-analysis/resources/Level1_basics.md
cat .claude/skills/dependency-analysis/resources/Level2_intermediate.md
cat .claude/skills/dependency-analysis/resources/Level3_advanced.md
cat .claude/skills/dependency-analysis/resources/Level4_expert.md
cat .claude/skills/dependency-analysis/resources/circular-dependency.md
cat .claude/skills/dependency-analysis/resources/dependency-graph.md
cat .claude/skills/dependency-analysis/resources/legacy-skill.md
cat .claude/skills/dependency-analysis/resources/stability-metrics.md
```

### スクリプト実行
```bash
node .claude/skills/dependency-analysis/scripts/analyze-dependencies.mjs --help
node .claude/skills/dependency-analysis/scripts/log_usage.mjs --help
node .claude/skills/dependency-analysis/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/dependency-analysis/templates/dependency-report.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
