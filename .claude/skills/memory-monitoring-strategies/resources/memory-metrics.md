# Node.jsメモリメトリクスガイド

## process.memoryUsage()

Node.jsの標準メモリメトリクス取得API。

```javascript
const usage = process.memoryUsage();
console.log(usage);
// {
//   rss: 30932992,
//   heapTotal: 6066176,
//   heapUsed: 4309712,
//   external: 1066823,
//   arrayBuffers: 10478
// }
```

## メトリクス詳細

### RSS (Resident Set Size)

**定義**: プロセスが物理メモリ上に確保している総量

```
RSS = Code + Stack + Heap + External + Shared Libraries
```

**特徴**:
- OSから見たプロセスの実メモリ使用量
- スワップされたメモリは含まない
- 共有ライブラリのメモリも含む

**監視ポイント**:
```javascript
const MB = 1024 * 1024;
const rss = process.memoryUsage().rss / MB;

if (rss > 500) {
  console.warn(`High RSS: ${rss.toFixed(2)} MB`);
}
```

### heapTotal

**定義**: V8が確保したヒープメモリの総量

**特徴**:
- V8エンジンがOSから確保したメモリ
- 必要に応じて増減する
- `--max-old-space-size`で上限設定可能

**V8ヒープ制限**:
| Node.jsバージョン | デフォルト上限 |
|------------------|---------------|
| 64bit | 約4GB |
| 32bit | 約1.5GB |

```bash
# ヒープ上限を2GBに設定
node --max-old-space-size=2048 app.js
```

### heapUsed

**定義**: 実際に使用中のヒープメモリ

**特徴**:
- JSオブジェクトが使用中のメモリ
- GCにより増減
- heapTotal未満である必要がある

**健全性指標**:
```javascript
const usage = process.memoryUsage();
const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;

// 80%を超えると警告
if (heapUsagePercent > 80) {
  console.warn(`High heap usage: ${heapUsagePercent.toFixed(1)}%`);
}
```

### external

**定義**: V8が管理するC++オブジェクトのメモリ

**含まれるもの**:
- Buffer（一部）
- ネイティブアドオンのメモリ
- V8の内部構造

**監視ポイント**:
```javascript
const external = process.memoryUsage().external / MB;

// ネイティブモジュール使用時に急増する場合がある
if (external > 100) {
  console.warn(`High external memory: ${external.toFixed(2)} MB`);
}
```

### arrayBuffers

**定義**: ArrayBufferとSharedArrayBufferのメモリ

**特徴**:
- Node.js 13.0.0以降で追加
- externalとは別カウント
- Buffer.allocでも使用される

## V8ヒープ統計

```javascript
const v8 = require('v8');
const heapStats = v8.getHeapStatistics();

// {
//   total_heap_size: 6066176,
//   total_heap_size_executable: 524288,
//   total_physical_size: 5287680,
//   total_available_size: 2191736992,
//   used_heap_size: 4309712,
//   heap_size_limit: 2197815296,
//   malloced_memory: 16384,
//   peak_malloced_memory: 1097728,
//   does_zap_garbage: 0,
//   number_of_native_contexts: 1,
//   number_of_detached_contexts: 0
// }
```

**重要な統計**:

| 統計 | 説明 |
|------|------|
| heap_size_limit | ヒープ上限（--max-old-space-size） |
| used_heap_size | 使用中ヒープ |
| total_available_size | 利用可能なヒープ |
| number_of_native_contexts | アクティブなコンテキスト数 |
| number_of_detached_contexts | デタッチされたコンテキスト（リーク指標） |

## メモリ使用量の可視化

### コンソール出力

```javascript
function formatMemoryUsage() {
  const usage = process.memoryUsage();
  const format = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return {
    rss: format(usage.rss),
    heapTotal: format(usage.heapTotal),
    heapUsed: format(usage.heapUsed),
    external: format(usage.external),
    heapUsage: `${((usage.heapUsed / usage.heapTotal) * 100).toFixed(1)}%`
  };
}

// 定期出力
setInterval(() => {
  console.log('Memory:', formatMemoryUsage());
}, 30000);
```

### PM2カスタムメトリクス

```javascript
const io = require('@pm2/io');

// ヒープ使用量
io.metric({
  name: 'Heap Used (MB)',
  value: () => Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
});

// ヒープ使用率
io.metric({
  name: 'Heap Usage (%)',
  value: () => {
    const usage = process.memoryUsage();
    return Math.round((usage.heapUsed / usage.heapTotal) * 100);
  }
});

// RSS
io.metric({
  name: 'RSS (MB)',
  value: () => Math.round(process.memoryUsage().rss / 1024 / 1024)
});
```

## GC監視

### GCイベント追跡

```javascript
// Node.js起動時に --expose-gc フラグが必要
// node --expose-gc app.js

const v8 = require('v8');

// GC統計の有効化
v8.setFlagsFromString('--trace_gc');

// GC後のメモリ状況を記録
let lastHeapUsed = 0;

setInterval(() => {
  const current = process.memoryUsage().heapUsed;
  const diff = current - lastHeapUsed;

  if (Math.abs(diff) > 5 * 1024 * 1024) { // 5MB以上の変化
    console.log(`Heap change: ${(diff / 1024 / 1024).toFixed(2)} MB`);
  }

  lastHeapUsed = current;
}, 5000);
```

### 手動GCトリガー

```javascript
// --expose-gc が必要
if (global.gc) {
  // メモリ圧迫時に手動GC
  if (process.memoryUsage().heapUsed > 500 * 1024 * 1024) {
    global.gc();
    console.log('Manual GC triggered');
  }
}
```

## メモリアラート設定

```javascript
const THRESHOLDS = {
  heapUsagePercent: 85,
  rss: 1024 * 1024 * 1024, // 1GB
  heapGrowthRate: 10 * 1024 * 1024 // 10MB/分
};

let lastHeapUsed = process.memoryUsage().heapUsed;
let lastCheck = Date.now();

function checkMemory() {
  const usage = process.memoryUsage();
  const now = Date.now();
  const elapsed = (now - lastCheck) / 60000; // 分

  // ヒープ使用率チェック
  const heapPercent = (usage.heapUsed / usage.heapTotal) * 100;
  if (heapPercent > THRESHOLDS.heapUsagePercent) {
    console.error(`ALERT: Heap usage ${heapPercent.toFixed(1)}% exceeds threshold`);
  }

  // RSSチェック
  if (usage.rss > THRESHOLDS.rss) {
    console.error(`ALERT: RSS ${(usage.rss / 1024 / 1024).toFixed(0)}MB exceeds threshold`);
  }

  // 増加率チェック
  const growthRate = (usage.heapUsed - lastHeapUsed) / elapsed;
  if (growthRate > THRESHOLDS.heapGrowthRate) {
    console.warn(`WARNING: Heap growing at ${(growthRate / 1024 / 1024).toFixed(2)}MB/min`);
  }

  lastHeapUsed = usage.heapUsed;
  lastCheck = now;
}

setInterval(checkMemory, 60000);
```
