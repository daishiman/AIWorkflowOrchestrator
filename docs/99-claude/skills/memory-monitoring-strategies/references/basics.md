# Memory Monitoring 基礎知識

> **相対パス**: `references/basics.md`
> **読込条件**: 初回使用時

---

## メモリメトリクス概要

### process.memoryUsage()

```javascript
const usage = process.memoryUsage();
// {
//   rss: 30932992,        // 物理メモリ使用量
//   heapTotal: 6066176,   // V8確保済みヒープ
//   heapUsed: 4309712,    // 使用中ヒープ
//   external: 1066823,    // C++オブジェクト
//   arrayBuffers: 10478   // ArrayBuffer
// }
```

### メトリクス比較

| メトリクス   | 説明                  | 監視重要度 |
| ------------ | --------------------- | ---------- |
| RSS          | 物理メモリ総使用量    | 高         |
| heapTotal    | V8 確保済みヒープ     | 中         |
| heapUsed     | 実使用ヒープ          | 高         |
| external     | C++オブジェクトメモリ | 中         |
| arrayBuffers | ArrayBuffer メモリ    | 低         |

---

## 健全性指標

### ヒープ使用率

```javascript
const usage = process.memoryUsage();
const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;

// 80% 超過で警告
if (heapUsagePercent > 80) {
  console.warn(`High heap usage: ${heapUsagePercent.toFixed(1)}%`);
}
```

### 推奨閾値

| メトリクス   | Warning | Critical |
| ------------ | ------- | -------- |
| ヒープ使用率 | 80%     | 90%      |
| RSS          | 500MB   | 1GB      |
| 増加率       | 10MB/分 | 50MB/分  |

---

## V8 ヒープ統計

```javascript
const v8 = require("v8");
const heapStats = v8.getHeapStatistics();
```

| 統計                        | 説明           |
| --------------------------- | -------------- |
| heap_size_limit             | ヒープ上限     |
| used_heap_size              | 使用中ヒープ   |
| total_available_size        | 利用可能ヒープ |
| number_of_detached_contexts | リーク指標     |

---

## ヒープ制限設定

```bash
# ヒープ上限を 2GB に設定
node --max-old-space-size=2048 app.js
```

| 環境  | デフォルト上限 |
| ----- | -------------- |
| 64bit | 約 4GB         |
| 32bit | 約 1.5GB       |

---

## 関連リソース

- **メトリクス詳細**: See [memory-metrics.md](memory-metrics.md)
- **監視パターン**: See [patterns.md](patterns.md)
