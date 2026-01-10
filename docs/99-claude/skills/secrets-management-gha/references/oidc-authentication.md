# OIDC認証 (OpenID Connect)

## OIDC概要

**OpenID Connect (OIDC)** を使用すると、GitHub Actionsワークフローが長期的な認証情報を保存せずに、クラウドプロバイダーのリソースに安全にアクセスできます。

### メリット

1. **セキュリティ向上**:
   - 長期認証情報（アクセスキー、パスワード）不要
   - 短期トークンの自動ローテーション
   - 漏洩リスクの大幅削減

2. **きめ細かいアクセス制御**:
   - リポジトリ、ブランチ、環境単位での権限設定
   - 条件付きアクセスポリシー
   - 最小権限の原則を実現

3. **監査とコンプライアンス**:
   - すべてのアクセスが監査ログに記録
   - トークン発行元の透明性
   - コンプライアンス要件の充足

4. **運用効率**:
   - 認証情報のローテーション作業不要
   - シークレット管理の負担軽減
   - 自動化の向上

### 基本概念

```
GitHub Actions Workflow
    ↓ (1) OIDCトークン要求
GitHub OIDC Provider (token.actions.githubusercontent.com)
    ↓ (2) JWTトークン発行
Cloud Provider (AWS/GCP/Azure)
    ↓ (3) トークン検証 & 権限付与
    ↓ (4) 一時認証情報発行
Workflow (短期トークンで操作実行)
```

---

## AWS認証 (AssumeRoleWithWebIdentity)

### 前提条件

1. AWS IAMでOIDCプロバイダー設定
2. GitHub Actions用のIAMロール作成
3. 信頼ポリシーでGitHub OIDC許可

### IAM OIDC プロバイダー設定

**AWS Management Console**:

1. IAM → Identity providers → Add provider
2. Provider type: OpenID Connect
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`

**AWS CLI**:

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### IAMロール作成

**信頼ポリシー** (`trust-policy.json`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:octo-org/octo-repo:*"
        }
      }
    }
  ]
}
```

**条件付きアクセス例**:

```json
{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub": "repo:octo-org/octo-repo:ref:refs/heads/main"
    }
  }
}
```

**ワイルドカード使用**:

```json
{
  "Condition": {
    "StringLike": {
      "token.actions.githubusercontent.com:sub": [
        "repo:octo-org/octo-repo:*",
        "repo:octo-org/another-repo:environment:production"
      ]
    }
  }
}
```

**IAMロール作成**:

```bash
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://trust-policy.json

# ポリシーアタッチ
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

### ワークフロー実装

**基本パターン**:

```yaml
name: AWS OIDC Example
on: push

permissions:
  id-token: write # OIDC トークン取得に必須
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          aws-region: us-east-1

      - name: Verify AWS Identity
        run: aws sts get-caller-identity

      - name: List S3 Buckets
        run: aws s3 ls
```

**複数リージョン対応**:

```yaml
jobs:
  deploy:
    strategy:
      matrix:
        region: [us-east-1, eu-west-1, ap-northeast-1]
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          aws-region: ${{ matrix.region }}
```

**セッション名カスタマイズ**:

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
    role-session-name: GitHubActions-${{ github.run_id }}
    aws-region: us-east-1
```

---

## GCP認証 (Workload Identity Federation)

### 前提条件

1. GCP Workload Identity Pool作成
2. Workload Identity Provider設定（GitHub用）
3. サービスアカウントとの紐付け

### Workload Identity Pool設定

**gcloud CLI**:

```bash
# Workload Identity Pool作成
gcloud iam workload-identity-pools create "github-pool" \
  --project="my-project" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# GitHub Provider作成
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="my-project" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

**属性マッピング**:

```
google.subject = assertion.sub
attribute.actor = assertion.actor
attribute.repository = assertion.repository
attribute.repository_owner = assertion.repository_owner
attribute.ref = assertion.ref
```

### サービスアカウント設定

**サービスアカウント作成**:

```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account"
```

**IAMポリシーバインディング**:

```bash
# 条件なし（すべてのリポジトリ）
gcloud iam service-accounts add-iam-policy-binding \
  github-actions@my-project.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/github-pool/attribute.repository/octo-org/octo-repo"

# 条件付き（特定ブランチのみ）
gcloud iam service-accounts add-iam-policy-binding \
  github-actions@my-project.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/123456789/locations/global/workloadIdentityPools/github-pool/attribute.repository/octo-org/octo-repo" \
  --condition='expression=assertion.sub.startsWith("repo:octo-org/octo-repo:ref:refs/heads/main"),title=main-branch-only'
```

### ワークフロー実装

**基本パターン**:

```yaml
name: GCP OIDC Example
on: push

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: "projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
          service_account: "github-actions@my-project.iam.gserviceaccount.com"

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Verify Identity
        run: gcloud auth list

      - name: List GCS Buckets
        run: gcloud storage buckets list
```

**アクセストークン直接取得**:

```yaml
- uses: google-github-actions/auth@v2
  id: auth
  with:
    token_format: "access_token"
    workload_identity_provider: "projects/.../providers/github-provider"
    service_account: "github-actions@my-project.iam.gserviceaccount.com"

- name: Use Access Token
  run: |
    echo "Token: ${{ steps.auth.outputs.access_token }}"
    curl -H "Authorization: Bearer ${{ steps.auth.outputs.access_token }}" \
      https://storage.googleapis.com/storage/v1/b
```

---

## Azure認証 (Workload Identity Federation)

### 前提条件

1. Azure AD アプリケーション登録
2. Federated Credentials設定
3. サブスクリプションへのロール割り当て

### Azure AD アプリケーション設定

**Azure CLI**:

```bash
# アプリケーション登録
az ad app create --display-name "GitHub Actions App"

# サービスプリンシパル作成
az ad sp create --id <app-id>

# Federated Credential追加
az ad app federated-credential create \
  --id <app-id> \
  --parameters '{
    "name": "GitHubActionsFederation",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:octo-org/octo-repo:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

**条件付きアクセス例**:

```json
{
  "subject": "repo:octo-org/octo-repo:environment:production"
}
```

**ロール割り当て**:

```bash
az role assignment create \
  --assignee <app-id> \
  --role "Contributor" \
  --scope /subscriptions/<subscription-id>/resourceGroups/<resource-group>
```

### ワークフロー実装

**基本パターン**:

```yaml
name: Azure OIDC Example
on: push

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Verify Azure Identity
        run: az account show

      - name: List Resource Groups
        run: az group list --output table
```

**複数環境対応**:

```yaml
jobs:
  deploy:
    strategy:
      matrix:
        environment: [staging, production]
    environment: ${{ matrix.environment }}
    steps:
      - uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

---

## HashiCorp Vault認証

### Vault設定

**JWT Auth Methodの有効化**:

```bash
vault auth enable jwt

vault write auth/jwt/config \
  bound_issuer="https://token.actions.githubusercontent.com" \
  oidc_discovery_url="https://token.actions.githubusercontent.com"
```

**ロール作成**:

```bash
vault write auth/jwt/role/github-actions \
  role_type="jwt" \
  bound_audiences="https://github.com/octo-org" \
  bound_subject="repo:octo-org/octo-repo:ref:refs/heads/main" \
  user_claim="actor" \
  policies="deploy-policy" \
  ttl="1h"
```

### ワークフロー実装

```yaml
name: Vault OIDC Example
on: push

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Import Secrets from Vault
        uses: hashicorp/vault-action@v3
        with:
          url: https://vault.example.com
          method: jwt
          role: github-actions
          jwtGithubAudience: https://github.com/octo-org
          secrets: |
            secret/data/production/db password | DB_PASSWORD ;
            secret/data/production/api key | API_KEY

      - name: Use Secrets
        run: |
          echo "Database password available"
          echo "API key available"
        env:
          DB_PASS: ${{ env.DB_PASSWORD }}
          API: ${{ env.API_KEY }}
```

---

## OIDC トークンのカスタマイズ

### カスタムオーディエンス

**デフォルト**:

- AWS: `sts.amazonaws.com`
- GCP: Workload Identity Provider URL
- Azure: `api://AzureADTokenExchange`

**カスタマイズ**:

```yaml
jobs:
  deploy:
    permissions:
      id-token: write
    steps:
      - name: Get OIDC Token
        id: oidc
        run: |
          TOKEN=$(curl -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
            "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=custom-audience" | jq -r '.value')
          echo "token=$TOKEN" >> $GITHUB_OUTPUT
```

### トークンクレーム

**標準クレーム**:

```json
{
  "jti": "example-id",
  "sub": "repo:octo-org/octo-repo:ref:refs/heads/main",
  "aud": "https://github.com/octo-org",
  "ref": "refs/heads/main",
  "sha": "abc123",
  "repository": "octo-org/octo-repo",
  "repository_owner": "octo-org",
  "run_id": "123456789",
  "run_number": "42",
  "run_attempt": "1",
  "actor": "octocat",
  "workflow": "CI",
  "head_ref": "",
  "base_ref": "",
  "event_name": "push",
  "ref_type": "branch",
  "environment": "production",
  "job_workflow_ref": "octo-org/octo-repo/.github/workflows/ci.yml@refs/heads/main"
}
```

---

## トラブルシューティング

### エラー: "Unable to get ACTIONS_ID_TOKEN_REQUEST_URL"

**原因**: `id-token: write`パーミッション未設定

**解決**:

```yaml
permissions:
  id-token: write # 必須
  contents: read
```

### エラー: "Not authorized to perform sts:AssumeRoleWithWebIdentity"

**原因**: IAMロールの信頼ポリシーが不正

**確認ポイント**:

1. OIDC プロバイダーARNが正しいか
2. `sub` クレーム条件がリポジトリ/ブランチと一致するか
3. `aud` クレーム条件が正しいか

**デバッグ**:

```yaml
- name: Decode OIDC Token
  run: |
    OIDC_TOKEN=$(curl -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
      "$ACTIONS_ID_TOKEN_REQUEST_URL" | jq -r '.value')
    echo $OIDC_TOKEN | cut -d'.' -f2 | base64 -d | jq
```

### エラー: "Audience validation failed"

**原因**: オーディエンスが一致しない

**解決**:

- AWS: `sts.amazonaws.com`
- 信頼ポリシーのaudienceと一致させる

---

## ベストプラクティス

### 1. 最小権限の原則

```json
{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:sub": "repo:octo-org/octo-repo:environment:production"
    }
  }
}
```

### 2. 環境ごとの分離

```yaml
jobs:
  deploy-staging:
    environment: staging
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_STAGING }}

  deploy-production:
    environment: production
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_PRODUCTION }}
```

### 3. 監査ログの活用

- CloudTrail (AWS)
- Cloud Audit Logs (GCP)
- Azure Activity Log

すべてのOIDCベースアクセスを記録・監視
