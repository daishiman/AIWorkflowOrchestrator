# Secret設定ガイド

## プロジェクト情報

- プロジェクト名: {{PROJECT_NAME}}
- 作成日: {{CREATED_DATE}}
- 最終更新: {{UPDATED_DATE}}

## 1. Secret一覧

### 1.1 必須Secret

| Secret名        | 用途        | デフォルト値      | 環境  |
| --------------- | ----------- | ----------------- | ----- | ------- | ---- | ----- |
| {{SECRET_NAME}} | {{PURPOSE}} | {{DEFAULT_VALUE}} | {{DEV | STAGING | PROD | ALL}} |

### 1.2 オプションSecret

| Secret名        | 用途        | デフォルト値      | 環境  |
| --------------- | ----------- | ----------------- | ----- | ------- | ---- | ----- |
| {{SECRET_NAME}} | {{PURPOSE}} | {{DEFAULT_VALUE}} | {{DEV | STAGING | PROD | ALL}} |

## 2. 環境別Secret配置手順

### 2.1 Development環境

#### ローカル開発

1. `.env.example` をコピーして `.env.local` を作成する

```bash
cp .env.example .env.local
```

2. `.env.local` に実際の値を設定する

```env
# .env.local
{{SECRET_NAME_1}}={{VALUE_1}}
{{SECRET_NAME_2}}={{VALUE_2}}
```

3. `.gitignore` に `.env.local` が含まれていることを確認する

```bash
grep ".env.local" .gitignore
```

#### 検証コマンド

```bash
# 必須環境変数の存在確認
node scripts/validate-environment.mjs
```

### 2.2 Staging環境

#### Railway Secrets設定

1. Railwayダッシュボードにアクセスする
2. Stagingプロジェクトを選択する
3. Variables タブを開く
4. 以下のSecretを追加する:

```
{{SECRET_NAME_1}}={{STAGING_VALUE_1}}
{{SECRET_NAME_2}}={{STAGING_VALUE_2}}
```

#### GitHub Secrets設定（CI/CD用）

1. リポジトリの Settings > Secrets and variables > Actions を開く
2. New repository secret をクリック
3. 以下のSecretを追加する（プレフィックス `STAGING_` を付与）:

```
Name: STAGING_{{SECRET_NAME_1}}
Value: {{STAGING_VALUE_1}}
```

#### 検証コマンド

```bash
# GitHub Actions経由で検証
gh workflow run validate-staging.yml
```

### 2.3 Production環境

#### Railway Secrets設定

1. Railwayダッシュボードにアクセスする
2. Productionプロジェクトを選択する
3. Variables タブを開く
4. 以下のSecretを追加する:

```
{{SECRET_NAME_1}}={{PRODUCTION_VALUE_1}}
{{SECRET_NAME_2}}={{PRODUCTION_VALUE_2}}
```

#### GitHub Secrets設定（CI/CD用、承認制）

1. リポジトリの Settings > Secrets and variables > Actions を開く
2. New repository secret をクリック
3. 以下のSecretを追加する（プレフィックス `PROD_` を付与）:

```
Name: PROD_{{SECRET_NAME_1}}
Value: {{PRODUCTION_VALUE_1}}
```

4. Environment protection rules を設定する
   - Required reviewers: 承認者を追加
   - Deployment branches: main ブランチのみ許可

#### 検証コマンド

```bash
# 本番環境への検証デプロイ（承認後）
gh workflow run deploy-production.yml
```

## 3. .env.example テンプレート

以下の内容を `.env.example` として保存する:

```env
# データベース接続
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_SIZE=10

# API認証
API_KEY=your-api-key-here
API_SECRET=your-api-secret-here

# 暗号化
ENCRYPTION_KEY=32-character-hex-string-here
JWT_SECRET=your-jwt-secret-here

# 外部サービス
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your-smtp-password

# オプション設定
LOG_LEVEL=info
ENABLE_DEBUG=false
```

## 4. CI/CD統合

### 4.1 GitHub Actions

`.github/workflows/deploy.yml` に以下を追加:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
          API_KEY: ${{ secrets.STAGING_API_KEY }}
        run: |
          # デプロイコマンド

  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    needs: deploy-staging
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
          API_KEY: ${{ secrets.PROD_API_KEY }}
        run: |
          # デプロイコマンド
```

### 4.2 Railway統合

`railway.toml` に以下を追加:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node scripts/validate-environment.mjs && npm start"
restartPolicyType = "on_failure"
```

## 5. Secretローテーション計画

### 5.1 ローテーションスケジュール

| 環境        | 頻度                 | 責任者    | 次回予定               |
| ----------- | -------------------- | --------- | ---------------------- |
| Development | 不定期（必要時のみ） | {{OWNER}} | N/A                    |
| Staging     | 90日毎               | {{OWNER}} | {{NEXT_ROTATION_DATE}} |
| Production  | 30-90日毎            | {{OWNER}} | {{NEXT_ROTATION_DATE}} |

### 5.2 ローテーション手順

1. 新しいSecretを生成する
2. 新旧両方のSecretを一時的に有効化する
3. アプリケーションを新Secretに切り替える
4. 動作確認後、旧Secretを無効化する
5. ローテーション記録をLOGS.mdに追記する

### 5.3 緊急ローテーション（漏洩時）

1. 直ちに漏洩したSecretを無効化する
2. 新しいSecretを生成・配置する
3. アプリケーションを再起動する
4. インシデントレポートを作成する
5. ログを調査し、不正アクセスを確認する

## 6. Secret漏洩検知

### 6.1 Git pre-commit hook

`.git/hooks/pre-commit` に以下を追加:

```bash
#!/bin/bash
# Secret漏洩チェック
if git diff --cached | grep -E '(API_KEY|SECRET|PASSWORD|TOKEN)=\S+'; then
  echo "Error: Potential secret detected in commit"
  exit 1
fi
```

### 6.2 GitHub Secret scanning

リポジトリ設定で有効化:

- Settings > Code security and analysis
- Secret scanning: Enable
- Push protection: Enable

## 7. トラブルシューティング

### 7.1 環境変数が読み込まれない

**症状**: アプリケーションがSecretを認識しない

**解決策**:

```bash
# 環境変数の存在確認
printenv | grep DATABASE_URL

# .env.local が正しく配置されているか確認
ls -la .env.local

# 起動コマンドに環境変数ローダーを追加
node -r dotenv/config app.js
```

### 7.2 Railway/GitHub SecretsがCI/CDで参照できない

**症状**: デプロイ時にSecret参照エラー

**解決策**:

```bash
# GitHub Actions: environment設定を確認
# Railway: プロジェクト/環境が正しく選択されているか確認

# Secret名の形式を確認（大文字・アンダースコアのみ）
PROD_DATABASE_URL  # OK
prod-database-url  # NG
```

## 8. セキュリティチェックリスト

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] `.env.example` に実際の値が含まれていない（プレースホルダーのみ）
- [ ] 本番Secretが開発/ステージング環境と完全に分離されている
- [ ] GitHub/Railway Secretsにアクセス権限が適切に設定されている
- [ ] Secret漏洩検知が有効になっている
- [ ] ローテーションスケジュールが策定されている
- [ ] 起動時にSecret検証が実行されている

## 9. 参照リソース

- 環境変数検証: `scripts/validate-environment.mjs`
- 詳細ガイド: `references/environment-validation.md`
- スキル本体: `.claude/skills/environment-isolation/SKILL.md`
