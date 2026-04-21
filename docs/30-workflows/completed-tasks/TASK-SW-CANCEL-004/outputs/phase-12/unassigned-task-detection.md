# Phase 12: Unassigned Task Detection

## タスクID: TASK-SW-CANCEL-004

## 検出された未タスク

### UT-CANCEL-004-01: createSkill AbortSignal サポート追加

| 項目     | 内容                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 内容     | `createSkill`（agentSlice.ts）に AbortSignal パラメータを追加し、Renderer local abort を store/action/API 契約まで通す     |
| 優先度   | 中                                                                                                                         |
| 影響範囲 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`、`apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` |
| 根拠     | Phase 5 Pattern B は local 初期化までで、`AbortSignal` の実生成 consumer wiring は未完成                                   |

## 関連タスク

- `docs/30-workflows/completed-tasks/TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001/`
  - Main/private workflow 側の abort 契約整理は完了
  - ただし renderer store の signal 引数問題は別論点として残る

## 判定

未タスク 1 件。現時点の IPC cancel 実用性はあるが、`AbortSignal` 契約の層間整合は未完のため別タスク管理が必要。
