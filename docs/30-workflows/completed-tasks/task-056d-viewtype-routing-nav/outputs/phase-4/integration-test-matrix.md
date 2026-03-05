# Phase 4 統合テストマトリクス（SubAgent-B）

| 観点         | 入力                              | 期待結果                          | 対象                             |
| ------------ | --------------------------------- | --------------------------------- | -------------------------------- |
| ViewType遷移 | `setCurrentView("workspace")`     | `currentView === "workspace"`     | `navigation.integration.test.ts` |
| ViewType遷移 | `setCurrentView("skillCenter")`   | `currentView === "skillCenter"`   | 同上                             |
| ViewType遷移 | `setCurrentView("historySearch")` | `currentView === "historySearch"` | 同上                             |
