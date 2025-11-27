# 監視ダッシュボード設計テンプレート

## ダッシュボード概要

**目的**: [監視の目的を記述]
**対象者**: [SRE/DBA/開発者/経営層]
**更新頻度**: [リアルタイム/1分/5分/15分]

---

## パネル構成

### 1. 概要パネル（トップ行）

#### 1.1 データベースステータス
```
タイプ: Stat Panel
データソース: PostgreSQL
クエリ:
  SELECT CASE
    WHEN pg_is_in_recovery() THEN 'Replica'
    ELSE 'Primary'
  END AS role

表示: 単一値 + 色分け（Primary=緑, Replica=青）
```

#### 1.2 接続数ゲージ
```
タイプ: Gauge
クエリ:
  SELECT
    COUNT(*)::float / (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') * 100
  FROM pg_stat_activity

閾値:
  - 0-80%: 緑
  - 80-95%: 黄
  - 95-100%: 赤
```

#### 1.3 データベースサイズ
```
タイプ: Stat Panel
クエリ:
  SELECT pg_size_pretty(pg_database_size(current_database()))

表示: 単一値
```

#### 1.4 トランザクション/秒
```
タイプ: Stat Panel
クエリ:
  SELECT
    xact_commit + xact_rollback AS tps
  FROM pg_stat_database
  WHERE datname = current_database()

表示: 単一値 + スパークライン
```

---

### 2. パフォーマンスパネル（2行目）

#### 2.1 クエリ実行時間分布
```
タイプ: Histogram
クエリ:
  SELECT
    CASE
      WHEN mean_exec_time < 10 THEN '< 10ms'
      WHEN mean_exec_time < 100 THEN '10-100ms'
      WHEN mean_exec_time < 1000 THEN '100ms-1s'
      ELSE '> 1s'
    END AS bucket,
    COUNT(*) AS count
  FROM pg_stat_statements
  GROUP BY bucket

表示: 棒グラフ、色分け
```

#### 2.2 スロークエリ数推移
```
タイプ: Time Series
クエリ:
  -- メトリクス収集が必要（Prometheus/TimescaleDB）
  SELECT time, slow_query_count FROM metrics
  WHERE time > NOW() - INTERVAL '24 hours'

表示: 線グラフ、閾値線表示
```

#### 2.3 キャッシュヒット率
```
タイプ: Gauge
クエリ:
  SELECT
    ROUND(100.0 * SUM(heap_blks_hit) /
      NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0), 2)
  FROM pg_statio_user_tables

閾値:
  - 99-100%: 緑
  - 95-99%: 黄
  - < 95%: 赤
```

---

### 3. リソースパネル（3行目）

#### 3.1 接続状態内訳
```
タイプ: Pie Chart
クエリ:
  SELECT state, COUNT(*) AS count
  FROM pg_stat_activity
  WHERE pid != pg_backend_pid()
  GROUP BY state

表示: 円グラフ、凡例付き
色:
  - active: 緑
  - idle: 青
  - idle in transaction: 黄
  - idle in transaction (aborted): 赤
```

#### 3.2 テーブルサイズTop 10
```
タイプ: Bar Gauge
クエリ:
  SELECT
    relname,
    pg_total_relation_size(relid) AS size
  FROM pg_stat_user_tables
  ORDER BY size DESC
  LIMIT 10

表示: 横棒グラフ
```

#### 3.3 インデックス使用率
```
タイプ: Table
クエリ:
  SELECT
    relname AS table,
    idx_scan AS index_scans,
    seq_scan AS seq_scans,
    CASE WHEN idx_scan + seq_scan > 0
      THEN ROUND(100.0 * idx_scan / (idx_scan + seq_scan), 1)
      ELSE 100
    END AS index_usage_pct
  FROM pg_stat_user_tables
  ORDER BY seq_scan DESC
  LIMIT 10

表示: テーブル、条件付き書式
```

---

### 4. エラー・アラートパネル（4行目）

#### 4.1 デッドロック発生
```
タイプ: Stat Panel
クエリ:
  SELECT deadlocks FROM pg_stat_database
  WHERE datname = current_database()

表示: 単一値、0以外は赤
```

#### 4.2 ロック待機中クエリ
```
タイプ: Table
クエリ:
  SELECT
    blocked.pid,
    blocked.usename,
    substring(blocked.query, 1, 50) AS query,
    EXTRACT(EPOCH FROM (NOW() - blocked.query_start)) AS wait_sec
  FROM pg_stat_activity blocked
  JOIN pg_stat_activity blocking
    ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
  LIMIT 5

表示: テーブル
```

#### 4.3 レプリケーション遅延（該当する場合）
```
タイプ: Time Series
クエリ:
  SELECT
    client_addr,
    EXTRACT(EPOCH FROM replay_lag) AS lag_sec
  FROM pg_stat_replication

表示: 線グラフ、閾値線
```

---

## アラートルール

### Critical アラート
```yaml
- name: connection_critical
  condition: connections_pct > 95
  for: 1m
  notification: PagerDuty

- name: disk_critical
  condition: disk_usage_pct > 90
  for: 5m
  notification: PagerDuty
```

### Warning アラート
```yaml
- name: connection_warning
  condition: connections_pct > 80
  for: 5m
  notification: Slack #alerts

- name: slow_queries_warning
  condition: slow_query_count > 10
  for: 5m
  notification: Slack #alerts
```

---

## カスタマイズガイド

### Neon 向け調整
- コンピュートアクティブ時間パネルを追加
- ブランチ別メトリクスのフィルタを追加
- コールドスタート監視パネルを追加

### Supabase 向け調整
- Realtime 接続数パネルを追加
- Storage 使用量パネルを追加
- Edge Functions メトリクスパネルを追加

---

## 実装チェックリスト

- [ ] データソースの設定完了
- [ ] すべてのパネルが正常にデータ表示
- [ ] アラートルールの設定完了
- [ ] 通知チャネルの設定完了
- [ ] アクセス権限の設定完了
- [ ] 更新間隔の最適化完了
