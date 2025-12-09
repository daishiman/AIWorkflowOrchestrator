/**
 * セキュリティモジュール
 *
 * Electronアプリケーションのセキュリティ関連機能を提供するモジュール群。
 * - CSP (Content Security Policy) 生成
 * - IPC sender検証
 */

// CSPモジュール
export {
  generateCSP,
  getProductionDirectives,
  getDevelopmentDirectives,
  buildCSPString,
  type CSPOptions,
  type CSPDirective,
  type CSPDirectiveMap,
  type CSPResult,
} from "./csp.js";

// IPC検証モジュール
export {
  validateIpcSender,
  toIPCValidationError,
  withValidation,
  type IPCValidationResult,
  type IPCValidationOptions,
  type SecurityLogger,
  type SecurityLogEvent,
} from "./ipc-validator.js";
