# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 6                                 |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | Phase 5                           |
| 後続Phase | Phase 7                           |

## 目的

double entry、legacy route、warning edge case、Task06 並列時の衝突回避を追加テスト観点として補う。

## 実行タスク

- mainline / advanced route の二重入口 edge case を補う
- close / back / legacy alias の edge case を補う
- warning summary の blocking / non-blocking edge case を補う
- Task06 並列時の責務衝突 edge case を補う

## 参照資料

| 資料名               | パス                                                                                                    | 説明                 |
| -------------------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 4 test matrix  | `outputs/phase-4/test-matrix.md`                                                                        | ベーステスト観点     |
| routing foundation   | `../../step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md`                               | 並列 task の境界確認 |
| Task03 budget matrix | `../step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-2/budget-degrade-matrix.md` | warning trigger      |

## 実行手順

- advanced route 直開き時に primary route の説明が崩れないケースを追加する。
- `skill-center` legacy alias を canonical `skillCenter` へ正規化したうえで create へ進めるケースを追加する。
- `source_conflict` / `structure_mismatch` が summary へ昇格する条件を追加する。
- Task06 の improve CTA や result surface を Task05 側テストへ持ち込まない negative case を追加する。

## 統合テスト連携

- `skillLifecycleJourney.test.ts` で advanced route と alias 契約を補う。
- `App.renderView.viewtype.test.tsx` で close/back と canonicalization の回帰を補う。
- `SkillLifecyclePanel.test.tsx` と `SkillManagementPanel.integration.test.tsx` で advanced route の挙動を補う。

## 成果物

| 成果物         | パス                        | 内容             |
| -------------- | --------------------------- | ---------------- |
| テスト拡充計画 | `phase-6-test-expansion.md` | edge case の追補 |

## 完了条件

- [ ] 二重入口の edge case が列挙されている
- [ ] close / back / alias の edge case が列挙されている
- [ ] warning summary の edge case が列挙されている
- [ ] Task06 並列時の衝突回避ケースが列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**
