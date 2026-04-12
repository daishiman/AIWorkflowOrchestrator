<<<<<<< Updated upstream

# Phase 11: 手動テストチェックリスト — UT-SKILL-WIZARD-W2-seq-03b

||||||| Stash base

# 手動テスト チェックリスト — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

=======

# 手動テストチェックリスト - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

> > > > > > > Stashed changes

<<<<<<< Updated upstream
| チェック項目 | 状態 |
| ----------------------------------------------------------------------------------------------------------------- | ---- |
| `pnpm --filter @repo/desktop typecheck` エラー 0 件 | ✅ |
| `wizard-exports.test.ts` が `13/13` PASS | ✅ |
| `wizard/index.ts` から `DescribeStep` / `DescribeStepProps` が非公開であること | ✅ |
| `wizard/index.ts` から `SkillInfoStepProps` / `GenerationMode` が参照可能であること | ✅ |
| `DescribeStep.tsx` に `@deprecated` が付与され、型 import が直接実装元を向いていること | ✅ |
| Step 0 / Step 1 の代表スクリーンショット 2 枚を current task 証跡として確認したこと | ✅ |
| `evidence-index.md` / `screenshot-plan.json` / `phase11-capture-metadata.json` が current task に同期していること | ✅ |
||||||| Stash base

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
- [x] # `discovered-issues.md` を作成した（0件でも作成必須）

## タスク種別: NON_VISUAL（スクリーンショット不要）

| チェック項目                             | 確認方法              | 結果 |
| ---------------------------------------- | --------------------- | ---- |
| AC-1: 2月31日 semantic=true でエラー     | TC-01 PASS            | ✅   |
| AC-2: 正常 cron semantic=true で null    | TC-04 PASS            | ✅   |
| AC-3: SCV-01〜SCV-12 全件 PASS           | vitest test.ts 17/17  | ✅   |
| AC-4: カバレッジ向上 Line≥90% Branch≥85% | 100% / 86.84%         | ✅   |
| AC-5: JSDoc に @param options.semantic   | grep 確認済み         | ✅   |
| 後方互換: options 未指定で従来動作       | TC-05, TC-06 PASS     | ✅   |
| TypeScript 型チェック PASS               | tsc --noEmit エラー 0 | ✅   |
| ESLint PASS                              | 0 errors              | ✅   |

## 既知制限リスト

| 制限ID  | 内容                                                                                                           | 対応方針       |
| ------- | -------------------------------------------------------------------------------------------------------------- | -------------- |
| LIM-001 | day-of-month と day-of-week の組み合わせは、`cron-parser@5.5.0` の実挙動に合わせて安全側に拒否される場合がある | 仕様として許容 |
| LIM-002 | タイムゾーンによる日付変更は考慮外（UTC基準のバリデーション）                                                  | スコープ外     |
| LIM-003 | `cron-parser` が返すエラーメッセージは英語のみ（i18n未対応）                                                   | 現状許容       |
| LIM-004 | `validateCronExpression` は「到達可能かどうか」を見るため、理由説明は返さない                                  | 現状仕様       |

> > > > > > > Stashed changes
