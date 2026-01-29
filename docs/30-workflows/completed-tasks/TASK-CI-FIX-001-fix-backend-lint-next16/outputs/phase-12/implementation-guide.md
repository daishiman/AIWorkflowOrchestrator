# 実装ガイド: TASK-CI-FIX-001 Backend Lint修正（Next.js 16対応）

---

## Part 1: 初学者・中学生レベルの概念説明

### なぜ lint 設定を変更する必要があるのか

プログラミングでは、コードを書いた後に「おかしいところがないか」を自動でチェックする仕組みがあります。これは、作文を書いた後に誤字脱字をチェックするのと同じです。このチェックツールのことを「lint（リント）」と呼びます。

今回の問題は、今まで使っていたチェックの方法が使えなくなったことです。

**たとえ話**:
学校の校正ツール（`next lint`）が新学期から廃止されて、代わりに一般的な校正ツール（`eslint`）を直接使うことになった、というイメージです。チェックの中身は同じですが、呼び出し方が変わりました。

### 何が変わったのか

「Next.js（ネクスト・ジェイエス）」というウェブサイトを作るための道具箱が、バージョン16に新しくなりました。この新しいバージョンでは、道具箱に入っていた「コード校正機能」が取り出されました。

校正機能自体はまだ使えますが、「道具箱経由で呼び出す」のではなく、「校正ツールを直接呼び出す」ように変わりました。

### どう修正したのか

2つの設定ファイルを書き換えました:

1. **package.json**: 「校正を実行する」ボタンの設定を、「道具箱経由」から「直接呼び出し」に変更
2. **eslint.config.mjs**: 校正ツールに「Next.jsのルールも使ってね」と教える設定を追加

---

## Part 2: 技術者向けの詳細説明

### 1. 背景と根本原因

Next.js 16 で `next lint` サブコマンドが完全削除されました。

- **Next.js 15.5**: `next lint` が非推奨化（deprecated）
- **Next.js 16.0**: `next lint` が完全削除
- **症状**: `next` CLI が `lint` をディレクトリパスとして解釈し、`Invalid project directory provided, no such directory: .../apps/backend/lint` エラーが発生

### 2. 変更内容

#### package.json

```diff
- "lint": "next lint"
+ "lint": "eslint . --cache --cache-location .next/cache/eslint/"
```

- `eslint .`: ESLint CLI でカレントディレクトリを対象に lint 実行
- `--cache`: 変更のないファイルをスキップし lint 速度を維持
- `--cache-location .next/cache/eslint/`: Next.js のキャッシュディレクトリを再利用

#### eslint.config.mjs

```diff
- // Simplified ESLint config for Next.js 15 backend
- export default [
-   {
-     ignores: [
-       "**/__tests__/**",
-       "**/*.test.ts",
-       "**/*.test.tsx",
-       ".next/**",
-       "out/**",
-       "node_modules/**",
-       "next-env.d.ts",
-     ],
-   },
- ];
+ // ESLint config for Next.js 16 backend
+ // eslint-config-next@16+ natively supports ESLint flat config
+ import nextConfig from "eslint-config-next/core-web-vitals";
+
+ const config = [
+   ...nextConfig,
+   {
+     ignores: [
+       "**/__tests__/**",
+       "**/*.test.ts",
+       "**/*.test.tsx",
+       ".next/**",
+       "out/**",
+       "node_modules/**",
+       "coverage/**",
+       "next-env.d.ts",
+     ],
+   },
+ ];
+
+ export default config;
```

### 3. 設計判断: FlatCompat vs ネイティブ flat config

初期設計では `@eslint/eslintrc` の `FlatCompat` を使用して `eslint-config-next` をレガシー設定から変換する方針でしたが、実装段階で `eslint-config-next@16.1.1` がネイティブ flat config を出力することが判明しました。

`eslint-config-next@16+` は `exports` フィールドで以下を提供:

- `.` (default): base config (flat config array)
- `./core-web-vitals`: base + core web vitals rules (flat config array)
- `./typescript`: TypeScript config
- `./parser`: parser config

そのため、`FlatCompat` を使わず直接インポートする方式を採用しました。

### 4. トラブルシューティング

| 問題                                               | 対処法                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `TypeError: Converting circular structure to JSON` | `FlatCompat` を使用していないか確認。`eslint-config-next@16+` は直接インポートで使用する |
| `import/no-anonymous-default-export` warning       | 配列を変数に代入してから `export default` する                                           |
| `coverage/**` からの warning                       | `ignores` に `"coverage/**"` を追加                                                      |
| キャッシュが効かない                               | `.next/cache/eslint/` ディレクトリを手動削除して再実行                                   |
| ルール競合                                         | ルート `eslint.config.js` との差異を確認。各設定はスコープが分離されている               |
