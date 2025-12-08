/**
 * セキュアストレージ
 *
 * リフレッシュトークンなどの機密情報を安全に保存
 * Electron の safeStorage API を使用して暗号化
 */

import { safeStorage } from "electron";
import Store from "electron-store";
import type { SecureStorage } from "../ipc/authHandlers";

const REFRESH_TOKEN_KEY = "encryptedRefreshToken";

// 遅延初期化（テスト時にモックが間に合うように）
let store: Store<{ encryptedRefreshToken?: string }> | null = null;

function getStore(): Store<{ encryptedRefreshToken?: string }> {
  if (!store) {
    store = new Store<{ encryptedRefreshToken?: string }>({
      name: "secure-tokens",
      encryptionKey: "knowledge-studio-tokens",
    });
  }
  return store;
}

/**
 * SecureStorage 実装を作成
 */
export function createSecureStorage(): SecureStorage {
  return {
    /**
     * リフレッシュトークンを安全に保存
     */
    storeRefreshToken: async (token: string): Promise<void> => {
      try {
        if (safeStorage.isEncryptionAvailable()) {
          const encrypted = safeStorage.encryptString(token);
          getStore().set(REFRESH_TOKEN_KEY, encrypted.toString("base64"));
        } else {
          // 暗号化が利用できない場合は警告を出して平文で保存（開発環境向け）
          console.warn(
            "[SecureStorage] Encryption not available, storing token in plain text",
          );
          getStore().set(REFRESH_TOKEN_KEY, token);
        }
      } catch (error) {
        console.error("[SecureStorage] Failed to store refresh token:", error);
        throw error;
      }
    },

    /**
     * リフレッシュトークンを取得
     */
    getRefreshToken: async (): Promise<string | null> => {
      try {
        const stored = getStore().get(REFRESH_TOKEN_KEY);
        if (!stored) {
          return null;
        }

        if (safeStorage.isEncryptionAvailable()) {
          const encrypted = Buffer.from(stored, "base64");
          return safeStorage.decryptString(encrypted);
        } else {
          // 暗号化が利用できない場合は平文として返す
          return stored;
        }
      } catch (error) {
        console.error(
          "[SecureStorage] Failed to retrieve refresh token:",
          error,
        );
        return null;
      }
    },

    /**
     * 全てのトークンをクリア
     */
    clearTokens: async (): Promise<void> => {
      try {
        getStore().delete(REFRESH_TOKEN_KEY);
      } catch (error) {
        console.error("[SecureStorage] Failed to clear tokens:", error);
        throw error;
      }
    },
  };
}

/**
 * テスト用: ストアをクリア
 */
export function clearSecureStore(): void {
  getStore().clear();
}

/**
 * テスト用: ストアインスタンスをリセット
 */
export function resetSecureStore(): void {
  store = null;
}
