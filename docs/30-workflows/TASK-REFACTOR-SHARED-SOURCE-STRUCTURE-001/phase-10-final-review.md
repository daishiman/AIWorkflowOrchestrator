# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| Phase名    | 最終レビュー（Final Review）              |
| タスクID   | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 |
| 前提Phase  | Phase 9（品質検証）                       |
| 後続Phase  | Phase 11（手動テスト）                    |
| ステータス | 未着手                                    |
| 作成日     | 2026-02-28                                |
| 機能名     | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 |

---

## 目的

`types/` → `src/types/` 移行の多角的品質・整合性を最終検証する。8つのレビュー観点から移行の完全性、後方互換性、4ファイル同期、Pitfall 対策を確認し、Phase 11（手動テスト）への進行可否を判定する。

## 背景

Phase 9（品質検証）で Lint・型チェック・テスト・ビルドの自動品質ゲートを通過した。本 Phase では、自動チェックでは検出できない観点（ディレクトリ構造の完全性、exports/typesVersions の意味的整合性、Pitfall 対策の実施状況）を人的レビューで検証する。移行タスクの性質上、以下の観点が特に重要:

1. 旧ディレクトリ（`types/`）が完全に削除されていること
2. 公開パス（`@repo/shared/types/auth` 等）が正しく解決されること
3. 4ファイル同期チェックリスト（package.json / tsconfig.json / vitest.config.ts / tsup.config.ts）が全て同期していること

---

## 実行タスク

### タスク1: 8項目レビュー実施

**目的**: 8つのレビュー観点から移行の品質と整合性を多角的に検証する。

**8項目レビュー観点テーブル**:

| #   | レビュー観点         | 確認内容                                                                                                | 確認方法                                                                                                                                       | 結果 | 指摘 |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | 完全性               | `packages/shared/types/` ディレクトリが完全に削除されていること                                         | `ls packages/shared/types/ 2>&1` → `No such file or directory`                                                                                 |      |      |
| 2   | 後方互換性           | 公開パス（`@repo/shared/types/auth` 等）が正しく解決されること                                          | `pnpm --filter @repo/desktop typecheck` で import エラーが 0 件                                                                                |      |      |
| 3   | 4ファイル同期        | package.json / tsconfig.json / vitest.config.ts / tsup.config.ts が全て `src/types/` を参照していること | 下記「4ファイル同期チェック」セクション参照                                                                                                    |      |      |
| 4   | exports 整合性       | `package.json` の exports に `dist/types/`（`src` なし）パスが残存していないこと                        | `grep -n "dist/types/" packages/shared/package.json \| grep -v "dist/src/types/"` → 0 件                                                       |      |      |
| 5   | typesVersions 整合性 | `package.json` の typesVersions に `./types/*.ts`（`src` なし）パスが残存していないこと                 | `grep -n '"./types/' packages/shared/package.json` のエントリーが全て `dist/src/types/` を参照                                                 |      |      |
| 6   | index.ts 統合        | 旧 `types/index.ts` の全 re-export が `src/types/index.ts` に含まれていること                           | Phase 5 実装サマリーの移行前 export リストと `src/types/index.ts` の比較                                                                       |      |      |
| 7   | テスト移行           | `types/__tests__/` のテストが全て `src/types/__tests__/` に移行されていること                           | `ls packages/shared/types/__tests__/ 2>&1` → `No such file or directory` かつ `ls packages/shared/src/types/__tests__/` でテストファイルが存在 |      |      |
| 8   | Pitfall 対策         | P8（幽霊依存）、P23（API 二重定義）、P32（型定義の二箇所同時更新）の対策が実施されていること            | 下記「Pitfall 対策チェック」セクション参照                                                                                                     |      |      |

---

### タスク2: 4ファイル同期チェック

**目的**: 移行に関わる4つの設定ファイルが全て同期しており、パス参照の不整合がないことを確認する。

**4ファイル同期チェックテーブル**:

| ファイル                         | 確認項目                                                                 | 確認コマンド / 方法                                                    | 期待結果                                               | 結果 |
| -------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------ | ---- |
| `packages/shared/package.json`   | exports の `./types/auth` が `dist/src/types/auth.js` を参照             | `grep -A 3 '"./types/auth"' packages/shared/package.json`              | `"import": "./dist/src/types/auth.js"` を含む          |      |
| `packages/shared/package.json`   | exports の `./types/api-keys` が `dist/src/types/api-keys.js` を参照     | `grep -A 3 '"./types/api-keys"' packages/shared/package.json`          | `"import": "./dist/src/types/api-keys.js"` を含む      |      |
| `apps/desktop/tsconfig.json`     | paths の `@repo/shared/types/auth` が `src/types/auth.ts` を参照         | `grep -A 1 '"@repo/shared/types/auth"' apps/desktop/tsconfig.json`     | `"../../packages/shared/src/types/auth.ts"` を含む     |      |
| `apps/desktop/tsconfig.json`     | paths の `@repo/shared/types/api-keys` が `src/types/api-keys.ts` を参照 | `grep -A 1 '"@repo/shared/types/api-keys"' apps/desktop/tsconfig.json` | `"../../packages/shared/src/types/api-keys.ts"` を含む |      |
| `apps/desktop/vitest.config.ts`  | alias の `@repo/shared/types/auth` が `src/types/auth.ts` を参照         | `grep "types/auth" apps/desktop/vitest.config.ts`                      | `packages/shared/src/types/auth.ts` を含む             |      |
| `apps/desktop/vitest.config.ts`  | alias の `@repo/shared/types/api-keys` が `src/types/api-keys.ts` を参照 | `grep "types/api-keys" apps/desktop/vitest.config.ts`                  | `packages/shared/src/types/api-keys.ts` を含む         |      |
| `packages/shared/tsup.config.ts` | entry に `src/types/auth.ts` が含まれること                              | `grep "types/auth" packages/shared/tsup.config.ts`                     | `src/types/auth.ts` を含む                             |      |
| `packages/shared/tsup.config.ts` | entry に `src/types/api-keys.ts` が含まれること                          | `grep "types/api-keys" packages/shared/tsup.config.ts`                 | `src/types/api-keys.ts` を含む                         |      |

---

### タスク3: Pitfall 対策チェック

**目的**: 本タスクに関連する既知の Pitfall（P8, P23, P32）の対策が実施されていることを確認する。

**Pitfall 対策チェックテーブル**:

| Pitfall | タイトル                           | 確認内容                                                                             | 確認方法                                                                         | 結果 |
| ------- | ---------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ---- |
| P8      | 幽霊依存                           | 移行後のファイルが `@repo/shared` の `package.json` に正しくエントリーされていること | `package.json` の `exports` フィールドに移行対象の全サブパスが定義されていること |      |
| P23     | API 二重定義の型管理複雑性         | 旧パス（`dist/types/`）と新パス（`dist/src/types/`）が同時に存在していないこと       | `dist/types/` ディレクトリが存在しないこと                                       |      |
| P32     | 型定義の二箇所同時更新必須         | `types/` と `src/types/` に同名ファイルが同時に存在していないこと（二重管理の解消）  | `types/` ディレクトリ自体が存在しないこと                                        |      |
| P11     | PostToolUse フックによる Edit 失敗 | リファクタリング後のファイル内容が Prettier/ESLint の自動修正と整合していること      | `pnpm lint` と `pnpm --filter @repo/shared typecheck` が Phase 9 で PASS 済み    |      |

---

### タスク4: index.ts 統合検証

**目的**: 旧 `types/index.ts` に存在した全ての re-export が、`src/types/index.ts` に正しく統合されていることを確認する。

**実行手順**:

1. Phase 5 実装サマリー（`outputs/phase-5/implementation-summary.md`）から、旧 `types/index.ts` の re-export リストを取得する
2. `packages/shared/src/types/index.ts` を開き、全ての re-export を確認する
3. 旧 re-export リストの全項目が新 index.ts に含まれていることを確認する

**統合検証テーブル**:

| 旧 types/index.ts の re-export     | src/types/index.ts に存在 | 備考 |
| ---------------------------------- | ------------------------- | ---- |
| `export * from "./auth"`           |                           |      |
| `export * from "./api-keys"`       |                           |      |
| `export * from "./common"`         |                           |      |
| `export * from "./file-selection"` |                           |      |
| `export * from "./workflow"`       |                           |      |

---

### タスク5: 最終判定

**目的**: 全レビュー観点の結果を総合し、Phase 11 への進行可否を判定する。

**判定基準テーブル**:

| 判定     | 基準                                                                                 | 対応                                               |
| -------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| PASS     | 全8項目のレビュー観点で問題なし                                                      | Phase 11 へ進行                                    |
| MINOR    | 軽微な指摘あり（機能影響なし、コードスタイル、ドキュメント不備）                     | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（パス解決の不整合、4ファイル同期の不備、テスト移行漏れ）              | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | 致命的な問題あり（旧ディレクトリが未削除、公開パスが壊れている、ビルド成果物が不正） | Phase 1 へ戻り要件再確認                           |

**戻り先決定基準テーブル**:

| 問題の種類       | 戻り先  | 理由                                   |
| ---------------- | ------- | -------------------------------------- |
| 要件の不足・誤り | Phase 1 | 要件定義からやり直す必要がある         |
| 設計の問題       | Phase 2 | アーキテクチャ・インターフェース再設計 |
| テスト設計の問題 | Phase 4 | テストケースの追加・修正が必要         |
| 実装の問題       | Phase 5 | コード修正が必要                       |
| カバレッジ不足   | Phase 6 | テスト拡充が必要                       |

**MINOR 判定時の対応手順**:

1. 指摘内容を一覧化する
2. 各指摘を未タスク仕様書に変換する:
   - `unassigned-task/` ディレクトリに指示書を作成する
   - `task-workflow.md` の残課題テーブルに登録する
   - 関連仕様書に参照リンクを追加する
3. 上記3ステップ全完了後、Phase 11 へ進行する
4. 「機能影響なし」であっても未タスク仕様書への変換は**省略不可**

**レビュー結果サマリーテーブル（テンプレート）**:

| #   | レビュー観点         | 判定                          | 指摘内容             |
| --- | -------------------- | ----------------------------- | -------------------- |
| 1   | 完全性               | PASS/FAIL                     | （指摘があれば記載） |
| 2   | 後方互換性           | PASS/FAIL                     | （指摘があれば記載） |
| 3   | 4ファイル同期        | PASS/FAIL                     | （指摘があれば記載） |
| 4   | exports 整合性       | PASS/FAIL                     | （指摘があれば記載） |
| 5   | typesVersions 整合性 | PASS/FAIL                     | （指摘があれば記載） |
| 6   | index.ts 統合        | PASS/FAIL                     | （指摘があれば記載） |
| 7   | テスト移行           | PASS/FAIL                     | （指摘があれば記載） |
| 8   | Pitfall 対策         | PASS/FAIL                     | （指摘があれば記載） |
| -   | **総合判定**         | **PASS/MINOR/MAJOR/CRITICAL** |                      |

---

## 参照資料

| 参照資料                         | パス                                                                                                    | 内容                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義                 | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-1-requirements.md`                   | 要件・受入基準の最終確認     |
| Phase 2 設計仕様                 | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-2-design.md`                         | 設計差分との照合             |
| Phase 5 実装サマリー             | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-5/implementation-summary.md` | 移行実装の詳細記録           |
| Phase 8 リファクタリングレポート | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-8/refactoring-report.md`     | リファクタリング実施結果     |
| Phase 9 品質検証結果             | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-9/quality-verification.md`   | 品質ゲート通過結果           |
| package.json                     | `packages/shared/package.json`                                                                          | exports/typesVersions 定義   |
| tsconfig.json (desktop)          | `apps/desktop/tsconfig.json`                                                                            | compilerOptions.paths 定義   |
| vitest.config.ts (desktop)       | `apps/desktop/vitest.config.ts`                                                                         | resolve.alias 定義           |
| tsup.config.ts                   | `packages/shared/tsup.config.ts`                                                                        | ビルドエントリーポイント定義 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                     |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------ |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | モノレポ構造の正本       |
| モノレポ構成       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | パッケージ間依存関係     |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                         | P8, P11, P23, P32 の詳細 |

---

## 統合テスト連携

| 統合テスト観点                 | 確認方法                                                       |
| ------------------------------ | -------------------------------------------------------------- |
| 公開パス後方互換の最終確認     | Phase 4/6 のモジュール解決テスト結果を最終レビューで確認       |
| 4ファイル同期の一貫性確認      | package.json / tsup / tsconfig / vitest の差分を相互照合       |
| `desktop` 消費側の回帰なし確認 | `pnpm --filter @repo/desktop typecheck` の結果を証跡として確認 |
| 旧パス残存ゼロの確認           | Phase 9 の grep 結果が 0 件であることを最終判定に反映          |
| MINOR 指摘の未タスク化連携     | 指摘内容を Phase 12 Task 4 の未タスク検出手順へ引き渡す        |

## 成果物

| 成果物           | パス                                                                                                  | 内容                  |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------- |
| 最終レビュー結果 | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-10/final-review-result.md` | 観点別判定 + 総合判定 |

---

## 完了条件

- [ ] レビュー観点1（完全性）: `types/` ディレクトリが完全に削除されていることを確認済み
- [ ] レビュー観点2（後方互換性）: 公開パスが正しく解決されることを確認済み
- [ ] レビュー観点3（4ファイル同期）: 4ファイル同期チェックテーブルの全項目が PASS
- [ ] レビュー観点4（exports 整合性）: exports に旧パスが残存していないことを確認済み
- [ ] レビュー観点5（typesVersions 整合性）: typesVersions に旧パスが残存していないことを確認済み
- [ ] レビュー観点6（index.ts 統合）: 旧 re-export が全て新 index.ts に含まれていることを確認済み
- [ ] レビュー観点7（テスト移行）: テストファイルが全て `src/types/__tests__/` に移行されていることを確認済み
- [ ] レビュー観点8（Pitfall 対策）: P8, P11, P23, P32 の対策が実施されていることを確認済み
- [ ] 4ファイル同期チェックテーブルの全8項目が確認済み
- [ ] Pitfall 対策チェックテーブルの全4項目が確認済み
- [ ] 最終判定（PASS/MINOR/MAJOR/CRITICAL）が記録されていること
- [ ] MINOR 判定の場合: 全指摘が未タスク仕様書に変換されていること（3ステップ全完了）
- [ ] 最終レビュー結果（`outputs/phase-10/final-review-result.md`）が作成されていること

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 10 ステータスを更新
- [ ] 最終レビュー結果の全セクションが記入済みであることを確認
- [ ] Phase 11 の前提条件が満たされていることを確認
- [ ] MINOR 指摘がある場合、未タスク仕様書への変換が3ステップ全完了していることを確認

---

## 依存関係

- **前提**: Phase 9（品質検証）が PASS で完了していること
- **後続**: Phase 11（手動テスト）で UI テスト・E2E シナリオ実行を実施

## 次のPhase

完了後、以下を実行:

```
docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-11-manual-test.md
```
