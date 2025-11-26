# PM2ログローテーションガイド

## pm2-logrotateモジュール

PM2公式のログローテーションモジュール。

### インストール

```bash
pm2 install pm2-logrotate
```

### 設定一覧

| 設定項目 | デフォルト | 説明 |
|---------|----------|------|
| max_size | 10M | ローテーション発生サイズ |
| retain | 30 | 保持するファイル数 |
| compress | false | gzip圧縮の有効化 |
| dateFormat | YYYY-MM-DD_HH-mm-ss | 日付フォーマット |
| rotateModule | true | PM2モジュールログもローテーション |
| workerInterval | 30 | チェック間隔（秒） |
| rotateInterval | 0 0 * * * | cronスタイルのローテーション間隔 |
| TZ | システムTZ | タイムゾーン |

### 設定コマンド

```bash
# 個別設定
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

# 設定確認
pm2 conf pm2-logrotate

# モジュール状態確認
pm2 describe pm2-logrotate
```

## ecosystem.config.jsでのログ設定

### 基本設定

```javascript
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'app.js',

    // ログファイルパス
    error_file: './logs/error.log',
    out_file: './logs/out.log',

    // 日付フォーマット
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // クラスターモードでログをマージ
    merge_logs: true,

    // JSONフォーマット
    log_type: 'json'
  }]
};
```

### 環境別設定

```javascript
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'app.js',

    // 共通設定
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // 環境別設定
    env_development: {
      error_file: '/dev/null',  // 開発時はコンソールのみ
      out_file: '/dev/null'
    },
    env_production: {
      error_file: '/var/log/myapp/error.log',
      out_file: '/var/log/myapp/out.log',
      merge_logs: true
    }
  }]
};
```

### ログ無効化

```javascript
// 特定のログを無効化
{
  error_file: '/dev/null',  // エラーログ無効
  out_file: '/dev/null',    // 標準出力ログ無効
  combine_logs: true        // stdout/stderrを統合
}
```

## ログディレクトリ構成

### 推奨構成

```
/var/log/myapp/
├── app/
│   ├── out.log           # 現在の標準出力
│   ├── out__2025-01-15.log
│   ├── out__2025-01-15.log.gz
│   ├── error.log         # 現在のエラー
│   └── error__2025-01-15.log.gz
├── pm2/
│   └── pm2.log           # PM2デーモンログ
└── audit/
    └── audit.json        # ローテーション監査
```

### ディレクトリ作成

```bash
# ログディレクトリ作成
mkdir -p /var/log/myapp/{app,pm2,audit}

# 権限設定
chown -R appuser:appuser /var/log/myapp
chmod -R 755 /var/log/myapp
```

## PM2ログコマンド

### ログ表示

```bash
# 全アプリのログをリアルタイム表示
pm2 logs

# 特定アプリのログ
pm2 logs my-app

# 直近N行を表示
pm2 logs --lines 100

# エラーログのみ
pm2 logs --err

# 標準出力のみ
pm2 logs --out

# タイムスタンプ付き
pm2 logs --timestamp

# JSON形式
pm2 logs --json
```

### ログ管理

```bash
# ログファイルをクリア
pm2 flush

# 特定アプリのログをクリア
pm2 flush my-app

# ログファイルを再オープン（ローテーション後）
pm2 reloadLogs
```

## 推奨設定パターン

### 開発環境

```bash
# 最小限の設定
pm2 set pm2-logrotate:max_size 5M
pm2 set pm2-logrotate:retain 3
pm2 set pm2-logrotate:compress false
```

### ステージング環境

```bash
# バランス設定
pm2 set pm2-logrotate:max_size 20M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
```

### 本番環境

```bash
# 厳格な設定
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
pm2 set pm2-logrotate:workerInterval 60
```

## トラブルシューティング

### pm2-logrotateが動作しない

```bash
# モジュール状態確認
pm2 describe pm2-logrotate

# モジュール再インストール
pm2 uninstall pm2-logrotate
pm2 install pm2-logrotate

# PM2再起動
pm2 update
```

### ログファイルの権限エラー

```bash
# ログディレクトリの権限確認
ls -la /var/log/myapp/

# 権限修正
sudo chown -R $(whoami):$(whoami) /var/log/myapp/
```

### ディスク容量不足

```bash
# 古いログを手動削除
find /var/log/myapp -name "*.gz" -mtime +30 -delete

# retain設定を減らす
pm2 set pm2-logrotate:retain 7
```

### ログがJSON形式にならない

```javascript
// ecosystem.config.jsで明示的に設定
{
  log_type: 'json'
}

// または、アプリケーション側でJSONロガーを使用
const logger = require('pino')();
logger.info({ event: 'startup' }, 'Application started');
```

## 監視設定

### ディスク使用量アラート

```bash
# cronで定期チェック
0 * * * * /usr/local/bin/check-log-disk.sh

# check-log-disk.sh
#!/bin/bash
USAGE=$(df /var/log | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$USAGE" -gt 80 ]; then
  echo "Log disk usage: ${USAGE}%" | mail -s "Disk Alert" admin@example.com
fi
```

### PM2メトリクス

```bash
# PM2 Plus（有料）でログメトリクス監視
pm2 plus

# または、カスタムメトリクス
pm2 monit
```
