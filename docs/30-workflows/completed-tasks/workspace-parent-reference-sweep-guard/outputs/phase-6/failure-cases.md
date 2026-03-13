# failure ケース一覧

## 自動再現できる失敗

| ケースID | 失敗内容                               | 再現方法                                               | 期待される検出     |
| -------- | -------------------------------------- | ------------------------------------------------------ | ------------------ |
| FC-6-01  | parent pointer が旧 local `.md` を指す | fixture の `task-060` に `./task-058b...md` を書く     | `path-drift > 0`   |
| FC-6-02  | legacy index に `pending` が残る       | fixture の `task-090` を `pending` に戻す              | `status-drift > 0` |
| FC-6-03  | mirror root が不一致                   | fixture の `.agents/.../task-workflow.md` を差し替える | `mirror-drift > 0` |
| FC-6-04  | required path の実体が欠ける           | completed workflow `index.md` のいずれかを欠損させる   | `path-drift > 0`   |
| FC-6-05  | system spec に旧 04B root が残る       | `interfaces-*` や `task-workflow.md` を旧 root に戻す  | `path-drift > 0`   |

## 今回の repo で実際に遭遇した失敗

| ケース       | 状況                                                                                                | 処置                                                         |
| ------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| mirror drift | `generate-index.js` 実行後、一時的に `indexes/keywords.json` と `indexes/topic-map.md` に差分が出た | `rsync -> diff -qr -> guard` を直列で再実行して 0 件へ戻した |

## 失敗時の標準対処

1. `.claude` 正本を修正する。
2. aiworkflow indexes が変わる場合のみ `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する。
3. `rsync -a --checksum --delete .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/` を実行する。
4. `diff -qr` と root validator を再実行し、3 drift class が 0 に戻ることを確認する。
