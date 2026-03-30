# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 10                                      |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

最終レビューゲート（受入基準最終確認）。AC-1〜AC-7 の充足、Phase 2 設計との整合、MINOR 指摘の対応状況、セキュリティ・パフォーマンスの最終確認を行い、Phase 11 へ進めるかを判定する。

## 実行タスク

### Task 10-1: AC-1〜AC-7 最終確認

各受入基準について、実装エビデンスとテストエビデンスを突合する。

| AC   | 要件                                                                  | 実装エビデンス                                                            | テストエビデンス                                                              | 判定 |
| ---- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---- |
| AC-1 | verify 全チェック PASS 時に `recordVerifyPass()` が呼ばれ状態遷移する | `SkillCreatorWorkflowEngine.recordVerifyPass()` 実装                      | UT: 全 PASS checks → `verifyResult.status === "pass"` 確認                    | [ ]  |
| AC-2 | verify 失敗時に自動で improve が起動される                            | `verifyAndImproveLoop()` 内で `improve()` + `applyImprovement()` 呼び出し | UT: 失敗 checks → `improve()` + `applyImprovement()` が呼ばれることを確認     | [ ]  |
| AC-3 | improve 後に自動で re-verify が実行される                             | while ループで verify 実行へ戻る                                          | UT: improve 成功後 → `verify()` が再度呼ばれることを確認                      | [ ]  |
| AC-4 | maxImproveRetry 到達時にループが停止し `loopExhausted` になる         | `attemptCount >= maxRetry` チェック → `loopExhausted: true`               | UT: 3回失敗後 → `loopExhausted: true`、4回目の improve は呼ばれないことを確認 | [ ]  |
| AC-5 | improve 中のエラーでループが安全に停止する                            | try-catch で improve/apply エラーを捕捉 → `recordVerifyFailure("review")` | UT: LLM エラー → ループ停止、エラーが `errorMessage` に記録されることを確認   | [ ]  |
| AC-6 | `RuntimeSkillCreatorFacade` に閉ループエントリーポイントが追加される  | `verifyAndImproveLoop()` メソッド実装                                     | UT: メソッドの存在と正しい動作を確認                                          | [ ]  |
| AC-7 | 既存の手動 `reverifyWorkflow()` が影響を受けない                      | 既存メソッドは変更なし。新規メソッド追加のみ                              | UT: 既存テスト（25件+）が全て PASS（リグレッションなし）                      | [ ]  |

### Task 10-2: Phase 2 設計との乖離チェック

**対象**: `phase-2-design.md` の設計内容と実際の実装を比較する。

| チェック項目                                | 設計（Phase 2）                                                        | 実装（実際） | 乖離 | 判定 |
| ------------------------------------------- | ---------------------------------------------------------------------- | ------------ | ---- | ---- |
| `recordVerifyPass()` シグネチャ             | `(planId: string, checks: RuntimeSkillCreatorVerifyCheck[])`           | 実装と突合   | [ ]  | [ ]  |
| `recordImproveAttempt()` シグネチャ         | `(planId: string, failedChecks: RuntimeSkillCreatorVerifyCheck[])`     | 実装と突合   | [ ]  | [ ]  |
| `getImproveAttemptCount()` シグネチャ       | `(planId: string): number`                                             | 実装と突合   | [ ]  | [ ]  |
| `verifyAndImproveLoop()` シグネチャ         | `(planId, skillDir, skillName, authMode, apiKey?): Promise<...Result>` | 実装と突合   | [ ]  | [ ]  |
| `formatVerifyChecksAsFeedback()` シグネチャ | `(checks: RuntimeSkillCreatorVerifyCheck[]): string`                   | 実装と突合   | [ ]  | [ ]  |
| 状態遷移: verify PASS → handoff             | `recordVerifyPass()` → `status: "pass"`, `nextAction: "handoff"`       | 実装と突合   | [ ]  | [ ]  |
| 状態遷移: maxRetry → review                 | `loopExhausted: true` → `recordVerifyFailure("review")`                | 実装と突合   | [ ]  | [ ]  |
| ループ停止条件（4条件）                     | 全PASS / maxRetry到達 / エラー発生 / 改善提案0件                       | 実装と突合   | [ ]  | [ ]  |

### Task 10-3: MINOR 指摘（MR-01/MR-02）対応確認

Phase 3 設計レビューで検出された MINOR 指摘の対応状況を確認する。

| ID    | 指摘内容                                                                                    | 対応方針（Phase 3 決定）         | 対応状況 | 判定 |
| ----- | ------------------------------------------------------------------------------------------- | -------------------------------- | -------- | ---- |
| MR-01 | LLM が同じ修正を繰り返すリスク: 前回の improve 内容を次回フィードバックに含めると効果的     | 将来の未タスク候補として記録     | [ ]      | [ ]  |
| MR-02 | `verificationEngine` 未DI時に全PASSとなり、閉ループが verify をスキップする設定ミスのリスク | Phase 5 で `console.warn` を追加 | [ ]      | [ ]  |

**確認事項**:

- [ ] MR-01: 未タスク候補として Phase 12 ドキュメント更新で記録予定であることを確認
- [ ] MR-02: `verifyAndImproveLoop()` 内で `verificationEngine` 未DI時に `console.warn` が出力されることを確認
- [ ] MR-02: `console.warn` のメッセージが設定ミスの可能性を明確に伝えていることを確認

### Task 10-4: セキュリティ最終確認

| 確認項目                         | 確認内容                                                                                        | 判定 |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ---- |
| LLM 応答のバリデーション         | `improve()` の結果が `applyImprovement()` に渡される前にバリデーションされているか              | [ ]  |
| パス横断防止の依存確認           | `applyImprovement()` が `SkillFileWriter` のパス横断防止バリデーションに依存していることを確認  | [ ]  |
| `maxImproveRetry` による制御確認 | `maxImproveRetry` のデフォルト値（3）と安全上限（10）が実装されていることを確認                 | [ ]  |
| フィードバック文字列の安全性     | `formatVerifyChecksAsFeedback()` が内部データのみを使用し、外部入力の注入リスクがないことを確認 | [ ]  |
| ループ内の LLM 呼び出し回数上限  | 最大 `maxImproveRetry` 回の LLM 呼び出しに制限されていることを確認                              | [ ]  |

### Task 10-5: パフォーマンス確認

| 確認項目                     | 確認内容                                                                                     | 判定 |
| ---------------------------- | -------------------------------------------------------------------------------------------- | ---- |
| ループの最大実行時間見積もり | `maxRetry(3)` x (`verify` + `improve` + `apply`) の所要時間を見積もる                        | [ ]  |
| 非同期処理のブロッキング     | `verifyAndImproveLoop()` が async/await で非同期実行され、メインプロセスをブロックしないこと | [ ]  |
| 不必要な同期処理の有無       | ループ内で不必要な同期ファイル操作がないことを確認                                           | [ ]  |

**所要時間見積もり**:

| ステップ             | 推定時間（1回あたり） | 根拠                                  |
| -------------------- | --------------------- | ------------------------------------- |
| verify 実行          | 100-500ms             | ファイルシステムチェック（Layer 1/2） |
| improve LLM 呼び出し | 3-15秒                | LLM API レスポンス時間                |
| apply 改善           | 100-500ms             | ファイル書き込み                      |
| **1ループ合計**      | **3.2-16秒**          |                                       |
| **最大合計（3回）**  | **9.6-48秒**          | `maxImproveRetry` = 3 の場合          |

### Task 10-6: TASK-P0-01 との整合性確認

| 確認項目                                            | 確認内容                                                                           | 判定 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- | ---- |
| 既存 `verifySkill()` API が破壊されていない         | `RuntimeSkillCreatorFacade.verifySkill()` のシグネチャ・動作が変更されていないこと | [ ]  |
| 既存 `recordVerifyFailure()` が変更されていない     | `SkillCreatorWorkflowEngine.recordVerifyFailure()` の動作が変更されていないこと    | [ ]  |
| 既存 `requestReverify()` が変更されていない         | 手動 re-verify フローが影響を受けていないこと                                      | [ ]  |
| `SkillCreatorVerificationEngine` が変更されていない | Layer 1/2 の verify チェックロジックが変更されていないこと                         | [ ]  |
| 型の後方互換性                                      | 新規フィールドが全て optional であり、既存コードが破壊されていないこと             | [ ]  |

## レビュー総合判定

| 判定     | 結果 |
| -------- | ---- |
| **総合** | [ ]  |
| CRITICAL | 0件  |
| MAJOR    | 0件  |
| MINOR    | [ ]  |

## MINOR 追跡テーブル

Phase 3 で検出された MINOR 指摘と、本 Phase で新たに検出された指摘を追跡する。

| ID    | 発見Phase | 指摘内容                                           | 対応状況                         | 未タスク化 |
| ----- | --------- | -------------------------------------------------- | -------------------------------- | ---------- |
| MR-01 | Phase 3   | LLM が同じ修正を繰り返すリスク                     | 将来の未タスク候補として記録予定 | [ ]        |
| MR-02 | Phase 3   | `verificationEngine` 未DI時に `console.warn` 追加  | Phase 5 で実装済みか確認         | N/A        |
| MR-xx | Phase 10  | （本 Phase で新たに検出された MINOR があれば記録） | -                                | [ ]        |

## 参照資料

| 資料名                                       | パス                                                                       | 説明                      |
| -------------------------------------------- | -------------------------------------------------------------------------- | ------------------------- |
| Phase 1 要件                                 | `phase-1-requirements.md`                                                  | 要件定義・AC 定義         |
| Phase 2 設計                                 | `phase-2-design.md`                                                        | 詳細設計・シグネチャ定義  |
| Phase 3 設計レビュー                         | `phase-3-design-review.md`                                                 | MINOR 指摘 MR-01/MR-02    |
| Phase 9 品質保証                             | `phase-9-quality-assurance.md`                                             | 品質ゲート結果            |
| WorkflowEngine                               | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`     | 状態管理の拡張対象        |
| Facade                                       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`      | パイプライン追加先        |
| VerificationEngine                           | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` | verify 実行元（変更なし） |
| ヘルパー関数                                 | `apps/desktop/src/main/services/runtime/formatVerifyChecksAsFeedback.ts`   | ユーティリティ            |
| 型定義                                       | `packages/shared/src/types/skillCreator.ts`                                | 型追加先                  |
| 要件定義書                                   | `outputs/phase-1/phase-1-requirements.md`                                  | Phase 1 成果物            |
| 状態遷移・型定義・メソッドシグネチャの設計書 | `outputs/phase-2/phase-2-design.md`                                        | Phase 2 成果物            |

## 統合テスト連携

| 観点                  | 内容                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------ |
| Phase 9 結果の活用    | Phase 9 の品質ゲート結果を本レビューの判定根拠として参照する                         |
| Phase 11 への引き継ぎ | PASS 判定の場合、Phase 11 手動テスト検証に進む                                       |
| MINOR 追跡            | Phase 3 MINOR（MR-01/MR-02）+ 本 Phase の MINOR を Phase 12 で未タスク候補として記録 |

## 成果物

| 成果物           | パス                                     | 説明             |
| ---------------- | ---------------------------------------- | ---------------- |
| 最終レビュー記録 | `phase-10-final-review.md`（本ファイル） | レビュー判定結果 |

## 完了条件

- [ ] AC-1〜AC-7 の全受入基準が実装・テストで充足されていることを確認済み
- [ ] Phase 2 設計との乖離がないこと（または正当な理由で乖離を文書化済み）を確認済み
- [ ] MINOR 指摘（MR-01/MR-02）の対応状況が確認されている
- [ ] セキュリティ最終確認が完了している
- [ ] パフォーマンス確認が完了している
- [ ] TASK-P0-01 との整合性が確認されている
- [ ] レビュー総合判定（PASS/CRITICAL/MAJOR/MINOR）が記録されている
- [ ] MINOR 指摘は未タスク候補として追跡テーブルに記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト検証
