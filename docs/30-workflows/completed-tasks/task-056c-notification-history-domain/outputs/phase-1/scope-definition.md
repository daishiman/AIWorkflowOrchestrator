# Phase 1 スコープ定義

## 対象範囲

- `apps/desktop/src/renderer/store/slices/notificationSlice.ts` 新規作成
- `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` 新規作成
- `apps/desktop/src/renderer/store/index.ts` へ2Slice統合
- `apps/desktop/src/preload/channels.ts` に history/notification チャネル追加
- `apps/desktop/src/preload/types.ts` / `index.ts` へ API 契約追加
- `apps/desktop/src/main/ipc/historySearchHandlers.ts` / `notificationHandlers.ts` 新規作成
- `apps/desktop/src/main/ipc/index.ts` へハンドラ登録追加
- 関連単体テスト追加

## 対象外

- Notification/HistorySearch の画面コンポーネント実装
- DB 永続化実装（今回 Main 側は in-memory service）
- PR作成・コミット

## 依存と前提

- `TASK-UI-01-A` の slice baseline を前提に境界を拡張
- 既存 IPC セキュリティ方針（sender検証・チャネルホワイトリスト）を継承
- Phase 11 は UI変更がないため非視覚テスト中心で実施
