# Phase 2: 設計 -- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                  |
| ---------- | ------------------- |
| Phase番号  | 2                   |
| 機能名     | sdk-session-bridge  |
| タスクID   | TASK-SDK-SC-01      |
| 作成日     | 2026-04-02          |
| 依存 Phase | Phase 1（要件定義） |

## 目的

Phase 1 で確定した要件（FR-001 から FR-004）を満たすための具体的なクラス設計・IPC チャネル設計・型定義設計を定義する。

## 実行タスク

### Task 2-1: クラス図

```
SkillCreatorIpcBridge
  - session: SkillCreatorSdkSession | null
  - window: BrowserWindow
  + register(): void
  + unregister(): void
  - onStartSession(request: string): Promise<void>
  - onAnswer(answer: UserInputAnswer): void
  - emitQuestionReceived(question: UserInputQuestion): void
  - emitSessionComplete(result: string): void
  - emitSessionError(error: string): void

SkillCreatorSdkSession
  - sessionId: string
  - state: ISkillCreatorSessionState
  - sdkQueryIterator: AsyncIterator | null
  - pendingResolve: ((answer: UserInputAnswer) => void) | null
  + startSession(request: string): Promise<void>
  + sendAnswer(answer: UserInputAnswer): void
  + getState(): ISkillCreatorSessionState
  - handleUserInputToolCall(toolCall: UserInputQuestion): Promise<UserInputAnswer>
  - onComplete(result: string): void
  - onError(error: Error): void
```

### Task 2-2: `ISkillCreatorSessionState` インターフェース設計

```typescript
// packages/shared/src/types/skillCreatorSession.ts

export type SessionStatus =
  | "running"
  | "awaiting-input"
  | "completed"
  | "error";

export type UserInputType =
  | "single_select"
  | "multi_select"
  | "free_text"
  | "secret"
  | "confirm";

export interface UserInputOption {
  value: string;
  label: string;
}

export interface UserInputQuestion {
  toolCallId: string;
  type: UserInputType;
  question: string;
  options?: UserInputOption[];
  placeholder?: string;
}

export interface UserInputAnswer {
  toolCallId: string;
  value: string | string[] | boolean;
}

export interface ISkillCreatorSessionState {
  sessionId: string;
  status: SessionStatus;
  currentQuestion?: UserInputQuestion;
  result?: string;
  error?: string;
  startedAt: Date;
  updatedAt: Date;
}
```

### Task 2-3: `SKILL_CREATOR_SESSION_CHANNELS` 定数設計

```typescript
// packages/shared/src/ipc/channels.ts への追加

export const SKILL_CREATOR_SESSION_CHANNELS = {
  /** Renderer → Main: セッション開始リクエスト */
  START_SESSION: "skill-creator:start-session",
  /** Main → Renderer: UserInput質問イベント */
  QUESTION_RECEIVED: "skill-creator:question-received",
  /** Renderer → Main: ユーザー回答送信 */
  ANSWER: "skill-creator:answer",
  /** Main → Renderer: セッション完了通知 */
  SESSION_COMPLETE: "skill-creator:session-complete",
  /** Main → Renderer: セッションエラー通知 */
  SESSION_ERROR: "skill-creator:session-error",
} as const;
```

設計判断:

- `SESSION_ERROR` は FR-003 で定義した5チャネルの一部として追加する（AC-05 対応）
- チャネル名は `skill-creator:` プレフィックスで既存チャネルと名前空間を統一

### Task 2-4: `SkillCreatorSdkSession` クラス設計

#### コンストラクタ

```typescript
constructor(
  sessionId: string,
  private readonly skillCreatorDir: string,   // ← 注入する（ハードコード禁止）
  private readonly onQuestion: (question: UserInputQuestion) => void,
  private readonly onComplete: (result: string) => void,
  private readonly onError: (error: string) => void,
)
```

設計判断:

- `skillCreatorDir` を DI することで、ディレクトリが移動・リネームされても呼び出し側が最新パスを渡せる
- `SkillCreatorIpcBridge` が `SkillLocator.resolveSkillDir('skill-creator')` で解決したパスをコンストラクタに注入する

#### `SkillLocator` ユーティリティ設計

skill-creator ディレクトリを動的に発見するユーティリティを別途実装する。

```typescript
// apps/desktop/src/main/services/runtime/SkillLocator.ts
export class SkillLocator {
  /**
   * .claude/skills/ 配下を Glob スキャンして指定スキル名の SKILL.md を探す。
   * ディレクトリ名が変更された場合も SKILL.md の name フィールドで照合。
   */
  static resolveSkillDir(skillName: string, cwd = process.cwd()): string {
    const pattern = path.join(cwd, ".claude/skills/**/SKILL.md");
    const candidates = globSync(pattern);
    for (const skillMdPath of candidates) {
      const content = fs.readFileSync(skillMdPath, "utf-8");
      const match = content.match(/^name:\s*(.+)$/m);
      if (match?.[1]?.trim() === skillName) {
        return path.dirname(skillMdPath); // skill-creator ディレクトリのパスを返す
      }
    }
    throw new Error(`Skill not found: ${skillName}`);
  }
}
```

これにより `.claude/skills/skill-creator/` が `.claude/skills/sc/` にリネームされても自動追跡できる。

#### SkillLocator キャッシュ戦略

パフォーマンス要件: プロジェクト内のスキル数が増えても O(1) でディレクトリを解決できること。

現状の問題: 毎 `startSession()` 呼び出しで `globSync` を実行すると O(n) のファイルスキャンが発生し、
スキル数が多いプロジェクトではセッション開始のレイテンシが増大する。

実装方針:

```typescript
// static キャッシュ: スキル名 → {dir, mtime} のマップ
private static cache = new Map<string, { dir: string; mtime: number }>();

static resolveSkillDir(skillName: string, cwd = process.cwd()): string {
  const cached = SkillLocator.cache.get(skillName);
  if (cached) {
    // キャッシュヒット: mtime を stat() で確認し、変化なければキャッシュを返す
    const currentMtime = fs.statSync(path.join(cached.dir, 'SKILL.md')).mtimeMs;
    if (currentMtime === cached.mtime) {
      return cached.dir; // O(1) で解決
    }
    // mtime が変化していた場合はキャッシュを無効化して再スキャン
    SkillLocator.cache.delete(skillName);
  }
  // キャッシュミス or mtime 変化時: globSync で再スキャン
  const pattern = path.join(cwd, ".claude/skills/**/SKILL.md");
  for (const skillMdPath of globSync(pattern)) {
    const content = fs.readFileSync(skillMdPath, "utf-8");
    const match = content.match(/^name:\s*(.+)$/m);
    if (match?.[1]?.trim() === skillName) {
      const mtime = fs.statSync(skillMdPath).mtimeMs;
      SkillLocator.cache.set(skillName, { dir: path.dirname(skillMdPath), mtime });
      return path.dirname(skillMdPath);
    }
  }
  throw new Error(`Skill not found: ${skillName}`);
}
```

- キャッシュヒット時: `stat()` のみで確認（ファイル読み込みなし）→ 実質 O(1)
- キャッシュミス or mtime 変化時: `globSync` で全スキャン（初回または SKILL.md 更新時のみ）
- 開発時はホットリロード対応のため TTL を設けない（mtime ベースの確認のみ）
- テスト時は `SkillLocator.cache.clear()` でキャッシュをリセット可能

注意: `SkillLocator` はシングルトンではなく static メソッドのため、
キャッシュは `static` プロパティとして保持する。

#### `startSession(request: string): Promise<void>`

1. **SKILL.md の動的読み込み**
   - `this.skillCreatorDir` から `SKILL.md` を読み込む（毎セッション最新版）
   - サブファイル（`agents/*.md` 等）はキャッシュせず、エージェントが必要時に Read ツールで読む

2. **利用可能ファイルの動的スキャン（新規追加ファイルの自動認識）**

   ```typescript
   const availableFiles = globSync(
     `${this.skillCreatorDir}/**/*.{md,js,json}`,
   ).map((f) => path.relative(this.skillCreatorDir, f));
   // このリストを prompt に含め、エージェントが新規ファイルを発見できるようにする
   ```

3. **`AskUserQuestion` を custom tool として提供**
   - SDK にはこのツールがないため、tool_use イベントとして捕捉→ IPC 転送

4. SDK の `query()` API を呼び出す（prompt + tools + cwd を渡す）
5. `type === 'tool_use'` かつ `name === 'AskUserQuestion'` を検出したら `handleUserInputToolCall()` を呼び出す
6. `state.status` を `running` → `completed` に遷移させる

#### `sendAnswer(answer: UserInputAnswer): void`

- `pendingResolve` が存在する場合、`answer` を渡して解決する
- `state.status` を `awaiting-input` → `running` に遷移させる
- `pendingResolve` が null の場合はエラーログを出力して何もしない（安全設計）

#### `handleUserInputToolCall(toolCall: UserInputQuestion): Promise<UserInputAnswer>`（private）

- `state.status` を `awaiting-input` に遷移させ、`state.currentQuestion` を更新する
- `onQuestion` コールバックを呼び出す
- Promise を返し、`pendingResolve` に resolve 関数を保存する
- タイムアウト（30秒）後に自動的に `onError` を呼び出す

#### SDK tool_use → tool_result Promise パターン

Claude Agent SDK は custom tool の execute 関数が返す `Promise<string>` を await する。
この仕組みにより、ユーザー入力を待機する「中断と再開」が実現される:

```
1. SDK が AskUserQuestion tool_use イベントを発行
2. SDK は execute() 関数の返値（Promise<string>）を await する
   → execute() が resolve されるまで SDK のストリームは一時停止する
3. execute() 内部で new Promise<string> を生成し、resolve 関数を pendingResolve に保存
4. IpcBridge が onQuestion() コールバック経由で Renderer に question-received イベントを送信
5. ユーザーが回答 → Renderer が answer IPC を送信 → sendAnswer() が呼ばれる
6. sendAnswer() が pendingResolve(answer.value.toString()) を呼び出し → Promise が解決
7. SDK が tool_result として回答文字列を受け取り、クエリストリームを再開
```

**重要**: `pendingResolve` は `Promise` の resolve 関数そのものであり、
`sendAnswer()` が呼ばれるまで SDK のストリームはブロックされ続ける。
これにより Renderer からの非同期回答が SDK のストリームに安全に注入される。

### Task 2-5: `SkillCreatorIpcBridge` クラス設計

#### コンストラクタ

```typescript
constructor(
  private readonly window: BrowserWindow,
  private readonly sessionFactory: (
    sessionId: string,
    onQuestion: (q: UserInputQuestion) => void,
    onComplete: (r: string) => void,
    onError: (e: string) => void,
  ) => SkillCreatorSdkSession,
)
```

設計判断: `sessionFactory` を DI することでテスト時に `SkillCreatorSdkSession` をモック可能にする。

#### `register(): void`

- `ipcMain.handle(SKILL_CREATOR_SESSION_CHANNELS.START_SESSION, ...)` を登録
- `ipcMain.on(SKILL_CREATOR_SESSION_CHANNELS.ANSWER, ...)` を登録

#### `unregister(): void`

- 登録した全ハンドラーを `ipcMain.removeHandler()` / `ipcMain.removeAllListeners()` で解除
- メモリリーク防止のため、アプリ終了時または不要になった時点で必ず呼び出す

### Task 2-6: シーケンス図（テキストベース）

```
Renderer                 IpcBridge               SdkSession              SDK              skill-creator
   |                         |                       |                     |                    |
   |-- start-session ------->|                       |                     |                    |
   |                         |-- startSession() ---->|                     |                    |
   |                         |                       |-- query() --------->|                    |
   |                         |                       |                     |-- /skill-creator -->|
   |                         |                       |                     |<-- UserInput -------|
   |                         |                       |<-- tool_use event --|                    |
   |                         |<-- onQuestion() ------|                     |                    |
   |<-- question-received ---|                       |                     |                    |
   |                         |                       | (awaiting-input)    |                    |
   |-- answer -------------->|                       |                     |                    |
   |                         |-- sendAnswer() ------>|                     |                    |
   |                         |                       |-- pendingResolve() ->|                   |
   |                         |                       |                     |-- answer ---------> |
   |                         |                       |                     |<-- completed -------|
   |                         |                       |<-- stream end ------|                    |
   |                         |<-- onComplete() ------|                     |                    |
   |<-- session-complete ----|                       |                     |                    |
```

### Task 2-7: 変更ファイル一覧

| ファイルパス                                                       | 変更種別 | 変更内容                                |
| ------------------------------------------------------------------ | -------- | --------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts` | 新規作成 | SDKセッション管理クラス                 |
| `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`  | 新規作成 | IPCブリッジクラス                       |
| `packages/shared/src/ipc/channels.ts`                              | 更新     | SKILL_CREATOR_SESSION_CHANNELS 定数追加 |
| `packages/shared/src/types/skillCreatorSession.ts`                 | 新規作成 | セッション状態型・UserInput 型定義      |

変更しないファイル（本タスクのスコープ外）:

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`（責務境界を維持）
- Renderer 側の全ファイル（UI 実装は別タスク）

## 参照資料

| 資料名           | パス                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-1-requirements.md` |
| 既存チャネル定義 | `packages/shared/src/ipc/channels.ts`                                              |
| 共有型定義       | `packages/shared/src/types/skillCreator.ts`                                        |

## 成果物

| 成果物               | パス                                                                         | 形式     |
| -------------------- | ---------------------------------------------------------------------------- | -------- |
| 設計書（本ファイル） | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-2-design.md` | Markdown |

## 完了条件

- [ ] `ISkillCreatorSessionState` インターフェースを設計した
- [ ] `UserInputQuestion` / `UserInputAnswer` / `UserInputType` 型を設計した
- [ ] `SKILL_CREATOR_SESSION_CHANNELS` 定数（5チャネル）を設計した
- [ ] `SkillCreatorSdkSession` の全メソッド（constructor, startSession, sendAnswer, handleUserInputToolCall）を設計した
- [ ] `SkillCreatorIpcBridge` の全メソッド（constructor, register, unregister）を設計した
- [ ] コールバック DI 設計によるテスタビリティを確認した
- [ ] シーケンス図でデータフローを明確化した
- [ ] 変更対象ファイルが 4 ファイルのみであることを確認した

## 次の Phase

Phase 3: 設計レビュー（`phase-3-design-review.md`）
