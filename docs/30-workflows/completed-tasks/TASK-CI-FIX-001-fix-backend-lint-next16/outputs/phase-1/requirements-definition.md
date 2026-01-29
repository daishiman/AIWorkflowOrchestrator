# 要件定義書: TASK-CI-FIX-001

## 1. 概要

Next.js 16 で削除された `next lint` コマンドを ESLint CLI 直接呼び出しに置き換え、CI の lint ジョブを復旧する。

## 2. 根本原因分析

| 項目       | 内容                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| 直接原因   | `next lint` コマンドが Next.js 16 で削除された                                 |
| エラー内容 | `Invalid project directory provided, no such directory: .../apps/backend/lint` |
| 発生箇所   | `apps/backend/package.json` の `"lint": "next lint"` スクリプト                |
| 影響       | CI の lint ジョブが失敗し、PR がマージできない                                 |

## 3. 機能要件（FR）

| FR-ID | 要件                                                                   | 優先度 |
| ----- | ---------------------------------------------------------------------- | ------ |
| FR-01 | `apps/backend/package.json` の lint スクリプトが ESLint CLI を使用する | 高     |
| FR-02 | `apps/backend/eslint.config.mjs` が自己完結したルール定義を持つ        | 高     |
| FR-03 | `eslint-config-next` のルールが引き続き適用される                      | 高     |
| FR-04 | ESLint キャッシュを活用し lint 速度を維持する                          | 中     |

## 4. 非機能要件（NFR）

| NFR-ID | 要件                                                           | 優先度 |
| ------ | -------------------------------------------------------------- | ------ |
| NFR-01 | CI lint ジョブ（`pnpm --filter @repo/backend lint`）が成功する | 高     |
| NFR-02 | ルートの `pnpm lint`（`eslint .`）との競合がない               | 高     |
| NFR-03 | lint-staged（pre-commit hook）が正常動作する                   | 中     |
| NFR-04 | lint 実行時間が現行と同等以下である                            | 低     |

## 5. 影響範囲分析

### 変更対象ファイル

| ファイル                         | 変更内容                                              |
| -------------------------------- | ----------------------------------------------------- |
| `apps/backend/package.json`      | `"lint": "next lint"` → `"lint": "eslint ..."` に変更 |
| `apps/backend/eslint.config.mjs` | ignores のみ → eslint-config-next ルール統合          |

### 影響を受けるシステム

| システム                  | 影響内容                                       |
| ------------------------- | ---------------------------------------------- |
| CI lint ジョブ            | lint コマンドの実行結果が変わる（成功へ）      |
| ルート ESLint 設定        | 影響なし（独立した設定ファイル）               |
| lint-staged               | backend ファイルの lint に使用する設定が変わる |
| 他パッケージ（desktop等） | 影響なし                                       |

## 6. 依存パッケージ状況

| パッケージ           | 現行バージョン | 必要性 | 状態           |
| -------------------- | -------------- | ------ | -------------- |
| `eslint`             | `^9.39.1`      | 必須   | インストール済 |
| `eslint-config-next` | `^16.0.7`      | 必須   | インストール済 |
| `@eslint/eslintrc`   | `^3.3.3`       | 必須   | インストール済 |

追加パッケージ不要。
