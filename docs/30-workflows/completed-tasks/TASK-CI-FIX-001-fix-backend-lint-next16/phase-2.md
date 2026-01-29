# Phase 2: 設計

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 2                                       |
| 機能名 | TASK-CI-FIX-001-fix-backend-lint-next16 |
| 作成日 | 2026-01-29                              |

## 目的

`next lint` から ESLint CLI 直接呼び出しへの移行設計を行い、ESLint 設定の具体的な変更方針を決定する。

## 実行タスク

- ESLint 設定設計: eslint.config.mjs の更新内容を設計
- lint スクリプト設計: package.json のスクリプト変更を設計
- 互換性検証設計: ルート設定との共存方針を設計

## 参照資料

| 資料名                  | パス                                         | 説明                       |
| ----------------------- | -------------------------------------------- | -------------------------- |
| Phase 1 要件定義書      | `outputs/phase-1/requirements-definition.md` | Phase 1成果物              |
| 現行 Backend ESLint設定 | `apps/backend/eslint.config.mjs`             | 現在の設定（ignoresのみ）  |
| ルートESLint設定        | `eslint.config.js`                           | monorepo共通ESLint設定     |
| Backend package.json    | `apps/backend/package.json`                  | 現在のスクリプト・依存関係 |

### システム仕様（aiworkflow-requirements）

| 参照資料          | パス                                                                       | 内容             |
| ----------------- | -------------------------------------------------------------------------- | ---------------- |
| コード品質仕様    | `.claude/skills/aiworkflow-requirements/references/devops-code-quality.md` | ESLint設定方針   |
| CI/CDインフラ仕様 | `.claude/skills/aiworkflow-requirements/references/devops-ci-cd.md`        | CI品質ゲート定義 |

## 実行手順

### ステップ1: lint スクリプト設計

`apps/backend/package.json` の `lint` スクリプトを以下のように変更する。

**変更前**:

```json
"lint": "next lint"
```

**変更後**:

```json
"lint": "eslint . --cache --cache-location .next/cache/eslint/"
```

**設計根拠**:

- `eslint .`: ESLint CLI でカレントディレクトリを対象に lint 実行
- `--cache`: 変更のないファイルをスキップし lint 速度を維持
- `--cache-location .next/cache/eslint/`: Next.js のキャッシュディレクトリを再利用（.gitignore 対象）

### ステップ2: ESLint 設定設計

`apps/backend/eslint.config.mjs` を以下のように更新する。

**変更前（現行）**:

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

**変更後（設計案）**:

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

**設計根拠**:

- `@eslint/eslintrc` の `FlatCompat` を使用: `eslint-config-next` はレガシー設定形式のため flat config への変換が必要
- `next/core-web-vitals` を extends: Next.js 推奨の厳格なルールセット
- 既存の ignores を維持: テストファイル・ビルド出力・auto-generated ファイルの除外

### ステップ3: 依存パッケージ確認

| パッケージ           | 現行バージョン | 必要性 | 状態           |
| -------------------- | -------------- | ------ | -------------- |
| `eslint`             | `^9.39.1`      | 必須   | インストール済 |
| `eslint-config-next` | `^16.0.7`      | 必須   | インストール済 |
| `@eslint/eslintrc`   | `^3.3.3`       | 必須   | インストール済 |

**追加パッケージ不要**: 全ての必要パッケージは既にインストール済み。

### ステップ4: ルート設定との共存設計

| 観点               | 設計方針                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| 設定の分離         | ルート `eslint.config.js` と backend `eslint.config.mjs` は独立して機能    |
| ルール適用範囲     | ルートの `pnpm lint` は `eslint .`（ルート設定）、backend は独自設定を使用 |
| テストファイル除外 | backend の ESLint 設定でテストファイルを ignores に含める                  |
| ビルド出力除外     | `.next/**`, `out/**` を ignores に含める                                   |

## 統合テスト連携【必須】

設計の検証ポイント:

| 検証項目               | 検証方法                                      |
| ---------------------- | --------------------------------------------- |
| lint スクリプト動作    | `pnpm --filter @repo/backend lint` の実行確認 |
| ルート lint との非干渉 | `pnpm lint`（ルート）の実行確認               |
| ESLint 設定の正しさ    | 設定ファイルの構文チェック                    |
| キャッシュ動作         | 2回連続実行で2回目が高速であること            |

## 成果物

| 成果物           | パス                                      | 説明                        |
| ---------------- | ----------------------------------------- | --------------------------- |
| ESLint設定設計書 | `outputs/phase-2/eslint-config-design.md` | 設定変更の詳細設計          |
| 移行計画書       | `outputs/phase-2/migration-plan.md`       | next lint → eslint 移行計画 |

## 完了条件

- [ ] lint スクリプトの変更内容が設計されている
- [ ] eslint.config.mjs の変更内容が設計されている
- [ ] 追加パッケージの要否が確認されている
- [ ] ルート設定との共存方針が決定されている
- [ ] 検証ポイントが定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. lint スクリプト設計の実施
3. ESLint 設定設計の実施
4. 依存パッケージ確認の実施
5. ルート設定との共存設計の実施
6. 成果物の作成・配置
7. 完了条件の検証

## 次のPhase

Phase 3: 設計レビューゲート
