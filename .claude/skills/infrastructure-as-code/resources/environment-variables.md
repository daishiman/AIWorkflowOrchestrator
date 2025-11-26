# 環境変数設計パターン

## 環境変数の分類

### 1. 機密情報 (Secrets)

外部に漏洩してはならない情報。

| 変数名 | 用途 | 管理場所 |
|--------|------|---------|
| `DATABASE_URL` | DB接続文字列 | Railway (Neon Plugin) |
| `OPENAI_API_KEY` | OpenAI API | Railway Secrets |
| `ANTHROPIC_API_KEY` | Anthropic API | Railway Secrets |
| `DISCORD_TOKEN` | Discordボット | Railway Secrets |
| `DISCORD_WEBHOOK_URL` | Webhook通知 | GitHub Secrets |

### 2. 環境固有設定 (Environment-Specific)

環境ごとに異なる設定値。

| 変数名 | 開発 | ステージング | 本番 |
|--------|------|-------------|------|
| `NODE_ENV` | development | staging | production |
| `API_BASE_URL` | localhost | staging.app.com | app.com |
| `LOG_LEVEL` | debug | info | warn |

### 3. 共通設定 (Common)

全環境で同一の設定。

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `TZ` | UTC | タイムゾーン |
| `PORT` | 3000 | アプリケーションポート |

## 命名規則

### 基本ルール

```
UPPER_SNAKE_CASE を使用
例: DATABASE_URL, API_KEY, NODE_ENV
```

### プレフィックス

| プレフィックス | 用途 | 例 |
|---------------|------|-----|
| `DB_` | データベース関連 | `DB_HOST`, `DB_PORT` |
| `DISCORD_` | Discord関連 | `DISCORD_TOKEN`, `DISCORD_CLIENT_ID` |
| `OPENAI_` | OpenAI関連 | `OPENAI_API_KEY` |
| `NEXT_PUBLIC_` | クライアント公開 | `NEXT_PUBLIC_API_URL` |

### Next.js の特殊変数

```
# サーバーサイドのみ（デフォルト）
API_SECRET_KEY=xxx

# クライアントに公開
NEXT_PUBLIC_API_URL=https://api.example.com
```

⚠️ `NEXT_PUBLIC_` プレフィックスはビルド時にバンドルされる

## 管理場所の選択

### GitHub Secrets

**用途**: CI/CDワークフロー用

```yaml
# .github/workflows/deploy.yml
env:
  DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

**設定場所**:
```
Repository → Settings → Secrets and variables → Actions
```

### Railway Variables

**用途**: アプリケーション実行時

```bash
# CLI で設定
railway variables set API_KEY=xxx

# 確認
railway variables
```

**設定場所**:
```
Railway Dashboard → Service → Variables
```

### Railway Plugins

**用途**: 統合サービス（自動注入）

```
Neon Plugin → DATABASE_URL を自動設定
```

### .env ファイル（ローカル開発）

```bash
# .env.local（Gitに含めない）
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
```

## 環境変数テンプレート

### .env.example

```bash
# ===========================================
# Database (Neon Plugin で自動設定)
# ===========================================
DATABASE_URL=postgresql://user:password@host:5432/dbname

# ===========================================
# AI API Keys
# ===========================================
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# ===========================================
# Discord
# ===========================================
DISCORD_TOKEN=your-discord-bot-token
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx

# ===========================================
# Application
# ===========================================
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# ===========================================
# Next.js Public (クライアントに公開される)
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Railway CLI による環境同期

### 環境変数の確認

```bash
# プロジェクトの環境変数一覧
railway variables

# 特定の変数を確認
railway variables get DATABASE_URL
```

### 環境変数をロードしてローカル実行

```bash
# Railway環境変数でローカルサーバー起動
railway run pnpm dev

# 特定のコマンドを実行
railway run node scripts/seed.js
```

### 環境変数の設定

```bash
# 単一変数
railway variables set LOG_LEVEL=info

# 複数変数
railway variables set KEY1=value1 KEY2=value2
```

## 環境差分の最小化

### 戦略1: 環境変数による切り替え

```typescript
// config.ts
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'debug',
};
```

### 戦略2: 環境別設定ファイル

```
config/
├── default.json      # 共通設定
├── development.json  # 開発環境
├── staging.json      # ステージング
└── production.json   # 本番
```

### 戦略3: Railway 環境の活用

```
Railway Project
├── Production (main ブランチ)
│   └── Variables: NODE_ENV=production
└── Staging (develop ブランチ)
    └── Variables: NODE_ENV=staging
```

## セキュリティ考慮事項

### やるべきこと

1. **Secretは環境変数で注入**:
   ```typescript
   const apiKey = process.env.API_KEY;
   ```

2. **.gitignore に追加**:
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

3. **.env.example でドキュメント化**:
   ```bash
   # ダミー値または説明を記載
   API_KEY=your-api-key-here
   ```

### やってはいけないこと

1. **コードにハードコード**:
   ```typescript
   // ❌ 絶対にやらない
   const apiKey = "sk-1234567890";
   ```

2. **ログに出力**:
   ```typescript
   // ❌ 危険
   console.log(`API Key: ${process.env.API_KEY}`);
   ```

3. **URLパラメータに含める**:
   ```typescript
   // ❌ 危険
   fetch(`/api?key=${apiKey}`);
   ```

## 検証チェックリスト

- [ ] すべての必須変数が設定されているか？
- [ ] 機密情報がコードにハードコードされていないか？
- [ ] .env.example が最新か？
- [ ] 環境ごとの変数が適切に分離されているか？
- [ ] NEXT_PUBLIC_ の使用が適切か？
