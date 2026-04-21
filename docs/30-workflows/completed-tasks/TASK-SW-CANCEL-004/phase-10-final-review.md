# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| Phase    | 10                                                                     |
| タスクID | TASK-SW-CANCEL-004                                                     |
| 前Phase  | [phase-9-quality-assurance.md](phase-9-quality-assurance.md)           |
| 次Phase  | [phase-11-manual-test.md](phase-11-manual-test.md)                     |
| 目的     | AC と phase evidence を最終確認し、blocker が 0 件であることを確認する |

## 目的

AC と phase evidence を最終確認し、blocker が 0 件であることを確認する。

## 実行タスク

### タスク1: 受入基準最終確認

**目的**: AC-1〜AC-8 の pass/fail を最終判定する。

**実行手順**:

1. AC-1〜AC-8 を確認する。
2. Phase 1〜9 の evidence と照合する。
3. blocker 有無を確定する。

**期待される成果物**:

- 最終レビュー結果
- blocker 判定

### タスク2: 次Phase 進行可否の判断

**目的**: Phase 11 に進めるか、どの Phase へ戻るべきかを明示する。

**実行手順**:

1. evidence 欠落有無を確認する。
2. Blocker 判定表に基づいて進行可否を決める。

**期待される成果物**:

- 進行判断

## 受入基準の最終確認

| AC   | 基準                                                                                                    | 確認状態 |
| ---- | ------------------------------------------------------------------------------------------------------- | -------- |
| AC-1 | `useCancelGeneration.cancelGeneration()` が `window.skillCreatorAPI.cancelGeneration()` を呼び出す      | [ ]      |
| AC-2 | `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` に含まれており safeInvoke でブロックされない        | [ ]      |
| AC-3 | `preload/index.ts` で `skillCreatorAPI` が `window.skillCreatorAPI` として contextBridge 公開されている | [ ]      |
| AC-4 | `SkillCreateWizard.tsx` のキャンセルボタンが `useCancelGeneration.cancelGeneration()` に正しくバインド  | [ ]      |
| AC-5 | `startGeneration()` が返す `AbortSignal` が consumer に渡されている（または修正済み）                   | [ ]      |
| AC-6 | CANCEL-001〜004 チェーン全体の E2E フローが文書化されている                                             | [ ]      |
| AC-7 | `pnpm --filter @repo/desktop test` が全 pass                                                            | [ ]      |
| AC-8 | `pnpm --filter @repo/desktop typecheck` が通る                                                          | [ ]      |

## Phase evidence 確認

| Phase | 主要成果物                                                            | 確認状態 |
| ----- | --------------------------------------------------------------------- | -------- |
| 1     | `outputs/phase-1/requirements-definition.md` が存在する               | [ ]      |
| 2     | `outputs/phase-2/solution-design.md` が存在する                       | [ ]      |
| 3     | `outputs/phase-3/design-review-result.md` が存在する（PASS 判定あり） | [ ]      |
| 4     | `outputs/phase-4/test-scenarios.md` が存在する                        | [ ]      |
| 5     | `outputs/phase-5/implementation-summary.md` が存在する                | [ ]      |
| 6     | `outputs/phase-6/edge-case-expansion-plan.md` が存在する              | [ ]      |
| 7     | `outputs/phase-7/coverage-report.md` が存在し 80% 以上を示す          | [ ]      |
| 8     | `outputs/phase-8/refactor-decision-log.md` が存在する                 | [ ]      |
| 9     | `outputs/phase-9/quality-gate-report.md` が存在し全 pass を示す       | [ ]      |

## Blocker 判定

| 判定         | 条件                                     | 次のアクション            |
| ------------ | ---------------------------------------- | ------------------------- |
| Blocker なし | 全 AC が pass、全 phase evidence あり    | Phase 11 へ進む           |
| Blocker あり | 1 件以上 AC が fail または evidence 欠如 | 該当 Phase に戻り修正する |

## 参照資料

- `docs/30-workflows/TASK-SW-CANCEL-004/phase-1-requirements.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/phase-9-quality-assurance.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/artifacts.json`

## 成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` |

## 統合テスト連携

- AC-7 / AC-8 は Phase 9 の typecheck / test 結果を根拠に最終判定する。
- Blocker がある場合は対象 Phase に戻し、手動テストへ進ませない。

## 完了条件

- [ ] AC-1〜AC-8 が全 pass であることが確認されている
- [ ] Phase 1〜9 の主要成果物が全て存在することが確認されている
- [ ] Blocker が 0 件であることが明記されている
- [ ] Phase 11 に進む承認が記録されている
