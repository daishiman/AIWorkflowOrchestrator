# Level 2: Intermediate

## 概要

アプリケーションとインフラの監視・アラート設計を専門とするスキル。 メトリクス収集、ログ設計、アラート閾値設定、ダッシュボード構成を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: アラートルール設計 / アラート設計原則 / アクション可能なアラート / Discord 通知 / Webhook 設定 / Webhook URL の取得
- 実務指針: 監視戦略を設計する時 / アラートルールを定義する時 / ログ出力を設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/alerting-rules.md`: 閾値設定、警告/重大レベル、エスカレーション、通知先、抑制ルール設計（把握する知識: アラートルール設計 / アラート設計原則 / アクション可能なアラート）
- `resources/discord-notifications.md`: Discord Webhook連携、メッセージフォーマット、Embed活用、アラート送信（把握する知識: Discord 通知 / Webhook 設定 / Webhook URL の取得）
- `resources/golden-signals.md`: レイテンシー・トラフィック・エラー・飽和度の4指標、SLI/SLO設計（把握する知識: ゴールデンシグナル / 4つのシグナル / 1. レイテンシー（Latency））
- `resources/logging-design.md`: 構造化ログ（JSON）、ログレベル設計、相関ID、環境別設定（把握する知識: ログ設計 / 構造化ログ / なぜ構造化ログか）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件 / エラーハンドリング仕様 / デプロイメント (Deployment)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Monitoring & Alerting / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-metrics.mjs`: メトリクスエンドポイント確認、死活監視、レスポンスタイム測定
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/alert-rules-template.yml`: アラートルール定義テンプレート（Prometheus/Alertmanager形式）
- `templates/dashboard-template.json`: ダッシュボード設定テンプレート（Grafana形式、ゴールデンシグナル可視化）
- `templates/incident-report-template.md`: インシデントレポートテンプレート（発生・影響・原因・対応・再発防止）
- `templates/structured-logger-template.ts`: 構造化ロガー実装テンプレート（Winston/Pino、TypeScript）

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
