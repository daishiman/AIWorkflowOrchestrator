# Phase 1 現行差分分析

## UI差分

| ファイル                                                      | 現状                                                     | ギャップ                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| `apps/desktop/src/renderer/views/HistorySearchView/index.tsx` | input + select + submit button + stats panel + flat list | 058c のタイムライン、sticky header、accordion、observer が未実装 |
| 同上                                                          | `履歴検索` タイトル                                      | `あなたの記録` へ未変更                                          |
| 同上                                                          | `さらに読み込む` ボタン                                  | `IntersectionObserver` へ未移行                                  |

## State差分

| ファイル                                                       | 現状                                                                  | ギャップ                                                 |
| -------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` | filter / stats を保持する一方、初回取得状態と loading-more 状態がない | ゼロステート分岐、observer spinner、dedupe append が弱い |
| 同上                                                           | append 時に単純連結                                                   | duplicate append 防止がない                              |

## 契約差分

| ファイル                                             | 現状                                                         | ギャップ                             |
| ---------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| `apps/desktop/src/main/ipc/historySearchHandlers.ts` | query trim を service 呼び出し値としては保証していない       | trim 契約の明確化が必要              |
| `apps/desktop/src/preload/types.ts`                  | 旧 `HistorySearchEntityType` / `filters` / `page` 契約が残存 | 現行 shared/preload 実装と型ドリフト |

## 導線差分

| 観点  | 現状             | ギャップ                                    |
| ----- | ---------------- | ------------------------------------------- |
| chat  | 導線 UI なし     | `/chat/history/:sessionId` へのリンクが必要 |
| file  | 導線 UI なし     | editor を開く補助導線が必要                 |
| skill | 一覧上に要約のみ | 展開内詳細が必要                            |

## テスト差分

| ファイル                        | 現状                                                  | ギャップ                                            |
| ------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `HistorySearchView.test.tsx`    | 統計パネル、filter、load more button を前提にしている | 058c の期待挙動へ全面改修が必要                     |
| `historySearchSlice.test.ts`    | filter / stats 既存仕様中心                           | debounce補助、dedupe、trim、loading-more 観点が不足 |
| `historySearchHandlers.test.ts` | trim service引数確認なし                              | 契約強化が必要                                      |
