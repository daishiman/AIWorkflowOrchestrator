# 手動テスト チェックリスト — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## 事前確認

- [x] Phase 5 実装が完了している
- [x] TypeScript 型チェックが通過している（`pnpm --filter @repo/desktop typecheck`）

## 自動テスト実行

- [x] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/` を実行した
- [x] 全テストが PASS した（85 PASS / 18 SKIP）
- [x] テスト件数・実行時刻を記録した

## 受入基準確認

- [x] AC-1: `skill-lifecycle-execution-input` textarea が DOM に存在しない（TC-04, TC-05 PASS）
- [x] AC-2: `executionPrompt` state が削除されている
- [x] AC-3: `canExecuteSkill` にプロンプト長チェックがない
- [x] AC-4: `handleExecute` が `defaultExecutionPrompt` を使用している
- [x] AC-5: `handlePlanImprovement` が `defaultExecutionPrompt` を使用している
- [x] AC-6: TypeScript 型チェック PASS
- [x] AC-7: 既存ユニットテスト全件 PASS
- [x] AC-8: `skill-lifecycle-open-wizard-button` が存在する（TC-01, TC-02 PASS）

## VISUAL 確認

- [x] UI コンポーネントの表示確認を light / dark の 2 パターンで実施した
- [x] `skill-lifecycle-open-wizard-button` と textarea 非存在をスクリーンショットで確認した
- [x] current task 専用の screenshot plan / coverage を作成した
- [x] `outputs/phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/skill-lifecycle-panel-light.png` を保存した
- [x] `outputs/phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/skill-lifecycle-panel-dark.png` を保存した

## 完了確認

- [x] `manual-test-result.md` を作成・記入した
- [x] `discovered-issues.md` を作成した（0件でも作成必須）
