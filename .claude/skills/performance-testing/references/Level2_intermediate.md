# Level 2: テスト設計とツール選定

## 概要

パフォーマンステストのシナリオ設計、負荷パターンの最適化、ツール選定の詳細を学びます。

---

## 1. テストシナリオ設計

### 1.1 ユーザーシナリオのモデル化

**実際のユーザー行動を反映**:

```markdown
## シナリオ例: ECサイト

1. トップページ閲覧（100%）
2. 商品検索（70%）
3. 商品詳細閲覧（50%）
4. カートに追加（30%）
5. チェックアウト（10%）
6. 購入完了（8%）
```

**シナリオの重み付け**:

| シナリオ | 頻度 | 重み |
| -------- | ---- | ---- |
| 閲覧のみ | 60%  | 60   |
| 検索     | 30%  | 30   |
| 購入     | 10%  | 10   |

### 1.2 Think Time（思考時間）

ユーザーがページを閲覧してから次のアクションまでの待機時間。

**設定例**:

```javascript
// k6
export default function () {
  http.get("https://example.com/");
  sleep(randomIntBetween(2, 5)); // 2-5秒のThink Time

  http.get("https://example.com/search?q=product");
  sleep(randomIntBetween(3, 8)); // 3-8秒のThink Time
}
```

**推奨値**:

- トップページ閲覧後: 2-5秒
- 検索結果閲覧後: 3-8秒
- 商品詳細閲覧後: 5-15秒

### 1.3 データバリエーション

**動的データの使用**:

```javascript
// k6
import { SharedArray } from "k6/data";

const users = new SharedArray("users", function () {
  return JSON.parse(open("./users.json"));
});

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];
  http.post(
    "https://example.com/login",
    JSON.stringify({
      username: user.username,
      password: user.password,
    }),
  );
}
```

---

## 2. 負荷パターン設計

### 2.1 Ramp-up（段階的負荷増加）

**目的**: システムを段階的にウォームアップ

```javascript
// k6
export const options = {
  stages: [
    { duration: "2m", target: 10 }, // 2分で10VUまで増加
    { duration: "3m", target: 50 }, // 3分で50VUまで増加
    { duration: "5m", target: 100 }, // 5分で100VUまで増加
  ],
};
```

**推奨Ramp-up時間**: 目標負荷の10-20%の時間

### 2.2 Steady State（定常負荷）

**目的**: 安定した負荷で性能を測定

```javascript
// k6
export const options = {
  stages: [
    { duration: "2m", target: 100 }, // Ramp-up
    { duration: "10m", target: 100 }, // Steady State
    { duration: "2m", target: 0 }, // Ramp-down
  ],
};
```

**推奨時間**: 最低5-10分

### 2.3 スパイク負荷

**目的**: 急激な負荷変動への対応確認

```javascript
// k6
export const options = {
  stages: [
    { duration: "1m", target: 10 }, // ベースライン
    { duration: "30s", target: 200 }, // 急激な増加
    { duration: "2m", target: 200 }, // スパイク維持
    { duration: "30s", target: 10 }, // 急激な減少
    { duration: "2m", target: 10 }, // 回復確認
  ],
};
```

### 2.4 ストレス負荷

**目的**: システムの限界点を特定

```javascript
// k6
export const options = {
  stages: [
    { duration: "2m", target: 100 },
    { duration: "5m", target: 200 },
    { duration: "5m", target: 300 },
    { duration: "5m", target: 400 },
    // 限界まで継続
  ],
};
```

---

## 3. ツール選定詳細

### 3.1 k6

**適用シーン**:

- REST API / GraphQL
- マイクロサービス
- CI/CD統合

**メリット**:

- JavaScriptで記述（習得容易）
- CLI/Cloud両対応
- 軽量・高速
- Prometheus/Grafana連携

**デメリット**:

- ブラウザレンダリング非対応
- GUIなし

**スクリプト例（詳細）**:

```javascript
import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// カスタムメトリクス
const errorRate = new Rate("errors");
const loginDuration = new Trend("login_duration");
const apiCalls = new Counter("api_calls");

export const options = {
  stages: [
    { duration: "1m", target: 20 },
    { duration: "3m", target: 20 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
    errors: ["rate<0.1"],
  },
};

export default function () {
  group("Login Flow", function () {
    const loginStart = Date.now();
    const loginRes = http.post(
      "https://api.example.com/login",
      JSON.stringify({
        username: "testuser",
        password: "testpass",
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    const loginOk = check(loginRes, {
      "login status is 200": (r) => r.status === 200,
      "token received": (r) => r.json("token") !== "",
    });

    errorRate.add(!loginOk);
    loginDuration.add(Date.now() - loginStart);
    apiCalls.add(1);

    if (loginOk) {
      const token = loginRes.json("token");

      group("Get User Profile", function () {
        const profileRes = http.get("https://api.example.com/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        check(profileRes, {
          "profile status is 200": (r) => r.status === 200,
        });
        apiCalls.add(1);
      });
    }
  });

  sleep(1);
}
```

### 3.2 JMeter

**適用シーン**:

- Webアプリケーション全般
- 複雑なシナリオ
- GUI操作が必要な場合

**メリット**:

- GUIで設定可能
- プラグイン豊富
- プロトコル対応広い（HTTP、FTP、JDBC等）

**デメリット**:

- リソース消費大
- スクリプトが複雑

### 3.3 Locust

**適用シーン**:

- Python環境
- カスタマイズ重視

**メリット**:

- Pythonで記述
- 分散実行が容易
- WebUIあり

**デメリット**:

- Python知識が必要
- k6より重い

### 3.4 ツール選定フローチャート

```
Q1: ブラウザレンダリングが必要？
├─ Yes → Playwright/Puppeteer
└─ No  → Q2

Q2: GUIで設定したい？
├─ Yes → JMeter
└─ No  → Q3

Q3: Python環境？
├─ Yes → Locust
└─ No  → k6（推奨）
```

---

## 4. 閾値（Threshold）設定

### 4.1 k6の閾値設定

```javascript
export const options = {
  thresholds: {
    // レイテンシ
    http_req_duration: ["p(95)<500", "p(99)<1000"],

    // エラー率
    http_req_failed: ["rate<0.01"],

    // 特定エンドポイント
    "http_req_duration{name:login}": ["p(95)<300"],

    // カスタムメトリクス
    errors: ["rate<0.1"],
  },
};
```

### 4.2 閾値の決め方

| メトリクス    | 推奨閾値 | 理由                    |
| ------------- | -------- | ----------------------- |
| P95レイテンシ | < 500ms  | 95%のユーザー体験を保証 |
| P99レイテンシ | < 1000ms | 極端な遅延を検出        |
| エラー率      | < 0.1%   | 高可用性を維持          |
| CPU使用率     | < 70%    | 余裕を持たせる          |
| メモリ使用率  | < 80%    | OOM回避                 |

---

## 5. 環境設定のベストプラクティス

### 5.1 設定の外部化

**config.json**:

```json
{
  "baseURL": "https://staging.example.com",
  "stages": {
    "rampUp": "2m",
    "steady": "5m",
    "rampDown": "1m"
  },
  "thresholds": {
    "p95": 500,
    "p99": 1000,
    "errorRate": 0.01
  }
}
```

**スクリプト**:

```javascript
const config = JSON.parse(open("./config.json"));

export const options = {
  stages: [
    { duration: config.stages.rampUp, target: 50 },
    { duration: config.stages.steady, target: 50 },
    { duration: config.stages.rampDown, target: 0 },
  ],
};

export default function () {
  http.get(`${config.baseURL}/api/users`);
}
```

### 5.2 環境変数の利用

```javascript
const BASE_URL = __ENV.BASE_URL || "https://localhost:3000";
const API_KEY = __ENV.API_KEY;

export default function () {
  http.get(`${BASE_URL}/api/data`, {
    headers: { "X-API-Key": API_KEY },
  });
}
```

**実行**:

```bash
BASE_URL=https://staging.example.com API_KEY=secret k6 run script.js
```

---

## 6. データ駆動テスト

### 6.1 CSVデータの使用

**users.csv**:

```csv
username,password
user1,pass1
user2,pass2
user3,pass3
```

**k6スクリプト**:

```javascript
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";

const csvData = papaparse.parse(open("./users.csv"), { header: true }).data;

export default function () {
  const user = csvData[Math.floor(Math.random() * csvData.length)];
  http.post("https://example.com/login", JSON.stringify(user));
}
```

### 6.2 動的データ生成

```javascript
import {
  randomString,
  randomIntBetween,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

export default function () {
  const newUser = {
    username: `user_${randomString(8)}`,
    email: `${randomString(8)}@example.com`,
    age: randomIntBetween(18, 80),
  };

  http.post("https://example.com/users", JSON.stringify(newUser));
}
```

---

## 7. 実践例

### 7.1 負荷テスト完全例

```javascript
import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const checkoutDuration = new Trend("checkout_duration");

export const options = {
  stages: [
    { duration: "2m", target: 50 }, // Ramp-up
    { duration: "5m", target: 50 }, // Steady
    { duration: "2m", target: 100 }, // Peak
    { duration: "5m", target: 100 }, // Peak Steady
    { duration: "2m", target: 0 }, // Ramp-down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    errors: ["rate<0.05"],
  },
};

export default function () {
  // 60%: 閲覧のみ
  if (Math.random() < 0.6) {
    group("Browse Only", function () {
      http.get("https://example.com/");
      sleep(randomIntBetween(2, 5));

      http.get("https://example.com/products");
      sleep(randomIntBetween(3, 8));
    });
  }
  // 30%: 検索
  else if (Math.random() < 0.9) {
    group("Search", function () {
      http.get("https://example.com/search?q=product");
      sleep(randomIntBetween(2, 5));
    });
  }
  // 10%: 購入
  else {
    group("Purchase", function () {
      const start = Date.now();

      const cartRes = http.post(
        "https://example.com/cart",
        JSON.stringify({
          productId: 123,
          quantity: 1,
        }),
      );

      const cartOk = check(cartRes, {
        "cart status is 200": (r) => r.status === 200,
      });
      errorRate.add(!cartOk);

      if (cartOk) {
        const checkoutRes = http.post("https://example.com/checkout");
        check(checkoutRes, {
          "checkout status is 200": (r) => r.status === 200,
        });

        checkoutDuration.add(Date.now() - start);
      }
    });
  }

  sleep(1);
}

function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```

---

## 8. 次のステップ

Level 2をマスターしたら：

- **Level 3**: USE/REDメソッド、高度な分析手法
- **Level 4**: 大規模システム、分散テスト

---

## 参考資料

- k6 Documentation: https://k6.io/docs/
- The Art of Application Performance Testing (Ian Molyneaux)
- JMeter Best Practices: https://jmeter.apache.org/usermanual/best-practices.html

---

_最終更新: 2025-01-02_
