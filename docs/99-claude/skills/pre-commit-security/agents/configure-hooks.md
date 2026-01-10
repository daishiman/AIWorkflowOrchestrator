# Task仕様書: Pre-commit Hook 設定

## メタデータ

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| Task ID  | configure-hooks                                      |
| 目的     | git-secrets/gitleaksを導入し、検出パターンを設定する |
| 入力     | 検出パターン仕様、リスク評価レポート                 |
| 出力     | 設定済みpre-commit hook、チーム展開計画              |
| 前提条件 | analyze-secretsが完了している                        |
| 完了条件 | hookが動作し、テストケースで機密情報を検出できる     |

## 目的

git-secrets または gitleaks を選定・導入し、analyze-secretsで特定した検出パターンを設定する。チーム全体への展開戦略を策定し、CI/CD統合の基盤を整備する。

## アクション

### 1. ツール選定

**判断基準**:

| 条件                                 | 推奨ツール  | 理由                       |
| ------------------------------------ | ----------- | -------------------------- |
| AWS中心のプロジェクト                | git-secrets | AWS公式、軽量              |
| 多様なクラウドサービス使用           | gitleaks    | 包括的なパターンライブラリ |
| CI/CD統合が必須                      | gitleaks    | SARIF形式対応              |
| カスタムパターンのメンテナンスを重視 | git-secrets | シンプルな正規表現ベース   |

**参照**: See [references/basics.md](../references/basics.md) - ツール選択詳細ガイド

### 2. セットアップスクリプト実行

**git-secretsの場合**:

```bash
# 自動セットアップスクリプト実行
node .claude/skills/pre-commit-security/scripts/setup-git-security.mjs
```

**gitleaksの場合**:

```bash
# インストール
brew install gitleaks

# 設定ファイル作成
cat > .gitleaks.toml <<'EOF'
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
EOF

# pre-commit hookとして統合
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/sh
gitleaks protect --staged --verbose
EOF
chmod +x .git/hooks/pre-commit
```

### 3. カスタムパターン追加

**analyze-secretsで特定したパターンを追加**:

```bash
# git-secretsの場合
git secrets --add 'your-custom-pattern-here'
git secrets --add --allowed 'whitelist-pattern'

# gitleaksの場合 (.gitleaks.tomlに追記)
cat >> .gitleaks.toml <<'EOF'
[[rules]]
id = "custom-secret"
description = "Custom Secret Pattern"
regex = '''your-regex-here'''
tags = ["custom"]
EOF
```

### 4. ホワイトリスト設定

**誤検知除外**:

```bash
# git-secretsの場合
git secrets --add --allowed '.env.example'
git secrets --add --allowed 'tests/fixtures/'
git secrets --add --allowed 'example'
git secrets --add --allowed 'sample'

# gitleaksの場合 (.gitleaks.tomlのallowlistセクション)
# 上記の設定ファイル例を参照
```

### 5. チーム展開計画の策定

**方法1: 共有hookスクリプト（推奨）**

```bash
# .githooks/ ディレクトリに配置
mkdir -p .githooks
cp .git/hooks/pre-commit .githooks/pre-commit
chmod +x .githooks/pre-commit

# README.md に追記
echo "
## セットアップ

\`\`\`bash
git config core.hooksPath .githooks
\`\`\`
" >> README.md
```

**方法2: huskyを使用**

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
echo "pnpm exec lint-staged" > .husky/pre-commit

# package.json に追記
cat >> package.json <<'EOF'
{
  "lint-staged": {
    "*": ["gitleaks protect --staged --verbose"]
  }
}
EOF
```

**参照**: See [references/deployment.md](../references/deployment.md) - チーム展開詳細ガイド

### 6. テスト実行

**動作確認**:

```bash
# テストファイル作成（検出されるべき）
echo 'API_KEY="sk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEF"' > test-secret.txt
git add test-secret.txt
git commit -m "test" # ❌ 検出されてブロックされるべき

# ホワイトリストテスト（検出されないべき）
echo 'API_KEY="example"' > test-whitelist.txt
git add test-whitelist.txt
git commit -m "test" # ✅ 許可されるべき

# クリーンアップ
rm test-secret.txt test-whitelist.txt
git reset HEAD~1
```

## 成果物

1. **設定済みpre-commit hook**
   - `.git/hooks/pre-commit` または `.gitleaks.toml`
   - カスタムパターンとホワイトリスト設定済み

2. **チーム展開ドキュメント**
   - セットアップ手順（README.mdまたは別ドキュメント）
   - トラブルシューティング手順

3. **テスト結果レポート**
   - 検出テストの成功/失敗記録
   - ホワイトリスト動作確認結果

## 参照リソース

- See [references/basics.md](../references/basics.md) - ツール選択・基本設定
- See [references/patterns.md](../references/patterns.md) - 検出パターン設計
- See [references/deployment.md](../references/deployment.md) - チーム展開戦略
- See [assets/pre-commit-hook-template.sh](../assets/pre-commit-hook-template.sh) - カスタムhookテンプレート

## 判断基準

### 進めてよい条件

- hookが正常に動作している
- テストケースで機密情報を正しく検出できる
- ホワイトリストが適切に機能している
- チーム展開手順が文書化されている

### 要調整条件

- 誤検知が多すぎる → ホワイトリスト追加
- 検出漏れがある → パターン追加・強化
- パフォーマンスが遅い → 差分スキャンに変更

## 次のTask

**Task**: validate-security (agents/validate-security.md)

**引継ぎ内容**:

- 設定済みhook
- テスト結果レポート
- チーム展開ドキュメント
