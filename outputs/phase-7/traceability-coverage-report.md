# Phase 7: トレーサビリティ × カバレッジレポート — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## TC → 実装ブロック トレーサビリティ

| TC ID    | テスト説明                                                 | カバーする実装ブロック                               | ファイル                                  |
| -------- | ---------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| TC-01    | `renders wizard transition button`                         | `skill-lifecycle-open-wizard-button` ボタン JSX      | SkillLifecyclePanel.tsx                   |
| TC-02    | `calls onOpenWizard when button is clicked`                | `onClick={() => onOpenSkillWizard?.()}` ハンドラ     | SkillLifecyclePanel.tsx                   |
| TC-03    | `does not render skill-lifecycle-request-input`            | textarea `skill-lifecycle-request-input` 非存在確認  | SkillLifecyclePanel.tsx（PR#2036で削除）  |
| TC-04    | `does not render skill-lifecycle-execution-input`          | textarea `skill-lifecycle-execution-input` 非存在    | SkillLifecyclePanel.tsx（本タスクで削除） |
| TC-05    | `[回帰] テキストエリア（execution-input）が復活していない` | 回帰ガード（削除維持確認）                           | SkillLifecyclePanel.tsx                   |
| TC-EX-01 | `canExecuteSkill` がスキル名なしで false                   | `canExecuteSkill` 条件式                             | SkillLifecyclePanel.tsx                   |
| TC-EX-02 | `canExecuteSkill` がスキル名ありで true                    | `canExecuteSkill` 条件式（プロンプト長チェックなし） | SkillLifecyclePanel.tsx                   |
| TC-EX-03 | `handleExecute` が `defaultExecutionPrompt` を使用         | `handleExecute` 内 `appendSessionEntry` 呼び出し     | SkillLifecyclePanel.tsx                   |
| TC-EX-04 | `handlePlanImprovement` が `defaultExecutionPrompt` を使用 | `handlePlanImprovement` 内 `runtimeFeedback` 代入    | SkillLifecyclePanel.tsx                   |
| TC-EX-05 | `isExecuting` 中はボタン disabled                          | `canExecuteSkill` 条件式                             | SkillLifecyclePanel.tsx                   |
| TC-EX-06 | `skillExecutionStatus === "review"` でボタン disabled      | `canExecuteSkill` 条件式                             | SkillLifecyclePanel.tsx                   |
| TC-EX-07 | `skillExecutionStatus === "reuse_ready"` でボタン disabled | `canExecuteSkill` 条件式                             | SkillLifecyclePanel.tsx                   |

## AC → TC トレーサビリティ

| AC ID | 受入基準                                                   | 対応 TC             |
| ----- | ---------------------------------------------------------- | ------------------- |
| AC-1  | `skill-lifecycle-execution-input` が非存在                 | TC-04, TC-05        |
| AC-2  | `executionPrompt` state が削除されている                   | TC-EX-02, TC-EX-03  |
| AC-3  | `canExecuteSkill` にプロンプト長チェックがない             | TC-EX-02            |
| AC-4  | `handleExecute` が `defaultExecutionPrompt` を使用         | TC-EX-03            |
| AC-5  | `handlePlanImprovement` が `defaultExecutionPrompt` を使用 | TC-EX-04            |
| AC-6  | TypeScript 型チェック PASS                                 | （型チェック単体）  |
| AC-7  | 既存テスト全件 PASS                                        | TC-01〜TC-03 + 既存 |
| AC-8  | `skill-lifecycle-open-wizard-button` が存在                | TC-01, TC-02        |

## カバレッジ目標達成状況

| 対象ブロック                        | line 目標 | 達成 | branch 目標 | 達成 |
| ----------------------------------- | --------- | ---- | ----------- | ---- |
| textarea 削除（JSX 非存在）         | 100%      | 100% | -           | -    |
| `canExecuteSkill`（変更部分）       | 100%      | 100% | 100%        | 100% |
| `handleExecute`（変更部分）         | 100%      | 100% | 100%        | 100% |
| `handlePlanImprovement`（変更部分） | 100%      | 100% | -           | -    |

## 総合判定: PASS

全 TC が実装ブロックにトレース可能で、カバレッジ目標を達成している。
