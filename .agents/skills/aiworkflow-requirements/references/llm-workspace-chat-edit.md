# Workspace Chat Edit サービスインターフェース

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-llm.md](./interfaces-llm.md)

---

> **実装**: `apps/desktop/src/main/services/chat-edit/`
> **IPCハンドラー**: `apps/desktop/src/main/ipc/chatEditHandlers.ts`
> **テスト**: `apps/desktop/src/main/services/chat-edit/__tests__/`
> **詳細ガイド**: `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-12/implementation-guide.md`

## 概要

AIによるコード編集支援機能のMain Process側サービス。ファイルI/O、コンテキスト構築、LLM統合を担当する。

---

## FileService

ファイル読み書きと言語検出を担当するサービス。

### インターフェース

IFileServiceインターフェースは以下のメソッドを提供する。

| メソッド名 | 引数 | 戻り値 | 説明 |
| ---------- | ---- | ------ | ---- |
| readFile | filePath: string | Promise\<FileReadResult\> | ファイルを読み取る |
| writeFile | filePath: string, content: string, options?: FileWriteOptions | Promise\<FileWriteResult\> | ファイルに書き込む |
| detectLanguage | filePath: string | string | ファイルパスから言語を検出する |
| createBackup | filePath: string | Promise\<string\> | バックアップを作成し、バックアップパスを返す |

### 型定義

| 型名             | 説明                               |
| ---------------- | ---------------------------------- |
| FileReadResult   | ファイル読み取り結果（success/error/content/language/fileSize） |
| FileWriteResult  | ファイル書き込み結果（success/error/backupPath） |
| FileWriteOptions | 書き込みオプション（createBackup） |
| FileReadError    | 読み取りエラー（code/message）     |
| FileWriteError   | 書き込みエラー（code/message）     |

### エラーコード

| コード            | 説明                       | Retryable |
| ----------------- | -------------------------- | --------- |
| FILE_NOT_FOUND    | ファイルが存在しない       | No        |
| TOO_LARGE         | ファイルサイズ超過（10MB） | No        |
| PERMISSION_DENIED | 読み書き権限なし           | No        |
| INVALID_PATH      | 無効なパス・パストラバーサル検出 | No   |

### 定数

| 定数名        | 値     | 説明             |
| ------------- | ------ | ---------------- |
| MAX_FILE_SIZE | 10MB   | ファイルサイズ上限 |

---

## ContextBuilder

LLM向けコンテキスト文字列の構築を担当するサービス。

### インターフェース

IContextBuilderインターフェースは以下のメソッドを提供する。

| メソッド名 | 引数 | 戻り値 | 説明 |
| ---------- | ---- | ------ | ---- |
| build | contexts: FileContextInput\[\] | string | コンテキスト文字列を構築する |
| calculateSize | contexts: FileContextInput\[\] | number | コンテキストサイズを計算する |
| validateSize | contexts: FileContextInput\[\] | boolean | サイズが上限以内かを検証する |

### 型定義

| 型名             | 説明                               |
| ---------------- | ---------------------------------- |
| FileContextInput | ファイルコンテキスト入力（filePath/content/selection/language） |

### 定数

| 定数名           | 値     | 説明                   |
| ---------------- | ------ | ---------------------- |
| MAX_CONTEXT_SIZE | 100KB  | コンテキストサイズ上限 |
| MAX_FILE_CONTEXTS| 10     | 最大添付ファイル数     |

### コンテキスト出力形式

構築されるコンテキストは以下の構造を持つMarkdown形式となる。

| セクション | 内容 |
| ---------- | ---- |
| ファイルヘッダ | 「## ファイル: {filePath}」形式でファイルパスを表示 |
| メタ情報 | 言語名、行数を記載 |
| 選択範囲 | 選択がある場合、開始行〜終了行と選択されたコード内容を表示 |
| 全体コンテンツ | ファイル全体の内容を言語情報付きで表示 |

---

## ChatEditService

LLM統合のFacadeサービス。プロンプト構築とレスポンス解析を担当。`RuntimeResolver` が `integrated` を返した場合にのみインスタンス化され、解決済みの `LLMAdapter` をコンストラクタで受け取る。`ipc/chatEditHandlers.ts` の `handleSendWithContext` では `resolve()` → integrated 判定 → `new ChatEditService(resolution.adapter, contextBuilder)` の順で生成する。

### インターフェース

IChatEditServiceインターフェースは以下のメソッドを提供する。

| メソッド名 | 引数 | 戻り値 | 説明 |
| ---------- | ---- | ------ | ---- |
| sendWithContext | request: SendWithContextRequest | Promise\<SendWithContextResponse\> | コンテキスト付きでLLMにリクエストを送信する |
| buildPrompt | command: EditCommand, context: string | string | 編集コマンドとコンテキストからプロンプトを構築する |
| parseResponse | response: string, command: EditCommand, originalContent: string, filePath: string | GeneratedResult | LLMレスポンスを解析し、生成結果を返す |

### 型定義

| 型名                    | 説明                               |
| ----------------------- | ---------------------------------- |
| SendWithContextRequest  | リクエスト（contexts/command/message?/options/workspacePath?） |
| SendWithContextResponse | レスポンス（success/result/error/handoff?/guidance?） |
| EditCommand             | 編集コマンド（type/targetContextId/instruction） |
| GeneratedResult         | 生成結果（id/originalContent/generatedContent/diffHunks/status） |
| DiffHunk                | 差分ハンク（oldStart/oldLines/newStart/newLines/lines） |
| HandoffGuidance         | terminal handoff 案内（terminalCommand/contextSummary/reason） |

### EditCommand.type

| 値            | 説明                     |
| ------------- | ------------------------ |
| continue      | コードの続きを生成       |
| refactor      | リファクタリング         |
| generate-test | テストコード生成         |
| add-comment   | コメント追加             |
| custom        | カスタム指示（instruction使用） |

### エラーコード

| コード            | 説明                       | Retryable |
| ----------------- | -------------------------- | --------- |
| CONTEXT_TOO_LARGE | コンテキストサイズ超過     | No        |
| INVALID_COMMAND   | 無効なコマンドタイプ       | No        |
| LLM_ERROR         | LLM APIエラー              | Yes       |
| TIMEOUT           | タイムアウト               | Yes       |
| RATE_LIMIT        | レート制限                 | Yes       |
| SELECTION_REQUIRED | 選択範囲がない            | No        |
| ACCESS_NOT_CONFIGURED | integrated runtime の資格情報がない | No |
| PERMISSION_DENIED | workspacePath 制約違反    | No        |

---

## RuntimeResolver

`AuthMode` と API key の有無からランタイム（integrated / handoff）を決定するサービス。`chat-edit:send-with-context` の前段で呼び出される。

> **実装**: `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts`

### インターフェース

| メソッド名 | 引数 | 戻り値 | 説明 |
| ---------- | ---- | ------ | ---- |
| resolve | なし | Promise\<RuntimeResolution\> | 現在の auth mode と API key 状態を評価し、ランタイムを決定する |

### 型定義

| 型名 | 説明 |
| ---- | ---- |
| RuntimeResolution | 判定結果の判別共用体。`{ type: "integrated"; adapter: LLMAdapter }` または `{ type: "handoff"; reason: string }` |

### 解決テーブル

| authMode | hasApiKey | 結果 | reason |
| --- | --- | --- | --- |
| subscription | any | handoff | subscription mode |
| api-key | true | integrated | — （`AnthropicLLMAdapter` を返却） |
| api-key | false | handoff | API key not configured |

### DI

コンストラクタで以下を注入する。

| 依存 | 説明 |
| ---- | ---- |
| IAuthModeService | 現在の `AuthMode` を取得 |
| IAuthKeyService | API key の存在チェック |

---

## AnthropicLLMAdapter

`LLMAdapter` インターフェースの Anthropic API 実装。Electron の `net.fetch` を使用して Main Process 内で API 呼び出しを完結させる。

> **実装**: `apps/desktop/src/main/services/chat-edit/AnthropicLLMAdapter.ts`

### インターフェース

LLMAdapter インターフェースを実装する。

| メソッド名 | 引数 | 戻り値 | 説明 |
| ---------- | ---- | ------ | ---- |
| sendMessage | prompt: string | Promise\<string\> | プロンプトを Anthropic API に送信し、レスポンステキストを返す |

### 定数

| 定数名 | 値 | import元 | 説明 |
| ------ | -- | -------- | ---- |
| ANTHROPIC_API_ENDPOINT | `https://api.anthropic.com/v1/messages` | `../auth/types` | API エンドポイント |
| ANTHROPIC_API_VERSION | `2023-06-01` | `../auth/types` | API バージョンヘッダ値 |

### リクエスト仕様

| 項目 | 値 |
| ---- | -- |
| モデル | `claude-sonnet-4-6` |
| HTTPメソッド | POST |
| ヘッダ | `x-api-key`, `anthropic-version`, `content-type: application/json` |
| 実行境界 | Main Process（`electron.net.fetch`） |

### セキュリティ

- API キーは Main Process 内のみで使用し、Renderer に渡さない
- `net.fetch` により Chromium のネットワークスタックを経由し、CSP の制約を受けない

---

## TerminalHandoffBuilder

handoff 判定時に `HandoffGuidance` を構築するサービス。ユーザーがターミナルで Claude CLI を使用するための情報を生成する。

> **実装**: `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`

### インターフェース

| メソッド名 | 引数 | 戻り値 | 説明 |
| ---------- | ---- | ------ | ---- |
| build | request: SendWithContextRequest, reason: string | HandoffGuidance | handoff 案内情報を構築する |

### 型定義

| 型名 | フィールド | 説明 |
| ---- | ---------- | ---- |
| HandoffGuidance | terminalCommand: string | 実行すべき CLI コマンド |
| | contextSummary: string | コンテキストの要約 |
| | reason: string | handoff の理由 |

### contextSummary 生成内容

| 情報 | 説明 |
| ---- | ---- |
| basename | 対象ファイルのベース名 |
| 選択行範囲 | 選択がある場合、開始行〜終了行 |
| コマンドタイプ | EditCommand.type（refactor, generate-test 等） |
| workspace名 | ワークスペースのディレクトリ名 |

### セキュリティ

- `terminalCommand` に API キーを含めない
- コマンド形式: `claude -p "<prompt>"`（buildForSurface 統一後。旧形式 `claude --add-dir` は @deprecated）

### buildForSurface 統一メソッド（実装完了: UT-RUNTIME-BUILDER-MIGRATION-001）

`runtime/TerminalHandoffBuilder.buildForSurface()` で全 surface の HandoffGuidance 生成を統一。

**メソッドシグネチャ**:

```typescript
buildForSurface(
  request: BuildForSurfaceRequest,
  reason: HandoffGuidance["reason"],
): HandoffGuidance
```

**surfaceType 列挙（discriminated union）**:

| surfaceType  | リクエスト型              | contextSummary フォーマット                            |
| ------------ | ------------------------- | ------------------------------------------------------ |
| "chat-edit"  | `ChatEditSurfaceRequest`  | `command={commandType} files={filePaths} workspace=..` |
| "runtime"    | `RuntimeSurfaceRequest`   | `surface={agent\|skill} skill={skillToken}`            |
| "skill-docs" | `SkillDocsSurfaceRequest` | `surface=skill-docs query={queryText}`                 |

**P62 対策**: 未知の surfaceType は `never` 型 exhaustive check でエラーを throw（DEFAULT_CONFIG fallback 禁止）。

**旧メソッド**:

| メソッド                   | ステータス   | 移行先                                                     |
| -------------------------- | ------------ | ---------------------------------------------------------- |
| `build()`                  | @deprecated  | `buildForSurface({ surfaceType: "runtime", ... }, reason)` |
| `buildForAgentExecution()` | @deprecated  | `buildForSurface({ surfaceType: "runtime", runtimeType: "agent", ... }, reason)` |
| `buildForSkillExecution()` | @deprecated  | `buildForSurface({ surfaceType: "runtime", runtimeType: "skill", ... }, reason)` |

#### 関連タスク

- UT-RUNTIME-BUILDER-MIGRATION-001: 実装完了（2026-03-23）
- UT-RUNTIME-BUILDER-DELETE-CHAT-EDIT-001: chat-edit/TerminalHandoffBuilder.ts 削除（未着手）
- UT-RUNTIME-FACADE-RETURN-TYPE-001: RuntimeSkillCreatorFacade 戻り値型波及確認（未着手）

---

## IPCチャンネル

| チャネル                    | 方向            | Request                                             | Response                      |
| --------------------------- | --------------- | --------------------------------------------------- | ----------------------------- |
| `chat-edit:read-file`       | Renderer → Main | `{ filePath: string, workspacePath?: string \| null }` | `FileReadResult` |
| `chat-edit:write-file`      | Renderer → Main | `{ filePath, content, options?, workspacePath?: string \| null }` | `FileWriteResult` |
| `chat-edit:get-selection`   | Renderer → Main | なし                                                | `{ success: boolean, data: TextSelection \| null }`  |
| `chat-edit:send-with-context` | Renderer → Main | `SendWithContextRequest`                          | `SendWithContextResponse` |

### workspacePathパラメータ

| パラメータ    | 型               | 必須 | 説明                                                               |
| ------------- | ---------------- | ---- | ------------------------------------------------------------------ |
| workspacePath | string \| null   | No   | ワークスペースパス。指定時はファイルアクセスをワークスペース内に制限 |

- **未指定/null/空文字の場合**: 検証スキップ（後方互換性維持）
- **指定時**: `isAllowedPath()` でパス検証し、外部アクセスは`PERMISSION_DENIED`エラー

---

## セキュリティ

### IPC Sender検証

すべてのIPCハンドラで`validateIpcSender`関数を使用してリクエスト元を検証する。検証対象は`event.sender`と`event.senderFrame`であり、チャンネル名（例: "chat-edit:read-file"）とともに検証を行う。検証結果の`valid`プロパティがfalseの場合、`toIPCValidationError`を使用してエラーをスローする。

### パストラバーサル防止

`utils/PathValidator`モジュールの`detectTraversal`関数および`validateFilePath`関数で path traversal を拒否する。

### workspacePath 境界検証

`handleSendWithContext` では `workspacePath` が指定されている場合、リクエスト内の各コンテキストファイルに対して `isAllowedPath(ctx.filePath, [args.workspacePath])` を実行する。境界外のファイルパスが検出された場合は `PERMISSION_DENIED` エラーを返し、LLM 呼び出しを行わない。この検証は `RuntimeResolver.resolve()` より前に実行され、handoff/integrated いずれの経路でもファイルパスの安全性を保証する。

---

## ディレクトリ構成

| パス | 説明 |
| ---- | ---- |
| apps/desktop/src/main/services/chat-edit/ | サービスルートディレクトリ |
| \_\_tests\_\_/ | テストディレクトリ |
| \_\_tests\_\_/ChatEditService.test.ts | ChatEditService単体テスト |
| \_\_tests\_\_/ChatEditService.edge.test.ts | ChatEditServiceエッジケーステスト |
| \_\_tests\_\_/ContextBuilder.test.ts | ContextBuilder単体テスト |
| \_\_tests\_\_/ContextBuilder.edge.test.ts | ContextBuilderエッジケーステスト |
| \_\_tests\_\_/FileService.test.ts | FileService単体テスト |
| \_\_tests\_\_/FileService.edge.test.ts | FileServiceエッジケーステスト |
| \_\_tests\_\_/integration.test.ts | 統合テスト |
| utils/ | ユーティリティディレクトリ |
| utils/PathValidator.ts | パス検証ユーティリティ |
| utils/ErrorMapper.ts | エラーマッピングユーティリティ |
| utils/index.ts | ユーティリティエクスポート |
| ChatEditService.ts | ChatEditServiceメイン実装 |
| ContextBuilder.ts | ContextBuilderメイン実装 |
| FileService.ts | FileServiceメイン実装 |
| RuntimeResolver.ts | auth mode / API key から runtime を解決 |
| AnthropicLLMAdapter.ts | integrated runtime 用の LLM adapter |
| TerminalHandoffBuilder.ts | handoff guidance 生成 |
| prompts.ts | プロンプトテンプレート |
| types.ts | 型定義 |
| index.ts | モジュールエクスポート |

---

## 品質メトリクス

| 指標              | 値       |
| ----------------- | -------- |
| Line Coverage     | 92.55%   |
| Branch Coverage   | 92.85%   |
| 自動テスト        | 164件    |
| 手動テスト項目    | 23件     |

---

## 関連ドキュメント

### 親ドキュメント

- [LLMインターフェース概要](./interfaces-llm.md)（インデックス・全体像把握）

### 同カテゴリ

- [LLM IPC型定義](./llm-ipc-types.md)
- [LLMストリーミング](./llm-streaming.md)
- [Embedding](./llm-embedding.md)

### アーキテクチャ・パターン

- [アーキテクチャパターン](./architecture-patterns.md)（chatEditSliceパターン）
- [API IPC Agent](./api-ipc-agent.md)（IPCチャンネル一覧）

### セキュリティ

- [Electron IPCセキュリティ](./security-electron-ipc.md)
- [APIセキュリティ](./security-api-electron.md)

### 実装ガイド

- [Workspace管理統合 実装ガイド](../../../docs/30-workflows/TASK-WCE-WORKSPACE-001/outputs/phase-12/implementation-guide.md)

---

## 完了タスク

### Workspace管理統合（TASK-WCE-WORKSPACE-001）2026-02-02完了

| 項目           | 内容                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| タスクID       | TASK-WCE-WORKSPACE-001                                                          |
| Issue          | #660                                                                            |
| ステータス     | **完了**                                                                        |
| 実装内容       | workspacePathパラメータ追加、isWithinWorkspace検証、folderFileTreesからファイル一覧取得 |
| 修正ファイル   | chatEditHandlers.ts, useFileContext.ts                                          |
| 新規ファイル   | fileTreeUtils.ts                                                                |
| テスト数       | 45（ユニット＋統合）                                                            |
| カバレッジ     | Line 95%, Branch 90%, Function 100%                                             |
| ドキュメント   | `docs/30-workflows/TASK-WCE-WORKSPACE-001/`                                     |

### AI Runtime Activation 追補（TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001）2026-03-14

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 実装内容 | `RuntimeResolver` / `AnthropicLLMAdapter` / `TerminalHandoffBuilder` を追加し、`chat-edit:send-with-context` で integrated/handoff を分岐 |
| セキュリティ | `workspacePath` 指定時に `isAllowedPath()` で context file を検証 |
| IPC更新 | `SendWithContextResponse` に `handoff` / `guidance` を追加 |
| Preload更新 | `chatEditAPI` を `contextBridge.exposeInMainWorld` で公開し、read/write invoke payload を object 契約へ整合 |
| 検証 | `chatEditHandlers.*` 4 files / 55 tests PASS、`pnpm --filter @repo/desktop typecheck` PASS |

### workspacePath セキュリティ検証テスト（UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001）2026-03-15

| 項目 | 内容 |
| --- | --- |
| タスクID | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` |
| テスト数 | 6（全PASS） |
| カバレッジ | workspacePath ブランチ 100% |
| 完了日 | 2026-03-15 |

テストケース:

| TC | 検証内容 | 期待結果 |
| --- | --- | --- |
| TC-WS-01 | workspace 内ファイル | 正常処理（handoff） |
| TC-WS-02 | workspace 外ファイル | PERMISSION_DENIED |
| TC-WS-03 | workspacePath 未指定 | 検証スキップ |
| TC-WS-04 | パストラバーサル（`../`） | PERMISSION_DENIED |
| TC-WS-05 | 複数コンテキスト（1件外部） | 全体拒否 |
| TC-WS-06 | 空配列コンテキスト | 正常処理 |

**関連未タスク**:
- `task-ut-chat-edit-integrated-path-workspace-guard-001` — integrated path の workspace 制約テスト

### 削除されたTODO

| ファイル            | 行番号 | 削除されたTODO                                 |
| ------------------- | ------ | ---------------------------------------------- |
| chatEditHandlers.ts | 77     | `TODO: 実際のワークスペース管理から取得`       |
| useFileContext.ts   | 96-97  | `TODO: Workspace型にopenFilesプロパティを追加` |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                            |
| ---------- | ---------- | ------------------------------------------------------------------- |
| 2026-03-14 | v1.2.0     | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 を反映。`RuntimeResolver`/`TerminalHandoffBuilder`/`AnthropicLLMAdapter`、`SendWithContextResponse.handoff/guidance`、`workspacePath` 境界検証、preload `contextBridge` 公開を同期 |
| 2026-02-02 | v1.1.0     | TASK-WCE-WORKSPACE-001完了: workspacePathパラメータ追加、完了タスクセクション追加 |
| 2026-01-26 | v1.0.0     | 仕様ガイドライン準拠: コード例を表形式・文章に変換                  |
