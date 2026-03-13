# Phase 2 Output: Validation and Mirror Plan

## command matrix

| コマンド                                                                                         | 目的                 | PASS 条件                                                                                                                                                                                            | 補足                                |
| ------------------------------------------------------------------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------- | --------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------- | ------------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/list-specs.js --stats`                      | baseline と件数確認  | manual / generated inventory の基準値を確認できる                                                                                                                                                    | Phase 1 baseline と比較する         |
| `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js`                      | 構造検証             | references の over-limit warning が解消される                                                                                                                                                        | `topic-map.md` の行数は別測定が必要 |
| `node .claude/skills/aiworkflow-requirements/scripts/split-reference.js --analyze`               | split 候補分析       | family ごとの split 候補が説明できる                                                                                                                                                                 | script は使うが変更しない           |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                          | index 再生成         | topic-map / resource-map / quick-reference が最新化される                                                                                                                                            | generated artifact の更新           |
| `find .claude/skills/aiworkflow-requirements -path '_/scripts/_' -prune -o -name '\*.md' -print0 | xargs -0 wc -l`      | line budget 測定                                                                                                                                                                                     | manual docs の 500 行超が 0         | raw measurement の正本 |
| `wc -l .claude/skills/aiworkflow-requirements/indexes/topic-map.md`                              | generated index 測定 | 500 行以下、または blocked dependency が記録済み                                                                                                                                                     | G0 専用 gate                        |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`         | mirror parity        | 差分 0                                                                                                                                                                                               | `.claude` 正本 / `.agents` mirror   |
| `rg -n "topic-map\\.md                                                                           | quick-reference\\.md | resource-map\\.md" .claude/skills/aiworkflow-requirements/SKILL.md .claude/skills/aiworkflow-requirements/indexes/quick-reference.md .claude/skills/aiworkflow-requirements/indexes/resource-map.md` | discovery 導線確認                  | 入口三層が壊れていない | entrypoint guard 由来 |
| `rg -n "archive                                                                                  | history              | quick-reference                                                                                                                                                                                      | resource-map                        | topic-map              | LOGS                  | lessons-learned | task-workflow" .claude/skills/aiworkflow-requirements/SKILL.md .claude/skills/aiworkflow-requirements/indexes/_.md .claude/skills/aiworkflow-requirements/references/_.md .claude/skills/aiworkflow-requirements/LOGS.md` | dependency integrity 確認 | parent / child / history / archive / discovery の導線欠落が説明できる | family ごとの orphan shard 監査に使う |

## expected outcomes

| 対象                     | 期待結果                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| manual docs 34 件        | 500 行超が 0 になる                                                                         |
| generated `topic-map.md` | 500 行以下になる、または script exclusion 起因の blocked dependency として記録される        |
| mirror                   | `.claude` と `.agents` の差分が 0 になる                                                    |
| discovery                | `SKILL.md`、`quick-reference.md`、`resource-map.md` の入口が維持される                      |
| dependency integrity     | child shard を作った family で parent / history / discovery / mirror のどこからも孤立しない |

## validation policy

1. `validate-structure.js` だけで gate を閉じない。`topic-map.md` は `wc -l` で必ず別測定する。
2. `generate-index.js` 実行後に `diff -qr` と inventory 再測定を同一ターンで行う。
3. G0 が unresolved の場合、manual docs が完了でも overall task は blocked dependency 付きで記録する。
4. child shard を追加した family では、同一ターンで parent / history companion / discovery index の入口欠落がないことを確認する。
