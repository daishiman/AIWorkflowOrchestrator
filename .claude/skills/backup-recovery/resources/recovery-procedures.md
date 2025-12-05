# 復旧手順ガイド

## 復旧シナリオ別手順

### シナリオ1: 行単位の誤削除

**状況**: 少数のレコードが誤って削除された

**復旧時間目安**: 数分〜30分

**手順**:

1. **影響範囲の特定**:

   ```sql
   -- 削除されたレコードを特定（アプリケーションログから）
   -- または監査ログを確認
   ```

2. **PITR復旧**:

   ```bash
   # Tursoの場合: 特定時点からブランチ作成
   turso db create recovery_$(date +%Y%m%d) \
     --from-db main --timestamp 2024-01-15T10:30:00Z
   ```

3. **データ抽出**:

   ```sql
   -- 復旧ブランチから必要なデータを抽出
   SELECT * FROM users WHERE id IN (1, 2, 3);
   ```

4. **本番への復元**:

   ```sql
   -- 本番に挿入
   INSERT INTO users (id, name, email, ...)
   VALUES (...);
   ```

5. **検証**:
   ```sql
   -- 復元されたデータを確認
   SELECT * FROM users WHERE id IN (1, 2, 3);
   ```

### シナリオ2: テーブル全体の復旧

**状況**: テーブル全体が破損または誤操作で損失

**復旧時間目安**: 30分〜2時間

**手順**:

1. **影響の隔離**:

   ```sql
   -- アプリケーションからのアクセスを一時停止
   -- または該当テーブルへのアクセスを制限
   ```

2. **PITR復旧**:

   ```bash
   # 障害発生前の時点からブランチ作成
   turso db create recovery_table \
     --from-db main --timestamp 2024-01-15T09:00:00Z
   ```

3. **テーブルデータのエクスポート**:

   ```bash
   # 復旧ブランチからエクスポート
   turso db dump recovery_table > table_backup.sql

   # または特定テーブルのみ
   turso db shell recovery_table \
     ".mode insert target_table" \
     ".output table_backup.sql" \
     "SELECT * FROM target_table"
   ```

4. **本番への復元**:

   ```sql
   -- 本番で既存データをクリア（必要に応じて）
   DELETE FROM target_table;

   -- データ復元（SQLiteの場合）
   .read table_backup.sql
   ```

5. **整合性確認**:

   ```sql
   -- レコード数確認
   SELECT COUNT(*) FROM target_table;

   -- 外部キー整合性確認
   SELECT * FROM target_table t
   LEFT JOIN related_table r ON t.related_id = r.id
   WHERE r.id IS NULL;
   ```

### シナリオ3: データベース全体のフル復旧

**状況**: データベース全体が利用不能

**復旧時間目安**: 2時間〜8時間

**手順**:

1. **障害宣言**:
   - 関係者への通知
   - メンテナンスページの表示
   - 復旧チームの招集

2. **復旧ポイントの決定**:

   ```bash
   # 利用可能なバックアップ/スナップショットを確認
   turso db list
   turso db snapshots list main
   ```

3. **新環境の作成**:

   ```bash
   # 指定時点からの完全復旧
   turso db create production_restored \
     --from-db main --timestamp 2024-01-15T08:00:00Z
   ```

4. **アプリケーション接続先変更**:

   ```bash
   # 環境変数の更新
   TURSO_DATABASE_URL=$(turso db show production_restored --url)
   TURSO_AUTH_TOKEN=$(turso db tokens create production_restored)

   # アプリケーション再起動
   ```

5. **完全性検証**:

   ```sql
   -- 全テーブルのレコード数
   SELECT name, COUNT(*) as row_count
   FROM sqlite_master
   WHERE type='table' AND name NOT LIKE 'sqlite_%'
   GROUP BY name;

   -- クリティカルデータの確認
   SELECT COUNT(*) FROM orders WHERE created_at > '2024-01-15';
   ```

6. **サービス復旧宣言**:
   - メンテナンスページ解除
   - 関係者への通知
   - インシデントレポート作成

### シナリオ4: 特定時点への復旧（PITR）

**状況**: 「昨日の15時の状態に戻したい」

**復旧時間目安**: 30分〜2時間

**手順**:

1. **時点の特定**:

   ```sql
   -- アプリケーションログから問題発生時刻を特定
   -- スナップショットのタイムスタンプを確認
   ```

2. **PITRブランチ作成**:

   ```bash
   turso db create pitr_recovery \
     --from-db main --timestamp 2024-01-14T15:00:00+09:00
   ```

3. **データ検証**:

   ```sql
   -- 期待されるデータ状態を確認
   SELECT * FROM critical_table WHERE id = 123;
   ```

4. **復旧戦略の決定**:
   - オプションA: 新ブランチを本番として使用
   - オプションB: 差分データのみ抽出して適用

5. **実行と検証**

## 復旧前チェックリスト

### 必須確認事項

- [ ] 障害の影響範囲を特定したか？
- [ ] 復旧ポイント（時点）を決定したか？
- [ ] 復旧に必要な権限があるか？
- [ ] 関係者に通知したか？
- [ ] バックアップの可用性を確認したか？

### 復旧環境

- [ ] ステージング環境で手順を検証したか？（可能な場合）
- [ ] 復旧先の環境が準備できているか？
- [ ] 接続情報（DATABASE_URL等）が準備できているか？

## 復旧後チェックリスト

### データ検証

- [ ] レコード数が期待値と一致するか？
- [ ] クリティカルデータが存在するか？
- [ ] 外部キー整合性が保たれているか？
- [ ] NULL許容性違反がないか？

### アプリケーション検証

- [ ] アプリケーションが正常起動するか？
- [ ] ログインフローが動作するか？
- [ ] 主要機能が動作するか？
- [ ] エラーログに異常がないか？

### 事後対応

- [ ] インシデントレポートを作成したか？
- [ ] 根本原因を分析したか？
- [ ] 再発防止策を立てたか？
- [ ] 手順書を更新したか？

## 連絡体制

```yaml
incident_response:
  level_1: # 軽微（行単位復旧）
    responder: オンコール担当
    escalation: 不要

  level_2: # 中程度（テーブル復旧）
    responder: DBA
    escalation: 30分以内に解決しない場合
    notify: テックリード

  level_3: # 重大（フル復旧）
    responder: DBA + SRE
    escalation: 即座
    notify: CTO, プロダクトオーナー
```

## 判断基準チェックリスト

### 復旧開始前

- [ ] 復旧シナリオが特定されているか？
- [ ] 復旧手順が文書化されているか？
- [ ] 復旧に必要なリソースが確保されているか？
- [ ] ステークホルダーへの通知が完了しているか？

### 復旧中

- [ ] 各ステップが記録されているか？
- [ ] 予想外の問題が発生した場合のエスカレーションパスがあるか？

### 復旧後

- [ ] 復旧成功が検証されているか？
- [ ] 事後レビューが計画されているか？
