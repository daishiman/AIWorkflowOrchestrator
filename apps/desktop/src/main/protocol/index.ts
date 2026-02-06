/**
 * Protocol モジュール
 *
 * カスタムプロトコル関連の機能をエクスポート
 */

export {
  CUSTOM_PROTOCOL,
  AUTH_CALLBACK_PATH,
  AUTH_DONE_PATH,
  setupCustomProtocol,
  registerAsDefaultProtocolClient,
  isAuthCallbackUrl,
  isAuthDoneUrl,
  isAllowedProtocolUrl,
  setupMacOSProtocolHandler,
  setupWindowsLinuxProtocolHandler,
  processLaunchUrl,
} from "./customProtocol";

export type {
  AuthCallbackHandler,
  ProtocolSetupOptions,
} from "./customProtocol";
