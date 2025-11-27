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
  action: "???"  # アクションが不明確
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

| アラート | 条件 | 対応 |
|---------|------|------|
| 接続枯渇 | max_connections の 95% 超過 | 接続リーク調査、強制切断検討 |
| ディスク枯渇 | 90% 使用 | 緊急データ削除、ディスク拡張 |
| レプリケーション停止 | wal_sender が streaming でない | レプリカ復旧、フェイルオーバー検討 |
| デッドロック頻発 | 5件/時 超過 | トランザクション設計見直し |
| 30秒超クエリ | 実行中クエリ > 30秒 | クエリ停止判断、原因調査 |

### Warning（営業時間内対応）

| アラート | 条件 | 対応 |
|---------|------|------|
| 接続数増加傾向 | 80% 超過 | 接続プール設定見直し |
| スロークエリ増加 | 10件/分 超過 | クエリ最適化計画 |
| キャッシュヒット率低下 | 95% 未満 | shared_buffers 調整検討 |
| デッド行蓄積 | 30% 超過 | VACUUM 実行、autovacuum 設定見直し |
| レプリケーション遅延 | 10秒超過 | ネットワーク・負荷確認 |

### Info（週次レビュー）

| アラート | 条件 | 対応 |
|---------|------|------|
| DB成長率 | 5%/日 超過 | 容量計画の見直し |
| 未使用インデックス | 30日間スキャン 0 | インデックス削除検討 |
| テーブル肥大化 | 特定テーブルの急成長 | パーティション検討 |

## Neon/Supabase 固有アラート

### Neon

```yaml
neon_alerts:
  compute_scaling:
    warning: "頻繁なスケールアップ/ダウン"
    action: "固定サイズの検討、アクセスパターン分析"

  cold_start_frequency:
    warning: "コールドスタートが10回/日超過"
    action: "常時起動設定の検討"

  branch_divergence:
    warning: "ブランチ間のスキーマ差分が大きい"
    action: "ブランチ整理、マージ検討"
```

### Supabase

```yaml
supabase_alerts:
  realtime_connections:
    warning: "Realtime接続数が制限の80%"
    action: "接続数最適化、プラン見直し"

  storage_quota:
    warning: "Storage使用量が制限の80%"
    action: "不要ファイル削除、プラン見直し"

  api_rate_limit:
    warning: "APIレート制限に近づいている"
    action: "リクエスト最適化、キャッシュ導入"

  edge_function_errors:
    critical: "Edge Functionエラー率 > 5%"
    action: "エラーログ確認、デプロイロールバック検討"
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

```markdown
# Runbook: 接続数上限超過

## 概要
PostgreSQL の max_connections に近づいている状態

## 影響
- 新規接続が拒否される可能性
- アプリケーションエラー増加

## 診断手順
1. 接続状態を確認
   ```sql
   SELECT state, COUNT(*) FROM pg_stat_activity GROUP BY state;
   ```

2. 長時間接続を特定
   ```sql
   SELECT pid, usename, application_name, state, query_start
   FROM pg_stat_activity
   WHERE state != 'idle'
   ORDER BY query_start;
   ```

## 対応手順
1. アイドル接続が多い場合
   - アプリケーションの接続プール設定を確認
   - idle_in_transaction セッションを強制終了

2. アクティブ接続が多い場合
   - 負荷分散の確認
   - Read Replica への振り分け検討

## エスカレーション
- 15分以内に改善しない場合: DBA チームに連絡
- サービス影響が出た場合: インシデント対応プロセスを開始
```

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
```

### PagerDuty 連携

```javascript
async function sendToPagerDuty(alert) {
  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: 'trigger',
      payload: {
        summary: alert.title,
        severity: alert.severity,
        source: 'database-monitoring',
        custom_details: alert.details
      }
    })
  });
}
```
