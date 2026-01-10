# Pre-commit Security基礎ガイド

## 概要

pre-commit hookを使用して機密情報（APIキー、パスワード、接続文字列など）を自動検出し、誤ってリポジトリにコミットすることを防ぐための基礎知識。

## Pre-commit Hookの仕組み

### 動作原理

```
開発者がコミット実行
    ↓
.git/hooks/pre-commit が自動実行
    ↓
シークレット検出ツールがスキャン
    ↓
検出あり → コミットブロック
検出なし → コミット成功
```

### Hookの配置

```bash
# ローカルhook（個人のみ）
.git/hooks/pre-commit

# 共有hook（チーム全体）
.githooks/pre-commit
↓
git config core.hooksPath .githooks
```

**重要**: `.git/hooks/` 配下のファイルはGit管理対象外のため、チーム展開には `.githooks/` を使用する。

## ツール選択ガイド

### git-secrets

**概要**:

- AWS公式ツール
- AWS認証情報検出に特化
- カスタムパターン追加可能

**強み**:

- 軽量で高速
- シンプルな正規表現ベース
- AWS公式サポート

**弱み**:

- AWSキー以外のパターンは手動追加必須
- パターンライブラリが小規模

**適用シーン**:

- AWS中心のプロジェクト
- カスタムパターンのメンテナンスを重視
- git hookに統合したい場合

**インストール**:

```bash
# macOS
brew install git-secrets

# Linux
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install
```

**基本セットアップ**:

```bash
# リポジトリで初期化
cd your-repo
git secrets --install

# AWSパターン追加
git secrets --register-aws

# カスタムパターン追加
git secrets --add 'sk-proj-[a-zA-Z0-9]{48}'

# ホワイトリスト追加
git secrets --add --allowed 'example'
```

### gitleaks

**概要**:

- 包括的なシークレット検出ツール
- 100以上のビルトインパターン
- TOML設定ファイルで管理

**強み**:

- 広範なクラウドサービス対応（AWS、GCP、Azure、OpenAI、Anthropic等）
- SARIF形式出力（CI/CD統合に最適）
- 高速スキャン（Go実装）
- 活発なメンテナンス

**弱み**:

- 設定ファイルがやや複雑
- git-secretsより重い

**適用シーン**:

- 多様なクラウドサービス使用
- CI/CD統合が必須
- Git履歴スキャンが必要
- カスタムパターンを設定ファイルで管理したい

**インストール**:

```bash
# macOS
brew install gitleaks

# Linux
wget https://github.com/zricethezav/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**基本セットアップ**:

```bash
# 現在のコミットをスキャン
gitleaks detect --verbose

# Git履歴全体をスキャン
gitleaks detect --verbose --log-opts="--all"

# pre-commit hookとして設定
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/sh
gitleaks protect --staged --verbose
EOF
chmod +x .git/hooks/pre-commit
```

**.gitleaks.toml設定例**:

```toml
title = "Gitleaks Configuration"

[[rules]]
id = "openai-api-key"
description = "OpenAI API Key"
regex = '''sk-proj-[a-zA-Z0-9]{48}'''
tags = ["api-key", "openai"]

[[rules]]
id = "anthropic-api-key"
description = "Anthropic API Key"
regex = '''sk-ant-api03-[a-zA-Z0-9_-]{95}'''
tags = ["api-key", "anthropic"]

[allowlist]
paths = [
  ".env.example",
  "tests/fixtures/"
]
regexes = [
  "example",
  "sample",
  "test"
]
```

## ツール比較表

| 項目                 | git-secrets   | gitleaks                  |
| -------------------- | ------------- | ------------------------- |
| **パターン数**       | 少（AWS特化） | 多（100+パターン）        |
| **カスタマイズ**     | CLIコマンド   | TOML設定ファイル          |
| **CI/CD統合**        | 手動          | SARIF形式でネイティブ対応 |
| **パフォーマンス**   | 高速          | 高速                      |
| **履歴スキャン**     | 可能          | 最適化済み                |
| **メンテナンス状態** | 活発          | 非常に活発                |
| **学習コスト**       | 低            | 中                        |
| **適用プロジェクト** | AWS中心       | 多様なクラウドサービス    |

## 推奨選定フロー

```
プロジェクトのクラウドサービスを確認
    ↓
AWS中心？
  Yes → git-secrets
  No  ↓
多様なサービス使用？
  Yes → gitleaks
  No  ↓
CI/CD統合が必須？
  Yes → gitleaks
  No  → git-secrets（シンプル）
```

## 基本的なワークフロー

### 1. ツール選定

- プロジェクトのクラウドサービスを確認
- 上記比較表を参考に選択

### 2. インストール

- git-secrets または gitleaks をインストール

### 3. 初期化

- `.git/hooks/pre-commit` または `.githooks/pre-commit` に設定

### 4. パターン追加

- プロジェクト固有のシークレットパターンを追加

### 5. ホワイトリスト設定

- `.env.example` など誤検知を除外

### 6. テスト

- 実際のシークレットでブロックされることを確認
- ホワイトリストが機能することを確認

### 7. チーム展開

- READMEにセットアップ手順を記載
- CI/CDに統合

## よくある質問

### Q: git-secretsとgitleaksを併用できますか？

**A**: 可能だが非推奨。

- 両方とも同じ目的（シークレット検出）のため、冗長
- パフォーマンス低下
- メンテナンス負荷増加

どちらか一方を選択し、カスタムパターンで不足分を補う方が効率的。

### Q: hookをバイパスしてコミットできますか？

**A**: 可能（`git commit --no-verify`）だが絶対に避けるべき。

- セキュリティリスク
- チームルール違反
- CI/CDで別途検出されるため、結局ブロックされる

緊急時もhookを無効化せず、ホワイトリストで対応する。

### Q: ホワイトリストの設定方法は？

**A**: ツールごとに異なる。

**git-secrets**:

```bash
git secrets --add --allowed 'pattern-to-allow'
git secrets --add --allowed '.env.example'
```

**gitleaks**:

```toml
[allowlist]
paths = [".env.example"]
regexes = ["example", "sample"]
```

### Q: 履歴スキャンは必須ですか？

**A**: 初回セットアップ時は**必須**。

- 既存のリークを発見
- 過去のコミットにシークレットが含まれている可能性
- 本番環境にデプロイされたコミットに含まれていた場合、深刻なセキュリティリスク

```bash
# git-secrets
git secrets --scan-history

# gitleaks
gitleaks detect --verbose --log-opts="--all"
```

### Q: CI/CDでのスキャンは必須ですか？

**A**: 強く推奨。

- ローカルhookはバイパス可能（`--no-verify`）
- チームメンバー全員がhookをセットアップしているとは限らない
- 最後の砦としてCI/CDでブロック

## 次のステップ

- **パターン設計**: See [patterns.md](patterns.md)
- **チーム展開**: See [deployment.md](deployment.md)
- **CI/CD統合**: See [ci-integration.md](ci-integration.md)
- **パターンライブラリ**: See [detection-pattern-library.md](detection-pattern-library.md)
