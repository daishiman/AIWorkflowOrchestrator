# Race Conditions Prevention Guide

GitHub Actions における並行実行時のレースコンディション防止パターンと戦略です。

## レースコンディションとは

複数のワークフローが同時に実行され、共有リソースや状態に対して競合が発生する状況。

### 典型的な問題シナリオ

1. **デプロイメント競合**: 複数のデプロイが同時に実行され、古いバージョンが最後にデプロイされる
2. **状態競合**: 複数のジョブが同じデータベースやファイルを更新
3. **リソース競合**: 同じ環境やサーバーに同時アクセス
4. **リリース競合**: 複数のリリースタグが同時に作成される

## 防止戦略

### 1. 排他制御（Mutual Exclusion）

#### キューベース実行

```yaml
name: Production Deploy

on:
  push:
    branches: [main]

concurrency:
  group: production-deploy
  cancel-in-progress: false  # キューに入れて順次実行
```

**効果**:
- デプロイが順次実行される
- 同時デプロイを完全に防止
- デプロイの順序が保証される

**適用シナリオ**:
- 本番環境デプロイ
- データベースマイグレーション
- インフラストラクチャ変更

#### 環境ベース排他制御

```yaml
concurrency:
  group: deploy-${{ github.event.deployment.environment }}
  cancel-in-progress: false
```

**効果**:
- 環境ごとに独立したキュー
- 環境間は並行実行可能

**例**:
- `production` への同時デプロイを防止
- `staging` と `production` は並行デプロイ可能

### 2. タイムスタンプ検証

#### デプロイ前の最新性確認

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Check if commit is latest
        id: check-latest
        run: |
          LATEST_SHA=$(git ls-remote origin ${{ github.ref }} | cut -f1)
          CURRENT_SHA=${{ github.sha }}

          if [ "$LATEST_SHA" != "$CURRENT_SHA" ]; then
            echo "Not the latest commit. Skipping deployment."
            echo "skip=true" >> $GITHUB_OUTPUT
          else
            echo "skip=false" >> $GITHUB_OUTPUT
          fi

      - name: Deploy
        if: steps.check-latest.outputs.skip != 'true'
        run: ./deploy.sh
```

**効果**:
- 古いコミットのデプロイを防止
- 最新のコードのみデプロイ

#### デプロイ時刻の記録と検証

```yaml
- name: Record deployment time
  run: |
    DEPLOY_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "DEPLOY_TIME=$DEPLOY_TIME" >> $GITHUB_ENV

- name: Check concurrent deployment
  run: |
    # API または DB から最終デプロイ時刻を取得
    LAST_DEPLOY=$(curl -s https://api.example.com/last-deploy)

    if [ "$LAST_DEPLOY" > "$DEPLOY_TIME" ]; then
      echo "Newer deployment detected. Aborting."
      exit 1
    fi
```

### 3. ロック機構

#### GitHub Deployment API の利用

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Create deployment
        id: deployment
        uses: actions/github-script@v7
        with:
          script: |
            const deployment = await github.rest.repos.createDeployment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.sha,
              environment: 'production',
              required_contexts: [],
              auto_merge: false
            });
            return deployment.data.id;

      - name: Deploy
        run: ./deploy.sh

      - name: Update deployment status
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.repos.createDeploymentStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              deployment_id: ${{ steps.deployment.outputs.result }},
              state: '${{ job.status }}',
              environment: 'production'
            });
```

**効果**:
- GitHub がデプロイメントの状態を管理
- 環境保護ルールと統合
- デプロイ履歴の追跡

#### 外部ロックサービス

```yaml
- name: Acquire lock
  id: lock
  run: |
    # Redis, DynamoDB, または他のロックサービスを使用
    LOCK_ACQUIRED=$(./acquire-lock.sh production-deploy 300)
    echo "acquired=$LOCK_ACQUIRED" >> $GITHUB_OUTPUT

- name: Deploy
  if: steps.lock.outputs.acquired == 'true'
  run: ./deploy.sh

- name: Release lock
  if: always() && steps.lock.outputs.acquired == 'true'
  run: ./release-lock.sh production-deploy
```

**実装例（Redis）**:

```bash
#!/bin/bash
# acquire-lock.sh
LOCK_KEY=$1
TTL=$2

LOCK_ID=$(uuidgen)
ACQUIRED=$(redis-cli SET "$LOCK_KEY" "$LOCK_ID" NX EX $TTL)

if [ "$ACQUIRED" = "OK" ]; then
  echo "$LOCK_ID" > /tmp/lock-id
  echo "true"
else
  echo "false"
fi
```

### 4. セマフォパターン

#### 同時実行数の制限

```yaml
name: Deploy with Semaphore

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Wait for slot
        run: |
          MAX_CONCURRENT=3
          while true; do
            CURRENT=$(gh api repos/${{ github.repository }}/actions/runs \
              --jq '[.workflow_runs[] | select(.status == "in_progress" and .name == "${{ github.workflow }}")] | length')

            if [ "$CURRENT" -lt "$MAX_CONCURRENT" ]; then
              break
            fi

            echo "Waiting for available slot... ($CURRENT/$MAX_CONCURRENT)"
            sleep 30
          done

      - name: Deploy
        run: ./deploy.sh
```

**効果**:
- 同時実行数を制限
- リソース使用量の制御

### 5. バージョン管理

#### デプロイバージョンの検証

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Get current version
        id: current-version
        run: |
          CURRENT=$(curl -s https://api.example.com/version)
          echo "version=$CURRENT" >> $GITHUB_OUTPUT

      - name: Check version compatibility
        run: |
          DEPLOYING_VERSION="${{ github.ref_name }}"
          CURRENT_VERSION="${{ steps.current-version.outputs.version }}"

          # セマンティックバージョニング比較
          if ! ./is-version-compatible.sh "$DEPLOYING_VERSION" "$CURRENT_VERSION"; then
            echo "Version conflict detected"
            exit 1
          fi

      - name: Deploy
        run: ./deploy.sh
```

#### Git タグのアトミック操作

```yaml
- name: Create release tag
  run: |
    VERSION=$(cat VERSION)

    # タグが既に存在するかチェック
    if git ls-remote --tags origin | grep -q "refs/tags/v$VERSION"; then
      echo "Tag v$VERSION already exists"
      exit 1
    fi

    # アトミックにタグを作成
    git tag "v$VERSION"
    git push origin "v$VERSION" || {
      echo "Failed to push tag (may already exist)"
      exit 1
    }
```

## デプロイメントキューの実装

### 基本的なキューシステム

```yaml
name: Deployment Queue

on:
  push:
    branches: [main]

concurrency:
  group: production-deploy-queue
  cancel-in-progress: false

jobs:
  queue:
    runs-on: ubuntu-latest
    outputs:
      position: ${{ steps.queue.outputs.position }}
    steps:
      - name: Get queue position
        id: queue
        run: |
          POSITION=$(gh api repos/${{ github.repository }}/actions/runs \
            --jq '[.workflow_runs[] | select(.status == "queued" or .status == "in_progress")] | length')
          echo "position=$POSITION" >> $GITHUB_OUTPUT
          echo "Queue position: $POSITION"

  deploy:
    needs: queue
    runs-on: ubuntu-latest
    steps:
      - name: Wait for turn
        run: |
          echo "Waiting in queue (position: ${{ needs.queue.outputs.position }})"

      - name: Deploy
        run: ./deploy.sh
```

### 優先度ベースのキュー

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Determine priority
        id: priority
        run: |
          # ブランチやイベントタイプに基づいて優先度を決定
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "priority=high" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" =~ ^refs/heads/release/ ]]; then
            echo "priority=medium" >> $GITHUB_OUTPUT
          else
            echo "priority=low" >> $GITHUB_OUTPUT
          fi

      - name: Enqueue deployment
        run: |
          ./enqueue-deploy.sh \
            --priority "${{ steps.priority.outputs.priority }}" \
            --sha "${{ github.sha }}" \
            --ref "${{ github.ref }}"

      - name: Wait for execution
        run: ./wait-for-turn.sh
```

## 環境ベースの戦略

### 環境ごとの異なる制御

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [development, staging, production]
    concurrency:
      group: deploy-${{ matrix.environment }}
      cancel-in-progress: ${{ matrix.environment != 'production' }}
    environment:
      name: ${{ matrix.environment }}
    steps:
      - name: Deploy to ${{ matrix.environment }}
        run: ./deploy.sh ${{ matrix.environment }}
```

**戦略**:
- `development`: 最新のみ実行（`cancel-in-progress: true`）
- `staging`: 最新のみ実行（`cancel-in-progress: true`）
- `production`: 順次実行（`cancel-in-progress: false`）

### デプロイメントゲート

```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    outputs:
      can-deploy: ${{ steps.check.outputs.can-deploy }}
    steps:
      - name: Check deployment conditions
        id: check
        run: |
          # 現在の環境状態をチェック
          IS_HEALTHY=$(curl -s https://api.example.com/health | jq -r '.status')

          # 進行中のデプロイをチェック
          ACTIVE_DEPLOYS=$(gh api repos/${{ github.repository }}/deployments \
            --jq '[.[] | select(.environment == "production" and .statuses[0].state == "in_progress")] | length')

          if [ "$IS_HEALTHY" = "ok" ] && [ "$ACTIVE_DEPLOYS" -eq 0 ]; then
            echo "can-deploy=true" >> $GITHUB_OUTPUT
          else
            echo "can-deploy=false" >> $GITHUB_OUTPUT
          fi

  deploy:
    needs: validate
    if: needs.validate.outputs.can-deploy == 'true'
    runs-on: ubuntu-latest
    concurrency:
      group: production-deploy
      cancel-in-progress: false
    steps:
      - name: Deploy
        run: ./deploy.sh
```

## リトライ戦略

### 競合時の自動リトライ

```yaml
- name: Deploy with retry
  uses: nick-fields/retry-action@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    retry_wait_seconds: 60
    command: |
      if ! ./deploy.sh; then
        # 競合を検出
        if ./check-conflict.sh; then
          echo "Deployment conflict detected, retrying..."
          exit 1
        else
          echo "Deployment failed for other reasons"
          exit 2
        fi
      fi
```

### エクスポネンシャルバックオフ

```yaml
- name: Deploy with backoff
  run: |
    MAX_RETRIES=5
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
      if ./deploy.sh; then
        echo "Deployment successful"
        exit 0
      fi

      RETRY_COUNT=$((RETRY_COUNT + 1))
      WAIT_TIME=$((2 ** RETRY_COUNT))

      echo "Deployment failed. Retry $RETRY_COUNT/$MAX_RETRIES in ${WAIT_TIME}s..."
      sleep $WAIT_TIME
    done

    echo "Max retries reached. Deployment failed."
    exit 1
```

## モニタリングとアラート

### 競合検出

```yaml
- name: Monitor concurrent deployments
  run: |
    CONCURRENT=$(gh api repos/${{ github.repository }}/actions/runs \
      --jq '[.workflow_runs[] | select(.status == "in_progress" and .name == "Deploy")] | length')

    if [ "$CONCURRENT" -gt 1 ]; then
      echo "::warning::Multiple concurrent deployments detected: $CONCURRENT"

      # Slack 通知
      curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
        -H 'Content-Type: application/json' \
        -d '{
          "text": "⚠️ Concurrent deployment detected",
          "attachments": [{
            "color": "warning",
            "fields": [{
              "title": "Concurrent Runs",
              "value": "'"$CONCURRENT"'",
              "short": true
            }]
          }]
        }'
    fi
```

### デプロイメント履歴の追跡

```yaml
- name: Record deployment
  run: |
    cat << EOF > deployment-record.json
    {
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "sha": "${{ github.sha }}",
      "ref": "${{ github.ref }}",
      "actor": "${{ github.actor }}",
      "run_id": "${{ github.run_id }}",
      "environment": "production"
    }
    EOF

    # S3, DynamoDB, または他のストレージに保存
    aws s3 cp deployment-record.json \
      s3://deployments/$(date +%Y%m%d%H%M%S)-${{ github.run_id }}.json
```

## ベストプラクティス

### 1. 環境ごとの戦略を明確化

```yaml
# ✅ 環境ごとに適切な戦略
concurrency:
  group: deploy-${{ github.event.deployment.environment }}
  cancel-in-progress: ${{ github.event.deployment.environment != 'production' }}
```

### 2. デプロイ前の検証を実装

```yaml
# ✅ デプロイ前チェック
- name: Pre-deployment validation
  run: |
    ./check-health.sh
    ./check-conflicts.sh
    ./check-version.sh
```

### 3. ロールバック戦略を準備

```yaml
- name: Deploy with rollback
  id: deploy
  run: ./deploy.sh

- name: Rollback on failure
  if: failure() && steps.deploy.outcome == 'failure'
  run: ./rollback.sh
```

### 4. 明確なログとトレーシング

```yaml
- name: Log deployment start
  run: |
    echo "::group::Deployment Information"
    echo "Commit: ${{ github.sha }}"
    echo "Branch: ${{ github.ref }}"
    echo "Actor: ${{ github.actor }}"
    echo "Run ID: ${{ github.run_id }}"
    echo "::endgroup::"
```

## トラブルシューティング

### 問題: デプロイが重複実行される

**診断**:
```bash
gh api repos/OWNER/REPO/actions/runs \
  --jq '.workflow_runs[] | select(.status == "in_progress" and .name == "Deploy") | {id, sha, created_at}'
```

**解決策**:
1. `concurrency` 設定を追加
2. `cancel-in-progress: false` を設定
3. グループ名が一致しているか確認

### 問題: 古いバージョンがデプロイされる

**診断**:
```bash
# デプロイキューを確認
gh run list --workflow=deploy.yml --status=queued
```

**解決策**:
1. タイムスタンプ検証を実装
2. バージョンチェックを追加
3. デプロイ前に最新コミットを確認

### 問題: デプロイが永久にキューに残る

**診断**:
```bash
# 長時間キューに残っているジョブを検索
gh api repos/OWNER/REPO/actions/runs \
  --jq '.workflow_runs[] | select(.status == "queued") | {id, created_at, name}'
```

**解決策**:
1. タイムアウト設定を追加
2. キューの最大待機時間を設定
3. デッドロック検出を実装

---

**参照**:
- [GitHub Deployments API](https://docs.github.com/en/rest/deployments/deployments)
- [Environment protection rules](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
