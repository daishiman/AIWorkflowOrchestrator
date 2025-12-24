---
name: .claude/skills/pre-commit-security/SKILL.md
description: |
  pre-commit hookセキュリティスキル。機密情報検出パターン、
  git-secrets/gitleaks統合、チーム展開戦略、Git履歴スキャンを提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/pre-commit-security/resources/detection-pattern-library.md`: Secret Detection Pattern Library
  - `.claude/skills/pre-commit-security/scripts/setup-git-security.mjs`: Git Security Setup Script
  - `.claude/skills/pre-commit-security/templates/pre-commit-hook-template.sh`: Pre-commit Hook Template for Secret Detection

  使用タイミング:
  - pre-commit hookを実装する時
  - 機密情報検出パターンを設計する時
  - git-secrets/gitleaksを導入する時
  - Git履歴をスキャンする時
  - チーム全体にhookを展開する時

  Use when implementing pre-commit hooks, detecting secrets,
  or scanning Git history for sensitive information.
version: 1.0.0
---

# Pre-commit Security Hooks

## 概要

pre-commit hook は、コミット時に自動で機密情報をチェックし、
Git 混入を防ぐ第二防衛線です。このスキルは、効果的な hook 実装と
ツール統合手法を提供します。

## ツール選択

### git-secrets

**特徴**:

- AWS Labs が開発
- pre-commit/pre-push hook として動作
- カスタムパターン追加可能
- 軽量、高速

**推奨用途**: AWS プロジェクト、シンプルな検出

**インストール**:

```bash
# macOS
brew install git-secrets

# Linux
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install
```

**セットアップ**:

```bash
cd /path/to/repo
git secrets --install
git secrets --register-aws

# カスタムパターン追加
git secrets --add 'sk-proj-[a-zA-Z0-9]{48}'
git secrets --add 'https://discord\.com/api/webhooks/\d+/[a-zA-Z0-9_-]+'

# ホワイトリスト
git secrets --add --allowed '.env.example'
```

### gitleaks

**特徴**:

- 高速、高精度
- CI/CD 統合が容易
- 詳細なレポート生成（JSON/SARIF）
- エントロピーベース検出

**推奨用途**: CI/CD 統合、詳細レポート必要時

**設定ファイル** (`.gitleaks.toml`):

```toml
title = "gitleaks config"

[[rules]]
id = "openai-api-key"
description = "OpenAI API Key"
regex = '''sk-proj-[a-zA-Z0-9]{48}'''

[[rules]]
id = "stripe-secret-key"
description = "Stripe Secret Key"
regex = '''sk_live_[0-9a-zA-Z]{24,}'''

[[rules]]
id = "generic-api-key"
description = "Generic API Key"
regex = '''(?i)(api[_-]?key|apikey)\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']'''

[allowlist]
paths = [
  '''.env.example''',
  '''tests/fixtures/.*'''
]
```

### truffleHog

**特徴**:

- エントロピーベース検出（パターン非依存）
- Git 履歴の深層スキャン
- 高い検出率（誤検知も多い）

**推奨用途**: 包括的履歴スキャン、初回監査

**実行**:

```bash
# Git履歴全体スキャン
trufflehog git file://. --only-verified

# 特定期間のみ
trufflehog git file://. --since-commit abc123
```

## 検出パターン設計

### 汎用 Secret パターン

```regex
# Password
(password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']

# API Key
(api[_-]?key|apikey)\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']

# Secret/Token
(secret[_-]?key|token)\s*[:=]\s*["'][^"']{20,}["']

# Bearer Token
(auth|authorization)\s*[:=]\s*["']Bearer\s+[a-zA-Z0-9._-]+["']
```

### クラウドプロバイダー固有

```regex
# AWS
AKIA[0-9A-Z]{16}                    # Access Key ID
[a-zA-Z0-9/+=]{40}                  # Secret Access Key

# Google Cloud
AIza[0-9A-Za-z\\-_]{35}             # API Key

# OpenAI
sk-proj-[a-zA-Z0-9]{48}             # API Key

# Anthropic
sk-ant-api03-[a-zA-Z0-9_-]{95}      # API Key

# Stripe
(sk|pk)_(live|test)_[0-9a-zA-Z]{24,}

# GitHub
ghp_[a-zA-Z0-9]{36}                 # Personal Access Token
github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}

# Discord
https://discord\.com/api/webhooks/\d+/[a-zA-Z0-9_-]+
```

### 接続文字列パターン

```regex
# SQLite/Turso
libsql://[^:]+:[^@]+@[^/]+

# MySQL
mysql://[^:]+:[^@]+@[^/]+

# MongoDB
mongodb(\+srv)?://[^:]+:[^@]+@

# Redis
redis://:[^@]+@[^/]+
```

### 暗号化鍵パターン

```regex
# RSA Private Key
-----BEGIN RSA PRIVATE KEY-----

# SSH Private Key
-----BEGIN OPENSSH PRIVATE KEY-----

# PGP Private Key
-----BEGIN PGP PRIVATE KEY BLOCK-----

# Generic Private Key
-----BEGIN .* PRIVATE KEY-----
```

## 誤検知対策

### ホワイトリスト設計

```bash
# ファイルパスホワイトリスト
WHITELIST_FILES=(
  ".env.example"
  ".env.template"
  "tests/fixtures/"
  "tests/mocks/"
  "docs/examples/"
  "README.md"
)

# 文字列ホワイトリスト
WHITELIST_STRINGS=(
  "example"
  "sample"
  "test"
  "mock"
  "fixture"
  "placeholder"
  "your-api-key-here"
  "replace-with-actual"
)
```

### コンテキストベース除外

```bash
# pre-commit hookでのコンテキストチェック
MATCHED_LINE=$(git diff --cached "$FILE" | grep -E "$PATTERN")

# "example"を含む行は除外
if echo "$MATCHED_LINE" | grep -qi "example"; then
  continue  # ホワイトリスト
fi

# コメント行は除外
if echo "$MATCHED_LINE" | grep -qE '^\s*(#|//|/\*)'; then
  continue  # コメント
fi
```

## pre-commit hook 実装

### シンプルな実装

```bash
#!/bin/bash
# .git/hooks/pre-commit

set -e

FILES=$(git diff --cached --name-only)

for FILE in $FILES; do
  if git diff --cached "$FILE" | grep -qE "sk-proj-[a-zA-Z0-9]{48}"; then
    echo "🚨 OpenAI API Key detected in $FILE"
    exit 1
  fi
done

exit 0
```

### 詳細実装（テンプレート参照）

詳細は `templates/pre-commit-hook-template.sh` を参照

## チーム展開戦略

### 自動セットアップスクリプト

```bash
#!/bin/bash
# scripts/setup-git-security.sh

set -e

# git-secretsインストール
if ! command -v git-secrets &> /dev/null; then
  brew install git-secrets  # macOS
fi

# 初期化
git secrets --install --force

# パターン登録
git secrets --register-aws
git secrets --add 'sk-proj-[a-zA-Z0-9]{48}'
git secrets --add --allowed '.env.example'

# 履歴スキャン
git secrets --scan-history

echo "✅ Git security setup complete"
```

### オンボーディングプロセス統合

```markdown
# 新規メンバーオンボーディングチェックリスト

- [ ] リポジトリをクローン
- [ ] `.claude/skills/pre-commit-security/scripts/setup-git-security.sh` を実行
- [ ] `.env.example` をコピーして `.env.local` 作成
- [ ] テストコミットで hook 動作確認:
      echo "test=secret" > test.txt
      git add test.txt
      git commit -m "test" # → ブロックされるはず
- [ ] test.txt を削除
```

## Git 履歴スキャン

### 全履歴スキャン

```bash
# git-secretsで全履歴
git secrets --scan-history

# gitleaksで全履歴
gitleaks detect --source . --verbose

# truffleHogで全履歴（高精度）
trufflehog git file://. --only-verified
```

### 特定期間のスキャン

```bash
# 最近100コミット
git log --all --pretty=format:%H | head -100 | xargs -I {} gitleaks detect --log-opts={}

# 2025年1月以降
gitleaks detect --log-opts="--since='2025-01-01'"
```

### 削除済みファイルのスキャン

```bash
# 削除されたファイルを含む全ファイル追跡
git log --all --pretty=format: --name-only --diff-filter=D | sort -u > deleted-files.txt

# 各削除ファイルの内容をスキャン
while IFS= read -r file; do
  git log --all --pretty=format:%H -- "$file" | while read commit; do
    git show "$commit:$file" 2>/dev/null | gitleaks detect --no-git --verbose
  done
done < deleted-files.txt
```

## 実装チェックリスト

### .gitignore

- [ ] プロジェクトルートに配置されているか？
- [ ] 環境変数パターンが含まれているか？
- [ ] Secret ファイルパターンが含まれているか？
- [ ] クラウドプロバイダー別パターンが含まれているか？
- [ ] プロジェクト固有パターンが追加されているか？

### pre-commit hook

- [ ] hook が.git/hooks/pre-commit に配置されているか？
- [ ] 実行権限があるか？（chmod +x）
- [ ] 検出パターンが包括的か？
- [ ] ホワイトリストが設定されているか？
- [ ] エラーメッセージが明確か？

### チーム展開

- [ ] セットアップスクリプトが提供されているか？
- [ ] オンボーディングプロセスに組み込まれているか？
- [ ] 全員が hook を有効化しているか確認済みか？

## 関連スキル

- `.claude/skills/gitignore-management/SKILL.md` - .gitignore 設計詳細
- `.claude/skills/github-actions-security/SKILL.md` - CI/CD 統合
- `.claude/skills/zero-trust-security/SKILL.md` - アクセス制御

## リソースファイル

- `resources/detection-pattern-library.md` - 検出パターンライブラリ

## スクリプト

- `scripts/setup-git-security.mjs` - Git Security 自動セットアップ

## テンプレート

- `templates/pre-commit-hook-template.sh` - pre-commit hook テンプレート
