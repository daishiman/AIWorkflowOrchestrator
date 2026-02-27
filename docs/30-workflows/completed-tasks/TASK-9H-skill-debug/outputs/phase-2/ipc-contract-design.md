# IPC契約設計 - TASK-9H-SKILL-DEBUG

## 7つのIPCチャネル

| #   | チャネル名                    | 方向          | 引数型                       | 戻り値型                         |
| --- | ----------------------------- | ------------- | ---------------------------- | -------------------------------- |
| 1   | skill:debug:start             | Renderer→Main | DebugStartRequest            | IpcResult<DebugSessionState>     |
| 2   | skill:debug:command           | Renderer→Main | DebugCommandRequest          | IpcResult<void>                  |
| 3   | skill:debug:breakpoint:add    | Renderer→Main | DebugBreakpointAddRequest    | IpcResult<Breakpoint>            |
| 4   | skill:debug:breakpoint:remove | Renderer→Main | DebugBreakpointRemoveRequest | IpcResult<void>                  |
| 5   | skill:debug:inspect           | Renderer→Main | DebugInspectRequest          | IpcResult<unknown>               |
| 6   | skill:debug:evaluate          | Renderer→Main | DebugEvaluateRequest         | IpcResult<DebugEvaluateResponse> |
| 7   | skill:debug:event             | Main→Renderer | DebugEvent                   | N/A (one-way)                    |

## バリデーション仕様 (P42準拠)

全ハンドラで以下の3段バリデーションを適用:

```
1. typeof arg !== "string" → エラー
2. arg === "" → エラー
3. arg.trim() === "" → エラー
```

### チャネル別バリデーション

| チャネル          | フィールド   | バリデーション                      |
| ----------------- | ------------ | ----------------------------------- |
| start             | skillName    | 3段バリデーション                   |
| start             | prompt       | 3段バリデーション                   |
| start             | breakpoints  | Array.isArray チェック              |
| command           | sessionId    | 3段バリデーション                   |
| command           | command      | VALID_DEBUG_COMMANDS ホワイトリスト |
| breakpoint:add    | sessionId    | 3段バリデーション                   |
| breakpoint:add    | breakpoint   | typeof === "object"                 |
| breakpoint:remove | sessionId    | 3段バリデーション                   |
| breakpoint:remove | breakpointId | 3段バリデーション                   |
| inspect           | sessionId    | 3段バリデーション                   |
| inspect           | path         | 3段バリデーション                   |
| evaluate          | sessionId    | 3段バリデーション                   |
| evaluate          | expression   | 3段バリデーション                   |

## セキュリティチェック

- 全ハンドラで `validateIpcSender` による送信元検証
- エラーレスポンスは内部情報をサニタイズ（スタックトレース除外）
- 式評価は `vm.createContext` サンドボックスで実行

## Preload API対応

| チャネル (1-6) | Preload メソッド | パターン                  |
| -------------- | ---------------- | ------------------------- |
| 1-6            | safeInvokeUnwrap | invoke (request-response) |
| 7              | safeOn           | on (event listener)       |
