---
name: .claude/skills/query-performance-tuning/SKILL.md
description: |
  SQLiteクエリパフォーマンス最適化の専門スキル。
  EXPLAIN QUERY PLAN分析、インデックス戦略、クエリリライト、
  実行計画の読み解きを通じて、データベースパフォーマンスを向上させます。
  
  📖 参照書籍:
  - 『High Performance Browser Networking』（Ilya Grigorik）: パフォーマンス測定
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/explain-analyze-guide.md`: EXPLAIN QUERY PLANガイド
  - `resources/index-strategies.md`: インデックス戦略ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/monitoring-queries.md`: パフォーマンス監視クエリ集
  - `resources/query-patterns.md`: クエリパターン最適化ガイド
  - `scripts/analyze-slow-queries.mjs`: 遅いクエリ分析スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/performance-report-template.md`: パフォーマンスレポート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling query performance tuning tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "High Performance Browser Networking"
    author: "Ilya Grigorik"
    concepts:
      - "パフォーマンス測定"
      - "最適化"
---

# Query Performance Tuning

## 概要

SQLiteクエリパフォーマンス最適化の専門スキル。
EXPLAIN QUERY PLAN分析、インデックス戦略、クエリリライト、
実行計画の読み解きを通じて、データベースパフォーマンスを向上させます。

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
- クエリが遅いと報告された時
- インデックスを追加すべきか判断する時
- 実行計画を分析する時
- データベース全体のパフォーマンスを改善する時
- N+1問題を特定・解決する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/query-performance-tuning/resources/Level1_basics.md
cat .claude/skills/query-performance-tuning/resources/Level2_intermediate.md
cat .claude/skills/query-performance-tuning/resources/Level3_advanced.md
cat .claude/skills/query-performance-tuning/resources/Level4_expert.md
cat .claude/skills/query-performance-tuning/resources/explain-analyze-guide.md
cat .claude/skills/query-performance-tuning/resources/index-strategies.md
cat .claude/skills/query-performance-tuning/resources/legacy-skill.md
cat .claude/skills/query-performance-tuning/resources/monitoring-queries.md
cat .claude/skills/query-performance-tuning/resources/query-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/query-performance-tuning/scripts/analyze-slow-queries.mjs --help
node .claude/skills/query-performance-tuning/scripts/log_usage.mjs --help
node .claude/skills/query-performance-tuning/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/query-performance-tuning/templates/performance-report-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
