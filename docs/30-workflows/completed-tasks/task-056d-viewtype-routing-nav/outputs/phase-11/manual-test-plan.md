# Phase 11 手動テスト計画（SubAgent-C）

## テストケース

| TC-ID    | 観点        | 手順                                 | 期待結果                 |
| -------- | ----------- | ------------------------------------ | ------------------------ |
| TC-11-01 | Desktopナビ | Dashboard表示後、Workspaceをクリック | Workspace画面に遷移      |
| TC-11-02 | Desktopナビ | WorkspaceからSkill Centerへ移動      | Skill Center画面に遷移   |
| TC-11-03 | Desktopナビ | Skill CenterからHistory Searchへ移動 | History Search画面に遷移 |
| TC-11-04 | Mobileナビ  | モバイル表示でHistory Searchをタップ | History Search画面に遷移 |
| TC-11-05 | Shortcut    | Cmd/Ctrl+1..8, Cmd/Ctrl+, を順に入力 | 各ビューへ遷移           |

## 実施方針

- 実画面をPlaywrightで撮影
- Apple HIG観点で視覚評価（情報階層・操作導線・タップ領域）

## 実施結果（2026-03-05）

| TC-ID    | 結果 | 備考                                                     |
| -------- | ---- | -------------------------------------------------------- |
| TC-11-01 | PASS | Dashboard->Workspace の導線と視覚階層は明瞭              |
| TC-11-02 | PASS | Workspace->Skill Center 遷移でアクティブ状態が維持される |
| TC-11-03 | PASS | Skill Center->History Search の遷移が再現可能            |
| TC-11-04 | PASS | Mobileレイアウトでもタップ導線が成立                     |
| TC-11-05 | PASS | Cmd/Ctrl ショートカットでViewType遷移が成立              |
