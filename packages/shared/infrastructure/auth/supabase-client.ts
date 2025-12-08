/**
 * Supabase クライアント
 *
 * Electron デスクトップアプリ用のSupabaseクライアント設定
 * Main Process でのみ使用される
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthUser,
  OAuthProvider,
  SupabaseIdentity,
  SupabaseUserMetadata,
} from "../../types/auth";

// === 設定 ===

/**
 * Supabase設定インターフェース
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * カスタムプロトコルのリダイレクトURL
 */
export const AUTH_REDIRECT_URL = "aiworkflow://auth/callback";

// === クライアント生成 ===

/**
 * Supabaseクライアントを作成
 *
 * @param config Supabase設定
 * @returns SupabaseClient インスタンス
 */
export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Main Processでは手動で管理
      detectSessionInUrl: false, // Electronではカスタムプロトコルを使用
    },
  });
}

/**
 * 環境変数から設定を読み込む
 *
 * @returns SupabaseConfig
 * @throws 環境変数が未設定の場合エラー
 */
export function loadSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL environment variable is not set");
  }
  if (!anonKey) {
    throw new Error("SUPABASE_ANON_KEY environment variable is not set");
  }

  return { url, anonKey };
}

// === ユーティリティ関数 ===

/**
 * SupabaseユーザーをAuthUserに変換
 */
export function toAuthUser(
  supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: SupabaseUserMetadata;
    app_metadata?: { provider?: string };
    created_at: string;
    last_sign_in_at?: string;
  } | null,
): AuthUser | null {
  if (!supabaseUser) {
    return null;
  }

  const metadata = supabaseUser.user_metadata ?? {};

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    displayName: metadata.name ?? metadata.full_name ?? null,
    avatarUrl: metadata.avatar_url ?? null,
    provider:
      (supabaseUser.app_metadata?.provider as OAuthProvider) ?? "google",
    createdAt: supabaseUser.created_at,
    lastSignInAt: supabaseUser.last_sign_in_at ?? supabaseUser.created_at,
  };
}

/**
 * Supabase Identityから LinkedProvider に変換
 */
export function toLinkedProvider(identity: SupabaseIdentity): {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
} {
  return {
    provider: identity.provider as OAuthProvider,
    providerId: identity.id,
    email: identity.identity_data?.email ?? "",
    displayName: identity.identity_data?.name ?? null,
    avatarUrl: identity.identity_data?.avatar_url ?? null,
    linkedAt: identity.created_at,
  };
}

/**
 * OAuthコールバックURLからトークンを抽出
 *
 * @param callbackUrl aiworkflow://auth/callback#access_token=...&refresh_token=...
 * @returns アクセストークンとリフレッシュトークン
 */
export function parseAuthCallback(callbackUrl: string): {
  accessToken: string;
  refreshToken: string;
} {
  // URLフラグメント（#以降）を解析
  const hashIndex = callbackUrl.indexOf("#");
  if (hashIndex === -1) {
    throw new Error("Invalid callback URL: missing hash fragment");
  }

  const fragment = callbackUrl.substring(hashIndex + 1);
  const params = new URLSearchParams(fragment);

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken) {
    throw new Error("Invalid callback URL: missing access_token");
  }
  if (!refreshToken) {
    throw new Error("Invalid callback URL: missing refresh_token");
  }

  return { accessToken, refreshToken };
}

/**
 * OAuth URL を生成
 *
 * @param supabase Supabaseクライアント
 * @param provider OAuthプロバイダー
 * @returns OAuth認証URL
 */
export async function getOAuthUrl(
  supabase: SupabaseClient,
  provider: OAuthProvider,
): Promise<string> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: AUTH_REDIRECT_URL,
      skipBrowserRedirect: true, // URLのみ取得、ブラウザは開かない
    },
  });

  if (error) {
    throw new Error(`OAuth URL generation failed: ${error.message}`);
  }

  if (!data.url) {
    throw new Error("OAuth URL generation failed: no URL returned");
  }

  return data.url;
}

// === エクスポート ===

export type { SupabaseClient };
