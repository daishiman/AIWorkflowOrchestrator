# 災害復旧計画（DR計画）ガイド

## 概要

災害復旧計画（Disaster Recovery Plan）は、
重大な障害や災害からビジネスを復旧させるための包括的な計画です。
データベースの観点からは、データ損失の最小化とサービス復旧時間の短縮が主な目標です。

## DR計画の構成要素

### 1. リスク評価

```yaml
risk_assessment:
  natural_disasters:
    - 地震
    - 洪水
    - 火災
    probability: low
    impact: critical

  infrastructure_failures:
    - データセンター障害
    - ネットワーク障害
    - ストレージ障害
    probability: medium
    impact: high

  human_errors:
    - 誤操作
    - 設定ミス
    - デプロイ失敗
    probability: high
    impact: medium-high

  cyber_threats:
    - ランサムウェア
    - データ改ざん
    - 不正アクセス
    probability: medium
    impact: critical
```

### 2. 復旧優先度

```yaml
recovery_priority:
  tier_1:  # 最優先（1時間以内）
    - 認証システム
    - 決済処理
    - コアAPI
    rto: 1 hour
    rpo: 15 minutes

  tier_2:  # 高優先（4時間以内）
    - ユーザーデータ
    - 注文管理
    - 在庫管理
    rto: 4 hours
    rpo: 1 hour

  tier_3:  # 中優先（24時間以内）
    - レポート機能
    - 分析ダッシュボード
    - バッチ処理
    rto: 24 hours
    rpo: 24 hours

  tier_4:  # 低優先（72時間以内）
    - 履歴データ
    - アーカイブ
    - 非クリティカル機能
    rto: 72 hours
    rpo: 1 week
```

## DR戦略

### ホットサイト

```yaml
hot_site:
  description: 常時稼働のスタンバイ環境

  characteristics:
    - リアルタイム同期
    - 即時フェイルオーバー
    - 高コスト

  use_case:
    - ミッションクリティカルシステム
    - 24/7稼働必須
    - RTO < 1時間

  implementation:
    neon:
      - リードレプリカを別リージョンに配置
      - 自動フェイルオーバー設定
    manual:
      - ストリーミングレプリケーション
      - ロードバランサー設定
```

### ウォームサイト

```yaml
warm_site:
  description: 部分的に準備されたスタンバイ環境

  characteristics:
    - 定期同期（1時間〜24時間）
    - 手動フェイルオーバー
    - 中程度のコスト

  use_case:
    - 重要システム
    - RTO 1-4時間
    - コスト最適化

  implementation:
    - 日次バックアップの別リージョン保存
    - スタンバイインフラの事前準備
    - 復旧スクリプトの自動化
```

### コールドサイト

```yaml
cold_site:
  description: 最小限のスタンバイ環境

  characteristics:
    - オフサイトバックアップのみ
    - 復旧に時間がかかる
    - 低コスト

  use_case:
    - 非クリティカルシステム
    - RTO 24時間以上
    - 予算制約

  implementation:
    - 週次完全バックアップ
    - インフラのテンプレート化（IaC）
    - 手動復旧手順書
```

## フェイルオーバー手順

### 自動フェイルオーバー

```yaml
automatic_failover:
  trigger_conditions:
    - プライマリ無応答 > 30秒
    - ヘルスチェック連続失敗 > 3回
    - 手動トリガー

  process:
    1. 障害検出
    2. スタンバイの正常性確認
    3. DNS切り替え
    4. アプリケーション接続先更新
    5. 監視・アラート調整

  verification:
    - 新プライマリへの接続確認
    - データ整合性チェック
    - アプリケーション動作確認
```

### 手動フェイルオーバー

```yaml
manual_failover:
  decision_criteria:
    - 障害の深刻度評価
    - 復旧見込み時間
    - ビジネスインパクト

  approval_required:
    - Tier 1: CTO承認
    - Tier 2: 技術リード承認
    - Tier 3/4: オンコール判断

  process:
    1. 障害宣言
    2. 承認取得
    3. フェイルオーバー実行
    4. 検証
    5. 関係者通知
```

## DR訓練

### 訓練スケジュール

```yaml
drill_schedule:
  tabletop_exercise:
    frequency: quarterly
    duration: 2-4 hours
    participants: 技術チーム + 経営層
    scope: 手順確認、意思決定訓練

  partial_failover:
    frequency: semi-annually
    duration: 4-8 hours
    participants: 技術チーム
    scope: 特定コンポーネントの復旧

  full_failover:
    frequency: annually
    duration: 1-2 days
    participants: 全関係者
    scope: 完全なDRサイトへの切り替え
```

### 訓練評価

```yaml
evaluation_metrics:
  - rto_achieved: 目標RTO達成率
  - rpo_achieved: 目標RPO達成率
  - procedure_accuracy: 手順書の正確性
  - team_readiness: チーム対応力
  - communication_effectiveness: コミュニケーション効率

post_drill_actions:
  - 課題の特定
  - 手順書の更新
  - チームへのフィードバック
  - 改善計画の策定
```

## コミュニケーション計画

### 連絡体制

```yaml
communication_plan:
  internal:
    immediate:  # 即座に通知
      - オンコール担当
      - インシデントコマンダー
      - 技術リード

    within_30min:
      - 経営層
      - 関連チームリード
      - サポートチーム

    as_needed:
      - 全社通知
      - パートナー企業

  external:
    customers:
      channel: ステータスページ、メール
      timing: 障害確認後30分以内
      update_frequency: 30分毎

    regulators:  # 規制当局（必要な場合）
      timing: 規定に従う
      content: 影響範囲、対応状況、完了見込み
```

### テンプレート

```markdown
## 障害通知テンプレート

**件名**: [障害レベル] サービス障害発生のお知らせ

**発生日時**: YYYY-MM-DD HH:MM (JST)
**影響範囲**: [影響を受けるサービス/機能]
**現在の状況**: [対応中/復旧中/監視中]
**次回更新予定**: YYYY-MM-DD HH:MM (JST)

**詳細**:
[障害の概要と現在の対応状況]

**お問い合わせ**:
[連絡先情報]
```

## チェックリスト

### DR計画策定時
- [ ] リスク評価が完了しているか？
- [ ] 復旧優先度が定義されているか？
- [ ] RPO/RTOが設定されているか？
- [ ] DR戦略が選択されているか？
- [ ] フェイルオーバー手順が文書化されているか？
- [ ] コミュニケーション計画があるか？

### 定期レビュー
- [ ] DR計画は最新か？（年次レビュー）
- [ ] 連絡先情報は正確か？
- [ ] 手順書は最新か？
- [ ] 訓練が実施されているか？
- [ ] 前回の訓練からの改善が反映されているか？

### 障害発生時
- [ ] 障害が確認されたか？
- [ ] 適切な承認を得たか？
- [ ] コミュニケーションが開始されたか？
- [ ] 復旧手順に従っているか？
- [ ] 進捗が記録されているか？
