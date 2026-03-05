# Phase 2 ルーティング分岐設計（SubAgent-A）

## 分岐責務

- `App.tsx#renderView()` が ViewType -> View Component を1対1で解決
- default節で `const _exhaustive: never = currentView` により網羅漏れ検知

## Viewマッピング

| ViewType                   | Component           |
| -------------------------- | ------------------- |
| dashboard                  | `DashboardView`     |
| workspace                  | `WorkspaceView`     |
| editor                     | `EditorView`        |
| chat                       | `ChatView`          |
| graph                      | `GraphView`         |
| agent                      | `AgentView`         |
| skillCenter / skill-center | `SkillCenterView`   |
| historySearch              | `HistorySearchView` |
| settings                   | `SettingsView`      |
