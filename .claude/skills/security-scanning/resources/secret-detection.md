# シークレット検出

## 概要

コードリポジトリ内の機密情報（APIキー、パスワード、トークン等）を検出します。
コミット前とCI/CDでの二重チェックが重要です。

## ツール比較

| ツール | 特徴 | コスト |
|-------|------|--------|
| TruffleHog | 高精度、Git履歴スキャン | OSS |
| GitLeaks | 高速、pre-commit対応 | OSS |
| detect-secrets | Yelp製、ベースライン管理 | OSS |
| GitHub Secret Scanning | GitHub統合 | 無料（Public） |

## TruffleHog

### インストール

```bash
# macOS
brew install trufflehog

# Docker
docker pull trufflesecurity/trufflehog:latest

# Go
go install github.com/trufflesecurity/trufflehog/v3@latest
```

### 基本使用法

```bash
# Git履歴全体をスキャン
trufflehog git file://. --since-commit HEAD~100

# GitHub リポジトリをスキャン
trufflehog github --repo https://github.com/org/repo

# ファイルシステムをスキャン
trufflehog filesystem .

# JSON出力
trufflehog git file://. --json
```

### CI/CD統合

```yaml
- name: TruffleHog Scan
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
```

## GitLeaks

### インストール

```bash
# macOS
brew install gitleaks

# Docker
docker pull zricethezav/gitleaks:latest
```

### 基本使用法

```bash
# リポジトリスキャン
gitleaks detect --source . -v

# Git履歴スキャン
gitleaks detect --source . --log-opts="--all"

# pre-commitモード
gitleaks protect --staged

# レポート出力
gitleaks detect --source . --report-path report.json
```

### 設定ファイル

```yaml
# .gitleaks.toml
title = "Custom Gitleaks Config"

[extend]
useDefault = true

[[rules]]
id = "custom-api-key"
description = "Custom API Key"
regex = '''(?i)my_api_key\s*=\s*['"]?([a-zA-Z0-9]{32,})['"]?'''
secretGroup = 1

[allowlist]
paths = [
    '''\.gitleaks\.toml$''',
    '''\.env\.example$''',
]

commits = [
    "abc123def456",  # Known safe commit
]
```

### pre-commit統合

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

## GitHub Secret Scanning

### 有効化

Repository Settings → Security → Secret scanning → Enable

### プッシュ保護

```
Repository Settings → Security → Push protection → Enable
```

コミット時にシークレットを検出するとプッシュをブロック。

### カスタムパターン

```yaml
# Organization Settings → Security → Secret scanning → Custom patterns
name: "Internal API Key"
secret_format: "INTERNAL_[A-Z0-9]{32}"
```

## GitHub Actions統合

### 包括的スキャン

```yaml
name: Secret Detection

on:
  push:
    branches: [main]
  pull_request:

jobs:
  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 全履歴が必要

      - name: TruffleHog Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
          extra_args: --only-verified

      - name: GitLeaks Scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 検出パターン例

### 一般的なシークレット

| 種類 | パターン例 |
|------|-----------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` |
| AWS Secret Key | `[A-Za-z0-9/+=]{40}` |
| GitHub Token | `gh[ps]_[A-Za-z0-9]{36}` |
| Slack Token | `xox[baprs]-[0-9a-zA-Z-]+` |
| Generic API Key | `[aA][pP][iI][-_]?[kK][eE][yY].*['"][0-9a-zA-Z]{16,}['"]` |

### 誤検知の除外

```yaml
# .gitleaks.toml
[allowlist]
description = "Allowlisted patterns"

# テストファイル
paths = [
    '''test/.*''',
    '''.*_test\.go$''',
    '''\.env\.example$''',
]

# 特定のコミット
commits = [
    "abc123def456789",
]

# 特定の正規表現（例：ダミー値）
regexes = [
    '''EXAMPLE_API_KEY''',
    '''your-api-key-here''',
    '''<your-token>''',
]
```

## シークレット漏洩時の対応

### 即時対応

```
1. シークレットを無効化/ローテーション
   └─ API Provider のダッシュボードでキーを再生成

2. Git履歴から削除
   └─ git filter-branch または BFG Repo-Cleaner

3. 影響範囲の調査
   └─ アクセスログの確認

4. インシデントレポート作成
```

### BFG Repo-Cleaner使用例

```bash
# BFGインストール
brew install bfg

# シークレットを含むファイルを履歴から削除
bfg --delete-files .env

# テキストを置換
echo "SECRET_KEY_VALUE" > passwords.txt
bfg --replace-text passwords.txt

# クリーンアップ
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 強制プッシュ（注意！）
git push --force
```

## ベストプラクティス

### 予防策

1. **環境変数使用**: コードにシークレットを書かない
2. **pre-commit hook**: コミット前にスキャン
3. **プッシュ保護**: GitHub Push Protection有効化
4. **シークレットマネージャー**: Vault、AWS Secrets Manager等

### 検出時の対応

1. **即時無効化**: 漏洩したシークレットを即座に無効化
2. **ローテーション**: 新しいシークレットを発行
3. **履歴削除**: Git履歴からの完全削除
4. **監査**: 不正利用の有無を確認

### 除外管理

1. **ベースライン**: 既知の誤検知をベースライン化
2. **定期レビュー**: 除外設定の定期的な見直し
3. **文書化**: 除外理由を明確に記録
