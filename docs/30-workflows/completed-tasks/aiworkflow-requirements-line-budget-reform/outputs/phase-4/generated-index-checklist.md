# Phase 4 Output: Generated Index Checklist

## G0 専用チェック

| 項目  | チェック内容                                                                     | PASS 条件                                         |
| ----- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| G0-01 | `generate-index.js` 実行前後で `topic-map.md` / `keywords.json` が再生成されるか | 実行ログが残る                                    |
| G0-02 | `wc -l indexes/topic-map.md` を単独記録できるか                                  | 行数が raw 値で残る                               |
| G0-03 | manual docs の over-limit 0 と G0 の status を別欄で扱っているか                 | report が分離されている                           |
| G0-04 | `topic-map.md` が 500 行超の場合に blocked dependency として formalize されるか  | Phase 9 / 10 / 12 で一貫して blocked と記録される |
| G0-05 | `keywords.json` は generated artifact として同期対象に含まれているか             | changelog と system spec summary に含まれる       |

## orphan shard check

| 観点                        | コマンド               | PASS 条件                                                                                                                                                                                        |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| parent から child へ到達    | `rg -n "\\\*-core\\.md | \\\*-details\\.md                                                                                                                                                                                | \\\*-advanced\\.md                                                                                                                                                                                  | \\_-history\\.md" .claude/skills/aiworkflow-requirements/references/_.md` | 各 over-limit 親に child link がある |
| child から parent へ戻れる  | `rg -n "親仕様書       | parent file                                                                                                                                                                                      | 戻り先" .claude/skills/aiworkflow-requirements/references/_-core.md .claude/skills/aiworkflow-requirements/references/_-details.md .claude/skills/aiworkflow-requirements/references/\*-history.md` | 各 child に親リンクがある                                                 |
| archive / history companion | `rg -n "archive        | history" .claude/skills/aiworkflow-requirements/LOGS.md .claude/skills/aiworkflow-requirements/references/lessons-learned.md .claude/skills/aiworkflow-requirements/references/task-workflow.md` | F1 parent から companion へ行ける                                                                                                                                                                   |

## G0 判定テンプレート

| 項目       | 記録例                                         |
| ---------- | ---------------------------------------------- |
| status     | `resolved` / `blocked dependency`              |
| measuredAt | `2026-03-13T..:..:..+09:00`                    |
| lineCount  | raw `wc -l` 値                                 |
| reason     | `generate-index.js` 再生成後も 500 行超` など  |
| nextAction | `script sharding 別 task 化` または `resolved` |
