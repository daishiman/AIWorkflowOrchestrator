# Workspace Chat Edit Main Process - タスク指示書

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | UT-WCE-002                                |
| タスク名     | Workspace Chat Edit Main Process          |
| 分類         | 実装                                      |
| 対象機能     | ワークスペースチャット編集機能（Backend） |
| 優先度       | 高                                        |
| 見積もり規模 | 中規模                                    |
| ステータス   | 未実施                                    |
| 発見元       | Phase 10（ISSUE-002）, Phase 11           |
| 発見日       | 2026-01-23                                |
| 関連タスク   | workspace-chat-edit（コアロジック実装済） |
| 依存タスク   | なし                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

workspace-chat-edit機能のRenderer側ロジックが完成しているが、Main Process側のサービス（ファイルI/O、LLM連携、IPCハンドラ）が未実装。IPC通信を通じてRenderer側からMain Process側を呼び出す必要がある。

### 1.2 問題点・課題

- ファイル読み書きサービスが未実装
- LLM連携サービスが未実装
- IPCハンドラが未実装
- Preload APIが未実装

### 1.3 放置した場合の影響

- Renderer側のhooksがIPC呼び出しできない
- ファイルシステムへのアクセスができない
- LLMへのリクエストができない

---

## 2. 何を達成するか（What）

### 2.1 目的

Main Process側のサービスとIPCハンドラを実装し、Renderer側との通信を確立する。

### 2.2 最終ゴール

- FileService.ts - ファイル読み書き、言語検出
- ChatEditService.ts - プロンプト構築、LLM連携
- ContextBuilder.ts - コンテキスト構築
- chatEditHandlers.ts - IPCハンドラ
- chatEditApi.ts - Preload API

### 2.3 スコープ

#### 含むもの

- 5種類のサービス/ハンドラ実装
- 既存LLM Adapterとの統合
- ファイルI/O（読み取り、書き込み、バックアップ）
- 言語検出（拡張子ベース）
- Preload APIホワイトリスト追加
- ユニットテスト

#### 含まないもの

- UIコンポーネント（別タスク）
- 新規LLMプロバイダー追加
- 高度な言語検出（AST解析等）

### 2.4 成果物

| 成果物              | 配置先                                                |
| ------------------- | ----------------------------------------------------- |
| FileService.ts      | `apps/desktop/src/main/services/chat-edit/`           |
| ChatEditService.ts  | `apps/desktop/src/main/services/chat-edit/`           |
| ContextBuilder.ts   | `apps/desktop/src/main/services/chat-edit/`           |
| chatEditHandlers.ts | `apps/desktop/src/main/ipc/`                          |
| chatEditApi.ts      | `apps/desktop/src/preload/`                           |
| サービステスト      | `apps/desktop/src/main/services/chat-edit/__tests__/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- workspace-chat-editの型定義（IPC API）が定義済み
- 既存LLM Adapter（OpenAI, Anthropic等）が利用可能
- Preload APIパターンが確立済み

### 3.2 依存タスク

| タスク                      | ステータス | 必要性 |
| --------------------------- | ---------- | ------ |
| workspace-chat-edit（コア） | 完了       | 必須   |
| LLM Adapter実装             | 完了       | 参照   |

### 3.3 必要な知識

- Electron Main Process
- Node.js fs/path API
- IPC通信パターン
- LLM API連携
- Preload APIセキュリティパターン

### 3.4 推奨アプローチ

1. FileServiceから実装（独立性が高い）
2. ContextBuilder実装
3. ChatEditService実装（LLM Adapter統合）
4. IPCハンドラ実装
5. Preload API追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称            | 概要                        |
| ----- | --------------- | --------------------------- |
| 1     | FileService     | ファイルI/O、言語検出       |
| 2     | ContextBuilder  | コンテキスト構築            |
| 3     | ChatEditService | LLM連携、プロンプト構築     |
| 4     | IPCハンドラ     | chatEditHandlers実装        |
| 5     | Preload API     | chatEditApi、ホワイトリスト |
| 6     | 統合・テスト    | 統合テスト                  |

---

### Phase 1: FileService

#### 目的

ファイル読み書きと言語検出機能を実装する。

#### 手順

1. FileService実装:

   ```typescript
   export class FileService {
     async readFile(filePath: string): Promise<FileReadResult> {
       // ファイル存在確認
       // サイズ確認（MAX_FILE_SIZE制限）
       // 読み取り実行
       // 言語検出
     }

     async writeFile(
       filePath: string,
       content: string,
       createBackup: boolean = true,
     ): Promise<FileWriteResult> {
       // バックアップ作成（オプション）
       // 書き込み実行
     }

     detectLanguage(filePath: string): string {
       // 拡張子ベースの言語検出
     }
   }
   ```

2. 言語検出マッピング:

   ```typescript
   const EXTENSION_MAP: Record<string, string> = {
     ".ts": "typescript",
     ".tsx": "typescript",
     ".js": "javascript",
     ".jsx": "javascript",
     ".py": "python",
     ".md": "markdown",
     // ...
   };
   ```

#### 成果物

- FileService.ts + テスト

#### 完了条件

- ファイル読み取りが動作する
- サイズ制限チェックが動作する
- 言語検出が動作する
- バックアップ作成が動作する

---

### Phase 2: ContextBuilder

#### 目的

FileContextからLLMプロンプト用のコンテキストを構築する。

#### 手順

1. ContextBuilder実装:

   ```typescript
   export class ContextBuilder {
     build(contexts: FileContext[]): string {
       // ファイルコンテキストをMarkdown形式で構築
       // 選択範囲がある場合はハイライト
     }

     calculateTotalSize(contexts: FileContext[]): number {
       // 合計サイズ計算
     }

     validateSize(contexts: FileContext[]): boolean {
       // MAX_CONTEXT_SIZE制限チェック
     }
   }
   ```

#### 成果物

- ContextBuilder.ts + テスト

#### 完了条件

- コンテキストが構築できる
- サイズ制限が検証できる

---

### Phase 3: ChatEditService

#### 目的

LLM Adapterと統合し、コード編集リクエストを処理する。

#### 手順

1. ChatEditService実装:

   ```typescript
   export class ChatEditService {
     constructor(
       private llmAdapterFactory: LLMAdapterFactory,
       private contextBuilder: ContextBuilder,
     ) {}

     async sendWithContext(
       request: SendWithContextRequest,
     ): Promise<SendWithContextResponse> {
       // コンテキスト構築
       // プロンプト生成
       // LLM Adapter呼び出し
       // 結果パース（GeneratedResult生成）
     }

     buildPrompt(command: EditCommand, context: string): string {
       // コマンドタイプ別プロンプト生成
     }
   }
   ```

2. コマンドタイプ別プロンプトテンプレート:

   ```typescript
   const PROMPT_TEMPLATES: Record<EditCommandType, string> = {
     continue: "以下のコードの続きを書いてください...",
     refactor: "以下のコードをリファクタリングしてください...",
     "generate-test": "以下のコードのテストを生成してください...",
     "add-comment": "以下のコードにコメントを追加してください...",
     custom: "{instruction}",
   };
   ```

#### 成果物

- ChatEditService.ts + テスト

#### 完了条件

- LLM Adapterと統合できる
- コマンドタイプ別プロンプトが生成できる
- 結果をGeneratedResultに変換できる

---

### Phase 4: IPCハンドラ

#### 目的

Renderer側からのIPC呼び出しを処理するハンドラを実装する。

#### 手順

1. chatEditHandlers実装:

   ```typescript
   export function registerChatEditHandlers(
     mainWindow: BrowserWindow,
     fileService: FileService,
     chatEditService: ChatEditService,
   ): void {
     ipcMain.handle("chat-edit:read-file", async (event, filePath) => {
       validateIpcSender(event, mainWindow);
       return fileService.readFile(filePath);
     });

     ipcMain.handle(
       "chat-edit:write-file",
       async (event, filePath, content) => {
         validateIpcSender(event, mainWindow);
         return fileService.writeFile(filePath, content);
       },
     );

     ipcMain.handle("chat-edit:send-with-context", async (event, request) => {
       validateIpcSender(event, mainWindow);
       return chatEditService.sendWithContext(request);
     });
   }
   ```

2. registerAllIpcHandlersへの登録

#### 成果物

- chatEditHandlers.ts + テスト

#### 完了条件

- IPCハンドラが登録できる
- セキュリティ検証が動作する

---

### Phase 5: Preload API

#### 目的

Renderer側から安全にIPCを呼び出すためのAPIを実装する。

#### 手順

1. chatEditApi実装:

   ```typescript
   const chatEditAPI: ChatEditAPI = {
     readFile: (filePath: string) =>
       safeInvoke("chat-edit:read-file", filePath),
     writeFile: (filePath: string, content: string) =>
       safeInvoke("chat-edit:write-file", filePath, content),
     getSelection: () => safeInvoke("chat-edit:get-selection"),
     sendWithContext: (request: SendWithContextRequest) =>
       safeInvoke("chat-edit:send-with-context", request),
   };
   ```

2. ホワイトリスト追加:

   ```typescript
   export const ALLOWED_INVOKE_CHANNELS = [
     // ... 既存チャンネル
     "chat-edit:read-file",
     "chat-edit:write-file",
     "chat-edit:get-selection",
     "chat-edit:send-with-context",
   ];
   ```

#### 成果物

- chatEditApi（preload/index.ts追加）
- channels.ts更新

#### 完了条件

- Preload APIが公開できる
- ホワイトリストに追加されている

---

### Phase 6: 統合・テスト

#### 目的

全サービスの統合とテストを行う。

#### 手順

1. 統合テスト実行
2. Renderer側hookとの接続テスト

#### 成果物

- 統合テスト
- 動作確認レポート

#### 完了条件

- Line Coverage ≥ 80%
- 全テストパス

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] FileServiceが実装されている
- [ ] ContextBuilderが実装されている
- [ ] ChatEditServiceが実装されている
- [ ] chatEditHandlersが実装されている
- [ ] chatEditApiが実装されている

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

### セキュリティ要件

- [ ] validateIpcSenderが全ハンドラで使用されている
- [ ] ホワイトリストに登録されている
- [ ] ファイルパス検証が実装されている

---

## 6. 検証方法

### テストケース

| #   | テストケース      | 期待結果                         |
| --- | ----------------- | -------------------------------- |
| 1   | ファイル読み取り  | ファイル内容が返される           |
| 2   | ファイル書き込み  | ファイルが保存される             |
| 3   | バックアップ作成  | バックアップファイルが作成される |
| 4   | サイズ制限エラー  | TOO_LARGEエラーが返される        |
| 5   | コンテキスト構築  | Markdown形式で構築される         |
| 6   | LLMリクエスト送信 | LLM応答が返される                |
| 7   | IPC呼び出し       | 結果が返される                   |
| 8   | 不正IPC送信元     | エラーが返される                 |

---

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                     |
| ----------------------- | ------ | -------- | ------------------------ |
| LLM Adapter統合の複雑さ | 中     | 中       | 既存パターンを参照       |
| ファイルパス検証漏れ    | 高     | 低       | セキュリティレビュー実施 |
| 大きなファイルの処理    | 中     | 中       | サイズ制限を厳密に適用   |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                         | 内容                                        |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------- |
| APIエンドポイント        | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | chat-edit IPC チャネル仕様（4チャネル）     |
| アーキテクチャパターン   | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPC Handler Registration Pattern            |
| インターフェース（LLM）  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | FileContext、EditCommand、GeneratedResult型 |
| セキュリティ（Electron） | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC セキュリティ、withValidation            |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テストカバレッジ目標                        |

### 関連ドキュメント

| ドキュメント | パス                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| IPC API設計  | `docs/30-workflows/workspace-chat-edit/outputs/phase-2/ipc-api-design.md`        |
| 実装ガイド   | `docs/30-workflows/workspace-chat-edit/outputs/phase-12/implementation-guide.md` |
| 型定義       | `apps/desktop/src/renderer/features/workspace-chat-edit/types/`                  |

### 既存実装参照

| 実装                | パス                                    |
| ------------------- | --------------------------------------- |
| LLM Adapter         | `apps/desktop/src/main/adapters/llm/`   |
| IPC Handler Pattern | `apps/desktop/src/main/ipc/`            |
| Preload API Pattern | `apps/desktop/src/preload/`             |
| SkillService        | `apps/desktop/src/main/services/skill/` |

---

## 9. 備考

### 補足事項

- 本タスクはworkspace-chat-edit機能のMain Process部分を担当
- UIコンポーネントは別タスク（UT-WCE-001）で対応
- 既存のLLM Adapterを再利用

---

**作成日**: 2026-01-23
**作成者**: Claude Code
**バージョン**: 1.0
