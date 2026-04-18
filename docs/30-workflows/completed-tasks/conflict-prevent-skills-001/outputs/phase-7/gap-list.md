# Phase 7 Output: Gap 一覧

## 本 wave で解決済み

| Gap                                   | 解決内容                                          |
| ------------------------------------- | ------------------------------------------------- |
| `indexes/*.md merge=union` の誤適用   | `merge=ours` に修正                               |
| `merge=ours` カスタムドライバー未登録 | `setup-merge-drivers.sh` + `session-init.sh` warn |
| `topic-map.md` 日付 diff              | `generate-index.js` から date ヘッダー除去        |
| 13 phase 骨格エラー                   | validator errors:0 で解消済み                     |

## follow-up に送ったもの

| Gap                                  | 理由                                            |
| ------------------------------------ | ----------------------------------------------- |
| `.agents/skills/` full sync          | consumer 監査なしに一括 sync は副作用リスクあり |
| EVALS schema 正規化                  | consumer 特定が完了していない                   |
| `references/*.md merge=union` 再評価 | structured docs への union 適用は長期リスク     |
| LOGS.md archive policy 詳細化        | threshold と archive 先の仕様が未確定           |
