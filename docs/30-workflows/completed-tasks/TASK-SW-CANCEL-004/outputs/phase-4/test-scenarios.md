# Phase 4: テストシナリオ

## タスクID: TASK-SW-CANCEL-004

## テストマトリクス

| TC        | 対象                     | 観点                                                                           | 種別                  | ファイル                          |
| --------- | ------------------------ | ------------------------------------------------------------------------------ | --------------------- | --------------------------------- |
| TC-UT-01  | `useCancelGeneration.ts` | `cancelGeneration()` 呼び出し時に `skillCreatorAPI.cancelGeneration` が invoke | 既存（確認済み PASS） | `useCancelGeneration.test.ts`     |
| TC-UT-02  | `useCancelGeneration.ts` | `startGeneration()` 後に `cancelGeneration()` で signal.aborted が true        | 既存（確認済み PASS） | `useCancelGeneration.test.ts`     |
| TC-UT-03  | `useCancelGeneration.ts` | `cancelGeneration()` 後の Store `streamingStage` が `cancelled`                | 既存（確認済み PASS） | `useCancelGeneration.test.ts`     |
| TC-UT-04  | `useCancelGeneration.ts` | `skillCreatorAPI` が null でもクラッシュしない                                 | 既存（確認済み PASS） | `useCancelGeneration.test.ts`     |
| TC-CH-01  | `preload/channels.ts`    | `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が含まれる                 | コード確認（PASS）    | channels.ts L716                  |
| TC-UI-01  | `SkillCreateWizard.tsx`  | キャンセルボタンが `handleCancelGeneration` にバインドされている               | コード確認（PASS）    | SkillCreateWizard.tsx L641        |
| TC-E2E-01 | E2E 統合                 | `cancelGeneration()` で `window.skillCreatorAPI.cancelGeneration` が invoke    | 新規追加              | `useCancelGeneration.e2e.test.ts` |
| TC-E2E-02 | E2E 統合                 | `startGeneration()` → `cancelGeneration()` フローで AbortSignal が abort       | 新規追加              | `useCancelGeneration.e2e.test.ts` |
| TC-E2E-03 | E2E 統合                 | `cancelGeneration()` 後の Store 状態が `cancelled`                             | 新規追加              | `useCancelGeneration.e2e.test.ts` |
| TC-E2E-04 | E2E 統合                 | `skillCreatorAPI` が undefined でも `cancelGeneration()` が例外なく完了        | 新規追加              | `useCancelGeneration.e2e.test.ts` |

## E2E テストファイル

**パス**: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.e2e.test.ts`
**作成済み**: ✅

## 期待される Red/Green 状態

- 既存テスト（TC-UT-01〜04）: Green（Phase 5 修正前から Green のはず）
- E2E テスト（TC-E2E-01〜04）: Phase 4 時点で Green（hook レベルのテストは修正不要）
  - TC-E2E-02 のみ `startGeneration()` を呼んでから `cancelGeneration()` するため Green
  - WizardWrapper のテストがないため、AC-5（SkillCreateWizard での startGeneration 呼び出し）は Phase 5 実装後に確認
