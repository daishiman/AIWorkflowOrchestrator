# メモリリーク検出ガイド

## メモリリークとは

メモリリークは、不要になったメモリが解放されず、
アプリケーションのメモリ使用量が継続的に増加する現象です。

```
正常なメモリパターン:
  Memory
    ↑   ╱╲   ╱╲   ╱╲   ← GCで解放
    │  ╱  ╲ ╱  ╲ ╱  ╲
    │ ╱    ╳    ╳    ╲
    └─────────────────→ Time

メモリリークパターン:
  Memory
    ↑           ╱╲
    │       ╱╲ ╱  ╲  ← GCでも解放されない
    │   ╱╲ ╱  ╲
    │  ╱  ╲
    └─────────────────→ Time
```

## リークの兆候

### 1. ヒープ使用量の継続的増加

```javascript
// 監視コード
let samples = [];
const SAMPLE_COUNT = 10;

setInterval(() => {
  const heapUsed = process.memoryUsage().heapUsed;
  samples.push(heapUsed);

  if (samples.length > SAMPLE_COUNT) {
    samples.shift();
  }

  if (samples.length === SAMPLE_COUNT) {
    // 単調増加チェック
    const isIncreasing = samples.every((val, i) =>
      i === 0 || val >= samples[i - 1]
    );

    if (isIncreasing) {
      const growth = samples[SAMPLE_COUNT - 1] - samples[0];
      console.warn(`Potential leak: heap grew ${(growth / 1024 / 1024).toFixed(2)}MB`);
    }
  }
}, 60000);
```

### 2. GC後のメモリ残留

```javascript
// --expose-gc が必要
function checkGCEffectiveness() {
  const before = process.memoryUsage().heapUsed;

  if (global.gc) {
    global.gc();
    const after = process.memoryUsage().heapUsed;
    const freed = before - after;

    if (freed < before * 0.1) { // 10%未満しか解放されない
      console.warn(`GC ineffective: only freed ${(freed / 1024 / 1024).toFixed(2)}MB`);
    }
  }
}
```

### 3. デタッチコンテキストの増加

```javascript
const v8 = require('v8');

function checkDetachedContexts() {
  const stats = v8.getHeapStatistics();

  if (stats.number_of_detached_contexts > 0) {
    console.warn(`Detached contexts: ${stats.number_of_detached_contexts}`);
  }
}
```

## 一般的なリーク原因

### 1. グローバル変数の蓄積

```javascript
// ❌ リークする
const cache = {};

function processRequest(userId, data) {
  cache[userId] = data; // 無限に蓄積
}

// ✅ LRUキャッシュを使用
const LRU = require('lru-cache');
const cache = new LRU({
  max: 500,
  ttl: 1000 * 60 * 5 // 5分
});
```

### 2. イベントリスナーの未解除

```javascript
// ❌ リークする
function handleConnection(socket) {
  const listener = (data) => {
    // 処理
  };
  socket.on('data', listener);
  // 接続終了時に解除されない
}

// ✅ クリーンアップ
function handleConnection(socket) {
  const listener = (data) => {
    // 処理
  };
  socket.on('data', listener);

  socket.on('close', () => {
    socket.removeListener('data', listener);
  });
}
```

### 3. クロージャによる参照保持

```javascript
// ❌ リークする（大きなオブジェクトへの参照を保持）
function createHandler(largeData) {
  return function() {
    // largeDataへの参照が残る
    console.log(largeData.id);
  };
}

// ✅ 必要な値のみ抽出
function createHandler(largeData) {
  const id = largeData.id; // 必要な値のみ
  return function() {
    console.log(id);
  };
}
```

### 4. タイマーの未クリア

```javascript
// ❌ リークする
function startPolling() {
  setInterval(() => {
    // 処理
  }, 1000);
  // クリアされない
}

// ✅ クリーンアップ
class Poller {
  start() {
    this.interval = setInterval(() => {
      // 処理
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
```

### 5. Promise/Async漏れ

```javascript
// ❌ リークする（未解決のPromiseが蓄積）
const pendingPromises = new Set();

function doAsyncWork() {
  const promise = someAsyncOperation();
  pendingPromises.add(promise);
  // 完了後も削除されない
}

// ✅ 完了時に削除
function doAsyncWork() {
  const promise = someAsyncOperation();
  pendingPromises.add(promise);

  promise.finally(() => {
    pendingPromises.delete(promise);
  });
}
```

## リーク検出ツール

### heapdump

```bash
pnpm install heapdump
```

```javascript
const heapdump = require('heapdump');

// シグナルでダンプ
process.on('SIGUSR2', () => {
  const filename = `/tmp/heap-${process.pid}-${Date.now()}.heapsnapshot`;
  heapdump.writeSnapshot(filename, (err, filename) => {
    if (err) console.error(err);
    else console.log(`Heap dump written to ${filename}`);
  });
});
```

### memwatch-next

```bash
pnpm install @airbnb/node-memwatch
```

```javascript
const memwatch = require('@airbnb/node-memwatch');

// リーク検出
memwatch.on('leak', (info) => {
  console.error('Memory leak detected:', info);
  // {
  //   growth: 1234567,
  //   reason: 'heap growth over 5 consecutive GCs'
  // }
});

// ヒープ差分
memwatch.on('stats', (stats) => {
  console.log('GC stats:', stats);
});
```

### clinic.js

```bash
pnpm install -g clinic
```

```bash
# ヒープ分析
clinic heapprofile -- node app.js

# リーク検出
clinic doctor -- node app.js
```

## 段階的リーク調査

### Step 1: 再現環境の準備

```javascript
// ベースラインの記録
const baseline = process.memoryUsage();
console.log('Baseline:', baseline);

// 負荷テスト
async function loadTest() {
  for (let i = 0; i < 10000; i++) {
    await processRequest();
  }
}
```

### Step 2: スナップショット比較

```javascript
const heapdump = require('heapdump');

// 開始時
heapdump.writeSnapshot('/tmp/heap-before.heapsnapshot');

// 負荷後
await loadTest();

// 終了時
heapdump.writeSnapshot('/tmp/heap-after.heapsnapshot');
```

### Step 3: Chrome DevToolsで分析

1. Chrome DevToolsを開く（`chrome://inspect`）
2. Memory → Load からスナップショット読み込み
3. Comparisonビューで差分を確認
4. 増加したオブジェクトを特定

### Step 4: コード修正

```javascript
// 問題箇所の特定後、修正を適用
// 修正前後で再度メモリ比較
```

## 予防策

### イベントリスナー監視

```javascript
const EventEmitter = require('events');

// 最大リスナー数を設定
EventEmitter.defaultMaxListeners = 10;

// 警告をエラーに昇格
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.error('Too many listeners:', warning);
  }
});
```

### 参照の明示的解除

```javascript
class DataProcessor {
  constructor() {
    this.data = null;
  }

  process(data) {
    this.data = data;
    // 処理
    this.cleanup();
  }

  cleanup() {
    this.data = null; // 明示的に解除
  }
}
```

### WeakMapの活用

```javascript
// 通常のMap（参照を保持）
const cache = new Map();
cache.set(obj, value); // objへの参照を保持

// WeakMap（参照を保持しない）
const weakCache = new WeakMap();
weakCache.set(obj, value); // objがGCされると自動削除
```
