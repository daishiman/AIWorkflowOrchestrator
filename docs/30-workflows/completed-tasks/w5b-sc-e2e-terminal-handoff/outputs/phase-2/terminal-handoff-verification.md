# TerminalHandoff 検証設計

## 概要

API Key 未設定時に TerminalHandoff 経路が正しく動作することを検証する設計。

---

## HandoffGuidance 型定義

ソース: `packages/shared/src/types/handoff.ts`

```typescript
export interface HandoffGuidance {
  /** Claude Code CLI で継続するためのコマンド例 */
  terminalCommand: string;
  /** 実行コンテキストの要約 */
  contextSummary: string;
  /** handoff になった理由 */
  reason: string;
}
```

---

## Plan レスポンスにおける TerminalHandoff

ソース: `packages/shared/src/types/skillCreator.ts` L408-413

```typescript
export type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | {
      type: "terminal_handoff";
      guidance: HandoffGuidance;
    };
```

IPC ハンドラーがラップすると:

```typescript
{
  success: true,
  data: {
    type: "terminal_handoff",
    guidance: {
      terminalCommand: "claude code --prompt '...'",
      contextSummary: "スキル作成のコンテキスト要約",
      reason: "API Key が設定されていません"
    }
  }
}
```

---

## TerminalHandoff 発火条件

`RuntimeSkillCreatorFacade.plan()` (L108-122) の動作:

1. `resolveDecision(authMode, apiKey)` を呼び出す
2. `decision.type === "terminal_handoff"` の場合:
   - `TerminalHandoffBuilder.buildForSurface()` で HandoffGuidance を生成
   - `{ type: "terminal_handoff", guidance }` を返却
3. そうでない場合: integrated_api 経路で LLM 呼び出し

テストでの発火方法:

```typescript
// authMode: "api-key" かつ apiKey が null/空文字列の場合に terminal_handoff になる
const result = await handler(createMockEvent(), {
  prompt: "テストスキル作成",
  authMode: "api-key",
  apiKey: null,
});
```

---

## 検証項目

### 構造検証

| フィールド        | 型       | 検証内容                    |
| ----------------- | -------- | --------------------------- |
| `type`            | `string` | `"terminal_handoff"` と一致 |
| `terminalCommand` | `string` | 非空文字列                  |
| `contextSummary`  | `string` | 非空文字列                  |
| `reason`          | `string` | 非空文字列                  |

### セキュリティ検証

`terminalCommand` に対して:

- 英数字で開始すること（`/^[a-zA-Z0-9]/`）
- シェルインジェクション文字を含まないこと:
  - `;` (コマンド連結)
  - `|` (パイプ)
  - `&&` (AND 連結)
  - `` ` `` (バッククォート実行)
  - `$()` (コマンド置換)
  - `>` / `>>` (リダイレクト)

### Improve における TerminalHandoff

`RuntimeSkillCreatorFacade.improve()` も同様に TerminalHandoff を返す:

```typescript
export type RuntimeSkillCreatorImproveResponse =
  | RuntimeSkillCreatorImproveResult
  | {
      type: "terminal_handoff";
      guidance: HandoffGuidance;
    }
  | RuntimeSkillCreatorImproveErrorResponse;
```

検証方法は plan と同一。

---

## テストケース設計

| ケースID | テスト内容                              | 期待結果                                    |
| -------- | --------------------------------------- | ------------------------------------------- |
| TH-01    | apiKey: null で plan 呼び出し           | terminal_handoff レスポンス                 |
| TH-02    | apiKey: "" で plan 呼び出し             | terminal_handoff レスポンス                 |
| TH-03    | apiKey: " " (空白のみ) で plan 呼び出し | terminal_handoff レスポンス                 |
| TH-04    | terminalCommand の形式検証              | 英数字開始、シェルインジェクション文字なし  |
| TH-05    | contextSummary が非空                   | 非空文字列                                  |
| TH-06    | reason が非空                           | 非空文字列                                  |
| TH-07    | apiKey: null で improve-skill 呼び出し  | terminal_handoff レスポンス                 |
| TH-08    | 有効な apiKey で plan 呼び出し          | 通常の plan 結果（terminal_handoff でない） |
