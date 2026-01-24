/**
 * chatEditHandlers - workspace-chat-edit IPC ハンドラー
 *
 * @description Main Process側でファイル操作とLLM連携を処理するIPCハンドラー
 */

import { ipcMain, IpcMainInvokeEvent } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import type {
  FileReadResult,
  FileWriteResult,
  FileWriteOptions,
  TextSelection,
  SendWithContextRequest,
  SendWithContextResponse,
} from "../../renderer/features/workspace-chat-edit/types";

/**
 * 言語マッピング
 */
const LANGUAGE_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  rs: "rust",
  go: "go",
  java: "java",
  kt: "kotlin",
  md: "markdown",
  mdx: "markdown",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  sql: "sql",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  c: "c",
  cpp: "cpp",
  h: "c",
  hpp: "cpp",
};

/**
 * ファイルサイズ上限（10MB）
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * コンテキストサイズ上限（100KB）
 */
const MAX_CONTEXT_SIZE = 100 * 1024;

/**
 * 拡張子から言語を検出
 */
const detectLanguage = (filePath: string): string => {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return LANGUAGE_MAP[ext] || "plaintext";
};

/**
 * ワークスペースパスを取得（実装は環境に依存）
 */
const getWorkspacePath = (): string | null => {
  // TODO: 実際のワークスペース管理から取得
  return process.cwd();
};

/**
 * パスがワークスペース内かどうかを検証
 */
const isWithinWorkspace = (
  filePath: string,
  workspacePath: string,
): boolean => {
  const resolvedFilePath = path.resolve(filePath);
  const resolvedWorkspace = path.resolve(workspacePath);
  return resolvedFilePath.startsWith(resolvedWorkspace);
};

/**
 * パストラバーサル攻撃を検出
 */
const hasPathTraversal = (filePath: string): boolean => {
  return filePath.includes("..") || filePath.includes("//");
};

/**
 * chat-edit:read-file ハンドラー
 * ファイルを読み込んで内容と言語情報を返す
 */
const handleReadFile = async (
  _event: IpcMainInvokeEvent,
  filePath: string,
): Promise<FileReadResult> => {
  try {
    // パス検証
    if (!path.isAbsolute(filePath)) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Path must be absolute",
        },
      };
    }

    // パストラバーサル検出
    if (hasPathTraversal(filePath)) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Path traversal detected",
        },
      };
    }

    // ワークスペース検証
    const workspacePath = getWorkspacePath();
    if (workspacePath && !isWithinWorkspace(filePath, workspacePath)) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Access outside workspace is not allowed",
        },
      };
    }

    // ファイルの存在確認とサイズ取得
    const stats = await fs.stat(filePath);

    // ファイルサイズチェック
    if (stats.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: {
          code: "TOO_LARGE",
          message: `File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`,
        },
      };
    }

    // ファイル読み込み
    const content = await fs.readFile(filePath, "utf-8");
    const language = detectLanguage(filePath);

    return {
      success: true,
      content,
      language,
      fileSize: stats.size,
    };
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === "ENOENT") {
      return {
        success: false,
        error: {
          code: "FILE_NOT_FOUND",
          message: `File not found: ${filePath}`,
        },
      };
    }

    if (err.code === "EACCES" || err.code === "EPERM") {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Access to this file is not allowed",
        },
      };
    }

    return {
      success: false,
      error: {
        code: "READ_ERROR",
        message: err.message || "Failed to read file",
      },
    };
  }
};

/**
 * chat-edit:write-file ハンドラー
 * ファイルに内容を書き込む
 */
const handleWriteFile = async (
  _event: IpcMainInvokeEvent,
  filePath: string,
  content: string,
  options?: FileWriteOptions,
): Promise<FileWriteResult> => {
  try {
    // パス検証
    if (!path.isAbsolute(filePath)) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Path must be absolute",
        },
      };
    }

    // パストラバーサル検出
    if (hasPathTraversal(filePath)) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Path traversal detected",
        },
      };
    }

    // ワークスペース検証
    const workspacePath = getWorkspacePath();
    if (workspacePath && !isWithinWorkspace(filePath, workspacePath)) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Access outside workspace is not allowed",
        },
      };
    }

    let backupPath: string | undefined;

    // バックアップ作成
    if (options?.createBackup) {
      try {
        await fs.access(filePath);
        backupPath = `${filePath}.bak`;
        await fs.copyFile(filePath, backupPath);
      } catch {
        // ファイルが存在しない場合はバックアップ不要
      }
    }

    // ディレクトリが存在しない場合は作成
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // ファイル書き込み
    const encoding = options?.encoding || "utf-8";
    await fs.writeFile(filePath, content, {
      encoding: encoding as BufferEncoding,
    });

    return {
      success: true,
      backupPath,
    };
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === "EACCES" || err.code === "EPERM") {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Permission denied",
        },
      };
    }

    return {
      success: false,
      error: {
        code: "WRITE_ERROR",
        message: err.message || "Failed to write file",
      },
    };
  }
};

/**
 * chat-edit:get-selection ハンドラー
 * エディタの選択範囲を取得
 */
const handleGetSelection = async (
  _event: IpcMainInvokeEvent,
): Promise<TextSelection | null> => {
  // TODO: Monaco Editorとの連携を実装
  // この実装はレンダラープロセスからの情報が必要
  return null;
};

/**
 * chat-edit:detect-language ハンドラー
 * ファイルパスから言語を検出
 */
const handleDetectLanguage = async (
  _event: IpcMainInvokeEvent,
  filePath: string,
): Promise<string> => {
  return detectLanguage(filePath);
};

/**
 * chat-edit:send-with-context ハンドラー
 * コンテキスト付きでLLMにメッセージを送信
 */
const handleSendWithContext = async (
  _event: IpcMainInvokeEvent,
  request: SendWithContextRequest,
): Promise<SendWithContextResponse> => {
  try {
    // コンテキストサイズチェック
    const totalSize = request.contexts.reduce(
      (sum, ctx) => sum + ctx.content.length,
      0,
    );

    if (totalSize > MAX_CONTEXT_SIZE) {
      return {
        success: false,
        error: {
          code: "CONTEXT_TOO_LARGE",
          message: `Context size (${(totalSize / 1024).toFixed(1)}KB) exceeds 100KB limit`,
          retryable: false,
        },
      };
    }

    // TODO: 実際のLLM連携を実装
    // ここでは仮の実装として、生成結果を返す

    // プロンプトを構築
    buildPrompt(request);

    // LLM APIを呼び出し（仮実装）
    // const llmResponse = await callLLM(prompt, request.options);

    // 仮の生成結果
    const generatedContent = request.contexts[0]?.content || "";

    return {
      success: true,
      result: {
        id: `result-${Date.now()}`,
        contextId: request.command.targetContextId,
        originalContent: request.contexts[0]?.content || "",
        generatedContent: generatedContent + "\n// Modified by LLM",
        diffHunks: [],
        status: "pending",
        createdAt: new Date(),
        targetFilePath: request.contexts[0]?.filePath || "",
        command: request.command,
      },
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: {
        code: "LLM_ERROR",
        message: err.message || "Failed to communicate with LLM",
        retryable: true,
      },
    };
  }
};

/**
 * LLMプロンプトを構築
 */
const buildPrompt = (request: SendWithContextRequest): string => {
  const { contexts, command, message } = request;

  let prompt = "以下のファイルコンテキストに基づいて、";

  switch (command.type) {
    case "continue":
      prompt += "コードの続きを生成してください。";
      break;
    case "refactor":
      prompt += "コードをリファクタリングしてください。";
      break;
    case "generate-test":
      prompt += "テストコードを生成してください。";
      break;
    case "add-comment":
      prompt += "コメントを追加してください。";
      break;
    case "custom":
      prompt += `${command.instruction || "指示に従ってください。"}`;
      break;
  }

  prompt += "\n\n";

  // コンテキストを追加
  for (const ctx of contexts) {
    prompt += `=== ${ctx.filePath} ===\n`;
    prompt += "```" + ctx.language + "\n";
    prompt += ctx.content;
    prompt += "\n```\n\n";
  }

  // ユーザーメッセージを追加
  if (message) {
    prompt += `ユーザー指示: ${message}\n`;
  }

  return prompt;
};

/**
 * ストリーミング出力用コールバック登録
 */
const streamCallbacks: Map<number, (event: unknown) => void> = new Map();

/**
 * chat-edit:stream-output ハンドラー
 * ストリーミング出力イベントを登録
 */
const _handleStreamOutput = (
  event: IpcMainInvokeEvent,
  callback: (event: unknown) => void,
): (() => void) => {
  const webContentsId = event.sender.id;
  streamCallbacks.set(webContentsId, callback);

  // クリーンアップ関数を返す
  return () => {
    streamCallbacks.delete(webContentsId);
  };
};

/**
 * IPCチャンネル名
 */
export const CHAT_EDIT_CHANNELS = {
  READ_FILE: "chat-edit:read-file",
  WRITE_FILE: "chat-edit:write-file",
  GET_SELECTION: "chat-edit:get-selection",
  DETECT_LANGUAGE: "chat-edit:detect-language",
  SEND_WITH_CONTEXT: "chat-edit:send-with-context",
  STREAM_OUTPUT: "chat-edit:stream-output",
} as const;

/**
 * chat-edit IPCハンドラーを登録
 */
export const registerChatEditHandlers = (): void => {
  ipcMain.handle(CHAT_EDIT_CHANNELS.READ_FILE, handleReadFile);
  ipcMain.handle(CHAT_EDIT_CHANNELS.WRITE_FILE, handleWriteFile);
  ipcMain.handle(CHAT_EDIT_CHANNELS.GET_SELECTION, handleGetSelection);
  ipcMain.handle(CHAT_EDIT_CHANNELS.DETECT_LANGUAGE, handleDetectLanguage);
  ipcMain.handle(CHAT_EDIT_CHANNELS.SEND_WITH_CONTEXT, handleSendWithContext);
};

/**
 * chat-edit IPCハンドラーを解除
 */
export const unregisterChatEditHandlers = (): void => {
  ipcMain.removeHandler(CHAT_EDIT_CHANNELS.READ_FILE);
  ipcMain.removeHandler(CHAT_EDIT_CHANNELS.WRITE_FILE);
  ipcMain.removeHandler(CHAT_EDIT_CHANNELS.GET_SELECTION);
  ipcMain.removeHandler(CHAT_EDIT_CHANNELS.DETECT_LANGUAGE);
  ipcMain.removeHandler(CHAT_EDIT_CHANNELS.SEND_WITH_CONTEXT);
  streamCallbacks.clear();
};

export default registerChatEditHandlers;
