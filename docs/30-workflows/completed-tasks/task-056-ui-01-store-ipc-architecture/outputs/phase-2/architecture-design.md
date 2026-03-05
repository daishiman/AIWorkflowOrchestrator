# Phase 2 成果物: アーキテクチャ設計

## 1. 設計方針

- Store/IPC/ViewType を単独責務で分離する
- 命名は仕様準拠（`skillCenter`, `historySearch`）を優先しつつ、既存 `skill-center` を互換維持
- IPC契約は `preload/channels.ts` を正本にし、ハードコード禁止
- すべての新規セレクタは個別セレクタで公開する（P31）

## 2. Store拡張設計

### 2.1 notificationSlice

- State
  - `notifications: Notification[]`
  - `unreadCount: number`
  - `isPopoverOpen: boolean`
  - `expandedNotificationId: string | null`
- Actions
  - `addNotification`, `markAsRead`, `markAllAsRead`, `deleteNotification`, `clearAllNotifications`, `setPopoverOpen`, `setExpandedNotificationId`
- 重要仕様
  - 最大100件
  - 超過時は既読の古い通知から削除
  - `unreadCount` は毎回再計算ではなくアクション時に同期更新

### 2.2 historySearchSlice

- State
  - `historySearchQuery`, `historySearchResults`, `historySearchTotalCount`, `historySearchHasMore`, `isHistorySearching`, `historySearchError`, `expandedItemId`
- Actions
  - `setHistorySearchQuery`, `searchHistory`, `loadMoreHistory`, `resetHistorySearch`, `toggleItemExpanded`
- 重要仕様
  - 検索呼び出しは `window.electronAPI.historySearch.search`
  - `loadMoreHistory` は現状態（query / offset）で追補

### 2.3 AppStore統合

- `store/index.ts`
  - `AppStore` に `NotificationSlice` / `HistorySearchSlice` を追加
  - `persist.partialize` に `notifications` を追加
  - 個別セレクタを追加

## 3. ViewType拡張設計

- `store/types.ts`
  - 追加: `workspace`, `skillCenter`, `historySearch`
  - 互換維持: 既存 `skill-center` は残置
- `App.tsx`
  - `ViewType` import元を `store/types.ts` へ変更
  - switch に新規caseを追加
  - defaultで `never` exhaustive check

## 4. AppDock拡張設計

- 既存 `ViewType` 重複定義は廃止し `store/types.ts` 型を参照
- ナビ項目に `workspace`, `skillCenter`, `historySearch` を追加
- ショートカットは `Cmd+1..8, Cmd+,` を維持しつつ仕様順へ調整

## 5. IPC設計

### 5.1 新規チャネル

- Invoke
  - `notification:get-history`
  - `notification:mark-read`
  - `notification:mark-all-read`
  - `notification:clear`
  - `history:search`
  - `history:get-stats`
- On
  - `notification:new`

### 5.2 バリデーション（P42）

- `notificationId`, `query` など文字列引数は以下を順に検証
  1. `typeof value === "string"`
  2. `value === ""`
  3. `value.trim() === ""`

### 5.3 Main実装

- `notificationHandlers.ts`
  - in-memory + `electron-store` で通知履歴を管理
  - mark/clear/get を提供
- `historySearchHandlers.ts`
  - まずはDIサービス経由（デフォルト空配列）で返却
  - 将来のDB検索に差し替え可能なインターフェース

### 5.4 Preload実装

- `preload/api/notification-api.ts` を作成
- `preload/index.ts` の `electronAPI` に `notification`, `historySearch` を追加
- `preload/types.ts` の `ElectronAPI` に型を追加

## 6. テスト設計（Phase 4でRed）

- `notificationSlice.test.ts`
  - LRU, unreadCount同期, expanded切替
- `historySearchSlice.test.ts`
  - 検索/追補/エラー/リセット
- `notificationHandlers.test.ts`
  - P42検証, markRead, clear
- `historySearchHandlers.test.ts`
  - P42検証, stats整形
- `preload/channels` テスト
  - 新規チャネルがallowlistに存在

## 7. 変更対象ファイル

- Renderer
  - `apps/desktop/src/renderer/store/slices/notificationSlice.ts`
  - `apps/desktop/src/renderer/store/slices/notificationSlice.test.ts`
  - `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`
  - `apps/desktop/src/renderer/store/slices/historySearchSlice.test.ts`
  - `apps/desktop/src/renderer/store/index.ts`
  - `apps/desktop/src/renderer/store/types.ts`
  - `apps/desktop/src/renderer/App.tsx`
  - `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx`
  - `apps/desktop/src/renderer/components/organisms/AppDock/AppDock.test.tsx`
  - `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`
  - `apps/desktop/src/renderer/views/HistorySearchView/index.tsx`
- Main
  - `apps/desktop/src/main/ipc/notificationHandlers.ts`
  - `apps/desktop/src/main/ipc/historySearchHandlers.ts`
  - `apps/desktop/src/main/ipc/sanitizeErrorMessage.ts`
  - `apps/desktop/src/main/ipc/index.ts`
  - `apps/desktop/src/main/ipc/__tests__/notificationHandlers.test.ts`
  - `apps/desktop/src/main/ipc/__tests__/historySearchHandlers.test.ts`
- Preload
  - `apps/desktop/src/preload/channels.ts`
  - `apps/desktop/src/preload/types.ts`
  - `apps/desktop/src/preload/index.ts`
  - `apps/desktop/src/preload/api/notification-api.ts`
  - `apps/desktop/src/preload/__tests__/channels.ui-01-store-ipc-architecture.test.ts`
- Shared
  - `packages/shared/src/ipc/channels.ts`
  - `packages/shared/src/types/history.ts`
  - `packages/shared/src/types/index.ts`
