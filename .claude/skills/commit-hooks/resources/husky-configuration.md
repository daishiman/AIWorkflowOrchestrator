# Husky Configuration Guide

## Huskyとは

**目的**: Git hooksの管理と共有

**背景**: `.git/hooks/`は共有できない → Huskyで共有可能に

## セットアップ

### インストール

```bash
pnpm add -D husky
pnpm exec husky init
```

**自動生成**:
- `.husky/`ディレクトリ
- `.husky/pre-commit`サンプルフック
- `package.json`に`prepare`スクリプト追加

### package.json更新

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

**動作**: `pnpm install`時に自動でHusky有効化

## フックタイプ

### pre-commit

**実行タイミング**: `git commit`実行直前

**用途**:
- lint/format実行
- 型チェック
- ステージングファイルのみ処理

**設定例** (`.husky/pre-commit`):
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

### commit-msg

**実行タイミング**: コミットメッセージ入力後

**用途**:
- コミットメッセージ規約検証
- Conventional Commits強制

**設定例** (`.husky/commit-msg`):
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit $1
```

**commitlint設定** (`.commitlintrc.json`):
```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "test", "chore", "perf", "ci"
    ]],
    "subject-case": [2, "never", ["upper-case"]]
  }
}
```

### pre-push

**実行タイミング**: `git push`実行直前

**用途**:
- 全テスト実行
- ビルド検証
- カバレッジチェック

**設定例** (`.husky/pre-push`):
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm test
pnpm build
```

### post-merge

**実行タイミング**: `git merge`/`git pull`後

**用途**:
- 依存関係自動インストール
- マイグレーション自動実行

**設定例** (`.husky/post-merge`):
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# package.json変更時のみインストール
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep --quiet "package.json"; then
  pnpm install
fi
```

## フック作成

### 手動作成

```bash
# pre-commitフック作成
echo '#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged' > .husky/pre-commit

chmod +x .husky/pre-commit
```

### Husky CLIで作成

```bash
pnpm exec husky add .husky/pre-commit "pnpm lint-staged"
pnpm exec husky add .husky/commit-msg "pnpm commitlint --edit \$1"
```

## 実行権限

### 付与方法

```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### 確認

```bash
ls -la .husky/
```

**期待出力**: `-rwxr-xr-x`（実行可能）

## 条件分岐

### ブランチ別実行

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

branch=$(git branch --show-current)

if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
  # mainブランチのみ厳格チェック
  pnpm test
  pnpm build
else
  # フィーチャーブランチは軽量チェック
  pnpm lint-staged
fi
```

### ファイル変更検出

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# srcディレクトリ変更時のみテスト
if git diff --cached --name-only | grep --quiet "^src/"; then
  pnpm test
fi
```

## パフォーマンス最適化

### 並列実行

**lint-staged**:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

**並列実行**: デフォルトで有効

### キャッシュ活用

```bash
# ESLintキャッシュ
eslint --cache --fix

# Prettierキャッシュ
prettier --cache --write
```

### 対象ファイル絞り込み

```bash
# ステージングファイルのみ
pnpm lint-staged

# src/ディレクトリのみ
eslint "src/**/*.{ts,tsx}" --fix
```

## トラブルシューティング

### フックが実行されない

**確認**:
```bash
# Git hooksパス確認
git config core.hooksPath

# 期待値: .husky
```

**修正**:
```bash
git config core.hooksPath .husky
```

### 実行権限エラー

**エラー**: `Permission denied`

**修正**:
```bash
chmod +x .husky/pre-commit
```

### Windowsで改行コードエラー

**エラー**: `\r command not found`

**修正**:
```bash
# LF改行に変換
dos2unix .husky/pre-commit
```

または`.gitattributes`設定:
```
* text=auto eol=lf
*.sh text eol=lf
```

## Husky無効化

### 一時的無効化

```bash
# pre-commit skip
git commit --no-verify -m "message"

# 環境変数
HUSKY=0 git commit -m "message"
```

### 永久無効化（非推奨）

```bash
# package.jsonから削除
{
  "scripts": {
    "prepare": ""  // 空にする
  }
}
```

## まとめ

**基本構成**:
- pre-commit: lint-staged
- commit-msg: commitlint
- pre-push: test（オプション）

**実行権限**: 必ず`chmod +x`

**パフォーマンス**: キャッシュ、並列実行、対象絞り込み
