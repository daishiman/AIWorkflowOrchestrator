/**
 * 認証キー Preload API
 *
 * contextBridge 経由で Renderer Process に公開する
 * 認証キー管理 API を定義する。
 *
 * @see ipc-specification.md
 */

import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./channels";
import type {
  AuthKeySetResponse,
  AuthKeyExistsResponse,
  AuthKeyValidateResponse,
  AuthKeyDeleteResponse,
} from "../main/services/auth/types";

/**
 * 認証キー API インターフェース
 *
 * Renderer Process から呼び出す API の型定義。
 */
export interface AuthKeyAPI {
  /**
   * 認証キーを設定
   *
   * @param key - Anthropic API Key
   * @returns 設定結果
   */
  set(key: string): Promise<AuthKeySetResponse>;

  /**
   * 認証キーの存在確認
   *
   * @returns 存在確認結果
   */
  exists(): Promise<AuthKeyExistsResponse>;

  /**
   * 認証キーを検証
   *
   * Anthropic API に対して検証リクエストを送信し、
   * キーが有効かどうかを確認する。
   *
   * @param key - 検証対象のキー
   * @returns 検証結果
   */
  validate(key: string): Promise<AuthKeyValidateResponse>;

  /**
   * 認証キーを削除
   *
   * @returns 削除結果
   */
  delete(): Promise<AuthKeyDeleteResponse>;
}

/**
 * 認証キー API 実装
 *
 * IPC 経由で Main Process と通信する。
 */
export const authKeyAPI: AuthKeyAPI = {
  /**
   * 認証キーを設定
   */
  set: (key: string): Promise<AuthKeySetResponse> =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_KEY_SET, { key }),

  /**
   * 認証キーの存在確認
   */
  exists: (): Promise<AuthKeyExistsResponse> =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_KEY_EXISTS),

  /**
   * 認証キーを検証
   */
  validate: (key: string): Promise<AuthKeyValidateResponse> =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_KEY_VALIDATE, { key }),

  /**
   * 認証キーを削除
   */
  delete: (): Promise<AuthKeyDeleteResponse> =>
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_KEY_DELETE),
};
