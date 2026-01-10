# Level 4: 大規模システム・分散テスト

## 概要

大規模・分散システムのパフォーマンステスト、カオスエンジニアリング、継続的パフォーマンステスト（CPT）の実践を学びます。

---

## 1. 分散負荷テスト

### 1.1 分散実行アーキテクチャ

**単一ノードの限界**:

- ネットワーク帯域の限界
- CPU/メモリリソースの制約
- ファイルディスクリプタ上限

**分散実行の必要性**:

- 10,000+ 同時ユーザー
- リアルな地理的分散
- 大規模スループット

### 1.2 k6 Cloud での分散実行

```javascript
// k6 Cloud設定
export const options = {
  ext: {
    loadimpact: {
      projectID: 123456,
      name: "Distributed Load Test",
      distribution: {
        // 地理的分散
        "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 40 },
        "amazon:ie:dublin": { loadZone: "amazon:ie:dublin", percent: 30 },
        "amazon:sg:singapore": {
          loadZone: "amazon:sg:singapore",
          percent: 30,
        },
      },
    },
  },
  stages: [
    { duration: "5m", target: 1000 },
    { duration: "30m", target: 10000 }, // 10,000 VUs
    { duration: "5m", target: 0 },
  ],
};
```

### 1.3 JMeter 分散実行

**Master-Slave構成**:

```bash
# Slave起動
jmeter-server -Djava.rmi.server.hostname=192.168.1.10

# Master起動（3台のSlaveを使用）
jmeter -n -t test.jmx \
  -R 192.168.1.10,192.168.1.11,192.168.1.12 \
  -l results.jtl
```

**設定ファイル（jmeter.properties）**:

```properties
# リモートホスト設定
remote_hosts=192.168.1.10,192.168.1.11,192.168.1.12

# タイムアウト設定
client.rmi.localport=0
```

### 1.4 Locust 分散実行

**Master起動**:

```bash
locust -f locustfile.py --master --expect-workers=5
```

**Worker起動**:

```bash
# Worker 1
locust -f locustfile.py --worker --master-host=192.168.1.100

# Worker 2
locust -f locustfile.py --worker --master-host=192.168.1.100
```

**Kubernetes での分散実行**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: locust-master
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: locust
          image: locustio/locust
          args: ["--master"]
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: locust-worker
spec:
  replicas: 10 # 10 Workers
  template:
    spec:
      containers:
        - name: locust
          image: locustio/locust
          args: ["--worker", "--master-host=locust-master"]
```

---

## 2. カオスエンジニアリング

### 2.1 概要

**定義**: 本番環境で実験的に障害を注入し、システムの回復力を検証する手法。

**原則**:

1. 定常状態仮説の構築
2. 実際の事象をシミュレート
3. 本番環境で実験
4. 自動化された継続的実行

### 2.2 障害注入パターン

| パターン         | 目的                         | ツール例          |
| ---------------- | ---------------------------- | ----------------- |
| ネットワーク遅延 | レイテンシ耐性確認           | Toxiproxy, Pumba  |
| ネットワーク分断 | パーティション耐性確認       | Chaos Mesh        |
| サーバー停止     | 冗長性確認                   | Chaos Monkey      |
| リソース枯渇     | リソース制限下の動作確認     | Gremlin           |
| 依存サービス障害 | Fallback機構の動作確認       | WireMock + Fault  |
| データベース遅延 | クエリタイムアウト処理の確認 | tc (Traffic Con.) |

### 2.3 Chaos Toolkit 実践

**インストール**:

```bash
pip install chaostoolkit chaostoolkit-kubernetes
```

**実験定義（chaos-experiment.yaml）**:

```yaml
version: 1.0.0
title: "API Resilience under Pod Failure"
description: "Verify API continues to serve requests when pods are killed"

steady-state-hypothesis:
  title: "Application responds normally"
  probes:
    - type: probe
      name: "application-must-respond"
      tolerance: 200
      provider:
        type: http
        url: "https://api.example.com/health"
        timeout: 3

method:
  - type: action
    name: "kill-random-pod"
    provider:
      type: python
      module: chaosk8s.pod.actions
      func: terminate_pods
      arguments:
        label_selector: "app=myapp"
        rand: true
        ns: "production"

  - type: probe
    name: "api-still-responds"
    provider:
      type: http
      url: "https://api.example.com/health"
      timeout: 5
      expected_status: 200

rollbacks:
  - type: action
    name: "scale-deployment"
    provider:
      type: python
      module: chaosk8s.deployment.actions
      func: scale_deployment
      arguments:
        name: "myapp"
        replicas: 3
        ns: "production"
```

**実行**:

```bash
chaos run chaos-experiment.yaml
```

### 2.4 Toxiproxy によるネットワーク障害注入

**Toxiproxy起動**:

```bash
docker run -d --name toxiproxy \
  -p 8474:8474 -p 5432:5432 \
  shopify/toxiproxy
```

**Proxy設定（toxiproxy-cli）**:

```bash
# PostgreSQL Proxyを作成
toxiproxy-cli create postgres \
  -l localhost:5432 \
  -u postgres-server:5432

# 遅延を追加（100ms ± 50ms）
toxiproxy-cli toxic add postgres \
  -t latency \
  -a latency=100 \
  -a jitter=50

# パケットロス追加（10%）
toxiproxy-cli toxic add postgres \
  -t timeout \
  -a timeout=5000
```

**k6テストと組み合わせ**:

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 50 }, // ベースライン
    { duration: "5m", target: 50 }, // 障害注入中
    { duration: "2m", target: 0 },
  ],
};

export default function () {
  // Toxiproxy経由でアクセス
  const res = http.get("http://localhost:8080/api/users");

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 3s": (r) => r.timings.duration < 3000, // タイムアウト処理確認
  });

  sleep(1);
}
```

---

## 3. 継続的パフォーマンステスト（CPT）

### 3.1 CI/CD統合

**GitHub Actions 例**:

```yaml
name: Performance Test

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 2 * * *" # 毎日深夜2時

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run k6 performance test
        uses: grafana/k6-action@v0.3.0
        with:
          filename: tests/performance/load-test.js
          cloud: true
          token: ${{ secrets.K6_CLOUD_TOKEN }}

      - name: Check performance thresholds
        run: |
          if [ $? -ne 0 ]; then
            echo "Performance test failed"
            exit 1
          fi

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: k6-results
          path: summary.json
```

### 3.2 パフォーマンス予算の設定

**budget.yaml**:

```yaml
# パフォーマンス予算定義
budgets:
  - resourceType: "api"
    metric: "p95_latency"
    budget: 500 # ms
    tolerance: 10 # 10%の超過まで許容

  - resourceType: "api"
    metric: "throughput"
    budget: 1000 # req/s
    tolerance: 5

  - resourceType: "database"
    metric: "query_time_p95"
    budget: 100 # ms
    tolerance: 0 # 厳格
```

**予算チェックスクリプト**:

```javascript
import { readFileSync } from "fs";
import { parseHTML } from "k6/html";

const budgets = JSON.parse(readFileSync("budget.yaml"));
const results = JSON.parse(readFileSync("summary.json"));

export function checkBudget() {
  let violations = [];

  for (const budget of budgets) {
    const actualValue = results.metrics[budget.metric].values["p(95)"];
    const budgetValue = budget.budget;
    const tolerance = budget.tolerance;

    const maxAllowed = budgetValue * (1 + tolerance / 100);

    if (actualValue > maxAllowed) {
      violations.push({
        metric: budget.metric,
        actual: actualValue,
        budget: budgetValue,
        maxAllowed: maxAllowed,
      });
    }
  }

  if (violations.length > 0) {
    console.error("Performance budget violations:");
    violations.forEach((v) => {
      console.error(
        `  ${v.metric}: ${v.actual} > ${v.maxAllowed} (budget: ${v.budget})`,
      );
    });
    process.exit(1);
  }

  console.log("✓ All performance budgets met");
}
```

### 3.3 パフォーマンス回帰検出

**統計的比較手法**:

```javascript
// Mann-Whitney U検定で統計的有意差を検出
import { mannWhitneyU } from "simple-statistics";

function detectRegression(baseline, current) {
  const baselineLatencies = baseline.map((r) => r.latency);
  const currentLatencies = current.map((r) => r.latency);

  const pValue = mannWhitneyU(baselineLatencies, currentLatencies);

  // p < 0.05 で有意な差があると判定
  if (pValue < 0.05) {
    const baselineMedian = median(baselineLatencies);
    const currentMedian = median(currentLatencies);

    if (currentMedian > baselineMedian * 1.1) {
      console.warn(
        `Performance regression detected: ${baselineMedian}ms → ${currentMedian}ms`,
      );
      return true;
    }
  }

  return false;
}
```

---

## 4. 大規模システムのテスト戦略

### 4.1 マイクロサービス環境でのテスト

**サービスメッシュとの統合**:

```yaml
# Istio VirtualService - カナリアリリーステスト
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: myapp
spec:
  hosts:
    - myapp
  http:
    - match:
        - headers:
            x-test-scenario:
              exact: "performance-test"
      route:
        - destination:
            host: myapp
            subset: v2
          weight: 100 # テストトラフィックは新バージョンへ
    - route:
        - destination:
            host: myapp
            subset: v1
          weight: 90 # 本番トラフィックの90%
        - destination:
            host: myapp
            subset: v2
          weight: 10 # 本番トラフィックの10%
```

**k6での Trace ID伝播**:

```javascript
import http from "k6/http";
import tracing from "k6/experimental/tracing";

export const options = {
  scenarios: {
    trace_test: {
      executor: "constant-vus",
      vus: 50,
      duration: "10m",
    },
  },
};

tracing.instrumentHTTP({
  propagator: "w3c", // W3C Trace Context
});

export default function () {
  const res = http.get("https://api.example.com/users", {
    headers: {
      traceparent: `00-${generateTraceId()}-${generateSpanId()}-01`,
    },
  });
}

function generateTraceId() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

function generateSpanId() {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}
```

### 4.2 データベースシャーディング環境のテスト

**シャード間負荷分散の検証**:

```javascript
import http from "k6/http";
import { Counter } from "k6/metrics";

const shardHits = new Counter("shard_hits");

export default function () {
  const userId = Math.floor(Math.random() * 1000000);
  const shardId = userId % 4; // 4シャード構成

  const res = http.get(`https://api.example.com/users/${userId}`, {
    tags: { shard: `shard_${shardId}` },
  });

  shardHits.add(1, { shard: `shard_${shardId}` });
}

export function handleSummary(data) {
  // シャード間の負荷分散を検証
  const shards = [0, 1, 2, 3];
  const distribution = {};

  shards.forEach((id) => {
    const count = data.metrics.shard_hits.values[`shard_${id}`] || 0;
    distribution[`shard_${id}`] = count;
  });

  console.log("Shard distribution:", distribution);

  // 25%±5%の範囲内かチェック
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  shards.forEach((id) => {
    const percentage = (distribution[`shard_${id}`] / total) * 100;
    if (percentage < 20 || percentage > 30) {
      console.warn(`Shard ${id} imbalance: ${percentage.toFixed(2)}%`);
    }
  });

  return { stdout: JSON.stringify(distribution, null, 2) };
}
```

### 4.3 CDN/エッジキャッシュのテスト

**キャッシュヒット率の測定**:

```javascript
import http from "k6/http";
import { Rate, Counter } from "k6/metrics";

const cacheHitRate = new Rate("cache_hit_rate");
const cacheHits = new Counter("cache_hits");
const cacheMisses = new Counter("cache_misses");

export default function () {
  const res = http.get("https://cdn.example.com/static/image.jpg");

  // CDNのヘッダーからキャッシュ状態を判定
  const cacheStatus = res.headers["X-Cache"] || "MISS";

  if (cacheStatus.includes("HIT")) {
    cacheHitRate.add(1);
    cacheHits.add(1);
  } else {
    cacheHitRate.add(0);
    cacheMisses.add(1);
  }
}

export function handleSummary(data) {
  const hitRate = data.metrics.cache_hit_rate.values.rate * 100;
  console.log(`Cache Hit Rate: ${hitRate.toFixed(2)}%`);

  if (hitRate < 80) {
    console.warn("Cache hit rate is below target (80%)");
  }

  return { stdout: JSON.stringify({ hitRate }, null, 2) };
}
```

---

## 5. パフォーマンス文化の醸成

### 5.1 パフォーマンスSLO/SLIの設計

**SLI（Service Level Indicator）定義**:

| サービス | SLI                 | 測定方法         |
| -------- | ------------------- | ---------------- |
| API      | リクエスト成功率    | HTTP 2xx率       |
| API      | レイテンシP95       | レスポンスタイム |
| API      | 可用性              | Uptime監視       |
| データ   | データ整合性        | 整合性チェック   |
| 検索     | 検索結果精度（P95） | レスポンス精度   |

**SLO（Service Level Objective）設定**:

| SLI              | SLO     | エラーバジェット |
| ---------------- | ------- | ---------------- |
| リクエスト成功率 | 99.9%   | 0.1%             |
| レイテンシP95    | < 500ms | -                |
| 可用性（月次）   | 99.95%  | 21.6分/月        |

### 5.2 パフォーマンスダッシュボード

**Grafana ダッシュボード例**:

```json
{
  "dashboard": {
    "title": "Performance Monitoring",
    "panels": [
      {
        "title": "Request Rate (RPS)",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Latency Percentiles",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P50"
          },
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P99"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])"
          }
        ]
      }
    ]
  }
}
```

### 5.3 パフォーマンスレビュープロセス

**定期レビュー項目**:

1. **週次レビュー**:
   - SLO達成状況
   - パフォーマンス予算遵守状況
   - インシデント分析

2. **月次レビュー**:
   - 長期トレンド分析
   - キャパシティプランニング
   - 最適化施策の効果検証

3. **四半期レビュー**:
   - 年間パフォーマンス目標進捗
   - アーキテクチャ変更の影響評価
   - ベンチマーク更新

---

## 6. まとめ

Level 4では以下を習得しました：

- 分散負荷テストの設計と実行
- カオスエンジニアリングによる回復力検証
- 継続的パフォーマンステストの実装
- 大規模・分散システムのテスト戦略
- パフォーマンス文化の組織への定着

これらのスキルにより、エンタープライズレベルのパフォーマンステスト体制を構築・運用できます。

---

## 参考資料

- Chaos Engineering (Netflix)
- Site Reliability Engineering (Google)
- Continuous Performance Testing (Martin Fowler)
- k6 Cloud Documentation: https://k6.io/docs/cloud/
- Chaos Toolkit: https://chaostoolkit.org/
- Grafana Dashboards: https://grafana.com/grafana/dashboards/

---

_最終更新: 2025-01-02_
