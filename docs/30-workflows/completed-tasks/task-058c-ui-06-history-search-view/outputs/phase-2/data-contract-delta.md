# Phase 2 データ契約差分

## shared types 判定

| 項目                   | 現状                                                             | 判定                  |
| ---------------------- | ---------------------------------------------------------------- | --------------------- |
| `HistoryItem`          | `id`, `type`, `title`, `preview`, `timestamp`, `metadata` を保持 | timeline 表示には十分 |
| `ChatHistoryMetadata`  | `sessionId`, `messageCount`, `lastModel?`                        | 展開表示に十分        |
| `FileHistoryMetadata`  | `filePath`, `additions`, `deletions`                             | editor 導線に十分     |
| `SkillHistoryMetadata` | `status`, `outputFile?`, `executionTimeMs?`, `modelUsed?`        | 展開表示に十分        |

結論: **新規 transport DTO は不要**。058c 実装では既存 shared 型を再利用し、展開 UI は optional metadata を読む。

## slice 契約差分

| 項目                   | 変更                                    |
| ---------------------- | --------------------------------------- |
| `hasFetchedHistory`    | 初回取得完了判定用に追加                |
| `isHistoryLoadingMore` | footer spinner 分離用に追加             |
| `pendingOpenFilePath`  | file deep-open 用に editor slice へ追加 |

## IPC 契約差分

| チャネル            | 変更                                                    |
| ------------------- | ------------------------------------------------------- |
| `history:search`    | query を trim した上で service に渡す                   |
| `history:get-stats` | 契約維持。UI 常設表示はしないが test と互換性のため残す |

## preload/types ドリフト

| ファイル                            | 現状                                             | 対応                                                                     |
| ----------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| `apps/desktop/src/preload/types.ts` | `filters` / `page` ベースの旧 HistorySearch 契約 | shared/preload 実装に一致する `query/filter/limit/offset` 契約へ更新する |
