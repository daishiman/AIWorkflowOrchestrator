# Neonバックアップガイド

## 概要

NeonはPostgreSQL互換のサーバーレスデータベースで、
ブランチ機能による高度なバックアップ・復旧機能を提供します。

## Neonのバックアップ機能

### 1. 自動バックアップ

```yaml
automatic_backup:
  type: continuous
  mechanism: Copy-on-Write
  retention:
    free: 7 days
    launch: 14 days
    scale: 30 days
    enterprise: custom
```

### 2. ブランチ機能

NeonのブランチはGitのブランチに似た概念で、
任意の時点からデータベースの完全なコピーを作成できます。

```bash
# 現在時点でブランチ作成
neon branches create --name backup_$(date +%Y%m%d)

# 特定時点でブランチ作成（PITR）
neon branches create --name recovery \
  --from main@2024-01-15T10:00:00Z

# ブランチ一覧
neon branches list
```

### 3. PITR（Point-in-Time Recovery）

```yaml
pitr:
  enabled: true
  granularity: seconds
  retention: 7-30 days (プランによる)

  recovery_steps:
    1. 復旧時点を決定
    2. ブランチを作成
    3. データを検証
    4. 本番に適用（必要に応じて）
```

## バックアップ戦略

### 推奨構成

```
┌─────────────────────────────────────────┐
│              main (本番)                 │
│         ← 自動バックアップ有効            │
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
neon branches create --name recovery_20240115 \
  --from main@2024-01-15T09:00:00Z

# Step 2: 接続情報を取得
neon connection-string --branch recovery_20240115

# Step 3: データを検証
psql "postgresql://user:pass@recovery-branch.neon.tech/db" \
  -c "SELECT COUNT(*) FROM critical_table"

# Step 4: 本番への適用（オプション）
# - 差分データを抽出して適用
# - または新ブランチを本番として使用
```

### 方法2: 本番ブランチのリセット

```bash
# 注意: 既存データが失われます

# Step 1: 現在の本番をバックアップ
neon branches create --name main_backup_$(date +%Y%m%d)

# Step 2: 本番をリセット（特定時点へ）
# ※Neon CLIでは直接リセットできないため、
# 新ブランチ作成 → アプリ接続先変更のフローを推奨
```

## Neon Console操作

### ブランチ作成（GUI）

1. Neon Consoleにログイン
2. プロジェクトを選択
3. "Branches" タブを開く
4. "Create branch" をクリック
5. 復旧時点を指定（"Point in time"）
6. ブランチ名を入力
7. "Create branch" をクリック

### 接続情報の確認

1. ブランチを選択
2. "Connection details" を確認
3. DATABASE_URLをコピー

## API操作

### ブランチ作成（API）

```bash
curl -X POST "https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches" \
  -H "Authorization: Bearer ${NEON_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "branch": {
      "name": "recovery_branch",
      "parent_id": "main_branch_id",
      "parent_timestamp": "2024-01-15T09:00:00Z"
    }
  }'
```

### ブランチ一覧取得

```bash
curl "https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches" \
  -H "Authorization: Bearer ${NEON_API_KEY}"
```

## 保持ポリシー

```yaml
retention_policy:
  automatic_backups:
    free: 7 days
    launch: 14 days
    scale: 30 days

  branches:
    active: unlimited
    inactive: 自動削除されない（手動管理）

  recommendations:
    - 不要なブランチは定期的に削除
    - バックアップブランチは月次で整理
    - 本番ブランチは常に保持
```

## 監視とアラート

### 監視項目

```yaml
monitoring:
  branch_count:
    metric: branches_total
    threshold: プランの上限に注意

  storage_usage:
    metric: storage_bytes
    threshold: 80% of limit

  pitr_retention:
    metric: pitr_window_hours
    threshold: 最小24時間
```

### アラート設定

```yaml
alerts:
  - name: backup_age
    condition: last_backup_age > 24h
    action: notify_dba

  - name: storage_warning
    condition: storage_usage > 80%
    action: notify_team
```

## 制限事項

### Neon固有の制限

```yaml
limitations:
  - pg_dump/pg_restoreは通常通り使用可能
  - 物理バックアップ（pg_basebackup）は未サポート
  - WALファイルへの直接アクセスは不可
  - ブランチ間のマージは手動操作

workarounds:
  - 論理バックアップ（pg_dump）でオフサイト保存
  - 定期的なブランチ作成で復旧ポイント確保
```

## チェックリスト

### 初期設定時
- [ ] PITRが有効になっているか確認
- [ ] ブランチ命名規則を決定
- [ ] バックアップブランチ作成スケジュールを設定
- [ ] 接続情報を安全に管理

### 定期確認
- [ ] ブランチ数が上限に近づいていないか
- [ ] ストレージ使用量を確認
- [ ] 不要なブランチを削除
- [ ] 復旧テストを実施

### 障害時
- [ ] 復旧時点を特定
- [ ] PITRブランチを作成
- [ ] データを検証
- [ ] 本番に適用（必要に応じて）
