# AI Chat / LLM Integration Fix artifact inventory

## 対象 wave

| 項目 | 値 |
| --- | --- |
| wave date | 2026-03-20 |
| parent workflow | `docs/30-workflows/ai-chat-llm-integration-fix/index.md` |
| primary implemented task | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` |
| related workflow specs | `tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/`, `tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/`, `tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/` |
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
| lessons | `references/lessons-learned-current.md`, `references/lessons-learned-ipc-preload-runtime.md` |
| navigation index | `indexes/resource-map.md`, `indexes/quick-reference.md`, `indexes/topic-map.md`, `indexes/keywords.json` |
| legacy compatibility | `references/legacy-ordinal-family-register.md` |
| skill update guidance | `.claude/skills/skill-creator/references/update-process.md`, `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` |

## workflow-local artifacts

### Task 01 root

| artifact | path | purpose |
| --- | --- | --- |
| workflow root | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | Task 01 canonical root |
| phase 11 plan | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-11-manual-test.md` | TC-11-01..05 の手動試験正本 |
| phase 11 result | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/manual-test-result.md` | 手動試験結果 |
| screenshot plan | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/screenshot-plan.md` | capture 方針 |
| screenshot coverage | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/screenshot-coverage.md` | coverage 判定 |
| screenshots | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/screenshots/TC-11-01-default-light.png` ほか 4 件 | 画面証跡 |
| phase 12 guide | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/implementation-guide.md` | Task 1 成果物 |
| phase 12 summary | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/system-spec-update-summary.md` | Step 1-A〜1-D / Step 2 実績 |
| phase 12 changelog | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/documentation-changelog.md` | 変更ログ |
| phase 12 unassigned | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/unassigned-task-detection.md` | follow-up 2件の formalize 記録 |
| phase 12 feedback | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/skill-feedback-report.md` | skill feedback |
| phase 12 compliance | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/phase12-task-spec-compliance-check.md` | 準拠チェック |
| verification report | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/verification-report.md` | 実行結果集約 |

### parent workflow / sibling specs

| artifact | path | purpose |
| --- | --- | --- |
| parent overview | `docs/30-workflows/ai-chat-llm-integration-fix/index.md` | 4 タスク family overview |
| task 02 spec | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` | selector guidance workflow |
| task 03 spec | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` | persistence workflow |
| task 04 spec | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/` | workspace error workflow |

## follow-up 未タスク

| task | path | role | issue |
| --- | --- | --- | --- |
| `UT-CHATVIEW-ERROR-BANNER-I18N-001` | `docs/30-workflows/unassigned-task/task-ut-chatview-error-banner-i18n-001.md` | 文言辞書化と i18n 分離 | `#1398` |
| `UT-CHATVIEW-ERROR-CODE-INVENTORY-001` | `docs/30-workflows/unassigned-task/task-ut-ai-chat-error-code-inventory-001.md` | ai.chat code inventory の formalization | `#1397` |

## 同一 wave で更新した canonical docs

| category | files |
| --- | --- |
| workflow spec | `references/workflow-ai-chat-llm-integration-fix.md`, `references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md` |
| contracts | `references/llm-ipc-types.md`, `references/error-handling-core.md`, `references/arch-state-management-core.md` |
| UI / runtime | `references/ui-ux-llm-selector.md`, `references/llm-streaming.md` |
| ledger / lessons | `references/task-workflow.md`, `references/task-workflow-completed-chat-lifecycle-tests.md`, `references/task-workflow-backlog.md`, `references/lessons-learned-current.md`, `references/lessons-learned-ipc-preload-runtime.md` |
| navigation / compatibility | `indexes/resource-map.md`, `indexes/quick-reference.md`, `references/legacy-ordinal-family-register.md` |
| logs | `LOGS.md`, `.claude/skills/task-specification-creator/LOGS.md`, `.claude/skills/skill-creator/LOGS.md` |

## legacy path / filename compatibility

| legacy | current | note |
| --- | --- | --- |
| `docs/30-workflows/ai-chat-llm-integration-fix/tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` | Task 01 canonical root drift を是正 |
| `docs/30-workflows/unassigned-task/task-chatview-error-message-i18n-support.md` | `docs/30-workflows/unassigned-task/task-ut-chatview-error-banner-i18n-001.md` | semantic filename へ移行 |
| `docs/30-workflows/unassigned-task/task-chatview-ai-chat-error-code-inventory.md` | `docs/30-workflows/unassigned-task/task-ut-ai-chat-error-code-inventory-001.md` | semantic filename へ移行 |

## validation chain

| command / check | result | purpose |
| --- | --- | --- |
| `pnpm --filter @repo/desktop screenshot:chatview-error-silent-failure` | PASS | 画面証跡 5 件取得 |
| `pnpm exec vitest run src/renderer/store/slices/chatSlice.test.ts src/renderer/views/ChatView/ChatView.test.tsx` | PASS | 95 tests |
| `validate-phase11-screenshot-coverage.js --workflow <Task01>` | PASS | screenshot coverage |
| `validate-phase12-implementation-guide.js --workflow <Task01>` | PASS | guide 10/10 |
| `validate-phase-output.js <Task01>` | PASS | workflow output consistency |
| `verify-all-specs.js --workflow <Task01>` | PASS | 13/13, 0 warning |
| `verify-unassigned-links.js --source .../unassigned-task-detection.md` | PASS | follow-up link existence |
| `audit-unassigned-tasks.js --json --target-file <2 files>` | PASS | 2 件とも `currentViolations=0` |
| `generate-index.js` | PASS | topic-map / keywords 再生成 |
| `validate-structure.js` | WARN | 既存 3 ファイルが 500 行超過。今回 wave の追加ファイルは 500 行未満 |
| `rsync -a .claude/... .agents/...` | PASS | mirror sync |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` | PASS | mirror parity |

## 運用メモ

- 本 inventory は「今回何を更新したか」ではなく、「次回同種課題で最短に参照すべき current set」を固定するための file である。
- 500 行制限を超えそうな場合は、Task 01 専用 inventory と family inventory に分割する。
