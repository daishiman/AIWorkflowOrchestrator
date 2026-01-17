# Claude Agent SDK インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

ElectronデスクトップアプリにおけるClaude Agent SDK統合のインターフェース仕様を定義する。
Renderer ProcessからMain ProcessへのIPC通信でAgent機能を提供し、ストリーミング応答とセッション管理を実装する。

**実装ファイル**:

- `packages/shared/src/agent/types.ts` - Agent型定義
- `packages/shared/src/agent/errors.ts` - Agentエラー型
- `packages/shared/src/agent/validation.ts` - Zodバリデーション
- `packages/shared/src/agent/session-manager.ts` - セッション管理
- `packages/shared/src/agent/agent-client.ts` - AgentClientクラス
- `apps/desktop/src/main/agent/agent-handler.ts` - IPCハンドラー
- `apps/desktop/src/renderer/hooks/useAgent.ts` - React Hook

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                   Renderer Process                   │
│  ┌─────────────────────────────────────────────────┐ │
│  │                   React UI                       │ │
│  │          window.agentAPI.query()                │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │ IPC (contextBridge)
┌─────────────────────────┼───────────────────────────┐
│                   Main Process                       │
│  ┌──────────────────────┴──────────────────────────┐ │
│  │              IPC Handler (agent-handler)         │ │
│  └──────────────────────┬──────────────────────────┘ │
│  ┌──────────────────────┴──────────────────────────┐ │
│  │              Agent Client (@repo/shared)         │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │ HTTPS
┌─────────────────────────┴───────────────────────────┐
│                Claude Agent SDK                      │
│             (Anthropic Cloud Service)               │
└─────────────────────────────────────────────────────┘
```

---

## Preload API（window.agentAPI）

### query

クエリを実行してAIからの応答を取得する。

| パラメータ | 型             | 必須 | 説明           |
| ---------- | -------------- | ---- | -------------- |
| `prompt`   | `string`       | ✓    | クエリ文字列   |
| `options`  | `QueryOptions` | -    | オプション設定 |

**QueryOptions**:

| プロパティ     | 型       | 説明                       |
| -------------- | -------- | -------------------------- |
| `sessionId`    | `string` | セッションID（会話継続用） |
| `systemPrompt` | `string` | システムプロンプト         |
| `timeout`      | `number` | タイムアウト (ms)          |

**戻り値**: `Promise<void>` - 完了時にresolve

### abort

実行中のクエリを中断する。

**戻り値**: `void`

### getStatus

Agent SDKの現在のステータスを取得する。

**戻り値**: `Promise<AgentStatus>`

### createSession

新しいセッションを作成する。

**戻り値**: `Promise<CreateSessionResponse>`

### resumeSession

既存のセッションを再開する。

| パラメータ  | 型       | 必須 | 説明         |
| ----------- | -------- | ---- | ------------ |
| `sessionId` | `string` | ✓    | セッションID |

**戻り値**: `Promise<void>`

### destroySession

セッションを破棄する。

| パラメータ  | 型       | 必須 | 説明         |
| ----------- | -------- | ---- | ------------ |
| `sessionId` | `string` | ✓    | セッションID |

**戻り値**: `Promise<void>`

### onMessage

メッセージ受信のコールバックを登録する。

| パラメータ | 型                              | 必須 | 説明             |
| ---------- | ------------------------------- | ---- | ---------------- |
| `callback` | `(message: SDKMessage) => void` | ✓    | コールバック関数 |

**戻り値**: `() => void` - 購読解除関数

---

## 型定義

### AgentStatus

| プロパティ  | 型                | 説明                     |
| ----------- | ----------------- | ------------------------ |
| `status`    | `AgentStatusType` | ステータス種別           |
| `error`     | `string?`         | エラーメッセージ（任意） |
| `timestamp` | `number`          | 更新タイムスタンプ       |

### AgentStatusType

| 値                | 説明       |
| ----------------- | ---------- |
| `not_initialized` | 未初期化   |
| `initializing`    | 初期化中   |
| `initialized`     | 初期化完了 |
| `error`           | エラー状態 |

### SDKMessage

| プロパティ   | 型               | 説明           |
| ------------ | ---------------- | -------------- |
| `id`         | `string`         | メッセージID   |
| `type`       | `SDKMessageType` | メッセージ種別 |
| `content`    | `string`         | メッセージ内容 |
| `timestamp`  | `number`         | タイムスタンプ |
| `isComplete` | `boolean`        | 完了フラグ     |

### SDKMessageType

| 値         | 説明               |
| ---------- | ------------------ |
| `text`     | テキストメッセージ |
| `tool_use` | ツール使用         |
| `error`    | エラーメッセージ   |
| `complete` | 完了通知           |

### CreateSessionResponse

| プロパティ  | 型       | 説明         |
| ----------- | -------- | ------------ |
| `sessionId` | `string` | セッションID |

---

## エラー型

### エラー階層

```
AgentError (基底クラス)
├── AgentInitializationError
├── AgentQueryError
├── AgentTimeoutError
├── AgentAbortedError
├── AgentSessionError
└── AgentValidationError
```

### AgentErrorCode

| コード                  | 説明                   |
| ----------------------- | ---------------------- |
| `INITIALIZATION_FAILED` | SDK初期化失敗          |
| `QUERY_FAILED`          | クエリ実行失敗         |
| `TIMEOUT`               | タイムアウト           |
| `ABORTED`               | ユーザーによる中断     |
| `SESSION_NOT_FOUND`     | セッションが存在しない |
| `SESSION_EXPIRED`       | セッション期限切れ     |
| `VALIDATION_FAILED`     | バリデーション失敗     |

---

## IPC チャンネル

| チャンネル             | 方向            | 説明           |
| ---------------------- | --------------- | -------------- |
| `agent:query`          | Renderer → Main | クエリ実行     |
| `agent:abort`          | Renderer → Main | クエリ中断     |
| `agent:getStatus`      | Renderer → Main | ステータス取得 |
| `agent:createSession`  | Renderer → Main | セッション作成 |
| `agent:resumeSession`  | Renderer → Main | セッション再開 |
| `agent:destroySession` | Renderer → Main | セッション破棄 |
| `agent:message`        | Main → Renderer | メッセージ送信 |

---

## Zodスキーマ

### queryRequestSchema

```typescript
const queryRequestSchema = z.object({
  prompt: z.string().min(1).max(100000),
  options: z
    .object({
      sessionId: z.string().uuid().optional(),
      systemPrompt: z.string().max(10000).optional(),
      timeout: z.number().int().positive().max(300000).optional(),
    })
    .optional(),
});
```

### resumeSessionRequestSchema

```typescript
const resumeSessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
});
```

### destroySessionRequestSchema

```typescript
const destroySessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
});
```

---

## 設定定数

| 定数                  | 値      | 説明                        |
| --------------------- | ------- | --------------------------- |
| `DEFAULT_TIMEOUT`     | `30000` | デフォルトタイムアウト (ms) |
| `MAX_RETRIES`         | `3`     | 最大リトライ回数            |
| `INITIAL_RETRY_DELAY` | `1000`  | 初回リトライ待機 (ms)       |
| `MAX_RETRY_DELAY`     | `4000`  | 最大リトライ待機 (ms)       |
| `MAX_SESSIONS`        | `10`    | 最大セッション数            |

---

## React Hook（useAgent）

### 戻り値

| プロパティ      | 型                                                          | 説明                 |
| --------------- | ----------------------------------------------------------- | -------------------- |
| `messages`      | `SDKMessage[]`                                              | 受信メッセージの配列 |
| `isLoading`     | `boolean`                                                   | クエリ実行中フラグ   |
| `error`         | `string \| null`                                            | エラーメッセージ     |
| `status`        | `AgentStatus \| null`                                       | Agent SDKステータス  |
| `sessionId`     | `string \| null`                                            | 現在のセッションID   |
| `query`         | `(prompt: string, options?: QueryOptions) => Promise<void>` | クエリ実行関数       |
| `abort`         | `() => void`                                                | クエリ中断関数       |
| `clearMessages` | `() => void`                                                | メッセージクリア関数 |
| `resetSession`  | `() => Promise<void>`                                       | セッションリセット   |

### オプション

| プロパティ       | 型        | デフォルト | 説明                   |
| ---------------- | --------- | ---------- | ---------------------- |
| `autoSession`    | `boolean` | `false`    | 自動セッション作成     |
| `defaultTimeout` | `number`  | `30000`    | デフォルトタイムアウト |

---

## セッション管理

### SessionManager

LRUキャッシュベースのセッション管理。

| メソッド                                | 戻り値                 | 説明               |
| --------------------------------------- | ---------------------- | ------------------ |
| `createSession()`                       | `string`               | セッション作成     |
| `getSession(sessionId)`                 | `Session \| undefined` | セッション取得     |
| `resumeSession(sessionId)`              | `void`                 | セッション再開     |
| `destroySession(sessionId)`             | `void`                 | セッション破棄     |
| `addMessageToSession(sessionId, msgId)` | `void`                 | メッセージ追加     |
| `getSessionCount()`                     | `number`               | セッション数取得   |
| `clearAllSessions()`                    | `void`                 | 全セッションクリア |

### Session型

```typescript
interface Session {
  id: string;
  createdAt: number;
  lastAccessedAt: number;
  context: SessionContext;
}

interface SessionContext {
  messageIds: string[];
}
```

---

---

## Skill Dashboard 型定義

Agent Dashboard機能で使用する型定義。Claude Agent SDKとは独立した、スキル管理用の型。

**実装ファイル**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

### Skill型

スキルの基本情報を表す。

| プロパティ    | 型         | 必須 | 説明               |
| ------------- | ---------- | ---- | ------------------ |
| `id`          | `string`   | ✓    | 一意識別子         |
| `name`        | `string`   | ✓    | スキル名           |
| `description` | `string`   | ✓    | 説明文             |
| `path`        | `string`   | ✓    | スキルファイルパス |
| `triggers`    | `string[]` | ✓    | トリガーキーワード |
| `category`    | `string`   | -    | カテゴリ（任意）   |

### SkillDetail型

スキルの詳細情報（Skillを継承）。

| プロパティ      | 型         | 必須 | 説明               |
| --------------- | ---------- | ---- | ------------------ |
| `anchors`       | `Anchor[]` | ✓    | アンカー情報       |
| `workflow`      | `string`   | -    | ワークフロー定義   |
| `bestPractices` | `string[]` | -    | ベストプラクティス |

### Anchor型

スキルのアンカー情報（参照文献と適用方法）。

| プロパティ    | 型       | 必須 | 説明             |
| ------------- | -------- | ---- | ---------------- |
| `source`      | `string` | ✓    | 参照元（書籍等） |
| `application` | `string` | ✓    | 適用方法         |
| `purpose`     | `string` | ✓    | 目的             |

### AgentExecutionStatus型

エージェント実行状態を表す列挙型。

| 値          | 説明   |
| ----------- | ------ |
| `idle`      | 待機中 |
| `executing` | 実行中 |
| `completed` | 完了   |
| `error`     | エラー |
| `aborted`   | 中断   |

### AgentState型

Zustand agentSliceの状態インターフェース。

| プロパティ           | 型                     | 説明               |
| -------------------- | ---------------------- | ------------------ |
| `skills`             | `Skill[]`              | スキル一覧         |
| `selectedSkill`      | `Skill \| null`        | 選択中のスキル     |
| `skillFilter`        | `string`               | フィルター文字列   |
| `skillCategory`      | `string \| null`       | カテゴリフィルター |
| `executionStatus`    | `AgentExecutionStatus` | 実行状態           |
| `currentExecutionId` | `string \| null`       | 実行ID             |
| `executionOutput`    | `string[]`             | 実行出力           |
| `isLoading`          | `boolean`              | ローディング状態   |
| `error`              | `string \| null`       | エラーメッセージ   |

### AgentActions型

Zustand agentSliceのアクションインターフェース。

| アクション              | 引数                           | 説明             |
| ----------------------- | ------------------------------ | ---------------- |
| `setSkills`             | `skills: Skill[]`              | スキル一覧設定   |
| `selectSkill`           | `skill: Skill \| null`         | スキル選択       |
| `setSkillFilter`        | `filter: string`               | フィルター設定   |
| `setSkillCategory`      | `category: string \| null`     | カテゴリ設定     |
| `setExecutionStatus`    | `status: AgentExecutionStatus` | 実行状態設定     |
| `setCurrentExecutionId` | `id: string \| null`           | 実行ID設定       |
| `appendOutput`          | `output: string`               | 出力追加         |
| `clearExecution`        | -                              | 実行クリア       |
| `setLoading`            | `isLoading: boolean`           | ローディング設定 |
| `setError`              | `error: string \| null`        | エラー設定       |
| `resetAgentState`       | -                              | 状態リセット     |

---

## ModifierSkill（スライド逆同期機能）

### 概要

スライドプレゼンテーション機能において、Reveal.js HTML（index.html）の変更をstructure.md（構造定義ファイル）に逆同期する機能。Claude Agent SDKを活用してAI駆動のHTML解析と構造抽出を実現する。

**実装ファイル**:

- `apps/desktop/src/main/slide/modifier-skill.ts` - ModifierSkill実行ロジック
- `apps/desktop/src/main/slide/agent-client.ts` - Agent SDK通信クライアント
- `apps/desktop/src/main/slide/skill-executor.ts` - スキル実行オーケストレーション
- `apps/desktop/src/main/slide/sync-manager.ts` - 同期管理（順方向・逆方向）
- `apps/desktop/src/main/slide/file-watcher.ts` - ファイル監視
- `packages/shared/src/slide/types.ts` - 共通型定義

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                   File System                                │
│   index.html (Reveal.js)    ←→    structure.md (Markdown)   │
└───────────────┬─────────────────────────────┬───────────────┘
                │ 変更検知                      │ 更新
┌───────────────┴─────────────────────────────┴───────────────┐
│                   FileWatcher (chokidar)                     │
│              onHtmlChange / onStructureChange               │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────────┐
│                   SyncManager                                │
│           forwardSync() / reverseSync()                     │
│           changeContextMap（無限ループ防止）                 │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────────┐
│                   SkillExecutor                              │
│              executeModifierSkill()                          │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────────┐
│                   ModifierSkill                              │
│              execute() → prompt生成 → Agent呼び出し          │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────────┐
│                   AgentClient                                │
│              executeSkill() → Claude Agent SDK              │
└─────────────────────────────────────────────────────────────┘
```

### 型定義

```typescript
// ModifierSkill入力
interface ModifierSkillInput {
  html: string; // Reveal.js HTML
  currentStructure: string; // 現在のstructure.md
  projectPath: string; // プロジェクトパス
}

// ModifierSkill出力
interface ModifierSkillOutput {
  updatedStructure: string; // 更新後のstructure.md
  changes: StructureChange[];
}

// 変更情報
interface StructureChange {
  type: "add" | "remove" | "modify";
  section: string;
  description: string;
}

// 同期状態
type SyncStatus = "idle" | "syncing" | "synced" | "error";

// 同期方向
type SyncDirection = "forward" | "reverse";
```

### 無限ループ防止（changeContextMap）

双方向同期における無限ループを防止するためのマーキング機構。

```typescript
interface ChangeContext {
  direction: SyncDirection;
  timestamp: number;
  filePath: string;
}

// TTL: 1000ms
// 同じファイルへの変更を短時間で検知した場合、
// 逆方向の同期による変更として判定しスキップ
```

### IPC チャンネル（スライド同期）

| チャンネル            | 方向            | 説明               |
| --------------------- | --------------- | ------------------ |
| `slide:sync-status`   | Main → Renderer | 同期状態通知       |
| `slide:sync-progress` | Main → Renderer | 同期進捗通知       |
| `slide:reverse-sync`  | Renderer → Main | 逆同期手動トリガー |
| `slide:sync-error`    | Main → Renderer | 同期エラー通知     |

### 設定定数

| 定数                 | 値      | 説明                          |
| -------------------- | ------- | ----------------------------- |
| `SYNC_TIMEOUT`       | `30000` | 同期処理タイムアウト (ms)     |
| `CHANGE_CONTEXT_TTL` | `1000`  | 変更コンテキスト有効期間 (ms) |
| `DEBOUNCE_DELAY`     | `300`   | ファイル変更debounce (ms)     |
| `AWAIT_WRITE_FINISH` | `300`   | 書き込み完了待機 (ms)         |

### 実装状態

| コンポーネント | 状態                 | 備考                           |
| -------------- | -------------------- | ------------------------------ |
| ModifierSkill  | シミュレーション実装 | Agent SDK統合後に実SDK呼び出し |
| AgentClient    | シミュレーション実装 | Agent SDK統合後に実API連携     |
| SyncManager    | 完了                 | 双方向同期ロジック実装済み     |
| FileWatcher    | 完了                 | chokidarベース監視実装済み     |
| SkillExecutor  | 完了                 | オーケストレーション実装済み   |

### 関連ドキュメント（スライド逆同期）

| ドキュメント | パス                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| 実装ガイド   | `docs/30-workflows/slide-reverse-sync/outputs/phase-12/implementation-guide.md` |
| API仕様      | `docs/30-workflows/slide-reverse-sync/outputs/phase-2/api-specification.md`     |
| IPC設計      | `docs/30-workflows/slide-reverse-sync/outputs/phase-2/ipc-design.md`            |

---

## 関連ドキュメント

| ドキュメント              | パス                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------- |
| 実装ガイド                | `docs/30-workflows/agent-sdk-integration/outputs/phase-12/implementation-guide.md`      |
| APIリファレンス           | `docs/30-workflows/agent-sdk-integration/outputs/phase-12/api-reference.md`             |
| Claude Agent SDKスキル    | `.claude/skills/claude-agent-sdk/SKILL.md`                                              |
| LLMインターフェース       | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                   |
| Skill Dashboard実装ガイド | `docs/30-workflows/agent-dashboard-foundation/outputs/phase-12/implementation-guide.md` |
