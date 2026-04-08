# Phase 1: 要件定義成果物 — assertNever有無・union型バリアント一覧

## P50チェック結果

### git status

ブランチ: HEAD（worktreeブランチ）

### 対象ファイル調査

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — 実装対象

### executeAsync() 現在の実装（抜粋）

```typescript
const isStructuredError =
  typeof executeResult === "object" &&
  executeResult !== null &&
  "success" in executeResult &&
  executeResult.success === false;
const phase = isStructuredError ? "error" : "complete";
this.workflowEngine.triggerPhaseTransition(
  planId,
  phase,
  phase === "complete" ? 100 : 0,
);
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(
    planId,
    snapshot ?? null,
    errorResponse.error.message,
  );
}
```

**判定**: `if-else` パターン（`isStructuredError` による条件分岐のみ）→ TDDで新規実装（通常フロー）

## assertNever 既存実装確認

- `packages/shared/src/utils/` 配下: `assertNever` 関数 **なし**
- `apps/desktop/src/` 配下: `assertNever` 関数 **なし**
- プロジェクト全体: `assertNever` / `export function.*never` パターン **なし**

**結論**: 既存の `assertNever` 実装なし → **新規 module-local helper として実装する**

## union型バリアント列挙

### `RuntimeSkillCreatorExecuteResponse` (= `SkillExecuteResponse` エイリアス)

定義場所: `packages/shared/src/types/skillCreator.ts` 行878〜880

```typescript
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult // バリアント A
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle } // バリアント B
  | RuntimeSkillCreatorExecuteErrorResponse; // バリアント C
```

### 各バリアントの詳細

| バリアント                                     | 判別子プロパティ           | 型                   | literal型か         |
| ---------------------------------------------- | -------------------------- | -------------------- | ------------------- | ---------------- |
| A: `RuntimeSkillCreatorExecuteResult`          | `success: boolean`         | `boolean`            | ❌ (boolean は true | false = literal) |
| B: `{ type: "terminal_handoff"; bundle: ... }` | `type: "terminal_handoff"` | `"terminal_handoff"` | ✅ literal          |
| C: `RuntimeSkillCreatorExecuteErrorResponse`   | `success: false`           | `false`              | ✅ literal          |

### インターフェース定義詳細

**バリアント A: RuntimeSkillCreatorExecuteResult**

```typescript
export interface RuntimeSkillCreatorExecuteResult {
  executeId: string;
  skillName: string;
  success: boolean; // ← boolean（true | false）
  error?: string; // ← optional string
  sessionId?: string;
  // ... その他フィールド
}
```

**バリアント B: インラインオブジェクト型**

```typescript
{
  type: "terminal_handoff";
  bundle: TerminalHandoffBundle;
}
// type フィールドが "terminal_handoff" literal
```

**バリアント C: RuntimeSkillCreatorExecuteErrorResponse**

```typescript
export interface RuntimeSkillCreatorExecuteErrorResponse {
  success: false; // ← false literal
  error: { code: RuntimeSkillCreatorDegradedReason; message: string };
}
```

## executeAsync() 現分岐構造

| パス                      | 条件                                             | 処理                                                               |
| ------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| 正常系（success/handoff） | `isStructuredError === false`                    | `triggerPhaseTransition("complete", 100)`                          |
| エラー系                  | `isStructuredError === true` (success === false) | `triggerPhaseTransition("error", 0)` + explicit snapshot           |
| 例外                      | try/catch                                        | `triggerPhaseTransition("error", 0)` + snapshot with error message |

**問題**: `isStructuredError` は `success === false` のみ確認 → terminal_handoff バリアントや将来追加バリアントを型レベルで網羅できない
