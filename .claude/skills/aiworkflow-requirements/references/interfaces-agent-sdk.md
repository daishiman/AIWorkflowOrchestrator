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

## 依存関係解決

### 必須: packages/shared への SDK 依存宣言

Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) を使用する場合、**import するパッケージ自身の `package.json` に依存を宣言する必要があります**。

**packages/shared/package.json**:

```json
{
  "name": "@repo/shared",
  "dependencies": {
    "zod": "^3.23.8",
    "@anthropic-ai/claude-agent-sdk": "^0.2.5" // 必須
  }
}
```

### なぜ必要か

pnpm の厳格モード（`node-linker=isolated`）では、`package.json` に宣言されていない依存へのアクセスがブロックされます。

| シナリオ                              | 結果                         |
| ------------------------------------- | ---------------------------- |
| `apps/desktop` のみに SDK 依存を宣言  | テストPASS、ランタイムエラー |
| `packages/shared` にも SDK 依存を宣言 | テストPASS、ランタイムPASS   |

### トラブルシューティング

**エラー**: `ERR_MODULE_NOT_FOUND: Cannot find package '@anthropic-ai/claude-agent-sdk'`

**原因**: SDK を import しているパッケージ（`packages/shared`）に依存宣言がない

**解決策**:

```bash
# packages/shared に SDK 依存を追加
pnpm --filter @repo/shared add @anthropic-ai/claude-agent-sdk

# ロックファイル更新
pnpm install
```

> 詳細: architecture-monorepo.md「pnpm 依存解決ルール」、technology-devops.md「pnpm 依存解決ベストプラクティス」

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

## Skill Dashboard 型定義（AGENT-002）

Agent Dashboard機能で使用する型定義。Claude Agent SDKとは独立した、スキル管理用の型。
AGENT-002タスクで実装されたスキル管理UI機能の完全な仕様を定義する。

### 実装ファイル

| ファイル                                                | 説明                       |
| ------------------------------------------------------- | -------------------------- |
| `packages/shared/src/types/skill.ts`                    | Skill型定義（共有）        |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`  | Zustand状態管理            |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`   | メインビュー               |
| `apps/desktop/src/renderer/views/AgentView/components/` | UIコンポーネント群         |
| `apps/desktop/src/main/skill/skill-handler.ts`          | Main Process IPCハンドラー |
| `apps/desktop/src/preload/skillApi.ts`                  | Preload API                |

---

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    AgentView                             │ │
│  │  ┌─────────────┬─────────────┬─────────────────────────┐ │ │
│  │  │ SkillSearch │ CategoryFil │      SkillList          │ │ │
│  │  │     Bar     │    ter      │  ┌─────────────────┐   │ │ │
│  │  └─────────────┴─────────────┤  │   SkillCard     │   │ │ │
│  │                               │  │   SkillCard     │   │ │ │
│  │  ┌─────────────────────────┐ │  │   SkillCard     │   │ │ │
│  │  │   SkillDetailPanel      │ │  └─────────────────┘   │ │ │
│  │  │                         │ └─────────────────────────┘ │ │
│  │  └─────────────────────────┘                             │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │             SkillImportDialog (Modal)               │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────┬──────────────────────────────┘ │
│                              │ window.skillAPI                │
└──────────────────────────────┼───────────────────────────────┘
                               │ IPC (contextBridge)
┌──────────────────────────────┼───────────────────────────────┐
│                        Main Process                           │
│  ┌───────────────────────────┴────────────────────────────┐  │
│  │                    skill-handler.ts                     │  │
│  │              (IPC Handler for skill:* channels)        │  │
│  └───────────────────────────┬────────────────────────────┘  │
│  ┌───────────────────────────┴────────────────────────────┐  │
│  │                    skill-service.ts                     │  │
│  │              (スキルスキャン・解析ロジック)             │  │
│  └───────────────────────────┬────────────────────────────┘  │
└──────────────────────────────┼───────────────────────────────┘
                               │ File System
┌──────────────────────────────┴───────────────────────────────┐
│                   .claude/skills/**/*.md                      │
│                   (SKILL.md、agents/*.md)                     │
└───────────────────────────────────────────────────────────────┘
```

---

### 型定義

#### Skill型

スキルの基本情報を表す。

| プロパティ    | 型              | 必須 | 説明               |
| ------------- | --------------- | ---- | ------------------ |
| `id`          | `string`        | ✓    | 一意識別子         |
| `name`        | `string`        | ✓    | スキル名           |
| `slug`        | `string`        | ✓    | URLスラッグ        |
| `description` | `string`        | ✓    | 説明文             |
| `path`        | `string`        | ✓    | スキルファイルパス |
| `triggers`    | `string[]`      | ✓    | トリガーキーワード |
| `anchors`     | `Anchor[]`      | ✓    | アンカー情報       |
| `category`    | `SkillCategory` | -    | カテゴリ（任意）   |

```typescript
// packages/shared/src/types/skill.ts
export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  category?: SkillCategory;
}
```

#### Anchor型

スキルのアンカー情報（参照文献と適用方法）。

| プロパティ    | 型       | 必須 | 説明             |
| ------------- | -------- | ---- | ---------------- |
| `source`      | `string` | ✓    | 参照元（書籍等） |
| `application` | `string` | ✓    | 適用方法         |
| `purpose`     | `string` | ✓    | 目的             |

```typescript
export interface Anchor {
  source: string;
  application: string;
  purpose: string;
}
```

#### SkillCategory型

スキルのカテゴリを表す列挙型。

| 値              | 説明             |
| --------------- | ---------------- |
| `development`   | 開発関連         |
| `testing`       | テスト関連       |
| `documentation` | ドキュメント関連 |
| `workflow`      | ワークフロー関連 |
| `other`         | その他           |

```typescript
export type SkillCategory =
  | "development"
  | "testing"
  | "documentation"
  | "workflow"
  | "other";
```

#### AgentExecutionStatus型

エージェント実行状態を表す列挙型。

| 値          | 説明   |
| ----------- | ------ |
| `idle`      | 待機中 |
| `executing` | 実行中 |
| `completed` | 完了   |
| `error`     | エラー |
| `aborted`   | 中断   |

---

### Zustand状態管理（agentSlice）

Zustand Sliceパターンで実装された状態管理。

#### AgentState型

| プロパティ           | 型                      | 説明                         |
| -------------------- | ----------------------- | ---------------------------- |
| `skills`             | `Skill[]`               | インポート済みスキル一覧     |
| `availableSkills`    | `Skill[]`               | 利用可能なスキル一覧         |
| `importedSkillIds`   | `string[]`              | インポート済みスキルID       |
| `selectedSkill`      | `Skill \| null`         | 選択中のスキル               |
| `skillFilter`        | `string`                | 検索フィルター文字列         |
| `skillCategory`      | `SkillCategory \| null` | カテゴリフィルター           |
| `isImportDialogOpen` | `boolean`               | インポートダイアログ表示状態 |
| `toastMessage`       | `ToastMessage \| null`  | トースト通知                 |
| `executionStatus`    | `AgentExecutionStatus`  | 実行状態                     |
| `currentExecutionId` | `string \| null`        | 実行ID                       |
| `executionOutput`    | `string[]`              | 実行出力                     |
| `isLoading`          | `boolean`               | ローディング状態             |
| `error`              | `string \| null`        | エラーメッセージ             |

#### AgentActions型

| アクション              | 引数                              | 説明                   |
| ----------------------- | --------------------------------- | ---------------------- |
| `setSkills`             | `skills: Skill[]`                 | スキル一覧設定         |
| `setAvailableSkills`    | `skills: Skill[]`                 | 利用可能スキル設定     |
| `setImportedSkillIds`   | `ids: string[]`                   | インポート済みID設定   |
| `selectSkill`           | `skill: Skill \| null`            | スキル選択             |
| `setSkillFilter`        | `filter: string`                  | フィルター設定         |
| `setSkillCategory`      | `category: SkillCategory \| null` | カテゴリ設定           |
| `openImportDialog`      | -                                 | インポートダイアログ開 |
| `closeImportDialog`     | -                                 | インポートダイアログ閉 |
| `showToast`             | `message: ToastMessage`           | トースト表示           |
| `clearToast`            | -                                 | トーストクリア         |
| `setExecutionStatus`    | `status: AgentExecutionStatus`    | 実行状態設定           |
| `setCurrentExecutionId` | `id: string \| null`              | 実行ID設定             |
| `appendOutput`          | `output: string`                  | 出力追加               |
| `clearExecution`        | -                                 | 実行クリア             |
| `setLoading`            | `isLoading: boolean`              | ローディング設定       |
| `setError`              | `error: string \| null`           | エラー設定             |
| `resetAgentState`       | -                                 | 状態リセット           |

---

### IPC チャンネル（スキル管理）

| チャンネル             | 方向            | 説明                     | 戻り値                            |
| ---------------------- | --------------- | ------------------------ | --------------------------------- |
| `skill:list-imported`  | Renderer → Main | インポート済みスキル取得 | `OperationResult<Skill[]>`        |
| `skill:list-available` | Renderer → Main | 利用可能スキル取得       | `OperationResult<Skill[]>`        |
| `skill:import`         | Renderer → Main | スキルインポート         | `OperationResult<void>`           |
| `skill:remove`         | Renderer → Main | スキル削除               | `OperationResult<void>`           |
| `skill:get-detail`     | Renderer → Main | スキル詳細取得           | `OperationResult<Skill>`          |
| `skill:execute`        | Renderer → Main | スキル実行               | `OperationResult<SkillRunResult>` |

#### skill:execute リクエスト形式

```typescript
interface SkillExecuteRequest {
  skillId: string; // 実行するスキルのID
  params?: Record<string, unknown>; // オプションパラメータ（将来拡張用）
}
```

#### OperationResult型

スキル管理APIの統一戻り値型。成功/失敗を明確に区別する。

```typescript
// packages/shared/src/types/skill.ts
interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Note**: 全スキル管理IPCチャンネルで`OperationResult`型を使用。

#### SkillRunResult型

スキル実行の結果を表す型。

| プロパティ    | 型                      | 必須 | 説明                       |
| ------------- | ----------------------- | ---- | -------------------------- |
| `executionId` | `string`                | ✓    | 実行ID（UUID）             |
| `status`      | `'success' \| 'failed'` | ✓    | 実行ステータス             |
| `output`      | `string`                | -    | 実行出力（成功時）         |
| `error`       | `string`                | -    | エラーメッセージ（失敗時） |
| `startedAt`   | `Date`                  | ✓    | 実行開始時刻               |
| `completedAt` | `Date`                  | ✓    | 実行完了時刻               |

```typescript
// packages/shared/src/types/skill.ts
export interface SkillRunResult {
  executionId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}
```

---

### Preload API（window.skillAPI）

#### listImported

インポート済みのスキル一覧を取得する。

**戻り値**: `Promise<OperationResult<Skill[]>>`

#### listAvailable

利用可能なスキル一覧を取得する。

**戻り値**: `Promise<OperationResult<Skill[]>>`

#### import

スキルをインポートする。

| パラメータ | 型         | 必須 | 説明           |
| ---------- | ---------- | ---- | -------------- |
| `skillIds` | `string[]` | ✓    | スキルIDの配列 |

**戻り値**: `Promise<OperationResult<void>>`

#### remove

スキルを削除する。

| パラメータ | 型       | 必須 | 説明     |
| ---------- | -------- | ---- | -------- |
| `skillId`  | `string` | ✓    | スキルID |

**戻り値**: `Promise<OperationResult<void>>`

#### getDetail

スキルの詳細情報を取得する。

| パラメータ | 型       | 必須 | 説明     |
| ---------- | -------- | ---- | -------- |
| `skillId`  | `string` | ✓    | スキルID |

**戻り値**: `Promise<OperationResult<Skill>>`

#### execute

スキルを実行する。

| パラメータ | 型                        | 必須 | 説明                               |
| ---------- | ------------------------- | ---- | ---------------------------------- |
| `skillId`  | `string`                  | ✓    | 実行するスキルのID                 |
| `params`   | `Record<string, unknown>` | -    | オプションパラメータ（将来拡張用） |

**戻り値**: `Promise<OperationResult<SkillRunResult>>`

**エラーケース**:

| エラーメッセージ                   | 原因                           |
| ---------------------------------- | ------------------------------ |
| `skillId must be a string`         | skillIdが文字列でない/空文字   |
| `スキルが見つかりません`           | 指定されたskillIdが存在しない  |
| `スキルがインポートされていません` | スキルがインポートされていない |

**使用例**:

```typescript
const result = await skillAPI.execute("skill-id-123");
if (result.success) {
  console.log("実行完了:", result.data.output);
} else {
  console.error("実行失敗:", result.error);
}
```

**実装ファイル**:

- Preload API: `apps/desktop/src/renderer/preload/index.ts`
- IPC Handler: `apps/desktop/src/main/ipc/skillHandlers.ts`
- Service: `apps/desktop/src/main/services/skill/SkillService.ts`

**セキュリティ**:

- IPCハンドラーで `validateIpcSender` によるsender検証を実施
- skillIdの入力バリデーション（空文字・非文字列のチェック）

---

### UIコンポーネント

#### コンポーネント階層

```
AgentView
├── Header (h1 + description)
├── SkillSearchBar
├── SkillCategoryFilter
├── SkillList
│   └── SkillCard (複数)
├── SkillDetailPanel (選択時)
├── SkillImportDialog (ダイアログ)
└── Toast (通知)
```

#### コンポーネント仕様

| コンポーネント        | ファイル                             | 責務                   |
| --------------------- | ------------------------------------ | ---------------------- |
| `AgentView`           | `views/AgentView/index.tsx`          | メインビュー、状態管理 |
| `SkillList`           | `components/SkillList.tsx`           | スキル一覧表示         |
| `SkillCard`           | `components/SkillCard.tsx`           | スキルカード表示       |
| `SkillDetailPanel`    | `components/SkillDetailPanel.tsx`    | スキル詳細パネル       |
| `SkillImportDialog`   | `components/SkillImportDialog.tsx`   | インポートダイアログ   |
| `SkillSearchBar`      | `components/SkillSearchBar.tsx`      | 検索バー               |
| `SkillCategoryFilter` | `components/SkillCategoryFilter.tsx` | カテゴリフィルター     |

#### アクセシビリティ要件

| 要件               | 実装                               |
| ------------------ | ---------------------------------- |
| キーボードナビ     | Tab/Enter/Escで操作可能            |
| スクリーンリーダー | aria-label、role属性設定           |
| フォーカス管理     | ダイアログ開閉時のフォーカス制御   |
| セマンティック     | header/main/aside/regionロール使用 |

---

### 統合テスト戦略

#### テストカテゴリ

| カテゴリ               | 検証内容                                       |
| ---------------------- | ---------------------------------------------- |
| API接続テスト          | skill:list, skill:import等のエンドポイント疎通 |
| データフローテスト     | UI操作→Store→IPC→Main→IPC→Store→UIの往復       |
| エラーハンドリング     | API障害時のトースト表示・リトライ機能          |
| 状態同期テスト         | Zustand状態とUI表示の同期                      |
| レスポンシブ動作テスト | 画面サイズによるレイアウト変更                 |

#### テストファイル

| ファイル                               | テスト種別     |
| -------------------------------------- | -------------- |
| `AgentView.test.tsx`                   | ユニットテスト |
| `SkillManagement.integration.test.tsx` | 統合テスト     |

#### 検証シナリオ

1. **マウント時にスキル取得**: listImported API呼び出し確認
2. **検索・フィルター連携**: 検索バー→Store→UI表示更新
3. **インポートフロー**: ダイアログ→選択→API→一覧更新
4. **削除フロー**: 選択→確認→API→一覧更新
5. **エラーリトライ**: API失敗→エラー表示→再試行→成功

#### 統合テストファイル詳細

| ファイル                                 | テスト数 | テスト対象                    |
| ---------------------------------------- | -------- | ----------------------------- |
| `SkillImportManager.integration.test.ts` | 15       | ストア永続化・スキルID管理    |
| `skillHandlers.integration.test.ts`      | 8        | IPCハンドラ・Main Process連携 |

---

### SkillImportManager 仕様

#### 概要

インポートされたスキルIDを管理し、`electron-store`経由で永続化するサービスクラス。

**実装ファイル**:

- Service: `apps/desktop/src/main/services/skill/SkillImportManager.ts`
- Test: `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.integration.test.ts`

#### SkillStore インターフェース

```typescript
/**
 * electron-store互換のストアインターフェース
 * テスト時にモック可能な抽象化レイヤー
 */
interface SkillStore {
  get(key: string, defaultValue: string[]): string[];
  set(key: string, value: string[]): void;
  path?: string; // デバッグログ用（オプション）
}
```

#### デバッグログ仕様

| タイミング       | ログ内容                                                       | 目的               |
| ---------------- | -------------------------------------------------------------- | ------------------ |
| コンストラクタ   | `[SkillImportManager] Initialized with store path: ${path}`    | ストアパス確認     |
| addImportedId    | `[SkillImportManager] Adding skill ID: ${skillId}`             | インポート操作追跡 |
| removeImportedId | `[SkillImportManager] Removing skill ID: ${skillId}`           | 削除操作追跡       |
| getImportedIds   | `[SkillImportManager] Current imported IDs: ${ids.join(', ')}` | 状態確認           |

#### API

| メソッド           | 引数              | 戻り値     | 説明                               |
| ------------------ | ----------------- | ---------- | ---------------------------------- |
| `addImportedId`    | `skillId: string` | `void`     | スキルIDを追加（重複チェック付き） |
| `removeImportedId` | `skillId: string` | `void`     | スキルIDを削除                     |
| `getImportedIds`   | -                 | `string[]` | 全スキルIDを取得                   |
| `hasImportedId`    | `skillId: string` | `boolean`  | 存在チェック                       |

#### ストレージ仕様

| 項目         | 値                                                        |
| ------------ | --------------------------------------------------------- |
| ストアキー   | `importedSkillIds`                                        |
| ファイルパス | `~/Library/Application Support/@repo/desktop/skills.json` |
| データ形式   | `{ "importedSkillIds": ["skill-1", "skill-2", ...] }`     |

---

## SkillImportStore（TASK-2B）

### 概要

インポートしたスキルの情報を永続化するストアサービス。electron-storeを使用してアプリケーション再起動後もデータを保持する。SkillImportManagerとは異なり、スキルメタデータ・設定・権限・キャッシュを包括的に管理する。

**実装ファイル**:

- Store: `apps/desktop/src/main/settings/skillImportStore.ts`
- Test: `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts`

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                  Renderer Process                           │
│  (React UI)                                                 │
└─────────────────────────────────────────────────────────────┘
                         │ IPC (TASK-2C)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Main Process                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            IPC Handler (TASK-2C)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SkillImportStore                        │   │
│  │  - getImported() / addImport() / removeImport()      │   │
│  │  - getSettings() / updateSettings()                  │   │
│  │  - rememberPermission() / getRememberedPermission()  │   │
│  │  - setCache() / getCache() / invalidateCache()       │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              electron-store                          │   │
│  │  ~/.aiworkflow/config/skill-imports.json             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### スキーマ定義

```typescript
interface SkillStoreSchema {
  schemaVersion: number;
  importedSkills: Record<string, ImportedSkillData>;
  skillSettings: Record<string, SkillSettings>;
  lastScanAt?: string;
  skillCache?: Record<string, SkillCacheEntry>;
}

interface ImportedSkillData {
  name: string;
  importedAt: string; // ISO 8601
  status: "active" | "disabled";
  lastUsedAt?: string;
}

interface SkillSettings {
  autoApproveReadOnly: boolean;
  rememberPermissions: boolean;
  rememberedPermissions: Record<string, "allow" | "deny">;
}

interface SkillCacheEntry {
  metadata: SkillMetadata;
  cachedAt: string;
  ttl: number;
}
```

### API リファレンス

#### インポート管理

| メソッド       | シグネチャ                     | 説明                   |
| -------------- | ------------------------------ | ---------------------- |
| getImported    | `(): ImportedSkillData[]`      | 全インポート済みスキル |
| addImport      | `(skillName: string): void`    | スキルをインポート     |
| removeImport   | `(skillName: string): void`    | スキルを削除（冪等）   |
| exists         | `(skillName: string): boolean` | 存在確認               |
| updateLastUsed | `(skillName: string): void`    | 最終使用日時を更新     |

#### 設定管理

| メソッド       | シグネチャ                                          | 説明     |
| -------------- | --------------------------------------------------- | -------- |
| getSettings    | `(skillName: string): SkillSettings`                | 設定取得 |
| updateSettings | `(skillName: string, settings: Partial<...>): void` | 設定更新 |

#### 権限管理

| メソッド                | シグネチャ                                              | 説明       |
| ----------------------- | ------------------------------------------------------- | ---------- |
| rememberPermission      | `(skillName, toolName, decision): void`                 | 権限を記憶 |
| getRememberedPermission | `(skillName, toolName): "allow" \| "deny" \| undefined` | 権限を取得 |

#### キャッシュ管理

| メソッド        | シグネチャ                                      | 説明             |
| --------------- | ----------------------------------------------- | ---------------- |
| setCache        | `(skillName: string, metadata: ...): void`      | キャッシュ設定   |
| getCache        | `(skillName: string): SkillCacheEntry \| undef` | キャッシュ取得   |
| invalidateCache | `(skillName?: string): void`                    | キャッシュ無効化 |

#### ユーティリティ

| メソッド           | シグネチャ                   | 説明                       |
| ------------------ | ---------------------------- | -------------------------- |
| reset              | `(): void`                   | データを初期状態にリセット |
| migrateFromVersion | `(version: number): boolean` | スキーママイグレーション   |

### ストレージ仕様

| 項目             | 値                                       |
| ---------------- | ---------------------------------------- |
| ストア名         | `skill-imports`                          |
| ファイルパス     | `~/.aiworkflow/config/skill-imports.json` |
| スキーマバージョン | 1                                       |
| 暗号化           | なし（機密データを含まない）             |

### バリデーション

```typescript
// スキル名バリデーション（SEC-01対応）
const SKILL_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

function validateSkillName(name: string): void {
  if (!SKILL_NAME_PATTERN.test(name)) {
    // エラーメッセージには最初の20文字のみ表示
    const truncated = name.length > 20 ? name.slice(0, 20) + "..." : name;
    throw new SkillStoreError(
      SKILL_STORE_ERRORS.INVALID_SKILL_NAME,
      `Invalid skill name: ${truncated}`
    );
  }
}
```

### エラーコード

| コード              | 説明                   |
| ------------------- | ---------------------- |
| INVALID_SKILL_NAME  | スキル名が不正         |
| SKILL_NOT_FOUND     | スキルが見つからない   |
| STORE_ACCESS_ERROR  | ストアアクセスエラー   |
| MIGRATION_ERROR     | マイグレーション失敗   |

### セキュリティ（SEC-01）

| 対策           | 実装                               |
| -------------- | ---------------------------------- |
| 入力値切り捨て | エラーメッセージは最初の20文字のみ |
| ホワイトリスト | スキル名は英数字・_・-のみ許可     |
| パス制限       | 設定ディレクトリ外へのアクセス不可 |

### デフォルト設定

```typescript
const DEFAULT_SKILL_SETTINGS: SkillSettings = {
  autoApproveReadOnly: false,
  rememberPermissions: true,
  rememberedPermissions: {},
};

const DEFAULT_CACHE_TTL = 3600000; // 1時間
```

### 使用例

```typescript
import { getSkillImportStore } from "./skillImportStore";

// シングルトンインスタンスを取得
const store = getSkillImportStore();

// スキルをインポート
store.addImport("my-skill");

// 設定を更新
store.updateSettings("my-skill", {
  autoApproveReadOnly: false,
});

// 権限を記憶
store.rememberPermission("my-skill", "Read", "allow");

// 記憶した権限を確認
const decision = store.getRememberedPermission("my-skill", "Read");
if (decision === "allow") {
  // 自動承認
}
```

### テスト仕様

| カテゴリ           | テスト数 | カバレッジ |
| ------------------ | -------- | ---------- |
| インポート管理     | 11       | 100%       |
| 設定管理           | 8        | 100%       |
| 権限管理           | 15       | 100%       |
| キャッシュ管理     | 14       | 100%       |
| マイグレーション   | 11       | 100%       |
| **合計**           | **59**   | **~95%**   |

### 関連ドキュメント

| ドキュメント   | パス                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| 実装ガイド     | `docs/30-workflows/task-2b-skill-import-store/outputs/phase-12/implementation-guide.md` |
| 要件仕様書     | `docs/30-workflows/task-2b-skill-import-store/outputs/phase-1/requirements-specification.md` |
| API設計書      | `docs/30-workflows/task-2b-skill-import-store/outputs/phase-2/api-design.md` |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts`          |

### SkillImportManager との違い

| 観点         | SkillImportManager                     | SkillImportStore                           |
| ------------ | -------------------------------------- | ------------------------------------------ |
| 責務         | スキルID一覧のみ管理                   | メタデータ・設定・権限・キャッシュを包括管理 |
| 実装パス     | `services/skill/`                      | `settings/`                                |
| データ構造   | `string[]`（ID配列）                   | `Record<string, ImportedSkillData>`        |
| 設定管理     | なし                                   | あり（SkillSettings）                      |
| 権限記憶     | なし                                   | あり（rememberedPermissions）              |
| キャッシュ   | なし                                   | あり（SkillCacheEntry）                    |
| 後続タスク   | -                                      | TASK-2C（IPC Handler）で公開               |

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

| コンポーネント | 状態 | 備考                                                   |
| -------------- | ---- | ------------------------------------------------------ |
| ModifierSkill  | 完了 | Claude Agent SDK統合済み（実SDK呼び出し）              |
| AgentClient    | 完了 | Anthropic SDK直接呼び出し（@anthropic-ai/sdk使用）     |
| SkillExecutor  | 完了 | スキルフェーズマッピング・進捗コールバック・キャンセル |
| SyncManager    | 完了 | 双方向同期ロジック実装済み                             |
| FileWatcher    | 完了 | chokidarベース監視実装済み                             |

#### SDK統合詳細（2026-01-17更新）

| 項目                   | 内容                        |
| ---------------------- | --------------------------- |
| Model                  | claude-sonnet-4-20250514    |
| Max Tokens             | 8192                        |
| Timeout                | 30000ms                     |
| APIキー管理            | Electron safeStorage暗号化  |
| 環境変数フォールバック | ANTHROPIC_API_KEY（開発用） |

#### スキルフェーズマッピング

| SkillPhase | スキル名            |
| ---------- | ------------------- |
| hearing    | hearing-facilitator |
| structure  | structure-designer  |
| html       | html-generator      |
| modifier   | slide-modifier      |

### 関連ドキュメント（スライド逆同期）

| ドキュメント | パス                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| 実装ガイド   | `docs/30-workflows/slide-reverse-sync/outputs/phase-12/implementation-guide.md` |
| API仕様      | `docs/30-workflows/slide-reverse-sync/outputs/phase-2/api-specification.md`     |
| IPC設計      | `docs/30-workflows/slide-reverse-sync/outputs/phase-2/ipc-design.md`            |

---

## Agent Execution UI 型定義（AGENT-004）

Agent Execution UI機能で使用する型定義。エージェント実行画面でのチャットインターフェース、ストリーミング出力、権限確認ダイアログを提供する。
AGENT-004タスクで実装されたAgent実行UI機能の完全な仕様を定義する。

### 実装ファイル

| ファイル                                                                 | 説明                                   |
| ------------------------------------------------------------------------ | -------------------------------------- |
| `packages/shared/src/types/agent.ts`                                     | Agent Execution UI型定義（共有）       |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                   | Zustand状態管理（Agent Execution拡張） |
| `apps/desktop/src/renderer/views/AgentExecutionView/`                    | メインビュー                           |
| `apps/desktop/src/renderer/components/organisms/PermissionDialog/`       | 権限確認ダイアログ                     |
| `apps/desktop/src/renderer/components/organisms/AgentChatInterface/`     | チャットインターフェース               |
| `apps/desktop/src/renderer/components/molecules/AgentMessageInput/`      | メッセージ入力                         |
| `apps/desktop/src/renderer/components/molecules/AgentExecutionControls/` | 実行制御ボタン                         |
| `apps/desktop/src/renderer/utils/agentApi.ts`                            | IPCヘルパー関数                        |
| `apps/desktop/src/preload/channels.ts`                                   | IPCチャンネル定義                      |
| `apps/desktop/src/preload/index.ts`                                      | Preload API                            |

---

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 AgentExecutionView                       │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │              AgentChatInterface                      │ │ │
│  │  │  ┌─────────────────────────────────────────────────┐ │ │ │
│  │  │  │              AgentOutputStream                   │ │ │ │
│  │  │  │          (ストリーミング出力表示)                 │ │ │ │
│  │  │  └─────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │            AgentExecutionControls                    │ │ │
│  │  │        [キャンセル] [クリア]                          │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │              AgentMessageInput                       │ │ │
│  │  │      [メッセージ入力...           ] [送信]           │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │         PermissionDialog (モーダル)                  │ │ │
│  │  │    「Editツールを実行してもいいですか？」            │ │ │
│  │  │         [許可] [拒否] [常に許可]                     │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────┬──────────────────────────────┘ │
│                              │ window.agentAPI                │
└──────────────────────────────┼───────────────────────────────┘
                               │ IPC (contextBridge)
┌──────────────────────────────┼───────────────────────────────┐
│                        Main Process                           │
│  ┌───────────────────────────┴────────────────────────────┐  │
│  │                 Agent IPC Handlers                      │  │
│  │           (agent:start, agent:stop, etc.)              │  │
│  └───────────────────────────┬────────────────────────────┘  │
│  ┌───────────────────────────┴────────────────────────────┐  │
│  │              Claude Agent SDK Integration               │  │
│  │              (AGENT-005で完全統合予定)                  │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

### 型定義

#### AgentExecutionStatus型

エージェント実行の7つの状態を表す列挙型。

| 値                    | 説明                           |
| --------------------- | ------------------------------ |
| `idle`                | 待機中（初期状態）             |
| `executing`           | 実行中（クエリ処理中）         |
| `streaming`           | ストリーミング中（応答受信中） |
| `awaiting_permission` | 権限待ち（ユーザー確認待ち）   |
| `completed`           | 完了（正常終了）               |
| `cancelled`           | キャンセル済（ユーザー中断）   |
| `error`               | エラー（異常終了）             |

```typescript
// packages/shared/src/types/agent.ts
export type AgentExecutionStatus =
  | "idle"
  | "executing"
  | "streaming"
  | "awaiting_permission"
  | "completed"
  | "cancelled"
  | "error";
```

#### AgentMessage型

チャットインターフェースに表示されるメッセージ。

| プロパティ    | 型                                  | 必須 | 説明                   |
| ------------- | ----------------------------------- | ---- | ---------------------- |
| `id`          | `string`                            | ✓    | メッセージの一意識別子 |
| `role`        | `'user' \| 'assistant' \| 'system'` | ✓    | メッセージの送信者     |
| `content`     | `string`                            | ✓    | メッセージ内容         |
| `timestamp`   | `Date`                              | ✓    | 送信日時               |
| `isStreaming` | `boolean`                           | -    | ストリーミング中フラグ |
| `type`        | `'text' \| 'error' \| 'tool_use'`   | -    | メッセージタイプ       |

```typescript
export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  type?: "text" | "error" | "tool_use";
}
```

#### PermissionRequest型

ツール使用の権限確認リクエスト。

| プロパティ    | 型                        | 必須 | 説明           |
| ------------- | ------------------------- | ---- | -------------- |
| `executionId` | `string`                  | ✓    | 実行ID         |
| `requestId`   | `string`                  | ✓    | リクエストID   |
| `toolName`    | `string`                  | ✓    | ツール名       |
| `args`        | `Record<string, unknown>` | ✓    | ツール引数     |
| `reason`      | `string`                  | -    | リクエスト理由 |

```typescript
export interface PermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}
```

#### PermissionResponse型

ツール使用の権限確認レスポンス。

| プロパティ  | 型        | 必須 | 説明             |
| ----------- | --------- | ---- | ---------------- |
| `requestId` | `string`  | ✓    | リクエストID     |
| `granted`   | `boolean` | ✓    | 許可されたか     |
| `remember`  | `boolean` | -    | 選択を記憶するか |

```typescript
export interface PermissionResponse {
  requestId: string;
  granted: boolean;
  remember?: boolean;
}
```

---

### Zustand状態管理（agentSlice拡張）

AGENT-004で追加されたAgent Execution UI用の状態管理。

#### AgentExecutionState型

| プロパティ                | 型                          | 説明                     |
| ------------------------- | --------------------------- | ------------------------ |
| `status`                  | `AgentExecutionStatus`      | 実行状態                 |
| `currentSkill`            | `Skill \| null`             | 現在のスキル             |
| `messages`                | `AgentMessage[]`            | メッセージ履歴           |
| `currentStreamingContent` | `string`                    | ストリーミング中テキスト |
| `error`                   | `string \| null`            | エラーメッセージ         |
| `pendingPermission`       | `PermissionRequest \| null` | 待機中の権限要求         |
| `rememberedChoices`       | `Record<string, boolean>`   | 記憶された選択           |

#### Agent Execution Actions

| アクション                 | 引数                                 | 説明                   |
| -------------------------- | ------------------------------------ | ---------------------- |
| `setExecutionStatus`       | `status: AgentExecutionStatus`       | 実行状態設定           |
| `setCurrentSkill`          | `skill: Skill \| null`               | 現在のスキル設定       |
| `addMessage`               | `message: AgentMessage`              | メッセージ追加         |
| `appendStreamingContent`   | `content: string`                    | ストリーミング追記     |
| `finalizeStreamingMessage` | -                                    | ストリーミング完了処理 |
| `setError`                 | `error: string \| null`              | エラー設定             |
| `setPendingPermission`     | `request: PermissionRequest \| null` | 権限要求設定           |
| `rememberPermissionChoice` | `toolName: string, granted: boolean` | 選択記憶               |
| `clearMessages`            | -                                    | メッセージクリア       |
| `resetExecutionState`      | -                                    | 状態リセット           |

---

### Preview State Management（AGENT-006）

AGENT-006で追加されたプレビュー環境用の状態管理。

#### Preview State型

| プロパティ            | 型                       | 説明                 |
| --------------------- | ------------------------ | -------------------- |
| `previewContent`      | `PreviewContent \| null` | プレビューコンテンツ |
| `selectedEnvironment` | `EnvironmentType`        | 選択中の環境         |
| `splitRatio`          | `number`                 | 分割比率 (0-100)     |

#### Preview Actions

| アクション               | 引数                              | 説明             |
| ------------------------ | --------------------------------- | ---------------- |
| `setPreviewContent`      | `content: PreviewContent \| null` | コンテンツ設定   |
| `setSelectedEnvironment` | `type: EnvironmentType`           | 環境タイプ設定   |
| `setSplitRatio`          | `ratio: number`                   | 分割比率設定     |
| `clearPreview`           | -                                 | プレビュークリア |

#### EnvironmentType

```typescript
type EnvironmentType = "none" | "html" | "markdown" | "terminal" | "code";
```

| 値         | 説明                         | 実装状態 |
| ---------- | ---------------------------- | -------- |
| `none`     | プレビューなし（デフォルト） | ✅       |
| `html`     | HTMLプレビュー               | ✅       |
| `markdown` | Markdownプレビュー           | ✅       |
| `terminal` | ターミナル（将来実装）       | 未実装   |
| `code`     | コード実行環境（将来実装）   | 未実装   |

#### PreviewContent

```typescript
interface PreviewContent {
  type: EnvironmentType;
  content: string;
  timestamp: Date;
}
```

#### 関連ドキュメント（Preview State）

| ドキュメント    | パス                                                                               |
| --------------- | ---------------------------------------------------------------------------------- |
| 実装ガイド      | `docs/30-workflows/custom-environment-ui/outputs/phase-12/implementation-guide.md` |
| APIドキュメント | `docs/30-workflows/custom-environment-ui/outputs/phase-12/api-documentation.md`    |

---

### IPC チャンネル（Agent Execution）

| チャンネル             | 方向            | 説明                 |
| ---------------------- | --------------- | -------------------- |
| `agent:start`          | Renderer → Main | エージェント実行開始 |
| `agent:stop`           | Renderer → Main | エージェント実行停止 |
| `agent:stream`         | Main → Renderer | ストリーミング出力   |
| `agent:complete`       | Main → Renderer | 実行完了通知         |
| `agent:error`          | Main → Renderer | エラー通知           |
| `agent:permission`     | Main → Renderer | 権限確認要求         |
| `agent:permission:res` | Renderer → Main | 権限確認応答         |

#### agent:start ペイロード

| フィールド | 型       | 説明         |
| ---------- | -------- | ------------ |
| `skillId`  | `string` | 実行スキルID |
| `prompt`   | `string` | ユーザー入力 |

#### agent:stream ペイロード

| フィールド    | 型       | 説明         |
| ------------- | -------- | ------------ |
| `executionId` | `string` | 実行ID       |
| `delta`       | `string` | 差分テキスト |
| `content`     | `string` | 累積テキスト |

#### agent:permission ペイロード

| フィールド | 型                  | 説明               |
| ---------- | ------------------- | ------------------ |
| `request`  | `PermissionRequest` | 権限確認リクエスト |

---

### Preload API（window.agentAPI拡張）

#### startExecution

エージェント実行を開始する。

| パラメータ | 型       | 必須 | 説明       |
| ---------- | -------- | ---- | ---------- |
| `skillId`  | `string` | ✓    | スキルID   |
| `prompt`   | `string` | ✓    | プロンプト |

**戻り値**: `Promise<{ executionId: string }>`

#### stopExecution

実行中のエージェントを停止する。

**戻り値**: `Promise<void>`

#### respondToPermission

権限確認に応答する。

| パラメータ | 型                   | 必須 | 説明         |
| ---------- | -------------------- | ---- | ------------ |
| `response` | `PermissionResponse` | ✓    | 権限確認応答 |

**戻り値**: `Promise<void>`

#### onStream

ストリーミング出力のコールバックを登録する。

| パラメータ | 型                                                   | 必須 | 説明             |
| ---------- | ---------------------------------------------------- | ---- | ---------------- |
| `callback` | `(data: { delta: string; content: string }) => void` | ✓    | コールバック関数 |

**戻り値**: `() => void` - 購読解除関数

#### onPermissionRequest

権限確認要求のコールバックを登録する。

| パラメータ | 型                                     | 必須 | 説明             |
| ---------- | -------------------------------------- | ---- | ---------------- |
| `callback` | `(request: PermissionRequest) => void` | ✓    | コールバック関数 |

**戻り値**: `() => void` - 購読解除関数

---

### アクセシビリティ要件（AGENT-004）

| 要件               | 実装                                   |
| ------------------ | -------------------------------------- |
| キーボードナビ     | Tab/Shift+Tab/Enter/Escapeで操作可能   |
| スクリーンリーダー | aria-label, aria-live, role属性設定    |
| フォーカス管理     | PermissionDialogのフォーカストラップ   |
| 色コントラスト     | WCAG 2.1 AA 4.5:1以上                  |
| ライブリージョン   | ストリーミング出力にaria-live="polite" |

---

### 関連ドキュメント（Agent Execution UI）

| ドキュメント                 | パス                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Agent Execution UI実装ガイド | `docs/30-workflows/agent-execution-ui/outputs/phase-12/implementation-guide.md` |
| Agent Execution UI設計書     | `docs/30-workflows/agent-execution-ui/outputs/phase-2/architecture-design.md`   |
| Agent Execution UIテスト仕様 | `docs/30-workflows/agent-execution-ui/outputs/phase-4/test-specification.md`    |

---

## AgentSDKPage（ポストリリーステスト検証UI）

AGENT-004実装後のポストリリーステストで作成されたAgent SDK統合テスト用UIページ。
ストリーミング応答、セッション管理、権限確認ダイアログの動作検証に使用する。

### 実装ファイル

| ファイル                                                                       | 説明                               |
| ------------------------------------------------------------------------------ | ---------------------------------- |
| `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                       | AgentSDKPageメインコンポーネント   |
| `apps/desktop/src/renderer/pages/AgentSDKPage/__tests__/AgentSDKPage.test.tsx` | ユニットテスト（29テスト）         |
| `apps/desktop/e2e/agent-sdk-integration.spec.ts`                               | E2E統合テスト（20テスト）          |
| `apps/desktop/e2e/agent-performance.spec.ts`                                   | パフォーマンステスト（4テスト）    |
| `apps/desktop/e2e/agent-network-resilience.spec.ts`                            | ネットワーク障害テスト（18テスト） |
| `apps/desktop/scripts/long-running-test.mjs`                                   | 安定性テストスクリプト             |

---

### アーキテクチャ（AgentSDKPage）

```
┌─────────────────────────────────────────────────────────────┐
│                      Electron Main Process                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   IPC Handlers                       │    │
│  │  agent:createSession, agent:query, agent:abort      │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │ contextBridge
┌───────────────────────────┴─────────────────────────────────┐
│                    Preload (AgentSDKAPI)                     │
│  getStatus, createSession, resumeSession, destroySession    │
│  query, abort, onMessage, setOption, getOption              │
└───────────────────────────┬─────────────────────────────────┘
                            │ window.agentSDKAPI
┌───────────────────────────┴─────────────────────────────────┐
│                      Renderer Process                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   AgentSDKPage                       │    │
│  │  - State: sessions, sdkStatus, executionStatus      │    │
│  │  - UI: prompt-input, send-button, response-area     │    │
│  │  - Dialog: permission-dialog                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

### Preload API（window.agentSDKAPI）

テスト用に拡張されたAgentSDKAPI仕様。

```typescript
interface AgentSDKAPI {
  getStatus: () => Promise<AgentSDKStatus>;
  createSession: () => Promise<AgentSDKCreateSessionResponse>;
  resumeSession: (request: AgentSDKResumeSessionRequest) => Promise<void>;
  destroySession: (request: AgentSDKDestroySessionRequest) => Promise<void>;
  query: (request: AgentSDKQueryRequest) => Promise<void>;
  abort: () => void;
  onMessage: (callback: (message: AgentSDKMessage) => void) => () => void;
  setOption: (options: { timeout?: number }) => void;
  getOption: (key: string) => number | undefined;
  setSessionId: (sessionId: string) => void;
}
```

#### AgentSDKStatus

```typescript
interface AgentSDKStatus {
  authenticated: boolean;
  version: string;
  features: string[];
}
```

#### AgentSDKMessage

```typescript
interface AgentSDKMessage {
  type: "text" | "tool_use" | "tool_result" | "error" | "end";
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
}
```

---

### data-testid一覧（AgentSDKPage）

| data-testid               | 要素   | 用途                     |
| ------------------------- | ------ | ------------------------ |
| `agent-status`            | div    | SDK状態表示              |
| `new-session-button`      | button | セッション作成           |
| `session-id`              | div    | セッションID表示         |
| `session-${id}`           | button | セッションリスト項目     |
| `prompt-input`            | input  | プロンプト入力           |
| `send-button`             | button | 送信ボタン               |
| `abort-button`            | button | 中断ボタン               |
| `response-area`           | div    | 応答表示エリア           |
| `response-chunk`          | span   | ストリーミングチャンク   |
| `execution-status`        | div    | 実行状態                 |
| `permission-dialog`       | div    | 権限確認ダイアログ       |
| `permission-tool-name`    | div    | ツール名表示             |
| `permission-allow-button` | button | 許可ボタン               |
| `permission-deny-button`  | button | 拒否ボタン               |
| `error-message`           | div    | エラーメッセージ         |
| `validation-error`        | div    | バリデーションエラー     |
| `offline-indicator`       | div    | オフラインインジケーター |
| `destroy-session-button`  | button | セッション破棄           |

---

### テスト統計

| テスト種類           | テスト数    | カバレッジ   |
| -------------------- | ----------- | ------------ |
| E2Eテスト            | 42          | -            |
| ユニットテスト       | 29          | Lines 72.06% |
| パフォーマンステスト | 4           | -            |
| 安定性テスト         | 1スクリプト | -            |

---

### 関連ドキュメント（ポストリリーステスト）

| ドキュメント     | パス                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| 実装ガイド       | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-12/implementation-guide.md` |
| テスト仕様書     | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-4/test-specification.md`    |
| 最終レビュー結果 | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-10/final-review-result.md`  |
| 手動テスト結果   | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-11/manual-test-result.md`   |

---

## AgentSDKPage Postrelease Testing（AGENT-005-POST）

AgentSDKPageのPostrelease Testing実装。Phase 4-12のTDDワークフローでUIコンポーネント、ストリーミング表示、セッション管理をテスト検証済み。

### 実装ファイル

| ファイル                                                             | 説明                       |
| -------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`             | メインページコンポーネント |
| `apps/desktop/src/renderer/pages/AgentSDKPage/AgentSDKPage.test.tsx` | ユニットテスト             |
| `apps/desktop/src/preload/agentSDKApi.ts`                            | Preload API定義            |
| `apps/desktop/src/preload/index.ts`                                  | contextBridge統合          |

---

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      Electron Main Process                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   IPC Handlers                       │    │
│  │  agent:createSession, agent:query, agent:abort      │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │ contextBridge
┌───────────────────────────┴─────────────────────────────────┐
│                    Preload (AgentSDKAPI)                     │
│  getStatus, createSession, resumeSession, destroySession    │
│  query, abort, onMessage, setOption, getOption              │
└───────────────────────────┬─────────────────────────────────┘
                            │ window.agentSDKAPI
┌───────────────────────────┴─────────────────────────────────┐
│                      Renderer Process                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   AgentSDKPage                       │    │
│  │  - State: sessions, sdkStatus, executionStatus      │    │
│  │  - UI: prompt-input, send-button, response-area     │    │
│  │  - Dialog: permission-dialog                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

### Preload API（window.agentSDKAPI）

#### AgentSDKAPI Interface

```typescript
interface AgentSDKAPI {
  getStatus: () => Promise<AgentSDKStatus>;
  createSession: () => Promise<AgentSDKCreateSessionResponse>;
  resumeSession: (request: AgentSDKResumeSessionRequest) => Promise<void>;
  destroySession: (request: AgentSDKDestroySessionRequest) => Promise<void>;
  query: (request: AgentSDKQueryRequest) => Promise<void>;
  abort: () => void;
  onMessage: (callback: (message: AgentSDKMessage) => void) => () => void;
  setOption: (options: { timeout?: number }) => void;
  getOption: (key: string) => number | undefined;
  setSessionId: (sessionId: string) => void;
}
```

#### AgentSDKStatus

| プロパティ      | 型         | 説明           |
| --------------- | ---------- | -------------- |
| `authenticated` | `boolean`  | 認証状態       |
| `version`       | `string`   | SDKバージョン  |
| `features`      | `string[]` | 有効な機能一覧 |

#### AgentSDKMessage

| プロパティ  | 型                                                          | 説明           |
| ----------- | ----------------------------------------------------------- | -------------- |
| `type`      | `'text' \| 'tool_use' \| 'tool_result' \| 'error' \| 'end'` | メッセージ種別 |
| `content`   | `string?`                                                   | テキスト内容   |
| `toolName`  | `string?`                                                   | ツール名       |
| `toolInput` | `Record<string, unknown>?`                                  | ツール入力     |

---

### data-testid 一覧

| data-testid            | 要素   | 用途                   |
| ---------------------- | ------ | ---------------------- |
| `agent-status`         | div    | SDK状態表示            |
| `new-session-button`   | button | セッション作成         |
| `session-id`           | div    | セッションID表示       |
| `session-${id}`        | button | セッションリスト項目   |
| `prompt-input`         | input  | プロンプト入力         |
| `send-button`          | button | 送信ボタン             |
| `abort-button`         | button | 中断ボタン             |
| `response-area`        | div    | 応答表示エリア         |
| `response-chunk`       | span   | ストリーミングチャンク |
| `execution-status`     | div    | 実行状態               |
| `permission-dialog`    | div    | 権限確認ダイアログ     |
| `permission-tool-name` | div    | ツール名表示           |
| `permission-allow`     | button | 許可ボタン             |
| `permission-deny`      | button | 拒否ボタン             |

---

### テスト仕様

#### テスト結果（Phase 10）

| カテゴリ       | 件数   | パス   | 成功率   |
| -------------- | ------ | ------ | -------- |
| ユニットテスト | 12     | 12     | 100%     |
| 統合テスト     | 6      | 6      | 100%     |
| E2Eテスト      | 8      | 8      | 100%     |
| **合計**       | **26** | **26** | **100%** |

#### テストカテゴリ

| カテゴリ           | 検証内容                   |
| ------------------ | -------------------------- |
| 初期表示           | SDK状態取得、UI描画        |
| セッション管理     | 作成・再開・破棄・切り替え |
| クエリ実行         | 送信・ストリーミング・完了 |
| 中断処理           | 実行中断・状態復帰         |
| 権限確認           | ダイアログ表示・許可・拒否 |
| エラーハンドリング | 接続エラー・タイムアウト   |

---

### 関連ドキュメント（AgentSDKPage Postrelease Testing）

| ドキュメント   | パス                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| 実装ガイド     | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-12/implementation-guide.md` |
| 手動テスト結果 | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-11/manual-test-result.md`   |
| レビュー結果   | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-10/final-review-result.md`  |

---

---

## Claude Code CLI統合

### 概要

ElectronデスクトップアプリにおけるClaude Code CLI統合のインターフェース仕様。
Main ProcessからClaude Code CLIをchild_process.spawnで起動し、スキル実行・セッション管理・ストリーミング出力を提供する。

**実装ファイル**:

- `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts` - ファサードAPI
- `apps/desktop/src/main/claude-cli/ProcessManager.ts` - プロセス管理
- `apps/desktop/src/main/claude-cli/SessionManager.ts` - セッション管理
- `apps/desktop/src/main/claude-cli/SkillScanner.ts` - スキルスキャン
- `apps/desktop/src/main/claude-cli/ipc-handler.ts` - IPCハンドラ
- `packages/shared/src/claude-cli/types.ts` - 共有型定義
- `packages/shared/src/claude-cli/schemas.ts` - Zodスキーマ

### アーキテクチャ

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

### IPC チャンネル（Claude CLI）

| チャンネル                      | 方向            | 説明                   |
| ------------------------------- | --------------- | ---------------------- |
| `claude-cli:check-installation` | Renderer → Main | CLI存在確認            |
| `claude-cli:list-skills`        | Renderer → Main | スキル一覧取得         |
| `claude-cli:get-skill-detail`   | Renderer → Main | スキル詳細取得         |
| `claude-cli:execute-script`     | Renderer → Main | スクリプト実行         |
| `claude-cli:terminate-session`  | Renderer → Main | セッション終了         |
| `claude-cli:list-sessions`      | Renderer → Main | セッション一覧取得     |
| `claude-cli:get-session`        | Renderer → Main | セッション詳細取得     |
| `claude-cli:session-output`     | Main → Renderer | ストリーミング出力     |
| `claude-cli:session-status`     | Main → Renderer | セッション状態変更通知 |

### 型定義（Claude CLI）

#### ClaudeCliResult<T>

共通レスポンス型（Result Pattern）。

```typescript
type ClaudeCliResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ClaudeCliErrorCode; message: string } };
```

#### ClaudeCliErrorCode

| コード                 | 説明               |
| ---------------------- | ------------------ |
| `VALIDATION_ERROR`     | バリデーション失敗 |
| `SCAN_FAILED`          | スキャン失敗       |
| `SKILL_NOT_FOUND`      | スキル未発見       |
| `EXECUTION_FAILED`     | 実行失敗           |
| `SESSION_NOT_FOUND`    | セッション未発見   |
| `TERMINATION_FAILED`   | 終了失敗           |
| `IPC_VALIDATION_ERROR` | IPC検証失敗        |

#### SessionStatus

| 値           | 説明         |
| ------------ | ------------ |
| `pending`    | 待機中       |
| `running`    | 実行中       |
| `completed`  | 完了         |
| `failed`     | 失敗         |
| `terminated` | 終了（中断） |

### 設定定数（Claude CLI）

| 定数                | 値      | 説明                   |
| ------------------- | ------- | ---------------------- |
| `MAX_SESSIONS`      | `10`    | 最大同時セッション数   |
| `DEFAULT_TIMEOUT`   | `30分`  | デフォルトタイムアウト |
| `OUTPUT_BUFFER_MAX` | `100MB` | 出力バッファ最大サイズ |

### 関連ドキュメント（Claude CLI統合）

| ドキュメント   | パス                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| 実装ガイド     | `docs/30-workflows/claude-code-cli-integration/outputs/phase-12/implementation-guide.md`   |
| 要件定義       | `docs/30-workflows/claude-code-cli-integration/outputs/phase-1/requirements-definition.md` |
| アーキテクチャ | `docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md`     |
| IPC API仕様    | `docs/30-workflows/claude-code-cli-integration/outputs/phase-2/ipc-api-specification.md`   |
| セキュリティ   | `docs/30-workflows/claude-code-cli-integration/outputs/phase-2/security-design.md`         |

---

## Session Persistence（セッション永続化）

Agent SDKのセッション履歴をelectron-storeを使用してローカルに永続化する機能。アプリケーション再起動後も過去のセッションを参照・再開できる。

### 実装ファイル

| ファイル                       | パス                                      | 説明                   |
| ------------------------------ | ----------------------------------------- | ---------------------- |
| SessionStorage.ts              | `apps/desktop/src/main/services/session/` | electron-storeラッパー |
| SessionPersistenceService.ts   | `apps/desktop/src/main/services/session/` | ビジネスロジック       |
| session-persistence-handler.ts | `apps/desktop/src/main/ipc/`              | IPCハンドラー          |

---

### アーキテクチャ（Session Persistence）

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               AgentSDKPage                           │   │
│  │  - セッション一覧表示                                │   │
│  │  - セッション選択・作成・削除                        │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │ IPC                             │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                     Main Process                            │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │         session-persistence-handler                  │   │
│  │  - IPC チャンネル登録                                │   │
│  │  - リクエスト→サービス呼び出し                       │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │           SessionPersistenceService                  │   │
│  │  - ビジネスロジック                                  │   │
│  │  - Zodバリデーション                                 │   │
│  │  - LRU削除                                           │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │               SessionStorage                         │   │
│  │  - electron-store ラッパー                           │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│               ┌──────────────────────┐                     │
│               │   electron-store     │                     │
│               │   (JSONファイル)     │                     │
│               └──────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

### 型定義（Session Persistence）

#### PersistedSession

永続化されたセッション情報。

| プロパティ       | 型        | 必須 | 説明               |
| ---------------- | --------- | ---- | ------------------ |
| `id`             | `string`  | ✓    | UUID               |
| `createdAt`      | `number`  | ✓    | 作成タイムスタンプ |
| `lastAccessedAt` | `number`  | ✓    | 最終アクセス日時   |
| `isActive`       | `boolean` | ✓    | アクティブ状態     |
| `messageCount`   | `number`  | ✓    | メッセージ数       |
| `title`          | `string`  | -    | セッションタイトル |

```typescript
interface PersistedSession {
  id: string;
  createdAt: number;
  lastAccessedAt: number;
  isActive: boolean;
  messageCount: number;
  title?: string;
}
```

#### PersistedMessage

永続化されたメッセージ情報。

| プロパティ  | 型                      | 必須 | 説明             |
| ----------- | ----------------------- | ---- | ---------------- |
| `id`        | `string`                | ✓    | UUID             |
| `sessionId` | `string`                | ✓    | 所属セッションID |
| `role`      | `'user' \| 'assistant'` | ✓    | メッセージ種別   |
| `content`   | `string`                | ✓    | メッセージ内容   |
| `timestamp` | `number`                | ✓    | タイムスタンプ   |

```typescript
interface PersistedMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
```

#### StorageStats

ストレージ統計情報。

| プロパティ      | 型       | 説明               |
| --------------- | -------- | ------------------ |
| `totalSessions` | `number` | 総セッション数     |
| `totalMessages` | `number` | 総メッセージ数     |
| `usedSize`      | `number` | 使用サイズ (bytes) |
| `maxSize`       | `number` | 最大サイズ (bytes) |
| `usageRatio`    | `number` | 使用率 (0-1)       |

#### CleanupResult

LRU削除の結果。

| プロパティ          | 型         | 説明               |
| ------------------- | ---------- | ------------------ |
| `deletedSessions`   | `number`   | 削除セッション数   |
| `deletedMessages`   | `number`   | 削除メッセージ数   |
| `freedSize`         | `number`   | 解放サイズ (bytes) |
| `deletedSessionIds` | `string[]` | 削除セッションID   |

#### SessionPersistenceConfig

永続化設定。

| プロパティ              | 型        | デフォルト | 説明                           |
| ----------------------- | --------- | ---------- | ------------------------------ |
| `maxSessions`           | `number`  | `100`      | 最大セッション数               |
| `maxStorageSize`        | `number`  | `50MB`     | 最大ストレージサイズ           |
| `maxMessagesPerSession` | `number`  | `1000`     | セッションあたり最大メッセージ |
| `enableAutoBackup`      | `boolean` | `true`     | 自動バックアップ               |
| `backupRetentionCount`  | `number`  | `3`        | バックアップ保持数             |
| `lruWarningThreshold`   | `number`  | `0.9`      | LRU警告閾値                    |

#### IPCResponse<T>

IPC共通レスポンス型。

```typescript
type IPCResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

---

### IPC チャンネル（Session Persistence）

| チャンネル                     | 方向            | 説明               | レスポンス                        |
| ------------------------------ | --------------- | ------------------ | --------------------------------- |
| `session:persist:load`         | Renderer → Main | セッション一覧取得 | `IPCResponse<PersistedSession[]>` |
| `session:persist:save`         | Renderer → Main | セッション保存     | `IPCResponse<PersistedSession>`   |
| `session:persist:delete`       | Renderer → Main | セッション削除     | `IPCResponse<void>`               |
| `session:persist:update`       | Renderer → Main | セッション更新     | `IPCResponse<PersistedSession>`   |
| `session:persist:loadMessages` | Renderer → Main | メッセージ取得     | `IPCResponse<PersistedMessage[]>` |
| `session:persist:saveMessage`  | Renderer → Main | メッセージ保存     | `IPCResponse<PersistedMessage>`   |
| `session:persist:clearAll`     | Renderer → Main | 全データ削除       | `IPCResponse<void>`               |
| `session:persist:getStats`     | Renderer → Main | 統計情報取得       | `IPCResponse<StorageStats>`       |
| `session:persist:cleanup`      | Renderer → Main | LRU削除実行        | `IPCResponse<CleanupResult>`      |

---

### エラーコード（Session Persistence）

| コード                | 説明                         |
| --------------------- | ---------------------------- |
| `VALIDATION_ERROR`    | 入力データバリデーション失敗 |
| `SESSION_NOT_FOUND`   | セッションが見つからない     |
| `STORAGE_READ_ERROR`  | ストレージ読み取りエラー     |
| `STORAGE_WRITE_ERROR` | ストレージ書き込みエラー     |
| `INTERNAL_ERROR`      | 予期しないエラー             |

---

### ストレージファイル

#### 保存場所

| OS      | パス                                                                       |
| ------- | -------------------------------------------------------------------------- |
| macOS   | `~/Library/Application Support/AIWorkflowOrchestrator/agent-sessions.json` |
| Windows | `%APPDATA%/AIWorkflowOrchestrator/agent-sessions.json`                     |
| Linux   | `~/.config/AIWorkflowOrchestrator/agent-sessions.json`                     |

#### ファイル構造

```json
{
  "sessions": [PersistedSession[]],
  "messages": { "sessionId": [PersistedMessage[]] },
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": 1234567890,
    "totalSize": 1234
  }
}
```

---

### 関連ドキュメント（Session Persistence）

| ドキュメント | パス                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| 実装ガイド   | `docs/30-workflows/agent-sdk-session-persistence/outputs/phase-12/implementation-guide.md` |
| 設計仕様     | `docs/30-workflows/agent-sdk-session-persistence/outputs/phase-2/`                         |
| テスト仕様   | `docs/30-workflows/agent-sdk-session-persistence/outputs/phase-4/test-plan.md`             |

---

## Skill Import Agent System 型定義（TASK-1-1）

TASK-1-1で実装された16の共通型定義。specification.md §5.1に基づく。

### 概要

| カテゴリ         | 型数 | 説明                                         |
| ---------------- | ---- | -------------------------------------------- |
| スキルメタデータ | 4    | スキルの基本情報・構造を表す型               |
| 実行関連         | 3    | スキル実行のリクエスト/レスポンス/ステータス |
| ストリーミング   | 7    | 実行中のリアルタイムメッセージ型             |
| 権限確認         | 2    | 実行時の権限確認フロー型                     |

### スキルメタデータ型

#### SkillOtherFile

スキルディレクトリ直下のその他のファイル。

```typescript
interface SkillOtherFile {
  filename: string;
  type: "evals" | "logs" | "package" | "other";
  size: number;
}
```

#### SkillSubResource

スキル配下のサブリソース（agents/, references/, scripts/ 等）。

```typescript
interface SkillSubResource {
  filename: string;
  relativePath: string;
  description?: string;
  size: number;
}
```

#### SkillMetadata

スキルメタデータ（SKILL.md frontmatter + ディレクトリ構造）。

```typescript
interface SkillMetadata {
  name: string; // スキル識別子
  description: string; // スキル説明
  allowedTools?: string[]; // 許可ツール
  path: string; // ディレクトリパス
  updatedAt: Date; // 最終更新日時
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
  otherFiles: SkillOtherFile[];
}
```

#### ImportedSkill

インポート済みスキル（SkillMetadataを継承）。

```typescript
interface ImportedSkill extends SkillMetadata {
  importedAt: Date;
  status: "active" | "disabled";
  content?: string; // SKILL.md本文キャッシュ
}
```

#### ScannedSkillMetadata

スキャンされたスキルメタデータ（SkillMetadataを継承、readonlyフラグ付き）。

> **追加**: TASK-2A（SkillScanner実装、2026-01-24完了）

```typescript
interface ScannedSkillMetadata extends SkillMetadata {
  /** 読み取り専用フラグ（~/.claude/skills/ からのスキルは true） */
  readonly: boolean;
}
```

#### SkillScannerOptions

SkillScannerコンストラクタオプション。

> **追加**: TASK-2A（SkillScanner実装、2026-01-24完了）

```typescript
interface SkillScannerOptions {
  /** ~/.aiworkflow/skills/ に相当するディレクトリパス */
  aiworkflowSkillsDir?: string;
  /** ~/.claude/skills/ に相当するディレクトリパス */
  claudeSkillsDir?: string;
}
```

### 実行関連型

#### SkillExecutionRequest

スキル実行リクエスト（Renderer → Main）。

```typescript
interface SkillExecutionRequest {
  skillName: string;
  prompt: string;
  workingDirectory?: string;
}
```

#### SkillExecutionResponse

スキル実行レスポンス（Main → Renderer）。

```typescript
interface SkillExecutionResponse {
  executionId: string; // UUID、Main側で生成
  success: boolean;
  error?: string;
}
```

#### SkillExecutionStatus

スキル実行ステータス。

```typescript
type SkillExecutionStatus =
  | "idle"
  | "running"
  | "permission_pending"
  | "completed"
  | "cancelled"
  | "error";
```

### ストリーミングメッセージ型

#### SkillStreamMessageType

メッセージ種別の列挙型。

```typescript
type SkillStreamMessageType =
  | "assistant"
  | "tool_use"
  | "tool_result"
  | "status"
  | "error";
```

#### AssistantMessageContent

```typescript
interface AssistantMessageContent {
  text: string;
  isPartial?: boolean;
}
```

#### ToolUseMessageContent

```typescript
interface ToolUseMessageContent {
  toolName: string;
  args: Record<string, unknown>;
  toolUseId: string;
}
```

#### ToolResultMessageContent

```typescript
interface ToolResultMessageContent {
  toolUseId: string;
  success: boolean;
  result?: unknown;
  error?: string;
}
```

#### StatusMessageContent

```typescript
interface StatusMessageContent {
  status: "started" | "tool_executing" | "tool_completed" | "completed";
  detail?: string;
}
```

#### ErrorMessageContent

```typescript
interface ErrorMessageContent {
  code: "sdk_error" | "permission_denied" | "timeout" | "network" | "unknown";
  message: string;
  retryable: boolean;
}
```

#### SkillStreamMessage（Discriminated Union）

型安全なストリーミングメッセージ。typeプロパティで型判別可能。

```typescript
type SkillStreamMessage =
  | {
      executionId: string;
      type: "assistant";
      content: AssistantMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_use";
      content: ToolUseMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_result";
      content: ToolResultMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "status";
      content: StatusMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "error";
      content: ErrorMessageContent;
      timestamp: number;
    };
```

### 権限確認型

#### SkillPermissionRequest

権限確認リクエスト（Main → Renderer）。

```typescript
interface SkillPermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}
```

#### SkillPermissionResponse

権限確認レスポンス（Renderer → Main）。

```typescript
interface SkillPermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}
```

### 使用方法

```typescript
import type {
  SkillMetadata,
  SkillSubResource,
  SkillOtherFile,
  ImportedSkill,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillExecutionStatus,
  SkillStreamMessage,
  SkillStreamMessageType,
  AssistantMessageContent,
  ToolUseMessageContent,
  ToolResultMessageContent,
  StatusMessageContent,
  ErrorMessageContent,
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";
```

### 関連ドキュメント（TASK-1-1）

| ドキュメント       | パス                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| タスク完了サマリー | `docs/30-workflows/task-1-1-type-definitions/outputs/task-completion-summary.md` |
| 実装ファイル       | `packages/shared/src/types/skill.ts`                                             |
| テストファイル     | `packages/shared/src/types/__tests__/skill-import.test.ts`                       |
| 仕様書             | `docs/30-workflows/skill-import-agent-system/specification.md` §5.1              |

---

## 完了タスク

### タスク: skill-import-type-definitions（TASK-1-1、2026-01-23完了）

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-1-1                                       |
| 完了日       | 2026-01-23                                     |
| ステータス   | **完了**                                       |
| テスト数     | 59（23 + 36）                                  |
| 発見課題     | 0件                                            |
| ドキュメント | `docs/30-workflows/task-1-1-type-definitions/` |

#### 実装内容

specification.md §5.1に定義された16の共通型を`packages/shared/src/types/skill.ts`に追加。

#### 解決した問題

`claude-cli/types.ts`の`SkillMetadata`と新規型の名前衝突を、既存パターンに従い`ClaudeCliSkillMetadata`にリネームして解決。

#### 品質基準

| 基準              | 結果 |
| ----------------- | ---- |
| TypeScript strict | PASS |
| ESLint            | PASS |
| Prettier          | PASS |
| any型の使用       | 0件  |
| @ts-ignore        | 0件  |
| JSDocカバレッジ   | 100% |

---

### タスク: skill-import-persistence-bugfix（2026-01-22完了）

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | SKILL-IMPORT-PERSIST-001                             |
| 完了日       | 2026-01-22                                           |
| ステータス   | **完了**                                             |
| テスト数     | 28（自動テスト）+ 7（手動テスト項目）                |
| 発見課題     | 0件                                                  |
| ドキュメント | `docs/30-workflows/skill-import-persistence-bugfix/` |

#### 問題

`skill:list-imported` APIがアプリ再起動後に常に空配列を返していた。

#### 根本原因

`ipc/index.ts`で`electron-store`初期化時に`defaults`オプションが未設定だった。

#### 修正内容

1. `electron-store`に`defaults`設定を追加
2. `SkillImportManager`に`SkillStore`型インターフェースを追加
3. エラーハンドリングを追加

#### テストカバレッジ

| メトリクス | 達成値 |
| ---------- | ------ |
| Lines      | 95.31% |
| Functions  | 100%   |
| Branches   | 92.3%  |
| Statements | 95.31% |

#### 変更ファイル

| ファイル                                                                    | 変更種別 |
| --------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/index.ts`                                        | 修正     |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts`                | 修正     |
| `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | 追加     |

### タスク: skill-import-store-persistence（2026-01-22完了）

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | SKILL-STORE-001                                     |
| 完了日       | 2026-01-22                                          |
| ステータス   | **完了**                                            |
| テスト数     | 144（自動テスト: 28ユニット + 23統合 + 93その他）   |
| 発見課題     | 0件                                                 |
| ドキュメント | `docs/30-workflows/skill-import-store-persistence/` |

#### 問題

`skill:list-imported` APIがインポート後も0件を返す問題。28件のユニットテストはPASSしていたが、統合テストがなく実環境での動作が未検証だった。

#### 根本原因

モックベースのユニットテストのみでは実際のelectron-storeとの連携が検証できていなかった。

#### 修正内容

1. 実際のelectron-storeを使用した統合テスト23件を追加
2. デバッグログを追加（ストアパス、読み込み/書き込み時のデータ）
3. SkillStoreインターフェースにpath属性を追加

#### テストカバレッジ

| メトリクス        | 達成値 |
| ----------------- | ------ |
| Line Coverage     | 97.36% |
| Branch Coverage   | 92.85% |
| Function Coverage | 100%   |

#### 変更ファイル

| ファイル                                                                                | 変更種別 |
| --------------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts`                            | 修正     |
| `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.integration.test.ts` | 新規     |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts`                 | 新規     |

### タスク: skill-import-store（TASK-2B、2026-01-24完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | TASK-2B                                                              |
| 完了日       | 2026-01-24                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 59（自動テスト）                                                     |
| 発見課題     | 0件                                                                  |
| ドキュメント | `docs/30-workflows/task-2b-skill-import-store/`                      |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| 機能テスト         | 11       | 11   | 0    |
| 永続化テスト       | 4        | 4    | 0    |
| エラーハンドリング | 4        | 4    | 0    |
| 権限管理テスト     | 15       | 15   | 0    |
| キャッシュテスト   | 14       | 14   | 0    |
| マイグレーション   | 11       | 11   | 0    |

#### 成果物

| 成果物             | パス                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| 実装ファイル       | `apps/desktop/src/main/settings/skillImportStore.ts`                         |
| テストファイル     | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts`          |
| テスト結果レポート | `docs/30-workflows/task-2b-skill-import-store/outputs/phase-11/`             |
| 実装ガイド         | `docs/30-workflows/task-2b-skill-import-store/outputs/phase-12/implementation-guide.md` |

#### 実装内容

インポートしたスキルの情報を永続化するskillImportStoreを実装。電子ストア（electron-store）を使用してアプリ再起動後もデータを保持。

| 機能カテゴリ | メソッド数 | 概要                           |
| ------------ | ---------- | ------------------------------ |
| インポート管理 | 5        | getImported, addImport, removeImport, exists, updateLastUsed |
| 設定管理     | 2          | getSettings, updateSettings    |
| 権限管理     | 2          | rememberPermission, getRememberedPermission |
| キャッシュ管理 | 3        | setCache, getCache, invalidateCache |
| ユーティリティ | 2        | reset, migrateFromVersion      |

#### 品質基準

| 基準              | 結果 |
| ----------------- | ---- |
| TypeScript strict | PASS |
| ESLint            | PASS |
| Prettier          | PASS |
| テストカバレッジ  | ~95% |
| セキュリティ      | SEC-01対応済み（入力値20文字切り捨て） |

---

### タスク: skill-import-type-definitions（2026-01-23完了）

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-1-1                                       |
| 完了日       | 2026-01-23                                     |
| ステータス   | **完了**                                       |
| テスト数     | 59（自動テスト: 36ユニット + 23インポート）    |
| 発見課題     | 0件                                            |
| ドキュメント | `docs/30-workflows/task-1-1-type-definitions/` |

#### 概要

specification.md §5.1に定義されたスキルインポートシステム用の共通型定義（16型）を`packages/shared`に実装。

#### 実装内容

| カテゴリ         | 型名                     | 用途                            |
| ---------------- | ------------------------ | ------------------------------- |
| スキルメタデータ | SkillMetadata            | スキルの基本情報（frontmatter） |
|                  | SkillSubResource         | サブリソースファイル情報        |
|                  | SkillOtherFile           | その他のファイル情報            |
|                  | ImportedSkill            | インポート済みスキル情報        |
| 実行関連         | SkillExecutionRequest    | スキル実行リクエスト            |
|                  | SkillExecutionResponse   | スキル実行レスポンス            |
|                  | SkillExecutionStatus     | 実行ステータス（pending等）     |
| ストリーミング   | SkillStreamMessageType   | メッセージタイプ（リテラル型）  |
|                  | SkillStreamMessage       | ストリーミングメッセージ（DU）  |
|                  | AssistantMessageContent  | アシスタントメッセージ内容      |
|                  | ToolUseMessageContent    | ツール使用メッセージ内容        |
|                  | ToolResultMessageContent | ツール結果メッセージ内容        |
|                  | StatusMessageContent     | ステータスメッセージ内容        |
|                  | ErrorMessageContent      | エラーメッセージ内容            |
| 権限確認         | SkillPermissionRequest   | 権限確認リクエスト              |
|                  | SkillPermissionResponse  | 権限確認レスポンス              |

#### 品質基準

| 基準              | 結果 |
| ----------------- | ---- |
| TypeScript strict | PASS |
| ESLint            | PASS |
| Prettier          | PASS |
| any型の使用       | 0件  |
| @ts-ignore        | 0件  |
| JSDocカバレッジ   | 100% |

#### 変更ファイル

| ファイル                                                   | 変更種別 |
| ---------------------------------------------------------- | -------- |
| `packages/shared/src/types/skill.ts`                       | 更新     |
| `packages/shared/index.ts`                                 | 更新     |
| `packages/shared/src/claude-cli/types.ts`                  | 更新     |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`         | 更新     |
| `packages/shared/src/types/__tests__/skill-import.test.ts` | 新規     |
| `packages/shared/src/types/__tests__/manual-dx-test.ts`    | 新規     |

---

### タスク: skill-scanner-implementation（TASK-2A、2026-01-24完了）

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | TASK-2A                                       |
| 完了日       | 2026-01-24                                    |
| ステータス   | **完了**                                      |
| テスト数     | 49（自動テスト）+ 13（手動テスト項目）        |
| 発見課題     | 1件（ISS-01: 未使用型定義、重要度: 低、受容） |
| ドキュメント | `docs/30-workflows/TASK-2A/`                  |

#### 概要

スキルディレクトリをスキャンしてメタデータを取得する`SkillScanner`クラスを実装。2つのディレクトリ（`~/.aiworkflow/skills/`と`~/.claude/skills/`）をサポートし、readonlyフラグで区別。

#### 実装内容

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| 実装ファイル | `apps/desktop/src/main/services/skill/SkillScanner.ts` |
| コード行数   | 520行                                                  |
| 新規型定義   | `ScannedSkillMetadata`, `SkillScannerOptions`          |
| 主要メソッド | `scanAll()`, `scanDirectory()` (Legacy)                |

#### テストカバレッジ

| メトリクス        | 目標 | 達成値 |
| ----------------- | ---- | ------ |
| Line Coverage     | 80%  | 82.69% |
| Branch Coverage   | 60%  | 83.56% |
| Function Coverage | 80%  | 100%   |

#### セキュリティ対策

| 対策                     | 実装内容                                   |
| ------------------------ | ------------------------------------------ |
| パストラバーサル防止     | `..` や `/` を含むディレクトリ名を拒否     |
| シンボリックリンク検証   | ベースパス外を指すシンボリックリンクを拒否 |
| 隠しディレクトリスキップ | `.` で始まるディレクトリをスキップ         |

#### 変更ファイル

| ファイル                                                                    | 変更種別 |
| --------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/services/skill/SkillScanner.ts`                      | 新規     |
| `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`       | 新規     |
| `apps/desktop/src/main/services/skill/__manual-tests__/scan-real-skills.ts` | 新規     |
| `apps/desktop/src/main/services/skill/index.ts`                             | 更新     |

---

## 残課題（未タスク）

| タスクID      | タスク名                  | 優先度 | 発見元                             | タスク仕様書                                                         |
| ------------- | ------------------------- | ------ | ---------------------------------- | -------------------------------------------------------------------- |
| SKILL-E2E-001 | スキルインポートE2Eテスト | 中     | Phase 11（手動テスト検証）推奨事項 | `docs/30-workflows/unassigned-task/task-skill-import-e2e-testing.md` |

> **補足**: 上記タスクはユニットテスト（28件）で動作検証済みだが、実Electron環境でのE2Eテストは未実施。優先度「中」のため、他の優先度「高」タスク完了後に実施可能。

---

## 関連ドキュメント

| ドキュメント                           | パス                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Agent SDK実装ガイド                    | `docs/30-workflows/agent-sdk-integration/outputs/phase-12/implementation-guide.md`                          |
| Agent SDK APIリファレンス              | `docs/30-workflows/agent-sdk-integration/outputs/phase-12/api-reference.md`                                 |
| Claude Agent SDKスキル                 | `.claude/skills/claude-agent-sdk/SKILL.md`                                                                  |
| LLMインターフェース                    | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                       |
| Agent Dashboard実装ガイド              | `docs/30-workflows/agent-dashboard-foundation/outputs/phase-12/implementation-guide.md`                     |
| スキル管理UI実装ガイド（AGENT-002）    | `docs/30-workflows/skill-management-ui/outputs/phase-12/implementation-guide.md`                            |
| スキル管理UIテストドキュメント         | `docs/30-workflows/skill-management-ui/outputs/phase-12/test-docs.md`                                       |
| スキル実行機能実装ガイド               | `docs/30-workflows/skill-execution-implementation/outputs/phase-12/implementation-guide.md`                 |
| AgentSDKPage Postrelease実装ガイド     | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-12/implementation-guide.md`                        |
| Session Persistence実装ガイド          | `docs/30-workflows/agent-sdk-session-persistence/outputs/phase-12/implementation-guide.md`                  |
| スキルインポート永続化バグ修正         | `docs/30-workflows/skill-import-persistence-bugfix/outputs/phase-12/implementation-guide.md`                |
| スキルインポートストア永続化問題修正   | `docs/30-workflows/skill-import-store-persistence/outputs/phase-12/implementation-guide.md`                 |
| スキルインポート共通型定義（TASK-1-1） | `docs/30-workflows/task-1-1-type-definitions/outputs/phase-12-documentation-report.md`                      |
| SkillScanner実装ガイド（TASK-2A）      | `docs/30-workflows/TASK-2A/outputs/phase-12/implementation-guide.md`                                        |
| SkillImportStore実装ガイド（TASK-2B）  | `docs/30-workflows/completed-tasks/task-2b-skill-import-store/outputs/phase-12/implementation-guide.md`     |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                              |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| 1.0.0      | 2026-01-15 | 初版作成                                                                                                              |
| 1.1.0      | 2026-01-22 | skill-import-persistence-bugfix完了記録追加                                                                           |
| 1.2.0      | 2026-01-22 | 残課題（未タスク）セクション追加、E2Eテストタスク登録                                                                 |
| 1.3.0      | 2026-01-22 | skill-import-store-persistence完了記録追加（統合テスト23件追加、発見課題0件）                                         |
| 1.4.0      | 2026-01-23 | TASK-1-1（スキルインポート共通型定義）完了記録追加（16型、59テスト）                                                  |
| 1.5.0      | 2026-01-23 | TASK-1-1 型定義セクション追加（16型の詳細仕様）                                                                       |
| 1.6.0      | 2026-01-24 | TASK-2A（SkillScanner実装）完了記録追加、ScannedSkillMetadata/SkillScannerOptions型追加（49テスト、カバレッジ82.69%） |
| 1.7.0      | 2026-01-24 | TASK-2B（SkillImportStore）完了記録追加（59テスト、SEC-01対応、~95%カバレッジ）                                       |
