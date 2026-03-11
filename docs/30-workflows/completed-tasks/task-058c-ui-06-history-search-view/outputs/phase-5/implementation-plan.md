# Phase 5 実装計画

## 実装順序

1. shared / preload 契約のドリフト是正
2. `historySearchSlice` に timeline 用 state を追加
3. file deep-open 用に `editorSlice` と `EditorView` を補強
4. timeline / accordion / sentinel 用 hook と component を分離
5. `HistorySearchView/index.tsx` を再構成
6. テストを Green に合わせて更新
7. screenshot harness を追加して Phase 11 に接続

## 実施結果

| 順序 | 実施内容                                                            | 結果 |
| ---- | ------------------------------------------------------------------- | ---- |
| 1    | `apps/desktop/src/preload/types.ts` を shared shape に同期          | 完了 |
| 2    | `hasFetchedHistory` / `isHistoryLoadingMore` / dedupe append を追加 | 完了 |
| 3    | `pendingOpenFilePath` と open effect を追加                         | 完了 |
| 4    | `hooks/` と `components/` を新設                                    | 完了 |
| 5    | `HistorySearchView` を timeline 主導 UI に差し替え                  | 完了 |
| 6    | view / hook / slice / IPC テストを更新                              | 完了 |
| 7    | screenshot script と route を追加                                   | 完了 |

## ロールバック条件

- Chat / File 導線が壊れたら `EditorView` / routing 変更を戻す
- observer が無限発火するなら sentinel と hook の変更を切り離して戻す
- preload 型が shared と再びズレたら `preload/types.ts` を最優先で是正する
