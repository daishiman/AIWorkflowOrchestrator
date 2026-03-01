# Phase 6: テスト拡充 — TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001

## メタ情報

| 項目       | 値                                        |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| 機能名     | packages/shared 型定義ディレクトリ統合    |
| タスク ID  | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 |
| 作成日     | 2026-02-28                                |
| 前提 Phase | Phase 5（実装）完了                       |
| 目的       | カバレッジ不足箇所のテスト追加            |

## 目的

Phase 5 の実装後にカバレッジを計測し、不足箇所を特定してテストを追加する。リファクタリングタスクのため、以下の観点に特化したテストを拡充する:

1. **エッジケーステスト**: 移行後のパスで循環参照や名前衝突がないことの検証
2. **回帰テスト**: 旧パスの完全な消去確認、プロジェクト全体での旧パス残存チェック
3. **ビルド成果物の完全性テスト**: 全移行ファイルの .js / .d.ts / .d.mts の生成確認
4. **re-export 型整合性テスト**: `src/types/index.ts` からの re-export が正しい型を公開していることの検証

## 実行タスク

- Task 1: カバレッジ計測と不足箇所の特定
- Task 2: エッジケーステスト追加
- Task 3: 回帰テスト追加
- Task 4: ビルド成果物の完全性テスト追加
- Task 5: re-export 型整合性テスト追加

## 参照資料

| 資料名           | パス                                                                                                    | 説明               |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| テスト仕様       | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-4-test-creation.md`                  | Phase 4 テスト一覧 |
| 実装サマリー     | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-5/implementation-summary.md` | Phase 5 実装内容   |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                                      | カバレッジ基準     |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                                    | P9, P40, P41       |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容                            |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------- |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 目標カバレッジ・テスト品質基準  |
| モノレポ構成       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`  | `shared`/`desktop` 間の依存整合 |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | テスト追加時の運用ルール        |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | 失敗系ケース追加時の分類基準    |

## 実行手順

### Task 1: カバレッジ計測と不足箇所の特定

#### Step 1.1: カバレッジ計測実行

```bash
cd packages/shared && pnpm vitest run --coverage src/types/
```

#### Step 1.2: カバレッジレポートの確認

以下の基準と照合:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

#### Step 1.3: 不足箇所の特定

ファイル別のカバレッジを確認し、基準未達のファイルをリストアップする。

### Task 2: エッジケーステスト追加

テストファイル: `packages/shared/src/types/__tests__/edge-cases.test.ts`

#### テストケース一覧

| No   | テスト項目                                                             | 期待結果                            |
| ---- | ---------------------------------------------------------------------- | ----------------------------------- |
| E-01 | `src/types/index.ts` が `types/` ディレクトリを参照していない          | 相対パスに `../types/` が含まれない |
| E-02 | `src/types/index.ts` の re-export で名前衝突が発生しない               | TypeScript コンパイルエラーなし     |
| E-03 | 移行後の5ファイルが相互参照する場合、循環参照が発生しない              | import が正常に解決される           |
| E-04 | `src/types/auth.ts` と既存の `src/types/auth-mode.ts` が名前衝突しない | 両ファイルの export シンボルが独立  |

### Task 3: 回帰テスト追加

テストファイル: `packages/shared/src/types/__tests__/regression.test.ts`

#### テストケース一覧

| No   | テスト項目                                                          | 期待結果                                        |
| ---- | ------------------------------------------------------------------- | ----------------------------------------------- |
| R-01 | プロジェクト全体で `from "../../types/auth"` の import が存在しない | 旧相対パスが残存していない                      |
| R-02 | `package.json` に `dist/types/auth` を含むパスが存在しない          | exports から旧パスが完全に除去                  |
| R-03 | `tsup.config.ts` に `"types/auth.ts"` エントリが存在しない          | 旧エントリが完全に除去                          |
| R-04 | `tsconfig.json`（desktop）の paths に旧パスが存在しない             | `../../packages/shared/types/` が残存していない |
| R-05 | `packages/shared/types/` ディレクトリが存在しない                   | 旧ディレクトリが完全に削除済み                  |
| R-06 | ソースコード全体で `@repo/shared` の import が引き続き動作する      | 公開パスが変更されていないことを確認            |

### Task 4: ビルド成果物の完全性テスト追加

テストファイル: `packages/shared/src/types/__tests__/build-artifacts.test.ts`（既存に追加）

#### テストケース一覧

| No   | テスト項目                                                 | 期待結果                    |
| ---- | ---------------------------------------------------------- | --------------------------- |
| D-15 | `dist/src/types/auth.d.mts` が存在する                     | ESM 型定義が生成される      |
| D-16 | `dist/src/types/common.d.ts` が存在する                    | 型定義ファイルが生成される  |
| D-17 | `dist/src/types/workflow.d.ts` が存在する                  | 型定義ファイルが生成される  |
| D-18 | `dist/src/types/file-selection.d.ts` が存在する            | 型定義ファイルが生成される  |
| D-19 | `dist/src/types/index.d.ts` の内容に auth の export を含む | 統合 index の型定義が正しい |

### Task 5: re-export 型整合性テスト追加

テストファイル: `packages/shared/src/types/__tests__/module-resolution.test.ts`（既存に追加）

#### テストケース一覧

| No   | テスト項目                                                      | 期待結果                                  |
| ---- | --------------------------------------------------------------- | ----------------------------------------- |
| M-06 | `@repo/shared/types` から auth 関連の型が export されている     | index の re-export に auth が含まれる     |
| M-07 | `@repo/shared/types` から workflow 関連の型が export されている | index の re-export に workflow が含まれる |
| M-08 | `@repo/shared/types` から common 関連の型が export されている   | index の re-export に common が含まれる   |

**Phase 6 追加テスト総数: 17 テスト**（E: 4, R: 6, D: 5, M: 3）

## 統合テスト連携【必須】

| 検証対象           | 検証方法                                    | Phase |
| ------------------ | ------------------------------------------- | ----- |
| 旧パス残存         | grep による全プロジェクト検索               | 6     |
| 循環参照           | TypeScript コンパイルによる検証             | 6     |
| re-export 整合性   | dynamic import + Object.keys 比較           | 6     |
| ビルド成果物完全性 | fs.existsSync + readFileSync による内容検証 | 6     |

## カバレッジ基準

### ユニットテストカバレッジ

| ファイル                      | Line 目標 | Branch 目標 | Function 目標 |
| ----------------------------- | --------- | ----------- | ------------- |
| `src/types/auth.ts`           | 90%+      | 70%+        | 90%+          |
| `src/types/api-keys.ts`       | 90%+      | 70%+        | 90%+          |
| `src/types/common.ts`         | 80%+      | 60%+        | 80%+          |
| `src/types/workflow.ts`       | 80%+      | 60%+        | 80%+          |
| `src/types/file-selection.ts` | 80%+      | 60%+        | 80%+          |
| `src/types/index.ts`          | 80%+      | 60%+        | 80%+          |

**注意**: 型定義ファイルはランタイムコードが少ないため、カバレッジの対象は主に enum / const / 関数定義となる。純粋な type/interface のみのファイルはカバレッジ計測対象外。

## Pitfall 対策チェックリスト

| Pitfall ID | 対策                                                  | 適用箇所        |
| ---------- | ----------------------------------------------------- | --------------- |
| P9         | テスト間で状態を共有しない — fs 操作は読み取りのみ    | build-artifacts |
| P40        | テスト実行は `cd packages/shared` から行う            | 全テスト        |
| P41        | v8 カバレッジプロバイダのインライン関数カウントに注意 | カバレッジ計測  |

## 成果物

| 成果物               | パス                                                                                                   | 説明                       |
| -------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| テスト拡充レポート   | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-6/test-expansion-report.md` | 追加テスト一覧・カバレッジ |
| エッジケーステスト   | `packages/shared/src/types/__tests__/edge-cases.test.ts`                                               | 4 テスト                   |
| 回帰テスト           | `packages/shared/src/types/__tests__/regression.test.ts`                                               | 6 テスト                   |
| ビルド成果物テスト   | `packages/shared/src/types/__tests__/build-artifacts.test.ts`（追加分）                                | 5 テスト追加               |
| モジュール解決テスト | `packages/shared/src/types/__tests__/module-resolution.test.ts`（追加分）                              | 3 テスト追加               |

## 完了条件

- [ ] カバレッジ計測を実行し、不足箇所を特定
- [ ] `edge-cases.test.ts` 作成完了 — 4 テスト
- [ ] `regression.test.ts` 作成完了 — 6 テスト
- [ ] `build-artifacts.test.ts` に 5 テスト追加
- [ ] `module-resolution.test.ts` に 3 テスト追加
- [ ] 追加した全テスト（17 テスト）が PASS
- [ ] Phase 4 の全テスト（26 テスト）が引き続き PASS
- [ ] テスト拡充レポートを `outputs/phase-6/test-expansion-report.md` に記録

## TDD 検証

```bash
# 全テスト実行（Phase 4 + Phase 6）
cd packages/shared && pnpm vitest run src/types/__tests__/

# カバレッジ計測
cd packages/shared && pnpm vitest run --coverage src/types/

# 回帰テスト単独実行
cd packages/shared && pnpm vitest run src/types/__tests__/regression.test.ts

# エッジケーステスト単独実行
cd packages/shared && pnpm vitest run src/types/__tests__/edge-cases.test.ts
```

## 次の Phase

Phase 7（カバレッジ確認）へ進む。カバレッジ基準の充足を最終確認する。
