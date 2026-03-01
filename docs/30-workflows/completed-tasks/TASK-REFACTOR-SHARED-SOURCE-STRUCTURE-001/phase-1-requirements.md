# Phase 1: 要件定義 — packages/shared ソースディレクトリ構造統一

## メタ情報

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| タスクID | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001                  |
| Phase    | 1                                                          |
| タスク名 | packages/shared の types/ と src/types/ 二重構造を解消する |
| 作成日   | 2026-02-28                                                 |
| 優先度   | 中                                                         |
| 規模     | 小規模（ファイル移動5件 + 設定ファイル更新4件）            |
| 依存     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001（完了予定）       |
| ブロック | なし                                                       |

## 目的

`packages/shared` のルート直下 `types/` ディレクトリと `src/types/` ディレクトリに型定義ファイルが二重に存在している構造的問題を解消する。`types/` 配下の5ファイル（`auth.ts`、`api-keys.ts`、`common.ts`、`file-selection.ts`、`workflow.ts`）を `src/types/` 配下に移動し、`package.json`（exports / typesVersions）、`tsup.config.ts`（entry）、`apps/desktop/tsconfig.json`（paths）の4ファイルを同期更新することで、単一ソースディレクトリ（`src/types/`）に統一する。公開パス（`@repo/shared/types/auth` 等）は変更しない。

## 実行タスク

- Task 1: 機能要件（FR）を定義する — ファイル移動・統合・設定更新の要件を確定する
- Task 2: 非機能要件（NFR）を定義する — 後方互換性・ビルド・型チェック・テストの基準を確定する
- Task 3: 受入基準（AC）を定義する — テスト可能な検証条件を確定する
- Task 4: スコープを確認する — 含むもの/含まないものを明文化する
- Task 5: 影響範囲を分析する — 4ファイル同期チェックリストと影響ファイルを整理する

---

### Task 1: 機能要件（FR）

#### FR-1: ソースディレクトリ統一

| 項目         | 内容                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| 機能         | `packages/shared/types/` 配下の5ファイルを `packages/shared/src/types/` 配下に移動する |
| 対象ファイル | `auth.ts`、`api-keys.ts`、`common.ts`、`file-selection.ts`、`workflow.ts`              |
| 移動元       | `packages/shared/types/{filename}`                                                     |
| 移動先       | `packages/shared/src/types/{filename}`                                                 |
| 前提条件     | 移動先に同名ファイルが存在しないこと（`index.ts` は FR-5 で別途統合）                  |

#### FR-2: package.json exports 更新

| 項目         | 内容                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| 機能         | `package.json` の `exports` フィールドで `./dist/types/auth.d.ts` 等を `./dist/src/types/auth.d.ts` に変更する |
| 対象エントリ | `"./types/auth"` と `"./types/api-keys"` の2エントリ                                                           |
| 変更前       | `"types": "./dist/types/auth.d.ts"`, `"import": "./dist/types/auth.js"`                                        |
| 変更後       | `"types": "./dist/src/types/auth.d.ts"`, `"import": "./dist/src/types/auth.js"`                                |
| 制約         | 公開パス（`@repo/shared/types/auth`）は変更しない                                                              |

#### FR-3: package.json typesVersions 更新

| 項目         | 内容                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 機能         | `package.json` の `typesVersions` フィールドで `./types/auth.ts` 等を `./src/types/auth.ts` に変更する |
| 対象エントリ | `"types/auth"` と `"types/api-keys"` の2エントリ                                                       |
| 変更前       | `"types/auth": ["./types/auth.ts"]`                                                                    |
| 変更後       | `"types/auth": ["./src/types/auth.ts"]`                                                                |

#### FR-4: tsup.config.ts エントリーポイント更新

| 項目         | 内容                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能         | `tsup.config.ts` の `entry` 配列で `types/` プレフィックスのエントリを `src/types/` に変更する                                                                      |
| 対象エントリ | `"types/index.ts"`、`"types/auth.ts"`、`"types/api-keys.ts"` の3エントリ                                                                                            |
| 変更前       | `"types/auth.ts"`, `"types/api-keys.ts"`, `"types/index.ts"`                                                                                                        |
| 変更後       | `"types/index.ts"` は削除（`"src/types/index.ts"` が既に存在するため重複）。`"types/auth.ts"` → 削除（FR-5 で `src/types/index.ts` 経由のバレルエクスポートに統合） |
| 代替         | `auth.ts` と `api-keys.ts` に直接パスでアクセスする exports エントリが存在するため、tsup entry に `"src/types/auth.ts"` と `"src/types/api-keys.ts"` を追加する     |

#### FR-5: index.ts 統合

| 項目     | 内容                                                                                                                                                                                                                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 機能     | `types/index.ts` の re-export 内容を `src/types/index.ts` に統合する                                                                                                                                                                                                                                                        |
| 統合対象 | `types/index.ts` が re-export する5モジュール: `workflow`、`common`、`auth`、`api-keys`、`file-selection`                                                                                                                                                                                                                   |
| 統合方法 | `src/types/index.ts` に `export * from "./workflow"` 等の5行を追加する                                                                                                                                                                                                                                                      |
| 名前衝突 | `file-selection.ts` のエクスポートは `src/types/index.ts` の142行目で `../../schemas/index.js` 経由で既にエクスポートされている。重複するエクスポート名がある場合は `src/types/index.ts` 側の既存エクスポートを優先し、`file-selection.ts` からの re-export は `schemas` 経由のエクスポートでカバーされない型のみに限定する |
| 制約     | `src/types/index.ts` の既存エクスポートの順序・構造を維持する                                                                                                                                                                                                                                                               |

#### FR-6: テストファイル移行

| 項目       | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| 機能       | `types/__tests__/auth.test.ts` を `src/types/__tests__/auth.test.ts` に移動する         |
| import更新 | テストファイル内の `import` パスを `../auth` から更新する（移動後の相対パスに合わせる） |
| 前提条件   | 移動先ディレクトリ `src/types/__tests__/` が存在しない場合は作成する                    |

#### FR-7: 旧ディレクトリ削除

| 項目     | 内容                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| 機能     | ファイル移動・統合完了後に `packages/shared/types/` ディレクトリを完全に削除する    |
| 削除対象 | `types/` ディレクトリ全体（`index.ts`、5つの型ファイル、`__tests__/` ディレクトリ） |
| 前提条件 | FR-1〜FR-6 の全ステップが完了していること                                           |
| 検証     | 削除後に `pnpm --filter @repo/shared build` が成功すること                          |

---

### Task 2: 非機能要件（NFR）

#### NFR-1: 後方互換性

| 項目     | 内容                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------ |
| 要件     | 公開パス（`@repo/shared/types/auth`、`@repo/shared/types/api-keys`、`@repo/shared/types`）は変更しない |
| 検証方法 | `apps/desktop` と `apps/web` の既存 import 文が変更なしでコンパイル成功すること                        |
| 根拠     | `package.json` の `exports` と `typesVersions` がパスマッピングを吸収するため                          |

#### NFR-2: ビルド整合性

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| 要件     | `pnpm --filter @repo/shared build` が成功し、`dist/` 配下に期待するファイルが生成されること |
| 検証方法 | ビルド後に `dist/src/types/auth.d.ts` と `dist/src/types/auth.js` が存在すること            |
| 許容基準 | ビルド時間が現行比 ±10% 以内                                                                |

#### NFR-3: 型チェック通過

| 項目     | 内容                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| 要件     | `pnpm typecheck` がプロジェクト全体で成功すること                                                                 |
| 検証方法 | `pnpm --filter @repo/shared typecheck` と `pnpm --filter @repo/desktop typecheck` の両方が 0 エラーで終了すること |

#### NFR-4: テスト全 PASS

| 項目     | 内容                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| 要件     | `pnpm --filter @repo/shared test:run` が全テスト PASS すること                    |
| 検証方法 | 移行したテストファイル（`src/types/__tests__/auth.test.ts`）を含む全テストが PASS |
| 追加     | `pnpm --filter @repo/desktop test:run` で回帰テストが PASS すること               |

---

### Task 3: 受入基準（AC）

| ID    | 受入基準                                                                                                                        | 対応要件    | テスト方法            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------- |
| AC-01 | `packages/shared/src/types/auth.ts` が存在し、元の `types/auth.ts` と同一内容である                                             | FR-1        | ファイル内容比較      |
| AC-02 | `packages/shared/src/types/api-keys.ts` が存在し、元の `types/api-keys.ts` と同一内容である                                     | FR-1        | ファイル内容比較      |
| AC-03 | `packages/shared/src/types/common.ts` が存在し、元の `types/common.ts` と同一内容である                                         | FR-1        | ファイル内容比較      |
| AC-04 | `packages/shared/src/types/file-selection.ts` が存在する                                                                        | FR-1        | ファイル存在確認      |
| AC-05 | `packages/shared/src/types/workflow.ts` が存在し、元の `types/workflow.ts` と同一内容である                                     | FR-1        | ファイル内容比較      |
| AC-06 | `import { AuthUser } from "@repo/shared/types/auth"` が `apps/desktop` でコンパイル成功する                                     | FR-2, NFR-1 | TypeScript コンパイル |
| AC-07 | `import { ApiKeyInfo } from "@repo/shared/types/api-keys"` が `apps/desktop` でコンパイル成功する                               | FR-2, NFR-1 | TypeScript コンパイル |
| AC-08 | `package.json` の `exports["./types/auth"]` が `./dist/src/types/auth.d.ts` を指す                                              | FR-2        | JSON 値検証           |
| AC-09 | `package.json` の `typesVersions["*"]["types/auth"]` が `./src/types/auth.ts` を指す                                            | FR-3        | JSON 値検証           |
| AC-10 | `tsup.config.ts` の `entry` に `"src/types/auth.ts"` と `"src/types/api-keys.ts"` が含まれ、旧 `"types/auth.ts"` 等が含まれない | FR-4        | 設定値検証            |
| AC-11 | `src/types/index.ts` が `workflow`、`common`、`auth`、`api-keys` の re-export を含む                                            | FR-5        | ファイル内容検証      |
| AC-12 | `src/types/__tests__/auth.test.ts` が存在し、テストが PASS する                                                                 | FR-6        | `vitest run` 実行     |
| AC-13 | `packages/shared/types/` ディレクトリが存在しない                                                                               | FR-7        | ディレクトリ存在確認  |
| AC-14 | `pnpm --filter @repo/shared build` が成功する                                                                                   | NFR-2       | ビルド実行            |

---

### Task 4: スコープ確認

#### 含むもの

| 項目                      | 詳細                                                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| ファイル移動（5件）       | `auth.ts`、`api-keys.ts`、`common.ts`、`file-selection.ts`、`workflow.ts`                                         |
| index.ts 統合（1件）      | `types/index.ts` の内容を `src/types/index.ts` に統合                                                             |
| テストファイル移行（1件） | `types/__tests__/auth.test.ts` → `src/types/__tests__/auth.test.ts`                                               |
| 設定ファイル更新（4件）   | `package.json`、`tsup.config.ts`、`apps/desktop/tsconfig.json`、`apps/desktop/vitest.config.ts`（必要な場合のみ） |
| 旧ディレクトリ削除（1件） | `packages/shared/types/` ディレクトリ全体                                                                         |

#### 含まないもの

| 項目                              | 理由                                                                |
| --------------------------------- | ------------------------------------------------------------------- |
| `schemas/` ディレクトリの移動     | 今回のスコープ外。`schemas/` は独立した構造であり別タスクで対応する |
| `core/`、`infrastructure/` の移動 | 同上。これらは `src/` 外に配置されているが別の構造的問題である      |
| `apps/desktop` の import 文変更   | 公開パスは変更しないため不要                                        |
| `apps/web` の import 文変更       | 同上                                                                |
| `utils/` ディレクトリの移動       | 今回のスコープ外                                                    |

---

### Task 5: 影響範囲分析

#### 4ファイル同期チェックリスト

| ファイル                         | 更新内容                                                                                                                                                          | 必須 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `packages/shared/package.json`   | `exports` と `typesVersions` の `types/auth`、`types/api-keys` エントリのパス変更                                                                                 | はい |
| `apps/desktop/tsconfig.json`     | `compilerOptions.paths` の `@repo/shared/types/auth`、`@repo/shared/types/api-keys` のパス変更                                                                    | はい |
| `apps/desktop/vitest.config.ts`  | `resolve.alias` に `@repo/shared` 関連のエイリアスが存在しないため、更新不要の可能性が高い（`tsconfigPaths` プラグインが tsconfig.json のパスを自動解決するため） | 確認 |
| `packages/shared/tsup.config.ts` | `entry` 配列から旧パスエントリを削除し、新パスエントリを追加                                                                                                      | はい |

#### 影響ファイル一覧（import 文変更不要）

`@repo/shared/types/auth` を import しているファイルは30件以上存在するが、`package.json` の `exports` と `typesVersions` がパスマッピングを吸収するため、import 文の変更は不要。

---

## 参照資料

| 参照資料             | パス                                  | 内容                           |
| -------------------- | ------------------------------------- | ------------------------------ |
| アーキテクチャルール | `.claude/rules/01-architecture.md`    | モノレポ構造、依存方向         |
| コード品質ルール     | `.claude/rules/02-code-quality.md`    | TypeScript 型安全、テスト基準  |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`  | P8, P11, P23, P32              |
| Git ルール           | `.claude/rules/07-git-and-tooling.md` | コミット前チェックリスト       |
| package.json         | `packages/shared/package.json`        | 現行の exports / typesVersions |
| tsup.config.ts       | `packages/shared/tsup.config.ts`      | 現行の entry 設定              |
| desktop tsconfig     | `apps/desktop/tsconfig.json`          | 現行の paths 設定              |
| desktop vitest       | `apps/desktop/vitest.config.ts`       | 現行の resolve.alias           |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                                    |
| ------------------ | ---------------------------------------------------------------------------- | --------------------------------------- |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | レイヤー責務と依存方向の正本            |
| モノレポ構成       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | `@repo/shared` の公開パス契約と配置規約 |
| ディレクトリ構成   | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`   | ファイル配置と移設時の基準              |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テスト・型チェック・カバレッジ基準      |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | Phase運用と完了判定ルール               |

## 統合テスト連携

| テスト種別        | 検証内容                                                                            |
| ----------------- | ----------------------------------------------------------------------------------- |
| ユニットテスト    | `src/types/__tests__/auth.test.ts` の移行後テストが PASS する                       |
| ビルドテスト      | `pnpm --filter @repo/shared build` が成功し、`dist/` に期待するファイルが生成される |
| 型チェックテスト  | `pnpm typecheck` がプロジェクト全体で 0 エラー                                      |
| 回帰テスト        | `pnpm --filter @repo/desktop test:run` で既存テストが全 PASS                        |
| import 解決テスト | `@repo/shared/types/auth` の import が `apps/desktop` で解決される                  |

## 多角的チェック観点

| 観点           | チェック内容                                                                       |
| -------------- | ---------------------------------------------------------------------------------- |
| 型安全性       | 移動後のファイルで型エクスポートが維持され、import 側で型解決が成功する            |
| ビルド整合性   | tsup ビルドが成功し、`dist/` 配下のファイル構造が正しい                            |
| 後方互換性     | 公開パスが変更されず、既存の import 文がコンパイル成功する                         |
| 既知の Pitfall | P8（幽霊依存）: 移動後も `package.json` で宣言された依存関係で解決される           |
|                | P11（PostToolUse フック Edit 失敗）: 大量編集後は `git diff --stat` で変更数を検証 |
|                | P23（API二重定義の型管理）: 二重構造を解消することで P23 の根本原因を排除する      |
|                | P32（型定義の二箇所同時更新必須）: 単一ディレクトリ化で P32 の発生を防止する       |
| 名前衝突       | `file-selection.ts` のエクスポートと `schemas` 経由の既存エクスポートの重複を確認  |

## 成果物

| 成果物                   | パス                                         |
| ------------------------ | -------------------------------------------- |
| 要件定義書（本ファイル） | `phase-1-requirements.md`                    |
| 要件サマリー             | `outputs/phase-1/requirements-definition.md` |
| 受入基準一覧             | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ定義             | `outputs/phase-1/scope-definition.md`        |

## 完了条件

- [ ] FR-1〜FR-7 の7つの機能要件がテスト可能な粒度で定義されている
- [ ] NFR-1〜NFR-4 の非機能要件が具体的な検証方法と共に定義されている
- [ ] AC-01〜AC-14 の受入基準が全て定義されている
- [ ] スコープ（含むもの/含まないもの）が明文化されている
- [ ] 4ファイル同期チェックリストが整理されている
- [ ] 参照資料テーブルが完備されている
- [ ] 既知の Pitfall（P8, P11, P23, P32）への対策が明記されている

## 次のPhase

→ Phase 2: 設計（`phase-2-design.md`）
