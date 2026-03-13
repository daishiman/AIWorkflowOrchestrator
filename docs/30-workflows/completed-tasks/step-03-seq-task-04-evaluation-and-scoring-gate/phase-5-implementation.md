# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | 実装                            |
| タスクID   | TASK-SKILL-LIFECYCLE-04         |
| 前提Phase  | Phase 4（テスト作成）           |
| 後続Phase  | Phase 6（テスト拡充）           |
| ステータス | completed                       |
| 作成日     | 2026-03-12                      |
| 機能名     | skill-lifecycle-evaluation-gate |

## 目的

設計済みの評価モデルを shared type、store、Task03 surface、Task05 usage surface に実装し、既存の lifecycle 導線へ評価ゲートを組み込む。

## 実行タスク

- shared type 実装: 評価 snapshot と gate decision の型を shared 層へ追加する
- renderer state 実装: `skillEvaluationSlice` と selector を追加し、Task03 / Task05 から参照可能にする
- lifecycle UI 実装: `SkillLifecyclePanel` `SkillAnalysisView` `ScoreDisplay` へ gate summary と delta 表示を追加する
- usage handoff 実装: Task05 usage surface が最新評価と再評価 action を参照できるよう接続する
- security block 実装: hard block を UI 表示だけでなく判定ロジックへ組み込み、bypass 不可にする

## 参照資料

| 参照資料              | パス                                                                                                        | 説明                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 4 テスト計画    | `phase-4-test-creation.md`                                                                                  | 実装の合格条件             |
| unit test plan        | `outputs/phase-4/unit-test-plan.md`                                                                         | pure function / store 要件 |
| integration test plan | `outputs/phase-4/integration-test-plan.md`                                                                  | handoff 要件               |
| gate engine 設計      | `outputs/phase-2/gate-decision-design.md`                                                                   | 実装する判定仕様           |
| state 設計            | `outputs/phase-2/state-management-design.md`                                                                | slice 境界                 |
| lifecycle panel       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                        | Task03 統合先              |
| analysis view         | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                                          | 分析面の統合先             |
| score display         | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`                                               | 視覚閾値の再利用先         |
| agent slice           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                      | 現行 skill lifecycle state |
| Task05 設計           | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md` | usage surface 接続先       |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                                  |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `window.electronAPI.skill` の統一前提 |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | slice 追加時の責務境界                |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | Task03 IPC 契約                       |
| security-skill-execution   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`   | permission 境界                       |

## 実行手順

### ステップ1: shared type と gate engine を実装する

shared 型と pure function 群を追加し、テストで Red を Green にする。

### ステップ2: store と selector を実装する

`skillEvaluationSlice` を追加し、Task03 / Task05 から参照する selector を実装する。

### ステップ3: Task03 surface を更新する

`SkillLifecyclePanel` `SkillAnalysisView` `ScoreDisplay` に gate 表示と delta 表示を追加する。

### ステップ4: Task05 usage surface を接続する

Task05 側で最新評価、warning、再評価 action を表示し、Task04 state を再利用する。

## 統合テスト連携

| 観点     | 実装時に維持する内容                                                     |
| -------- | ------------------------------------------------------------------------ |
| API接続  | 既存 `skill:*` `skillCreator:*` を再利用し、新規 direct IPC を増やさない |
| state    | `agentSlice` と `skillEvaluationSlice` の責務を混線させない              |
| UI       | warning / recommended の表現を Task03 / Task05 で揃える                  |
| security | hard block を UI だけで解除できない                                      |

## 成果物

| 成果物           | パス                                        | 内容                 |
| ---------------- | ------------------------------------------- | -------------------- |
| 実装計画         | `outputs/phase-5/implementation-plan.md`    | 実装順序と責務分離   |
| touch point 一覧 | `outputs/phase-5/component-touch-points.md` | 更新対象ファイル一覧 |

## 完了条件

- [x] shared type と gate engine が実装されている
- [x] `skillEvaluationSlice` と selector が実装されている
- [x] Task03 surface に gate summary が表示される
- [x] Task05 usage surface が最新評価を再利用できる
- [x] hard block が bypass 不可である
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 6: テスト拡充](./phase-6-test-expansion.md) に進む
