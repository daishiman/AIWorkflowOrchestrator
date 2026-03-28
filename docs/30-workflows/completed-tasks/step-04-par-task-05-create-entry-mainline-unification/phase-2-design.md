# Phase 2: 設計

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 2                                 |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | Phase 1                           |
| 後続Phase | Phase 3                           |

## 目的

primary route、secondary route、advanced route、warning summary の配置を UI / navigation / state handoff の設計へ落とし込む。

## 実行タスク

- mainline / secondary / advanced の surface matrix を設計する
- `SkillCenter -> skillCreate` handoff の navigation 契約を設計する
- provenance / degrade warning の表示位置と粒度を設計する
- Task06 / Task07 との境界を設計する

## 参照資料

| 資料名               | パス                                                                                                    | 説明                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1 要件         | `phase-1-requirements.md`                                                                               | mainline requirements                 |
| Phase 1 抽出表       | `outputs/phase-1/spec-extraction-map.md`                                                                | spec / code の論点抽出                |
| Task03 Phase 2       | `../step-03-par-task-03-context-budget-and-resource-selection/phase-2-design.md`                        | provenance handoff                    |
| Task03 budget matrix | `../step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-2/budget-degrade-matrix.md` | warning trigger 種別                  |
| Task04 Phase 2       | `../step-03-par-task-04-user-interaction-bridge-and-phase-ui/phase-2-design.md`                         | interaction 入力と warning 表示の分離 |
| Task06 index         | `../../step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md`                               | verify / improve 側の責務境界         |

### システム仕様（aiworkflow-requirements）

| 参照資料                        | パス                                                                                                           | 内容                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ナビゲーションUI                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                        | Skill Center を一次入口とする domain UI 正本                         |
| routing / renderView foundation | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md` | `skillCreate` / `skillAnalysis` の shell contract                    |
| state management core           | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                              | `setCurrentView` / `currentSkillName` / `viewHistory` の state owner |
| created skill usage journey     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`    | create 後の use / improve downstream                                 |

### 現行コードアンカー

| ファイル                                                                  | 設計観点                                            |
| ------------------------------------------------------------------------- | --------------------------------------------------- |
| `apps/desktop/src/renderer/App.tsx`                                       | `skillCreate` route、advanced routes、close 先      |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | header CTA、journey CTA、ownership board            |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | `navigateToSkillCreate` と current skill handoff    |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`        | destination UI と `onClose`                         |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | advanced route 側の create/execute/improve 一気通し |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`     | `create` / `lifecycle` の local view 分岐           |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | job guide、advanced route、surface responsibility   |

## 実行手順

### ステップ1: surface matrix を作る

- `SkillCenter` を primary entry surface とし、header CTA と journey CTA を mainline trigger に分類する。
- `skillCreate` view は destination surface とし、設定・生成・完了のフローを閉じる。
- `SkillLifecyclePanel` / `SkillManagementPanel` は advanced route とし、診断・比較・旧導線確認に限定する。

### ステップ2: navigation/handoff を設計する

- create handoff は `setCurrentView("skillCreate")` だけを最小経路とする。
- current skill 名が必要な analyze/edit handoff は `SkillCenterView` detail panel 側に残し、Task05 の create 導線へ混ぜない。
- `onClose` は `skillCenter` へ戻ることを正本とする。

### ステップ3: warning summary を設計する

- `source_conflict` は mainline で「複数候補から選定した」summary を出す。
- `structure_mismatch` は blocking / non-blocking を mainline で見分ける。
- root list や rejected root list の詳細は advanced route または diagnostics area へ出す。

### ステップ4: 並列 task 境界を設計する

- Task05 は create entry の説明責務だけを持つ。
- Task06 は verify / improve 結果表示と再入場導線を持つ。
- Task07 は terminal handoff / disclosure / approval の hardening を持つ。

## 統合テスト連携

- Phase 4 で `SkillCenterView.cta.test.tsx` と `useSkillCenter.navigation.test.ts` を create mainline 回帰の基準にする。
- `App.renderView.viewtype.test.tsx` と `skillLifecycleJourney.test.ts` を shell / contract の回帰に使う。
- `SkillManagementPanel.integration.test.tsx` と `SkillLifecyclePanel.test.tsx` は advanced route が primary route を奪わないことの回帰に使う。

## 成果物

| 成果物         | パス                                          | 内容                                        |
| -------------- | --------------------------------------------- | ------------------------------------------- |
| 設計書         | `phase-2-design.md`                           | mainline / secondary / advanced 設計本文    |
| 境界マトリクス | `outputs/phase-2/mainline-boundary-matrix.md` | surface / navigation / warning 配置の設計表 |

## 完了条件

- [ ] mainline / secondary / advanced の境界が surface 単位で定義されている
- [ ] `SkillCenter -> skillCreate` handoff が最小契約で定義されている
- [ ] warning summary と diagnostics の配置が定義されている
- [ ] Task06 / Task07 との境界が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
