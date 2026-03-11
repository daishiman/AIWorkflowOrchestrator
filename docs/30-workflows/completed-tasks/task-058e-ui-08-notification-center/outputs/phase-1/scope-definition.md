# Phase 1 スコープ定義

## In Scope

- NotificationCenter の UI 再設計
- `notification:delete` の IPC 追加
- relative time 表示
- 1件展開アコーディオンと押下既読
- `すべて既読`、close、empty state
- Portal、focus trap、Escape、outside click
- renderer/store/preload/main の自動テスト補強
- Phase 11 のスクリーンショットと視覚検証
- Phase 12 の implementation guide / spec sync / unassigned-task 検出

## Out of Scope

- 新しい通知種別の追加
- 通知生成ロジック自体の拡張
- OS 通知連携
- 通知検索/フィルタ/グルーピング
- 完全な touch gesture ライブラリ導入
- Phase 13 のコミット/PR作成

## 依存前提

| 項目      | 前提                                                               |
| --------- | ------------------------------------------------------------------ |
| Store     | `notificationSlice` の dedupe / 100件保持 / expanded id を維持する |
| AppLayout | Bell 導線の配置は現行ヘッダー右端を維持する                        |
| Preload   | invoke/on は `IPC_CHANNELS` allowlist を経由する                   |
| Main      | `registerNotificationHandlers` の sender 検証パターンを維持する    |
| Tests     | `vitest` / `happy-dom` / `@testing-library/react` を継続利用する   |

## リスクと制御

| リスク                                | 制御                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------ |
| swipe を happy-dom で再現しづらい     | pointer down/move/up ではなく、代替削除ボタン表示を state 駆動で検証する |
| Portal で既存 test が不安定化         | `createPortal` を実際に使い、`document.body` 参照で検証する              |
| `notification:clear` 既存契約との衝突 | UI から切り離し、後方互換としてのみ残す                                  |
| mobile でアンカー配置が崩れる         | `responsiveMode` に応じて right-align と center overlay を分ける         |
