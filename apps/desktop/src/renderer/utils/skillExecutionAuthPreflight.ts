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

/**
 * スキル実行前にAPIキー設定状態を確認する。
 * authKey API が提供されていない環境では後方互換のためチェックをスキップする。
 */
export async function preflightSkillExecutionAuth(): Promise<SkillExecutionAuthPreflightResult> {
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
