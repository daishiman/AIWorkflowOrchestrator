# Phase 4 テストケース

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 作成日: 2026-02-25
- 担当: SubAgent-C

| TC-ID  | 区分 | 内容                              | 期待結果                                 |
| ------ | ---- | --------------------------------- | ---------------------------------------- |
| TC-001 | 正常 | `ThemeMode` 4値の受け入れ         | 4値のみ許可                              |
| TC-002 | 正常 | `setThemeMode(light)`             | `themeMode=light`, `resolvedTheme=light` |
| TC-003 | 正常 | `setThemeMode(dark)`              | `themeMode=dark`, `resolvedTheme=dark`   |
| TC-004 | 正常 | `setThemeMode(kanagawa-dragon)`   | 両stateがkanagawa-dragon                 |
| TC-005 | 正常 | `setThemeMode(system)` + OS dark  | `resolvedTheme=dark`                     |
| TC-006 | 正常 | `setThemeMode(system)` + OS light | `resolvedTheme=light`                    |
| TC-007 | 異常 | IPC set失敗                       | fallback継続（例外で落ちない）           |
| TC-008 | 異常 | IPC getで無効値                   | `kanagawa-dragon`へフォールバック        |
| TC-009 | 正常 | initializeTheme復元               | 保存値が反映                             |
| TC-010 | 正常 | ThemeSelector 4オプション表示     | 4項目表示・選択可                        |
| TC-011 | 正常 | SettingsViewでテーマ変更          | `setThemeMode` 呼び出し                  |
| TC-012 | 正常 | `useTheme` dark判定               | dark/kanagawa-dragon=true                |
| TC-013 | 正常 | themeHandlers入力検証             | 無効値でエラー応答                       |
| TC-014 | 正常 | themeHandlers system解決          | OS連動のresolvedTheme返却                |
| TC-015 | 回帰 | 既存kanagawa切替テスト            | 既存期待を維持                           |
