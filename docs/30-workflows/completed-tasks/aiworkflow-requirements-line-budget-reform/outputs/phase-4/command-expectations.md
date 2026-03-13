# Phase 4 Output: Command Expectations

## command suite

| コマンド                                                                                                           | 目的                   | PASS                                                                                     | FAIL の扱い                                       |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------- | ----------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/list-specs.js --stats .claude/skills/aiworkflow-requirements` | size baseline 再計測   | over-limit manual docs が 0、または raw `wc -l` と整合する                               | raw `wc -l` と差異があれば Phase 6 で補助監査追加 |
| `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js .claude/skills/aiworkflow-requirements` | structure gate         | references の size warning が解消、または G0 を除いて warning 0                          | warning 残存 file を family ごとに Phase 5 へ戻す |
| `node .claude/skills/aiworkflow-requirements/scripts/split-reference.js --analyze`                                 | split 候補確認         | child 配置と分割根拠が説明できる                                                         | naming / grouping を Phase 5 で見直す             |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                            | generated index 再生成 | `quick-reference.md` / `resource-map.md` / `topic-map.md` / `keywords.json` が更新される | generated index 依存の blocker として記録する     |
| `find .claude/skills/aiworkflow-requirements -path '_/scripts/_' -prune -o -name '\*.md' -print0                   | xargs -0 wc -l`        | raw line budget 監査                                                                     | manual docs 34 件の over-limit が 0               | 対象 file を Phase 5 / 8 に戻す                                                                                                                                                                                     |
| `wc -l .claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                                | G0 単独監査            | 500 行以下、または blocked dependency 記録がある                                         | Phase 9 / 10 / 12 で blocker 化                   |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                           | mirror parity          | 差分 0                                                                                   | mirror drift として Phase 5 に戻す                |
| `rg -n "quick-reference\\.md                                                                                       | resource-map\\.md      | topic-map\\.md                                                                           | archive                                           | history" .claude/skills/aiworkflow-requirements/SKILL.md .claude/skills/aiworkflow-requirements/indexes/_.md .claude/skills/aiworkflow-requirements/references/_.md .claude/skills/aiworkflow-requirements/LOGS.md` | discovery / dependency 監査 | parent / child / history / archive 導線の断線がない | Phase 8 で naming / link を是正する |

## family expectation

| family | 実装期待値                                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| F1     | `LOGS.md` は archive index 役、`lessons-learned.md` と `task-workflow.md` は summary + child / archive link 役に縮む |
| F2     | `patterns` / `quality` / `testing` / `error` / `development` は core / detail / history へ分離される                 |
| F3     | architecture parent は overview 役、surface / service / support detail は child 化される                             |
| F4     | interface / api / security parent は contract index 役、feature / channel / history は child 化される                |
| F5     | UI parent は feature overview 役、Workspace / Skill / foundation / history は child 化される                         |
| F6     | support parent は platform overview 役、target / operation / testing は child 化される                               |
| G0     | source docs split と独立に measurement / status 管理される                                                           |

## evidence bundle

| phase    | 必須証跡                                                                                  |
| -------- | ----------------------------------------------------------------------------------------- |
| Phase 5  | lane summary、verifier summary、`generate-index.js` / `diff -qr` / `wc -l` 結果           |
| Phase 6  | 回帰コマンド表、boundary check、G0 再検証手順                                             |
| Phase 7  | coverage matrix、uncovered target 0 件報告、G0 exception 明示                             |
| Phase 9  | gate report、line-budget report、mirror diff report                                       |
| Phase 10 | final review summary、blocker disposition                                                 |
| Phase 11 | discovery walkthrough、history/archive check、G0 status 確認                              |
| Phase 12 | implementation guide、system spec sync、changelog、unassigned、feedback、compliance check |
