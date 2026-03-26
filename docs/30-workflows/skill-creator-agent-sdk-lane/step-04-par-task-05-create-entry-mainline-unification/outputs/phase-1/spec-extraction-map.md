# Spec Extraction Map

## 概要

Task05 で固定する create mainline 契約を、
system spec source、current code anchor、Task05 の決定、downstream handoff の 4 軸で整理する。

## 一次結論

| 観点               | 結論                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 真の論点           | `SkillLifecyclePanel` と `SkillCreateWizard` を全部統合することではなく、通常ユーザーの create 開始点を 1 つにすること |
| 依存関係・責務境界 | provenance は Task03、interaction bridge は Task04、verify/improve は Task06、governance は Task07 へ残す              |
| 価値とコスト       | mainline の一本化は高価値だが、diagnostics や governance まで同時に閉じるのは高コスト                                  |
| 改善優先順位       | primary route -> destination surface -> advanced route 格下げ -> warning summary                                       |
| 4条件評価          | create 入口の説明責務だけに scope を絞ることで価値性・実現性・整合性・運用性を満たす                                   |

## 抽出表

| 論点                       | system spec source                                           | current code anchor                                              | Task05 の決定                                                                           | downstream handoff                            |
| -------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| create primary entry       | `ui-ux-navigation.md`                                        | `SkillCenterView/index.tsx`, `useSkillCenter.ts`                 | `Skill Center` の CTA 群を正面入口に固定する                                            | Task07 は disclosure hardening を担う         |
| create destination surface | `workflow-skill-lifecycle-routing-render-view-foundation.md` | `App.tsx`, `SkillCreateWizard.tsx`                               | `skillCreate` view 上の `SkillCreateWizard` を destination に固定する                   | Task06 は verify/improve destination を担う   |
| advanced route             | `skillLifecycleJourney.ts`, `ui-ux-navigation.md`            | `App.tsx`, `SkillManagementPanel.tsx`, `SkillLifecyclePanel.tsx` | advanced / diagnostic route として残し、通常入口の代替にしない                          | Task07 は advanced route の disclosure を担う |
| warning summary            | `Task03 phase-2-design`, `budget-degrade-matrix.md`          | `SkillCenterView`, `SkillLifecyclePanel`                         | `source_conflict` / `structure_mismatch` は mainline で summary のみ表示する            | Task07 / Task06 が diagnostics detail を担う  |
| interaction input          | `Task04 phase-2-design`                                      | `SkillLifecyclePanel.tsx`, `SkillCreateWizard.tsx`               | input bridge の owner は Task04 に残し、Task05 は表示面の入口だけ扱う                   | Task04 が input surface を担う                |
| verify / improve re-entry  | `workflow-skill-lifecycle-created-skill-usage-journey.md`    | `SkillLifecyclePanel.tsx`, `SkillAnalysisView`, `App.tsx`        | create mainline へ結果 surface を混ぜない                                               | Task06 が正式 surface を担う                  |
| state owner                | `arch-state-management-core.md`                              | `useAppStore`, `App.tsx`, `useSkillCenter.ts`                    | `setCurrentView` / `currentSkillName` / `viewHistory` を再利用し、新規 owner を作らない | Task02 / Task04 の owner 表を優先する         |

## Task05 で閉じる判断

- `SkillCenter` を normal user の create primary entry にする。
- `SkillCreateWizard` を destination surface として説明する。
- `SkillManagementPanel` / `SkillLifecyclePanel` は advanced route として残す。
- warning は summary と diagnostics に分離し、mainline では summary だけを扱う。

## 補助分析

### 因果ループ

- 強化ループ: create 入口が複数あるほど、説明とテスト観点が増え、Task06/07 との責務衝突が起こりやすくなる。
- バランスループ: primary route を 1 本化すると、advanced route を残しても通常操作の説明コストが下がる。

### 戦略仮説

- `SkillCenter` を入口、`skillCreate` を destination、`SkillManagementPanel` を advanced route と三層化した方が、UI を全面統合するより低コストで downstream 安定性が高い。
