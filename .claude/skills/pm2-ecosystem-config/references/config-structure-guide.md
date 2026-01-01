# PM2 設定構造ガイド

## ecosystem.config.js 基本構造

```javascript
module.exports = {
  apps: [
    {
      // === 必須項目 ===
      name: "app-name",
      script: "./dist/index.js",

      // === 推奨項目 ===
      cwd: "./",
      exec_mode: "fork",
      instances: 1,

      // === 再起動設定 ===
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 1000,

      // === ログ設定 ===
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // === 監視設定 ===
      max_memory_restart: "500M",
      kill_timeout: 5000,

      // === 環境設定 ===
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

## 項目詳細

### 必須項目

| 項目   | 型     | 説明             | 例                  |
| ------ | ------ | ---------------- | ------------------- |
| name   | string | プロセス識別名   | `'my-api'`          |
| script | string | 実行ファイルパス | `'./dist/index.js'` |

### 実行設定

| 項目        | 型            | デフォルト | 説明                    |
| ----------- | ------------- | ---------- | ----------------------- |
| cwd         | string        | カレント   | 作業ディレクトリ        |
| exec_mode   | string        | `'fork'`   | `'fork'` or `'cluster'` |
| instances   | number/string | 1          | インスタンス数          |
| args        | string/array  | -          | コマンドライン引数      |
| node_args   | string/array  | -          | Node.js引数             |
| interpreter | string        | `'node'`   | インタプリタ            |

### 再起動設定

| 項目                      | 型            | デフォルト | 説明             |
| ------------------------- | ------------- | ---------- | ---------------- |
| autorestart               | boolean       | true       | 自動再起動       |
| max_restarts              | number        | 15         | 最大再起動回数   |
| min_uptime                | string/number | `'1s'`     | 起動成功判定時間 |
| restart_delay             | number        | 0          | 再起動間隔(ms)   |
| exp_backoff_restart_delay | number        | -          | 指数バックオフ   |

### ログ設定

| 項目            | 型      | デフォルト     | 説明               |
| --------------- | ------- | -------------- | ------------------ |
| error_file      | string  | `~/.pm2/logs/` | エラーログパス     |
| out_file        | string  | `~/.pm2/logs/` | 標準出力ログパス   |
| log_date_format | string  | -              | タイムスタンプ形式 |
| merge_logs      | boolean | false          | ログ統合           |
| combine_logs    | boolean | false          | 同一ファイル出力   |

### 監視設定

| 項目               | 型      | デフォルト | 説明             |
| ------------------ | ------- | ---------- | ---------------- |
| max_memory_restart | string  | -          | メモリ上限再起動 |
| kill_timeout       | number  | 1600       | 強制終了待機(ms) |
| listen_timeout     | number  | 8000       | 起動タイムアウト |
| wait_ready         | boolean | false      | ready信号待機    |

### 開発環境設定

| 項目          | 型            | デフォルト | 説明             |
| ------------- | ------------- | ---------- | ---------------- |
| watch         | boolean/array | false      | ファイル監視     |
| ignore_watch  | array         | -          | 監視除外パターン |
| watch_options | object        | -          | 監視オプション   |

## 複数アプリケーション設定

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
    },
    {
      name: "scheduler",
      script: "./dist/scheduler/index.js",
      exec_mode: "fork",
      cron_restart: "0 0 * * *",
    },
  ],
};
```

## 命名規則

**推奨パターン**:

```
{project}-{component}
{project}-{component}-{environment}
```

**例**:

- `myapp-api`
- `myapp-worker`
- `myapp-api-prod`

## 設定のバリデーション

```bash
# JavaScript構文チェック
node -c ecosystem.config.js

# PM2による検証
pm2 start ecosystem.config.js --dry-run

# 起動テスト
pm2 start ecosystem.config.js
pm2 list
pm2 stop all
```
