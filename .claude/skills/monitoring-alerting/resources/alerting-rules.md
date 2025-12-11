# アラートルール設計

## 概要

効果的なアラートは、問題を早期に検出し、迅速な対応を可能にします。
このドキュメントでは、アラートルールの設計パターンを説明します。

## アラート設計原則

### アクション可能なアラート

```
良いアラート:
- 具体的な問題を示す
- 対応手順が明確
- 誤検知が少ない

悪いアラート:
- 曖昧な問題
- 対応方法が不明
- 頻繁な誤検知
```

### アラートの3つの質問

1. **誰が対応するか？** → オンコール担当
2. **何をすべきか？** → 対応手順
3. **いつまでに？** → 緊急度

## 重大度レベル

### レベル定義

| レベル | 名前     | 説明                     | 対応時間  |
| ------ | -------- | ------------------------ | --------- |
| P1     | Critical | サービス停止、データ損失 | 即座      |
| P2     | High     | 重要機能の障害           | 15分以内  |
| P3     | Medium   | パフォーマンス劣化       | 1時間以内 |
| P4     | Low      | 軽微な問題               | 翌営業日  |

### 重大度判定フロー

```
ユーザー影響あり？
├─ Yes
│   └─ サービス停止？
│       ├─ Yes → P1 (Critical)
│       └─ No
│           └─ 50%以上影響？
│               ├─ Yes → P2 (High)
│               └─ No → P3 (Medium)
└─ No → P4 (Low)
```

## 閾値設計

### 静的閾値

```yaml
# 固定値による閾値
alerts:
  - name: high_error_rate
    condition: error_rate > 5%
    duration: 5m
    severity: P2

  - name: high_latency
    condition: p99_latency > 2000ms
    duration: 5m
    severity: P2

  - name: high_cpu
    condition: cpu_usage > 90%
    duration: 10m
    severity: P3
```

### 動的閾値

```yaml
# 過去のデータに基づく閾値
alerts:
  - name: anomaly_error_rate
    condition: error_rate > avg(error_rate, 7d) * 3
    duration: 5m
    severity: P2

  - name: traffic_spike
    condition: rps > avg(rps, 1h) * 2
    duration: 5m
    severity: P3
```

### 複合条件

```yaml
# 複数条件の組み合わせ
alerts:
  - name: service_degradation
    condition: >
      error_rate > 1% AND
      p95_latency > 500ms AND
      rps > 100
    duration: 5m
    severity: P2
```

## アラートルール例

### 可用性アラート

```yaml
# サービスダウン
- name: service_down
  condition: health_check_success == 0
  duration: 1m
  severity: P1
  message: "サービス {{service_name}} がダウンしています"
  runbook: "https://wiki.example.com/runbooks/service-down"

# 高エラー率
- name: high_error_rate
  condition: error_rate_5xx > 5%
  duration: 5m
  severity: P2
  message: "エラー率が {{error_rate}}% に上昇"
  runbook: "https://wiki.example.com/runbooks/high-error-rate"
```

### パフォーマンスアラート

```yaml
# 高レイテンシー
- name: high_latency_p99
  condition: latency_p99 > 2000ms
  duration: 5m
  severity: P2
  message: "p99レイテンシーが {{latency_p99}}ms に上昇"

# レイテンシー急上昇
- name: latency_spike
  condition: latency_p95 > avg(latency_p95, 1h) * 2
  duration: 3m
  severity: P3
  message: "レイテンシーが通常の2倍以上に上昇"
```

### リソースアラート

```yaml
# CPU高使用率
- name: high_cpu_usage
  condition: cpu_usage > 90%
  duration: 10m
  severity: P3
  message: "CPU使用率が {{cpu_usage}}%"

# メモリ高使用率
- name: high_memory_usage
  condition: memory_usage > 90%
  duration: 10m
  severity: P3
  message: "メモリ使用率が {{memory_usage}}%"

# ディスク容量
- name: disk_space_low
  condition: disk_usage > 85%
  duration: 30m
  severity: P3
  message: "ディスク使用率が {{disk_usage}}%"
```

## 通知設計

### 通知先設定

```yaml
notification_channels:
  - name: oncall_discord
    type: discord
    webhook: $DISCORD_WEBHOOK_URL
    severities: [P1, P2]

  - name: team_discord
    type: discord
    webhook: $DISCORD_TEAM_WEBHOOK_URL
    severities: [P3, P4]

  - name: email_summary
    type: email
    recipients: ["team@example.com"]
    severities: [P1, P2, P3, P4]
    frequency: daily_digest
```

### エスカレーション

```yaml
escalation_policy:
  name: standard
  steps:
    - wait: 0m
      notify: oncall_primary
    - wait: 15m
      notify: oncall_secondary
    - wait: 30m
      notify: engineering_manager
    - wait: 1h
      notify: cto
```

## 抑制ルール

### 重複抑制

```yaml
# 同じアラートの繰り返し抑制
suppression:
  - rule: same_alert
    window: 30m
    action: suppress_duplicates
```

### メンテナンス抑制

```yaml
# メンテナンス中の抑制
suppression:
  - rule: maintenance
    condition: maintenance_mode == true
    action: suppress_all
    severity: [P3, P4]
```

### 依存関係抑制

```yaml
# 上位障害時の抑制
suppression:
  - rule: dependency
    condition: upstream_service_down == true
    action: suppress
    affected_services: [service_a, service_b]
```

## Discord 通知フォーマット

### P1/P2 アラート

```json
{
  "embeds": [
    {
      "title": "🚨 [P1] サービス障害",
      "description": "APIサービスがダウンしています",
      "color": 15158332,
      "fields": [
        { "name": "サービス", "value": "api-service", "inline": true },
        { "name": "環境", "value": "production", "inline": true },
        { "name": "発生時刻", "value": "2024-01-15 10:30 JST", "inline": true },
        { "name": "影響", "value": "全ユーザーに影響", "inline": false },
        {
          "name": "対応手順",
          "value": "[Runbook](https://wiki.example.com/runbooks/service-down)"
        }
      ]
    }
  ]
}
```

### P3/P4 アラート

```json
{
  "embeds": [
    {
      "title": "⚠️ [P3] パフォーマンス警告",
      "description": "API応答時間が増加しています",
      "color": 16776960,
      "fields": [
        { "name": "サービス", "value": "api-service", "inline": true },
        { "name": "現在値", "value": "p99: 1500ms", "inline": true },
        { "name": "閾値", "value": "1000ms", "inline": true }
      ]
    }
  ]
}
```

## GitHub Actions での実装

```yaml
name: Check Alerts

on:
  schedule:
    - cron: "*/5 * * * *" # 5分ごと

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Health
        id: health
        run: |
          response=$(curl -s https://app.example.com/api/health)
          status=$(echo $response | jq -r '.status')
          echo "status=$status" >> $GITHUB_OUTPUT

      - name: Alert on Failure
        if: steps.health.outputs.status != 'healthy'
        run: |
          curl -X POST ${{ secrets.DISCORD_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{
              "embeds": [{
                "title": "🚨 [P1] Health Check Failed",
                "description": "Service is not healthy",
                "color": 15158332
              }]
            }'
```

## ベストプラクティス

### すべきこと

1. **アクション可能なアラート**
   - 対応手順を明記
   - Runbookへのリンク

2. **適切な閾値**
   - 過去のデータに基づく
   - 定期的な見直し

3. **エスカレーション**
   - 明確なエスカレーションパス
   - タイムアウトの設定

4. **抑制ルール**
   - メンテナンス時
   - 依存関係障害時

### 避けるべきこと

1. **アラート疲れ**
   - ❌ 対応不要なアラート
   - ❌ 頻繁な誤検知

2. **曖昧なアラート**
   - ❌ 「何かがおかしい」
   - ✅ 「エラー率が5%を超過」

3. **ドキュメント不足**
   - ❌ 対応手順なし
   - ✅ Runbook完備

## トラブルシューティング

### アラートが多すぎる

**対策**:

1. 閾値の見直し
2. 抑制ルールの追加
3. 根本原因の対処

### アラートが来ない

**確認事項**:

1. 通知設定
2. 閾値の設定
3. 監視対象の設定

### 誤検知が多い

**対策**:

1. 継続時間の延長
2. 閾値の調整
3. 複合条件の追加
