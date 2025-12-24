---
name: .claude/skills/backup-recovery/SKILL.md
description: |
  『Database Reliability Engineering』に基づく、データ損失を許さない堅牢なバックアップ・復旧戦略スキル。
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/backup-recovery/resources/backup-strategy-layers.md`: 多層防御バックアップ戦略
  - `.claude/skills/backup-recovery/resources/disaster-recovery-planning.md`: 災害復旧計画（DR計画）ガイド
  - `.claude/skills/backup-recovery/resources/turso-backup-guide.md`: Tursoバックアップガイド
  - `.claude/skills/backup-recovery/resources/recovery-procedures.md`: 3つのシナリオ別復旧手順（行単位誤削除・テーブル復旧・DB全体復旧）とPITR・エクスポート・整合性確認の実践ガイド
  - `.claude/skills/backup-recovery/resources/rpo-rto-design.md`: RPO/RTO設計ガイド
  - `.claude/skills/backup-recovery/templates/backup-policy-template.md`: バックアップポリシー
  - `.claude/skills/backup-recovery/templates/recovery-runbook-template.md`: 緊急連絡先・接続情報・復旧手順・チェックリストを含む実践的な復旧作業マニュアルテンプレート
  - `.claude/skills/backup-recovery/scripts/verify-backup.mjs`: バックアップ検証スクリプト

  専門分野:
  - バックアップ戦略設計: 多層防御モデル（自動・PITR・検証・オフサイト）
  - RPO/RTO設計: ビジネス要件に基づく復旧目標の定義
  - 復旧手順確立: 文書化された復旧プロセスと定期ドリル
  - Turso/SQLite統合: クラウドDBサービスのバックアップ機能活用
  - 災害復旧計画: DR計画の策定と検証

  使用タイミング:
  - バックアップ戦略を設計・レビューする時
  - RPO/RTO要件を定義する時
  - 復旧手順を文書化する時
  - バックアップからの復旧テストを計画する時
  - 災害復旧計画を策定する時

  Use proactively when designing backup strategies,
  establishing recovery procedures, or planning disaster recovery.
version: 1.0.0
---

# Backup & Recovery

## 概要

このスキルは、『Database Reliability Engineering』（Laine Campbell & Charity Majors著）に基づき、
データ損失を許さない多層防御のバックアップ体制と、信頼性の高い復旧プロセスを設計・実装するための知識を提供します。

**主要な価値**:

- データは最も価値ある資産であり、その永続性を保証する
- 復旧可能性を常に検証し、確実な復旧を実現する
- ビジネス要件に基づく適切なRPO/RTO設計

**対象ユーザー**:

- `.claude/agents/dba-mgr.md`エージェント
- データベース管理者
- SREチーム
- DevOpsエンジニア

## リソース構造

```
backup-recovery/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── backup-strategy-layers.md              # 多層防御モデル
│   ├── rpo-rto-design.md                      # RPO/RTO設計ガイド
│   ├── recovery-procedures.md                 # 復旧手順
│   ├── turso-backup-guide.md                  # Turso固有のバックアップ
│   └── disaster-recovery-planning.md          # DR計画策定
├── scripts/
│   └── verify-backup.mjs                      # バックアップ検証スクリプト
└── templates/
    ├── backup-policy-template.md              # バックアップポリシーテンプレート
    └── recovery-runbook-template.md           # 復旧ランブックテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 多層防御モデル
cat .claude/skills/backup-recovery/resources/backup-strategy-layers.md

# RPO/RTO設計ガイド
cat .claude/skills/backup-recovery/resources/rpo-rto-design.md

# 復旧手順
cat .claude/skills/backup-recovery/resources/recovery-procedures.md

# Tursoバックアップガイド
cat .claude/skills/backup-recovery/resources/turso-backup-guide.md

# DR計画策定
cat .claude/skills/backup-recovery/resources/disaster-recovery-planning.md
```

### スクリプト実行

```bash
# バックアップ検証
node .claude/skills/backup-recovery/scripts/verify-backup.mjs
```

### テンプレート参照

```bash
# バックアップポリシーテンプレート
cat .claude/skills/backup-recovery/templates/backup-policy-template.md

# 復旧ランブックテンプレート
cat .claude/skills/backup-recovery/templates/recovery-runbook-template.md
```

## いつ使うか

### シナリオ1: 新規プロジェクトのバックアップ設計

**状況**: 新しいプロジェクトでバックアップ戦略を設計する

**適用条件**:

- [ ] データの重要度が定義されている
- [ ] ビジネス継続性要件が明確
- [ ] インフラ環境が決定済み

**期待される成果**: 多層防御のバックアップ戦略

### シナリオ2: RPO/RTO要件の定義

**状況**: データ復旧目標を設定する必要がある

**適用条件**:

- [ ] ビジネス要件が明確
- [ ] データ損失の影響が評価済み
- [ ] ダウンタイムの許容時間が決定

**期待される成果**: 明確なRPO/RTO定義と達成計画

### シナリオ3: 復旧手順の確立

**状況**: 復旧プロセスを文書化し、テストする

**適用条件**:

- [ ] バックアップが実施されている
- [ ] 復旧環境が準備可能
- [ ] 担当者が決定済み

**期待される成果**: テスト済みの復旧手順書

## ワークフロー

### Phase 1: 要件分析

**目的**: バックアップ・復旧の要件を明確化する

**ステップ**:

1. **データ分類**:
   - クリティカルデータの特定
   - データ量と増加率の把握
   - 保持期間の決定

2. **ビジネス要件収集**:
   - ダウンタイム許容度
   - データ損失許容度
   - コンプライアンス要件

**判断基準**:

- [ ] データ分類が完了しているか？
- [ ] RPO/RTO目標が定義されているか？
- [ ] コンプライアンス要件が把握されているか？

**リソース**: `resources/rpo-rto-design.md`

### Phase 2: バックアップ戦略設計

**目的**: 多層防御のバックアップ戦略を設計する

**ステップ**:

1. **バックアップ層の設計**:
   - 自動バックアップ層（クラウドサービス機能）
   - PITR層（ポイントインタイムリカバリ）
   - 検証層（定期的な復旧テスト）
   - オフサイト層（地理的分散）

2. **スケジュール設計**:
   - 完全バックアップ頻度
   - 増分バックアップ間隔
   - 検証テストサイクル

**判断基準**:

- [ ] 多層防御が設計されているか？
- [ ] RPO/RTO要件を満たせるか？
- [ ] コスト効率が考慮されているか？

**リソース**: `resources/backup-strategy-layers.md`

### Phase 3: 復旧手順の確立

**目的**: 信頼性の高い復旧プロセスを確立する

**ステップ**:

1. **復旧シナリオ定義**:
   - 部分復旧（特定テーブル/レコード）
   - フル復旧（データベース全体）
   - PITR復旧（特定時点）

2. **手順書作成**:
   - ステップバイステップ手順
   - 判断ポイントと分岐
   - 連絡先と承認フロー

3. **復旧テスト**:
   - テスト環境での検証
   - 復旧時間の測定
   - 手順の改善

**判断基準**:

- [ ] 復旧手順が文書化されているか？
- [ ] 手順はテスト済みか？
- [ ] RTOを達成できるか？

**リソース**: `resources/recovery-procedures.md`

### Phase 4: 継続的検証

**目的**: バックアップ・復旧の信頼性を維持する

**ステップ**:

1. **定期検証**:
   - 月次の復旧ドリル
   - バックアップ整合性チェック
   - 手順書の更新

2. **監視と警告**:
   - バックアップ成功/失敗の監視
   - 容量アラート
   - 遅延検出

**判断基準**:

- [ ] 定期検証スケジュールがあるか？
- [ ] 監視が設定されているか？
- [ ] 手順書は最新か？

## 核心概念

### 多層防御モデル

```
Layer 1: 自動バックアップ
├── クラウドサービスの自動バックアップ
├── 毎日の完全バックアップ
└── 増分バックアップ（必要に応じて）

Layer 2: PITR（Point-in-Time Recovery）
├── WAL（Write-Ahead Log）保持
├── 任意の時点への復旧
└── 最小データ損失

Layer 3: 検証
├── 定期的な復旧テスト
├── バックアップ整合性確認
└── 復旧時間測定

Layer 4: オフサイト
├── 地理的分散
├── 別リージョンレプリカ
└── 災害対策
```

### RPO/RTO定義

| 指標 | 定義                           | 例                              |
| ---- | ------------------------------ | ------------------------------- |
| RPO  | 許容されるデータ損失の最大時間 | 1時間 = 最大1時間分のデータ損失 |
| RTO  | 許容されるサービス停止時間     | 4時間 = 4時間以内に復旧         |

### 復旧の種類

| 種類         | 対象             | 所要時間目安 |
| ------------ | ---------------- | ------------ |
| 行単位復旧   | 誤削除された数行 | 数分         |
| テーブル復旧 | 特定テーブル全体 | 数十分       |
| PITR復旧     | 特定時点への復旧 | 数時間       |
| フル復旧     | データベース全体 | 数時間〜1日  |

## ベストプラクティス

### すべきこと

1. **バックアップを検証する**:
   - 定期的に復旧テストを実施
   - 復旧時間を測定
   - 手順を改善

2. **複数層の防御**:
   - 単一のバックアップに依存しない
   - 地理的に分散させる
   - 複数の復旧手段を確保

3. **手順を文書化する**:
   - 緊急時に参照できる手順書
   - 連絡先リスト
   - 承認フロー

### 避けるべきこと

1. **バックアップの放置**:
   - ❌ 設定して検証しない
   - ✅ 定期的に復旧テスト

2. **単一障害点**:
   - ❌ 1つのバックアップのみ
   - ✅ 多層防御で冗長性確保

3. **ドキュメントの陳腐化**:
   - ❌ 古い手順書
   - ✅ 定期的な更新とテスト

## トラブルシューティング

### 問題1: バックアップが失敗する

**症状**: スケジュールバックアップが失敗

**原因**:

- ストレージ容量不足
- 接続エラー
- 権限問題

**解決策**:

1. ログを確認
2. ストレージ容量をチェック
3. 接続設定を検証
4. 権限を確認

### 問題2: 復旧に時間がかかりすぎる

**症状**: RTOを超過しそう

**原因**:

- データ量が大きい
- ネットワーク帯域不足
- 手順の非効率

**解決策**:

1. 増分復旧の検討
2. 並列復旧の実施
3. 手順の最適化

### 問題3: 復旧後にデータ不整合

**症状**: 復旧後に一部データが欠損

**原因**:

- バックアップ時点の問題
- 復旧手順のミス
- 参照整合性の問題

**解決策**:

1. 別時点からの再復旧
2. トランザクションログの確認
3. 手動での整合性修復

## 関連スキル

- **.claude/skills/database-migrations/SKILL.md** (`.claude/skills/database-migrations/SKILL.md`): マイグレーション管理
- **.claude/skills/connection-pooling/SKILL.md** (`.claude/skills/connection-pooling/SKILL.md`): 接続プール設定
- **.claude/skills/query-performance-tuning/SKILL.md** (`.claude/skills/query-performance-tuning/SKILL.md`): パフォーマンス最適化

## メトリクス

### バックアップ健全性指標

| 指標               | 目標値    | 警告値          |
| ------------------ | --------- | --------------- |
| バックアップ成功率 | 100%      | < 99%           |
| RPO達成率          | 100%      | < 99%           |
| RTO達成率          | 100%      | < 99%           |
| 復旧テスト頻度     | 月1回以上 | 3ヶ月以上未実施 |

## 変更履歴

| バージョン | 日付       | 変更内容                            |
| ---------- | ---------- | ----------------------------------- |
| 1.0.0      | 2025-11-27 | 初版作成 - 多層防御バックアップ戦略 |

## 参考文献

- **『Database Reliability Engineering』** Laine Campbell & Charity Majors著
  - Chapter 5: Risk Management
  - Chapter 7: Backup and Recovery

- **Turso Documentation**
  - https://docs.turso.tech/features/backups
  - https://docs.turso.tech/features/point-in-time-recovery
