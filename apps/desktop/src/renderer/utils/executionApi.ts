/**
 * getExecutionAPI - Execution / Approval API アクセスユーティリティ
 *
 * UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001
 *
 * preload で公開された `window.electronAPI.execution` への型安全なアクセスを提供する。
 * renderer 側の hook (useApprovalFlow, useAdvancedConsole) で共通利用される。
 */

import type { ExecutionAPI } from "../../preload/types";

/**
 * window.electronAPI.execution を型安全に取得する。
 * Electron 外（ブラウザ等）で動作している場合は undefined を返す。
 */
export function getExecutionAPI(): ExecutionAPI | undefined {
  return (window as { electronAPI?: { execution?: ExecutionAPI } }).electronAPI
    ?.execution;
}
