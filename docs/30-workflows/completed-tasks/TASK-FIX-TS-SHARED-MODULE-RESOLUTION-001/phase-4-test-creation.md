# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 4                                        |
| 機能名 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 作成日 | 2026-02-20                               |

## 目的

`pnpm typecheck` で発生する `Cannot find module '@repo/shared'` 系エラー 228 件の修正前状態を記録し、各サブパスエクスポートのモジュール解決を検証するテストを設計・作成する。修正前の Red 状態を明確に定義し、Phase 5 実装後の Green 確認基準を確立する。

## 実行タスク

- ベースライン記録: `pnpm typecheck` のエラー件数・エラーパターンをスナップショットとして記録する
- サブパスエクスポート解決検証テスト: `@repo/shared` の全 27 サブパスエクスポートに対して TypeScript モジュール解決が成功するかを検証するテストを設計・作成する
- Vitest alias 整合性検証テスト: `vitest.config.ts` の resolve.alias 定義と `package.json` の exports 定義の整合性を検証するテストを作成する
- `exports` パス不整合検出テスト: `dist/types/` と `dist/src/types/` の混在パターンを検出するテストを作成する

## 参照資料

| 資料名                   | パス                                                                                  | 説明                                                  |
| ------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 要件定義書               | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-1-requirements.md`  | Phase 1 成果物（エラー分析結果）                      |
| 設計書                   | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-2-design.md`        | Phase 2 成果物（修正アプローチ設計）                  |
| 設計レビュー結果         | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-3-design-review.md` | Phase 3 成果物（レビュー判定結果）                    |
| shared package.json      | `packages/shared/package.json`                                                        | 現行 exports 定義（27 サブパス）                      |
| shared tsconfig.json     | `packages/shared/tsconfig.json`                                                       | 現行 TypeScript 設定（`moduleResolution: "bundler"`） |
| desktop tsconfig.json    | `apps/desktop/tsconfig.json`                                                          | desktop パッケージの TypeScript 設定                  |
| desktop vitest.config.ts | `apps/desktop/vitest.config.ts`                                                       | Vitest resolve.alias 定義（18+ エントリ）             |
| shared tsup.config.ts    | `packages/shared/tsup.config.ts`                                                      | ビルド設定（エントリポイント 36 個）                  |
| モノレポ要件             | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`          | workspace依存と解決ルール                             |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`           | カバレッジ閾値・alias運用                             |
| テスト実装パターン       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`     | Vitest/RTL テスト設計                                 |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                  | P8（幽霊依存）、P40（テスト実行ディレクトリ依存）     |

## 実行手順

### ステップ 1: ベースラインエラーの記録

現状の typecheck エラーをスナップショットとして記録し、修正の進捗を定量的に追跡可能にする。

```bash
# ルートからの typecheck 実行（エラー件数をカウント）
cd /path/to/project && pnpm typecheck 2>&1 | grep "error TS" | wc -l

# エラーパターンの分類
cd /path/to/project && pnpm typecheck 2>&1 | grep "error TS" | sort | uniq -c | sort -rn > /tmp/typecheck-baseline.txt

# desktop パッケージ単体の typecheck
cd apps/desktop && pnpm typecheck 2>&1 | grep "Cannot find module" | wc -l
```

記録内容:

| 項目                      | 記録値         |
| ------------------------- | -------------- |
| 全 typecheck エラー件数   | （実行時記入） |
| `Cannot find module` 件数 | （実行時記入） |
| 影響ファイル数            | （実行時記入） |
| エラーパターン種別数      | （実行時記入） |

### ステップ 2: サブパスエクスポート解決検証テストの設計

`packages/shared/package.json` の `exports` フィールドに定義された全 27 サブパスに対して、TypeScript がモジュールを正しく解決できるかを検証する。

#### 2-1. テスト対象サブパスの一覧

以下の全サブパスに対して import 解決テストを設計する:

| サブパス                                          | exports types パス                                   | ソースファイル配置                                         |
| ------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| `@repo/shared`                                    | `./dist/index.d.ts`                                  | `index.ts`（ルート）                                       |
| `@repo/shared/core`                               | `./dist/core/index.d.ts`                             | `core/index.ts`（ルート）                                  |
| `@repo/shared/infrastructure`                     | `./dist/infrastructure/index.d.ts`                   | `infrastructure/index.ts`（ルート）                        |
| `@repo/shared/infrastructure/auth`                | `./dist/infrastructure/auth/index.d.ts`              | `infrastructure/auth/index.ts`（ルート）                   |
| `@repo/shared/infrastructure/database`            | `./dist/infrastructure/database/index.d.ts`          | `infrastructure/database/index.ts`（ルート）               |
| `@repo/shared/infrastructure/ai/apiKeyValidator`  | `./dist/infrastructure/ai/apiKeyValidator.d.ts`      | `infrastructure/ai/apiKeyValidator.ts`（ルート）           |
| `@repo/shared/types`                              | `./dist/src/types/index.d.ts`                        | `src/types/index.ts`（⚠️ `src/` 配下）                     |
| `@repo/shared/types/auth`                         | `./dist/types/auth.d.ts`                             | `types/auth.ts`（⚠️ ルート `types/`）                      |
| `@repo/shared/types/api-keys`                     | `./dist/types/api-keys.d.ts`                         | `types/api-keys.ts`（⚠️ ルート `types/`）                  |
| `@repo/shared/types/replace`                      | `./dist/src/types/replace.d.ts`                      | `src/types/replace.ts`（`src/` 配下）                      |
| `@repo/shared/types/rag`                          | `./dist/src/types/rag/index.d.ts`                    | `src/types/rag/index.ts`（`src/` 配下）                    |
| `@repo/shared/types/rag/result`                   | `./dist/src/types/rag/result.d.ts`                   | `src/types/rag/result.ts`（`src/` 配下）                   |
| `@repo/shared/types/llm`                          | `./dist/src/types/llm/schemas/index.d.ts`            | `src/types/llm/schemas/index.ts`（`src/` 配下）            |
| `@repo/shared/types/llm/schemas`                  | `./dist/src/types/llm/schemas/index.d.ts`            | `src/types/llm/schemas/index.ts`（`src/` 配下）            |
| `@repo/shared/types/skill`                        | `./dist/src/types/skill.d.ts`                        | `src/types/skill.ts`（`src/` 配下）                        |
| `@repo/shared/types/agent`                        | `./dist/src/types/agent.d.ts`                        | `src/types/agent.ts`（`src/` 配下）                        |
| `@repo/shared/types/auth-mode`                    | `./dist/src/types/auth-mode.d.ts`                    | `src/types/auth-mode.ts`（`src/` 配下）                    |
| `@repo/shared/agent`                              | `./dist/src/agent/index.d.ts`                        | `src/agent/index.ts`（`src/` 配下）                        |
| `@repo/shared/schemas`                            | `./dist/schemas/index.d.ts`                          | `schemas/index.ts`（ルート）                               |
| `@repo/shared/schemas/auth`                       | `./dist/schemas/auth.d.ts`                           | `schemas/auth.ts`（ルート）                                |
| `@repo/shared/constants`                          | `./dist/src/constants/index.d.ts`                    | `src/constants/index.ts`（`src/` 配下）                    |
| `@repo/shared/repositories`                       | `./dist/src/repositories/index.d.ts`                 | `src/repositories/index.ts`（`src/` 配下）                 |
| `@repo/shared/src/ipc/channels`                   | `./dist/src/ipc/channels.d.ts`                       | `src/ipc/channels.ts`（`src/` 配下）                       |
| `@repo/shared/services/history/types`             | `./dist/src/services/history/types.d.ts`             | `src/services/history/types.ts`（`src/` 配下）             |
| `@repo/shared/services/history/history-service`   | `./dist/src/services/history/history-service.d.ts`   | `src/services/history/history-service.ts`（`src/` 配下）   |
| `@repo/shared/services/logging/types`             | `./dist/src/services/logging/types.d.ts`             | `src/services/logging/types.ts`（`src/` 配下）             |
| `@repo/shared/services/logging/conversion-logger` | `./dist/src/services/logging/conversion-logger.d.ts` | `src/services/logging/conversion-logger.ts`（`src/` 配下） |

#### 2-2. exports パス不整合の検出

`types/*` サブパス群に混在する2パターンの不整合:

| パターン        | 例                             | dist パス                   | 原因                                         |
| --------------- | ------------------------------ | --------------------------- | -------------------------------------------- |
| ルート `types/` | `./types/auth`                 | `dist/types/auth.d.ts`      | ソースが `types/auth.ts`（ルート直下）       |
| `src/types/`    | `./types` (メインエクスポート) | `dist/src/types/index.d.ts` | ソースが `src/types/index.ts`（`src/` 配下） |

### ステップ 3: テストファイルの作成

#### 3-1. モジュール解決検証テスト

**ファイル配置**: `packages/shared/src/__tests__/module-resolution.test.ts`

TypeScript の型レベルで各サブパスエクスポートの解決を検証する。実際のモジュールが解決可能かを、`package.json` の exports 定義と `tsup.config.ts` のエントリポイントの整合性で検証する。

テスト項目:

| テスト ID | テスト名                                                       | 検証内容                                                             |
| --------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| T-MR-01   | package.json exports の全サブパスが tsup entry に対応する      | exports の各サブパスに対応する tsup エントリが存在することを検証     |
| T-MR-02   | exports types パスとソースファイルの対応が正しい               | types パスから推定されるソースファイルが実際に存在することを検証     |
| T-MR-03   | exports パスに `dist/types/` と `dist/src/types/` の混在がない | `types/*` サブパスの dist パスが統一されていることを検証             |
| T-MR-04   | tsup entry に対応しない orphaned exports がない                | exports に定義されているがビルドされないパスがないことを検証         |
| T-MR-05   | vitest alias の全エントリが exports に対応する                 | vitest.config.ts の alias キーが package.json exports に存在すること |

#### 3-2. TypeScript モジュール解決テスト

**ファイル配置**: `apps/desktop/src/__tests__/shared-module-resolution.test.ts`

`apps/desktop` から `@repo/shared` の各サブパスへの import が TypeScript で解決できることを検証する。

テスト項目:

| テスト ID | テスト名                                                               | 検証内容                                               |
| --------- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| T-TSR-01  | `@repo/shared` ルートインポートが解決できる                            | `import { ... } from '@repo/shared'` の型解決を検証    |
| T-TSR-02  | `@repo/shared/agent` インポートが解決できる                            | Agent 関連型のインポート解決を検証                     |
| T-TSR-03  | `@repo/shared/types` インポートが解決できる                            | メイン types エクスポートのインポート解決を検証        |
| T-TSR-04  | `@repo/shared/types/auth` インポートが解決できる                       | auth 型のインポート解決を検証                          |
| T-TSR-05  | `@repo/shared/types/skill` インポートが解決できる                      | skill 型のインポート解決を検証                         |
| T-TSR-06  | `@repo/shared/types/llm` インポートが解決できる                        | LLM 型のインポート解決を検証                           |
| T-TSR-07  | `@repo/shared/types/rag` インポートが解決できる                        | RAG 型のインポート解決を検証                           |
| T-TSR-08  | `@repo/shared/schemas` インポートが解決できる                          | schemas エクスポートのインポート解決を検証             |
| T-TSR-09  | `@repo/shared/constants` インポートが解決できる                        | constants エクスポートのインポート解決を検証           |
| T-TSR-10  | `@repo/shared/repositories` インポートが解決できる                     | repositories エクスポートのインポート解決を検証        |
| T-TSR-11  | `@repo/shared/src/ipc/channels` インポートが解決できる                 | IPC channels エクスポートのインポート解決を検証        |
| T-TSR-12  | `@repo/shared/services/history/history-service` インポートが解決できる | history-service エクスポートのインポート解決を検証     |
| T-TSR-13  | `@repo/shared/infrastructure/auth` インポートが解決できる              | infrastructure auth エクスポートのインポート解決を検証 |

#### 3-3. Vitest alias 整合性テスト

**ファイル配置**: `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts`

テスト項目:

| テスト ID | テスト名                                                     | 検証内容                                                            |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| T-VAC-01  | vitest alias のターゲットファイルが全て存在する              | alias が指すソースファイルが実在することを検証                      |
| T-VAC-02  | vitest alias と package.json exports のキーが一致する        | alias キーと exports キーの対応関係を検証                           |
| T-VAC-03  | vitest alias のターゲットが exports types のソースと一致する | alias のファイルパスと exports types パスから推定されるソースの一致 |

### ステップ 4: テストの実行確認（Red 状態）

```bash
# packages/shared のテスト実行
cd packages/shared && pnpm vitest run src/__tests__/module-resolution.test.ts

# apps/desktop のテスト実行（P40 対策: 対象パッケージディレクトリで実行）
cd apps/desktop && pnpm vitest run src/__tests__/shared-module-resolution.test.ts
cd apps/desktop && pnpm vitest run src/__tests__/vitest-alias-consistency.test.ts
```

Phase 4 時点の期待結果:

| テストファイル                   | 期待状態        | 理由                                        |
| -------------------------------- | --------------- | ------------------------------------------- |
| module-resolution.test.ts        | Red（一部失敗） | T-MR-03 が exports パス不整合を検出して失敗 |
| shared-module-resolution.test.ts | Red（失敗）     | typecheck エラーが解消されていないため失敗  |
| vitest-alias-consistency.test.ts | Red（一部失敗） | exports と alias の不整合を検出して失敗     |

## 統合テスト連携【必須】

| シナリオカテゴリ     | 検証内容                                                           | テストファイル                                                |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| モジュール解決整合性 | exports/tsup/alias の3定義が整合していることを横断的に検証         | `packages/shared/src/__tests__/module-resolution.test.ts`     |
| desktop TypeScript   | desktop パッケージから shared の全サブパスが import 解決できること | `apps/desktop/src/__tests__/shared-module-resolution.test.ts` |
| Vitest ランタイム    | Vitest 実行時の alias 解決と TypeScript 型解決が同じ結果になること | `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` |

## アーキテクチャ層別テスト

| 層                | テスト観点                                           | テストファイル配置                                            |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| Shared パッケージ | package.json exports とビルド設定の整合性検証        | `packages/shared/src/__tests__/module-resolution.test.ts`     |
| Desktop アプリ    | TypeScript モジュール解決とランタイム alias の整合性 | `apps/desktop/src/__tests__/shared-module-resolution.test.ts` |

## 実装時の注意事項（既知の Pitfall 対策）

| Pitfall ID | 注意事項                     | 対策                                                                              |
| ---------- | ---------------------------- | --------------------------------------------------------------------------------- |
| P8         | 幽霊依存                     | テスト内で `@repo/shared` を import する場合、`package.json` の依存関係を確認する |
| P9         | モジュールスコープ変数リーク | テストごとに `package.json` の読み取り結果をリセットする                          |
| P40        | テスト実行ディレクトリ依存   | テスト実行は `cd apps/desktop && pnpm vitest run` で行う                          |

## 成果物

| 成果物                    | パス                                                          | 説明                                   |
| ------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| ベースラインエラー記録    | `outputs/phase-4/typecheck-baseline.md`                       | typecheck エラーのスナップショット記録 |
| テスト仕様書              | `outputs/phase-4/test-specification.md`                       | テストシナリオとテスト項目の設計       |
| モジュール解決テスト      | `packages/shared/src/__tests__/module-resolution.test.ts`     | exports/tsup 整合性検証テスト          |
| TypeScript 解決テスト     | `apps/desktop/src/__tests__/shared-module-resolution.test.ts` | desktop からの import 解決検証テスト   |
| Vitest alias 整合性テスト | `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` | alias と exports の整合性検証テスト    |

## 完了条件

- [ ] `pnpm typecheck` のベースラインエラー件数が記録されている
- [ ] エラーパターンがカテゴリ別に分類されている
- [ ] 全 27 サブパスエクスポートに対するテストシナリオが設計されている
- [ ] モジュール解決検証テスト（`module-resolution.test.ts`）が作成されている
- [ ] TypeScript モジュール解決テスト（`shared-module-resolution.test.ts`）が作成されている
- [ ] Vitest alias 整合性テスト（`vitest-alias-consistency.test.ts`）が作成されている
- [ ] T-MR-03（exports パス不整合検出）が Red 状態で失敗することを確認している
- [ ] テスト実行は `cd apps/desktop && pnpm vitest run` で行っている（P40 対策）
- [ ] happy-dom 環境で `userEvent` を使用していない（P39 対策）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1-3 成果物の読み込み）
2. ステップ 1: ベースラインエラーの記録
3. ステップ 2: サブパスエクスポート解決テストの設計
4. ステップ 3-1: モジュール解決検証テスト作成
5. ステップ 3-2: TypeScript モジュール解決テスト作成
6. ステップ 3-3: Vitest alias 整合性テスト作成
7. ステップ 4: Red 状態の確認
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## TDD 検証

```bash
# テスト実行コマンド
cd packages/shared && pnpm vitest run src/__tests__/module-resolution.test.ts
cd apps/desktop && pnpm vitest run src/__tests__/shared-module-resolution.test.ts
cd apps/desktop && pnpm vitest run src/__tests__/vitest-alias-consistency.test.ts

# 確認項目
# - [ ] T-MR-03 が失敗することを確認（Red 状態: exports パス不整合）
# - [ ] T-TSR-* が失敗することを確認（Red 状態: モジュール解決不可）
# - [ ] T-VAC-02 が失敗することを確認（Red 状態: alias/exports 不整合）
```

## 次の Phase

Phase 5: 実装（TDD: Green）
