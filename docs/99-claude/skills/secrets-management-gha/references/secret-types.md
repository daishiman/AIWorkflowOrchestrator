# GitHub Actions シークレットタイプ

## シークレットの種類

### 1. リポジトリシークレット (Repository Secrets)

**スコープ**: 単一リポジトリ内のすべてのワークフロー

**設定方法**:

1. GitHub UI: Settings → Secrets and variables → Actions → New repository secret
2. GitHub CLI:

```bash
gh secret set SECRET_NAME --body "secret-value"
gh secret set SECRET_NAME < secret-file.txt
```

**アクセス方法**:

```yaml
jobs:
  build:
    steps:
      - name: Use repository secret
        run: echo "Using secret"
        env:
          API_KEY: ${{ secrets.API_KEY }}
```

**ユースケース**:

- API認証トークン
- デプロイキー
- サービスアカウント認証情報
- リポジトリ固有の設定

---

### 2. 環境シークレット (Environment Secrets)

**スコープ**: 特定の環境（production, staging, development等）

**設定方法**:

1. GitHub UI: Settings → Environments → 環境選択 → Add secret
2. 環境作成後にシークレット追加

**保護ルール**:

- Required reviewers: 承認者指定
- Wait timer: デプロイ前待機時間（最大30分）
- Deployment branches: 特定ブランチからのみデプロイ許可

**アクセス方法**:

```yaml
jobs:
  deploy:
    environment: production # 環境指定が必須
    steps:
      - name: Deploy to production
        run: ./deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

**環境保護の例**:

```yaml
# production環境へのデプロイ
jobs:
  deploy-prod:
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Deploy
        run: deploy.sh
        env:
          PROD_API_KEY: ${{ secrets.PROD_API_KEY }}
```

**ユースケース**:

- 本番環境デプロイキー
- 環境固有のAPI認証情報
- ステージング/本番分離
- レビュー必須の機密操作

---

### 3. 組織シークレット (Organization Secrets)

**スコープ**: 組織内の複数リポジトリ

**設定方法**:

1. GitHub UI: Organization Settings → Secrets and variables → Actions → New organization secret
2. リポジトリアクセスポリシー選択:
   - Private repositories: プライベートリポジトリのみ
   - All repositories: すべてのリポジトリ
   - Selected repositories: 選択したリポジトリのみ

**可視性制御**:

```yaml
# 組織シークレットは自動的に利用可能
jobs:
  build:
    steps:
      - name: Use org secret
        env:
          ORG_TOKEN: ${{ secrets.ORG_SHARED_TOKEN }}
```

**ユースケース**:

- 組織全体で共有するAPI認証情報
- 共通の外部サービストークン
- ライセンスキー
- 共有インフラ認証情報

**注意点**:

- 組織シークレットは組織のすべてのワークフローランナーで利用可能
- リポジトリシークレットで同名のシークレットがあれば上書きされる

---

### 4. Dependabotシークレット (Dependabot Secrets)

**スコープ**: Dependabotワークフロー専用

**設定方法**:

1. GitHub UI: Settings → Secrets and variables → Dependabot → New repository secret

**制約**:

- Dependabotワークフローでのみアクセス可能
- 通常のActionsワークフローからはアクセス不可

**アクセス方法**:

```yaml
# dependabot.yml
version: 2
registries:
  pnpm-registry:
    type: pnpm-registry
    url: https://registry.npmjs.org
    token: ${{ secrets.NPM_TOKEN }} # Dependabotシークレット

updates:
  - package-ecosystem: pnpm
    directory: "/"
    registries:
      - pnpm-registry
```

**ユースケース**:

- プライベートnpmレジストリ認証
- プライベートDockerレジストリ
- プライベートMavenリポジトリ
- GitHubパッケージレジストリアクセス

---

## シークレット優先順位

複数のレベルで同名のシークレットが存在する場合:

```
リポジトリシークレット (最高優先)
    ↓
環境シークレット
    ↓
組織シークレット (最低優先)
```

**例**:

```yaml
# 3つのレベルすべてでAPI_KEYが定義されている場合
jobs:
  job1:
    steps:
      - run: echo "Using repository secret"
        env:
          KEY: ${{ secrets.API_KEY }} # → リポジトリシークレット

  job2:
    environment: production
    steps:
      - run: echo "Using environment secret"
        env:
          KEY: ${{ secrets.API_KEY }} # → 環境シークレット（環境指定時）
```

---

## シークレット命名規則

### 推奨命名パターン

**環境プレフィックス**:

```
PROD_API_KEY
STAGING_DB_PASSWORD
DEV_AWS_ACCESS_KEY
```

**サービス別**:

```
SLACK_WEBHOOK_URL
DOCKER_USERNAME
NPM_TOKEN
AWS_ROLE_ARN
```

**機能別**:

```
DEPLOY_SSH_KEY
BUILD_CACHE_TOKEN
NOTIFY_API_KEY
```

### 命名ルール

- ✅ 大文字とアンダースコアのみ使用
- ✅ 説明的な名前
- ✅ 環境やサービスを明示
- ❌ 小文字やハイフン使用
- ❌ 曖昧な名前（TOKEN, KEYなど）

---

## シークレット管理ベストプラクティス

### 1. 最小権限の原則

```yaml
# ✅ 環境ごとにシークレット分離
jobs:
  deploy-staging:
    environment: staging
    env:
      API_KEY: ${{ secrets.STAGING_API_KEY }}

  deploy-prod:
    environment: production
    env:
      API_KEY: ${{ secrets.PROD_API_KEY }}
```

### 2. 組織シークレットの適切な使用

```yaml
# ✅ 共有リソースには組織シークレット
- name: Push to shared registry
  env:
    DOCKER_TOKEN: ${{ secrets.ORG_DOCKER_TOKEN }}

# ✅ リポジトリ固有には リポジトリシークレット
- name: Deploy app
  env:
    DEPLOY_KEY: ${{ secrets.REPO_DEPLOY_KEY }}
```

### 3. 環境保護の活用

```yaml
# ✅ 本番環境には保護設定
jobs:
  deploy:
    environment:
      name: production
      url: https://example.com
    # 承認とレビューが必要
    steps:
      - run: deploy.sh
```

### 4. Dependabotシークレットの分離

```yaml
# ✅ プライベートレジストリアクセスはDependabotシークレット
# dependabot.yml
registries:
  private-pnpm:
    type: pnpm-registry
    url: https://pnpm.pkg.github.com
    token: ${{ secrets.GH_PACKAGE_TOKEN }}
```

---

## シークレットローテーション戦略

### 自動ローテーション（OIDC推奨）

```yaml
# 長期認証情報の代わりにOIDC使用
jobs:
  deploy:
    permissions:
      id-token: write
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          # トークンは自動ローテーション
```

### 手動ローテーション

**90日サイクル推奨**:

1. 新しいシークレット生成
2. GitHub UIまたはCLIで更新
3. 古い認証情報を無効化
4. 監査ログで使用確認

**GitHub CLI使用例**:

```bash
# シークレット更新
gh secret set API_KEY --body "new-secret-value"

# シークレット一覧確認
gh secret list

# シークレット削除
gh secret delete OLD_SECRET
```

---

## セキュリティ監査

### シークレット使用の追跡

**監査ログ確認**:

1. Organization Settings → Audit log
2. フィルタ: `action:org.update_actions_secret`

**ワークフロー実行ログ**:

- シークレットは自動的にマスキング (`***`)
- ログで平文表示されないことを確認

### 定期レビュー

**チェックリスト**:

- [ ] 未使用シークレットの削除
- [ ] シークレット名の一貫性
- [ ] 環境分離の適切性
- [ ] ローテーション履歴
- [ ] アクセス権限レビュー

**GitHub CLI監査スクリプト**:

```bash
#!/bin/bash
# シークレット一覧取得
gh secret list --json name,updatedAt

# 各シークレットの最終更新日チェック
# 90日以上更新されていないシークレットを警告
```

---

## トラブルシューティング

### シークレットが利用できない

**原因と解決**:

1. **環境未指定**:

```yaml
# ❌ 環境シークレットにアクセスできない
jobs:
  deploy:
    steps:
      - run: deploy.sh
        env:
          KEY: ${{ secrets.ENV_SECRET }}

# ✅ 環境指定が必要
jobs:
  deploy:
    environment: production
    steps:
      - run: deploy.sh
        env:
          KEY: ${{ secrets.ENV_SECRET }}
```

2. **フォークからのPull Request**:

```yaml
# ❌ フォークPRではシークレット利用不可
on: pull_request

# ✅ pull_request_targetまたはブランチ制限
on:
  pull_request_target:
    branches: [main]
```

3. **Dependabotシークレット混同**:

- Dependabotシークレットは通常のActionsワークフローで利用不可
- 通常のシークレットとして別途設定が必要
