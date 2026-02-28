# Phase 4: テスト作成（TDD: Red）— TASK-9H スキルデバッグモード

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 4                                                      |
| タスクID   | TASK-9H                                                |
| 機能名     | スキルデバッグモード                                   |
| 作成日     | 2026-02-27                                             |
| 前提Phase  | Phase 1-3（要件定義・設計・設計レビュー）              |
| 依存タスク | TASK-9B-I（SDK正式統合）、TASK-9A-B（ファイル編集IPC） |

## 目的

スキルデバッグモード（ブレークポイント設定、ステップ実行、変数インスペクション）のテストを**実装より先に作成**し、全テストが **Red 状態**（失敗）であることを確認する。TDD の Red フェーズとして、テストが実装の仕様書となる。

## 実行タスク

### Task 1: 型定義テスト作成（`skill-debug.test.ts`）

**配置先**: `packages/shared/src/types/__tests__/skill-debug.test.ts`

型定義の整合性と型ガードの動作を検証する。

#### 1.1 テストケース一覧

| No   | テスト項目                                                     | 期待結果                                                                 |
| ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| T-01 | DebugSession 型が必須フィールドを全て持つ                      | コンパイルエラーなし                                                     |
| T-02 | DebugSession.status が5値のリテラルユニオンである              | "idle" \| "running" \| "paused" \| "completed" \| "error"                |
| T-03 | Breakpoint.type が3値のリテラルユニオンである                  | "tool" \| "hook" \| "step"                                               |
| T-04 | Breakpoint.hookType が2値のリテラルユニオンである              | "PreToolUse" \| "PostToolUse"                                            |
| T-05 | DebugStep.type が3値のリテラルユニオンである                   | "tool_call" \| "hook_execution" \| "agent_response"                      |
| T-06 | DebugEvent の discriminated union が type フィールドで分岐する | 4パターン: "step", "breakpoint-hit", "variable-changed", "session-ended" |
| T-07 | DebugCommand が6値のリテラルユニオンである                     | "continue" \| "stepOver" \| "stepInto" \| "stepOut" \| "pause" \| "stop" |
| T-08 | CallStackEntry 型が depth, name, type, startTime を持つ        | コンパイルエラーなし                                                     |
| T-09 | DebugSession.startedAt が string 型（ISO 8601）である          | string 型として定義                                                      |
| T-10 | DebugStep.timestamp が string 型（ISO 8601）である             | string 型として定義                                                      |

---

### Task 2: SkillDebugger テスト作成（`SkillDebugger.test.ts`）

**配置先**: `apps/desktop/src/main/services/skill/__tests__/SkillDebugger.test.ts`

#### 2.1 テスト基盤セットアップ

```typescript
// SkillExecutor モック
const mockSkillExecutor = {
  executeWithHooks: vi.fn(),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
};

// BrowserWindow モック
const mockMainWindow = {
  id: 1,
  webContents: {
    id: 1,
    send: vi.fn(),
    isDestroyed: () => false,
  },
  isDestroyed: () => false,
};

// EventEmitter for debug events
const mockEventEmitter = {
  emit: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
};
```

#### 2.2 テストケース一覧（セッション管理）

| No    | テスト項目                                                      | 期待結果                                               |
| ----- | --------------------------------------------------------------- | ------------------------------------------------------ |
| SD-01 | startDebugSession で新しいセッションが作成される                | DebugSession オブジェクトが返り、status === "idle"     |
| SD-02 | startDebugSession で生成されるセッションIDがUUID v4形式         | `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-/` にマッチ    |
| SD-03 | startDebugSession に渡した breakpoints がセッションに保存される | session.breakpoints の長さと内容が一致                 |
| SD-04 | startDebugSession に渡した skillName がセッションに保存される   | session.skillName === 引数の skillName                 |
| SD-05 | startDebugSession でセッションの startedAt が ISO 8601 形式     | `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/ ` にマッチ     |
| SD-06 | 存在しないセッションIDで executeCommand を呼ぶとエラー          | Error("Session not found: <sessionId>") がスローされる |
| SD-07 | 同一 skillName で2つ目のセッションを開始できる                  | 2つの異なるセッションIDが生成される                    |

#### 2.3 テストケース一覧（デバッグコマンド実行）

| No    | テスト項目                                                       | 期待結果                                                      |
| ----- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| SD-08 | "continue" コマンドで paused セッションが running に遷移         | session.status === "running"                                  |
| SD-09 | "pause" コマンドで running セッションが paused に遷移            | session.status === "paused"                                   |
| SD-10 | "stop" コマンドで running セッションが completed に遷移          | session.status === "completed"                                |
| SD-11 | "stop" コマンドで paused セッションが completed に遷移           | session.status === "completed"                                |
| SD-12 | "stepOver" コマンドで paused セッションの次ステップが実行される  | session.currentStep.stepNumber が1つ増加                      |
| SD-13 | "stepInto" コマンドで paused セッションの callStack depth が増加 | session.callStack の最後のエントリの depth が増加             |
| SD-14 | "stepOut" コマンドで paused セッションの callStack depth が減少  | session.callStack の長さが1つ減少（最低1）                    |
| SD-15 | completed セッションに "continue" コマンドを実行するとエラー     | Error("Cannot execute command on completed session") がスロー |
| SD-16 | idle セッションに "pause" コマンドを実行するとエラー             | Error("Cannot pause idle session") がスロー                   |

#### 2.4 テストケース一覧（ブレークポイント管理）

| No    | テスト項目                                              | 期待結果                                                       |
| ----- | ------------------------------------------------------- | -------------------------------------------------------------- |
| SD-17 | addBreakpoint でブレークポイントが追加される            | session.breakpoints の長さが1増加                              |
| SD-18 | addBreakpoint で生成されるIDがUUID v4形式               | `/^[0-9a-f]{8}-/` にマッチ                                     |
| SD-19 | addBreakpoint に type: "tool", toolName: "Read" を渡す  | 追加された breakpoint.type === "tool" かつ toolName === "Read" |
| SD-20 | addBreakpoint に condition: "x > 10" を渡す             | 追加された breakpoint.condition === "x > 10"                   |
| SD-21 | removeBreakpoint で指定IDのブレークポイントが削除される | session.breakpoints から該当IDが除去される                     |
| SD-22 | removeBreakpoint で存在しないIDを指定するとエラー       | Error("Breakpoint not found: <id>") がスロー                   |
| SD-23 | addBreakpoint のデフォルト enabled は true              | 追加された breakpoint.enabled === true                         |

#### 2.5 テストケース一覧（変数インスペクション）

| No    | テスト項目                                                    | 期待結果                               |
| ----- | ------------------------------------------------------------- | -------------------------------------- |
| SD-24 | inspectVariable で variables に存在するパスの値を取得         | 該当パスの値が返る                     |
| SD-25 | inspectVariable でネストされたパス（"a.b.c"）を解決           | ドット区切りで深いプロパティの値が返る |
| SD-26 | inspectVariable で存在しないパスを指定すると undefined が返る | undefined が返る                       |
| SD-27 | evaluateExpression で単純な式を評価                           | 評価結果が返る                         |
| SD-28 | evaluateExpression で不正な式を渡すとエラー                   | Error を含むレスポンスが返る           |

#### 2.6 テストケース一覧（Hooks 統合）

| No    | テスト項目                                                                       | 期待結果                                           |
| ----- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| SD-29 | createHooks が PreToolUse と PostToolUse の両方を含むオブジェクトを返す          | hooks.PreToolUse と hooks.PostToolUse が関数である |
| SD-30 | PreToolUse フックで tool ブレークポイントがヒットすると session が paused になる | session.status === "paused"                        |
| SD-31 | PreToolUse フックでブレークポイント条件が false なら続行                         | session.status === "running" のまま                |
| SD-32 | PostToolUse フックでステップ出力が記録される                                     | session.currentStep.output が設定される            |
| SD-33 | PostToolUse フックで session が paused の場合、resume を待機する                 | waitForResume が呼び出される                       |
| SD-34 | hook ブレークポイントで hookType: "PreToolUse" が一致すると停止                  | breakpoint-hit イベントが emitDebugEvent で発火    |
| SD-35 | step ブレークポイントで stepNumber が一致すると停止                              | session.status === "paused"                        |

#### 2.7 テストケース一覧（デバッグイベント通知）

| No    | テスト項目                                                           | 期待結果                                                                          |
| ----- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| SD-36 | ステップ実行時に DebugEvent type: "step" が発火される                | emitDebugEvent が { type: "step", sessionId, step } で呼ばれる                    |
| SD-37 | ブレークポイントヒット時に type: "breakpoint-hit" が発火される       | emitDebugEvent が { type: "breakpoint-hit", sessionId, breakpoint } で呼ばれる    |
| SD-38 | 変数変更時に type: "variable-changed" が発火される                   | emitDebugEvent が { type: "variable-changed", sessionId, path, value } で呼ばれる |
| SD-39 | セッション終了時に type: "session-ended" が発火される                | emitDebugEvent が { type: "session-ended", sessionId } で呼ばれる                 |
| SD-40 | エラー終了時に session-ended イベントの error フィールドが設定される | event.error がエラーメッセージを含む                                              |

---

### Task 3: DebugSession テスト作成（`DebugSession.test.ts`）

**配置先**: `apps/desktop/src/main/services/skill/__tests__/DebugSession.test.ts`

#### 3.1 テストケース一覧（状態遷移）

| No    | テスト項目                        | 期待結果                                   |
| ----- | --------------------------------- | ------------------------------------------ |
| DS-01 | 初期状態が idle                   | status === "idle"                          |
| DS-02 | idle → running に遷移可能         | start() で status === "running"            |
| DS-03 | running → paused に遷移可能       | pause() で status === "paused"             |
| DS-04 | paused → running に遷移可能       | resume() で status === "running"           |
| DS-05 | running → completed に遷移可能    | complete() で status === "completed"       |
| DS-06 | running → error に遷移可能        | fail(error) で status === "error"          |
| DS-07 | completed から running に遷移不可 | Error("Invalid state transition") がスロー |
| DS-08 | error から running に遷移不可     | Error("Invalid state transition") がスロー |
| DS-09 | idle から paused に遷移不可       | Error("Invalid state transition") がスロー |

#### 3.2 テストケース一覧（変数スナップショット）

| No    | テスト項目                            | 期待結果                                     |
| ----- | ------------------------------------- | -------------------------------------------- |
| DS-10 | setVariable でキー・値のペアを追加    | variables[key] === value                     |
| DS-11 | setVariable で既存キーを上書き        | variables[key] が新しい値に更新              |
| DS-12 | getVariables で全変数のコピーを取得   | 返却オブジェクトの変更が内部状態に影響しない |
| DS-13 | clearVariables で全変数がクリアされる | Object.keys(variables).length === 0          |

#### 3.3 テストケース一覧（コールスタック管理）

| No    | テスト項目                                                  | 期待結果                         |
| ----- | ----------------------------------------------------------- | -------------------------------- |
| DS-14 | pushCallStack でエントリが追加される                        | callStack の長さが1増加          |
| DS-15 | pushCallStack で追加されたエントリの depth が正しい         | depth === callStack.length - 1   |
| DS-16 | popCallStack で最後のエントリが削除される                   | callStack の長さが1減少          |
| DS-17 | 空の callStack で popCallStack を呼ぶと undefined が返る    | undefined が返る（エラーなし）   |
| DS-18 | pushCallStack のエントリに startTime が ISO 8601 形式で設定 | `/^\d{4}-\d{2}-\d{2}T/` にマッチ |

#### 3.4 テストケース一覧（ステップ管理）

| No    | テスト項目                                           | 期待結果                         |
| ----- | ---------------------------------------------------- | -------------------------------- |
| DS-19 | recordStep でステップが記録される                    | currentStep が更新される         |
| DS-20 | recordStep で stepNumber が自動インクリメントされる  | 連続呼び出しで 1, 2, 3 と増加    |
| DS-21 | recordStep で timestamp が ISO 8601 形式で設定される | `/^\d{4}-\d{2}-\d{2}T/` にマッチ |
| DS-22 | getStepHistory で全ステップ履歴を取得                | 記録した全ステップが含まれる     |

---

### Task 4: IPC ハンドラテスト作成（`skillDebugHandlers.test.ts`）

**配置先**: `apps/desktop/src/main/ipc/__tests__/skillDebugHandlers.test.ts`

#### 4.1 テスト基盤セットアップ

```typescript
// electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

// ipc-validator モック
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  })),
}));

// SkillDebugger モック
const mockSkillDebugger = {
  startDebugSession: vi.fn(),
  executeCommand: vi.fn(),
  addBreakpoint: vi.fn(),
  removeBreakpoint: vi.fn(),
  inspectVariable: vi.fn(),
  evaluateExpression: vi.fn(),
};
```

#### 4.2 テストケース一覧（正常系 — 7チャネル）

| No    | チャンネル                      | テスト項目                                        | 期待結果                                                     |
| ----- | ------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| IH-01 | `skill:debug:start`             | skillName, prompt, breakpoints を渡して開始       | SkillDebugger.startDebugSession が呼ばれ DebugSession が返る |
| IH-02 | `skill:debug:command`           | sessionId, command: "continue" を渡す             | SkillDebugger.executeCommand が呼ばれる                      |
| IH-03 | `skill:debug:breakpoint:add`    | sessionId と Breakpoint 情報を渡す                | SkillDebugger.addBreakpoint が呼ばれ Breakpoint が返る       |
| IH-04 | `skill:debug:breakpoint:remove` | sessionId と breakpointId を渡す                  | SkillDebugger.removeBreakpoint が呼ばれる                    |
| IH-05 | `skill:debug:inspect`           | sessionId と path を渡す                          | SkillDebugger.inspectVariable が呼ばれ値が返る               |
| IH-06 | `skill:debug:evaluate`          | sessionId と expression を渡す                    | SkillDebugger.evaluateExpression が呼ばれ結果が返る          |
| IH-07 | `skill:debug:event`             | イベントチャネルが ALLOWED_ON_CHANNELS に含まれる | イベントリスナー登録可能                                     |

#### 4.3 テストケース一覧（P42準拠3段バリデーション）

全チャネルで以下の3段バリデーションを検証する:

| No    | チャンネル                      | テスト項目                      | 期待結果                                                                                                              |
| ----- | ------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| IH-08 | `skill:debug:start`             | skillName が数値（型エラー）    | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`                                       |
| IH-09 | `skill:debug:start`             | skillName が空文字列            | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`                                       |
| IH-10 | `skill:debug:start`             | skillName がスペースのみ（" "） | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`                                       |
| IH-11 | `skill:debug:start`             | prompt が空文字列               | `{ code: "VALIDATION_ERROR", message: "prompt must be a non-empty string" }`                                          |
| IH-12 | `skill:debug:start`             | prompt がスペースのみ           | `{ code: "VALIDATION_ERROR", message: "prompt must be a non-empty string" }`                                          |
| IH-13 | `skill:debug:command`           | sessionId が空文字列            | `{ code: "VALIDATION_ERROR", message: "sessionId must be a non-empty string" }`                                       |
| IH-14 | `skill:debug:command`           | sessionId がスペースのみ        | `{ code: "VALIDATION_ERROR", message: "sessionId must be a non-empty string" }`                                       |
| IH-15 | `skill:debug:command`           | command が無効な値（"jump"）    | `{ code: "VALIDATION_ERROR", message: "command must be one of: continue, stepOver, stepInto, stepOut, pause, stop" }` |
| IH-16 | `skill:debug:breakpoint:add`    | sessionId が未指定              | `{ code: "VALIDATION_ERROR", message: "sessionId must be a non-empty string" }`                                       |
| IH-17 | `skill:debug:breakpoint:add`    | breakpoint.type が無効な値      | `{ code: "VALIDATION_ERROR", message: "breakpoint.type must be one of: tool, hook, step" }`                           |
| IH-18 | `skill:debug:breakpoint:remove` | breakpointId が空文字列         | `{ code: "VALIDATION_ERROR", message: "breakpointId must be a non-empty string" }`                                    |
| IH-19 | `skill:debug:inspect`           | path が空文字列                 | `{ code: "VALIDATION_ERROR", message: "path must be a non-empty string" }`                                            |
| IH-20 | `skill:debug:evaluate`          | expression が空文字列           | `{ code: "VALIDATION_ERROR", message: "expression must be a non-empty string" }`                                      |
| IH-21 | `skill:debug:evaluate`          | expression がスペースのみ       | `{ code: "VALIDATION_ERROR", message: "expression must be a non-empty string" }`                                      |

#### 4.4 テストケース一覧（セキュリティ — 送信元検証）

| No    | チャンネル                   | テスト項目                          | 期待結果                                   |
| ----- | ---------------------------- | ----------------------------------- | ------------------------------------------ |
| IH-22 | `skill:debug:start`          | validateIpcSender が invalid を返す | toIPCValidationError が呼ばれ throw される |
| IH-23 | `skill:debug:command`        | validateIpcSender が invalid を返す | toIPCValidationError が呼ばれ throw される |
| IH-24 | `skill:debug:breakpoint:add` | validateIpcSender が invalid を返す | toIPCValidationError が呼ばれ throw される |

#### 4.5 テストケース一覧（エラーハンドリング）

| No    | チャンネル             | テスト項目                     | 期待結果                                      |
| ----- | ---------------------- | ------------------------------ | --------------------------------------------- |
| IH-25 | `skill:debug:start`    | SkillDebugger がエラーをスロー | `{ success: false, error: <message> }` が返る |
| IH-26 | `skill:debug:command`  | SkillDebugger がエラーをスロー | `{ success: false, error: <message> }` が返る |
| IH-27 | `skill:debug:evaluate` | SkillDebugger がエラーをスロー | `{ success: false, error: <message> }` が返る |

#### 4.6 ハンドラー登録・解除テスト

| No    | テスト項目                                                           | 期待結果                                                 |
| ----- | -------------------------------------------------------------------- | -------------------------------------------------------- |
| IH-28 | registerSkillDebugHandlers で7チャネルが ipcMain.handle に登録される | ipcMain.handle が7回呼ばれる                             |
| IH-29 | unregisterSkillDebugHandlers で全チャネルが removeHandler される     | ipcMain.removeHandler が6回呼ばれる（eventチャネル除く） |

---

## 参照資料

| 参照資料               | パス                                                                              | 内容                      |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------- |
| Phase 1 成果物         | `outputs/phase-1/requirements-definition.md`                                      | 要件定義                  |
| Phase 2 成果物         | `outputs/phase-2/architecture-design.md`                                          | 設計仕様                  |
| Phase 3 成果物         | `outputs/phase-3/design-review-result.md`                                         | 設計レビュー結果          |
| IPC設計                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 既存IPCチャネル仕様       |
| セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Electron IPCセキュリティ  |
| セキュリティ（スキル） | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | スキルIPC固有セキュリティ |
| スキルインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル型定義              |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | エラーカテゴリ            |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | IPC契約検証手順           |
| Claude Agent SDK       | `.claude/skills/claude-agent-sdk/SKILL.md`                                        | SDK統合パターン           |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                              | Pitfall対策               |

## 実行手順

1. Task 1〜Task 4 の順でテストを作成する。
2. 各 Task 完了時に対象テストファイルの構文・import解決を確認する。
3. `TDD 検証コマンド` を実行し、全テストが Red 状態であることを確認する。
4. 期待テスト数（合計 101）とファイル配置を確認し、成果物を確定する。

## 統合テスト連携

Phase 4 では、実装前に Main-Preload-Shared の契約を Red テストで固定し、Phase 5 の Green 実装で回帰が発生しない状態を作る。

| 連携観点         | Red で固定する内容                                | Phase 5 への引き継ぎ                                        |
| ---------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| IPC契約整合      | `skill:debug:*` 6 invoke + 1 event のチャネル整合 | `skillDebugHandlers.ts` と `preload/channels.ts` の同時実装 |
| セキュリティ境界 | `validateIpcSender` と P42 3段バリデーション      | 全ハンドラで同一バリデーションテンプレート適用              |
| 型境界           | `@repo/shared` の型と Preload API 型の一致        | `packages/shared` と `preload/types.ts` の同期更新          |
| 起動配線         | ハンドラ登録/解除 (`register/unregister`) の検証  | `registerAllIpcHandlers` への登録を実装で必須化             |

## 成果物

### テストファイル一覧

| ファイル                                                               | テスト数 | 内容                         |
| ---------------------------------------------------------------------- | -------- | ---------------------------- |
| `packages/shared/src/types/__tests__/skill-debug.test.ts`              | 10       | 型定義テスト                 |
| `apps/desktop/src/main/services/skill/__tests__/SkillDebugger.test.ts` | 40       | SkillDebugger ユニットテスト |
| `apps/desktop/src/main/services/skill/__tests__/DebugSession.test.ts`  | 22       | DebugSession ユニットテスト  |
| `apps/desktop/src/main/ipc/__tests__/skillDebugHandlers.test.ts`       | 29       | IPC ハンドラテスト           |

**合計テスト数**: 101

## 完了条件

- [ ] 4つのテストファイルが上記の配置先に作成されている
- [ ] 全テストファイルがコンパイルエラーなしで Vitest によって認識される
- [ ] 全テスト（101テスト）が Red 状態（失敗）である — 実装が存在しないため
- [ ] テストケースが P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）を網羅している
- [ ] テストケースが IPC 送信元検証（validateIpcSender）をカバーしている
- [ ] DebugSession の状態遷移テストが有効遷移（5パターン）と無効遷移（3パターン）を網羅している
- [ ] Hooks 統合テストが PreToolUse と PostToolUse の両方をカバーしている
- [ ] テスト間で状態共有がない（beforeEach でリセット）

## TDD 検証コマンド

```bash
# 型テスト（packages/shared ディレクトリから実行）
cd packages/shared && pnpm vitest run src/types/__tests__/skill-debug.test.ts

# SkillDebugger テスト（apps/desktop ディレクトリから実行 — P40対策）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillDebugger.test.ts

# DebugSession テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/DebugSession.test.ts

# IPC ハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillDebugHandlers.test.ts

# 全テスト一括実行
cd apps/desktop && pnpm vitest run --reporter=verbose src/main/services/skill/__tests__/SkillDebugger.test.ts src/main/services/skill/__tests__/DebugSession.test.ts src/main/ipc/__tests__/skillDebugHandlers.test.ts
```

## 次のPhase

Phase 5（実装: TDD Green）へ進む。Phase 4 の全テストを Green にするための最小限のプロダクションコードを実装する。
