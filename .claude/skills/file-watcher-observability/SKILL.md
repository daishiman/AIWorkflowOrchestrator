---
name: file-watcher-observability
description: |
  ファイル監視システムの可観測性（Observability）を3本柱（Metrics、Logs、Traces）に基づくPrometheus/Grafana統合パターンで実装。本番環境のパフォーマンス監視、SLA遵守測定、障害根本原因分析を支援。

  Anchors:
  • 『Observability Engineering』（Charity Majors） / 適用: ログ設計・テレメトリ戦略 / 目的: メトリクス・ログ・トレースの統一的設計
  • Prometheus / 適用: メトリクス収集・保存 / 目的: ファイル監視の定量的性能監視
  • Grafana / 適用: 可視化・ダッシュボード / 目的: リアルタイムアラートと傾向分析

  Trigger:
  ファイル監視システムのパフォーマンス監視、SLA遵守のための定量的測定、障害の根本原因分析、キャパシティプランニングのデータ収集が必要な場合に使用。

allowed-tools:
  - bash
  - node
  - typescript
  - prometheus
  - grafana

tags:
  - observability
  - monitoring
  - metrics
  - logs
  - traces
  - file-watcher
  - prometheus
  - grafana

dependencies: []
---

# ファイル監視システムの可観測性設計

## 概要

ファイル監視システムに対してMetrics・Logs・Tracesの3本柱を統合し、Prometheus/Grafanaで本番環境のパフォーマンスを定量的に監視・分析するワークフロー。

詳細な背景と実装例は [references/Level1_basics.md](references/Level1_basics.md) 、[references/Level2_intermediate.md](references/Level2_intermediate.md) を参照してください。

## ワークフロー

### Phase 1: 要件整理と測定設計

**目的**: 監視対象システムの要件と測定指標を明確化

**アクション**:

1. [references/Level1_basics.md](references/Level1_basics.md) で観測可能性の基本概念を確認
2. 監視対象のファイル監視システムのサイズ・規模・SLA要件を把握
3. どのメトリクス（レイテンシ・スループット・エラー率）が必要かを判定
4. Logs・Traces・Metricsのどれを優先するか決定

### Phase 2: 実装と統合

**目的**: Prometheus/Grafanaの設定、メトリクス収集器の実装

**アクション**:

1. [references/Level2_intermediate.md](references/Level2_intermediate.md) でパターンを確認
2. [assets/metrics-collector.ts](assets/metrics-collector.ts) をベースにメトリクス定義
3. [references/grafana-dashboard.json](references/grafana-dashboard.json) でダッシュボード構築
4. `scripts/validate-observability.mjs` で設定を検証

### Phase 3: 検証と運用準備

**目的**: 成果物の動作確認と運用情報の記録

**アクション**:

1. `scripts/health-check.sh` で監視の正常動作を確認
2. 本番環境とアラート設定の整合性をチェック
3. `scripts/log_usage.mjs --result success` で記録を保存

## Task仕様ナビ

本スキルは以下のTaskで構成されます。各Taskは必要に応じて実行してください：

| Task                                                     | 用途                       | 入力                            | 出力                             |
| -------------------------------------------------------- | -------------------------- | ------------------------------- | -------------------------------- |
| [agents/metrics-design.md](agents/metrics-design.md)     | メトリクス設計             | ファイル監視システムのSLA・要件 | メトリクス定義（Prometheus形式） |
| [agents/prometheus-setup.md](agents/prometheus-setup.md) | Prometheus設定             | メトリクス定義・収集対象        | prometheus.yml / scrape config   |
| [agents/grafana-build.md](agents/grafana-build.md)       | ダッシュボード構築         | Prometheusデータソース          | dashboard.json / alert rules     |
| [agents/log-integration.md](agents/log-integration.md)   | ログ統合（オプション）     | ログ形式・保持期間要件          | 構造化ログ設定（ELK/Loki）       |
| [agents/trace-setup.md](agents/trace-setup.md)           | トレース設定（オプション） | トレース粒度・サンプリング率    | OpenTelemetry設定                |

## ベストプラクティス

### すべきこと

- 本番環境のファイル監視ではMetrics・Logs・Tracesをバランスよく設定する
- SLA定義を明確にしてから測定指標を決める
- ダッシュボードはオンコール対応者向けに最小限の情報に絞る
- アラート閾値は実運用データに基づいて段階的に調整する

### 避けるべきこと

- 測定設計を抜かして実装を始める（後から修正が困難）
- すべてのメトリクスを取得しようとする（コスト・ノイズ増加）
- ダッシュボードを情報満載にする（肝心な異常が見落とされやすい）

## リソース参照

### 学習ガイド（段階的に読み進める）

- **[references/Level1_basics.md](references/Level1_basics.md)**: 観測可能性の基本概念、3本柱の理解
- **[references/Level2_intermediate.md](references/Level2_intermediate.md)**: Prometheus・Grafana基本設定、メトリクス収集パターン
- **[references/Level3_advanced.md](references/Level3_advanced.md)**: ログ統合（ELK/Loki）、トレース設定、SLO/SLI設計
- **[references/Level4_expert.md](references/Level4_expert.md)**: カスタムメトリクス開発、アラート最適化、多クラスタ監視

### 実装リソース

- **[assets/metrics-collector.ts](assets/metrics-collector.ts)**: Node.js/TypeScript向けメトリクス収集テンプレート
- **[references/grafana-dashboard.json](references/grafana-dashboard.json)**: Grafanaダッシュボードテンプレート

### スクリプト

- **`scripts/health-check.sh`**: 監視システムのヘルスチェック（動作確認用）
- **`scripts/validate-observability.mjs`**: 観測可能性設定の妥当性検証
- **`scripts/log_usage.mjs`**: スキル利用記録の保存（`--result success/failure`で実行）

### 関連リソース

- **[references/requirements-index.md](references/requirements-index.md)**: プロジェクト要求仕様への対応マッピング

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                                                                                            |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に基づいて全面更新：Frontmatterの改訂（description にAnchors/Trigger統合、allowed-tools/tags追加）、本文構成の再編（タイトル/概要/ワークフロー3フェーズ/Task仕様ナビ/ベストプラクティス/リソース参照を標準化）、相対パスリンク統一 |
| 1.0.0   | 2025-12-24 | 初版作成                                                                                                                                                                                                                                           |
