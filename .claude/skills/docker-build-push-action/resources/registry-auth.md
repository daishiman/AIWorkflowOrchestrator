# コンテナレジストリ認証パターン

## 概要

GitHub ActionsからDockerイメージをプッシュする際の各種コンテナレジストリの認証方法を提供します。

## GitHub Container Registry (GHCR)

### 標準認証（推奨）

```yaml
- name: Log in to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

**特徴**:

- `GITHUB_TOKEN`は自動的に利用可能（Secrets設定不要）
- リポジトリの`packages: write`権限が必要

### 権限設定

```yaml
permissions:
  contents: read # リポジトリ読み取り
  packages: write # GHCRへのプッシュ
```

### パッケージの可視性

**イメージ名の形式**:

```
ghcr.io/OWNER/REPOSITORY:TAG
```

**例**:

```yaml
tags: |
  ghcr.io/${{ github.repository }}:latest
  ghcr.io/${{ github.repository }}:${{ github.sha }}
```

### パッケージ権限管理

GitHub UIで設定:

1. リポジトリ → Packages
2. パッケージ選択 → Settings
3. Visibility（Public/Private）設定
4. Manage Actions access（リポジトリアクセス許可）

## Docker Hub

### Personal Access Token（推奨）

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

**Secrets設定**:

- `DOCKERHUB_USERNAME`: Docker Hubユーザー名
- `DOCKERHUB_TOKEN`: Personal Access Token（パスワードではなくトークン推奨）

### Personal Access Token作成

Docker Hubで:

1. Account Settings → Security
2. New Access Token
3. Description入力、Read & Write権限選択
4. トークンをコピーしてGitHub Secretsに保存

### イメージ名の形式

```
docker.io/USERNAME/REPOSITORY:TAG
```

**例**:

```yaml
tags: |
  docker.io/${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
  docker.io/${{ secrets.DOCKERHUB_USERNAME }}/myapp:${{ github.sha }}
```

### レート制限対策

Docker Hub無料プランのレート制限:

- 未認証: 100 pulls/6時間
- 認証済み: 200 pulls/6時間
- Pro以上: 無制限

**対策**:

```yaml
# 認証してレート制限を緩和
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

# ベースイメージキャッシュ
- name: Cache Docker layers
  uses: actions/cache@v3
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-
```

## Amazon ECR (Elastic Container Registry)

### Public ECR

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1 # Public ECRはus-east-1固定

- name: Log in to Amazon ECR Public
  uses: docker/login-action@v3
  with:
    registry: public.ecr.aws
    username: ${{ env.AWS_ACCESS_KEY_ID }}
    password: ${{ env.AWS_SECRET_ACCESS_KEY }}
```

**イメージ名の形式**:

```
public.ecr.aws/ALIAS/REPOSITORY:TAG
```

### Private ECR

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-northeast-1 # 任意のリージョン

- name: Log in to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ steps.login-ecr.outputs.registry }}/myapp:latest
```

**イメージ名の形式**:

```
AWS_ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/REPOSITORY:TAG
```

### IAMポリシー（最小権限）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:REGION:ACCOUNT_ID:repository/REPOSITORY_NAME"
    }
  ]
}
```

### OIDCによる認証（推奨）

```yaml
- name: Configure AWS credentials (OIDC)
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::AWS_ACCOUNT_ID:role/GitHubActionsRole
    aws-region: ap-northeast-1

# 以降は通常のECRログイン
- name: Log in to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2
```

**IAM Roleの信頼ポリシー**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:*"
        }
      }
    }
  ]
}
```

## Google Container Registry (GCR) / Artifact Registry

### GCR（レガシー）

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

- name: Log in to GCR
  uses: docker/login-action@v3
  with:
    registry: gcr.io
    username: _json_key
    password: ${{ secrets.GCP_SA_KEY }}

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: gcr.io/PROJECT_ID/myapp:latest
```

**イメージ名の形式**:

```
gcr.io/PROJECT_ID/REPOSITORY:TAG
```

### Artifact Registry（推奨）

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

- name: Set up Cloud SDK
  uses: google-github-actions/setup-gcloud@v2

- name: Configure Docker for Artifact Registry
  run: gcloud auth configure-docker REGION-docker.pkg.dev

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE:latest
```

**イメージ名の形式**:

```
REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE:TAG
```

**リージョン例**:

- `us-central1-docker.pkg.dev`
- `asia-northeast1-docker.pkg.dev`
- `europe-west1-docker.pkg.dev`

### サービスアカウント権限

必要なIAMロール:

- `roles/artifactregistry.writer` または
- `roles/storage.admin`（GCRの場合）

### Workload Identity（推奨）

```yaml
permissions:
  contents: read
  id-token: write # OIDC用

steps:
  - name: Authenticate to Google Cloud
    uses: google-github-actions/auth@v2
    with:
      workload_identity_provider: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL/providers/PROVIDER
      service_account: SA_NAME@PROJECT_ID.iam.gserviceaccount.com

  - name: Configure Docker
    run: gcloud auth configure-docker asia-northeast1-docker.pkg.dev

  - name: Build and push
    uses: docker/build-push-action@v5
    with:
      context: .
      push: true
      tags: asia-northeast1-docker.pkg.dev/PROJECT_ID/myapp/api:latest
```

## Azure Container Registry (ACR)

### サービスプリンシパル認証

```yaml
- name: Log in to Azure
  uses: azure/login@v2
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Log in to ACR
  uses: docker/login-action@v3
  with:
    registry: REGISTRY_NAME.azurecr.io
    username: ${{ secrets.ACR_USERNAME }}
    password: ${{ secrets.ACR_PASSWORD }}

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: REGISTRY_NAME.azurecr.io/myapp:latest
```

**イメージ名の形式**:

```
REGISTRY_NAME.azurecr.io/REPOSITORY:TAG
```

### Azure Credentials形式

```json
{
  "clientId": "CLIENT_ID",
  "clientSecret": "CLIENT_SECRET",
  "subscriptionId": "SUBSCRIPTION_ID",
  "tenantId": "TENANT_ID"
}
```

### 管理者ユーザー有効化

Azure Portal:

1. Container Registry → Access keys
2. Admin user: Enabled
3. Username/Password をコピーしてGitHub Secretsに保存

## 複数レジストリへの同時プッシュ

### 方法1: docker/login-actionを複数回実行

```yaml
- name: Log in to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

- name: Build and push to multiple registries
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      ghcr.io/${{ github.repository }}:latest
      docker.io/${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
```

### 方法2: メタデータアクションで統一管理

```yaml
- name: Extract metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: |
      ghcr.io/${{ github.repository }}
      docker.io/${{ secrets.DOCKERHUB_USERNAME }}/myapp
    tags: |
      type=ref,event=branch
      type=semver,pattern={{version}}
      type=sha

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ steps.meta.outputs.tags }}
```

## セキュリティベストプラクティス

### Secrets管理

```yaml
# ❌ 悪い例: ハードコード
password: mypassword123

# ✅ 良い例: GitHub Secrets使用
password: ${{ secrets.REGISTRY_PASSWORD }}
```

### 最小権限の原則

```yaml
permissions:
  contents: read # 最小限の読み取り権限
  packages: write # プッシュに必要な権限のみ
  # id-token: write     # OIDC使用時のみ追加
```

### PR時のプッシュ禁止

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    # PRではビルドのみ、mainブランチでプッシュ
    push: ${{ github.event_name != 'pull_request' }}
    tags: ghcr.io/${{ github.repository }}:latest
```

### タグの衛生管理

```yaml
# ❌ 悪い例: 全ブランチでlatestタグ
tags: ghcr.io/${{ github.repository }}:latest

# ✅ 良い例: mainブランチのみlatestタグ
tags: |
  ghcr.io/${{ github.repository }}:${{ github.sha }}
  ghcr.io/${{ github.repository }}:latest,enable=${{ github.ref == 'refs/heads/main' }}
```

## トラブルシューティング

### 認証エラー

**GHCR**:

```yaml
# 権限不足エラーの場合
permissions:
  packages: write  # この権限を追加

# GITHUB_TOKENの確認
- name: Debug token
  run: echo "Token exists: ${{ secrets.GITHUB_TOKEN != '' }}"
```

**Docker Hub**:

```yaml
# トークン/パスワードの確認
- name: Debug credentials
  run: |
    echo "Username exists: ${{ secrets.DOCKERHUB_USERNAME != '' }}"
    echo "Token exists: ${{ secrets.DOCKERHUB_TOKEN != '' }}"
```

### レート制限エラー

```yaml
# Docker Hubレート制限回避
- name: Log in to Docker Hub (for rate limit)
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

# ベースイメージのpull前に認証
- name: Build
  uses: docker/build-push-action@v5
  with:
    context: .
    pull: true # 認証済みでpull
```

### マルチレジストリ認証の順序

```yaml
# 順序が重要: レジストリ別に認証
steps:
  # 1. GHCR認証
  - uses: docker/login-action@v3
    with:
      registry: ghcr.io
      username: ${{ github.actor }}
      password: ${{ secrets.GITHUB_TOKEN }}

  # 2. Docker Hub認証
  - uses: docker/login-action@v3
    with:
      username: ${{ secrets.DOCKERHUB_USERNAME }}
      password: ${{ secrets.DOCKERHUB_TOKEN }}

  # 3. ビルド・プッシュ（両方のレジストリに）
  - uses: docker/build-push-action@v5
    with:
      push: true
      tags: |
        ghcr.io/${{ github.repository }}:latest
        docker.io/username/repo:latest
```

## 参考資料

- [docker/login-action](https://github.com/docker/login-action)
- [GHCR ドキュメント](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Hub ドキュメント](https://docs.docker.com/docker-hub/)
- [Amazon ECR ドキュメント](https://docs.aws.amazon.com/ecr/)
- [Google Artifact Registry](https://cloud.google.com/artifact-registry/docs)
- [Azure Container Registry](https://docs.microsoft.com/azure/container-registry/)
