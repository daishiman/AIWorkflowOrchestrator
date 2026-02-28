# TASK-9H Skill Debug Mode 実装ガイド

> **タスクID**: TASK-9H
> **作成日**: 2026-02-27
> **Phase**: 12 - ドキュメント
> **対象**: packages/shared, apps/desktop

---

## Part 1: 概念説明（中学生レベル）

### デバッグモードとは？ -- 「ゲームのポーズボタン」

ゲームをプレイしているとき、途中で「ポーズボタン」を押すと画面が止まります。止まっている間に、キャラクターのHP・持ち物・マップの状態を確認できます。確認が終わったら「再開ボタン」を押して、続きからプレイを再開します。

スキルデバッグモードは、まさにこの「ポーズボタン」です。

- **スキル** = ゲームで言うと「自動プレイするキャラクター」
- **デバッグモード** = そのキャラクターの動きを途中で止めて中身を覗く仕組み

### なぜ必要なの？ -- 「虫眼鏡で中身を覗く」

お弁当箱の中身が分からないとき、虫眼鏡で覗いてみたくなります。スキル（AIが自動で行う処理）も同じで、「今何をしているの？」「どんなデータを持っているの？」を覗きたい場面があります。

デバッグモードでは次のことができます。

| やりたいこと               | 日常の例え              | デバッグ用語             |
| -------------------------- | ----------------------- | ------------------------ |
| 動きを途中で止める         | ゲームのポーズ          | **ブレークポイント**     |
| 止まっている間に中身を見る | 虫眼鏡で覗く            | **変数インスペクション** |
| 1歩ずつ進める              | 送りボタン（1コマ送り） | **ステップ実行**         |
| 簡単な計算を試す           | 電卓で確認              | **式評価**               |
| 動きの記録を見返す         | ビデオの巻き戻し        | **ステップ履歴**         |

### 状態の流れ -- 「信号機」

デバッグセッションは「信号機」のように状態が変わります。

```
 [待機]           [実行中]          [一時停止]
  idle  ──開始──▶ running ──停止──▶  paused
                    │                  │
                    │                  ├──再開──▶ running
                    │                  ├──完了──▶ completed
                    │                  └──失敗──▶ error
                    ├──完了──▶ completed
                    └──失敗──▶ error
```

- **idle（待機）**: まだスタートしていない状態。信号が赤。
- **running（実行中）**: スキルが動いている状態。信号が青。
- **paused（一時停止）**: 止まっている状態。信号が黄色。この間に中身を覗ける。
- **completed（完了）**: 正常に終わった状態。
- **error（エラー）**: 問題が起きて止まった状態。

一度 completed や error になったら、もう戻れません（新しいセッションを始める必要がある）。

### 安全な計算 -- 「ガラス越しの実験」

理科の実験で「安全メガネ」を付けるように、式評価は「サンドボックス」という安全な箱の中で行います。

- 箱の中では四則演算や文字列操作が可能
- 箱の外（パソコンのファイルシステムやインターネット）にはアクセスできない
- 5秒以上かかる計算は自動的に止まる

---

## Part 2: 開発者向け実装詳細

### 2.1 アーキテクチャ全体像

```
┌─────────────────┐      IPC (7ch)      ┌──────────────────────────┐
│   Renderer      │ ◄──────────────────▶ │      Main Process        │
│                 │                      │                          │
│  skill-api.ts   │  safeInvokeUnwrap    │  skillDebugHandlers.ts   │
│  debug { ... }  │ ─────────────────▶   │  ├── P42準拠バリデーション│
│                 │                      │  └── SkillDebugger       │
│  onDebugEvent   │  ◄─── safeOn ────── │      ├── DebugSession    │
│  (SKILL_DEBUG_  │  webContents.send    │      │   (状態マシン)    │
│   EVENT)        │                      │      └── vm.runInContext  │
└─────────────────┘                      └──────────────────────────┘
         │                                           │
         │           @repo/shared                    │
         └───────── skill-debug.ts ──────────────────┘
                   (型 + 定数 + 遷移テーブル)
```

### 2.2 共有型定義 (`packages/shared/src/types/skill-debug.ts`)

233行のファイルで以下を定義。

#### 型一覧

| 型名                           | 分類                | 用途                                                                           |
| ------------------------------ | ------------------- | ------------------------------------------------------------------------------ |
| `DebugSessionStatus`           | リテラル型ユニオン  | `"idle" \| "running" \| "paused" \| "completed" \| "error"`                    |
| `DebugSessionState`            | インターフェース    | IPC転送用のセッション状態（全フィールドシリアライズ可能）                      |
| `BreakpointType`               | リテラル型ユニオン  | `"tool" \| "hook" \| "step"`                                                   |
| `HookType`                     | リテラル型ユニオン  | `"PreToolUse" \| "PostToolUse"`                                                |
| `Breakpoint`                   | インターフェース    | ブレークポイント定義（id, type, condition, toolName, hookType, enabled）       |
| `DebugStepType`                | リテラル型ユニオン  | `"tool_call" \| "hook_execution" \| "agent_response"`                          |
| `DebugStep`                    | インターフェース    | ステップ情報（stepNumber, type, toolName, hookType, input, output, timestamp） |
| `CallStackEntryType`           | リテラル型ユニオン  | `"skill" \| "agent" \| "tool"`                                                 |
| `CallStackEntry`               | インターフェース    | コールスタックエントリ（depth, name, type, startTime）                         |
| `DebugEvent`                   | Discriminated Union | 4種のイベント型（step, breakpoint-hit, variable-changed, session-ended）       |
| `DebugCommand`                 | リテラル型ユニオン  | `"continue" \| "stepOver" \| "stepInto" \| "stepOut" \| "pause" \| "stop"`     |
| `DebugStartRequest`            | インターフェース    | セッション開始リクエスト                                                       |
| `DebugCommandRequest`          | インターフェース    | コマンド実行リクエスト                                                         |
| `DebugBreakpointAddRequest`    | インターフェース    | ブレークポイント追加リクエスト                                                 |
| `DebugBreakpointRemoveRequest` | インターフェース    | ブレークポイント削除リクエスト                                                 |
| `DebugInspectRequest`          | インターフェース    | 変数インスペクションリクエスト                                                 |
| `DebugEvaluateRequest`         | インターフェース    | 式評価リクエスト                                                               |
| `DebugEvaluateResponse`        | インターフェース    | 式評価レスポンス（result, type）                                               |

#### 定数

| 定数名                                  | 値                                                          | 説明                       |
| --------------------------------------- | ----------------------------------------------------------- | -------------------------- |
| `VALID_DEBUG_TRANSITIONS`               | `Record<DebugSessionStatus, readonly DebugSessionStatus[]>` | 有効な状態遷移テーブル     |
| `DEBUG_CONSTANTS.SESSION_TIMEOUT_MS`    | `1,800,000` (30分)                                          | セッション自動タイムアウト |
| `DEBUG_CONSTANTS.MAX_BREAKPOINTS`       | `100`                                                       | 最大ブレークポイント数     |
| `DEBUG_CONSTANTS.MAX_CALL_STACK_DEPTH`  | `100`                                                       | 最大コールスタック深度     |
| `DEBUG_CONSTANTS.MAX_STEPS`             | `10,000`                                                    | 最大ステップ数             |
| `DEBUG_CONSTANTS.EXPRESSION_TIMEOUT_MS` | `5,000` (5秒)                                               | 式評価タイムアウト         |

#### IPC シリアライズ方針

- **Main Process 内部**: `Date` オブジェクト使用可
- **IPC 境界**: `.toISOString()` で ISO 8601 文字列に変換
- **Renderer 側**: `string` として受け取り、表示時に `new Date()` で復元

### 2.3 DebugSession クラス (`apps/desktop/src/main/services/skill/DebugSession.ts`)

257行。個別のデバッグセッションの状態を管理するクラス。

#### 責務

- 状態遷移の管理と検証
- ブレークポイントのCRUD
- 変数の設定・取得（ドット記法対応）
- コールスタックのプッシュ/ポップ
- ステップの記録と履歴管理
- IPC転送用のシリアライズ（`toJSON()`）

#### 状態マシン

```typescript
// VALID_DEBUG_TRANSITIONS を使った状態遷移検証
private transition(target: DebugSessionStatus): void {
  const allowed = VALID_DEBUG_TRANSITIONS[this._status];
  if (!allowed.includes(target)) {
    throw new Error(`Invalid state transition: ${this._status} -> ${target}`);
  }
  this._status = target;
}
```

遷移メソッド:

- `start()`: idle -> running
- `pause()`: running -> paused
- `resume()`: paused -> running
- `complete()`: running/paused -> completed
- `fail(error)`: running/paused -> error（エラーメッセージを保持）

#### ブレークポイント管理

```typescript
addBreakpoint(bp: Omit<Breakpoint, "id">): Breakpoint {
  // MAX_BREAKPOINTS (100) 制限チェック
  // UUID v4 で id を自動生成
  // 生成された Breakpoint を返す
}

removeBreakpoint(breakpointId: string): boolean {
  // id で検索して削除、見つからない場合 false を返す
}

getBreakpoints(): readonly Breakpoint[] {
  // 防御的コピーを返す（外部からの変更を防止）
}
```

#### 変数管理（ドット記法対応）

```typescript
// 設定: "user.name" -> { user: { name: "Alice" } }
setVariable(path: string, value: unknown): void {
  const parts = path.split(".");
  // 中間オブジェクトを自動生成しながらネスト設定
}

// 取得: "user.name" -> "Alice"
getVariable(path: string): unknown {
  const parts = path.split(".");
  // ドット区切りでトラバース、途中で undefined/null なら undefined を返す
}
```

#### コールスタック管理

- `pushCallStack(name, type)`: LIFO スタックにプッシュ。`MAX_CALL_STACK_DEPTH` (100) 制限。
- `popCallStack()`: スタックからポップ。空の場合 `undefined` を返す。
- `getCallStack()`: 防御的コピーを返す。

#### ステップ管理

- `recordStep(type, options?)`: ステップ番号をインクリメントし、ISO 8601 タイムスタンプを記録。`MAX_STEPS` (10,000) 制限。
- `getCurrentStep()`: 最後に記録したステップを返す。
- `getStepHistory()`: 全ステップ履歴の防御的コピーを返す。

#### シリアライズ

```typescript
toJSON(): DebugSessionState {
  // 全フィールドをコピーして返す（参照共有を防止）
  // 日付は ISO 8601 文字列（IPC転送可能）
}
```

### 2.4 SkillDebugger クラス (`apps/desktop/src/main/services/skill/SkillDebugger.ts`)

253行。Facade パターンで統合窓口を提供。

#### 設計判断

- **排他的セッション管理**: 同時実行は1セッションのみ。`activeSession` が `null` でない場合、新規セッション開始はエラー。
- **セッションタイムアウト**: `setTimeout` で 30分後に自動完了。`cleanupSession()` でタイマーも解除。
- **コンストラクタ依存**: `BrowserWindow` をコンストラクタで受け取り（Constructor Injection）。

#### セッション管理

```typescript
startSession(skillName, prompt, breakpoints): DebugSessionState {
  // 1. 排他チェック（既存セッションがあればエラー）
  // 2. DebugSession を生成して start()
  // 3. 初期ブレークポイントを追加
  // 4. タイムアウトタイマーを設定（30分）
  // 5. toJSON() でシリアライズ状態を返す
}
```

#### コマンド実行

```typescript
executeCommand(sessionId, command): void {
  // 1. sessionId 検証（存在確認 + ID一致確認）
  // 2. switch で6つのコマンドを処理:
  //    - continue: paused -> running (resume)
  //    - stepOver: ステップ記録
  //    - stepInto: コールスタックpush + ステップ記録
  //    - stepOut: コールスタックpop + ステップ記録
  //    - pause: running -> paused
  //    - stop: セッション停止 + クリーンアップ
  // 3. exhaustive check (never型) で未知コマンドを検出
}
```

#### vm サンドボックス式評価

```typescript
private evaluateInSandbox(expression, variables, timeoutMs): unknown {
  // 1. セッション変数のみをサンドボックスコンテキストに設定
  // 2. vm.createContext() で隔離コンテキスト作成
  //    -> process, require, fs はアクセス不可
  // 3. vm.runInContext() でタイムアウト付き実行（5秒）
  // 4. タイムアウト時は "Expression evaluation timed out" エラー
}
```

セキュリティ制約:

- `vm.createContext()` は Node.js グローバル（process, require, fs, Buffer, etc.）を自動的にブロック
- タイムアウト5秒で無限ループを防止
- paused 状態でのみ評価可能

#### イベント送信

```typescript
private emitDebugEvent(event: DebugEvent): void {
  // 1. mainWindow.isDestroyed() チェック
  // 2. webContents.send(IPC_CHANNELS.SKILL_DEBUG_EVENT, event)
  // 3. 例外はグレースフルに無視（ウィンドウ破棄済みの場合）
}
```

### 2.5 IPC ハンドラ (`apps/desktop/src/main/ipc/skillDebugHandlers.ts`)

#### 登録・解除パターン

```typescript
export function registerSkillDebugHandlers(mainWindow: BrowserWindow): void {
  // 6つの ipcMain.handle() を登録
}

export function unregisterSkillDebugHandlers(): void {
  // 6つの ipcMain.removeHandler() を呼び出し
}
```

#### バリデーション方針（P42準拠3段バリデーション）

全ての文字列引数に対して:

```typescript
// 3段バリデーション
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}
```

1. **型チェック**: `typeof !== "string"`
2. **空文字列チェック**: 暗黙的に `.trim() === ""` で空文字列もカバー
3. **トリム空文字列チェック**: `"   "` のようなスペースのみの入力を拒否

#### IPC セキュリティ

- 全ハンドラで `validateIpcSender()` による送信元ウィンドウ検証
- 検証失敗時は `toIPCValidationError()` でエラーをスロー
- エラーレスポンスは `{ success: false, error: string }` 形式でサニタイズ

### 2.6 Preload 層 (`apps/desktop/src/preload/skill-api.ts`)

#### 通信パターン

- **Invoke 系（6チャネル）**: `safeInvokeUnwrap<T>()` で `{ success: true, data: T }` を展開
- **Event 系（1チャネル）**: `safeOn<DebugEvent>()` でイベントリスナー登録

```typescript
// skill-api.ts の debug オブジェクト
debug: {
  startSession: (request) =>
    safeInvokeUnwrap<DebugSessionState>(IPC_CHANNELS.SKILL_DEBUG_START, request),

  executeCommand: (request) =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DEBUG_COMMAND, request),

  addBreakpoint: (request) =>
    safeInvokeUnwrap<Breakpoint>(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD, request),

  removeBreakpoint: (request) =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE, request),

  inspectVariable: (request) =>
    safeInvokeUnwrap<unknown>(IPC_CHANNELS.SKILL_DEBUG_INSPECT, request),

  evaluateExpression: (request) =>
    safeInvokeUnwrap<DebugEvaluateResponse>(IPC_CHANNELS.SKILL_DEBUG_EVALUATE, request),

  onDebugEvent: (callback) =>
    safeOn<DebugEvent>(IPC_CHANNELS.SKILL_DEBUG_EVENT, callback),
}
```

#### チャネルセキュリティ

- Invoke 系6チャネル: `ALLOWED_INVOKE_CHANNELS` ホワイトリストに登録済み
- Event 系1チャネル: `ALLOWED_ON_CHANNELS` ホワイトリストに登録済み
- ホワイトリスト外のチャネルは `safeInvoke` / `safeOn` が自動的に拒否

### 2.7 型の公開パス

```
packages/shared/src/types/skill-debug.ts
  └── packages/shared/src/types/index.ts (re-export)
       └── packages/shared/index.ts (re-export)
            └── import { ... } from "@repo/shared"
```

Renderer/Preload/Main の全レイヤーから `@repo/shared` 経由で型を参照可能。

### 2.8 ファイル一覧

#### 新規ファイル（3ファイル）

| ファイルパス                                            | 行数 | 責務                                 |
| ------------------------------------------------------- | ---- | ------------------------------------ |
| `packages/shared/src/types/skill-debug.ts`              | 233  | 共有型定義 + 定数 + 状態遷移テーブル |
| `apps/desktop/src/main/services/skill/DebugSession.ts`  | 257  | セッション状態管理クラス             |
| `apps/desktop/src/main/services/skill/SkillDebugger.ts` | 253  | デバッガー Facade クラス             |

#### 変更ファイル（5ファイル）

| ファイルパス                            | 変更内容                                                 |
| --------------------------------------- | -------------------------------------------------------- |
| `packages/shared/index.ts`              | skill-debug の re-export 追加                            |
| `packages/shared/src/types/index.ts`    | skill-debug の re-export 追加                            |
| `apps/desktop/src/preload/channels.ts`  | 7チャネル定数 + ホワイトリスト登録                       |
| `apps/desktop/src/preload/types.ts`     | `SkillDebugAPI` インターフェース + 型の import/re-export |
| `apps/desktop/src/preload/skill-api.ts` | `debug` オブジェクト追加（7メソッド）                    |

#### テストファイル（4ファイル）

| ファイルパス                                                           | テスト数 | 対象                         |
| ---------------------------------------------------------------------- | -------- | ---------------------------- |
| `packages/shared/src/types/__tests__/skill-debug.test.ts`              | 38       | 型定義 + 定数 + 遷移テーブル |
| `apps/desktop/src/main/services/skill/__tests__/DebugSession.test.ts`  | 35       | DebugSession クラス          |
| `apps/desktop/src/main/services/skill/__tests__/SkillDebugger.test.ts` | 40       | SkillDebugger クラス         |
| `apps/desktop/src/main/ipc/__tests__/skillDebugHandlers.test.ts`       | 16       | IPC ハンドラ                 |
