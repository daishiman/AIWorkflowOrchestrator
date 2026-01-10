# Level 3: 高度な分析手法とメトリクス

## 概要

USE/REDメソッド、高度なプロファイリング、ストレステスト、耐久テストの実践を学びます。

---

## 1. USE メソッド

### 1.1 概要

Brendan Greggが提唱したリソース分析手法。すべてのリソースについて以下を確認：

- **U**tilization (使用率)
- **S**aturation (飽和度)
- **E**rrors (エラー)

### 1.2 適用対象

| リソース     | Utilization        | Saturation       | Errors             |
| ------------ | ------------------ | ---------------- | ------------------ |
| CPU          | CPU使用率          | Run Queue長      | ハードウェアエラー |
| メモリ       | メモリ使用率       | スワップ発生率   | OOMエラー          |
| ディスク     | I/O使用率          | I/O待ちキュー長  | I/Oエラー          |
| ネットワーク | ネットワーク使用率 | パケット送信待ち | パケットロス       |

### 1.3 実践例

**Linuxでの確認コマンド**:

```bash
# CPU
mpstat 1              # CPU使用率
vmstat 1              # Run Queue (r列)
dmesg | grep -i cpu   # CPUエラー

# メモリ
free -m               # メモリ使用率
vmstat 1              # スワップ (si/so列)
dmesg | grep -i memory # OOMエラー

# ディスク
iostat -xz 1          # I/O使用率
iostat -xz 1          # avgqu-sz (キュー長)
dmesg | grep -i error # ディスクエラー

# ネットワーク
sar -n DEV 1          # ネットワーク使用率
netstat -s            # パケット統計
ifconfig              # エラーカウント
```

**k6での測定**:

```javascript
import exec from "k6/execution";
import { Counter, Gauge } from "k6/metrics";

const cpuUsage = new Gauge("system_cpu_usage");
const memUsage = new Gauge("system_mem_usage");
const diskIO = new Counter("system_disk_io");

export default function () {
  // テスト実行中にシステムメトリクスを記録
  // 実際にはPrometheus/Grafanaなどで収集
  http.get("https://example.com/api/data");
}
```

---

## 2. RED メソッド

### 2.1 概要

Tom Wilkieが提唱したサービス監視手法。マイクロサービスに適用：

- **R**ate (リクエスト率)
- **E**rrors (エラー率)
- **D**uration (レイテンシ)

### 2.2 メトリクス定義

| メトリクス | 測定内容                | 目標例  |
| ---------- | ----------------------- | ------- |
| Rate       | リクエスト数/秒         | > 1000  |
| Errors     | エラー率（%）           | < 0.1%  |
| Duration   | P95/P99レイテンシ（ms） | < 500ms |

### 2.3 k6での実装

```javascript
import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";

// REDメトリクス
const requestRate = new Counter("requests_total");
const errorRate = new Rate("errors");
const requestDuration = new Trend("request_duration");

export const options = {
  thresholds: {
    requests_total: [], // レート測定
    errors: ["rate<0.001"], // エラー率 < 0.1%
    request_duration: ["p(95)<500", "p(99)<1000"], // レイテンシ
  },
};

export default function () {
  const start = Date.now();
  const res = http.get("https://api.example.com/users");
  const duration = Date.now() - start;

  // REDメトリクス記録
  requestRate.add(1);
  errorRate.add(res.status >= 400);
  requestDuration.add(duration);
}
```

---

## 3. ストレステスト詳細

### 3.1 目的

- システムの限界点を特定
- 破綻時の挙動を確認
- 回復能力を評価

### 3.2 シナリオ設計

**段階的負荷増加パターン**:

```javascript
export const options = {
  stages: [
    { duration: "2m", target: 100 }, // ベースライン
    { duration: "5m", target: 200 }, // 通常ピーク
    { duration: "5m", target: 300 }, // 想定を超える負荷
    { duration: "5m", target: 400 }, // さらに増加
    { duration: "5m", target: 500 }, // 限界点探索
    { duration: "10m", target: 0 }, // 回復確認
  ],
  thresholds: {
    // 閾値を緩めに設定（限界点探索のため）
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.5"], // 50%まで許容
  },
};
```

### 3.3 監視ポイント

| 監視項目         | 確認内容                     |
| ---------------- | ---------------------------- |
| レイテンシの推移 | 線形増加 or 急激な悪化       |
| エラー率の推移   | いつからエラーが増加するか   |
| リソース使用率   | どのリソースが先に飽和するか |
| 回復時間         | 負荷減少後の正常化時間       |
| データ整合性     | 高負荷時のデータ不整合       |

### 3.4 実践例

```javascript
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const degradationRate = new Rate("degradation");
const recoveryTime = new Trend("recovery_time");
const saturationPoint = new Counter("saturation_point");

let baselineLatency = 0;
let saturated = false;

export const options = {
  stages: [
    { duration: "2m", target: 50 }, // ベースライン測定
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "2m", target: 300 },
    { duration: "2m", target: 400 },
    { duration: "2m", target: 500 },
    { duration: "5m", target: 0 }, // 回復確認
  ],
};

export default function () {
  const start = Date.now();
  const res = http.get("https://example.com/api/users");
  const latency = Date.now() - start;

  // ベースライン設定（最初の2分）
  if (exec.scenario.iterationInTest < 100) {
    if (baselineLatency === 0) baselineLatency = latency;
  }

  // 性能劣化検出（ベースラインの3倍以上）
  if (latency > baselineLatency * 3) {
    degradationRate.add(1);
    if (!saturated) {
      saturated = true;
      saturationPoint.add(exec.vu.idInTest);
      console.log(`Saturation detected at VU: ${exec.vu.idInTest}`);
    }
  } else {
    degradationRate.add(0);
  }

  check(res, {
    "status is 200": (r) => r.status === 200,
    "latency acceptable": () => latency < 2000,
  });
}
```

---

## 4. 耐久テスト（Soak Testing）詳細

### 4.1 目的

- メモリリークの検出
- 長時間稼働での性能劣化確認
- リソース枯渇の検出

### 4.2 シナリオ設計

**長時間負荷パターン**:

```javascript
export const options = {
  stages: [
    { duration: "5m", target: 100 }, // Ramp-up
    { duration: "6h", target: 100 }, // 6時間維持
    { duration: "5m", target: 0 }, // Ramp-down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};
```

### 4.3 監視ポイント

| 監視項目               | 確認内容               | 検出対象           |
| ---------------------- | ---------------------- | ------------------ |
| メモリ使用量推移       | 増加傾向がないか       | メモリリーク       |
| レイテンシ推移         | 時間経過で悪化しないか | 性能劣化           |
| コネクション数         | 増加傾向がないか       | コネクションリーク |
| ファイルディスクリプタ | 増加傾向がないか       | リソース枯渇       |
| GC頻度                 | 増加傾向がないか       | メモリ圧迫         |

### 4.4 実践例

```javascript
import http from "k6/http";
import { Trend, Gauge } from "k6/metrics";

const latencyTrend = new Trend("latency_over_time", true); // 時系列データ保持
const memoryGauge = new Gauge("app_memory_mb");

export const options = {
  stages: [
    { duration: "5m", target: 50 },
    { duration: "2h", target: 50 }, // 2時間のSoak Test
    { duration: "5m", target: 0 },
  ],
};

export default function () {
  const start = Date.now();
  const res = http.get("https://example.com/api/users");
  const latency = Date.now() - start;

  latencyTrend.add(latency);

  // アプリケーションメモリ使用量を取得（要：モニタリング統合）
  // memoryGauge.add(getAppMemoryUsage());

  sleep(1);
}

export function handleSummary(data) {
  // レイテンシの時系列推移を分析
  const latencies = data.metrics.latency_over_time.values;
  const firstQuarter = latencies.slice(0, latencies.length / 4);
  const lastQuarter = latencies.slice(-latencies.length / 4);

  const avgFirst = avg(firstQuarter);
  const avgLast = avg(lastQuarter);

  if (avgLast > avgFirst * 1.2) {
    console.warn("Performance degradation detected over time");
  }

  return {
    "summary.json": JSON.stringify(data),
  };
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
```

---

## 5. 分散トレーシング

### 5.1 概要

マイクロサービス環境でのリクエスト追跡手法。

### 5.2 Trace IDの伝播

```javascript
import http from "k6/http";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export default function () {
  const traceId = uuidv4();

  const res = http.get("https://api.example.com/users", {
    headers: {
      "X-Trace-Id": traceId,
      "X-Span-Id": uuidv4(),
    },
  });

  console.log(
    `Trace ID: ${traceId}, Status: ${res.status}, Duration: ${res.timings.duration}ms`,
  );
}
```

### 5.3 Jaeger/Zipkin統合

```javascript
import { trace } from "k6/experimental/tracing";

export const options = {
  scenarios: {
    with_tracing: {
      executor: "constant-vus",
      vus: 10,
      duration: "5m",
      options: {
        tracing: {
          // Jaegerバックエンド
          collector: "http://jaeger:14268/api/traces",
          sampler: {
            type: "probabilistic",
            param: 0.5, // 50%サンプリング
          },
        },
      },
    },
  },
};

export default function () {
  trace((span) => {
    span.setTag("service", "load-test");
    span.setTag("environment", "staging");

    const res = http.get("https://api.example.com/users");

    span.setTag("status", res.status);
    span.setTag("duration_ms", res.timings.duration);
  });
}
```

---

## 6. 高度なメトリクス分析

### 6.1 ヒートマップ分析

レイテンシ分布を時系列で可視化。

**データ収集**:

```javascript
import { Trend } from "k6/metrics";

const latencyHistogram = new Trend("latency_histogram", true);

export default function () {
  const res = http.get("https://example.com/api/users");
  latencyHistogram.add(res.timings.duration);
}

export function handleSummary(data) {
  // ヒートマップ用データ生成
  return {
    "latency-heatmap.json": JSON.stringify({
      timestamps: data.metrics.latency_histogram.timestamps,
      values: data.metrics.latency_histogram.values,
    }),
  };
}
```

### 6.2 Apdex スコア

Application Performance Index - ユーザー満足度を数値化。

```javascript
import { Rate } from "k6/metrics";

const apdexSatisfied = new Rate("apdex_satisfied");
const apdexTolerating = new Rate("apdex_tolerating");
const apdexFrustrated = new Rate("apdex_frustrated");

const THRESHOLD_SATISFIED = 500; // 満足: < 500ms
const THRESHOLD_TOLERATING = 2000; // 許容: < 2000ms

export default function () {
  const res = http.get("https://example.com/api/users");
  const duration = res.timings.duration;

  if (duration < THRESHOLD_SATISFIED) {
    apdexSatisfied.add(1);
    apdexTolerating.add(0);
    apdexFrustrated.add(0);
  } else if (duration < THRESHOLD_TOLERATING) {
    apdexSatisfied.add(0);
    apdexTolerating.add(1);
    apdexFrustrated.add(0);
  } else {
    apdexSatisfied.add(0);
    apdexTolerating.add(0);
    apdexFrustrated.add(1);
  }
}

export function handleSummary(data) {
  const satisfied = data.metrics.apdex_satisfied.values.rate;
  const tolerating = data.metrics.apdex_tolerating.values.rate;

  // Apdex = (Satisfied + Tolerating/2) / Total
  const apdex = satisfied + tolerating / 2;

  console.log(`Apdex Score: ${apdex.toFixed(2)}`);
  // 0.94以上: Excellent, 0.85-0.93: Good, 0.70-0.84: Fair, < 0.70: Poor

  return {
    stdout: JSON.stringify({ apdex }),
  };
}
```

---

## 7. ボトルネック分析実践

### 7.1 階層的分析

```
1. アプリケーション層
   ├─ コード最適化（プロファイリング）
   ├─ アルゴリズム改善
   └─ キャッシュ導入

2. ミドルウェア層
   ├─ データベースクエリ最適化
   ├─ コネクションプール調整
   └─ メッセージキュー最適化

3. インフラ層
   ├─ CPU/メモリのスケールアップ
   ├─ 水平スケーリング
   └─ ネットワーク最適化
```

### 7.2 分析チェックリスト

| チェック項目       | 確認方法        | 改善策例                         |
| ------------------ | --------------- | -------------------------------- |
| CPU使用率          | mpstat, top     | コード最適化、スケールアップ     |
| メモリ使用率       | free, vmstat    | メモリリーク修正、キャッシュ調整 |
| ディスクI/O        | iostat          | SSD導入、インデックス追加        |
| ネットワーク       | sar -n DEV      | CDN導入、圧縮有効化              |
| データベースクエリ | EXPLAIN ANALYZE | インデックス追加、クエリ最適化   |
| N+1問題            | ログ分析        | Eager Loading導入                |

---

## 8. 次のステップ

Level 3をマスターしたら：

- **Level 4**: 大規模システム、分散負荷テスト、カオスエンジニアリング

---

## 参考資料

- Systems Performance (Brendan Gregg)
- The USE Method: http://www.brendangregg.com/usemethod.html
- The RED Method: https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/
- k6 Documentation - Advanced: https://k6.io/docs/testing-guides/

---

_最終更新: 2025-01-02_
