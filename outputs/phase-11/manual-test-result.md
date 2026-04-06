# Phase 11: 手動テスト結果 — UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001

## メタ情報

| 項目     | 値                                                                 |
| -------- | ------------------------------------------------------------------ |
| 実行形態 | NON_VISUAL (CLI 環境のため Electron 起動不可)                      |
| 理由     | CLI 環境では Electron 起動不可。コンポーネントテストで動作保証済み |
| 対象証跡 | Vitest 全 27 テスト PASS / TypeScript typecheck 0 errors           |

## ウォークスルーシナリオ（テストによる代替検証）

| #   | シナリオ       | 検証方法                        | 結果 |
| --- | -------------- | ------------------------------- | ---- |
| 1   | デフォルト表示 | SF-01: aria-checked=true 確認   | PASS |
| 2   | warning+ 切替  | SF-03: info 非表示確認          | PASS |
| 3   | error 切替     | SF-04: warning/info 非表示確認  | PASS |
| 4   | all に戻す     | SF-02: 全 check 再表示確認      | PASS |
| 5   | reverify 後    | SF-07: フィルタ状態維持確認     | PASS |
| 6   | accordion 操作 | SF-08: フィルタ後も開閉動作確認 | PASS |
| 7   | 件数バッジ     | SF-06: カウント正確性確認       | PASS |

## アクセシビリティ確認

| 確認項目                          | 結果 | 根拠                                    |
| --------------------------------- | ---- | --------------------------------------- | --- | --- | --- | ---------- |
| `role="radiogroup"` が存在        | PASS | `screen.getByTestId("severity-filter")` |
| `aria-checked` が切替に応じて更新 | PASS | SF-01、SF-07 で aria-checked 属性確認   |
| ボタン要素でキーボード操作対応    | PASS | button 要素のためネイティブ対応         |
|                                   |      |                                         |     |     |     | Stash base |

# Phase 11: 手動テスト結果 — TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001

## メタ情報

| 項目     | 値                                                                                        |
| -------- | ----------------------------------------------------------------------------------------- |
| 実行形態 | NON_VISUAL_FALLBACK                                                                       |
| 理由     | UI/UX 変更を含まず、preload bundle と Vitest runtime の整合確認が主目的であるため         |
| 対象証跡 | build / typecheck / bundle fixed-string evidence / targeted vitest / relative import 監査 |

# Phase 11: 手動テスト結果 — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## 判定

NON_VISUAL walkthrough PASS（コンポーネントテスト全 27 件 PASS）
||||||| Stash base
NON_VISUAL walkthrough PASS

## 実測

| 項目                                                                         | 結果                      |
| ---------------------------------------------------------------------------- | ------------------------- |
| `pnpm --filter @repo/desktop build`                                          | PASS                      |
| `pnpm --filter @repo/desktop typecheck`                                      | PASS                      |
| `rg -c -F "@repo/shared/src/ipc/channels" apps/desktop/out/preload/index.js` | `0`                       |
| `rg -c -F "skill:list" apps/desktop/out/preload/index.js`                    | `2`                       |
| `rg -q -F "@repo/shared" apps/desktop/out/preload/index.js`                  | match 0件                 |
| targeted vitest                                                              | `2 files / 37 tests PASS` |
| `governance-bundle.test.ts` の relative import workaround                    | `0 件`                    |

## fallback reason

- renderer surface の追加・変更がないため screenshot capture は不要
- 代わりに preload bundle 出力とテスト実行結果を canonical evidence として採用した

## source evidence

- `apps/desktop/electron.vite.config.ts`
- `apps/desktop/vitest.config.ts`
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`
- `apps/desktop/out/preload/index.js`

## スクリーンショット

N/A

NON_VISUAL walkthrough PASS

## メタ情報

| 項目               | 値                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| 実行形態           | NON_VISUAL                                                                                                    |
| 対象               | `RuntimeSkillCreatorFacade.execute()` / `RuntimeSkillCreatorFacade.improve()` / renderer consumer type guards |
| 主証跡             | typecheck / eslint / targeted vitest / semantic review                                                        |
| スクリーンショット | N/A                                                                                                           |

## 実測

| コマンド                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 結果 | 補足                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------- |
| `pnpm --filter @repo/shared typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                   | PASS | shared 型定義の union 拡張を確認        |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                  | PASS | main / renderer consumer の型整合を確認 |
| `pnpm --filter @repo/desktop exec eslint src/main/services/runtime/RuntimeSkillCreatorFacade.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/renderer/components/skill/SkillCreateWizard.tsx src/renderer/components/skill/SkillLifecyclePanel.tsx` | PASS | 変更ファイルの lint 0 error             |
| `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`                                                                              | PASS | 4 files / 69 tests PASS                 |

## 判定根拠

- UI 変更がないためスクリーンショットは不要
- `execute()` / `improve()` の adapter guard は Main process の early return で確認済み
- `SkillCreateWizard` は execute ack 後に workflow snapshot を再読込し、failure を UI へ反映できることを確認済み
- improve 失敗時は `recordImproveFailureSnapshot()` により workflow snapshot が `improve` phase で維持されることを確認済み

## source evidence

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `packages/shared/src/types/skillCreator.ts`

## スクリーンショット

N/A
