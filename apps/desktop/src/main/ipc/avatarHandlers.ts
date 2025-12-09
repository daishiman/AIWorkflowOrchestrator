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
                message: "Not authenticated",
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
                message: "File selection cancelled",
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
                message: "Invalid file type. Allowed: jpg, png, gif, webp",
              },
            };
          }

          // ファイルサイズチェック
          if (!(await isFileSizeValid(filePath))) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.FILE_TOO_LARGE,
                message: "File too large. Maximum size: 5MB",
              },
            };
          }

          // ファイル読み込み
          const fileBuffer = await fs.readFile(filePath);
          const fileName = `${user.id}-${Date.now()}${path.extname(filePath)}`;

          // Supabase Storageにアップロード
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("avatars")
              .upload(fileName, fileBuffer, {
                contentType: `image/${path.extname(filePath).slice(1)}`,
                upsert: true,
              });

          if (uploadError) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.UPLOAD_FAILED,
                message: uploadError.message,
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
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.UPLOAD_FAILED,
                message: updateError.message,
              },
            };
          }

          return {
            success: true,
            data: { avatarUrl },
          };
        } catch (error) {
          return {
            success: false,
            error: {
              code: AVATAR_ERROR_CODES.UPLOAD_FAILED,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to upload avatar",
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
                message: "Not authenticated",
              },
            };
          }

          // プロバイダーバリデーション
          if (!isValidProvider(provider)) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.USE_PROVIDER_FAILED,
                message: `Invalid provider: ${provider}`,
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
                message: `Provider ${provider} is not linked to this account`,
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
                message: `Provider ${provider} does not have an avatar`,
              },
            };
          }

          // ユーザーメタデータを更新
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              avatar_url: avatarUrl,
              avatar_source: provider,
            },
          });

          if (updateError) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.USE_PROVIDER_FAILED,
                message: updateError.message,
              },
            };
          }

          return {
            success: true,
            data: { avatarUrl },
          };
        } catch (error) {
          return {
            success: false,
            error: {
              code: AVATAR_ERROR_CODES.USE_PROVIDER_FAILED,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to use provider avatar",
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
                message: "Not authenticated",
              },
            };
          }

          const userMetadata = user.user_metadata as {
            avatar_url?: string;
            avatar_source?: string;
          };

          // アップロードされたアバターの場合はStorageからも削除
          if (
            userMetadata?.avatar_source === "uploaded" &&
            userMetadata?.avatar_url
          ) {
            try {
              // URLからファイル名を抽出
              const url = new URL(userMetadata.avatar_url);
              const pathParts = url.pathname.split("/");
              const fileName = pathParts[pathParts.length - 1];

              if (fileName) {
                await supabase.storage.from("avatars").remove([fileName]);
              }
            } catch {
              // ストレージ削除の失敗は無視（メタデータの更新は続行）
              console.warn(
                "[AvatarHandlers] Failed to delete avatar from storage",
              );
            }
          }

          // ユーザーメタデータからアバターを削除
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              avatar_url: null,
              avatar_source: null,
            },
          });

          if (updateError) {
            return {
              success: false,
              error: {
                code: AVATAR_ERROR_CODES.REMOVE_FAILED,
                message: updateError.message,
              },
            };
          }

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: {
              code: AVATAR_ERROR_CODES.REMOVE_FAILED,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to remove avatar",
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );
}
