# Prettier Automation Strategies

## 自動化レベル

### Level 1: エディタ統合

**実装**: エディタ保存時フォーマット

**メリット**:
- 即座のフィードバック
- 開発体験向上
- 設定が簡単

**設定**: `.vscode/settings.json`で`formatOnSave`有効化

**適用タイミング**: すべてのプロジェクト

### Level 2: コミットフック

**実装**: lint-staged + Husky

**メリット**:
- チーム全体で強制
- コミット前に自動フォーマット
- CI/CD前の品質保証

**設定**:
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write"]
  }
}
```

**適用タイミング**: チーム開発、品質基準厳格

### Level 3: CI/CD統合

**実装**: GitHub Actions等でフォーマットチェック

**メリット**:
- PR時の自動検証
- フォーマット崩れをブロック

**設定**:
```yaml
- name: Check Prettier
  run: pnpm format:check
```

**適用タイミング**: オープンソース、大規模プロジェクト

## パッケージスクリプト設計

### 基本スクリプト

```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

### 高度なスクリプト

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:staged": "lint-staged",
    "format:src": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:fix": "prettier --write --loglevel warn ."
  }
}
```

## 対象ファイルパターン

### 包括的パターン

```bash
"**/*.{ts,tsx,js,jsx,json,md,yml,yaml,css,scss,html}"
```

### 選択的パターン

```json
{
  "scripts": {
    "format:code": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:config": "prettier --write \"*.json\"",
    "format:docs": "prettier --write \"docs/**/*.md\""
  }
}
```

## .prettierignore

### 基本除外

```
# 依存関係
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock

# ビルド成果物
dist/
build/
.next/
out/

# 自動生成ファイル
*.min.js
*.bundle.js

# 設定ファイル（既にフォーマット済み）
.vscode/
.idea/
```

### プロジェクト固有除外

```
# レガシーコード（段階的移行）
legacy/

# サードパーティコード
vendor/
third-party/
```

## パフォーマンス最適化

### キャッシュ活用

```bash
prettier --write --cache .
```

**効果**: 変更されたファイルのみ処理

### 並列処理

**lint-staged**:
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

**デフォルトで並列実行**

### 対象ファイル絞り込み

```bash
# srcディレクトリのみ
prettier --write "src/**/*.{ts,tsx}"

# 変更されたファイルのみ
git diff --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx|js|jsx)$' | xargs prettier --write
```

## CI/CD統合詳細

### GitHub Actions

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm format:check
```

### 自動修正PR

```yaml
name: Auto Format

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
      - run: pnpm install
      - run: pnpm format
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: auto format code"
```

## まとめ

**推奨レベル**:
1. エディタ統合（開発体験）
2. コミットフック（チーム品質）
3. CI/CD（最終防御）

**パフォーマンス**:
- キャッシュ有効化
- 対象ファイル絞り込み
- .prettierignore活用
