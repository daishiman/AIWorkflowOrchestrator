# UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001: Safety Governance Production 統合

```yaml
issue_number: 1609
task_id: UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001
task_name: Safety Governance Production 統合
category: 改善
target_feature: ExecutionConsole
priority: 高
scale: 大規模
status: implemented_in_branch
source_phase: Phase 12
created_date: 2026-03-25
dependencies: []
```

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001    |
| 優先度   | 高                                              |
| 元タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 検出日   | 2026-03-25                                      |
| 由来     | Phase 12 UT-6, UT-7, UT-8, UT-9                 |

---

## 概要

TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 で作成した ApprovalGate・IPC handler・Renderer コンポーネントを production コードへ統合し、Main Process、Preload、Renderer、session cleanup の 4 層接続を完了した。

## 背景・苦戦箇所

実装完了後の current facts:

1. **IPC Handler 登録（UT-6）**: `main/ipc/index.ts` に 3 ハンドラを登録済み
2. **Preload API 公開（UT-7）**: `preload/index.ts` / `types.ts` に `execution` namespace を追加済み
3. **Approval Request Push（UT-8）**: `pushApprovalRequest()` を実装済み
4. **revokeAll() セッション終了（UT-9）**: `onSessionDestroyed` 経由で実行済み

残る大きな課題:

- disclosure 情報の runtime 注入
- session log / copy command の実データ連携

## 対応方針

## 実施内容

- `apps/desktop/src/main/ipc/index.ts` で `DefaultApprovalGate` を生成し、approval handler と Claude CLI handler に共有注入
- `apps/desktop/src/main/claude-cli/ipc-handler.ts` に `onSessionDestroyed` callback を追加
- `apps/desktop/src/preload/index.ts` / `types.ts` に `ExecutionAPI` を追加
- renderer hook を `getExecutionAPI()` 経由へ統一
- `approvalHandlers.push.test.ts` / `approvalGate.revokeAll.test.ts` / `index.integration.test.ts` / `index.execution.test.ts` を追加

## 検証

- `pnpm --dir apps/desktop exec vitest run src/main/ipc/__tests__/approvalGate.revokeAll.test.ts src/main/ipc/__tests__/approvalHandlers.push.test.ts src/main/ipc/__tests__/index.integration.test.ts src/preload/__tests__/index.execution.test.ts`: 72 tests PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gov-production-integration --phase 11`: PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gov-production-integration --phase 12`: PASS
- `outputs/phase-11/manual-test-result.md`: `not_run`（実機 walkthrough は未採取）

## 変更対象ファイル

| ファイル                                                | 変更種別 |
| ------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/index.ts`                    | 修正     |
| `apps/desktop/src/preload/index.ts`                     | 修正     |
| `apps/desktop/src/preload/types.ts`                     | 修正     |
| `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`    | 修正     |
| `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts` | 修正     |
| `apps/desktop/src/renderer/utils/executionApi.ts`       | 新規     |

## 完了条件

- [x] 3つの IPC handler が `main/ipc/index.ts` から登録されている
- [x] ApprovalGate が DI でハンドラに注入されている
- [x] Preload の contextBridge に execution API が公開されている
- [x] Main → Renderer の approval:request push が動作する
- [x] セッション終了時に revokeAll() が呼び出される
- [x] validator・対象テストが current facts と整合している
- [ ] 手動 NON_VISUAL walkthrough を実機で採取する
