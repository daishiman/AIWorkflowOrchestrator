# チーム展開戦略

## 概要

pre-commit hookをチーム全体に展開し、全メンバーが機密情報漏洩防止の恩恵を受けられるようにするためのガイド。共有hookスクリプト、husky統合、強制適用戦略をカバーする。

## 展開方法の比較

| 方法                           | メリット                      | デメリット              | 推奨シーン                     |
| ------------------------------ | ----------------------------- | ----------------------- | ------------------------------ |
| 共有hookスクリプト             | バージョン管理可能、シンプル  | 手動セットアップ必要    | 全プロジェクト                 |
| husky + lint-staged            | 自動セットアップ、Node.js統合 | Node.jsプロジェクトのみ | Node.js/TypeScriptプロジェクト |
| CI/CD必須チェック              | バイパス不可、確実            | フィードバックが遅い    | 全プロジェクト（補完）         |
| pre-receive hook（サーバー側） | 完全強制、バイパス不可        | サーバー管理権限必要    | エンタープライズ環境           |

## 方法1: 共有hookスクリプト（推奨）

### 概要

`.githooks/` ディレクトリにhookスクリプトを配置し、Git管理対象にする。チームメンバーは `git config core.hooksPath .githooks` で有効化する。

### セットアップ手順

**1. hookスクリプト作成**:

```bash
# .githooks/ ディレクトリ作成
mkdir -p .githooks

# pre-commit hook作成（git-secretsの場合）
cat > .githooks/pre-commit <<'EOF'
#!/bin/sh
# Pre-commit hook for secret detection

# git-secretsがインストールされているか確認
if ! command -v git-secrets &> /dev/null; then
  echo "❌ git-secrets is not installed"
  echo "Please install: brew install git-secrets"
  echo "Then run: git secrets --install"
  exit 1
fi

# Secretスキャン実行
git secrets --pre_commit_hook -- "$@"
EOF

# 実行権限付与
chmod +x .githooks/pre-commit

# Git管理対象に追加
git add .githooks/pre-commit
```

**2. README.mdに手順追加**:

````markdown
## セットアップ

### Pre-commit Hook有効化

```bash
# Hookパス設定
git config core.hooksPath .githooks

# git-secretsインストール（macOS）
brew install git-secrets

# パターン登録
cd your-repo
git secrets --install
git secrets --register-aws
git secrets --add 'sk-proj-[a-zA-Z0-9]{48}'
```
````

### 動作確認

```bash
# テスト（ブロックされるべき）
echo 'API_KEY="sk-proj-test123456789012345678901234567890123456"' > test.txt
git add test.txt
git commit -m "test"  # ❌ ブロックされる

# クリーンアップ
rm test.txt
git reset HEAD
```

````

**3. セットアップスクリプト作成（オプション）**:

```bash
# scripts/setup-hooks.sh
cat > scripts/setup-hooks.sh <<'EOF'
#!/bin/bash
set -e

echo "🔧 Setting up pre-commit hooks..."

# git-secretsインストール確認
if ! command -v git-secrets &> /dev/null; then
  echo "📦 Installing git-secrets..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install git-secrets
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    git clone https://github.com/awslabs/git-secrets.git /tmp/git-secrets
    cd /tmp/git-secrets && sudo make install
  fi
fi

# Hookパス設定
git config core.hooksPath .githooks

# git-secrets初期化
git secrets --install --force

# パターン登録
git secrets --register-aws
git secrets --add 'sk-proj-[a-zA-Z0-9]{48}'
git secrets --add 'sk-ant-api03-[a-zA-Z0-9_-]{95}'

# ホワイトリスト
git secrets --add --allowed 'example'
git secrets --add --allowed '.env.example'

echo "✅ Setup complete!"
EOF

chmod +x scripts/setup-hooks.sh
````

**使用方法**:

```bash
# チームメンバーはこれを実行するだけ
./scripts/setup-hooks.sh
```

### メリット・デメリット

**メリット**:

- バージョン管理可能（hookスクリプトの変更履歴を追跡）
- 言語・フレームワーク非依存
- シンプルで理解しやすい

**デメリット**:

- 手動セットアップ必要（`git config core.hooksPath .githooks`）
- チームメンバーが忘れる可能性
- 新規メンバーのオンボーディングで漏れる可能性

**対策**:

- README.mdに目立つように記載
- CI/CDでhook設定を確認（後述）
- セットアップスクリプト提供

## 方法2: husky + lint-staged

### 概要

Node.jsプロジェクト向け。`pnpm install` 時に自動セットアップされ、手動設定が不要。

### セットアップ手順

**1. huskyインストール**:

```bash
pnpm add -D husky lint-staged
```

**2. husky初期化**:

```bash
pnpm exec husky init
```

**3. pre-commit hook設定**:

```bash
# .husky/pre-commit
cat > .husky/pre-commit <<'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm exec lint-staged
EOF

chmod +x .husky/pre-commit
```

**4. lint-staged設定（package.json）**:

```json
{
  "lint-staged": {
    "*": ["gitleaks protect --staged --verbose"]
  }
}
```

**5. postinstallスクリプト追加（package.json）**:

```json
{
  "scripts": {
    "postinstall": "husky install"
  }
}
```

**使用方法**:

```bash
# チームメンバーはpnpm installするだけで自動セットアップ
pnpm install
```

### メリット・デメリット

**メリット**:

- 完全自動セットアップ（`pnpm install`で有効化）
- Node.jsエコシステムとの統合
- lint-stagedでステージングファイルのみスキャン（高速）

**デメリット**:

- Node.jsプロジェクトのみ
- 依存関係が増える
- huskyのバージョン管理が必要

## 方法3: CI/CD必須チェック

### 概要

ローカルhookの補完として、CI/CDでも必須チェックを実施。ローカルhookをバイパスされても最終的にブロックする。

### GitHub Actions例

**.github/workflows/security.yml**:

```yaml
name: Secret Scan
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 履歴全体を取得

      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: gitleaks-report
          path: gitleaks-report.sarif
```

### GitLab CI例

**.gitlab-ci.yml**:

```yaml
gitleaks:
  stage: test
  image: zricethezav/gitleaks:latest
  script:
    - gitleaks detect --verbose --report-format json --report-path gitleaks-report.json
  artifacts:
    reports:
      sast: gitleaks-report.json
    when: always
  allow_failure: false
```

### メリット・デメリット

**メリット**:

- バイパス不可（`--no-verify`も無効）
- チーム全体に強制適用
- 履歴スキャンも可能

**デメリット**:

- フィードバックが遅い（push後）
- CI/CD実行コスト

**ベストプラクティス**:

- ローカルhook + CI/CDの両方を使用
- PRマージ前に必須チェック

## 方法4: pre-receive hook（サーバー側）

### 概要

GitサーバーでPush時にスキャン。完全バイパス不可だが、サーバー管理権限が必要。

### GitHub Enterprise例

**設定手順**:

1. GitHub Enterprise管理画面 → Hooks
2. pre-receive hookスクリプトをアップロード
3. リポジトリに適用

**hookスクリプト例**:

```bash
#!/bin/bash
# pre-receive hook for GitHub Enterprise

while read oldrev newrev refname; do
  # Gitleaksでスキャン
  if ! gitleaks detect --log-opts="$oldrev..$newrev" --verbose; then
    echo "❌ Secret detected! Push rejected."
    exit 1
  fi
done
```

### メリット・デメリット

**メリット**:

- 完全強制（バイパス不可）
- サーバー側で一元管理

**デメリット**:

- サーバー管理権限必要
- GitHub.com/GitLab.comでは使用不可（Enterprise版のみ）
- 設定が複雑

**適用シーン**:

- エンタープライズ環境
- セキュリティ要件が厳格

## Hook設定確認スクリプト

### 概要

CI/CDでチームメンバーがhookを正しく設定しているか確認。

**確認スクリプト（.github/workflows/check-hooks.yml）**:

```yaml
name: Check Hook Configuration
on: [pull_request]

jobs:
  check-hooks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check if hooks are configured
        run: |
          # .githooks/pre-commitが存在するか確認
          if [ ! -f .githooks/pre-commit ]; then
            echo "❌ .githooks/pre-commit not found"
            exit 1
          fi

          # 実行権限があるか確認
          if [ ! -x .githooks/pre-commit ]; then
            echo "❌ .githooks/pre-commit is not executable"
            exit 1
          fi

          echo "✅ Hooks are properly configured"
```

## オンボーディングチェックリスト

### 新規メンバー向け

````markdown
## セキュリティHookセットアップ

新規メンバーは以下を完了してください：

- [ ] git-secrets または gitleaks をインストール
  ```bash
  brew install git-secrets
  # または
  brew install gitleaks
  ```
````

- [ ] Hookパスを設定

  ```bash
  git config core.hooksPath .githooks
  ```

- [ ] セットアップスクリプト実行

  ```bash
  ./scripts/setup-hooks.sh
  ```

- [ ] 動作確認

  ```bash
  echo 'TEST_KEY="sk-proj-test123456789012345678901234567890123456"' > test.txt
  git add test.txt
  git commit -m "test"  # ❌ ブロックされることを確認
  rm test.txt
  git reset HEAD
  ```

- [ ] CI/CDでの検証を確認
  ```bash
  git push  # ✅ GitHub Actionsでスキャン実行を確認
  ```

````

## トラブルシューティング

### チームメンバーがhookをセットアップしていない

**検出方法**:
- CI/CDでシークレット検出
- レビュー時に手動確認

**対策**:
1. README.mdに目立つように記載
2. オンボーディングチェックリスト必須化
3. CI/CDで必須チェック

### hookが動作しない

**原因**:
- `core.hooksPath` が設定されていない
- 実行権限がない
- ツール未インストール

**確認方法**:
```bash
# Hookパス確認
git config core.hooksPath

# 実行権限確認
ls -la .githooks/pre-commit

# ツール確認
command -v git-secrets
command -v gitleaks
````

**対策**:

```bash
# Hookパス再設定
git config core.hooksPath .githooks

# 実行権限付与
chmod +x .githooks/pre-commit

# ツールインストール
brew install git-secrets
```

### --no-verifyでバイパスされる

**対策**:

1. CI/CDで必須チェック（最終防衛線）
2. チームルールで`--no-verify`使用を禁止
3. pre-receive hook（サーバー側）で強制

## 推奨構成

### 小規模チーム（5人以下）

**構成**:

- 共有hookスクリプト（.githooks/）
- GitHub Actions必須チェック

**理由**:

- シンプルで導入が容易
- CI/CDで最終防衛

### 中規模チーム（5-20人）

**構成**:

- husky + lint-staged（Node.jsプロジェクト）
- または共有hookスクリプト（その他）
- GitHub Actions必須チェック
- セットアップスクリプト提供

**理由**:

- 自動セットアップでオンボーディング効率化
- CI/CDで確実にブロック

### 大規模チーム（20人以上）

**構成**:

- husky + lint-staged
- GitHub Actions必須チェック
- pre-receive hook（可能なら）
- セットアップスクリプト + オンボーディングチェックリスト

**理由**:

- 完全自動化
- 多層防御（ローカル + CI/CD + サーバー）
- 一元管理

## 次のステップ

- **CI/CD統合詳細**: See [ci-integration.md](ci-integration.md)
- **パターン設計**: See [patterns.md](patterns.md)
- **基礎ガイド**: See [basics.md](basics.md)
