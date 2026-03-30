# Phase 4: テスト作成（TDD Red phase）

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 4                                       |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

Phase 2 の設計に基づき、実装前にテストケースを作成する（TDD Red phase）。テストは `.skip` 付きで定義し、Phase 5 の実装後に有効化する。

## 実行タスク

### Task 4-1: `formatVerifyChecksAsFeedback` のユニットテスト設計

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/formatVerifyChecksAsFeedback.test.ts`（新規）

```typescript
import { describe, it, expect } from "vitest";
import { formatVerifyChecksAsFeedback } from "../formatVerifyChecksAsFeedback";

describe("formatVerifyChecksAsFeedback", () => {
  it.skip("error のみのチェックをフォーマットする", () => {
    const checks = [
      {
        id: "L1-001",
        layer: 1,
        severity: "error" as const,
        summary: "SKILL.md が存在しません",
        passed: false,
      },
    ];
    const result = formatVerifyChecksAsFeedback(checks);
    expect(result).toContain("[ERROR] L1-001: SKILL.md が存在しません");
    expect(result).toContain("以下の検証チェックに失敗しました");
  });

  it.skip("warning のみのチェックをフォーマットする", () => {
    const checks = [
      {
        id: "L1-004",
        layer: 1,
        severity: "warning" as const,
        summary: "references/ が見つかりません",
        passed: false,
      },
    ];
    const result = formatVerifyChecksAsFeedback(checks);
    expect(result).toContain("[WARNING] L1-004: references/ が見つかりません");
  });

  it.skip("error と warning を混在させた場合、error が先に表示される", () => {
    const checks = [
      {
        id: "L1-004",
        layer: 1,
        severity: "warning" as const,
        summary: "references/ が見つかりません",
        passed: false,
      },
      {
        id: "L1-001",
        layer: 1,
        severity: "error" as const,
        summary: "SKILL.md が存在しません",
        passed: false,
      },
    ];
    const result = formatVerifyChecksAsFeedback(checks);
    const errorIndex = result.indexOf("[ERROR]");
    const warningIndex = result.indexOf("[WARNING]");
    expect(errorIndex).toBeLessThan(warningIndex);
  });

  it.skip("全チェック PASS の場合は空文字列を返す", () => {
    const checks = [
      {
        id: "L1-001",
        layer: 1,
        severity: "info" as const,
        summary: "OK",
        passed: true,
      },
    ];
    const result = formatVerifyChecksAsFeedback(checks);
    expect(result).toBe("");
  });

  it.skip("空配列の場合は空文字列を返す", () => {
    const result = formatVerifyChecksAsFeedback([]);
    expect(result).toBe("");
  });
});
```

| テストケース                 | 検証対象          | AC  |
| ---------------------------- | ----------------- | --- |
| error のみフォーマット       | severity フィルタ | -   |
| warning のみフォーマット     | severity フィルタ | -   |
| error / warning 混在時の順序 | ソート順          | -   |
| 全チェック PASS → 空文字列   | PASS 除外ロジック | -   |
| 空配列 → 空文字列            | エッジケース      | -   |

### Task 4-2: `SkillCreatorWorkflowEngine.recordVerifyPass()` のテスト設計

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`（既存ファイルに追加）

```typescript
describe("recordVerifyPass", () => {
  it.skip("全チェック PASS 時に verifyResult.status が 'pass' になる", () => {
    // setup: planId を作成し、verify phase まで遷移
    // act: recordVerifyPass(planId, allPassedChecks)
    // assert: snapshot.verifyResult.status === "pass"
  });

  it.skip("nextAction が 'handoff' に設定される", () => {
    // setup: planId を作成し、verify phase まで遷移
    // act: recordVerifyPass(planId, allPassedChecks)
    // assert: snapshot.verifyResult.nextAction === "handoff"
  });

  it.skip("verify_pass artifact が記録される", () => {
    // setup: planId を作成し、verify phase まで遷移
    // act: recordVerifyPass(planId, allPassedChecks)
    // assert: artifact に verify_pass エントリが存在
  });

  it.skip("currentPhase が 'verify' のままである", () => {
    // setup: planId を作成し、verify phase まで遷移
    // act: recordVerifyPass(planId, allPassedChecks)
    // assert: snapshot.currentPhase === "verify"（handoff は別のステップで遷移）
  });
});
```

| テストケース                  | 検証対象           | AC   |
| ----------------------------- | ------------------ | ---- |
| status が "pass" になる       | 状態遷移           | AC-1 |
| nextAction が "handoff"       | 遷移先指定         | AC-1 |
| verify_pass artifact 記録     | artifact ログ      | AC-1 |
| currentPhase が "verify" 維持 | phase は変更しない | AC-1 |

### Task 4-3: `SkillCreatorWorkflowEngine.recordImproveAttempt()` のテスト設計

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`（既存ファイルに追加）

```typescript
describe("recordImproveAttempt", () => {
  it.skip("improveAttemptCount が 1 にインクリメントされる", () => {
    // setup: planId を作成し、verify phase まで遷移
    // act: recordImproveAttempt(planId, failedChecks)
    // assert: snapshot.verifyResult.improveAttemptCount === 1
  });

  it.skip("2回目の呼び出しで improveAttemptCount が 2 になる", () => {
    // setup: recordImproveAttempt を1回実行済み、verify phase に戻す
    // act: recordImproveAttempt(planId, failedChecks)
    // assert: snapshot.verifyResult.improveAttemptCount === 2
  });

  it.skip("currentPhase が 'improve' に遷移する", () => {
    // setup: planId を作成し、verify phase まで遷移
    // act: recordImproveAttempt(planId, failedChecks)
    // assert: snapshot.currentPhase === "improve"
  });

  it.skip("failedChecksSummary に失敗チェックの概要が記録される", () => {
    // setup: planId を作成し、verify phase まで遷移
    // act: recordImproveAttempt(planId, failedChecks)
    // assert: snapshot.verifyResult.failedChecksSummary が空でない
  });

  it.skip("improve_attempt artifact が記録される", () => {
    // setup: planId を作成し、verify phase まで遷移
    // act: recordImproveAttempt(planId, failedChecks)
    // assert: artifact に improve_attempt エントリが存在
  });
});
```

| テストケース                  | 検証対象           | AC   |
| ----------------------------- | ------------------ | ---- |
| カウンタ 0 → 1 インクリメント | 試行回数管理       | AC-2 |
| カウンタ 1 → 2 インクリメント | 連続インクリメント | AC-3 |
| phase が "improve" に遷移     | 状態遷移           | AC-2 |
| failedChecksSummary 記録      | 失敗情報保存       | AC-2 |
| improve_attempt artifact 記録 | artifact ログ      | AC-2 |

### Task 4-4: `RuntimeSkillCreatorFacade.verifyAndImproveLoop()` のテスト設計

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`（既存ファイルに追加）

```typescript
describe("verifyAndImproveLoop", () => {
  it.skip("初回 verify で全チェック PASS → 正常終了", () => {
    // setup: verificationEngine.verify() → 全 PASS の checks を返す
    // act: verifyAndImproveLoop(planId, skillDir, skillName, authMode)
    // assert: result.finalStatus === "pass"
    // assert: result.totalAttempts === 0
    // assert: result.loopExhausted === false
    // assert: recordVerifyPass() が呼ばれる
  });

  it.skip("1回目 fail → improve → 2回目 PASS → 正常終了", () => {
    // setup: verify 1回目 → fail、improve → 成功、verify 2回目 → PASS
    // act: verifyAndImproveLoop(planId, skillDir, skillName, authMode)
    // assert: result.finalStatus === "pass"
    // assert: result.totalAttempts === 1
    // assert: improve() が1回呼ばれる
    // assert: applyImprovement() が1回呼ばれる
  });

  it.skip("maxImproveRetry 回失敗 → loopExhausted", () => {
    // setup: verify が常に fail、maxImproveRetry = 3
    // act: verifyAndImproveLoop(planId, skillDir, skillName, authMode)
    // assert: result.finalStatus === "fail"
    // assert: result.totalAttempts === 3
    // assert: result.loopExhausted === true
    // assert: improve() が3回呼ばれる
  });

  it.skip("improve 中の LLM エラーでループ停止", () => {
    // setup: verify → fail、improve() → throw Error("LLM timeout")
    // act: verifyAndImproveLoop(planId, skillDir, skillName, authMode)
    // assert: result.finalStatus === "error"
    // assert: result.errorMessage が "LLM timeout" を含む
    // assert: result.loopExhausted === false
  });

  it.skip("improve 結果の suggestions が空でループ停止", () => {
    // setup: verify → fail、improve() → { type: "success", suggestions: [] }
    // act: verifyAndImproveLoop(planId, skillDir, skillName, authMode)
    // assert: result.finalStatus === "fail"
    // assert: result.errorMessage が "改善提案なし" を含む
  });

  it.skip("applyImprovement の appliedCount が 0 でループ停止", () => {
    // setup: verify → fail、improve() → suggestions あり、applyImprovement() → { appliedCount: 0 }
    // act: verifyAndImproveLoop(planId, skillDir, skillName, authMode)
    // assert: result.finalStatus === "fail"
    // assert: result.errorMessage が "改善適用失敗" を含む
  });

  it.skip("verificationEngine 未DI 時に console.warn が出力される", () => {
    // setup: deps.verificationEngine = undefined
    // act: verifyAndImproveLoop(planId, skillDir, skillName, authMode)
    // assert: console.warn が呼ばれる
    // assert: verify はスキップされ全 PASS 扱い
  });
});
```

| テストケース                   | 検証対象                 | AC         |
| ------------------------------ | ------------------------ | ---------- |
| 初回 PASS → 正常終了           | 正常系                   | AC-1       |
| fail → improve → PASS          | 自動 improve + re-verify | AC-2, AC-3 |
| maxRetry 到達 → loopExhausted  | ループ上限               | AC-4       |
| LLM エラー → ループ停止        | エラーハンドリング       | AC-5       |
| suggestions 空 → ループ停止    | エッジケース             | AC-5       |
| apply 失敗 → ループ停止        | エラーハンドリング       | AC-5       |
| verificationEngine 未DI → warn | graceful degradation     | MR-02      |

### Task 4-5: リグレッションテスト確認

**目的**: 既存テストが Phase 4 のテスト追加で影響を受けないことを確認する。

#### 確認対象

| テストファイル                           | 既存テスト件数 | 確認コマンド                                                         |
| ---------------------------------------- | -------------- | -------------------------------------------------------------------- |
| `SkillCreatorWorkflowEngine.test.ts`     | 22件+          | `pnpm --filter @repo/desktop test -- SkillCreatorWorkflowEngine`     |
| `SkillCreatorVerificationEngine.test.ts` | 30件+          | `pnpm --filter @repo/desktop test -- SkillCreatorVerificationEngine` |
| `RuntimeSkillCreatorFacade.test.ts`      | 既存件数確認   | `pnpm --filter @repo/desktop test -- RuntimeSkillCreatorFacade`      |

#### 確認手順

1. 新規テスト追加前に既存テストを全実行し、全 PASS を確認
2. `.skip` 付きテストを追加
3. 再度全テスト実行し、既存テストが全 PASS であることを確認
4. 新規テストは `.skip` のため PENDING 状態であることを確認

```bash
# 既存テスト確認
pnpm --filter @repo/desktop test -- --run

# テスト追加後の確認（.skip テストは PENDING として表示される）
pnpm --filter @repo/desktop test -- --run
```

## 参照資料

| 資料名                                       | パス                                                                                      | 説明                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計                                 | `phase-2-design.md`                                                                       | メソッドシグネチャ・型定義 |
| Phase 3 レビュー                             | `phase-3-design-review.md`                                                                | MINOR 指摘 MR-01/MR-02     |
| WorkflowEngine テスト                        | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`     | 既存テスト（追加先）       |
| Facade テスト                                | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`      | 既存テスト（追加先）       |
| VerificationEngine テスト                    | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | リグレッション確認対象     |
| 要件定義書                                   | `outputs/phase-1/phase-1-requirements.md`                                                 | Phase 1 成果物             |
| 状態遷移・型定義・メソッドシグネチャの設計書 | `outputs/phase-2/phase-2-design.md`                                                       | Phase 2 成果物             |
| 設計レビュー結果（PASS / MINOR 2件）         | `outputs/phase-3/phase-3-design-review.md`                                                | Phase 3 成果物             |

## 統合テスト連携

| 観点           | 内容                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| テスト追加方針 | 既存テストファイルに `describe` ブロックを追加。新規ユーティリティは新規テストファイル |
| モック戦略     | `verificationEngine.verify()` / `improve()` / `applyImprovement()` をモック            |
| `.skip` 運用   | Phase 4 では全テスト `.skip`。Phase 5 完了後に `.skip` を除去して有効化                |

## 完了条件

- [ ] `formatVerifyChecksAsFeedback` のテストケース 5件が `.skip` 付きで作成されている
- [ ] `recordVerifyPass()` のテストケース 4件が `.skip` 付きで作成されている
- [ ] `recordImproveAttempt()` のテストケース 5件が `.skip` 付きで作成されている
- [ ] `verifyAndImproveLoop()` のテストケース 7件が `.skip` 付きで作成されている
- [ ] 既存テスト（WorkflowEngine 22件+, VerificationEngine 30件+, Facade）が全 PASS
- [ ] 新規テストは PENDING 状態で表示される
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装（TDD Green phase）
