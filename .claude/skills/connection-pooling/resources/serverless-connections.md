# サーバーレス環境での接続管理

## サーバーレスの課題

### コールドスタート問題

```
リクエスト到着
    │
    ├── ウォームインスタンス存在？
    │       ├── Yes → 既存接続を使用（高速）
    │       └── No  → コールドスタート
    │                   ├── 環境初期化
    │                   ├── コード読み込み
    │                   ├── DB接続確立 ← ボトルネック
    │                   └── リクエスト処理
    │
    └── レスポンス返却
```

**DB接続確立のオーバーヘッド**:
- DNS解決: 10-50ms
- TCP接続: 10-30ms
- TLSハンドシェイク: 20-50ms
- PostgreSQL認証: 10-30ms
- 合計: **50-160ms**

### 接続爆発問題

```
同時リクエスト増加
    │
    ├── Lambda 1 → 接続1
    ├── Lambda 2 → 接続2
    ├── Lambda 3 → 接続3
    │   ...
    └── Lambda 100 → 接続100
                       │
                       ▼
            DB接続上限に到達！
            "too many connections"
```

## 解決策

### 1. 外部接続プーラーの使用

#### Neon Pooler

```typescript
// 直接接続（開発用）
const directUrl = 'postgresql://user:pass@ep-xxx.region.neon.tech/db';

// プーラー経由接続（本番推奨）
const pooledUrl = 'postgresql://user:pass@ep-xxx-pooler.region.neon.tech/db';
```

**Neonプーラーの特徴**:
- PgBouncer ベース
- Transaction モード
- 自動スケーリング
- 追加設定不要

#### Supabase Connection Pooling

```typescript
// 直接接続（管理用）
const directUrl = 'postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres';

// プーラー経由（アプリケーション用）
const pooledUrl = 'postgresql://postgres:pass@db.xxx.supabase.co:6543/postgres';
```

**Supabaseプーラーの特徴**:
- ポート6543でPgBouncer提供
- Transaction モード
- セッションモードも選択可能

### 2. アプリケーション側の対策

#### 接続の再利用（Lambda）

```typescript
// グローバルスコープで接続を保持
let cachedConnection: Database | null = null;

async function getConnection(): Promise<Database> {
  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = await createConnection({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Lambda内では1接続で十分
  });

  return cachedConnection;
}

// ハンドラー
export const handler = async (event: Event) => {
  const db = await getConnection();
  // dbを使用
};
```

#### 接続の検証

```typescript
async function getValidConnection(): Promise<Database> {
  if (cachedConnection) {
    try {
      // 接続の有効性を確認
      await cachedConnection.query('SELECT 1');
      return cachedConnection;
    } catch (error) {
      // 無効な接続を破棄
      cachedConnection = null;
    }
  }

  return createNewConnection();
}
```

### 3. Edge Functions（Cloudflare Workers等）

#### Hyperdrive（Cloudflare）

```typescript
// wrangler.toml
// [[hyperdrive]]
// binding = "HYPERDRIVE"
// id = "xxx"

export default {
  async fetch(request: Request, env: Env) {
    // Hyperdriveが接続プーリングを管理
    const connectionString = env.HYPERDRIVE.connectionString;

    const client = new Client({ connectionString });
    await client.connect();

    try {
      const result = await client.query('SELECT * FROM users');
      return new Response(JSON.stringify(result.rows));
    } finally {
      await client.end();
    }
  },
};
```

### 4. HTTP接続（Neon Serverless Driver）

```typescript
import { neon } from '@neondatabase/serverless';

// HTTP経由でクエリを実行（接続プールは不要）
const sql = neon(process.env.DATABASE_URL!);

export async function handler() {
  // 各クエリがHTTPリクエストとして実行される
  const users = await sql`SELECT * FROM users LIMIT 10`;
  return users;
}
```

**特徴**:
- WebSocket不要
- Edge環境で動作
- 接続管理が不要
- レイテンシは若干増加

## 環境別推奨設定

### AWS Lambda

```typescript
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

// グローバルプール
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,  // Lambda内は1で十分
    });
  }
  return pool;
}

export const db = drizzle(getPool());

// Lambdaハンドラー
export const handler = async (event: Event) => {
  const users = await db.select().from(usersTable);
  return { statusCode: 200, body: JSON.stringify(users) };
};
```

### Vercel Edge Functions

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// HTTP接続（Edgeで最適）
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Edge Function
export default async function handler(request: Request) {
  const users = await db.select().from(usersTable);
  return new Response(JSON.stringify(users));
}

export const config = {
  runtime: 'edge',
};
```

### Cloudflare Workers

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export default {
  async fetch(request: Request, env: Env) {
    const sql = neon(env.DATABASE_URL);
    const db = drizzle(sql);

    const users = await db.select().from(usersTable);
    return new Response(JSON.stringify(users));
  },
};
```

## 接続文字列の選択

### 用途別の接続先

```yaml
環境変数:
  # 直接接続（マイグレーション、管理用）
  DATABASE_URL_DIRECT: postgresql://user:pass@host:5432/db

  # プーラー経由（アプリケーション用）
  DATABASE_URL: postgresql://user:pass@host-pooler:5432/db
```

### Drizzleでの使い分け

```typescript
// drizzle.config.ts（マイグレーション用）
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL_DIRECT!, // 直接接続
  },
};

// db/index.ts（アプリケーション用）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // プーラー経由
});
export const db = drizzle(pool);
```

## 監視と診断

### 接続状況の確認

```sql
-- アクティブな接続
SELECT
  client_addr,
  usename,
  application_name,
  state,
  query_start,
  query
FROM pg_stat_activity
WHERE datname = current_database();

-- 接続数のサマリー
SELECT
  state,
  count(*) as count
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;
```

### サーバーレス固有のメトリクス

| メトリクス | 説明 | 目標 |
|-----------|------|------|
| cold_start_rate | コールドスタート率 | < 10% |
| connection_time | 接続確立時間 | < 100ms |
| pooler_wait_time | プーラー待機時間 | < 50ms |

## チェックリスト

### セットアップ時
- [ ] プーラーを使用しているか？
- [ ] 接続文字列は適切か？
- [ ] グローバルスコープで接続を保持しているか？
- [ ] タイムアウトは設定されているか？

### パフォーマンス最適化時
- [ ] コールドスタート時間を測定したか？
- [ ] 接続再利用は機能しているか？
- [ ] HTTP接続（Neon Serverless）を検討したか？
- [ ] Provisioned Concurrencyは必要か？
