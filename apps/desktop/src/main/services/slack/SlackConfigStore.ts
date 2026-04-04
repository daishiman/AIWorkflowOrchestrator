/**
 * SlackConfigStore - Slack設定の永続化ストア
 *
 * electron-store を使用してWebhook URLを安全に保存する。
 * 複数のWebhook設定（チャンネル別）を管理可能。
 */

import Store from "electron-store";
import type { SlackConfig } from "./ISlackService";

interface SlackStoreSchema {
  configs: SlackConfig[];
  defaultConfigIndex: number;
}

const STORE_NAME = "slack-config";

export class SlackConfigStore {
  private store: Store<SlackStoreSchema>;

  constructor() {
    this.store = new Store<SlackStoreSchema>({
      name: STORE_NAME,
      defaults: {
        configs: [],
        defaultConfigIndex: 0,
      },
    });
  }

  /**
   * 全Slack設定を取得する
   */
  getAll(): SlackConfig[] {
    return this.store.get("configs", []);
  }

  /**
   * デフォルトのSlack設定を取得する
   */
  getDefault(): SlackConfig | null {
    const configs = this.getAll();
    if (configs.length === 0) return null;

    const defaultIndex = this.store.get("defaultConfigIndex", 0);
    const safeIndex = Math.min(defaultIndex, configs.length - 1);
    return configs[safeIndex] ?? null;
  }

  /**
   * Slack設定を追加する
   * @returns 追加後のインデックス
   */
  add(config: SlackConfig): number {
    const configs = this.getAll();
    configs.push(config);
    this.store.set("configs", configs);
    return configs.length - 1;
  }

  /**
   * Slack設定を更新する
   */
  update(index: number, config: SlackConfig): boolean {
    const configs = this.getAll();
    if (index < 0 || index >= configs.length) return false;

    configs[index] = config;
    this.store.set("configs", configs);
    return true;
  }

  /**
   * Slack設定を削除する
   */
  remove(index: number): boolean {
    const configs = this.getAll();
    if (index < 0 || index >= configs.length) return false;

    configs.splice(index, 1);
    this.store.set("configs", configs);

    // デフォルトインデックスを補正
    const defaultIndex = this.store.get("defaultConfigIndex", 0);
    if (defaultIndex >= configs.length && configs.length > 0) {
      this.store.set("defaultConfigIndex", configs.length - 1);
    } else if (configs.length === 0) {
      this.store.set("defaultConfigIndex", 0);
    }

    return true;
  }

  /**
   * デフォルトのSlack設定を変更する
   */
  setDefault(index: number): boolean {
    const configs = this.getAll();
    if (index < 0 || index >= configs.length) return false;

    this.store.set("defaultConfigIndex", index);
    return true;
  }

  /**
   * 全設定をクリアする
   */
  clear(): void {
    this.store.set("configs", []);
    this.store.set("defaultConfigIndex", 0);
  }
}
