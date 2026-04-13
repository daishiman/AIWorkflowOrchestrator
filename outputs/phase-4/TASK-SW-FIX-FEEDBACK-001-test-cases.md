# Phase 4: テストケース定義書

## タスクID: TASK-SW-FIX-FEEDBACK-001

## TC-FEEDBACK-001〜007 一覧

| TC番号          | 対応AC | ファイル                                  | 内容                                                                  | 結果  |
| --------------- | ------ | ----------------------------------------- | --------------------------------------------------------------------- | ----- |
| TC-FEEDBACK-001 | AC-1   | SkillCreateWizard.llm-generation.test.tsx | LLMモード executePlan 成功時に fetchSkills が1回呼ばれる              | GREEN |
| TC-FEEDBACK-002 | AC-1   | SkillCreateWizard.llm-generation.test.tsx | LLMモード executePlan 失敗時に fetchSkills は呼ばれない               | GREEN |
| TC-FEEDBACK-003 | AC-2   | SkillCreateWizard.test.tsx                | templateモード成功時、コンポーネントレベルの fetchSkills は呼ばれない | GREEN |
| TC-FEEDBACK-004 | AC-3   | CompleteStep.test.tsx                     | skillPath=null の場合エラーメッセージが表示される                     | GREEN |
| TC-FEEDBACK-005 | AC-4   | CompleteStep.test.tsx                     | skillPath=null の場合成功ヘッダーが表示されない                       | GREEN |
| TC-FEEDBACK-006 | AC-5   | CompleteStep.test.tsx                     | skillPath が正常値の場合成功ヘッダーが表示される                      | GREEN |
| TC-FEEDBACK-007 | AC-5   | CompleteStep.test.tsx                     | skillPath が正常値の場合エラーボタンが表示されない                    | GREEN |
