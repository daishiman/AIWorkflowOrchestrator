# Phase 1: 要件定義

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 1                                 |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | なし                              |
| 後続Phase | Phase 2                           |

## 目的

create 主導線を 1 つに定義し、`SkillLifecyclePanel` / `SkillCreateWizard` / `SkillCenter` の責務境界を requirements レベルで固定する。

## 背景

現状は `SkillCenter` の CTA、`SkillCreateWizard` の standalone view、`SkillLifecyclePanel` の一気通し panel、`SkillManagementPanel` の advanced route が並存しており、
「通常ユーザーはどこから始めるべきか」が読み手ごとに揺れる。

Task05 はこの揺れをなくすため、
mainline を 1 本に絞りつつ、
secondary route と advanced route を消さずに序列化する。

## 受入基準

- AC-1: create の primary entry は `SkillCenter` の CTA 群に固定されている
- AC-2: `SkillCreateWizard` は create destination surface として整理されている
- AC-3: `SkillLifecyclePanel` / `SkillManagementPanel` は advanced / secondary route として定義されている
- AC-4: provenance / degrade warning は mainline summary と diagnostics の 2 段で整理されている
- AC-5: interaction bridge と awaiting input owner は Task04 の責務に残る
- AC-6: verify / improve / re-entry surface は Task06 の責務に残る
- AC-7: `setCurrentView` / `currentSkillName` / `viewHistory` の既存 state owner を増やさない

## 実行タスク

- current mainline / secondary / advanced route の棚卸し
- create 導線の正面入口と destination surface の定義
- source provenance / warning の表示境界定義
- Task04 / Task06 / Task07 との責務境界定義

## 参照資料

| 資料名         | パス                                                                                             | 説明                             |
| -------------- | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| task root      | `index.md`                                                                                       | Task05 の全体像                  |
| lane 要件草案  | `../skill-creator-agent-sdk-lane/requirements-draft.md`                                          | 主導線一本化の要求根拠           |
| Task03 index   | `../completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/index.md`          | provenance / degrade の upstream |
| Task03 Phase 2 | `../completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/phase-2-design.md` | provenance handoff 境界          |
| Task04 index   | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`           | interaction bridge の upstream   |
| executor guide | `../skill-creator-agent-sdk-lane/executor-guide.md`                                              | lane 全体の責務分離              |

### システム仕様（aiworkflow-requirements）

| 参照資料                        | パス                                                                                                           | 内容                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| ナビゲーションUI                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                        | Skill Center を一次導線入口とする正本               |
| routing / renderView foundation | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md` | `skillCreate` / `skillAnalysis` view の基盤         |
| created skill usage journey     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`    | create 後の use/improve handoff 正本                |
| state management core           | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                              | `setCurrentView` / `currentSkillName` の state 境界 |

### 現行コードアンカー

| ファイル                                                                  | 要件観点                                           |
| ------------------------------------------------------------------------- | -------------------------------------------------- |
| `apps/desktop/src/renderer/App.tsx`                                       | `skillCreate` shell route と advanced route の並存 |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | header CTA / journey CTA の入口責務                |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | create / use / improve handoff の store 操作       |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`        | create destination UI の実体                       |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | 一気通し create/execute/improve panel              |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`     | advanced route 側の create / lifecycle 分岐        |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | primary/secondary/advanced の言語契約              |

## 実行手順

### ステップ1: 現行入口を分類する

- `SkillCenter` の CTA は normal user 向け一次導線候補として扱う。
- `SkillCreateWizard` standalone view は destination surface として扱う。
- `SkillLifecyclePanel` / `SkillManagementPanel` は advanced / diagnostic route 候補として扱う。
- advanced route を残す理由は検証・診断・比較であり、通常入口の代替ではないと明記する。

### ステップ2: primary route を定義する

- create の通常開始点は `SkillCenter -> skillCreate` とする。
- `SkillCreateWizard` は create 導線の終着 UI であり、導線起点とは扱わない。
- `SkillCenter` から出る CTA は create / use / improve の job guide を表現し、create だけが Task05 の primary route 対象である。

### ステップ3: warning 境界を定義する

- Task03 の `source_conflict` / `structure_mismatch` は mainline に summary だけ表示する。
- candidate root 全列挙や raw diagnostics は secondary route または後続 task の diagnostics area へ逃がす。
- blocking と non-blocking を mainline 上で見分けられることを要件化する。

### ステップ4: downstream task との境界を定義する

- Task04 は interaction bridge と input surface を保持する。
- Task06 は verify / improve / apply / re-entry surface を保持する。
- Task07 は disclosure / governance / terminal handoff hardening を保持する。

## 統合テスト連携

- Phase 4 で create primary route、advanced route、warning summary、Task06 境界をテスト観点に変換する。
- `SkillCenterView.cta.test.tsx` と `useSkillCenter.navigation.test.ts` を基準に normal route の回帰観点を設計する。
- `App.renderView.viewtype.test.tsx` と `skillLifecycleJourney.test.ts` を基準に shell / contract 側の回帰観点を設計する。

## 成果物

| 成果物     | パス                                     | 内容                                                  |
| ---------- | ---------------------------------------- | ----------------------------------------------------- |
| 要件定義書 | `phase-1-requirements.md`                | create mainline の要件本文                            |
| 要件抽出表 | `outputs/phase-1/spec-extraction-map.md` | system spec / current code / Task05 decision の対応表 |

## 完了条件

- [ ] create の primary entry が 1 つに定義されている
- [ ] `SkillCreateWizard` と `SkillLifecyclePanel` の責務境界が書き分けられている
- [ ] provenance / warning の summary と diagnostics の境界が定義されている
- [ ] Task04 / Task06 / Task07 との責務境界が定義されている
- [ ] AC-1 から AC-7 が本文で具体化されている
- [ ] **本Phase内の全タスクを100%実行完了**
