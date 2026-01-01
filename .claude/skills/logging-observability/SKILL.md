---
name: logging-observability
description: |
  構造化ログとオブザーバビリティの設計・実装スキル。
  システムの可視化・監視・トラブルシューティングを実現します。

  Anchors:
  • The Art of Monitoring (James Turnbull) / 適用: 監視戦略・メトリクス設計 / 目的: 効果的な監視システムの構築
  • Observability Engineering (Charity Majors) / 適用: 構造化ログ・分散トレース / 目的: 高カーディナリティデータによるデバッグ
  • Twelve-Factor App (logging as event streams) / 適用: ログ出力設計 / 目的: クラウドネイティブなログ管理

  Trigger:
  Use when implementing logging, setting up observability, designing monitoring strategy, or troubleshooting production systems.
  logging, observability, monitoring, structured logs, metrics, traces, debugging, troubleshooting, alerting, OpenTelemetry
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# logging-observability

## 概要

構造化ログとオブザーバビリティの設計・実装スキル。
システムの可視化・監視・トラブルシューティングを実現する。

**対象範囲**:

- 構造化ログの設計と実装
- メトリクス収集とアラート設定
- 分散トレーシングの導入
- ログ集約とクエリ戦略

---

## ワークフロー

### Phase 1: ログ戦略設計

**目的**: システムに適したログ戦略とオブザーバビリティ要件を定義

**アクション**:

1. システムアーキテクチャとログ要件を分析
2. ログレベル・構造・保持期間を設計
3. オブザーバビリティの3本柱（Logs/Metrics/Traces）の役割分担を明確化
4. 必要なリソースレベル（Level 1-4）を判定

**Task**: `agents/design-logging-strategy.md` を参照

**入力**: システム要件、アーキテクチャ図
**出力**: ログ戦略ドキュメント

### Phase 2: 構造化ログ実装

**目的**: 構造化ログの実装とログフォーマット標準化

**アクション**:

1. `assets/structured-log-template.json` でログ構造を確認
2. `references/structured-logging-patterns.md` でパターンを参照
3. ログライブラリ選定と設定
4. コンテキスト伝播の実装（分散トレーシング対応）

**Task**: `agents/implement-structured-logging.md` を参照

**入力**: ログ戦略ドキュメント
**出力**: 実装済みログコード、設定ファイル

### Phase 3: オブザーバビリティ設定

**目的**: メトリクス収集・アラート・ダッシュボード構築

**アクション**:

1. `assets/observability-config-template.yaml` を使用
2. `references/metrics-patterns.md` でメトリクス設計を確認
3. アラートルールの定義
4. ダッシュボードの構築

**Task**: `agents/setup-observability.md` を参照

**入力**: 実装済みログコード
**出力**: オブザーバビリティ設定、ダッシュボード

### Phase 4: 検証と記録

**目的**: ログ構造の検証と使用記録の保存

**アクション**:

1. `scripts/validate-log-structure.mjs` でログフォーマット検証
2. ログクエリのテスト実施
3. `scripts/log_usage.mjs` で使用記録を保存

**Task**: `agents/validate-logging.md` を参照

**入力**: オブザーバビリティ設定
**出力**: 検証結果レポート

---

## Task仕様ナビ

| Task                         | 起動タイミング | 入力                         | 出力                             |
| ---------------------------- | -------------- | ---------------------------- | -------------------------------- |
| design-logging-strategy      | Phase 1開始時  | システム要件、アーキテクチャ | ログ戦略ドキュメント             |
| implement-structured-logging | Phase 2開始時  | ログ戦略ドキュメント         | 実装済みログコード、設定ファイル |
| setup-observability          | Phase 3開始時  | 実装済みログコード           | オブザーバビリティ設定           |
| validate-logging             | Phase 4開始時  | オブザーバビリティ設定       | 検証結果レポート                 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項                       | 理由                                           |
| ------------------------------ | ---------------------------------------------- |
| 構造化ログを使用               | 検索・集約・分析が容易                         |
| コンテキストIDを含める         | 分散システムでのリクエスト追跡が可能           |
| セマンティックなログレベル使用 | ERROR/WARN/INFO/DEBUGを適切に使い分ける        |
| 機密情報をログに含めない       | セキュリティリスクとコンプライアンス違反を防ぐ |
| ログローテーション設定         | ディスク容量枯渇を防ぐ                         |
| メトリクスとログを相関付ける   | 問題の根本原因分析が迅速化                     |
| 高カーディナリティに対応       | ユーザーID・リクエストIDなどで詳細分析が可能   |

### 避けるべきこと

| アンチパターン               | 問題点                                         |
| ---------------------------- | ---------------------------------------------- |
| プレーンテキストログ         | パースが困難、クエリ性能が低い                 |
| 過剰なログ出力               | ノイズが多く重要な情報が埋もれる、コスト増加   |
| ログレベルの誤用             | DEBUGでERRORレベル情報を出すなど、フィルタ困難 |
| 個人情報のログ出力           | GDPR/プライバシー法違反のリスク                |
| ローカルファイルのみへの出力 | コンテナ環境で消失、集約できない               |
| サンプリングなしの高頻度ログ | ストレージコスト・性能劣化                     |
| メトリクス名の非標準化       | 集約・比較が困難                               |

---

## リソース/スクリプト参照

### References（必要時に読む）

| ファイル                                    | 読むタイミング             | 内容                            |
| ------------------------------------------- | -------------------------- | ------------------------------- |
| `references/Level1_basics.md`               | 初めてログ設計する場合     | 基本概念と最小限の実装          |
| `references/Level2_intermediate.md`         | 構造化ログを導入する場合   | 構造化ログとJSON形式            |
| `references/Level3_advanced.md`             | 分散トレーシング導入時     | OpenTelemetry、コンテキスト伝播 |
| `references/Level4_expert.md`               | 大規模本番環境での最適化時 | サンプリング、高可用性設計      |
| `references/structured-logging-patterns.md` | ログフォーマット標準化時   | 各言語のベストプラクティス      |
| `references/metrics-patterns.md`            | メトリクス設計時           | RED/USE/Four Golden Signals     |
| `references/alerting-strategies.md`         | アラート設定時             | アラート疲労防止、SLO設計       |
| `references/log-aggregation.md`             | ログ集約システム構築時     | ELK/Loki/CloudWatchの比較       |

### Scripts

| スクリプト                           | 用途                 | 引数                       |
| ------------------------------------ | -------------------- | -------------------------- |
| `scripts/validate-log-structure.mjs` | ログ構造の妥当性検証 | `--file <log-file>`        |
| `scripts/log_usage.mjs`              | 使用記録の保存       | `--result --phase --notes` |

### Assets（出力で使用）

| ファイル                                    | 用途                                 |
| ------------------------------------------- | ------------------------------------ |
| `assets/structured-log-template.json`       | 構造化ログのJSONスキーマテンプレート |
| `assets/observability-config-template.yaml` | オブザーバビリティ設定テンプレート   |
| `assets/log-rotation-config.yaml`           | ログローテーション設定例             |
| `assets/alert-rules-template.yaml`          | アラートルールテンプレート           |

---

## 進行状況の確認

現在のスキルレベルと使用統計は `EVALS.json` を参照。
使用履歴とフィードバックは `LOGS.md` に記録される。

---

## よくある質問

**Q: どのログレベルをいつ使うべきか？**

A: `references/Level1_basics.md` のログレベルガイドラインを参照。基本方針：

- ERROR: 即座の対応が必要
- WARN: 注意が必要だが動作は継続
- INFO: 重要なビジネスイベント
- DEBUG: 開発時の詳細情報

**Q: 構造化ログとプレーンテキストログの違いは？**

A: `references/Level2_intermediate.md` を参照。構造化ログはJSON等の形式で、キー・バリューで検索・集約が容易。

**Q: OpenTelemetryとは何か？どう使うか？**

A: `references/Level3_advanced.md` を参照。標準化された計装ライブラリで、Logs/Metrics/Tracesを統合管理。

**Q: 本番環境でログが多すぎてコストが高い。どうすべきか？**

A: `references/Level4_expert.md` のサンプリング戦略を参照。ヘッドベース/テールベースサンプリングで重要なログのみ保持。

---

_最終更新: 2025-12-31_
