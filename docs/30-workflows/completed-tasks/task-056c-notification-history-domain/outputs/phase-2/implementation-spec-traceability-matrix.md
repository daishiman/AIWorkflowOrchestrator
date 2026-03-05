# 実装ファイル × 正本仕様 トレーサビリティマトリクス

## 実装反映結果

| 実装ファイル                                                   | 反映状況 | 主要仕様                                               | 対応テスト                      |
| -------------------------------------------------------------- | -------- | ------------------------------------------------------ | ------------------------------- |
| `apps/desktop/src/renderer/store/slices/notificationSlice.ts`  | 実装済み | `arch-state-management.md`, `error-handling.md`        | `notificationSlice.test.ts`     |
| `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` | 実装済み | `arch-state-management.md`, `ui-history-data-types.md` | `historySearchSlice.test.ts`    |
| `apps/desktop/src/renderer/store/index.ts`                     | 実装済み | `architecture-overview.md`, `arch-state-management.md` | Slice tests + typecheck         |
| `apps/desktop/src/main/ipc/notificationHandlers.ts`            | 実装済み | `api-ipc-system.md`, `security-electron-ipc.md`        | `notificationHandlers.test.ts`  |
| `apps/desktop/src/main/ipc/historySearchHandlers.ts`           | 実装済み | `api-ipc-system.md`, `ui-history-integration.md`       | `historySearchHandlers.test.ts` |
| `apps/desktop/src/main/ipc/index.ts`                           | 実装済み | `architecture-overview.md`                             | 実装差分レビュー                |
| `apps/desktop/src/preload/channels.ts`                         | 実装済み | `api-endpoints.md`, `api-ipc-system.md`                | `channels.test.ts`              |
| `apps/desktop/src/preload/types.ts`                            | 実装済み | `ui-history-data-types.md`, `error-handling.md`        | typecheck                       |
| `apps/desktop/src/preload/index.ts`                            | 実装済み | `security-api-electron.md`, `security-electron-ipc.md` | typecheck                       |

## 抜け漏れチェック

| 観点          | 判定 | 備考                                   |
| ------------- | ---- | -------------------------------------- |
| Store責務分離 | PASS | Notification/HistorySearch 独立Slice化 |
| IPC命名整合   | PASS | channels.ts に集約追加                 |
| sender検証    | PASS | 2 handlerで共通適用                    |
| 認証要件      | PASS | 通知更新系IPCで適用                    |
| テスト整備    | PASS | 対象5ファイル37テストPASS              |
