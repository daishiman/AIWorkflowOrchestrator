# Environment Configuration

GitHub Actionsのデプロイメント環境の設定、保護ルール、シークレット管理の完全ガイド。

## 環境の作成

### Repository Settings での設定

1. **Settings → Environments → New environment**
2. 環境名を入力（例: `production`, `staging`, `development`）
3. **Configure environment** をクリック

### 環境設定の構成要素

```
Environment Settings:
├── Protection rules
│   ├── Required reviewers (0-6人)
│   ├── Wait timer (0-43,200分)
│   └── Deployment branches (All branches / Selected branches)
├── Environment secrets
│   └── [Secret name]: [Secret value]
└── Environment variables
    └── [Variable name]: [Variable value]
```

## Protection Rules（保護ルール）

### Required Reviewers

デプロイ前に指定したレビュアーの承認を必須化します。

**設定方法**:
```
Environment Settings → Required reviewers → Add up to 6 reviewers
```

**選択可能な対象**:
- Individual users（個別ユーザー）
- Teams（チーム全体）

**承認プロセス**:
1. ワークフローが環境に到達すると一時停止
2. 指定されたレビュアーに通知
3. レビュアーがApprove/Rejectを選択
4. Approve後にジョブ続行

**YAML例**:
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Settings で Required reviewers 設定済み

    steps:
      - name: Deploy
        run: echo "This requires manual approval"
```

**通知場所**:
- Actions タブ → 該当ワークフロー → "Review deployments" ボタン
- Email通知（設定による）

### Wait Timer

デプロイ前に自動的に待機時間を設定します。

**設定方法**:
```
Environment Settings → Wait timer → Set delay (0-43,200 minutes)
```

**使用例**:
- **10分待機**: 即座のロールバック猶予期間
- **30分待機**: ピーク時間外のデプロイ
- **24時間待機**: 週末デプロイの事前スケジュール

**YAML例**:
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Settings で Wait timer: 10分 設定済み

    steps:
      - name: Deploy after wait
        run: echo "Waited 10 minutes before deployment"
```

**注意点**:
- タイマーは承認前に開始
- Required reviewers と併用可能（タイマー後に承認待ち）

### Deployment Branches

特定のブランチからのみデプロイを許可します。

**設定方法**:
```
Environment Settings → Deployment branches
```

**オプション**:

1. **All branches**（すべてのブランチ）
   - 任意のブランチからデプロイ可能
   - Development環境に推奨

2. **Protected branches only**（保護ブランチのみ）
   - Repository の Branch protection rules で保護されたブランチのみ
   - Production環境に推奨

3. **Selected branches**（選択されたブランチ）
   - 明示的に指定したブランチのみ
   - カスタムデプロイフローに対応

**パターン例**:
```
Production:     main, release/*
Staging:        main, develop, release/*
Development:    All branches
```

**YAML との連携**:
```yaml
on:
  push:
    branches: [main]  # mainブランチのみトリガー

jobs:
  deploy:
    environment: production  # mainからのみデプロイ許可
```

**エラー例**:
```
Error: Environment protection rules prevent deployment from branch 'feature/new'
Required: main, release/*
```

## Environment Secrets

環境固有のシークレットを管理します。

### 優先順位

```
Environment secrets > Repository secrets > Organization secrets
```

同じ名前のシークレットが複数レベルで定義されている場合、環境シークレットが優先されます。

### 設定方法

```
Environment Settings → Environment secrets → Add secret
```

**例**:
```
Secret name: API_KEY
Secret value: prod-api-key-12345
```

### 使用方法

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Deploy with Secret
        env:
          API_KEY: ${{ secrets.API_KEY }}  # 環境シークレットを使用
        run: |
          echo "Using API_KEY from production environment"
          ./deploy.sh
```

### 環境ごとのシークレット管理

**複数環境での使い分け**:

```yaml
jobs:
  deploy-dev:
    environment: development
    steps:
      - name: Use Dev Secrets
        env:
          API_KEY: ${{ secrets.API_KEY }}        # dev-api-key
          DATABASE_URL: ${{ secrets.DATABASE_URL }}  # dev-db-url

  deploy-prod:
    environment: production
    steps:
      - name: Use Prod Secrets
        env:
          API_KEY: ${{ secrets.API_KEY }}        # prod-api-key
          DATABASE_URL: ${{ secrets.DATABASE_URL }}  # prod-db-url
```

**シークレット設定例**:

```
Development環境:
  API_KEY: dev-key-abc123
  DATABASE_URL: postgres://dev.example.com/db

Staging環境:
  API_KEY: stage-key-xyz789
  DATABASE_URL: postgres://staging.example.com/db

Production環境:
  API_KEY: prod-key-secure456
  DATABASE_URL: postgres://prod.example.com/db
```

## Environment Variables

環境固有の変数（非シークレット）を管理します。

### 設定方法

```
Environment Settings → Environment variables → Add variable
```

**例**:
```
Variable name: DEPLOY_ENV
Variable value: production
```

### 使用方法

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Use Environment Variable
        env:
          DEPLOY_ENV: ${{ vars.DEPLOY_ENV }}  # "production"
        run: |
          echo "Deploying to environment: $DEPLOY_ENV"
```

### Secrets vs Variables

| 項目 | Secrets | Variables |
|-----|---------|-----------|
| **用途** | 機密情報 | 非機密設定 |
| **表示** | マスク表示 | 平文表示 |
| **例** | API keys, passwords | Environment names, URLs |
| **アクセス** | `${{ secrets.NAME }}` | `${{ vars.NAME }}` |

## 環境URL

デプロイメント履歴にリンクを表示します。

### 設定方法

```yaml
environment:
  name: production
  url: https://prod.example.com
```

### 動的URL生成

```yaml
environment:
  name: staging
  url: https://pr-${{ github.event.number }}.staging.example.com
```

### URL の表示場所

- Actions タブ → ワークフロー実行 → "View deployment"
- Repository トップページ → Environments セクション
- Deployments API レスポンス

## 複数環境の設定例

### シンプルな3環境構成

```yaml
# .github/workflows/deploy.yml
name: Multi-Environment Deploy

on:
  push:
    branches: [main, develop]

jobs:
  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment:
      name: development
      url: https://dev.example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Dev
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: ./deploy.sh dev

  deploy-staging:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Staging
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: ./deploy.sh staging

  deploy-prod:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: ./deploy.sh prod
```

### 各環境の Settings 設定

**Development**:
```
Protection rules: なし
Deployment branches: All branches
Secrets: API_KEY=dev-key
Variables: DEPLOY_ENV=development
```

**Staging**:
```
Protection rules:
  - Wait timer: 5 minutes
Deployment branches: main, develop
Secrets: API_KEY=staging-key
Variables: DEPLOY_ENV=staging
```

**Production**:
```
Protection rules:
  - Required reviewers: 2人（DevOps team）
  - Wait timer: 10 minutes
Deployment branches: main only
Secrets: API_KEY=prod-key
Variables: DEPLOY_ENV=production
```

## 環境の削除

### 削除方法

```
Settings → Environments → [環境名] → Delete environment
```

### 削除時の影響

- 環境のデプロイメント履歴は保持される
- 環境シークレットは完全に削除される
- 進行中のデプロイは失敗する

### 再作成時の注意

- 同じ名前で再作成可能
- 保護ルールとシークレットは再設定が必要
- デプロイメント履歴は引き継がれる

## トラブルシューティング

### 環境が表示されない

**原因**: 環境を使用したワークフローが未実行

**解決**:
```yaml
# 最初のワークフロー実行で環境が自動作成される
environment: new-environment
```

### シークレットが解決されない

**原因1**: 環境名の不一致
```yaml
# NG: 環境名が違う
environment: prod
env:
  API_KEY: ${{ secrets.API_KEY }}  # "production"環境のシークレットを期待

# OK: 環境名を一致させる
environment: production
env:
  API_KEY: ${{ secrets.API_KEY }}
```

**原因2**: シークレットが未設定
Settings → Environments → [環境名] → Secrets で確認

### 承認ボタンが表示されない

**原因**: レビュアーとして指定されていない

**確認方法**:
1. Settings → Environments → [環境名] → Required reviewers
2. 自分のユーザー名またはチームが含まれているか確認

### ブランチからデプロイできない

**原因**: Deployment branches で許可されていない

**解決**:
```
Settings → Environments → [環境名] → Deployment branches
→ Selected branches に対象ブランチを追加
```

## 参考リンク

- [Using environments for deployment - GitHub Docs](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Environment protection rules - GitHub Docs](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-protection-rules)
