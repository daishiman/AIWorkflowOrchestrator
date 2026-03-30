# Legacy Ordinal Family Register

> 最終更新日: 2026-03-21
> 目的: 旧 ordinal filename から current semantic filename への移行結果を family 単位で保持し、旧 citation や旧ログから current 名へ引き直せるようにする

## 概要

この register は、2026-03-13 に semantic rename した旧 `-a` / `-b` / `-c` 系 filename の移行記録である。
移行対象は 14 family / 67 files。current `references/` に active ordinal filename は残っていない。

rename は命名作業ではなく、classification-first の結果として行った。
この register は current state の file list ではなく、旧 filename と current filename の対応、旧分類軸、migration 根拠を保持するために使う。

## 使い方

1. 旧 citation や旧 log に legacy filename が出てきたら、この register で current filename を特定する。
2. family 単位の旧分類軸を確認し、なぜその semantic filename へ移行したかを把握する。
3. 同種 rename を再現するときは、ここで使った分類軸を `spec-splitting-guidelines.md` の classification-first ルールへ戻して使う。
4. 追加 rename を行う場合は、parent / quick-reference / resource-map / topic-map / mirror sync を同一 wave で更新する。

## Current Alias Overrides（個別互換行）

| scope | legacy filename | current semantic filename | canonical location | last-verified |
| --- | --- | --- | --- | --- |
| `TASK-RT-03` Phase 12 workflow doc | `docs/30-workflows/skill-creator-agent-sdk-lane/step-09-par-task-rt-03-skill-creation-result-panel/` | `docs/30-workflows/step-09-par-task-rt-03-skill-creation-result-panel/` | `docs/30-workflows/step-09-par-task-rt-03-skill-creation-result-panel/` | 2026-03-30 |
| `TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001` Step-01 | `outputs/phase-9/qa-checklist.md` | `outputs/phase-9/quality-assurance-checklist.md` | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/` | 2026-03-14 |
| `TASK-SKILL-LIFECYCLE-04` Phase 12 | `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/TASK-FIX-EVAL-STORE-DISPATCH-001.md` | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md` | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/` | 2026-03-14 |
| `TASK-SKILL-LIFECYCLE-04` Phase 12 | `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/TASK-FIX-SCORE-DELTA-DEDUP-001.md` | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md` | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/` | 2026-03-14 |
| `TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE` workflow root | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | 2026-03-20 |
| `TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE` workflow root | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` | 2026-03-21 |
| `TASK-FIX-LLM-CONFIG-PERSISTENCE` workflow root | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | 2026-03-22 |
| `TASK-FIX-LLM-CONFIG-PERSISTENCE` workflow root | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | 2026-03-21 |
| `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001` workflow root | `docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/` | `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/` | `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/` | 2026-03-21 |
| `TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE` Phase 12 unassigned | `docs/30-workflows/unassigned-task/task-chatview-error-message-i18n-support.md` | `docs/30-workflows/completed-tasks/task-ut-chatview-error-banner-i18n-001.md` | `docs/30-workflows/completed-tasks/` | 2026-03-20 |
| `TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE` Phase 12 unassigned | `docs/30-workflows/unassigned-task/task-chatview-ai-chat-error-code-inventory.md` | `docs/30-workflows/completed-tasks/task-ut-ai-chat-error-code-inventory-001.md` | `docs/30-workflows/completed-tasks/` | 2026-03-20 |

## Family Summary

| family | parent | files | old axis | migration status |
| --- | --- | --- | --- | --- |
| `lessons-learned-ui-*` | `lessons-learned.md` | 2 | UI surface / user journey | `migrated` |
| `lessons-learned-auth-ipc-*` | `lessons-learned.md` | 7 | contract / failure mode / registration type | `migrated` |
| `lessons-learned-skill-*` | `lessons-learned.md` | 9 | skill lifecycle stage / capability | `migrated` |
| `lessons-learned-workflow-quality-*` | `lessons-learned.md` | 4 | workflow gate / quality concern | `migrated` |
| `task-workflow-completed-*` | `task-workflow.md` | 12 | delivery domain / verification lane | `migrated` + `split-500` |
| `logs-archive-2026-01-*` | `logs-archive-index.md` | 6 | month + theme | `migrated` |
| `logs-archive-2026-02-*` | `logs-archive-index.md` | 11 | month + theme | `migrated` |
| `logs-archive-2026-03-*` | `logs-archive-index.md` | 9 | month + theme | `migrated` |
| `arch-state-management-reference-*` | `arch-state-management.md` | 2 | state concern / hardening concern | `migrated` |
| `architecture-implementation-patterns-reference-*` | `architecture-implementation-patterns.md` | 3 | pattern family / audit family | `migrated` |
| `interfaces-agent-sdk-skill-reference-*` | `interfaces-agent-sdk-skill.md` | 1 | skill capability set | `migrated` |
| `interfaces-agent-sdk-skill-history-*` | `interfaces-agent-sdk-skill.md` | 1 | completed task bundle / changelog | `migrated` |
| `interfaces-agent-sdk-history-history-*` | `interfaces-agent-sdk-history.md` | 1 | timeline / changelog | `migrated` |
| `ui-ux-feature-components-reference-*` | `ui-ux-feature-components.md` | 1 | UI surface cluster / feature history | `migrated` |

## Detailed Register

### `lessons-learned-ui-*`

Parent: `lessons-learned.md`
Family status: `reclassify-first`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `lessons-learned-ui-a.md` | agent view / nav / notification-history | `lessons-learned-ui-agent-view-nav-notification-history.md` |
| `lessons-learned-ui-b.md` | skill center / editor / dashboard | `lessons-learned-ui-skill-center-editor-dashboard.md` |

### `lessons-learned-auth-ipc-*`

Parent: `lessons-learned.md`
Family status: `partially-ready`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `lessons-learned-auth-ipc-a.md` | fallback / registration / settings regression | `lessons-learned-auth-ipc-fallback-registration-settings.md` |
| `lessons-learned-auth-ipc-b.md` | contract bridge / duplicate handling / audit scope | `lessons-learned-auth-ipc-contract-bridge-audit-scope.md` |
| `lessons-learned-auth-ipc-c.md` | phase12 type gaps / preload spec alignment | `lessons-learned-auth-ipc-phase12-type-gaps-preload-alignment.md` |
| `lessons-learned-auth-ipc-d.md` | file ops / skill creator handler registration | `lessons-learned-auth-ipc-file-ops-skill-creator-registration.md` |
| `lessons-learned-auth-ipc-e.md` | security / unwrap / double registration | `lessons-learned-auth-ipc-security-double-registration.md` |
| `lessons-learned-auth-ipc-f.md` | skill creator sync / settings contract / auth timeout | `lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` |
| `lessons-learned-auth-ipc-g.md` | safeInvoke timeout | `lessons-learned-auth-ipc-safeinvoke-timeout.md` |

### `lessons-learned-skill-*`

Parent: `lessons-learned.md`
Family status: `reclassify-first`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `lessons-learned-skill-a.md` | build / harness guard | `lessons-learned-skill-build-harness-guard.md` |
| `lessons-learned-skill-b.md` | contrast guard / lifecycle store follow-up | `lessons-learned-skill-contrast-guard-lifecycle-followup.md` |
| `lessons-learned-skill-c.md` | skill import / analysis view | `lessons-learned-skill-import-analysis-view.md` |
| `lessons-learned-skill-d.md` | skill create / lifecycle UI / import contract | `lessons-learned-skill-create-lifecycle-import-contract.md` |
| `lessons-learned-skill-e.md` | skill remove contract | `lessons-learned-skill-remove-contract.md` |
| `lessons-learned-skill-f.md` | skill validation / logging / deprecation | `lessons-learned-skill-validation-logging-deprecation.md` |
| `lessons-learned-skill-g.md` | execute delegation / hook migration | `lessons-learned-skill-execute-hook-migration.md` |
| `lessons-learned-skill-h.md` | share / debug / lifecycle design / persist hardening | `lessons-learned-skill-share-debug-lifecycle-design.md` |
| `lessons-learned-skill-i.md` | lifecycle test hardening | `lessons-learned-skill-lifecycle-test-hardening.md` |

### `lessons-learned-workflow-quality-*`

Parent: `lessons-learned.md`
Family status: `rename-ready-after-check`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `lessons-learned-workflow-quality-a.md` | phase12 audit / validator | `lessons-learned-workflow-quality-phase12-audit-validator.md` |
| `lessons-learned-workflow-quality-b.md` | CI / module resolution | `lessons-learned-workflow-quality-ci-module-resolution.md` |
| `lessons-learned-workflow-quality-c.md` | SDK tests / hook refactor / loop guard | `lessons-learned-workflow-quality-sdk-tests-loop-guard.md` |
| `lessons-learned-workflow-quality-d.md` | validation gate / lifecycle test / line-budget reform | `lessons-learned-workflow-quality-line-budget-reform.md` |

### `task-workflow-completed-*`

Parent: `task-workflow.md`
Family status: `reclassify-first`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `task-workflow-completed-b.md` | workspace / chat path / lifecycle tests | `task-workflow-completed-workspace-chat-lifecycle-tests.md` |
| `task-workflow-completed-c.md` | IPC graceful degradation / lifecycle store integration | `task-workflow-completed-ipc-graceful-degradation-lifecycle.md` |
| `task-workflow-completed-d.md` | notification-history / auth key / state baseline | `task-workflow-completed-notification-history-auth-key-state.md` |
| `task-workflow-completed-e.md` | skill import / skill center / global nav | `task-workflow-completed-skill-import-skill-center-nav.md` |
| `task-workflow-completed-f.md` | advanced views / analytics / shared-source audit | `task-workflow-completed-advanced-views-analytics-audit.md` |
| `task-workflow-completed-g.md` | debug / scheduler / document generation / theme switch | `task-workflow-completed-debug-scheduler-doc-generation-theme.md` |
| `task-workflow-completed-h.md` | IPC contract / preload alignment | `task-workflow-completed-ipc-contract-preload-alignment.md` |
| `task-workflow-completed-i.md` | quality gates / module resolution / logging | `task-workflow-completed-quality-gates-module-resolution-logging.md` |
| `task-workflow-completed-j.md` | abort contract / auth session / chat panel | `task-workflow-completed-abort-contract-auth-session-chat.md` |
| `task-workflow-completed-k.md` | skill lifecycle / agent view / theme guard / line-budget current | `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` |

### `logs-archive-2026-01-*`

Parent: `logs-archive-index.md`
Family status: `reclassify-first`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `logs-archive-2026-01-a.md` | system spec gap / skill retry / permission icons | `logs-archive-2026-01-system-spec-gap-skill-retry.md` |
| `logs-archive-2026-01-b.md` | skill selector / todo scan / template optimization | `logs-archive-2026-01-skill-selector-todo-scan-template.md` |
| `logs-archive-2026-01-c.md` | feature structure / workspace chat edit / permission dialog | `logs-archive-2026-01-feature-structure-workspace-chat-edit.md` |
| `logs-archive-2026-01-d.md` | agent sdk deps / renderer API | `logs-archive-2026-01-agent-sdk-deps-renderer-api.md` |
| `logs-archive-2026-01-e.md` | topic-map / rememberChoice | `logs-archive-2026-01-topic-map-remember-choice.md` |
| `logs-archive-2026-01-f.md` | SkillStreamDisplay test env | `logs-archive-2026-01-skill-stream-display-test-env.md` |

### `logs-archive-2026-02-*`

Parent: `logs-archive-index.md`
Family status: `reclassify-first`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `logs-archive-2026-02-a.md` | auth callback / lifecycle guard | `logs-archive-2026-02-auth-callback-lifecycle-guard.md` |
| `logs-archive-2026-02-b.md` | validator / task-9F / task-9B | `logs-archive-2026-02-validator-task-9f-task-9b.md` |
| `logs-archive-2026-02-c.md` | completed move / preload sync | `logs-archive-2026-02-completed-move-preload-sync.md` |
| `logs-archive-2026-02-d.md` | skill validation / atoms audit | `logs-archive-2026-02-skill-validation-atoms-audit.md` |
| `logs-archive-2026-02-e.md` | unassigned placement / import interface | `logs-archive-2026-02-unassigned-placement-import-interface.md` |
| `logs-archive-2026-02-f.md` | console migration / pattern systematization | `logs-archive-2026-02-console-migration-patterns.md` |
| `logs-archive-2026-02-g.md` | skill creator IPC / sdk integration | `logs-archive-2026-02-skill-creator-ipc-sdk-integration.md` |
| `logs-archive-2026-02-h.md` | abort security / loop guard | `logs-archive-2026-02-abort-security-loop-guard.md` |
| `logs-archive-2026-02-i.md` | env infra / IPC consolidation / auth UI | `logs-archive-2026-02-env-infra-ipc-auth-ui.md` |
| `logs-archive-2026-02-j.md` | permission history / execution timestamps | `logs-archive-2026-02-permission-history-execution-timestamps.md` |
| `logs-archive-2026-02-k.md` | skill import interface / atoms rerun | `logs-archive-2026-02-skill-import-interface-atoms-rerun.md` |

### `logs-archive-2026-03-*`

Parent: `logs-archive-index.md`
Family status: `reclassify-first`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `logs-archive-2026-03-a.md` | line-budget reform / formalize | `logs-archive-2026-03-line-budget-reform-formalize.md` |
| `logs-archive-2026-03-b.md` | history-search / notification-center | `logs-archive-2026-03-history-search-notification-center.md` |
| `logs-archive-2026-03-c.md` | IPC fallback / phase12 sync | `logs-archive-2026-03-ipc-fallback-phase12-sync.md` |
| `logs-archive-2026-03-d.md` | auth-mode / migration sync | `logs-archive-2026-03-auth-mode-migration-sync.md` |
| `logs-archive-2026-03-e.md` | notification-history / SIGTERM guard | `logs-archive-2026-03-notification-history-sigterm-guard.md` |
| `logs-archive-2026-03-f.md` | workflow02 / screenshot guard | `logs-archive-2026-03-workflow02-screenshot-guard.md` |
| `logs-archive-2026-03-g.md` | task-10A-C final audit | `logs-archive-2026-03-task-10a-c-final-audit.md` |
| `logs-archive-2026-03-h.md` | skill views / completed move | `logs-archive-2026-03-skill-views-completed-move.md` |
| `logs-archive-2026-03-i.md` | line-budget reform / task workflow consolidation | `logs-archive-2026-03-line-budget-workflow-consolidation.md` |

### `arch-state-management-reference-*`

Parent: `arch-state-management.md`
Family status: `reclassify-first`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `arch-state-management-reference-b.md` | permissions / import defense / lifecycle integration | `arch-state-management-reference-permissions-import-lifecycle.md` |
| `arch-state-management-reference-c.md` | persist hardening / test quality gate | `arch-state-management-reference-persist-hardening-test-quality.md` |

### `architecture-implementation-patterns-reference-*`

Parent: `architecture-implementation-patterns.md`
Family status: `partially-ready`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `architecture-implementation-patterns-reference-b.md` | IPC data contracts / naming audit / unassigned scope | `architecture-implementation-patterns-reference-ipc-contract-audits.md` |
| `architecture-implementation-patterns-reference-c.md` | AgentView / selector migration / renderer boundary | `architecture-implementation-patterns-reference-agent-view-selector-migration.md` |
| `architecture-implementation-patterns-reference-d.md` | IPC fallback helper / validation follow-up | `architecture-implementation-patterns-reference-ipc-fallback-validation.md` |

### `interfaces-agent-sdk-skill-reference-*`

Parent: `interfaces-agent-sdk-skill.md`
Family status: `rename-ready-after-check`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `interfaces-agent-sdk-skill-reference-b.md` | share / debug / doc-generation / analytics | `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |

### `interfaces-agent-sdk-skill-history-*`

Parent: `interfaces-agent-sdk-skill.md`
Family status: `rename-ready-after-check`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `interfaces-agent-sdk-skill-history-b.md` | contract fix backlog / change log | `interfaces-agent-sdk-skill-history-contract-fix-changelog.md` |

### `interfaces-agent-sdk-history-history-*`

Parent: `interfaces-agent-sdk-history.md`
Family status: `rename-ready`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `interfaces-agent-sdk-history-history-b.md` | completed timeline / doc links / change log | `interfaces-agent-sdk-history-history-doc-links-changelog.md` |

### `ui-ux-feature-components-reference-*`

Parent: `ui-ux-feature-components.md`
Family status: `reclassify-first`

| file | current concern | semantic target idea |
| --- | --- | --- |
| `ui-ux-feature-components-reference-b.md` | organisms foundation / history-notification surfaces | `ui-ux-feature-components-reference-organisms-history-surfaces.md` |

## Section Extract Register (2026-03-17)

> 以下は 500行制限に関係なく、単一ファイルから責務別に仕様セクションを抽出・独立ファイル化した記録。

| source file | extracted to | extracted sections | extract axis | date |
| --- | --- | --- | --- | --- |
| `api-ipc-agent-core.md` | `api-ipc-agent-safety.md` | スキル安全性評価（skill:evaluate-safety / SafetyGateResult / DefaultSafetyGate DI）、スキルファイルツリー取得（skill:getFileTree / FileNode）| SafetyGate 責務の独立化（セキュリティ評価 IPC を core から分離） | 2026-03-17 |
| `lessons-learned-current.md` | `lessons-learned-safety-gate-permission-fallback.md` | TASK-SKILL-LIFECYCLE-08 / UT-06-005 苦戦箇所（P62: PermissionStore DI スコープ問題 / P63: SafetyGate metadataProvider 抽象化境界 / フォールバック制御境界条件テスト設計） | SafetyGate・Permission・Fallback 実装教訓の責務別独立化（current から抽出） | 2026-03-17 |

---

## 500-Line Split Register (2026-03-16)

> 以下は ordinal rename ではなく、500行制限超過に伴うファイル分割の記録。旧ファイルはリダイレクトに変換済み。

| old filename | split into | lines | split axis | date |
| --- | --- | --- | --- | --- |
| `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` (557行) | `task-workflow-completed-skill-lifecycle.md` | 344 | skill lifecycle 系タスク（TASK-10A-C/D, TASK-SKILL-LIFECYCLE-04/05/06） | 2026-03-16 |
| ↑ | `task-workflow-completed-agent-view-line-budget.md` | 219 | AgentView / Light Theme / Settings Persist / Line Budget 系タスク | 2026-03-16 |
| `task-workflow-completed-workspace-chat-lifecycle-tests.md` (522行) | `task-workflow-completed-workspace.md` | 112 | Workspace Layout / Preview 系タスク | 2026-03-16 |
| ↑ | `task-workflow-completed-chat-lifecycle-tests.md` | 418 | Chat Edit / Runtime Routing / Auth Fix / Integration テスト系タスク | 2026-03-16 |
| ↑ | `task-workflow-completed-skill-lifecycle-authfix.md` | 254 | スキルライフサイクルテスト強化 / Auth 修正系タスク | 2026-03-16 |
| `arch-electron-services-details.md` (502行) | `arch-electron-services-details-part1.md` | 269 | スキル管理サービス基盤 / Scanner / IPC API / Service API | 2026-03-16 |
| ↑ | `arch-electron-services-details-part2.md` | 240 | SkillForker / RuntimeResolver / Scheduler / DI統合 / 永続化 | 2026-03-16 |
| `lessons-learned-current.md` (651行) | `lessons-learned-viewtype-electron-ui.md` | ~160 | ViewType / renderView 分岐 / Electron メニュー / P40 再発 | 2026-03-17 |
| ↑ | `lessons-learned-ipc-preload-runtime.md` | ~200 | IPC/Preload/AI Runtime / AuthMode 統一 / LLM adapter / P57-P61 | 2026-03-17 |
| ↑ | `lessons-learned-test-typesafety.md` | ~170 | テスト/型安全 / Object.freeze+satisfies / Permission Fallback | 2026-03-17 |
| ↑ | `lessons-learned-phase12-workflow-lifecycle.md` | ~290 | Phase 12 / ワークフロー / SKILL-LIFECYCLE-04/05/06/07 | 2026-03-17 |
| `lessons-learned-current.md` (1605行) | `lessons-learned-conversation-db-robustness.md` | 55 | Conversation DB / SQLite 堅牢化 / module-level Singleton リーク / will-quit / 後方互換パス簡素化 | 2026-03-19 |
| ↑ | 重複コンテンツ削除（SKILL-LIFECYCLE-06/07/05/04, UT-06-005）→ 既存アーカイブファイルへの参照に置換 | - | 既に lessons-learned-skill-lifecycle-test-hardening.md / lessons-learned-safety-gate-permission-fallback.md に収録済み | 2026-03-19 |
