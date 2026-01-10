# アラート設定書

## 1. 概要

- **プロジェクト名**: {{project-name}}
- **対象システム**: {{system-name}}
- **作成日**: {{date}}
- **バージョン**: {{version}}
- **担当者**: {{author}}

## 2. アラート設計原則

### 2.1 基本方針

1. **すべてのアラートはアクション可能であること**
   - 通知を受け取った人が、明確に何をすべきか理解できる
   - 対応手順（Runbook）が存在する

2. **ユーザー影響がある場合のみアラートを発火すること**
   - 内部メトリクスの異常でも、ユーザー影響がなければアラートしない
   - Symptom-based（症状ベース）アラートを優先

3. **アラート疲労を防ぐこと**
   - 誤検知率を最小化（目標: 1%以下）
   - 自動対応可能なものは通知せず、自動修復する

### 2.2 アラート分類

| 分類     | 説明                               | 通知方法          | 対応時間  |
| -------- | ---------------------------------- | ----------------- | --------- |
| Critical | 即座の対応が必要、ユーザー影響あり | PagerDuty（即時） | 5分以内   |
| Warning  | 予兆段階、まだユーザー影響なし     | Slack通知         | 1時間以内 |
| Info     | 情報提供のみ、対応不要             | ログのみ          | 対応不要  |

## 3. アラートルール定義

### 3.1 アラート: {{alert-name-1}}

#### 基本情報

- **アラート名**: `{{alert-name}}`
- **重要度**: Critical / Warning / Info
- **分類**: Symptom-based / Cause-based
- **説明**: {{このアラートが何を検知するか}}
- **ユーザー影響**: {{どのようなユーザー影響があるか}}

#### 検知条件

**条件式（PromQL）**:

```promql
{{alerting-query}}
```

**例**:

```promql
(
  sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
  sum(rate(http_requests_total[5m]))
) > 0.05
```

**パラメータ**:

- **しきい値**: {{threshold}}
  - Warning: {{warning-threshold}}
  - Critical: {{critical-threshold}}
- **評価期間**: {{for-duration}}（例: 5m）
  - 理由: {{なぜこの期間を選んだか}}
- **評価頻度**: {{evaluation-interval}}（例: 1m）

#### しきい値の根拠

- **過去データ分析**:
  - 正常時の範囲: {{normal-range}}
  - 過去の障害時の値: {{incident-value}}
  - 誤検知リスク: {{false-positive-rate}}%

- **SLOバーンレート**:
  - SLO: {{slo-value}}
  - Error Budget: {{error-budget}}
  - バーンレート計算: {{burn-rate-calculation}}

#### 通知設定

- **通知先**:
  - Critical: PagerDuty（{{pagerduty-service}}）
  - Warning: Slack（{{slack-channel}}）
- **エスカレーション**:
  - 1次対応: {{team-1}}（15分以内）
  - 2次対応: {{team-2}}（30分以内）
  - 3次対応: {{team-3}}（1時間以内）

#### 対応手順

**Runbook**: {{runbook-url}}

**即座の対応**:

1. {{ステップ1}}
2. {{ステップ2}}
3. {{ステップN}}

**診断コマンド**:

```bash
{{diagnostic-command-1}}
{{diagnostic-command-2}}
```

**修復アクション**:

```bash
{{remediation-command-1}}
{{remediation-command-2}}
```

#### サンプルアラート通知

```
[CRITICAL] High Error Rate on API Service

Summary: Error rate on api-service has exceeded 5% for 5 minutes

Current Value: 7.2% (threshold: 5%)
Duration: 6 minutes
Impact: Users experiencing 500 errors on checkout

Runbook: https://runbook.example.com/high-error-rate
Grafana: https://grafana.example.com/d/xxx
Logs: https://logs.example.com/xxx

Quick Actions:
1. Check recent deployments
2. Review error logs
3. Consider rollback if deployment-related
```

---

### 3.2 アラート: {{alert-name-2}}

（同様の形式で各アラートを定義）

---

## 4. アラートマトリクス

### 4.1 全アラート一覧

| アラート名  | 重要度   | メトリクス | しきい値  | 評価期間     | 通知先    | Runbook |
| ----------- | -------- | ---------- | --------- | ------------ | --------- | ------- |
| {{alert-1}} | Critical | {{metric}} | {{value}} | {{duration}} | PagerDuty | {{url}} |
| {{alert-2}} | Warning  | {{metric}} | {{value}} | {{duration}} | Slack     | {{url}} |
| {{alert-n}} | Info     | {{metric}} | {{value}} | {{duration}} | Log only  | {{url}} |

### 4.2 SLOベースアラート

| SLO                  | バーンレートウィンドウ | しきい値 | アラート名     | 重要度   |
| -------------------- | ---------------------- | -------- | -------------- | -------- |
| 可用性 99.9%         | 1h                     | 14.4x    | {{alert-name}} | Critical |
| 可用性 99.9%         | 6h                     | 6x       | {{alert-name}} | Warning  |
| レイテンシ p95<200ms | 5m                     | >200ms   | {{alert-name}} | Critical |

**バーンレート計算**:

```
Error Budget = 1 - SLO = 1 - 0.999 = 0.001 (0.1%)

1時間でError Budgetを使い切るバーンレート:
(30日 × 24時間) / 1時間 = 720x
→ Critical: 14.4x（Error Budgetの2%を1時間で消費）
→ Warning: 6x（Error Budgetの0.83%を1時間で消費）
```

## 5. アラート抑制・サイレンス設定

### 5.1 依存関係に基づく抑制

```yaml
# 上流サービスがダウンしている場合、下流のアラートを抑制
- source_match:
    alertname: "DatabaseDown"
  target_match_re:
    service: ".*-api"
  equal: ["environment"]
```

### 5.2 メンテナンスウィンドウ

| メンテナンス種別 | サイレンス期間       | 対象アラート          |
| ---------------- | -------------------- | --------------------- |
| 定期メンテナンス | {{start}} - {{end}}  | {{alert-pattern}}     |
| デプロイ中       | デプロイ開始から10分 | {{deployment-alerts}} |

## 6. アラートチューニング履歴

### 6.1 調整ログ

| 日付       | アラート名 | 旧しきい値 | 新しきい値 | 変更理由            | 結果             |
| ---------- | ---------- | ---------- | ---------- | ------------------- | ---------------- |
| 2025-12-01 | {{alert}}  | {{old}}    | {{new}}    | 誤検知が多い（20%） | 誤検知率5%に改善 |
| 2025-12-15 | {{alert}}  | {{old}}    | {{new}}    | 障害を見逃した      | 検知精度向上     |

### 6.2 誤検知分析

| 期間      | 総アラート件数 | 真陽性 | 偽陽性 | 誤検知率 | 改善アクション           |
| --------- | -------------- | ------ | ------ | -------- | ------------------------ |
| 2025-12月 | 120            | 115    | 5      | 4.2%     | しきい値再調整           |
| 2025-11月 | 150            | 120    | 30     | 20%      | 評価期間を5分→10分に延長 |

## 7. 運用メトリクス

### 7.1 アラート対応時間（MTTA: Mean Time To Acknowledge）

| アラート重要度 | 目標MTTA | 実績MTTA   | 達成状況   |
| -------------- | -------- | ---------- | ---------- |
| Critical       | 5分      | {{actual}} | {{status}} |
| Warning        | 1時間    | {{actual}} | {{status}} |

### 7.2 修復時間（MTTR: Mean Time To Resolve）

| アラート種別        | 目標MTTR | 実績MTTR   | 達成状況   |
| ------------------- | -------- | ---------- | ---------- |
| High Error Rate     | 15分     | {{actual}} | {{status}} |
| Database Connection | 10分     | {{actual}} | {{status}} |

## 8. 自動修復（Auto-Remediation）

### 8.1 自動対応可能なアラート

| アラート名 | 自動修復アクション        | 成功率 | リスク評価 |
| ---------- | ------------------------- | ------ | ---------- |
| {{alert}}  | Podの再起動               | 95%    | 低         |
| {{alert}}  | スケールアウト（+2 pods） | 90%    | 中         |
| {{alert}}  | キャッシュクリア          | 85%    | 低         |

### 8.2 自動修復不可のアラート

| アラート名 | 理由                         | 必要なアクション |
| ---------- | ---------------------------- | ---------------- |
| {{alert}}  | データ整合性に影響する可能性 | 手動調査・修復   |
| {{alert}}  | 根本原因の特定が必要         | ログ分析後に対応 |

## 9. 次のステップ

- [ ] アラートルールの実装（Prometheus Alert Rules）
- [ ] Runbookの作成
- [ ] 通知先の設定（PagerDuty, Slack統合）
- [ ] 定期的なアラートレビュー（月次）
- [ ] 誤検知率のモニタリングとチューニング
