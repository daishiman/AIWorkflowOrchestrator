---
name: secrets-management-gha
description: |
  GitHub Actionsワークフローでの安全な秘密情報管理。
  リポジトリシークレット、環境シークレット、組織シークレット、Dependabotシークレットの使用方法、
  OIDCによるクラウドプロバイダー認証、シークレットローテーション、監査ベストプラクティスを提供。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/secrets-management-gha/resources/oidc-authentication.md`: OIDC Authenticationリソース
  - `.claude/skills/secrets-management-gha/resources/secret-best-practices.md`: Secret Best Practicesリソース
  - `.claude/skills/secrets-management-gha/resources/secret-types.md`: Secret Typesリソース

  - `.claude/skills/secrets-management-gha/templates/oidc-examples.yaml`: OIDC Examplesテンプレート

  - `.claude/skills/secrets-management-gha/scripts/check-secret-usage.mjs`: Check Secret Usageスクリプト

  Use proactively when implementing GitHub Actions workflows with secret management,
  OIDC authentication, or secure credential handling.
version: 1.0.0
---

# GitHub Actions Secrets Management

GitHub Actions ワークフローでの秘密情報の安全な管理と使用方法。

## ディレクトリ構造

```
.claude/skills/secrets-management-gha/
├── SKILL.md                        # 本ファイル（概要とリファレンス）
├── resources/
│   ├── secret-types.md             # シークレットの種類と優先順位
│   ├── oidc-authentication.md      # OIDC認証詳細（AWS/GCP/Azure）
│   └── secret-best-practices.md    # セキュリティベストプラクティス
├── templates/
│   └── oidc-examples.yaml          # OIDCワークフローテンプレート
└── scripts/
    └── check-secret-usage.mjs      # シークレット使用チェッカー
```

## コマンドリファレンス

### リソース参照

```bash
# シークレットの種類と優先順位
cat .claude/skills/secrets-management-gha/resources/secret-types.md

# OIDC認証設定（AWS/GCP/Azure）
cat .claude/skills/secrets-management-gha/resources/oidc-authentication.md

# セキュリティベストプラクティス
cat .claude/skills/secrets-management-gha/resources/secret-best-practices.md
```

### テンプレート参照

```bash
# OIDCワークフロー例
cat .claude/skills/secrets-management-gha/templates/oidc-examples.yaml
```

### スクリプト実行

```bash
# ワークフローファイル内のシークレット使用チェック
node .claude/skills/secrets-management-gha/scripts/check-secret-usage.mjs <workflow-file.yml>
```

## シークレットタイプ概要

### 1. リポジトリシークレット

- スコープ: 単一リポジトリのすべてのワークフロー
- 設定場所: Settings → Secrets and variables → Actions
- アクセス: `${{ secrets.SECRET_NAME }}`

### 2. 環境シークレット

- スコープ: 特定の環境（production, staging 等）
- 保護ルール: レビュー要求、待機タイマー、デプロイブランチ制限
- アクセス: `environment`キー指定が必要

### 3. 組織シークレット

- スコープ: 組織内の複数リポジトリ
- 可視性: 選択したリポジトリまたはすべて
- 優先順位: リポジトリ > 環境 > 組織

### 4. Dependabot シークレット

- スコープ: Dependabot ワークフロー専用
- 用途: プライベートレジストリ認証

## Secrets コンテキストアクセスパターン

### 基本アクセス

```yaml
- name: Use secret
  run: echo "Secret exists"
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}
```

### 環境シークレット

```yaml
jobs:
  deploy:
    environment: production
    steps:
      - name: Deploy with env secret
        run: deploy.sh
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

### 条件付きアクセス

```yaml
- name: Conditional secret
  if: ${{ secrets.OPTIONAL_SECRET != '' }}
  env:
    SECRET: ${{ secrets.OPTIONAL_SECRET }}
```

## OIDC 認証（概要）

### メリット

- ✅ 長期認証情報不要
- ✅ 自動ローテーション
- ✅ きめ細かいアクセス制御
- ✅ 監査証跡

### サポートクラウド

- AWS (AssumeRoleWithWebIdentity)
- GCP (Workload Identity Federation)
- Azure (Workload Identity Federation)
- HashiCorp Vault

### 基本パターン

```yaml
jobs:
  deploy:
    permissions:
      id-token: write # OIDC トークン要求
      contents: read
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          aws-region: us-east-1
```

## セキュリティベストプラクティス（概要）

### 最小権限の原則

```yaml
permissions:
  contents: read
  id-token: write # 必要な権限のみ
```

### シークレット漏洩防止

- ❌ `echo ${{ secrets.SECRET }}`（ログに表示される）
- ✅ 環境変数経由でのみ使用
- ✅ GitHub 自動マスキング機能を信頼

### ローテーション戦略

- 定期的なシークレット更新（90 日推奨）
- OIDC 使用で自動ローテーション
- 監査ログレビュー

## セキュリティ考慮事項

### 避けるべきパターン

```yaml
# ❌ シークレットをログ出力
- run: echo ${{ secrets.API_KEY }}

# ❌ Pull Requestトリガーでシークレット使用
on: pull_request  # フォークからアクセス可能

# ❌ シークレットをアーティファクトに含める
- uses: actions/upload-artifact@v3
  with:
    path: config-with-secrets.json
```

### 推奨パターン

```yaml
# ✅ 環境変数経由
- run: ./deploy.sh
  env:
    API_KEY: ${{ secrets.API_KEY }}

# ✅ プロテクテッド環境
environment: production  # レビュー必須

# ✅ OIDC使用
permissions:
  id-token: write
```

## 関連スキル

このスキルは以下のスキルと連携します:

- **workflow-security** (`.claude/skills/workflow-security/SKILL.md`): 全体的なワークフローセキュリティ戦略
- **deployment-environments-gha** (`.claude/skills/deployment-environments-gha/SKILL.md`): 環境ベースのデプロイ保護
- **github-api-integration** (`.claude/skills/github-api-integration/SKILL.md`): API 経由のシークレット管理

## 詳細情報

各トピックの詳細は、対応するリソースファイルを参照してください:

1. **シークレットタイプと優先順位**: `resources/secret-types.md`
2. **OIDC 認証設定**: `resources/oidc-authentication.md`
3. **セキュリティベストプラクティス**: `resources/secret-best-practices.md`
4. **実装例**: `templates/oidc-examples.yaml`
