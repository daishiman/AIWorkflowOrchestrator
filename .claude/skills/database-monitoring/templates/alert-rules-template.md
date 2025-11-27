# アラートルール設計テンプレート

## アラート基本情報

| 項目 | 内容 |
|------|------|
| アラート名 | [例: connection_threshold_exceeded] |
| カテゴリ | [接続/パフォーマンス/リソース/セキュリティ] |
| 優先度 | [Critical/Warning/Info] |
| 対象環境 | [本番/ステージング/開発/全環境] |

---

## 検出条件

### 基本条件

```yaml
condition:
  metric: [監視対象メトリクス名]
  operator: [>, <, >=, <=, ==, !=]
  threshold: [閾値]
  duration: [持続時間、例: 5m]
```

### 複合条件（AND/OR）

```yaml
condition:
  type: AND  # または OR
  rules:
    - metric: connection_count
      operator: ">"
      threshold: 80
      as_percentage_of: max_connections
    - metric: active_queries
      operator: ">"
      threshold: 50
```

---

## 閾値設計

### 段階的閾値

| レベル | 閾値 | 持続時間 | アクション |
|--------|------|----------|-----------|
| Info | [値] | [時間] | ログ記録のみ |
| Warning | [値] | [時間] | Slack通知 |
| Critical | [値] | [時間] | PagerDuty + 即時対応 |

### 閾値の根拠

```
[閾値設定の根拠を記述]

例:
- 接続数 80%: 過去6ヶ月のピーク時データから、
  80%を超えると応答時間が劣化し始める傾向
- 90%: サービス影響が出始める実績値
- 95%: 新規接続が失敗し始める限界値
```

---

## 通知設計

### 通知先

```yaml
notifications:
  critical:
    - channel: pagerduty
      service: database-oncall
      escalation_policy: database-critical
    - channel: slack
      workspace: company
      channel: "#incidents"

  warning:
    - channel: slack
      workspace: company
      channel: "#alerts"

  info:
    - channel: slack
      workspace: company
      channel: "#monitoring"
```

### 通知内容テンプレート

```markdown
## 🚨 [アラート名]

**環境**: {{ environment }}
**発生時刻**: {{ triggered_at }}
**現在値**: {{ current_value }}
**閾値**: {{ threshold }}

### 影響
[このアラートが発火した場合の想定される影響]

### 即時対応
1. [対応手順1]
2. [対応手順2]

### Runbook
{{ runbook_url }}

### ダッシュボード
{{ dashboard_url }}
```

---

## 抑制ルール

### 重複抑制

```yaml
deduplication:
  key: "{{ alert_name }}_{{ environment }}"
  window: 5m
  # 同一キーのアラートは5分間抑制
```

### 依存関係抑制

```yaml
suppression:
  if_alert_firing: database_unreachable
  suppress_alerts:
    - connection_count_high
    - slow_queries
    - replication_lag
```

### メンテナンスウィンドウ

```yaml
maintenance_windows:
  - name: weekly_maintenance
    schedule:
      day: sunday
      time: "02:00-04:00"
      timezone: Asia/Tokyo
    suppress: all

  - name: deployment_window
    trigger: manual
    duration: 30m
    suppress:
      - slow_queries
      - error_rate
```

---

## 検証クエリ

### 現在値確認クエリ

```sql
-- [このアラートが監視する値を取得するクエリ]
SELECT
  [監視対象の値]
FROM [テーブル]
WHERE [条件];
```

### 履歴確認クエリ

```sql
-- 過去24時間の推移を確認
SELECT
  date_trunc('hour', timestamp) AS hour,
  AVG(value) AS avg_value,
  MAX(value) AS max_value
FROM metrics
WHERE metric_name = '[メトリクス名]'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;
```

---

## Runbook リンク

| ドキュメント | URL |
|-------------|-----|
| 対応手順書 | [/runbooks/alert-name.md] |
| 根本原因分析ガイド | [/docs/rca-guide.md] |
| エスカレーションマトリクス | [/docs/escalation.md] |
| 関連ダッシュボード | [/grafana/d/xxx] |

---

## 改訂履歴

| 日付 | 変更内容 | 担当者 |
|------|---------|--------|
| YYYY-MM-DD | 初版作成 | [名前] |
| | | |

---

## チェックリスト

### 設計時
- [ ] 閾値の根拠が明確
- [ ] 対応アクションが定義済み
- [ ] 通知先が適切
- [ ] Runbook が作成済み

### レビュー時
- [ ] 誤検知の可能性を評価
- [ ] 抑制ルールの妥当性確認
- [ ] エスカレーションパスの確認

### 運用開始後
- [ ] アラート発火頻度のモニタリング
- [ ] 月次での閾値見直し
- [ ] Runbook の有効性検証
