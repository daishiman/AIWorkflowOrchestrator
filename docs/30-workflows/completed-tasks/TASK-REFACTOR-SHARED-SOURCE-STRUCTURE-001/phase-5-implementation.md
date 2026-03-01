# Phase 5: 実装 — TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 5                                          |
| 機能名     | packages/shared 型定義ディレクトリ統合     |
| タスク ID  | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001  |
| 作成日     | 2026-02-28                                 |
| 前提 Phase | Phase 4（テスト作成）完了                  |
| 目的       | Phase 4 のテスト（Red）を Green にする実装 |

## 目的

TDD の Green フェーズとして、`types/`（ルート直下）の5ファイル + index.ts + `__tests__/` を `src/types/` に移行し、関連する4つの設定ファイルを更新する。Phase 4 で作成した全テストが PASS する状態にする。

## 実行タスク

- Task 1: ファイル移動（5ファイル + テスト）
- Task 2: src/types/index.ts の統合更新
- Task 3: package.json 更新（exports + typesVersions）
- Task 4: tsup.config.ts 更新（entry）
- Task 5: tsconfig.json 更新（shared — include）
- Task 6: tsconfig.json 更新（desktop — paths）
- Task 7: vitest.config.ts 確認（desktop — tsconfigPaths 経由）
- Task 8: 旧 types/ ディレクトリ削除
- Task 9: ビルド検証

## 参照資料

| 資料名                | パス                                                                                                   | 説明                     |
| --------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------ |
| テスト仕様            | `docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-4-test-creation.md` | Red フェーズのテスト一覧 |
| 設計仕様              | `docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-2-design.md`        | 移行設計                 |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                                                   | P8, P11, P23, P32        |
| 現行 package.json     | `packages/shared/package.json`                                                                         | 更新対象                 |
| 現行 tsup.config.ts   | `packages/shared/tsup.config.ts`                                                                       | 更新対象                 |
| shared tsconfig.json  | `packages/shared/tsconfig.json`                                                                        | 更新対象                 |
| desktop tsconfig.json | `apps/desktop/tsconfig.json`                                                                           | 更新対象                 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容                               |
| ------------------ | ----------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`  | 実装レイヤー責務の整合確認         |
| モノレポ構成       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`  | `@repo/shared` の公開パス契約正本  |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 実装時の検証・品質運用ルール       |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | テスト・型チェック・カバレッジ基準 |

## 実行手順

### Task 1: ファイル移動（5ファイル + テスト）

`types/` ディレクトリ配下のソースファイルを `src/types/` に移動する。

#### Step 1.1: 移行対象ファイルの確認

移動前に、移行先に同名ファイルが存在しないことを確認する。

```bash
# 移行元ファイル一覧
ls -la packages/shared/types/

# 移行先に同名ファイルが存在しないことを確認
ls packages/shared/src/types/auth.ts 2>/dev/null && echo "CONFLICT" || echo "OK"
ls packages/shared/src/types/api-keys.ts 2>/dev/null && echo "CONFLICT" || echo "OK"
ls packages/shared/src/types/common.ts 2>/dev/null && echo "CONFLICT" || echo "OK"
ls packages/shared/src/types/file-selection.ts 2>/dev/null && echo "CONFLICT" || echo "OK"
ls packages/shared/src/types/workflow.ts 2>/dev/null && echo "CONFLICT" || echo "OK"
```

#### Step 1.2: 5ファイルの移動

```bash
cd packages/shared
mv types/auth.ts src/types/auth.ts
mv types/api-keys.ts src/types/api-keys.ts
mv types/common.ts src/types/common.ts
mv types/file-selection.ts src/types/file-selection.ts
mv types/workflow.ts src/types/workflow.ts
```

#### Step 1.3: テストファイルの移動

```bash
# テストディレクトリが存在しない場合は作成
mkdir -p packages/shared/src/types/__tests__

# 既存テストの移動
mv packages/shared/types/__tests__/auth.test.ts packages/shared/src/types/__tests__/auth.test.ts
```

**注意**: `src/types/__tests__/` に既存テストがある場合は、ファイル名衝突を確認してから移動する。

### Task 2: src/types/index.ts の統合更新

`types/index.ts` の re-export 内容を `src/types/index.ts` に統合する。

#### Step 2.1: 現行の types/index.ts の内容確認

現行の `types/index.ts`:

```typescript
export * from "./workflow";
export * from "./common";
export * from "./auth";
export * from "./api-keys";
export * from "./file-selection";
```

#### Step 2.2: src/types/index.ts に re-export を追加

`src/types/index.ts` の末尾に以下を追加:

```typescript
// --- 旧 types/ から移行した re-export ---
export * from "./workflow";
export * from "./common";
export * from "./auth";
export * from "./api-keys";
export * from "./file-selection";
```

**名前衝突チェック**: 追加前に、既存の `src/types/index.ts` と `types/index.ts` で同じシンボル名が export されていないことを確認する。

```bash
# 名前衝突の検出
grep "export" packages/shared/src/types/index.ts | sort > /tmp/src-exports.txt
grep "export" packages/shared/types/index.ts | sort > /tmp/types-exports.txt
comm -12 /tmp/src-exports.txt /tmp/types-exports.txt
```

#### Step 2.3: types/index.ts を削除

統合後、旧 `types/index.ts` は不要になるため削除する（Task 8 で types/ ディレクトリごと削除）。

### Task 3: package.json 更新（exports + typesVersions）

#### Step 3.1: exports フィールドの更新

以下のパスを変更:

| 公開パス           | 変更前（import）           | 変更後（import）               |
| ------------------ | -------------------------- | ------------------------------ |
| `./types/auth`     | `./dist/types/auth.js`     | `./dist/src/types/auth.js`     |
| `./types/api-keys` | `./dist/types/api-keys.js` | `./dist/src/types/api-keys.js` |

**変更不要な exports**:

- `./types` — 既に `./dist/src/types/index.js` を参照済み

**追加する exports**（対象エントリが存在する場合）:

- `./types/common` — `./dist/src/types/common.js`
- `./types/workflow` — `./dist/src/types/workflow.js`
- `./types/file-selection` — `./dist/src/types/file-selection.js`

#### Step 3.2: typesVersions フィールドの更新

以下のパスを変更:

| 公開パス         | 変更前                    | 変更後                        |
| ---------------- | ------------------------- | ----------------------------- |
| `types/auth`     | `["./types/auth.ts"]`     | `["./src/types/auth.ts"]`     |
| `types/api-keys` | `["./types/api-keys.ts"]` | `["./src/types/api-keys.ts"]` |

**変更不要な typesVersions**:

- `types` — 既に `["./src/types/index.ts"]` を参照済み

### Task 4: tsup.config.ts 更新（entry）

entry 配列から旧パスを削除し、新パスに置換する。

#### Step 4.1: entry の更新

| 変更前                | 変更後                                |
| --------------------- | ------------------------------------- |
| `"types/index.ts"`    | 削除（`"src/types/index.ts"` が既存） |
| `"types/auth.ts"`     | `"src/types/auth.ts"`                 |
| `"types/api-keys.ts"` | `"src/types/api-keys.ts"`             |

**追加する entry**（対象エントリが存在する場合）:

- `"src/types/common.ts"`
- `"src/types/workflow.ts"`
- `"src/types/file-selection.ts"`

### Task 5: tsconfig.json 更新（shared — include）

#### Step 5.1: include フィールドの確認

`packages/shared/tsconfig.json` の `include` に `"types/**/*.ts"` が含まれている場合、`src/` 配下に統合されたため不要になる。`"src/**/*.ts"` が既に含まれていれば、`"types/**/*.ts"` を削除する。

### Task 6: tsconfig.json 更新（desktop — paths）

#### Step 6.1: paths の更新

| パスキー                      | 変更前                                        | 変更後                                            |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------- |
| `@repo/shared/types/auth`     | `["../../packages/shared/types/auth.ts"]`     | `["../../packages/shared/src/types/auth.ts"]`     |
| `@repo/shared/types/api-keys` | `["../../packages/shared/types/api-keys.ts"]` | `["../../packages/shared/src/types/api-keys.ts"]` |

**変更不要な paths**:

- `@repo/shared/types` — 既に `["../../packages/shared/src/types/index.ts"]` を参照済み

### Task 7: vitest.config.ts 確認（desktop — tsconfigPaths 経由）

`apps/desktop/vitest.config.ts` は `tsconfigPaths()` プラグインを使用しており、`tsconfig.json` の `paths` を自動的に読み込む。Task 6 で `tsconfig.json` の `paths` を更新すれば、vitest の alias も自動的に更新される。

#### Step 7.1: 明示的な alias がないことを確認

```bash
grep -n "@repo/shared/types" apps/desktop/vitest.config.ts
```

明示的な alias が存在する場合は、Task 6 と同様にパスを更新する。

### Task 8: 旧 types/ ディレクトリ削除

#### Step 8.1: 残存ファイルの確認

```bash
ls -la packages/shared/types/
```

空であることを確認してからディレクトリを削除する。

#### Step 8.2: ディレクトリ削除

```bash
rm -rf packages/shared/types/
```

### Task 9: ビルド検証

#### Step 9.1: shared パッケージのビルド

```bash
pnpm --filter @repo/shared build
```

- ビルドが成功すること
- `dist/src/types/auth.js` が生成されること
- `dist/types/auth.js` が生成されないこと（旧パス）

#### Step 9.2: desktop パッケージの型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

- 型チェックが PASS すること（エラー 0 件）

#### Step 9.3: 全テストの実行

```bash
cd packages/shared && pnpm vitest run
```

- Phase 4 で作成した全テスト（26 テスト）が PASS すること
- 既存テストも全て PASS すること

## 統合テスト連携

| 統合テスト観点                     | 確認方法                                      |
| ---------------------------------- | --------------------------------------------- |
| `shared` 変更の `desktop` 連携確認 | `pnpm --filter @repo/desktop typecheck`       |
| ビルド成果物の公開契約確認         | `pnpm --filter @repo/shared build` + dist確認 |
| 公開パス後方互換確認               | Phase 4 の `module-resolution.test.ts` 実行   |
| 4ファイル同期の回帰防止            | Phase 4 の `config-sync.test.ts` 実行         |
| 旧パス残存の回帰防止               | Phase 9 で grep 監査を実施                    |

## アーキテクチャ層別実装

| 層         | 実装ファイル                              | Task   |
| ---------- | ----------------------------------------- | ------ |
| ソース     | `src/types/auth.ts` (移動)                | Task 1 |
| ソース     | `src/types/api-keys.ts` (移動)            | Task 1 |
| ソース     | `src/types/common.ts` (移動)              | Task 1 |
| ソース     | `src/types/file-selection.ts` (移動)      | Task 1 |
| ソース     | `src/types/workflow.ts` (移動)            | Task 1 |
| ソース     | `src/types/index.ts` (更新)               | Task 2 |
| ビルド設定 | `package.json` (更新)                     | Task 3 |
| ビルド設定 | `tsup.config.ts` (更新)                   | Task 4 |
| ビルド設定 | `tsconfig.json` — shared (更新)           | Task 5 |
| ビルド設定 | `tsconfig.json` — desktop (更新)          | Task 6 |
| テスト     | `src/types/__tests__/auth.test.ts` (移動) | Task 1 |

## 設計変更記録

| 項目                                 | Phase 2 設計時 | Phase 5 実装時 | 変更理由 |
| ------------------------------------ | -------------- | -------------- | -------- |
| （実装時に変更が発生した場合に記録） |                |                |          |

## Pitfall 対策チェックリスト

| Pitfall ID | 対策                                                                          | 適用箇所        |
| ---------- | ----------------------------------------------------------------------------- | --------------- |
| P8         | 移動後のファイルが `package.json` の exports で正しく参照されていることを確認 | Task 3          |
| P11        | 大量編集後に `git diff --stat` で変更数を検証                                 | Task 1-8 完了後 |
| P23        | exports と typesVersions を同時に更新し、パスの整合性を確認                   | Task 3          |
| P32        | shared と desktop の設定を同時に更新（1つのコミットで）                       | Task 3, 5, 6    |

## 成果物

| 成果物         | パス                                                                                                                    | 説明                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 実装サマリー   | `docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-5/implementation-summary.md` | 実装ファイル一覧・変更内容 |
| 移行済みソース | `packages/shared/src/types/{auth,api-keys,common,file-selection,workflow}.ts`                                           | 移動された5ファイル        |
| 更新済み index | `packages/shared/src/types/index.ts`                                                                                    | 統合された re-export       |
| 更新済み設定   | `package.json`, `tsup.config.ts`, `tsconfig.json` ×2                                                                    | 4ファイル同期完了          |

## 完了条件

- [ ] 5ファイル（auth, api-keys, common, file-selection, workflow）が `src/types/` に移動済み
- [ ] `types/__tests__/auth.test.ts` が `src/types/__tests__/` に移動済み
- [ ] `src/types/index.ts` に旧 `types/index.ts` の re-export が統合済み
- [ ] `package.json` exports の全パスが `dist/src/types/` を参照
- [ ] `package.json` typesVersions の全パスが `./src/types/` を参照
- [ ] `tsup.config.ts` entry から旧パス `types/*.ts` が全て削除済み
- [ ] `tsup.config.ts` entry に `src/types/auth.ts`, `src/types/api-keys.ts` が追加済み
- [ ] `packages/shared/tsconfig.json` include から `types/**/*.ts` が削除済み（該当する場合）
- [ ] `apps/desktop/tsconfig.json` paths が `src/types/` を参照
- [ ] 旧 `types/` ディレクトリが完全に削除済み
- [ ] `pnpm --filter @repo/shared build` が成功
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件で PASS
- [ ] Phase 4 の全テスト（26 テスト）が PASS（Red → Green）
- [ ] 既存テストが全て PASS（回帰なし）

## TDD 検証コマンド

```bash
# Green 確認（全テスト PASS）
cd packages/shared && pnpm vitest run

# ビルド成果物検証
cd packages/shared && pnpm vitest run src/types/__tests__/build-artifacts.test.ts

# 設定同期検証
cd packages/shared && pnpm vitest run src/types/__tests__/config-sync.test.ts

# モジュール解決検証
cd packages/shared && pnpm vitest run src/types/__tests__/module-resolution.test.ts

# desktop 型チェック
pnpm --filter @repo/desktop typecheck
```

## 次の Phase

Phase 6（テスト拡充）へ進む。カバレッジ不足箇所を特定し、追加テストを作成する。
