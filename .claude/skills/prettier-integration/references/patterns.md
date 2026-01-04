# Prettier統合 - 実践パターン

## 概要

ESLintとPrettierの統合における実践的なパターン集。
実務で遭遇する典型的なシナリオとその解決策を提供します。

## 統合パターン

### パターン1: 新規プロジェクトへの導入

**状況**: 既存のコードフォーマット設定がないプロジェクト

**手順**:

1. Prettierとeslint-config-prettierをインストール
2. `.prettierrc.json`を作成（デフォルト設定推奨）
3. `.prettierignore`で除外ファイルを指定
4. package.jsonにスクリプト追加
5. 初回フォーマット実行: `pnpm format`
6. エディタ統合設定

**メリット**: クリーンな状態から開始できる

### パターン2: 既存プロジェクトへの段階的導入

**状況**: 既にESLintが導入されているプロジェクト

**手順**:

1. eslint-config-prettierをインストール
2. ESLint設定の最後に`"prettier"`を追加
3. 競合チェック: `npx eslint-config-prettier .eslintrc.json`
4. 小規模なディレクトリから段階的にフォーマット適用
5. チーム合意を取りながら全体へ展開

**メリット**: リスクを最小化しながら導入できる

### パターン3: モノレポでの統合

**状況**: 複数パッケージを持つモノレポ

**設定構造**:

```
monorepo/
├── .prettierrc.json          # ルート設定（共通）
├── .prettierignore            # ルート除外設定
├── packages/
│   ├── package-a/
│   │   └── .prettierrc.json  # パッケージ固有設定（オプション）
│   └── package-b/
│       └── .prettierrc.json  # パッケージ固有設定（オプション）
```

**ベストプラクティス**:

- ルート設定を基本とし、パッケージ固有設定は最小限に
- pnpmワークスペースを活用し、依存関係を一元管理
- スクリプトはルートで一括実行できるようにする

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## 実行順序パターン

### パターン1: Prettier → ESLint順（推奨）

```json
{
  "scripts": {
    "lint:fix": "prettier --write . && eslint --fix ."
  }
}
```

**理由**: Prettierでフォーマットを統一してから、ESLintでコード品質をチェック

### パターン2: lint-stagedでの統合

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"]
  }
}
```

**メリット**: コミット前に自動的にフォーマット＋Lint実行

## CI/CDパターン

### パターン1: GitHub Actions

```yaml
name: Format Check

on: [pull_request]

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm format:check
```

### パターン2: pre-commit hook

**husky + lint-staged**:

```bash
# huskyインストール
pnpm add -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "pnpm lint-staged"
```

**package.json**:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,md}": "prettier --write"
  }
}
```

## エラーハンドリングパターン

### パターン1: 部分的フォーマット失敗の対処

**症状**: 一部のファイルでフォーマットが失敗する

**解決**:

1. エラーの原因を特定: `pnpm format:check`
2. 問題ファイルを`.prettierignore`に一時追加
3. 他のファイルをフォーマット
4. 問題ファイルを個別に修正

### パターン2: 大規模コードベースの段階的適用

**アプローチ**:

```bash
# ディレクトリ別に段階的実行
pnpm prettier --write "src/components/**/*.{ts,tsx}"
pnpm prettier --write "src/utils/**/*.{ts,tsx}"
pnpm prettier --write "src/pages/**/*.{ts,tsx}"
```

## カスタマイズパターン

### パターン1: TypeScript + Reactプロジェクト

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always"
}
```

### パターン2: マルチ言語プロジェクト

```json
{
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "printWidth": 80,
        "proseWrap": "always"
      }
    },
    {
      "files": "*.json",
      "options": {
        "printWidth": 120
      }
    }
  ]
}
```

## トラブルシューティングパターン

### 問題1: ESLintとPrettierが競合する

**診断**:

```bash
npx eslint-config-prettier .eslintrc.json
```

**解決**:

1. `.eslintrc.json`の`extends`最後に`"prettier"`を追加
2. 既存のstyling rulesを削除または無効化

### 問題2: エディタで保存時フォーマットが動作しない

**チェックリスト**:

- [ ] Prettier拡張機能がインストールされている
- [ ] `.vscode/settings.json`で`editor.defaultFormatter`が設定されている
- [ ] `.prettierrc`がプロジェクトルートに存在する
- [ ] ファイルが`.prettierignore`で除外されていない

### 問題3: 既存コードへの適用でdiffが大きくなる

**解決策**:

1. 別ブランチでフォーマット専用コミットを作成
2. git blameの履歴を保持: `.git-blame-ignore-revs`にコミットハッシュを記録
3. フォーマット適用後、機能開発を再開

**.git-blame-ignore-revs**:

```
# Prettierフォーマット適用コミット
abc123def456
```

## 参照

- 詳細な競合解決: See [conflict-resolution.md](conflict-resolution.md)
- エディタ統合: See [editor-integration.md](editor-integration.md)
- 自動化戦略: See [automation-strategies.md](automation-strategies.md)
