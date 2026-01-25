# API エンドポイント一覧

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## エンドポイント一覧

### ワークフロー管理

| メソッド | パス                          | 説明                   | 認証 |
| -------- | ----------------------------- | ---------------------- | ---- |
| POST     | /api/v1/workflows             | ワークフロー作成       | 必要 |
| GET      | /api/v1/workflows             | ワークフロー一覧取得   | 必要 |
| GET      | /api/v1/workflows/{id}        | ワークフロー詳細取得   | 必要 |
| PATCH    | /api/v1/workflows/{id}        | ワークフロー更新       | 必要 |
| DELETE   | /api/v1/workflows/{id}        | ワークフロー削除       | 必要 |
| POST     | /api/v1/workflows/{id}/retry  | ワークフローリトライ   | 必要 |
| POST     | /api/v1/workflows/{id}/cancel | ワークフローキャンセル | 必要 |

### Local Agent API

| メソッド | パス                    | 説明                 | 認証  |
| -------- | ----------------------- | -------------------- | ----- |
| POST     | /api/v1/agent/sync      | ファイル同期         | Agent |
| POST     | /api/v1/agent/execute   | ワークフロー実行     | Agent |
| GET      | /api/v1/agent/status    | エージェント状態確認 | Agent |
| POST     | /api/v1/agent/heartbeat | ハートビート         | Agent |

### ユーザー設定

| メソッド | パス                  | 説明             | 認証 |
| -------- | --------------------- | ---------------- | ---- |
| GET      | /api/v1/settings      | ユーザー設定取得 | 必要 |
| PATCH    | /api/v1/settings      | ユーザー設定更新 | 必要 |
| GET      | /api/v1/api-keys      | APIキー一覧取得  | 必要 |
| POST     | /api/v1/api-keys      | APIキー登録      | 必要 |
| DELETE   | /api/v1/api-keys/{id} | APIキー削除      | 必要 |

### システム

| メソッド | パス           | 説明           | 認証 |
| -------- | -------------- | -------------- | ---- |
| GET      | /api/health    | ヘルスチェック | 不要 |
| GET      | /api/v1/status | 詳細ステータス | 必要 |

### チャット履歴

チャットセッションとメッセージの管理、エクスポート機能を提供する。

| メソッド | パス                           | 説明                   | 認証 |
| -------- | ------------------------------ | ---------------------- | ---- |
| GET      | /api/v1/sessions               | セッション一覧取得     | 必要 |
| GET      | /api/v1/sessions/{id}          | セッション詳細取得     | 必要 |
| POST     | /api/v1/sessions               | セッション作成         | 必要 |
| PATCH    | /api/v1/sessions/{id}          | セッション更新         | 必要 |
| DELETE   | /api/v1/sessions/{id}          | セッション削除         | 必要 |
| GET      | /api/v1/sessions/{id}/messages | メッセージ一覧取得     | 必要 |
| POST     | /api/v1/sessions/{id}/messages | メッセージ追加         | 必要 |
| GET      | /api/v1/sessions/{id}/export   | セッションエクスポート | 必要 |
| POST     | /api/v1/sessions/export/batch  | 一括エクスポート       | 必要 |
| GET      | /api/v1/sessions/{id}/preview  | エクスポートプレビュー | 必要 |

**実装ファイル**:

| 種別        | パス                                                                  |
| ----------- | --------------------------------------------------------------------- |
| 型定義      | `packages/shared/src/types/chat-session.ts`                           |
| 型定義      | `packages/shared/src/types/chat-message.ts`                           |
| リポジトリ  | `packages/shared/src/repositories/chat-session-repository.ts`         |
| リポジトリ  | `packages/shared/src/repositories/chat-message-repository.ts`         |
| サービス    | `packages/shared/src/features/chat-history/chat-history-service.ts`   |
| IPCチャネル | `packages/shared/src/ipc/channels.ts`                                 |
| 詳細設計    | `docs/30-workflows/chat-history-persistence/api-design.md`            |
| OpenAPI仕様 | `docs/30-workflows/chat-history-persistence/openapi-chat-export.yaml` |

**デスクトップアプリUI実装**:

```
apps/desktop/src/
├── renderer/
│   └── views/
│       └── ChatHistoryView/
│           └── index.tsx           # チャット履歴詳細ビュー
└── components/
    └── chat/
        ├── index.ts                # コンポーネントエクスポート
        ├── types.ts                # チャットUI型定義
        ├── ChatHistoryList.tsx     # セッション一覧
        ├── ChatHistoryListItem.tsx # セッションアイテム
        ├── ChatHistoryListStates.tsx # 一覧状態コンポーネント
        ├── ChatHistorySearch.tsx   # 検索・フィルター
        ├── ChatHistoryExport.tsx   # エクスポートダイアログ
        ├── DeleteConfirmDialog.tsx # 削除確認ダイアログ
        └── chat-search-utils.ts    # 検索ユーティリティ
```

**ルーティング**:

| パス                       | コンポーネント  | 説明                   |
| -------------------------- | --------------- | ---------------------- |
| `/chat/history/:sessionId` | ChatHistoryView | セッション詳細表示     |
| `/chat/history`            | -（未実装）     | セッション一覧（TODO） |

**エクスポートAPI詳細**:

エクスポートエンドポイントは以下のクエリパラメータをサポート:

| パラメータ      | 型                   | 説明                                        |
| --------------- | -------------------- | ------------------------------------------- |
| format          | `markdown` \| `json` | エクスポート形式（デフォルト: markdown）    |
| range           | `all` \| `selected`  | エクスポート範囲（デフォルト: all）         |
| messageIds      | string[]             | 選択メッセージID（range=selected時必須）    |
| includeMetadata | boolean              | LLMメタデータを含めるか（デフォルト: true） |
| download        | boolean              | ファイルダウンロードモード                  |

**レスポンス形式**:

- Markdown形式: `Content-Type: text/markdown; charset=utf-8`
- JSON形式: `Content-Type: application/json; charset=utf-8`
- 一括エクスポート: `Content-Type: application/zip`

---

## Desktop IPC API（認証・プロフィール）

### 認証 IPC チャネル

Electron Desktop アプリでは、IPC 通信で認証機能を提供する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/authHandlers.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload公開: `apps/desktop/src/preload/index.ts`

**チャンネル一覧**:

| チャネル            | 用途                 | Request                       | Response                           | 実装箇所            | セキュリティ       |
| ------------------- | -------------------- | ----------------------------- | ---------------------------------- | ------------------- | ------------------ |
| `auth:login`        | OAuth ログイン開始   | `{ provider: OAuthProvider }` | `IPCResponse<void>`                | authHandlers.ts:77  | withValidation適用 |
| `auth:logout`       | ログアウト           | なし                          | `IPCResponse<void>`                | authHandlers.ts:145 | withValidation適用 |
| `auth:get-session`  | セッション取得       | なし                          | `IPCResponse<AuthSession>`         | authHandlers.ts:187 | withValidation適用 |
| `auth:refresh`      | トークンリフレッシュ | なし                          | `IPCResponse<AuthSession>`         | authHandlers.ts     | withValidation適用 |
| `auth:check-online` | オンライン状態確認   | なし                          | `IPCResponse<{ online: boolean }>` | authHandlers.ts     | withValidation適用 |

### プロフィール IPC チャネル

| チャネル                | 用途                 | Request                            | Response                        |
| ----------------------- | -------------------- | ---------------------------------- | ------------------------------- |
| `profile:get`           | プロフィール取得     | なし                               | `IPCResponse<UserProfile>`      |
| `profile:update`        | プロフィール更新     | `{ updates: ProfileUpdateFields }` | `IPCResponse<UserProfile>`      |
| `profile:get-providers` | 連携プロバイダー一覧 | なし                               | `IPCResponse<LinkedProvider[]>` |
| `profile:link-provider` | 新規プロバイダー連携 | `{ provider: OAuthProvider }`      | `IPCResponse<LinkedProvider>`   |

### イベントチャネル（Main → Renderer）

| チャネル             | 用途             | Payload                                           |
| -------------------- | ---------------- | ------------------------------------------------- |
| `auth:state-changed` | 認証状態変更通知 | `{ authenticated: boolean; tokens?: AuthTokens }` |

### 型定義

```typescript
type OAuthProvider = "google" | "github" | "discord";

interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  isOffline: boolean;
}

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

interface LinkedProvider {
  provider: OAuthProvider;
  providerId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
}

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
```

### 認証状態管理

**状態遷移**:

```
checking → authenticated: セッション復元成功
checking → unauthenticated: セッションなし
unauthenticated → authenticated: ログイン成功
authenticated → unauthenticated: ログアウト
```

**状態とUI表示の対応**:

| 状態            | AuthGuard表示内容 | 説明                   |
| --------------- | ----------------- | ---------------------- |
| checking        | LoadingScreen     | セッション確認中       |
| authenticated   | children          | 認証済み（メインUI）   |
| unauthenticated | AuthView          | 未認証（ログイン画面） |

**実装コンポーネント**:

| コンポーネント | ファイル                                     | 責務                   |
| -------------- | -------------------------------------------- | ---------------------- |
| AuthGuard      | `components/AuthGuard/index.tsx`             | 認証状態による表示制御 |
| useAuthState   | `components/AuthGuard/hooks/useAuthState.ts` | 認証状態取得フック     |
| getAuthState   | `components/AuthGuard/utils/getAuthState.ts` | 状態判定純粋関数       |
| LoadingScreen  | `components/AuthGuard/LoadingScreen.tsx`     | ローディング画面       |
| AuthView       | `views/AuthView/index.tsx`                   | ログイン画面           |

### IPCセキュリティ実装

**withValidationラッパー**:

すべての認証関連IPCハンドラーは`withValidation`でラップされ、以下を検証:

1. webContentsに対応するBrowserWindowの存在確認
2. DevToolsからの呼び出し検出・拒否
3. 許可されたウィンドウリストとの照合

**実装ファイル**: `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`

**チャンネルホワイトリスト**:

認証関連チャンネルは`channels.ts`で明示的に許可リストに登録:

```typescript
// apps/desktop/src/preload/channels.ts
export const ALLOWED_CHANNELS = {
  invoke: [
    IPC_CHANNELS.AUTH.LOGIN, // "auth:login"
    IPC_CHANNELS.AUTH.LOGOUT, // "auth:logout"
    IPC_CHANNELS.AUTH.GET_SESSION, // "auth:get-session"
    IPC_CHANNELS.AUTH.REFRESH, // "auth:refresh"
    IPC_CHANNELS.AUTH.CHECK_ONLINE, // "auth:check-online"
    // ...
  ],
  on: [
    IPC_CHANNELS.AUTH.STATE_CHANGED, // "auth:state-changed"
    // ...
  ],
} as const;
```

### Agent Dashboard IPC チャネル

Electronデスクトップアプリでは、IPC通信でスキル管理・エージェント実行機能を提供する。

**実装ファイル**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- 型定義: `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- 設計書: `docs/30-workflows/agent-dashboard-foundation/outputs/phase-2/ipc-channel-design.md`

**チャンネル一覧**:

| チャネル               | 方向            | 用途               | Request                     | Response                |
| ---------------------- | --------------- | ------------------ | --------------------------- | ----------------------- |
| `agent:get-skills`     | Renderer → Main | スキル一覧取得     | なし                        | `{ skills: Skill[] }`   |
| `agent:get-skill-detail` | Renderer → Main | スキル詳細取得   | `{ skillId: string }`       | `{ skill: SkillDetail }`|
| `agent:execute`        | Renderer → Main | エージェント実行   | `ExecuteRequest`            | `{ executionId: string }` |
| `agent:abort`          | Renderer → Main | 実行中断           | `{ executionId: string }`   | `{ success: boolean }`  |
| `agent:get-status`     | Renderer → Main | ステータス取得     | なし                        | `GetStatusResponse`     |
| `agent:status-changed` | Main → Renderer | ステータス変更通知 | -                           | `StatusChangedEvent`    |
| `agent:stream-chunk`   | Main → Renderer | 出力ストリーム     | -                           | `StreamChunkEvent`      |
| `agent:stream-end`     | Main → Renderer | ストリーム終了     | -                           | `StreamEndEvent`        |
| `agent:stream-error`   | Main → Renderer | エラー通知         | -                           | `StreamErrorEvent`      |

**型定義**:

| 型名           | 説明                     |
| -------------- | ------------------------ |
| `Skill`        | スキル基本情報           |
| `SkillDetail`  | スキル詳細（Anchor含む） |
| `Anchor`       | 参照文献・適用方法       |
| `AgentState`   | Zustand状態              |
| `AgentActions` | Zustandアクション        |

**Skill型**:

| プロパティ    | 型         | 説明                   |
| ------------- | ---------- | ---------------------- |
| `id`          | `string`   | 一意識別子             |
| `name`        | `string`   | スキル名               |
| `description` | `string`   | 説明文                 |
| `path`        | `string`   | スキルファイルパス     |
| `triggers`    | `string[]` | トリガーキーワード     |
| `category`    | `string?`  | カテゴリ（任意）       |

**Anchor型**:

| プロパティ    | 型       | 説明               |
| ------------- | -------- | ------------------ |
| `source`      | `string` | 参照元（書籍等）   |
| `application` | `string` | 適用方法           |
| `purpose`     | `string` | 目的               |

**実装状況**:

| 項目                 | 状態   | タスク    |
| -------------------- | ------ | --------- |
| チャネル定数定義     | 完了   | AGENT-001 |
| ホワイトリスト追加   | 完了   | AGENT-001 |
| Zustand agentSlice   | 完了   | AGENT-001 |
| AgentView UI         | 完了   | AGENT-001 |
| IPCハンドラー実装    | 未実装 | AGENT-005 |
| Preload API実装      | 未実装 | AGENT-002 |

---

### Workspace Chat Edit IPC チャネル

Electronデスクトップアプリでは、IPC通信でワークスペースチャット編集機能を提供する。
AIによるコード編集支援（ファイルコンテキスト付きチャット、差分生成・適用）を実現する。

**実装ファイル**:

- 型定義: `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts`
- Slice: `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts`
- Hooks: `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/`
- テスト: `apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/`

**チャンネル一覧**:

| チャネル                   | 方向            | 用途                     | Request                                           | Response                         |
| -------------------------- | --------------- | ------------------------ | ------------------------------------------------- | -------------------------------- |
| `chat-edit:read-file`      | Renderer → Main | ファイル内容読み込み     | `{ filePath: string }`                            | `IPCResponse<FileContext>`       |
| `chat-edit:write-file`     | Renderer → Main | ファイル書き込み         | `{ filePath: string, content: string }`           | `IPCResponse<void>`              |
| `chat-edit:get-selection`  | Renderer → Main | エディタ選択範囲取得     | なし                                              | `IPCResponse<TextSelection>`     |
| `chat-edit:send-with-context` | Renderer → Main | コンテキスト付きチャット | `{ contexts: FileContext[], command: EditCommand }` | `IPCResponse<GeneratedResult>` |

**型定義**:

```typescript
// ファイルコンテキスト（最大10件）
interface FileContext {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  language: string;
  selection?: TextSelection;
  addedAt: number;
}

// テキスト選択範囲
interface TextSelection {
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  selectedText: string;
}

// 編集コマンド
interface EditCommand {
  instruction: string;
  targetFiles: string[];
  mode: 'generate' | 'edit' | 'refactor';
}

// 生成結果
interface GeneratedResult {
  id: string;
  originalContent: string;
  generatedContent: string;
  diff: DiffHunk[];
  status: 'pending' | 'applied' | 'rejected';
  createdAt: number;
}

// 差分ハンク
interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}
```

**定数**:

| 定数名            | 値      | 説明                       |
| ----------------- | ------- | -------------------------- |
| MAX_FILE_CONTEXTS | 10      | 最大添付ファイル数         |
| MAX_FILE_SIZE     | 10MB    | ファイルサイズ上限         |
| MAX_CONTEXT_SIZE  | 100KB   | コンテキストサイズ上限     |

**関連Hooks**:

| Hook名           | 責務                               |
| ---------------- | ---------------------------------- |
| useFileContext   | ファイルコンテキスト管理（追加/削除/バリデーション） |
| useDiffApply     | 差分適用ロジック（LCS、適用/却下/Undo）            |

**実装状況**:

| 項目               | 状態     | 備考                              |
| ------------------ | -------- | --------------------------------- |
| 型定義             | 完了     | types/index.ts                    |
| chatEditSlice      | 完了     | Zustand状態管理                   |
| useFileContext     | 完了     | ファイルコンテキストHook          |
| useDiffApply       | 完了     | 差分適用Hook                      |
| UIコンポーネント   | 未実装   | 別タスク（task-workspace-chat-edit-ui-components） |
| Main Processサービス | **完了** | FileService, ContextBuilder, ChatEditService |
| IPCハンドラー      | **完了** | chatEditHandlers.ts               |

**関連ドキュメント**:

| ドキュメント             | パス                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| 設計書                   | `docs/30-workflows/workspace-chat-edit/outputs/phase-2/`           |
| テスト仕様               | `docs/30-workflows/workspace-chat-edit/outputs/phase-4/`           |
| 実装ガイド（Renderer）   | `docs/30-workflows/workspace-chat-edit/outputs/phase-12/implementation-guide.md` |
| 実装ガイド（Main Process） | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-12/implementation-guide.md` |

**完了タスク**:

### Workspace Chat Edit Main Process（2026-01-25完了）

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-WCE-MAIN-001                                              |
| Issue        | #469                                                           |
| ステータス   | **完了**                                                       |
| 実装内容     | FileService, ContextBuilder, ChatEditService, chatEditHandlers |
| テスト数     | 164（自動）+ 23（手動検証項目）                                |
| カバレッジ   | Line 92.55%, Branch 92.85%                                     |
| ドキュメント | `docs/30-workflows/workspace-chat-edit-main-process/`          |

---

### AI/チャット IPC チャネル

Electronデスクトップアプリでは、IPC通信でAIチャット機能とLLM選択機能を提供する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/aiHandlers.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

**チャンネル一覧**:

| チャネル              | 用途                            | Request        | Response                  | 実装箇所              |
| --------------------- | ------------------------------- | -------------- | ------------------------- | --------------------- |
| `AI_CHAT`             | LLMへのメッセージ送信と応答取得 | AIChatRequest  | AIChatResponse            | aiHandlers.ts:21-89   |
| `AI_CHECK_CONNECTION` | LLM/RAG接続状態確認             | なし           | AICheckConnectionResponse | aiHandlers.ts:93-112  |
| `AI_INDEX`            | RAGドキュメントインデックス作成 | AIIndexRequest | AIIndexResponse           | aiHandlers.ts:116-143 |

**型定義詳細**: 型定義は[コアインターフェース 6.9](./06-core-interfaces.md#69-llm-チャット関連型定義desktop-ipc)を参照。

**LLM選択状態管理**:

- **Store**: Zustand chatSlice
- **状態**: currentProviderId（"openai" | "anthropic" | "google" | "xai"）、currentModelId
- **初期値**: OpenAI gpt-5.2-instant
- **切り替え**: リアルタイム（確認ダイアログなし）

**対応LLMプロバイダー**:

| プロバイダー | モデル例                         | コンテキストウィンドウ |
| ------------ | -------------------------------- | ---------------------- |
| OpenAI       | gpt-5.2-instant, gpt-4           | 400K, 8K               |
| Anthropic    | claude-sonnet-4.5, claude-3-opus | 200K (1M beta), 200K   |
| Google       | gemini-3-flash, gemini-pro       | 1M, 32K                |
| xAI          | grok-4.1-fast, grok-1            | 2M, 8K                 |

**統合仕様**:

- LLM選択とシステムプロンプトは独立して設定可能
- メッセージ送信時、両方の設定を`AI_CHAT` IPCリクエストに含める
- プロバイダー/モデル切り替え時もシステムプロンプトは保持される
- 会話履歴は保持されるが、各モデルは独立して動作

**セキュリティ考慮事項**:

| 項目                       | 対策                                          |
| -------------------------- | --------------------------------------------- |
| APIキー保護                | Electron SafeStorageで暗号化保存              |
| プロンプトインジェクション | ローカルアプリのため影響限定的                |
| XSS攻撃                    | React自動エスケープ + IPC経由で文字列のみ送信 |
| レート制限対応             | プロバイダー側のレート制限エラーを通知        |

**参照**:

- 詳細仕様: [アーキテクチャ設計 5.8.7](./05-architecture.md#587-ipcチャネル設計チャットllm選択)
- 型定義: [コアインターフェース 6.9](./06-core-interfaces.md#69-llm-チャット関連型定義desktop-ipc)
- UI仕様: [UI/UX 16.19](./16-ui-ux-guidelines.md#1619-llm選択機能chat-llm-switching)

---

## Slide IPC API（スライド同期）

### 概要

スライドプレゼンテーション機能における双方向同期のIPCチャンネル。Reveal.js HTML（index.html）とstructure.md間の同期状態を管理する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/slide/sync-manager.ts`
- ファイル監視: `apps/desktop/src/main/slide/file-watcher.ts`
- スキル実行: `apps/desktop/src/main/slide/skill-executor.ts`
- 型定義: `packages/shared/src/slide/types.ts`

### チャンネル一覧

| チャネル               | 方向            | 用途                 | Payload                              |
| ---------------------- | --------------- | -------------------- | ------------------------------------ |
| `slide:sync-status`    | Main → Renderer | 同期状態通知         | `{ status: SyncStatus, direction: SyncDirection }` |
| `slide:sync-progress`  | Main → Renderer | 同期進捗通知         | `{ percent: number, message: string }` |
| `slide:reverse-sync`   | Renderer → Main | 逆同期手動トリガー   | `{ projectPath: string }`            |
| `slide:sync-error`     | Main → Renderer | 同期エラー通知       | `{ code: string, message: string }`  |
| `slide:watch-start`    | Renderer → Main | ファイル監視開始     | `{ projectPath: string }`            |
| `slide:watch-stop`     | Renderer → Main | ファイル監視停止     | `{ projectPath: string }`            |

### 型定義

```typescript
// 同期状態
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

// 同期方向
type SyncDirection = 'forward' | 'reverse';

// 同期状態通知ペイロード
interface SyncStatusPayload {
  status: SyncStatus;
  direction: SyncDirection;
  timestamp: number;
}

// 同期進捗ペイロード
interface SyncProgressPayload {
  percent: number;
  message: string;
}

// 同期エラーペイロード
interface SyncErrorPayload {
  code: 'AGENT_ERROR' | 'FILE_ERROR' | 'TIMEOUT' | 'VALIDATION_ERROR';
  message: string;
  details?: unknown;
}
```

### 同期フロー

```
1. ユーザーがindex.htmlを編集
2. FileWatcherがonHtmlChangeイベントを発火
3. SyncManagerがreverseSync()を開始
   → slide:sync-status { status: 'syncing', direction: 'reverse' }
4. SkillExecutorがModifierSkillを実行
   → slide:sync-progress { percent: 50, message: 'AI分析中...' }
5. structure.mdを更新
   → slide:sync-status { status: 'synced', direction: 'reverse' }
6. changeContextMapに記録（無限ループ防止）
```

### エラーコード

| コード             | 説明                       | 対処                           |
| ------------------ | -------------------------- | ------------------------------ |
| `AGENT_ERROR`      | Agent SDK呼び出し失敗      | API接続確認、リトライ          |
| `FILE_ERROR`       | ファイル読み書き失敗       | パーミッション確認             |
| `TIMEOUT`          | 同期タイムアウト（30秒）   | 処理の再試行                   |
| `VALIDATION_ERROR` | レスポンス形式不正         | Agent出力確認                  |

### 実装状態

| コンポーネント | 状態                 | 備考                           |
| -------------- | -------------------- | ------------------------------ |
| IPCチャンネル  | 設計完了             | SDK統合時に実装                |
| 同期ロジック   | 実装完了             | シミュレーション環境で動作確認 |
| エラー通知     | 実装完了             | 全エラーコード対応済み         |

### 関連ドキュメント

| ドキュメント         | パス                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| IPC設計詳細          | `docs/30-workflows/slide-reverse-sync/outputs/phase-2/ipc-design.md`         |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` |

---

## エンドポイント命名規則

### 命名パターン

| パターン     | 例                           | 説明             |
| ------------ | ---------------------------- | ---------------- |
| コレクション | /api/v1/workflows            | 複数形を使用     |
| 個別リソース | /api/v1/workflows/{id}       | ID指定           |
| サブリソース | /api/v1/workflows/{id}/steps | 親子関係         |
| アクション   | /api/v1/workflows/{id}/retry | 動詞が必要な操作 |

### 禁止パターン

| パターン                 | 理由              | 正しい例               |
| ------------------------ | ----------------- | ---------------------- |
| /api/v1/getWorkflows     | URLに動詞を含める | /api/v1/workflows      |
| /api/v1/workflow         | 単数形を使用      | /api/v1/workflows      |
| /api/v1/workflows/create | POSTで十分        | POST /api/v1/workflows |

---

## Electron IPC API設計

デスクトップアプリでは、Renderer Process と Main Process 間の通信に IPC（Inter-Process Communication）を使用する。

### IPC設計原則

| 原則                   | 説明                                     |
| ---------------------- | ---------------------------------------- |
| contextIsolation       | Preloadスクリプトでのみ通信APIを公開     |
| チャネルホワイトリスト | 許可されたチャネルのみ通信可能           |
| sender検証             | withValidation()でリクエスト元を検証     |
| 型安全性               | 全チャネルに対してTypeScript型定義を適用 |

### APIキー管理 IPC チャネル

| チャネル          | メソッド | 引数                   | 戻り値                          | 公開先    |
| ----------------- | -------- | ---------------------- | ------------------------------- | --------- |
| `apiKey:save`     | invoke   | `{ provider, apiKey }` | `IPCResponse<void>`             | Renderer  |
| `apiKey:delete`   | invoke   | `{ provider }`         | `IPCResponse<void>`             | Renderer  |
| `apiKey:validate` | invoke   | `{ provider, apiKey }` | `IPCResponse<ValidationResult>` | Renderer  |
| `apiKey:list`     | invoke   | なし                   | `IPCResponse<ProviderStatus[]>` | Renderer  |
| `apiKey:get`      | invoke   | `{ provider }`         | `string \| null`                | Main Only |

**セキュリティ注意**: `apiKey:get` はRenderer Processに公開しない（Main Process内部使用のみ）

### 認証 IPC チャネル

| チャネル             | メソッド | 引数                           | 戻り値                        |
| -------------------- | -------- | ------------------------------ | ----------------------------- |
| `auth:sign-in`       | invoke   | `{ provider }`                 | `IPCResponse<AuthResult>`     |
| `auth:sign-out`      | invoke   | なし                           | `IPCResponse<void>`           |
| `auth:get-session`   | invoke   | なし                           | `IPCResponse<Session>`        |
| `auth:link-provider` | invoke   | `{ provider }`                 | `IPCResponse<LinkedProvider>` |
| `profile:get`        | invoke   | なし                           | `IPCResponse<UserProfile>`    |
| `profile:update`     | invoke   | `{ displayName?, avatarUrl? }` | `IPCResponse<UserProfile>`    |
| `profile:delete`     | invoke   | `{ confirmEmail }`             | `IPCResponse<void>`           |

### プロフィール設定 IPC チャネル

| チャネル                       | メソッド | 引数                       | 戻り値                             |
| ------------------------------ | -------- | -------------------------- | ---------------------------------- |
| `profile:update-notifications` | invoke   | `{ notificationSettings }` | `IPCResponse<ExtendedUserProfile>` |
| `profile:export`               | invoke   | なし                       | `ProfileExportResponse`            |
| `profile:import`               | invoke   | `{ filePath }`             | `ProfileImportResponse`            |

**通知設定オブジェクト**:

```typescript
interface NotificationSettings {
  email: boolean; // メール通知
  desktop: boolean; // デスクトップ通知
  sound: boolean; // 通知音
  workflowComplete: boolean; // ワークフロー完了通知
  workflowError: boolean; // ワークフローエラー通知
}
```

**エクスポートデータ形式**:

```typescript
interface ProfileExportData {
  version: "1.0";
  exportedAt: string; // ISO 8601
  displayName: string;
  timezone: string; // IANA タイムゾーン
  locale: string; // ja, en など
  notificationSettings: NotificationSettings;
  preferences: Record<string, unknown>;
  linkedProviders?: LinkedProvider[]; // 連携プロバイダー一覧
  accountCreatedAt?: string;
  plan?: string;
}
```

**セキュリティ注意**: エクスポートデータには email, avatarUrl, id, APIキーを含めない

### IPCレスポンス形式

```
成功時:
{
  success: true,
  data: <T>
}

失敗時:
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "エラーメッセージ"
  }
}
```

### IPC エラーコード

| コード               | 説明                 | 対処                         |
| -------------------- | -------------------- | ---------------------------- |
| `INVALID_SENDER`     | 不正なリクエスト元   | DevTools等からの不正アクセス |
| `PROVIDER_NOT_FOUND` | 未対応プロバイダー   | サポート対象を確認           |
| `VALIDATION_FAILED`  | バリデーションエラー | 入力値を確認                 |
| `STORAGE_ERROR`      | ストレージ操作失敗   | safeStorage利用可否確認      |
| `NETWORK_ERROR`      | ネットワーク障害     | 接続状態を確認               |

---

## AIプロバイダーAPI連携

### 対応プロバイダー

| プロバイダー | API ベースURL                                  | 認証方式         |
| ------------ | ---------------------------------------------- | ---------------- |
| OpenAI       | `https://api.openai.com/v1`                    | Bearer Token     |
| Anthropic    | `https://api.anthropic.com/v1`                 | x-api-key Header |
| Google AI    | `https://generativelanguage.googleapis.com/v1` | Query Parameter  |
| xAI          | `https://api.x.ai/v1`                          | Bearer Token     |

### APIキー検証エンドポイント

| プロバイダー | メソッド | エンドポイント         | 検証方法                     |
| ------------ | -------- | ---------------------- | ---------------------------- |
| OpenAI       | GET      | `/models`              | モデル一覧取得成功で有効判定 |
| Anthropic    | POST     | `/messages`            | 最小リクエスト送信で認証確認 |
| Google AI    | GET      | `/models?key={apiKey}` | モデル一覧取得成功で有効判定 |
| xAI          | GET      | `/models`              | モデル一覧取得成功で有効判定 |

### HTTPステータスと検証結果マッピング

| HTTPステータス | 検証結果        | 意味                               |
| -------------- | --------------- | ---------------------------------- |
| 200-299        | `valid`         | APIキー有効                        |
| 401            | `invalid`       | 認証失敗（キー無効または期限切れ） |
| 403            | `invalid`       | アクセス拒否                       |
| 429            | `valid`         | レートリミット（認証は成功）       |
| 500-504        | `network_error` | サーバーエラー                     |
| タイムアウト   | `timeout`       | 接続タイムアウト（10秒）           |

---

## エンティティ抽出サービス (NER)

### 概要

チャンクからエンティティを抽出する内部サービス。現在はElectronアプリ内部で使用され、外部REST APIは未公開。

**実装場所**: `packages/shared/src/services/extraction/`

### 内部サービスAPI

NERサービスは`IEntityExtractor`インターフェースを通じて利用する。

**基本使用例**:

```typescript
import { RuleBasedEntityExtractor, LLMEntityExtractor } from "@repo/shared/services/extraction";

// ルールベース抽出器（高速・フォールバック用）
const ruleExtractor = new RuleBasedEntityExtractor();

// LLMベース抽出器（高精度）
const llmExtractor = new LLMEntityExtractor(llmProvider);

// 単一チャンクから抽出
const result = await extractor.extract(chunk, {
  types: ["technology", "organization"],
  minConfidence: 0.7
});

// バッチ抽出
const batchResult = await extractor.extractBatch(chunks);

// 結果マージ（重複除去）
const mergedEntities = extractor.mergeEntities(batchResult.data.results);
```

### IEntityExtractor インターフェース

| メソッド        | 説明                               | 戻り値                            |
| --------------- | ---------------------------------- | --------------------------------- |
| `extract()`     | 単一チャンクからエンティティ抽出   | `Result<ExtractionResult, Error>` |
| `extractBatch()`| 複数チャンクからバッチ抽出         | `Result<BatchExtractionResult, Error>` |
| `mergeEntities()`| 抽出結果のマージ（重複除去）      | `ExtractedEntity[]`               |

### EntityExtractionOptions

| オプション           | 型        | デフォルト | 説明                        |
| -------------------- | --------- | ---------- | --------------------------- |
| types                | string[]  | 全タイプ   | 抽出対象のエンティティタイプ |
| minConfidence        | number    | 0.5        | 最小信頼度閾値              |
| maxEntitiesPerChunk  | number    | 20         | チャンクあたり最大抽出数    |
| minNameLength        | number    | 2          | 最小名前長                  |
| generateDescriptions | boolean   | true       | 説明生成（LLMのみ）         |
| useLLM               | boolean   | true       | LLM使用フラグ               |

### 将来的なREST API（予定）

将来的にREST APIとして公開する場合の設計案:

| メソッド | パス                              | 説明                       | 認証 |
| -------- | --------------------------------- | -------------------------- | ---- |
| POST     | /api/v1/extraction/entities       | テキストからエンティティ抽出 | 必要 |
| POST     | /api/v1/extraction/entities/batch | バッチエンティティ抽出     | 必要 |

**リクエスト例（POST /api/v1/extraction/entities）**:
```json
{
  "content": "TypeScriptはMicrosoftが開発した言語です",
  "options": {
    "types": ["technology", "organization"],
    "minConfidence": 0.7
  }
}
```

**レスポンス例**:
```json
{
  "entities": [
    {
      "name": "TypeScript",
      "normalizedName": "typescript",
      "type": "technology",
      "confidence": 0.9,
      "mentions": [{ "startPosition": 0, "endPosition": 10 }]
    },
    {
      "name": "Microsoft",
      "normalizedName": "microsoft",
      "type": "organization",
      "confidence": 0.9,
      "mentions": [{ "startPosition": 12, "endPosition": 21 }]
    }
  ],
  "processingTimeMs": 45
}
```

### エラーハンドリング

| エラークラス       | 説明                     | 対処                         |
| ------------------ | ------------------------ | ---------------------------- |
| `LLMProviderError` | LLM API呼び出し失敗      | ルールベースにフォールバック |
| `JsonParseError`   | LLMレスポンスのJSON不正  | ルールベースにフォールバック |
| `ValidationError`  | 入力バリデーション失敗   | エラーメッセージを返却       |

---
