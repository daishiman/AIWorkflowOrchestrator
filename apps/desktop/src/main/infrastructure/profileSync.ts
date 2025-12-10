/**
 * プロフィール同期ユーティリティ
 *
 * user_profiles テーブル（PostgreSQL）と user_metadata（Supabase Auth）の
 * 双方向同期を管理する。
 *
 * 設計書: docs/30-workflows/profile-persistence-bugfix/design/sync-design.md
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================
// 型定義
// ============================================

/**
 * 同期操作の結果
 */
export interface SyncResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * user_profiles → user_metadata への同期フィールド
 */
export interface ProfileToMetadataFields {
  display_name?: string;
  avatar_url?: string | null;
}

/**
 * user_metadata → user_profiles への同期フィールド
 */
export interface MetadataToProfileFields {
  avatar_url?: string | null;
}

/**
 * 同期エラーコード
 */
export const SYNC_ERROR_CODES = {
  AUTH_UPDATE_FAILED: "sync/auth-update-failed",
  DB_UPDATE_FAILED: "sync/db-update-failed",
  CONSISTENCY_CHECK_FAILED: "sync/consistency-check-failed",
} as const;

// ============================================
// ヘルパー関数
// ============================================

/**
 * user_profilesテーブル不在エラーかどうかを判定
 */
function isUserProfilesTableError(error: {
  message?: string;
  code?: string;
}): boolean {
  return (
    error.message?.includes("schema cache") ||
    error.message?.includes("does not exist") ||
    error.message?.includes("user_profiles") ||
    error.message?.includes("relation") ||
    error.code === "PGRST200" ||
    error.code === "PGRST116" ||
    error.code === "42P01"
  );
}

// ============================================
// 同期関数
// ============================================

/**
 * user_profiles → user_metadata への同期
 *
 * profile:update 時に呼び出し、DBの変更をAuthのメタデータに反映する。
 *
 * @param supabase - Supabaseクライアント
 * @param updates - 同期するフィールド
 * @returns 同期結果
 *
 * @example
 * await syncProfileToMetadata(supabase, { display_name: "新しい名前" });
 */
export async function syncProfileToMetadata(
  supabase: SupabaseClient,
  updates: ProfileToMetadataFields,
): Promise<SyncResult> {
  try {
    // 更新対象がなければ成功扱い
    const hasDisplayName = updates.display_name !== undefined;
    const hasAvatarUrl = updates.avatar_url !== undefined;

    if (!hasDisplayName && !hasAvatarUrl) {
      return { success: true };
    }

    // 更新データを構築
    const metadataUpdate: Record<string, unknown> = {};
    if (hasDisplayName) {
      metadataUpdate.display_name = updates.display_name;
    }
    if (hasAvatarUrl) {
      metadataUpdate.avatar_url = updates.avatar_url;
    }

    // Supabase Auth の user_metadata を更新
    const { error } = await supabase.auth.updateUser({
      data: metadataUpdate,
    });

    if (error) {
      return {
        success: false,
        error: {
          code: SYNC_ERROR_CODES.AUTH_UPDATE_FAILED,
          message: error.message,
        },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: SYNC_ERROR_CODES.AUTH_UPDATE_FAILED,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * user_metadata → user_profiles への同期
 *
 * avatar:* 操作時に呼び出し、Authのアバター情報をDBに反映する。
 *
 * @param supabase - Supabaseクライアント
 * @param userId - 対象ユーザーID
 * @param updates - 同期するフィールド
 * @returns 同期結果
 *
 * @example
 * await syncMetadataToProfile(supabase, userId, { avatar_url: publicUrl });
 */
export async function syncMetadataToProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: MetadataToProfileFields,
): Promise<SyncResult> {
  try {
    // 更新対象がなければ成功扱い
    if (updates.avatar_url === undefined) {
      return { success: true };
    }

    // user_profiles テーブルを更新
    const { error } = await supabase
      .from("user_profiles")
      .update({
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      // テーブル不在エラーは警告ログのみで成功扱い
      if (isUserProfilesTableError(error)) {
        console.warn(
          "[ProfileSync] user_profiles テーブルが見つかりません。同期をスキップします",
        );
        return { success: true };
      }

      return {
        success: false,
        error: {
          code: SYNC_ERROR_CODES.DB_UPDATE_FAILED,
          message: error.message,
        },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: SYNC_ERROR_CODES.DB_UPDATE_FAILED,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * プロフィール整合性の確認・修復
 *
 * user_profiles をPrimary Source of Truthとして、
 * user_metadata との不整合を検出し、修復する。
 *
 * @param supabase - Supabaseクライアント
 * @param userId - 対象ユーザーID
 * @returns 同期結果
 *
 * @example
 * await ensureProfileConsistency(supabase, userId);
 */
export async function ensureProfileConsistency(
  supabase: SupabaseClient,
  userId: string,
): Promise<SyncResult> {
  try {
    // 1. 両方のソースからデータ取得
    const [profileResult, authResult] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", userId).single(),
      supabase.auth.getUser(),
    ]);

    const profile = profileResult.data;
    const profileError = profileResult.error;
    const metadata = authResult.data.user?.user_metadata;

    // 2. user_profiles がなければ何もしない（フォールバック処理は呼び出し側）
    if (!profile) {
      // テーブル不在またはレコードなしは成功扱い
      if (profileError && !isUserProfilesTableError(profileError)) {
        return {
          success: false,
          error: {
            code: SYNC_ERROR_CODES.CONSISTENCY_CHECK_FAILED,
            message: profileError.message,
          },
        };
      }
      return { success: true };
    }

    // 3. 不整合チェック
    const needsSync: ProfileToMetadataFields = {};

    if (profile.display_name !== metadata?.display_name) {
      needsSync.display_name = profile.display_name;
    }
    if (profile.avatar_url !== metadata?.avatar_url) {
      needsSync.avatar_url = profile.avatar_url;
    }

    // 4. 不整合があれば user_profiles を正として user_metadata を修復
    if (Object.keys(needsSync).length > 0) {
      console.log(
        "[ProfileSync] 不整合を検出しました。user_metadata を修復します:",
        needsSync,
      );
      return syncProfileToMetadata(supabase, needsSync);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: SYNC_ERROR_CODES.CONSISTENCY_CHECK_FAILED,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
