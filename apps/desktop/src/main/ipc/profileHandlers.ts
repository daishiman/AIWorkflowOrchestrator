/**
 * プロフィール IPC ハンドラー
 *
 * Main Process でプロフィール関連のIPC通信を処理する
 */

import { ipcMain, BrowserWindow, dialog } from "electron";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs/promises";
import { IPC_CHANNELS } from "../../preload/channels";
import { toLinkedProvider } from "@repo/shared/infrastructure/auth";
import {
  type UserProfile,
  type ProfileUpdateFields,
  type LinkedProvider,
  type IPCResponse,
  type ExtendedUserProfile,
  type NotificationSettings,
  type ProfileExportData,
  type ProfileExportResponse,
  type ProfileImportResponse,
  type Timezone,
  type Locale,
  isValidProvider,
  validateDisplayName,
  validateAvatarUrl,
  PROFILE_ERROR_CODES,
  DEFAULT_NOTIFICATION_SETTINGS,
  IMPORT_LIMITS,
} from "@repo/shared/types/auth";
import {
  timezoneSchema,
  localeSchema,
  partialNotificationSettingsSchema,
  profileExportDataSchema,
} from "@repo/shared/schemas/auth";
import { withValidation } from "../infrastructure/security/ipc-validator.js";
import { syncProfileToMetadata } from "../infrastructure/profileSync.js";

// === 型定義 ===

/**
 * キャッシュ操作インターフェース
 */
export interface ProfileCache {
  getCachedProfile: () => Promise<UserProfile | null>;
  updateCachedProfile: (profile: UserProfile) => Promise<void>;
}

/**
 * 拡張プロフィールキャッシュ操作インターフェース
 */
export interface ExtendedProfileCache extends ProfileCache {
  getCachedExtendedProfile?: () => Promise<ExtendedUserProfile | null>;
  updateCachedExtendedProfile?: (profile: ExtendedUserProfile) => Promise<void>;
}

// === ヘルパー関数 ===

/**
 * user_profilesテーブルまたはカラム不在エラーかどうかを判定
 * エラーコード: PGRST200 (テーブル不在), PGRST116 (行が見つからない), 42P01 (PostgreSQLのテーブル不存在エラー)
 *              42703 (カラムが存在しない)
 * または "schema cache", "does not exist", "user_profiles", "relation", "column" を含むメッセージ
 */
function isUserProfilesTableError(error: {
  message: string;
  code?: string;
}): boolean {
  const errorPatterns = [
    "schema cache",
    "does not exist",
    "user_profiles",
    "relation",
    "column",
    "notification_settings",
  ];
  const errorCodes = ["PGRST200", "PGRST116", "42P01", "42703"];

  return (
    errorPatterns.some((pattern) =>
      error.message.toLowerCase().includes(pattern.toLowerCase()),
    ) || errorCodes.includes(error.code ?? "")
  );
}

/**
 * Supabaseのプロフィールデータの共通型
 */
interface SupabaseProfileData {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  plan: string;
  timezone?: string;
  locale?: string;
  notification_settings?: NotificationSettings;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Supabaseのプロフィールデータを UserProfile 型に変換
 */
function toUserProfile(data: SupabaseProfileData): UserProfile {
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
 * Supabaseのプロフィールデータを ExtendedUserProfile 型に変換
 */
function toExtendedUserProfile(data: SupabaseProfileData): ExtendedUserProfile {
  return {
    ...toUserProfile(data),
    timezone: data.timezone ?? "Asia/Tokyo",
    locale: (data.locale as Locale) ?? "ja",
    notificationSettings:
      data.notification_settings ?? DEFAULT_NOTIFICATION_SETTINGS,
    preferences: data.preferences ?? {},
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

          // user_metadata への同期（Primary → Secondary）
          // 失敗しても処理は続行（user_profiles が正）
          const syncResult = await syncProfileToMetadata(supabase, {
            display_name: updates.displayName,
            avatar_url: updates.avatarUrl,
          });
          if (!syncResult.success) {
            console.warn(
              "[ProfileHandlers] user_metadata同期失敗:",
              syncResult.error,
            );
          }

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

  // profile:delete - アカウント削除（ソフトデリート）
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_DELETE,
    withValidation(
      IPC_CHANNELS.PROFILE_DELETE,
      async (
        _event,
        { confirmEmail }: { confirmEmail: string },
      ): Promise<IPCResponse<void>> => {
        try {
          // 1. 認証確認
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.DELETE_FAILED,
                message: "Not authenticated",
              },
            };
          }

          // 2. メールアドレス一致確認
          if (user.email?.toLowerCase() !== confirmEmail.toLowerCase()) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.DELETE_EMAIL_MISMATCH,
                message: "Email address does not match",
              },
            };
          }

          // 3. user_profiles 論理削除（deleted_at を設定）
          // ※ 物理削除ではなく、deleted_at フラグで管理者が復元可能に
          console.log("[ProfileHandlers] 削除開始 user.id:", user.id);
          const { data: updateData, error: profileError } = await supabase
            .from("user_profiles")
            .update({
              deleted_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select();

          console.log("[ProfileHandlers] 削除結果:", {
            updateData,
            profileError,
          });

          if (profileError) {
            // user_profilesテーブルが存在しない場合は続行
            if (!isUserProfilesTableError(profileError)) {
              console.error("[ProfileHandlers] 削除エラー:", profileError);
              return {
                success: false,
                error: {
                  code: PROFILE_ERROR_CODES.DELETE_FAILED,
                  message: profileError.message,
                },
              };
            }
          }

          // 4. Storage は削除しない（復元時に必要）
          console.log("[ProfileHandlers] Storage保持（ソフトデリート）");

          // 5. ローカルキャッシュクリア
          try {
            // キャッシュをnullでクリア（clearProfile未実装の場合の代替）
            await cache.updateCachedProfile({
              id: user.id,
              displayName: "",
              email: "",
              avatarUrl: null,
              plan: "free",
              createdAt: "",
              updatedAt: "",
            });
          } catch (cacheError) {
            console.warn("[ProfileHandlers] キャッシュクリア警告:", cacheError);
          }

          // 6. サインアウト
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) {
            console.warn("[ProfileHandlers] signOut警告:", signOutError);
          }

          // 7. 認証状態変更を通知
          mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
            authenticated: false,
            user: null,
          });

          return { success: true };
        } catch (error) {
          console.error("[ProfileHandlers] 予期しないエラー:", error);
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.DELETE_FAILED,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to delete account",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // ========================================================================
  // 拡張プロフィールハンドラー
  // ========================================================================

  // profile:update-timezone - タイムゾーン更新
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_UPDATE_TIMEZONE,
    withValidation(
      IPC_CHANNELS.PROFILE_UPDATE_TIMEZONE,
      async (
        _event,
        { timezone }: { timezone: Timezone },
      ): Promise<IPCResponse<ExtendedUserProfile>> => {
        try {
          // バリデーション
          const validation = timezoneSchema.safeParse(timezone);
          if (!validation.success) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.VALIDATION_FAILED,
                message:
                  validation.error.issues[0]?.message ?? "無効なタイムゾーン",
              },
            };
          }

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

          const { data, error } = await supabase
            .from("user_profiles")
            .update({
              timezone: validation.data,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .single();

          if (error) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.UPDATE_FAILED,
                message: "プロフィールの更新に失敗しました",
              },
            };
          }

          const profile = toExtendedUserProfile(data);

          // キャッシュ更新
          await cache.updateCachedProfile(profile);

          return { success: true, data: profile };
        } catch (error) {
          console.error("[ProfileHandlers] タイムゾーン更新エラー:", error);
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.UPDATE_FAILED,
              message: "プロフィールの更新に失敗しました",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // profile:update-locale - ロケール更新
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_UPDATE_LOCALE,
    withValidation(
      IPC_CHANNELS.PROFILE_UPDATE_LOCALE,
      async (
        _event,
        { locale }: { locale: Locale },
      ): Promise<IPCResponse<ExtendedUserProfile>> => {
        try {
          // バリデーション
          const validation = localeSchema.safeParse(locale);
          if (!validation.success) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.VALIDATION_FAILED,
                message:
                  validation.error.issues[0]?.message ??
                  "サポートされていない言語です",
              },
            };
          }

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

          const { data, error } = await supabase
            .from("user_profiles")
            .update({
              locale: validation.data,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .single();

          if (error) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.UPDATE_FAILED,
                message: "プロフィールの更新に失敗しました",
              },
            };
          }

          const profile = toExtendedUserProfile(data);

          // キャッシュ更新
          await cache.updateCachedProfile(profile);

          return { success: true, data: profile };
        } catch (error) {
          console.error("[ProfileHandlers] ロケール更新エラー:", error);
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.UPDATE_FAILED,
              message: "プロフィールの更新に失敗しました",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // profile:update-notifications - 通知設定更新
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
    withValidation(
      IPC_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
      async (
        _event,
        {
          notificationSettings,
        }: { notificationSettings: Partial<NotificationSettings> },
      ): Promise<IPCResponse<ExtendedUserProfile>> => {
        try {
          // バリデーション
          const validation =
            partialNotificationSettingsSchema.safeParse(notificationSettings);
          if (!validation.success) {
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.VALIDATION_FAILED,
                message:
                  validation.error.issues[0]?.message ?? "無効な通知設定です",
              },
            };
          }

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

          // 現在の設定を取得してマージ
          const { data: currentData, error: getError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // user_profilesテーブルが存在しない or カラムがない場合はuser_metadataにフォールバック
          if (getError && isUserProfilesTableError(getError)) {
            console.warn(
              "[ProfileHandlers] user_profiles テーブルが見つかりません。user_metadataで通知設定を管理します",
            );

            // 現在のuser_metadata取得
            const currentMeta = (user.user_metadata ?? {}) as {
              notification_settings?: NotificationSettings;
            };
            const currentSettings =
              currentMeta.notification_settings ??
              DEFAULT_NOTIFICATION_SETTINGS;
            const mergedSettings = { ...currentSettings, ...validation.data };

            // user_metadata に保存
            const { data: authData, error: authError } =
              await supabase.auth.updateUser({
                data: { notification_settings: mergedSettings },
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
            const fallbackProfile: ExtendedUserProfile = {
              id: user.id,
              displayName:
                (authData.user?.user_metadata?.display_name as string) ??
                (authData.user?.user_metadata?.name as string) ??
                "ユーザー",
              email: authData.user?.email ?? "",
              avatarUrl:
                (authData.user?.user_metadata?.avatar_url as string) ?? null,
              plan: "free",
              createdAt: authData.user?.created_at ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              timezone: "Asia/Tokyo",
              locale: "ja",
              notificationSettings: mergedSettings,
              preferences: {},
            };

            await cache.updateCachedProfile(fallbackProfile);
            return { success: true, data: fallbackProfile };
          }

          if (getError) {
            console.error(
              "[ProfileHandlers] 通知設定取得エラー:",
              getError.message,
              getError.code,
            );
            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.UPDATE_FAILED,
                message: "プロフィールの取得に失敗しました",
              },
            };
          }

          // notification_settingsカラムが存在するか確認
          // user_profilesテーブルにカラムがない場合は直接user_metadataへ保存
          const hasNotificationSettingsColumn =
            currentData &&
            Object.prototype.hasOwnProperty.call(
              currentData,
              "notification_settings",
            );

          if (!hasNotificationSettingsColumn) {
            console.warn(
              "[ProfileHandlers] notification_settingsカラムがありません（マイグレーション003未適用）。user_metadataで管理します",
            );

            // user_metadataから現在の設定を取得してマージ
            const currentMeta = (user.user_metadata ?? {}) as {
              notification_settings?: NotificationSettings;
            };
            const currentSettings =
              currentMeta.notification_settings ??
              DEFAULT_NOTIFICATION_SETTINGS;
            const mergedSettings = { ...currentSettings, ...validation.data };

            // user_metadata に保存
            const { data: authData, error: authError } =
              await supabase.auth.updateUser({
                data: { notification_settings: mergedSettings },
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

            const fallbackProfile: ExtendedUserProfile = {
              id: user.id,
              displayName:
                (authData.user?.user_metadata?.display_name as string) ??
                (authData.user?.user_metadata?.name as string) ??
                currentData?.display_name ??
                "ユーザー",
              email: authData.user?.email ?? currentData?.email ?? "",
              avatarUrl:
                (authData.user?.user_metadata?.avatar_url as string) ??
                currentData?.avatar_url ??
                null,
              plan: currentData?.plan ?? "free",
              createdAt:
                currentData?.created_at ??
                authData.user?.created_at ??
                new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              timezone: currentData?.timezone ?? "Asia/Tokyo",
              locale: (currentData?.locale as Locale) ?? "ja",
              notificationSettings: mergedSettings,
              preferences: currentData?.preferences ?? {},
            };

            await cache.updateCachedProfile(fallbackProfile);
            return { success: true, data: fallbackProfile };
          }

          const currentSettings =
            (currentData?.notification_settings as NotificationSettings) ??
            DEFAULT_NOTIFICATION_SETTINGS;
          const mergedSettings = { ...currentSettings, ...validation.data };

          const { data, error } = await supabase
            .from("user_profiles")
            .update({
              notification_settings: mergedSettings,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .single();

          if (error) {
            console.error(
              "[ProfileHandlers] 通知設定更新エラー:",
              error.message,
              error.code,
            );
            // カラムが存在しない場合はuser_metadataにフォールバック
            if (isUserProfilesTableError(error)) {
              console.warn(
                "[ProfileHandlers] notification_settingsカラムがありません。user_metadataで管理します",
              );

              const { data: authData, error: authError } =
                await supabase.auth.updateUser({
                  data: { notification_settings: mergedSettings },
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

              const fallbackProfile: ExtendedUserProfile = {
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
                timezone: "Asia/Tokyo",
                locale: "ja",
                notificationSettings: mergedSettings,
                preferences: {},
              };

              await cache.updateCachedProfile(fallbackProfile);
              return { success: true, data: fallbackProfile };
            }

            return {
              success: false,
              error: {
                code: PROFILE_ERROR_CODES.UPDATE_FAILED,
                message: "プロフィールの更新に失敗しました",
              },
            };
          }

          const profile = toExtendedUserProfile(data);

          // キャッシュ更新
          await cache.updateCachedProfile(profile);

          return { success: true, data: profile };
        } catch (error) {
          console.error("[ProfileHandlers] 通知設定更新エラー:", error);
          return {
            success: false,
            error: {
              code: PROFILE_ERROR_CODES.UPDATE_FAILED,
              message: "プロフィールの更新に失敗しました",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // profile:export - プロフィールエクスポート
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_EXPORT,
    withValidation(
      IPC_CHANNELS.PROFILE_EXPORT,
      async (_event): Promise<ProfileExportResponse> => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              success: false,
              error: "Not authenticated",
            };
          }

          // プロフィール取得を試みる
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // user_profilesがない場合はuser_metadataからフォールバック
          let displayName: string;
          let timezone: string;
          let locale: string;
          let notificationSettings: NotificationSettings;
          let preferences: Record<string, unknown>;
          let plan: string;

          if (error && isUserProfilesTableError(error)) {
            // user_metadataから情報を取得
            const meta = user.user_metadata ?? {};
            displayName =
              (meta.display_name as string) ??
              (meta.name as string) ??
              (meta.full_name as string) ??
              "ユーザー";
            timezone = "Asia/Tokyo";
            locale = "ja";
            notificationSettings =
              (meta.notification_settings as NotificationSettings) ??
              DEFAULT_NOTIFICATION_SETTINGS;
            preferences = {};
            plan = "free";
          } else if (error || !data) {
            return {
              success: false,
              error: "プロフィールの取得に失敗しました",
            };
          } else {
            displayName = data.display_name;
            timezone = data.timezone ?? "Asia/Tokyo";
            locale = data.locale ?? "ja";
            notificationSettings =
              data.notification_settings ?? DEFAULT_NOTIFICATION_SETTINGS;
            preferences = data.preferences ?? {};
            plan = data.plan ?? "free";
          }

          // 連携プロバイダー情報を取得
          const identities = user.identities ?? [];
          const linkedProviders = identities.map((identity) => ({
            provider: identity.provider as "google" | "github" | "discord",
            linkedAt: identity.created_at ?? new Date().toISOString(),
          }));

          // エクスポートデータ作成（機密情報を除外、拡張情報を含む）
          const exportData: ProfileExportData = {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            displayName,
            timezone,
            locale: locale as Locale,
            notificationSettings,
            preferences,
            // 拡張情報
            linkedProviders,
            accountCreatedAt: user.created_at,
            plan,
          };

          // ファイル保存ダイアログ
          const result = await dialog.showSaveDialog(mainWindow, {
            title: "プロフィール設定をエクスポート",
            defaultPath: `profile-export-${new Date().toISOString().split("T")[0]}.json`,
            filters: [{ name: "JSON", extensions: ["json"] }],
          });

          if (result.canceled || !result.filePath) {
            return {
              success: false,
              error: "キャンセルされました",
            };
          }

          // ファイル書き込み
          await fs.writeFile(
            result.filePath,
            JSON.stringify(exportData, null, 2),
            "utf-8",
          );

          return {
            success: true,
            filePath: result.filePath,
          };
        } catch (error) {
          console.error("[ProfileHandlers] エクスポートエラー:", error);
          return {
            success: false,
            error: "エクスポートに失敗しました",
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // profile:import - プロフィールインポート
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_IMPORT,
    withValidation(
      IPC_CHANNELS.PROFILE_IMPORT,
      async (
        _event,
        { filePath }: { filePath: string },
      ): Promise<ProfileImportResponse> => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              success: false,
              error: "Not authenticated",
            };
          }

          // ファイルサイズチェック
          const stats = await fs.stat(filePath);
          if (stats.size > IMPORT_LIMITS.MAX_FILE_SIZE) {
            return {
              success: false,
              error: `ファイルサイズが大きすぎます（最大${IMPORT_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB）`,
            };
          }

          // ファイル読み込み
          const content = await fs.readFile(filePath, "utf-8");
          let jsonData: unknown;
          try {
            jsonData = JSON.parse(content);
          } catch {
            return {
              success: false,
              error: "無効なJSONファイルです",
            };
          }

          // バリデーション
          const validation = profileExportDataSchema.safeParse(jsonData);
          if (!validation.success) {
            return {
              success: false,
              error:
                validation.error.issues[0]?.message ??
                "無効なエクスポートデータです",
            };
          }

          const importData = validation.data;

          // バージョンチェック
          if (importData.version !== IMPORT_LIMITS.CURRENT_VERSION) {
            return {
              success: false,
              error: `非対応のバージョンです（${importData.version}）`,
            };
          }

          // プロフィール更新
          const { data, error } = await supabase
            .from("user_profiles")
            .update({
              display_name: importData.displayName,
              timezone: importData.timezone,
              locale: importData.locale,
              notification_settings: importData.notificationSettings,
              preferences: importData.preferences,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .single();

          if (error) {
            // user_profilesテーブルが存在しない場合はuser_metadataにフォールバック
            if (isUserProfilesTableError(error)) {
              console.warn(
                "[ProfileHandlers] user_profiles テーブルが見つかりません。user_metadataにインポートします",
              );

              const { data: authData, error: authError } =
                await supabase.auth.updateUser({
                  data: {
                    display_name: importData.displayName,
                    notification_settings: importData.notificationSettings,
                  },
                });

              if (authError) {
                return {
                  success: false,
                  error: authError.message,
                };
              }

              const fallbackProfile: ExtendedUserProfile = {
                id: user.id,
                displayName: importData.displayName,
                email: authData.user?.email ?? "",
                avatarUrl:
                  (authData.user?.user_metadata?.avatar_url as string) ?? null,
                plan: "free",
                createdAt:
                  authData.user?.created_at ?? new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                timezone: importData.timezone,
                locale: importData.locale,
                notificationSettings: importData.notificationSettings,
                preferences: importData.preferences,
              };

              await cache.updateCachedProfile(fallbackProfile);
              return {
                success: true,
                profile: fallbackProfile,
              };
            }

            return {
              success: false,
              error: "プロフィールの更新に失敗しました",
            };
          }

          const profile = toExtendedUserProfile(data);

          // キャッシュ更新
          await cache.updateCachedProfile(profile);

          return {
            success: true,
            profile,
          };
        } catch (error) {
          console.error("[ProfileHandlers] インポートエラー:", error);
          return {
            success: false,
            error: "インポートに失敗しました",
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );
}
