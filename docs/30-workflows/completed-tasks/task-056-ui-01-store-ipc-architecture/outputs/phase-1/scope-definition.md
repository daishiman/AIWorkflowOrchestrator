# Phase 1 成果物: スコープ定義

## In Scope

- Store基盤拡張
  - `notificationSlice` 新規
  - `historySearchSlice` 新規
  - `AppStore` 統合 + 個別セレクタ追加
  - 永続化 `notifications` 追加
- ViewType/ルーティング拡張
  - `store/types.ts` の `ViewType` 拡張
  - `App.tsx` の `renderView` 拡張
  - `AppDock` のViewType参照整理と導線更新
- IPC基盤拡張
  - `notification:*`, `history:search`, `history:get-stats` チャネル追加
  - allowlist更新
  - Main handler実装
  - preload API実装
- テスト
  - slice unit test
  - IPC handler/channel test

## Out of Scope

- Notification Center UI 完全実装（Popover、Swipe、Badge UI詳細）
- HistorySearchView UI 完全実装（タイムライン、InfiniteScroll、カード群）
- GlobalNavStrip全面移行（TASK-UI-02本体）
- Phase 13（PR作成）

## 依存関係

- 参照仕様準拠:
  - `task-057-ui-02-global-nav-core.md`
  - `task-058c-ui-06-history-search-view.md`
  - `task-058e-ui-08-notification-center.md`
  - `task-030-ui-05-skill-center-view.md`
- 既存コード制約:
  - `apps/desktop/src/renderer/store/*`
  - `apps/desktop/src/preload/*`
  - `apps/desktop/src/main/ipc/*`

## リスク

- RISK-01: `skill-center` 既存参照と `skillCenter` 新仕様の命名衝突
- RISK-02: preload/channels allowlist更新漏れ
- RISK-03: Main/Preload/Renderer間でIPC型がドリフト
- RISK-04: AppDock変更で既存11項目ナビテストが回帰

## リスク低減策

- 互換レイヤ: ViewTypeに新旧値を共存させ、段階移行する
- チャネル定数は単一点（`IPC_CHANNELS`）で参照
- ハンドラはP42バリデーションをユニットテストで固定
- 変更後に関連テスト+typecheckを実行して証跡化
