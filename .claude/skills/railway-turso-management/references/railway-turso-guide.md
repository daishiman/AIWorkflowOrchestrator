# Railway Turso 詳細ガイド

## Railway Secrets 概要

Railwayは、環境変数を暗号化して保存し、デプロイ時にアプリケーションに注入する
Secrets管理機能を提供します。

## Secrets vs Variables

### Secrets(機密情報)

**特徴**:

- 暗号化保存
- UI上でマスク表示(\*\*\*)
- 監査ログ記録
- アクセス制限可能

**用途**:

- APIキー
- データベース認証情報(TURSO_DATABASE_URL、TURSO_AUTH_TOKEN)
- 暗号化キー
- OAuth Client Secret

**設定方法**:
\`\`\`
Railway Dashboard
→ Project
→ Environment (development/staging/production)
→ Variables
→ + New Variable
→ Variable name: TURSO_DATABASE_URL
→ Value: libsql://...
→ 🔒 Mark as secret(チェック)
→ Add
\`\`\`

### Variables(非機密設定)

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
\`\`\`
Railway Dashboard
→ Variables
→ + New Variable
→ Variable name: LOG_LEVEL
→ Value: info
→ 🔒 Mark as secret(チェックしない)
→ Add
\`\`\`

**重要**: 機密情報は必ず「Mark as secret」をチェック

## 環境グループ管理

### 環境の作成

\`\`\`
Railway Dashboard
→ Project
→ Environments
→ + New Environment
→ Name: staging
→ Create
\`\`\`

### 環境別変数設定

**方法1: UI から手動設定**
\`\`\`
Environment: production
→ Variables
→ + New Variable
→ TURSO_DATABASE_URL (各環境で異なる値を設定)
→ TURSO_AUTH_TOKEN (各環境で異なるトークンを設定)
\`\`\`

**方法2: Railway CLI から設定**
\`\`\`bash

# 環境選択

railway environment

# 変数設定

railway variables set TURSO_DATABASE_URL=libsql://prod-db.turso.io
railway variables set TURSO_AUTH_TOKEN=eyJhbGc...

# 変数一覧

railway variables

# 変数削除

railway variables delete API_KEY
\`\`\`

### 環境間のSecret分離

**重要原則**:

- 環境間でSecretを共有しない
- 各環境に個別の値を設定
- 環境名をSecret名に含めない(環境グループで分離)

\`\`\`
❌ 間違い:
development: - API_KEY_DEV=...
production: - API_KEY_PROD=...

✅ 正しい:
development: - API_KEY=<dev値> - TURSO_DATABASE_URL=libsql://dev-db.turso.io - TURSO_AUTH_TOKEN=<dev-token>
production: - API_KEY=<prod値> - TURSO_DATABASE_URL=libsql://prod-db.turso.io - TURSO_AUTH_TOKEN=<prod-token>
\`\`\`

コード側は\`process.env.API_KEY\`、\`process.env.TURSO_DATABASE_URL\`で統一、Railway環境グループで自動切り替え。

## Turso Integration

### Turso のセットアップ

**手順**:
\`\`\`bash

# 1. Turso CLIインストール

curl -sSfL https://get.tur.so/install.sh | bash

# 2. ログイン

turso auth login

# 3. 環境別データベース作成

turso db create myapp-dev
turso db create myapp-staging
turso db create myapp-prod

# 4. データベースURL取得

turso db show myapp-dev --url

# 出力: libsql://myapp-dev-[org].turso.io

# 5. 認証トークン生成

turso db tokens create myapp-dev

# 出力: eyJhbGc...

\`\`\`

**Railway への設定**:
\`\`\`

1. Railway Dashboard → Project → Environment: development
2. Variables → + New Variable
3. TURSO_DATABASE_URL = libsql://myapp-dev-[org].turso.io (🔒 secret)
4. TURSO_AUTH_TOKEN = eyJhbGc... (🔒 secret)
5. Repeat for staging/production with respective database URLs and tokens
   \`\`\`

**メリット**:

- 環境毎に自動分離(dev/staging/prodで別DB)
- Edge ロケーションでの低レイテンシ
- 組み込みレプリケーション
- SQLite互換で高速

**注意点**:

- Turso は Railway のネイティブプラグインではない
- 環境変数を手動で設定する必要がある
- ローカル開発では\`railway run\`で注入 or ローカルSQLiteファイル使用

### ローカル開発でのTurso DB接続

**方法1: Railway CLI使用(推奨)**
\`\`\`bash
railway run pnpm run dev

# TURSO_DATABASE_URL と TURSO_AUTH_TOKEN が自動注入される

\`\`\`

**方法2: ローカルSQLite(開発専用)**
\`\`\`bash

# .env.development.local

TURSO_DATABASE_URL=file:./local.db

# TURSO_AUTH_TOKEN は不要(ローカルファイルの場合)

\`\`\`

**方法3: Turso のローカルシミュレーション**
\`\`\`bash

# turso dev でローカルサーバー起動

turso dev --db-file ./local.db

# .env.development.local

TURSO_DATABASE_URL=http://127.0.0.1:8080
\`\`\`

## Railway Logs とセキュリティ

### ログへのSecret露出防止

\`\`\`typescript
// ❌ 危険: Secretをログ出力
console.log('Database URL:', process.env.TURSO_DATABASE_URL); // Railway Logsに露出！
console.log('Auth Token:', process.env.TURSO_AUTH_TOKEN); // Railway Logsに露出！

// ✅ 安全: Secretをログ出力しない
console.log('Database URL: **_'); // マスク表示
console.log('Auth Token: _**'); // マスク表示

// ✅ 安全: 構造化ログでSecretを除外
logger.info({
event: 'db_connection',
status: 'connected',
// database_url や auth_token は含めない
});
\`\`\`

### Railway Logs 検索

**Secretが誤って露出していないかチェック**:
\`\`\`
Railway Dashboard
→ Project
→ Deployments
→ View Logs
→ Search: "libsql://"(Turso URL)
→ Search: "eyJhbGc"(JWT token prefix)
→ Search: "sk-proj-"(OpenAI Key)
→ Search: "sk*live*"(Stripe Key)
→ 検出された場合は即座にRotation
\`\`\`

## 一時ファイルとセキュリティ

### /tmp ディレクトリの揮発性

**Railway の仕様**:

- \`/tmp\`ディレクトリは再デプロイ時に削除される
- 永続化が必要なデータは外部ストレージ使用

**Secretの一時保存禁止**:
\`\`\`typescript
// ❌ 危険: Secretをファイルに保存
import fs from 'fs';
fs.writeFileSync('/tmp/turso-token.txt', process.env.TURSO_AUTH_TOKEN); // 危険！

// ✅ 安全: Secretはメモリ内のみ
const authToken = process.env.TURSO_AUTH_TOKEN; // メモリ内変数として使用
\`\`\`

### アップロードファイルのスキャン

\`\`\`typescript
class FileUploadSecurity {
async scanUploadedFile(file: File): Promise<void> {
const content = await file.text();

    // Secret パターンスキャン
    const secretPatterns = [
      /sk-proj-[a-zA-Z0-9]{48}/,  // OpenAI
      /sk_live_[0-9a-zA-Z]{24,}/,  // Stripe
      /-----BEGIN .* PRIVATE KEY-----/,  // Private Key
      /eyJhbGc[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/,  // JWT
      /libsql:\/\/[a-zA-Z0-9-]+\.turso\.io/,  // Turso URL
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        throw new Error('Uploaded file contains potential secret - upload rejected');
      }
    }

}
}
\`\`\`

## デプロイ戦略とSecret管理

### Blue-Green Deployment

\`\`\`
Railway環境設定:

production-blue(現行)

- TURSO_DATABASE_URL=libsql://prod-db.turso.io
- TURSO_AUTH_TOKEN=<Current Token>
- API_KEY=<Current Key>

production-green(新バージョン)

- TURSO_DATABASE_URL=libsql://prod-db.turso.io(同じDB)
- TURSO_AUTH_TOKEN=<Current Token>(同じToken)
- API_KEY=<New Key>(Rotation時)

切り替え:
Railway Dashboard → production-green → Set as primary
\`\`\`

### ローリングアップデート(Secret Rotation時)

\`\`\`bash

# 1. 新Secretを追加(旧Secretと並存)

railway variables set API_KEY_NEW=sk-proj-new-key

# 2. アプリケーションコードを更新してデプロイ

# 新旧両方のキーを試行

git push origin main

# 3. 監視(24時間)

# 4. 旧Secretを削除

railway variables delete API_KEY_OLD
\`\`\`

### Turso Token Rotation

\`\`\`bash

# 1. 新しいトークンを生成

turso db tokens create myapp-prod

# 2. Railway に新トークンを設定(TURSO_AUTH_TOKEN_NEW)

railway variables set TURSO_AUTH_TOKEN_NEW=<new-token>

# 3. アプリケーションコードを更新(新旧両方試行)

# 4. デプロイして監視

# 5. 旧トークンを削除

railway variables delete TURSO_AUTH_TOKEN_OLD

# 6. Turso 側で旧トークンを無効化

turso db tokens revoke myapp-prod <old-token-id>
\`\`\`

## 実装チェックリスト

### Railway設定

- [ ] すべての機密情報が「Mark as secret」されているか？
- [ ] 環境グループが3つ設定されているか？(dev/staging/prod)
- [ ] Turso データベースが各環境に設定されているか？
- [ ] TURSO_DATABASE_URL と TURSO_AUTH_TOKEN が設定されているか？
- [ ] 本番環境のSecret変更ログが記録されているか？

### GitHub Actions統合

- [ ] RAILWAY_TOKENがGitHub Secretsに保存されているか？
- [ ] 環境別Secretsが適切に設定されているか？
- [ ] 本番環境デプロイに承認が必要か？
- [ ] SecretがCI/CDログに露出していないか？

### ローカル開発

- [ ] \`railway run\`でSecrets注入されているか？
- [ ] \`.env.local\`が.gitignoreに含まれているか？
- [ ] ローカルDBが本番DBと分離されているか？

### セキュリティ

- [ ] ログにSecretが露出していないか？
- [ ] /tmpディレクトリにSecretを保存していないか？
- [ ] アップロードファイルがスキャンされているか？
- [ ] Secret Rotationスケジュールがあるか？

### Turso 固有

- [ ] 環境別にデータベースが分離されているか？
- [ ] 認証トークンが定期的にローテーションされているか？
- [ ] ローカル開発用の SQLite フォールバックが設定されているか？
- [ ] Turso の接続エラーハンドリングが実装されているか？
