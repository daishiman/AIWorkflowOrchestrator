# Linting & Formatting 設定パターン

> **相対パス**: `references/patterns.md`
> **読込条件**: 設定作成時

---

## ESLint Flat Config（v9+）

### 基本構造

```javascript
// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      // カスタムルール
    },
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
];
```

### Prettier統合

```javascript
import prettier from "eslint-config-prettier";

export default [
  // ...他の設定
  prettier, // 必ず最後に配置
];
```

---

## Prettier設定

### 推奨設定

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

### .prettierignore

```
dist
node_modules
*.min.js
pnpm-lock.yaml
```

---

## Biome設定

### 基本設定

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always"
    }
  }
}
```

---

## Pre-commit Hook設定

### Husky + lint-staged

```bash
# インストール
pnpm add -D husky lint-staged
pnpm exec husky init
```

### lint-staged.config.js

```javascript
export default {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};
```

### .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
```

---

## CI/CD設定

### GitHub Actions

```yaml
name: Lint

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm eslint . --max-warnings 0

      - name: Check Formatting
        run: pnpm prettier --check .
```

---

## package.json スクリプト

### ESLint + Prettier

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### Biome

```json
{
  "scripts": {
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --write ."
  }
}
```

---

## トラブルシューティング

### ESLintとPrettierの競合

**問題**: ESLintとPrettierのルールが競合してエラーが出る

**解決**: `eslint-config-prettier`を必ず最後に適用

```javascript
import prettier from "eslint-config-prettier";
export default [...otherConfigs, prettier];
```

### TypeScript型チェックエラー

**問題**: `parserOptions.project`でエラー

**解決**: tsconfig.jsonにlint対象を含める

```json
{
  "include": ["src/**/*", "eslint.config.js"]
}
```

### キャッシュの問題

**問題**: 変更が反映されない

**解決**: キャッシュをクリア

```bash
rm -rf .eslintcache
rm -rf node_modules/.cache
```

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
