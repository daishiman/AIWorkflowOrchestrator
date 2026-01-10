# GitHub Actions セキュリティ基礎

> 18-skills.md §3.5 準拠
> **相対パス**: `references/basics.md`

---

## 概要

GitHub Actionsワークフローのセキュリティ基礎知識。OWASP CI/CD Top 10に基づくリスク理解と基本的な対策を提供する。

---

## OWASP CI/CD Top 10

### CICD-SEC-1: Insufficient Flow Control Mechanisms

**リスク**: パイプライン実行フローの制御不足
**対策**:

- 本番デプロイに手動承認を設定
- Environment protection rules を活用

### CICD-SEC-2: Inadequate Identity and Access Management

**リスク**: 過剰な権限付与
**対策**:

- `permissions` で最小権限を明示
- `GITHUB_TOKEN` の権限を制限

### CICD-SEC-3: Dependency Chain Abuse

**リスク**: 悪意のある依存関係の注入
**対策**:

- 依存関係スキャン（Dependabot, Snyk）
- 外部アクションのバージョン固定

### CICD-SEC-4: Poisoned Pipeline Execution (PPE)

**リスク**: パイプライン設定の改ざん
**対策**:

- フォークPRからの実行制限
- ワークフロー変更のレビュー必須化

### CICD-SEC-5: Insufficient PBAC (Pipeline-Based Access Controls)

**リスク**: パイプラインのアクセス制御不足
**対策**:

- 環境ごとのシークレット分離
- デプロイ対象の制限

---

## シークレット管理の基本

### Repository Secrets vs Environment Secrets

| 種類                | 用途                     | スコープ             |
| ------------------- | ------------------------ | -------------------- |
| Repository Secrets  | リポジトリ共通の認証情報 | すべてのワークフロー |
| Environment Secrets | 環境固有の認証情報       | 特定の環境のみ       |

### 推奨構成

```yaml
# 本番環境用シークレット → Environment Secrets
jobs:
  deploy-prod:
    environment: production
    steps:
      - run: echo "${{ secrets.PROD_API_KEY }}"

# 共通シークレット → Repository Secrets
jobs:
  build:
    steps:
      - run: echo "${{ secrets.NPM_TOKEN }}"
```

---

## 権限設定の基本

### permissions ブロック

```yaml
permissions:
  contents: read # コードの読み取りのみ
  pull-requests: write # PR操作が必要な場合
  # 不要な権限は記載しない
```

### 権限の最小化原則

1. デフォルト権限を制限: `permissions: {}`
2. 必要な権限のみ明示的に追加
3. ジョブレベルで権限を分離

---

## ログマスキング

### 基本構文

```yaml
steps:
  - name: Mask sensitive value
    run: |
      echo "::add-mask::${{ secrets.API_KEY }}"
      # 以降のログでこの値はマスクされる
```

### 自動マスク対象

- `${{ secrets.* }}` で参照される値は自動マスク
- 環境変数経由でも自動マスク

---

## フォークPR制限

### 基本パターン

```yaml
jobs:
  sensitive-job:
    if: github.event.pull_request.head.repo.full_name == github.repository
    steps:
      - run: echo "Only runs for non-fork PRs"
```

### 理由

- フォークPRはシークレットにアクセスできない（デフォルト）
- `pull_request_target` イベントは注意が必要

---

## 関連リソース

- **実装パターン**: See [patterns.md](patterns.md)
- **脅威モデリング**: See [threat-modeling.md](threat-modeling.md)
