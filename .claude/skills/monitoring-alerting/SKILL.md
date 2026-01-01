---
name: monitoring-alerting
description: |
  アプリケーションとインフラの監視・アラート設計を専門とするスキル。メトリクス収集、ログ設計、アラート閾値設定、ダッシュボード構成を通じて、システム可観測性の向上を実現します。

  Anchors:
  • Observability Engineering / 適用: ログ設計とメトリクス戦略 / 目的: ゴールデンシグナル中心の監視体系を構築
  • Golden Signals（レイテンシー・トラフィック・エラー・飽和度） / 適用: SLI/SLO設計 / 目的: ビジネス価値に基づくアラート閾値設定

  Trigger:
  監視戦略を設計する時、アラートルールを定義する時、ログ出力を設計する時、可観測性を向上させたい時に使用します。
  キーワード: メトリクス, ログ, アラート, ダッシュボード, 監視, SLI, SLO, 構造化ログ, Discord通知
allowed-tools:
  - bash
  - node
tags:
  - observability
  - monitoring
  - alerting
  - metrics
  - logging
dependencies: []
---

# Monitoring & Alerting

## 概要

システム可観測性を実現するため、ゴールデンシグナル（レイテンシー・トラフィック・エラー・飽和度）に基づくメトリクス戦略、構造化ログ設計、アラート閾値設定、ダッシュボード構成を統合的に提供します。SLI/SLOに基づいたビジネス価値中心の監視を実現します。

## ワークフロー

### Phase 1: 監視戦略の立案

**目的**: ビジネス要件からSLI/SLOを定義し、何を監視するかを決定する

**アクション**:

1. ビジネス目標からSLI（Service Level Indicator）を特定
2. ゴールデンシグナルの4つの軸を適用範囲内で選択
3. SLO（Service Level Objective）の目標値を設定
4. `references/golden-signals.md` でメトリクス設計パターンを確認

### Phase 2: 監視実装

**目的**: SLI/SLOに基づいてメトリクス、ログ、アラートを実装する

**アクション**:

1. ログ設計：`references/logging-design.md` で構造化ログ（JSON）の仕様を確認してコード実装
2. メトリクス収集：`scripts/check-metrics.mjs` でエンドポイント確認と死活監視を実装
3. アラートルール定義：`references/alerting-rules.md` で閾値・レベル・エスカレーション・通知先を設定
4. 通知連携：`references/discord-notifications.md` でDiscord Webhookを統合

### Phase 3: ダッシュボードと検証

**目的**: 可観測性の可視化と動作確認を完了する

**アクション**:

1. `assets/dashboard-template.json` でGrafanaダッシュボードを構成
2. `scripts/check-metrics.mjs` でメトリクス出力を検証
3. `scripts/log_usage.mjs` で実行記録と成功/失敗を記録

## Task仕様ナビ

監視アラート設計プロセスにおける各フェーズの入出力と参照リソース：

| フェーズ | Task（実行単位） | 入力                     | 出力                              | 参照リソース                                                            |
| -------- | ---------------- | ------------------------ | --------------------------------- | ----------------------------------------------------------------------- |
| Phase 1  | SLI/SLO定義      | ビジネス要件ドキュメント | SLI/SLO定義書                     | `references/golden-signals.md`                                          |
| Phase 2  | ログ設計         | システムアーキテクチャ   | 構造化ログスキーマ                | `references/logging-design.md` / `assets/structured-logger-template.ts` |
| Phase 2  | メトリクス実装   | SLI定義                  | メトリクス収集スクリプト          | `scripts/check-metrics.mjs`                                             |
| Phase 2  | アラートルール   | SLO目標値                | Prometheus/AlertmanagerルールYAML | `references/alerting-rules.md` / `assets/alert-rules-template.yml`      |
| Phase 2  | 通知連携         | 通知先情報               | Discord Webhook統合コード         | `references/discord-notifications.md`                                   |
| Phase 3  | ダッシュボード   | メトリクス定義           | Grafana設定JSON                   | `assets/dashboard-template.json`                                        |
| Phase 3  | インシデント対応 | 検出されたアラート       | インシデントレポート              | `assets/incident-report-template.md`                                    |

## ベストプラクティス

### すべきこと

- **ゴールデンシグナル優先**: レイテンシー・トラフィック・エラー・飽和度から監視指標を選択
- **構造化ログの採用**: JSON形式で相関ID、トレース情報を付与し、後続分析を容易に
- **SLI/SLO駆動設計**: ビジネス値に基づくSLIを定義し、それに逆算してアラート閾値を決定
- **段階的監視実装**: まずはメトリクス最小限（3～5個）から開始し、運用経験に基づいて拡張
- **アラート抑制ルール**: ノイズを防ぐため抑制期間（Silence）やグルーピングを設定
- **インシデント記録**: アラート発火から解決まで `assets/incident-report-template.md` で記録

### 避けるべきこと

- **すべてを監視**: 無差別なメトリクス収集はノイズ増加とコスト増につながる
- **固定閾値のみ**: ビジネス目標と乖離した技術的な閾値は誤検知を生む
- **ログレベルの不統一**: DEBUGとINFOの定義を曖昧にすると本番ログ解析が困難に
- **アラート疲れ**: 無視されるアラートはシステムの健全性判断を麻痺させる
- **Discord通知の過剰**: 重要度別の通知先分離がなければ、通知チャネルが機能しない

## リソース参照

### レベル別ガイド

詳細な知識は段階別に構成されています。必要なレベルに応じて参照してください：

- **基礎**: [references/Level1_basics.md](references/Level1_basics.md) - 監視基本概念、メトリクスとログの分類
- **実務**: [references/Level2_intermediate.md](references/Level2_intermediate.md) - 設計パターン、実装例
- **応用**: [references/Level3_advanced.md](references/Level3_advanced.md) - 複雑な可観測性設計、トレース統合
- **専門**: [references/Level4_expert.md](references/Level4_expert.md) - 大規模分散システム、カスタム分析

### ドメイン別リソース

各領域の詳細設計資料：

- **ゴールデンシグナル**: [references/golden-signals.md](references/golden-signals.md) - SLI/SLO設計、4指標の定義と測定方法
- **ログ設計**: [references/logging-design.md](references/logging-design.md) - 構造化ログ仕様、ログレベル体系、相関ID設計
- **アラート設計**: [references/alerting-rules.md](references/alerting-rules.md) - 閾値決定、警告/重大レベル、エスカレーション
- **Discord連携**: [references/discord-notifications.md](references/discord-notifications.md) - Webhook活用、メッセージフォーマット
- **要求仕様**: [references/requirements-index.md](references/requirements-index.md) - 本スキルが対応する機能要求索引

## スクリプト参照

決定論的な処理を自動化するスクリプト：

- **`scripts/check-metrics.mjs`**: メトリクスエンドポイント確認、死活監視、レスポンスタイム測定
  実行例: `node scripts/check-metrics.mjs --endpoint http://localhost:3000/metrics`

- **`scripts/log_usage.mjs`**: 使用記録・評価スクリプト（フィードバックループ）
  実行例: `node scripts/log_usage.mjs --result success --phase Phase1 --notes "SLI定義完了"`

- **`scripts/validate-skill.mjs`**: スキル構造検証
  実行例: `node scripts/validate-skill.mjs`

## テンプレート参照

出力素材として使用するテンプレート（assets/に配置）：

| テンプレート                           | 用途                                                  | 形式       |
| -------------------------------------- | ----------------------------------------------------- | ---------- |
| `assets/alert-rules-template.yml`      | Prometheus/Alertmanager形式のアラートルール定義       | YAML       |
| `assets/dashboard-template.json`       | Grafanaダッシュボード設定（ゴールデンシグナル可視化） | JSON       |
| `assets/incident-report-template.md`   | インシデント記録（発生・影響・原因・対応・再発防止）  | Markdown   |
| `assets/structured-logger-template.ts` | 構造化ロガー実装例（Winston/Pino対応）                | TypeScript |

## 変更履歴

| Version | Date       | Changes                                                                                                                       |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様へ準拠: Frontmatter更新、Anchorsと発動条件の明確化、Phase単位でのワークフロー再構成、Task仕様ナビテーブル追加 |
| 1.0.0   | 2025-12-24 | 初版作成：リソース基本構成、スクリプト・テンプレート組み込み                                                                  |
