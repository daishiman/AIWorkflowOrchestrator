# task-specification-creator Compliance Matrix

## メタ情報

| 項目     | 値                                                                                        |
| -------- | ----------------------------------------------------------------------------------------- |
| タスクID | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001                                      |
| workflow | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/`            |
| 作成日   | 2026-03-13                                                                                |
| 目的     | `task-specification-creator` 要件が current workflow に漏れなく反映されているかを監査する |

## 準拠マトリクス

| 要件                                                                                  | 出典                                                                                        | 反映先                                                                                | 状態 |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---- |
| ブランチを先に切ってから仕様書を作成する                                              | ユーザー要求                                                                                | `git branch --show-current`, `index.md`, `artifacts.json`                             | 対応 |
| create-mode の順序（分析→生成→出力→検証）を守る                                       | `SKILL.md`, `references/create-workflow.md`                                                 | Phase 1-3 先行作成、最後に validator 実行                                             | 対応 |
| Phase 1-13 の 13 仕様書を揃える                                                       | `references/create-workflow.md`                                                             | `phase-1-requirements.md` 〜 `phase-13-pr-creation.md`                                | 対応 |
| `index.md` と `artifacts.json` を作成する                                             | `references/create-workflow.md`                                                             | `index.md`, `artifacts.json`, `outputs/artifacts.json`                                | 対応 |
| Phase 1-3 設計確定後にのみ後続 phase を扱う                                           | ユーザー要求, `references/create-workflow.md`                                               | `index.md`, `artifacts.json`, Phase 1-3 completed 後に 4-12 completed へ進行          | 対応 |
| 各 phase に必須セクションを置く                                                       | `references/phase-templates.md`                                                             | 全 `phase-*.md` + `phase-common-governance.md`                                        | 対応 |
| Phase 1-11 に統合テスト連携節を置く                                                   | `references/phase-templates.md`                                                             | Phase 1-11                                                                            | 対応 |
| phase-templates の多角的チェック観点 / サブタスク管理 / 100%実行確認を drift なく保つ | `references/phase-templates.md`                                                             | `phase-common-governance.md` + 全 phase の参照節                                      | 対応 |
| 各 phase で aiworkflow-requirements 参照を明記する                                    | `SKILL.md`                                                                                  | 全 `phase-*.md` の `### システム仕様（aiworkflow-requirements）`                      | 対応 |
| Concern 分離と並列実行条件を明記する                                                  | ユーザー要求, `SKILL.md`                                                                    | `index.md`, `outputs/phase-2/subagent-lane-plan.md`                                   | 対応 |
| Atent Team / SubAgent 分担を仕様化する                                                | ユーザー要求                                                                                | `index.md`, `outputs/phase-2/subagent-lane-plan.md`                                   | 対応 |
| 実 SubAgent 実行機能がなくても責務分離を文書化する                                    | ユーザー要求の代替実装                                                                      | `outputs/phase-2/subagent-lane-plan.md` の実行メモ                                    | 対応 |
| Phase 12 Task 1-5 を漏れなく定義する                                                  | `SKILL.md`, `references/phase-11-12-guide.md`, `references/phase12-checklist-definition.md` | `phase-12-documentation.md`                                                           | 対応 |
| Phase 12 Task 1 に Part 1 / Part 2 を要求する                                         | `SKILL.md`, `references/phase12-checklist-definition.md`                                    | `phase-12-documentation.md`, `outputs/phase-12/implementation-guide.md`               | 対応 |
| Phase 12 Task 2 に Step 1-A〜1-C / Step 2 を要求する                                  | `SKILL.md`, `references/spec-update-workflow.md`                                            | `phase-12-documentation.md`, `outputs/phase-12/system-spec-sync-checklist.md`         | 対応 |
| evidence sync と exact count sync を完了条件に含める                                  | `references/evidence-sync-rules.md`                                                         | `phase-12-documentation.md`, `outputs/phase-1/spec-reference-map.md`                  | 対応 |
| commit / PR を行わない                                                                | ユーザー要求, `SKILL.md`                                                                    | `index.md`, `phase-13-pr-creation.md`, `artifacts.json`                               | 対応 |
| validator / verifier を実行して warning=0 を維持する                                  | `references/create-workflow.md`, `agents/verify-specs.md`                                   | `outputs/verification-report.md`                                                      | 対応 |
| skill 準拠監査自体も成果物として残す                                                  | ユーザー要求の再監査意図                                                                    | 本ファイル, `requirements-traceability-matrix.md`, `branch-diff-reflection-matrix.md` | 対応 |

## 監査コマンド結果

| コマンド                                                                                                                                                                                     | 結果                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `git branch --show-current`                                                                                                                                                                  | `docs/ut-imp-workspace-preview-search-resilience-guard-001-specs-20260313` |
| `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                                                                                                     | PASS                                                                       |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard`                                | PASS                                                                       |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard --json`                   | PASS                                                                       |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard`     | PASS                                                                       |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard`      | PASS                                                                       |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                          | PASS                                                                       |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --target-file docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md` | PASS                                                                       |
| `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator`                                                                                                   | PASS                                                                       |
| `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`                                                                                      | PASS                                                                       |
| `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`                                                                                         | PASS（0 error / 135 warning）                                              |

## 判定

- create-mode / Phase gate / Phase 12 定義 / SubAgent 分離の主要要件は反映済み。
- 不足していた root evidence として `outputs/phase-12/phase12-task-spec-compliance-check.md` を追加し、Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 を 1 ファイルで辿れるようにした。
- commit と PR は未実施のまま維持している。
