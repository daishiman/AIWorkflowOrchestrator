# PM2 環境変数管理ガイド

## 環境変数の階層

### 基本構造

```javascript
module.exports = {
  apps: [{
    name: 'my-app',
    script: './dist/index.js',

    // 共通設定（すべての環境）
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'debug'
    },

    // 本番環境
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080,
      LOG_LEVEL: 'info'
    },

    // ステージング環境
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3001,
      LOG_LEVEL: 'debug'
    }
  }]
};
```

### 起動コマンド

```bash
# 開発環境（env使用）
pm2 start ecosystem.config.js

# 本番環境
pm2 start ecosystem.config.js --env production

# ステージング環境
pm2 start ecosystem.config.js --env staging
```

## 機密情報の管理

### ❌ やってはいけない

```javascript
// 絶対にやらない
env_production: {
  DB_PASSWORD: 'secret123',
  API_KEY: 'sk-xxxxx'
}
```

### ✅ 推奨アプローチ

#### 方法1: .envファイル参照

```javascript
// ecosystem.config.js
require('dotenv').config();

module.exports = {
  apps: [{
    name: 'my-app',
    script: './dist/index.js',
    env: {
      DB_HOST: process.env.DB_HOST,
      DB_PASSWORD: process.env.DB_PASSWORD
    }
  }]
};
```

#### 方法2: 環境変数のシェル設定

```bash
# .bashrc or .zshrc
export DB_PASSWORD="secret"
export API_KEY="sk-xxxxx"
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: './dist/index.js'
    // 環境変数は自動継承
  }]
};
```

#### 方法3: env_file オプション

```javascript
module.exports = {
  apps: [{
    name: 'my-app',
    script: './dist/index.js',
    env_file: '.env.production'
  }]
};
```

## 環境変数の分類

### 設定変数

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 8080,
  LOG_LEVEL: 'info',
  TZ: 'Asia/Tokyo'
}
```

### パフォーマンス変数

```javascript
env: {
  NODE_OPTIONS: '--max-old-space-size=4096',
  UV_THREADPOOL_SIZE: 16
}
```

### アプリケーション変数

```javascript
env: {
  APP_NAME: 'my-service',
  APP_VERSION: '1.0.0',
  FEATURE_FLAG_NEW_UI: 'true'
}
```

## セキュリティガイドライン

### ファイルパーミッション

```bash
# .envファイルの権限設定
chmod 600 .env
chmod 600 .env.production

# 所有者のみ読み取り可能
```

### .gitignore設定

```gitignore
# 環境変数ファイル
.env
.env.local
.env.*.local
.env.production
.env.staging

# ただしテンプレートはコミット
!.env.example
```

### .env.example

```bash
# .env.example（コミット可）
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PASSWORD=<YOUR_PASSWORD_HERE>
API_KEY=<YOUR_API_KEY_HERE>
```

## 環境別設定パターン

### 開発/本番分離

```javascript
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  apps: [{
    name: isProduction ? 'app-prod' : 'app-dev',
    script: './dist/index.js',
    instances: isProduction ? 'max' : 1,
    exec_mode: isProduction ? 'cluster' : 'fork',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 動的設定読み込み

```javascript
const config = require('./config')[process.env.NODE_ENV || 'development'];

module.exports = {
  apps: [{
    name: 'app',
    script: './dist/index.js',
    env: config.env
  }]
};
```

## トラブルシューティング

### 環境変数が反映されない

```bash
# 再起動で反映
pm2 restart app --update-env

# または削除して再起動
pm2 delete app
pm2 start ecosystem.config.js --env production
```

### 環境変数の確認

```bash
# 現在の環境変数を表示
pm2 env <app-name>

# 詳細情報
pm2 describe <app-name>
```
