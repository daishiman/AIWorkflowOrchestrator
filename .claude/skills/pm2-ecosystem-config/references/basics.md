# PM2 基礎知識

## PM2とは

PM2（Process Manager 2）は、Node.jsアプリケーションのプロセス管理ツール。本番環境での安定した運用を実現するため、プロセスの起動、停止、再起動、監視、ログ管理を提供する。

### 主要機能

- **プロセス管理**: アプリケーションの起動、停止、再起動
- **クラスタモード**: 複数プロセスでの負荷分散
- **自動再起動**: クラッシュ時の自動復旧
- **ログ管理**: 標準出力、エラー出力の集約
- **監視**: CPU、メモリ使用量のリアルタイム監視
- **環境管理**: 開発、本番環境の切り替え

## ecosystem.config.js とは

PM2の設定ファイル。アプリケーションのプロセス管理設定を集約し、再現可能なデプロイを実現する。

### 基本構造

```javascript
module.exports = {
  apps: [
    {
      // アプリケーション設定
      name: "my-app",
      script: "./dist/index.js",
      instances: 1,
      exec_mode: "fork",

      // 環境変数
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },

      // ログ設定
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",

      // 再起動設定
      max_memory_restart: "500M",
      autorestart: true,
    },
  ],
};
```

### 必須項目

| 項目   | 説明               | 例                  |
| ------ | ------------------ | ------------------- |
| name   | プロセス識別名     | `"my-api"`          |
| script | 実行ファイルのパス | `"./dist/index.js"` |

### 推奨項目

| 項目               | 説明               | デフォルト | 推奨値                  |
| ------------------ | ------------------ | ---------- | ----------------------- |
| instances          | プロセス数         | 1          | CPU数-1 または 1        |
| exec_mode          | 実行モード         | "fork"     | "fork" or "cluster"     |
| cwd                | 作業ディレクトリ   | カレント   | "./"                    |
| error_file         | エラーログパス     | -          | "./logs/error.log"      |
| out_file           | 標準出力ログパス   | -          | "./logs/out.log"        |
| log_date_format    | タイムスタンプ形式 | -          | "YYYY-MM-DD HH:mm:ss Z" |
| max_memory_restart | メモリ上限再起動   | -          | "500M"                  |
| autorestart        | 自動再起動         | true       | true                    |
| min_uptime         | 起動成功判定時間   | "1s"       | "10s"                   |
| max_restarts       | 最大再起動回数     | 15         | 10                      |

## PM2 基本コマンド

### 起動と停止

```bash
# 設定ファイルで起動
pm2 start ecosystem.config.js

# 本番環境で起動
pm2 start ecosystem.config.js --env production

# 特定のアプリのみ起動
pm2 start ecosystem.config.js --only my-app

# 停止
pm2 stop my-app
pm2 stop all

# 削除
pm2 delete my-app
pm2 delete all

# 再起動
pm2 restart my-app
pm2 reload my-app  # 無停止再起動（clusterモードのみ）
```

### 監視と確認

```bash
# プロセス一覧
pm2 list

# リアルタイム監視
pm2 monit

# 詳細情報
pm2 show my-app

# ログ表示
pm2 logs
pm2 logs my-app
pm2 logs my-app --lines 100
pm2 logs my-app --err  # エラーログのみ
```

### 管理

```bash
# 設定の保存（起動時の自動復元用）
pm2 save

# 起動スクリプト生成（OS起動時の自動起動）
pm2 startup

# キャッシュクリア
pm2 flush
```

## アプリケーション種別

### Web API / Web Server

- **特性**: HTTPリクエスト処理、I/O bound
- **推奨設定**:
  - exec_mode: "cluster"
  - instances: CPU数-1 または "max"
  - max_memory_restart: "500M"-"1G"

### バッチ処理 / Worker

- **特性**: 定期実行、CPU/メモリ集約的
- **推奨設定**:
  - exec_mode: "fork"
  - instances: 1
  - cron_restart: "0 0 \* \* \*" （必要に応じて）

### WebSocket / リアルタイム通信

- **特性**: 長期接続、状態保持
- **推奨設定**:
  - exec_mode: "fork" または "cluster"（セッション管理に注意）
  - instances: 1-2（状態管理の複雑さによる）
  - kill_timeout: 30000（長めに設定）

### Microservices

- **特性**: 独立したサービス群、分散システム
- **推奨設定**:
  - 複数のapps配列で各サービスを定義
  - exec_mode: サービスごとに最適化
  - instances: サービスごとに調整

## forkモード vs clusterモード

### forkモード

**特徴**:

- 単一プロセスで実行
- シンプルで理解しやすい
- プロセス間通信不要

**適用場面**:

- CPU boundアプリケーション
- 状態を保持する必要がある
- シングルプロセスで十分なパフォーマンス

### clusterモード

**特徴**:

- 複数プロセスで負荷分散
- Node.jsのclusterモジュールを利用
- 高可用性

**適用場面**:

- I/O boundアプリケーション（Web API等）
- 高スループットが必要
- ゼロダウンタイムデプロイが必要

## 環境変数管理

### env と env_production

```javascript
{
  env: {
    NODE_ENV: "development",
    PORT: 3000,
    LOG_LEVEL: "debug"
  },
  env_production: {
    NODE_ENV: "production",
    PORT: 8080,
    LOG_LEVEL: "info"
  }
}
```

### 外部ファイルからの読み込み

```javascript
// .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://localhost/myapp_dev

// .env.production
NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://prod-server/myapp
```

```javascript
// ecosystem.config.js
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

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

## ログ管理

### ログファイルの設定

```javascript
{
  error_file: "./logs/error.log",
  out_file: "./logs/out.log",
  log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  merge_logs: true,
  combine_logs: true
}
```

### ログローテーション

PM2のログは無制限に増大するため、pm2-logrotateモジュールの使用を推奨。

```bash
# pm2-logrotateのインストール
pm2 install pm2-logrotate

# 設定
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## トラブルシューティング

### よくある問題

**問題**: アプリが頻繁に再起動する

- **原因**: 起動失敗、メモリリーク、未処理エラー
- **対処**:
  - `pm2 logs`でエラーログを確認
  - min_uptimeを適切に設定
  - max_restartsで再起動回数を制限

**問題**: メモリ使用量が増加し続ける

- **原因**: メモリリーク
- **対処**:
  - max_memory_restartを設定
  - アプリケーションコードのメモリリーク調査

**問題**: clusterモードでセッションが失われる

- **原因**: セッション情報がメモリに保存され、プロセス間で共有されない
- **対処**:
  - Redisなど外部ストアでセッション管理
  - または forkモードに変更

**問題**: ログファイルが肥大化

- **原因**: ログローテーションの未設定
- **対処**:
  - pm2-logrotateをインストール
  - ログレベルを適切に設定

## ベストプラクティス

1. **設定ファイルのバージョン管理**: ecosystem.config.jsはGitで管理
2. **機密情報の外部化**: APIキー等は.envファイルで管理し、.gitignoreに追加
3. **適切なinstances数**: CPU数-1から開始し、負荷テストで調整
4. **メモリ制限の設定**: max_memory_restartを必ず設定
5. **ログローテーション**: pm2-logrotateで自動ローテーション
6. **監視の実施**: pm2 monitやAPMツールで継続的に監視
7. **ゼロダウンタイムデプロイ**: clusterモードでpm2 reloadを使用
