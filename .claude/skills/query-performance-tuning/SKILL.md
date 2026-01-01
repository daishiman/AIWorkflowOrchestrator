---
name: query-performance-tuning
description: |
  SQLite query performance optimization through EXPLAIN QUERY PLAN analysis, index strategies, and query rewriting. Diagnose slow queries, design optimal indexes, and improve execution plans systematically.

  Anchors:
  • High Performance Browser Networking (Ilya Grigorik) / 適用: パフォーマンス測定とボトルネック特定 / 目的: 測定駆動の最適化
  • SQLite Query Planner documentation / 適用: EXPLAIN QUERY PLAN解釈 / 目的: 実行計画の理解

  Trigger:
  Use when optimizing slow queries, analyzing execution plans, designing indexes, resolving N+1 problems, or improving database performance systematically.
  Keywords: slow query, EXPLAIN QUERY PLAN, index optimization, query rewriting, N+1 problem, database performance
---

# Query Performance Tuning

## 概要

SQLiteクエリパフォーマンスを測定駆動で最適化します。遅いクエリの診断、実行計画の分析、インデックス設計、クエリリライトを段階的に実施し、パフォーマンス改善を実現します。

## ワークフロー

クエリパフォーマンス最適化は以下の3つのTaskに分割して実施します。各Taskは独立して実行可能で、必要に応じて組み合わせます。

### Phase 1: Analysis（分析）

**Task**: `agents/analysis.md`

**目的**: 遅いクエリを特定し、実行計画を分析してボトルネックを診断

**入力**:

- 対象クエリ（SQL文）
- パフォーマンス要件（許容レスポンス時間）

**出力**:

- EXPLAIN QUERY PLAN 分析結果
- ボトルネック診断レポート
- 最適化の優先順位

**実行タイミング**: クエリが遅いと報告された時、パフォーマンス問題の調査時

### Phase 2: Optimization（最適化）

**Task**: `agents/optimization.md`

**目的**: インデックス設計、クエリリライト、N+1問題解決を実施

**入力**:

- Phase 1 の分析結果
- データベーススキーマ
- クエリパターン

**出力**:

- インデックス設計案（DDL含む）
- 最適化されたクエリ
- 実装手順書

**実行タイミング**: 分析後の改善実施、インデックス追加判断時

### Phase 3: Validation（検証）

**Task**: `agents/validation.md`

**目的**: 最適化効果を測定し、パフォーマンス改善を検証

**入力**:

- 最適化前後のクエリ
- ベンチマーク条件

**出力**:

- パフォーマンス比較レポート
- 改善率の測定結果
- 残存課題の特定

**実行タイミング**: 最適化実施後、効果測定が必要な時

## Task仕様

各Taskの詳細な仕様（役割、思考プロセス、入出力契約）は `agents/` ディレクトリを参照してください。

- **Analysis**: [agents/analysis.md](agents/analysis.md)
- **Optimization**: [agents/optimization.md](agents/optimization.md)
- **Validation**: [agents/validation.md](agents/validation.md)

## ベストプラクティス

### すべきこと

- 測定から始める（推測による最適化を避ける）
- EXPLAIN QUERY PLAN で実行計画を必ず確認
- インデックス追加前にクエリパターンを分析
- N+1問題は早期に特定して解決
- 最適化効果を数値で検証

### 避けるべきこと

- 測定なしの盲目的なインデックス追加
- 実行計画を見ずにクエリを変更
- 過度なインデックス（書き込み性能の劣化）
- 単一クエリのみの最適化（全体像を見失う）

## リソース参照

必要に応じて以下のリソースを参照してください。

### 段階的学習ガイド

- **Level 1 Basics**: [references/Level1_basics.md](references/Level1_basics.md) - 基礎概念と用語
- **Level 2 Intermediate**: [references/Level2_intermediate.md](references/Level2_intermediate.md) - 実務での適用
- **Level 3 Advanced**: [references/Level3_advanced.md](references/Level3_advanced.md) - 高度な最適化技法
- **Level 4 Expert**: [references/Level4_expert.md](references/Level4_expert.md) - 専門的なトラブルシューティング

### 専門ガイド

- **EXPLAIN QUERY PLAN ガイド**: [references/explain-analyze-guide.md](references/explain-analyze-guide.md)
- **インデックス戦略**: [references/index-strategies.md](references/index-strategies.md)
- **クエリパターン最適化**: [references/query-patterns.md](references/query-patterns.md)
- **監視クエリ集**: [references/monitoring-queries.md](references/monitoring-queries.md)

### 要求仕様参照

- **Requirements Index**: [references/requirements-index.md](references/requirements-index.md) - docs/00-requirements と同期

## スクリプト

### analyze-slow-queries.mjs

遅いクエリを自動分析します。

```bash
node scripts/analyze-slow-queries.mjs --query "SELECT ..." --threshold 100
```

**引数**:

- `--query`: 分析対象のSQL（必須）
- `--threshold`: 許容レスポンス時間（ms、デフォルト: 100）

**出力**: EXPLAIN QUERY PLAN 結果とボトルネック診断

### log_usage.mjs

スキル使用履歴を記録します。

```bash
node scripts/log_usage.mjs --result success --phase analysis
```

**引数**:

- `--result`: success または failure（必須）
- `--phase`: 実行フェーズ名（任意）
- `--notes`: 追加メモ（任意）

### validate-skill.mjs

スキル構造を検証します。

```bash
node scripts/validate-skill.mjs
```

**出力**: YAML frontmatter、ファイル構造、リンク整合性の検証結果

## テンプレート

### performance-report-template.md

パフォーマンス分析レポートの雛形です。

パス: [assets/performance-report-template.md](assets/performance-report-template.md)

**用途**: Phase 1（分析）および Phase 3（検証）の結果をドキュメント化

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md 仕様に準拠、agents/ Task追加   |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |
