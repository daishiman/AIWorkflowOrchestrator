# Phase 4: Test Matrix

| ID   | 対象     | 観点                                                        | テストファイル                              | ステータス          |
| ---- | -------- | ----------------------------------------------------------- | ------------------------------------------- | ------------------- |
| T4-1 | shared   | `SkillCreatorUserInputKind` に `multi_select` が含まれる    | 型定義のため静的チェック                    | PASS                |
| T4-2 | engine   | `selectedOptionIds` が空配列/undefined なら fail            | SkillCreatorWorkflowEngine.test.ts          | PASS                |
| T4-3 | engine   | 未知 option id を含むと fail                                | SkillCreatorWorkflowEngine.test.ts          | PASS                |
| T4-4 | engine   | 既知 option id 配列なら pass                                | SkillCreatorWorkflowEngine.test.ts          | PASS                |
| T4-5 | renderer | checkbox 群が request options を描画する                    | SkillLifecyclePanel.llm-generation.test.tsx | PASS                |
| T4-6 | renderer | toggle 後に `selectedOptionIds` が submit payload へ入る    | SkillLifecyclePanel.llm-generation.test.tsx | PASS                |
| T4-7 | renderer | `multi_select` 未選択時は submit が disabled                | SkillLifecyclePanel.llm-generation.test.tsx | 実装済み / 未再実行 |
| T4-8 | renderer | request kind 切替時に `selectedOptionIds` が reset される   | SkillLifecyclePanel.llm-generation.test.tsx | 実装済み / 未再実行 |
| T4-9 | regress  | `single_select` / `free_text` / `secret` / `confirm` 非破壊 | 既存テスト群                                | 要再実行            |
