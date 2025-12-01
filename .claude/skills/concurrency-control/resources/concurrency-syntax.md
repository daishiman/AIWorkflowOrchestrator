# Concurrency Syntax Reference

GitHub Actions の並行実行制御構文の詳細リファレンスです。

## 基本構文

### concurrency オブジェクト

```yaml
concurrency:
  group: <string>              # 並行実行グループの識別子
  cancel-in-progress: <boolean> # 進行中のジョブをキャンセルするか
```

## group の設計パターン

### 1. 固定グループ名

```yaml
concurrency:
  group: production-deploy
```

**用途**: 単一環境、単一ワークフローの制御

**利点**:
- シンプルで理解しやすい
- 設定が容易

**欠点**:
- 柔軟性が低い
- 複数ワークフローで共有できない

### 2. ワークフロー名ベース

```yaml
concurrency:
  group: ${{ github.workflow }}
```

**用途**: ワークフローごとに独立した並行実行制御

**利点**:
- ワークフロー間の独立性
- 再利用可能

**欠点**:
- 同じワークフロー内のすべての実行が影響を受ける

### 3. リファレンスベース（ブランチ/PR）

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
```

**用途**: ブランチまたは PR ごとの制御

**例**:
- `deploy-refs/heads/main`
- `deploy-refs/heads/feature/123`
- `deploy-refs/pull/456/merge`

**利点**:
- ブランチごとに独立
- PR ごとに並行実行可能

**欠点**:
- main ブランチで複数デプロイが同時実行される可能性

### 4. 環境ベース

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.deployment.environment }}
```

**用途**: 環境ごとのデプロイメント制御

**例**:
- `deploy-production`
- `deploy-staging`
- `deploy-development`

**利点**:
- 環境ごとに独立したキュー
- 環境保護

**欠点**:
- deployment イベントでのみ使用可能

### 5. ハイブリッドパターン

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event_name }}-${{ github.ref }}
```

**用途**: イベントタイプとリファレンスの組み合わせ

**例**:
- `deploy-push-refs/heads/main`
- `deploy-pull_request-refs/pull/123/merge`
- `deploy-workflow_dispatch-refs/heads/feature/456`

**利点**:
- 最大限の粒度制御
- イベントタイプによる分離

**欠点**:
- 複雑で理解しづらい
- グループ名が長くなる

## cancel-in-progress の設定戦略

### false（キューベース実行）

```yaml
concurrency:
  group: production-deploy
  cancel-in-progress: false
```

**使用シナリオ**:
- 本番デプロイメント
- データベースマイグレーション
- リリース作成
- 状態変更を伴う操作

**動作**:
1. 新しいワークフローが実行開始
2. 同じ group の実行中ジョブがある場合、キューに入る
3. 前のジョブが完了後、次のジョブが実行

**利点**:
- すべてのデプロイが実行される
- デプロイの順序が保証される
- データ整合性が保たれる

**欠点**:
- キューが溜まる可能性
- 古いコミットがデプロイされる可能性
- 実行時間が長くなる

### true（最新のみ実行）

```yaml
concurrency:
  group: pr-${{ github.ref }}
  cancel-in-progress: true
```

**使用シナリオ**:
- PR ビルド・テスト
- プレビューデプロイ
- 開発環境デプロイ
- 状態を持たない操作

**動作**:
1. 新しいワークフローが実行開始
2. 同じ group の実行中ジョブがある場合、キャンセル
3. 新しいジョブがすぐに実行

**利点**:
- 常に最新のコードが実行される
- リソースの無駄を削減
- フィードバックが速い

**欠点**:
- 古いジョブが完了しない
- デプロイの順序が保証されない
- キャンセルされたデプロイの追跡が必要

### 条件付き設定

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

**使用シナリオ**:
- main ブランチは順次実行、他は最新のみ
- 環境によって戦略を変更

**例**:

#### 環境ベース

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.deployment.environment }}
  cancel-in-progress: ${{ github.event.deployment.environment != 'production' }}
```

#### ブランチベース

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ !startsWith(github.ref, 'refs/heads/release/') }}
```

#### イベントベース

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name != 'release' }}
```

## 適用レベル

### ワークフローレベル

```yaml
name: Deploy

on: [push]

concurrency:
  group: production-deploy
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying..."
```

**特徴**: ワークフロー全体に適用

### ジョブレベル

```yaml
name: CI

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    concurrency:
      group: test-${{ github.ref }}
      cancel-in-progress: true
    steps:
      - run: pnpm test

  deploy:
    runs-on: ubuntu-latest
    concurrency:
      group: production-deploy
      cancel-in-progress: false
    steps:
      - run: ./deploy.sh
```

**特徴**: ジョブごとに独立した制御

**利点**:
- ジョブごとに異なる戦略
- test は最新のみ、deploy は順次実行

**欠点**:
- 設定が複雑
- 管理が煩雑

## 式の活用

### github コンテキスト変数

```yaml
concurrency:
  group: |
    ${{ github.workflow }}-
    ${{ github.event_name }}-
    ${{ github.ref }}-
    ${{ github.event.pull_request.number || github.sha }}
```

**利用可能な変数**:
- `github.workflow`: ワークフロー名
- `github.ref`: ブランチまたは PR リファレンス
- `github.event_name`: トリガーイベント
- `github.event.deployment.environment`: デプロイ環境
- `github.event.pull_request.number`: PR 番号
- `github.sha`: コミット SHA

### 式の評価

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ matrix.environment }}
  cancel-in-progress: ${{ matrix.environment != 'production' }}
```

**注意**: matrix 変数はジョブレベルでのみ使用可能

## ベストプラクティス

### 1. 明確なグループ名

```yaml
# ❌ 悪い例
concurrency:
  group: ${{ github.ref }}

# ✅ 良い例
concurrency:
  group: deploy-${{ github.workflow }}-${{ github.ref }}
```

### 2. 環境の分離

```yaml
# ✅ 環境ごとに独立
concurrency:
  group: ${{ github.workflow }}-${{ github.event.deployment.environment }}
```

### 3. デフォルト値の設定

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' && github.ref != 'refs/heads/master' }}
```

### 4. ドキュメント化

```yaml
# ワークフローごとの並行実行制御
# - main ブランチ: 順次実行（キャンセルなし）
# - feature ブランチ: 最新のみ実行（古いジョブをキャンセル）
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ !contains(github.ref, 'refs/heads/main') }}
```

## トラブルシューティング

### グループ名が一致しない

**問題**: 並行実行制御が機能しない

**原因**: group 名が動的に変わる

**解決**:
```yaml
# ❌ 問題のある例
concurrency:
  group: ${{ github.run_id }}  # 毎回異なる

# ✅ 修正例
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
```

### キャンセルされないジョブ

**問題**: `cancel-in-progress: true` でもキャンセルされない

**原因**:
1. group 名が異なる
2. ワークフローレベルとジョブレベルの混在
3. API レート制限

**解決**:
1. group 名を統一
2. 適用レベルを統一
3. リトライ戦略を実装

---

**参照**:
- [GitHub Actions: Concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)
- [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#concurrency)
