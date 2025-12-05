# Tursoバックアップガイド

## 概要

TursoはSQLite互換のエッジデータベースで、
ブランチ機能とスナップショットによる高度なバックアップ・復旧機能を提供します。

## Tursoのバックアップ機能

### 1. 自動バックアップ

```yaml
automatic_backup:
  type: continuous_snapshots
  mechanism: libSQL replication
  retention:
    free: 24 hours
    starter: 7 days
    pro: 30 days
    enterprise: custom
```

### 2. ブランチ機能

TursoのブランチはGitのブランチに似た概念で、
任意の時点からデータベースの完全なコピーを作成できます。

```bash
# 現在時点でブランチ作成
turso db create backup-$(date +%Y%m%d) --from-db main

# 特定時点でブランチ作成（PITR）
turso db create recovery-branch \
  --from-db main --timestamp 2024-01-15T10:00:00Z

# ブランチ一覧
turso db list
```

### 3. PITR（Point-in-Time Recovery）

```yaml
pitr:
  enabled: true (Pro/Enterprise)
  granularity: seconds
  retention: 7-30 days (プランによる)

  recovery_steps: 1. 復旧時点を決定
    2. スナップショットまたはブランチを作成
    3. データを検証
    4. 本番に適用（必要に応じて）
```

## バックアップ戦略

### 推奨構成

```
┌─────────────────────────────────────────┐
│              main (本番)                 │
│         ← 自動スナップショット有効        │
└─────────────────────────────────────────┘
                    │
         ┌──────────┼──────────┐
         ↓          ↓          ↓
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │  staging  │ │   dev    │ │ recovery │
   │ (検証用)  │ │ (開発用)  │ │ (PITR)   │
   └──────────┘ └──────────┘ └──────────┘
```

### ブランチ命名規則

```yaml
naming_conventions:
  production: main
  staging: staging
  development: dev-{feature}
  backup: backup-{YYYYMMDD}
  recovery: recovery-{YYYYMMDD-HHMMSS}
  pitr: pitr-{timestamp}
```

## 復旧手順

### 方法1: ブランチからの復旧

```bash
# Step 1: 復旧用ブランチを作成
turso db create recovery-20240115 \
  --from-db main --timestamp 2024-01-15T09:00:00Z

# Step 2: 接続情報を取得
turso db show recovery-20240115

# Step 3: データを検証
turso db shell recovery-20240115 \
  "SELECT COUNT(*) FROM critical_table"

# Step 4: 本番への適用（オプション）
# - 差分データを抽出して適用
# - または新ブランチを本番として使用
```

### 方法2: SQLiteファイルバックアップ

```bash
# Step 1: データベースファイルをダウンロード
turso db dump main > backup_$(date +%Y%m%d).sql

# Step 2: ローカルでファイルコピー
sqlite3 main.db ".backup backup.db"

# Step 3: 復旧時にアップロード
turso db restore main < backup_20240115.sql
```

### 方法3: スナップショットからの復旧

```bash
# Step 1: 利用可能なスナップショットを確認
turso db snapshots list main

# Step 2: スナップショットから新しいDBを作成
turso db create restored-db --from-snapshot <snapshot-id>

# Step 3: データを検証
turso db shell restored-db "SELECT * FROM users LIMIT 10"
```

## Turso CLI操作

### ブランチ作成（CLI）

1. Turso CLIにログイン

   ```bash
   turso auth login
   ```

2. データベース一覧を確認

   ```bash
   turso db list
   ```

3. ブランチを作成

   ```bash
   turso db create recovery-branch --from-db main
   ```

4. 特定時点からブランチ作成（PITR）
   ```bash
   turso db create pitr-recovery \
     --from-db main --timestamp 2024-01-15T09:00:00Z
   ```

### 接続情報の確認

```bash
# データベース詳細を表示
turso db show main

# 接続URLを取得
turso db show main --url

# 認証トークンを生成
turso db tokens create main
```

## API操作

### データベース作成（API）

```bash
curl -X POST "https://api.turso.tech/v1/organizations/${ORG_NAME}/databases" \
  -H "Authorization: Bearer ${TURSO_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "recovery-branch",
    "group": "default",
    "seed": {
      "type": "database",
      "name": "main",
      "timestamp": "2024-01-15T09:00:00Z"
    }
  }'
```

### データベース一覧取得

```bash
curl "https://api.turso.tech/v1/organizations/${ORG_NAME}/databases" \
  -H "Authorization: Bearer ${TURSO_API_TOKEN}"
```

### スナップショット一覧取得

```bash
curl "https://api.turso.tech/v1/organizations/${ORG_NAME}/databases/main/snapshots" \
  -H "Authorization: Bearer ${TURSO_API_TOKEN}"
```

## 保持ポリシー

```yaml
retention_policy:
  automatic_snapshots:
    free: 24 hours
    starter: 7 days
    pro: 30 days
    enterprise: custom

  databases:
    active: unlimited
    inactive: プランによって異なる（要確認）

  recommendations:
    - 不要なデータベースは定期的に削除
    - バックアップブランチは月次で整理
    - 本番データベースは常に保持
```

## 監視とアラート

### 監視項目

```yaml
monitoring:
  database_count:
    metric: databases_total
    threshold: プランの上限に注意

  storage_usage:
    metric: storage_bytes
    threshold: 80% of limit

  replication_lag:
    metric: replication_delay_seconds
    threshold: 最大60秒

  snapshot_age:
    metric: last_snapshot_age_hours
    threshold: 最大24時間
```

### アラート設定

```yaml
alerts:
  - name: snapshot_age
    condition: last_snapshot_age > 24h
    action: notify_dba

  - name: storage_warning
    condition: storage_usage > 80%
    action: notify_team

  - name: replication_lag
    condition: replication_lag > 60s
    action: notify_sre
```

## 制限事項

### Turso固有の制限

```yaml
limitations:
  - .backup コマンドはTurso CLIまたはAPI経由で使用
  - SQLiteの標準バックアップコマンドは制限あり
  - WALファイルへの直接アクセスは不可
  - ブランチ間のマージは手動操作

workarounds:
  - SQL dump（.dump）でオフサイト保存
  - 定期的なブランチ作成で復旧ポイント確保
  - turso db dump コマンドでSQL形式エクスポート
```

## SQLite固有のバックアップ機能

### .backup コマンド

```bash
# ローカルSQLiteファイルのバックアップ
sqlite3 main.db ".backup backup.db"

# Turso経由でのダンプ
turso db dump main > backup.sql
```

### VACUUMによる最適化

```bash
# データベースを最適化してからバックアップ
turso db shell main "VACUUM INTO 'backup.db'"
```

## チェックリスト

### 初期設定時

- [ ] 自動スナップショットが有効になっているか確認
- [ ] ブランチ命名規則を決定
- [ ] バックアップブランチ作成スケジュールを設定
- [ ] 接続情報と認証トークンを安全に管理

### 定期確認

- [ ] データベース数が上限に近づいていないか
- [ ] ストレージ使用量を確認
- [ ] 不要なブランチを削除
- [ ] 復旧テストを実施
- [ ] スナップショットの年齢を確認

### 障害時

- [ ] 復旧時点を特定
- [ ] PITRブランチまたはスナップショットから復旧
- [ ] データを検証
- [ ] 本番に適用（必要に応じて）
