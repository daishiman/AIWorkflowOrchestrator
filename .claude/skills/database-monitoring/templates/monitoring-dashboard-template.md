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
データソース: SQLite/Turso
クエリ:
  SELECT
    CASE
      WHEN (SELECT value FROM pragma_database_list WHERE name = 'main') LIKE '%replica%'
      THEN 'Replica'
      ELSE 'Primary'
    END AS role

表示: 単一値 + 色分け（Primary=緑, Replica=青）
```

#### 1.2 接続数ゲージ

```
タイプ: Gauge
クエリ:
  -- libSQL固有: 現在の接続数をアプリケーションレベルで追跡
  SELECT
    current_connections::float / max_connections * 100 AS connection_pct
  FROM connection_metrics

閾値:
  - 0-80%: 緑
  - 80-95%: 黄
  - 95-100%: 赤

注: SQLiteは接続数制限がないため、アプリケーション側で追跡が必要
```

#### 1.3 データベースサイズ

```
タイプ: Stat Panel
クエリ:
  SELECT
    ROUND(page_count * page_size / 1024.0 / 1024.0, 2) || ' MB' AS db_size
  FROM pragma_page_count(), pragma_page_size()

表示: 単一値
```

#### 1.4 トランザクション/秒

```
タイプ: Stat Panel
クエリ:
  -- アプリケーションレベルで追跡したメトリクスから取得
  SELECT
    commits_per_sec + rollbacks_per_sec AS tps
  FROM transaction_metrics
  WHERE timestamp >= datetime('now', '-1 minute')

表示: 単一値 + スパークライン
```

---

### 2. パフォーマンスパネル（2行目）

#### 2.1 クエリ実行時間分布

```
タイプ: Histogram
クエリ:
  -- アプリケーションレベルで追跡したクエリメトリクスから取得
  SELECT
    CASE
      WHEN mean_exec_time < 10 THEN '< 10ms'
      WHEN mean_exec_time < 100 THEN '10-100ms'
      WHEN mean_exec_time < 1000 THEN '100ms-1s'
      ELSE '> 1s'
    END AS bucket,
    COUNT(*) AS count
  FROM query_metrics
  GROUP BY bucket

表示: 棒グラフ、色分け
```

#### 2.2 スロークエリ数推移

```
タイプ: Time Series
クエリ:
  -- アプリケーションメトリクスから収集
  SELECT timestamp, slow_query_count FROM query_metrics
  WHERE timestamp >= datetime('now', '-24 hours')

表示: 線グラフ、閾値線表示
```

#### 2.3 キャッシュヒット率

```
タイプ: Gauge
クエリ:
  -- PRAGMA cache_sizeとアプリケーションメトリクスから計算
  SELECT
    ROUND(100.0 * cache_hits / NULLIF(cache_hits + cache_misses, 0), 2) AS cache_hit_pct
  FROM (
    SELECT
      cache_hits,
      cache_misses
    FROM cache_metrics
    WHERE timestamp >= datetime('now', '-5 minutes')
  )

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
  -- アプリケーションレベルで追跡した接続状態
  SELECT state, COUNT(*) AS count
  FROM connection_state_metrics
  WHERE timestamp >= datetime('now', '-1 minute')
  GROUP BY state

表示: 円グラフ、凡例付き
色:
  - active: 緑
  - idle: 青
  - in_transaction: 黄
  - error: 赤

注: SQLiteは接続プーリングがアプリケーション管理のため、
    アプリケーション側で状態を追跡する必要があります
```

#### 3.2 テーブルサイズTop 10

```
タイプ: Bar Gauge
クエリ:
  SELECT
    name AS table_name,
    pgsize AS size_bytes
  FROM dbstat
  WHERE name NOT LIKE 'sqlite_%'
  GROUP BY name
  ORDER BY SUM(pgsize) DESC
  LIMIT 10

表示: 横棒グラフ
```

#### 3.3 インデックス使用率

```
タイプ: Table
クエリ:
  -- アプリケーションメトリクスから追跡
  SELECT
    table_name AS table,
    index_scans,
    seq_scans,
    CASE WHEN index_scans + seq_scans > 0
      THEN ROUND(100.0 * index_scans / (index_scans + seq_scans), 1)
      ELSE 100
    END AS index_usage_pct
  FROM table_scan_metrics
  WHERE timestamp >= datetime('now', '-1 hour')
  ORDER BY seq_scans DESC
  LIMIT 10

表示: テーブル、条件付き書式
```

---

### 4. エラー・アラートパネル（4行目）

#### 4.1 書き込み競合エラー

```
タイプ: Stat Panel
クエリ:
  -- アプリケーションレベルで追跡したSQLITE_BUSY/SQLITE_LOCKEDエラー
  SELECT COUNT(*) AS error_count
  FROM error_metrics
  WHERE error_type IN ('SQLITE_BUSY', 'SQLITE_LOCKED')
    AND timestamp >= datetime('now', '-5 minutes')

表示: 単一値、0以外は赤
```

#### 4.2 ロック待機中クエリ

```
タイプ: Table
クエリ:
  -- アプリケーションレベルで追跡したロック待機
  SELECT
    query_id,
    query_text,
    wait_duration_sec
  FROM lock_wait_metrics
  WHERE status = 'waiting'
    AND timestamp >= datetime('now', '-5 minutes')
  ORDER BY wait_duration_sec DESC
  LIMIT 5

表示: テーブル

注: SQLiteはシンプルなファイルロックモデルのため、
    アプリケーション側でタイムアウトと待機を追跡します
```

#### 4.3 レプリケーション遅延（Tursoの場合）

```
タイプ: Time Series
クエリ:
  -- Turso固有: プライマリとレプリカ間の同期遅延
  SELECT
    replica_location,
    replication_lag_ms
  FROM turso_replication_metrics
  WHERE timestamp >= datetime('now', '-1 hour')

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

### Turso 向け調整

- エッジロケーション別レプリケーション遅延パネルを追加
- グローバル読み取りレイテンシーマップを追加
- プライマリ-レプリカ同期ステータスパネルを追加
- WALフレーム同期メトリクスパネルを追加

### ローカルSQLite 向け調整

- ファイルI/Oパフォーマンスパネルを追加
- VACUUMとANALYZE実行履歴パネルを追加
- ページキャッシュヒット率パネルを追加
- ジャーナルモード設定パネルを追加

---

## 実装チェックリスト

- [ ] データソースの設定完了
- [ ] すべてのパネルが正常にデータ表示
- [ ] アラートルールの設定完了
- [ ] 通知チャネルの設定完了
- [ ] アクセス権限の設定完了
- [ ] 更新間隔の最適化完了
