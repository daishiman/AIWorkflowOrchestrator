# Implementation Guide

## Part 1: 中学生レベルの説明

この task の目的は、「実行の流れを覚える場所」と「画面へ返す答えを作る場所」を分けることです。

- `SkillCreatorWorkflowEngine` は、今どの phase か、次に人の確認が必要か、verify の結果はどうか、再開に必要な情報は何かを覚えます。
- `RuntimeSkillCreatorFacade` は、API キーの有無を見て route を決め、画面へ返す `integrated_api` / `terminal_handoff` の返事を作ります。

これで「流れ」と「入口」が同じクラスに混ざらなくなり、後続 task が同じ前提で設計できます。

## Part 2: 技術者向け説明

### 実装した主要ポイント

1. `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
   - `recordPlanResult()`
   - `recordExecuteStart()`
   - `recordExecuteResult()`
   - `recordExecuteHandoff()`
   - `recordVerifyFailure()`
   - `getWorkflowState()`

2. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
   - workflow engine DI を追加
   - `plan()` 成功時に review state を記録
   - `execute()` で `terminal_handoff` 判定時は executor を呼ばず bundle を返却
   - integrated path では execute 開始と verify 遷移を engine へ記録
   - `getWorkflowStateSnapshot()` をテスト用に追加

3. `apps/desktop/src/main/services/skill/ResourceLoader.ts`
   - `getBasePath()` を追加し、`resolvedSkillCreatorRoot` provenance を engine に渡せるようにした

### public contract

- `planSkill()`, `executePlan()`, `improveSkillWithFeedback()` の public method 名は維持
- `RuntimeSkillCreatorExecuteResponse` の union は shared contract のまま維持
- IPC / preload の channel 名は変更なし

### 代表テスト

- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`

### 検証コマンド

```bash
ESBUILD_BINARY_PATH=$PWD/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild \
  pnpm vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts
```
