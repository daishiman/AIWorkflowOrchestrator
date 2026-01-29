# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 5                                       |
| 機能名 | TASK-CI-FIX-001-fix-backend-lint-next16 |
| 作成日 | 2026-01-29                              |

## 目的

Phase 4 で定義したテストケースをクリアするための最小限の実装を行う。具体的には、`apps/backend/package.json` の lint スクリプトと `apps/backend/eslint.config.mjs` を更新する。

## 実行タスク

- lint スクリプト更新: package.json の lint スクリプトを ESLint CLI 直接呼び出しに変更
- ESLint 設定更新: eslint.config.mjs に eslint-config-next ルールを統合
- 動作確認: lint コマンドの正常動作を確認

## 参照資料

| 資料名           | パス                                      | 説明             |
| ---------------- | ----------------------------------------- | ---------------- |
| ESLint設定設計書 | `outputs/phase-2/eslint-config-design.md` | Phase 2成果物    |
| テスト仕様書     | `outputs/phase-4/test-specification.md`   | Phase 4成果物    |
| Backend pkg.json | `apps/backend/package.json`               | 変更対象ファイル |
| Backend ESLint   | `apps/backend/eslint.config.mjs`          | 変更対象ファイル |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                       | 内容             |
| -------------- | -------------------------------------------------------------------------- | ---------------- |
| コード品質仕様 | `.claude/skills/aiworkflow-requirements/references/devops-code-quality.md` | ESLint設定方針   |
| CI/CDインフラ  | `.claude/skills/aiworkflow-requirements/references/devops-ci-cd.md`        | CI品質ゲート定義 |

## 実行手順

### ステップ1: package.json の lint スクリプト更新

#### 対象ファイル

`apps/backend/package.json`

#### 変更内容

`scripts.lint` を以下のように変更する:

**変更前**:

```json
"lint": "next lint"
```

**変更後**:

```json
"lint": "eslint . --cache --cache-location .next/cache/eslint/"
```

#### 変更手順

1. `apps/backend/package.json` を開く
2. `"lint": "next lint"` を `"lint": "eslint . --cache --cache-location .next/cache/eslint/"` に置換
3. ファイルを保存

### ステップ2: eslint.config.mjs の更新

#### 対象ファイル

`apps/backend/eslint.config.mjs`

#### 変更内容

ignores のみの設定から、eslint-config-next のルールを統合した自己完結設定に更新する。

**変更前**:

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

**変更後**:

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

#### 変更手順

1. `apps/backend/eslint.config.mjs` を開く
2. ファイル全体を上記の変更後の内容に置換
3. ファイルを保存

### ステップ3: 動作確認

以下のコマンドを順番に実行し、正常動作を確認する:

```bash
# 1. Backend lint 実行
pnpm --filter @repo/backend lint

# 2. ルート lint 実行（非干渉確認）
pnpm lint

# 3. ESLint 設定の確認
cd apps/backend && npx eslint --print-config src/app/page.tsx
```

**期待結果**:

- コマンド 1: 正常終了（exit code 0）
- コマンド 2: 正常終了（exit code 0）、既存の結果に変化なし
- コマンド 3: Next.js 推奨ルール（`@next/next/*`）が含まれている

## 統合テスト連携【必須】

| 実装項目            | 内容                                                     |
| ------------------- | -------------------------------------------------------- |
| lint スクリプト連携 | `pnpm --filter @repo/backend lint` が `eslint .` を実行  |
| ESLint 設定連携     | `eslint-config-next` のルールが flat config で適用される |
| CI 連携             | GitHub Actions の lint ステップが正常完了する            |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点          | 適用判断                  | 仕様参照先                                        |
| ------------- | ------------------------- | ------------------------------------------------- |
| コード品質    | ESLint設定変更のため適用  | `aiworkflow-requirements: devops-code-quality.md` |
| CI/CDインフラ | lint ジョブ復旧のため適用 | `aiworkflow-requirements: devops-ci-cd.md`        |
| セキュリティ  | 設定変更のみのため不要    | -                                                 |
| UI/UX         | 不要                      | -                                                 |
| データ整合性  | 不要                      | -                                                 |

## アーキテクチャ層別実装（monorepo観点）

| 層                 | 実装観点                     | 実装ファイル配置       | 仕様参照先             |
| ------------------ | ---------------------------- | ---------------------- | ---------------------- |
| Backend パッケージ | lint スクリプト・ESLint 設定 | `apps/backend/`        | devops-code-quality.md |
| monorepo ルート    | 影響なし（設定は独立）       | ルートの設定変更は不要 | devops-ci-cd.md        |

## 成果物

| 成果物                     | パス                             | 説明                |
| -------------------------- | -------------------------------- | ------------------- |
| 更新済み package.json      | `apps/backend/package.json`      | lint スクリプト更新 |
| 更新済み eslint.config.mjs | `apps/backend/eslint.config.mjs` | ESLint設定更新      |

## 完了条件

- [ ] `apps/backend/package.json` の lint スクリプトが `eslint .` を使用している
- [ ] `apps/backend/eslint.config.mjs` に eslint-config-next ルールが統合されている
- [ ] `pnpm --filter @repo/backend lint` が正常終了する
- [ ] `pnpm lint`（ルート）が正常終了する
- [ ] ESLint 設定ダンプに Next.js 推奨ルールが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テストケース TC-001: Backend lint 正常実行
pnpm --filter @repo/backend lint

# テストケース TC-003: ルート lint 正常実行
pnpm lint

# テストケース TC-004: ESLint 設定構文チェック
cd apps/backend && npx eslint --print-config src/app/page.tsx

# 確認項目
# - [ ] TC-001: Backend lint が正常終了（Green状態）
# - [ ] TC-003: ルート lint が正常終了（Green状態）
# - [ ] TC-004: 設定が正しく解決される（Green状態）
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. package.json の lint スクリプト更新
3. eslint.config.mjs の更新
4. 動作確認の実施
5. TDD 検証の実施
6. 完了条件の検証

## 次のPhase

Phase 6: テスト拡充
