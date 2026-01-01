# Level 2: Intermediate - 複数ツール統合とチーム共有

## 概要

複数の検証ツール（Prettier、ESLint、TypeScript、テスト）を統合し、チーム全体でGit Hooksを共有する方法を学ぶレベル。エラーハンドリングと保守性の向上が目標。

## 前提条件

- Level 1の内容を理解し、シンプルなpre-commitフックを実装できる
- package.jsonのスクリプト管理を理解している
- チーム開発での標準化の重要性を理解している

## 複数ツール統合パターン

### パターン1: Prettier + ESLint + TypeScript（pre-commit）

最も一般的な組み合わせ。段階的に検証し、早期失敗（fail-fast）を実現。

```bash
#!/bin/bash
# .git/hooks/pre-commit

set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0;29m'

echo -e "${YELLOW}Running pre-commit checks...${NC}"

# ステージ済みファイルを取得
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

if [ -z "$STAGED_FILES" ]; then
  echo -e "${GREEN}✅ No staged files${NC}"
  exit 0
fi

# 1. Prettier: フォーマット確認（全ファイル）
echo -e "${YELLOW}[1/3] Checking code formatting...${NC}"
if ! npx prettier --check $STAGED_FILES 2>/dev/null; then
  echo -e "${RED}❌ Prettier check failed${NC}"
  echo "Run: npx prettier --write ."
  exit 1
fi
echo -e "${GREEN}✅ Formatting OK${NC}"

# 2. ESLint: コード品質チェック（JS/TS/TSXファイルのみ）
JS_TS_FILES=$(echo "$STAGED_FILES" | grep -E "\.(js|ts|tsx)$" || true)
if [ ! -z "$JS_TS_FILES" ]; then
  echo -e "${YELLOW}[2/3] Running ESLint...${NC}"
  if ! npx eslint $JS_TS_FILES; then
    echo -e "${RED}❌ ESLint check failed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ ESLint OK${NC}"
fi

# 3. TypeScript: 型チェック（TSファイルが含まれる場合）
TS_FILES=$(echo "$STAGED_FILES" | grep ".ts$" || true)
if [ ! -z "$TS_FILES" ]; then
  echo -e "${YELLOW}[3/3] Running TypeScript compiler...${NC}"
  if ! npx tsc --noEmit; then
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ TypeScript OK${NC}"
fi

echo -e "${GREEN}✅ All pre-commit checks passed${NC}"
exit 0
```

### パターン2: テスト実行（pre-push）

コミット単位では実行しないが、プッシュ前には必須のテスト検証。

```bash
#!/bin/bash
# .git/hooks/pre-push

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0;m'

echo -e "${YELLOW}Running pre-push checks...${NC}"

# 1. ユニットテスト実行
echo -e "${YELLOW}[1/2] Running unit tests...${NC}"
if ! npm run test:unit; then
  echo -e "${RED}❌ Unit tests failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Unit tests passed${NC}"

# 2. ビルド確認
echo -e "${YELLOW}[2/2] Checking build...${NC}"
if ! npm run build; then
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build succeeded${NC}"

echo -e "${GREEN}✅ All pre-push checks passed${NC}"
exit 0
```

## エラーハンドリングの改善

### 問題: エラーメッセージが不親切

```bash
# ❌ 悪い例
npx eslint $FILES
```

ユーザーは「何が問題か」「どう修正するか」がわからない。

### 解決策: 詳細なエラーメッセージ

```bash
# ✅ 良い例
if ! npx eslint $FILES; then
  echo -e "${RED}❌ ESLint check failed${NC}"
  echo "Fix linting errors by running:"
  echo "  npx eslint --fix $FILES"
  echo ""
  echo "Or skip this hook (not recommended):"
  echo "  git commit --no-verify"
  exit 1
fi
```

### ログファイルへの出力

```bash
LOG_FILE=".git/hooks/pre-commit.log"

echo "$(date): Running pre-commit checks" >> $LOG_FILE

if ! npx eslint $FILES 2>> $LOG_FILE; then
  echo -e "${RED}❌ ESLint failed. See $LOG_FILE for details${NC}"
  exit 1
fi
```

## チーム共有の仕組み

### 問題: .git/hooks/ はGit管理外

各開発者が手動でフックをインストールする必要があり、バージョン管理されない。

### 解決策1: セットアップスクリプト

プロジェクトルートに `scripts/hooks/` を作成し、セットアップスクリプトでコピー。

```
プロジェクトルート/
├── scripts/
│   ├── hooks/
│   │   ├── pre-commit
│   │   └── pre-push
│   └── setup-hooks.sh
└── .git/
    └── hooks/  # (セットアップ後にコピーされる)
```

**scripts/setup-hooks.sh**:

```bash
#!/bin/bash

set -e

HOOKS_DIR="scripts/hooks"
GIT_HOOKS_DIR=".git/hooks"

echo "Installing Git Hooks..."

# フックをコピー
for hook in $HOOKS_DIR/*; do
  hook_name=$(basename $hook)
  if [ "$hook_name" != "setup-hooks.sh" ]; then
    cp "$hook" "$GIT_HOOKS_DIR/$hook_name"
    chmod +x "$GIT_HOOKS_DIR/$hook_name"
    echo "✅ Installed: $hook_name"
  fi
done

echo "✅ Git Hooks setup complete!"
```

**package.json に追加**:

```json
{
  "scripts": {
    "prepare": "bash scripts/setup-hooks.sh"
  }
}
```

`npm install` 実行時に自動でフックがインストールされる（`prepare` ライフサイクルスクリプト）。

### 解決策2: Husky を使う（推奨）

[Husky](https://typicode.github.io/husky/) は Git Hooks管理ツール。フックをプロジェクトルートに配置し、チーム全体で共有できる。

**インストール**:

```bash
pnpm add -D husky
pnpm exec husky init
```

**フック作成**:

```bash
echo "npx prettier --check ." > .husky/pre-commit
echo "npm run test" > .husky/pre-push
chmod +x .husky/pre-commit .husky/pre-push
```

**.husky/pre-commit**:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**package.json**:

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

**メリット**:

- フックがGit管理される（`.husky/` ディレクトリ）
- チーム全員が同じフックを使用
- `lint-staged` でステージ済みファイルのみを処理（高速）

## 条件分岐とファイルフィルタリング

### ファイル種類別の処理

```bash
# TypeScriptファイルのみ型チェック
TS_FILES=$(echo "$STAGED_FILES" | grep "\.ts$" || true)
if [ ! -z "$TS_FILES" ]; then
  npx tsc --noEmit
fi

# Pythonファイルのみflake8実行
PY_FILES=$(echo "$STAGED_FILES" | grep "\.py$" || true)
if [ ! -z "$PY_FILES" ]; then
  flake8 $PY_FILES
fi
```

### 特定ディレクトリの除外

```bash
# node_modules/ と dist/ を除外
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | \
  grep -v "node_modules/" | \
  grep -v "dist/" || true)
```

## パフォーマンス最適化（基礎）

### 問題: 全ファイルスキャンが遅い

```bash
# ❌ 遅い（全ファイルをチェック）
npx eslint .
```

### 解決策: ステージ済みファイルのみ

```bash
# ✅ 速い（ステージ済みファイルのみ）
JS_TS_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E "\.(js|ts|tsx)$" || true)
if [ ! -z "$JS_TS_FILES" ]; then
  npx eslint $JS_TS_FILES
fi
```

### lint-staged の活用

```json
{
  "lint-staged": {
    "*.{js,ts,tsx}": "eslint --fix",
    "*.{json,md}": "prettier --write"
  }
}
```

`lint-staged` は内部でステージ済みファイルを自動抽出し、並列実行する。

## 実装パターン参照

詳細な実装パターンは `references/implementation-patterns.md` を参照:

- パターン1: Prettier + ESLint統合
- パターン2: TypeScript型チェック
- パターン3: テスト実行（Jest/Vitest）
- パターン4: Conventional Commits検証
- パターン5: コミットメッセージリント

## 実践手順（Level 2）

1. **ツールの組み合わせを決定**: プロジェクトで使用しているツール（Prettier, ESLint, TypeScript等）をリストアップ
2. **実行順序を設計**: 軽い処理（フォーマット）→ 重い処理（型チェック）の順で配置
3. **エラーメッセージを改善**: 各検証ステップで「何が問題か」「どう修正するか」を明示
4. **チーム共有の仕組みを導入**: Huskyまたはセットアップスクリプトでフックを共有
5. **動作確認**: わざとエラーを含むファイルでコミット/プッシュして各検証ステップが動作するか確認

## チェックリスト

- [ ] 複数ツール（Prettier + ESLint + TypeScript）を統合できる
- [ ] エラーメッセージが開発者フレンドリーになっている
- [ ] ステージ済みファイルのみを処理している（パフォーマンス最適化）
- [ ] Huskyまたはセットアップスクリプトでチーム共有している
- [ ] ファイル種類別に適切な検証を実行している
- [ ] pre-commit（軽量）とpre-push（重い処理）を役割分担している

## 次のステップ

Level 2をクリアしたら、Level 3（Advanced）に進む:

- 並列実行とキャッシュによる高速化
- カスタム検証ルールの実装
- CI/CDとの統合戦略
- パフォーマンスモニタリング

参照: references/Level3_advanced.md
