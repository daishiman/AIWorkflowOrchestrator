# ESLint設定設計書: TASK-CI-FIX-001

## 1. lint スクリプト設計

### 変更前

```json
"lint": "next lint"
```

### 変更後

```json
"lint": "eslint . --cache --cache-location .next/cache/eslint/"
```

### 設計根拠

- `eslint .`: ESLint CLI でカレントディレクトリを対象に lint 実行
- `--cache`: 変更のないファイルをスキップし lint 速度を維持
- `--cache-location .next/cache/eslint/`: Next.js のキャッシュディレクトリを再利用（.gitignore 対象）

## 2. ESLint 設定設計

### 変更前（現行）

```javascript
// Simplified ESLint config for Next.js 15 backend
export default [
  {
    ignores: [
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      ".next/**",
      "out/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },
];
```

### 変更後（設計案）

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      ".next/**",
      "out/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },
];
```

### 設計根拠

- `@eslint/eslintrc` の `FlatCompat` を使用: `eslint-config-next` はレガシー設定形式のため flat config への変換が必要
- `next/core-web-vitals` を extends: Next.js 推奨の厳格なルールセット
- 既存の ignores を維持: テストファイル・ビルド出力・auto-generated ファイルの除外

## 3. 依存パッケージ確認

| パッケージ           | 現行バージョン | 必要性 | 状態           |
| -------------------- | -------------- | ------ | -------------- |
| `eslint`             | `^9.39.1`      | 必須   | インストール済 |
| `eslint-config-next` | `^16.0.7`      | 必須   | インストール済 |
| `@eslint/eslintrc`   | `^3.3.3`       | 必須   | インストール済 |

追加パッケージ不要。

## 4. ルート設定との共存設計

| 観点               | 設計方針                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| 設定の分離         | ルート `eslint.config.js` と backend `eslint.config.mjs` は独立して機能    |
| ルール適用範囲     | ルートの `pnpm lint` は `eslint .`（ルート設定）、backend は独自設定を使用 |
| テストファイル除外 | backend の ESLint 設定でテストファイルを ignores に含める                  |
| ビルド出力除外     | `.next/**`, `out/**` を ignores に含める                                   |

**補足**: ルートの `eslint.config.js` は `**/*.mjs` を ignores に含んでいるため、backend の `eslint.config.mjs` 自体がルート lint の対象外となっている。競合リスクは低い。
