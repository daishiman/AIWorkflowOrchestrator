# Phase 2: 解決策設計書

## タスクID: TASK-SW-CANCEL-004

## 前提

Phase 1 監査結果: AC-1〜AC-4 PASS、AC-5 FAIL（startGeneration 未呼び出し）

## 設計方針

verify_existing モードのため、不足箇所（AC-5）のみ最小限の修正を行う。

## IPC E2E 確認導線（設計通り全て確認済み）

```
キャンセルボタン click (SkillCreateWizard.tsx L641)
  → handleCancelGeneration() [L553-557] ✅ 確認済み
    → cancelGeneration() [useCancelGeneration.ts:24-41] ✅ 確認済み
      → abortControllerRef.current?.abort()   ← ❌ startGeneration 未呼び出しで null
      → setStage("cancelled")                 ✅
      → skillCreatorAPI?.cancelGeneration?.() ← ✅ IPC invoke
        → Preload: safeInvoke(SKILL_CREATOR_CANCEL) [skill-creator-api.ts:726-727] ✅
          → Main: ipcMain.handle(SKILL_CREATOR_CANCEL) ✅ CANCEL-003 完了済み
            → skillCreatorService.cancelCurrentOperation() ✅ CANCEL-001/002 完了済み
```

## 修正設計（Pattern B）

### 対象ファイル

`apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

### 修正内容

1. L324: `cancelGeneration` のみ destructure → `{ cancelGeneration, startGeneration }` に変更
2. `handleGenerate()` 冒頭（L466 の generationLockRef.current = true の後）: `startGeneration()` を呼び出す

### 修正コード（差分）

```typescript
// Before (L324)
const { cancelGeneration } = useCancelGeneration();

// After
const { cancelGeneration, startGeneration } = useCancelGeneration();
```

```typescript
// Before (handleGenerate 内 L466 付近)
generationLockRef.current = true;
invalidateGenerationRequests();

// After
generationLockRef.current = true;
startGeneration(); // AbortController を初期化し、cancelGeneration() が abort できる状態にする
invalidateGenerationRequests();
```

### 修正の限界と将来課題

`createSkill` (agentSlice.ts:1200) は AbortSignal パラメータを持たないため、signal を渡す完全な consumer wiring は行わない。
将来タスクとして「createSkill に AbortSignal サポートを追加する」を unassigned-task-detection に記録する。

## E2E テスト設計

**ファイル**: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.e2e.test.ts`

| TC        | 検証内容                                                                                     | 期待結果                         |
| --------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| TC-E2E-01 | `cancelGeneration()` 呼び出し時に `window.skillCreatorAPI.cancelGeneration` が invoke される | mock が 1 回呼ばれる             |
| TC-E2E-02 | `startGeneration()` → `cancelGeneration()` フローで signal.aborted が true                   | `signal.aborted === true`        |
| TC-E2E-03 | `cancelGeneration()` 後に Store の `streamingStage` が `cancelled`                           | `streamingStage === "cancelled"` |
| TC-E2E-04 | `skillCreatorAPI` が undefined でも `cancelGeneration()` がクラッシュしない                  | 例外 throw されない              |
