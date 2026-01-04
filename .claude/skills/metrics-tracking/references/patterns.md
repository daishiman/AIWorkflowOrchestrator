# メトリクス実装パターン

> 相対パス: `references/patterns.md`
> 読込条件: 計測システム構築時

---

## データ収集パターン

### Jira連携

```javascript
// Jira API からリードタイム計算
const calculateLeadTime = async (issueKey) => {
  const issue = await jira.getIssue(issueKey);
  const created = new Date(issue.fields.created);
  const resolved = new Date(issue.fields.resolutiondate);
  return (resolved - created) / (1000 * 60 * 60 * 24); // 日数
};
```

**計測可能メトリクス**:
| メトリクス | データソース | 計算方法 |
| ---------- | ------------ | -------- |
| リードタイム | issues.created, issues.resolutiondate | resolved - created |
| ベロシティ | sprint.completedIssues, issues.storyPoints | 合計ポイント |

### GitHub連携

```javascript
// GitHub API からデプロイ頻度計算
const getDeploymentFrequency = async (repo, days) => {
  const deployments = await github.repos.listDeployments({
    owner: repo.owner,
    repo: repo.name,
    per_page: 100,
  });
  const recent = deployments.filter(
    (d) => new Date(d.created_at) > Date.now() - days * 24 * 60 * 60 * 1000,
  );
  return recent.length / days;
};
```

**計測可能メトリクス**:
| メトリクス | データソース | 計算方法 |
| ---------- | ------------ | -------- |
| デプロイ頻度 | deployments | count / period |
| PRリードタイム | pull_requests | merged_at - created_at |

---

## ダッシュボード設計

### Grafana構成例

```json
{
  "dashboard": {
    "title": "チームメトリクス",
    "panels": [
      {
        "title": "ベロシティ推移",
        "type": "timeseries",
        "gridPos": { "x": 0, "y": 0, "w": 12, "h": 8 }
      },
      {
        "title": "リードタイム分布",
        "type": "histogram",
        "gridPos": { "x": 12, "y": 0, "w": 12, "h": 8 }
      },
      {
        "title": "デプロイ頻度",
        "type": "stat",
        "gridPos": { "x": 0, "y": 8, "w": 6, "h": 4 }
      },
      {
        "title": "変更失敗率",
        "type": "gauge",
        "gridPos": { "x": 6, "y": 8, "w": 6, "h": 4 }
      }
    ]
  }
}
```

### パネル設計原則

| 原則           | 説明                        |
| -------------- | --------------------------- |
| 一目で状況把握 | 主要指標はstat/gauge型      |
| トレンド重視   | 時系列はtimeseries型        |
| 分布確認       | リードタイム等はhistogram型 |
| 閾値表示       | 目標値を参照線として表示    |

---

## 異常検知パターン

### 閾値ベースアラート

```yaml
# Grafana アラートルール例
alert_rules:
  - name: velocity_drop
    condition: avg(velocity) < avg(velocity, 3w) * 0.7
    message: "ベロシティが過去3週平均の70%を下回っています"

  - name: lead_time_spike
    condition: percentile(lead_time, 95) > 14d
    message: "リードタイム95%タイルが14日を超えています"
```

### アラート設計原則

| 原則           | 説明                       |
| -------------- | -------------------------- |
| 過去比較       | 絶対値より相対変動で判断   |
| パーセンタイル | 外れ値に引きずられない     |
| 段階的閾値     | Warning → Critical の2段階 |
| アクション可能 | 検知後の対応が明確         |

---

## データパイプライン構成

```
[データソース] → [収集] → [変換] → [保存] → [可視化]
    ↓              ↓        ↓        ↓         ↓
  Jira API     Webhook   集計処理  Prometheus  Grafana
  GitHub API   Cron      正規化    InfluxDB
```

### 収集パターン

| パターン | 用途         | 例                       |
| -------- | ------------ | ------------------------ |
| Pull型   | 定期バッチ   | Cron で API polling      |
| Push型   | リアルタイム | Webhook でイベント受信   |
| Hybrid   | バランス     | 重要は Push、補完は Pull |

### 変換処理

```javascript
// 集計・変換の例
const aggregateMetrics = (rawData) => {
  return {
    velocity: sum(rawData.completedPoints),
    leadTime: {
      avg: average(rawData.leadTimes),
      p50: percentile(rawData.leadTimes, 50),
      p95: percentile(rawData.leadTimes, 95),
    },
    deployFrequency: rawData.deployments.length / rawData.periodDays,
  };
};
```

---

## 検証スクリプト活用

### validate-metrics.mjs

```bash
# 計測設定の検証
node scripts/validate-metrics.mjs --config metrics.json

# 出力例
✓ データソース接続: OK
✓ 計算式検証: OK
✓ ダッシュボード設定: OK
✗ アラート設定: 閾値が未設定
```

---

## チェックリスト

- [ ] Jira/GitHub API連携が設定されている
- [ ] ダッシュボードが主要メトリクスを表示している
- [ ] 異常検知アラートが設定されている
- [ ] データパイプラインが自動化されている
- [ ] 検証スクリプトで設定確認済み

---

## 参照

- **基本概念**: See [basics.md](basics.md)
- **DORAフレームワーク**: See [dora-framework.md](dora-framework.md)
