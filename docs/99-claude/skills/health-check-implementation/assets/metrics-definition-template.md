# メトリクス定義書

## 1. 概要

- **プロジェクト名**: {{project-name}}
- **対象システム**: {{system-name}}
- **作成日**: {{date}}
- **バージョン**: {{version}}
- **担当者**: {{author}}

## 2. メトリクス分類

### 2.1 USE Method（リソースメトリクス）

| リソース | Utilization（使用率） | Saturation（飽和度） | Errors（エラー率） |
| -------- | --------------------- | -------------------- | ------------------ |
| CPU      | {{metric-name}}       | {{metric-name}}      | {{metric-name}}    |
| Memory   | {{metric-name}}       | {{metric-name}}      | {{metric-name}}    |
| Disk     | {{metric-name}}       | {{metric-name}}      | {{metric-name}}    |
| Network  | {{metric-name}}       | {{metric-name}}      | {{metric-name}}    |

### 2.2 RED Method（サービスメトリクス）

| サービス | Rate（リクエスト率） | Errors（エラー率） | Duration（レイテンシ） |
| -------- | -------------------- | ------------------ | ---------------------- |
| {{name}} | {{metric-name}}      | {{metric-name}}    | {{metric-name}}        |

### 2.3 Golden Signals

| Signal     | メトリクス名    | 説明            | 目標値     |
| ---------- | --------------- | --------------- | ---------- |
| Latency    | {{metric-name}} | {{description}} | {{target}} |
| Traffic    | {{metric-name}} | {{description}} | {{target}} |
| Errors     | {{metric-name}} | {{description}} | {{target}} |
| Saturation | {{metric-name}} | {{description}} | {{target}} |

## 3. メトリクス詳細定義

### 3.1 メトリクス: {{metric-name-1}}

- **説明**: {{メトリクスの目的と意味}}
- **メトリクス型**: Gauge / Counter / Histogram / Summary
- **単位**: {{unit}}（例: bytes, seconds, requests/sec）
- **取得間隔**: {{interval}}（例: 10s, 1m）
- **保存期間**:
  - Raw: {{retention-raw}}（例: 7days）
  - Aggregated: {{retention-aggregated}}（例: 90days）
- **ラベル（タグ）**:
  - `{{label-1}}`: {{description}}
  - `{{label-2}}`: {{description}}
  - `{{label-n}}`: {{description}}
- **取得方法**:
  - Exporter: {{exporter-name}}（例: node_exporter, custom-exporter）
  - エンドポイント: {{endpoint}}
  - クエリ例（PromQL）: `{{query}}`

**使用例**:

```promql
{{metric-name}}{service="{{service-name}}",environment="production"}
```

### 3.2 メトリクス: {{metric-name-2}}

（同様の形式で各メトリクスを定義）

## 4. SLI/SLO マッピング

### 4.1 ビジネス要件とSLIの対応

| SLO                       | SLI                       | メトリクス名    | 目標値 | 測定方法        |
| ------------------------- | ------------------------- | --------------- | ------ | --------------- |
| 可用性99.9%               | 成功リクエスト率          | {{metric-name}} | ≥99.9% | {{calculation}} |
| レイテンシ < 200ms（p95） | リクエスト処理時間（p95） | {{metric-name}} | <200ms | {{calculation}} |
| エラー率 < 0.1%           | 5xxエラー率               | {{metric-name}} | <0.1%  | {{calculation}} |

### 4.2 Error Budget計算

```
Error Budget = 100% - SLO
例: SLO 99.9% の場合、Error Budget = 0.1%

月間許容エラー数 = 30日 × 24時間 × 60分 × 60秒 × 0.001 = 2,592秒（約43分）
```

## 5. カーディナリティ管理

### 5.1 High-Cardinalityラベルの使用基準

| ラベル        | 予想カーディナリティ | 使用可否 | 理由                       |
| ------------- | -------------------- | -------- | -------------------------- |
| `user_id`     | 1,000,000+           | 不可     | カーディナリティが高すぎる |
| `service`     | 10-20                | 可       | 適度なカーディナリティ     |
| `environment` | 3-5                  | 可       | カーディナリティが低い     |

### 5.2 カーディナリティ削減戦略

- **Hash化**: `user_id` → `user_id_bucket`（例: user_id % 100）
- **集約**: 詳細ラベルを除去し、サービスレベルで集約
- **サンプリング**: 全トラフィックではなく、1%サンプリング

## 6. メトリクス取得アーキテクチャ

### 6.1 収集フロー

```
Application
  ↓ (metrics endpoint)
Prometheus
  ↓ (remote write)
Long-term Storage (Thanos / Cortex / Mimir)
  ↓
Grafana (可視化)
Alertmanager (アラート)
```

### 6.2 エクスポーター一覧

| エクスポーター      | 対象               | ポート | メトリクス例                   |
| ------------------- | ------------------ | ------ | ------------------------------ |
| node_exporter       | サーバーメトリクス | 9100   | `node_cpu_seconds_total`       |
| postgres_exporter   | PostgreSQL         | 9187   | `pg_stat_database_*`           |
| redis_exporter      | Redis              | 9121   | `redis_connected_clients`      |
| custom_app_exporter | カスタムアプリ     | 8080   | `app_request_duration_seconds` |

## 7. メトリクス取得のオーバーヘッド見積もり

### 7.1 パフォーマンス影響

| 項目               | 見積               | 許容範囲 |
| ------------------ | ------------------ | -------- |
| CPU使用率増加      | {{percentage}}%    | <5%      |
| メモリ使用量増加   | {{megabytes}}MB    | <100MB   |
| ネットワーク帯域   | {{kilobits}}Kbps   | <1Mbps   |
| スクレイプ処理時間 | {{milliseconds}}ms | <100ms   |

### 7.2 ストレージコスト

| 保存期間            | データサイズ見積 | コスト（月額） |
| ------------------- | ---------------- | -------------- |
| Raw (7days)         | {{gigabytes}}GB  | {{cost}}       |
| Aggregated (90days) | {{gigabytes}}GB  | {{cost}}       |

## 8. 次のステップ

- [ ] Prometheusエクスポーターの実装/設定
- [ ] メトリクス収集の動作確認
- [ ] アラートしきい値設定（threshold-configuration タスク）
- [ ] Grafanaダッシュボード作成
