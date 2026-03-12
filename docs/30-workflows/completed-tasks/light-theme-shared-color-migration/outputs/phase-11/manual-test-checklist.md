# Phase 11 Output: Manual Test Checklist

## 実施前チェック

| 項目   | 内容                                                             | 結果 |
| ------ | ---------------------------------------------------------------- | ---- |
| PRE-01 | current worktree 上で Phase 4〜10 のテスト証跡が揃っている       | PASS |
| PRE-02 | capture source を current worktree の Vite dev server に固定する | PASS |
| PRE-03 | stale screenshot を採用しない                                    | PASS |
| PRE-04 | Light theme primary, Dark theme smoke の 2 theme 証跡を残す      | PASS |

## テストケース

| テストケース | 対象                 | 状態            | 期待結果                                             |
| ------------ | -------------------- | --------------- | ---------------------------------------------------- |
| TC-01        | ThemeSelector        | light selected  | semantic token の selected/unselected state が明確   |
| TC-02        | AuthModeSelector     | invalid warning | warning token でも label / helper が読める           |
| TC-03        | AuthKeySection       | saved           | badge / input / CTA が light theme で潰れない        |
| TC-04        | AccountSection       | authenticated   | profile card / provider row / danger action が読める |
| TC-05        | AccountSection       | delete dialog   | modal overlay と danger CTA の hierarchy が自然      |
| TC-06        | ApiKeysSection       | provider list   | badge / row / note の contrast が保たれる            |
| TC-07        | ApiKeysSection       | delete dialog   | dialog の danger state が明瞭                        |
| TC-08        | AuthView             | error           | login card と error banner が重ならない              |
| TC-09        | WorkspaceSearchPanel | success         | result list / highlight / counter が視認できる       |
| TC-10        | WorkspaceSearchPanel | error           | error banner と input border が区別できる            |
| TC-11        | SettingsView         | shell           | section hierarchy と余白が安定                       |
| TC-12        | DashboardView        | light           | representative shell に回帰なし                      |
| TC-13        | DashboardView        | dark            | dark smoke に破綻なし                                |
