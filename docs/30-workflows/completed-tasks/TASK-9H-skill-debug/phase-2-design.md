# Phase 2: 設計 - TASK-9H-SKILL-DEBUG

## メタ情報

| 項目               | 値                                                                     |
| ------------------ | ---------------------------------------------------------------------- |
| タスクID           | TASK-9H-SKILL-DEBUG                                                    |
| Phase              | 2（設計）                                                              |
| 機能名             | skill-debug                                                            |
| 作成日             | 2026-02-27                                                             |
| 前提Phase          | phase-1-requirements.md                                                |
| 依存タスク         | TASK-9B（skill-creator スキル）                                        |
| 目的               | デバッグ機能のクラス設計・IPC設計・型定義設計・Hooks統合設計を確定する |
| 成果物ディレクトリ | docs/30-workflows/TASK-9H-skill-debug/                                 |

## 目的

Phase 1 で定義した要件（FR-1〜FR-7、NFR-1〜NFR-3、AT-1〜AT-24）に基づき、SkillDebugger / DebugSession のクラス設計、7つの IPC チャネル設計、型定義設計、Claude Agent SDK Hooks 統合設計、Preload 拡張設計を確定する。

## 実行タスク

- **Task 1**: 型定義設計（`packages/shared/src/types/skill-debug.ts`）
- **Task 2**: クラス設計（SkillDebugger / DebugSession）
- **Task 3**: IPC チャネル設計（7チャネル）
- **Task 4**: Claude Agent SDK Hooks 統合設計
- **Task 5**: Preload 拡張設計（channels.ts / skill-api.ts / types.ts）
- **Task 6**: セッション状態遷移図・ドメインモデル

## SubAgent 分担

| SubAgent | 担当Task  | 並列実行 |
| -------- | --------- | -------- |
| Agent-1  | Task 1, 6 | 可能     |
| Agent-2  | Task 2, 4 | 可能     |
| Agent-3  | Task 3, 5 | 可能     |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                      | 内容                                  |
| ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------- |
| API IPC仕様              | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | IPCチャネル命名、引数契約、戻り値契約 |
| Skillインターフェース    | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | スキル型定義・API仕様                 |
| Electron IPCセキュリティ | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | IPCセキュリティ実装パターン           |
| アーキテクチャ概要       | .claude/skills/aiworkflow-requirements/references/architecture-overview.md                | システム全体構造                      |
| エラーハンドリング       | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | エラーカテゴリ・処理方針              |
| IPC契約チェックリスト    | .claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md               | IPC契約検証手順（P42/P44/P45準拠）    |
| Electronサービス設計     | .claude/skills/aiworkflow-requirements/references/arch-electron-services.md               | Main Processサービス設計方針          |
| 実装パターン             | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | DI・セキュリティ・テストパターン      |
| 品質基準                 | .claude/skills/aiworkflow-requirements/references/quality-requirements.md                 | カバレッジ・テスト基準                |
| 既知の落とし穴           | .claude/rules/06-known-pitfalls.md                                                        | P42/P44/P45/P34/P5等の教訓            |
| Claude Agent SDK         | .claude/skills/claude-agent-sdk/SKILL.md                                                  | SDK統合パターン・Hooks仕様            |

### タスク固有参照

| 参照資料       | パス                                                    | 内容                     |
| -------------- | ------------------------------------------------------- | ------------------------ |
| Phase 1 成果物 | phase-1-requirements.md                                 | 要件定義（FR/NFR/AT/AC） |
| TASK-9B成果物  | docs/30-workflows/skill-import-agent-system/ 内の9B関連 | 依存タスク（前提確認）   |

---

## 実行手順

### Task 1: 型定義設計

#### 1-1. `packages/shared/src/types/skill-debug.ts`

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AT-1: DebugSession 型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface DebugSession {
  /** セッション一意ID（UUID v4） */
  id: string;
  /** デバッグ対象スキル名 */
  skillName: string;
  /** セッション状態 */
  status: DebugSessionStatus;
  /** 設定済みブレークポイント一覧 */
  breakpoints: Breakpoint[];
  /** 現在実行中/停止中のステップ（未開始時は undefined） */
  currentStep?: DebugStep;
  /** デバッグ中の変数スナップショット */
  variables: Record<string, unknown>;
  /** コールスタック */
  callStack: CallStackEntry[];
  /** セッション開始時刻（ISO 8601） */
  startedAt: string;
}

/** セッション状態のリテラル型 */
export type DebugSessionStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "error";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AT-2: Breakpoint 型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface Breakpoint {
  /** ブレークポイント一意ID（UUID v4） */
  id: string;
  /** ブレークポイントタイプ */
  type: BreakpointType;
  /** 条件式（省略時は無条件停止） */
  condition?: string;
  /** tool タイプ時の対象ツール名 */
  toolName?: string;
  /** hook タイプ時の対象フックタイプ */
  hookType?: "PreToolUse" | "PostToolUse";
  /** 有効/無効フラグ */
  enabled: boolean;
}

/** ブレークポイントタイプのリテラル型 */
export type BreakpointType = "tool" | "hook" | "step";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AT-3: DebugStep 型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface DebugStep {
  /** ステップ番号（1始まり） */
  stepNumber: number;
  /** ステップタイプ */
  type: DebugStepType;
  /** tool_call 時のツール名 */
  toolName?: string;
  /** hook_execution 時のフックタイプ */
  hookType?: string;
  /** ステップの入力データ */
  input?: unknown;
  /** ステップの出力データ */
  output?: unknown;
  /** ステップ実行時刻（ISO 8601） */
  timestamp: string;
}

/** ステップタイプのリテラル型 */
export type DebugStepType = "tool_call" | "hook_execution" | "agent_response";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AT-4: CallStackEntry 型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface CallStackEntry {
  /** コールスタックの深さ（0始まり） */
  depth: number;
  /** エントリ名（ツール名、スキル名、エージェント名） */
  name: string;
  /** エントリタイプ */
  type: CallStackEntryType;
  /** エントリ開始時刻（ISO 8601） */
  startTime: string;
}

/** コールスタックエントリタイプのリテラル型 */
export type CallStackEntryType = "skill" | "agent" | "tool";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AT-5: DebugEvent 判別共用型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type DebugEvent =
  | DebugStepEvent
  | DebugBreakpointHitEvent
  | DebugVariableChangedEvent
  | DebugSessionEndedEvent;

export interface DebugStepEvent {
  type: "step";
  sessionId: string;
  step: DebugStep;
}

export interface DebugBreakpointHitEvent {
  type: "breakpoint-hit";
  sessionId: string;
  breakpoint: Breakpoint;
  step?: DebugStep;
}

export interface DebugVariableChangedEvent {
  type: "variable-changed";
  sessionId: string;
  path: string;
  value: unknown;
}

export interface DebugSessionEndedEvent {
  type: "session-ended";
  sessionId: string;
  error?: string;
  completedAt?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AT-6: DebugCommand リテラル共用型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type DebugCommand =
  | "continue"
  | "stepOver"
  | "stepInto"
  | "stepOut"
  | "pause"
  | "stop";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IPC リクエスト/レスポンス型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface DebugStartRequest {
  skillName: string;
  prompt: string;
  breakpoints: Omit<Breakpoint, "id">[];
}

export interface DebugCommandRequest {
  sessionId: string;
  command: DebugCommand;
}

export interface DebugBreakpointAddRequest {
  sessionId: string;
  breakpoint: Omit<Breakpoint, "id">;
}

export interface DebugBreakpointRemoveRequest {
  sessionId: string;
  breakpointId: string;
}

export interface DebugInspectRequest {
  sessionId: string;
  path: string;
}

export interface DebugEvaluateRequest {
  sessionId: string;
  expression: string;
}

export interface DebugEvaluateResponse {
  result: unknown;
  type: string;
}
```

#### 1-2. `packages/shared/src/types/index.ts` への追加

```typescript
// 既存のexport群に追加
export * from "./skill-debug";
```

---

### Task 2: クラス設計

#### 2-1. SkillDebugger クラス設計

**ファイル**: `apps/desktop/src/main/services/skill/SkillDebugger.ts`

**責務**: デバッグセッション管理の統合Facade。セッションのライフサイクル管理、ブレークポイント管理、コマンド実行の入口。

**依存関係**:

- `SkillExecutor`（query() メソッドへの Hooks 注入）
- `BrowserWindow`（デバッグイベントの IPC 送信）

**DI パターン**: Constructor Injection（`BrowserWindow` は `registerSkillHandlers` 時点で利用可能なため）

```typescript
import { randomUUID } from "crypto";
import { BrowserWindow } from "electron";
import {
  DebugSession as DebugSessionType,
  Breakpoint,
  BreakpointType,
  DebugCommand,
  DebugEvent,
  DebugStep,
  DebugStepType,
  DebugStartRequest,
} from "@repo/shared";
import { DebugSession } from "./DebugSession";
import { IPC_CHANNELS } from "../../../preload/channels";

/** デバッグセッション自動タイムアウト（30分） */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
/** 最大ステップ数 */
const MAX_STEPS = 10_000;
/** 式評価タイムアウト（5秒） */
const EXPRESSION_TIMEOUT_MS = 5_000;

export class SkillDebugger {
  /** アクティブセッション（同時実行は1つのみ） */
  private activeSession: DebugSession | null = null;
  /** セッションタイムアウトタイマー */
  private sessionTimer: NodeJS.Timeout | null = null;

  constructor(private readonly mainWindow: BrowserWindow) {}

  /**
   * デバッグセッションを開始する（FR-1-1, FR-1-6）
   * @throws セッションが既に実行中の場合
   */
  async startDebugSession(
    skillName: string,
    prompt: string,
    breakpoints: Omit<Breakpoint, "id">[],
  ): Promise<DebugSessionType> {
    // 排他制御: 既存セッションがある場合はエラー
    // セッション生成（UUID v4）
    // 初期ブレークポイントにID付与
    // タイムアウトタイマー設定（30分）
    // SkillExecutor.query() を Hooks 付きで実行（非同期）
    // セッション状態を返却
  }

  /**
   * デバッグコマンドを実行する（FR-3-1〜FR-3-6）
   * @throws セッションが存在しない場合
   */
  async executeCommand(
    sessionId: string,
    command: DebugCommand,
  ): Promise<void> {
    // セッション検証
    // コマンドに応じたセッション操作:
    //   continue: セッションの waitForResume を解決
    //   stepOver: nextStepMode = "over" に設定して resume
    //   stepInto: nextStepMode = "into" に設定して resume
    //   stepOut: nextStepMode = "out" に設定して resume
    //   pause: セッション状態を "paused" に変更
    //   stop: セッションを即座に終了
  }

  /**
   * ブレークポイントを追加する（FR-2-6, FR-2-7）
   */
  async addBreakpoint(
    sessionId: string,
    breakpoint: Omit<Breakpoint, "id">,
  ): Promise<Breakpoint> {
    // セッション検証
    // UUID v4 で ID 生成
    // セッションのブレークポイント配列に追加
    // 完全な Breakpoint を返却
  }

  /**
   * ブレークポイントを削除する（FR-2-6）
   */
  async removeBreakpoint(
    sessionId: string,
    breakpointId: string,
  ): Promise<void> {
    // セッション検証
    // 該当ブレークポイントを配列から削除
  }

  /**
   * 変数をインスペクションする（FR-4-1）
   */
  async inspectVariable(sessionId: string, path: string): Promise<unknown> {
    // セッション検証
    // ドット区切りパスで variables から値を取得
    // 値を返却
  }

  /**
   * 式を評価する（FR-5-1〜FR-5-4）
   */
  async evaluateExpression(
    sessionId: string,
    expression: string,
  ): Promise<unknown> {
    // セッション検証
    // セッション状態が "paused" であることを確認
    // サンドボックス環境で式を評価（5秒タイムアウト）
    // 結果を返却
  }

  /**
   * Claude Agent SDK Hooks を生成する（AT-11）
   * @internal
   */
  private createHooks(session: DebugSession): HooksConfig {
    // PreToolUse: ブレークポイント判定 → 停止 or 続行
    // PostToolUse: ステップ出力記録 → ステップモード判定
  }

  /**
   * ブレークポイント判定（FR-2-1〜FR-2-5）
   * @internal
   */
  private shouldBreak(session: DebugSession, step: DebugStep): boolean {
    // enabled === true のブレークポイントのみ対象
    // type に応じたマッチング:
    //   tool: step.type === "tool_call" && toolName マッチ
    //   hook: step.type === "hook_execution" && hookType マッチ
    //   step: 全ステップでマッチ
    // condition がある場合はサンドボックスで評価
  }

  /**
   * デバッグイベントを Renderer に送信する（FR-7-5, AT-18）
   * @internal
   */
  private emitDebugEvent(event: DebugEvent): void {
    // mainWindow.webContents.send() でイベント送信
    // IPC_CHANNELS.SKILL_DEBUG_EVENT チャネルを使用
  }

  /**
   * セッションのクリーンアップ（NFR-3-1）
   * @internal
   */
  private cleanupSession(sessionId: string): void {
    // タイムアウトタイマーのクリア
    // セッションの destroy()
    // activeSession を null に設定
  }

  /**
   * サンドボックスで式を評価する（NFR-1-1, NFR-1-4）
   * @internal
   */
  private evaluateInSandbox(
    expression: string,
    variables: Record<string, unknown>,
    timeoutMs: number,
  ): Promise<unknown> {
    // vm.createContext() でサンドボックスコンテキスト生成
    // variables のみをスコープに設定
    // process, require, fs, __dirname, __filename を除外
    // vm.runInContext() でタイムアウト付き実行
  }
}
```

#### 2-2. DebugSession クラス設計

**ファイル**: `apps/desktop/src/main/services/skill/DebugSession.ts`

**責務**: 個別デバッグセッションの状態管理。ステップ記録、変数管理、コールスタック管理、一時停止/再開の同期制御。

```typescript
import {
  DebugSession as DebugSessionType,
  DebugSessionStatus,
  Breakpoint,
  DebugStep,
  CallStackEntry,
} from "@repo/shared";

/** ステップモード: continue/stepOver/stepInto/stepOut */
export type StepMode = "continue" | "over" | "into" | "out";

export class DebugSession {
  /** セッション一意ID */
  readonly id: string;
  /** デバッグ対象スキル名 */
  readonly skillName: string;
  /** セッション状態 */
  private _status: DebugSessionStatus = "idle";
  /** ブレークポイント一覧 */
  private _breakpoints: Breakpoint[] = [];
  /** 現在のステップ */
  private _currentStep?: DebugStep;
  /** 変数スナップショット */
  private _variables: Record<string, unknown> = {};
  /** コールスタック */
  private _callStack: CallStackEntry[] = [];
  /** ステップカウンター */
  private _stepCounter = 0;
  /** 開始時刻 */
  readonly startedAt: Date;
  /** 次のステップモード */
  private _nextStepMode: StepMode = "continue";
  /** 一時停止の Promise resolve 関数 */
  private _resumeResolver: (() => void) | null = null;

  constructor(id: string, skillName: string, initialBreakpoints: Breakpoint[]) {
    this.id = id;
    this.skillName = skillName;
    this._breakpoints = [...initialBreakpoints];
    this.startedAt = new Date();
  }

  // ── 状態アクセサ ──

  get status(): DebugSessionStatus {
    return this._status;
  }
  get breakpoints(): ReadonlyArray<Breakpoint> {
    return this._breakpoints;
  }
  get currentStep(): DebugStep | undefined {
    return this._currentStep;
  }
  get variables(): Readonly<Record<string, unknown>> {
    return this._variables;
  }
  get callStack(): ReadonlyArray<CallStackEntry> {
    return this._callStack;
  }
  get stepCounter(): number {
    return this._stepCounter;
  }

  // ── 状態遷移 ──

  /**
   * セッション状態を変更する（FR-1-3, FR-1-4）
   * 有効な遷移: idle→running, running→paused, paused→running, running→completed, *→error, *→completed(stop時)
   */
  transitionTo(newStatus: DebugSessionStatus): void {
    // 状態遷移の妥当性検証
    // 不正な遷移はエラー
  }

  // ── ステップ管理 ──

  /**
   * 新しいステップを記録する（FR-3-7, FR-3-8）
   * @returns 記録されたステップ
   * @throws ステップ数が MAX_STEPS を超過した場合
   */
  recordStep(
    type: DebugStep["type"],
    toolName?: string,
    hookType?: string,
    input?: unknown,
  ): DebugStep {
    // stepCounter をインクリメント
    // MAX_STEPS チェック
    // DebugStep を生成（timestamp は new Date().toISOString()）
    // currentStep を更新
  }

  /**
   * 現在のステップに出力を記録する
   */
  recordStepOutput(output: unknown): void {
    // currentStep の output を更新
  }

  // ── 変数管理 ──

  /**
   * 変数を設定する（FR-4-2）
   * @returns 変更されたパスと値（イベント発火用）
   */
  setVariable(path: string, value: unknown): { path: string; value: unknown } {
    // ドット区切りパスで variables にネスト設定
  }

  /**
   * 変数をインスペクションする（FR-4-1）
   */
  getVariable(path: string): unknown {
    // ドット区切りパスで variables から値を取得
  }

  // ── コールスタック管理 ──

  /**
   * コールスタックにエントリをプッシュする（FR-6-2）
   */
  pushCallStack(name: string, type: CallStackEntry["type"]): void {
    // depth = callStack.length
    // startTime = new Date().toISOString()
    // callStack にプッシュ
  }

  /**
   * コールスタックからエントリをポップする（FR-6-2）
   */
  popCallStack(): CallStackEntry | undefined {
    // callStack からポップ
  }

  // ── 一時停止/再開制御 ──

  /**
   * セッションを一時停止する（FR-3-5）
   * @returns 再開を待つ Promise
   */
  pause(): Promise<void> {
    // status を "paused" に遷移
    // Promise を返却し、resume() 呼び出しで resolve
  }

  /**
   * セッションを再開する（FR-3-1）
   */
  resume(stepMode: StepMode = "continue"): void {
    // _nextStepMode を設定
    // status を "running" に遷移
    // _resumeResolver を呼び出し
  }

  /** 次のステップモードを取得してリセットする */
  consumeStepMode(): StepMode {
    // _nextStepMode を返却し "continue" にリセット
  }

  // ── ブレークポイント管理 ──

  addBreakpoint(breakpoint: Breakpoint): void {
    this._breakpoints.push(breakpoint);
  }

  removeBreakpoint(breakpointId: string): boolean {
    // 該当IDのブレークポイントを削除
    // 削除成功: true, 未発見: false
  }

  // ── シリアライズ ──

  /**
   * IPC 送信用にシリアライズする（AT-7, AT-13）
   * Date → ISO 8601 文字列変換
   */
  toJSON(): DebugSessionType {
    return {
      id: this.id,
      skillName: this.skillName,
      status: this._status,
      breakpoints: [...this._breakpoints],
      currentStep: this._currentStep,
      variables: { ...this._variables },
      callStack: [...this._callStack],
      startedAt: this.startedAt.toISOString(),
    };
  }

  /**
   * セッションリソースを解放する（NFR-3-1）
   */
  destroy(): void {
    // _resumeResolver を reject
    // 内部状態をクリア
  }
}
```

---

### Task 3: IPC チャネル設計

#### 3-1. チャネル一覧

| チャネル名                      | 方向            | メソッド | 引数型                         | 戻り値型                | セキュリティ                          |
| ------------------------------- | --------------- | -------- | ------------------------------ | ----------------------- | ------------------------------------- |
| `skill:debug:start`             | Renderer → Main | `handle` | `DebugStartRequest`            | `DebugSession`          | validateIpcSender + P42バリデーション |
| `skill:debug:command`           | Renderer → Main | `handle` | `DebugCommandRequest`          | `void`                  | validateIpcSender + P42バリデーション |
| `skill:debug:breakpoint:add`    | Renderer → Main | `handle` | `DebugBreakpointAddRequest`    | `Breakpoint`            | validateIpcSender + P42バリデーション |
| `skill:debug:breakpoint:remove` | Renderer → Main | `handle` | `DebugBreakpointRemoveRequest` | `void`                  | validateIpcSender + P42バリデーション |
| `skill:debug:inspect`           | Renderer → Main | `handle` | `DebugInspectRequest`          | `unknown`               | validateIpcSender + P42バリデーション |
| `skill:debug:evaluate`          | Renderer → Main | `handle` | `DebugEvaluateRequest`         | `DebugEvaluateResponse` | validateIpcSender + P42バリデーション |
| `skill:debug:event`             | Main → Renderer | `send`   | `DebugEvent`                   | -（一方向）             | 送信先ウィンドウ限定                  |

#### 3-2. ハンドラ実装パターン（P42/P44/P45準拠）

```typescript
// skill:debug:start ハンドラ
ipcMain.handle(
  IPC_CHANNELS.SKILL_DEBUG_START,
  async (event, args: DebugStartRequest) => {
    // 1. 送信元検証
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_DEBUG_START,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // 2. P42準拠3段バリデーション（全文字列フィールド）
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "prompt must be a non-empty string",
      };
    }
    if (!Array.isArray(args?.breakpoints)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "breakpoints must be an array",
      };
    }

    // 3. ビジネスロジック実行
    try {
      return await skillDebugger.startDebugSession(
        args.skillName,
        args.prompt,
        args.breakpoints,
      );
    } catch (error) {
      // NFR-1-5: 内部情報をサニタイズ
      throw {
        code: "DEBUG_ERROR",
        message:
          error instanceof Error ? error.message : "Debug session failed",
      };
    }
  },
);

// skill:debug:command ハンドラ
ipcMain.handle(
  IPC_CHANNELS.SKILL_DEBUG_COMMAND,
  async (event, args: DebugCommandRequest) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_DEBUG_COMMAND,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    if (typeof args?.sessionId !== "string" || args.sessionId.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "sessionId must be a non-empty string",
      };
    }

    const validCommands = [
      "continue",
      "stepOver",
      "stepInto",
      "stepOut",
      "pause",
      "stop",
    ];
    if (!validCommands.includes(args?.command)) {
      throw {
        code: "VALIDATION_ERROR",
        message: `command must be one of: ${validCommands.join(", ")}`,
      };
    }

    try {
      await skillDebugger.executeCommand(args.sessionId, args.command);
    } catch (error) {
      throw {
        code: "DEBUG_ERROR",
        message:
          error instanceof Error ? error.message : "Command execution failed",
      };
    }
  },
);

// 残り5ハンドラも同一パターンで実装
// （バリデーション → ビジネスロジック → エラーサニタイズ）
```

#### 3-3. イベントチャネル実装（AT-18）

```typescript
// SkillDebugger 内部からイベント送信
private emitDebugEvent(event: DebugEvent): void {
  if (this.mainWindow && !this.mainWindow.isDestroyed()) {
    this.mainWindow.webContents.send(
      IPC_CHANNELS.SKILL_DEBUG_EVENT,
      event,
    );
  }
}
```

---

### Task 4: Claude Agent SDK Hooks 統合設計

#### 4-1. Hooks 生成パターン

```typescript
/**
 * デバッグ用 Hooks を生成する
 * Claude Agent SDK の query() メソッドに渡す hooks オブジェクトを構築
 */
private createHooks(session: DebugSession): HooksConfig {
  return {
    PreToolUse: async (context: {
      toolName: string;
      input: unknown;
    }) => {
      // 1. ステップ記録
      const step = session.recordStep(
        "tool_call",
        context.toolName,
        undefined,
        context.input,
      );

      // 2. 変数更新
      const changed = session.setVariable(
        `tools.${context.toolName}.input`,
        context.input,
      );
      this.emitDebugEvent({
        type: "variable-changed",
        sessionId: session.id,
        path: changed.path,
        value: changed.value,
      });

      // 3. コールスタックにプッシュ
      session.pushCallStack(context.toolName, "tool");

      // 4. ステップイベント発火
      this.emitDebugEvent({
        type: "step",
        sessionId: session.id,
        step,
      });

      // 5. ブレークポイント判定
      if (this.shouldBreak(session, step)) {
        this.emitDebugEvent({
          type: "breakpoint-hit",
          sessionId: session.id,
          breakpoint: this.findMatchingBreakpoint(session, step)!,
          step,
        });
        await session.pause();
      }

      // 6. ステップモード判定
      const stepMode = session.consumeStepMode();
      if (stepMode === "over" || stepMode === "into") {
        this.emitDebugEvent({
          type: "breakpoint-hit",
          sessionId: session.id,
          breakpoint: { id: "__step__", type: "step", enabled: true },
          step,
        });
        await session.pause();
      }

      return { decision: "allow" };
    },

    PostToolUse: async (context: {
      toolName: string;
      output: unknown;
    }) => {
      // 1. ステップ出力記録
      session.recordStepOutput(context.output);

      // 2. 変数更新
      const changed = session.setVariable(
        `tools.${context.toolName}.output`,
        context.output,
      );
      this.emitDebugEvent({
        type: "variable-changed",
        sessionId: session.id,
        path: changed.path,
        value: changed.value,
      });

      // 3. コールスタックからポップ
      session.popCallStack();

      // 4. hookタイプブレークポイント判定
      const hookStep = session.recordStep(
        "hook_execution",
        context.toolName,
        "PostToolUse",
        context.output,
      );
      if (this.shouldBreak(session, hookStep)) {
        this.emitDebugEvent({
          type: "breakpoint-hit",
          sessionId: session.id,
          breakpoint: this.findMatchingBreakpoint(session, hookStep)!,
          step: hookStep,
        });
        await session.pause();
      }
    },
  };
}
```

#### 4-2. ブレークポイント判定ロジック

```typescript
/**
 * ブレークポイントに停止すべきか判定する
 * 処理時間: 10ms 以内（NFR-2-2）
 */
private shouldBreak(session: DebugSession, step: DebugStep): boolean {
  for (const bp of session.breakpoints) {
    if (!bp.enabled) continue;

    let isMatch = false;

    switch (bp.type) {
      case "tool":
        isMatch =
          step.type === "tool_call" &&
          (bp.toolName === undefined || bp.toolName === step.toolName);
        break;
      case "hook":
        isMatch =
          step.type === "hook_execution" &&
          (bp.hookType === undefined || bp.hookType === step.hookType);
        break;
      case "step":
        isMatch = true;
        break;
    }

    if (isMatch && bp.condition) {
      try {
        const result = this.evaluateConditionSync(
          bp.condition,
          session.variables,
        );
        isMatch = Boolean(result);
      } catch {
        // 条件式評価失敗時は停止しない
        isMatch = false;
      }
    }

    if (isMatch) return true;
  }

  return false;
}
```

#### 4-3. サンドボックス式評価

```typescript
import { createContext, runInContext, Script } from "node:vm";

/**
 * サンドボックスで式を評価する（NFR-1-1, NFR-1-4, NFR-1-6）
 * process, require, fs, __dirname, __filename をブロック
 */
private evaluateInSandbox(
  expression: string,
  variables: Record<string, unknown>,
  timeoutMs: number,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const sandbox = {
      ...variables,
      // 明示的にブロック
      process: undefined,
      require: undefined,
      fs: undefined,
      __dirname: undefined,
      __filename: undefined,
      global: undefined,
      globalThis: undefined,
    };

    const context = createContext(sandbox);
    const script = new Script(expression);

    try {
      const result = script.runInContext(context, {
        timeout: timeoutMs,
        displayErrors: false,
      });
      resolve(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes("timed out")) {
        reject(new Error("Expression evaluation timed out after 5 seconds"));
      } else {
        reject(new Error("Expression evaluation failed"));
      }
    }
  });
}

/**
 * 条件式を同期評価する（ブレークポイント判定用）
 * タイムアウト: 1秒（条件式は短い式を想定）
 */
private evaluateConditionSync(
  condition: string,
  variables: Record<string, unknown>,
): unknown {
  const sandbox = { ...variables };
  const context = createContext(sandbox);
  const script = new Script(condition);
  return script.runInContext(context, {
    timeout: 1_000,
    displayErrors: false,
  });
}
```

---

### Task 5: Preload 拡張設計

#### 5-1. `apps/desktop/src/preload/channels.ts` への追加

```typescript
// 既存の IPC_CHANNELS オブジェクトに追加
export const IPC_CHANNELS = {
  // ... 既存チャネル ...

  // デバッグ（TASK-9H）
  SKILL_DEBUG_START: "skill:debug:start",
  SKILL_DEBUG_COMMAND: "skill:debug:command",
  SKILL_DEBUG_BREAKPOINT_ADD: "skill:debug:breakpoint:add",
  SKILL_DEBUG_BREAKPOINT_REMOVE: "skill:debug:breakpoint:remove",
  SKILL_DEBUG_INSPECT: "skill:debug:inspect",
  SKILL_DEBUG_EVALUATE: "skill:debug:evaluate",
  SKILL_DEBUG_EVENT: "skill:debug:event",
} as const;
```

#### 5-2. `apps/desktop/src/preload/skill-api.ts` への追加

```typescript
import {
  DebugSession,
  Breakpoint,
  DebugCommand,
  DebugEvent,
  DebugStartRequest,
  DebugCommandRequest,
  DebugBreakpointAddRequest,
  DebugBreakpointRemoveRequest,
  DebugInspectRequest,
  DebugEvaluateRequest,
  DebugEvaluateResponse,
} from "@repo/shared";

// SkillAPI インターフェースに debug プロパティを追加
export interface SkillAPI {
  // ... 既存メソッド ...

  /** デバッグ機能（TASK-9H） */
  debug: {
    /** デバッグセッションを開始する */
    startSession: (
      skillName: string,
      prompt: string,
      breakpoints: Omit<Breakpoint, "id">[],
    ) => Promise<DebugSession>;

    /** デバッグコマンドを実行する */
    executeCommand: (sessionId: string, command: DebugCommand) => Promise<void>;

    /** ブレークポイントを追加する */
    addBreakpoint: (
      sessionId: string,
      breakpoint: Omit<Breakpoint, "id">,
    ) => Promise<Breakpoint>;

    /** ブレークポイントを削除する */
    removeBreakpoint: (
      sessionId: string,
      breakpointId: string,
    ) => Promise<void>;

    /** 変数をインスペクションする */
    inspectVariable: (sessionId: string, path: string) => Promise<unknown>;

    /** 式を評価する */
    evaluateExpression: (
      sessionId: string,
      expression: string,
    ) => Promise<DebugEvaluateResponse>;

    /** デバッグイベントリスナーを登録する（クリーンアップ関数を返却） */
    onDebugEvent: (callback: (event: DebugEvent) => void) => () => void;
  };
}

// contextBridge 実装
const debugApi = {
  startSession: (
    skillName: string,
    prompt: string,
    breakpoints: Omit<Breakpoint, "id">[],
  ) =>
    safeInvoke(IPC_CHANNELS.SKILL_DEBUG_START, {
      skillName,
      prompt,
      breakpoints,
    } satisfies DebugStartRequest),

  executeCommand: (sessionId: string, command: DebugCommand) =>
    safeInvoke(IPC_CHANNELS.SKILL_DEBUG_COMMAND, {
      sessionId,
      command,
    } satisfies DebugCommandRequest),

  addBreakpoint: (sessionId: string, breakpoint: Omit<Breakpoint, "id">) =>
    safeInvoke(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD, {
      sessionId,
      breakpoint,
    } satisfies DebugBreakpointAddRequest),

  removeBreakpoint: (sessionId: string, breakpointId: string) =>
    safeInvoke(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE, {
      sessionId,
      breakpointId,
    } satisfies DebugBreakpointRemoveRequest),

  inspectVariable: (sessionId: string, path: string) =>
    safeInvoke(IPC_CHANNELS.SKILL_DEBUG_INSPECT, {
      sessionId,
      path,
    } satisfies DebugInspectRequest),

  evaluateExpression: (sessionId: string, expression: string) =>
    safeInvoke(IPC_CHANNELS.SKILL_DEBUG_EVALUATE, {
      sessionId,
      expression,
    } satisfies DebugEvaluateRequest),

  onDebugEvent: (callback: (event: DebugEvent) => void) =>
    safeOn(IPC_CHANNELS.SKILL_DEBUG_EVENT, callback),
};
```

#### 5-3. `apps/desktop/src/preload/types.ts` への追加

```typescript
// 既存の型定義に追加
// @repo/shared から re-export（Renderer 側で使用する型）
export type {
  DebugSession,
  DebugSessionStatus,
  Breakpoint,
  BreakpointType,
  DebugStep,
  DebugStepType,
  CallStackEntry,
  CallStackEntryType,
  DebugEvent,
  DebugStepEvent,
  DebugBreakpointHitEvent,
  DebugVariableChangedEvent,
  DebugSessionEndedEvent,
  DebugCommand,
  DebugStartRequest,
  DebugCommandRequest,
  DebugBreakpointAddRequest,
  DebugBreakpointRemoveRequest,
  DebugInspectRequest,
  DebugEvaluateRequest,
  DebugEvaluateResponse,
} from "@repo/shared";
```

---

### Task 6: セッション状態遷移図・ドメインモデル

#### 6-1. セッション状態遷移図

```
                    startDebugSession()
                          │
                          ▼
                    ┌───────────┐
                    │   idle    │
                    └─────┬─────┘
                          │ query() 開始
                          ▼
                    ┌───────────┐
              ┌────▶│  running  │◀────┐
              │     └─────┬─────┘     │
              │           │           │
              │     shouldBreak()     │
              │     || pause cmd      │ resume()/continue cmd
              │           │           │
              │           ▼           │
              │     ┌───────────┐     │
              │     │  paused   │─────┘
              │     └─────┬─────┘
              │           │
              │     stop cmd
              │           │
              │           ▼
              │     ┌───────────┐
              └────▶│ completed │
                    └───────────┘
                          ▲
                          │ query() 正常終了
                          │ || タイムアウト
                          │ || MAX_STEPS 超過

                    ┌───────────┐
                    │   error   │◀── 例外発生（任意の状態から遷移可能）
                    └───────────┘
```

**遷移ルール**:

| 現在の状態  | 遷移先      | トリガー                                    |
| ----------- | ----------- | ------------------------------------------- |
| `idle`      | `running`   | `startDebugSession()` 呼び出し              |
| `running`   | `paused`    | ブレークポイント到達、`pause` コマンド      |
| `running`   | `completed` | `query()` 正常終了、`stop` コマンド         |
| `running`   | `error`     | `query()` 例外、タイムアウト、MAX_STEPS超過 |
| `paused`    | `running`   | `continue`/`stepOver`/`stepInto`/`stepOut`  |
| `paused`    | `completed` | `stop` コマンド                             |
| `paused`    | `error`     | 内部エラー発生                              |
| `completed` | -           | 終了状態（遷移不可）                        |
| `error`     | -           | 終了状態（遷移不可）                        |

#### 6-2. ドメインモデル

```
┌─────────────────────────────────────────────────────┐
│                    SkillDebugger                      │
│  (Facade - セッション管理の統合入口)                 │
│                                                       │
│  - activeSession: DebugSession | null                │
│  - sessionTimer: NodeJS.Timeout | null               │
│  - mainWindow: BrowserWindow                          │
│                                                       │
│  + startDebugSession()                                │
│  + executeCommand()                                   │
│  + addBreakpoint()                                    │
│  + removeBreakpoint()                                 │
│  + inspectVariable()                                  │
│  + evaluateExpression()                               │
│  - createHooks()                                      │
│  - shouldBreak()                                      │
│  - emitDebugEvent()                                   │
│  - evaluateInSandbox()                                │
│  - cleanupSession()                                   │
└──────────┬──────────────────────────────────────────┘
           │ 1:0..1 (activeSession)
           ▼
┌─────────────────────────────────────────────────────┐
│                    DebugSession                       │
│  (個別セッションの状態管理)                           │
│                                                       │
│  - id: string                                         │
│  - skillName: string                                  │
│  - status: DebugSessionStatus                         │
│  - breakpoints: Breakpoint[]        ◀── 0..* ──┐     │
│  - currentStep?: DebugStep                      │     │
│  - variables: Record<string, unknown>           │     │
│  - callStack: CallStackEntry[]      ◀── 0..* ──┤     │
│  - stepCounter: number                          │     │
│  - nextStepMode: StepMode                       │     │
│  - resumeResolver: (() => void) | null          │     │
│                                                 │     │
│  + transitionTo()                               │     │
│  + recordStep() → DebugStep                     │     │
│  + recordStepOutput()                           │     │
│  + setVariable()                                │     │
│  + getVariable()                                │     │
│  + pushCallStack()                              │     │
│  + popCallStack()                               │     │
│  + pause() → Promise<void>                      │     │
│  + resume()                                     │     │
│  + toJSON() → DebugSessionType                  │     │
│  + destroy()                                    │     │
└─────────────────────────────────────────────────┘
           │                    │
     ┌─────┘                    └─────┐
     ▼                                ▼
┌──────────────┐            ┌───────────────┐
│  Breakpoint  │            │ CallStackEntry│
│              │            │               │
│  - id        │            │  - depth      │
│  - type      │            │  - name       │
│  - condition │            │  - type       │
│  - toolName  │            │  - startTime  │
│  - hookType  │            └───────────────┘
│  - enabled   │
└──────────────┘

┌──────────────────────────────────────┐
│            DebugEvent (Union)         │
│                                       │
│  step | breakpoint-hit |              │
│  variable-changed | session-ended     │
└──────────────────────────────────────┘
```

#### 6-3. データフロー

```
[Renderer]                    [Preload]                     [Main Process]
    │                            │                               │
    │  debug.startSession()      │                               │
    │───────────────────────────▶│  safeInvoke(DEBUG_START)      │
    │                            │──────────────────────────────▶│
    │                            │                               │ SkillDebugger
    │                            │                               │ .startDebugSession()
    │                            │                               │   │
    │                            │                               │   ├─ DebugSession 生成
    │                            │                               │   ├─ createHooks()
    │                            │                               │   └─ SkillExecutor.query()
    │                            │                               │       (hooks 付き実行)
    │                            │    DebugSession (JSON)        │
    │    DebugSession            │◀──────────────────────────────│
    │◀───────────────────────────│                               │
    │                            │                               │
    │    [ツール呼び出し発生]    │                               │
    │                            │   webContents.send(EVENT)     │
    │    onDebugEvent callback   │◀──────────────────────────────│ emitDebugEvent()
    │◀───────────────────────────│                               │
    │                            │                               │
    │  debug.executeCommand()    │                               │
    │───────────────────────────▶│  safeInvoke(DEBUG_COMMAND)    │
    │                            │──────────────────────────────▶│
    │                            │                               │ session.resume()
```

---

## 統合テスト連携

| 連携先Phase | 内容                                          |
| ----------- | --------------------------------------------- |
| Phase 1     | 全要件（FR/NFR/AT）が設計に反映されていること |
| Phase 3     | 設計の妥当性をレビュー                        |
| Phase 4     | 設計からテストケースを導出                    |
| Phase 5     | 設計に基づいて実装                            |

## 多角的チェック観点

| 観点               | 適用判断 | 仕様参照先                                        |
| ------------------ | -------- | ------------------------------------------------- |
| セキュリティ       | 必須     | aiworkflow-requirements: security-electron-ipc.md |
| UI/UX              | 非該当   | -                                                 |
| アーキテクチャ     | 必須     | aiworkflow-requirements: architecture-overview.md |
| API設計            | 必須     | aiworkflow-requirements: api-ipc-agent.md         |
| データ整合性       | 非該当   | -                                                 |
| エラーハンドリング | 必須     | aiworkflow-requirements: error-handling.md        |
| パフォーマンス     | 対象限定 | aiworkflow-requirements: quality-requirements.md  |
| アクセシビリティ   | 非該当   | -                                                 |
| テスタビリティ     | 必須     | aiworkflow-requirements: quality-requirements.md  |

### Electronデスクトップアプリ観点

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | 契約確認 | aiworkflow-requirements: interfaces-agent-sdk-skill.md |
| バックエンド（Main）       | 必須     | aiworkflow-requirements: arch-electron-services.md     |
| IPC通信                    | 必須     | aiworkflow-requirements: api-ipc-agent.md              |
| Preload/セキュリティ       | 必須     | aiworkflow-requirements: security-api-electron.md      |
| ローカルストレージ         | 非該当   | -                                                      |

## 成果物

| 成果物 | ファイル          | 内容                                                |
| ------ | ----------------- | --------------------------------------------------- |
| 設計書 | phase-2-design.md | 型定義・クラス・IPC・Hooks・Preload・状態遷移の設計 |

## 完了条件

- [ ] `skill-debug.ts` の全型定義（AT-1〜AT-8）が設計されている
- [ ] `SkillDebugger` クラスの全パブリックメソッドのシグネチャと責務が定義されている
- [ ] `DebugSession` クラスの全パブリックメソッドのシグネチャと責務が定義されている
- [ ] 7つの IPC チャネルの引数型・戻り値型・セキュリティ検証が設計されている
- [ ] IPC ハンドラの実装パターン（validateIpcSender + P42バリデーション + エラーサニタイズ）が明示されている
- [ ] Claude Agent SDK Hooks（PreToolUse / PostToolUse）の統合パターンが設計されている
- [ ] サンドボックス式評価の実装方針（`node:vm` 使用、ブロック対象、タイムアウト）が定義されている
- [ ] Preload 拡張（channels.ts / skill-api.ts / types.ts）の追加内容が設計されている
- [ ] セッション状態遷移図と有効な遷移ルールテーブルが定義されている
- [ ] ドメインモデルの関連（SkillDebugger 1:0..1 DebugSession、DebugSession 1:\* Breakpoint）が明示されている
- [ ] データフローが Renderer → Preload → Main の3層で図示されている
- [ ] 日時フィールドの IPC シリアライズ方針（Date → ISO 8601 文字列）が明記されている
- [ ] DI パターン（SkillDebugger: Constructor Injection）が指定されている
- [ ] 禁止曖昧語チェック（品質ゲート定義語）が完了している

## サブタスク管理

1. SubAgent はタスク完了時に成果物を指定パスに出力する
2. 全 SubAgent の完了を確認後、成果物の統合確認を行う
3. 不整合がある場合は該当 SubAgent のタスクを再実行する
4. 全成果物の整合性が確認できたら Phase 完了とする

## タスク100%実行確認

- [ ] 全 Task（Task 1〜6）が実行完了している
- [ ] 完了条件の全項目がチェック済みである
- [ ] 成果物が指定パスに出力されている
- [ ] 次 Phase（Phase 3）の入力として十分な情報が含まれている

## 次のPhase

Phase 3: 設計レビュー（phase-3-design-review.md）
