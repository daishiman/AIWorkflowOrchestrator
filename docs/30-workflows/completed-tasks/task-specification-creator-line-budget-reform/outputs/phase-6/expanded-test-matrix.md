# Phase 6 Output: Expanded Test Matrix

## 追加した回帰観点

| ID    | 観点                      | コマンド                                                                                                                                                                                                                    | PASS 条件                                                                                                                                         |
| ----- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| E6-01 | family file 到達性        | `rg -n "patterns-                                                                                                                                                                                                           | phase-template-                                                                                                                                   | spec-update-step                              | phase-11-                                                                                 | phase-12-                                      | logs-archive-" .claude/skills/task-specification-creator/SKILL.md .claude/skills/task-specification-creator/references/\*.md` | parent / child / archive の link hit が存在する |
| E6-02 | resource map 更新         | `rg -n "references/（36ファイル）                                                                                                                                                                                           | phase-template-                                                                                                                                   | patterns-phase12-sync                         | logs-archive-index" .claude/skills/task-specification-creator/references/resource-map.md` | 新規 family file と file count 36 が反映される |
| E6-03 | archive discoverability   | `rg -n "logs-archive-index                                                                                                                                                                                                  | logs-archive-2026-" .claude/skills/task-specification-creator/LOGS.md .claude/skills/task-specification-creator/references/logs-archive-index.md` | rolling log と archive index の相互導線がある |
| E6-04 | mirror file set           | `find .claude/skills/task-specification-creator -type f                                                                                                                                                                     | sort`と`find .agents/skills/task-specification-creator -type f                                                                                    | sort`                                         | path の並びが同値                                                                         |
| E6-05 | root drift                | `rg -n "\\.agents/skills/.+references" docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/index.md docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/phase-*.md` | hit 0。exit code 1 は PASS                                                                                                                        |
| E6-06 | workflow output integrity | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform --json`                                              | phase status、artifacts、dependencies が整合する                                                                                                  |
| E6-07 | implementation-guide gate | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform`                                | Part 1 / Part 2 の全要件 PASS                                                                                                                     |

## 既存観点との対応

| Phase 4 の観点      | Phase 6 で追加した具体化                                                       |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| line budget         | family file を含む全 `references/*.md` を測る                                  |
| direct link         | `SKILL.md` と family index の双方を grep 対象に含める                          |
| archive navigation  | `LOGS.md` と archive index の相互導線を別観点化する                            |
| mirror parity       | `diff -qr` に加えて `find                                                      | sort` の file set 比較を入れる |
| workflow validation | `verify-all-specs.js` と implementation-guide validator を後段 gate に追加する |

## 拡充理由

1. Phase 5 で family file が 17 件増えたため、単純な line budget だけでは orphan file を検出できない。
2. `rg` の no-hit を PASS と解釈する root drift 監査は、コマンド仕様を明示しないと誤判定しやすい。
3. Phase 12 は implementation guide 専用 validator があるため、早い段階で test matrix に組み込む必要がある。
