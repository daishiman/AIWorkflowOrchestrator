# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 11                                      |
| 機能名     | task-imp-verify-improve-revert-loop-002 |
| タスクID   | TASK-P0-02                              |
| タスク種別 | 機能追加                                |
| UI task    | No                                      |
| 作成日     | 2026-03-30                              |

## 目的

verify→improve→re-verify 閉ループの手動テスト検証を実施し、実装が AC-1〜AC-7 を満たすことを確認する。

## タスク分類判定

| 項目               | 判定                        | 理由                                    |
| ------------------ | --------------------------- | --------------------------------------- |
| UI task            | No                          | Main Process 層のバックエンドロジック   |
| docs-only task     | No                          | コード変更あり                          |
| テスト方法         | ユニットテスト + 結合テスト | UIなしのバックエンドロジック            |
| スクリーンショット | 不要                        | NON_VISUAL 判定。視覚的な変更がないため |

> **NON_VISUAL**: UI 変更を伴わない Main Process 層の機能追加のため、Apple UI/UX 視覚検証およびスクリーンショットは不要。

## 実行タスク

### Task 11-1: テスト用スキルディレクトリの準備

#### 11-1-A: verify 失敗スキルディレクトリの作成

以下の条件を持つテスト用スキルディレクトリを準備する:

| 条件                 | 内容                                             |
| -------------------- | ------------------------------------------------ |
| ディレクトリ名       | `test-skill-fail/`                               |
| SKILL.md             | 不完全（`Trigger` セクション欠落等）             |
| references/          | 未作成（Layer 1 チェック失敗を誘発）             |
| 期待する verify 結果 | 1件以上の `severity: "error"` チェックが失敗する |

#### 11-1-B: verify 成功スキルディレクトリの作成

| 条件                 | 内容                      |
| -------------------- | ------------------------- |
| ディレクトリ名       | `test-skill-pass/`        |
| SKILL.md             | 全必須セクション完備      |
| references/          | 存在し、最低1ファイル配置 |
| agent-spec.md        | 存在                      |
| 期待する verify 結果 | 全チェック PASS           |

### Task 11-2: verify 全チェック PASS シナリオの確認

| 項目     | 内容                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 前提条件 | Task 11-1-B の valid スキルディレクトリが準備済み。`SkillCreatorVerificationEngine` が DI 済み                                 |
| 操作手順 | 1. `verifyAndImproveLoop(planId, skillDir, skillName, authMode)` を呼び出す<br>2. valid スキルディレクトリを対象に verify 実行 |
| 期待結果 | - `recordVerifyPass()` が呼ばれている<br>- 返却値: `finalStatus: "pass"`<br>- `loopExhausted: false`<br>- `totalAttempts: 0`   |
| 検証方法 | - ユニットテストで mock の呼び出し検証<br>- 返却値のフィールド値を assert                                                      |
| 対応AC   | AC-1                                                                                                                           |
| 判定     | -                                                                                                                              |

### Task 11-3: verify 失敗 → improve → re-verify PASS シナリオの確認

| 項目     | 内容                                                                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | Task 11-1-A の失敗スキルディレクトリ。モック LLM が1回目の improve で正しい修正を返す設定                                                                                                                                                         |
| 操作手順 | 1. `verifyAndImproveLoop()` を呼び出す<br>2. 1回目: verify 失敗 → `formatVerifyChecksAsFeedback()` でフィードバック生成<br>3. `improve()` 呼び出し → モック LLM が修正提案を返す<br>4. `applyImprovement()` 実行<br>5. 2回目: re-verify → 全 PASS |
| 期待結果 | - ループ実行: verify(fail) → improve → re-verify(pass)<br>- `totalAttempts: 1`<br>- `finalStatus: "pass"`<br>- `loopExhausted: false`<br>- `recordImproveAttempt()` が1回呼ばれている<br>- `recordVerifyPass()` が最終的に呼ばれている            |
| 検証方法 | - モック LLM / モック `applyImprovement` を使用<br>- `improve()` の呼び出し引数にフィードバック文字列が含まれることを検証                                                                                                                         |
| 対応AC   | AC-2, AC-3                                                                                                                                                                                                                                        |
| 判定     | -                                                                                                                                                                                                                                                 |

### Task 11-4: maxImproveRetry 到達シナリオの確認

| 項目     | 内容                                                                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | モック LLM が常に不十分な修正を返す（re-verify が毎回失敗）。`maxImproveRetry: 2` に設定                                                                                                     |
| 操作手順 | 1. `verifyAndImproveLoop()` を呼び出す<br>2. 1回目: verify 失敗 → improve → re-verify 失敗<br>3. 2回目: verify 失敗 → improve → re-verify 失敗<br>4. 3回目の improve は実行されずループ停止  |
| 期待結果 | - `totalAttempts: 2`<br>- `loopExhausted: true`<br>- `finalStatus: "fail"`<br>- `recordVerifyFailure()` が `"review"` 引数で呼ばれている<br>- `improve()` は2回のみ呼ばれ、3回目は呼ばれない |
| 検証方法 | - `improve()` の呼び出し回数を検証<br>- `getImproveAttemptCount()` が2を返すことを確認                                                                                                       |
| 対応AC   | AC-4                                                                                                                                                                                         |
| 判定     | -                                                                                                                                                                                            |

### Task 11-5: エラーシナリオの確認

#### 11-5-A: LLM エラー during improve

| 項目     | 内容                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | モック LLM が `improve()` 呼び出し時にエラーを返す                                                                                                    |
| 操作手順 | 1. `verifyAndImproveLoop()` を呼び出す<br>2. verify 失敗 → improve 呼び出し → LLM エラー発生                                                          |
| 期待結果 | - ループが即座に停止<br>- `finalStatus: "error"`<br>- `errorMessage` にエラー内容が記録<br>- `recordVerifyFailure()` が `"review"` 引数で呼ばれている |
| 検証方法 | - 返却値の `errorMessage` が LLM エラーメッセージを含むことを検証                                                                                     |
| 対応AC   | AC-5                                                                                                                                                  |
| 判定     | -                                                                                                                                                     |

#### 11-5-B: apply 失敗

| 項目     | 内容                                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | モック `applyImprovement()` が失敗（`appliedCount: 0`）を返す                                                                                        |
| 操作手順 | 1. `verifyAndImproveLoop()` を呼び出す<br>2. verify 失敗 → improve 成功 → apply 失敗                                                                 |
| 期待結果 | - ループが停止<br>- `finalStatus: "fail"`<br>- `errorMessage` に「改善適用失敗」が記録<br>- `recordVerifyFailure()` が `"review"` 引数で呼ばれている |
| 検証方法 | - 返却値の `finalStatus` と `errorMessage` を検証                                                                                                    |
| 対応AC   | AC-5                                                                                                                                                 |
| 判定     | -                                                                                                                                                    |

### Task 11-6: 既存 reverifyWorkflow() の動作確認

| 項目     | 内容                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | 既存の `reverifyWorkflow()` / `requestReverify()` が実装済み                                                                                |
| 操作手順 | 1. 既存の手動 re-verify フローを呼び出す<br>2. `requestReverify()` が正常に動作することを確認                                               |
| 期待結果 | - 手動 re-verify が閉ループと独立して動作する<br>- 既存テスト（22件+）が全て PASS<br>- 閉ループ追加による既存メソッドへのリグレッションなし |
| 検証方法 | - 既存テストスイートの全件実行<br>- `pnpm vitest run` で WorkflowEngine / Facade のテストが全 PASS                                          |
| 対応AC   | AC-7                                                                                                                                        |
| 判定     | -                                                                                                                                           |

### Task 11-7: 発見事項の分類

テスト実行中に発見された問題・改善点を以下のテーブルで分類し、`outputs/phase-11/discovered-issues.md` に記録する。

| #   | 発見事項 | 重要度               | 分類                                                         | 対応方針 |
| --- | -------- | -------------------- | ------------------------------------------------------------ | -------- |
| 1   | -        | CRITICAL/MAJOR/MINOR | スコープ内修正 / スコープ外（未タスク候補） / 既知の制限事項 | -        |

分類基準:

| 分類                       | 説明                                              | 対応                                  |
| -------------------------- | ------------------------------------------------- | ------------------------------------- |
| スコープ内修正             | 本タスクの AC に直接関係し、Phase 11 内で修正可能 | 即座に修正し、テスト再実行            |
| スコープ外（未タスク候補） | 本タスクのスコープ外だが将来改善が必要            | Phase 12 Task 12-4 へ引き継ぎ         |
| 既知の制限事項             | Phase 3 で MINOR として記録済み（MR-01, MR-02）等 | 記録のみ。対応方針は既存 MINOR に準拠 |

> 発見事項が0件の場合も「0件」と明記して出力する。

## 参照資料

| 資料名                | パス                                                                                  | 説明                     |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------ |
| タスク概要            | `index.md`                                                                            | AC定義・スコープ         |
| Phase 1 要件          | `phase-1-requirements.md`                                                             | AC-1〜AC-7 の定義        |
| Phase 2 設計          | `phase-2-design.md`                                                                   | 閉ループ設計・擬似コード |
| Phase 3 レビュー      | `phase-3-design-review.md`                                                            | MR-01, MR-02 指摘        |
| Phase 10 結果         | `outputs/phase-10/final-review-result.md`                                             | 最終レビュー判定         |
| WorkflowEngine テスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | リグレッション確認対象   |
| Facade テスト         | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`  | リグレッション確認対象   |

## 統合テスト連携

| 観点                | 内容                                                          |
| ------------------- | ------------------------------------------------------------- |
| Phase 10 からの引継 | 最終レビューで指摘された追加確認事項をテストケースに反映      |
| Phase 12 への引継   | 発見事項を未タスク候補として Phase 12 Task 12-4 に引き継ぐ    |
| NON_VISUAL判定      | UI task: No のため、Phase 12 でスクリーンショット再判定は不要 |

## 成果物

| 成果物         | パス                                     | 説明                       |
| -------------- | ---------------------------------------- | -------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | TC一覧と判定               |
| 発見事項       | `outputs/phase-11/discovered-issues.md`  | スコープ外問題・改善点一覧 |

### `outputs/phase-11/manual-test-result.md` の構成

```markdown
# Phase 11: 手動テスト結果

## テスト環境

| 項目    | 値  |
| ------- | --- |
| OS      | -   |
| Node.js | -   |
| pnpm    | -   |

## テストケース結果

| Task  | テスト名                                   | 判定 | 備考 |
| ----- | ------------------------------------------ | ---- | ---- |
| 11-2  | verify 全チェック PASS シナリオ            | -    | -    |
| 11-3  | verify 失敗 → improve → re-verify PASS     | -    | -    |
| 11-4  | maxImproveRetry 到達シナリオ               | -    | -    |
| 11-5A | LLM エラー during improve                  | -    | -    |
| 11-5B | apply 失敗                                 | -    | -    |
| 11-6  | 既存 reverifyWorkflow() リグレッション確認 | -    | -    |

## UI / 視覚検証

NON_VISUAL: UI 変更なし。スクリーンショット対象外。

## 総合判定

| 判定     | 結果 |
| -------- | ---- |
| **総合** | -    |
```

## 完了条件

- [ ] Task 11-1: テスト用スキルディレクトリが準備されている（失敗用・成功用）
- [ ] Task 11-2: verify 全チェック PASS シナリオの判定が記録されている
- [ ] Task 11-3: verify 失敗 → improve → re-verify PASS シナリオの判定が記録されている
- [ ] Task 11-4: maxImproveRetry 到達シナリオの判定が記録されている
- [ ] Task 11-5: エラーシナリオ（LLM エラー / apply 失敗）の判定が記録されている
- [ ] Task 11-6: 既存 reverifyWorkflow() のリグレッションなし確認
- [ ] Task 11-7: 発見事項が分類・記録されている（0件でも明記）
- [ ] NON_VISUAL 判定が明記されている（スクリーンショット不要）
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
