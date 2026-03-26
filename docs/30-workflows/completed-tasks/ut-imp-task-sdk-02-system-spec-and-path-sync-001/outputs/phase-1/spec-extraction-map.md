# Phase 1 Spec Extraction Map

| concern               | current source               | update target                                    | validation                 |
| --------------------- | ---------------------------- | ------------------------------------------------ | -------------------------- | ------------ | -------------- |
| current owner wording | `task-workflow-completed.md` | system spec 3 files                              | `rg "future state owner"`  |
| completed fact        | `task-workflow-completed.md` | `task-workflow.md`, `lessons-learned-current.md` | ledger diff review         |
| path drift            | parent workflow root         | `index.md`, `phase-*`, `artifacts*.json`         | `rg "../root-workflow-pack | ../step-03"` |
| incomplete wording    | phase-12 outputs             | `outputs/phase-12/*`                             | `rg "更新予定              | 後でやる     | 後続判断待ち"` |
