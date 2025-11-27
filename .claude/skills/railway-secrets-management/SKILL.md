---
name: railway-secrets-management
description: |
  Railway Secrets管理スキル。Railway環境グループ、Variables vs Secrets、
  Neon Plugin自動注入、Railway CLI統合、一時ファイルセキュリティを提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/railway-secrets-management/resources/railway-secrets-guide.md`: Railway Secrets 詳細ガイド

  使用タイミング:
  - RailwayプロジェクトのSecret管理を設計する時
  - Railway環境グループを設定する時
  - Neon Plugin自動注入を設定する時
  - Railway CLI経由のローカル開発を設定する時
  - Railway Logsセキュリティを確保する時

  Use when configuring Railway secrets, setting up environment groups,
  integrating Neon plugin, or securing Railway deployments.
version: 1.0.0
---

# Railway Secrets Management

## 概要

Railway は、環境変数を暗号化して保存し、デプロイ時にアプリケーションに注入する
Secrets 管理機能を提供します。このスキルは、Railway 固有の機能を最大限活用した
セキュアな Secret 管理を実現します。

## Railway Secrets vs Variables

### Secrets（機密情報）

**特徴**:

- 暗号化保存
- UI 上でマスク表示（\*\*\*）
- 監査ログ記録
- アクセス制限可能

**用途**:

- API キー（OPENAI_API_KEY、STRIPE_SECRET_KEY）
- データベースパスワード（DATABASE_URL）
- 暗号化キー（NEXTAUTH_SECRET）
- OAuth Client Secret
- Webhook URL（DISCORD_WEBHOOK_URL）

**設定方法**:

```
Railway Dashboard
→ Project
→ Environment (development/staging/production)
→ Variables
→ + New Variable
→ Variable name: OPENAI_API_KEY
→ Value: sk-proj-...
→ 🔒 Mark as secret（✅ チェック）
→ Add
```

### Variables（非機密設定）

**特徴**:

- 平文保存
- UI 上で表示可能
- 監査ログなし

**用途**:

- アプリケーション名（APP_NAME）
- ログレベル（LOG_LEVEL）
- 機能フラグ（ENABLE_FEATURE_X）
- 公開 URL（API_BASE_URL）
- ポート番号（PORT）

**重要**: 機密情報は必ず「Mark as secret」をチェック

## Railway 環境グループ管理

### 環境の作成

```
Railway Dashboard
→ Project
→ Environments
→ + New Environment
→ Name: staging
→ Create
```

### 環境別変数設定の推奨構成

```
Project: MyApp
│
├── 🏗️ Environment: development
│   ├── Service: web
│   └── Variables:
│       Secrets:
│       - OPENAI_API_KEY=sk-proj-dev-...
│       - NEXTAUTH_SECRET=<dev-secret>
│       Variables:
│       - NODE_ENV=development
│       - LOG_LEVEL=debug
│       Plugin (Neon):
│       - DATABASE_URL=<auto-injected>
│
├── 🧪 Environment: staging
│   ├── Service: web
│   └── Variables:
│       Secrets:
│       - OPENAI_API_KEY=sk-proj-staging-...
│       - NEXTAUTH_SECRET=<staging-secret>
│       Variables:
│       - NODE_ENV=staging
│       - LOG_LEVEL=info
│       Plugin (Neon):
│       - DATABASE_URL=<auto-injected>
│
└── 🚀 Environment: production
    ├── Service: web
    └── Variables:
        Secrets:
        - OPENAI_API_KEY=sk-proj-prod-...
        - NEXTAUTH_SECRET=<prod-secret-high-entropy>
        - DISCORD_WEBHOOK_URL=https://discord.com/...
        Variables:
        - NODE_ENV=production
        - LOG_LEVEL=warn
        Plugin (Neon):
        - DATABASE_URL=<auto-injected>
```

### Railway CLI での環境変数管理

```bash
# 環境選択
railway environment
# → development, staging, production から選択

# 変数一覧表示
railway variables

# 変数設定（現在の環境）
railway variables set API_KEY=sk-proj-key

# 変数削除
railway variables delete API_KEY

# JSON形式でエクスポート（⚠️ 非推奨）
railway variables --json > vars.json
# → 即座に削除すること: rm vars.json
```

## Neon Plugin 自動注入

### セットアップ

```
Railway Dashboard
→ Project
→ Plugins
→ Search: "Neon Postgres"
→ Add Plugin
→ Environment選択: development / staging / production
```

**自動注入される環境変数**:

```bash
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
DATABASE_PRIVATE_URL=postgresql://user:password@internal-xxx.neon.tech/dbname
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=dbname
POSTGRES_HOST=ep-xxx.neon.tech
```

**メリット**:

- 環境毎に自動分離（dev/staging/prod で別 DB インスタンス）
- 手動設定不要
- SSL/TLS 自動有効化
- Rotation 時の自動更新

**.env.example への記載**:

```bash
# Database（Neon Plugin自動注入）
# ローカル開発: railway run npm run dev で自動注入
# または docker-compose up でローカルPostgreSQL使用
DATABASE_URL=postgresql://user:password@localhost:5432/mydb_dev
```

## Railway CLI 統合

### ローカル開発フロー

**方法 1: railway run（推奨）**

```bash
# Railwayから環境変数を注入して実行
railway run npm run dev

# メリット:
# - ファイルに保存しない（メモリ内注入）
# - Git誤コミットリスクなし
# - 環境選択が明示的
```

**方法 2: ローカル.env（非推奨）**

```bash
# Railway Secretsをローカルファイルにダウンロード
railway variables --json | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env.local

# ⚠️ 警告:
# 1. .env.localを必ず.gitignoreに追加
# 2. 作業終了後は即座に削除
# 3. 本番環境のSecretは絶対にダウンロードしない

# 使用後は即座に削除
rm .env.local
```

### Railway Token セキュリティ

**Token 取得**:

```
Railway Dashboard
→ Account Settings
→ Tokens
→ Create Token
→ Name: "GitHub Actions Deploy"
→ Scope: Project単位（推奨）
→ Permissions: "Deploy only"
→ Expiration: 90日後
→ Create
```

**Token 保存**（GitHub Secrets）:

```
GitHub Repo
→ Settings
→ Secrets and variables → Actions
→ New repository secret
→ Name: RAILWAY_TOKEN
→ Value: <Railwayで生成したToken>
→ Add secret
```

**Rotation（90 日毎）**:

```bash
# 1. Railway Dashboardで新Token生成
# 2. GitHub SecretsのRAILWAY_TOKENを更新
# 3. Railway Dashboardで旧Tokenを Revoke
# 4. GitHub Actionsでデプロイテスト実行
```

## Railway Logs セキュリティ

### ログへの Secret 露出防止

```typescript
// ❌ 危険: SecretをログにNO出力
console.log("API Key:", process.env.OPENAI_API_KEY);
// Railway Logs に露出！

// ✅ 安全: Secretをマスク
console.log("API Key: ***");

// ✅ 安全: 構造化ログでSecretを除外
logger.info({
  event: "api_call",
  endpoint: "/api/chat",
  // api_key は含めない
  user_id: userId,
  timestamp: new Date(),
});
```

### Railway Logs での事後確認

```
Railway Dashboard
→ Project
→ Deployments
→ View Logs
→ Search機能で検索:
  - "sk-proj-"（OpenAI Key）
  - "sk_live_"（Stripe Key）
  - "password"
  - "secret"

→ 検出された場合:
  1. 即座にそのSecretをRotation
  2. ログ出力箇所を修正
  3. 再デプロイ
```

## 一時ファイルとセキュリティ

### /tmp ディレクトリの揮発性

**Railway の仕様**:

- `/tmp`ディレクトリは**再デプロイ時に完全削除**される
- 永続化が必要なデータは外部ストレージ使用（S3、Cloudinary 等）

**Secret の一時保存禁止**:

```typescript
// ❌ 危険: Secretをファイルに保存
import fs from "fs";
fs.writeFileSync("/tmp/api-key.txt", process.env.API_KEY);

// ✅ 安全: Secretはメモリ内のみ
const apiKey = process.env.API_KEY;
// メモリ内変数として使用
```

### アップロードファイルのスキャン

```typescript
import { Readable } from "stream";

class UploadSecurityScanner {
  private secretPatterns = [
    /sk-proj-[a-zA-Z0-9]{48}/, // OpenAI
    /sk_live_[0-9a-zA-Z]{24,}/, // Stripe
    /-----BEGIN .* PRIVATE KEY-----/, // Private Key
    /AKIA[0-9A-Z]{16}/, // AWS Access Key
  ];

  async scanFile(file: File): Promise<void> {
    const content = await file.text();

    for (const pattern of this.secretPatterns) {
      if (pattern.test(content)) {
        throw new Error(
          "Uploaded file contains potential secret - upload rejected"
        );
      }
    }
  }
}

// Uploadエンドポイントで使用
app.post("/api/upload", async (req, res) => {
  const file = req.file;

  // Secret スキャン
  await scanner.scanFile(file);

  // スキャン通過後のみ処理
  await processUpload(file);
});
```

## デプロイ戦略

### Blue-Green Deployment

```
Railway環境設定:

production-blue（現行）
  - DATABASE_URL=<Neon Prod DB>
  - API_KEY=<Current Key>
  - Status: Primary

production-green（新バージョン）
  - DATABASE_URL=<Neon Prod DB>（同じDB）
  - API_KEY=<New Key>（Rotation時）
  - Status: Inactive

切り替え手順:
1. production-greenにデプロイ
2. ヘルスチェック実行
3. Railway Dashboard → Set as primary
4. トラフィック切り替え
5. production-blueを監視期間保持
```

### ローリングアップデート（Secret Rotation 時）

```bash
# Phase 1: 新Secretを追加
railway variables set API_KEY_NEW=sk-proj-new-key

# Phase 2: アプリケーションコードを更新（新旧両方試行）
git push origin main

# Phase 3: 新Secretに完全移行確認
railway logs --tail

# Phase 4: 旧Secretを削除
railway variables delete API_KEY_OLD
```

## 実装チェックリスト

### Railway 設定

- [ ] すべての機密情報が「Mark as secret」されているか？
- [ ] 環境グループが 3 つ設定されているか？（dev/staging/prod）
- [ ] Neon Plugin が各環境に設定されているか？
- [ ] Variables（非機密）と Secrets（機密）が適切に分類されているか？

### Railway CLI

- [ ] Railway Token が安全に保管されているか？（GitHub Secrets）
- [ ] Token 権限が最小化されているか？（Deploy only）
- [ ] Token の Rotation スケジュールがあるか？（90 日）
- [ ] `railway variables`でダウンロードしたファイルが即座に削除されるか？

### ログセキュリティ

- [ ] ログ出力に Secret が含まれないか？
- [ ] Railway Logs で定期的に Secret 露出をチェックしているか？
- [ ] 構造化ログで Secret フィールドが除外されているか？

### 一時ファイル

- [ ] /tmp ディレクトリへの Secret 保存を避けているか？
- [ ] アップロードファイルがスキャンされているか？
- [ ] 永続化が必要なデータは外部ストレージ使用か？

## 関連スキル

- `.claude/skills/github-actions-security/SKILL.md` - GitHub Actions 統合
- `.claude/skills/environment-isolation/SKILL.md` - 環境分離戦略
- `.claude/skills/secret-management-architecture/SKILL.md` - Secret 管理アーキテクチャ

## リソースファイル

- `resources/railway-secrets-guide.md` - Railway Secrets 詳細ガイド
