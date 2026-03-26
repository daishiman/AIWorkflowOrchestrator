# IPC レスポンス形式定義（P60 修正版）

## 概要

コードベースの実装に基づく、実際の IPC レスポンス定義。P60（IPC テスト応答形式不一致）を防ぐため、設計段階で確定する。

---

## 共通型定義

```typescript
/**
 * IPC結果型（skillCreatorHandlers.ts L39-43, creatorHandlers.ts L24-28）
 *
 * 重要: error は単純な string 型である。
 * { code: string, message: string } 形式ではない。
 */
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 各チャネルのレスポンス型

### skill-creator:plan

```typescript
// 成功（通常の plan 結果）
IpcResult<RuntimeSkillCreatorPlanResult>
// where RuntimeSkillCreatorPlanResult = {
//   planId: string;
//   skillSpec: string;
//   estimatedSteps: number;
//   skillName: string;
//   description: string;
//   agents: Array<{ name: string; role: string }>;
//   scripts: Array<{ name: string; purpose: string }>;
//   triggers: string[];
//   anchors: string[];
// }

// 成功（TerminalHandoff）
IpcResult<{ type: "terminal_handoff"; guidance: HandoffGuidance }>
// where HandoffGuidance = {
//   terminalCommand: string;
//   contextSummary: string;
//   reason: string;
// }

// エラー
{ success: false, error: "サニタイズ済み文字列" }
```

### skill-creator:execute-plan

```typescript
// 成功
IpcResult<RuntimeSkillCreatorExecuteResult>
// where RuntimeSkillCreatorExecuteResult = {
//   executeId: string;
//   skillName: string;
//   success: boolean;
//   error?: string;
// }

// エラー
{ success: false, error: "サニタイズ済み文字列" }
```

### skill-creator:improve-skill

```typescript
// 成功（改善提案）
IpcResult<RuntimeSkillCreatorImproveResult>
// where RuntimeSkillCreatorImproveResult = {
//   improveId: string;
//   suggestions: RuntimeSkillCreatorImproveSuggestion[];
//   revisedSpec?: string;
// }

// 成功（TerminalHandoff）
IpcResult<{ type: "terminal_handoff"; guidance: HandoffGuidance }>

// エラー（IPC層で catch → sanitizeErrorMessage → string に変換）
{ success: false, error: "サニタイズ済み文字列" }
```

### skill-creator:apply-improvement

```typescript
// 成功
IpcResult<ApplyImprovementResult>
// where ApplyImprovementResult = {
//   applied: number;
//   skipped: number;
//   skippedDetails: Array<{ section: string; reason: string }>;
//   errors: string[];
// }

// エラー
{ success: false, error: "サニタイズ済み文字列" }
```

---

## P60 修正の要点

| 項目               | 誤った想定                                     | 正しい実装                          |
| ------------------ | ---------------------------------------------- | ----------------------------------- |
| エラーレスポンス   | `{ success: false, error: { code, message } }` | `{ success: false, error: string }` |
| テストアサーション | `expect(result.error.code).toBe(...)`          | `expect(result.error).toBe("...")`  |
| サニタイズ         | エラーオブジェクトをそのまま返却               | `sanitizeErrorMessage()` で文字列化 |

### Facade 内部のエラー形式との違い

`RuntimeSkillCreatorFacade.improve()` は内部で `RuntimeSkillCreatorImproveErrorResponse` 型（`{ success: false, error: { code, message } }`）を返すことがある。しかし、IPC ハンドラー層（`creatorHandlers.ts`）の catch 句で `sanitizeErrorMessage()` により `string` に変換されるため、Renderer 側に返るのは常に `{ success: false, error: string }` である。

テストで Facade をモックする場合:

- Facade がエラーを**スロー**した場合 → IPC ハンドラーが catch して `{ success: false, error: string }` を返す
- Facade が `{ success: false, error: { code, message } }` を**返却**した場合 → IPC ハンドラーは `{ success: true, data: { success: false, error: { code, message } } }` を返す（data として格納される）
