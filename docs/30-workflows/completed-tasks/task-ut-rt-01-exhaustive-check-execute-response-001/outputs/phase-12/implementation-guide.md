# Implementation Guide — TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001

## Part 1: 初学者向け解説（中学生レベル）

### なぜ exhaustive check が必要か？

定食屋のレジを想像してください。メニューには「ランチ」「ディナー」「テイクアウト」の 3 種類があります。レジのプログラムはこの 3 種類を知っているので、正しくお会計できます。

ある日、新メニュー「デザートセット」が追加されました。でもレジプログラムには「デザートセット」の処理を書き忘れてしまいました。お客さんが「デザートセット」を注文すると、プログラムが「知らないメニューだ」と言って止まってしまいます。

これを防ぐ仕組みが **exhaustive check** です。TypeScript という言語は「新しいメニューが追加されたのに、全部のケースを処理していないよ！」と、**動かす前にコンパイラが警告**してくれます。

このプロジェクトでは `assertNever` という特別な関数を使って、この仕組みを実現しています。

### what（何をしたか）

`executeAsync()` という関数が、3 種類の結果（成功・失敗・ターミナル引き渡し）を正しく分類して処理するように、`switch` 文と `assertNever` を組み合わせました。

### how（どうやって）

1. `classifyExecuteResult()` という関数で結果を 3 種類に分類する
2. `switch` 文で 3 種類それぞれの処理を書く
3. `default` に `assertNever()` を置いて「知らない種類が来たらエラー」にする

---

## Part 2: 技術者向け解説

### RuntimeSkillCreatorExecuteResponse union 型の構造

```typescript
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult // success: boolean, error?: string
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }
  | RuntimeSkillCreatorExecuteErrorResponse; // success: false, error: { code, message }
```

3 メンバーの discriminant:

| メンバー               | 識別方法                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| `terminal_handoff`     | `"type" in result && result.type === "terminal_handoff"`                  |
| `ExecuteResult`        | `"success" in result`（`error` は `string \| undefined`）                 |
| `ExecuteErrorResponse` | `"success" in result && success: false`（`error` は `{ code, message }`） |

### current contract と target delta

| 項目        | current contract                   | target delta |
| ----------- | ---------------------------------- | ------------ |
| 結果分類    | `classifyExecuteResult()` 実装済み | -            |
| switch 分岐 | `executeAsync()` に実装済み        | -            |
| assertNever | モジュールスコープに実装済み       | -            |
| テスト      | TC-01〜TC-09 新規追加              | ✅ 追加済み  |

### classifyExecuteResult() API シグネチャと使用例

```typescript
type ExecuteOutcome = "success" | "error" | "terminal_handoff";

function classifyExecuteResult(
  result: RuntimeSkillCreatorExecuteResponse,
): ExecuteOutcome {
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
```

### extractExecuteErrorMessage() の使用位置と責務

`executeAsync()` の `error` ブランチのみで使用:

```typescript
case "error": {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(
    planId,
    snapshot ?? null,
    extractExecuteErrorMessage(executeResult), // ← ここのみ
  );
  break;
}
```

責務: `error` が `{ code, message }` オブジェクトの場合も、`string` の場合も、ない場合も、必ず `string` を返す（"Unknown execute error" fallback）。

### assertNever による exhaustive check

```typescript
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

// switch の default に配置
default:
  assertNever(outcome); // outcome が "never" になれない場合はコンパイルエラー
```

### discriminant の優先順位

1. `type` フィールドで `terminal_handoff` を先に判定（`success` フィールドがない場合に対応）
2. `success` フィールドで `error` / `success` を判定

### テスト方針（TC-01〜TC-09 概要）

| TC     | 内容                                                              |
| ------ | ----------------------------------------------------------------- |
| TC-01  | `success:true` → phase = "complete"                               |
| TC-02  | `success:false`（error なし）→ phase = "error" + fallback message |
| TC-03  | `ExecuteErrorResponse` → phase = "error" + `error.message` 伝搬   |
| TC-04  | `terminal_handoff` → phase = "complete"                           |
| TC-05  | 型テスト（typecheck で担保、todo）                                |
| TC-05b | 未知バリアント → assertNever throw → catch パス                   |
| TC-06  | error.message が onWorkflowStateSnapshot 第3引数に正確に渡る      |
| TC-07  | `error` フィールドなし → "Unknown execute error" fallback         |
| TC-08  | `terminal_handoff` を `success` と誤判定しない                    |
| TC-09  | `error: undefined` → "Unknown execute error" fallback             |

### 将来の union 拡張時の対応手順

1. `RuntimeSkillCreatorExecuteResponse` に新メンバーを追加する
2. `pnpm --filter @repo/desktop typecheck` を実行する
3. `classifyExecuteResult()` の `assertNever(result)` 行でコンパイルエラーが発生する
4. 新メンバーに対応する `case` を追加して `ExecuteOutcome` を更新する
5. `executeAsync()` の switch に新 outcome の処理を追加する
6. テストを追加して PASS を確認する
