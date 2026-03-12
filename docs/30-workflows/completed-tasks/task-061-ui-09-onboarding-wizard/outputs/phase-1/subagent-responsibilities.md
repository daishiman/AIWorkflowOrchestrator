# SubAgent Responsibilities

| SubAgent | 主要入力 | 出力 | 実行順序 |
| --- | --- | --- | --- |
| A | 参照元タスク本文、App shell、aiworkflow resource map | requirements-definition, scope-definition | 1 |
| B | A の成果物、App.tsx、SettingsView、store handlers | component-architecture, state-and-persistence-design | 2 |
| C | A の成果物、SuggestionBubble、EmptyState、SkillCenter hook | navigation-and-surface-integration, traceability-matrix | 2 |
| D | B/C の成果物、task-workflow、quality requirements | design-review-result, review-findings | 3 |

## 並列ルール

- A は直列
- B と C は A 完了後に並列
- D は B/C 完了後に直列
