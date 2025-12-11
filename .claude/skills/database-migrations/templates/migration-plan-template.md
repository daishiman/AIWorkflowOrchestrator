# マイグレーション計画テンプレート

## 基本情報

**マイグレーション名**: {{migration_name}}
**計画日**: {{date}}
**担当者**: {{author}}
**レビュアー**: {{reviewer}}

## 変更概要

### ビジネス目的

{{business_purpose}}

### 技術的変更内容

| 操作           | 対象        | 詳細        |
| -------------- | ----------- | ----------- |
| {{operation1}} | {{target1}} | {{detail1}} |
| {{operation2}} | {{target2}} | {{detail2}} |

## リスク評価

### リスクレベル

- [ ] 🔴 CRITICAL: 破壊的変更（DROP TABLE, DROP COLUMN）
- [ ] 🟠 HIGH: 型変更、NOT NULL追加
- [ ] 🟡 MEDIUM: 制約追加、インデックス追加
- [ ] 🟢 LOW: カラム追加（nullable）
- [ ] 🔵 INFO: 新規テーブル作成

### 影響分析

**影響を受けるテーブル**:

- {{table1}}: {{impact1}}
- {{table2}}: {{impact2}}

**影響を受けるアプリケーション**:

- {{app1}}: {{app_impact1}}
- {{app2}}: {{app_impact2}}

**推定ダウンタイム**: {{downtime_estimate}}

## 実行計画

### Phase 1: 準備

- [ ] バックアップ作成

  ```bash
  pg_dump $DATABASE_URL -F c -f backup_$(date +%Y%m%d_%H%M%S).dump
  ```

- [ ] ステージング環境でのテスト

  ```bash
  DATABASE_URL=$STAGING_URL pnpm db:migrate
  ```

- [ ] ロールバックスクリプト準備

### Phase 2: 事前マイグレーション（ダウンタイムなし）

**目的**: 本番適用の準備

```sql
-- 新カラムをnullableで追加
{{pre_migration_sql}}
```

**検証**:

- [ ] スキーマ変更が適用されたか確認
- [ ] アプリケーションが正常動作するか確認

### Phase 3: データ移行（必要な場合）

**目的**: 既存データの変換

```sql
-- データ移行
{{data_migration_sql}}
```

**検証**:

- [ ] データ移行が完了したか確認
- [ ] データの整合性を確認

### Phase 4: 本番マイグレーション

**目的**: 最終的なスキーマ変更

```sql
-- 制約追加、カラム削除など
{{main_migration_sql}}
```

**検証**:

- [ ] マイグレーション成功
- [ ] アプリケーション動作確認
- [ ] パフォーマンス確認

## ロールバック計画

### ロールバック判断基準

- [ ] マイグレーションエラー発生
- [ ] データ不整合検出
- [ ] アプリケーション障害
- [ ] パフォーマンス劣化（レスポンスタイム > {{threshold}}ms）

### ロールバック手順

```sql
-- ロールバックSQL
{{rollback_sql}}
```

### マイグレーション履歴の更新

```sql
-- 必要に応じてマイグレーション履歴を更新
DELETE FROM drizzle.__drizzle_migrations WHERE id = {{migration_id}};
```

## 検証手順

### マイグレーション後の確認

**スキーマ検証**:

```sql
-- テーブル構造確認
\d {{table_name}}

-- インデックス確認
\di {{table_name}}*
```

**データ検証**:

```sql
-- データ件数確認
SELECT COUNT(*) FROM {{table_name}};

-- サンプルデータ確認
SELECT * FROM {{table_name}} LIMIT 10;

-- 整合性確認
{{integrity_check_sql}}
```

**アプリケーション検証**:

- [ ] ヘルスチェック: `curl {{health_check_url}}`
- [ ] 基本機能テスト: {{basic_test}}
- [ ] パフォーマンステスト: {{performance_test}}

## コミュニケーション計画

### 事前通知

| 対象             | 通知時期    | 内容         |
| ---------------- | ----------- | ------------ |
| {{stakeholder1}} | {{timing1}} | {{content1}} |
| {{stakeholder2}} | {{timing2}} | {{content2}} |

### 実行中の連絡

**連絡先**: {{contact}}
**Slackチャンネル**: {{slack_channel}}

### 完了報告

- [ ] 成功/失敗の報告
- [ ] 影響サマリー
- [ ] 学んだ教訓

## タイムライン

| 時刻      | アクション             | 担当        | 状態 |
| --------- | ---------------------- | ----------- | ---- |
| {{time1}} | バックアップ作成       | {{person1}} | [ ]  |
| {{time2}} | メンテナンスモード開始 | {{person2}} | [ ]  |
| {{time3}} | マイグレーション実行   | {{person3}} | [ ]  |
| {{time4}} | 検証                   | {{person4}} | [ ]  |
| {{time5}} | メンテナンスモード終了 | {{person5}} | [ ]  |

## チェックリスト

### 準備完了確認

- [ ] バックアップ作成手順を確認
- [ ] ロールバック手順を確認
- [ ] ステージングでテスト完了
- [ ] レビュー完了
- [ ] 承認取得

### 実行前確認

- [ ] 現在のスキーマをバックアップ
- [ ] メンテナンスウィンドウを確保
- [ ] 関係者に通知
- [ ] 監視ダッシュボードを開く

### 実行後確認

- [ ] マイグレーション成功
- [ ] データ整合性OK
- [ ] アプリケーション正常
- [ ] パフォーマンスOK
- [ ] 完了報告送信

## 承認

| 役割       | 名前         | 日付     | 署名 |
| ---------- | ------------ | -------- | ---- |
| 計画者     | {{planner}}  | {{date}} | [ ]  |
| レビュアー | {{reviewer}} | {{date}} | [ ]  |
| 承認者     | {{approver}} | {{date}} | [ ]  |

## 付録

### 関連ドキュメント

- [Drizzle Kitコマンド](../resources/drizzle-kit-commands.md)
- [マイグレーション戦略](../resources/migration-strategies.md)
- [スキーマ変更パターン](../resources/schema-change-patterns.md)
- [ロールバック手順](../resources/rollback-procedures.md)

### 参考SQL

```sql
-- 変更前のスキーマ
{{before_schema}}

-- 変更後のスキーマ
{{after_schema}}
```
