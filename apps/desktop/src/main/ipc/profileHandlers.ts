/**
 * プロフィール IPC ハンドラー
 *
 * Main Process でプロフィール関連のIPC通信を処理する
 */

import { ipcMain, BrowserWindow } from "electron";
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
import { withValidation } from "../infrastructure/security/ipc-validator.js";

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
 * user_profilesテーブル不在エラーかどうかを判定
 * エラーコード: PGRST200 (テーブル不在), PGRST116 (行が見つからない), 42P01 (PostgreSQLのテーブル不存在エラー)
 * または "schema cache", "does not exist", "user_profiles", "relation" を含むメッセージ
 */
function isUserProfilesTableError(error: {
  message: string;
  code?: string;
}): boolean {
  return (
    error.message.includes("schema cache") ||
    error.message.includes("does not exist") ||
    error.message.includes("user_profiles") ||
    error.message.includes("relation") ||
    error.code === "PGRST200" ||
    error.code === "PGRST116" ||
    error.code === "42P01"
  );
}

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
  mainWindow: BrowserWindow,
  supabase: SupabaseClient,
  cache: ProfileCache,
): void {
  // profile:get - プロフィール取得
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_GET,
    withValidation(
      IPC_CHANNELS.PROFILE_GET,
      async (_event): Promise<IPCResponse<UserProfile>> => {
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
            // user_profilesテーブルが存在しない場合はuser_metadataからフォールバック
            if (isUserProfilesTableError(error)) {
              console.warn(
                "[ProfileHandlers] user_profiles テーブルが見つかりません。user_metadataからプロフィールを構築します",
              );

              // user_metadataからプロフィールを構築
              const fallbackProfile: UserProfile = {
                id: user.id,
                displayName:
                  (user.user_metadata?.display_name as string) ??
                  (user.user_metadata?.name as string) ??
                  (user.user_metadata?.full_name as string) ??
                  "ユーザー",
                email: user.email ?? "",
                avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
                plan: "free",
                createdAt: user.created_at ?? new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              await cache.updateCachedProfile(fallbackProfile);
              return { success: true, data: fallbackProfile };
            }

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
                error instanceof Error
                  ? error.message
                  : "Failed to get profile",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // profile:update - プロフィール更新
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_UPDATE,
    withValidation(
      IPC_CHANNELS.PROFILE_UPDATE,
      async (
        _event,
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
            // user_profilesテーブルが存在しない場合はuser_metadataにフォールバック
            if (isUserProfilesTableError(error)) {
              console.warn(
                "[ProfileHandlers] user_profiles テーブルが見つかりません。user_metadataにフォールバックします",
              );

              // Supabase Auth の user_metadata を更新
              const metadataUpdate: Record<string, unknown> = {};
              if (updates.displayName !== undefined) {
                metadataUpdate.display_name = updates.displayName;
              }
              if (updates.avatarUrl !== undefined) {
                metadataUpdate.avatar_url = updates.avatarUrl;
              }

              const { data: authData, error: authError } =
                await supabase.auth.updateUser({
                  data: metadataUpdate,
                });

              if (authError) {
                return {
                  success: false,
                  error: {
                    code: PROFILE_ERROR_CODES.UPDATE_FAILED,
                    message: authError.message,
                  },
                };
              }

              // user_metadataからプロフィールを構築
              const fallbackProfile: UserProfile = {
                id: user.id,
                displayName:
                  (authData.user?.user_metadata?.display_name as string) ??
                  (authData.user?.user_metadata?.name as string) ??
                  "ユーザー",
                email: authData.user?.email ?? "",
                avatarUrl:
                  (authData.user?.user_metadata?.avatar_url as string) ?? null,
                plan: "free",
                createdAt:
                  authData.user?.created_at ?? new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              await cache.updateCachedProfile(fallbackProfile);
              return { success: true, data: fallbackProfile };
            }

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
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // profile:get-providers - 連携プロバイダー一覧取得
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_GET_PROVIDERS,
    withValidation(
      IPC_CHANNELS.PROFILE_GET_PROVIDERS,
      async (_event): Promise<IPCResponse<LinkedProvider[]>> => {
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
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // profile:link-provider - 新しいプロバイダー連携
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_LINK_PROVIDER,
    withValidation(
      IPC_CHANNELS.PROFILE_LINK_PROVIDER,
      async (
        _event,
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
              message:
                "Provider linking is not yet implemented for desktop apps",
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
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // profile:unlink-provider - プロバイダー連携解除
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_UNLINK_PROVIDER,
    withValidation(
      IPC_CHANNELS.PROFILE_UNLINK_PROVIDER,
      async (
        _event,
        { provider }: { provider: string },
      ): Promise<IPCResponse<void>> => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.UNLINK_FAILED,
                message: "Not authenticated",
              },
            };
          }

          // プロバイダーバリデーション
          if (!isValidProvider(provider)) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.UNLINK_FAILED,
                message: `Invalid provider: ${provider}. Must be one of: google, github, discord`,
              },
            };
          }

          const identities = user.identities ?? [];

          // 最後のプロバイダーは解除できない
          if (identities.length <= 1) {
            return {
              success: false,
              error: {
                code: "profile/unlink-last-provider",
                message: "Cannot unlink the last authentication provider",
              },
            };
          }

          // 対象プロバイダーが連携されているか確認
          const targetIdentity = identities.find(
            (i) => i.provider === provider,
          );
          if (!targetIdentity) {
            return {
              success: false,
              error: {
                code: "profile/provider-not-linked",
                message: `Provider ${provider} is not linked to this account`,
              },
            };
          }

          // Supabaseの unlinkIdentity を呼び出し
          const { error } = await supabase.auth.unlinkIdentity(targetIdentity);

          if (error) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.UNLINK_FAILED,
                message: error.message,
              },
            };
          }

          // 成功後に最新のユーザー情報を取得して通知
          const { data: updatedUserData } = await supabase.auth.getUser();
          const updatedUser = updatedUserData?.user ?? user;

          // 成功時は認証状態変更を通知（最新のidentities情報を含む）
          mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
            authenticated: true,
            user: updatedUser,
          });

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.UNLINK_FAILED,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to unlink provider",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );
}
