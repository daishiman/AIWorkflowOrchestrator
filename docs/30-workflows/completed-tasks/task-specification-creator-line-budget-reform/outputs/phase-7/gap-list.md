# Phase 7 Output: Gap List

## blocker gap

現時点で blocker gap は 0 件。

## watchpoint

| ID    | 種別                     | 内容                                                                                                  | 後続Phase |
| ----- | ------------------------ | ----------------------------------------------------------------------------------------------------- | --------- |
| G7-01 | command semantics        | root drift grep は no-hit でも exit code 1 を返すため、コマンドログに PASS 条件を明文化する必要がある | Phase 9   |
| G7-02 | unassigned raw detection | `detect-unassigned-tasks.js` が self-comment を raw 検出するため、精査後件数を別管理する必要がある    | Phase 12  |
| G7-03 | workflow evidence sync   | workflow 本文、`artifacts.json`、`outputs/artifacts.json`、`verification-report.md` の同時更新が必要  | Phase 12  |

## Phase 8 への指示

1. duplicate explanation を削減し、watchpoint を navigation / naming 観点へ落とし込む。
2. family file 命名規則を固定し、読み手が 1 hop で目的 detail に辿れる導線を確認する。
