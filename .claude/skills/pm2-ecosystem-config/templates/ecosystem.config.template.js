/**
 * PM2 Ecosystem Configuration Template
 *
 * このテンプレートをコピーして、プロジェクトに合わせてカスタマイズしてください。
 *
 * 使用方法:
 *   cp .claude/skills/pm2-ecosystem-config/templates/ecosystem.config.template.js ./ecosystem.config.js
 *
 * 起動:
 *   pm2 start ecosystem.config.js                    # 開発環境
 *   pm2 start ecosystem.config.js --env production   # 本番環境
 *
 * 検証:
 *   node -c ecosystem.config.js                      # 構文チェック
 *   pm2 start ecosystem.config.js --dry-run          # PM2検証
 */

module.exports = {
  apps: [
    {
      // ═══════════════════════════════════════════════
      // 必須設定
      // ═══════════════════════════════════════════════

      // プロセス名: 説明的でユニークな名前
      // 命名規則: {project}-{component} 例: myapp-api, myapp-worker
      name: "{{APP_NAME}}",

      // エントリーポイント: ビルド成果物を指定
      // 例: './dist/index.js', './build/server.js'
      script: "./dist/index.js",

      // ═══════════════════════════════════════════════
      // 実行設定
      // ═══════════════════════════════════════════════

      // 作業ディレクトリ: プロジェクトルート
      cwd: "./",

      // 実行モード: 'fork' (単一) または 'cluster' (複数)
      // fork: I/O bound処理, ステートフル処理
      // cluster: CPU bound処理, HTTP/APIサーバー
      exec_mode: "fork",

      // インスタンス数:
      // 1: 単一インスタンス
      // 'max' または 0: CPUコア数
      // -1: CPUコア数 - 1
      instances: 1,

      // コマンドライン引数 (オプション)
      // args: '--port 3000',

      // Node.js引数 (オプション)
      // node_args: '--max-old-space-size=4096',

      // ═══════════════════════════════════════════════
      // 再起動設定
      // ═══════════════════════════════════════════════

      // 自動再起動: クラッシュ時に自動回復
      autorestart: true,

      // 最大再起動回数: 無限ループ防止 (推奨: 5-15)
      max_restarts: 10,

      // 最小稼働時間: 起動成功判定 (推奨: 5s-30s)
      // プロセスがこの時間以上稼働すれば起動成功
      min_uptime: "10s",

      // 再起動間隔 (ミリ秒): 即時再起動を避ける
      restart_delay: 1000,

      // 指数バックオフ: 連続失敗時に待機時間を増加 (オプション)
      // exp_backoff_restart_delay: 100,

      // ═══════════════════════════════════════════════
      // リソース管理
      // ═══════════════════════════════════════════════

      // メモリ上限: この値を超えると自動再起動
      // 例: '300M', '500M', '1G'
      max_memory_restart: "500M",

      // Graceful Shutdown待機時間 (ミリ秒)
      // SIGTERM送信後、強制終了までの待機時間
      kill_timeout: 5000,

      // 起動タイムアウト (ミリ秒): ポート待受の最大待機時間
      // listen_timeout: 8000,

      // ready信号待機: process.send('ready')を待つ
      // wait_ready: false,

      // ═══════════════════════════════════════════════
      // ログ設定
      // ═══════════════════════════════════════════════

      // エラーログパス: 相対パス推奨
      error_file: "./logs/error.log",

      // 標準出力ログパス: 相対パス推奨
      out_file: "./logs/out.log",

      // タイムスタンプ形式: ISO8601推奨
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // ログ統合: clusterモードで推奨
      merge_logs: true,

      // ═══════════════════════════════════════════════
      // 開発環境設定 (本番では無効化)
      // ═══════════════════════════════════════════════

      // ファイル監視: 変更時に自動再起動
      watch: false,

      // 監視除外パターン
      ignore_watch: ["node_modules", "logs", ".git", "*.log"],

      // ═══════════════════════════════════════════════
      // 環境変数
      // ═══════════════════════════════════════════════

      // 共通設定 (すべての環境)
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        LOG_LEVEL: "debug",
        TZ: "Asia/Tokyo",
      },

      // 本番環境 (--env production)
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
        LOG_LEVEL: "info",
      },

      // ステージング環境 (--env staging)
      env_staging: {
        NODE_ENV: "staging",
        PORT: 3001,
        LOG_LEVEL: "debug",
      },

      // ═══════════════════════════════════════════════
      // 高度な設定 (オプション)
      // ═══════════════════════════════════════════════

      // 定期再起動: cron形式 (メモリリーク対策)
      // cron_restart: '0 3 * * *',  // 毎日3時

      // ユーザー/グループ指定 (Linux)
      // user: 'app',
      // group: 'app',

      // 外部.envファイル参照
      // env_file: '.env.production',
    },

    // ═══════════════════════════════════════════════
    // 追加アプリケーション例
    // ═══════════════════════════════════════════════

    // {
    //   name: '{{APP_NAME}}-worker',
    //   script: './dist/worker.js',
    //   exec_mode: 'fork',
    //   instances: 1,
    //   // ... 上記と同様の設定
    // }
  ],
};
