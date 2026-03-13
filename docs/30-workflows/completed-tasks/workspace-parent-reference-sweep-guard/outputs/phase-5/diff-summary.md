# 差分サマリー

## 変更のまとまり

| レイヤ               | 件数   | 要点                                                                                    |
| -------------------- | ------ | --------------------------------------------------------------------------------------- |
| docs pointer / index | 6      | parent pointer、pointer docs、master index、legacy index の導線と status を正本へ再整列 |
| system spec          | 5      | 04B の stale evidence path、Workspace follow-up 未タスク、lessons を同期                |
| capture / validator  | 3      | capture script root 修正、validator 追加、fixture test 追加                             |
| mirror               | 2 root | `.claude` 正本更新後に `.agents` mirror を rsync で一致させた                           |

## 代表差分

- `task-060` は「実装 workflow 正本」を completed workflow `index.md` へ直接リンクする参照仕様になった。
- completed-task pointer docs は「履歴仕様」と「実装 workflow 正本」の境界を 1 行で示す形にそろえた。
- `task-090` の 04A/04B/04C は `pending` から `completed` へ更新され、legacy index 側の status drift を止めた。
- `interfaces-llm.md` / `interfaces-chat-history.md` は 04B の証跡 path を completed workflow 正本へ統一した。
- `validate-workspace-parent-reference-sweep.mjs` は file class ごとの required / forbidden 条件を定数化し、`diff -qr` まで含めた単一 CLI にした。

## 差分の性質

| 性質             | 判定 | 理由                                                                |
| ---------------- | ---- | ------------------------------------------------------------------- |
| UI 実装変更      | なし | React/Electron 本体コードは変更していない                           |
| contract 変更    | なし | IPC / 型 / API シグネチャは変更していない                           |
| reference 正規化 | あり | docs / system spec / script root の path と status を正本へ統一した |
| 品質ゲート追加   | あり | drift を再監査する root validator と fixture test を追加した        |
