# .env.example テンプレート

## 概要

このテンプレートは、プロジェクトルートに配置する`.env.example`ファイルの
標準フォーマットを提供します。開発者が環境変数をセットアップする際の
ガイドとして機能します。

## テンプレート構造

```bash
# ═══════════════════════════════════════════════════
# Application Configuration
# ═══════════════════════════════════════════════════

# アプリケーション基本設定
NODE_ENV=development
APP_NAME=MyApplication
PORT=3000

# ═══════════════════════════════════════════════════
# Database Configuration
# ═══════════════════════════════════════════════════

# データベース接続（開発環境用）
# 本番環境: Railway Secretsから自動注入（Neon Plugin）
# ローカル開発: docker-compose upで起動するローカルPostgreSQLを使用
DATABASE_URL=postgresql://user:password@localhost:5432/mydb_dev

# ═══════════════════════════════════════════════════
# External API Keys
# ═══════════════════════════════════════════════════

# OpenAI API（AI機能用）
# 取得方法: https://platform.openai.com/api-keys
# 本番環境: Railway Secretsで管理
OPENAI_API_KEY=sk-proj-example-key-do-not-use-real-key

# Discord Webhook（通知用）
# 取得方法: Discordサーバー設定 > 連携サービス > Webhook
# 本番環境: Railway Secretsで管理
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/example/token

# ═══════════════════════════════════════════════════
# Authentication & Security
# ═══════════════════════════════════════════════════

# NextAuth Secret（セッション暗号化用）
# 生成方法: openssl rand -base64 32
# 本番環境: 必ず異なる値を使用（Railway Secretsで管理）
NEXTAUTH_SECRET=example-secret-replace-with-random-value

# NextAuth URL（認証コールバック用）
# 開発: http://localhost:3000
# 本番: https://your-app.railway.app
NEXTAUTH_URL=http://localhost:3000

# ═══════════════════════════════════════════════════
# Logging & Monitoring
# ═══════════════════════════════════════════════════

# ログレベル（debug, info, warn, error）
LOG_LEVEL=info

# Sentry DSN（エラートラッキング、オプション）
# 取得方法: https://sentry.io/settings/projects/
# SENTRY_DSN=https://example@sentry.io/1234567

# ═══════════════════════════════════════════════════
# Feature Flags（オプション）
# ═══════════════════════════════════════════════════

# 機能フラグ
ENABLE_AI_FEATURES=true
ENABLE_DISCORD_NOTIFICATIONS=false

# ═══════════════════════════════════════════════════
# Development Tools（開発環境のみ）
# ═══════════════════════════════════════════════════

# データベースGUI接続（開発環境のみ）
# DB_GUI_PORT=5050

# ═══════════════════════════════════════════════════
# 環境変数セットアップガイド
# ═══════════════════════════════════════════════════

# 1. このファイルをコピーして .env を作成:
#    cp .env.example .env
#
# 2. 各環境変数に適切な値を設定:
#    - 必須項目（上記すべて）は必ず設定してください
#    - オプション項目（コメントアウト）は必要に応じて有効化
#
# 3. 本番環境のSecret取得:
#    - Railway: https://railway.app/dashboard → プロジェクト → Variables
#    - GitHub Actions: リポジトリSettings → Secrets and variables → Actions
#
# 4. ローカル開発でのRailway Secrets同期（オプション）:
#    railway run pnpm run dev
#
# 5. セキュリティ注意事項:
#    - .envファイルは絶対にGitにコミットしないでください
#    - 本番のSecretをローカル.envに保存しないでください
#    - APIキー等の機密情報は必ず.gitignoreで除外されています
```

## 設計原則

### 1. 自己文書化

各環境変数には以下を含める:
- **用途説明**: 何に使用するか
- **取得方法**: どこで値を取得するか
- **環境別の扱い**: 開発環境と本番環境の違い
- **必須/オプション**: 明確な区別

### 2. セキュリティ警告

機密情報には必ず警告を含める:
```bash
# 🚨 WARNING: 本番環境では必ず異なる値を使用してください
# 🚨 WARNING: この値は.gitignoreで除外されています（Gitコミット禁止）
```

### 3. 実例値の提供

開発者がすぐに使える実例値を提供:
- 本物のAPIキーは含めない
- "example-"プレフィックスで明示
- 形式が明確にわかる値

### 4. グループ化

関連する環境変数をセクションで整理:
- Application Configuration
- Database Configuration
- External API Keys
- Authentication & Security
- Logging & Monitoring
- Feature Flags
- Development Tools

### 5. コメント活用

- セクション区切り: `# ═══...`
- 説明コメント: 各変数の上に配置
- セットアップガイド: ファイル末尾に配置

## Railway/GitHub Actions統合

### Railway固有の注意事項

```bash
# Railway自動注入されるSecret（.env.exampleに含めない）
# - DATABASE_URL（Neon Pluginから自動注入）
# - RAILWAY_ENVIRONMENT（自動設定）

# Railway Variablesで管理推奨（非機密）
# - NODE_ENV
# - PORT（Railwayが自動設定）
```

### GitHub Actions固有の注意事項

```bash
# GitHub Secretsで管理するSecret（.env.exampleには含めるが値は"<GitHub Secrets>"）
# - DISCORD_WEBHOOK_URL（CI/CD通知用）
# - RAILWAY_TOKEN（デプロイ用）

# 例:
# DISCORD_WEBHOOK_URL=<GitHub Secretsから注入>
```

## 検証チェックリスト

### 作成時
- [ ] すべての必須環境変数が含まれているか？
- [ ] 機密情報（本物のAPIキー等）が一切含まれていないか？
- [ ] 各変数に用途説明が記載されているか？
- [ ] 取得方法が明記されているか？
- [ ] セキュリティ警告が適切に配置されているか？
- [ ] セットアップガイドが含まれているか？

### 配置時
- [ ] プロジェクトルート（`/`）に配置されているか？
- [ ] Gitにコミットされているか？（.env.exampleはコミット可）
- [ ] .gitignoreに.env*（.env.example除く）が含まれているか？
- [ ] READMEで.env.exampleの存在が言及されているか？

## トラブルシューティング

### 問題1: 開発者が環境変数をセットアップできない

**原因**: .env.exampleの説明不足
**解決策**:
- 取得方法URLを追加
- セットアップガイドを充実
- スクリーンショット追加（docs/ディレクトリ）

### 問題2: 本番Secretが.env.exampleに漏洩

**原因**: テンプレート作成時のミス
**解決策**:
- 即座に.env.exampleから削除
- Gitコミット履歴から削除（`git filter-branch`）
- 本番Secretを即座にRotation

### 問題3: Railway/GitHub ActionsでSecretが注入されない

**原因**: .env.exampleとRailway/GitHub Secrets名の不一致
**解決策**:
- Secret名の完全一致を確認
- 大文字小文字を統一
- Railway Variables vs Secretsの使い分けを明確化
