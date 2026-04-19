# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 7                           |
| 後続Phase  | Phase 9                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

cancel 系の drift を減らす範囲で、命名、重複、register/unregister の対称性を整える。

## 背景

この Phase の目的は見た目の整理ではなく、後続 task で再発しやすい drift を減らすことにある。リファクタリングは targeted regression を壊さない最小差分に限定する。

## 実行タスク

### タスク0: 重複と drift の確認

**目的**: cancel 系の重複記述や naming drift を把握する。

**実行手順**:

1. `SKILL_CREATOR_CANCEL` の登録箇所と解除箇所を対で確認する。
2. `currentAbortController` 管理が他の progress/state 管理と衝突していないか確認する。
3. 補助ロジックに重複があれば記録する。

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

### タスク1: 最小リファクタリング

**目的**: 仕様を変えずに読みやすさと保守性を上げる。

**実行手順**:

1. 命名揺れ、責務の近接、register/unregister の見通しを改善する。
2. 変更は `対象 / Before / After / 理由` で記録する。
3. 変更後に targeted regression を再実行する。

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

## 参照資料

| 参照資料                        | パス                                                          | 内容                       |
| ------------------------------- | ------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義                | `outputs/phase-1/requirements-definition.md`                  | AC と taskType             |
| Phase 2 差分確認設計            | `outputs/phase-2/design.md`                                   | 責務境界と補修条件         |
| Phase 5 差分確認                | `outputs/phase-5/implementation-summary.md`                   | mismatch 一覧              |
| Phase 6 テスト拡充記録          | `outputs/phase-6/test-expansion-record.md`                    | drift しやすい観点         |
| Phase 7 カバレッジ              | `outputs/phase-7/coverage-report.md`                          | drift 候補                 |
| handler 実装                    | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           | register/unregister 対称性 |
| SkillCreatorService実装確認対象 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | Phase 5 成果物             |

## 成果物

| 成果物               | パス                                 | 内容                                              |
| -------------------- | ------------------------------------ | ------------------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | `対象 / Before / After / 理由` と regression 結果 |

## 統合テスト連携【必須】

| 判定項目                                                   | 基準 | 結果    |
| ---------------------------------------------------------- | ---- | ------- |
| drift 候補が整理されている                                 | 完了 | pending |
| 変更内容が `対象 / Before / After / 理由` で記録されている | 完了 | pending |
| regression 再実行結果がある                                | 完了 | pending |

## 完了条件

- [ ] drift 候補を整理している
- [ ] 最小リファクタリング方針を記録している
- [ ] 変更がある場合は `対象 / Before / After / 理由` を記録している
- [ ] regression 結果を残している
