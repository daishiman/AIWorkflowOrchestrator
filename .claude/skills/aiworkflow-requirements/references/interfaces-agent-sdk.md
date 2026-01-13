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
    "@anthropic-ai/claude-agent-sdk": "^0.2.5"  // 必須
  }
}
```

### なぜ必要か

pnpm の厳格モード（`node-linker=isolated`）では、`package.json` に宣言されていない依存へのアクセスがブロックされます。

| シナリオ                             | 結果                         |
| ------------------------------------ | ---------------------------- |
| `apps/desktop` のみに SDK 依存を宣言 | テストPASS、ランタイムエラー |
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

| チャンネル        | 方向            | 説明                     | 戻り値                 |
| ----------------- | --------------- | ------------------------ | ---------------------- |
| `skill:list`      | Renderer → Main | インポート済みスキル取得 | `APIResponse<Skill[]>` |
| `skill:available` | Renderer → Main | 利用可能スキル取得       | `APIResponse<Skill[]>` |
| `skill:import`    | Renderer → Main | スキルインポート         | `APIResponse<void>`    |
| `skill:remove`    | Renderer → Main | スキル削除               | `APIResponse<void>`    |
| `skill:detail`    | Renderer → Main | スキル詳細取得           | `APIResponse<Skill>`   |

#### APIResponse型

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

### Preload API（window.skillAPI）

#### listImported

インポート済みのスキル一覧を取得する。

**戻り値**: `Promise<APIResponse<Skill[]>>`

#### listAvailable

利用可能なスキル一覧を取得する。

**戻り値**: `Promise<APIResponse<Skill[]>>`

#### import

スキルをインポートする。

| パラメータ | 型       | 必須 | 説明     |
| ---------- | -------- | ---- | -------- |
| `skillId`  | `string` | ✓    | スキルID |

**戻り値**: `Promise<APIResponse<void>>`

#### remove

スキルを削除する。

| パラメータ | 型       | 必須 | 説明     |
| ---------- | -------- | ---- | -------- |
| `skillId`  | `string` | ✓    | スキルID |

**戻り値**: `Promise<APIResponse<void>>`

#### getDetail

スキルの詳細情報を取得する。

| パラメータ | 型       | 必須 | 説明     |
| ---------- | -------- | ---- | -------- |
| `skillId`  | `string` | ✓    | スキルID |

**戻り値**: `Promise<APIResponse<Skill>>`

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

| プロパティ          | 型                      | 説明               |
| ------------------- | ----------------------- | ------------------ |
| `previewContent`    | `PreviewContent \| null` | プレビューコンテンツ |
| `selectedEnvironment` | `EnvironmentType`      | 選択中の環境       |
| `splitRatio`        | `number`                | 分割比率 (0-100)   |

#### Preview Actions

| アクション              | 引数                             | 説明               |
| ----------------------- | -------------------------------- | ------------------ |
| `setPreviewContent`     | `content: PreviewContent \| null` | コンテンツ設定     |
| `setSelectedEnvironment` | `type: EnvironmentType`         | 環境タイプ設定     |
| `setSplitRatio`         | `ratio: number`                  | 分割比率設定       |
| `clearPreview`          | -                                | プレビュークリア   |

#### EnvironmentType

```typescript
type EnvironmentType = 'none' | 'html' | 'markdown' | 'terminal' | 'code';
```

| 値         | 説明                           | 実装状態 |
| ---------- | ------------------------------ | -------- |
| `none`     | プレビューなし（デフォルト）   | ✅       |
| `html`     | HTMLプレビュー                 | ✅       |
| `markdown` | Markdownプレビュー             | ✅       |
| `terminal` | ターミナル（将来実装）         | 未実装   |
| `code`     | コード実行環境（将来実装）     | 未実装   |

#### PreviewContent

```typescript
interface PreviewContent {
  type: EnvironmentType;
  content: string;
  timestamp: Date;
}
```

#### 関連ドキュメント（Preview State）

| ドキュメント   | パス                                                             |
| -------------- | ---------------------------------------------------------------- |
| 実装ガイド     | `docs/30-workflows/custom-environment-ui/outputs/phase-12/implementation-guide.md` |
| APIドキュメント | `docs/30-workflows/custom-environment-ui/outputs/phase-12/api-documentation.md` |

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

| ファイル | 説明 |
| -------- | ---- |
| `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx` | メインページコンポーネント |
| `apps/desktop/src/renderer/pages/AgentSDKPage/AgentSDKPage.test.tsx` | ユニットテスト |
| `apps/desktop/src/preload/agentSDKApi.ts` | Preload API定義 |
| `apps/desktop/src/preload/index.ts` | contextBridge統合 |

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

| プロパティ      | 型         | 説明               |
| --------------- | ---------- | ------------------ |
| `authenticated` | `boolean`  | 認証状態           |
| `version`       | `string`   | SDKバージョン      |
| `features`      | `string[]` | 有効な機能一覧     |

#### AgentSDKMessage

| プロパティ  | 型                                                    | 説明             |
| ----------- | ----------------------------------------------------- | ---------------- |
| `type`      | `'text' \| 'tool_use' \| 'tool_result' \| 'error' \| 'end'` | メッセージ種別 |
| `content`   | `string?`                                             | テキスト内容     |
| `toolName`  | `string?`                                             | ツール名         |
| `toolInput` | `Record<string, unknown>?`                            | ツール入力       |

---

### data-testid 一覧

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
| `permission-allow`        | button | 許可ボタン               |
| `permission-deny`         | button | 拒否ボタン               |

---

### テスト仕様

#### テスト結果（Phase 10）

| カテゴリ | 件数 | パス | 成功率 |
| -------- | ---- | ---- | ------ |
| ユニットテスト | 12 | 12 | 100% |
| 統合テスト | 6 | 6 | 100% |
| E2Eテスト | 8 | 8 | 100% |
| **合計** | **26** | **26** | **100%** |

#### テストカテゴリ

| カテゴリ | 検証内容 |
| -------- | -------- |
| 初期表示 | SDK状態取得、UI描画 |
| セッション管理 | 作成・再開・破棄・切り替え |
| クエリ実行 | 送信・ストリーミング・完了 |
| 中断処理 | 実行中断・状態復帰 |
| 権限確認 | ダイアログ表示・許可・拒否 |
| エラーハンドリング | 接続エラー・タイムアウト |

---

### 関連ドキュメント（AgentSDKPage Postrelease Testing）

| ドキュメント           | パス                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| 実装ガイド             | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-12/implementation-guide.md` |
| 手動テスト結果         | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-11/manual-test-result.md` |
| レビュー結果           | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-10/final-review-result.md` |

---

## 関連ドキュメント

| ドキュメント                           | パス                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| Agent SDK実装ガイド                    | `docs/30-workflows/agent-sdk-integration/outputs/phase-12/implementation-guide.md`          |
| Agent SDK APIリファレンス              | `docs/30-workflows/agent-sdk-integration/outputs/phase-12/api-reference.md`                 |
| Claude Agent SDKスキル                 | `.claude/skills/claude-agent-sdk/SKILL.md`                                                  |
| LLMインターフェース                    | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                       |
| Agent Dashboard実装ガイド              | `docs/30-workflows/agent-dashboard-foundation/outputs/phase-12/implementation-guide.md`     |
| スキル管理UI実装ガイド（AGENT-002）    | `docs/30-workflows/skill-management-ui/outputs/phase-12/implementation-guide.md`            |
| スキル管理UIテストドキュメント         | `docs/30-workflows/skill-management-ui/outputs/phase-12/test-docs.md`                       |
| AgentSDKPage Postrelease実装ガイド     | `docs/30-workflows/postrelease-sdk-testing/outputs/phase-12/implementation-guide.md`        |
