/**
 * プロフィール IPC ハンドラー
 *
 * Main Process でプロフィール関連のIPC通信を処理する
 */

import { ipcMain } from "electron";
import type { SupabaseClient } from "@supabase/supabase-js";
import { IPC_CHANNELS } from "../../preload/channels";
import { toLinkedProvider } from "@repo/shared/infrastructure/auth";
import {
  type UserProfile,
  type ProfileUpdateFields,
  type LinkedProvider,
  type IPCResponse,
  isValidProvider,
  validateDisplayName,
  validateAvatarUrl,
  PROFILE_ERROR_CODES,
} from "@repo/shared/types/auth";

// === 型定義 ===

/**
 * キャッシュ操作インターフェース
 */
export interface ProfileCache {
  getCachedProfile: () => Promise<UserProfile | null>;
  updateCachedProfile: (profile: UserProfile) => Promise<void>;
}

// === ヘルパー関数 ===

/**
 * Supabaseのプロフィールデータを UserProfile 型に変換
 */
function toUserProfile(data: {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  plan: string;
  created_at: string;
  updated_at: string;
}): UserProfile {
  return {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    avatarUrl: data.avatar_url,
    plan: data.plan as UserProfile["plan"],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * HTMLタグを除去してサニタイズ
 */
function sanitizeDisplayName(name: string): string {
  return name.replace(/<[^>]*>/g, "").trim();
}

// === ハンドラー登録 ===

/**
 * プロフィール関連IPCハンドラーを登録
 */
export function registerProfileHandlers(
  supabase: SupabaseClient,
  cache: ProfileCache,
): void {
  // profile:get - プロフィール取得
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_GET,
    async (): Promise<IPCResponse<UserProfile>> => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          // オフライン時はキャッシュを使用
          const cached = await cache.getCachedProfile();
          if (cached) {
            return { success: true, data: cached };
          }
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.GET_FAILED,
              message: "Not authenticated",
            },
          };
        }

        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          // DBエラー時もキャッシュを試す
          const cached = await cache.getCachedProfile();
          if (cached) {
            return { success: true, data: cached };
          }
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.GET_FAILED,
              message: error.message,
            },
          };
        }

        const profile = toUserProfile(data);

        // キャッシュ更新
        await cache.updateCachedProfile(profile);

        return { success: true, data: profile };
      } catch (error) {
        return {
          success: false,
          error: {
            code: PROFILE_ERROR_CODES.GET_FAILED,
            message:
              error instanceof Error ? error.message : "Failed to get profile",
          },
        };
      }
    },
  );

  // profile:update - プロフィール更新
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_UPDATE,
    async (
      _,
      { updates }: { updates: ProfileUpdateFields },
    ): Promise<IPCResponse<UserProfile>> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.UPDATE_FAILED,
              message: "Not authenticated",
            },
          };
        }

        // displayName バリデーション
        if (updates.displayName !== undefined) {
          const sanitized = sanitizeDisplayName(updates.displayName);
          const validation = validateDisplayName(sanitized);
          if (!validation.valid) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.VALIDATION_FAILED,
                message: validation.message,
              },
            };
          }
          updates.displayName = sanitized;
        }

        // avatarUrl バリデーション
        if (updates.avatarUrl !== undefined && updates.avatarUrl !== null) {
          const validation = validateAvatarUrl(updates.avatarUrl);
          if (!validation.valid) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.VALIDATION_FAILED,
                message: validation.message,
              },
            };
          }
        }

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (updates.displayName !== undefined) {
          updateData.display_name = updates.displayName;
        }
        if (updates.avatarUrl !== undefined) {
          updateData.avatar_url = updates.avatarUrl;
        }

        const { data, error } = await supabase
          .from("user_profiles")
          .update(updateData)
          .eq("id", user.id)
          .select()
          .single();

        if (error) {
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.UPDATE_FAILED,
              message: error.message,
            },
          };
        }

        const profile = toUserProfile(data);

        // キャッシュ更新
        await cache.updateCachedProfile(profile);

        return { success: true, data: profile };
      } catch (error) {
        return {
          success: false,
          error: {
            code: PROFILE_ERROR_CODES.UPDATE_FAILED,
            message:
              error instanceof Error
                ? error.message
                : "Failed to update profile",
          },
        };
      }
    },
  );

  // profile:get-providers - 連携プロバイダー一覧取得
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_GET_PROVIDERS,
    async (): Promise<IPCResponse<LinkedProvider[]>> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.PROVIDERS_FAILED,
              message: "Not authenticated",
            },
          };
        }

        const identities = user.identities ?? [];
        const providers: LinkedProvider[] = identities.map((identity) =>
          toLinkedProvider({
            id: identity.id,
            provider: identity.provider,
            identity_data: identity.identity_data as {
              email?: string;
              name?: string;
              avatar_url?: string;
            },
            created_at: identity.created_at ?? new Date().toISOString(),
          }),
        );

        return { success: true, data: providers };
      } catch (error) {
        return {
          success: false,
          error: {
            code: PROFILE_ERROR_CODES.PROVIDERS_FAILED,
            message:
              error instanceof Error
                ? error.message
                : "Failed to get providers",
          },
        };
      }
    },
  );

  // profile:link-provider - 新しいプロバイダー連携
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_LINK_PROVIDER,
    async (
      _,
      { provider }: { provider: string },
    ): Promise<IPCResponse<LinkedProvider>> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.LINK_FAILED,
              message: "Not authenticated",
            },
          };
        }

        // プロバイダーバリデーション
        if (!isValidProvider(provider)) {
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.LINK_FAILED,
              message: `Invalid provider: ${provider}. Must be one of: google, github, discord`,
            },
          };
        }

        // NOTE: Supabaseの linkIdentity は現在ブラウザでのみ動作
        // Electronでは追加実装が必要（将来対応）
        return {
          success: false,
          error: {
            code: PROFILE_ERROR_CODES.LINK_FAILED,
            message: "Provider linking is not yet implemented for desktop apps",
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: PROFILE_ERROR_CODES.LINK_FAILED,
            message:
              error instanceof Error
                ? error.message
                : "Failed to link provider",
          },
        };
      }
    },
  );
}
