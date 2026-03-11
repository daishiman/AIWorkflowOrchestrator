# Phase 2 Quick Search 設計

## 検索アルゴリズム

| 条件                 | score                                                       |
| -------------------- | ----------------------------------------------------------- |
| fileName 完全一致    | 1.00                                                        |
| fileName prefix 一致 | 0.92                                                        |
| fileName 部分一致    | 0.80                                                        |
| path 部分一致        | 0.70                                                        |
| subsequence fuzzy    | fileName は `+0.2` boost、path は relativePath boost を加算 |

## 実装上の是正

- 初期実装では subsequence score の下限が 0.2 となり、非一致 query でも全件候補化する欠陥があった
- `scoreFilePath()` を修正し、subsequence が 0 のときは score 0 を返すよう是正した
- 同 score の候補は `path.localeCompare()` で安定順を維持する

## キーボード仕様

- `Cmd/Ctrl + P`: open
- `ArrowDown / ArrowUp`: `selectedIndex` を循環移動
- `Enter`: `onSelectFile(path)` 実行
- `Escape`: dialog close
- `Tab / Shift+Tab`: dialog 内 focus trap
