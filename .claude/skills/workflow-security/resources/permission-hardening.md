# 権限強化（Permission Hardening）

GitHub Actions ワークフローにおける最小権限の原則の実装とGITHUB_TOKENの適切なスコープ制御。

## GITHUB_TOKEN権限の概要

### デフォルト動作（リポジトリ設定依存）

**設定箇所**: Settings → Actions → General → Workflow permissions

1. **Read and write permissions（デフォルト、危険）**
   - すべてのスコープに書き込み権限
   - 過剰な権限による攻撃リスク大

2. **Read repository contents and packages permissions（推奨）**
   - デフォルトは読み取り専用
   - 必要な権限のみワークフローで明示

### 権限スコープ一覧

| スコープ              | 読み取り                 | 書き込み               | 用途                 |
| --------------------- | ------------------------ | ---------------------- | -------------------- |
| `actions`             | ワークフロー実行確認     | ワークフローキャンセル | CI/CD管理            |
| `checks`              | チェック結果表示         | チェックステータス作成 | テスト結果報告       |
| `contents`            | ソースコード取得         | コミット、タグ作成     | リリース、変更管理   |
| `deployments`         | デプロイ状況確認         | デプロイステータス作成 | デプロイメント管理   |
| `discussions`         | ディスカッション読み取り | ディスカッション作成   | コミュニティ管理     |
| `issues`              | Issue読み取り            | Issue作成、編集        | バグ報告自動化       |
| `packages`            | パッケージダウンロード   | パッケージ公開         | パッケージレジストリ |
| `pages`               | Pages設定確認            | Pages デプロイ         | 静的サイト公開       |
| `pull-requests`       | PR読み取り               | PRコメント、ラベル     | PR自動化             |
| `repository-projects` | プロジェクト確認         | プロジェクト管理       | プロジェクト自動化   |
| `security-events`     | セキュリティアラート     | アラート解決           | セキュリティ管理     |
| `statuses`            | ステータス確認           | コミットステータス作成 | CI/CD統合            |

## 最小権限設定パターン

### パターン1: CI/CDパイプライン（読み取り専用）

**ユースケース**: テスト、リント、ビルド（成果物なし）

```yaml
name: CI
on: [push, pull_request]

permissions:
  contents: read # ソースコード取得のみ

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@a81bbbf8298c0fa03ea29cdc473d45769f953675
      - run: pnpm install
      - run: pnpm test
```

**理由**: ソースコード読み取り以外不要。攻撃者がトークンを盗んでも読み取り専用。

### パターン2: PR自動化（PRコメント）

**ユースケース**: テストカバレッジレポート、リントエラーコメント

```yaml
name: PR Automation
on: pull_request

permissions:
  contents: read # ソースコード取得
  pull-requests: write # PRコメント投稿

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@a81bbbf8298c0fa03ea29cdc473d45769f953675
      - name: Test coverage
        run: pnpm test -- --coverage
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'Coverage report:\n...'
            })
```

### パターン3: リリース作成（書き込み権限）

**ユースケース**: タグ作成、GitHubリリース公開

```yaml
name: Release
on:
  push:
    tags:
      - "v*"

permissions:
  contents: write # タグ、リリース作成

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@a81bbbf8298c0fa03ea29cdc473d45769f953675
      - name: Build
        run: pnpm run build
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*
```

### パターン4: パッケージ公開

**ユースケース**: pnpm、Docker、Maven公開

```yaml
name: Publish
on:
  release:
    types: [published]

permissions:
  contents: read
  packages: write # GitHub Packagesへの公開

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@a81bbbf8298c0fa03ea29cdc473d45769f953675
      - name: Build
        run: pnpm run build
      - name: Publish to GitHub Packages
        run: pnpm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### パターン5: Pages デプロイ

**ユースケース**: GitHub Pages への静的サイト公開

```yaml
name: Deploy Pages
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write # Pages デプロイ
  id-token: write # OIDC認証

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@a81bbbf8298c0fa03ea29cdc473d45769f953675
      - name: Build
        run: pnpm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

## ジョブレベル権限の上書き

**ワークフローレベル** vs **ジョブレベル**:

```yaml
# ワークフローレベル（デフォルト）
permissions:
  contents: read

jobs:
  test:
    # ワークフローレベルを継承
    runs-on: ubuntu-latest
    steps:
      - run: echo "contents: read"

  release:
    # ジョブレベルで上書き
    permissions:
      contents: write
      packages: write
    runs-on: ubuntu-latest
    steps:
      - run: echo "contents: write, packages: write"
```

**ベストプラクティス**:

- ワークフローレベル: 最も制限的（`contents: read`）
- ジョブレベル: 必要なジョブのみ昇格

## 権限なし（完全制限）

**ユースケース**: 外部サービスのみ使用（AWS、GCP、サードパーティAPI）

```yaml
permissions: {} # すべての権限拒否

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@a81bbbf8298c0fa03ea29cdc473d45769f953675
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: aws s3 sync ./dist s3://my-bucket
```

**理由**: GITHUB_TOKENを一切使用しないため、トークン盗難のリスクゼロ。

## トークンスコープの検証

### GitHub Script での確認

```yaml
- uses: actions/github-script@v7
  with:
    script: |
      const token = core.getInput('token', {required: true});
      const octokit = github.getOctokit(token);

      // 権限確認
      try {
        await octokit.rest.repos.get({
          owner: context.repo.owner,
          repo: context.repo.repo
        });
        core.info('✅ contents: read available');
      } catch (error) {
        core.warning('❌ contents: read denied');
      }
```

## 権限エスカレーション攻撃の防止

### 攻撃シナリオ1: 過剰な権限

```yaml
# ❌ 危険: 不要な書き込み権限
permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  test:
    steps:
      - run: pnpm test # 読み取りのみで十分
```

**攻撃**: 依存関係の脆弱性を悪用してコミット、Issue作成。

### 攻撃シナリオ2: pull_request_target

```yaml
# ❌ 危険: PRコードが書き込み権限で実行
on: pull_request_target
permissions:
  contents: write

jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install # 攻撃者のpackage.jsonが実行される
```

**攻撃**: `package.json`の`postinstall`スクリプトでリポジトリ改ざん。

**対策**:

```yaml
on: pull_request_target
permissions:
  pull-requests: write # 必要最小限

jobs:
  comment:
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.base_ref }} # ベースブランチのコード
      - run: pnpm install # 信頼できるコード
```

## リポジトリ設定の推奨事項

### 1. デフォルト権限を制限

Settings → Actions → General → Workflow permissions:

- ✅ **Read repository contents and packages permissions**
- ❌ Read and write permissions

### 2. フォーク PR の制限

Settings → Actions → General → Fork pull request workflows:

- ✅ **Require approval for first-time contributors**
- ✅ **Require approval for all outside collaborators**

### 3. ワークフロー実行の制限

Settings → Actions → General → Actions permissions:

- ✅ **Allow select actions and reusable workflows**
- 信頼できるアクションのみ許可

## 権限監査チェックリスト

- [ ] すべてのワークフローに明示的な`permissions:`設定
- [ ] ジョブごとに最小限の権限
- [ ] `write-all`または`contents: write`の使用箇所を正当化
- [ ] pull_request_targetでの書き込み権限なし
- [ ] リポジトリ設定がデフォルトで読み取り専用
- [ ] 外部サービス使用時は`permissions: {}`

---

**参考リンク**:

- [Permissions for the GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
