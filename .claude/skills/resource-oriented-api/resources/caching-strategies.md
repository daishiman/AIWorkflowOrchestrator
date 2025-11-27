# キャッシュ戦略ガイド

## 1. キャッシュアーキテクチャ

### 多層キャッシュモデル

```
┌─────────────────────────────────────────────────────┐
│                   アプリケーション                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│   L1: インメモリキャッシュ                          │
│   ├── 容量: 小〜中（100MB-1GB）                    │
│   ├── 速度: 最速（マイクロ秒）                     │
│   ├── 永続性: なし（プロセス終了で消失）           │
│   └── 用途: ホットデータ、頻繁アクセス              │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│   L2: ファイルキャッシュ / Redis                    │
│   ├── 容量: 中〜大（1GB-10GB）                     │
│   ├── 速度: 高速（ミリ秒）                         │
│   ├── 永続性: あり（再起動後も維持）               │
│   └── 用途: セッションデータ、中期保存              │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│   L3: オリジンソース                                │
│   ├── 容量: 無制限                                  │
│   ├── 速度: 遅い（秒単位の場合も）                 │
│   ├── 永続性: 完全                                  │
│   └── 用途: 正規データソース                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### キャッシュフロー

```
リクエスト
    │
    ▼
┌─────────┐     ヒット     ┌─────────────┐
│ L1確認  │ ───────────▶ │  レスポンス  │
└────┬────┘               └─────────────┘
     │ミス
     ▼
┌─────────┐     ヒット     ┌─────────────┐
│ L2確認  │ ───────────▶ │ L1更新+応答 │
└────┬────┘               └─────────────┘
     │ミス
     ▼
┌─────────┐              ┌─────────────┐
│ L3取得  │ ───────────▶ │L1,L2更新+応答│
└─────────┘              └─────────────┘
```

## 2. TTL戦略

### リソースタイプ別TTL

| リソースタイプ | 推奨TTL | 理由 |
|---------------|---------|------|
| 静的ファイル（JS/CSS） | 1時間〜1日 | 変更頻度低 |
| 設定ファイル | 5分〜1時間 | 再起動で更新 |
| ユーザーデータ | 1分〜5分 | 頻繁に更新可能 |
| リアルタイムデータ | 10秒〜1分 | 即時性重要 |
| APIレスポンス | 1分〜5分 | Rate Limit考慮 |
| セッションデータ | 30分〜24時間 | セキュリティ考慮 |

### 動的TTL計算

```typescript
interface CachePolicy {
  baseTtl: number;      // 基本TTL（ミリ秒）
  maxTtl: number;       // 最大TTL
  minTtl: number;       // 最小TTL
  volatility: number;   // 変動係数（0-1）
}

function calculateTtl(policy: CachePolicy, accessCount: number): number {
  // アクセス頻度に基づいてTTLを調整
  const frequencyFactor = Math.min(accessCount / 100, 1);

  // 高アクセス = 長いTTL（キャッシュヒット率向上）
  const dynamicTtl = policy.baseTtl * (1 + frequencyFactor * (1 - policy.volatility));

  return Math.max(policy.minTtl, Math.min(policy.maxTtl, dynamicTtl));
}
```

## 3. キャッシュ無効化パターン

### 時間ベース無効化（TTL）

```typescript
class TtlCache {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();

  set(key: string, value: any, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  get(key: string): any | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }
}
```

### イベントベース無効化

```typescript
class EventDrivenCache {
  private cache: Map<string, any> = new Map();
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.setupListeners();
  }

  private setupListeners(): void {
    // リソース更新イベントでキャッシュ無効化
    this.eventEmitter.on('resource:updated', (uri: string) => {
      this.invalidate(uri);
    });

    // リソース削除イベントでキャッシュ無効化
    this.eventEmitter.on('resource:deleted', (uri: string) => {
      this.invalidate(uri);
    });
  }

  invalidate(uri: string): void {
    this.cache.delete(uri);
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### タグベース無効化

```typescript
class TaggedCache {
  private cache: Map<string, { value: any; tags: string[] }> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();

  set(key: string, value: any, tags: string[]): void {
    this.cache.set(key, { value, tags });

    // タグインデックスを更新
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  invalidateByTag(tag: string): void {
    const keys = this.tagIndex.get(tag);
    if (keys) {
      for (const key of keys) {
        this.cache.delete(key);
      }
      this.tagIndex.delete(tag);
    }
  }
}

// 使用例
cache.set('user:123', userData, ['users', 'user:123']);
cache.set('user:456', userData, ['users', 'user:456']);

// 全ユーザーキャッシュを無効化
cache.invalidateByTag('users');
```

## 4. キャッシュ戦略パターン

### Cache-Aside（Lazy Loading）

```typescript
async function getResource(uri: string): Promise<any> {
  // 1. キャッシュ確認
  const cached = cache.get(uri);
  if (cached) {
    return cached;
  }

  // 2. オリジンから取得
  const data = await fetchFromOrigin(uri);

  // 3. キャッシュに保存
  cache.set(uri, data, TTL);

  return data;
}
```

### Write-Through

```typescript
async function updateResource(uri: string, data: any): Promise<void> {
  // 1. オリジンを更新
  await updateOrigin(uri, data);

  // 2. キャッシュも同時に更新
  cache.set(uri, data, TTL);
}
```

### Write-Behind（Write-Back）

```typescript
class WriteBehindCache {
  private writeQueue: Map<string, any> = new Map();
  private flushInterval: number = 5000; // 5秒

  constructor() {
    this.startFlushTimer();
  }

  async set(uri: string, data: any): Promise<void> {
    // キャッシュを即座に更新
    cache.set(uri, data);

    // 書き込みキューに追加
    this.writeQueue.set(uri, data);
  }

  private startFlushTimer(): void {
    setInterval(async () => {
      await this.flushToOrigin();
    }, this.flushInterval);
  }

  private async flushToOrigin(): Promise<void> {
    const entries = [...this.writeQueue.entries()];
    this.writeQueue.clear();

    for (const [uri, data] of entries) {
      await updateOrigin(uri, data);
    }
  }
}
```

### Read-Through

```typescript
class ReadThroughCache {
  constructor(private loader: (uri: string) => Promise<any>) {}

  async get(uri: string): Promise<any> {
    const cached = cache.get(uri);
    if (cached) {
      return cached;
    }

    // キャッシュがローダーを自動呼び出し
    const data = await this.loader(uri);
    cache.set(uri, data, TTL);
    return data;
  }
}
```

## 5. 高度なパターン

### Stale-While-Revalidate

```typescript
class SWRCache {
  async get(uri: string): Promise<any> {
    const entry = this.cache.get(uri);

    if (entry) {
      // 有効期限内なら即座に返す
      if (Date.now() < entry.expiresAt) {
        return entry.value;
      }

      // Staleデータを返しつつ、バックグラウンドで更新
      if (Date.now() < entry.staleAt) {
        this.revalidateInBackground(uri);
        return entry.value;
      }
    }

    // キャッシュなしまたはStale期間超過
    return this.fetchAndCache(uri);
  }

  private async revalidateInBackground(uri: string): Promise<void> {
    // 非同期で更新（レスポンスを待たない）
    this.fetchAndCache(uri).catch(console.error);
  }
}
```

### Cache Warming

```typescript
class CacheWarmer {
  async warmCache(uris: string[]): Promise<void> {
    // 並列でキャッシュを事前ロード
    await Promise.all(
      uris.map(async (uri) => {
        const data = await fetchFromOrigin(uri);
        cache.set(uri, data, TTL);
      })
    );
  }

  async warmCriticalResources(): Promise<void> {
    const criticalUris = [
      'file:///config/app.json',
      'db://postgres/users',
      'memory://session/defaults'
    ];
    await this.warmCache(criticalUris);
  }
}
```

### 分散キャッシュ同期

```typescript
class DistributedCache {
  private localCache: Map<string, any>;
  private pubsub: PubSubClient;

  constructor() {
    this.localCache = new Map();
    this.pubsub = new PubSubClient();
    this.subscribeToInvalidations();
  }

  private subscribeToInvalidations(): void {
    this.pubsub.subscribe('cache:invalidate', (message) => {
      const { uri, timestamp } = message;
      this.localCache.delete(uri);
    });
  }

  async invalidate(uri: string): Promise<void> {
    // ローカルキャッシュを無効化
    this.localCache.delete(uri);

    // 他のノードに通知
    await this.pubsub.publish('cache:invalidate', {
      uri,
      timestamp: Date.now()
    });
  }
}
```

## 6. メトリクスと監視

### キャッシュメトリクス

```typescript
interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  memoryUsage: number;
}

class MonitoredCache {
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    memoryUsage: 0
  };

  get(key: string): any {
    const value = this.cache.get(key);
    if (value) {
      this.metrics.hits++;
    } else {
      this.metrics.misses++;
    }
    return value;
  }

  getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total > 0 ? this.metrics.hits / total : 0;
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }
}
```

### 監視アラート

```yaml
alerts:
  low_hit_rate:
    condition: hit_rate < 0.7
    severity: warning
    message: "キャッシュヒット率が70%を下回りました"

  high_eviction_rate:
    condition: evictions_per_minute > 1000
    severity: warning
    message: "キャッシュ退避が頻繁に発生しています"

  memory_pressure:
    condition: memory_usage > 0.9 * max_memory
    severity: critical
    message: "キャッシュメモリが90%を超えました"
```

## 7. チェックリスト

### 設計チェック

- [ ] 適切なキャッシュ層を選択？
- [ ] TTLは適切な値？
- [ ] 無効化戦略は定義？
- [ ] メモリ制限は設定？

### 実装チェック

- [ ] キャッシュミス時のフォールバック？
- [ ] エラーハンドリング？
- [ ] メトリクス収集？
- [ ] 監視アラート設定？
