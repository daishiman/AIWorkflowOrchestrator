<<<<<<< Updated upstream

# Phase 6: 拡張テストケース

||||||| Stash base

# Phase 6: 拡張テストケース — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

=======

# 拡充テストケース記録 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

> > > > > > > Stashed changes

<<<<<<< Updated upstream

## 追加した inferSmartDefaults エッジケース

||||||| Stash base

## 概要

=======

## TC-09〜TC-16 一覧

> > > > > > > Stashed changes

<<<<<<< Updated upstream
| テストケース | 期待結果 | ファイル |
| -------------------------- | ---------------------------- | -------------------------- |
| purpose='SLACK'（大文字） | tool='slack'（大小文字不問） | SkillCreateWizard.test.tsx |
| purpose='github'（小文字） | tool='github' | SkillCreateWizard.test.tsx |
| purpose='Notion' | tool='notion' | SkillCreateWizard.test.tsx |
| purpose='定期' | timing='scheduled' | SkillCreateWizard.test.tsx |
| purpose='リアルタイム' | timing='realtime' | SkillCreateWizard.test.tsx |
| category='data-analysis' | format='structured' | SkillCreateWizard.test.tsx |
| purpose='' | 全フィールド null | SkillCreateWizard.test.tsx |
| 推論0件 | inferenceLog が空配列 | SkillCreateWizard.test.tsx |
||||||| Stash base
Phase 4 の基本テスト（TC-04, TC-05）に加え、関連する境界条件と回帰シナリオを確認した。
=======
| TC ID | cron 式 | semantic | 期待結果 | 観点 |
| ----- | ---------------- | -------- | ----------------- | ------------------------------------------------- |
| TC-09 | `"0 0 30 2 *"` | `true` | エラー（非 null） | 2月30日も存在しない |
| TC-10 | `"0 0 31 4 *"` | `true` | エラー（非 null） | 4月31日は存在しない（4月���30日まで） |
| TC-11 | `"0 0 31 6 *"` | `true` | エラー（非 null） | 6月31日は存在しない |
| TC-12 | `"0 0 31 9 *"` | `true` | エラー（非 null） | 9月31日は存在しない |
| TC-13 | `"0 0 31 11 *"` | `true` | エラー（非 null） | 11月31日は存在しない |
| TC-14 | `"0 0 31 4 *"` | `false` | PASS（null） | semantic=false は後方互換 |
| TC-15 | `""` | `true` | エラー（非 null） | 空文字は semantic チェック前に構文エラーで reject |
| TC-16 | `"0 0 31 2 1-5"` | `true` | エラー（非 null） | cron-parser の実挙動に合わせ、安全側に到達不能として扱う |

> > > > > > > Stashed changes

<<<<<<< Updated upstream

## STEPS 配列回帰テスト

||||||| Stash base

## 拡張テストケース一覧

=======

## TC-16 安全側判定の仕様確定

> > > > > > > Stashed changes

<<<<<<< Updated upstream
| テストケース | 期待結果 |
| ----------------------------------------------------- | -------- |
| STEPS === ["スキル情報入力","詳細設定","生成","完了"] | ✅ |
| STEPS.length === 4 | ✅ |
||||||| Stash base
| TC番号 | シナリオ | 検証内容 | 結果 |
| -------- | ---------------------------------------------------------- | ----------------------------------------- | ---- |
| TC-EX-01 | `canExecuteSkill` がスキル名なしで false | `createdSkillName` なし → ボタン disabled | PASS |
| TC-EX-02 | `canExecuteSkill` がスキル名ありで true | プロンプト長チェック除去を確認 | PASS |
| TC-EX-03 | `handleExecute` が `defaultExecutionPrompt` を使用する | `appendSessionEntry` に定数が渡る | PASS |
| TC-EX-04 | `handlePlanImprovement` が `defaultExecutionPrompt` を使用 | `runtimeFeedback` が定数値と一致 | PASS |
| TC-EX-05 | `isExecuting` 中はボタン disabled | 実行中フラグによる排他制御 | PASS |
| TC-EX-06 | `skillExecutionStatus === "review"` でボタン disabled | レビュー状態の排他制御 | PASS |
| TC-EX-07 | `skillExecutionStatus === "reuse_ready"` でボタン disabled | 再利用準備状態の排他制御 | PASS |
=======
`cron-parser@5.5.0` は day-of-month と day-of-week の複合指定を安全側に判定する。
`"0 0 31 2 1-5"` は `CronExpressionParser.parse()` 段階で例外 "Invalid explicit day of month definition" を投げる。

> > > > > > > Stashed changes

<<<<<<< Updated upstream

## TASK-SC-07 テストの skip 処理

||||||| Stash base

## 境界条件メモ

=======
判断: TC-16 の期待値を `not.toBeNull()` とし、安全側判定を採用。ユーザーには「2月31日」という存在しない日付の組み合わせとして適切なエラーが表示される。

> > > > > > > Stashed changes

<<<<<<< Updated upstream
`SkillCreateWizard.llm-generation.test.tsx` の describe ブロックを `describe.skip` に変更。
||||||| Stash base

- `executionPrompt.trim().length > 0` チェックが削除されたことで、以前は空欄で blocked だった実行フローが unblocked になった
- `defaultExecutionPrompt` 定数（"このスキルの基本動作を確認し、改善余地があれば短くまとめてください。"）が唯一の実行プロンプトソースとなった
- # `improve_ready` / 通常実行の分岐はいずれも `defaultExecutionPrompt` を参照するため、両パスで一貫した動作

## テスト実行結果

> > > > > > > Stashed changes

<<<<<<< Updated upstream

- 理由: W2-seq-03a でラジオボタン UI・planSkill/executePlan フローを削除
- 新フロー（createSkill ベース）は `SkillCreateWizard.test.tsx` でカバー済み
- TODO コメントを追加（W2-seq-03a 参照）
  ||||||| Stash base

## 判定

# 拡張テスト全件 PASS。境界条件に問題なし。

```
Tests  42 passed (42)
- scheduleConfigValidator.edge.test.ts: 25 tests passed
- scheduleConfigValidator.test.ts: 17 tests passed
```

> > > > > > > Stashed changes
