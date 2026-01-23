# IPC API設計書 - workspace-chat-edit

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | TASK-WS-CHAT-EDIT-001 |
| Phase    | 2                     |
| 作成日   | 2026-01-23            |

---

## IPC チャンネル定義

### チャンネル一覧

| チャンネル名                  | 方向          | 説明                           | セキュリティ   |
| ----------------------------- | ------------- | ------------------------------ | -------------- |
| `chat-edit:read-file`         | Renderer→Main | ファイル内容の読み取り         | ホワイトリスト |
| `chat-edit:write-file`        | Renderer→Main | ファイルへの書き込み           | ホワイトリスト |
| `chat-edit:get-selection`     | Renderer→Main | エディタ選択範囲の取得         | ホワイトリスト |
| `chat-edit:send-with-context` | Renderer→Main | コンテキスト付きメッセージ送信 | ホワイトリスト |
| `chat-edit:detect-language`   | Renderer→Main | ファイルの言語検出             | ホワイトリスト |
| `chat-edit:stream-output`     | Main→Renderer | ストリーミング出力             | イベント       |

---

## Preload API定義

### ChatEditAPI Interface

```typescript
// apps/desktop/src/preload/types.ts

export interface ChatEditAPI {
  /**
   * ファイル内容を読み取る
   * @param filePath 読み取るファイルのパス
   * @returns ファイル読み取り結果
   */
  readFile: (filePath: string) => Promise<FileReadResult>;

  /**
   * ファイルに内容を書き込む
   * @param filePath 書き込むファイルのパス
   * @param content 書き込む内容
   * @param options 書き込みオプション
   * @returns ファイル書き込み結果
   */
  writeFile: (
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ) => Promise<FileWriteResult>;

  /**
   * エディタの選択範囲を取得
   * @returns 選択範囲またはnull
   */
  getEditorSelection: () => Promise<TextSelection | null>;

  /**
   * コンテキスト付きでメッセージを送信
   * @param request 送信リクエスト
   * @returns 生成結果
   */
  sendWithContext: (
    request: SendWithContextRequest,
  ) => Promise<SendWithContextResponse>;

  /**
   * ファイルの言語を検出
   * @param filePath ファイルパス
   * @returns 言語識別子
   */
  detectLanguage: (filePath: string) => Promise<string>;

  /**
   * ストリーミング出力を購読
   * @param callback コールバック関数
   * @returns 購読解除関数
   */
  onStreamOutput: (callback: (event: StreamOutputEvent) => void) => () => void;
}
```

---

## リクエスト/レスポンス型定義

### FileReadResult

```typescript
interface FileReadResult {
  success: boolean;
  content?: string;
  language?: string;
  fileSize?: number;
  error?: FileReadError;
}

interface FileReadError {
  code: "FILE_NOT_FOUND" | "PERMISSION_DENIED" | "READ_ERROR" | "TOO_LARGE";
  message: string;
}
```

### FileWriteOptions / FileWriteResult

```typescript
interface FileWriteOptions {
  /** バックアップを作成するか */
  createBackup?: boolean;
  /** エンコーディング（デフォルト: utf-8） */
  encoding?: string;
}

interface FileWriteResult {
  success: boolean;
  backupPath?: string;
  error?: FileWriteError;
}

interface FileWriteError {
  code: "PERMISSION_DENIED" | "WRITE_ERROR" | "INVALID_PATH";
  message: string;
}
```

### SendWithContextRequest / Response

```typescript
interface SendWithContextRequest {
  /** 添付するファイルコンテキスト */
  contexts: FileContextInput[];
  /** 編集コマンド */
  command: EditCommand;
  /** ユーザーメッセージ */
  message: string;
  /** オプション */
  options?: SendOptions;
}

interface FileContextInput {
  filePath: string;
  content: string;
  selection?: TextSelection;
  language: string;
}

interface SendOptions {
  /** 使用するモデルID */
  modelId?: string;
  /** ストリーミング有効化 */
  stream?: boolean;
  /** 最大トークン数 */
  maxTokens?: number;
}

interface SendWithContextResponse {
  success: boolean;
  result?: GeneratedResult;
  error?: SendError;
}

interface SendError {
  code:
    | "CONTEXT_TOO_LARGE"
    | "LLM_ERROR"
    | "TIMEOUT"
    | "RATE_LIMIT"
    | "INVALID_COMMAND";
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
}
```

### StreamOutputEvent

```typescript
interface StreamOutputEvent {
  /** イベントタイプ */
  type: "content" | "done" | "error";
  /** コンテンツ（typeがcontentの場合） */
  content?: string;
  /** 完了フラグ（typeがdoneの場合） */
  done?: boolean;
  /** エラー情報（typeがerrorの場合） */
  error?: StreamError;
}

interface StreamError {
  code: string;
  message: string;
}
```

---

## Main Process Handler実装

### ハンドラー登録

```typescript
// apps/desktop/src/main/ipc/chatEditHandlers.ts

import { ipcMain, BrowserWindow } from "electron";
import { validateIpcSender } from "../security/ipcSecurity";
import { ChatEditService } from "../services/chat-edit/ChatEditService";
import { FileService } from "../services/chat-edit/FileService";

export function registerChatEditHandlers(
  mainWindow: BrowserWindow,
  fileService: FileService,
  chatEditService: ChatEditService,
): void {
  // chat-edit:read-file
  ipcMain.handle("chat-edit:read-file", async (event, filePath: string) => {
    validateIpcSender(event, mainWindow);
    return fileService.readFile(filePath);
  });

  // chat-edit:write-file
  ipcMain.handle(
    "chat-edit:write-file",
    async (
      event,
      filePath: string,
      content: string,
      options?: FileWriteOptions,
    ) => {
      validateIpcSender(event, mainWindow);
      return fileService.writeFile(filePath, content, options);
    },
  );

  // chat-edit:get-selection
  ipcMain.handle("chat-edit:get-selection", async (event) => {
    validateIpcSender(event, mainWindow);
    // Monaco Editorから選択範囲を取得するロジック
    return fileService.getEditorSelection(mainWindow);
  });

  // chat-edit:send-with-context
  ipcMain.handle(
    "chat-edit:send-with-context",
    async (event, request: SendWithContextRequest) => {
      validateIpcSender(event, mainWindow);
      return chatEditService.sendWithContext(request, mainWindow);
    },
  );

  // chat-edit:detect-language
  ipcMain.handle(
    "chat-edit:detect-language",
    async (event, filePath: string) => {
      validateIpcSender(event, mainWindow);
      return fileService.detectLanguage(filePath);
    },
  );
}
```

### チャンネル定数定義

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ... 既存チャンネル

  // Chat Edit channels
  CHAT_EDIT_READ_FILE: "chat-edit:read-file",
  CHAT_EDIT_WRITE_FILE: "chat-edit:write-file",
  CHAT_EDIT_GET_SELECTION: "chat-edit:get-selection",
  CHAT_EDIT_SEND_WITH_CONTEXT: "chat-edit:send-with-context",
  CHAT_EDIT_DETECT_LANGUAGE: "chat-edit:detect-language",
  CHAT_EDIT_STREAM_OUTPUT: "chat-edit:stream-output",
} as const;

// ホワイトリストに追加
export const ALLOWED_INVOKE_CHANNELS = [
  // ... 既存チャンネル
  IPC_CHANNELS.CHAT_EDIT_READ_FILE,
  IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
  IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
  IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
  IPC_CHANNELS.CHAT_EDIT_DETECT_LANGUAGE,
];

export const ALLOWED_ON_CHANNELS = [
  // ... 既存チャンネル
  IPC_CHANNELS.CHAT_EDIT_STREAM_OUTPUT,
];
```

---

## Preload API実装

```typescript
// apps/desktop/src/preload/index.ts

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "./channels";
import type { ChatEditAPI } from "./types";

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }
  const handler = (_event: IpcRendererEvent, data: T) => callback(data);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

const chatEditAPI: ChatEditAPI = {
  readFile: (filePath: string) =>
    safeInvoke(IPC_CHANNELS.CHAT_EDIT_READ_FILE, filePath),

  writeFile: (filePath: string, content: string, options?: FileWriteOptions) =>
    safeInvoke(IPC_CHANNELS.CHAT_EDIT_WRITE_FILE, filePath, content, options),

  getEditorSelection: () => safeInvoke(IPC_CHANNELS.CHAT_EDIT_GET_SELECTION),

  sendWithContext: (request: SendWithContextRequest) =>
    safeInvoke(IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT, request),

  detectLanguage: (filePath: string) =>
    safeInvoke(IPC_CHANNELS.CHAT_EDIT_DETECT_LANGUAGE, filePath),

  onStreamOutput: (callback: (event: StreamOutputEvent) => void) =>
    safeOn<StreamOutputEvent>(IPC_CHANNELS.CHAT_EDIT_STREAM_OUTPUT, callback),
};

contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI);
```

---

## セキュリティ仕様

### ファイルアクセス制限

```typescript
// apps/desktop/src/main/services/chat-edit/FileService.ts

import path from "path";
import { app } from "electron";

export class FileService {
  private workspacePath: string;

  constructor(workspacePath?: string) {
    this.workspacePath = workspacePath || app.getPath("documents");
  }

  /**
   * ファイルパスがワークスペース内かを検証
   */
  private validateFilePath(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath);
    const normalizedWorkspace = path.normalize(this.workspacePath);

    // パストラバーサル防止
    if (!path.isAbsolute(normalizedPath)) {
      return false;
    }

    // ワークスペース外へのアクセス防止
    if (!normalizedPath.startsWith(normalizedWorkspace)) {
      return false;
    }

    // 隠しファイル・システムファイルへのアクセス制限
    const basename = path.basename(normalizedPath);
    if (basename.startsWith(".") && basename !== ".") {
      return false;
    }

    return true;
  }

  /**
   * ファイルを読み取る
   */
  async readFile(filePath: string): Promise<FileReadResult> {
    if (!this.validateFilePath(filePath)) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Access to this file is not allowed",
        },
      };
    }

    // ... 実装
  }
}
```

### サイズ制限

| 制限項目               | 値    | エラーコード      |
| ---------------------- | ----- | ----------------- |
| 読み取りファイルサイズ | 10MB  | TOO_LARGE         |
| 書き込みファイルサイズ | 10MB  | TOO_LARGE         |
| コンテキスト合計サイズ | 100KB | CONTEXT_TOO_LARGE |

---

## エラーハンドリング

### エラーコード一覧

| コード            | 説明                   | リトライ可能 |
| ----------------- | ---------------------- | ------------ |
| FILE_NOT_FOUND    | ファイルが存在しない   | No           |
| PERMISSION_DENIED | アクセス権限がない     | No           |
| READ_ERROR        | 読み取り中のエラー     | Yes          |
| WRITE_ERROR       | 書き込み中のエラー     | Yes          |
| TOO_LARGE         | ファイルサイズ超過     | No           |
| INVALID_PATH      | 無効なファイルパス     | No           |
| CONTEXT_TOO_LARGE | コンテキストサイズ超過 | No           |
| LLM_ERROR         | LLM通信エラー          | Yes          |
| TIMEOUT           | タイムアウト           | Yes          |
| RATE_LIMIT        | レート制限             | Yes          |
| INVALID_COMMAND   | 無効な編集コマンド     | No           |

### リトライ戦略

```typescript
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};
```

---

## 使用例

### Renderer Process（React Hook）

```typescript
// apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts

import { useCallback } from "react";
import { useChatEditStore } from "../store/chatEditSlice";

export function useFileContext() {
  const { addFileContext, removeFileContext, fileContexts } =
    useChatEditStore();

  const attachFile = useCallback(
    async (filePath: string) => {
      const result = await window.chatEditAPI.readFile(filePath);

      if (result.success && result.content) {
        addFileContext({
          filePath,
          fileName: filePath.split("/").pop() || filePath,
          content: result.content,
          language: result.language || "plaintext",
          fileSize: result.fileSize || 0,
        });
      } else {
        throw new Error(result.error?.message || "Failed to read file");
      }
    },
    [addFileContext],
  );

  return {
    attachFile,
    removeFile: removeFileContext,
    attachedFiles: fileContexts,
  };
}
```

---

## 関連ドキュメント

- アーキテクチャ設計: `outputs/phase-2/architecture-design.md`
- ドメインモデル: `outputs/phase-2/domain-model.md`
- セキュリティ仕様: `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`
- APIエンドポイント: `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`
