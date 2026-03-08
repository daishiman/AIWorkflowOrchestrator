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

## 仕様書インデックス

本ドキュメントは巨大化防止のため、機能領域ごとに分割されています。

| ドキュメント                        | 内容                                              | 読み込み条件                |
| ----------------------------------- | ------------------------------------------------- | --------------------------- |
| interfaces-agent-sdk-skill.md       | Skill Dashboard、SkillImportStore、ModifierSkill  | スキル管理UI実装時          |
| interfaces-agent-sdk-ui.md          | Agent Execution UI、AgentSDKPage                  | 実行画面UI実装時            |
| interfaces-agent-sdk-integration.md | Claude CLI統合、Session Persistence、Skill Import | 統合機能実装時              |
| interfaces-agent-sdk-executor.md    | SkillExecutor、PermissionResolver                 | 実行エンジン/権限確認実装時 |
| interfaces-agent-sdk-history.md     | 完了タスク、残課題、変更履歴                      | 実装履歴確認時              |

---

## アーキテクチャ

本システムは3層構成で、Renderer ProcessからClaude Agent SDKまでをIPC通信とHTTPS通信で接続する。

### レイヤー構成

| レイヤー         | コンポーネント              | 役割                                         |
| ---------------- | --------------------------- | -------------------------------------------- |
| Renderer Process | React UI                    | `window.agentAPI.query()` によるユーザー操作 |
| (通信層)         | IPC (contextBridge)         | Renderer → Main のプロセス間通信             |
| Main Process     | IPC Handler (agent-handler) | IPCリクエストの受信・処理                    |
| Main Process     | Agent Client (@repo/shared) | SDK呼び出しのラッパー                        |
| (通信層)         | HTTPS                       | Main → Cloud の外部API通信                   |
| External         | Claude Agent SDK            | Anthropic Cloud Serviceが提供するAI機能      |

### データフロー

1. **Renderer → Main**: React UIから `window.agentAPI.query()` を呼び出し、contextBridge経由でIPCメッセージを送信
2. **Main内部処理**: IPC HandlerがリクエストをAgent Clientに委譲し、SDK呼び出しを実行
3. **Main → Cloud**: Agent ClientがHTTPS経由でClaude Agent SDKにリクエストを送信
4. **応答の逆流**: Cloud → Main → Renderer の順でストリーミング応答を返却

---

## 依存関係解決

### 必須: packages/shared への SDK 依存宣言

Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) を使用する場合、**import するパッケージ自身の `package.json` に依存を宣言する必要があります**。

**packages/shared/package.json**:

| シナリオ                              | 結果                         |
| ------------------------------------- | ---------------------------- |
| `apps/desktop` のみに SDK 依存を宣言  | テストPASS、ランタイムエラー |
| `packages/shared` にも SDK 依存を宣言 | テストPASS、ランタイムPASS   |

### トラブルシューティング

**エラー**: `ERR_MODULE_NOT_FOUND: Cannot find package '@anthropic-ai/claude-agent-sdk'`

**原因**: SDK を import しているパッケージ（`packages/shared`）に依存宣言がない

**解決策**: `pnpm --filter @repo/shared add @anthropic-ai/claude-agent-sdk` を実行

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

**戻り値**: `Promise<void>` - 中断処理完了時にresolve

> **UT-FIX-5-4 (2026-02-10)**: `void` → `Promise<void>` に修正。`safeInvoke()` 経由の IPC 通信であるため、戻り値は常に Promise。

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

すべてのエラーは `AgentError` を基底クラスとして継承する。

| エラークラス               | 継承元       | 用途                               |
| -------------------------- | ------------ | ---------------------------------- |
| `AgentError`               | (基底クラス) | 共通エラー処理・エラーコード管理   |
| `AgentInitializationError` | AgentError   | SDK初期化時のエラー                |
| `AgentQueryError`          | AgentError   | クエリ実行中のエラー               |
| `AgentTimeoutError`        | AgentError   | タイムアウト発生時のエラー         |
| `AgentAbortedError`        | AgentError   | ユーザーによる中断時のエラー       |
| `AgentSessionError`        | AgentError   | セッション管理関連のエラー         |
| `AgentValidationError`     | AgentError   | 入力値バリデーション失敗時のエラー |

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

| プロパティ       | 型               | 説明               |
| ---------------- | ---------------- | ------------------ |
| `id`             | `string`         | セッションID       |
| `createdAt`      | `number`         | 作成タイムスタンプ |
| `lastAccessedAt` | `number`         | 最終アクセス       |
| `context`        | `SessionContext` | コンテキスト情報   |

---

## 関連ドキュメント

| ドキュメント                        | 説明                         |
| ----------------------------------- | ---------------------------- |
| interfaces-agent-sdk-skill.md       | Skill Dashboard、SkillImport |
| interfaces-agent-sdk-ui.md          | Agent Execution UI           |
| interfaces-agent-sdk-integration.md | CLI統合、Session Persistence |
| interfaces-agent-sdk-executor.md    | SkillExecutor、Permission    |
| interfaces-agent-sdk-history.md     | 完了タスク、変更履歴         |
| architecture-monorepo.md            | pnpm依存解決ルール           |
| technology-devops.md                | DevOpsベストプラクティス     |

---

## SDK 型安全統合（TASK-9B-I）

> **実装完了**: 2026-02-12（TASK-9B-I-SDK-FORMAL-INTEGRATION）
> **参照**: [interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md) callSDKQuery 型安全化仕様

### 概要

SkillExecutor の `callSDKQuery()` から `as any` を完全除去し、Claude Agent SDK（`@anthropic-ai/claude-agent-sdk@0.2.30`）の実型に基づく型安全な統合を実現した。

### SDKQueryOptions の変更

| プロパティ       | 変更前                     | 変更後                                        | 説明                                |
| ---------------- | -------------------------- | --------------------------------------------- | ----------------------------------- |
| `apiKey`         | `apiKey: string`           | `env: { ANTHROPIC_API_KEY: string }`          | 環境変数形式でAPI Keyを渡す         |
| `signal`         | `signal: AbortSignal`      | `abortController: AbortController`            | AbortController インスタンスを渡す  |
| `permissionMode` | ローカル文字列リテラル型   | SDK 実型（`@anthropic-ai/claude-agent-sdk`）  | SDK の PermissionMode に準拠        |

### callSDKQuery Options マッピング

| SDK パラメータ             | SkillExecutor 内部値                    | 説明                                    |
| -------------------------- | --------------------------------------- | --------------------------------------- |
| `prompt`                   | `callSDKQuery` の第1引数（独立パラメータ） | 実行プロンプト                          |
| `env.ANTHROPIC_API_KEY`    | `getApiKey()` 経由で取得（独立パラメータ） | API Key を環境変数形式で渡す            |
| `abortController`          | `new AbortController()`                | SDK が内部で AbortSignal を取得         |
| `options.permissionMode`   | SDK PermissionMode 型                  | 型安全な権限モード（default/acceptEdits/bypassPermissions 等） |
| `tools`                    | DEFAULT_TOOLS 定数                     | Read, Edit, Bash, Glob, Grep            |

### SDK Query 戻り値の変更

| 変更前                                    | 変更後                                     |
| ----------------------------------------- | ------------------------------------------ |
| `conversation.stream()` で AsyncIterable  | `conversation` を直接 AsyncIterable として利用 |

### 実装上の課題と教訓

#### TypeScript モジュール解決の優先順位問題

SDK をインストールした環境では、`node_modules` 配下の実型定義がカスタム `declare module` よりも優先される。そのため、`packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` に定義していた `PermissionMode`（`auto`/`ask`/`deny`）は無視され、SDK 実型（`default`/`acceptEdits`/`bypassPermissions`/`plan`/`delegate`/`dontAsk`）が使用される。

| 状態 | 有効な型定義ソース | PermissionMode の値 |
|------|-------------------|-------------------|
| SDK 未インストール | カスタム `.d.ts` | `auto`/`ask`/`deny`（仮定義） |
| SDK インストール済み | `node_modules` 実型 | `default`/`acceptEdits`/`bypassPermissions`/`plan`/`delegate`/`dontAsk` |

**対策**: SDK インストール後はカスタム `.d.ts` を削除し、仕様書の型記載も SDK 実型に統一する。詳細は [architecture-implementation-patterns.md#S11](./architecture-implementation-patterns.md) を参照。

#### SDK パラメータの発見困難性

`query()` API の `options` パラメータのうち、`env: { ANTHROPIC_API_KEY }` と `abortController: AbortController` は公式ドキュメントに明記されていなかった。SDK の型定義ファイル（`node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts`）を直接読むことで発見した。詳細は [architecture-implementation-patterns.md#S12](./architecture-implementation-patterns.md) を参照。

### 関連未タスク

| タスクID     | タスク名                                       | 優先度 | 指示書                                                                                           |
| ------------ | ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| UT-9B-I-001  | カスタム型宣言ファイルと SDK 実型の共存整理     | 低     | `docs/30-workflows/completed-tasks/sdk-formal-integration/outputs/phase-12/ut-9b-i-001-custom-declare-module-cleanup.md` |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                               |
| ---------- | ---------- | ------------------------------------------------------ |
| 2026-02-12 | 6.33.1     | TASK-9B-I-SDK-FORMAL-INTEGRATION: SDK型安全統合セクションに「実装上の課題と教訓」追加（TypeScriptモジュール解決の優先順位問題、SDKパラメータの発見困難性） |
| 2026-02-12 | 6.33.0     | TASK-9B-I-SDK-FORMAL-INTEGRATION: SDK型安全統合セクション追加（SDKQueryOptions変更、callSDKQueryマッピング、戻り値変更） |
| 2026-01-28 | 6.32.0     | TASK-6-1完了、SkillSlice（Zustand状態管理）実装        |
| 2026-01-27 | 6.31.0     | TASK-5-1完了、SkillAPI Preload実装                     |
| 2026-01-26 | 1.1.0      | コードブロックを表形式・文章に変換（ガイドライン準拠） |
| 2026-01-26 | 6.30.0     | ファイル分割（巨大化防止）                             |
| 2026-01-26 | 6.29.0     | TASK-3-1-D完了、Permission UI実装                      |
| 2026-01-25 | 6.28.0     | TASK-3-2完了、SkillExecutor IPC統合                    |
| 2026-01-24 | 6.27.0     | TASK-2A完了、SkillScanner実装                          |
| 2026-01-23 | 6.26.0     | TASK-3-1-A完了、SkillExecutor実装                      |
