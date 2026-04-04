/**
 * ISlackService - Slack連携サービスインターフェース
 *
 * Slack Incoming Webhookを使用してメッセージを送信する。
 * Blocks Kit対応（リッチメッセージ送信可能）。
 */

export interface SlackTextMessage {
  type: "text";
  text: string;
  channel?: string;
}

export interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

export interface SlackBlocksMessage {
  type: "blocks";
  text: string; // フォールバック用テキスト（通知に表示される）
  blocks: SlackBlock[];
  channel?: string;
}

export type SlackMessage = SlackTextMessage | SlackBlocksMessage;

export interface SlackSendResult {
  success: boolean;
  error?: string;
}

export interface SlackTestResult {
  success: boolean;
  latencyMs?: number;
  error?: string;
}

export interface SlackConfig {
  webhookUrl: string;
  label?: string; // 識別用ラベル（例: "#general", "エラー通知"）
}

export interface ISlackService {
  /**
   * Slackにメッセージを送信する
   * @param message 送信するメッセージ
   * @param webhookUrl 使用するWebhook URL（省略時はデフォルト設定を使用）
   */
  send(message: SlackMessage, webhookUrl?: string): Promise<SlackSendResult>;

  /**
   * Webhook URLの接続テスト
   * @param webhookUrl テストするWebhook URL
   */
  test(webhookUrl: string): Promise<SlackTestResult>;
}
