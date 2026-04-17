import { ipcMain, safeStorage } from "electron";
import Store from "electron-store";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  StoreGetRequest,
  StoreGetResponse,
  StoreSetRequest,
  StoreSetResponse,
  StoreGetSecureRequest,
  StoreGetSecureResponse,
  StoreSetSecureRequest,
  StoreSetSecureResponse,
} from "../../preload/types";
import { validateStoreKey, createValidationErrorResponse } from "./validation";

// Store types
interface StoreSchema {
  currentView: string;
  expandedFolders: string[];
  autoSyncEnabled: boolean;
  windowSize: { width: number; height: number };
  [key: string]: unknown;
}

// Lazy-initialized store instances
let store: Store<StoreSchema> | null = null;
let secureStore: Store | null = null;

function getStore(): Store<StoreSchema> {
  if (!store) {
    store = new Store<StoreSchema>({
      name: "knowledge-studio",
      defaults: {
        currentView: "dashboard",
        expandedFolders: [],
        autoSyncEnabled: true,
        windowSize: { width: 1200, height: 800 },
      },
    });
  }
  return store;
}

function getSecureStore(): Store {
  if (!secureStore) {
    secureStore = new Store({
      name: "knowledge-studio-secure",
      encryptionKey: "knowledge-studio-encryption-key",
    });
  }
  return secureStore;
}

export function registerStoreHandlers(): void {
  // Get regular store value
  ipcMain.handle(
    IPC_CHANNELS.STORE_GET,
    async (_event, request: StoreGetRequest): Promise<StoreGetResponse> => {
      try {
        // 入力検証
        const keyValidation = validateStoreKey(request.key);
        if (!keyValidation.valid) {
          return createValidationErrorResponse(keyValidation.error!);
        }

        const value = getStore().get(request.key, request.defaultValue);
        return { success: true, data: value };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Set regular store value
  ipcMain.handle(
    IPC_CHANNELS.STORE_SET,
    async (_event, request: StoreSetRequest): Promise<StoreSetResponse> => {
      try {
        // 入力検証
        const keyValidation = validateStoreKey(request.key);
        if (!keyValidation.valid) {
          return createValidationErrorResponse(keyValidation.error!);
        }

        getStore().set(request.key, request.value);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Get secure store value (using safeStorage when available)
  ipcMain.handle(
    IPC_CHANNELS.STORE_GET_SECURE,
    async (
      _event,
      request: StoreGetSecureRequest,
    ): Promise<StoreGetSecureResponse> => {
      try {
        // 入力検証
        const keyValidation = validateStoreKey(request.key);
        if (!keyValidation.valid) {
          return createValidationErrorResponse(keyValidation.error!);
        }

        const encryptedValue = getSecureStore().get(request.key) as
          | string
          | undefined;
        if (!encryptedValue) {
          return { success: true, data: "" };
        }

        // If safeStorage is available and encryption is supported
        if (safeStorage.isEncryptionAvailable()) {
          try {
            const buffer = Buffer.from(encryptedValue, "base64");
            const decrypted = safeStorage.decryptString(buffer);
            return { success: true, data: decrypted };
          } catch {
            // Fallback to direct value if decryption fails
            return { success: true, data: encryptedValue };
          }
        }

        return { success: true, data: encryptedValue };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Set secure store value (using safeStorage when available)
  ipcMain.handle(
    IPC_CHANNELS.STORE_SET_SECURE,
    async (
      _event,
      request: StoreSetSecureRequest,
    ): Promise<StoreSetSecureResponse> => {
      try {
        // 入力検証
        const keyValidation = validateStoreKey(request.key);
        if (!keyValidation.valid) {
          return createValidationErrorResponse(keyValidation.error!);
        }

        if (safeStorage.isEncryptionAvailable()) {
          const encrypted = safeStorage.encryptString(request.value);
          getSecureStore().set(request.key, encrypted.toString("base64"));
        } else {
          // Fallback to encrypted store if safeStorage not available
          getSecureStore().set(request.key, request.value);
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}

// User Settings handlers (settings:get / settings:update)
// UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 Rule-2 fix
const USER_SETTINGS_STORE_KEY = "user-settings";
type PlainObject = Record<string, unknown>;
const DISALLOWED_MERGE_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);

/**
 * ディープマージ関数
 * - 配列は上書き（マージしない）
 * - null は上書き扱い
 * - undefined は省略（基底値を維持）
 * - プレーンオブジェクト同士は再帰的にマージ
 * - prototype pollution を防ぐため危険キーは無視
 */
function isPlainObject(value: unknown): value is PlainObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function cloneSafePlainObject(source: PlainObject): PlainObject {
  const result: PlainObject = {};

  for (const [key, value] of Object.entries(source)) {
    if (DISALLOWED_MERGE_KEYS.has(key)) continue;
    result[key] = value;
  }

  return result;
}

function deepMergePlainObjects(
  base: PlainObject,
  override: PlainObject,
): PlainObject {
  const result = cloneSafePlainObject(base);

  for (const [key, overrideVal] of Object.entries(override)) {
    if (DISALLOWED_MERGE_KEYS.has(key)) continue;
    if (overrideVal === undefined) continue;

    const baseVal = base[key];
    if (isPlainObject(baseVal) && isPlainObject(overrideVal)) {
      result[key] = deepMergePlainObjects(baseVal, overrideVal);
      continue;
    }

    result[key] = overrideVal;
  }

  return result;
}

function deepMerge<T extends PlainObject>(base: T, override: Partial<T>): T {
  return deepMergePlainObjects(base, override as PlainObject) as T;
}

export function registerUserSettingsHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.USER_SETTINGS_GET,
    async (
      _event,
    ): Promise<
      { success: true; data: unknown } | { success: false; error: string }
    > => {
      try {
        const data = getStore().get(USER_SETTINGS_STORE_KEY, {});
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.USER_SETTINGS_UPDATE,
    async (
      _event,
      updates: unknown,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        if (!isPlainObject(updates)) {
          return createValidationErrorResponse(
            "settings:update payload must be a plain object",
          );
        }

        const current = getStore().get(USER_SETTINGS_STORE_KEY, {});
        const currentSettings = isPlainObject(current) ? current : {};
        getStore().set(
          USER_SETTINGS_STORE_KEY,
          deepMerge(currentSettings, updates),
        );
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}

// Export store getter for use in other handlers
export { getStore };
