# 多層防御バックアップ戦略

## 概要

単一のバックアップ方法に依存することは、単一障害点を作ることと同義です。
多層防御モデルでは、複数の独立したバックアップ層を設計し、
いずれかの層が失敗しても復旧可能な体制を構築します。

## Layer 1: 自動バックアップ

### 目的

- 日常的なデータ保護の基盤
- 人的介入なしでの継続的なバックアップ

### 実装

```yaml
# Tursoの場合（自動で有効）
backup:
  type: automated_snapshots
  frequency: continuous
  retention: 24 hours - 30 days (プランによる)

# 手動設定の例（turso db dump使用）
schedule:
  full_backup:
    frequency: daily
    time: "02:00"
    retention: 30 days
```

### チェックリスト

- [ ] 自動バックアップが有効化されているか？
- [ ] 保持期間が適切か？
- [ ] バックアップ成功の通知が設定されているか？

## Layer 2: PITR（Point-in-Time Recovery）

### 目的

- 任意の時点へのデータ復旧
- 最小限のデータ損失（RPO最小化）

### 実装

```yaml
# Tursoの場合
pitr:
  enabled: true
  retention: 7 days
  granularity: "seconds"

# 復旧例（Turso CLI）
# 1. 特定時点のスナップショットを取得
# 2. 新しいデータベースインスタンスとして復旧
```

### チェックリスト

- [ ] PITRが有効化されているか？
- [ ] WAL保持期間が適切か？
- [ ] PITR復旧手順がテスト済みか？

## Layer 3: 検証

### 目的

- バックアップの実効性確認
- 復旧手順の検証

### 実装

```yaml
# 検証スケジュール
validation:
  frequency: monthly
  scope: full_restore
  environment: staging

  checklist:
    - data_integrity: true
    - application_compatibility: true
    - performance_benchmark: true
    - recovery_time_measurement: true
```

### 検証手順

1. **ステージング環境への復旧**:

   ```bash
   # バックアップからステージング環境を作成
   turso db create staging-test --from-db main --timestamp <backup_point>
   ```

2. **データ整合性確認**:

   ```sql
   -- レコード数確認
   SELECT name, COUNT(*) as row_count
   FROM sqlite_master
   WHERE type='table' AND name NOT LIKE 'sqlite_%'
   GROUP BY name;

   -- 外部キー整合性確認（SQLiteの場合）
   PRAGMA foreign_key_check;
   ```

3. **アプリケーション動作確認**:
   - 基本機能テスト
   - 境界値テスト
   - パフォーマンステスト

### チェックリスト

- [ ] 月次の復旧テストが実施されているか？
- [ ] 復旧時間が測定されているか？
- [ ] テスト結果が文書化されているか？

## Layer 4: オフサイト

### 目的

- 災害対策
- 地理的冗長性

### 実装

```yaml
# オフサイトバックアップ
offsite:
  type: cross_region
  location: us-east → eu-west
  frequency: daily
  retention: 90 days

  encryption:
    at_rest: AES-256
    in_transit: TLS 1.3
```

### チェックリスト

- [ ] 別リージョンにバックアップがあるか？
- [ ] 暗号化が適用されているか？
- [ ] オフサイトからの復旧テストが実施済みか？

## バックアップ種類の比較

| 種類             | RPO        | 復旧速度 | コスト | 用途             |
| ---------------- | ---------- | -------- | ------ | ---------------- |
| 完全バックアップ | 24時間     | 遅い     | 高い   | 日次ベースライン |
| 増分バックアップ | 1-24時間   | 中程度   | 低い   | 頻繁な変更対応   |
| PITR             | 数秒〜数分 | 中程度   | 中程度 | 精密な復旧       |
| スナップショット | 即時       | 速い     | 低い   | 変更前の保護     |

## 層ごとの責任分担

```
Layer 4: オフサイト
├── 担当: インフラチーム
├── 頻度: 日次
└── 検証: 四半期

Layer 3: 検証
├── 担当: DBA/SRE
├── 頻度: 月次
└── 対象: フル復旧テスト

Layer 2: PITR
├── 担当: クラウドサービス（自動）
├── 頻度: 継続
└── 保持: 7-30日

Layer 1: 自動バックアップ
├── 担当: クラウドサービス（自動）
├── 頻度: 日次
└── 保持: 7-30日
```

## 障害シナリオと対応層

| シナリオ         | 対応層              | 復旧方法                 |
| ---------------- | ------------------- | ------------------------ |
| 誤削除（数行）   | Layer 2: PITR       | 特定時点への復旧         |
| テーブル破損     | Layer 1: 自動       | 直近バックアップから復旧 |
| データベース全損 | Layer 1/3           | フル復旧                 |
| リージョン障害   | Layer 4: オフサイト | 別リージョンから復旧     |

## 判断基準チェックリスト

### 設計時

- [ ] 4層すべてが計画されているか？
- [ ] 各層の責任者が明確か？
- [ ] RPO/RTO要件を満たせるか？
- [ ] コストが予算内か？

### 運用時

- [ ] すべての層が機能しているか？
- [ ] 定期検証が実施されているか？
- [ ] 障害時の対応手順が文書化されているか？
