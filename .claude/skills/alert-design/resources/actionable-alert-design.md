# アクション可能アラート設計

## アクション可能性の5要素

### 1. 問題の明確化

**含めるべき情報**:

- 何が問題か（エラー率、レイテンシ、リソース枯渇等）
- 現在値と目標値
- 影響範囲（全体、特定サービス、特定ユーザー等）

**良い例**:

```
🚨 API Error Rate: 5.2% (目標: < 1%)
影響: /api/orders エンドポイント、全ユーザー
期間: 過去5分間
```

**悪い例**:

```
❌ Error detected
（何のエラーか不明）
```

### 2. 影響範囲の明示

**含めるべき情報**:

- 影響を受けるユーザー数または割合
- 影響を受けるサービス/機能
- ビジネスインパクト

**例**:

```
影響:
- 影響ユーザー: 約1,500人/分
- 影響サービス: 注文処理、決済
- ビジネスインパクト: 推定損失 $500/分
```

### 3. 対応手順の提供

**ランブックへのリンク**:

```
Runbook: https://runbooks.example.com/api-high-error-rate
```

**ランブック内容**:

1. 症状の確認方法
2. 原因の切り分け手順
3. 対応アクション（ステップバイステップ）
4. ロールバック手順
5. エスカレーション基準

### 4. 診断情報へのアクセス

**リンク提供**:

```
Dashboard: https://grafana.example.com/d/api-overview
Logs: https://kibana.example.com/app/logs?q=level:ERROR+AND+service:api
Traces: https://jaeger.example.com/search?service=api&limit=20
```

**クエリパラメータ**:

- 時刻範囲を自動設定
- サービス名でフィルタ
- request_idで絞り込み

### 5. エスカレーション基準

**条件と通知先**:

```
即座対応（15分以内）:
  → PagerDuty（オンコール担当者）

営業時間内対応（4時間以内）:
  → Slack（チームチャネル）

情報共有のみ:
  → Slack（低優先度チャネル）またはダッシュボードのみ
```

## アラートテンプレート構造

### 基本テンプレート

```
【重要度】 【問題の要約】

現在値: 【数値】（目標: 【閾値】）
影響: 【範囲】
期間: 【継続時間】

対応:
1. 【第一アクション】
2. 【第二アクション】

詳細:
- Dashboard: 【URL】
- Logs: 【URL】
- Runbook: 【URL】
```

### 実例: エラー率アラート

```
🚨 Critical: API Error Rate Spike

現在値: 5.2%（目標: < 1%）
影響: /api/orders エンドポイント、約1,500ユーザー/分に影響
期間: 過去5分間継続

対応:
1. エラーログを確認 → 原因特定
2. 最近のデプロイがあればロールバック検討
3. 15分以内に改善しない場合はエスカレーション

詳細:
- Dashboard: https://grafana.example.com/d/api-overview?from=now-15m
- Logs: https://kibana.example.com/app/logs?level=ERROR&service=api&from=now-15m
- Runbook: https://runbooks.example.com/api-high-error-rate
- Incident Channel: #incident-api-errors
```

### 実例: レイテンシアラート

```
⚠️ Warning: API Latency Increase

現在値: P99 = 850ms（目標: < 500ms）
影響: すべてのAPIエンドポイント、ユーザー体験劣化
期間: 過去30分間

対応:
1. APMダッシュボードでボトルネック特定
2. SQLiteスロークエリを確認
3. キャッシュヒット率を確認

詳細:
- APM: https://apm.example.com/services/api
- Database: https://grafana.example.com/d/database-performance
- Runbook: https://runbooks.example.com/high-latency
```

## Alert Fatigue回避戦略

### 戦略1: アラート削減

**原則**: 少ないほど良い

**実践**:

- チームあたり10-20個のアラートに制限
- 3ヶ月間発火しないアラートは削除
- 誤検知率 > 20%のアラートは削除または調整

**レビュープロセス**:

```
月次レビュー:
1. 各アラートの発火回数を集計
2. False Positive率を計算
3. アクションに繋がったか確認
4. 不要なアラートを削除
```

### 戦略2: 適応的閾値

**固定閾値の問題**:

```
CPU使用率 > 80% でアラート
→ 深夜（トラフィック少）: 誤検知
→ 日中（トラフィック多）: 検知漏れ
```

**適応的閾値**:

```
# 過去1週間の同時刻帯の平均+2σ
threshold = avg_last_week_same_hour + 2 * stddev
```

**実装例**:

```
# Prometheusクエリ
(
  cpu_usage
  >
  avg_over_time(cpu_usage[1w] offset 1w) + 2 * stddev_over_time(cpu_usage[1w] offset 1w)
)
```

### 戦略3: アラート集約

**時間窓集約**:

```
5分間に10回発火 → 1件の通知に集約
```

**根本原因集約**:

```
同一根本原因（例: データベース停止）で複数サービスアラート
→ 1件の「データベース停止」アラートに集約
```

**実装**（Prometheus Alertmanager）:

```yaml
route:
  group_by: ["alertname", "service"]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
```

### 戦略4: 持続条件

**問題**:
一時的な変動で即座にアラート → ノイズ

**対策**:
5分間継続した場合のみアラート発火

**実装**:

```yaml
alert: HighErrorRate
expr: error_rate > 0.01
for: 5m # 5分間継続した場合のみ
```

## 通知ルーティング設計

### 重要度別ルーティング

**Critical**:

```
通知先:
  1. PagerDuty（即座の電話/SMS）
  2. Slack #incidents チャネル
  3. Email（エンジニアリングリーダー）

通知タイミング: 即座

エスカレーション:
  15分未対応 → オンコールマネージャー
  30分未対応 → VP of Engineering
```

**Warning**:

```
通知先:
  1. Slack #alerts チャネル
  2. Email（担当チーム）

通知タイミング:
  営業時間内: 即座
  営業時間外: 翌営業日朝にまとめて送信

エスカレーション:
  4時間未対応 → チームリード
```

**Info**:

```
通知先:
  1. Slack #system-events チャネル（低優先度）

通知タイミング: バッチ送信（1時間ごと）

エスカレーション: なし
```

### オンコール負荷管理

**目標**:

- 営業時間外のCriticalアラート: 週2回以下
- 誤検知率: < 5%
- 対応時間: 平均15分以内

**負荷軽減策**:

1. 営業時間外アラートを最小化
2. 自動復旧機能の実装
3. ランブックの整備
4. 定期的なアラートレビュー

## ベストプラクティス

1. **アクション可能性**: すべてのアラートが明確なアクションを伴う
2. **少数精鋭**: チームあたり10-20個に制限
3. **統計的根拠**: データに基づく閾値設定
4. **適応的**: 時間帯・曜日・トラフィックに応じた動的閾値
5. **集約**: 重複アラートを統合
6. **定期レビュー**: 不要アラートの削除

## アンチパターン

❌ **過剰アラート**: チームあたり100個のアラート
✅ **精選**: 10-20個に絞る

❌ **アクション不明**: 「何か問題が発生しました」
✅ **明確な指示**: ランブックリンク、対応手順

❌ **固定閾値**: CPU > 80% (時間帯無視)
✅ **適応的**: 平均 + 2σ (時間帯別)

## 参照

このスキルを使用するエージェント:

- `@sre-observer` - ロギング・監視設計者 (.claude/agents/sre-observer.md:981)
