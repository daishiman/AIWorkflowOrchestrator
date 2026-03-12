# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 12                                              |
| Phase名    | ドキュメント                                    |
| ステータス | completed                                       |
| 前提Phase  | Phase 11                                        |
| 後続Phase  | Phase 13                                        |

## 目的

shared migration の更新内容を system spec と workflow 文書へ同期する。

## 実行タスク

- Task 1: `implementation-guide.md` を Part 1/Part 2 の 2 パート構成で作成する
- Task 2: `.claude/skills/aiworkflow-requirements/` を canonical root として `ui-ux-design-system.md` / `workflow-light-theme-global-remediation.md` / `ui-ux-components.md` / `ui-ux-settings.md` / `ui-ux-search-panel.md` / `ui-ux-feature-components.md` / `indexes/quick-reference.md` / `task-workflow.md` / `lessons-learned.md` を Step 1-A〜1-D で同期し、Step 2 は「public contract 変更なし」で更新不要と判定する
- Task 3: `documentation-changelog.md` / `spec-update-summary.md` / `phase12-task-spec-compliance-check.md` に検証結果と Phase 12 の artifacts 台帳更新方針を記録する
- Task 4: `unassigned-task-detection.md` を 0件でも必ず作成し、既存未タスクを再利用する場合も completed workflow 配下 `unassigned-task/` への移管・フォーマット正規化・物理存在確認・task-workflow 反映まで完了させる
- Task 5: `skill-feedback-report.md` を作成し、`.claude/skills/task-specification-creator` / `.claude/skills/aiworkflow-requirements` / `.claude/skills/skill-creator` の `LOGS.md` / `SKILL.md` / index 再生成 / template 改善の更新導線を残す

## 参照資料

| 参照資料               | パス                                                                                     | 説明                               |
| ---------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 11/12 guide      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`              | Phase 12 必須5タスクの正本         |
| Phase 12 checklist     | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`   | 実体確認ルール                     |
| Spec update workflow   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`           | system spec 更新順序               |
| Phase 2 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/`  | batch 設計                         |
| Phase 5 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/`  | 実装差分                           |
| Phase 6 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-6/`  | テスト拡張結果                     |
| Phase 7 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-7/`  | coverage                           |
| Phase 8 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-8/`  | refactoring 結果                   |
| Phase 9 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-9/`  | 品質結果                           |
| Phase 10 成果物        | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-10/` | 最終レビュー結果                   |
| Resource map           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                         | 読むべき正本仕様の入口             |
| Quick reference        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                      | shared color / blind spot 探索入口 |
| Skill Creator template | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`      | Phase 12 テンプレート改善元        |

### システム仕様（aiworkflow-requirements）

| 参照資料                            | パス                                                                                                   | 内容                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| ui-ux-design-system                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                             | token / contrast 更新先    |
| global workflow                     | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-global-remediation.md`         | 横断手順更新先             |
| ui-ux-components                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                | component 更新先           |
| ui-ux-feature-components            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | feature 更新先             |
| rag-desktop-state                   | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`                               | theme state 更新先         |
| ui-ux-settings                      | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | Settings の正本            |
| ui-ux-forms                         | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`                                     | Auth entry 更新先          |
| architecture-auth-security          | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`                      | auth/account 更新先        |
| api-ipc-auth                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                                    | auth entry 更新先          |
| api-ipc-system                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | settings auth key 更新先   |
| workflow-apikey-chat-tool-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | auth-key visibility 更新先 |
| error-handling                      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                  | fallback/error 更新先      |
| ui-ux-search-panel                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                              | WorkspaceSearch の正本     |
| task-workflow                       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                   | backlog / 完了台帳         |
| lessons-learned                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                 | 再発防止                   |

## 実行手順

1. Task 1 として Part 1/Part 2 の `implementation-guide.md` を作成し、`validate-phase12-implementation-guide.js --workflow ...` の PASS 条件を記録する。
2. Step 1-A〜1-D として system spec 完了記録、実装状況テーブル、関連タスク grep、topic-map/index 再生成を行い、`.claude/skills/aiworkflow-requirements/LOGS.md` / `.claude/skills/task-specification-creator/LOGS.md` / `.claude/skills/skill-creator/LOGS.md`、必要な `SKILL.md` 変更履歴を同時更新し、`quick_validate.js` の結果を確認する。
3. Step 2 で batch ごとの public contract 更新要否を判定し、`spec-update-summary.md` / `documentation-changelog.md` / `phase12-task-spec-compliance-check.md` に `outputs/artifacts.json` 同期、`verify-unassigned-links.js`、`audit-unassigned-tasks.js`、`audit-unassigned-tasks.js --json --diff-from HEAD --unassigned-dir docs/30-workflows/completed-tasks/light-theme-shared-color-migration/unassigned-task --target-file docs/30-workflows/completed-tasks/light-theme-shared-color-migration/unassigned-task/task-fix-settings-integration-act-warning-001.md`、`generate-index.js --workflow ... --regenerate`、`quick_validate.js` の結果を記録する。

## 成果物

| 成果物                             | パス                                                                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| implementation-guide               | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/implementation-guide.md`               |
| spec-update-summary                | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/spec-update-summary.md`                |
| phase12-task-spec-compliance-check | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/phase12-task-spec-compliance-check.md` |
| documentation-changelog            | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/documentation-changelog.md`            |
| unassigned-task-detection          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/unassigned-task-detection.md`          |
| skill-feedback-report              | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/skill-feedback-report.md`              |

## 完了条件

- [x] implementation-guide Part 1/Part 2 と日常例え・型/API・エッジケース要件が定義されている
- [x] `validate-phase12-implementation-guide.js --workflow ...` の PASS 記録を残す方針がある
- [x] system spec 更新で `.claude` 正本の `ui-ux-design-system.md` / `workflow-light-theme-global-remediation.md` / `ui-ux-settings.md` / `ui-ux-search-panel.md` / `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` を同期し、Step 2 は public contract 変更なしのため不要と記録した
- [x] unassigned-task-detection が 0件でも必須であり、既存未タスク再利用時の正規化・target-file audit も記録されている
- [x] `quick_validate.js` の結果と warning 分類を残す方針がある
- [x] `artifacts.json` / `outputs/artifacts.json` 同期、`generate-index.js --workflow ... --regenerate`、`verify-unassigned-links.js` を記録する方針がある
- [x] skill-feedback-report と LOGS/SKILL 更新導線が記載されている

## 次Phase

Phase 13: PR作成
