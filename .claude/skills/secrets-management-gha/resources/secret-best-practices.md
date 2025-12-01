# GitHub Actions シークレット セキュリティベストプラクティス

## セキュリティ原則

### 1. 最小権限の原則 (Principle of Least Privilege)

**ワークフローレベル**:
```yaml
# ✅ 必要最小限のパーミッション
permissions:
  contents: read
  id-token: write  # OIDC用のみ

# ❌ 過剰なパーミッション
permissions: write-all
```

**シークレットスコープ**:
```yaml
# ✅ 環境ごとに分離
jobs:
  deploy-staging:
    environment: staging
    env:
      API_KEY: ${{ secrets.STAGING_API_KEY }}

  deploy-prod:
    environment: production
    env:
      API_KEY: ${{ secrets.PROD_API_KEY }}

# ❌ 全環境で同じシークレット
env:
  API_KEY: ${{ secrets.API_KEY }}  # 本番と開発で共有
```

---

## シークレット漏洩防止

### 1. ログ出力の注意

**避けるべきパターン**:
```yaml
# ❌ シークレットを直接echo
- name: Debug
  run: echo ${{ secrets.API_KEY }}

# ❌ env全体をダンプ
- name: Show env
  run: printenv

# ❌ シークレットを含むファイルを表示
- name: Show config
  run: cat config.json
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

**安全なパターン**:
```yaml
# ✅ シークレットは環境変数経由で使用のみ
- name: Deploy
  run: ./deploy.sh
  env:
    API_KEY: ${{ secrets.API_KEY }}

# ✅ シークレットの存在確認のみ
- name: Check secret
  run: |
    if [ -z "$API_KEY" ]; then
      echo "API_KEY is not set"
      exit 1
    fi
    echo "API_KEY is configured"
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

### 2. GitHubの自動マスキング

**マスキング動作**:
```yaml
- name: Test masking
  run: |
    echo "Secret value is: $SECRET"  # 自動的に *** に置換
  env:
    SECRET: ${{ secrets.MY_SECRET }}
```

**マスキングの制限**:
```yaml
# ⚠️ Base64エンコードされたシークレットはマスキングされない可能性
- name: Encode secret
  run: |
    echo $SECRET | base64  # エンコード値は表示される
  env:
    SECRET: ${{ secrets.MY_SECRET }}

# ✅ マスキング登録
- name: Add mask
  run: |
    ENCODED=$(echo $SECRET | base64)
    echo "::add-mask::$ENCODED"
    echo "Encoded: $ENCODED"
  env:
    SECRET: ${{ secrets.MY_SECRET }}
```

### 3. アーティファクトとキャッシュ

**避けるべきパターン**:
```yaml
# ❌ シークレットを含むファイルをアップロード
- name: Upload config
  uses: actions/upload-artifact@v3
  with:
    name: config
    path: config-with-secrets.json

# ❌ シークレットをキャッシュ
- uses: actions/cache@v3
  with:
    path: ~/.secrets
    key: secrets-${{ github.sha }}
```

**安全なパターン**:
```yaml
# ✅ ビルド成果物のみアップロード
- name: Build
  run: pnpm run build
  env:
    API_KEY: ${{ secrets.API_KEY }}

- name: Upload artifacts
  uses: actions/upload-artifact@v3
  with:
    name: dist
    path: dist/  # シークレット不含

# ✅ .gitignoreパターン使用
- uses: actions/upload-artifact@v3
  with:
    name: output
    path: |
      dist/
      !dist/**/*.env
      !dist/**/*.key
```

---

## Pull Requestセキュリティ

### 1. フォークからのPull Request

**リスク**:
- フォークリポジトリからのPRは、元のリポジトリのシークレットにアクセス可能
- 悪意のあるコードによるシークレット窃取のリスク

**安全なパターン**:
```yaml
# ❌ pull_requestトリガーでシークレット使用
name: CI
on: pull_request
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: ./test.sh
        env:
          API_KEY: ${{ secrets.API_KEY }}  # フォークから窃取可能

# ✅ pull_request_targetと明示的な承認
name: CI
on:
  pull_request_target:  # ベースリポジトリのコンテキストで実行
    types: [labeled]

jobs:
  test:
    if: contains(github.event.pull_request.labels.*.name, 'safe-to-test')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - run: ./test.sh
        env:
          API_KEY: ${{ secrets.API_KEY }}
```

### 2. ブランチ保護

**GitHub設定**:
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main, 'release/*']  # 保護されたブランチのみ

jobs:
  deploy:
    environment: production  # 環境保護も併用
    steps:
      - run: ./deploy.sh
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

**環境保護ルール**:
1. Required reviewers: 承認者2名必須
2. Wait timer: 5分待機
3. Deployment branches: `main`と`release/*`のみ

---

## シークレットローテーション

### 1. 定期ローテーション戦略

**推奨サイクル**:
- 本番環境: 90日
- ステージング環境: 180日
- 開発環境: 365日

**ローテーション手順**:
```bash
#!/bin/bash
# secret-rotation.sh

# 1. 新しいシークレット生成
NEW_SECRET=$(openssl rand -base64 32)

# 2. GitHub Secretsに登録
gh secret set API_KEY --body "$NEW_SECRET"

# 3. 外部サービスで更新（例: AWS）
aws secretsmanager update-secret \
  --secret-id production/api-key \
  --secret-string "$NEW_SECRET"

# 4. デプロイ実行（新シークレットで動作確認）
gh workflow run deploy.yml

# 5. 古いシークレットを無効化（確認後）
```

### 2. OIDC使用（推奨）

**メリット**:
- 自動ローテーション
- 長期認証情報不要
- 漏洩リスク最小化

**実装例**:
```yaml
jobs:
  deploy:
    permissions:
      id-token: write  # 短期トークン自動生成
      contents: read
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          # トークンは1時間で自動失効
```

---

## 監査とコンプライアンス

### 1. シークレット使用の追跡

**GitHub監査ログ**:
```bash
# 組織レベルの監査ログ
gh api /orgs/ORG-NAME/audit-log \
  --jq '.[] | select(.action | contains("secret"))'

# シークレット変更履歴
gh api /orgs/ORG-NAME/audit-log \
  -f phrase="action:org.update_actions_secret" \
  --jq '.[] | {timestamp: .created_at, secret: .data.secret_name, actor: .actor}'
```

**ワークフロー実行ログ**:
```yaml
# ワークフロー内で使用記録
- name: Log secret usage
  run: |
    echo "::notice::Using API_KEY secret at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

### 2. アクセス制御レビュー

**定期チェックリスト**:
```bash
#!/bin/bash
# audit-secrets.sh

echo "=== Repository Secrets ==="
gh secret list

echo "=== Environment Secrets ==="
for env in staging production; do
  echo "Environment: $env"
  gh api "repos/OWNER/REPO/environments/$env/secrets" --jq '.secrets[].name'
done

echo "=== Organization Secrets ==="
gh api "orgs/ORG/actions/secrets" --jq '.secrets[] | {name, visibility, selected_repositories_url}'
```

**レビュー項目**:
- [ ] 未使用シークレットの削除
- [ ] 過剰な権限スコープの確認
- [ ] ローテーション履歴の確認
- [ ] アクセスログの異常検知

### 3. コンプライアンス要件

**SOC 2 / ISO 27001対応**:
```yaml
# コンプライアンス強化ワークフロー
jobs:
  deploy:
    environment:
      name: production
      # 承認ゲート（監査証跡）
    steps:
      - name: Compliance Check
        run: |
          echo "::notice::Deployment initiated by ${{ github.actor }}"
          echo "::notice::Commit SHA: ${{ github.sha }}"
          echo "::notice::Environment: production"
          echo "::notice::Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

      - name: Deploy
        run: ./deploy.sh
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}

      - name: Audit Log
        if: always()
        run: |
          curl -X POST https://audit-service.example.com/log \
            -H "Content-Type: application/json" \
            -d '{
              "event": "deployment",
              "actor": "${{ github.actor }}",
              "repository": "${{ github.repository }}",
              "sha": "${{ github.sha }}",
              "environment": "production",
              "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
            }'
```

---

## セキュリティスキャンと検出

### 1. シークレットスキャン有効化

**GitHub Secret Scanning**:
```yaml
# リポジトリ設定で有効化
# Settings → Security → Secret scanning

# パートナーパターン（自動有効）:
# - AWS Access Keys
# - Azure Connection Strings
# - GitHub Personal Access Tokens
# - Google API Keys
# など
```

**カスタムパターン**:
```yaml
# .github/secret_scanning.yml
patterns:
  - name: Custom API Key
    regex: 'myapp_[a-zA-Z0-9]{32}'
    secret_type: custom_api_key
```

### 2. Pre-commit Hooks

**git-secrets使用**:
```bash
# インストール
brew install git-secrets

# セットアップ
git secrets --install
git secrets --register-aws

# カスタムパターン追加
git secrets --add 'myapp_[a-zA-Z0-9]{32}'

# スキャン実行
git secrets --scan
```

**pre-commit設定**:
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

### 3. ワークフロー内スキャン

```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Detect Secrets
        uses: reviewdog/action-detect-secrets@v0.18
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          reporter: github-pr-review
          fail_on_error: true

      - name: TruffleHog Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

---

## インシデント対応

### 1. シークレット漏洩時の手順

**即時対応**:
```bash
# 1. シークレットを即座に無効化
gh secret delete LEAKED_SECRET

# 2. 外部サービスのキーを無効化
aws iam delete-access-key --access-key-id AKIAIOSFODNN7EXAMPLE

# 3. 新しいシークレット生成・登録
NEW_SECRET=$(openssl rand -base64 32)
gh secret set NEW_SECRET --body "$NEW_SECRET"

# 4. 影響範囲調査
gh api /repos/OWNER/REPO/actions/runs \
  --jq '.workflow_runs[] | select(.created_at > "2024-01-01") | {id, name, created_at}'
```

**Gitヒストリークリーンアップ**:
```bash
# BFG Repo-Cleaner使用
git clone --mirror git@github.com:owner/repo.git
bfg --delete-files id_rsa repo.git
cd repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push
```

### 2. インシデント報告

**内部報告テンプレート**:
```markdown
## シークレット漏洩インシデント報告

**検出日時**: 2024-01-15 10:30 UTC
**検出方法**: GitHub Secret Scanning Alert
**漏洩シークレット**: AWS_ACCESS_KEY_ID
**影響範囲**: Production環境

### 対応履歴
1. [10:31] シークレット無効化
2. [10:35] 新シークレット発行・登録
3. [10:40] 影響調査開始
4. [11:00] Gitヒストリークリーンアップ

### 根本原因
開発者がテストコード内にハードコード

### 再発防止策
- Pre-commit hookの強制
- シークレットスキャン強化
- 開発者向けトレーニング実施
```

---

## 開発者教育

### 1. セキュアコーディングガイドライン

**Do's**:
```yaml
# ✅ 環境変数経由
- run: ./script.sh
  env:
    API_KEY: ${{ secrets.API_KEY }}

# ✅ 環境ごとに分離
environment: production

# ✅ OIDC使用
permissions:
  id-token: write
```

**Don'ts**:
```yaml
# ❌ ハードコード
- run: export API_KEY=secret123

# ❌ ログ出力
- run: echo ${{ secrets.API_KEY }}

# ❌ コミット
- run: echo $SECRET > config.json
  # config.jsonがコミットされる危険
```

### 2. トレーニングチェックリスト

開発者が理解すべき項目:
- [ ] シークレットとは何か、なぜ保護が必要か
- [ ] GitHub Secretsの設定方法
- [ ] 環境変数での安全な使用方法
- [ ] pull_request vs pull_request_targetの違い
- [ ] OIDC認証の利点
- [ ] シークレット漏洩時の対応手順
- [ ] 監査ログの確認方法

---

## ツールとサービス

### 1. シークレット管理サービス

**HashiCorp Vault**:
```yaml
- uses: hashicorp/vault-action@v3
  with:
    url: https://vault.example.com
    method: jwt
    secrets: |
      secret/data/production password | DB_PASSWORD
```

**AWS Secrets Manager**:
```yaml
- uses: aws-actions/aws-secretsmanager-get-secrets@v1
  with:
    secret-ids: |
      production/db
      production/api
    parse-json-secrets: true
```

**Azure Key Vault**:
```yaml
- uses: Azure/get-keyvault-secrets@v1
  with:
    keyvault: "my-vault"
    secrets: 'db-password, api-key'
```

### 2. 監視・アラート

**GitHub Advanced Security**:
- Secret scanning alerts
- Dependency vulnerability alerts
- Code scanning (CodeQL)

**サードパーティツール**:
- GitGuardian
- TruffleHog
- Detect-secrets

---

## まとめ

### セキュリティチェックリスト

**設計時**:
- [ ] 最小権限の原則を適用
- [ ] 環境ごとにシークレット分離
- [ ] OIDC認証を検討

**実装時**:
- [ ] シークレットをログ出力しない
- [ ] 環境変数経由でのみ使用
- [ ] pull_requestトリガーでシークレット使用しない

**運用時**:
- [ ] 定期的なローテーション（90日）
- [ ] 監査ログレビュー
- [ ] 未使用シークレット削除

**インシデント対応**:
- [ ] 即座に無効化
- [ ] 影響範囲調査
- [ ] Gitヒストリークリーンアップ
- [ ] 再発防止策実施
