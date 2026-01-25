# Phase 2: 設計

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| Phase        | 2                                            |
| 名称         | 設計                                         |
| 目的         | サービスアーキテクチャ・インターフェース設計 |
| 前提Phase    | Phase 1（要件定義）                          |
| 成果物       | design.md, interface-design.md               |
| 成果物配置先 | `outputs/phase-2/`                           |

---

## 1. 目的

Main Processサービスのアーキテクチャとインターフェースを設計し、実装の指針を確立する。

---

## 2. 実行タスク

### Task 1: サービスアーキテクチャ設計

#### 2.1.1 コンポーネント構成

```
Main Process (Electron)
├── services/chat-edit/
│   ├── FileService.ts        # ファイルI/O操作
│   ├── ContextBuilder.ts     # コンテキスト構築
│   ├── ChatEditService.ts    # LLM連携（Facade）
│   ├── index.ts              # エクスポート
│   └── __tests__/            # ユニットテスト
├── ipc/
│   └── chatEditHandlers.ts   # IPCハンドラ
└── preload/
    └── channels.ts           # チャンネル定義更新
```

#### 2.1.2 依存関係

```
chatEditHandlers
    ├── ChatEditService (Facade)
    │   ├── FileService
    │   ├── ContextBuilder
    │   └── LLMAdapter (既存)
    └── validateIpcSender (既存)
```

#### 2.1.3 データフロー

```
Renderer Process
    │
    ▼ window.api.chatEdit.{method}()
Preload Script (contextBridge)
    │
    ▼ ipcRenderer.invoke("chat-edit:...")
Main Process - chatEditHandlers
    │
    ▼
ChatEditService (Facade)
    ├── FileService (ファイル操作)
    ├── ContextBuilder (プロンプト構築)
    └── LLMAdapter (LLM呼び出し)
    │
    ▼
IPCレスポンス → Renderer
```

---

### Task 2: インターフェース設計

#### 2.2.1 FileService インターフェース

```typescript
// apps/desktop/src/main/services/chat-edit/FileService.ts

export interface IFileService {
  /**
   * ファイル内容を読み取る
   * @param filePath 絶対パス
   * @returns FileReadResult
   */
  readFile(filePath: string): Promise<FileReadResult>;

  /**
   * ファイルに内容を書き込む
   * @param filePath 絶対パス
   * @param content 書き込む内容
   * @param options 書き込みオプション
   * @returns FileWriteResult
   */
  writeFile(
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ): Promise<FileWriteResult>;

  /**
   * ファイルパスから言語を検出
   * @param filePath ファイルパス
   * @returns 言語識別子
   */
  detectLanguage(filePath: string): string;
}

// 言語マッピング
const EXTENSION_MAP: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".md": "markdown",
  ".json": "json",
  ".css": "css",
  ".scss": "scss",
  ".html": "html",
  ".vue": "vue",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".rb": "ruby",
  ".php": "php",
  ".sh": "shell",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".sql": "sql",
  ".graphql": "graphql",
};
```

#### 2.2.2 ContextBuilder インターフェース

```typescript
// apps/desktop/src/main/services/chat-edit/ContextBuilder.ts

export interface IContextBuilder {
  /**
   * FileContextからLLMプロンプト用文字列を構築
   * @param contexts ファイルコンテキスト配列
   * @returns Markdown形式のコンテキスト文字列
   */
  build(contexts: FileContextInput[]): string;

  /**
   * コンテキスト合計サイズを計算
   * @param contexts ファイルコンテキスト配列
   * @returns バイト数
   */
  calculateSize(contexts: FileContextInput[]): number;

  /**
   * サイズ制限チェック
   * @param contexts ファイルコンテキスト配列
   * @returns 制限内ならtrue
   */
  validateSize(contexts: FileContextInput[]): boolean;
}

// 出力フォーマット例
/*
## ファイルコンテキスト

### File: src/components/Button.tsx
\`\`\`typescript
// ファイル内容
export const Button = () => { ... }
\`\`\`

### File: src/utils/helpers.ts (選択範囲: L10-L25)
\`\`\`typescript
// 選択された部分
function helper() { ... }
\`\`\`
*/
```

#### 2.2.3 ChatEditService インターフェース

```typescript
// apps/desktop/src/main/services/chat-edit/ChatEditService.ts

export interface IChatEditService {
  /**
   * コンテキスト付きでLLMにリクエストを送信
   * @param request リクエスト
   * @returns レスポンス
   */
  sendWithContext(
    request: SendWithContextRequest,
  ): Promise<SendWithContextResponse>;
}

// 内部メソッド
interface ChatEditServiceInternal {
  /**
   * コマンドタイプ別プロンプト生成
   * @param command 編集コマンド
   * @param context コンテキスト文字列
   * @returns プロンプト文字列
   */
  buildPrompt(command: EditCommand, context: string): string;

  /**
   * LLM応答をパース
   * @param response LLMレスポンス
   * @param command 元のコマンド
   * @param originalContent 元のコンテンツ
   * @returns GeneratedResult
   */
  parseResponse(
    response: string,
    command: EditCommand,
    originalContent: string,
  ): GeneratedResult;
}

// プロンプトテンプレート
const PROMPT_TEMPLATES: Record<EditCommandType, string> = {
  continue: `以下のコードの続きを書いてください。
コンテキストを参考に、適切なコードを生成してください。

{context}

続きを書いてください:`,

  refactor: `以下のコードをリファクタリングしてください。
可読性、保守性、パフォーマンスを改善してください。

{context}

リファクタリング結果:`,

  "generate-test": `以下のコードのテストを生成してください。
カバレッジを意識し、主要なケースをカバーしてください。

{context}

テストコード:`,

  "add-comment": `以下のコードにコメントを追加してください。
関数の目的、引数、戻り値を説明するコメントを追加してください。

{context}

コメント付きコード:`,

  custom: `{instruction}

{context}`,
};
```

#### 2.2.4 IPCハンドラ設計

```typescript
// apps/desktop/src/main/ipc/chatEditHandlers.ts

export function registerChatEditHandlers(
  mainWindow: BrowserWindow,
  chatEditService: ChatEditService,
  fileService: FileService,
): void {
  // chat-edit:read-file
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_READ_FILE,
    async (event, args: { filePath: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_READ_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      return fileService.readFile(args.filePath);
    },
  );

  // chat-edit:write-file
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
    async (
      event,
      args: { filePath: string; content: string; options?: FileWriteOptions },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      return fileService.writeFile(args.filePath, args.content, args.options);
    },
  );

  // chat-edit:send-with-context
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
    async (event, args: SendWithContextRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }
      return chatEditService.sendWithContext(args);
    },
  );
}
```

---

### Task 3: チャンネル定義設計

#### 2.3.1 IPC_CHANNELS追加

```typescript
// apps/desktop/src/preload/channels.ts に追加

export const IPC_CHANNELS = {
  // ... 既存チャンネル ...

  // Chat Edit operations
  CHAT_EDIT_READ_FILE: "chat-edit:read-file",
  CHAT_EDIT_WRITE_FILE: "chat-edit:write-file",
  CHAT_EDIT_GET_SELECTION: "chat-edit:get-selection",
  CHAT_EDIT_SEND_WITH_CONTEXT: "chat-edit:send-with-context",
} as const;
```

#### 2.3.2 ホワイトリスト追加

```typescript
// ALLOWED_INVOKE_CHANNELS に追加
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャンネル ...

  // Chat Edit channels
  IPC_CHANNELS.CHAT_EDIT_READ_FILE,
  IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
  IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
  IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
];
```

#### 2.3.3 Preload API設計

```typescript
// apps/desktop/src/preload/index.ts に追加

const chatEditAPI: ChatEditAPI = {
  readFile: (filePath: string) =>
    safeInvoke<FileReadResult>(IPC_CHANNELS.CHAT_EDIT_READ_FILE, { filePath }),

  writeFile: (filePath: string, content: string, options?: FileWriteOptions) =>
    safeInvoke<FileWriteResult>(IPC_CHANNELS.CHAT_EDIT_WRITE_FILE, {
      filePath,
      content,
      options,
    }),

  getSelection: () =>
    safeInvoke<TextSelection | null>(IPC_CHANNELS.CHAT_EDIT_GET_SELECTION),

  sendWithContext: (request: SendWithContextRequest) =>
    safeInvoke<SendWithContextResponse>(
      IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
      request,
    ),
};

contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI);
```

---

## 3. 参照資料

### 3.1 システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                         | 内容                              |
| ------------------------ | ---------------------------------------------------------------------------- | --------------------------------- |
| アーキテクチャパターン   | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPC Handler Registration Pattern  |
| セキュリティ（Electron） | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | validateIpcSender、ホワイトリスト |

### 3.2 既存実装参照

| 実装          | パス                                         | 参照理由             |
| ------------- | -------------------------------------------- | -------------------- |
| skillHandlers | `apps/desktop/src/main/ipc/skillHandlers.ts` | IPCハンドラパターン  |
| SkillService  | `apps/desktop/src/main/services/skill/`      | サービス構成パターン |
| LLMAdapter    | `apps/desktop/src/main/adapters/llm/`        | LLM統合パターン      |

---

## 4. 成果物

| 成果物              | 配置先             | 説明                   |
| ------------------- | ------------------ | ---------------------- |
| design.md           | `outputs/phase-2/` | アーキテクチャ設計書   |
| interface-design.md | `outputs/phase-2/` | インターフェース設計書 |

---

## 5. 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント        | 契約定義                          |
| ------------------- | --------------------------------- |
| Renderer → Main IPC | chat-edit:\* チャンネル           |
| Main → FileSystem   | fs.promises (readFile, writeFile) |
| Main → LLMAdapter   | 既存LLMAdapter.send()             |
| 認証/検証           | validateIpcSender                 |

---

## 6. 完了条件

- [ ] コンポーネント構成が定義されている
- [ ] 依存関係が明確になっている
- [ ] データフローが設計されている
- [ ] 各サービスのインターフェースが定義されている
- [ ] IPCチャンネル設計が完了している
- [ ] Preload API設計が完了している
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. サービスアーキテクチャ設計（Task 1）
3. インターフェース設計（Task 2）
4. チャンネル定義設計（Task 3）
5. 統合テスト連携の記載
6. 成果物の作成・配置
7. 完了条件の検証

---

## 8. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/workspace-chat-edit-main-process --phase 2
```

---

## 9. 次のPhase

Phase 3: 設計レビューゲート
