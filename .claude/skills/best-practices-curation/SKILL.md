---
name: .claude/skills/best-practices-curation/SKILL.md
description: |
  ベストプラクティスの収集、評価、統合、更新を体系的に行うスキル。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/information-source-evaluation.md`: 一次・二次・三次情報源の分類と信頼性評価基準、優先順位付けと採用判断の実践ガイド
  - `resources/integration-strategies.md`: 4つの統合パターン（追加型・強化型・置換型・統合型）と重複排除戦略、知識統合のベストプラクティス
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/quality-scoring.md`: 品質スコアリングガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/evaluation-checklist.md`: ベストプラクティス評価チェックリスト
  
  Use proactively when handling best practices curation tasks.
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

# Best Practices Curation

## 概要

ベストプラクティスの収集、評価、統合、更新を体系的に行うスキル。

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
- ベストプラクティスを収集して体系化する時
- 情報源の信頼性を評価する必要がある時
- 知識の品質を保証したい時
- 陳腐化を防ぎたい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/best-practices-curation/resources/Level1_basics.md
cat .claude/skills/best-practices-curation/resources/Level2_intermediate.md
cat .claude/skills/best-practices-curation/resources/Level3_advanced.md
cat .claude/skills/best-practices-curation/resources/Level4_expert.md
cat .claude/skills/best-practices-curation/resources/information-source-evaluation.md
cat .claude/skills/best-practices-curation/resources/integration-strategies.md
cat .claude/skills/best-practices-curation/resources/legacy-skill.md
cat .claude/skills/best-practices-curation/resources/quality-scoring.md
```

### スクリプト実行
```bash
node .claude/skills/best-practices-curation/scripts/log_usage.mjs --help
node .claude/skills/best-practices-curation/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/best-practices-curation/templates/evaluation-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
