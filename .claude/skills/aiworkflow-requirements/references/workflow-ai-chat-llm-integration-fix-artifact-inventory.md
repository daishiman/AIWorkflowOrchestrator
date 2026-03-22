# AI Chat / LLM Integration Fix artifact inventory

## 対象 wave

| 項目 | 値 |
| --- | --- |
| wave date | 2026-03-22 |
| parent workflow | `docs/30-workflows/ai-chat-llm-integration-fix/index.md` |
| primary implemented tasks | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/`, `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/`, `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/`, `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/` |
| related workflow specs | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/`, `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/` |
| primary implemented tasks | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/`, `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/`, `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` |
| related workflow specs | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/`, `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/` |
| purpose | Phase 12 same-wave で参照した current canonical set、workflow-local 成果物、未タスク、検証チェーンを引用可能な形で固定する |

## current canonical set

| concern | canonical artifact |
| --- | --- |
| workflow family overview | `references/workflow-ai-chat-llm-integration-fix.md` |
| artifact inventory | `references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md` |
| error transport contract | `references/llm-ipc-types.md` |
| renderer error policy | `references/error-handling-core.md` |
| state ownership | `references/arch-state-management-core.md` |
| selector guidance | `references/ui-ux-llm-selector.md` |
| stream error contract | `references/llm-streaming.md` |
| ledger / backlog | `references/task-workflow.md`, `references/task-workflow-completed-chat-lifecycle-tests.md`, `references/task-workflow-backlog.md` |
| lessons | `references/lessons-learned-current.md`, `references/lessons-learned-phase12-workflow-lifecycle.md` |
| navigation index | `indexes/resource-map.md`, `indexes/quick-reference.md`, `indexes/topic-map.md`, `indexes/keywords.json` |
| legacy compatibility | `references/legacy-ordinal-family-register.md` |

## workflow-local artifacts

### Task 01 root

| artifact | path | purpose |
| --- | --- | --- |
| workflow root | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | Task 01 canonical root |
| phase 11 screenshots | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/screenshots/TC-11-01-default-light.png` ほか 4 件 | representative screenshot |
| phase 12 outputs | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/` | guide / summary / changelog / feedback / compliance |

### Task 02 root

| artifact | path | purpose |
| --- | --- | --- |
| workflow root | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` | Task 02 canonical root |
| phase 11 plan | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-11-manual-test.md` | TC-11-01..04 の手動試験正本 |
| phase 11 readme | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/README.md` | evidence set summary |
| phase 11 checklist | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/manual-test-checklist.md` | 実施チェック |
| phase 11 result | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/manual-test-result.md` | 手動試験結果 |
| phase 11 issues | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/discovered-issues.md` | 発見課題 |
| screenshot plan | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/screenshot-plan.json` | capture 方針 |
| screenshots | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/screenshots/TC-11-01-chatview-inline-guidance-light.png` ほか 3 件 | 画面証跡 |
| screenshot metadata | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/screenshots/phase11-capture-metadata.json` | callback / focus 判定 |
| phase 12 guide | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/implementation-guide.md` | Task 1 成果物 |
| phase 12 summary | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/system-spec-update-summary.md` | Step 1-A〜Step 2 実績 |
| phase 12 changelog | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/documentation-changelog.md` | 変更ログ |
| phase 12 unassigned | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/unassigned-task-detection.md` | follow-up 2件の formalize 記録 |
| phase 12 feedback | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/skill-feedback-report.md` | skill feedback |
| phase 12 compliance | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/phase12-task-spec-compliance-check.md` | 準拠チェック |
| component doc | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/component-documentation.md` | UI surface 契約 |

### Task 03 root

| artifact | path | purpose |
| --- | --- | --- |
| workflow root | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | Task 03 completed root |
| phase 12 doc | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-12-documentation.md` | persist / migrate / validation 同期 |

### Task 04 root

| artifact | path | purpose |
| --- | --- | --- |
| workflow root | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/` | Task 04 canonical root |
| phase 11 plan | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-11-manual-test.md` | TC-11-01..05 の手動試験正本 |
| phase 11 readme | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/README.md` | evidence set summary |
| phase 11 checklist | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/manual-test-checklist.md` | 実施チェック |
| phase 11 result | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/manual-test-result.md` | 手動試験結果 |
| phase 11 issues | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/discovered-issues.md` | 発見課題 |
| screenshot plan | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/screenshot-plan.json` | capture 方針 |
| screenshots | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/screenshots/TC-11-01-settings-cta-light.png` ほか 4 件 | 画面証跡 |
| screenshot metadata | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/screenshots/phase11-capture-metadata.json` | scenario / theme / timing |
| phase 12 doc | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-12-documentation.md` | same-wave system spec sync |
| phase 12 summary | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-12/system-spec-update-summary.md` | actual system spec update record |
| phase 12 unassigned | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-12/unassigned-task-detection.md` | follow-up 2件の formalize 記録 |
| phase 12 compliance | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1-5 / validator / parity check |

### Task 03 root

| artifact | path | purpose |
| --- | --- | --- |
| workflow root | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | Task 03 canonical root |
| phase 11 spec | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-11-manual-test.md` | TC-11-01..04 の正本 |
| phase 11 checklist | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/manual-test-checklist.md` | 実施チェック |
| phase 11 result | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/manual-test-result.md` | 実行結果 |
| phase 11 issues | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/discovered-issues.md` | capture blocker と発見事項 |
| screenshot plan | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/screenshot-plan.json` | capture 対象一覧 |
| screenshot metadata | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/screenshots/phase11-capture-metadata.json` | capture 実績 metadata |
| phase 12 guide | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/implementation-guide.md` | Task 1 成果物 |
| phase 12 summary | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/system-spec-update-summary.md` | Step 1-A〜Step 2 実績 |
| phase 12 changelog | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/documentation-changelog.md` | 変更ログ |
| phase 12 unassigned | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/unassigned-task-detection.md` | follow-up 2件の formalize 記録 |
| phase 12 feedback | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/skill-feedback-report.md` | skill feedback |
| phase 12 compliance | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/phase12-task-spec-compliance-check.md` | 準拠チェック |

### parent workflow / sibling specs

| artifact | path | purpose |
| --- | --- | --- |
| parent overview | `docs/30-workflows/ai-chat-llm-integration-fix/index.md` | 4 タスク family overview |
| task 01 spec | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | ChatView error workflow completed root |
| task 02 spec | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` | selector guidance workflow |
| task 03 spec | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | persistence workflow completed root |
| task 04 spec | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/` | workspace error workflow current root |
| task 03 spec | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | persistence workflow |

## follow-up 未タスク

| task | path | role |
| --- | --- | --- |
| `UT-CHATVIEW-ERROR-BANNER-I18N-001` | `docs/30-workflows/completed-tasks/task-ut-chatview-error-banner-i18n-001.md` | 文言辞書化と i18n 分離 |
| `UT-AI-CHAT-ERROR-CODE-INVENTORY-001` | `docs/30-workflows/completed-tasks/task-ut-ai-chat-error-code-inventory-001.md` | ai.chat code inventory の formalization |
| `UT-FIX-LLM-SETTINGS-DIRECT-SCROLL-001` | `docs/30-workflows/unassigned-task/task-ut-llm-settings-direct-scroll-001.md` | Settings の LLM セクションへ直接到達する導線 |
| `UT-FIX-LLM-BANNER-DISMISS-001` | `docs/30-workflows/unassigned-task/task-ut-llm-guidance-banner-dismiss-001.md` | guidance banner の dismiss UX |
| `UT-WORKSPACE-CHAT-STREAM-ERROR-TRANSITION-001` | `docs/30-workflows/unassigned-task/task-ut-workspace-chat-stream-error-transition-001.md` | error banner transition 追加 |
| `UT-WORKSPACE-CHAT-STREAM-ERROR-CONTRAST-001` | `docs/30-workflows/unassigned-task/task-ut-workspace-chat-stream-error-contrast-001.md` | WCAG AA contrast 検証と基準固定 |
| `UT-FIX-LLM-FETCHPROVIDERS-RETRY-001` | `docs/30-workflows/unassigned-task/UT-FIX-LLM-FETCHPROVIDERS-RETRY-001.md` | fetchProviders retry と validation 再実行保証 |
| `UT-FIX-LLM-PERSIST-ENCRYPT-001` | `docs/30-workflows/unassigned-task/UT-FIX-LLM-PERSIST-ENCRYPT-001.md` | persist encryption 検討 |

## 同一 wave で更新した canonical docs

| category | files |
| --- | --- |
| workflow spec | `references/workflow-ai-chat-llm-integration-fix.md`, `references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md` |
| UI / runtime | `references/ui-ux-llm-selector.md`, `references/llm-streaming.md`, `references/ui-ux-feature-components-details.md` |
| UI / runtime | `references/ui-ux-llm-selector.md`, `references/arch-state-management-reference-persist-hardening-test-quality.md`, `references/llm-streaming.md` |
| ledger / lessons | `references/task-workflow-completed-chat-lifecycle-tests.md`, `references/task-workflow-backlog.md`, `references/lessons-learned-current.md`, `references/lessons-learned-phase12-workflow-lifecycle.md` |
| navigation / compatibility | `indexes/resource-map.md`, `indexes/quick-reference.md`, `references/legacy-ordinal-family-register.md` |
| logs / skill guidance | `LOGS.md`, `SKILL.md`, `.claude/skills/task-specification-creator/LOGS.md`, `.claude/skills/task-specification-creator/SKILL.md` |

## legacy path / filename compatibility

| legacy | current | note |
| --- | --- | --- |
| `docs/30-workflows/ai-chat-llm-integration-fix/tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | Task 01 canonical root drift を是正 |
| `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` | `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` | Task 02 canonical root drift を是正 |
| `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | Task 03 canonical root drift を是正 |
| `docs/30-workflows/unassigned-task/task-chatview-error-message-i18n-support.md` | `docs/30-workflows/completed-tasks/task-ut-chatview-error-banner-i18n-001.md` | Task 01 follow-up actual path |
| `docs/30-workflows/unassigned-task/task-chatview-ai-chat-error-code-inventory.md` | `docs/30-workflows/completed-tasks/task-ut-ai-chat-error-code-inventory-001.md` | Task 01 follow-up actual path |

## validation chain

| command / check | result | purpose |
| --- | --- | --- |
| `pnpm --filter @repo/desktop screenshot:chatview-error-silent-failure` | PASS | Task 01 画面証跡 5 件取得 |
| `pnpm --filter @repo/desktop screenshot:llm-selector-inline-guidance` | PASS | Task 02 画面証跡 4 件取得 |
| `pnpm --filter @repo/desktop screenshot:workspace-chat-stream-error` | PASS | Task 04 画面証跡 5 件取得 |
| `pnpm --filter @repo/desktop screenshot:task-fix-llm-config-persistence` | BLOCKED | Task 03 harness は追加済みだが `esbuild` arch mismatch で screenshot 未生成 |
| `validate-phase11-screenshot-coverage.js --workflow <Task01>` | PASS | Task 01 screenshot coverage |
| `validate-phase11-screenshot-coverage.js --workflow <Task02>` | PASS | Task 02 screenshot coverage |
| `validate-phase11-screenshot-coverage.js --workflow <Task04>` | PASS | Task 04 screenshot coverage |
| `validate-phase12-implementation-guide.js --workflow <Task03>` | 実行対象 | Task 03 guide 10/10 確認 |
| `validate-phase12-implementation-guide.js --workflow <Task01>` | PASS | Task 01 guide 10/10 |
| `validate-phase12-implementation-guide.js --workflow <Task02>` | PASS | Task 02 guide 10/10 |
| `validate-phase12-implementation-guide.js --workflow <Task04>` | PASS | Task 04 guide 10/10 |
| `verify-unassigned-links.js --source <Task03>/outputs/phase-12/unassigned-task-detection.md` | 実行対象 | Task 03 follow-up 2件 link 確認 |
| `verify-unassigned-links.js --source <Task02>/outputs/phase-12/unassigned-task-detection.md` | PASS | Task 02 follow-up link existence |
| `verify-unassigned-links.js --source <Task04>/outputs/phase-12/unassigned-task-detection.md` | PASS | Task 04 follow-up link existence |
| `audit-unassigned-tasks.js --json --target-file <Task02 2 files>` | PASS | Task 02 follow-up 2 件とも `currentViolations=0` |
| `generate-index.js` | PASS | topic-map / keywords 再生成 |
| `rsync -a .claude/... .agents/...` | PASS | mirror sync |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` | PASS | mirror parity |

## 運用メモ

- 本 inventory は「今回何を更新したか」ではなく、「次回同種課題で最短に参照すべき current set」を固定するための file である。
- UI task で current build screenshot が必要な場合は、placeholder を残さず capture script まで current workflow に含める。
