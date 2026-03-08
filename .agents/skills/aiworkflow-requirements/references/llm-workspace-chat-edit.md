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

LLM統合のFacadeサービス。プロンプト構築とレスポンス解析を担当。

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
| SendWithContextRequest  | リクエスト（contexts/command/message/options） |
| SendWithContextResponse | レスポンス（success/result/error） |
| EditCommand             | 編集コマンド（type/targetContextId/instruction） |
| GeneratedResult         | 生成結果（id/originalContent/generatedContent/diffHunks/status） |
| DiffHunk                | 差分ハンク（oldStart/oldLines/newStart/newLines/lines） |

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

---

## IPCチャンネル

| チャネル                    | 方向            | Request                                             | Response                      |
| --------------------------- | --------------- | --------------------------------------------------- | ----------------------------- |
| `chat-edit:read-file`       | Renderer → Main | `{ filePath: string, workspacePath?: string \| null }` | `IPCResponse<FileReadResult>` |
| `chat-edit:write-file`      | Renderer → Main | `{ filePath, content, workspacePath?: string \| null }` | `IPCResponse<FileWriteResult>` |
| `chat-edit:get-selection`   | Renderer → Main | なし                                                | `IPCResponse<TextSelection>`  |
| `chat-edit:send-with-context` | Renderer → Main | `SendWithContextRequest`                          | `IPCResponse<GeneratedResult>` |

### workspacePathパラメータ

| パラメータ    | 型               | 必須 | 説明                                                               |
| ------------- | ---------------- | ---- | ------------------------------------------------------------------ |
| workspacePath | string \| null   | No   | ワークスペースパス。指定時はファイルアクセスをワークスペース内に制限 |

- **未指定/null/空文字の場合**: 検証スキップ（後方互換性維持）
- **指定時**: `isWithinWorkspace()`でパス検証し、外部アクセスは`PERMISSION_DENIED`エラー

---

## セキュリティ

### IPC Sender検証

すべてのIPCハンドラで`validateIpcSender`関数を使用してリクエスト元を検証する。検証対象は`event.sender`と`event.senderFrame`であり、チャンネル名（例: "chat-edit:read-file"）とともに検証を行う。検証結果の`valid`プロパティがfalseの場合、`toIPCValidationError`を使用してエラーをスローする。

### パストラバーサル防止

`utils/PathValidator`モジュールの`detectTraversal`関数および`validateFilePath`関数を使用してパストラバーサル攻撃を防止する。パストラバーサルが検出された場合、エラーコード「INVALID_PATH」とメッセージ「Path traversal detected」を含むエラーレスポンスを返す。

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

### 削除されたTODO

| ファイル            | 行番号 | 削除されたTODO                                 |
| ------------------- | ------ | ---------------------------------------------- |
| chatEditHandlers.ts | 77     | `TODO: 実際のワークスペース管理から取得`       |
| useFileContext.ts   | 96-97  | `TODO: Workspace型にopenFilesプロパティを追加` |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                            |
| ---------- | ---------- | ------------------------------------------------------------------- |
| 2026-02-02 | v1.1.0     | TASK-WCE-WORKSPACE-001完了: workspacePathパラメータ追加、完了タスクセクション追加 |
| 2026-01-26 | v1.0.0     | 仕様ガイドライン準拠: コード例を表形式・文章に変換                  |
