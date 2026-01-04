# Memory Monitoring パターン

> **相対パス**: `references/patterns.md`
> **読込条件**: 設計時

---

## PM2 カスタムメトリクス

```javascript
const io = require("@pm2/io");

io.metric({
  name: "Heap Used (MB)",
  value: () => Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
});

io.metric({
  name: "Heap Usage (%)",
  value: () => {
    const usage = process.memoryUsage();
    return Math.round((usage.heapUsed / usage.heapTotal) * 100);
  },
});

io.metric({
  name: "RSS (MB)",
  value: () => Math.round(process.memoryUsage().rss / 1024 / 1024),
});
```

---

## アラート設定パターン

```javascript
const THRESHOLDS = {
  heapUsagePercent: 85,
  rss: 1024 * 1024 * 1024, // 1GB
  heapGrowthRate: 10 * 1024 * 1024, // 10MB/分
};

let lastHeapUsed = process.memoryUsage().heapUsed;
let lastCheck = Date.now();

function checkMemory() {
  const usage = process.memoryUsage();
  const now = Date.now();
  const elapsed = (now - lastCheck) / 60000;

  // ヒープ使用率チェック
  const heapPercent = (usage.heapUsed / usage.heapTotal) * 100;
  if (heapPercent > THRESHOLDS.heapUsagePercent) {
    console.error(`ALERT: Heap usage ${heapPercent.toFixed(1)}%`);
  }

  // 増加率チェック
  const growthRate = (usage.heapUsed - lastHeapUsed) / elapsed;
  if (growthRate > THRESHOLDS.heapGrowthRate) {
    console.warn(
      `WARNING: Heap growing at ${(growthRate / 1024 / 1024).toFixed(2)}MB/min`,
    );
  }

  lastHeapUsed = usage.heapUsed;
  lastCheck = now;
}

setInterval(checkMemory, 60000);
```

---

## GC 監視

### GC 効果測定

```javascript
// node --expose-gc app.js が必要

let lastHeapUsed = 0;

setInterval(() => {
  const current = process.memoryUsage().heapUsed;
  const diff = current - lastHeapUsed;

  if (Math.abs(diff) > 5 * 1024 * 1024) {
    console.log(`Heap change: ${(diff / 1024 / 1024).toFixed(2)} MB`);
  }

  lastHeapUsed = current;
}, 5000);
```

### 手動 GC トリガー

```javascript
if (global.gc) {
  if (process.memoryUsage().heapUsed > 500 * 1024 * 1024) {
    global.gc();
    console.log("Manual GC triggered");
  }
}
```

---

## ヒープダンプトリガー

### シグナルベース

```javascript
const heapdump = require("heapdump");

process.on("SIGUSR2", () => {
  const filename = `/tmp/heap-${Date.now()}.heapsnapshot`;
  heapdump.writeSnapshot(filename);
  console.log(`Heap dump written: ${filename}`);
});
```

### 閾値ベース

```javascript
const MEMORY_THRESHOLD = 500 * 1024 * 1024;
let lastSnapshotTime = 0;
const SNAPSHOT_COOLDOWN = 300000; // 5分

function checkAndDump() {
  const heapUsed = process.memoryUsage().heapUsed;

  if (heapUsed > MEMORY_THRESHOLD) {
    const now = Date.now();
    if (now - lastSnapshotTime > SNAPSHOT_COOLDOWN) {
      heapdump.writeSnapshot(`/tmp/high-memory-${now}.heapsnapshot`);
      lastSnapshotTime = now;
    }
  }
}

setInterval(checkAndDump, 30000);
```

---

## 定期監視出力

```javascript
function formatMemoryUsage() {
  const usage = process.memoryUsage();
  const format = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return {
    rss: format(usage.rss),
    heapTotal: format(usage.heapTotal),
    heapUsed: format(usage.heapUsed),
    external: format(usage.external),
    heapUsage: `${((usage.heapUsed / usage.heapTotal) * 100).toFixed(1)}%`,
  };
}

setInterval(() => {
  console.log("Memory:", formatMemoryUsage());
}, 30000);
```

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **ヒープ分析**: See [heap-analysis.md](heap-analysis.md)
- **リーク検出**: See [leak-detection.md](leak-detection.md)
