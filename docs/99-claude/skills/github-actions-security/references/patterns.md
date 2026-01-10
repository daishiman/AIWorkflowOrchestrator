# GitHub Actions セキュリティ実装パターン

> 18-skills.md §3.5 準拠
> **相対パス**: `references/patterns.md`

---

## 概要

GitHub Actionsワークフローのセキュリティ実装パターン集。具体的なYAML例と適用シナリオを提供する。

---

## パターン1: 最小権限トークン

### 目的

GITHUB_TOKENの権限を最小限に制限

### 実装

```yaml
name: Minimal Permissions

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write # このジョブのみに追加権限
    steps:
      - uses: actions/checkout@v4
```

### 適用シナリオ

- すべてのワークフローに適用推奨
- ジョブごとに必要な権限を明示

---

## パターン2: Environment Protection Rules

### 目的

本番デプロイに承認フローを設定

### 実装

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Deploy
        run: ./deploy.sh
        env:
          API_KEY: ${{ secrets.PROD_API_KEY }}
```

### GitHub設定

1. Settings > Environments > production
2. Required reviewers を設定
3. Wait timer を設定（任意）
4. Deployment branches を制限

---

## パターン3: フォークPRセキュリティ

### 目的

フォークPRからの悪意ある実行を防止

### 実装

```yaml
name: Secure PR Workflow

on:
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: npm run build

  # シークレットを使うジョブは分離
  deploy-preview:
    needs: build
    if: github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    steps:
      - name: Deploy preview
        env:
          PREVIEW_TOKEN: ${{ secrets.PREVIEW_TOKEN }}
        run: ./deploy-preview.sh
```

### 注意点

- `pull_request_target` は慎重に使用
- フォークPRではシークレットが利用不可（デフォルト）

---

## パターン4: 依存関係セキュリティ

### 目的

サプライチェーン攻撃を防止

### 実装

```yaml
name: Dependency Security

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 0 * * 1" # 毎週月曜

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run npm audit
        run: npm audit --audit-level=high
```

### 追加対策

- Dependabot の有効化
- 外部アクションのSHA固定

```yaml
# バージョン固定（推奨）
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
```

---

## パターン5: ログマスキング強化

### 目的

機密情報のログ露出を完全に防止

### 実装

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Setup masking
        run: |
          # 複数のシークレットをマスク
          echo "::add-mask::${{ secrets.API_KEY }}"
          echo "::add-mask::${{ secrets.DB_PASSWORD }}"

      - name: Build with secrets
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        run: |
          # これらの値はログに表示されない
          ./build.sh --api-key="$API_KEY"
```

### ベストプラクティス

- シークレットは常に環境変数経由で渡す
- コマンドライン引数への直接展開を避ける
- 出力をファイルに書き込む場合も注意

---

## パターン6: 品質ゲート統合

### 目的

セキュリティスキャンをデプロイの前提条件に

### 実装

```yaml
name: Secure Pipeline

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          languages: javascript

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  deploy:
    needs: [security-scan, lint]
    if: success()
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy
        run: ./deploy.sh
```

### 統合可能なスキャン

- CodeQL (SAST)
- Snyk / npm audit (SCA)
- Trivy (コンテナスキャン)
- OWASP ZAP (DAST)

---

## パターン7: 監査ログ強化

### 目的

セキュリティイベントの追跡可能性を確保

### 実装

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Log deployment start
        run: |
          echo "::notice title=Deployment Started::User: ${{ github.actor }}, Ref: ${{ github.ref }}, SHA: ${{ github.sha }}"

      - name: Deploy
        run: ./deploy.sh

      - name: Log deployment complete
        if: success()
        run: |
          echo "::notice title=Deployment Complete::Environment: production"
```

### GitHub Audit Log

- Enterprise/Organization で監査ログを有効化
- ワークフロー実行履歴を定期的にレビュー

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **脅威モデリング**: See [threat-modeling.md](threat-modeling.md)
