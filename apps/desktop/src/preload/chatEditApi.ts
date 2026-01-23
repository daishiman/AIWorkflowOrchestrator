/**
 * chatEditApi - workspace-chat-edit Preload API
 *
 * @description Renderer Process から Main Process への IPC ブリッジ
 */

import { ipcRenderer } from "electron";
import type {
  FileReadResult,
  FileWriteResult,
  FileWriteOptions,
  TextSelection,
  SendWithContextRequest,
  SendWithContextResponse,
  StreamOutputEvent,
} from "../renderer/features/workspace-chat-edit/types";

/**
 * IPC チャンネル名
 */
const CHANNELS = {
  READ_FILE: "chat-edit:read-file",
  WRITE_FILE: "chat-edit:write-file",
  GET_SELECTION: "chat-edit:get-selection",
  DETECT_LANGUAGE: "chat-edit:detect-language",
  SEND_WITH_CONTEXT: "chat-edit:send-with-context",
  STREAM_OUTPUT: "chat-edit:stream-output",
} as const;

/**
 * ChatEditAPI インターフェース
 */
export interface ChatEditAPI {
  /**
   * ファイルを読み込む
   * @param filePath ファイルの絶対パス
   * @returns ファイル内容と言語情報
   */
  readFile: (filePath: string) => Promise<FileReadResult>;

  /**
   * ファイルに書き込む
   * @param filePath ファイルの絶対パス
   * @param content 書き込む内容
   * @param options 書き込みオプション
   * @returns 書き込み結果
   */
  writeFile: (
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ) => Promise<FileWriteResult>;

  /**
   * エディタの選択範囲を取得
   * @returns 選択範囲（選択なしの場合はnull）
   */
  getEditorSelection: () => Promise<TextSelection | null>;

  /**
   * ファイルパスから言語を検出
   * @param filePath ファイルパス
   * @returns 言語ID
   */
  detectLanguage: (filePath: string) => Promise<string>;

  /**
   * コンテキスト付きでLLMにメッセージを送信
   * @param request 送信リクエスト
   * @returns 送信結果
   */
  sendWithContext: (
    request: SendWithContextRequest,
  ) => Promise<SendWithContextResponse>;

  /**
   * ストリーミング出力イベントを購読
   * @param callback イベントハンドラ
   * @returns 購読解除関数
   */
  onStreamOutput: (callback: (event: StreamOutputEvent) => void) => () => void;
}

/**
 * ChatEditAPI 実装
 */
export const chatEditAPI: ChatEditAPI = {
  readFile: (filePath: string): Promise<FileReadResult> => {
    return ipcRenderer.invoke(CHANNELS.READ_FILE, filePath);
  },

  writeFile: (
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ): Promise<FileWriteResult> => {
    return ipcRenderer.invoke(CHANNELS.WRITE_FILE, filePath, content, options);
  },

  getEditorSelection: (): Promise<TextSelection | null> => {
    return ipcRenderer.invoke(CHANNELS.GET_SELECTION);
  },

  detectLanguage: (filePath: string): Promise<string> => {
    return ipcRenderer.invoke(CHANNELS.DETECT_LANGUAGE, filePath);
  },

  sendWithContext: (
    request: SendWithContextRequest,
  ): Promise<SendWithContextResponse> => {
    return ipcRenderer.invoke(CHANNELS.SEND_WITH_CONTEXT, request);
  },

  onStreamOutput: (
    callback: (event: StreamOutputEvent) => void,
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      data: StreamOutputEvent,
    ) => {
      callback(data);
    };

    ipcRenderer.on(CHANNELS.STREAM_OUTPUT, handler);

    // 購読解除関数を返す
    return () => {
      ipcRenderer.removeListener(CHANNELS.STREAM_OUTPUT, handler);
    };
  },
};

/**
 * window.chatEditAPI として公開
 */
export const exposeChatEditAPI = (): void => {
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).chatEditAPI = chatEditAPI;
  }
};

export default chatEditAPI;
