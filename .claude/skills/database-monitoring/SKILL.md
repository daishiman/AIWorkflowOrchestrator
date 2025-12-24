---
name: .claude/skills/database-monitoring/SKILL.md
description: |
  Database Reliability Engineeringに基づくデータベース監視と可観測性の専門スキル。
  SQLite/Turso統計情報、スロークエリログ、接続数監視、
  ディスク使用量、レプリケーション遅延などの運用メトリクスを提供します。
  
  📖 参照書籍:
  - 『Designing Data-Intensive Applications』（Martin Kleppmann）: データモデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/alerting-strategies.md`: alerting-strategies の詳細ガイド
  - `resources/health-metrics.md`: health-metrics の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/slow-query-logging.md`: slow-query-logging の詳細ガイド
  - `resources/sqlite-statistics.md`: sqlite-statistics の詳細ガイド
  - `scripts/connection-stats.mjs`: connectionstatsを処理するスクリプト
  - `scripts/health-check.mjs`: ヘルスを検証するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/alert-rules-template.md`: alert-rules-template のテンプレート
  - `templates/monitoring-dashboard-template.md`: monitoring-dashboard-template のテンプレート
  
  Use proactively when handling database monitoring tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Designing Data-Intensive Applications"
    author: "Martin Kleppmann"
    concepts:
      - "データモデリング"
      - "パフォーマンス"
---

# Database Monitoring スキル

## 概要

Database Reliability Engineeringに基づくデータベース監視と可観測性の専門スキル。
SQLite/Turso統計情報、スロークエリログ、接続数監視、
ディスク使用量、レプリケーション遅延などの運用メトリクスを提供します。

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
- 本番DBの健全性を監視する時
- パフォーマンス劣化を検知する時
- アラート設定を構築する時
- SLI/SLOを設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/database-monitoring/resources/Level1_basics.md
cat .claude/skills/database-monitoring/resources/Level2_intermediate.md
cat .claude/skills/database-monitoring/resources/Level3_advanced.md
cat .claude/skills/database-monitoring/resources/Level4_expert.md
cat .claude/skills/database-monitoring/resources/alerting-strategies.md
cat .claude/skills/database-monitoring/resources/health-metrics.md
cat .claude/skills/database-monitoring/resources/legacy-skill.md
cat .claude/skills/database-monitoring/resources/slow-query-logging.md
cat .claude/skills/database-monitoring/resources/sqlite-statistics.md
```

### スクリプト実行
```bash
node .claude/skills/database-monitoring/scripts/connection-stats.mjs --help
node .claude/skills/database-monitoring/scripts/health-check.mjs --help
node .claude/skills/database-monitoring/scripts/log_usage.mjs --help
node .claude/skills/database-monitoring/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/database-monitoring/templates/alert-rules-template.md
cat .claude/skills/database-monitoring/templates/monitoring-dashboard-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
