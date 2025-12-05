# アラート設計戦略

## アラート設計原則

### 1. アクション可能性

すべてのアラートは具体的なアクションに結びつける必要があります。

```yaml
good_alert:
  name: "接続数が上限の90%を超過"
  action: "接続プールの設定を見直す or アプリケーションの接続リークを調査"
  runbook_url: "/runbooks/connection-saturation.md"

bad_alert:
  name: "CPU使用率が高い"
  action: "???" # アクションが不明確
```

### 2. 段階的エスカレーション

```yaml
connection_alerts:
  warning:
    threshold: "80%"
    action: "Slack通知、次の営業時間に確認"

  critical:
    threshold: "95%"
    action: "PagerDuty、即座にオンコール対応"

  emergency:
    threshold: "100%（接続不可）"
    action: "全チーム緊急対応、ステータスページ更新"
```

### 3. コンテキスト付与

```yaml
alert_with_context:
  title: "スロークエリ急増"
  message: |
    過去5分間で30秒超のクエリが5件発生

    影響を受けているテーブル: users, orders
    最も遅いクエリ: SELECT * FROM orders WHERE...

    対応手順: /runbooks/slow-queries.md
    ダッシュボード: /grafana/d/db-performance
```

## アラートカテゴリ

### Critical（即座対応）

| アラート             | 条件                           | 対応                               |
| -------------------- | ------------------------------ | ---------------------------------- |
| 接続枯渇             | max_connections の 95% 超過    | 接続リーク調査、強制切断検討       |
| ディスク枯渇         | 90% 使用                       | 緊急データ削除、ディスク拡張       |
| レプリケーション停止 | wal_sender が streaming でない | レプリカ復旧、フェイルオーバー検討 |
| デッドロック頻発     | 5件/時 超過                    | トランザクション設計見直し         |
| 30秒超クエリ         | 実行中クエリ > 30秒            | クエリ停止判断、原因調査           |

### Warning（営業時間内対応）

| アラート               | 条件         | 対応                               |
| ---------------------- | ------------ | ---------------------------------- |
| 接続数増加傾向         | 80% 超過     | 接続プール設定見直し               |
| スロークエリ増加       | 10件/分 超過 | クエリ最適化計画                   |
| キャッシュヒット率低下 | 95% 未満     | shared_buffers 調整検討            |
| デッド行蓄積           | 30% 超過     | VACUUM 実行、autovacuum 設定見直し |
| レプリケーション遅延   | 10秒超過     | ネットワーク・負荷確認             |

### Info（週次レビュー）

| アラート           | 条件                 | 対応                 |
| ------------------ | -------------------- | -------------------- |
| DB成長率           | 5%/日 超過           | 容量計画の見直し     |
| 未使用インデックス | 30日間スキャン 0     | インデックス削除検討 |
| テーブル肥大化     | 特定テーブルの急成長 | パーティション検討   |

## Turso 固有アラート

```yaml
turso_alerts:
  connection_limit:
    warning: "HTTP/WebSocket接続数が制限の80%"
    action: "接続プール最適化、接続数制限確認"

  replication_lag:
    warning: "レプリケーション遅延 > 1秒"
    critical: "レプリケーション遅延 > 5秒"
    action: "レプリカ配置見直し、ネットワーク確認"

  edge_latency:
    warning: "エッジロケーションレイテンシ p95 > 200ms"
    action: "最寄りエッジロケーション確認、クエリ最適化"

  database_size:
    warning: "データベースサイズが急増（10%/日）"
    action: "データ増加原因調査、VACUUMの実行"

  operation_rate_limit:
    warning: "読み取り/書き込み操作がレート制限接近"
    action: "操作頻度の見直し、バッチ処理検討"

  sync_conflicts:
    warning: "同期競合が頻発"
    action: "書き込みパターン見直し、競合解決戦略確認"
```

## アラート抑制戦略

### 重複アラート抑制

```yaml
deduplication:
  strategy: "same_alert_key"
  window: "5m"
  # 同じアラートは5分間は再発火しない
```

### 依存関係による抑制

```yaml
suppression_rules:
  - if: "database_unreachable"
    suppress:
      - "slow_queries"
      - "connection_count"
      - "replication_lag"
    # DB接続不可時は他のDBアラートを抑制
```

### メンテナンスウィンドウ

```yaml
maintenance_windows:
  - name: "weekly_maintenance"
    schedule: "Sunday 02:00-04:00 JST"
    suppress_all: true

  - name: "migration_window"
    manual_activation: true
    suppress:
      - "slow_queries"
      - "lock_waits"
```

## Runbook テンプレート

各アラートに対応する Runbook を用意:

````markdown
# Runbook: 接続数上限超過

## 概要

libSQL/Turso の接続制限に近づいている状態

## 影響

- 新規接続が拒否される可能性
- アプリケーションエラー増加

## 診断手順

1. 接続プール状態を確認
   ```javascript
   // アプリケーションレベルでの接続統計
   console.log({
     active: connectionPool.activeCount,
     idle: connectionPool.idleCount,
     total: connectionPool.totalCount,
     max: connectionPool.max,
   });
   ```
````

2. 長時間接続の特定
   - アプリケーションログから長時間保持されている接続を特定
   - 接続リークの可能性を調査

## 対応手順

1. アイドル接続が多い場合
   - アプリケーションの接続プール設定を確認
   - タイムアウト設定の見直し

2. アクティブ接続が多い場合
   - 負荷分散の確認
   - 読み取り専用レプリカへの振り分け検討

## エスカレーション

- 15分以内に改善しない場合: DBA チームに連絡
- サービス影響が出た場合: インシデント対応プロセスを開始

````

## モニタリングツール連携

### Grafana アラート設定例

```yaml
# grafana-alerts.yaml
groups:
  - name: database-alerts
    rules:
      - alert: HighConnectionCount
        expr: pg_stat_activity_count / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "接続数が上限の80%を超過"
          runbook_url: "/runbooks/connection-saturation.md"
````

### PagerDuty 連携

```javascript
async function sendToPagerDuty(alert) {
  await fetch("https://events.pagerduty.com/v2/enqueue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: "trigger",
      payload: {
        summary: alert.title,
        severity: alert.severity,
        source: "database-monitoring",
        custom_details: alert.details,
      },
    }),
  });
}
```
