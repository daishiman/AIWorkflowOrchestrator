---
name: github-actions-security
description: |
  GitHub Actionsセキュリティスキル。Repository/Environment Secrets、
  ログマスキング、品質ゲート統合、CI/CDパイプラインセキュリティを提供します。

  使用タイミング:
  - GitHub Actionsワークフローのセキュリティを強化する時
  - Environment Secretsを設定する時
  - CI/CD品質ゲートを統合する時
  - Secret露出防止を実装する時
  - デプロイワークフローを設計する時

  Use when securing GitHub Actions workflows, configuring environment
  secrets, implementing quality gates, or preventing secret exposure.
version: 1.0.0
---

# GitHub Actions Security

## 概要

GitHub Actionsは強力なCI/CDプラットフォームですが、適切なセキュリティ設定なしでは
Secretが露出するリスクがあります。このスキルは、GitHub Actions固有のセキュリティ
ベストプラクティスとSecret管理手法を提供します。

## Repository Secrets vs Environment Secrets

### Repository Secrets

**特徴**:
- すべてのワークフローからアクセス可能
- 承認不要
- 環境による制限なし

**用途**:
- ビルド用トークン（DOCKER_USERNAME、DOCKER_PASSWORD）
- コードカバレッジトークン（CODECOV_TOKEN）
- 低リスクSecret

**設定方法**:
```
GitHub Repo
→ Settings
→ Secrets and variables → Actions
→ Repository secrets
→ New repository secret
→ Name: CODECOV_TOKEN
→ Secret: <token>
→ Add secret
```

### Environment Secrets

**特徴**:
- 特定環境のワークフローのみアクセス
- 承認・保護ルール設定可能
- デプロイメントブランチ制限可能

**用途**:
- デプロイ用トークン（RAILWAY_TOKEN）
- 環境別Secret（DATABASE_URL、API_KEY）
- 本番通知用Webhook（DISCORD_WEBHOOK_URL）

**推奨構成**:
```
GitHub Repo → Settings → Environments

├── development
│   └── Secrets:
│       - RAILWAY_TOKEN (dev deployment)
│       - DATABASE_URL (dev)
│   └── Protection rules: なし
│
├── staging
│   └── Secrets:
│       - RAILWAY_TOKEN (staging deployment)
│       - DATABASE_URL (staging)
│   └── Protection rules: なし
│
└── production
    └── Secrets:
        - RAILWAY_TOKEN (prod deployment)
        - DATABASE_URL (prod)
        - DISCORD_WEBHOOK_URL (prod notifications)
    └── Protection rules:
        ✅ Required reviewers: @devops-team
        ✅ Wait timer: 5 minutes
        ✅ Deployment branches: main only
```

## GitHub Actions での Secret 使用

### 基本的な使用

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Environment Secret使用

    steps:
      - name: Deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          echo "Token: $RAILWAY_TOKEN"  # 自動マスク → Token: ***
          ./deploy.sh
```

### 動的環境選択

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest

    # ブランチに応じて環境を動的決定
    environment:
      name: ${{ github.ref == 'refs/heads/main' && 'production' || github.ref == 'refs/heads/staging' && 'staging' || 'development' }}

    steps:
      - name: Deploy
        env:
          # 環境別Secretが自動選択される
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          railway up --detach
```

## Secret露出防止

### 1. 自動ログマスキング

GitHub Actionsは自動的にSecretをマスクしますが、**完全ではありません**。

```yaml
# ✅ 安全: 直接使用はマスクされる
- run: echo "Secret: ${{ secrets.API_KEY }}"
  # 出力: Secret: ***

# ❌ 危険: Base64エンコードでマスク回避される
- run: echo "${{ secrets.API_KEY }}" | base64
  # 出力: c2stcHJvai1hYmMxMjM0NTY3ODkw（マスクされない！）

# ❌ 危険: JSONに埋め込むとマスクされない場合がある
- run: echo '{"key":"${{ secrets.API_KEY }}"}'
  # マスクされない可能性
```

**対策**: Secretを加工せず直接使用、ファイル化・エンコード禁止

### 2. デバッグログ制御

```yaml
# ❌ 危険: デバッグログ有効でSecret露出リスク
- name: Deploy
  env:
    ACTIONS_STEP_DEBUG: true  # 詳細ログ出力
    SECRET: ${{ secrets.SECRET }}

# ✅ 安全: 本番環境ではデバッグログ無効
- name: Deploy
  env:
    SECRET: ${{ secrets.SECRET }}
  # ACTIONS_STEP_DEBUGは設定しない
```

### 3. アーティファクト保護

```yaml
# ❌ 危険: Secretを含むファイルをアーティファクトにアップロード
- run: |
    echo "API_KEY=${{ secrets.API_KEY }}" > config.env

- uses: actions/upload-artifact@v4
  with:
    name: config
    path: config.env  # Secret が公開される！

# ✅ 安全: Secretはアーティファクトに含めない
- name: Create config (non-secret only)
  run: |
    echo "API_BASE_URL=${{ vars.API_BASE_URL }}" > config.env

- uses: actions/upload-artifact@v4
  with:
    name: config
    path: config.env  # 非機密情報のみ
```

### 4. Pull Requestでのフォーク制限

```yaml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  test:
    runs-on: ubuntu-latest

    # フォークからのPRではSecretを使用しない
    if: github.event.pull_request.head.repo.full_name == github.repository

    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        env:
          API_KEY: ${{ secrets.API_KEY }}  # フォークPRでは空
        run: npm test
```

## CI/CD品質ゲート統合

### 4段階品質ゲート

```yaml
jobs:
  # Gate 1: Secret Scan
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2

  # Gate 2: Lint & Type Check
  lint:
    needs: secret-scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  # Gate 3: Tests
  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test

  # Gate 4: Build
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

  # すべてのゲート通過後のみデプロイ
  deploy:
    needs: [secret-scan, lint, test, build]
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy
        run: ./deploy.sh
```

### ゲート失敗時の動作

```yaml
# ゲート失敗時は後続ジョブをスキップ
deploy:
  needs: [secret-scan, lint, test, build]
  if: success()  # すべて成功時のみ実行
```

## 環境保護ルール

### 本番環境の推奨設定

```
GitHub Repo
→ Settings
→ Environments
→ production
→ Protection rules:

✅ Required reviewers: 1+ reviewers
   - @devops-team
   - @security-team

✅ Wait timer: 5 minutes
   - 誤操作防止のための待機時間

✅ Deployment branches: Selected branches
   - main ブランチのみ許可

✅ Deployment protection rules:
   - Prevent self-review（自己承認禁止）
```

### ステージング環境の推奨設定

```
staging:
  Protection rules:
    - Required reviewers: なし
    - Wait timer: なし
    - Deployment branches: main, staging
```

## Secret Rotation 統合

### GitHub Secretsの更新

```bash
# GitHub CLIを使用（推奨）
gh secret set RAILWAY_TOKEN --body "new-token-value"

# または、GitHub UI経由
# Repo → Settings → Secrets → RAILWAY_TOKEN → Update
```

### Rotation後の検証

```yaml
name: Validate Secrets

on:
  workflow_dispatch:

jobs:
  validate:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Test Railway Token
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway status || exit 1
          echo "✅ RAILWAY_TOKEN is valid"

      - name: Test Database Connection
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          psql "$DATABASE_URL" -c "SELECT 1" || exit 1
          echo "✅ DATABASE_URL is valid"
```

## 通知統合

### デプロイ成功通知

```yaml
- name: Notify success
  if: success()
  env:
    DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
  run: |
    curl -X POST "$DISCORD_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"embeds\": [{
          \"title\": \"✅ Deployment Successful\",
          \"description\": \"Deployed to **${{ github.environment }}**\",
          \"color\": 3066993,
          \"fields\": [
            {\"name\": \"Branch\", \"value\": \"${{ github.ref_name }}\"},
            {\"name\": \"Commit\", \"value\": \"[\`${GITHUB_SHA:0:7}\`](${{ github.event.head_commit.url }})\"},
            {\"name\": \"Author\", \"value\": \"${{ github.actor }}\"}
          ]
        }]
      }"
```

### デプロイ失敗通知

```yaml
- name: Notify failure
  if: failure()
  env:
    DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
  run: |
    curl -X POST "$DISCORD_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"embeds\": [{
          \"title\": \"❌ Deployment Failed\",
          \"description\": \"Failed to deploy to **${{ github.environment }}**\",
          \"color\": 15158332,
          \"fields\": [
            {\"name\": \"Workflow\", \"value\": \"[View Run](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})\"}
          ]
        }]
      }"
```

## 実装チェックリスト

### GitHub Secrets設定
- [ ] Environment Secretsが環境別に分離されているか？
- [ ] 本番環境に保護ルールが設定されているか？
- [ ] Repository Secretsが低リスクSecretのみか？

### ワークフローセキュリティ
- [ ] Secretがログに露出しないか？
- [ ] デバッグログが本番で無効か？
- [ ] アーティファクトにSecretが含まれないか？
- [ ] フォークPRでSecretが使用されないか？

### 品質ゲート
- [ ] Secret Scanが最初のゲートとして設定されているか？
- [ ] ゲート失敗時にデプロイがブロックされるか？
- [ ] すべてのゲート通過後のみデプロイされるか？

## 関連スキル

- `.claude/skills/railway-secrets-management/SKILL.md` - Railway統合
- `.claude/skills/zero-trust-security/SKILL.md` - アクセス制御
- `.claude/skills/pre-commit-security/SKILL.md` - Secretスキャン
- `.claude/skills/environment-isolation/SKILL.md` - 環境分離

## リソースファイル

- `resources/workflow-security-patterns.md` - セキュアなワークフローパターン

## テンプレート

- `templates/github-actions-deploy-template.yml` - デプロイワークフローテンプレート
