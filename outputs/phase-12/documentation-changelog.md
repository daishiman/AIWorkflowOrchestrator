# Phase 12 成果物: 変更履歴（ドキュメント変更ログ）

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 変更履歴

| 日付       | 変更内容                                            | 変更ファイル                                                                                                                       | 実施タスク |
| ---------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 2026-04-14 | `generationMode` / `hasActivatedLlmMode` state 廃止 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                                 | Wave A     |
| 2026-04-14 | Step 0 ラジオボタン UI 削除・props 整理             | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                                                              | Wave A     |
| 2026-04-14 | `GenerationMode` の barrel export 廃止              | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`, `apps/desktop/src/renderer/components/skill/wizard/index.ts` | Wave A     |
| 2026-04-14 | TC-06 追加・旧フラグ残骸ゼロ確認                    | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                                                  | Wave B     |
| 2026-04-14 | store integration test 復帰と context 引数確認      | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx`                                | Wave B     |
| 2026-04-14 | Phase 11 screenshot 5 枚再取得                      | `outputs/phase-11/screenshots/*.png`                                                                                               | Wave B     |
| 2026-04-14 | Phase 12 docs / compliance / handover 作成          | `outputs/phase-12/*.md`                                                                                                            | Wave B     |

## 仕様更新の有無

仕様更新あり:

- ウィザードが LLM 専用モードに一本化
- template モードが廃止
- Step フローが Step 0→1→2→3 に確立
