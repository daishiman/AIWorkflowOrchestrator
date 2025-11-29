---
description: |
  データベースバックアップ・リカバリ戦略の設定を行う専門コマンド。

  『Database Reliability Engineering』の原則に基づき、多層防御モデル、
  PITR（Point-in-Time Recovery）、RPO/RTO設計、災害復旧計画を確立して
  データ損失を許さない体制を構築します。

  🤖 起動エージェント:
  - `.claude/agents/dba-mgr.md`: データベース管理専門エージェント

  📚 利用可能スキル（タスクに応じてdba-mgrエージェントが必要時に参照）:
  **Phase 1（要件定義時）:** RPO/RTO要件の確認、バックアップ頻度決定
  **Phase 2（設計時）:** backup-recovery（多層防御モデル、PITR、災害復旧計画）
  **Phase 3（実装時）:** 自動バックアップスクリプト作成、CI/CD統合
  **Phase 4（検証時）:** 復旧ドリル実施、整合性検証
  **Phase 5（運用時）:** database-monitoring（バックアップ監視、アラート設計）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（バックアップスケジュール: daily/hourly、未指定時は対話形式）
  - allowed-tools: エージェント起動とバックアップ設定用
    • Task: dba-mgrエージェント起動用
    • Read: 既存設定・ドキュメント参照用
    • Write(scripts/**|docs/**): バックアップスクリプト・復旧手順書生成用（パス制限）
    • Bash: バックアップテスト実行用
    • Grep: 既存パターン検索用
  - model: sonnet（標準的なバックアップ設定タスク）

  トリガーキーワード: backup, recovery, disaster, PITR, RPO, RTO, restoration
argument-hint: "[backup-schedule]"
allowed-tools: [Task, Read, Write(scripts/**|docs/**), Bash, Grep]
model: sonnet
---

# データベースバックアップ設定コマンド

## 目的

以下の要件を満たすバックアップ・リカバリ戦略を確立します:

- **多層防御**: 自動バックアップ、PITR、検証、オフサイト保存
- **RPO/RTO設計**: 目標復旧時点・目標復旧時間の明確化
- **災害復旧計画**: データセンター障害を想定した復旧手順
- **定期的な復旧ドリル**: 復旧手順の実効性確認

## 使用方法

### 基本的な使用（対話形式）

```bash
/ai:setup-db-backup
```

対話形式でバックアップ要件をヒアリングします。

### スケジュール指定

```bash
/ai:setup-db-backup daily
```

日次バックアップを設定します。

```bash
/ai:setup-db-backup hourly
```

時間単位バックアップ（高頻度）を設定します。

## 実行フロー

### Phase 1: 起動準備

**dba-mgr エージェントを起動**:

```
@.claude/agents/dba-mgr.md を起動し、以下を依頼:

1. バックアップスケジュールが指定されている場合:
   - 指定されたスケジュールに基づく設計
   - RPO/RTO要件の確認

2. バックアップスケジュールが未指定の場合:
   - インタラクティブに要件をヒアリング
   - ビジネス要件からRPO/RTO導出
```

### Phase 2: バックアップ戦略設計・実装

**dba-mgr エージェントが以下を実行**:

**Phase 1: 要件定義**
- RPO/RTO要件確認
  - RPO（Recovery Point Objective）: データ損失許容時間
  - RTO（Recovery Time Objective）: 復旧目標時間
- バックアップ頻度決定（daily/hourly/continuous）
- 保持期間設計（日次: 30日、週次: 12週、月次: 12ヶ月）

**Phase 2: 多層防御モデル設計**（backup-recovery スキル参照）

**Layer 1: 自動バックアップ（Neon標準機能）**
```yaml
neon_backup:
  frequency: continuous  # Neonの継続的バックアップ
  retention: 30 days
  pitr: enabled  # Point-in-Time Recovery
```

**Layer 2: 定期スナップショット（追加保護）**
```bash
# scripts/backup/daily-snapshot.sh
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/daily"

# pg_dumpでスナップショット作成
pg_dump $DATABASE_URL -F c -f "$BACKUP_DIR/backup_$TIMESTAMP.dump"

# 圧縮・暗号化
gzip "$BACKUP_DIR/backup_$TIMESTAMP.dump"
gpg --encrypt --recipient backup@example.com "$BACKUP_DIR/backup_$TIMESTAMP.dump.gz"

# S3等へオフサイト保存
aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.dump.gz.gpg" s3://backups/postgres/
```

**Layer 3: 検証とテスト**
```bash
# scripts/backup/verify-backup.sh
#!/bin/bash
# バックアップの整合性検証
pg_restore --list latest_backup.dump > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Backup integrity verified"
else
  echo "❌ Backup corrupted"
  exit 1
fi
```

**Layer 4: オフサイト保存**
- AWS S3、Google Cloud Storage、Cloudflare R2等へ定期転送
- 地理的分散（異なるリージョン）

**Phase 3: 復旧手順書作成**
- 復旧手順の文書化（`docs/database/recovery-runbook.md`）
- 復旧ドリルのスケジュール策定
- エスカレーションパス定義

**Phase 4: CI/CD統合**
- GitHub Actionsへのバックアップワークフロー統合
- バックアップ失敗時のアラート設定

**Phase 5: 監視とアラート**（database-monitoring スキル参照）
- バックアップ成功/失敗の監視
- ディスク使用量監視
- 復旧テストの自動実行

### Phase 3: 成果物

**dba-mgr エージェントが以下を提供**:

```
成果物:
- scripts/backup/daily-snapshot.sh（日次バックアップスクリプト）
- scripts/backup/verify-backup.sh（検証スクリプト）
- docs/database/backup-policy.md（バックアップポリシー）
- docs/database/recovery-runbook.md（復旧手順書）
- .github/workflows/database-backup.yml（CI/CD統合）
```

## 期待される成果物

### バックアップポリシー例

```markdown
# データベースバックアップポリシー

## RPO/RTO
- **RPO**: 1時間（最大1時間分のデータ損失許容）
- **RTO**: 4時間（4時間以内に復旧完了）

## バックアップスケジュール
| タイプ | 頻度 | 保持期間 | 保存先 |
|--------|------|---------|--------|
| 継続的（PITR） | リアルタイム | 30日 | Neon標準 |
| 日次スナップショット | 毎日 3:00 AM UTC | 30日 | S3 |
| 週次スナップショット | 毎週日曜 | 12週 | S3 |
| 月次スナップショット | 毎月1日 | 12ヶ月 | S3 Glacier |

## 復旧手順
1. Neon PITRで任意時点へ復旧（30日以内）
2. 日次スナップショットから復元（pg_restore）
3. 整合性検証（verify-backup.sh）
4. アプリケーション再接続テスト

## 復旧ドリル
- 頻度: 月次
- 責任者: DBA担当
- 検証項目: 復旧時間測定、データ整合性確認
```

### 復旧手順書例

```markdown
# データベース復旧手順書（Runbook）

## 緊急連絡先
- DBA担当: dba@example.com
- インフラ担当: infra@example.com

## シナリオ1: PITRによる復旧（過去30日以内）

**手順**:
1. Neon Consoleにログイン
2. "Restore" → "Point-in-Time Recovery" 選択
3. 復旧時点を指定（例: 2025-01-28 14:30:00 UTC）
4. 復旧実行（約10分）
5. 接続文字列を取得
6. アプリケーション環境変数を更新
7. 整合性テスト実行

**推定復旧時間**: 30分

## シナリオ2: スナップショットからの復旧

**手順**:
1. S3から最新のバックアップダウンロード
   ```bash
   aws s3 cp s3://backups/postgres/backup_20250128.dump.gz.gpg .
   ```
2. 復号化・解凍
   ```bash
   gpg --decrypt backup_20250128.dump.gz.gpg | gunzip > backup.dump
   ```
3. 新規データベース作成
   ```bash
   createdb restored_db
   ```
4. リストア実行
   ```bash
   pg_restore -d restored_db backup.dump
   ```
5. 整合性検証
   ```bash
   ./scripts/backup/verify-backup.sh
   ```
6. アプリケーション接続テスト

**推定復旧時間**: 2時間
```

## 注意事項

- **詳細な設計・実装**: すべてのバックアップロジックは dba-mgr エージェントと各スキルが実行
- **コマンドの役割**: エージェント起動と要件の受け渡しのみ
- **定期的な検証**: 復旧ドリルを必ず実施（月次推奨）
- **セキュリティ**: バックアップは暗号化必須
- **オフサイト保存**: 地理的分散を確保

## 関連コマンド

- `/ai:create-migration`: マイグレーション前にバックアップ確認
- `/ai:create-db-schema`: スキーマ変更前にバックアップ確認
