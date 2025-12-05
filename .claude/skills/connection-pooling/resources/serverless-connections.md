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

**DB接続確立のオーバーヘッド（従来のPostgreSQL）**:

- DNS解決: 10-50ms
- TCP接続: 10-30ms
- TLSハンドシェイク: 20-50ms
- PostgreSQL認証: 10-30ms
- 合計: **50-160ms**

**Turso/libSQLのアドバンテージ**:

- HTTPSベースの接続: 20-50ms
- 組み込みレプリカ使用時: **<5ms** (ローカルアクセス)
- 認証オーバーヘッドの削減

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

### 1. Tursoの組み込みレプリカ（Embedded Replicas）

Tursoは従来の接続プーラーの代わりに、**組み込みレプリカ**を使用してサーバーレス環境に最適化されています。

```typescript
import { createClient } from "@libsql/client";

// リモートDBのみ（シンプル）
const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// 組み込みレプリカ使用（超高速）
const dbWithReplica = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncUrl: process.env.TURSO_DATABASE_URL!,
  syncInterval: 60, // 秒単位で同期
});
```

**組み込みレプリカの特徴**:

- **ローカルSQLiteファイル**をキャッシュとして使用
- 読み取り: **<5ms** (ローカルアクセス)
- 書き込み: リモートに自動同期
- 接続プールが不要
- コールドスタートの影響を最小化

**動作フロー**:

```
読み取りクエリ
    │
    ├── ローカルレプリカから即座に応答（<5ms）
    │
    └── バックグラウンドで定期同期

書き込みクエリ
    │
    ├── リモートDBに書き込み
    │
    └── ローカルレプリカを更新
```

### 2. アプリケーション側の対策

#### 接続の再利用（Lambda）

```typescript
import { createClient } from "@libsql/client";

// グローバルスコープで接続を保持
let cachedClient: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  return cachedClient;
}

// ハンドラー
export const handler = async (event: Event) => {
  const db = getClient();
  // dbを使用
};
```

#### 接続の検証

```typescript
async function getValidConnection() {
  if (cachedClient) {
    try {
      // 接続の有効性を確認
      await cachedClient.execute("SELECT 1");
      return cachedClient;
    } catch (error) {
      // 無効な接続を破棄して再作成
      cachedClient = null;
    }
  }

  return createNewClient();
}
```

### 3. Edge Functions（Cloudflare Workers等）

Turso/libSQLはEdge環境でネイティブに動作します。

```typescript
import { createClient } from "@libsql/client";

export default {
  async fetch(request: Request, env: Env) {
    // TursoはEdge環境で直接動作
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    const result = await client.execute("SELECT * FROM users");
    return new Response(JSON.stringify(result.rows));
  },
};
```

**Cloudflare Workers + Tursoの特徴**:

- D1互換のSQLite
- グローバルエッジロケーションで低レイテンシ
- 自動レプリケーション
- 接続プール不要

### 4. Vercel Edge Functions

```typescript
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

// Edge環境用のWebクライアント
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);

export default async function handler(request: Request) {
  const users = await db.select().from(usersTable);
  return new Response(JSON.stringify(users));
}

export const config = {
  runtime: "edge",
};
```

**特徴**:

- Edge Runtimeでネイティブ動作
- HTTPS経由の軽量接続
- グローバル分散
- 接続管理が不要

## 環境別推奨設定

### AWS Lambda

```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// グローバルクライアント（Lambda間で再利用）
let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return client;
}

export const db = drizzle(getClient());

// Lambdaハンドラー
export const handler = async (event: Event) => {
  const users = await db.select().from(usersTable);
  return { statusCode: 200, body: JSON.stringify(users) };
};
```

### AWS Lambda + 組み込みレプリカ（超高速）

```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// 組み込みレプリカで読み取りを高速化
let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client) {
    client = createClient({
      url: "file:///tmp/local.db", // Lambdaの一時ストレージ
      syncUrl: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
      syncInterval: 60,
    });
  }
  return client;
}

export const db = drizzle(getClient());
```

### Vercel Edge Functions

```typescript
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

// Edge環境用のWebクライアント
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);

export default async function handler(request: Request) {
  const users = await db.select().from(usersTable);
  return new Response(JSON.stringify(users));
}

export const config = {
  runtime: "edge",
};
```

### Cloudflare Workers

```typescript
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export default {
  async fetch(request: Request, env: Env) {
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    const db = drizzle(client);
    const users = await db.select().from(usersTable);
    return new Response(JSON.stringify(users));
  },
};
```

## 接続文字列の選択

### Tursoの環境変数設定

```yaml
環境変数:
  # Tursoデータベース接続URL
  TURSO_DATABASE_URL: libsql://[database-name]-[org].turso.io

  # 認証トークン
  TURSO_AUTH_TOKEN: eyJhbGc...

  # ローカル開発用（オプション）
  TURSO_LOCAL_URL: file://local.db
```

### Drizzleでの使い分け

```typescript
// drizzle.config.ts（マイグレーション用）
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;

// db/index.ts（アプリケーション用）
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
```

## 監視と診断

### Tursoダッシュボードでの監視

Tursoは専用ダッシュボードで以下を監視できます：

- リクエスト数と応答時間
- データベースサイズ
- レプリケーション状態
- エラー率

### CLIでの接続確認

```bash
# Turso CLIで接続テスト
turso db show <database-name>

# レプリカ状態の確認
turso db locations list <database-name>

# 統計情報の表示
turso db inspect <database-name>
```

### アプリケーション側の監視

```typescript
// ヘルスチェック
async function checkDatabaseHealth() {
  const start = Date.now();
  try {
    await client.execute("SELECT 1");
    return {
      status: "healthy",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    };
  }
}
```

### サーバーレス固有のメトリクス

| メトリクス      | 説明               | 目標   | Turso優位性  |
| --------------- | ------------------ | ------ | ------------ |
| cold_start_rate | コールドスタート率 | < 10%  | 影響最小     |
| connection_time | 接続確立時間       | < 50ms | HTTPS軽量    |
| query_latency   | クエリ応答時間     | < 10ms | レプリカ使用 |
| sync_lag        | レプリカ同期遅延   | < 60s  | 自動管理     |

## チェックリスト

### セットアップ時

- [ ] TURSO_DATABASE_URLとTURSO_AUTH_TOKENを設定したか？
- [ ] 適切なクライアント（@libsql/client または @libsql/client/web）を使用しているか？
- [ ] グローバルスコープで接続を保持しているか？
- [ ] Edge環境では/webクライアントを使用しているか？

### パフォーマンス最適化時

- [ ] 組み込みレプリカの使用を検討したか？
- [ ] 読み取り頻度が高い場合、syncIntervalを調整したか？
- [ ] コールドスタート時間を測定したか？
- [ ] 最寄りのTursoリージョンを使用しているか？
