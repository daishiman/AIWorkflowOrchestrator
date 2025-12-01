# Railway統合詳細

## Railwayとは

Railway は、アプリケーションを簡単にデプロイできるPaaS（Platform as a Service）。
Git統合により、プッシュするだけで自動デプロイが可能。

## railway.json 構成

### 基本構造

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 設定項目詳細

#### build セクション

| 項目 | 説明 | 例 |
|------|------|-----|
| `builder` | ビルダータイプ | `NIXPACKS`, `DOCKERFILE` |
| `buildCommand` | ビルドコマンド | `pnpm install && pnpm build` |
| `watchPatterns` | 変更監視パターン | `["src/**", "package.json"]` |

#### deploy セクション

| 項目 | 説明 | 例 |
|------|------|-----|
| `startCommand` | 起動コマンド | `pnpm start` |
| `restartPolicyType` | 再起動ポリシー | `ON_FAILURE`, `ALWAYS`, `NEVER` |
| `restartPolicyMaxRetries` | 最大リトライ回数 | `10` |
| `healthcheckPath` | ヘルスチェックパス | `/api/health` |
| `healthcheckTimeout` | タイムアウト秒数 | `30` |

### Next.js プロジェクト用設定

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Discord Bot プロジェクト用設定

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start:bot",
    "restartPolicyType": "ALWAYS"
  }
}
```

## Git統合

### 自動デプロイの仕組み

```
1. GitHub リポジトリにプッシュ
   ↓
2. Railway が変更を検出
   ↓
3. railway.json を読み込み
   ↓
4. buildCommand を実行
   ↓
5. startCommand でサービス起動
   ↓
6. ヘルスチェック（設定されている場合）
   ↓
7. トラフィックを新デプロイに切り替え
```

### ブランチデプロイ

```
main ブランチ → Production 環境
develop ブランチ → Staging 環境
```

**設定方法**:
```
Railway Dashboard → Service → Settings → Source
→ Branch の指定
```

## Railway CLI

### インストール

```bash
# macOS
brew install railway

# pnpm
pnpm i -g @railway/cli
```

### 認証

```bash
railway login
```

### プロジェクト操作

```bash
# プロジェクト一覧
railway list

# プロジェクト選択
railway link

# 現在の状態
railway status
```

### 環境変数操作

```bash
# 一覧表示
railway variables

# 変数取得
railway variables get DATABASE_URL

# 変数設定
railway variables set LOG_LEVEL=info

# 複数設定
railway variables set KEY1=value1 KEY2=value2
```

### ローカル開発

```bash
# Railway環境変数でコマンド実行
railway run pnpm dev

# 環境変数をロードしてシェル起動
railway shell
```

### ログ確認

```bash
# リアルタイムログ
railway logs

# 過去のログ
railway logs --limit 100
```

### デプロイ

```bash
# 手動デプロイ（通常はGit pushで自動）
railway up
```

## Neon Plugin 統合

### 設定方法

```
Railway Dashboard → Service → Plugins → Add Plugin → Neon
```

### 自動注入される変数

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### 接続プーリング

```
Neon Dashboard → Connection pooling → Enable
→ プーリングURLが DATABASE_URL に設定される
```

### マイグレーション実行

```bash
# Railway環境変数を使用してマイグレーション
railway run pnpm db:migrate

# または直接
railway run npx drizzle-kit push
```

## 環境（Environments）

### 環境の作成

```
Railway Dashboard → Project → Environments → New Environment
```

### 環境ごとの変数

```
Production:
  NODE_ENV=production
  LOG_LEVEL=warn

Staging:
  NODE_ENV=staging
  LOG_LEVEL=info
```

### 環境の切り替え（CLI）

```bash
# 環境一覧
railway environment list

# 環境切り替え
railway environment staging
```

## トラブルシューティング

### ビルド失敗

**症状**: Railwayでビルドが失敗する

**確認項目**:
1. buildCommand が正しいか
2. package.json の scripts が存在するか
3. 依存関係がすべて含まれているか

**解決策**:
```bash
# ローカルでビルドを確認
pnpm install --frozen-lockfile
pnpm build
```

### 起動失敗

**症状**: ビルドは成功するが起動しない

**確認項目**:
1. startCommand が正しいか
2. 環境変数が設定されているか
3. ポートが正しく設定されているか

**解決策**:
```bash
# ログを確認
railway logs

# 環境変数を確認
railway variables
```

### 環境変数が反映されない

**症状**: 設定した環境変数がアプリに反映されない

**確認項目**:
1. 変数名が正しいか
2. デプロイが完了しているか
3. ビルド時変数かランタイム変数か

**解決策**:
```bash
# 変数を確認
railway variables

# 再デプロイ
railway up
```

## ベストプラクティス

### railway.json をリポジトリに含める

```bash
git add railway.json
git commit -m "feat: Add Railway configuration"
```

### 環境変数は Railway で管理

```bash
# コードには含めない
# ✅ Railway Variables で設定
railway variables set API_KEY=xxx
```

### ヘルスチェックを設定

```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

### ログを活用

```bash
# デプロイ時は必ずログを確認
railway logs --follow
```

## 設定例: フルスタック Next.js

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm db:generate && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```
