# Phase 1 スコープ定義

## 対象

| 区分          | 内容                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| Renderer      | `HistorySearchView` の再設計、関連 hooks/components の追加                  |
| Store         | `historySearchSlice` の state shape 見直し、editor deep-open 連携状態の追加 |
| Main/IPC      | `history:search` 契約の trim / pagination / error surface の整備            |
| Preload/Types | `historySearch` 契約型のドリフト修正                                        |
| Tests         | renderer / hook / slice / IPC / screenshot script の追加更新                |
| Docs          | Phase outputs、system spec 同期、artifacts/index 更新                       |

## 委譲

| 項目                         | 理由                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| FTS5 構築                    | 本タスクの検索 UI/契約整理から独立しているため             |
| ChatHistoryView 本体の再設計 | 既存 route を利用するのみで UI 改修対象外                  |
| VersionHistory / HistoryPage | file deep-open 先としては使わず、editor 連携を優先するため |

## 対象外

| 項目                                 | 理由                                           |
| ------------------------------------ | ---------------------------------------------- |
| NotificationCenter 本体              | 056c の既存実装を維持する                      |
| SkillCenter / SkillAnalysis の再設計 | skill 履歴は履歴画面内の展開情報までに限定する |
| DB スキーマ変更                      | 現段階では UI 契約と frontend state を優先する |

## 変更ファイルの初期想定

- `apps/desktop/src/renderer/views/HistorySearchView/**`
- `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`
- `apps/desktop/src/renderer/store/slices/editorSlice.ts`
- `apps/desktop/src/renderer/store/index.ts`
- `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- `apps/desktop/src/preload/types.ts`
- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/scripts/capture-task-058c-phase11-screenshots.mjs`

## 実装しないファイル

- `apps/desktop/src/renderer/views/ChatHistoryView/index.tsx`
- `apps/desktop/src/main/ipc/notificationHandlers.ts`
- SQLite migration 系ファイル
