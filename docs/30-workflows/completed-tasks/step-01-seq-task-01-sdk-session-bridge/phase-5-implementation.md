# Phase 5: 実装（TDD: Green）-- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase番号  | 5                     |
| 機能名     | sdk-session-bridge    |
| タスクID   | TASK-SDK-SC-01        |
| 作成日     | 2026-04-02            |
| 依存 Phase | Phase 4（テスト作成） |

## 目的

Phase 4 で作成したテストを全て PASS させる（TDD: Green フェーズ）。4 ファイルを実装し、`pnpm typecheck` と `pnpm lint` が通ることを確認する。

## 実行タスク

### Task 5-1: `skillCreatorSession.ts` 型定義の実装

ファイル: `packages/shared/src/types/skillCreatorSession.ts`（新規作成）

実装内容:

```typescript
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

### Task 5-2: `channels.ts` への IPCチャネル追加

ファイル: `packages/shared/src/ipc/channels.ts`（更新）

追加する定数:

```typescript
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

既存の定数定義の末尾に追記する。既存のチャネル定義は変更しない。

### Task 5-3: `SkillLocator.ts` と `SkillCreatorSdkSession.ts` の実装

#### Task 5-3-0: `SkillLocator.ts` の新規作成

ファイル: `apps/desktop/src/main/services/runtime/SkillLocator.ts`（新規作成）

スキルディレクトリをパスのハードコードなしに動的に発見するユーティリティ。

```typescript
// .claude/skills/ 配下を Glob スキャンし、SKILL.md の name フィールドで照合する。
// ディレクトリ名が変更されても、name が一致すれば追跡できる。
export class SkillLocator {
  // static キャッシュ: スキル名 → {dir, mtime} のマップ（O(1) 解決のため）
  // キャッシュヒット時は mtime を stat() で確認し、変化なければキャッシュを返す。
  // テスト時は SkillLocator.cache.clear() でリセット可能。
  // 詳細なキャッシュ戦略は Phase 2 設計の「SkillLocator キャッシュ戦略」セクションを参照。
  private static cache = new Map<string, { dir: string; mtime: number }>();

  static resolveSkillDir(skillName: string, cwd = process.cwd()): string {
    const pattern = path.join(cwd, ".claude/skills/**/SKILL.md");
    for (const skillMdPath of globSync(pattern)) {
      const content = fs.readFileSync(skillMdPath, "utf-8");
      const match = content.match(/^name:\s*(.+)$/m);
      if (match?.[1]?.trim() === skillName) {
        return path.dirname(skillMdPath);
      }
    }
    throw new Error(`Skill not found: ${skillName}`);
  }
}
```

実装のポイント（キャッシュ適用版）: 上記は概念を示すシンプルな実装例。実際の実装では Phase 2 設計の「SkillLocator キャッシュ戦略」に従い、`static cache` による mtime ベースのキャッシュを適用することで、スキル数が増えても O(1) でディレクトリを解決できるようにする。

#### Task 5-3-1: `SkillCreatorSdkSession.ts` の新規作成

ファイル: `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts`（新規作成）

**重要: SKILL.md のロードと AskUserQuestion の custom tool 登録**

skill-creator は Claude Code の `/skill-creator` slash command で起動するが、SDK では slash command を解釈しない。
そのため `startSession()` では以下の3つを行う必要がある:

1. **`SkillLocator` で skill-creator ディレクトリを動的に取得する**（ハードコード禁止）
2. **SKILL.md を読んで prompt に含め、ファイル一覧も追記する**（新規追加ファイルの自動認識）
3. **`AskUserQuestion` を custom tool として SDK に提供する**

```typescript
// startSession() の核心部分（実装イメージ）
async startSession(request: string): Promise<void> {
  // (1) SkillLocator で skill-creator ディレクトリを動的に解決
  //     → ディレクトリ名が変わっても SKILL.md の name フィールドで追跡
  const skillCreatorDir = this.skillCreatorDir; // コンストラクタで注入済み
  const skillMdPath = path.join(skillCreatorDir, 'SKILL.md');
  const skillMdContent = fs.readFileSync(skillMdPath, 'utf-8');

  // (2) AskUserQuestion を custom tool として定義
  const askUserQuestionTool = {
    name: "AskUserQuestion",
    description: "ユーザーに質問してインタビューを実施する",
    inputSchema: { /* ... question, options, type フィールド */ },
    execute: (params) => this.handleUserInputToolCall({
      toolCallId: params.toolCallId,
      type: params.type ?? 'free_text',
      question: params.question,
      options: params.options,
    })
  };

  // (2.5) ディレクトリを動的スキャン — 新規追加ファイルも自動認識
  const availableFiles = globSync(`${skillCreatorDir}/**/*.{md,js,json}`)
    .map(f => path.relative(skillCreatorDir, f))
    .sort();

  // (3) query() 呼び出し — SKILL.md + ファイル一覧 + ユーザー要求 + AskUserQuestion tool
  await query({
    prompt: [
      skillMdContent,
      `\n## 現在の利用可能ファイル一覧（動的取得）`,
      availableFiles.map(f => `- ${f}`).join('\n'),
      `\n---\nユーザーの要求: ${request}`,
    ].join('\n'),
    tools: [readTool, writeTool, bashTool, globTool, grepTool, askUserQuestionTool],
    cwd: skillCreatorDir, // agents/*.md 等の相対パスがこのディレクトリ基準で解決される
  });
}
```

これにより:

- `agents/discover-problem.md` 等は Readツール経由で Claude Code と同様にアクセス可能
- `scripts/detect_mode.js` 等は Bashツール経由で実行可能（Progressive Disclosure と同じ動作）
- `AskUserQuestion` ツールコールは `handleUserInputToolCall()` に転送される

実装のポイント:

- `import { query } from '@anthropic-ai/claude-agent-sdk'` で SDK の `query()` API をインポート
- `SkillLocator.resolveSkillDir('skill-creator')` でディレクトリを動的解決する（パスのハードコード禁止）
- 毎 `startSession()` 呼び出しで SKILL.md を読み直す（キャッシュなし）
- 起動時に `globSync` でディレクトリをスキャンし、利用可能ファイル一覧を prompt に含める（新規追加ファイルの自動認識）
- `AskUserQuestion` を custom tool として `query()` の `tools` 配列に登録する
- `cwd` を `skillCreatorDir` に設定し、`agents/*.md` 等の相対パスが正しく解決されるようにする
- ストリームイベントの `type === 'tool_use'` かつ `name === 'AskUserQuestion'` を検出したら `handleUserInputToolCall()` を呼び出す
- `handleUserInputToolCall()` では 30 秒タイムアウト付きの `Promise<string>` を生成し、`pendingResolve` に resolve 関数を格納する
  - SDK はこの Promise を await するため、resolve されるまでストリームはブロックされる
  - `sendAnswer()` から `pendingResolve(answer.value.toString())` が呼ばれることで Promise が解決し、SDK ストリームが再開する
  - 詳細なメカニズムは Phase 2 設計の「SDK tool_use → tool_result Promise パターン」セクションを参照
- `sendAnswer()` では `pendingResolve` が存在する場合のみ呼び出し、null の場合は警告ログを出力
- 状態遷移は必ず `updatedAt: new Date()` を更新して行う

実装の注意点:

- `agents/*.md`、`scripts/*.js`、`references/*.md` は毎セッションで最新版を Read/Bash ツール経由でアクセス（Progressive Disclosure）
- ファイルが存在しない場合（リネーム等）、エージェントは Glob ツールで代替ファイルを探索できる
- エラー時は `state.status = 'error'` に設定した後に `onError` コールバックを呼び出す

### Task 5-4: `SkillCreatorIpcBridge.ts` の実装

ファイル: `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`（新規作成）

実装のポイント:

- 初期化時に `SkillLocator.resolveSkillDir('skill-creator')` でディレクトリを解決し、`sessionFactory` に渡す
- `ipcMain.handle(SKILL_CREATOR_SESSION_CHANNELS.START_SESSION, handler)` でセッション開始ハンドラーを登録
- `ipcMain.on(SKILL_CREATOR_SESSION_CHANNELS.ANSWER, handler)` で回答受信ハンドラーを登録
- `register()` 呼び出し前に `unregister()` を内部で実行して二重登録を防ぐ
- `window.webContents.send()` で Main → Renderer へイベントを送出
- `unregister()` では `ipcMain.removeHandler()` と `ipcMain.removeAllListeners()` で全ハンドラーを解除

実装の注意点:

- `sessionFactory` コールバックで `SkillCreatorSdkSession` インスタンスを生成する際に `skillCreatorDir` を渡す
- セッション開始時に `this.currentSession` にインスタンスを格納する
- セッション完了・エラー後は `this.currentSession` を null にリセットする

### Task 5-5: Green 確認コマンド

```bash
# 型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# テスト実行（Green 確認）
pnpm --filter @repo/desktop vitest run src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts
pnpm --filter @repo/desktop vitest run src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts

# Lint
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

期待する結果:

- 全テスト PASS（Green フェーズ達成）
- TypeScript コンパイルエラー 0 件
- ESLint エラー 0 件

## 参照資料

| 資料名               | パス                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| Phase 2 設計         | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-2-design.md`        |
| Phase 4 テスト仕様   | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-4-test-creation.md` |
| 既存 channels.ts     | `packages/shared/src/ipc/channels.ts`                                               |
| 既存 skillCreator.ts | `packages/shared/src/types/skillCreator.ts`                                         |

## 成果物

| 成果物                   | パス                                                               | 形式       |
| ------------------------ | ------------------------------------------------------------------ | ---------- |
| スキル発見ユーティリティ | `apps/desktop/src/main/services/runtime/SkillLocator.ts`           | TypeScript |
| セッション状態型定義     | `packages/shared/src/types/skillCreatorSession.ts`                 | TypeScript |
| IPCチャネル追加          | `packages/shared/src/ipc/channels.ts`                              | TypeScript |
| SDKセッション管理クラス  | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts` | TypeScript |
| IPCブリッジクラス        | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`  | TypeScript |

## 完了条件

- [ ] `SkillLocator.ts` を新規作成し、`resolveSkillDir('skill-creator')` が SKILL.md の name フィールドでスキルを動的発見する
- [ ] `skillCreatorSession.ts` に全型定義（SessionStatus, UserInputType, UserInputQuestion, UserInputAnswer, ISkillCreatorSessionState）を実装した
- [ ] `channels.ts` に `SKILL_CREATOR_SESSION_CHANNELS` 定数を追加した
- [ ] `SkillCreatorSdkSession.ts` でスキルディレクトリをハードコードせず `SkillLocator` 経由で取得している
- [ ] `SkillCreatorSdkSession.ts` の `startSession()` が毎回 `globSync` でファイル一覧を取得し prompt に含めている
- [ ] `SkillCreatorSdkSession.ts` に `startSession()` / `sendAnswer()` / `handleUserInputToolCall()` を実装した
- [ ] `SkillCreatorIpcBridge.ts` に `register()` / `unregister()` を実装した
- [ ] 全テスト（T-01 から T-06）が PASS した
- [ ] `pnpm typecheck` が 0 エラーで通った
- [ ] `pnpm lint` が 0 エラーで通った

## 次の Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
