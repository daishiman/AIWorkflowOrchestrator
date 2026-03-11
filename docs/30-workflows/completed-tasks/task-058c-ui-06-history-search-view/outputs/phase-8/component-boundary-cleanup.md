# Phase 8 component boundary cleanup

## 境界整理表

| レイヤ         | 役割                               | 代表ファイル                  |
| -------------- | ---------------------------------- | ----------------------------- |
| Page           | store 接続、状態分岐、導線組み立て | `HistorySearchView/index.tsx` |
| Presentational | 入力、empty、timeline、card 表示   | `components/*`                |
| Hook           | 時間依存 / observer / grouping     | `hooks/*`                     |
| Store          | fetch 状態、append、展開状態       | `historySearchSlice.ts`       |

## 残した判断

- `HistorySearchView/index.tsx` に route / store orchestration は残す
- editor open intent は `editorSlice` 側へ寄せ、card から直接 editor API を叩かない
