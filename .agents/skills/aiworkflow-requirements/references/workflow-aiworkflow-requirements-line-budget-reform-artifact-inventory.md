# aiworkflow-requirements line budget reform artifact inventory

> 対象タスク: `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001`
> 最終更新日: 2026-03-13
> 目的: 今回実装で新規作成・更新したファイル名を、引用と監査に使える完全一覧として保持する

---

## 概要

この inventory は、今回の line budget reform と follow-up formalize で触れた canonical files を漏れなく列挙する。
引用や close-out で「どのファイルが今回増えたか」「どの親仕様書を更新したか」を確認したいときは、本ファイルを current canonical set の完全一覧として使う。
旧 ordinal filename と current semantic filename の対応、旧分類軸、migration 根拠は `legacy-ordinal-family-register.md` を併読する。
再現性・漏れ・矛盾・依存関係・エレガンスの多角的監査は `spec-elegance-consistency-audit.md` を併読する。

`.claude/skills/aiworkflow-requirements/` を canonical root とし、`.agents/skills/aiworkflow-requirements/` は mirror root として `diff -qr` で parity を取る。
mirror は canonical の複製なので、一覧は `.claude` 側だけを列挙する。
集計と一覧の基準 snapshot は、2026-03-13 時点の `git status --short .claude/skills/aiworkflow-requirements docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform` と workflow file tree。

> 注記: 本 inventory は current state の監査記録。ここに出てくる `-a` / `-b` / `-c` 系の legacy filename は推奨形ではない。
> 新規 split は `spec-splitting-guidelines.md` の semantic filename ルールに従い、責務が名前から読める粒度で作成する。

## 集計

| 区分 | 件数 | 補足 |
| --- | --- | --- |
| 更新した canonical control / index files | 6 | `LOGS.md`, `SKILL.md`, `indexes/*` |
| 更新した既存 reference files | 37 | parent / ledger / guide の再編 |
| 新規 canonical reference files | 184 | split child / history / archive / workflow inventory |
| completed workflow files | 71 | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/` |
| 合計 | 298 | canonical files のみ。mirror root は重複計上しない |

---

## 更新した canonical control / index files

- `LOGS.md`
- `SKILL.md`
- `indexes/keywords.json`
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
- `indexes/topic-map.md`

## 更新した既存 reference files

- `api-ipc-agent.md`
- `api-ipc-system.md`
- `arch-electron-services.md`
- `arch-state-management.md`
- `arch-ui-components.md`
- `architecture-auth-security.md`
- `architecture-implementation-patterns.md`
- `architecture-overview.md`
- `claude-code-skills-process.md`
- `claude-code-skills-resources.md`
- `claude-code-skills-structure.md`
- `database-implementation.md`
- `deployment.md`
- `development-guidelines.md`
- `directory-structure.md`
- `error-handling.md`
- `interfaces-agent-sdk-executor.md`
- `interfaces-agent-sdk-history.md`
- `interfaces-agent-sdk-skill.md`
- `interfaces-auth.md`
- `interfaces-chat-history.md`
- `lessons-learned.md`
- `patterns.md`
- `quality-requirements.md`
- `security-electron-ipc.md`
- `security-skill-ipc.md`
- `spec-splitting-guidelines.md`
- `task-workflow.md`
- `technology-devops.md`
- `testing-component-patterns.md`
- `ui-ux-agent-execution.md`
- `ui-ux-atoms-patterns.md`
- `ui-ux-components.md`
- `ui-ux-design-principles.md`
- `ui-ux-feature-components.md`
- `ui-ux-search-panel.md`
- `ui-ux-settings.md`

## 新規 canonical reference files

- `api-ipc-agent`: `api-ipc-agent-advanced.md`, `api-ipc-agent-core.md`, `api-ipc-agent-details.md`, `api-ipc-agent-history.md`
- `api-ipc-system`: `api-ipc-system-core.md`, `api-ipc-system-details.md`, `api-ipc-system-history.md`
- `arch-electron-services`: `arch-electron-services-advanced.md`, `arch-electron-services-core.md`, `arch-electron-services-details.md`, `arch-electron-services-history.md`
- `arch-state-management`: `arch-state-management-advanced.md`, `arch-state-management-core.md`, `arch-state-management-details.md`, `arch-state-management-history.md`, `arch-state-management-reference.md`, `arch-state-management-reference-permissions-import-lifecycle.md`, `arch-state-management-reference-persist-hardening-test-quality.md`
- `arch-ui-components`: `arch-ui-components-advanced.md`, `arch-ui-components-core.md`, `arch-ui-components-details.md`, `arch-ui-components-history.md`
- `architecture-auth-security`: `architecture-auth-security-core.md`, `architecture-auth-security-details.md`, `architecture-auth-security-history.md`
- `architecture-implementation-patterns`: `architecture-implementation-patterns-advanced.md`, `architecture-implementation-patterns-core.md`, `architecture-implementation-patterns-details.md`, `architecture-implementation-patterns-history.md`, `architecture-implementation-patterns-reference.md`, `architecture-implementation-patterns-reference-ipc-contract-audits.md`, `architecture-implementation-patterns-reference-agent-view-selector-migration.md`, `architecture-implementation-patterns-reference-ipc-fallback-validation.md`
- `architecture-overview`: `architecture-overview-core.md`, `architecture-overview-details.md`, `architecture-overview-history.md`
- `database-implementation`: `database-implementation-core.md`, `database-implementation-details.md`, `database-implementation-history.md`
- `deployment`: `deployment-core.md`, `deployment-details.md`, `deployment-history.md`
- `development-guidelines`: `development-guidelines-core.md`, `development-guidelines-details.md`, `development-guidelines-history.md`
- `directory-structure`: `directory-structure-core.md`, `directory-structure-details.md`, `directory-structure-history.md`
- `error-handling`: `error-handling-core.md`, `error-handling-details.md`, `error-handling-history.md`
- `interfaces-agent-sdk-executor`: `interfaces-agent-sdk-executor-core.md`, `interfaces-agent-sdk-executor-details.md`, `interfaces-agent-sdk-executor-history.md`
- `interfaces-agent-sdk-history`: `interfaces-agent-sdk-history-core.md`, `interfaces-agent-sdk-history-history.md`, `interfaces-agent-sdk-history-history-doc-links-changelog.md`
- `interfaces-agent-sdk-skill`: `interfaces-agent-sdk-skill-advanced.md`, `interfaces-agent-sdk-skill-core.md`, `interfaces-agent-sdk-skill-details.md`, `interfaces-agent-sdk-skill-history.md`, `interfaces-agent-sdk-skill-history-contract-fix-changelog.md`, `interfaces-agent-sdk-skill-reference.md`, `interfaces-agent-sdk-skill-reference-share-debug-analytics.md`
- `interfaces-auth`: `interfaces-auth-core.md`, `interfaces-auth-history.md`
- `interfaces-chat-history`: `interfaces-chat-history-core.md`, `interfaces-chat-history-details.md`, `interfaces-chat-history-history.md`
- `lessons-learned-auth-ipc`: `lessons-learned-auth-ipc-fallback-registration-settings.md`, `lessons-learned-auth-ipc-contract-bridge-audit-scope.md`, `lessons-learned-auth-ipc-phase12-type-gaps-preload-alignment.md`, `lessons-learned-auth-ipc-file-ops-skill-creator-registration.md`, `lessons-learned-auth-ipc-security-double-registration.md`, `lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md`, `lessons-learned-auth-ipc-safeinvoke-timeout.md`
- `lessons-learned-current`: `lessons-learned-current.md`
- `lessons-learned-skill`: `lessons-learned-skill-build-harness-guard.md`, `lessons-learned-skill-contrast-guard-lifecycle-followup.md`, `lessons-learned-skill-import-analysis-view.md`, `lessons-learned-skill-create-lifecycle-import-contract.md`, `lessons-learned-skill-remove-contract.md`, `lessons-learned-skill-validation-logging-deprecation.md`, `lessons-learned-skill-execute-hook-migration.md`, `lessons-learned-skill-share-debug-lifecycle-design.md`, `lessons-learned-skill-lifecycle-test-hardening.md`
- `lessons-learned-templates`: `lessons-learned-templates.md`
- `lessons-learned-ui`: `lessons-learned-ui-agent-view-nav-notification-history.md`, `lessons-learned-ui-skill-center-editor-dashboard.md`
- `lessons-learned-workflow-quality`: `lessons-learned-workflow-quality-phase12-audit-validator.md`, `lessons-learned-workflow-quality-ci-module-resolution.md`, `lessons-learned-workflow-quality-sdk-tests-loop-guard.md`, `lessons-learned-workflow-quality-line-budget-reform.md`
- `legacy-ordinal-family-register`: `legacy-ordinal-family-register.md`
- `logs-archive-monthly`: `logs-archive-2026-01-system-spec-gap-skill-retry.md`, `logs-archive-2026-01-skill-selector-todo-scan-template.md`, `logs-archive-2026-01-feature-structure-workspace-chat-edit.md`, `logs-archive-2026-01-agent-sdk-deps-renderer-api.md`, `logs-archive-2026-01-topic-map-remember-choice.md`, `logs-archive-2026-01-skill-stream-display-test-env.md`, `logs-archive-2026-02-auth-callback-lifecycle-guard.md`, `logs-archive-2026-02-validator-task-9f-task-9b.md`, `logs-archive-2026-02-completed-move-preload-sync.md`, `logs-archive-2026-02-skill-validation-atoms-audit.md`, `logs-archive-2026-02-unassigned-placement-import-interface.md`, `logs-archive-2026-02-console-migration-patterns.md`, `logs-archive-2026-02-skill-creator-ipc-sdk-integration.md`, `logs-archive-2026-02-abort-security-loop-guard.md`, `logs-archive-2026-02-env-infra-ipc-auth-ui.md`, `logs-archive-2026-02-permission-history-execution-timestamps.md`, `logs-archive-2026-02-skill-import-interface-atoms-rerun.md`, `logs-archive-2026-03-line-budget-reform-formalize.md`, `logs-archive-2026-03-history-search-notification-center.md`, `logs-archive-2026-03-ipc-fallback-phase12-sync.md`, `logs-archive-2026-03-auth-mode-migration-sync.md`, `logs-archive-2026-03-notification-history-sigterm-guard.md`, `logs-archive-2026-03-workflow02-screenshot-guard.md`, `logs-archive-2026-03-task-10a-c-final-audit.md`, `logs-archive-2026-03-skill-views-completed-move.md`, `logs-archive-2026-03-line-budget-workflow-consolidation.md`
- `logs-archive-meta`: `logs-archive-index.md`, `logs-archive-legacy.md`
- `patterns`: `patterns-advanced.md`, `patterns-core.md`, `patterns-details.md`
- `phase-12-documentation-retrospective`: `phase-12-documentation-retrospective.md`
- `spec-elegance-consistency-audit`: `spec-elegance-consistency-audit.md`
- `quality-requirements`: `quality-requirements-advanced.md`, `quality-requirements-core.md`, `quality-requirements-details.md`, `quality-requirements-history.md`
- `security-electron-ipc`: `security-electron-ipc-advanced.md`, `security-electron-ipc-core.md`, `security-electron-ipc-details.md`, `security-electron-ipc-history.md`
- `security-skill-ipc`: `security-skill-ipc-core.md`, `security-skill-ipc-history.md`
- `task-workflow-active`: `task-workflow-active.md`
- `task-workflow-backlog`: `task-workflow-backlog.md`
- `task-workflow-completed`: `task-workflow-completed.md`, `task-workflow-completed-workspace-chat-lifecycle-tests.md`, `task-workflow-completed-ipc-graceful-degradation-lifecycle.md`, `task-workflow-completed-notification-history-auth-key-state.md`, `task-workflow-completed-skill-import-skill-center-nav.md`, `task-workflow-completed-advanced-views-analytics-audit.md`, `task-workflow-completed-debug-scheduler-doc-generation-theme.md`, `task-workflow-completed-ipc-contract-preload-alignment.md`, `task-workflow-completed-quality-gates-module-resolution-logging.md`, `task-workflow-completed-abort-contract-auth-session-chat.md`, `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`
- `task-workflow-history`: `task-workflow-history.md`
- `technology-devops`: `technology-devops-core.md`, `technology-devops-details.md`, `technology-devops-history.md`
- `testing-component-patterns`: `testing-component-patterns-advanced.md`, `testing-component-patterns-core.md`, `testing-component-patterns-details.md`, `testing-component-patterns-history.md`
- `ui-ux-agent-execution`: `ui-ux-agent-execution-core.md`, `ui-ux-agent-execution-details.md`, `ui-ux-agent-execution-history.md`
- `ui-ux-atoms-patterns`: `ui-ux-atoms-patterns-core.md`, `ui-ux-atoms-patterns-details.md`, `ui-ux-atoms-patterns-history.md`
- `ui-ux-components`: `ui-ux-components-core.md`, `ui-ux-components-details.md`, `ui-ux-components-history.md`
- `ui-ux-design-principles`: `ui-ux-design-principles-core.md`, `ui-ux-design-principles-details.md`, `ui-ux-design-principles-history.md`
- `ui-ux-feature-components`: `ui-ux-feature-components-advanced.md`, `ui-ux-feature-components-core.md`, `ui-ux-feature-components-details.md`, `ui-ux-feature-components-history.md`, `ui-ux-feature-components-reference.md`, `ui-ux-feature-components-reference-organisms-history-surfaces.md`
- `ui-ux-search-panel`: `ui-ux-search-panel-core.md`, `ui-ux-search-panel-details.md`, `ui-ux-search-panel-history.md`
- `ui-ux-settings`: `ui-ux-settings-core.md`, `ui-ux-settings-details.md`, `ui-ux-settings-history.md`
- `workflow-aiworkflow-requirements-line-budget-reform`: `workflow-aiworkflow-requirements-line-budget-reform.md`
- `workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory`: `workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md`

## completed workflow files

- **root files**: `artifacts.json`, `index.md`, `phase-1-requirements.md`, `phase-2-design.md`, `phase-3-design-review.md`, `phase-4-test-creation.md`, `phase-5-implementation.md`, `phase-6-test-expansion.md`, `phase-7-coverage-check.md`, `phase-8-refactoring.md`, `phase-9-quality-assurance.md`, `phase-10-final-review.md`, `phase-11-manual-test.md`, `phase-12-documentation.md`, `phase-13-pr-creation.md`
- **outputs shared files**: `outputs/artifacts.json`, `outputs/verification-report.md`
- **outputs/phase-1 files**: `outputs/phase-1/oversized-markdown-inventory.md`, `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/source-task-mapping.md`
- **outputs/phase-2 files**: `outputs/phase-2/responsibility-split-plan.md`, `outputs/phase-2/subagent-lane-plan.md`, `outputs/phase-2/validation-and-mirror-plan.md`
- **outputs/phase-3 files**: `outputs/phase-3/aiworkflow-requirements-extraction-audit.md`, `outputs/phase-3/design-review-result.md`, `outputs/phase-3/review-prompt.txt`, `outputs/phase-3/solution-elegance-review.md`, `outputs/phase-3/task-specification-creator-compliance-audit.md`
- **outputs/phase-4 files**: `outputs/phase-4/command-expectations.md`, `outputs/phase-4/generated-index-checklist.md`, `outputs/phase-4/test-scenarios.md`
- **outputs/phase-5 files**: `outputs/phase-5/lane-a-summary.md`, `outputs/phase-5/lane-b-summary.md`, `outputs/phase-5/lane-c-summary.md`, `outputs/phase-5/verifier-summary.md`
- **outputs/phase-6 files**: `outputs/phase-6/family-boundary-checks.md`, `outputs/phase-6/generated-index-regression.md`, `outputs/phase-6/regression-expansion-plan.md`
- **outputs/phase-7 files**: `outputs/phase-7/coverage-matrix.md`, `outputs/phase-7/gate-summary.md`, `outputs/phase-7/uncovered-targets-report.md`
- **outputs/phase-8 files**: `outputs/phase-8/discovery-link-adjustments.md`, `outputs/phase-8/naming-normalization.md`, `outputs/phase-8/refactor-log.md`
- **outputs/phase-9 files**: `outputs/phase-9/gate-report.md`, `outputs/phase-9/line-budget-report.md`, `outputs/phase-9/mirror-diff-report.md`
- **outputs/phase-10 files**: `outputs/phase-10/blocker-disposition.md`, `outputs/phase-10/final-review-summary.md`, `outputs/phase-10/review-prompt.txt`
- **outputs/phase-11 files**: `outputs/phase-11/discovery-smoke-test.md`, `outputs/phase-11/history-archive-check.md`, `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/navigation-walkthrough.md`, `outputs/phase-11/screenshots-app-sanity/TC-11-01-home-normal-light-desktop.png`, `outputs/phase-11/screenshots-app-sanity/TC-11-02-home-empty-light-desktop.png`, `outputs/phase-11/screenshots-app-sanity/TC-11-03-home-loading-dark-desktop.png`, `outputs/phase-11/screenshots-app-sanity/TC-11-04-home-normal-mobile-dark.png`, `outputs/phase-11/screenshots-app-sanity/TC-11-05-home-normal-kanagawa-desktop.png`, `outputs/phase-11/screenshots-app-sanity/phase11-capture-metadata.json`, `outputs/phase-11/ui-sanity-visual-review.md`
- **outputs/phase-12 files**: `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/generated-index-status.md`, `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/unassigned-task-detection.md`
- **outputs/phase-13 files**: `outputs/phase-13/pr-summary.md`, `outputs/phase-13/release-note-draft.md`
- **completed workflow follow-up files**: `unassigned-task/task-imp-aiworkflow-generated-index-metric-sync-guard-001.md`

## 再生成・監査コマンド

```bash
git status --short .claude/skills/aiworkflow-requirements docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform
find docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform -type f | sort
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

---

## 使い方

1. まず `indexes/resource-map.md` の current canonical set から引用対象の family を決める。
2. 正確なファイル名一覧が必要ならこの inventory を開く。
3. 行番号確定は `indexes/topic-map.md` で行う。
4. 一覧が stale か迷ったら「再生成・監査コマンド」で snapshot を取り直す。
5. 実体証跡は `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/` まで降りる。

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-13 | 1.2.0 | inventory は current state の監査記録であり、`-a` / `-b` 系は legacy filename であることを明記 |
| 2026-03-13 | 1.1.0 | completed workflow grouping を誤読しにくい表現へ修正し、snapshot の再生成・監査コマンドを追加 |
| 2026-03-13 | 1.0.0 | 今回実装で作成・更新した canonical files の完全 inventory を新規追加 |
