# RPO/RTO設計ガイド

## 基本概念

### RPO（Recovery Point Objective）

**定義**: 許容されるデータ損失の最大時間

```
障害発生時刻
    ↓
────┬───────────────┬─────────────→ 時間
    │               │
 最後のバックアップ  ↑
                   RPO

例: RPO = 1時間
→ 最大1時間分のデータ損失を許容
```

### RTO（Recovery Time Objective）

**定義**: 許容されるサービス停止時間

```
障害発生時刻              復旧完了
    ↓                      ↓
────┬──────────────────────┬───→ 時間
    │                      │
    ←────── RTO ──────────→

例: RTO = 4時間
→ 4時間以内にサービス復旧
```

## RPO/RTO決定フレームワーク

### Step 1: ビジネスインパクト分析

```yaml
impact_analysis:
  revenue_loss_per_hour: ¥XXX,XXX
  customer_impact: high/medium/low
  reputation_damage: high/medium/low
  regulatory_requirements: GDPR/SOC2/etc
  sla_commitments: 99.9%
```

### Step 2: データ分類

| データ分類 | 説明 | 推奨RPO |
|-----------|------|---------|
| ミッションクリティカル | 取引データ、決済情報 | < 1分 |
| 重要 | ユーザーデータ、設定 | < 1時間 |
| 標準 | ログ、分析データ | < 24時間 |
| アーカイブ | 履歴データ | < 1週間 |

### Step 3: 復旧優先度

| 優先度 | 対象 | 推奨RTO |
|--------|------|---------|
| P1 | コアサービス | < 1時間 |
| P2 | 主要機能 | < 4時間 |
| P3 | 補助機能 | < 24時間 |
| P4 | 非クリティカル | < 72時間 |

## RPO達成戦略

### RPO < 1分（ニアゼロ）

```yaml
strategy:
  replication: synchronous
  backup_type: continuous_streaming

requirements:
  - ホットスタンバイ/レプリカ
  - 同期レプリケーション
  - 高コスト

implementation:
  neon:
    - リードレプリカ使用
    - 継続的WAL保存
  self_hosted:
    - ストリーミングレプリケーション
    - pg_basebackup + WAL archiving
```

### RPO < 1時間

```yaml
strategy:
  backup_type: PITR
  wal_retention: 24 hours

requirements:
  - WALアーカイビング
  - 15分間隔のスナップショット（オプション）

implementation:
  neon:
    - PITR有効化（デフォルト）
    - ブランチによる復旧
```

### RPO < 24時間

```yaml
strategy:
  backup_type: daily_full

requirements:
  - 日次完全バックアップ
  - 低コスト

implementation:
  - 毎日02:00にpg_dump
  - S3/GCSに保存
```

## RTO達成戦略

### RTO < 1時間

```yaml
strategy:
  - ホットスタンバイレプリカ
  - 自動フェイルオーバー
  - ブルーグリーンデプロイ対応

requirements:
  - 常時稼働のスタンバイ
  - ヘルスチェック自動化
  - フェイルオーバースクリプト

implementation:
  neon:
    - リードレプリカをプライマリに昇格
  manual:
    - DNSフェイルオーバー
    - アプリケーション接続先切替
```

### RTO < 4時間

```yaml
strategy:
  - ウォームスタンバイ
  - 手動フェイルオーバー
  - 事前準備済みの手順書

requirements:
  - 復旧手順の文書化
  - 担当者の待機
  - テスト済みの手順

implementation:
  - PITRからの復旧
  - 新しいブランチ/インスタンス作成
```

### RTO < 24時間

```yaml
strategy:
  - コールドスタンバイ
  - バックアップからのフル復旧

requirements:
  - バックアップの可用性
  - 復旧環境の準備
  - 担当者の連絡体制

implementation:
  - pg_restore
  - データ整合性確認
  - アプリケーションテスト
```

## コストとRPO/RTOのトレードオフ

```
コスト
  ↑
  │    ★ ニアゼロRPO/RTO
  │   ╱   (同期レプリケーション)
  │  ╱
  │ ╱    ○ 中程度RPO/RTO
  │╱       (PITR + ウォームスタンバイ)
  │
  │────────○ 低コストRPO/RTO
  │         (日次バックアップ)
  └──────────────────────→ RPO/RTO目標

トレードオフ:
- 低RPO/RTO = 高コスト、複雑性増加
- 高RPO/RTO = 低コスト、シンプル
```

## RPO/RTO設計テンプレート

```yaml
# サービス名: [サービス名]
# 日付: [設計日]

data_classification:
  tier: critical/important/standard/archive
  description: "[データの説明]"

business_requirements:
  revenue_per_hour: ¥XXX
  sla_uptime: 99.X%
  regulatory: [規制要件]

objectives:
  rpo:
    target: X hours
    justification: "[理由]"
  rto:
    target: X hours
    justification: "[理由]"

strategy:
  backup_method: "[バックアップ方法]"
  replication: "[レプリケーション方式]"
  failover: "[フェイルオーバー方式]"

validation:
  test_frequency: monthly/quarterly
  last_test_date: YYYY-MM-DD
  test_result: pass/fail
```

## 判断基準チェックリスト

### 設計時
- [ ] ビジネスインパクト分析が完了しているか？
- [ ] データ分類が明確か？
- [ ] RPO/RTO目標がステークホルダーと合意されているか？
- [ ] 達成戦略がコスト内か？

### 実装時
- [ ] RPO達成に必要なバックアップ頻度が設定されているか？
- [ ] RTO達成に必要な復旧インフラが準備されているか？
- [ ] 自動フェイルオーバーが必要か判断されているか？

### 運用時
- [ ] 定期的にRPO/RTO達成を検証しているか？
- [ ] 検証結果が文書化されているか？
- [ ] ビジネス要件変更時に見直しているか？
