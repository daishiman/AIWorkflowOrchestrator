# Phase 5: 実装

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| Phase        | 5                                           |
| 名称         | 実装                                        |
| 目的         | TDD: Green（テストを通す実装）              |
| 前提Phase    | Phase 4（テスト作成）                       |
| 成果物       | サービス実装ファイル                        |
| 成果物配置先 | `apps/desktop/src/main/services/chat-edit/` |

---

## 1. 目的

TDD Green phaseとして、Phase 4で作成したテストを通す最小限の実装を行う。

---

## 2. 実行タスク

### Task 1: FileService実装

#### 2.1.1 ファイル作成

ファイル: `apps/desktop/src/main/services/chat-edit/FileService.ts`

#### 2.1.2 実装内容

```typescript
import * as fs from "fs/promises";
import * as path from "path";
import { FileReadResult, FileWriteResult, FileWriteOptions } from "./types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

export class FileService {
  /**
   * ファイル内容を読み取る
   */
  async readFile(filePath: string): Promise<FileReadResult> {
    try {
      // ファイル存在確認とサイズ確認
      const stats = await fs.stat(filePath);

      if (stats.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: {
            code: "TOO_LARGE",
            message: `ファイルサイズが${MAX_FILE_SIZE / 1024 / 1024}MBを超えています`,
          },
        };
      }

      const content = await fs.readFile(filePath, "utf-8");
      const language = this.detectLanguage(filePath);

      return {
        success: true,
        content,
        language,
        fileSize: stats.size,
      };
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return {
          success: false,
          error: {
            code: "FILE_NOT_FOUND",
            message: `ファイルが見つかりません: ${filePath}`,
          },
        };
      }
      if (error.code === "EACCES") {
        return {
          success: false,
          error: {
            code: "PERMISSION_DENIED",
            message: `ファイルへのアクセス権限がありません: ${filePath}`,
          },
        };
      }
      return {
        success: false,
        error: {
          code: "READ_ERROR",
          message: error.message,
        },
      };
    }
  }

  /**
   * ファイルに内容を書き込む
   */
  async writeFile(
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ): Promise<FileWriteResult> {
    try {
      let backupPath: string | undefined;

      // バックアップ作成
      if (options?.createBackup) {
        try {
          await fs.access(filePath);
          const timestamp = Date.now();
          const ext = path.extname(filePath);
          const baseName = path.basename(filePath, ext);
          const dir = path.dirname(filePath);
          backupPath = path.join(dir, `${baseName}.${timestamp}.bak`);
          await fs.copyFile(filePath, backupPath);
        } catch {
          // ファイルが存在しない場合はバックアップ不要
        }
      }

      // 書き込み
      await fs.writeFile(filePath, content, options?.encoding || "utf-8");

      return {
        success: true,
        backupPath,
      };
    } catch (error: any) {
      if (error.code === "EACCES") {
        return {
          success: false,
          error: {
            code: "PERMISSION_DENIED",
            message: `ファイルへの書き込み権限がありません: ${filePath}`,
          },
        };
      }
      return {
        success: false,
        error: {
          code: "WRITE_ERROR",
          message: error.message,
        },
      };
    }
  }

  /**
   * ファイルパスから言語を検出
   */
  detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    return EXTENSION_MAP[ext] || "plaintext";
  }
}
```

---

### Task 2: ContextBuilder実装

#### 2.2.1 ファイル作成

ファイル: `apps/desktop/src/main/services/chat-edit/ContextBuilder.ts`

#### 2.2.2 実装内容

```typescript
import { FileContextInput } from "./types";
import * as path from "path";

const MAX_CONTEXT_SIZE = 100 * 1024; // 100KB

export class ContextBuilder {
  /**
   * FileContextからLLMプロンプト用文字列を構築
   */
  build(contexts: FileContextInput[]): string {
    if (contexts.length === 0) {
      return "";
    }

    const sections = contexts.map((ctx) => this.buildFileSection(ctx));
    return `## ファイルコンテキスト\n\n${sections.join("\n\n")}`;
  }

  /**
   * 単一ファイルのセクションを構築
   */
  private buildFileSection(ctx: FileContextInput): string {
    const fileName = path.basename(ctx.filePath);
    const selectionInfo = ctx.selection
      ? ` (選択範囲: L${ctx.selection.startLine}-L${ctx.selection.endLine})`
      : "";

    return `### File: ${fileName}${selectionInfo}
\`\`\`${ctx.language}
${ctx.content}
\`\`\``;
  }

  /**
   * コンテキスト合計サイズを計算
   */
  calculateSize(contexts: FileContextInput[]): number {
    return contexts.reduce((total, ctx) => {
      // ファイル内容 + メタデータのオーバーヘッド
      const contentSize = Buffer.byteLength(ctx.content, "utf-8");
      const metadataSize = 100; // 概算
      return total + contentSize + metadataSize;
    }, 0);
  }

  /**
   * サイズ制限チェック
   */
  validateSize(contexts: FileContextInput[]): boolean {
    return this.calculateSize(contexts) <= MAX_CONTEXT_SIZE;
  }
}

export { MAX_CONTEXT_SIZE };
```

---

### Task 3: ChatEditService実装

#### 2.3.1 ファイル作成

ファイル: `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`

#### 2.3.2 実装内容

````typescript
import { v4 as uuidv4 } from "uuid";
import { ContextBuilder } from "./ContextBuilder";
import {
  SendWithContextRequest,
  SendWithContextResponse,
  EditCommand,
  EditCommandType,
  GeneratedResult,
  DiffHunk,
} from "./types";

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

export class ChatEditService {
  constructor(
    private llmAdapter: { sendMessage: (prompt: string) => Promise<any> },
    private contextBuilder: ContextBuilder,
  ) {}

  /**
   * コンテキスト付きでLLMにリクエストを送信
   */
  async sendWithContext(
    request: SendWithContextRequest,
  ): Promise<SendWithContextResponse> {
    // コンテキストサイズ検証
    if (!this.contextBuilder.validateSize(request.contexts)) {
      return {
        success: false,
        error: {
          code: "CONTEXT_TOO_LARGE",
          message: "コンテキストサイズが制限を超えています",
          retryable: false,
        },
      };
    }

    try {
      // コンテキスト構築
      const contextString = this.contextBuilder.build(request.contexts);

      // プロンプト生成
      const prompt = this.buildPrompt(request.command, contextString);

      // LLMリクエスト
      const llmResponse = await this.llmAdapter.sendMessage(prompt);

      if (!llmResponse.success) {
        return {
          success: false,
          error: {
            code: "LLM_ERROR",
            message:
              llmResponse.error?.message || "LLMリクエストに失敗しました",
            retryable: true,
          },
        };
      }

      // 元のコンテンツ取得
      const targetContext = request.contexts.find(
        (ctx) =>
          ctx.filePath === request.command.targetContextId ||
          request.contexts[0] === ctx,
      );
      const originalContent = targetContext?.content || "";

      // 結果をパース
      const generatedResult = this.parseResponse(
        llmResponse.data.message,
        request.command,
        originalContent,
        targetContext?.filePath || "",
      );

      return {
        success: true,
        result: generatedResult,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "LLM_ERROR",
          message: error.message,
          retryable: true,
        },
      };
    }
  }

  /**
   * コマンドタイプ別プロンプト生成
   */
  private buildPrompt(command: EditCommand, context: string): string {
    const template = PROMPT_TEMPLATES[command.type];
    let prompt = template.replace("{context}", context);

    if (command.type === "custom" && command.instruction) {
      prompt = prompt.replace("{instruction}", command.instruction);
    }

    return prompt;
  }

  /**
   * LLM応答をGeneratedResultに変換
   */
  private parseResponse(
    response: string,
    command: EditCommand,
    originalContent: string,
    filePath: string,
  ): GeneratedResult {
    // コードブロック抽出
    const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    const generatedContent = codeBlockMatch
      ? codeBlockMatch[1].trim()
      : response.trim();

    // 差分計算（簡易版）
    const diffHunks = this.calculateDiff(originalContent, generatedContent);

    return {
      id: uuidv4(),
      contextId: command.targetContextId,
      originalContent,
      generatedContent,
      diffHunks,
      status: "pending",
      createdAt: new Date(),
      targetFilePath: filePath,
      command,
    };
  }

  /**
   * 差分計算（簡易版）
   */
  private calculateDiff(original: string, generated: string): DiffHunk[] {
    const originalLines = original.split("\n");
    const generatedLines = generated.split("\n");

    // 簡易的な差分：全体を1つのhunkとして返す
    if (original === generated) {
      return [];
    }

    return [
      {
        type: "modify",
        originalStartLine: 1,
        originalEndLine: originalLines.length,
        newStartLine: 1,
        newEndLine: generatedLines.length,
        originalLines,
        newLines: generatedLines,
      },
    ];
  }
}
````

---

### Task 4: chatEditHandlers実装

#### 2.4.1 ファイル作成

ファイル: `apps/desktop/src/main/ipc/chatEditHandlers.ts`

#### 2.4.2 実装内容

```typescript
import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { ChatEditService } from "../services/chat-edit/ChatEditService";
import { FileService } from "../services/chat-edit/FileService";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import {
  SendWithContextRequest,
  FileWriteOptions,
} from "../services/chat-edit/types";

/**
 * Chat Edit IPCハンドラを登録する
 */
export function registerChatEditHandlers(
  mainWindow: BrowserWindow,
  chatEditService: ChatEditService,
  fileService: FileService,
): void {
  // chat-edit:read-file
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_READ_FILE,
    async (event: IpcMainInvokeEvent, args: { filePath: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_READ_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (typeof args?.filePath !== "string") {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "filePath must be a string",
          },
        };
      }

      return fileService.readFile(args.filePath);
    },
  );

  // chat-edit:write-file
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
    async (
      event: IpcMainInvokeEvent,
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

      if (typeof args?.filePath !== "string") {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "filePath must be a string",
          },
        };
      }
      if (typeof args?.content !== "string") {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "content must be a string",
          },
        };
      }

      return fileService.writeFile(args.filePath, args.content, args.options);
    },
  );

  // chat-edit:get-selection
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
    async (event: IpcMainInvokeEvent) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // 現時点ではエディタ選択範囲取得は未実装
      // 将来的にエディタ統合時に実装
      return { success: true, data: null };
    },
  );

  // chat-edit:send-with-context
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
    async (event: IpcMainInvokeEvent, args: SendWithContextRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (!args?.contexts || !Array.isArray(args.contexts)) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "contexts must be an array",
          },
        };
      }
      if (!args?.command) {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "command is required" },
        };
      }

      return chatEditService.sendWithContext(args);
    },
  );
}

/**
 * Chat Edit IPCハンドラを解除する
 */
export function unregisterChatEditHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.CHAT_EDIT_READ_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.CHAT_EDIT_WRITE_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.CHAT_EDIT_GET_SELECTION);
  ipcMain.removeHandler(IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT);
}
```

---

### Task 5: チャンネル定義・Preload API更新

#### 2.5.1 channels.ts更新

`apps/desktop/src/preload/channels.ts` に以下を追加:

```typescript
// Chat Edit operations
CHAT_EDIT_READ_FILE: "chat-edit:read-file",
CHAT_EDIT_WRITE_FILE: "chat-edit:write-file",
CHAT_EDIT_GET_SELECTION: "chat-edit:get-selection",
CHAT_EDIT_SEND_WITH_CONTEXT: "chat-edit:send-with-context",
```

#### 2.5.2 ホワイトリスト更新

```typescript
// ALLOWED_INVOKE_CHANNELS に追加
IPC_CHANNELS.CHAT_EDIT_READ_FILE,
IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
```

---

### Task 6: types.ts作成

#### 2.6.1 ファイル作成

ファイル: `apps/desktop/src/main/services/chat-edit/types.ts`

```typescript
/**
 * Chat Edit サービス用型定義
 * Renderer側の型定義を再エクスポート
 */
export {
  TextSelection,
  DiffHunk,
  DiffHunkType,
  FileContext,
  EditCommand,
  EditCommandType,
  EditCommandOptions,
  GeneratedResult,
  GeneratedResultStatus,
  FileReadResult,
  FileReadError,
  FileWriteResult,
  FileWriteError,
  FileWriteOptions,
  FileContextInput,
  SendWithContextRequest,
  SendWithContextResponse,
  SendError,
  SendOptions,
  MAX_FILE_CONTEXTS,
  MAX_FILE_SIZE,
  MAX_CONTEXT_SIZE,
} from "../../../renderer/features/workspace-chat-edit/types";
```

---

### Task 7: index.ts作成

#### 2.7.1 ファイル作成

ファイル: `apps/desktop/src/main/services/chat-edit/index.ts`

```typescript
export { FileService } from "./FileService";
export { ContextBuilder, MAX_CONTEXT_SIZE } from "./ContextBuilder";
export { ChatEditService } from "./ChatEditService";
export * from "./types";
```

---

## 3. 参照資料

### 3.1 システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                         |
| ------------------------ | ---------------------------------------------------------------------------- |
| アーキテクチャパターン   | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
| セキュリティ（Electron） | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |

### 3.2 既存実装参照

| 実装          | パス                                         |
| ------------- | -------------------------------------------- |
| SkillService  | `apps/desktop/src/main/services/skill/`      |
| skillHandlers | `apps/desktop/src/main/ipc/skillHandlers.ts` |
| LLMAdapter    | `apps/desktop/src/main/adapters/llm/`        |

---

## 4. 成果物

| 成果物              | 配置先                                      |
| ------------------- | ------------------------------------------- |
| FileService.ts      | `apps/desktop/src/main/services/chat-edit/` |
| ContextBuilder.ts   | `apps/desktop/src/main/services/chat-edit/` |
| ChatEditService.ts  | `apps/desktop/src/main/services/chat-edit/` |
| types.ts            | `apps/desktop/src/main/services/chat-edit/` |
| index.ts            | `apps/desktop/src/main/services/chat-edit/` |
| chatEditHandlers.ts | `apps/desktop/src/main/ipc/`                |
| channels.ts（更新） | `apps/desktop/src/preload/`                 |

---

## 5. 統合テスト連携【必須】

実装時に統合ポイントを考慮する:

| 統合ポイント        | 実装確認項目                        | 確認 |
| ------------------- | ----------------------------------- | ---- |
| Renderer → Main IPC | chat-edit:\* ハンドラ登録           | -    |
| Main → FileSystem   | fs.promises使用、エラーハンドリング | -    |
| Main → LLMAdapter   | LLMAdapter.sendMessage呼び出し      | -    |
| 認証/検証           | validateIpcSender適用               | -    |
| ホワイトリスト      | ALLOWED_INVOKE_CHANNELS追加         | -    |

---

## 6. 完了条件

- [ ] FileServiceが実装されている
- [ ] ContextBuilderが実装されている
- [ ] ChatEditServiceが実装されている
- [ ] chatEditHandlersが実装されている
- [ ] channels.tsが更新されている
- [ ] Phase 4のテストが全てパスする（Green状態）
- [ ] 型エラーが0件
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. FileService実装（Task 1）
3. ContextBuilder実装（Task 2）
4. ChatEditService実装（Task 3）
5. chatEditHandlers実装（Task 4）
6. チャンネル定義・Preload API更新（Task 5）
7. types.ts作成（Task 6）
8. index.ts作成（Task 7）
9. 統合テスト連携の確認
10. 完了条件の検証

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
  docs/30-workflows/workspace-chat-edit-main-process --phase 5
```

---

## 9. 次のPhase

Phase 6: テスト拡充
