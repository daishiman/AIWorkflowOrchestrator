# Claude Code CLI統合 - 実装ガイド

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | claude-code-cli-integration |
| バージョン | 1.0.0                       |
| 作成日     | 2026-01-17                  |
| Phase      | 12                          |

---

# Part 1: 概念的説明（初学者向け）

## Claude Code CLIとは何か

Claude Code CLIは、AIアシスタント「Claude」をコマンドラインから利用するためのツールです。開発者がターミナル（黒い画面）から直接Claudeに質問したり、コードの生成を依頼したりできます。

### 例え話で理解する

想像してください。あなたの会社に優秀なアシスタントがいて、どんな仕事でも手伝ってくれます。通常は直接話しかけて仕事を依頼しますが、Claude Code CLIを使うと「電話」や「メール」のように、離れた場所からでも仕事を依頼できるようになります。

## なぜElectronアプリから実行する必要があるのか

### 問題: 普通のWebブラウザではできないこと

Webブラウザ（ChromeやSafariなど）は、セキュリティ上の理由から、あなたのパソコンのファイルやプログラムに直接アクセスできません。これは泥棒が家に入れないようにする「鍵」のようなものです。

しかし、Claude Code CLIを使うには、パソコンにインストールされた「claude」コマンドを実行する必要があります。

### 解決策: Electronアプリ

Electronは「特別な許可証を持ったブラウザ」のようなものです。通常のブラウザと同じ画面を表示できますが、パソコンのファイルやプログラムにもアクセスできます。

```
[ユーザー]
    ↓ クリック
[Electronアプリの画面（Renderer）]
    ↓ お願い（IPC通信）
[Electronのメイン部分（Main）]
    ↓ 実行命令
[Claude Code CLI]
    ↓ 結果
[ユーザーに表示]
```

## ユーザーにとってのメリット

1. **視覚的な操作**: ボタンをクリックするだけでClaude Codeを使える
2. **リアルタイム表示**: Claudeの返答がリアルタイムで画面に表示される
3. **複数同時実行**: 複数の作業を同時に依頼できる
4. **安全な操作**: 危険な操作は自動的にブロックされる

## 基本的な使い方の流れ

1. **確認**: アプリがClaude Code CLIを見つけられるか確認
2. **選択**: 使いたい「スキル」（作業テンプレート）を選ぶ
3. **実行**: スキルを実行して、結果を待つ
4. **確認**: 結果を画面で確認する

---

# Part 2: 技術的詳細（開発者向け）

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Application                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    IPC     ┌─────────────────────────┐ │
│  │    Renderer     │◄──────────►│         Main            │ │
│  │    Process      │            │        Process          │ │
│  │                 │            │                         │ │
│  │  ┌───────────┐  │            │  ┌───────────────────┐  │ │
│  │  │ React UI  │  │            │  │ ClaudeCliManager  │  │ │
│  │  └───────────┘  │            │  │    (Facade)       │  │ │
│  │                 │            │  └─────────┬─────────┘  │ │
│  └─────────────────┘            │            │            │ │
│                                 │    ┌───────┴───────┐    │ │
│                                 │    │               │    │ │
│                                 │  ┌─▼─┐         ┌───▼──┐ │ │
│                                 │  │SM │         │  SS  │ │ │
│                                 │  └─┬─┘         └──────┘ │ │
│                                 │    │                    │ │
│                                 │  ┌─▼─┐                  │ │
│                                 │  │PM │                  │ │
│                                 │  └───┘                  │ │
│                                 └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │ Claude Code CLI │
                           └─────────────────┘

SM: SessionManager  SS: SkillScanner  PM: ProcessManager
```

## モジュール構成

### ClaudeCliManager（Facade）

外部APIを提供するファサードクラス。内部実装を隠蔽し、統一されたインターフェースを提供。

```typescript
// 主要メソッド
checkInstallation(): Promise<ClaudeCliResult<CliInstallationStatus>>
listSkills(request: ListSkillsRequest): Promise<ClaudeCliResult<ScanResult>>
getSkillDetail(request: GetSkillDetailRequest): Promise<ClaudeCliResult<ClaudeCliSkillDetail>>
executeScript(request: ExecuteScriptRequest): Promise<ClaudeCliResult<ExecuteScriptResponse>>
terminateSession(request: TerminateSessionRequest): Promise<ClaudeCliResult<TerminateSessionResponse>>
listSessions(): Promise<ClaudeCliResult<SessionSummary[]>>
getSession(request: GetSessionRequest): Promise<ClaudeCliResult<SessionDetail>>
shutdown(): Promise<void>
```

### SessionManager（Service）

セッションのライフサイクルを管理。

```typescript
// 設定
interface SessionManagerConfig {
  maxSessions?: number; // デフォルト: 10
  defaultTimeoutMs?: number; // デフォルト: 30分
}

// セッション状態
type SessionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "terminated";

// イベント
(sessionCreated, sessionDestroyed, statusChanged, output);
```

### ProcessManager（Utility）

子プロセスの生成・監視・終了を担当。

```typescript
// プロセス管理
spawn(options: SpawnOptions): Promise<SpawnResult>
kill(sessionId: string, options?: KillOptions): Promise<boolean>
getProcessInfo(sessionId: string): ProcessInfo | undefined
```

### SkillScanner（Service）

スキルディレクトリのスキャンとメタデータ抽出。

```typescript
// スキル操作
scan(options?: ScanOptions): Promise<ScanResult>
filter(criteria: FilterCriteria): ClaudeCliSkill[]
getSkillDetail(skillName: string, options?: DetailOptions): Promise<ClaudeCliSkillDetail | null>
resolveSkillPath(skillName: string): string
```

## IPC通信設計

### チャンネル定義

```typescript
const CHANNELS = {
  CHECK_INSTALLATION: "claude-cli:check-installation",
  LIST_SKILLS: "claude-cli:list-skills",
  GET_SKILL_DETAIL: "claude-cli:get-skill-detail",
  EXECUTE_SCRIPT: "claude-cli:execute-script",
  TERMINATE_SESSION: "claude-cli:terminate-session",
  LIST_SESSIONS: "claude-cli:list-sessions",
  GET_SESSION: "claude-cli:get-session",
  // ストリーミングイベント
  SESSION_OUTPUT: "claude-cli:session-output",
  SESSION_STATUS: "claude-cli:session-status",
};
```

### リクエスト・レスポンス型

```typescript
// 共通レスポンス型
type ClaudeCliResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

// エラーコード
type ClaudeCliErrorCode =
  | "VALIDATION_ERROR"
  | "SCAN_FAILED"
  | "SKILL_NOT_FOUND"
  | "EXECUTION_FAILED"
  | "SESSION_NOT_FOUND"
  | "TERMINATION_FAILED"
  | "LIST_SESSIONS_FAILED"
  | "GET_SESSION_FAILED"
  | "IPC_VALIDATION_ERROR";
```

## Zodスキーマ

```typescript
// スキル一覧リクエスト
const listSkillsRequestSchema = z.object({
  forceRefresh: z.boolean().optional(),
  filter: z
    .object({
      name: z.string().optional(),
      tags: z.array(z.string()).optional(),
      keyword: z.string().optional(),
    })
    .optional(),
});

// スキル詳細リクエスト
const getSkillDetailRequestSchema = z.object({
  skillName: z.string().min(1),
  includeScripts: z.boolean().optional(),
  includeReferences: z.boolean().optional(),
});

// スクリプト実行リクエスト
const executeScriptRequestSchema = z.object({
  skillName: z.string().min(1),
  scriptName: z.string().min(1),
  args: z.array(z.string()).optional(),
  cwd: z.string().optional(),
  timeoutMs: z.number().positive().optional(),
});
```

## 使用例

### CLI存在確認

```typescript
// Main Process
const manager = new ClaudeCliManager({
  skillsBasePath: "/Users/user/.claude/skills",
});

const result = await manager.checkInstallation();
if (result.success && result.data.installed) {
  console.log(`Claude CLI v${result.data.version} at ${result.data.path}`);
} else {
  console.error("Claude CLI not installed");
}
```

### スキル実行とストリーミング

```typescript
// イベントリスナー設定
manager.on("output", (event) => {
  console.log(`[${event.sessionId}] ${event.type}: ${event.content}`);
});

manager.on("statusChanged", (event) => {
  console.log(
    `Session ${event.sessionId}: ${event.oldStatus} -> ${event.newStatus}`,
  );
});

// スクリプト実行
const execResult = await manager.executeScript({
  skillName: "task-specification-creator",
  scriptName: "execute.mjs",
  args: ["--verbose"],
  timeoutMs: 60000,
});

if (execResult.success) {
  console.log(`Started session: ${execResult.data.sessionId}`);
}
```

### セッション管理

```typescript
// セッション一覧取得
const sessions = await manager.listSessions();
if (sessions.success) {
  sessions.data.forEach((s) => {
    console.log(`${s.id}: ${s.skillName} (${s.status})`);
  });
}

// セッション終了
await manager.terminateSession({
  sessionId: "session-123",
  force: false,
});
```

## セキュリティ対策

### IPC Sender検証

```typescript
// DevToolsからの呼び出しを拒否
function validateSender(event: IpcMainInvokeEvent): void {
  const validation = validateIpcSender(event.sender);
  if (!validation.valid) {
    throw { code: "IPC_VALIDATION_ERROR", message: validation.reason };
  }
}
```

### パストラバーサル防止

```typescript
// スキルパス検証
if (skillPath.includes("..") || !skillPath.startsWith(this.basePath)) {
  throw new Error("Invalid skill path");
}
```

### コマンドインジェクション防止

```typescript
// shell: falseを使用
spawn("node", [scriptPath, ...args], {
  shell: false, // シェル経由での実行を禁止
  cwd: workingDir,
});
```

## ディレクトリ構造

```
apps/desktop/src/main/claude-cli/
├── __tests__/                    # テストファイル
│   ├── claude-cli-manager.test.ts
│   ├── edge-cases.test.ts
│   ├── error-handling.test.ts
│   ├── integration.test.ts
│   ├── ipc-handler.test.ts
│   ├── process-manager.test.ts
│   ├── security.test.ts
│   ├── session-manager.test.ts
│   └── skill-scanner.test.ts
├── ClaudeCliManager.ts           # ファサード
├── ProcessManager.ts             # プロセス管理
├── SessionManager.ts             # セッション管理
├── SkillScanner.ts               # スキルスキャン
├── ipc-handler.ts                # IPCハンドラ
└── index.ts                      # エクスポート

packages/shared/src/claude-cli/
├── types.ts                      # 共有型定義
├── schemas.ts                    # Zodスキーマ
└── index.ts                      # エクスポート
```

---

**Date**: 2026-01-17
**Phase**: 12
