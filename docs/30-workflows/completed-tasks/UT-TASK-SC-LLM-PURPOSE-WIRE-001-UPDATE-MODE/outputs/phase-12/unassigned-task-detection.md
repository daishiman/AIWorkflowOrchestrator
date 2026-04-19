# Phase 12: 未タスク検出

## サマリー

2 件

## 検出一覧

| ID                                | 種別 | 内容                                      | 状態                 |
| --------------------------------- | ---- | ----------------------------------------- | -------------------- |
| `TASK-SC-UPDATE-SKILL-IMPL-001`   | 実装 | `runUpdateWorkflow` の実処理未実装        | 既存未タスクあり     |
| `TASK-SC-IMPROVE-PROMPT-IMPL-001` | 実装 | `runImprovePromptWorkflow` の実処理未実装 | 新規未タスク化が必要 |

## 監査範囲

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
- workflow root の Phase 1〜12 成果物

## 判定理由

- 今回の波では dispatch 修正を優先し、実ワークフロー本体は明示スタブのまま据え置いたため。
