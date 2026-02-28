# Phase 2: 設計 — packages/shared ソースディレクトリ構造統一

## メタ情報

| 項目      | 内容                                                       |
| --------- | ---------------------------------------------------------- |
| タスクID  | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001                  |
| Phase     | 2                                                          |
| タスク名  | packages/shared の types/ と src/types/ 二重構造を解消する |
| 作成日    | 2026-02-28                                                 |
| 依存Phase | Phase 1（要件定義）                                        |

## 目的

Phase 1 で定義した7つの機能要件（FR-1〜FR-7）と4つの非機能要件（NFR-1〜NFR-4）に対する移行計画を策定する。ファイル移動の実行順序、`index.ts` 統合の具体的差分、`package.json` / `tsup.config.ts` / `tsconfig.json` の変更差分を定義し、Phase 4（テスト作成）以降で迷いなく実装できる精度の設計を行う。

## 実行タスク

- Task 1: 移行計画設計 — ファイル単位の移行順序と依存関係を定義する
- Task 2: index.ts 統合設計 — `types/index.ts` と `src/types/index.ts` の統合差分を定義する
- Task 3: package.json 変更差分設計 — exports / typesVersions の具体的変更内容を定義する
- Task 4: tsup.config.ts エントリーポイント設計 — entry 配列の変更差分を定義する
- Task 5: tsconfig.json / vitest.config.ts パス更新設計 — paths の変更差分を定義する

---

### Task 1: 移行計画設計

#### 移行順序

移行は以下の順序で実行する。設定ファイル更新を先に行い、その後ファイル移動を行うことで、一時的なビルド失敗を最小化する。

| ステップ | 操作                     | 対象                                                                | 理由                                                 |
| -------- | ------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------- |
| Step 1   | ファイルコピー           | 5ファイル: `types/` → `src/types/`                                  | 移動元を残した状態でコピーし、検証後に削除する       |
| Step 2   | テストファイルコピー     | `types/__tests__/auth.test.ts` → `src/types/__tests__/auth.test.ts` | テストの import パスを更新                           |
| Step 3   | index.ts 統合            | `src/types/index.ts` に re-export 追加                              | FR-5 の統合を実行                                    |
| Step 4   | 設定ファイル更新（一括） | `package.json`、`tsup.config.ts`、`tsconfig.json`                   | 4ファイル同期チェックリストに従い一括更新            |
| Step 5   | ビルド検証               | `pnpm --filter @repo/shared clean && build`                         | 新パスでビルドが成功することを確認                   |
| Step 6   | 型チェック検証           | `pnpm typecheck`                                                    | プロジェクト全体の型チェックが通ることを確認         |
| Step 7   | テスト検証               | `pnpm --filter @repo/shared test:run`                               | 全テストが PASS することを確認                       |
| Step 8   | 旧ディレクトリ削除       | `packages/shared/types/` 全体                                       | Step 5-7 の成功を確認後に実行                        |
| Step 9   | 最終ビルド検証           | `pnpm --filter @repo/shared build`                                  | 旧ディレクトリ削除後にビルドが成功することを最終確認 |

#### ファイル移動詳細

| 移動元                         | 移動先                             | 内容変更                                                                                          |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `types/auth.ts`                | `src/types/auth.ts`                | なし（そのままコピー）                                                                            |
| `types/api-keys.ts`            | `src/types/api-keys.ts`            | なし（そのままコピー）                                                                            |
| `types/common.ts`              | `src/types/common.ts`              | なし（そのままコピー）                                                                            |
| `types/workflow.ts`            | `src/types/workflow.ts`            | なし（そのままコピー）                                                                            |
| `types/file-selection.ts`      | `src/types/file-selection.ts`      | import パス変更: `../schemas/file-selection.schema.js` → `../../schemas/file-selection.schema.js` |
| `types/__tests__/auth.test.ts` | `src/types/__tests__/auth.test.ts` | import パス変更: `../auth` → `../auth`（相対パス同一のため変更不要）                              |

#### file-selection.ts の import パス変更詳細

`types/file-selection.ts` は `../schemas/file-selection.schema.js` から型を re-export している。`src/types/` に移動すると、`schemas/` への相対パスが変わる:

```
変更前（types/file-selection.ts）:
  import from "../schemas/file-selection.schema.js"
  → 解決先: packages/shared/schemas/file-selection.schema.js ✓

変更後（src/types/file-selection.ts）:
  import from "../../schemas/file-selection.schema.js"
  → 解決先: packages/shared/schemas/file-selection.schema.js ✓
```

---

### Task 2: index.ts 統合設計

#### 現状分析

**`types/index.ts`（6行）**:

```typescript
export * from "./workflow";
export * from "./common";
export * from "./auth";
export * from "./api-keys";
export * from "./file-selection";
```

**`src/types/index.ts`（164行）**: 既に多数のモジュールを re-export。`file-selection` 関連の型は142行目で `../../schemas/index.js` 経由で既にエクスポートされている。

#### 統合差分

`src/types/index.ts` の末尾に以下を追加する:

```typescript
// 旧 types/ ディレクトリから統合 (TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001)
export * from "./workflow";
export * from "./common";
export * from "./auth";
export * from "./api-keys";
```

#### 名前衝突分析

| モジュール       | 衝突の有無 | 理由                                                                                                             |
| ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `workflow`       | なし       | `src/types/index.ts` に `workflow` 関連のエクスポートは存在しない                                                |
| `common`         | なし       | `src/types/index.ts` に `Result`、`PaginationParams` 等のエクスポートは存在しない                                |
| `auth`           | なし       | `src/types/index.ts` に `auth` 関連のエクスポートは存在しない（`auth-mode` は別モジュール）                      |
| `api-keys`       | 要確認     | `src/types/index.ts` に `api-keys` 関連のエクスポートが存在しないことを実装時に確認する                          |
| `file-selection` | あり       | `src/types/index.ts` の142行目で同じ型が `../../schemas/index.js` 経由でエクスポート済み。re-export を追加しない |

**決定**: `file-selection` は re-export に含めない。残り4モジュール（`workflow`、`common`、`auth`、`api-keys`）のみ追加する。

---

### Task 3: package.json 変更差分設計

#### exports の変更

```diff
  "./types/auth": {
-   "types": "./dist/types/auth.d.ts",
-   "import": "./dist/types/auth.js"
+   "types": "./dist/src/types/auth.d.ts",
+   "import": "./dist/src/types/auth.js"
  },
  "./types/api-keys": {
-   "types": "./dist/types/api-keys.d.ts",
-   "import": "./dist/types/api-keys.js"
+   "types": "./dist/src/types/api-keys.d.ts",
+   "import": "./dist/src/types/api-keys.js"
  },
```

**変更エントリ数**: 2エントリ（`./types/auth` と `./types/api-keys`）
**変更なしエントリ**: `./types` は既に `./dist/src/types/index.d.ts` を指しているため変更不要

#### typesVersions の変更

```diff
  "types/auth": [
-   "./types/auth.ts"
+   "./src/types/auth.ts"
  ],
  "types/api-keys": [
-   "./types/api-keys.ts"
+   "./src/types/api-keys.ts"
  ],
```

**変更エントリ数**: 2エントリ
**変更なしエントリ**: `"types"` は既に `"./src/types/index.ts"` を指しているため変更不要

---

### Task 4: tsup.config.ts エントリーポイント設計

#### entry 配列の変更

```diff
  entry: [
    "index.ts",
    "core/index.ts",
    "infrastructure/index.ts",
    "infrastructure/auth/index.ts",
    "infrastructure/database/index.ts",
    "infrastructure/ai/apiKeyValidator.ts",
-   "types/index.ts",
-   "types/auth.ts",
-   "types/api-keys.ts",
    "schemas/index.ts",
    "schemas/auth.ts",
    "src/types/index.ts",
    "src/types/skill.ts",
    "src/types/replace.ts",
    "src/types/agent.ts",
    "src/types/agent-execution.ts",
    "src/types/auth-mode.ts",
+   "src/types/auth.ts",
+   "src/types/api-keys.ts",
    "src/types/llm/schemas/index.ts",
    "src/types/rag/index.ts",
    "src/types/rag/result.ts",
    ...
  ],
```

**削除エントリ**: 3件（`types/index.ts`、`types/auth.ts`、`types/api-keys.ts`）
**追加エントリ**: 2件（`src/types/auth.ts`、`src/types/api-keys.ts`）
**理由**: `types/index.ts` は `src/types/index.ts` が既に存在するため不要。`auth.ts` と `api-keys.ts` は直接パスアクセス用の exports エントリが存在するため、個別エントリとして追加が必要。

---

### Task 5: tsconfig.json / vitest.config.ts パス更新設計

#### apps/desktop/tsconfig.json の paths 変更

```diff
  "@repo/shared/types/auth": [
-   "../../packages/shared/types/auth.ts"
+   "../../packages/shared/src/types/auth.ts"
  ],
  "@repo/shared/types/api-keys": [
-   "../../packages/shared/types/api-keys.ts"
+   "../../packages/shared/src/types/api-keys.ts"
  ],
```

**変更エントリ数**: 2エントリ
**変更なしエントリ**: `@repo/shared/types` は既に `../../packages/shared/src/types/index.ts` を指しているため変更不要

#### apps/desktop/vitest.config.ts の変更

`vitest.config.ts` は `tsconfigPaths()` プラグインを使用しており、`tsconfig.json` の `paths` 設定を自動的に解決する。`resolve.alias` に `@repo/shared` 関連のエイリアスは定義されていないため、**vitest.config.ts の変更は不要**。

---

## 参照資料

| 参照資料           | パス                                      | 内容                           |
| ------------------ | ----------------------------------------- | ------------------------------ |
| Phase 1 要件定義   | `phase-1-requirements.md`                 | FR/NFR/AC 定義                 |
| 受入基準一覧       | `outputs/phase-1/acceptance-criteria.md`  | AC-01〜AC-14                   |
| package.json       | `packages/shared/package.json`            | 現行の exports / typesVersions |
| tsup.config.ts     | `packages/shared/tsup.config.ts`          | 現行の entry 設定              |
| desktop tsconfig   | `apps/desktop/tsconfig.json`              | 現行の paths 設定              |
| desktop vitest     | `apps/desktop/vitest.config.ts`           | tsconfigPaths プラグイン設定   |
| types/index.ts     | `packages/shared/types/index.ts`          | 統合元の re-export 定義        |
| src/types/index.ts | `packages/shared/src/types/index.ts`      | 統合先の re-export 定義        |
| file-selection.ts  | `packages/shared/types/file-selection.ts` | schemas 経由の re-export       |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容                                 |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------ |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`  | レイヤー責務と依存方向の正本         |
| モノレポ構成       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`  | workspace / exports / paths 契約正本 |
| ディレクトリ構成   | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`    | 移行対象ファイルの配置規則           |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 設計時の命名・検証・運用ルール       |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | カバレッジ・型チェック目標           |

## 統合テスト連携

| テスト種別        | 検証内容                                                           |
| ----------------- | ------------------------------------------------------------------ |
| ビルドテスト      | Step 5: `pnpm --filter @repo/shared clean && build` 成功           |
| 型チェックテスト  | Step 6: `pnpm typecheck` プロジェクト全体 0 エラー                 |
| ユニットテスト    | Step 7: `src/types/__tests__/auth.test.ts` を含む全テスト PASS     |
| import 解決テスト | `@repo/shared/types/auth` の import が `apps/desktop` で解決される |
| 回帰テスト        | `pnpm --filter @repo/desktop test:run` で既存テスト全 PASS         |
| 最終ビルド検証    | Step 9: 旧ディレクトリ削除後のビルド成功                           |

## 多角的チェック観点

| 観点             | チェック内容                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| 移行順序の安全性 | コピー→設定更新→検証→削除の順序により、失敗時にロールバック可能な状態を維持する                |
| 名前衝突         | `file-selection` の re-export を除外することで、`schemas` 経由の既存エクスポートとの衝突を防止 |
| パス一貫性       | exports / typesVersions / tsconfig paths / tsup entry の4箇所が全て同一の実体ファイルを指す    |
| 後方互換性       | 公開パス不変。既存の import 文変更不要                                                         |
| ビルド出力       | `dist/` 配下のファイル構造が旧パスから新パスに正しく変更される                                 |
| Pitfall 対策     | P8: 幽霊依存なし（package.json 依存関係は変更しない）                                          |
|                  | P11: 大量編集後は `git diff --stat` で変更数を検証                                             |
|                  | P23: 二重構造解消により P23 の根本原因を排除                                                   |
|                  | P32: 単一ディレクトリ化で P32 の発生を防止                                                     |

## 成果物

| 成果物               | パス                                     |
| -------------------- | ---------------------------------------- |
| 設計書（本ファイル） | `phase-2-design.md`                      |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md` |
| 移行計画書           | `outputs/phase-2/migration-plan.md`      |

## 完了条件

- [ ] 移行順序（Step 1-9）が依存関係を考慮して定義されている
- [ ] ファイル移動の内容変更（`file-selection.ts` の import パス更新）が特定されている
- [ ] index.ts 統合の差分が具体的に定義されている（4モジュール追加、`file-selection` 除外）
- [ ] package.json の exports / typesVersions 変更差分が具体的に定義されている
- [ ] tsup.config.ts の entry 変更差分（削除3件 + 追加2件）が定義されている
- [ ] tsconfig.json の paths 変更差分（2エントリ）が定義されている
- [ ] vitest.config.ts が変更不要であることが確認されている
- [ ] 名前衝突分析が完了し、`file-selection` の除外理由が記載されている
- [ ] 4ファイル同期チェックリストの全エントリの変更内容が確定している

## 次のPhase

→ Phase 3: 設計レビュー（`phase-3-design-review.md`）
