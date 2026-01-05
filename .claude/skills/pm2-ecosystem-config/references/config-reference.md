# PM2 設定オプション完全リファレンス

## 概要

ecosystem.config.jsで使用できる全設定オプションの完全なリファレンス。各オプションの型、デフォルト値、使用例を含む。

## 基本設定

### name

- **型**: `string`
- **必須**: ✅ Yes
- **デフォルト**: なし
- **説明**: プロセスの識別名。`pm2 list`で表示される。
- **例**: `"my-api"`, `"worker-01"`

### script

- **型**: `string`
- **必須**: ✅ Yes
- **デフォルト**: なし
- **説明**: 実行するファイルのパス（相対または絶対）
- **例**: `"./dist/index.js"`, `"/var/www/app/server.js"`

### cwd

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: カレントディレクトリ
- **説明**: 作業ディレクトリ（アプリケーションのベースパス）
- **例**: `"./"`, `"/var/www/app"`

## 実行設定

### exec_mode

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: `"fork"`
- **値**: `"fork"` | `"cluster"`
- **説明**: 実行モード。clusterモードは複数プロセスで負荷分散
- **例**: `"cluster"`

### instances

- **型**: `number` | `string`
- **必須**: ❌ No
- **デフォルト**: `1`
- **値**: 数値 | `"max"` | `"max-1"`
- **説明**: プロセス数。"max"はCPU数と同じ、"max-1"はCPU数-1
- **例**: `4`, `"max"`, `"max-1"`

### interpreter

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: `"node"`
- **説明**: インタプリタのパス
- **例**: `"node"`, `"/usr/bin/python3"`, `"bash"`

### interpreter_args

- **型**: `string` | `string[]`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: インタプリタに渡す引数
- **例**: `"--harmony"`, `["--experimental-modules", "--es-module-specifier-resolution=node"]`

### node_args

- **型**: `string` | `string[]`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: Node.jsに渡す引数（interpreter_argsのエイリアス）
- **例**: `"--max-old-space-size=4096"`

### args

- **型**: `string` | `string[]`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: スクリプトに渡すコマンドライン引数
- **例**: `"--port 8080"`, `["--config", "./config.json"]`

## 再起動設定

### autorestart

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `true`
- **説明**: クラッシュ時の自動再起動
- **例**: `true`

### max_restarts

- **型**: `number`
- **必須**: ❌ No
- **デフォルト**: `15`
- **説明**: min_uptime内での最大再起動回数。超えると再起動を停止
- **例**: `10`

### min_uptime

- **型**: `string` | `number`
- **必須**: ❌ No
- **デフォルト**: `"1s"`
- **説明**: 起動成功と判定する最小稼働時間。ミリ秒または文字列
- **例**: `"10s"`, `10000`

### restart_delay

- **型**: `number`
- **必須**: ❌ No
- **デフォルト**: `0`
- **説明**: 再起動間隔（ミリ秒）
- **例**: `1000`

### exp_backoff_restart_delay

- **型**: `number`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: 指数バックオフ再起動遅延（ミリ秒）。再起動のたびに遅延が増加
- **例**: `1000`

### max_memory_restart

- **型**: `string` | `number`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: メモリ上限。超えたら再起動。文字列（"500M", "1G"）または数値（バイト）
- **例**: `"500M"`, `"1G"`, `524288000`

### cron_restart

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: cron形式での定期再起動
- **例**: `"0 0 * * *"`（毎日深夜0時）

### kill_timeout

- **型**: `number`
- **必須**: ❌ No
- **デフォルト**: `1600`
- **説明**: SIGKILL送信までの待機時間（ミリ秒）
- **例**: `5000`

### listen_timeout

- **型**: `number`
- **必須**: ❌ No
- **デフォルト**: `8000`
- **説明**: 起動タイムアウト（ミリ秒）
- **例**: `15000`

### wait_ready

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `false`
- **説明**: アプリからの`process.send('ready')`を待つ
- **例**: `true`

### shutdown_with_message

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `false`
- **説明**: `process.send('shutdown')`でグレースフルシャットダウン
- **例**: `true`

## ログ設定

### error_file

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: `~/.pm2/logs/<app-name>-error.log`
- **説明**: エラーログのファイルパス
- **例**: `"./logs/error.log"`, `"/var/log/app/error.log"`

### out_file

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: `~/.pm2/logs/<app-name>-out.log`
- **説明**: 標準出力ログのファイルパス
- **例**: `"./logs/out.log"`, `"/var/log/app/out.log"`

### log_file

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: 標準出力とエラーを同じファイルに出力
- **例**: `"./logs/combined.log"`

### log_date_format

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: ログのタイムスタンプフォーマット
- **例**: `"YYYY-MM-DD HH:mm:ss Z"`, `"YYYY-MM-DD HH:mm:ss.SSS"`

### merge_logs

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `false`
- **説明**: clusterモードで全インスタンスのログを統合
- **例**: `true`

### combine_logs

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `false`
- **説明**: 標準出力とエラーを同じファイルに出力
- **例**: `true`

### disable_logs

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `false`
- **説明**: ログ出力を完全に無効化
- **例**: `false`

## 環境変数

### env

- **型**: `object`
- **必須**: ❌ No
- **デフォルト**: `{}`
- **説明**: デフォルト環境での環境変数
- **例**: `{ NODE_ENV: "development", PORT: 3000 }`

### env_production

- **型**: `object`
- **必須**: ❌ No
- **デフォルト**: `{}`
- **説明**: `--env production`時の環境変数
- **例**: `{ NODE_ENV: "production", PORT: 8080 }`

### env\_<environment>

- **型**: `object`
- **必須**: ❌ No
- **デフォルト**: `{}`
- **説明**: カスタム環境（`--env <environment>`）用の環境変数
- **例**: `env_staging: { NODE_ENV: "staging", PORT: 3001 }`

### env_file

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: 環境変数を読み込む.envファイルのパス
- **例**: `".env.development"`

## 監視設定

### watch

- **型**: `boolean` | `string[]`
- **必須**: ❌ No
- **デフォルト**: `false`
- **説明**: ファイル変更時の自動再起動。配列で監視対象を指定可能
- **例**: `true`, `["src", "config"]`

### ignore_watch

- **型**: `string[]`
- **必須**: ❌ No
- **デフォルト**: `["node_modules"]`
- **説明**: 監視から除外するパターン
- **例**: `["node_modules", "*.log", "tmp"]`

### watch_options

- **型**: `object`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: chokidarの監視オプション
- **例**: `{ persistent: true, ignoreInitial: true }`

## クラスタ設定

### exec_mode

→ 実行設定を参照

### instances

→ 実行設定を参照

### instance_var

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: `"NODE_APP_INSTANCE"`
- **説明**: インスタンスIDを格納する環境変数名
- **例**: `"INSTANCE_ID"`

### kill_retry_time

- **型**: `number`
- **必須**: ❌ No
- **デフォルト**: `100`
- **説明**: リロード時のリトライ間隔（ミリ秒）
- **例**: `500`

## ソース管理設定

### filter_env

- **型**: `string[]`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: 除外する環境変数のリスト
- **例**: `["DEBUG", "PRIVATE_KEY"]`

### source_map_support

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `false`
- **説明**: ソースマップサポートを有効化
- **例**: `true`

## 高度な設定

### vizion

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `true`
- **説明**: バージョン管理情報の追跡
- **例**: `false`

### post_update

- **型**: `string[]`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: デプロイ後に実行するコマンド
- **例**: `["npm install", "pm2 reload ecosystem.config.js"]`

### force

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `false`
- **説明**: 既存プロセスを強制的に上書き
- **例**: `true`

### time

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `false`
- **説明**: `pm2 logs`にタイムスタンプを表示
- **例**: `true`

### increment_var

- **型**: `string`
- **必須**: ❌ No
- **デフォルト**: なし
- **説明**: インクリメントする環境変数名
- **例**: `"PORT"`

### automation

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `true`
- **説明**: 自動化モード（対話的プロンプトを無効化）
- **例**: `false`

### treekill

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `true`
- **説明**: 子プロセスも含めてkill
- **例**: `false`

### pmx

- **型**: `boolean`
- **必須**: ❌ No
- **デフォルト**: `true`
- **説明**: PMXを有効化（PM2 Plus用）
- **例**: `false`

## 完全な設定例

```javascript
module.exports = {
  apps: [
    {
      // === 基本設定 ===
      name: "my-api",
      script: "./dist/index.js",
      cwd: "./",

      // === 実行設定 ===
      exec_mode: "cluster",
      instances: "max",
      interpreter: "node",
      node_args: "--max-old-space-size=4096",
      args: "--config ./config.json",

      // === 再起動設定 ===
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 1000,
      max_memory_restart: "500M",
      kill_timeout: 5000,
      listen_timeout: 8000,
      wait_ready: true,

      // === ログ設定 ===
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // === 環境変数 ===
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        LOG_LEVEL: "debug",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
        LOG_LEVEL: "info",
      },

      // === 監視設定（開発環境のみ） ===
      watch: false,
      ignore_watch: ["node_modules", "logs", "*.log"],

      // === その他 ===
      source_map_support: true,
      automation: true,
    },
  ],
};
```

## 設定のベストプラクティス

### 必須項目

- `name`: 必ず設定
- `script`: 必ず設定

### 推奨項目

- `instances`: clusterモードの場合は必ず設定
- `exec_mode`: 明示的に指定
- `max_memory_restart`: メモリリーク対策
- `error_file`, `out_file`: ログ管理
- `min_uptime`: 起動失敗の検出
- `max_restarts`: 無限再起動の防止

### 環境別設定

- 開発環境: `watch: true`, `LOG_LEVEL: "debug"`
- 本番環境: `watch: false`, `instances: "max"`, `LOG_LEVEL: "info"`

### セキュリティ

- 機密情報（APIキー、DBパスワード）は環境変数で外部化
- .envファイルは.gitignoreに追加
- 本番環境の設定ファイルは別管理

## トラブルシューティング

### 設定の検証

```bash
# JavaScript構文チェック
node -c ecosystem.config.js

# PM2による検証
pm2 start ecosystem.config.js --dry-run

# 設定の確認
pm2 show <app-name>
```

### よくあるエラー

**エラー**: `script not found`

- **原因**: scriptパスが間違っている
- **対処**: 相対パスまたは絶対パスを確認

**エラー**: `max_restarts exceeded`

- **原因**: 起動に失敗している
- **対処**: `pm2 logs`でエラーを確認、min_uptimeを調整

**エラー**: `cluster mode not working`

- **原因**: exec_modeが"fork"になっている
- **対処**: `exec_mode: "cluster"`を設定

## 参照

- PM2公式ドキュメント: https://pm2.keymetrics.io/docs/usage/application-declaration/
- PM2 GitHubリポジトリ: https://github.com/Unitech/pm2
