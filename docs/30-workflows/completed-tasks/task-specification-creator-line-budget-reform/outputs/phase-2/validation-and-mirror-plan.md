# Phase 2 Output: Validation And Mirror Plan

## validation matrix

| 観点                 | コマンド                                                                                                                                                                                                                    | 合格条件                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------- | --------- | --------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| line budget          | `wc -l .claude/skills/task-specification-creator/SKILL.md`                                                                                                                                                                  | `<= 500`                  |
| direct link          | `rg -n "references/" .claude/skills/task-specification-creator/SKILL.md`                                                                                                                                                    | 新規 ref へ直リンクがある |
| quick validate       | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`                                                                                                                     | error 0                   |
| full validate        | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator`                                                                                                                       | error 0                   |
| workflow spec        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform`                                                           | error 0                   |
| workflow integrity   | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform --json`                                              | error 0、warning 0        |
| mirror parity        | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                              | diff 0                    |
| root drift           | `rg -n "\\.agents/skills/.+references" docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/index.md docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/phase-*.md` | hit 0                     |
| dependency integrity | `rg -n "logs-archive-                                                                                                                                                                                                       | phase-template-           | spec-update-step | phase-11- | phase-12- | patterns-" .claude/skills/task-specification-creator/SKILL.md .claude/skills/task-specification-creator/references/\*.md` | parent / child / archive の導線が欠落していない |

## Phase 12 連携

| 更新対象                          | 理由                                    |
| --------------------------------- | --------------------------------------- |
| `task-workflow.md`                | `spec_created` と実装完了時の台帳同期   |
| `lessons-learned.md`              | line budget と mirror sync の再利用知見 |
| `claude-code-skills-structure.md` | skill doc split pattern の更新          |
| `claude-code-skills-resources.md` | SKILL ナビ / refs split の再利用規則    |
| `claude-code-skills-process.md`   | quick validate と direct link guard     |

## failure guard

1. `.agents` 側だけ更新して `.claude` 正本を残す操作を禁止する。
2. new file を追加したら `SKILL.md` 直リンクを同一 turn で更新する。
3. archive へ移した履歴は `LOGS.md` からたどれる index を残す。
4. split 後に 500 行超 file を新設しない。
5. child file を作ったのに parent / guide / archive 側の入口を作らない操作を禁止する。
