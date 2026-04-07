# Phase 2: 設計書 — assertNever配置・switch化設計

## assertNever 配置設計

| 項目                  | 決定内容                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------- |
| 配置先                | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` module-local helper |
| 共有 utility ファイル | 作成しない                                                                                |
| 外部 import           | しない（renderer 側 helper も import しない）                                             |
| スコープ              | このモジュール内に閉じる                                                                  |

## switch 化設計

### 正規化 helper: classifyExecuteResult()

mixed union を `ExecuteOutcome` に正規化する。直接 raw union を switch しない。

```typescript
/** executeAsync() の結果分類型 */
type ExecuteOutcome = "success" | "error" | "terminal_handoff";

/**
 * Mixed union を ExecuteOutcome に正規化する。
 * 正規化 helper 終端と outer switch default の両方で assertNever を呼ぶことで
 * 将来の union 拡張を型レベルで検出する。
 */
function classifyExecuteResult(result: SkillExecuteResponse): ExecuteOutcome {
  if (typeof result === "object" && result !== null && "type" in result) {
    switch (result.type) {
      case "terminal_handoff":
        return "terminal_handoff";
      default:
        return assertNever(result.type);
    }
  }
  if ("success" in result) {
    return result.success === false ? "error" : "success";
  }
  return assertNever(result);
}

/**
 * TypeScript の exhaustive check ヘルパー関数。
 * RuntimeSkillCreatorFacade モジュール内に閉じることで外部依存なし。
 */
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
```

### outer switch パターン（executeAsync() 内）

```typescript
const outcome = classifyExecuteResult(executeResult);
switch (outcome) {
  case "terminal_handoff":
  case "success":
    this.workflowEngine.triggerPhaseTransition(planId, "complete", 100);
    break;
  case "error": {
    this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
    const errorResponse =
      executeResult as RuntimeSkillCreatorExecuteErrorResponse;
    const snapshot = this.workflowEngine.getWorkflowState(planId);
    this.onWorkflowStateSnapshot?.(
      planId,
      snapshot ?? null,
      errorResponse.error.message,
    );
    break;
  }
  default:
    assertNever(outcome);
}
```

## 型定義検証

| バリアント                                 | 判別子                     | literal型        | switch対応                             |
| ------------------------------------------ | -------------------------- | ---------------- | -------------------------------------- |
| A: RuntimeSkillCreatorExecuteResult        | `success: boolean`         | ❌ boolean       | "success" or "error" (success値で分岐) |
| B: `{ type: "terminal_handoff" }`          | `type: "terminal_handoff"` | ✅               | "terminal_handoff"                     |
| C: RuntimeSkillCreatorExecuteErrorResponse | `success: false`           | ✅ false literal | "error"                                |

**注意**: A と C の両方が `success: false` の場合に "error" となる設計は意図的。

- A (`SkillExecuteResult` with `success: false`) は実行失敗ケース
- C (`RuntimeSkillCreatorExecuteErrorResponse`) はアダプター障害ケース
- 両者とも "error" outcome として統一処理する

## TypeScript 型安全性の検証

### classifyExecuteResult() の型絞り込み

1. `"type" in result` チェック後:
   - true: `{ type: "terminal_handoff"; bundle: ... }` に絞り込み
   - false: `RuntimeSkillCreatorExecuteResult | RuntimeSkillCreatorExecuteErrorResponse` に絞り込み
2. `switch(result.type)` の default 分岐後:
   - true: 返却
   - false: `never`（union には他の type 値がないため） → `assertNever` が機能
3. `"success" in result` 後:
   - true: 両型ともカバー
   - false: `never` → `assertNever` が機能

### outer switch の exhaustive check

`ExecuteOutcome = "success" | "error" | "terminal_handoff"` の 3 case が明示 + default に `assertNever`。
新しい case を `ExecuteOutcome` に追加すると、switch の case 漏れがコンパイルエラーで検出される。

## 変更ファイル一覧

| 種別 | ファイルパス                                                                                      | 変更内容                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 修正 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | module-local `assertNever` + `ExecuteOutcome` 型 + `classifyExecuteResult()` 追加、`executeAsync()` switch化 |
| 修正 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | TC-07/TC-08 追加                                                                                             |

## Phase 4 向けテストケース設計

| TC ID       | テスト名                              | 目的                                              | 種別     |
| ----------- | ------------------------------------- | ------------------------------------------------- | -------- |
| TC-01〜T-06 | 既存テスト（回帰確認）                | switch化後も振る舞い変化なし                      | 回帰     |
| TC-07       | switch 網羅性テスト（型レベル・手動） | 仮バリアント追加でコンパイルエラー発生確認        | 型安全性 |
| TC-08       | unknown variant の smoke test         | public seam 経由で未対応バリアントが catch パスへ | 実行時   |

## Phase 2 完了確認

- [x] assertNever の配置先が module-local helper で確定している
- [x] switch 文の全 case が設計されている（3 case + default）
- [x] 変更ファイル一覧が確定している
- [x] Phase 4 向けテストケース TC-01〜TC-08 が設計されている
- [x] 型定義の判別子プロパティが確認されている（literal type / boolean の区別）
- [x] 本Phase内の全タスクを100%実行完了
