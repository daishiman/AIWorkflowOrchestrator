# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| タスクID   | TASK-UI-03                                                |
| テスト分類 | NON_VISUAL                                                |
| 実施日     | 2026-04-06                                                |
| 主証跡     | `outputs/phase-11/screenshots/non-visual-placeholder.png` |

## チェックリスト

| TC-ID    | 観点                  | 実施内容                                                                                                                                                                             | 証跡予定                                                  | 状態    |
| -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------- |
| TC-11-01 | Session IPC 基本動作  | `startSession` / `sendAnswer` / `onQuestion` を確認する                                                                                                                              | `outputs/phase-11/screenshots/non-visual-placeholder.png` | planned |
| TC-11-02 | Runtime IPC 基本動作  | `planSkill` / `executePlan` / `getWorkflowState` / `submitUserInput` / `onWorkflowStateChanged` / `listSessions` / `getSessionDetail` / `resumeSession` / `deleteSession` を確認する | `outputs/phase-11/screenshots/non-visual-placeholder.png` | planned |
| TC-11-03 | 経路分離と重複なし    | Session / Runtime の呼び分けとハンドラー重複なしを確認する                                                                                                                           | `outputs/phase-11/screenshots/non-visual-placeholder.png` | planned |
| TC-11-04 | DevTools / 非視覚証跡 | Console ログ・grep・自動テスト代替証跡を確認する                                                                                                                                     | `outputs/phase-11/screenshots/non-visual-placeholder.png` | planned |

## 備考

- 本チェックリストは validator 互換の補助成果物であり、実画面のスクリーンショットを主張するものではない。
- `TASK-UI-03` の `UI` 文字列により画面証跡要求が推定されるため、placeholder PNG を 1 点だけ保持する。
