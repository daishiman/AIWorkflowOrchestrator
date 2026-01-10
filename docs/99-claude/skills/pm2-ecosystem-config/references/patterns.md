# PM2 設定パターン集

## 実行モード選択

### 判断フローチャート

```
アプリケーション特性は？
├─ I/O bound（DB、API呼び出し多い）
│  └─ clusterモード推奨
│     - instances: CPU数-1 または "max"
│     - exec_mode: "cluster"
│
└─ CPU bound（計算処理多い）
   └─ forkモード推奨
      - instances: 1
      - exec_mode: "fork"
```

### I/O boundアプリケーション

**特徴**:

- データベースクエリが多い
- 外部API呼び出しが多い
- ファイルI/Oが多い
- ネットワーク通信が主体

**推奨設定**:

```javascript
{
  name: "api-server",
  script: "./dist/api/index.js",
  exec_mode: "cluster",
  instances: "max",  // または CPU数-1
  max_memory_restart: "500M",
  autorestart: true,
  min_uptime: "10s",
  max_restarts: 10
}
```

**メリット**:

- 複数プロセスで並行処理
- 高スループット
- ゼロダウンタイムデプロイ（pm2 reload）

**注意点**:

- セッション管理は外部ストア（Redis等）が必要
- プロセス間で状態を共有できない

### CPU boundアプリケーション

**特徴**:

- 画像処理、動画エンコード
- 暗号化、ハッシュ計算
- データ集計、統計計算
- 機械学習推論

**推奨設定**:

```javascript
{
  name: "worker",
  script: "./dist/worker/index.js",
  exec_mode: "fork",
  instances: 1,
  max_memory_restart: "1G",
  autorestart: true,
  min_uptime: "30s",
  max_restarts: 5
}
```

**メリット**:

- シンプルな構成
- プロセス間通信不要
- デバッグが容易

**注意点**:

- 単一プロセスのためスケーラビリティが限定的
- CPU集約的処理は別プロセスまたはWorker Threadsに分離推奨

## 環境変数管理

### 階層設計パターン

#### パターン1: 設定ファイル内で完結

```javascript
module.exports = {
  apps: [
    {
      name: "my-app",
      script: "./dist/index.js",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        LOG_LEVEL: "debug",
        DATABASE_HOST: "localhost",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
        LOG_LEVEL: "info",
        DATABASE_HOST: "prod-db.example.com",
      },
    },
  ],
};
```

**用途**: 小規模アプリ、環境変数が少ない場合

#### パターン2: .envファイル分離

```javascript
// .env.development
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DATABASE_URL=postgres://localhost/myapp_dev
API_KEY=dev-key-12345

// .env.production
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
DATABASE_URL=postgres://prod-server/myapp
API_KEY=prod-key-67890
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "my-app",
      script: "./dist/index.js",
      env_file: ".env.development",
      env_production_file: ".env.production",
    },
  ],
};
```

**用途**: 中〜大規模アプリ、機密情報の管理

**注意点**: .env.productionは.gitignoreに追加

#### パターン3: 環境変数のレイヤー分離

```javascript
// ecosystem.config.js
const commonEnv = {
  LOG_FORMAT: "json",
  TIMEZONE: "Asia/Tokyo",
};

const developmentEnv = {
  ...commonEnv,
  NODE_ENV: "development",
  PORT: 3000,
  LOG_LEVEL: "debug",
};

const productionEnv = {
  ...commonEnv,
  NODE_ENV: "production",
  PORT: 8080,
  LOG_LEVEL: "info",
};

module.exports = {
  apps: [
    {
      name: "my-app",
      script: "./dist/index.js",
      env: developmentEnv,
      env_production: productionEnv,
    },
  ],
};
```

**用途**: 複雑な環境設定、DRY原則の適用

### 機密情報の外部化パターン

#### システム環境変数からの読み込み

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "my-app",
      script: "./dist/index.js",
      env_production: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL,
        API_KEY: process.env.API_KEY,
        SECRET_KEY: process.env.SECRET_KEY,
      },
    },
  ],
};
```

```bash
# デプロイ前に環境変数を設定
export DATABASE_URL="postgres://prod-server/myapp"
export API_KEY="prod-key-67890"
export SECRET_KEY="super-secret-key"

pm2 start ecosystem.config.js --env production
```

**用途**: CI/CD環境、コンテナ環境

#### シークレット管理サービス利用

```javascript
// ecosystem.config.js
const AWS = require("aws-sdk");
const secretsManager = new AWS.SecretsManager();

async function getSecrets() {
  const data = await secretsManager
    .getSecretValue({ SecretId: "myapp/production" })
    .promise();
  return JSON.parse(data.SecretString);
}

module.exports = async () => {
  const secrets = await getSecrets();

  return {
    apps: [
      {
        name: "my-app",
        script: "./dist/index.js",
        env_production: {
          NODE_ENV: "production",
          ...secrets,
        },
      },
    ],
  };
};
```

**用途**: 高セキュリティ要件、AWS Secrets Manager、HashiCorp Vault等

## 再起動戦略

### 戦略1: 保守的再起動（安定性重視）

```javascript
{
  autorestart: true,
  max_restarts: 5,          // 再起動回数を制限
  min_uptime: "30s",        // 起動成功判定を厳しく
  restart_delay: 5000,      // 再起動間隔を長く
  exp_backoff_restart_delay: 1000  // 指数バックオフ
}
```

**用途**: 本番環境、重要なサービス

**メリット**: 連続再起動を防ぎ、問題を早期検出

**デメリット**: 一時的な問題でもサービスが停止する可能性

### 戦略2: 積極的再起動（可用性重視）

```javascript
{
  autorestart: true,
  max_restarts: 15,         // 再起動回数を多めに
  min_uptime: "5s",         // 起動成功判定を緩く
  restart_delay: 1000,      // 再起動間隔を短く
  max_memory_restart: "500M"
}
```

**用途**: 開発環境、一時的な問題が多い環境

**メリット**: 高い可用性、一時的な問題からの自動復旧

**デメリット**: 根本的な問題が隠蔽される可能性

### 戦略3: メモリ管理重視

```javascript
{
  autorestart: true,
  max_memory_restart: "500M",  // メモリ上限で再起動
  min_uptime: "10s",
  max_restarts: 10,
  kill_timeout: 5000,          // 強制終了までの待機時間
  listen_timeout: 8000,        // 起動タイムアウト
  wait_ready: true             // ready信号を待つ
}
```

**用途**: メモリリークの懸念があるアプリ

**メリット**: メモリリークによる影響を最小化

**デメリット**: 頻繁な再起動が発生する可能性

### 戦略4: グレースフルシャットダウン

```javascript
{
  autorestart: true,
  kill_timeout: 30000,      // 長めの猶予期間
  wait_ready: true,
  listen_timeout: 15000,
  shutdown_with_message: true
}
```

**アプリケーション側の実装**:

```javascript
// index.js
process.on("SIGINT", async () => {
  console.log("Received SIGINT, graceful shutdown...");

  // 新規リクエストの受付停止
  server.close(() => {
    console.log("Server closed");
  });

  // 処理中のリクエストの完了を待つ
  await waitForActiveRequests();

  // データベース接続のクローズ
  await db.close();

  console.log("Shutdown complete");
  process.exit(0);
});

// 起動完了をPM2に通知
process.send("ready");
```

**用途**: 長期接続、WebSocket、トランザクション処理

**メリット**: データ損失を防ぐ、クライアントへの影響を最小化

## クラスタモード最適化

### instances数の決定

#### パターン1: 保守的設定

```javascript
{
  exec_mode: "cluster",
  instances: Math.max(require('os').cpus().length - 1, 1)
}
```

**推奨**: 本番環境の初期設定

**理由**: システムの余裕を残し、他のプロセスへの影響を最小化

#### パターン2: 最大利用

```javascript
{
  exec_mode: "cluster",
  instances: "max"  // すべてのCPUコアを利用
}
```

**推奨**: 高負荷環境、専用サーバー

**理由**: 最大限のスループットを実現

#### パターン3: 固定数

```javascript
{
  exec_mode: "cluster",
  instances: 4  // 固定値
}
```

**推奨**: 負荷テスト後の最適値が明確な場合

**理由**: 予測可能なリソース使用

### 負荷テストによる最適化

```bash
# Apache Benchで負荷テスト
ab -n 10000 -c 100 http://localhost:8080/api/test

# instances=1の結果
Requests per second: 500
Time per request: 200ms

# instances=2の結果
Requests per second: 900
Time per request: 111ms

# instances=4の結果
Requests per second: 1500
Time per request: 67ms

# instances=8の結果
Requests per second: 1600
Time per request: 62ms
```

**結論**: instances=4が最適（それ以上は効果が頭打ち）

## メモリ管理パターン

### パターン1: 固定上限

```javascript
{
  max_memory_restart: "500M";
}
```

**用途**: メモリ使用量が予測可能なアプリ

**設定方法**: 通常時のメモリ使用量の1.5-2倍

### パターン2: 動的調整

```javascript
{
  max_memory_restart: process.env.NODE_ENV === "production" ? "1G" : "500M";
}
```

**用途**: 環境によってメモリ容量が異なる場合

### パターン3: メモリリーク対策

```javascript
{
  max_memory_restart: "500M",
  cron_restart: "0 4 * * *"  // 毎日4時に再起動
}
```

**用途**: メモリリークが疑われるが、即座の修正が困難な場合

**注意**: 根本的な解決にはならないため、並行してメモリリーク調査を実施

## パフォーマンス最適化パターン

### パターン1: ゼロダウンタイムデプロイ

```javascript
{
  exec_mode: "cluster",
  instances: 4,
  kill_timeout: 5000,
  wait_ready: true,
  listen_timeout: 8000
}
```

```bash
# デプロイ
pm2 reload ecosystem.config.js
# プロセスを1つずつ再起動し、ダウンタイムを回避
```

### パターン2: 複数アプリケーション管理

```javascript
module.exports = {
  apps: [
    {
      name: "api-server",
      script: "./dist/api/index.js",
      exec_mode: "cluster",
      instances: "max",
    },
    {
      name: "worker",
      script: "./dist/worker/index.js",
      exec_mode: "fork",
      instances: 1,
      cron_restart: "0 0 * * *",
    },
    {
      name: "scheduler",
      script: "./dist/scheduler/index.js",
      exec_mode: "fork",
      instances: 1,
    },
  ],
};
```

### パターン3: ロードバランシング統合

```javascript
// Nginx との統合
{
  exec_mode: "cluster",
  instances: 4,
  env_production: {
    PORT: 8080  // Nginxがリバースプロキシ
  }
}
```

```nginx
# nginx.conf
upstream nodejs_backend {
  least_conn;
  server localhost:8080;
}

server {
  listen 80;
  location / {
    proxy_pass http://nodejs_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## トラブルシューティングパターン

### メモリリーク検出

```bash
# メモリ使用量の推移を監視
pm2 show my-app

# ヒープスナップショット取得
node --inspect ./dist/index.js
# Chrome DevToolsで接続し、Heap Snapshotを取得
```

### ログ分析

```bash
# エラーログのみ表示
pm2 logs my-app --err

# 特定パターンを検索
pm2 logs my-app | grep "ERROR"

# 最新100行を表示
pm2 logs my-app --lines 100
```

### パフォーマンス分析

```bash
# リアルタイム監視
pm2 monit

# 詳細メトリクス
pm2 show my-app
```

## ベストプラクティス一覧

1. **実行モード**: アプリケーション特性に応じて選択
2. **instances数**: CPU数-1から開始し、負荷テストで調整
3. **メモリ制限**: max_memory_restartを必ず設定
4. **環境変数**: 機密情報は外部化
5. **ログ管理**: pm2-logrotateで自動ローテーション
6. **再起動戦略**: 環境に応じた適切な設定
7. **監視**: 継続的なモニタリングとアラート
8. **デプロイ**: clusterモードでpm2 reloadを使用
9. **バックアップ**: 設定ファイルのバージョン管理
10. **テスト**: 負荷テストで最適値を測定
