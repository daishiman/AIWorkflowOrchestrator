# Phase 5: 実装（TDD Green phase）

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 5                                       |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

Phase 4 で作成した `.skip` テストを全て PASS させるための実装を行う（TDD Green phase）。最小限の実装でテストを通すことに集中する。

## 実行タスク

### Task 5-1: `packages/shared/src/types/skillCreator.ts` に型追加

#### `SkillCreatorVerifyResult` の拡張

既存インターフェースに optional フィールドを追加する。後方互換性を維持。

```typescript
interface SkillCreatorVerifyResult {
  // === 既存フィールド（変更なし） ===
  status: "pending" | "pass" | "fail";
  reason?: SkillCreatorWorkflowFailureReason;
  message?: string;
  nextAction?: "review" | "improve" | "handoff";
  updatedAt: string;

  // === 新規追加 ===
  /** 現在の improve 試行回数（閉ループ内でのカウント、0開始） */
  improveAttemptCount?: number;
  /** 最大 improve 試行回数 */
  maxImproveRetry?: number;
  /** maxRetry 到達によりループが停止したか */
  loopExhausted?: boolean;
  /** 失敗した verify チェックの要約 */
  failedChecksSummary?: string;
}
```

#### `RuntimeSkillCreatorVerifyAndImproveResult` 新規型

```typescript
/** verify→improve→re-verify 閉ループの最終結果 */
interface RuntimeSkillCreatorVerifyAndImproveResult {
  /** 最終的な verify 結果 */
  finalStatus: "pass" | "fail" | "error";
  /** 実行した improve の回数 */
  totalAttempts: number;
  /** 最終的な verify チェック結果 */
  finalChecks: RuntimeSkillCreatorVerifyCheck[];
  /** ループが maxRetry で停止したか */
  loopExhausted: boolean;
  /** エラーが発生した場合のメッセージ */
  errorMessage?: string;
  /** ワークフロー状態スナップショット */
  workflowSnapshot: SkillCreatorWorkflowUiSnapshot;
}
```

#### `RuntimeSkillCreatorFacadeDeps` 拡張

```typescript
interface RuntimeSkillCreatorFacadeDeps {
  // ... 既存フィールド ...

  /** verify→improve→re-verify ループの最大試行回数（デフォルト: 3） */
  maxImproveRetry?: number;
}
```

**注意事項**:

- 全新規フィールドは optional。既存コードへの影響なし
- `RuntimeSkillCreatorVerifyAndImproveResult` を export すること

### Task 5-2: `formatVerifyChecksAsFeedback.ts` 新規ユーティリティ実装

**ファイルパス**: `apps/desktop/src/main/services/runtime/formatVerifyChecksAsFeedback.ts`

```typescript
import type { RuntimeSkillCreatorVerifyCheck } from "@repo/shared";

/**
 * verify チェック結果を improve 用のフィードバック文字列に変換する。
 * error → warning の優先順で、passed === true のチェックは除外する。
 *
 * @param checks - verify チェック結果の配列
 * @returns フィードバック文字列。失敗チェックがない場合は空文字列
 */
export function formatVerifyChecksAsFeedback(
  checks: RuntimeSkillCreatorVerifyCheck[],
): string {
  // 1. passed === false のチェックを抽出
  const failedChecks = checks.filter((c) => !c.passed);

  // 2. 失敗チェックがなければ空文字列
  if (failedChecks.length === 0) {
    return "";
  }

  // 3. severity でソート: error → warning → info
  const severityOrder: Record<string, number> = {
    error: 0,
    warning: 1,
    info: 2,
  };
  const sorted = [...failedChecks].sort(
    (a, b) =>
      (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99),
  );

  // 4. フォーマット
  const lines = sorted.map(
    (c) => `[${c.severity.toUpperCase()}] ${c.id}: ${c.summary}`,
  );

  // 5. ヘッダー行を付与して結合
  return `以下の検証チェックに失敗しました。修正してください:\n\n${lines.join("\n")}`;
}
```

**設計判断**:

- 純粋関数。副作用なし
- `passed === false` でフィルタ（`severity` ではなく `passed` フラグを使用）
- 空配列・全 PASS の場合は空文字列を返す

### Task 5-3: `SkillCreatorWorkflowEngine` に `recordVerifyPass()` 実装

**ファイルパス**: `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`

#### 擬似コード

```typescript
recordVerifyPass(
  planId: string,
  checks: RuntimeSkillCreatorVerifyCheck[],
): SkillCreatorWorkflowStateSnapshot {
  const state = this.getState(planId);
  if (!state) throw new Error(`Workflow not found: ${planId}`);

  // verifyResult を更新
  state.verifyResult = {
    ...state.verifyResult,
    status: "pass",
    nextAction: "handoff",
    updatedAt: new Date().toISOString(),
  };

  // artifact を記録
  this.recordArtifact(planId, {
    type: "verify_pass",
    data: { checks, timestamp: new Date().toISOString() },
  });

  return this.getWorkflowState(planId)!;
}
```

**注意事項**:

- `currentPhase` は "verify" のまま。handoff への遷移は別のステップ
- 既存の `recordVerifyFailure()` パターンに合わせた artifact 記録

### Task 5-4: `SkillCreatorWorkflowEngine` に `recordImproveAttempt()` 実装

**ファイルパス**: `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`

#### 擬似コード

```typescript
recordImproveAttempt(
  planId: string,
  failedChecks: RuntimeSkillCreatorVerifyCheck[],
): SkillCreatorWorkflowStateSnapshot {
  const state = this.getState(planId);
  if (!state) throw new Error(`Workflow not found: ${planId}`);

  // カウンタインクリメント
  const currentCount = state.verifyResult?.improveAttemptCount ?? 0;
  state.verifyResult = {
    ...state.verifyResult,
    status: "fail",
    improveAttemptCount: currentCount + 1,
    failedChecksSummary: failedChecks
      .filter((c) => !c.passed)
      .map((c) => `${c.id}: ${c.summary}`)
      .join("; "),
    updatedAt: new Date().toISOString(),
  };

  // phase を improve に遷移
  state.currentPhase = "improve";

  // artifact を記録
  this.recordArtifact(planId, {
    type: "improve_attempt",
    data: {
      attemptNumber: currentCount + 1,
      failedChecks,
      timestamp: new Date().toISOString(),
    },
  });

  return this.getWorkflowState(planId)!;
}
```

### Task 5-5: `SkillCreatorWorkflowEngine` に `getImproveAttemptCount()` 実装

**ファイルパス**: `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`

#### 擬似コード

```typescript
getImproveAttemptCount(planId: string): number {
  const state = this.getState(planId);
  if (!state) return 0;
  return state.verifyResult?.improveAttemptCount ?? 0;
}
```

### Task 5-6: `RuntimeSkillCreatorFacade` に `verifyAndImproveLoop()` 実装

**ファイルパス**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

#### 実装ポイント

1. Phase 2 の擬似コード（Task 2-5）をそのまま実装
2. MINOR MR-02 対応: `verificationEngine` 未DI時に `console.warn` 出力

```typescript
async verifyAndImproveLoop(
  planId: string,
  skillDir: string,
  skillName: string,
  authMode: string,
  apiKey?: string,
): Promise<RuntimeSkillCreatorVerifyAndImproveResult> {
  // MR-02: verificationEngine 未DI 警告
  if (!this.deps.verificationEngine) {
    console.warn(
      "[RuntimeSkillCreatorFacade] verificationEngine が未設定のため、verify→improve ループをスキップします",
    );
  }

  const maxRetry = this.deps.maxImproveRetry ?? 3;
  let attemptCount = 0;

  while (true) {
    // Step 1: verify 実行
    let checks: RuntimeSkillCreatorVerifyCheck[];
    try {
      checks = await this.verifySkill(skillDir);
    } catch (err) {
      return {
        finalStatus: "error",
        totalAttempts: attemptCount,
        finalChecks: [],
        loopExhausted: false,
        errorMessage: err instanceof Error ? err.message : String(err),
        workflowSnapshot: this.deps.workflowEngine.getWorkflowState(planId)!,
      };
    }

    // Step 2: 全チェック PASS 判定
    const allPassed = checks.every((c) => c.passed);

    if (allPassed) {
      const snapshot = this.deps.workflowEngine.recordVerifyPass(planId, checks);
      return {
        finalStatus: "pass",
        totalAttempts: attemptCount,
        finalChecks: checks,
        loopExhausted: false,
        workflowSnapshot: snapshot,
      };
    }

    // Step 3: maxRetry チェック
    if (attemptCount >= maxRetry) {
      const snapshot = this.deps.workflowEngine.recordVerifyFailure(
        planId,
        `verify→improve ループが最大試行回数(${maxRetry})に到達しました`,
        "review",
      );
      return {
        finalStatus: "fail",
        totalAttempts: attemptCount,
        finalChecks: checks,
        loopExhausted: true,
        workflowSnapshot: snapshot,
      };
    }

    // Step 4: improve 試行
    this.deps.workflowEngine.recordImproveAttempt(planId, checks);
    attemptCount++;

    try {
      const feedback = formatVerifyChecksAsFeedback(checks);
      const improveResult = await this.improve(skillName, feedback, authMode, apiKey);

      if (improveResult.type === "error") {
        throw new Error(improveResult.error);
      }

      const suggestions =
        improveResult.type === "success" ? improveResult.suggestions : [];

      if (suggestions.length === 0) {
        const snapshot = this.deps.workflowEngine.recordVerifyFailure(
          planId,
          "LLM が改善提案を生成できませんでした",
          "review",
        );
        return {
          finalStatus: "fail",
          totalAttempts: attemptCount,
          finalChecks: checks,
          loopExhausted: false,
          errorMessage: "改善提案なし",
          workflowSnapshot: snapshot,
        };
      }

      const applyResult = await this.applyImprovement(skillName, suggestions);

      if (applyResult.appliedCount === 0) {
        const snapshot = this.deps.workflowEngine.recordVerifyFailure(
          planId,
          "改善提案の適用に全て失敗しました",
          "review",
        );
        return {
          finalStatus: "fail",
          totalAttempts: attemptCount,
          finalChecks: checks,
          loopExhausted: false,
          errorMessage: "改善適用失敗",
          workflowSnapshot: snapshot,
        };
      }

      // Step 5: re-verify（while ループ先頭へ）
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const snapshot = this.deps.workflowEngine.recordVerifyFailure(
        planId,
        `improve 中にエラーが発生: ${errorMsg}`,
        "review",
      );
      return {
        finalStatus: "error",
        totalAttempts: attemptCount,
        finalChecks: checks,
        loopExhausted: false,
        errorMessage: errorMsg,
        workflowSnapshot: snapshot,
      };
    }
  }
}
```

### Task 5-7: Phase 4 テストの有効化と PASS 確認

#### 手順

1. Phase 4 で作成した全テストの `.skip` を除去
2. 型チェック実行
3. テスト実行
4. 全テスト PASS を確認

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行（新規 + 既存）
pnpm --filter @repo/desktop test -- --run

# 特定ファイルのテスト実行
pnpm --filter @repo/desktop test -- --run formatVerifyChecksAsFeedback
pnpm --filter @repo/desktop test -- --run SkillCreatorWorkflowEngine
pnpm --filter @repo/desktop test -- --run RuntimeSkillCreatorFacade
```

#### 確認項目

| 確認項目                            | コマンド                                                             | 期待結果                         |
| ----------------------------------- | -------------------------------------------------------------------- | -------------------------------- |
| TypeScript 型チェック               | `pnpm --filter @repo/desktop typecheck`                              | エラー 0                         |
| formatVerifyChecksAsFeedback テスト | `pnpm --filter @repo/desktop test -- formatVerifyChecksAsFeedback`   | 5件 PASS                         |
| WorkflowEngine テスト（全体）       | `pnpm --filter @repo/desktop test -- SkillCreatorWorkflowEngine`     | 全件 PASS（既存 + 新規）         |
| Facade テスト（全体）               | `pnpm --filter @repo/desktop test -- RuntimeSkillCreatorFacade`      | 全件 PASS（既存 + 新規）         |
| VerificationEngine テスト           | `pnpm --filter @repo/desktop test -- SkillCreatorVerificationEngine` | 30件+ PASS（リグレッションなし） |

## 参照資料

| 資料名               | パス                                                                   | 説明                   |
| -------------------- | ---------------------------------------------------------------------- | ---------------------- |
| Phase 2 設計         | `phase-2-design.md`                                                    | 擬似コード・型定義     |
| Phase 3 レビュー     | `phase-3-design-review.md`                                             | MINOR 指摘 MR-01/MR-02 |
| Phase 4 テスト       | `phase-4-test-creation.md`                                             | テストケース一覧       |
| WorkflowEngine       | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 拡張対象               |
| Facade               | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | パイプライン追加先     |
| 型定義               | `packages/shared/src/types/skillCreator.ts`                            | 型追加先               |
| 既存ユーティリティ例 | `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts`  | 分離パターンの参考     |

## 完了条件

- [ ] `SkillCreatorVerifyResult` に4つの optional フィールドが追加されている
- [ ] `RuntimeSkillCreatorVerifyAndImproveResult` 型が定義・export されている
- [ ] `RuntimeSkillCreatorFacadeDeps` に `maxImproveRetry?` が追加されている
- [ ] `formatVerifyChecksAsFeedback.ts` が実装されテストが PASS している
- [ ] `recordVerifyPass()` が実装されテストが PASS している
- [ ] `recordImproveAttempt()` が実装されテストが PASS している
- [ ] `getImproveAttemptCount()` が実装されている
- [ ] `verifyAndImproveLoop()` が実装されテストが PASS している
- [ ] MR-02 対応: `verificationEngine` 未DI時に `console.warn` が出力される
- [ ] TypeScript 型チェック: エラー 0
- [ ] 既存テスト全件 PASS（リグレッションなし）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充（エッジケース・リグレッション）
