# Approval Workflows

GitHub Actionsの環境承認ワークフローの設計、実装パターン、ベストプラクティス。

## 承認フローの基本

### 承認が必要になるタイミング

ジョブが `environment` を指定し、その環境に **Required reviewers** が設定されている場合:

1. ワークフローが環境に到達すると一時停止
2. 指定されたレビュアーに通知
3. レビュアーが **Approve** または **Reject** を選択
4. Approve後にジョブ実行を再開
5. Reject時はジョブ失敗

### 承認画面の場所

```
Repository → Actions → [ワークフロー実行] → "Review deployments" ボタン
```

## 承認者の設定

### 設定方法

```
Repository → Settings → Environments → [環境名]
→ Protection rules → Required reviewers → Add reviewers
```

### 選択可能な対象

1. **Individual users**（個別ユーザー）
   - 最大6名まで指定可能
   - 1名以上の承認で通過（OR条件）

2. **Teams**（チーム）
   - Organization内のチーム指定
   - チーム内の任意のメンバーが承認可能

### 複数レビュアーの動作

**設定**: 3名のレビュアー（Alice, Bob, Carol）

**承認条件**: いずれか1名が承認すれば通過

```
Alice: Approve → ✅ デプロイ実行
Bob: (未承認)
Carol: (未承認)
```

**注意**: 全員の承認を必須にすることはできない（GitHubの仕様）

## 承認ワークフローのパターン

### パターン1: 単一環境承認

最もシンプルなパターン。本番環境のみ承認を要求。

```yaml
name: Simple Approval

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production # Settings で Required reviewers 設定済み

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Production
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          echo "Deploying to production..."
          ./deploy.sh
```

**Settings 設定**:

```
production環境:
  Required reviewers: DevOps Team (2名)
```

### パターン2: 段階的承認（Staging → Production）

Stagingでテスト後、本番に手動承認でデプロイ。

```yaml
name: Staged Approval

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Staging
        run: ./deploy.sh staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com

    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        run: ./deploy.sh production
```

**Settings 設定**:

```
staging環境:
  Required reviewers: なし（自動デプロイ）

production環境:
  Required reviewers: DevOps Lead (1名)
```

**フロー**:

1. Staging に自動デプロイ
2. Staging で検証
3. Production デプロイ前に承認待機
4. 承認後に Production デプロイ

### パターン3: 複数環境の並列承認

複数の本番環境に並列デプロイ、各環境で承認。

```yaml
name: Parallel Approval

on:
  workflow_dispatch:

jobs:
  deploy-us:
    runs-on: ubuntu-latest
    environment:
      name: production-us
      url: https://us.example.com

    steps:
      - uses: actions/checkout@v4
      - name: Deploy to US Region
        run: ./deploy.sh us

  deploy-eu:
    runs-on: ubuntu-latest
    environment:
      name: production-eu
      url: https://eu.example.com

    steps:
      - uses: actions/checkout@v4
      - name: Deploy to EU Region
        run: ./deploy.sh eu
```

**Settings 設定**:

```
production-us環境:
  Required reviewers: US Operations Team

production-eu環境:
  Required reviewers: EU Operations Team
```

**フロー**:

- USとEUのデプロイが並列で承認待ち
- 各チームが独立して承認
- 承認された環境から順次デプロイ

### パターン4: 承認 + Wait Timer

承認前に自動待機時間を設定。

```yaml
name: Approval with Wait

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production # Settings で Wait timer + Required reviewers 設定済み

    steps:
      - uses: actions/checkout@v4
      - name: Deploy after Wait and Approval
        run: ./deploy.sh
```

**Settings 設定**:

```
production環境:
  Wait timer: 10分
  Required reviewers: DevOps Team (2名)
```

**フロー**:

1. ワークフロー開始
2. 10分間自動待機
3. 待機後、承認待ちに移行
4. 承認されたらデプロイ実行

### パターン5: 条件付き承認

特定条件下でのみ承認を要求。

```yaml
name: Conditional Approval

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'development' }}

    steps:
      - uses: actions/checkout@v4

      - name: Deploy
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "Deploying to production (requires approval)"
            ./deploy.sh production
          else
            echo "Deploying to development (no approval)"
            ./deploy.sh development
          fi
```

**Settings 設定**:

```
production環境:
  Required reviewers: DevOps Team

development環境:
  Required reviewers: なし
```

**フロー**:

- `main` ブランチ → production環境 → 承認必要
- `develop` ブランチ → development環境 → 承認不要

### パターン6: マルチステップ承認

複数のデプロイステップで段階的承認。

```yaml
name: Multi-Step Approval

on:
  workflow_dispatch:

jobs:
  deploy-database:
    runs-on: ubuntu-latest
    environment:
      name: production-db
      url: https://db.example.com

    steps:
      - uses: actions/checkout@v4
      - name: Migrate Database
        run: ./migrate.sh

  deploy-backend:
    needs: deploy-database
    runs-on: ubuntu-latest
    environment:
      name: production-backend
      url: https://api.example.com

    steps:
      - uses: actions/checkout@v4
      - name: Deploy Backend
        run: ./deploy-backend.sh

  deploy-frontend:
    needs: deploy-backend
    runs-on: ubuntu-latest
    environment:
      name: production-frontend
      url: https://example.com

    steps:
      - uses: actions/checkout@v4
      - name: Deploy Frontend
        run: ./deploy-frontend.sh
```

**Settings 設定**:

```
production-db環境:
  Required reviewers: Database Admin (1名)

production-backend環境:
  Required reviewers: Backend Lead (1名)

production-frontend環境:
  Required reviewers: Frontend Lead (1名)
```

**フロー**:

1. DBマイグレーション承認 → 実行
2. バックエンドデプロイ承認 → 実行
3. フロントエンドデプロイ承認 → 実行

## 承認の実行方法

### 承認手順

1. **通知を受け取る**
   - Email通知（設定による）
   - Actions タブの "Review deployments" バッジ

2. **承認画面にアクセス**

   ```
   Repository → Actions → [ワークフロー実行]
   → "Review deployments" ボタンをクリック
   ```

3. **レビュー実行**
   - デプロイ内容を確認
   - コメントを追加（任意）
   - **Approve** または **Reject** を選択

4. **結果確認**
   - Approve: ジョブが再開
   - Reject: ジョブが失敗

### 承認履歴の確認

```
Repository → Environments → [環境名] → View deployment history
```

**表示情報**:

- デプロイ日時
- トリガーしたユーザー
- 承認したレビュアー
- デプロイ結果（Success/Failure）
- 環境URL

## Wait Timer の活用

### Wait Timer の設定

```
Settings → Environments → [環境名] → Wait timer → Set delay
```

**設定範囲**: 0 〜 43,200分（30日）

### 使用例

#### 1. ピーク時間外デプロイ

```yaml
# 深夜2時にデプロイ（22時にトリガー、4時間待機）
on:
  schedule:
    - cron: "0 22 * * *" # 22時にトリガー

jobs:
  deploy:
    environment: production # Wait timer: 240分（4時間）
```

#### 2. ロールバック猶予期間

```yaml
# Stagingデプロイ後、10分待機してから本番デプロイ
jobs:
  deploy-staging:
    environment: staging

  deploy-production:
    needs: deploy-staging
    environment: production # Wait timer: 10分
```

**メリット**: Staging で問題が見つかった場合、本番デプロイをキャンセル可能

#### 3. 段階的ロールアウト

```yaml
jobs:
  deploy-canary:
    environment: production-canary # Wait timer: 30分

  deploy-full:
    needs: deploy-canary
    environment: production
```

**フロー**:

1. Canary環境に10%トラフィック
2. 30分待機（監視）
3. 問題なければ全体デプロイ

### Wait Timer + Required Reviewers

```
Settings:
  Wait timer: 10分
  Required reviewers: 2名
```

**動作**:

1. ワークフロー開始
2. 10分間自動待機（この間はキャンセル可能）
3. 待機完了後、承認待ちに移行
4. 2名中1名が承認したらデプロイ実行

## 承認のキャンセル

### ワークフローのキャンセル

```
Actions → [ワークフロー実行] → "Cancel workflow" ボタン
```

**影響**:

- 承認待ちのジョブは即座に停止
- 実行中のジョブも停止
- 後続のジョブは実行されない

### タイムアウト

デフォルトのジョブタイムアウト: **6時間**

承認されない場合、6時間後に自動失敗します。

**タイムアウト時間の変更**:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 1440 # 24時間
    environment: production
```

## 承認通知の設定

### Email通知

```
GitHub Settings → Notifications → Actions
→ "Deployments awaiting review" を有効化
```

### Slack通知

```yaml
jobs:
  notify-approval:
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deployment to production requires approval",
              "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  deploy:
    needs: notify-approval
    environment: production
    steps:
      - name: Deploy
        run: ./deploy.sh
```

## トラブルシューティング

### 承認ボタンが表示されない

**原因1**: レビュアーとして指定されていない

**確認**:

```
Settings → Environments → [環境名] → Required reviewers
```

自分のユーザー名またはチームが含まれているか確認。

**原因2**: 承認済み

既に他のレビュアーが承認している場合、ボタンは表示されません。

### 承認したのにデプロイが始まらない

**原因1**: Wait timerが設定されている

Wait timer終了まで待機が続きます。

**原因2**: 依存ジョブが失敗

`needs` で指定された前のジョブが失敗している可能性。

**確認**:

```
Actions → [ワークフロー実行] → Jobs タブ
```

### 承認通知が届かない

**確認1**: 通知設定

```
GitHub Settings → Notifications → Actions
→ "Deployments awaiting review" が有効か確認
```

**確認2**: Email設定

```
GitHub Settings → Emails
→ プライマリメールアドレスが認証済みか確認
```

### タイムアウトが早すぎる

**解決**: ジョブのタイムアウトを延長

```yaml
jobs:
  deploy:
    timeout-minutes: 1440 # 24時間（デフォルトは360分）
    environment: production
```

## ベストプラクティス

### 1. 承認者の役割分担

```
production-db:       Database Admin
production-backend:  Backend Lead
production-frontend: Frontend Lead
```

各環境に適切な専門家を割り当て。

### 2. Wait Timer の活用

```
production環境:
  Wait timer: 10分
  Required reviewers: DevOps Team
```

即座のロールバック猶予期間を設ける。

### 3. 段階的デプロイ

```yaml
deploy-canary → deploy-staging → deploy-production
```

リスクを段階的に軽減。

### 4. 承認履歴の活用

```
Environments → [環境名] → Deployment history
```

定期的にレビューして改善点を特定。

### 5. 緊急時のバイパス手順

```yaml
on:
  workflow_dispatch:
    inputs:
      emergency:
        description: "Emergency deployment (skip staging)"
        type: boolean
        default: false

jobs:
  deploy:
    environment: ${{ github.event.inputs.emergency && 'production' || 'staging' }}
```

緊急時は手動トリガーで承認をスキップ（慎重に使用）。

## 参考リンク

- [Reviewing deployments - GitHub Docs](https://docs.github.com/en/actions/managing-workflow-runs/reviewing-deployments)
- [Environment protection rules - GitHub Docs](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-protection-rules)
