/**
 * プロフィールキャッシュ
 *
 * オフライン時にプロフィール情報をローカルにキャッシュ
 */

import Store from "electron-store";
import type { UserProfile } from "@repo/shared/types/auth";
import type { ProfileCache } from "../ipc/profileHandlers";

const PROFILE_KEY = "cachedProfile";
const CACHED_AT_KEY = "cachedAt";

// キャッシュの有効期限（24時間）
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// 遅延初期化（テスト時にモックが間に合うように）
let store: Store<{ cachedProfile?: UserProfile; cachedAt?: number }> | null =
  null;

function getStore(): Store<{
  cachedProfile?: UserProfile;
  cachedAt?: number;
}> {
  if (!store) {
    store = new Store<{ cachedProfile?: UserProfile; cachedAt?: number }>({
      name: "profile-cache",
    });
  }
  return store;
}

/**
 * ProfileCache 実装を作成
 */
export function createProfileCache(): ProfileCache {
  return {
    /**
     * キャッシュされたプロフィールを取得
     */
    getCachedProfile: async (): Promise<UserProfile | null> => {
      try {
        const profile = getStore().get(PROFILE_KEY);
        const cachedAt = getStore().get(CACHED_AT_KEY);

        if (!profile) {
          return null;
        }

        // キャッシュの有効期限をチェック
        if (cachedAt && Date.now() - cachedAt > CACHE_TTL_MS) {
          // 期限切れだがオフライン時のフォールバックとして返す
          console.warn("[ProfileCache] Cache expired, returning stale data");
        }

        return profile;
      } catch (error) {
        console.error("[ProfileCache] Failed to get cached profile:", error);
        return null;
      }
    },

    /**
     * プロフィールをキャッシュに保存
     */
    updateCachedProfile: async (profile: UserProfile): Promise<void> => {
      try {
        getStore().set(PROFILE_KEY, profile);
        getStore().set(CACHED_AT_KEY, Date.now());
      } catch (error) {
        console.error("[ProfileCache] Failed to update cached profile:", error);
        // キャッシュ更新の失敗は無視（重大ではない）
      }
    },
  };
}

/**
 * テスト用: キャッシュをクリア
 */
export function clearProfileCache(): void {
  getStore().clear();
}

/**
 * テスト用: キャッシュ有効期限を取得
 */
export function getCacheTTL(): number {
  return CACHE_TTL_MS;
}

/**
 * テスト用: ストアインスタンスをリセット
 */
export function resetProfileCache(): void {
  store = null;
}
