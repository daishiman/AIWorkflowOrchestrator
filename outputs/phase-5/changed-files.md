# Phase 5: 変更ファイル一覧

| ファイル                                                                                         | 変更種別 | 内容                                                          |
| ------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | 修正     | 旧 TASK-SC-07 ハンドラ削除、Step 0/2 レンダリング修正         |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | 修正     | inferSmartDefaults / STEPS 単体テスト追加、インポート更新     |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 修正     | TASK-SC-07 テストを describe.skip に変更（TODO コメント付き） |
