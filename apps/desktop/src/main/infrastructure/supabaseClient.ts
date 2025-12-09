/**
 * Supabase クライアント
 *
 * Main Process で使用する Supabase クライアントを作成
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 環境変数から設定を取得
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? "";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Supabase クライアントを取得（シングルトン）
 * 環境変数が未設定の場合は null を返す
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Auth features disabled.",
    );
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false, // メインプロセスではセッションを永続化しない（SecureStorageで管理）
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseInstance;
}

/**
 * テスト用: Supabase インスタンスをリセット
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

/**
 * カスタム設定でSupabaseクライアントを作成（テスト用）
 */
export function createSupabaseClient(
  url: string,
  anonKey: string,
): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}
