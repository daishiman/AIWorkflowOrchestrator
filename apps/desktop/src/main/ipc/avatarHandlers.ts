/**
 * アバター IPC ハンドラー
 *
 * Main Process でアバター関連のIPC通信を処理する
 */

import { ipcMain, dialog, BrowserWindow } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  type IPCResponse,
  isValidProvider,
  AVATAR_ERROR_CODES,
} from "@repo/shared/types/auth";
import { withValidation } from "../infrastructure/security/ipc-validator.js";
import { syncMetadataToProfile } from "../infrastructure/profileSync.js";

// === 定数 ===

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

// === 型定義 ===

interface AvatarUploadResult {
  avatarUrl: string;
}

interface AvatarUseProviderResult {
  avatarUrl: string;
}

// === ヘルパー関数 ===

/**
 * ファイル拡張子が許可されているか確認
 */
function isAllowedExtension(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * ファイルサイズが制限内か確認
 */
async function isFileSizeValid(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size <= MAX_AVATAR_SIZE;
  } catch {
    return false;
  }
}

/**
 * アップロード済みの古いアバターをStorageから削除
 * @param supabase Supabaseクライアント
 * @param userMetadata ユーザーメタデータ
 */
async function deleteOldUploadedAvatar(
  supabase: SupabaseClient,
  userMetadata: { avatar_url?: string; avatar_source?: string } | undefined,
): Promise<void> {
  if (userMetadata?.avatar_source !== "uploaded" || !userMetadata?.avatar_url) {
    return;
  }

  try {
    const url = new URL(userMetadata.avatar_url);
    const pathParts = url.pathname.split("/");
    // avatars/{user_id}/filename の形式から {user_id}/filename を取得
    const bucketIndex = pathParts.indexOf("avatars");
    if (bucketIndex !== -1 && bucketIndex + 2 < pathParts.length) {
      const storagePath = pathParts.slice(bucketIndex + 1).join("/");
      await supabase.storage.from("avatars").remove([storagePath]);
      console.log("[AvatarHandlers] 古いアバターを削除しました:", storagePath);
    }
  } catch (error) {
    // 削除失敗は無視（メイン処理を続行）
    console.warn("[AvatarHandlers] 古いアバターの削除に失敗しました:", error);
  }
}

// === ハンドラー登録 ===

/**
 * アバター関連IPCハンドラーを登録
 */
export function registerAvatarHandlers(
  mainWindow: BrowserWindow,
  supabase: SupabaseClient,
): void {
  // avatar:upload - アバター画像アップロード
  ipcMain.handle(
    IPC_CHANNELS.AVATAR_UPLOAD,
    withValidation(
      IPC_CHANNELS.AVATAR_UPLOAD,
      async (_event): Promise<IPCResponse<AvatarUploadResult>> => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.UPLOAD_FAILED,
                message: "認証されていません",
              },
            };
          }

          // ファイル選択ダイアログを開く
          const result = await dialog.showOpenDialog(mainWindow, {
            title: "アバター画像を選択",
            filters: [
              {
                name: "Images",
                extensions: ["jpg", "jpeg", "png", "gif", "webp"],
              },
            ],
            properties: ["openFile"],
          });

          if (result.canceled || result.filePaths.length === 0) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.UPLOAD_CANCELLED,
                message: "ファイル選択がキャンセルされました",
              },
            };
          }

          const filePath = result.filePaths[0];

          // 拡張子チェック
          if (!isAllowedExtension(filePath)) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.INVALID_FILE_TYPE,
                message:
                  "対応していないファイル形式です。jpg, png, gif, webp のみ対応しています",
              },
            };
          }

          // ファイルサイズチェック
          if (!(await isFileSizeValid(filePath))) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.FILE_TOO_LARGE,
                message: "ファイルサイズが大きすぎます。最大5MBまでです",
              },
            };
          }

          // 古いアップロード済みアバターを削除（容量節約）
          const userMetadata = user.user_metadata as {
            avatar_url?: string;
            avatar_source?: string;
          };
          await deleteOldUploadedAvatar(supabase, userMetadata);

          // ファイル読み込み
          const fileBuffer = await fs.readFile(filePath);
          // フォルダ構造: {user_id}/avatar-{timestamp}.{ext}
          // RLSポリシーが user_id フォルダを期待するため
          const storagePath = `${user.id}/avatar-${Date.now()}${path.extname(filePath)}`;

          // Supabase Storageにアップロード
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("avatars")
              .upload(storagePath, fileBuffer, {
                contentType: `image/${path.extname(filePath).slice(1)}`,
                upsert: true,
              });

          if (uploadError) {
            console.error("[AvatarHandlers] アップロードエラー:", uploadError);
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.UPLOAD_FAILED,
                message: "アバターのアップロードに失敗しました",
              },
            };
          }

          // 公開URLを取得
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(uploadData.path);

          const avatarUrl = urlData.publicUrl;

          // ユーザーメタデータを更新
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              avatar_url: avatarUrl,
              avatar_source: "uploaded",
            },
          });

          if (updateError) {
            console.error(
              "[AvatarHandlers] メタデータ更新エラー:",
              updateError,
            );
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.UPLOAD_FAILED,
                message: "プロフィールの更新に失敗しました",
              },
            };
          }

          // user_profiles への同期（Secondary → Primary）
          // 失敗しても処理は続行
          const syncResult = await syncMetadataToProfile(supabase, user.id, {
            avatar_url: avatarUrl,
          });
          if (!syncResult.success) {
            console.warn(
              "[AvatarHandlers] user_profiles同期失敗:",
              syncResult.error,
            );
          }

          return {
            success: true,
            data: { avatarUrl },
          };
        } catch (error) {
          console.error("[AvatarHandlers] 予期しないエラー:", error);
          return {
            success: false,
            error: {
              code: AVATAR_ERROR_CODES.UPLOAD_FAILED,
              message: "アバターのアップロード中にエラーが発生しました",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // avatar:use-provider - プロバイダーのアバターを使用
  ipcMain.handle(
    IPC_CHANNELS.AVATAR_USE_PROVIDER,
    withValidation(
      IPC_CHANNELS.AVATAR_USE_PROVIDER,
      async (
        _event,
        { provider }: { provider: string },
      ): Promise<IPCResponse<AvatarUseProviderResult>> => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.USE_PROVIDER_FAILED,
                message: "認証されていません",
              },
            };
          }

          // プロバイダーバリデーション
          if (!isValidProvider(provider)) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.USE_PROVIDER_FAILED,
                message: `無効なプロバイダーです: ${provider}`,
              },
            };
          }

          const identities = user.identities ?? [];
          const targetIdentity = identities.find(
            (i) => i.provider === provider,
          );

          if (!targetIdentity) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.PROVIDER_NOT_LINKED,
                message: `${provider}はこのアカウントに連携されていません`,
              },
            };
          }

          const identityData = targetIdentity.identity_data as {
            avatar_url?: string;
          };
          const avatarUrl = identityData?.avatar_url;

          if (!avatarUrl) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.NO_PROVIDER_AVATAR,
                message: `${provider}にはアバター画像がありません`,
              },
            };
          }

          // 古いアップロード済みアバターを削除（容量節約）
          const userMetadata = user.user_metadata as {
            avatar_url?: string;
            avatar_source?: string;
          };
          await deleteOldUploadedAvatar(supabase, userMetadata);

          // ユーザーメタデータを更新
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              avatar_url: avatarUrl,
              avatar_source: provider,
            },
          });

          if (updateError) {
            console.error(
              "[AvatarHandlers] プロバイダーアバター設定エラー:",
              updateError,
            );
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.USE_PROVIDER_FAILED,
                message: "プロバイダーアバターの設定に失敗しました",
              },
            };
          }

          // user_profiles への同期（Secondary → Primary）
          // 失敗しても処理は続行
          const syncResult = await syncMetadataToProfile(supabase, user.id, {
            avatar_url: avatarUrl,
          });
          if (!syncResult.success) {
            console.warn(
              "[AvatarHandlers] user_profiles同期失敗:",
              syncResult.error,
            );
          }

          return {
            success: true,
            data: { avatarUrl },
          };
        } catch (error) {
          console.error("[AvatarHandlers] 予期しないエラー:", error);
          return {
            success: false,
            error: {
              code: AVATAR_ERROR_CODES.USE_PROVIDER_FAILED,
              message: "プロバイダーアバターの設定中にエラーが発生しました",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // avatar:remove - アバター削除
  ipcMain.handle(
    IPC_CHANNELS.AVATAR_REMOVE,
    withValidation(
      IPC_CHANNELS.AVATAR_REMOVE,
      async (_event): Promise<IPCResponse<void>> => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.REMOVE_FAILED,
                message: "認証されていません",
              },
            };
          }

          const userMetadata = user.user_metadata as {
            avatar_url?: string;
            avatar_source?: string;
          };

          // アップロードされたアバターの場合はStorageからも削除
          await deleteOldUploadedAvatar(supabase, userMetadata);

          // ユーザーメタデータからアバターを削除
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              avatar_url: null,
              avatar_source: null,
            },
          });

          if (updateError) {
            console.error("[AvatarHandlers] アバター削除エラー:", updateError);
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.REMOVE_FAILED,
                message: "アバターの削除に失敗しました",
              },
            };
          }

          // user_profiles への同期（Secondary → Primary）
          // ★ これがアバター削除が効かない問題の根本修正 ★
          // user_profiles.avatar_url も null に更新する
          const syncResult = await syncMetadataToProfile(supabase, user.id, {
            avatar_url: null,
          });
          if (!syncResult.success) {
            console.warn(
              "[AvatarHandlers] user_profiles同期失敗:",
              syncResult.error,
            );
          }

          return { success: true };
        } catch (error) {
          console.error("[AvatarHandlers] 予期しないエラー:", error);
          return {
            success: false,
            error: {
              code: AVATAR_ERROR_CODES.REMOVE_FAILED,
              message: "アバターの削除中にエラーが発生しました",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );
}
