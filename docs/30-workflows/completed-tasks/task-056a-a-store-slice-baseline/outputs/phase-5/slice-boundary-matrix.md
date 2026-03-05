# Phase 5 境界マトリクス

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 5                                 |
| 実施日     | 2026-03-05                        |
| ステータス | completed                         |

## Boundary Matrix

| Domain        | 判定           | target                        | 理由                                                                   | handoffTask                              |
| ------------- | -------------- | ----------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| Notification  | new            | notificationSlice             | 通知履歴と未読数は画面横断で共有されるため独立ドメインとして管理する。 | task-056c-notification-history-domain.md |
| HistorySearch | new            | historySearchSlice            | 検索クエリ・結果・統計を一貫管理するため既存Sliceから分離する。        | task-056c-notification-history-domain.md |
| SkillCenter   | local-useState | SkillCenterView local state   | 詳細パネル開閉や削除確認は画面局所状態でありStore共有は不要である。    | task-056c-notification-history-domain.md |
| ViewType      | extend         | store/types.ts ViewType union | 画面遷移責務は既存 NavigationSlice が担うため型拡張で対応できる。      | task-056d-viewtype-routing-nav.md        |
| Workspace     | no-change      | workspaceSlice                | 既存 workspaceSlice がフォルダとファイル状態の責務を満たしている。     | task-056d-viewtype-routing-nav.md        |

## セレクタ規約要点

- 状態セレクタ: use{State}{Domain}
- アクションセレクタ: use{Verb}{Domain}
- ドメイン接尾辞必須: true
- 非推奨合成Hook: useLLMStore, useSkillStore, useAuthModeStore
