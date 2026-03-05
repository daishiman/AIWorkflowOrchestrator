# Phase 2 aiworkflow-requirements 抽出（SubAgent-A）

| 参照仕様                   | 抽出内容                          | 設計反映                                      |
| -------------------------- | --------------------------------- | --------------------------------------------- |
| `ui-ux-navigation.md`      | AppDock 9項目とショートカット契約 | `NAV_SECTIONS` と `APP_DOCK_NAV_ITEMS` へ反映 |
| `arch-state-management.md` | ViewTypeは単一境界で運用          | `store/types.ts` を正本化                     |
| `architecture-overview.md` | Renderer責務内でナビ処理を完結    | IPC追加なし                                   |
| `error-handling.md`        | 異常入力時のFail-safe             | ショートカット不一致時は `null` を返却        |
| `security-electron-ipc.md` | 境界変更時はIPC契約更新必須       | 本タスクは境界変更なし（更新不要）            |
