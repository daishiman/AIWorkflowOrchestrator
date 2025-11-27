---
name: database-monitoring
description: |
    Database Reliability Engineeringに基づくデータベース監視と可観測性の専門スキル。
    PostgreSQL統計情報、スロークエリログ、接続数監視、
    ディスク使用量、レプリケーション遅延などの運用メトリクスを提供します。
    使用タイミング:
    - 本番DBの健全性を監視する時
    - パフォーマンス劣化を検知する時
    - アラート設定を構築する時
    - SLI/SLOを設計する時

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/database-monitoring/resources/alerting-strategies.md`: アクション可能なアラート設計とエスカレーションパターン
  - `.claude/skills/database-monitoring/resources/health-metrics.md`: 監視すべき主要指標と閾値設計ガイドライン
  - `.claude/skills/database-monitoring/resources/postgresql-statistics.md`: pg_stat_*ビューの活用とクエリパターン
  - `.claude/skills/database-monitoring/resources/slow-query-logging.md`: スロークエリログ設定と分析手法
  - `.claude/skills/database-monitoring/templates/alert-rules-template.md`: アラートルール定義テンプレート
  - `.claude/skills/database-monitoring/templates/monitoring-dashboard-template.md`: Grafanaダッシュボード設計テンプレート
  - `.claude/skills/database-monitoring/scripts/connection-stats.mjs`: 接続数統計収集スクリプト
  - `.claude/skills/database-monitoring/scripts/health-check.mjs`: データベース健全性チェックスクリプト

  Use proactively when implementing database-monitoring patterns or solving related problems.
version: 1.0.0
---


# Database Monitoring スキル

## 概要

Database Reliability Engineering の原則に基づき、PostgreSQLデータベースの
健全性監視、パフォーマンス追跡、アラート設計を体系化したスキルです。

### このスキルが提供するもの

| カテゴリ | 内容 |
|---------|------|
| 統計情報活用 | pg_stat_* ビューの読み方と活用 |
| スロークエリ監視 | ログ設定、分析、最適化トリガー |
| 健全性メトリクス | 監視すべき主要指標と閾値設計 |
| アラート設計 | アクション可能なアラートルール |
| プラットフォーム固有 | Neon/Supabase の監視機能活用 |

## ワークフロー

### Phase 1: 監視要件の定義

**目的**: 何を監視すべきかを明確化

**実行内容**:
1. ビジネス要件からSLI/SLOを導出
2. 重要なデータベース操作を特定
3. 監視対象メトリクスを選定
4. アラート閾値の初期設定

**完了条件**:
- [ ] SLI（Service Level Indicators）が定義されている
- [ ] 監視対象メトリクスリストが作成されている
- [ ] アラート優先度が分類されている

### Phase 2: メトリクス収集の設定

**目的**: PostgreSQL統計情報を活用した監視基盤構築

**実行内容**:
1. pg_stat_statements の有効化
2. スロークエリログの設定
3. 統計情報収集間隔の最適化
4. メトリクスエクスポーターの設定（必要に応じて）

**重要な統計ビュー**:

| ビュー | 用途 |
|--------|------|
| pg_stat_activity | アクティブ接続とクエリ状態 |
| pg_stat_statements | クエリ統計（実行回数、時間） |
| pg_stat_user_tables | テーブル統計（スキャン、更新） |
| pg_stat_user_indexes | インデックス使用状況 |
| pg_stat_bgwriter | バックグラウンド書き込み統計 |

**完了条件**:
- [ ] pg_stat_statements が有効化されている
- [ ] スロークエリログが設定されている
- [ ] 主要ビューへのクエリが準備されている

### Phase 3: アラート設計

**目的**: アクション可能なアラートを構築

**アラートレベル定義**:

| レベル | 条件 | 対応 |
|--------|------|------|
| Critical | データ損失リスク、サービス停止 | 即座にオンコール対応 |
| Warning | パフォーマンス劣化、リソース逼迫 | 営業時間内に対応 |
| Info | 傾向変化、注意喚起 | 次回スプリントで検討 |

**主要アラートパターン**:

1. **接続数アラート**
   - Warning: 最大接続数の 80% 超過
   - Critical: 最大接続数の 95% 超過

2. **スロークエリアラート**
   - Warning: 5秒超クエリが 10件/分
   - Critical: 30秒超クエリが発生

3. **ディスク使用量アラート**
   - Warning: 80% 使用
   - Critical: 90% 使用

4. **レプリケーション遅延**
   - Warning: 10秒以上の遅延
   - Critical: 60秒以上の遅延

**完了条件**:
- [ ] アラートルールが定義されている
- [ ] 通知ルーティングが設定されている
- [ ] エスカレーションパスが明確

### Phase 4: ダッシュボード構築

**目的**: 可視化による運用効率化

**推奨ダッシュボードパネル**:

1. **概要パネル**
   - データベースサイズ
   - 接続数（現在/最大）
   - トランザクション数/秒

2. **パフォーマンスパネル**
   - クエリ実行時間分布
   - スロークエリ件数推移
   - キャッシュヒット率

3. **リソースパネル**
   - ディスクI/O
   - メモリ使用量
   - CPU使用率

4. **エラーパネル**
   - デッドロック発生
   - 接続エラー
   - タイムアウト

**完了条件**:
- [ ] ダッシュボードが構築されている
- [ ] リフレッシュ間隔が適切
- [ ] 関係者がアクセス可能

## ベストプラクティス

### 監視設計の原則

1. **アクション可能なアラートのみ**
   - アラートは対応アクションが明確なもののみ
   - Alert Fatigue（アラート疲れ）を防ぐ

2. **段階的な閾値設定**
   - いきなりCriticalではなくWarningから
   - 対応時間を確保できる設計

3. **コンテキストの付与**
   - アラートにはクエリ例や影響範囲を含める
   - 対応手順へのリンクを含める

4. **定期的なレビュー**
   - 月次でアラート発火頻度を分析
   - 閾値の調整とルールの整理

### Neon/Supabase 固有の考慮事項

**Neon**:
- コンピュートの自動スケーリングを考慮
- ブランチ間のメトリクス分離
- コールドスタート時間の監視

**Supabase**:
- Realtime接続数の監視
- Storage使用量の追跡
- Edge Functions実行時間

## チェックリスト

### 監視設定時
- [ ] pg_stat_statements が有効か？
- [ ] スロークエリログの閾値は適切か？
- [ ] 接続数の上限監視があるか？
- [ ] ディスク使用量監視があるか？

### アラート設計時
- [ ] アラートにアクション定義があるか？
- [ ] エスカレーションパスが明確か？
- [ ] 重複アラートの抑制があるか？
- [ ] テスト環境でアラートテストしたか？

### 運用時
- [ ] ダッシュボードを定期確認しているか？
- [ ] アラート発火時の対応が迅速か？
- [ ] 月次でメトリクス傾向をレビューしているか？
- [ ] 閾値の調整を行っているか？

## リソース参照

詳細な知識が必要な場合:

```bash
# PostgreSQL統計情報の詳細
cat .claude/skills/database-monitoring/resources/postgresql-statistics.md

# スロークエリログの設定と分析
cat .claude/skills/database-monitoring/resources/slow-query-logging.md

# 健全性メトリクスと閾値設計
cat .claude/skills/database-monitoring/resources/health-metrics.md

# アラート設計パターン
cat .claude/skills/database-monitoring/resources/alerting-strategies.md
```

## スクリプト

```bash
# DB健全性チェック
node .claude/skills/database-monitoring/scripts/health-check.mjs

# 接続数統計収集
node .claude/skills/database-monitoring/scripts/connection-stats.mjs
```

## テンプレート

```bash
# Grafanaダッシュボード設計テンプレート
cat .claude/skills/database-monitoring/templates/monitoring-dashboard-template.md

# アラートルール設計テンプレート
cat .claude/skills/database-monitoring/templates/alert-rules-template.md
```

## 関連スキル

| スキル | 関係性 |
|--------|--------|
| query-performance-tuning | スロークエリ検出後の最適化 |
| backup-recovery | 障害検知時の復旧対応 |
| connection-pooling | 接続数問題の解決 |
