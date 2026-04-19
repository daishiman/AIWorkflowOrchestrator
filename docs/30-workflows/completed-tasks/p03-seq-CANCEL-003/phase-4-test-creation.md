# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 4                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 3                           |
| 後続Phase  | Phase 5                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

既実装差分確認を固定するための targeted test と command suite を設計し、不足テストが見つかった場合は追加対象を明示する。

## 背景

この task は既実装が存在する前提で進むため、純粋な RED 作成フェーズではない。Phase 4 では「既存実装が仕様を満たしているか」を確認するための最小テストセットを定義し、実装 drift があれば Phase 5 で補修する。

## 実行タスク

### タスク0: 依存関係 sanity check

**目的**: テスト以前に build/test 基盤のズレを除外する。

**実行手順**:

1. `pnpm install` 済みであることを確認する。
2. `@repo/shared` のビルド成果物が未生成なら `pnpm --filter @repo/shared build` を実行する。
3. desktop package で targeted vitest が実行可能か確認する。

**期待される成果物**:

- `outputs/phase-4/test-design.md`

### タスク1: targeted test matrix 設計

**目的**: AC-1〜AC-6 をテストケースへ落とし込む。

**実行手順**:

1. `SkillCreatorService-cancel.test.ts` に abort/reset/null-safe の観点を割り当てる。
2. `skillCreatorHandlers-cancel.test.ts` に register/unregister/delegation の観点を割り当てる。
3. private state を確認する場合は `(facade as unknown as FacadePrivate)` または同等の private access 方針を明記する。
4. `startGeneration()` の `AbortSignal` consumer はコードテストではなく調査記録として分離する。

**期待される成果物**:

- `outputs/phase-4/test-design.md`

### タスク2: command suite 固定

**目的**: RED/GREEN ではなく targeted regression の判定手順を固定する。

**実行手順**:

1. service test、handler test、`typecheck` の3系統コマンドを定義する。
2. `lint` と関連既存テストを command suite に含める。
3. PASS 基準と mismatch 時の Phase 5 補修条件を明記する。

**期待される成果物**:

- `outputs/phase-4/test-design.md`

## 参照資料

| 参照資料                    | パス                                                           | 内容               |
| --------------------------- | -------------------------------------------------------------- | ------------------ |
| Phase 1 仕様                | `docs/30-workflows/p03-seq-CANCEL-003/phase-1-requirements.md` | AC と taskType     |
| Phase 2 仕様                | `docs/30-workflows/p03-seq-CANCEL-003/phase-2-design.md`       | 差分確認設計       |
| service 実装                | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`  | テスト対象         |
| handler 実装                | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`            | テスト対象         |
| existing test pattern       | `apps/desktop/src/main/ipc/__tests__/`                         | モックパターン確認 |
| 要件定義書                  | `outputs/phase-1/requirements-definition.md`                   | Phase 1 成果物     |
| 受け入れ基準                | `outputs/phase-1/acceptance-criteria.md`                       | Phase 1 成果物     |
| AbortSignal利用調査レポート | `outputs/phase-1/abort-signal-usage-report.md`                 | Phase 1 成果物     |
| 設計レビュー結果            | `outputs/phase-3/gate-decision.md`                             | Phase 3 成果物     |
| 差分確認設計                | `outputs/phase-2/design.md`                                    | Phase 2 成果物     |

## 成果物

| 成果物                          | パス                                                                                | 内容                       |
| ------------------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| テスト設計                      | `outputs/phase-4/test-design.md`                                                    | TC一覧、コマンド、判定基準 |
| SkillCreatorService 回帰テスト  | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` | targeted test              |
| skillCreatorHandlers 回帰テスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`           | targeted test              |

## 統合テスト連携【必須】

| 判定項目                                                       | 基準 | 結果    |
| -------------------------------------------------------------- | ---- | ------- |
| AC-1〜AC-6 に対応する test matrix がある                       | 完了 | pending |
| targeted command suite が定義されている                        | 完了 | pending |
| private access 方針と dependency sanity check が明記されている | 完了 | pending |

## 完了条件

- [ ] dependency sanity check 手順を定義している
- [ ] test matrix を定義している
- [ ] targeted command suite を定義している
- [ ] mismatch 時の補修条件を明記している
