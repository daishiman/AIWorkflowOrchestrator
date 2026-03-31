# Phase 2: 設計

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 2                                       |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

verify → improve → re-verify 自動閉ループの状態遷移、型定義、メソッドシグネチャ、オーケストレーションフローを設計する。

## 設計概要

### アーキテクチャ層

| 層           | 関連コンポーネント           | 変更内容                                                                                                        |
| ------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Main Process | `SkillCreatorWorkflowEngine` | `recordVerifyPass()` / `recordImproveAttempt()` 追加                                                            |
| Main Process | `RuntimeSkillCreatorFacade`  | `verifyAndImproveLoop()` パイプラインエントリーポイント追加                                                     |
| Main Process | 新規ユーティリティ           | `formatVerifyChecksAsFeedback()` ヘルパー関数                                                                   |
| Shared Types | `skillCreator.ts`            | `SkillCreatorVerifyResult` / `RuntimeSkillCreatorVerifyAndImproveResult` / `RuntimeSkillCreatorFacadeDeps` 拡張 |

### 状態所有権

| 状態                      | 所有者                           | 説明                                                                                |
| ------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| ワークフロー状態          | `SkillCreatorWorkflowEngine`     | phase / verifyResult                                                                |
| verify チェック結果       | `SkillCreatorVerificationEngine` | `RuntimeSkillCreatorVerifyCheck[]` として返却                                       |
| improve 提案              | `RuntimeSkillCreatorFacade`      | LLM 呼び出し結果。一時変数                                                          |
| verifyResult 内メタデータ | `SkillCreatorVerifyResult`       | `improveAttemptCount` / `maxImproveRetry` / `loopExhausted` / `failedChecksSummary` |

## 実行タスク

### Task 2-1: 状態遷移設計

#### 閉ループ状態遷移図

```
                    ┌─────────────────────────────────────┐
                    │         閉ループ開始                  │
                    │  verifyAndImproveLoop() 呼び出し     │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │     verify 実行                      │
                    │  verificationEngine.verify(skillDir) │
                    └──────────────┬──────────────────────┘
                                   │
                          checks 取得
                                   │
                    ┌──────────────┴──────────────┐
                    │                              │
                全チェック PASS              失敗チェックあり
                    │                              │
                    ▼                              ▼
        ┌───────────────────┐     ┌──────────────────────────┐
        │ recordVerifyPass()│     │ attemptCount < maxRetry? │
        │ phase: "verify"   │     └────────┬─────────┬───────┘
        │ status: "pass"    │              │         │
        │ 閉ループ正常終了  │           YES │         │ NO
        └───────────────────┘              │         │
                                           ▼         ▼
                              ┌──────────────┐  ┌──────────────────┐
                              │ improve 実行  │  │ loopExhausted    │
                              │ feedback生成  │  │ = true           │
                              │ LLM improve   │  │ recordVerify     │
                              │ apply改善     │  │ Failure("review")│
                              │ attemptCount++│  │ ユーザー判断要求 │
                              └──────┬───────┘  └──────────────────┘
                                     │
                                     │ 成功
                                     │
                                     └──→ verify 実行 へ戻る（re-verify）

                              ┌──────────────┐
                              │ improve エラー│
                              │ LLM障害      │
                              │ apply障害    │
                              │ 提案0件      │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────────┐
                              │ ループ停止        │
                              │ エラー記録        │
                              │ phase → "review" │
                              │ ユーザー判断要求  │
                              └──────────────────┘
```

#### 既存状態遷移との統合

閉ループは既存の `SkillCreatorWorkflowPhase`（6種）を**変更しない**。新しい phase 値は追加せず、`verifyResult` 内のフィールド拡張で閉ループの状態を表現する。

| 既存 Phase | 閉ループでの意味                |
| ---------- | ------------------------------- |
| `verify`   | verify 実行中 / verify 結果確定 |
| `improve`  | 自動 improve 実行中             |
| `review`   | ループ停止後のユーザー判断待ち  |
| `handoff`  | verify PASS 後の正常完了遷移先  |

### Task 2-2: 型定義の設計

#### `SkillCreatorVerifyResult` 拡張

```typescript
// skillCreator.ts - 既存インターフェースの拡張
interface SkillCreatorVerifyResult {
  status: "pending" | "pass" | "fail";
  reason?: SkillCreatorWorkflowFailureReason;
  message?: string;
  nextAction?: "review" | "improve" | "handoff";
  updatedAt: string;

  // === 新規追加フィールド ===
  /** 現在の improve 試行回数（閉ループ内でのカウント） */
  improveAttemptCount?: number;
  /** 最大 improve 試行回数 */
  maxImproveRetry?: number;
  /** maxRetry 到達によりループが停止したか */
  loopExhausted?: boolean;
  /** 失敗した verify チェックの要約（improve フィードバック生成に使用） */
  failedChecksSummary?: string;
}
```

**設計判断**: `SkillCreatorWorkflowUiSnapshot` ではなく `SkillCreatorVerifyResult` にフィールドを追加する。`UiSnapshot` 自体は変更しない。理由:

- ループ関連情報は verify の結果に紐づく概念
- `UiSnapshot` の肥大化を防ぐ
- 既存の `verifyResult` フィールド経由でアクセスできるので、UI側の変更が最小限

#### `RuntimeSkillCreatorFacadeDeps` 拡張

```typescript
// RuntimeSkillCreatorFacade.ts
interface RuntimeSkillCreatorFacadeDeps {
  // ... 既存フィールド ...

  /** verify→improve→re-verify ループの最大試行回数（デフォルト: 3） */
  maxImproveRetry?: number;
}
```

#### 閉ループ結果型（新規）

```typescript
// skillCreator.ts - 新規型
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

### Task 2-3: メソッドシグネチャの設計

#### `SkillCreatorWorkflowEngine` 追加メソッド

```typescript
class SkillCreatorWorkflowEngine {
  // === 新規メソッド ===

  /**
   * verify 成功時の状態遷移を記録する。
   * verifyResult.status を "pass" に設定し、
   * nextAction を "handoff" に設定する。
   *
   * @param planId - ワークフローの planId
   * @param checks - verify チェック結果（全 PASS であること）
   * @returns 更新後のスナップショット
   */
  recordVerifyPass(
    planId: string,
    checks: RuntimeSkillCreatorVerifyCheck[],
  ): SkillCreatorWorkflowStateSnapshot;

  /**
   * improve 試行の開始を記録し、試行カウントをインクリメントする。
   * phase を "improve" に遷移させる。
   *
   * @param planId - ワークフローの planId
   * @param failedChecks - 失敗した verify チェック
   * @returns 更新後のスナップショット
   */
  recordImproveAttempt(
    planId: string,
    failedChecks: RuntimeSkillCreatorVerifyCheck[],
  ): SkillCreatorWorkflowStateSnapshot;

  /**
   * 現在の improve 試行回数を取得する。
   *
   * @param planId - ワークフローの planId
   * @returns 試行回数（0から開始）
   */
  getImproveAttemptCount(planId: string): number;
}
```

#### `RuntimeSkillCreatorFacade` 追加メソッド

```typescript
class RuntimeSkillCreatorFacade {
  /**
   * verify → improve → re-verify の自動閉ループを実行する。
   *
   * 1. verificationEngine.verify(skillDir) で検証実行
   * 2. 全チェック PASS → recordVerifyPass() → 正常終了
   * 3. 失敗チェックあり → improve → applyImprovement → re-verify
   * 4. maxImproveRetry 到達 → loopExhausted → ユーザー判断要求
   * 5. エラー発生 → ループ停止 → エラー記録
   *
   * @param planId - ワークフローの planId
   * @param skillDir - verify 対象のスキルディレクトリパス
   * @param skillName - improve 対象のスキル名
   * @param authMode - LLM 認証モード
   * @param apiKey - LLM API キー（オプション）
   * @returns 閉ループの最終結果
   */
  async verifyAndImproveLoop(
    planId: string,
    skillDir: string,
    skillName: string,
    authMode: string,
    apiKey?: string,
  ): Promise<RuntimeSkillCreatorVerifyAndImproveResult>;
}
```

### Task 2-4: `formatVerifyChecksAsFeedback()` ヘルパー設計

#### 関数シグネチャ

```typescript
/**
 * verify チェック結果を improve 用のフィードバック文字列に変換する。
 * error → warning の優先順で、info（PASS）は除外。
 */
function formatVerifyChecksAsFeedback(
  checks: RuntimeSkillCreatorVerifyCheck[],
): string;
```

#### アルゴリズム

1. `checks` から `passed === false` のチェックを抽出
2. `severity === "error"` を先頭に配置
3. `severity === "warning"` を後続に配置
4. 各チェックを `[SEVERITY] ID: summary` フォーマットで文字列化
5. ヘッダー行を付与して結合

#### 配置先

`apps/desktop/src/main/services/runtime/formatVerifyChecksAsFeedback.ts`（新規ファイル）

理由: `RuntimeSkillCreatorFacade.ts` の肥大化を防ぎ、単体テストを容易にするため。既存の `parseLlmResponseToContent.ts` と同様のユーティリティ分離パターンに従う。

### Task 2-5: `verifyAndImproveLoop()` 内部フロー設計

#### 擬似コード

```typescript
async verifyAndImproveLoop(
  planId, skillDir, skillName, authMode, apiKey?
): Promise<RuntimeSkillCreatorVerifyAndImproveResult> {
  const maxRetry = this.deps.maxImproveRetry ?? 3;
  let attemptCount = 0;

  while (true) {
    // Step 1: verify 実行
    let checks: RuntimeSkillCreatorVerifyCheck[];
    try {
      checks = await this.verifySkill(skillDir);
    } catch (err) {
      // verify 自体のエラー
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
    const allPassed = checks.every(c => c.passed);

    if (allPassed) {
      // verify 成功 → 閉ループ正常終了
      const snapshot = this.deps.workflowEngine.recordVerifyPass(planId, checks);
      return {
        finalStatus: "pass",
        totalAttempts: attemptCount,
        finalChecks: checks,
        loopExhausted: false,
        workflowSnapshot: snapshot,
      };
    }

    const failedChecks = checks.filter((check) => !check.passed);

    // Step 3: maxRetry チェック
    if (attemptCount >= maxRetry) {
      // ループ上限到達
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
    this.deps.workflowEngine.recordImproveAttempt(planId, failedChecks);
    attemptCount++;

    try {
      // Step 4.1: フィードバック生成
      const feedback = formatVerifyChecksAsFeedback(failedChecks);

      // Step 4.2: LLM improve 呼び出し
      const improveResult = await this.improve(skillName, feedback, authMode, apiKey);

      if (improveResult.type === "error") {
        throw new Error(improveResult.error);
      }

      const suggestions = improveResult.type === "success"
        ? improveResult.suggestions
        : [];

      if (suggestions.length === 0) {
        // 改善提案なし → ループ停止
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

      // Step 4.3: 改善を適用
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

      // Step 5: re-verify へ（while ループの先頭に戻る）

    } catch (err) {
      // improve 中のエラー → ループ停止
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

### Task 2-6: エラーハンドリングフロー設計

```
verifyAndImproveLoop() 呼び出し
│
├─ verificationEngine 未DI
│  └─ warning log を出して空配列返却（既存 verifySkill() の動作）→ 全チェック PASS 扱い
│     → recordVerifyPass() → 正常終了
│
├─ verify() throws
│  └─ finalStatus: "error", errorMessage 記録
│
├─ 全チェック PASS
│  └─ recordVerifyPass() → finalStatus: "pass"
│
├─ 失敗チェックあり & attemptCount < maxRetry
│  ├─ improve() → type: "error"
│  │  └─ recordVerifyFailure("review") → finalStatus: "error"
│  │
│  ├─ improve() → suggestions: []
│  │  └─ recordVerifyFailure("review") → finalStatus: "fail"
│  │
│  ├─ applyImprovement() → appliedCount: 0
│  │  └─ recordVerifyFailure("review") → finalStatus: "fail"
│  │
│  ├─ applyImprovement() throws
│  │  └─ recordVerifyFailure("review") → finalStatus: "error"
│  │
│  └─ apply 成功 → re-verify（ループ先頭へ）
│
└─ 失敗チェックあり & attemptCount >= maxRetry
   └─ loopExhausted: true → finalStatus: "fail"
```

## 参照資料

| 資料名             | パス                                                                       | 説明                      |
| ------------------ | -------------------------------------------------------------------------- | ------------------------- |
| Phase 1 要件       | `phase-1-requirements.md`                                                  | 要件定義                  |
| WorkflowEngine     | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`     | 状態管理の拡張対象        |
| Facade             | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`      | パイプライン追加先        |
| VerificationEngine | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` | verify 実行元（変更なし） |
| 型定義             | `packages/shared/src/types/skillCreator.ts`                                | 型追加先                  |
| 要件定義書         | `outputs/phase-1/phase-1-requirements.md`                                  | Phase 1 成果物            |

## 統合テスト連携

| テスト種別                       | 対象                           | 方針                                                                    |
| -------------------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| ユニットテスト（WorkflowEngine） | `recordVerifyPass()` etc.      | 状態遷移の正しさを個別検証                                              |
| ユニットテスト（ヘルパー）       | `formatVerifyChecksAsFeedback` | 各 severity のチェックが正しくフォーマットされることを検証              |
| ユニットテスト（Facade）         | `verifyAndImproveLoop()`       | verify/improve をモックし、各分岐（PASS/FAIL/ERROR/exhausted）を検証    |
| 結合テスト                       | 閉ループ全体                   | 実 VerificationEngine + モック LLM でエンドツーエンドのループ動作を検証 |

## 多角的チェック観点

| 観点               | 判断    | 内容                                                                      |
| ------------------ | ------- | ------------------------------------------------------------------------- |
| セキュリティ       | ✅ 適用 | LLM improve 結果を apply する際、`SkillFileWriter` のバリデーションに依存 |
| エラーハンドリング | ✅ 適用 | verify / improve / apply の3段階エラーハンドリング + maxRetry ガード      |
| アーキテクチャ     | ✅ 適用 | Facade（オーケストレーション）→ Engine（状態管理）の責務分離を維持        |
| 後方互換性         | ✅ 適用 | 全新規フィールドは optional。既存 API への影響なし                        |

## 成果物

| 成果物 | パス                              | 説明     |
| ------ | --------------------------------- | -------- |
| 設計書 | `phase-2-design.md`（本ファイル） | 詳細設計 |

## 完了条件

- [ ] 状態遷移図が完成している
- [ ] 型定義の設計が完了している（`SkillCreatorVerifyResult` 拡張、`RuntimeSkillCreatorVerifyAndImproveResult` 新規）
- [ ] `SkillCreatorWorkflowEngine` の追加メソッドシグネチャが設計されている
- [ ] `RuntimeSkillCreatorFacade.verifyAndImproveLoop()` のシグネチャと擬似コードが設計されている
- [ ] `formatVerifyChecksAsFeedback()` のアルゴリズムと配置先が設計されている
- [ ] エラーハンドリングフローが全分岐で設計されている
- [ ] 既存 API との後方互換性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
