/**
 * AuthKeyService - 認証キー管理サービス
 *
 * Claude Agent SDK 用の Anthropic API Key を安全に管理する。
 *
 * @description
 * - safeStorage API による暗号化
 * - electron-store による永続化
 * - 環境変数フォールバック対応
 * - メモリキャッシュによるパフォーマンス最適化
 *
 * @see architecture-design.md
 * @see ipc-specification.md
 */

import { safeStorage } from "electron";
import Store from "electron-store";
import type {
  IAuthKeyService,
  IAuthKeyStorage,
  AuthKeyStoreSchema,
  AuthKeyStorageConfig,
} from "./types";
import {
  AUTH_KEY_STORE_NAME,
  ENCRYPTED_AUTH_KEY,
  ENV_ANTHROPIC_API_KEY,
  MAX_KEY_LENGTH,
  MIN_KEY_LENGTH,
  ANTHROPIC_API_ENDPOINT,
  ANTHROPIC_API_VERSION,
  ANTHROPIC_VALIDATION_MODEL,
} from "./types";

// =================================================================
// AuthKeyStorage 実装
// =================================================================

// 遅延初期化（テスト時にモックが間に合うように）
let store: Store<AuthKeyStoreSchema> | null = null;

/**
 * Store インスタンスを取得
 */
function getStore(config?: AuthKeyStorageConfig): Store<AuthKeyStoreSchema> {
  if (!store) {
    store = new Store<AuthKeyStoreSchema>({
      name: config?.storeName ?? AUTH_KEY_STORE_NAME,
      encryptionKey: config?.encryptionKey ?? "knowledge-studio-auth-key",
    });
  }
  return store;
}

/**
 * AuthKeyStorage を作成
 *
 * safeStorage API を使用した暗号化/復号と
 * electron-store を使用した永続化を提供する。
 *
 * @param config - ストレージ設定
 * @returns IAuthKeyStorage 実装
 */
export function createAuthKeyStorage(
  config?: AuthKeyStorageConfig,
): IAuthKeyStorage {
  return {
    /**
     * 認証キーを暗号化して保存
     */
    store: async (key: string): Promise<void> => {
      try {
        if (safeStorage.isEncryptionAvailable()) {
          const encrypted = safeStorage.encryptString(key);
          getStore(config).set(
            ENCRYPTED_AUTH_KEY,
            encrypted.toString("base64"),
          );
        } else {
          // 暗号化が利用できない場合は警告を出して平文で保存（開発環境向け）
          console.warn(
            "[AuthKeyStorage] Encryption not available, storing key in plain text",
          );
          getStore(config).set(ENCRYPTED_AUTH_KEY, key);
        }
      } catch (error) {
        console.error("[AuthKeyStorage] Failed to store auth key:", error);
        throw error;
      }
    },

    /**
     * 認証キーを取得（復号済み）
     */
    retrieve: async (): Promise<string | null> => {
      try {
        const stored = getStore(config).get(ENCRYPTED_AUTH_KEY);
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
        console.error("[AuthKeyStorage] Failed to retrieve auth key:", error);
        return null;
      }
    },

    /**
     * 認証キーを削除
     */
    delete: async (): Promise<void> => {
      try {
        getStore(config).delete(ENCRYPTED_AUTH_KEY);
      } catch (error) {
        console.error("[AuthKeyStorage] Failed to delete auth key:", error);
        throw error;
      }
    },

    /**
     * 認証キーの存在確認
     */
    exists: async (): Promise<boolean> => {
      const stored = getStore(config).get(ENCRYPTED_AUTH_KEY);
      return stored !== undefined && stored !== null && stored !== "";
    },
  };
}

/**
 * テスト用: ストアをクリア
 */
export function clearAuthKeyStore(): void {
  getStore().clear();
}

/**
 * テスト用: ストアインスタンスをリセット
 */
export function resetAuthKeyStore(): void {
  store = null;
}

// =================================================================
// AuthKeyService 実装
// =================================================================

/**
 * 認証キー管理サービス
 *
 * IAuthKeyService インターフェースを実装し、
 * 認証キーの設定・取得・検証・削除を提供する。
 *
 * @example
 * ```typescript
 * const storage = createAuthKeyStorage();
 * const service = new AuthKeyService(storage);
 *
 * await service.setKey("sk-ant-api03-xxx");
 * const key = await service.getKey();
 * const isValid = await service.validateKey(key);
 * ```
 */
export class AuthKeyService implements IAuthKeyService {
  private storage: IAuthKeyStorage;
  private cachedKey: string | null = null;

  /**
   * コンストラクタ
   *
   * @param storage - ストレージ実装（DIまたはデフォルト作成）
   */
  constructor(storage?: IAuthKeyStorage) {
    this.storage = storage ?? createAuthKeyStorage();
  }

  /**
   * 認証キーを暗号化して保存
   *
   * @param key - Anthropic API Key
   * @throws Error - キーが不正な形式の場合
   */
  async setKey(key: string): Promise<void> {
    // バリデーション
    this.validateKeyFormat(key);

    // 保存
    await this.storage.store(key);

    // キャッシュ更新
    this.cachedKey = key;
  }

  /**
   * 認証キーを取得（復号済み）
   *
   * 取得優先順位:
   * 1. メモリキャッシュ
   * 2. electron-store に保存されたキー
   * 3. ANTHROPIC_API_KEY 環境変数
   *
   * @returns 認証キー、未設定の場合は null
   */
  async getKey(): Promise<string | null> {
    // 1. キャッシュ確認
    if (this.cachedKey) {
      return this.cachedKey;
    }

    // 2. ストレージから取得
    const storedKey = await this.storage.retrieve();
    if (storedKey) {
      this.cachedKey = storedKey;
      return storedKey;
    }

    // 3. 環境変数フォールバック
    const envKey = process.env[ENV_ANTHROPIC_API_KEY];
    if (envKey) {
      return envKey;
    }

    return null;
  }

  /**
   * 認証キーの存在確認
   *
   * @returns キーが設定されている場合 true
   */
  async hasKey(): Promise<boolean> {
    // キャッシュ確認
    if (this.cachedKey) {
      return true;
    }

    // ストレージ確認
    const storageExists = await this.storage.exists();
    if (storageExists) {
      return true;
    }

    // 環境変数確認
    const envKey = process.env[ENV_ANTHROPIC_API_KEY];
    return envKey !== undefined && envKey !== "";
  }

  /**
   * 認証キーを Anthropic API で検証
   *
   * @param key - 検証対象のキー
   * @returns 有効なキーの場合 true
   */
  async validateKey(key: string): Promise<boolean> {
    // 形式チェック
    try {
      this.validateKeyFormat(key);
    } catch {
      return false;
    }

    // API 検証
    try {
      const response = await fetch(ANTHROPIC_API_ENDPOINT, {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": ANTHROPIC_API_VERSION,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: ANTHROPIC_VALIDATION_MODEL,
          max_tokens: 1,
          messages: [{ role: "user", content: "test" }],
        }),
      });

      // 401/403 以外は有効なキーとみなす
      // 429 (Rate Limit) や 200 (Success) は有効なキー
      return response.status !== 401 && response.status !== 403;
    } catch (error) {
      // ネットワークエラーは検証失敗として扱う
      console.error("[AuthKeyService] API validation failed:", error);
      return false;
    }
  }

  /**
   * 認証キーを削除
   *
   * 保存されたキーとキャッシュを両方クリアする。
   */
  async deleteKey(): Promise<void> {
    await this.storage.delete();
    this.cachedKey = null;
  }

  /**
   * キャッシュをクリア（テスト用）
   */
  clearCache(): void {
    this.cachedKey = null;
  }

  /**
   * キーの形式をバリデーション
   *
   * @param key - 検証対象のキー
   * @throws Error - キーが不正な形式の場合
   */
  private validateKeyFormat(key: string): void {
    if (!key || typeof key !== "string") {
      throw new Error("API Key cannot be empty");
    }

    if (key.length < MIN_KEY_LENGTH) {
      throw new Error("API Key is too short");
    }

    if (key.length > MAX_KEY_LENGTH) {
      throw new Error("API Key is too long");
    }

    // Anthropic API Key のプレフィックスチェック
    // 注意: 将来のフォーマット変更に備えて厳密すぎないチェック
    if (!key.startsWith("sk-")) {
      throw new Error("Invalid API Key format: must start with 'sk-'");
    }
  }
}
