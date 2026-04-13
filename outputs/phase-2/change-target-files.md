# Phase 2: 変更対象ファイル一覧

## タスクID: TASK-SW-FIX-FEEDBACK-001

| ファイルパス                                                         | 変更種別 | 変更概要                                                                                          |
| -------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | 修正     | `useFetchSkills` import追加・hook呼び出し・handleExecutePlan成功パスに `await fetchSkills()` 追加 |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | 修正     | `skillPath === null` アーリーリターン追加・エラーUI実装                                           |

## 変更行数サマリー

| ファイル                                  | 追加行数                            | 削除行数 |
| ----------------------------------------- | ----------------------------------- | -------- |
| SkillCreateWizard.tsx                     | +6 (import1 + hook1 + fetchSkills4) | 0        |
| CompleteStep.tsx                          | +27 (エラーUI)                      | 0        |
| SkillCreateWizard.test.tsx                | +22 (mock1 + TC-FEEDBACK-003)       | 0        |
| SkillCreateWizard.llm-generation.test.tsx | +90 (TC-FEEDBACK-001/002)           | 0        |
| CompleteStep.test.tsx                     | +90 (TC-FEEDBACK-004〜013)          | 0        |
