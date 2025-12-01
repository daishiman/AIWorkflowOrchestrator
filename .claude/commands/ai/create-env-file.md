---
description: |
  .env.exampleファイルの作成・更新を行うコマンド。

  プロジェクトで使用する環境変数を分析し、セキュアな.env.exampleテンプレートを生成します。
  本番用の機密情報は含めず、変数名と説明のみを記載します。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/secret-mgr.md` - 環境変数管理・セキュリティ専門

  📚 利用可能スキル（secret-mgrエージェントが参照）:
  - `.claude/skills/environment-variables-best-practices/SKILL.md` - 環境変数命名規則、セキュリティプラクティス
  - `.claude/skills/secret-management/SKILL.md` - シークレット管理、暗号化、アクセス制御
  - `.claude/skills/configuration-patterns/SKILL.md` - 設定ファイル構造、階層化、環境別設定

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: 環境変数ファイル生成用
    • Task: secret-mgrエージェント起動用
    • Read: 既存コード確認用（import.meta.env, process.env検索）
    • Write(.env.example): テンプレートファイル生成専用
    • Edit: 既存.env.example更新用
  - model: sonnet（標準的な環境変数テンプレート生成）

  📋 成果物:
  - `.env.example`（環境変数テンプレート）
  - `docs/environment-setup.md`（環境変数設定ガイド）

  🎯 セキュリティ原則:
  - 機密情報は含めない（ダミー値やプレースホルダーのみ）
  - 変数名と説明を明記
  - 必須/任意を明示
  - デフォルト値の推奨

  トリガーキーワード: env file, environment variables, .env.example, 環境変数, 設定ファイル
argument-hint: ""
allowed-tools:
  - Task
  - Read
  - Write(.env.example)
  - Edit
model: sonnet
---

# .env.exampleファイル作成

このコマンドは、.env.exampleテンプレートファイルを作成・更新します。

## 📋 実行フロー

### Phase 1: 環境変数の分析

**コードベーススキャン**:
```bash
# 環境変数の使用箇所を検索
grep -r "process.env" src/
grep -r "import.meta.env" src/

# 既存の.envファイル確認（存在する場合）
if [ -f ".env" ]; then
  cat .env | grep -v "^#" | grep -v "^$"
fi
```

### Phase 2: secret-mgrエージェントを起動

**使用エージェント**: `.claude/agents/secret-mgr.md`

**エージェントへの依頼内容**:
```markdown
.env.exampleファイルを作成してください。

**入力**:
- 環境変数使用箇所: ${grep result}
- 既存.env（存在する場合）: ${cat .env}
- プロジェクトタイプ: Next.js 15.x

**要件**:
1. 環境変数の分類:
   ```bash
   # === データベース ===
   DATABASE_URL=postgresql://user:password@host:5432/dbname

   # === AI API ===
   ANTHROPIC_API_KEY=your-anthropic-api-key-here
   OPENAI_API_KEY=your-openai-api-key-here

   # === アプリケーション ===
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development

   # === 外部サービス ===
   DISCORD_BOT_TOKEN=your-discord-bot-token
   ```

2. セキュリティ要件:
   - ✅ 本番の機密情報は含めない
   - ✅ プレースホルダー値を使用（`your-api-key-here`）
   - ✅ 説明コメントを追加
   - ✅ 必須変数には `# Required` マーク

3. 命名規則:
   - 大文字スネークケース: `DATABASE_URL`
   - Next.js公開変数: `NEXT_PUBLIC_` プレフィックス
   - 環境別変数: `DEV_`, `PROD_` プレフィックス（必要時）

4. ドキュメント生成（`docs/environment-setup.md`）:
   ```markdown
   # 環境変数設定ガイド

   ## 必須環境変数

   ### DATABASE_URL
   - **説明**: PostgreSQL接続文字列
   - **形式**: `postgresql://user:password@host:5432/dbname`
   - **取得方法**: Neon.techでプロジェクト作成
   - **例**: `postgresql://user:pass@ep-cool-forest-123456.us-east-2.aws.neon.tech/neondb`

   ### ANTHROPIC_API_KEY
   - **説明**: Anthropic Claude APIキー
   - **取得方法**: https://console.anthropic.com/ でAPI Key作成
   - **権限**: API access

   ## 任意環境変数

   [...]
   ```

**スキル参照**:
- `.claude/skills/environment-variables-best-practices/SKILL.md`
- `.claude/skills/secret-management/SKILL.md`

**成果物**:
- .env.example
- docs/environment-setup.md
```

### Phase 3: 完了報告

```markdown
## .env.exampleファイル作成完了

### 環境変数サマリー
- 必須変数: ${required_count}個
- 任意変数: ${optional_count}個
- 分類: データベース、AI API、アプリケーション、外部サービス

### 成果物
✅ .env.example（テンプレートファイル）
✅ docs/environment-setup.md（設定ガイド）

### Next Steps
1. .env.exampleをコピー: `cp .env.example .env`
2. 実際の値を設定: 各API Keyを取得して設定
3. .gitignore確認: `.env`が除外されているか確認
```

## 使用例

### 基本的な使用

```bash
/ai:create-env-file
```

自動実行:
1. コードベーススキャン（環境変数使用箇所）
2. 環境変数分類
3. .env.example生成
4. 設定ガイド生成

## .env.example テンプレート例

```bash
# ===================================================================
# 環境変数設定ファイル（テンプレート）
# 実際の値は .env ファイルに設定してください（.gitignore済み）
# ===================================================================

# === データベース（必須） ===
DATABASE_URL=postgresql://user:password@host:5432/dbname

# === AI API（必須、いずれか1つ以上） ===
ANTHROPIC_API_KEY=your-anthropic-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# === Next.js アプリケーション ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# === 外部サービス（任意） ===
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_APPLICATION_ID=your-discord-application-id
LINE_CHANNEL_SECRET=your-line-channel-secret
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token

# === セキュリティ（本番環境のみ） ===
# NEXTAUTH_SECRET=your-nextauth-secret-32-chars-min
# NEXTAUTH_URL=https://yourdomain.com

# === ログ・監視（任意） ===
# LOG_LEVEL=info
# SENTRY_DSN=your-sentry-dsn
```

## 設定ガイド例

```markdown
# 環境変数設定ガイド

## セットアップ手順

1. **テンプレートコピー**:
   ```bash
   cp .env.example .env
   ```

2. **必須変数の設定**:
   下記の必須変数を実際の値に置き換えてください。

### DATABASE_URL（必須）

- **説明**: PostgreSQL接続文字列（Neon.tech推奨）
- **取得方法**:
  1. https://neon.tech/ でアカウント作成
  2. プロジェクト作成
  3. 接続文字列をコピー（Dashboard → Connection String）
- **形式**: `postgresql://user:password@host:5432/dbname`
- **例**:
  ```
  DATABASE_URL=postgresql://neondb_owner:abc123@ep-cool-forest-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
  ```

### ANTHROPIC_API_KEY（必須）

- **説明**: Anthropic Claude API Key
- **取得方法**:
  1. https://console.anthropic.com/ でアカウント作成
  2. API Keys → Create Key
  3. キーをコピー（一度しか表示されない）
- **形式**: `sk-ant-api03-...`
- **権限**: API access
- **注意**: 本番環境では制限付きキーを使用

## セキュリティベストプラクティス

✅ `.env`ファイルは`.gitignore`に含める（必須）
✅ 本番環境の機密情報はRailway等のUI経由で設定
✅ ローカル開発用と本番用で異なるキーを使用
✅ API Keyは定期的にローテーション
❌ `.env`をGitHubにコミットしない
❌ Slackやメールで平文送信しない
```

## トラブルシューティング

### 環境変数が読み込まれない

**原因**: Next.js の環境変数命名規則違反

**解決策**:
```bash
# ✅ 正しい: クライアントサイド変数は NEXT_PUBLIC_ プレフィックス
NEXT_PUBLIC_API_URL=https://api.example.com

# ❌ 間違い: プレフィックスなし（サーバーサイドのみ）
API_URL=https://api.example.com  # クライアントで使用不可
```

### .envと.env.exampleの乖離

**原因**: 環境変数追加時に.env.exampleの更新漏れ

**解決策**:
```bash
# 定期的に同期確認
diff <(grep -v "^#" .env | grep -v "^$" | cut -d= -f1 | sort) \
     <(grep -v "^#" .env.example | grep -v "^$" | cut -d= -f1 | sort)

# 差分があれば.env.exampleを更新
```

## ベストプラクティス

### 環境変数の追加フロー

```bash
# 1. コードに環境変数を追加
const apiKey = process.env.ANTHROPIC_API_KEY

# 2. .env.exampleを更新
/ai:create-env-file

# 3. .envに実際の値を設定
# .env ファイルを手動編集

# 4. コミット（.env.exampleのみ）
git add .env.example
git commit -m "docs(env): add ANTHROPIC_API_KEY"
```

### 環境別設定

```bash
# .env.development（ローカル開発）
DATABASE_URL=postgresql://localhost:5432/dev
LOG_LEVEL=debug

# .env.production（本番環境、Railway等で設定）
DATABASE_URL=postgresql://neon-host/prod
LOG_LEVEL=info
```

## 参照

- secret-mgr: `.claude/agents/secret-mgr.md`
- environment-variables-best-practices: `.claude/skills/environment-variables-best-practices/SKILL.md`
- Next.js Environment Variables: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
