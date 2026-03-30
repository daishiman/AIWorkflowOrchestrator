# Phase 6: テスト拡充（エッジケース・リグレッション）

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 6                                       |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

Phase 5 の実装に対してエッジケース・境界値・異常系のテストを追加し、堅牢性を高める。既存テストのリグレッションがないことも最終確認する。

## 実行タスク

### Task 6-1: `formatVerifyChecksAsFeedback` エッジケーステスト

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/formatVerifyChecksAsFeedback.test.ts`

| テストケース                          | 入力                                   | 期待結果                       | 検証観点     |
| ------------------------------------- | -------------------------------------- | ------------------------------ | ------------ |
| 全チェックが info severity（全 PASS） | `[{ severity: "info", passed: true }]` | 空文字列                       | PASS 除外    |
| 同一 ID を持つ複数チェック            | 同じ `id` で severity が異なる2件      | 両方出力される（重複排除なし） | ID 衝突      |
| 非常に長い summary 文字列             | `summary` が 1000文字超                | 切り捨てなし（そのまま出力）   | 長大入力     |
| error + warning + info の3種混在      | 3件（各1件）、info は passed: true     | error + warning のみ出力       | 複合フィルタ |

```typescript
describe("formatVerifyChecksAsFeedback - エッジケース", () => {
  it("全チェックが info severity で passed: true の場合は空文字列", () => {
    // ...
  });

  it("同一 ID の複数チェックが両方出力される", () => {
    // ...
  });

  it("1000文字超の summary がそのまま出力される", () => {
    // ...
  });

  it("error + warning + info 混在で info が除外される", () => {
    // ...
  });
});
```

### Task 6-2: `recordVerifyPass()` エッジケーステスト

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`

| テストケース                                 | 前提条件                        | 期待結果                      | 検証観点     |
| -------------------------------------------- | ------------------------------- | ----------------------------- | ------------ |
| phase が "verify" でない状態で呼び出し       | `currentPhase === "plan"`       | エラー throw                  | 前提条件違反 |
| 空の checks 配列で呼び出し                   | `checks = []`                   | status "pass"（チェックなし） | 空配列       |
| 既に `verifyResult` に値がある状態で呼び出し | 前回の `recordVerifyFailure` 後 | 上書きされ status "pass"      | 状態上書き   |

```typescript
describe("recordVerifyPass - エッジケース", () => {
  it("verify phase 以外で呼び出すとエラーになる", () => {
    // setup: currentPhase を "plan" にする
    // act & assert: recordVerifyPass() が throw する
  });

  it("空の checks 配列でも status が 'pass' になる", () => {
    // setup: verify phase まで遷移
    // act: recordVerifyPass(planId, [])
    // assert: status === "pass"
  });

  it("既存の verifyResult が上書きされる", () => {
    // setup: recordVerifyFailure() 後に verify phase に戻す
    // act: recordVerifyPass(planId, checks)
    // assert: status === "pass"（fail が上書き）
  });
});
```

### Task 6-3: `recordImproveAttempt()` エッジケーステスト

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`

| テストケース                                    | 前提条件                  | 期待結果                    | 検証観点           |
| ----------------------------------------------- | ------------------------- | --------------------------- | ------------------ |
| phase が "verify" でない状態で呼び出し          | `currentPhase === "plan"` | エラー throw                | 前提条件違反       |
| 3回連続呼び出しでカウンタが正しくインクリメント | verify phase に都度戻す   | `improveAttemptCount === 3` | 連続インクリメント |
| failedChecks が空配列                           | `failedChecks = []`       | `failedChecksSummary` が空  | 空配列             |

```typescript
describe("recordImproveAttempt - エッジケース", () => {
  it("verify phase 以外で呼び出すとエラーになる", () => {
    // ...
  });

  it("3回連続呼び出しでカウンタが 3 になる", () => {
    // ...
  });

  it("空の failedChecks でも正常に記録される", () => {
    // ...
  });
});
```

### Task 6-4: `verifyAndImproveLoop()` エッジケーステスト

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

| テストケース                                     | 設定                                 | 期待結果                                            | 検証観点     |
| ------------------------------------------------ | ------------------------------------ | --------------------------------------------------- | ------------ |
| `maxImproveRetry = 1`（最小値）                  | 1回の improve でループ上限           | fail 後に1回 improve → 再 verify → 上限到達時に停止 | 境界値       |
| 2回目の verify で PASS                           | 1回目 fail → improve → 2回目 PASS    | `totalAttempts === 1`, `finalStatus === "pass"`     | 正常リカバリ |
| improve は suggestions を返すが apply が部分失敗 | `appliedCount > 0` だが一部失敗      | ループ継続（部分適用は成功扱い）                    | 部分成功     |
| verify が throw するケース                       | `verificationEngine.verify()` が例外 | `finalStatus === "error"`, ループ即停止             | 例外伝搬     |
| `maxImproveRetry` を deps で設定                 | `deps.maxImproveRetry = 5`           | 5回まで improve が試行される                        | 設定反映     |

```typescript
describe("verifyAndImproveLoop - エッジケース", () => {
  it("maxImproveRetry = 1 で1回 improve 後にループ停止", () => {
    // ...
  });

  it("2回目の verify で PASS すると totalAttempts === 1", () => {
    // ...
  });

  it("apply が部分成功（appliedCount > 0）の場合はループ継続", () => {
    // ...
  });

  it("verify が throw した場合に finalStatus が 'error'", () => {
    // ...
  });

  it("deps.maxImproveRetry で最大試行回数を変更できる", () => {
    // ...
  });
});
```

### Task 6-5: リグレッションテスト確認

**目的**: 全ての既存テストが Phase 5 の実装変更で影響を受けていないことを最終確認する。

| テストファイル                           | 既存テスト件数 | 確認コマンド                                                               |
| ---------------------------------------- | -------------- | -------------------------------------------------------------------------- |
| `SkillCreatorWorkflowEngine.test.ts`     | 22件+          | `pnpm --filter @repo/desktop test -- --run SkillCreatorWorkflowEngine`     |
| `SkillCreatorVerificationEngine.test.ts` | 30件+          | `pnpm --filter @repo/desktop test -- --run SkillCreatorVerificationEngine` |
| `RuntimeSkillCreatorFacade.test.ts`      | 既存件数確認   | `pnpm --filter @repo/desktop test -- --run RuntimeSkillCreatorFacade`      |

```bash
# 全テスト実行（リグレッション確認）
pnpm --filter @repo/desktop test -- --run

# 結果: 既存テスト全件 PASS + Phase 5/6 の新規テスト全件 PASS
```

### Task 6-6: 閉ループの複合シナリオテスト

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

verify → improve → re-verify の複数回ループを通して全体の動作を検証する。

```typescript
describe("verifyAndImproveLoop - 複合シナリオ", () => {
  it("verify fail → improve → re-verify pass の1回ループ", () => {
    // setup:
    //   verify 1回目: [{ passed: false, severity: "error" }]
    //   improve: { type: "success", suggestions: [...] }
    //   applyImprovement: { appliedCount: 1 }
    //   verify 2回目: [{ passed: true, severity: "info" }]
    // assert:
    //   result.finalStatus === "pass"
    //   result.totalAttempts === 1
    //   improve() が1回呼ばれた
    //   recordVerifyPass() が最終的に呼ばれた
  });

  it("verify fail → improve → re-verify fail → improve → re-verify pass の2回ループ", () => {
    // setup:
    //   verify 1回目: fail
    //   improve 1回目: success
    //   verify 2回目: fail
    //   improve 2回目: success
    //   verify 3回目: pass
    // assert:
    //   result.finalStatus === "pass"
    //   result.totalAttempts === 2
    //   improve() が2回呼ばれた
  });

  it("verify fail × 3 → loopExhausted（maxImproveRetry = 3）", () => {
    // setup:
    //   verify: 常に fail
    //   improve: 常に success（suggestions あり）
    //   applyImprovement: 常に { appliedCount: 1 }
    //   maxImproveRetry = 3
    // assert:
    //   result.finalStatus === "fail"
    //   result.totalAttempts === 3
    //   result.loopExhausted === true
    //   improve() が3回呼ばれた
    //   verify() が4回呼ばれた（初回 + 3回の re-verify）
  });
});
```

| シナリオ                               | verify 回数 | improve 回数 | 最終状態         | AC         |
| -------------------------------------- | ----------- | ------------ | ---------------- | ---------- |
| fail → improve → pass                  | 2           | 1            | pass             | AC-2, AC-3 |
| fail → improve → fail → improve → pass | 3           | 2            | pass             | AC-2, AC-3 |
| fail × 3 → exhausted                   | 4           | 3            | fail (exhausted) | AC-4       |

## 参照資料

| 資料名                    | パス                                                                                      | 説明               |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| Phase 4 テスト            | `phase-4-test-creation.md`                                                                | 基本テストケース   |
| Phase 5 実装              | `phase-5-implementation.md`                                                               | 実装詳細           |
| WorkflowEngine テスト     | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`     | テスト追加先       |
| Facade テスト             | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`      | テスト追加先       |
| VerificationEngine テスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | リグレッション確認 |

## 完了条件

- [ ] `formatVerifyChecksAsFeedback` エッジケーステスト 4件が追加・PASS
- [ ] `recordVerifyPass()` エッジケーステスト 3件が追加・PASS
- [ ] `recordImproveAttempt()` エッジケーステスト 3件が追加・PASS
- [ ] `verifyAndImproveLoop()` エッジケーステスト 5件が追加・PASS
- [ ] 閉ループ複合シナリオテスト 3件が追加・PASS
- [ ] 既存テスト全件 PASS（WorkflowEngine 22件+, VerificationEngine 30件+, Facade）
- [ ] 全テスト合計で PASS 率 100%
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
