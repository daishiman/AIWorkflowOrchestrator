---
name: .claude/skills/file-watcher-observability/SKILL.md
description: |
  ファイル監視システムの可観測性（Observability）設計と実装。
  Metrics、Logs、Tracesの3本柱に基づくPrometheus/Grafana統合パターンを提供。
  専門分野:
  
  📖 参照書籍:
  - 『Observability Engineering』（Charity Majors）: ログ設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/grafana-dashboard.json`: grafana-dashboard の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/health-check.sh`: ヘルスを検証するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/metrics-collector.ts`: metrics-collector のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling file watcher observability tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Observability Engineering"
    author: "Charity Majors"
    concepts:
      - "ログ設計"
      - "メトリクス"
---

# .claude/skills/file-watcher-observability/SKILL.md

## 概要

ファイル監視システムの可観測性（Observability）設計と実装。
Metrics、Logs、Tracesの3本柱に基づくPrometheus/Grafana統合パターンを提供。
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
- 本番環境でのファイル監視のパフォーマンス監視が必要な時
- SLA遵守のための定量的測定が必要な時
- 障害の根本原因分析（RCA）を実施する時
- キャパシティプランニングのデータ収集時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/file-watcher-observability/resources/Level1_basics.md
cat .claude/skills/file-watcher-observability/resources/Level2_intermediate.md
cat .claude/skills/file-watcher-observability/resources/Level3_advanced.md
cat .claude/skills/file-watcher-observability/resources/Level4_expert.md
cat .claude/skills/file-watcher-observability/resources/grafana-dashboard.json
cat .claude/skills/file-watcher-observability/resources/legacy-skill.md
```

### スクリプト実行
```bash
.claude/skills/file-watcher-observability/scripts/health-check.sh
node .claude/skills/file-watcher-observability/scripts/log_usage.mjs --help
node .claude/skills/file-watcher-observability/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/file-watcher-observability/templates/metrics-collector.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
