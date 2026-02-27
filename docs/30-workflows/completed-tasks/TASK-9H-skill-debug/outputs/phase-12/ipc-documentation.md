# TASK-9H Skill Debug Mode IPC ドキュメント

> **タスクID**: TASK-9H
> **作成日**: 2026-02-27
> **Phase**: 12 - ドキュメント
> **対象チャネル数**: 7（Invoke 6 + Event 1）

---

## 1. チャネル一覧

| #   | チャネル名                      | 定数名                          | 方向             | 登録先                    |
| --- | ------------------------------- | ------------------------------- | ---------------- | ------------------------- |
| 1   | `skill:debug:start`             | `SKILL_DEBUG_START`             | Renderer -> Main | `ALLOWED_INVOKE_CHANNELS` |
| 2   | `skill:debug:command`           | `SKILL_DEBUG_COMMAND`           | Renderer -> Main | `ALLOWED_INVOKE_CHANNELS` |
| 3   | `skill:debug:breakpoint:add`    | `SKILL_DEBUG_BREAKPOINT_ADD`    | Renderer -> Main | `ALLOWED_INVOKE_CHANNELS` |
| 4   | `skill:debug:breakpoint:remove` | `SKILL_DEBUG_BREAKPOINT_REMOVE` | Renderer -> Main | `ALLOWED_INVOKE_CHANNELS` |
| 5   | `skill:debug:inspect`           | `SKILL_DEBUG_INSPECT`           | Renderer -> Main | `ALLOWED_INVOKE_CHANNELS` |
| 6   | `skill:debug:evaluate`          | `SKILL_DEBUG_EVALUATE`          | Renderer -> Main | `ALLOWED_INVOKE_CHANNELS` |
| 7   | `skill:debug:event`             | `SKILL_DEBUG_EVENT`             | Main -> Renderer | `ALLOWED_ON_CHANNELS`     |

全チャネルは `apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` オブジェクトで定数定義されている。ハードコード文字列の使用は禁止（P27準拠）。

---

## 2. 各チャネル詳細

### 2.1 `skill:debug:start` -- デバッグセッション開始

デバッグセッションを新規作成して開始する。

**方向**: Renderer -> Main (invoke)
**Preload メソッド**: `skillAPI.debug.startSession(request)`
**通信パターン**: `safeInvokeUnwrap<DebugSessionState>`

#### リクエスト型

```typescript
interface DebugStartRequest {
  /** デバッグ対象スキル名 */
  skillName: string;
  /** 実行プロンプト */
  prompt: string;
  /** 初期ブレークポイント（id は自動生成） */
  breakpoints: Omit<Breakpoint, "id">[];
}
```

#### レスポンス型

```typescript
// 成功時
{ success: true, data: DebugSessionState }

// 失敗時
{ success: false, error: string }
```

`DebugSessionState` の主要フィールド:

```typescript
interface DebugSessionState {
  id: string; // UUID v4
  skillName: string;
  status: DebugSessionStatus; // 開始直後は "running"
  breakpoints: Breakpoint[];
  currentStep?: DebugStep;
  variables: Record<string, unknown>;
  callStack: CallStackEntry[];
  startedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  error?: string;
  steps: DebugStep[];
}
```

#### バリデーションルール

| フィールド    | ルール                                      | エラーメッセージ                         |
| ------------- | ------------------------------------------- | ---------------------------------------- |
| `skillName`   | `typeof === "string"` かつ `.trim() !== ""` | `"skillName must be a non-empty string"` |
| `prompt`      | `typeof === "string"` かつ `.trim() !== ""` | `"prompt must be a non-empty string"`    |
| `breakpoints` | 存在チェック（省略時は `[]` として扱う）    | --                                       |

#### エラー条件

- セッションが既にアクティブな場合: `"A debug session is already active"`
- IPC送信元検証失敗: `"Unauthorized IPC call"`

---

### 2.2 `skill:debug:command` -- デバッグコマンド実行

アクティブセッションに対してデバッグコマンドを送信する。

**方向**: Renderer -> Main (invoke)
**Preload メソッド**: `skillAPI.debug.executeCommand(request)`
**通信パターン**: `safeInvokeUnwrap<void>`

#### リクエスト型

```typescript
interface DebugCommandRequest {
  /** 対象セッションID */
  sessionId: string;
  /** 実行コマンド */
  command: DebugCommand;
}

type DebugCommand =
  | "continue" // paused -> running に再開
  | "stepOver" // 1ステップ実行（コールスタック変更なし）
  | "stepInto" // 1ステップ実行（コールスタックにプッシュ）
  | "stepOut" // 1ステップ実行（コールスタックからポップ）
  | "pause" // running -> paused に一時停止
  | "stop"; // セッション停止 + クリーンアップ
```

#### レスポンス型

```typescript
// 成功時
{ success: true }

// 失敗時
{ success: false, error: string }
```

#### バリデーションルール

| フィールド  | ルール                                      | エラーメッセージ                                                               |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| `sessionId` | `typeof === "string"` かつ `.trim() !== ""` | `"sessionId must be a non-empty string"`                                       |
| `command`   | 6つの有効値のいずれか                       | `"command must be one of: continue, stepOver, stepInto, stepOut, pause, stop"` |

#### エラー条件

- セッションが存在しない: `"No active debug session"`
- セッションIDが不一致: `"Session ID mismatch: expected {expected}, got {actual}"`
- running でないのに pause: `"Cannot pause: session is not running"`

---

### 2.3 `skill:debug:breakpoint:add` -- ブレークポイント追加

アクティブセッションにブレークポイントを追加する。

**方向**: Renderer -> Main (invoke)
**Preload メソッド**: `skillAPI.debug.addBreakpoint(request)`
**通信パターン**: `safeInvokeUnwrap<Breakpoint>`

#### リクエスト型

```typescript
interface DebugBreakpointAddRequest {
  /** 対象セッションID */
  sessionId: string;
  /** 追加するブレークポイント（id は自動生成） */
  breakpoint: Omit<Breakpoint, "id">;
}
```

`Breakpoint` のフィールド:

```typescript
interface Breakpoint {
  id: string; // UUID v4（自動生成）
  type: BreakpointType; // "tool" | "hook" | "step"
  condition?: string; // 条件式（省略時は無条件停止）
  toolName?: string; // type="tool" 時の対象ツール名
  hookType?: HookType; // type="hook" 時: "PreToolUse" | "PostToolUse"
  enabled: boolean; // 有効/無効フラグ
}
```

#### レスポンス型

```typescript
// 成功時（id が生成された Breakpoint を返す）
{ success: true, data: Breakpoint }

// 失敗時
{ success: false, error: string }
```

#### バリデーションルール

| フィールド   | ルール                                      | エラーメッセージ                         |
| ------------ | ------------------------------------------- | ---------------------------------------- |
| `sessionId`  | `typeof === "string"` かつ `.trim() !== ""` | `"sessionId must be a non-empty string"` |
| `breakpoint` | `typeof === "object"` かつ `!== null`       | `"breakpoint must be an object"`         |

#### エラー条件

- セッションが存在しない/ID不一致: 2.2 と同様
- ブレークポイント上限到達: `"Maximum breakpoints limit reached: 100"`

---

### 2.4 `skill:debug:breakpoint:remove` -- ブレークポイント削除

アクティブセッションからブレークポイントを削除する。

**方向**: Renderer -> Main (invoke)
**Preload メソッド**: `skillAPI.debug.removeBreakpoint(request)`
**通信パターン**: `safeInvokeUnwrap<void>`

#### リクエスト型

```typescript
interface DebugBreakpointRemoveRequest {
  /** 対象セッションID */
  sessionId: string;
  /** 削除するブレークポイントID */
  breakpointId: string;
}
```

#### レスポンス型

```typescript
// 成功時
{ success: true }

// 失敗時
{ success: false, error: string }
```

#### バリデーションルール

| フィールド     | ルール                                      | エラーメッセージ                            |
| -------------- | ------------------------------------------- | ------------------------------------------- |
| `sessionId`    | `typeof === "string"` かつ `.trim() !== ""` | `"sessionId must be a non-empty string"`    |
| `breakpointId` | `typeof === "string"` かつ `.trim() !== ""` | `"breakpointId must be a non-empty string"` |

#### エラー条件

- セッションが存在しない/ID不一致: 2.2 と同様
- ブレークポイントが見つからない: `"Breakpoint not found: {breakpointId}"`

---

### 2.5 `skill:debug:inspect` -- 変数インスペクション

セッション変数をドット記法のパスで取得する。

**方向**: Renderer -> Main (invoke)
**Preload メソッド**: `skillAPI.debug.inspectVariable(request)`
**通信パターン**: `safeInvokeUnwrap<unknown>`

#### リクエスト型

```typescript
interface DebugInspectRequest {
  /** 対象セッションID */
  sessionId: string;
  /** 変数パス（ドット記法対応、例: "result.data.count"） */
  path: string;
}
```

#### レスポンス型

```typescript
// 成功時（変数値。存在しない場合は undefined）
{ success: true, data: unknown }

// 失敗時
{ success: false, error: string }
```

#### バリデーションルール

| フィールド  | ルール                                      | エラーメッセージ                         |
| ----------- | ------------------------------------------- | ---------------------------------------- |
| `sessionId` | `typeof === "string"` かつ `.trim() !== ""` | `"sessionId must be a non-empty string"` |
| `path`      | `typeof === "string"` かつ `.trim() !== ""` | `"path must be a non-empty string"`      |

#### ドット記法の動作

```
path = "user.name"
variables = { user: { name: "Alice", age: 30 } }
結果: "Alice"

path = "user"
結果: { name: "Alice", age: 30 }

path = "nonexistent.key"
結果: undefined
```

---

### 2.6 `skill:debug:evaluate` -- 式評価

サンドボックス環境で式を評価する。**paused 状態でのみ実行可能**。

**方向**: Renderer -> Main (invoke)
**Preload メソッド**: `skillAPI.debug.evaluateExpression(request)`
**通信パターン**: `safeInvokeUnwrap<DebugEvaluateResponse>`

#### リクエスト型

```typescript
interface DebugEvaluateRequest {
  /** 対象セッションID */
  sessionId: string;
  /** 評価する式 */
  expression: string;
}
```

#### レスポンス型

```typescript
interface DebugEvaluateResponse {
  /** 評価結果 */
  result: unknown;
  /** 結果の typeof 値（"number", "string", "boolean", "object", "undefined"） */
  type: string;
}

// 成功時
{ success: true, data: DebugEvaluateResponse }

// 失敗時
{ success: false, error: string }
```

#### バリデーションルール

| フィールド   | ルール                                      | エラーメッセージ                          |
| ------------ | ------------------------------------------- | ----------------------------------------- |
| `sessionId`  | `typeof === "string"` かつ `.trim() !== ""` | `"sessionId must be a non-empty string"`  |
| `expression` | `typeof === "string"` かつ `.trim() !== ""` | `"expression must be a non-empty string"` |

#### セキュリティ制約

- **実行環境**: `vm.createContext()` で作成した隔離コンテキスト
- **アクセス可能**: セッション変数のみ
- **アクセス不可**: `process`, `require`, `fs`, `Buffer`, `setTimeout` 等のNode.jsグローバル
- **タイムアウト**: 5秒（`DEBUG_CONSTANTS.EXPRESSION_TIMEOUT_MS`）
- **状態制約**: `paused` 状態でのみ実行可能

#### エラー条件

- paused 状態でない: `"Can only evaluate expressions when session is paused"`
- タイムアウト: `"Expression evaluation timed out"`
- 構文エラー: JavaScript の SyntaxError がそのままスロー
- セッション関連: 2.2 と同様

---

### 2.7 `skill:debug:event` -- デバッグイベント（Main -> Renderer）

Main Process から Renderer にデバッグイベントをプッシュする。

**方向**: Main -> Renderer (send)
**Preload メソッド**: `skillAPI.debug.onDebugEvent(callback)`
**通信パターン**: `safeOn<DebugEvent>` (リスナー登録、返り値はクリーンアップ関数)

#### イベント型（Discriminated Union）

```typescript
type DebugEvent =
  | DebugStepEvent
  | DebugBreakpointHitEvent
  | DebugVariableChangedEvent
  | DebugSessionEndedEvent;
```

#### イベント詳細

**1. ステップイベント**

```typescript
interface DebugStepEvent {
  type: "step";
  sessionId: string;
  step: DebugStep;
}
```

**2. ブレークポイントヒットイベント**

```typescript
interface DebugBreakpointHitEvent {
  type: "breakpoint-hit";
  sessionId: string;
  breakpoint: Breakpoint;
  step?: DebugStep;
}
```

**3. 変数変更イベント**

```typescript
interface DebugVariableChangedEvent {
  type: "variable-changed";
  sessionId: string;
  path: string; // ドット記法のパス
  value: unknown; // 新しい値
}
```

**4. セッション終了イベント**

```typescript
interface DebugSessionEndedEvent {
  type: "session-ended";
  sessionId: string;
  error?: string; // エラー終了時のメッセージ
  completedAt?: string; // ISO 8601 完了時刻
}
```

#### 送信トリガー

| イベント        | トリガー                                        |
| --------------- | ----------------------------------------------- |
| `session-ended` | `stop` コマンド実行時、セッションタイムアウト時 |

#### グレースフル処理

- `mainWindow.isDestroyed()` が `true` の場合、送信をスキップ（エラーなし）
- `webContents.send()` で例外発生時もグレースフルに無視

---

## 3. セキュリティ

### 3.1 IPC 送信元検証

全 Invoke ハンドラ（6チャネル）で `validateIpcSender()` を実行。

```typescript
const validation = validateIpcSender(event, {
  allowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

### 3.2 バリデーション標準（P42準拠）

全文字列引数に3段バリデーションを適用:

1. **型チェック**: `typeof args?.field !== "string"`
2. **空文字列チェック**: `args.field === ""`（暗黙的）
3. **トリム空文字列チェック**: `args.field.trim() === ""`

### 3.3 チャネルホワイトリスト

| 区分   | ホワイトリスト            | チャネル数 |
| ------ | ------------------------- | ---------- |
| Invoke | `ALLOWED_INVOKE_CHANNELS` | 6          |
| Event  | `ALLOWED_ON_CHANNELS`     | 1          |

ホワイトリスト外のチャネルは `safeInvoke` / `safeOn` が拒否する。

### 3.4 式評価のサンドボックス

- `vm.createContext()` により Node.js グローバルから完全に隔離
- セッション変数のみがコンテキストに注入される
- 5秒タイムアウトにより無限ループを防止
