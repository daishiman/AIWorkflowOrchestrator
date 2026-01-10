---
name: logging-observability
description: |
  本番システム向け構造化ログとオブザーバビリティ設計スキル。Logs、Metrics、Tracesの3本柱を実装し、完全なシステム可視性を実現。

  Anchors:
  • 『Observability Engineering』(Charity Majors) / 適用: 高カーディナリティデバッグ / 目的: 根本原因分析
  • 『The Art of Monitoring』(James Turnbull) / 適用: メトリクス戦略 / 目的: 効果的アラート
  • Twelve-Factor App (Factor XI) / 適用: イベントストリームとしてのログ / 目的: クラウドネイティブロギング
  • OpenTelemetry Specification / 適用: 計装 / 目的: ベンダー中立オブザーバビリティ

  Trigger:
  Use when implementing logging, setting up observability, designing metrics/alerting,
  integrating distributed tracing, or troubleshooting production systems.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Logging & Observability

> **相対パス**: `SKILL.md`
> **読込条件**: スキル使用時（自動）

---

## 概要

構造化ログとオブザーバビリティの設計・実装スキル。

**オブザーバビリティの3本柱**:

| 柱      | 用途                     | ツール例                        |
| ------- | ------------------------ | ------------------------------- |
| Logs    | イベント・エラー詳細記録 | Winston, Pino, Bunyan           |
| Metrics | 集計データ・トレンド監視 | Prometheus, Datadog, CloudWatch |
| Traces  | 分散リクエストフロー追跡 | Jaeger, Zipkin, OpenTelemetry   |

---

## ワークフロー

### Phase 1: ログ戦略設計

**Task**: `agents/design-logging-strategy.md`

| 入力                           | 出力                 |
| ------------------------------ | -------------------- |
| システム要件、アーキテクチャ図 | ログ戦略ドキュメント |

**参照**: `references/basics.md`

### Phase 2: 構造化ログ実装

**Task**: `agents/implement-structured-logging.md`

| 入力                 | 出力               |
| -------------------- | ------------------ |
| ログ戦略ドキュメント | 実装済みログコード |

**参照**: `references/patterns.md`, `assets/structured-log.json`

### Phase 3: オブザーバビリティ設定

**Task**: `agents/setup-observability.md`

| 入力               | 出力                   |
| ------------------ | ---------------------- |
| 実装済みログコード | オブザーバビリティ設定 |

**参照**: `references/patterns.md`, `assets/observability-config.yaml`

### Phase 4: 検証

**Task**: `agents/validate-logging.md`

| 入力                   | 出力             |
| ---------------------- | ---------------- |
| オブザーバビリティ設定 | 検証結果レポート |

---

## ベストプラクティス

| すべきこと                         | 避けるべきこと             |
| ---------------------------------- | -------------------------- |
| 構造化ログ (JSON) を使用           | プレーンテキストログ       |
| コンテキストID (trace_id) を含める | ログレベルの誤用           |
| 機密情報をマスキング               | 個人情報の平文出力         |
| ログローテーション設定             | 無制限のログ出力           |
| メトリクスとログを相関付け         | ローカルファイルのみへ出力 |
| サンプリング戦略を検討             | 高頻度ログの無制限保持     |

---

## Task ナビゲーション

| Task                              | 目的                                 | 参照リソース          |
| --------------------------------- | ------------------------------------ | --------------------- |
| `design-logging-strategy.md`      | ログレベル・構造・保持期間設計       | `basics.md`           |
| `implement-structured-logging.md` | 構造化ログ実装                       | `patterns.md`, assets |
| `setup-observability.md`          | メトリクス・アラート・ダッシュボード | `patterns.md`         |
| `validate-logging.md`             | ログ構造検証・クエリテスト           | scripts               |

---

## リソース参照

### References

| ファイル      | 内容                                   | 読込条件   |
| ------------- | -------------------------------------- | ---------- |
| `basics.md`   | ログレベル・構造化ログ基礎・用語       | 初回使用時 |
| `patterns.md` | 実装パターン・メトリクス設計・アラート | 実装時     |

### Assets

| ファイル                    | 内容                                |
| --------------------------- | ----------------------------------- |
| `structured-log.json`       | 構造化ログ JSON スキーマ            |
| `observability-config.yaml` | Prometheus/Grafana 設定テンプレート |

---

## ログレベルガイド

| レベル | 使用基準               | 例                            |
| ------ | ---------------------- | ----------------------------- |
| ERROR  | 即座の対応が必要       | 未処理例外、サービス障害      |
| WARN   | 注意が必要だが動作継続 | 遅延警告、リトライ発生        |
| INFO   | 重要なビジネスイベント | リクエスト開始/完了、処理成功 |
| DEBUG  | 開発時の詳細情報       | パラメータ値、中間状態        |

---

## 関連スキル

- `log-rotation-strategies` - ログローテーション設定
- `error-handling-patterns` - エラーハンドリング戦略
- `metrics-tracking` - メトリクス収集
