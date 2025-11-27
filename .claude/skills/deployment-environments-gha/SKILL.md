---
name: deployment-environments-gha
description: |
  >

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/deployment-environments-gha/resources/approval-workflows.md`: 承認者設定、待機タイマー、デプロイゲートの実装パターン
  - `.claude/skills/deployment-environments-gha/resources/environment-config.md`: 環境設定、保護ルール、シークレット管理の詳細ガイド
  - `.claude/skills/deployment-environments-gha/templates/deployment-workflow.yaml`: 複数環境への段階的デプロイの実装サンプル
  - `.claude/skills/deployment-environments-gha/scripts/check-environment.mjs`: 環境ステータスと設定を確認する診断スクリプト

  Use proactively when implementing deployment-environments-gha patterns or solving related problems.
version: 1.0.0
---

# Deployment Environments Skill (GitHub Actions)

GitHub Actions のデプロイメント環境機能を活用し、安全で管理された複数環境へのデプロイメントを実現するスキル。

## 使用タイミング

- **複数環境デプロイ**: development/staging/production への段階的デプロイ
- **承認ワークフロー**: 本番環境への手動承認が必要な場合
- **環境固有設定**: 環境ごとに異なるシークレットや変数を使用
- **保護ルール適用**: 特定ブランチからのみデプロイ可能にする
- **デプロイ履歴追跡**: 環境ごとのデプロイメント履歴を管理

## ディレクトリ構造

```
deployment-environments-gha/
├── SKILL.md                          # このファイル（~150-200行）
├── resources/
│   ├── environment-config.md         # 環境設定、保護ルール、シークレット
│   └── approval-workflows.md         # 承認者設定、待機タイマー、ゲート
├── templates/
│   └── deployment-workflow.yaml      # 複数環境デプロイの実装例
└── scripts/
    └── check-environment.mjs         # 環境ステータスチェッカー
```

## コマンドリファレンス

### リソース参照

```bash
# 環境設定の詳細（保護ルール、シークレット、変数）
cat .claude/skills/deployment-environments-gha/resources/environment-config.md

# 承認ワークフロー設計（レビュアー、タイマー、ゲート）
cat .claude/skills/deployment-environments-gha/resources/approval-workflows.md
```

### テンプレート使用

```bash
# 複数環境デプロイメントワークフローのサンプル
cat .claude/skills/deployment-environments-gha/templates/deployment-workflow.yaml
```

### スクリプト実行

```bash
# 環境のステータスと設定を確認
node .claude/skills/deployment-environments-gha/scripts/check-environment.mjs [environment-name]
```

## 環境の基本構文

### 環境指定

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com

    steps:
      - name: Deploy
        run: |
          echo "Deploying to ${{ github.event.deployment.environment }}"
          echo "URL: ${{ github.event.deployment.payload.url }}"
```

### 複数環境への段階的デプロイ

```yaml
name: Multi-Environment Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Dev
        run: echo "Deploying to development"

  deploy-staging:
    needs: deploy-dev
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Staging
        run: echo "Deploying to staging"

  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://prod.example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        run: echo "Deploying to production"
```

### 環境固有のシークレットと変数

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Deploy with Environment Secrets
        env:
          API_KEY: ${{ secrets.API_KEY }} # 環境固有
          DATABASE_URL: ${{ secrets.DATABASE_URL }} # 環境固有
          DEPLOY_ENV: ${{ vars.DEPLOY_ENV }} # 環境変数
        run: |
          echo "Deploying with API_KEY to $DEPLOY_ENV"
          ./deploy.sh
```

### 条件付き環境選択

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

    steps:
      - name: Deploy
        run: |
          echo "Deploying to environment: ${{ github.event.deployment.environment }}"
```

## 環境保護ルールの概要

### 主要な保護機能

1. **Required Reviewers**: 手動承認を要求（最大 6 名のレビュアー）
2. **Wait Timer**: デプロイ前の待機時間（最大 43,200 分 = 30 日）
3. **Deployment Branches**: 特定ブランチからのみデプロイ許可
4. **Environment Secrets**: 環境専用のシークレット管理

### 設定場所

```
Repository → Settings → Environments → [環境名] → Protection rules
```

詳細は `resources/environment-config.md` を参照してください。

## 承認ワークフローのパターン

### パターン 1: 単一承認者

```yaml
# 環境設定で1名のレビュアーを指定
environment:
  name: production # Settings で Required reviewers: 1人設定済み
```

### パターン 2: 複数承認者

```yaml
# 環境設定で複数のレビュアーを指定
environment:
  name: production # Settings で Required reviewers: 3人設定済み
```

### パターン 3: 待機タイマー併用

```yaml
# 環境設定で待機時間を追加
environment:
  name: production # Settings で Wait timer: 10分 + Required reviewers設定済み
```

詳細なパターンと実装例は `resources/approval-workflows.md` を参照してください。

## 関連スキル

このスキルは以下のスキルと組み合わせて使用します:

- **github-actions-syntax**: `.claude/skills/github-actions-syntax/SKILL.md`
  - 基本的なワークフロー構文の理解
- **secrets-management-gha**: `.claude/skills/secrets-management-gha/SKILL.md`
  - 環境固有のシークレット管理
- **conditional-execution-gha**: `.claude/skills/conditional-execution-gha/SKILL.md`
  - 環境ごとの条件分岐
- **workflow-security**: `.claude/skills/workflow-security/SKILL.md`
  - セキュアなデプロイメント設計

## ベストプラクティス

### 環境の命名規則

```yaml
# 推奨される環境名
environments:
  - development # または dev
  - staging # または stage, uat
  - production # または prod
```

### 段階的デプロイメント

```yaml
# 依存関係チェーンで安全性を確保
jobs:
  deploy-dev:
    environment: development

  deploy-staging:
    needs: deploy-dev
    environment: staging

  deploy-prod:
    needs: deploy-staging
    environment: production # 本番は最後
```

### 環境 URL の活用

```yaml
environment:
  name: production
  url: https://prod.example.com # デプロイメント履歴にリンク表示
```

## トラブルシューティング

### 承認が表示されない

原因: 環境保護ルールが未設定
解決: Repository Settings → Environments → Protection rules を確認

### 環境シークレットが使えない

原因: 環境名の不一致、またはシークレット未設定
解決: `environment:` の name と Settings の環境名が一致しているか確認

### デプロイが特定ブランチで失敗

原因: Deployment branches ルールで許可されていない
解決: Protection rules → Deployment branches で対象ブランチを追加

## さらに詳しく

- **環境設定の完全ガイド**: `resources/environment-config.md`
- **承認ワークフローの設計**: `resources/approval-workflows.md`
- **実装テンプレート**: `templates/deployment-workflow.yaml`
- **環境状態の確認**: `scripts/check-environment.mjs`
