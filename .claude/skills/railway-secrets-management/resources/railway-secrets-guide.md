# Railway Secrets 詳細ガイド

## Railway Secrets 概要

Railwayは、環境変数を暗号化して保存し、デプロイ時にアプリケーションに注入する
Secrets管理機能を提供します。

## Secrets vs Variables

### Secrets（機密情報）

**特徴**:
- 暗号化保存
- UI上でマスク表示（***）
- 監査ログ記録
- アクセス制限可能

**用途**:
- APIキー
- データベースパスワード
- 暗号化キー
- OAuth Client Secret

**設定方法**:
```
Railway Dashboard
→ Project
→ Environment (development/staging/production)
→ Variables
→ + New Variable
→ Variable name: API_KEY
→ Value: sk-proj-...
→ 🔒 Mark as secret（チェック）
→ Add
```

### Variables（非機密設定）

**特徴**:
- 平文保存
- UI上で表示可能
- 監査ログなし

**用途**:
- アプリケーション名
- ログレベル
- 機能フラグ
- 公開URL

**設定方法**:
```
Railway Dashboard
→ Variables
→ + New Variable
→ Variable name: LOG_LEVEL
→ Value: info
→ 🔒 Mark as secret（チェックしない）
→ Add
```

**重要**: 機密情報は必ず「Mark as secret」をチェック

## 環境グループ管理

### 環境の作成

```
Railway Dashboard
→ Project
→ Environments
→ + New Environment
→ Name: staging
→ Create
```

### 環境別変数設定

**方法1: UI から手動設定**
```
Environment: production
→ Variables
→ + New Variable
→ DATABASE_URL (各環境で異なる値を設定)
```

**方法2: Railway CLI から設定**
```bash
# 環境選択
railway environment

# 変数設定
railway variables set API_KEY=sk-proj-prod-key

# 変数一覧
railway variables

# 変数削除
railway variables delete API_KEY
```

### 環境間のSecret分離

**重要原則**:
- 環境間でSecretを共有しない
- 各環境に個別の値を設定
- 環境名をSecret名に含めない（環境グループで分離）

```
❌ 間違い:
  development:
    - API_KEY_DEV=...
  production:
    - API_KEY_PROD=...

✅ 正しい:
  development:
    - API_KEY=<dev値>
  production:
    - API_KEY=<prod値>
```

コード側は`process.env.API_KEY`で統一、Railway環境グループで自動切り替え。

## Neon Plugin 統合

### Neon Plugin のセットアップ

**手順**:
```
1. Railway Dashboard → Project → Plugins
2. Neon Postgres を検索
3. Add Plugin
4. 環境選択（development/staging/production）
5. 自動的にNeon DBインスタンスが作成される
```

**自動注入される環境変数**:
```bash
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
DATABASE_PRIVATE_URL=postgresql://user:password@internal-xxx.neon.tech/dbname
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=dbname
```

**メリット**:
- 環境毎に自動分離（dev/staging/prodで別DB）
- 手動設定不要
- Rotation時の自動更新
- SSL/TLS自動有効化

**注意点**:
- ローカル開発ではNeon Pluginは使用されない
- ローカルは`railway run`で注入 or 手動`.env.local`

### ローカル開発でのNeon DB接続

**方法1: Railway CLI使用（推奨）**
```bash
railway run pnpm run dev
# DATABASE_URLが自動注入される
```

**方法2: ローカルPostgreSQL（開発専用）**
```bash
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: myapp_dev
    ports:
      - "5432:5432"

# .env.development.local
DATABASE_URL=postgresql://dev:devpass@localhost:5432/myapp_dev
```

## Railway Logs とセキュリティ

### ログへのSecret露出防止

```typescript
// ❌ 危険: Secretをログ出力
console.log('API Key:', process.env.API_KEY);  // Railway Logsに露出！

// ✅ 安全: Secretをログ出力しない
console.log('API Key: ***');  // マスク表示

// ✅ 安全: 構造化ログでSecretを除外
logger.info({
  event: 'api_call',
  endpoint: '/api/data',
  // api_key は含めない
});
```

### Railway Logs 検索

**Secretが誤って露出していないかチェック**:
```
Railway Dashboard
→ Project
→ Deployments
→ View Logs
→ Search: "sk-proj-"（OpenAI Key）
→ Search: "sk_live_"（Stripe Key）
→ 検出された場合は即座にRotation
```

## 一時ファイルとセキュリティ

### /tmp ディレクトリの揮発性

**Railway の仕様**:
- `/tmp`ディレクトリは再デプロイ時に削除される
- 永続化が必要なデータは外部ストレージ使用

**Secretの一時保存禁止**:
```typescript
// ❌ 危険: Secretをファイルに保存
import fs from 'fs';
fs.writeFileSync('/tmp/api-key.txt', process.env.API_KEY);  // 危険！

// ✅ 安全: Secretはメモリ内のみ
const apiKey = process.env.API_KEY;  // メモリ内変数として使用
```

### アップロードファイルのスキャン

```typescript
class FileUploadSecurity {
  async scanUploadedFile(file: File): Promise<void> {
    const content = await file.text();

    // Secret パターンスキャン
    const secretPatterns = [
      /sk-proj-[a-zA-Z0-9]{48}/,  // OpenAI
      /sk_live_[0-9a-zA-Z]{24,}/,  // Stripe
      /-----BEGIN .* PRIVATE KEY-----/,  // Private Key
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        throw new Error('Uploaded file contains potential secret - upload rejected');
      }
    }
  }
}
```

## デプロイ戦略とSecret管理

### Blue-Green Deployment

```
Railway環境設定:

production-blue（現行）
  - DATABASE_URL=<Neon Prod DB>
  - API_KEY=<Current Key>

production-green（新バージョン）
  - DATABASE_URL=<Neon Prod DB>（同じDB）
  - API_KEY=<New Key>（Rotation時）

切り替え:
  Railway Dashboard → production-green → Set as primary
```

### ローリングアップデート（Secret Rotation時）

```bash
# 1. 新Secretを追加（旧Secretと並存）
railway variables set API_KEY_NEW=sk-proj-new-key

# 2. アプリケーションコードを更新してデプロイ
#    新旧両方のキーを試行
git push origin main

# 3. 監視（24時間）
# 4. 旧Secretを削除
railway variables delete API_KEY_OLD
```

## 実装チェックリスト

### Railway設定
- [ ] すべての機密情報が「Mark as secret」されているか？
- [ ] 環境グループが3つ設定されているか？（dev/staging/prod）
- [ ] Neon Pluginが各環境に設定されているか？
- [ ] 本番環境のSecret変更ログが記録されているか？

### GitHub Actions統合
- [ ] RAILWAY_TOKENがGitHub Secretsに保存されているか？
- [ ] 環境別Secretsが適切に設定されているか？
- [ ] 本番環境デプロイに承認が必要か？
- [ ] SecretがCI/CDログに露出していないか？

### ローカル開発
- [ ] `railway run`でSecrets注入されているか？
- [ ] `.env.local`が.gitignoreに含まれているか？
- [ ] ローカルDBが本番DBと分離されているか？

### セキュリティ
- [ ] ログにSecretが露出していないか？
- [ ] /tmpディレクトリにSecretを保存していないか？
- [ ] アップロードファイルがスキャンされているか？
- [ ] Secret Rotationスケジュールがあるか？
