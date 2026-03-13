# Phase 6 Output: Docs Validation Plan

## 実行方針

| コマンド                                                                                                                                                                                                             | 目的                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard`                                                        | workflow 構造と phase 成果物整合 |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard --json`                                           | 全 phase 本文の整合              |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard`                              | TC と `.png` 証跡の対応          |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                                                  | related task path の実在確認     |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md` | current/baseline 分離監査        |

## 追加記録

- `esbuild` platform mismatch により `electron-vite build` は current environment で失敗した
- Phase 11 は `vite.e2e.config.ts` の renderer dev server を current source の代替 capture 経路として採用した
