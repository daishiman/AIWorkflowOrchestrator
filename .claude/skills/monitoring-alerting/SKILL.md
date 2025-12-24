---
name: .claude/skills/monitoring-alerting/SKILL.md
description: |
  アプリケーションとインフラの監視・アラート設計を専門とするスキル。
  メトリクス収集、ログ設計、アラート閾値設定、ダッシュボード構成を提供します。
  
  📖 参照書籍:
  - 『Observability Engineering』（Charity Majors）: ログ設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/alerting-rules.md`: 閾値設定、警告/重大レベル、エスカレーション、通知先、抑制ルール設計
  - `resources/discord-notifications.md`: Discord Webhook連携、メッセージフォーマット、Embed活用、アラート送信
  - `resources/golden-signals.md`: レイテンシー・トラフィック・エラー・飽和度の4指標、SLI/SLO設計
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/logging-design.md`: 構造化ログ（JSON）、ログレベル設計、相関ID、環境別設定
  - `scripts/check-metrics.mjs`: メトリクスエンドポイント確認、死活監視、レスポンスタイム測定
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/alert-rules-template.yml`: アラートルール定義テンプレート（Prometheus/Alertmanager形式）
  - `templates/dashboard-template.json`: ダッシュボード設定テンプレート（Grafana形式、ゴールデンシグナル可視化）
  - `templates/incident-report-template.md`: インシデントレポートテンプレート（発生・影響・原因・対応・再発防止）
  - `templates/structured-logger-template.ts`: 構造化ロガー実装テンプレート（Winston/Pino、TypeScript）
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling monitoring alerting tasks.
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

# Monitoring & Alerting

## 概要

アプリケーションとインフラの監視・アラート設計を専門とするスキル。
メトリクス収集、ログ設計、アラート閾値設定、ダッシュボード構成を提供します。

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
- 監視戦略を設計する時
- アラートルールを定義する時
- ログ出力を設計する時
- 可観測性を向上させたい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/monitoring-alerting/resources/Level1_basics.md
cat .claude/skills/monitoring-alerting/resources/Level2_intermediate.md
cat .claude/skills/monitoring-alerting/resources/Level3_advanced.md
cat .claude/skills/monitoring-alerting/resources/Level4_expert.md
cat .claude/skills/monitoring-alerting/resources/alerting-rules.md
cat .claude/skills/monitoring-alerting/resources/discord-notifications.md
cat .claude/skills/monitoring-alerting/resources/golden-signals.md
cat .claude/skills/monitoring-alerting/resources/legacy-skill.md
cat .claude/skills/monitoring-alerting/resources/logging-design.md
```

### スクリプト実行
```bash
node .claude/skills/monitoring-alerting/scripts/check-metrics.mjs --help
node .claude/skills/monitoring-alerting/scripts/log_usage.mjs --help
node .claude/skills/monitoring-alerting/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/monitoring-alerting/templates/alert-rules-template.yml
cat .claude/skills/monitoring-alerting/templates/dashboard-template.json
cat .claude/skills/monitoring-alerting/templates/incident-report-template.md
cat .claude/skills/monitoring-alerting/templates/structured-logger-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
