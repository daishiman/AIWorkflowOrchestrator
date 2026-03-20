# Agent SDK Integration 仕様

> 本ドキュメントは interfaces-agent-sdk.md の分割ファイルです。
> 親ファイル: interfaces-agent-sdk.md
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

Claude CLI統合、Session Persistence、Skill Import Agent Systemに関する型定義とAPI仕様。
統合機能実装時に参照する。

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

### アーキテクチャ

Electron Application内の2プロセス構成でClaude Code CLIと連携する。

#### プロセス構成

| プロセス         | 役割                       | 主要コンポーネント          |
| ---------------- | -------------------------- | --------------------------- |
| Renderer Process | ユーザーインターフェース   | React UI                    |
| Main Process     | CLI連携・ビジネスロジック  | ClaudeCliManager（Facade）  |
| 外部プロセス     | 実際のAI処理               | Claude Code CLI             |

#### Main Process 内部構成

ClaudeCliManagerがFacadeパターンを採用し、以下のコンポーネントを統括する。

| コンポーネント   | 略称 | 役割                           | 依存関係                |
| ---------------- | ---- | ------------------------------ | ----------------------- |
| ClaudeCliManager | -    | Facadeとして全機能を統括       | SM, SS, PMを管理        |
| SessionManager   | SM   | セッションライフサイクル管理   | PMに依存                |
| SkillScanner     | SS   | スキルディレクトリのスキャン   | 独立                    |
| ProcessManager   | PM   | CLIプロセスの起動・監視・終了  | Claude Code CLIを起動   |

#### データフロー

1. Renderer ProcessのReact UIがIPCでMain Processに要求を送信
2. ClaudeCliManagerが適切なコンポーネントに処理を委譲
3. ProcessManagerがClaude Code CLIをchild_processとして起動
4. 結果をIPCでRenderer Processに返却（ストリーミング対応）

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

| パターン | 型                                                             |
| -------- | -------------------------------------------------------------- |
| 成功     | `{ success: true; data: T }`                                   |
| 失敗     | `{ success: false; error: { code: string; message: string } }` |

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

---

## Session Persistence（セッション永続化）

### 概要

Agent SDKのセッション履歴をelectron-storeを使用してローカルに永続化する機能。

### 実装ファイル

| ファイル                       | パス                                      | 説明                   |
| ------------------------------ | ----------------------------------------- | ---------------------- |
| SessionStorage.ts              | `apps/desktop/src/main/services/session/` | electron-storeラッパー |
| SessionPersistenceService.ts   | `apps/desktop/src/main/services/session/` | ビジネスロジック       |
| session-persistence-handler.ts | `apps/desktop/src/main/ipc/`              | IPCハンドラー          |

### アーキテクチャ

Session Persistenceは3層アーキテクチャを採用し、Renderer ProcessからMain Processを経由してelectron-storeにデータを永続化する。

#### レイヤー構成

| レイヤー | プロセス         | コンポーネント               | 責務                                 |
| -------- | ---------------- | ---------------------------- | ------------------------------------ |
| UI層     | Renderer Process | AgentSDKPage                 | セッション一覧表示・選択・作成・削除 |
| IPC層    | Main Process     | session-persistence-handler  | IPCリクエストのルーティング          |
| Service層| Main Process     | SessionPersistenceService    | ビジネスロジック・バリデーション     |
| Storage層| Main Process     | SessionStorage               | electron-storeラッパー               |
| 永続化層 | Main Process     | electron-store               | JSONファイルへの永続化               |

#### データフロー

1. AgentSDKPage（Renderer）がIPC経由でセッション操作を要求
2. session-persistence-handlerがリクエストを受信
3. SessionPersistenceServiceがビジネスロジックを実行
4. SessionStorageがelectron-storeを通じてJSONファイルに永続化
5. 結果をIPC経由でRenderer Processに返却

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

#### PersistedMessage

永続化されたメッセージ情報。

| プロパティ  | 型                      | 必須 | 説明             |
| ----------- | ----------------------- | ---- | ---------------- |
| `id`        | `string`                | ✓    | UUID             |
| `sessionId` | `string`                | ✓    | 所属セッションID |
| `role`      | `'user' \| 'assistant'` | ✓    | メッセージ種別   |
| `content`   | `string`                | ✓    | メッセージ内容   |
| `timestamp` | `number`                | ✓    | タイムスタンプ   |

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

### IPC チャンネル（Session Persistence）

| チャンネル                     | 方向            | 説明               |
| ------------------------------ | --------------- | ------------------ |
| `session:persist:load`         | Renderer → Main | セッション一覧取得 |
| `session:persist:save`         | Renderer → Main | セッション保存     |
| `session:persist:delete`       | Renderer → Main | セッション削除     |
| `session:persist:update`       | Renderer → Main | セッション更新     |
| `session:persist:loadMessages` | Renderer → Main | メッセージ取得     |
| `session:persist:saveMessage`  | Renderer → Main | メッセージ保存     |
| `session:persist:clearAll`     | Renderer → Main | 全データ削除       |
| `session:persist:getStats`     | Renderer → Main | 統計情報取得       |
| `session:persist:cleanup`      | Renderer → Main | LRU削除実行        |

### ストレージファイル

| OS      | パス                                                                       |
| ------- | -------------------------------------------------------------------------- |
| macOS   | `~/Library/Application Support/AIWorkflowOrchestrator/agent-sessions.json` |
| Windows | `%APPDATA%/AIWorkflowOrchestrator/agent-sessions.json`                     |
| Linux   | `~/.config/AIWorkflowOrchestrator/agent-sessions.json`                     |

---

## Skill Import Agent System 型定義（TASK-1-1）

### 概要

TASK-1-1で実装された16の共通型定義。specification.md §5.1に基づく。

| カテゴリ         | 型数 | 説明                                         |
| ---------------- | ---- | -------------------------------------------- |
| スキルメタデータ | 4    | スキルの基本情報・構造を表す型               |
| 実行関連         | 3    | スキル実行のリクエスト/レスポンス/ステータス |
| ストリーミング   | 7    | 実行中のリアルタイムメッセージ型             |
| 権限確認         | 2    | 実行時の権限確認フロー型                     |

### スキルメタデータ型

#### SkillOtherFile

スキルディレクトリ直下のその他のファイル。

| プロパティ | 型                                          | 説明         |
| ---------- | ------------------------------------------- | ------------ |
| `filename` | `string`                                    | ファイル名   |
| `type`     | `'evals' \| 'logs' \| 'package' \| 'other'` | ファイル種別 |
| `size`     | `number`                                    | サイズ       |

#### SkillSubResource

スキル配下のサブリソース（agents/, references/, scripts/ 等）。

| プロパティ     | 型       | 必須 | 説明       |
| -------------- | -------- | ---- | ---------- |
| `filename`     | `string` | ✓    | ファイル名 |
| `relativePath` | `string` | ✓    | 相対パス   |
| `description`  | `string` | -    | 説明       |
| `size`         | `number` | ✓    | サイズ     |

#### SkillMetadata

スキルメタデータ（SKILL.md frontmatter + ディレクトリ構造）。

| プロパティ     | 型                   | 必須 | 説明             |
| -------------- | -------------------- | ---- | ---------------- |
| `name`         | `string`             | ✓    | スキル識別子     |
| `description`  | `string`             | ✓    | スキル説明       |
| `allowedTools` | `string[]`           | -    | 許可ツール       |
| `path`         | `string`             | ✓    | ディレクトリパス |
| `updatedAt`    | `Date`               | ✓    | 最終更新日時     |
| `agents`       | `SkillSubResource[]` | ✓    | エージェント     |
| `references`   | `SkillSubResource[]` | ✓    | リファレンス     |
| `scripts`      | `SkillSubResource[]` | ✓    | スクリプト       |
| `assets`       | `SkillSubResource[]` | ✓    | アセット         |
| `schemas`      | `SkillSubResource[]` | ✓    | スキーマ         |
| `indexes`      | `SkillSubResource[]` | ✓    | インデックス     |
| `otherFiles`   | `SkillOtherFile[]`   | ✓    | その他ファイル   |

#### ImportedSkill

インポート済みスキル（SkillMetadataを継承）。

| プロパティ   | 型                       | 必須 | 説明                   |
| ------------ | ------------------------ | ---- | ---------------------- |
| `importedAt` | `Date`                   | ✓    | インポート日時         |
| `status`     | `'active' \| 'disabled'` | ✓    | ステータス             |
| `content`    | `string`                 | -    | SKILL.md本文キャッシュ |

#### ScannedSkillMetadata

スキャンされたスキルメタデータ（TASK-2A追加）。

| プロパティ | 型        | 説明                                        |
| ---------- | --------- | ------------------------------------------- |
| `readonly` | `boolean` | 読み取り専用（~/.claude/skills/からはtrue） |

### 実行関連型

#### SkillExecutionRequest

| プロパティ         | 型       | 必須 | 説明             |
| ------------------ | -------- | ---- | ---------------- |
| `skillName`        | `string` | ✓    | スキル名         |
| `prompt`           | `string` | ✓    | プロンプト       |
| `workingDirectory` | `string` | -    | 作業ディレクトリ |

#### SkillExecutionResponse

| プロパティ    | 型        | 必須 | 説明                 |
| ------------- | --------- | ---- | -------------------- |
| `executionId` | `string`  | ✓    | UUID（Main側で生成） |
| `success`     | `boolean` | ✓    | 成功/失敗フラグ      |
| `error`       | `string`  | -    | エラーメッセージ     |

#### SkillExecutionStatus

| 値                   | 説明                             | 遷移元                           | 遷移先                              |
| -------------------- | -------------------------------- | -------------------------------- | ----------------------------------- |
| `idle`               | 待機中（初期状態）               | `error` / `cancelled` / `reuse_ready` / `improve_ready` | `running`                           |
| `running`            | 実行中                           | `idle` / `improve_ready`         | `completed` / `error` / `cancelled` |
| `permission_pending` | 権限待ち                         | `running`                        | `running` / `cancelled`             |
| `completed`          | 完了                             | `running`                        | `review` / `idle`                   |
| `cancelled`          | キャンセル                       | `running` / `permission_pending` | `idle`                              |
| `error`              | エラー                           | `running`                        | `idle`                              |
| `review`             | レビュー中（品質評価待ち）       | `completed`                      | `improve_ready` / `reuse_ready`     |
| `improve_ready`      | 改善準備完了（改善サイクル入り） | `review`                         | `running` / `idle`                  |
| `reuse_ready`        | 再利用準備完了                   | `review`                         | `idle`                              |

> **実装照合済み（2026-03-20）**: `packages/shared/src/types/skill.ts` の実値、`SkillStreamingView.tsx` の `STATUS_CONFIG`、`SkillLifecyclePanel.tsx` のローカル型と 9 値が一致していることを確認済み。

### ストリーミングメッセージ型

#### SkillStreamMessageType

| 値            | 説明                   |
| ------------- | ---------------------- |
| `assistant`   | アシスタントメッセージ |
| `tool_use`    | ツール使用             |
| `tool_result` | ツール結果             |
| `status`      | ステータス変更         |
| `error`       | エラー                 |

#### SkillStreamMessage（Discriminated Union）

型安全なストリーミングメッセージ。typeプロパティで型判別可能。

| プロパティ    | 型                       | 説明           |
| ------------- | ------------------------ | -------------- |
| `executionId` | `string`                 | 実行ID         |
| `type`        | `SkillStreamMessageType` | メッセージ種別 |
| `content`     | `MessageContent`         | 内容（型別）   |
| `timestamp`   | `number`                 | タイムスタンプ |

### 権限確認型

#### SkillPermissionRequest

| プロパティ    | 型                        | 必須 | 説明         |
| ------------- | ------------------------- | ---- | ------------ |
| `executionId` | `string`                  | ✓    | 実行ID       |
| `requestId`   | `string`                  | ✓    | リクエストID |
| `toolName`    | `string`                  | ✓    | ツール名     |
| `args`        | `Record<string, unknown>` | ✓    | 引数         |
| `reason`      | `string`                  | -    | 理由         |

#### SkillPermissionResponse

| プロパティ       | 型        | 必須 | 説明                                               |
| ---------------- | --------- | ---- | -------------------------------------------------- |
| `requestId`      | `string`  | ✓    | リクエストID                                       |
| `approved`       | `boolean` | ✓    | 許可/拒否                                          |
| `rememberChoice` | `boolean` | -    | 選択を記憶するか                                   |
| `rejectReason`   | `string`  | -    | 拒否理由                                           |
| `skip`           | `boolean` | -    | 拒否時にスキップ（中断しない）するか（UT-06-005） |

---

## 関連ドキュメント

| ドキュメント                     | 説明                       |
| -------------------------------- | -------------------------- |
| interfaces-agent-sdk.md          | 親ファイル（インデックス） |
| interfaces-agent-sdk-executor.md | SkillExecutor仕様          |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                               |
| ---------- | ---------- | ------------------------------------------------------ |
| 2026-01-26 | 1.1.0      | コードブロック（アーキテクチャ図）を表形式・文章に変換 |
| 2026-01-26 | 1.0.0      | interfaces-agent-sdk.mdから分割                        |
