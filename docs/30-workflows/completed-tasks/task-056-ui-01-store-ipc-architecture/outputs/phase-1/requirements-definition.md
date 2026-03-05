# Phase 1 成果物: 要件定義書

## 1. タスク情報

- タスクID: `TASK-UI-01-STORE-IPC-ARCHITECTURE`
- 対象仕様:
  - `task-056-ui-01-store-ipc-architecture.md`（正本）
  - 参照正本: `task-057`（NAV_SECTIONS）, `task-030`（SkillCenter方針）, `task-058c`（historySearchSlice/IPC）, `task-058e`（notificationSlice/IPC）

## 2. 解決すべき課題

1. Store層に `notificationSlice` / `historySearchSlice` を追加し、個別セレクタのみで運用する
2. ViewTypeを拡張し、新規ビュー導線（`workspace`, `skillCenter`, `historySearch`）を確保する
3. IPC契約に通知/履歴検索チャネルを追加し、Main/Preload/Rendererの型と実装を整合させる
4. AppDock/App.tsx のViewType参照とルーティングを拡張する

## 3. 機能要件

- R-01: `notificationSlice` を新規実装する
- R-02: `historySearchSlice` を新規実装する
- R-03: `store/index.ts` の `AppStore` に2スライスを統合する
- R-04: `partialize` に `notifications` を永続化対象として追加する
- R-05: `ViewType` に `workspace`, `skillCenter`, `historySearch` を追加する
- R-06: App.tsx の `renderView` を拡張し exhaustive check を入れる
- R-07: AppDockのViewType参照重複を解消し、新規Viewを導線に追加する
- R-08: `IPC_CHANNELS` に通知/履歴検索チャネルを追加し allowlist を更新する
- R-09: Main IPCハンドラ（通知・履歴検索）を実装する
- R-10: Preload API（通知・履歴検索）を追加する

## 4. 非機能要件

- N-01: P31準拠（合成Hook禁止、個別セレクタのみ）
- N-02: P42準拠（文字列引数の3段バリデーション: `typeof` → `=== ""` → `.trim() === ""`）
- N-03: 既存互換性を維持する（既存 `skill-center` 遷移との共存を壊さない）
- N-04: `apps/desktop` のテストが実行可能であること
- N-05: `pnpm --filter @repo/desktop typecheck` が通ること

## 5. 制約・前提

- 本フェーズではPR/コミットは行わない
- UI詳細実装（NotificationPopover全体、HistorySearchView全体）は参照仕様タスクに委譲し、本タスクは基盤責務に限定する
- 既存の高機能ViewType（`chainBuilder` など）は後方互換のため維持する

## 6. SubAgent分担（関心分離）

- SubAgent A: Store設計/実装（notificationSlice, historySearchSlice）
- SubAgent B: IPC設計/実装（channels, handlers, preload API）
- SubAgent C: ViewType/Appルーティング整合
- SubAgent D: テスト実装/回帰検証

## 7. 成果物定義（Phase 5までに実体化）

- `apps/desktop/src/renderer/store/slices/notificationSlice.ts`
- `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`
- `apps/desktop/src/renderer/store/index.ts`
- `apps/desktop/src/renderer/store/types.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/main/ipc/notificationHandlers.ts`
- `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- `apps/desktop/src/preload/api/notification-api.ts`
- 関連テストファイル
