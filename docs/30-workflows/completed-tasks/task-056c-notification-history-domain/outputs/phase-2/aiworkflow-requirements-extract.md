# aiworkflow-requirements 抽出レポート（TASK-UI-01-C）

## 目的

`TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN` の仕様作成に必要なシステム正本を抽出し、参照漏れを防止する。

## 抽出結果

| 区分         | 参照資料                                  | 抽出理由                                           | 反映先           |
| ------------ | ----------------------------------------- | -------------------------------------------------- | ---------------- |
| Architecture | `architecture-overview.md`                | Renderer/Main/Preload責務境界を定義するため        | phase-1,2,8,12   |
| Architecture | `architecture-implementation-patterns.md` | IPC引数形式、safeInvoke/safeOn運用を定義するため   | phase-2,5,8,12   |
| State        | `arch-state-management.md`                | notification/historySearch Slice境界を定義するため | phase-1,2,5      |
| API          | `api-ipc-system.md`                       | IPC契約の命名規約と公開契約を定義するため          | phase-1,2,5,12   |
| API          | `api-endpoints.md`                        | 既存チャネル整合を確認するため                     | phase-2,5,12     |
| Security     | `security-electron-ipc.md`                | sender検証、listener cleanupを定義するため         | phase-1,2,6,9,12 |
| Security     | `security-api-electron.md`                | preload公開境界とホワイトリストを定義するため      | phase-2,5,12     |
| Error        | `error-handling.md`                       | 失敗時契約とエラーコードを定義するため             | phase-2,4,9,12   |
| UI/UX        | `ui-ux-navigation.md`                     | 通知/履歴導線の整合を定義するため                  | phase-1,11       |
| UI/UX        | `ui-history-data-types.md`                | History API型・DTOを定義するため                   | phase-1,2,5      |
| UI/UX        | `ui-history-integration.md`               | preload/main/rendererの統合観点を定義するため      | phase-2,4,6,11   |
| Quality      | `quality-requirements.md`                 | テスト戦略とカバレッジ基準を定義するため           | phase-4,7,9      |

## 抽出判断

- 上記12仕様を本タスクの必須参照として確定した。
- 仕様書作成のみフェーズのため、実装更新を伴う仕様改定は未実施とした。
- Phase 12で Step 2（条件付き仕様更新）の判定対象としてこの抽出一覧を利用する。
