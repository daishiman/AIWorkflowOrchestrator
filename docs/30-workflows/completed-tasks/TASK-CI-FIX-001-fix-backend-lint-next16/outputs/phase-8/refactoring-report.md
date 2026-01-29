# リファクタリングレポート: TASK-CI-FIX-001

## 1. コメント更新

| 確認事項                       | 対応内容                                                         | 状態 |
| ------------------------------ | ---------------------------------------------------------------- | ---- |
| 旧コメント "Next.js 15" の削除 | `// ESLint config for Next.js 16 backend` に更新                 | 完了 |
| FlatCompat 使用理由の記載      | 不要: eslint-config-next@16+ がネイティブ flat config 対応のため | 完了 |
| 設定方針コメント               | `// eslint-config-next@16+ natively supports ESLint flat config` | 完了 |

## 2. 設定の最適化

| 確認項目                  | 判定基準                                    | 結果                                |
| ------------------------- | ------------------------------------------- | ----------------------------------- |
| 重複する ignores パターン | ルート設定と backend 設定で重複していないか | 問題なし（独立設定）                |
| 未使用の依存パッケージ    | eslint.config.mjs で使用しない依存がないか  | `@eslint/eslintrc` が不使用（後述） |
| 不要なルール設定          | デフォルト値と同じ明示的設定がないか        | 問題なし                            |

### FlatCompat → ネイティブ flat config への変更

初期設計では `@eslint/eslintrc` の `FlatCompat` を使用する方針だったが、実装段階で `eslint-config-next@16.1.1` がネイティブ flat config を出力することが判明。結果として:

- `@eslint/eslintrc` の実行時使用が不要になった
- import文が1行のみ（`import nextConfig from "eslint-config-next/core-web-vitals"`）でシンプル
- `__filename`/`__dirname` の解決処理も不要

**注**: `@eslint/eslintrc` は devDependencies に残存するが、これはルート ESLint 設定や他のパッケージで使用される可能性があるため、削除は本タスクのスコープ外とする。

## 3. リファクタリング後の動作確認

| テスト                             | 結果                |
| ---------------------------------- | ------------------- |
| `pnpm --filter @repo/backend lint` | PASS（exit code 0） |
| `pnpm lint`（ルート）              | PASS（exit code 0） |

## 4. 最終コード

```javascript
// ESLint config for Next.js 16 backend
// eslint-config-next@16+ natively supports ESLint flat config
import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  ...nextConfig,
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

export default config;
```
