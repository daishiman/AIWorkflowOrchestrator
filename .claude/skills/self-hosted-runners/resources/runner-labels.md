# Runner Labels Guide

カスタムラベル、ターゲティング戦略、ランナーグループ管理の詳細ガイド。

## 目次

- [ラベルの種類](#ラベルの種類)
- [カスタムラベル設計](#カスタムラベル設計)
- [ターゲティング戦略](#ターゲティング戦略)
- [ランナーグループ](#ランナーグループ)
- [ラベル管理](#ラベル管理)

## ラベルの種類

### システムラベル（自動付与）

GitHub が自動的に付与するラベル:

```yaml
# OS ラベル
- linux
- windows
- macOS

# アーキテクチャラベル
- x64
- ARM
- ARM64

# ランナータイプ
- self-hosted  # すべてのセルフホストランナーに付与
```

### カスタムラベル（ユーザー定義）

設定時に任意のラベルを追加可能:

```bash
./config.sh \
  --url https://github.com/owner/repo \
  --token TOKEN \
  --labels custom-label-1,custom-label-2,custom-label-3
```

## カスタムラベル設計

### ラベル設計原則

#### 1. 階層的命名

```bash
# 環境
env:production
env:staging
env:development

# 地域
region:us-east
region:eu-west
region:ap-south

# 用途
purpose:build
purpose:test
purpose:deploy
```

#### 2. 機能ベース

```bash
# ハードウェア特性
gpu
high-memory
ssd-storage
nvme

# ソフトウェア環境
docker-enabled
kubernetes-ready
python-3.11
node-18
```

#### 3. セキュリティレベル

```bash
# アクセス権限
internal-network
vpn-required
internet-restricted

# セキュリティ設定
ephemeral
isolated
sandboxed
hardened
```

### ラベル命名規約

#### ケバブケース推奨

```bash
# ✅ 良い例
high-memory
cuda-11-8
production-deploy

# ❌ 悪い例
HighMemory
cuda_11_8
PRODUCTION_DEPLOY
```

#### 説明的かつ簡潔

```bash
# ✅ 良い例
gpu-tesla-v100
python-3.11
build-server

# ❌ 悪い例
g
py
bs
```

## ターゲティング戦略

### 単一ラベル

```yaml
jobs:
  build:
    runs-on: self-hosted
```

### 複数ラベル（AND条件）

```yaml
jobs:
  gpu-training:
    # すべてのラベルに一致するランナーを選択
    runs-on: [self-hosted, linux, gpu, cuda-11]
```

### ラベルの優先順位

```yaml
# より具体的なラベルを優先
runs-on: [self-hosted, linux, x64, gpu, cuda-11-8, tesla-v100]

# ラベルの順序は重要ではない（すべてマッチする必要がある）
runs-on: [gpu, self-hosted, linux]  # 同じ結果
```

### マトリクス戦略

```yaml
strategy:
  matrix:
    runner:
      - [self-hosted, linux, standard]
      - [self-hosted, linux, gpu]
      - [self-hosted, windows, standard]
    include:
      - runner: [self-hosted, linux, gpu]
        cuda: "11.8"

jobs:
  test:
    runs-on: ${{ matrix.runner }}
    steps:
      - name: Run tests
        run: ./test.sh
```

### 条件付きターゲティング

```yaml
jobs:
  deploy:
    runs-on: |
      ${{
        github.ref == 'refs/heads/main' &&
        '[self-hosted, linux, production]' ||
        '[self-hosted, linux, staging]'
      }}
```

## ランナーグループ

### グループの概念

Enterprise または Organization レベルでランナーをグループ化:

```
Organization
├── Default Group（デフォルト）
├── Production Runners
│   ├── prod-runner-1 [production, high-memory]
│   └── prod-runner-2 [production, standard]
├── Development Runners
│   ├── dev-runner-1 [development, standard]
│   └── dev-runner-2 [development, gpu]
└── CI Runners
    ├── ci-runner-1 [ci, ephemeral]
    └── ci-runner-2 [ci, ephemeral]
```

### グループ設定（Organization）

#### UI での設定

1. Organization: `Settings` → `Actions` → `Runner groups`
2. `New runner group` をクリック
3. グループ名とアクセス権限を設定

#### アクセス制御

```yaml
# グループへのアクセスを特定のリポジトリに制限
Runner Group: Production Runners
Access:
  - Selected repositories
    - company/api-backend
    - company/web-frontend
  - All repositories with label: production-ready
```

### グループベースのターゲティング

```yaml
# ワークフロー内でグループを指定（ラベル経由）
jobs:
  deploy-prod:
    runs-on: [self-hosted, production-group]
    environment: production
    steps:
      - name: Deploy to production
        run: ./deploy.sh
```

### グループポリシー

```yaml
# グループ設定例
Name: Production Runners
Description: Runners for production deployments
Repository access: Selected repositories
Workflow access: Allow all workflows
Runner labels: [production, high-security]
```

## ラベル管理

### ラベル追加

#### 設定時

```bash
./config.sh \
  --url https://github.com/owner/repo \
  --token TOKEN \
  --labels label1,label2,label3
```

#### 再設定

```bash
# 既存ランナーの再設定
./config.sh remove --token REMOVAL_TOKEN
./config.sh \
  --url https://github.com/owner/repo \
  --token TOKEN \
  --labels new-label1,new-label2
```

### ラベル確認

#### GitHub UI

```
Repository/Organization Settings
→ Actions
→ Runners
→ [ランナー名] をクリック
→ Labels セクションを確認
```

#### API経由

```bash
# Repository ランナー
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/runners

# Organization ランナー
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/orgs/ORG/actions/runners
```

### ラベル更新

```bash
# REST API を使用
curl -L \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/runners/RUNNER_ID/labels \
  -d '{"labels":["self-hosted","linux","x64","new-label"]}'
```

## 実践的なラベル設計例

### 環境別

```yaml
# 開発環境
Development Runners:
  - Labels: [self-hosted, development, linux, standard]
  - Usage: Feature開発、ユニットテスト

# ステージング環境
Staging Runners:
  - Labels: [self-hosted, staging, linux, high-memory]
  - Usage: 統合テスト、パフォーマンステスト

# 本番環境
Production Runners:
  - Labels: [self-hosted, production, linux, high-security, isolated]
  - Usage: 本番デプロイメントのみ
```

### 用途別

```yaml
# ビルド専用
Build Runners:
  - Labels: [self-hosted, build, high-cpu, ssd]
  - Usage: コンパイル、パッケージング

# テスト専用
Test Runners:
  - Labels: [self-hosted, test, ephemeral, isolated]
  - Usage: E2Eテスト、セキュリティスキャン

# デプロイ専用
Deploy Runners:
  - Labels: [self-hosted, deploy, internal-network, vpn-enabled]
  - Usage: インフラデプロイメント
```

### ハードウェア別

```yaml
# 標準スペック
Standard Runners:
  - Labels: [self-hosted, standard, 4-core, 8gb-ram]
  - Specs: 4 CPU / 8GB RAM / 100GB SSD

# 高性能
High-Performance Runners:
  - Labels: [self-hosted, high-perf, 16-core, 32gb-ram, nvme]
  - Specs: 16 CPU / 32GB RAM / 500GB NVMe

# GPU搭載
GPU Runners:
  - Labels: [self-hosted, gpu, cuda-11-8, tesla-v100]
  - Specs: 8 CPU / 32GB RAM / NVIDIA Tesla V100
```

## ベストプラクティス

### 1. 一貫性のある命名

```bash
# ✅ 統一された命名規則
[self-hosted, env-production, region-us-east, purpose-deploy]

# ❌ 不統一な命名
[self-hosted, PRODUCTION, us_east, Deploy]
```

### 2. 適切な粒度

```bash
# ✅ 適切な粒度
[self-hosted, linux, gpu, cuda-11]

# ❌ 過度に詳細
[self-hosted, linux, ubuntu, 22.04, gpu, nvidia, cuda, 11.8.0, driver-520]

# ❌ 粗すぎる
[self-hosted]
```

### 3. ドキュメント化

```markdown
# runners-documentation.md

## Available Runner Labels

| Label | Description | Hardware | Use Cases |
|-------|-------------|----------|-----------|
| `production` | Production environment | 16 core / 32GB | Production deploys |
| `gpu-training` | ML training | 8 core / Tesla V100 | Model training |
| `ephemeral` | Disposable runner | 4 core / 8GB | Security-sensitive builds |
```

### 4. 定期的なレビュー

```bash
# 未使用ラベルの特定
# 過去90日間のワークフロー実行を分析
gh api graphql -f query='
  query {
    repository(owner: "owner", name: "repo") {
      workflowRuns(first: 100) {
        nodes {
          runnerLabels
        }
      }
    }
  }
'
```

## トラブルシューティング

### ランナーが見つからない

```yaml
# 問題: "No runner matching the specified labels was found"

# 確認1: ラベルの正確性
runs-on: [self-hosted, linux, gpu]  # すべてのラベルが必要

# 確認2: ランナーの状態
# GitHub UI でランナーがオンラインか確認

# 確認3: ラベルの存在
# ランナー設定のラベルを確認
```

### ラベルの重複

```bash
# 問題: 複数のランナーが同じラベルセットを持つ

# 解決策1: より具体的なラベルを追加
runs-on: [self-hosted, linux, gpu, region-us-east]

# 解決策2: ランナーグループを使用
runs-on: [self-hosted, production-group, gpu]
```

### グループアクセス拒否

```yaml
# 問題: "Runner group access denied"

# 確認: Organization/Repository設定
# Settings → Actions → Runner groups
# リポジトリが該当グループへのアクセス権を持つか確認
```
