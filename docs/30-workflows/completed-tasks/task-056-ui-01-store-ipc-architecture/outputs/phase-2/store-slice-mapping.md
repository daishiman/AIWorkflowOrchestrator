# Phase 2 成果物: Store Slice マッピング

## 目的

既存Store構成とTASK-056実装で追加した責務を1枚で追跡できるようにする。

## マッピング

| 区分     | Slice/型             | ファイル                                                       | 変更内容                                                 |
| -------- | -------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| 既存拡張 | `AppStore`           | `apps/desktop/src/renderer/store/index.ts`                     | `NotificationSlice` と `HistorySearchSlice` を合成へ追加 |
| 新規     | `NotificationSlice`  | `apps/desktop/src/renderer/store/slices/notificationSlice.ts`  | 通知履歴・既読・Popover状態を管理                        |
| 新規     | `HistorySearchSlice` | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` | 履歴検索・ページング・展開状態を管理                     |
| 既存拡張 | `ViewType`           | `apps/desktop/src/renderer/store/types.ts`                     | `workspace`, `skillCenter`, `historySearch` を追加       |
| 既存拡張 | 永続化設定           | `apps/desktop/src/renderer/store/index.ts`                     | `notifications` を `partialize` に追加                   |

## 依存関係

- `NotificationSlice` -> `window.electronAPI.notification`
- `HistorySearchSlice` -> `window.electronAPI.historySearch`
- `AppDock` / `App.tsx` -> `ViewType`

## 注意点

- `skill-center` と `skillCenter` は移行期間の互換値として併存する。
- セレクタは個別セレクタのみ公開する（P31）。
