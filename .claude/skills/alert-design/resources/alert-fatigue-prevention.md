# Alert Fatigue回避戦略

## Alert Fatigueとは

**定義**: アラートが多すぎて、重要なものを見逃したり、すべてのアラートを無視するようになる状態

**症状**:
- アラート通知を確認しなくなる
- アラートをミュートする
- 重要なアラートを見逃す
- オンコール担当者のストレス増大

**リスク**:
- 本当の障害を見逃す
- MTTR（平均復旧時間）の増加
- オンコール担当者の離職

## 回避戦略

### 戦略1: アラート数の削減

**原則**: 少ないほど良い

**推奨アラート数**:
```
チームあたり: 10-20個
サービスあたり: 5-10個
```

**削減方法**:

1. **発火頻度分析**:
```bash
# 過去30日のアラート発火回数を集計
Alert A: 150回
Alert B: 50回
Alert C: 5回
Alert D: 0回  ← 削除候補
```

2. **アクション率分析**:
```bash
# アラート受信後に実際にアクションを取ったか
Alert A: 10% (150回中15回) ← 見直し必要
Alert B: 80% (50回中40回) ← 良好
Alert C: 100% (5回中5回) ← 良好
```

3. **定期プルーニング**:
```
月次レビューで以下を削除:
- 3ヶ月間発火なし
- False Positive率 > 20%
- アクション率 < 30%
```

### 戦略2: 誤検知（False Positive）削減

#### 原因1: 不適切な閾値

**問題**:
```
CPU使用率 > 70% でアラート
→ 通常時でも頻繁に超える → ノイズ
```

**対策**:
```
過去データ分析:
- P95: 75%
- P99: 85%

適切な閾値: P99 = 85% 以上
```

#### 原因2: 一時的変動

**問題**:
```
瞬間的にエラー率が上昇 → アラート発火
5秒後に正常化 → 誤検知
```

**対策**:
```yaml
# 5分間継続した場合のみ発火
for: 5m
```

#### 原因3: メンテナンス時間

**問題**:
```
計画メンテナンス中にアラート発火 → ノイズ
```

**対策**:
```yaml
# メンテナンス時間帯はアラートを抑制
inhibit_rules:
  - source_match:
      alertname: 'Maintenance'
    target_match_re:
      alertname: '.*'
```

### 戦略3: アラート集約

#### 時間窓集約

**問題**:
```
5分間に同じアラートが10回発火 → 10件の通知
```

**対策**:
```yaml
route:
  group_by: ['alertname', 'service']
  group_wait: 30s       # 最初の発火から30秒待つ
  group_interval: 5m    # 同一グループは5分間集約
  repeat_interval: 4h   # 同じアラートは4時間後に再通知
```

#### 根本原因集約

**問題**:
```
データベース停止 →
  - サービスA: データベース接続エラー
  - サービスB: データベース接続エラー
  - サービスC: データベース接続エラー
→ 3件の通知（すべて同じ根本原因）
```

**対策**:
```yaml
# 根本原因アラートが発火した場合、派生アラートを抑制
inhibit_rules:
  - source_match:
      alertname: 'DatabaseDown'
    target_match:
      severity: 'critical'
    equal: ['database_instance']
```

### 戦略4: 通知チャネルの最適化

#### チャネル選択

**PagerDuty（即座の電話/SMS）**:
- Critical のみ
- ユーザー影響大
- 即座対応必須

**Slack（チャットアプリ）**:
- Warning、Info
- 営業時間内対応
- チーム全体で共有

**Email**:
- 日次/週次サマリー
- 非緊急情報
- レポート配信

#### 営業時間考慮

```yaml
routes:
  # 営業時間内（平日9-18時）
  - match:
      severity: 'warning'
    receiver: 'slack'
    active_time_intervals:
      - weekdays_business_hours

  # 営業時間外
  - match:
      severity: 'warning'
    receiver: 'email_digest'  # 翌朝まとめて送信
    active_time_intervals:
      - nights_and_weekends

  # Criticalは常に即座通知
  - match:
      severity: 'critical'
    receiver: 'pagerduty'
```

### 戦略5: コンテキスト充実

**問題**:
```
アラート受信 → 詳細不明 → ダッシュボード探し → ログ検索 → 時間浪費
```

**対策**:
アラート通知に診断情報を直接含める

**例**:
```
🚨 High Memory Usage

現在値: 92% (7.5GB / 8GB)
ホスト: api-server-3
Top Processes:
  1. node (PID 1234): 3.2GB
  2. postgres (PID 5678): 2.1GB

直近のイベント:
  - 10分前: 新規デプロイ (v1.2.3)
  - 5分前: トラフィック2倍増

対応:
1. メモリリークチェック
2. プロセス再起動検討
3. デプロイロールバック検討
```

## アラート有効性メトリクス

### 測定指標

**誤検知率（False Positive Rate）**:
```
誤検知率 = 誤検知数 / 総アラート数
目標: < 5%
```

**対応率（Action Rate）**:
```
対応率 = 実際にアクションを取った回数 / 総アラート数
目標: > 80%
```

**平均対応時間（MTTA: Mean Time To Acknowledge）**:
```
MTTA = Σ(アラート受信から確認までの時間) / アラート数
目標: < 5分（Critical）、< 1時間（Warning）
```

**平均復旧時間（MTTR: Mean Time To Resolve）**:
```
MTTR = Σ(アラート受信から解決までの時間) / アラート数
目標: < 30分（Critical）、< 4時間（Warning）
```

### 改善サイクル

**月次レビュー**:
1. 各アラートの発火回数、誤検知率、対応率を集計
2. 問題のあるアラートを特定（誤検知 > 20%、対応率 < 50%）
3. 改善アクション決定（閾値調整、削除、統合）
4. 次月の目標設定

**四半期レビュー**:
1. アラート全体の有効性評価
2. チームフィードバック収集
3. オンコール負荷の評価
4. アラート戦略の見直し

## ランブック整備

### ランブックの必須要素

1. **症状の確認**:
   - どのような症状が発生しているか
   - 確認すべきメトリクス、ログ

2. **原因の切り分け**:
   - よくある原因とその確認方法
   - 決定木形式の診断フロー

3. **対応手順**:
   - ステップバイステップの具体的手順
   - コマンド例、スクリーンショット

4. **ロールバック手順**:
   - 対応が失敗した場合の復旧方法

5. **エスカレーション基準**:
   - いつ、誰にエスカレーションするか

### ランブック例

```markdown
# Runbook: High API Error Rate

## 症状
- APIエラー率が1%を超える
- ユーザーから「エラーが出る」との報告

## 確認
1. Grafana: https://grafana.example.com/d/api-overview
2. エラーログ: `kubectl logs -l app=api --tail=100 | grep ERROR`
3. 最近のデプロイ: `kubectl rollout history deployment/api`

## 原因切り分け

### ケース1: 最近デプロイがある
→ デプロイが原因の可能性が高い
→ ロールバック検討

### ケース2: 外部API障害
→ エラーログに"External API timeout"
→ 外部APIの状態確認
→ Circuit Breaker作動確認

### ケース3: データベース問題
→ エラーログに"Database connection timeout"
→ データベース接続確認
→ スロークエリ確認

## 対応手順

### 即座対応（5分以内）
1. エラーログから原因特定
2. 影響範囲の確認（全ユーザー or 特定機能）
3. Slack #incidents で状況共有

### 短期対応（15分以内）
- デプロイが原因 → ロールバック実施
- 外部API障害 → Circuit Breaker有効確認、ユーザー通知
- データベース問題 → DBA呼び出し、フェイルオーバー検討

### 長期対応（事後）
- ポストモーテム実施
- 根本原因修正
- 再発防止策実装

## ロールバック手順
```bash
# 前バージョンに戻す
kubectl rollout undo deployment/api

# 状態確認
kubectl rollout status deployment/api

# エラー率確認（5分後）
# Grafanaで確認
```

## エスカレーション
- 15分以内に改善なし → オンコールマネージャー
- 30分以内に改善なし → VP of Engineering
```

## ツール設定例

### Prometheus Alertmanager

```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/xxx'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    # Critical → PagerDuty
    - match:
        severity: 'critical'
      receiver: 'pagerduty'
      continue: true  # Slackにも通知

    # Critical → Slack #incidents
    - match:
        severity: 'critical'
      receiver: 'slack-incidents'

    # Warning → Slack #alerts (営業時間のみ)
    - match:
        severity: 'warning'
      receiver: 'slack-alerts'
      active_time_intervals:
        - weekdays_business_hours

receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'xxx'

  - name: 'slack-incidents'
    slack_configs:
      - channel: '#incidents'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: 'slack-alerts'
    slack_configs:
      - channel: '#alerts'

inhibit_rules:
  # データベース停止時は派生アラートを抑制
  - source_match:
      alertname: 'DatabaseDown'
    target_match_re:
      alertname: '.*ConnectionError'
    equal: ['database_instance']
```

## ベストプラクティス

1. **アラート削減**: 定期的に不要なアラートを削除
2. **誤検知対策**: 統計的根拠と持続条件
3. **集約**: 重複通知を防ぐ
4. **適切なルーティング**: 重要度と時間帯で最適化
5. **ランブック整備**: 対応手順を明確化
6. **定期レビュー**: 有効性を継続評価

## アンチパターン

❌ **すべてCritical**: 重要度の区別なし
✅ **階層化**: Critical/Warning/Infoで明確に分離

❌ **通知のみ**: アクション指示なし
✅ **ランブックリンク**: 対応手順を明示

❌ **放置**: 不要なアラートを削除しない
✅ **定期クリーンアップ**: 月次レビューで削減
