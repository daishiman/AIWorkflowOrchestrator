import type { SkillExecutionError } from "@repo/shared/types/skill";

const AUTH_GUIDANCE_SUFFIX = "設定画面でAPIキーを登録してください。";
const AUTH_MISSING_MESSAGE = `APIキーが設定されていません。${AUTH_GUIDANCE_SUFFIX}`;
const AUTH_CHECK_FAILED_MESSAGE = `APIキー設定状態の確認に失敗しました。${AUTH_GUIDANCE_SUFFIX}`;

export interface SkillExecutionAuthPreflightResult {
  ok: boolean;
  error?: SkillExecutionError;
}

function getAuthKeyExists(): (() => Promise<{ exists: boolean }>) | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const exists = window.electronAPI?.authKey?.exists;
  return typeof exists === "function" ? exists : undefined;
}

function getAuthModeGet():
  | (() => Promise<{ success?: boolean; data?: { mode?: string } }>)
  | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const getMode = window.electronAPI?.authMode?.get;
  return typeof getMode === "function" ? getMode : undefined;
}

/**
 * スキル実行前にAPIキー設定状態を確認する。
 * authKey API が提供されていない環境では後方互換のためチェックをスキップする。
 */
export async function preflightSkillExecutionAuth(): Promise<SkillExecutionAuthPreflightResult> {
  const authModeGet = getAuthModeGet();
  if (authModeGet) {
    try {
      const modeResult = await authModeGet();
      const mode = modeResult?.data?.mode;
      if (mode === "subscription") {
        return { ok: true };
      }
    } catch {
      // authMode 取得失敗時は既存フォールバック（authKey.exists）を継続
    }
  }

  const exists = getAuthKeyExists();
  if (!exists) {
    return { ok: true };
  }

  try {
    const result = await exists();
    if (result.exists) {
      return { ok: true };
    }
    return {
      ok: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: AUTH_MISSING_MESSAGE,
      },
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: AUTH_CHECK_FAILED_MESSAGE,
      },
    };
  }
}
