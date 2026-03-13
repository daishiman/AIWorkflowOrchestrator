# Phase 4 Output: Command Expectations

## command suite

| 観点                | コマンド                                                                                                                                                                                                                    | 期待結果                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------- | ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| line budget         | `wc -l .claude/skills/task-specification-creator/SKILL.md .claude/skills/task-specification-creator/LOGS.md .claude/skills/task-specification-creator/references/*.md`                                                      | 対象 6 concern が 500 行以下、child file も 500 行以下 |
| quick validate      | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator --verbose`                                                                                                           | error 0、warning 0                                     |
| full validate       | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator --verbose`                                                                                                             | error 0、warning 0                                     |
| direct link         | `rg -n "references/" .claude/skills/task-specification-creator/SKILL.md`                                                                                                                                                    | family file と archive への導線が列挙される            |
| dependency contract | `rg -n "logs-archive-                                                                                                                                                                                                       | patterns-                                              | phase-template- | spec-update-step | phase-11- | phase-12-" .claude/skills/task-specification-creator/SKILL.md .claude/skills/task-specification-creator/references/\*.md` | parent / child / archive 導線の hit が存在する |
| mirror parity       | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                              | 標準出力なし、exit code 0                              |
| root drift          | `rg -n "\\.agents/skills/.+references" docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/index.md docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/phase-*.md` | hit 0。`rg` は exit code 1 でも PASS 扱い              |
| workflow validation | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform`                                                           | error 0、warning 0                                     |
| workflow integrity  | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform --json`                                              | error 0、warning 0                                     |

## command 実行順

1. `wc -l`
2. `quick_validate.js`
3. `validate_all.js`
4. direct link / dependency `rg`
5. `diff -qr`
6. workflow validators

## fail 判定メモ

| コマンド            | fail 条件                                 | 対応先                  |
| ------------------- | ----------------------------------------- | ----------------------- |
| `wc -l`             | 500 行超の file が残る                    | Phase 5 または Phase 8  |
| `quick_validate.js` | SKILL / references / agents の構造違反    | Phase 5                 |
| `validate_all.js`   | link か agent 導線 warning                | Phase 5 または Phase 8  |
| `rg "references/"`  | child file を追加したのに入口がない       | Phase 5                 |
| `diff -qr`          | mirror 欠落、余剰 file、本文差分          | Phase 5 または Phase 12 |
| root drift grep     | workflow 本文に `.agents` 正本参照が残る  | Phase 8 または Phase 12 |
| workflow validators | phase status と outputs registry が不整合 | Phase 9 または Phase 12 |

## 実測化のタイミング

- Phase 5: `wc -l`、validator、mirror parity の first pass を記録する。
- Phase 9: skill docs の品質ゲートを再実行する。
- Phase 12: workflow validator と implementation-guide validator を含む final pass を記録する。
