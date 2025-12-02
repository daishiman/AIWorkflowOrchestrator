# ヒープ分析ガイド

## ヒープスナップショットの取得

### heapdumpモジュール

```bash
pnpm install heapdump
```

```javascript
const heapdump = require('heapdump');

// 即時取得
heapdump.writeSnapshot((err, filename) => {
  if (err) console.error(err);
  else console.log(`Heap dump: ${filename}`);
});

// 指定パスに出力
heapdump.writeSnapshot('/tmp/heap.heapsnapshot');

// シグナルトリガー（本番推奨）
process.on('SIGUSR2', () => {
  const filename = `/tmp/heap-${Date.now()}.heapsnapshot`;
  heapdump.writeSnapshot(filename);
  console.log(`Heap dump written: ${filename}`);
});
```

### V8 Inspector

```bash
# inspectモードで起動
node --inspect app.js

# Chrome DevToolsに接続
# chrome://inspect
```

```javascript
// プログラムからinspectorを有効化
const inspector = require('inspector');
const fs = require('fs');

const session = new inspector.Session();
session.connect();

function takeHeapSnapshot() {
  return new Promise((resolve) => {
    const chunks = [];

    session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
      chunks.push(m.params.chunk);
    });

    session.post('HeapProfiler.takeHeapSnapshot', null, () => {
      const snapshot = chunks.join('');
      const filename = `/tmp/heap-${Date.now()}.heapsnapshot`;
      fs.writeFileSync(filename, snapshot);
      resolve(filename);
    });
  });
}
```

## Chrome DevToolsでの分析

### スナップショットの読み込み

1. Chrome DevToolsを開く
2. Memoryタブを選択
3. Loadボタンをクリック
4. .heapsnapshotファイルを選択

### ビュー解説

#### Summary View

オブジェクトをコンストラクタ名でグループ化。

| 列 | 説明 |
|---|------|
| Constructor | オブジェクトのコンストラクタ名 |
| Distance | ルートからの距離 |
| Shallow Size | オブジェクト自体のサイズ |
| Retained Size | オブジェクト+参照先の合計サイズ |

**チェックポイント**:
- 異常に多いオブジェクト数
- 大きなRetained Size
- 予期しないコンストラクタ名

#### Comparison View

2つのスナップショットを比較。

| 列 | 説明 |
|---|------|
| # New | 新しく作成されたオブジェクト数 |
| # Deleted | 削除されたオブジェクト数 |
| # Delta | 差分（New - Deleted） |
| Size Delta | サイズ変化 |

**リーク検出**:
- #Deltaが正の大きな値 → リーク候補
- Size Deltaが継続的に増加 → 明確なリーク

#### Containment View

ヒープのツリー構造を表示。

```
(GC roots)
├── (Global handles)
│   ├── (Internal slots)
│   │   └── Object@12345
│   └── Array@67890
└── (Native context)
    └── ...
```

**参照チェーンの追跡**:
オブジェクトがなぜ解放されないかを特定。

#### Statistics View

メモリ使用量の概要。

```
Total: 100MB
Code: 10MB
Strings: 20MB
JS arrays: 15MB
Typed arrays: 5MB
System objects: 50MB
```

## 分析パターン

### パターン1: 大量の同一オブジェクト

```
Summary View:
  MyClass         10,000    5MB    50MB
```

**調査**:
- オブジェクトの作成元を確認
- キャッシュ/プールの上限を確認
- 不要なオブジェクトの参照を確認

### パターン2: 巨大なRetained Size

```
Summary View:
  Cache           1         1KB    500MB
```

**調査**:
- Cacheが何を保持しているか展開
- 参照チェーンを確認
- 適切なキャッシュ戦略を検討

### パターン3: Detached DOM

```
Summary View:
  Detached HTMLDivElement    1000    100KB
```

**調査**:
- DOMが参照されているがDOMツリーから切り離されている
- イベントリスナーの解除漏れを確認

### パターン4: クロージャリーク

```
Comparison View:
  (closure)       +5000    +10MB
```

**調査**:
- クロージャが大きなオブジェクトを参照していないか
- 不要なクロージャが蓄積していないか

## 自動化された分析

### 定期スナップショット

```javascript
const heapdump = require('heapdump');
const path = require('path');

class HeapAnalyzer {
  constructor(options = {}) {
    this.snapshotDir = options.dir || '/tmp/heapdumps';
    this.interval = options.interval || 3600000; // 1時間
    this.maxSnapshots = options.maxSnapshots || 10;
    this.snapshots = [];
  }

  start() {
    this.timer = setInterval(() => this.takeSnapshot(), this.interval);
    console.log(`Heap analyzer started (interval: ${this.interval}ms)`);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  takeSnapshot() {
    const filename = path.join(
      this.snapshotDir,
      `heap-${Date.now()}.heapsnapshot`
    );

    heapdump.writeSnapshot(filename, (err) => {
      if (err) {
        console.error('Heap snapshot error:', err);
        return;
      }

      this.snapshots.push(filename);
      console.log(`Heap snapshot: ${filename}`);

      // 古いスナップショットを削除
      if (this.snapshots.length > this.maxSnapshots) {
        const old = this.snapshots.shift();
        require('fs').unlinkSync(old);
      }
    });
  }
}
```

### メモリ閾値でのトリガー

```javascript
const MEMORY_THRESHOLD = 500 * 1024 * 1024; // 500MB
let lastSnapshotTime = 0;
const SNAPSHOT_COOLDOWN = 300000; // 5分

function checkAndDump() {
  const heapUsed = process.memoryUsage().heapUsed;

  if (heapUsed > MEMORY_THRESHOLD) {
    const now = Date.now();
    if (now - lastSnapshotTime > SNAPSHOT_COOLDOWN) {
      heapdump.writeSnapshot(`/tmp/high-memory-${now}.heapsnapshot`);
      lastSnapshotTime = now;
      console.warn(`High memory snapshot taken: ${heapUsed / 1024 / 1024}MB`);
    }
  }
}

setInterval(checkAndDump, 30000);
```

## 本番環境での注意点

### パフォーマンス影響

- スナップショット取得中はメインスレッドがブロック
- 大きなヒープほど時間がかかる
- 本番環境では最小限の頻度で取得

### ディスク容量

- スナップショットは大きい（ヒープサイズの2-3倍）
- 自動削除ルールを設定
- 圧縮を検討

```bash
# スナップショット圧縮
gzip /tmp/heap-*.heapsnapshot
```

### セキュリティ

- スナップショットには機密情報が含まれる可能性
- アクセス制御を設定
- 不要なスナップショットは速やかに削除

```bash
# 権限設定
chmod 600 /tmp/heap-*.heapsnapshot
```

## トラブルシューティング

### スナップショットが取れない

```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

**対策**:
```bash
# ヒープ上限を増やす
node --max-old-space-size=4096 app.js
```

### ファイルが大きすぎる

**対策**:
- 負荷が低い時間帯に取得
- 不要なキャッシュをクリアしてから取得
- ヒープの一部だけを分析（v8.getHeapSpaceStatistics）

### DevToolsで開けない

**対策**:
- Chromeを最新版に更新
- `--js-flags="--max-old-space-size=8192"`でChrome起動
- 分析用に別マシンを使用
