/**
 * agentAPI - エージェントAPIアクセスヘルパー
 * @module agentApi
 *
 * Electron IPC経由でエージェント機能にアクセスするためのヘルパー関数群。
 * 型安全なアクセスと共通のエラーハンドリングを提供。
 */

/**
 * agentAPIが利用可能かどうかを判定
 */
export const isAgentApiAvailable = (): boolean => {
  return typeof window !== "undefined" && window.agentAPI !== undefined;
};

/**
 * agentAPIを取得（利用不可の場合はnull）
 */
export const getAgentApi = (): typeof window.agentAPI | null => {
  if (isAgentApiAvailable()) {
    return window.agentAPI;
  }
  return null;
};

/**
 * 安全にagentAPI関数を実行
 * @param action 実行するアクション
 * @param errorMessage エラー時のメッセージ
 */
export const safeAgentApiCall = async <T>(
  action: (api: typeof window.agentAPI) => Promise<T>,
  errorMessage = "agentAPI operation failed",
): Promise<T | null> => {
  const api = getAgentApi();
  if (!api) {
    console.warn("agentAPI is not available");
    return null;
  }

  try {
    return await action(api);
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
};

/**
 * エージェント実行開始
 */
export const startAgentExecution = async (params: {
  skillId: string;
  prompt: string;
  executionId?: string;
}): Promise<{ executionId: string } | null> => {
  return safeAgentApiCall(
    (api) => api.start(params),
    "Failed to start agent execution",
  );
};

/**
 * エージェント実行停止
 */
export const stopAgentExecution = async (): Promise<void> => {
  await safeAgentApiCall((api) => api.stop(), "Failed to stop agent execution");
};

/**
 * 権限応答
 */
export const respondToAgentPermission = async (params: {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
}): Promise<void> => {
  await safeAgentApiCall(
    (api) => api.respondPermission(params),
    "Failed to respond to permission",
  );
};
