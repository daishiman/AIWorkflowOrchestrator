---
name: .claude/skills/indexing-strategies/SKILL.md
description: |
  SQLiteにおけるインデックス設計戦略の専門知識。
  B-Treeインデックス、部分インデックス、式インデックス、カバリングインデックスの特性と選択基準を提供。
  専門分野:
  
  📖 参照書籍:
  - 『Designing Data-Intensive Applications』（Martin Kleppmann）: データモデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/index-types-comparison.md`: index-types-comparison の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/analyze-indexes.mjs`: indexesを分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/index-design-checklist.md`: index-design-checklist のチェックリスト
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling indexing strategies tasks.
version: 2.0.0
level: 2
last_updated: 2025-12-24
references:
  - book: "Designing Data-Intensive Applications"
    author: "Martin Kleppmann"
    concepts:
      - "データモデリング"
      - "パフォーマンス"
---

# Indexing Strategies Skill

## 概要

SQLiteにおけるインデックス設計戦略の専門知識。
B-Treeインデックス、部分インデックス、式インデックス、カバリングインデックスの特性と選択基準を提供。
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
- 新規テーブルのインデックス設計時
- クエリパフォーマンス問題の調査時
- インデックス追加・削除の判断時
- JSON検索のインデックス最適化時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/indexing-strategies/resources/Level1_basics.md
cat .claude/skills/indexing-strategies/resources/Level2_intermediate.md
cat .claude/skills/indexing-strategies/resources/Level3_advanced.md
cat .claude/skills/indexing-strategies/resources/Level4_expert.md
cat .claude/skills/indexing-strategies/resources/index-types-comparison.md
cat .claude/skills/indexing-strategies/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/indexing-strategies/scripts/analyze-indexes.mjs --help
node .claude/skills/indexing-strategies/scripts/log_usage.mjs --help
node .claude/skills/indexing-strategies/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/indexing-strategies/templates/index-design-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 2.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
