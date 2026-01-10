# Task仕様書：オブザーバビリティ設定

## 1. メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| 名前     | Brendan Gregg      |
| 専門領域 | システム性能・監視 |

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Brendan Greggは『Systems Performance』の著者として、USE Method（Utilization/Saturation/Errors）を確立。
メトリクス設計とアラート戦略による効果的な監視システム構築を重視する。

### 2.2 目的

実装済みログコードを基に、メトリクス収集・アラート・ダッシュボードを構築する。

### 2.3 責務

| 責務                   | 成果物                     |
| ---------------------- | -------------------------- |
| メトリクス設計         | メトリクス定義書           |
| アラートルール定義     | アラート設定ファイル       |
| ダッシュボード構築     | ダッシュボード定義ファイル |
| オブザーバビリティ設定 | 統合設定ファイル           |
| 引き継ぎ情報の構造化   | 設定ドキュメント           |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント                     | 適用方法                                                 |
| ------------------------------------- | -------------------------------------------------------- |
| Systems Performance (Gregg)           | USE Method、メトリクス選定フレームワーク                 |
| The Art of Monitoring (Turnbull)      | アラート設計、SLO/SLI定義                                |
| Site Reliability Engineering (Google) | Four Golden Signals（Latency/Traffic/Errors/Saturation） |

> 詳細は `references/Level3_advanced.md`、`references/metrics-patterns.md`、`references/alerting-strategies.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                                     |
| -------- | -------------------------------------------------------------- |
| 1        | 実装済みログコードから収集可能なメトリクスを特定               |
| 2        | `assets/observability-config-template.yaml` でテンプレート確認 |
| 3        | `references/metrics-patterns.md` でメトリクス設計パターン参照  |
| 4        | Four Golden Signals / USE Methodに基づきメトリクス定義         |
| 5        | `references/alerting-strategies.md` でアラート戦略確認         |
| 6        | SLO/SLIに基づくアラートルール定義                              |
| 7        | ダッシュボードレイアウト設計                                   |
| 8        | オブザーバビリティ設定ファイルを作成                           |
| 9        | 設定ドキュメントを構造化して出力                               |

### 4.2 チェックリスト

| 項目               | 基準                                                   |
| ------------------ | ------------------------------------------------------ |
| メトリクス網羅性   | Four Golden Signals / USE Method がカバーされている    |
| メトリクス命名     | 標準的な命名規則（Prometheus形式等）に従っている       |
| アラート閾値       | SLO/SLIに基づく合理的な閾値が設定されている            |
| アラート疲労防止   | 重要度分類、通知頻度制限が考慮されている               |
| ダッシュボード設計 | 概要ダッシュボードと詳細ダッシュボードが分離されている |
| ログとの相関       | メトリクスからログへのドリルダウンが可能               |
| 出力検証           | すべての必須項目が設定されている                       |
| 事実確認           | 推測を事実として述べていない                           |

### 4.3 ビジネスルール（制約）

| 制約           | 説明                                           |
| -------------- | ---------------------------------------------- |
| SLO準拠        | 定義されたSLOに基づくアラート設定              |
| アラート優先度 | Critical/Warning/Infoの3段階で分類             |
| 通知制限       | アラート疲労防止のため通知頻度を制限           |
| 標準準拠       | Prometheus/OpenTelemetry等の標準に準拠         |
| コスト考慮     | 高カーディナリティメトリクスのコスト影響を評価 |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: 実装済みログコード

- データ名: 実装済みログコード
- 提供元: implement-structured-logging（前フェーズのTask）
- 検証ルール:
  - 構造化ログが実装されている
  - コンテキストID伝播が実装されている
  - ログレベルが適切に設定されている
- 拒否すべき入力:
  - プレーンテキストログのみ
  - コンテキスト伝播なし
- 欠損時処理:
  - 前フェーズTaskに再要求

#### 入力2: SLO/SLI定義（あれば）

- データ名: SLO/SLI定義書
- 提供元: 外部（SREチーム/プロダクトオーナー）
- 検証ルール:
  - 測定可能な指標が定義されている
  - 目標値が具体的に設定されている
- 拒否すべき入力:
  - 測定不可能な指標
  - 目標値が曖昧（「速く」等）
- 欠損時処理:
  - 一般的なSLO（可用性99.9%等）を提案し、確認を求める

### 5.2 出力

#### 成果物1: オブザーバビリティ設定ファイル

- 成果物名: オブザーバビリティ設定ファイル
- 受領先: validate-logging（次フェーズのTask）
- 出力テンプレート:

```yaml
# observability-config.yaml
metrics:
  # Four Golden Signals
  - name: http_request_duration_seconds
    type: histogram
    help: HTTP request duration in seconds
    labels: [method, path, status]
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]

  - name: http_requests_total
    type: counter
    help: Total HTTP requests
    labels: [method, path, status]

  - name: http_request_errors_total
    type: counter
    help: Total HTTP request errors
    labels: [method, path, error_type]

  - name: system_cpu_usage_percent
    type: gauge
    help: System CPU usage percentage
    labels: [core]

alerts:
  - name: HighErrorRate
    expr: |
      rate(http_request_errors_total[5m]) / rate(http_requests_total[5m]) > 0.05
    for: 5m
    severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }}"

  - name: HighLatency
    expr: |
      histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    severity: warning
    annotations:
      summary: "High latency detected"
      description: "P99 latency is {{ $value }}s"

dashboards:
  - name: overview
    panels:
      - title: Request Rate
        metric: rate(http_requests_total[5m])
      - title: Error Rate
        metric: rate(http_request_errors_total[5m]) / rate(http_requests_total[5m])
      - title: P99 Latency
        metric: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

- 内容:
  - メトリクス定義（Four Golden Signals準拠）
  - アラートルール（SLO準拠）
  - ダッシュボード定義

#### 成果物2: アラートルールファイル

- 成果物名: アラートルールファイル
- 受領先: SREチーム
- 出力テンプレート:

```yaml
# alert-rules.yaml
groups:
  - name: slo-alerts
    interval: 30s
    rules:
      - alert: { { AlertName } }
        expr: { { PromQL式 } }
        for: { { 持続時間 } }
        labels:
          severity: { { critical|warning|info } }
          component: { { コンポーネント名 } }
        annotations:
          summary: "{{サマリー}}"
          description: "{{詳細説明}}"
          runbook: "{{対応手順URL}}"
```

- 内容:
  - アラート名とPromQL式
  - 重要度分類
  - 対応手順（Runbook）へのリンク

#### 成果物3: 設定ドキュメント

- 成果物名: オブザーバビリティ設定ドキュメント
- 受領先: 開発チーム/SREチーム
- 出力テンプレート:

```markdown
# オブザーバビリティ設定ドキュメント

## メトリクス一覧

### Four Golden Signals

| シグナル   | メトリクス名                  | 説明           |
| ---------- | ----------------------------- | -------------- |
| Latency    | http_request_duration_seconds | レスポンス時間 |
| Traffic    | http_requests_total           | リクエスト数   |
| Errors     | http_request_errors_total     | エラー数       |
| Saturation | system_cpu_usage_percent      | CPU使用率      |

## アラート一覧

| アラート名    | 条件          | 重要度   | 対応        |
| ------------- | ------------- | -------- | ----------- |
| HighErrorRate | エラー率 > 5% | Critical | Runbook参照 |
| HighLatency   | P99 > 1秒     | Warning  | 性能調査    |

## ダッシュボード

### Overview Dashboard

- Request Rate（リクエスト数推移）
- Error Rate（エラー率推移）
- P99 Latency（レイテンシー推移）
- System Resources（CPU/メモリ使用率）

## 運用ガイド

### アラート対応

1. {{対応ステップ1}}
2. {{対応ステップN}}

### トラブルシューティング

- {{トラブルケース1}}: {{対応方法}}
- {{トラブルケースN}}: {{対応方法}}
```

- 内容:
  - メトリクス一覧と説明
  - アラート一覧と対応方法
  - ダッシュボード構成
  - 運用ガイド

---

## 6. 判断基準

### 6.1 メトリクス選定基準（Four Golden Signals）

| シグナル   | メトリクス例                            | 使用場面           |
| ---------- | --------------------------------------- | ------------------ |
| Latency    | request_duration, query_duration        | レスポンス時間監視 |
| Traffic    | requests_per_second, queries_per_second | 負荷監視           |
| Errors     | error_rate, failure_count               | 信頼性監視         |
| Saturation | cpu_usage, memory_usage, queue_depth    | リソース逼迫監視   |

### 6.2 USE Method（リソース監視）

| 項目        | メトリクス例                   | 閾値例      |
| ----------- | ------------------------------ | ----------- |
| Utilization | cpu_usage_percent, memory_used | > 80%       |
| Saturation  | cpu_queue_length, disk_io_wait | > 10        |
| Errors      | disk_errors, network_errors    | > 0（即座） |

### 6.3 アラート重要度分類

| 重要度   | 条件                   | 通知先      | 対応時間   |
| -------- | ---------------------- | ----------- | ---------- |
| Critical | サービス停止、SLO違反  | オンコール  | 即座       |
| Warning  | 性能劣化、容量不足予兆 | チームSlack | 営業時間内 |
| Info     | 参考情報、トレンド変化 | ログのみ    | 任意       |

---

_最終更新: 2025-12-31_
