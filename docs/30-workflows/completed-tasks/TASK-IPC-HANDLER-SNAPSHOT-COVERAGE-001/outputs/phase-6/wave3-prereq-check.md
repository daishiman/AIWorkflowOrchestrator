# Wave 3 Prereq Check

## 目的

Wave 3 の 25 direct registration unit に対して、snapshot rollout 前に必要な前提条件と難所を整理する。

## 前提整理

- direct 分母は 48件、Wave 1/2 の direct 23件は導入済み
- Wave 3 は `mainWindow` 依存、`deps.ipcMain` 依存、factory/wrapper 経由、inline registration を多く含む
- この環境では 24 files 一括実行が SIGKILL するため、Wave 3 追加時も shard / single-fork 前提の実行設計が必要

## Wave 3 の主な難所

| 区分                     | 対象                                                                             | 注意点                                                         |
| ------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `mainWindow` 依存        | `registerWindowHandlers` `registerDialogHandlers` `registerProfileHandlers` など | BrowserWindow のモック精度が必要                               |
| `deps.ipcMain` / wrapper | `registerThemeHandlers` `registerTerminalHandlers` `registerAuthModeHandlers`    | `ipcMain.handle` 直呼びでないため shared helper が必要         |
| repository / DB          | `registerConversationHandlers`                                                   | `safeRegister` / fallback と切り分けて観測する必要あり         |
| inline registration      | `registerSkillCreatorOpenSkillHandler`                                           | `index.ts` の inline `ipcMain.handle` を単独で観測する必要あり |
| 別モジュール境界         | `registerSlideIpcHandlers` `registerClaudeCliHandlers`                           | import 負荷と依存モックの整理が必要                            |

## 2026-04-20 時点の結論

- Wave 3 は未着手
- ただし direct unit 一覧・難所・後続順序は確定済み
- AC-006 の要求である「事前調査・優先順位・後続実施計画」は本ファイルで充足する

## 推奨着手順

1. `mainWindow` 依存だけで閉じる handler 群
2. `deps.ipcMain` / wrapper 経由 handler 群
3. `safeRegister` / fallback を伴う handler 群
4. inline registration / 複合依存 handler 群
