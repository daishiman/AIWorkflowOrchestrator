# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 1                                       |
| 機能名 | TASK-CI-FIX-001-fix-backend-lint-next16 |
| 作成日 | 2026-01-29                              |

## 目的

Next.js 16 で削除された `next lint` コマンドの代替手段を明確にし、修正の要件・受け入れ基準を定義する。

## 実行タスク

- 要件抽出: CI エラーの原因分析と修正要件の特定
- 受け入れ基準作成: 修正完了を判定する検証可能な基準の定義
- 影響範囲分析: 変更対象ファイルと影響範囲の特定

## 参照資料

| 資料名               | パス                             | 説明                              |
| -------------------- | -------------------------------- | --------------------------------- |
| Backend package.json | `apps/backend/package.json`      | 現在の lint スクリプト定義        |
| Backend ESLint設定   | `apps/backend/eslint.config.mjs` | 現在の ESLint 設定（ignoresのみ） |
| ルートESLint設定     | `eslint.config.js`               | monorepo共通ESLint設定            |
| CIワークフロー       | `.github/workflows/ci.yml`       | CI lint ジョブ定義                |
| PR #562              | GitHub PR #562                   | dependabot Next.js 16.1.5 更新    |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                         | 内容             |
| ------------------ | ---------------------------------------------------------------------------- | ---------------- |
| CI/CDインフラ仕様  | `.claude/skills/aiworkflow-requirements/references/devops-ci-cd.md`          | CI品質ゲート定義 |
| コード品質仕様     | `.claude/skills/aiworkflow-requirements/references/devops-code-quality.md`   | ESLint設定方針   |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | monorepo構成     |

## 実行手順

### ステップ1: CI エラー原因分析

PR #562 の CI エラーログを分析し、根本原因を特定する。

**根本原因**:

| 項目       | 内容                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| 直接原因   | `next lint` コマンドが Next.js 16 で削除された                                 |
| エラー内容 | `Invalid project directory provided, no such directory: .../apps/backend/lint` |
| 発生箇所   | `apps/backend/package.json` の `"lint": "next lint"` スクリプト                |
| 影響       | CI の lint ジョブが失敗し、PR がマージできない                                 |

### ステップ2: 要件抽出

**機能要件（FR）**:

| FR-ID | 要件                                                                   | 優先度 |
| ----- | ---------------------------------------------------------------------- | ------ |
| FR-01 | `apps/backend/package.json` の lint スクリプトが ESLint CLI を使用する | 高     |
| FR-02 | `apps/backend/eslint.config.mjs` が自己完結したルール定義を持つ        | 高     |
| FR-03 | `eslint-config-next` のルールが引き続き適用される                      | 高     |
| FR-04 | ESLint キャッシュを活用し lint 速度を維持する                          | 中     |

**非機能要件（NFR）**:

| NFR-ID | 要件                                                           | 優先度 |
| ------ | -------------------------------------------------------------- | ------ |
| NFR-01 | CI lint ジョブ（`pnpm --filter @repo/backend lint`）が成功する | 高     |
| NFR-02 | ルートの `pnpm lint`（`eslint .`）との競合がない               | 高     |
| NFR-03 | lint-staged（pre-commit hook）が正常動作する                   | 中     |
| NFR-04 | lint 実行時間が現行と同等以下である                            | 低     |

### ステップ3: 受け入れ基準作成

| 要件ID | 受け入れ基準                                                              |
| ------ | ------------------------------------------------------------------------- |
| FR-01  | `pnpm --filter @repo/backend lint` が `eslint .` を実行し正常終了する     |
| FR-02  | `eslint.config.mjs` に eslint-config-next のルールが含まれている          |
| FR-03  | backend ソースファイルに Next.js 推奨ルールが適用される                   |
| FR-04  | `--cache --cache-location .next/cache/eslint/` オプションが設定されている |
| NFR-01 | GitHub Actions CI の lint ジョブが成功する                                |
| NFR-02 | ルートの `eslint .` 実行結果に変化がない                                  |
| NFR-03 | `git commit` 時の lint-staged が正常動作する                              |

### ステップ4: 影響範囲分析

| 変更対象ファイル                 | 変更内容                                              |
| -------------------------------- | ----------------------------------------------------- |
| `apps/backend/package.json`      | `"lint": "next lint"` → `"lint": "eslint ..."` に変更 |
| `apps/backend/eslint.config.mjs` | ignores のみ → eslint-config-next ルール統合          |

| 影響を受けるシステム      | 影響内容                                       |
| ------------------------- | ---------------------------------------------- |
| CI lint ジョブ            | lint コマンドの実行結果が変わる（成功へ）      |
| ルート ESLint 設定        | 影響なし（独立した設定ファイル）               |
| lint-staged               | backend ファイルの lint に使用する設定が変わる |
| 他パッケージ（desktop等） | 影響なし                                       |

## 統合テスト連携【必須】

接続要件（CI/設定/コマンド）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                        |
| ---------------- | --------------------------------------------------------------- |
| CI連携           | GitHub Actions `pnpm lint` → 各パッケージの lint スクリプト実行 |
| ESLint設定連携   | ルート `eslint.config.js` とbackend `eslint.config.mjs` の共存  |
| pnpm monorepo    | `--filter` によるパッケージ個別実行                             |

## 成果物

| 成果物       | パス                                         | 説明               |
| ------------ | -------------------------------------------- | ------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義             |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲・影響範囲 |

## 完了条件

- [ ] CI エラーの根本原因が特定されている
- [ ] 全要件が抽出されている（FR 4件、NFR 4件）
- [ ] 各要件に検証可能な受け入れ基準がある
- [ ] 影響範囲が分析されている
- [ ] 変更対象ファイルが特定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. CI エラー原因分析の実施
3. 要件抽出の実施
4. 受け入れ基準作成の実施
5. 影響範囲分析の実施
6. 成果物の作成・配置
7. 完了条件の検証

## 次のPhase

Phase 2: 設計
