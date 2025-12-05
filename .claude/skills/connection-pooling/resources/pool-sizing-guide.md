# Turso/libSQL 接続管理ガイド

## 基本原則

### libSQLの接続モデル

libSQLはSQLiteベースのため、従来のPostgreSQLのような接続プール管理は不要です。
代わりに、以下の2つの接続モデルがあります：

```
1. リモート接続（Turso Cloud）
   - HTTPSベースの接続
   - 接続プール不要
   - 自動スケーリング

2. Embedded Replicas
   - ローカルSQLiteファイル
   - クラウドとの双方向同期
   - ネットワーク不要で高速
```

### サーバーレス環境での考慮

サーバーレスでは、Embedded Replicasが推奨されます：

```
読み取り: ローカルファイル（超高速）
書き込み: ローカル → クラウドへ非同期同期
```

**Tursoの場合**:

- 同時接続数の制限なし（Embedded Replicas使用時）
- クラウド接続: 自動スケーリング
- 同期は非同期で実行

## 環境別設定

### 開発環境

```typescript
import { createClient } from "@libsql/client";

// ローカルファイルのみ（同期なし）
const devClient = createClient({
  url: "file:dev.db",
});
```

**理由**:

- ローカルファイルで高速
- ネットワーク不要
- 開発に集中できる

### ステージング環境

```typescript
// Embedded Replicas（同期あり）
const stagingClient = createClient({
  url: "file:staging.db",
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 300, // 5分ごとに同期
});
```

**理由**:

- ローカル読み取りで高速
- クラウド同期でデータ永続化
- 本番に近い動作確認

### 本番環境

```typescript
// Embedded Replicas（頻繁な同期）
const prodClient = createClient({
  url: "file:prod.db",
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60, // 1分ごとに同期
  syncOnWrite: true, // 書き込み時に即座に同期
  readYourWrites: true, // 自分の書き込みを即座に読み取り
});
```

**理由**:

- 最高速の読み取りパフォーマンス
- 書き込みも即座に同期
- 高可用性と低レイテンシの両立

## 同期戦略の選択

### 定期同期（推奨）

```typescript
const client = createClient({
  url: "file:local.db",
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60, // 60秒ごとに同期
});
```

**特徴**:

- 定期的にクラウドと同期
- 読み取りは常にローカルから高速
- バッテリー効率的

**推奨用途**: 一般的なWebアプリケーション

### 書き込み時同期

```typescript
const client = createClient({
  url: "file:local.db",
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncOnWrite: true, // 書き込み時に即座に同期
});
```

**特徴**:

- 書き込み直後にクラウドへ同期
- データの永続性が高い
- やや書き込みレイテンシ増加

**推奨用途**: データ整合性が重要なアプリケーション

### 手動同期

```typescript
const client = createClient({
  url: "file:local.db",
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  // syncIntervalを指定しない
});

// 必要に応じて手動同期
await client.sync();
```

**特徴**:

- 完全なコントロール
- 最小限のネットワーク使用
- 同期タイミングを自由に制御

**推奨用途**: オフラインファーストアプリ、バッチ処理

## 設定例

### Webアプリケーション

```typescript
import { createClient } from "@libsql/client";

// Embedded Replicasで高速化
const client = createClient({
  url: "file:app.db",
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60, // 1分ごとに同期
  syncOnWrite: true, // 書き込み時に即座に同期
});

// 想定:
// - 同時ユーザー: 1000人
// - リクエスト/秒: 100
// - 平均クエリ時間: <1ms（ローカルSQLite）
//
// Embedded Replicasを使用するため、
// 接続数の心配は不要！
```

### サーバーレス（Lambda/Edge）

```typescript
// Lambda関数でEmbedded Replicasを使用
import { createClient } from "@libsql/client";

let client: any = null;

export const handler = async (event: any) => {
  // クライアントをキャッシュ
  if (!client) {
    client = createClient({
      url: "file:lambda.db",
      syncUrl: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  // ローカルファイルから超高速で読み取り
  const result = await client.execute("SELECT * FROM users");
  return result;
};

// メリット:
// - コールドスタート時もローカルファイルアクセスで高速
// - 接続プールの管理不要
// - 自動的にクラウドと同期
```

### マイクロサービス

```typescript
// 各サービスでEmbedded Replicasを使用
const serviceClient = createClient({
  url: "file:service.db",
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 30, // 30秒ごとに同期
});

// メリット:
// - サービス間で接続を共有する必要なし
// - 各サービスが独立したローカルレプリカを持つ
// - サービスのスケールアウトが容易
```

## 同期戦略の動的調整

### 負荷に応じた同期間隔の調整

```typescript
// 動的同期間隔調整
function adjustSyncInterval(metrics: {
  writeFrequency: number; // 書き込み頻度（回/分）
  networkLatency: number; // ネットワークレイテンシ（ms）
  dataFreshness: number; // 必要なデータ鮮度（秒）
}) {
  // 書き込みが頻繁な場合は同期間隔を短く
  if (metrics.writeFrequency > 10) {
    return { syncInterval: 30, syncOnWrite: true };
  }

  // レイテンシが高い場合は同期間隔を長く
  if (metrics.networkLatency > 200) {
    return { syncInterval: 300, syncOnWrite: false };
  }

  // データ鮮度要件に基づく調整
  return {
    syncInterval: Math.max(metrics.dataFreshness, 60),
    syncOnWrite: metrics.dataFreshness < 30,
  };
}
```

## 監視指標

### 監視すべきメトリクス

| メトリクス        | 説明                 | 閾値       |
| ----------------- | -------------------- | ---------- |
| sync_lag          | 同期遅延（秒）       | < 60       |
| sync_failures     | 同期失敗回数         | 0          |
| local_db_size     | ローカルDBサイズ     | -          |
| query_latency     | クエリレイテンシ     | < 10ms     |
| sync_bandwidth    | 同期帯域幅使用量     | -          |
| replica_freshness | レプリカの鮮度（秒） | < 同期間隔 |

### アラート設定例

```yaml
alerts:
  - name: high_sync_lag
    condition: sync_lag > 300
    severity: warning
    action: notify_team
    description: 同期遅延が5分を超えています

  - name: sync_failure
    condition: sync_failures > 3 in 10 minutes
    severity: critical
    action: notify_oncall
    description: 同期が連続で失敗しています

  - name: replica_stale
    condition: replica_freshness > sync_interval * 2
    severity: warning
    action: notify_team
    description: レプリカが古くなっています
```

## チェックリスト

### 初期設定時

- [ ] 環境タイプ（開発/ステージング/本番）を確認
- [ ] Turso DatabaseのURLとトークンを取得
- [ ] Embedded Replicasの使用を検討
- [ ] 同期間隔を設定
- [ ] 同期戦略を選択（定期/書き込み時/手動）

### パフォーマンス調整時

- [ ] 同期遅延を監視
- [ ] クエリレイテンシを確認
- [ ] ローカルDBサイズを確認
- [ ] 同期エラーを確認
- [ ] 必要に応じて同期間隔を調整

### 障害対応時

- [ ] 同期状態を確認
- [ ] ネットワーク接続を確認
- [ ] 認証トークンの有効性を確認
- [ ] ローカルDBの整合性を確認
- [ ] 必要に応じて手動同期を実行
