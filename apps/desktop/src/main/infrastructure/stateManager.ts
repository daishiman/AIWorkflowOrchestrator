/**
 * OAuth State Parameter Manager
 *
 * CSRF攻撃防止のためのstateパラメータを管理する。
 * RFC 6749 Section 10.12に準拠。
 *
 * @see DEBT-SEC-001
 */
import crypto from "node:crypto";

/** OAuthプロバイダー種別 */
type OAuthProvider = "google" | "github" | "discord";

/** State保存エントリ */
interface StateEntry {
  state: string;
  provider: OAuthProvider;
  createdAt: number;
  expiresAt: number;
}

/** State有効期限: 10分 */
const STATE_EXPIRY_MS = 10 * 60 * 1000;

class StateManager {
  /** state保存用Map（メモリのみ、ディスク永続化なし） */
  private states: Map<string, StateEntry> = new Map();

  /**
   * stateパラメータを生成し、プロバイダーと紐付けて保存する
   * @param provider - OAuthプロバイダー
   * @returns 生成されたstate文字列（64文字hex）
   */
  generate(provider: OAuthProvider): string {
    const state = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    this.states.set(state, {
      state,
      provider,
      createdAt: now,
      expiresAt: now + STATE_EXPIRY_MS,
    });
    return state;
  }

  /**
   * stateパラメータを検証する（ワンタイムユース: 検証成功時に削除）
   * @param state - 検証対象のstate文字列
   * @param provider - 期待するOAuthプロバイダー
   * @returns 検証成功ならtrue、失敗ならfalse
   */
  validate(state: string, provider: OAuthProvider): boolean {
    const entry = this.states.get(state);

    if (!entry) {
      return false;
    }

    // プロバイダー不一致
    if (entry.provider !== provider) {
      this.states.delete(state);
      return false;
    }

    // 有効期限切れ
    if (Date.now() > entry.expiresAt) {
      this.states.delete(state);
      return false;
    }

    // 検証成功: ワンタイムユースのため即座に削除
    this.states.delete(state);
    return true;
  }

  /**
   * stateパラメータを検証し消費する（プロバイダー指定不要版）
   * コールバック側でプロバイダーが不明な場合に使用する。
   * ワンタイムユース: 検証成功時に削除。
   * @param state - 検証対象のstate文字列
   * @returns 検証成功ならtrue、失敗ならfalse
   */
  consumeState(state: string): boolean {
    const entry = this.states.get(state);

    if (!entry) {
      return false;
    }

    // 有効期限切れ
    if (Date.now() > entry.expiresAt) {
      this.states.delete(state);
      return false;
    }

    // 検証成功: ワンタイムユースのため即座に削除
    this.states.delete(state);
    return true;
  }

  /**
   * 期限切れのstateエントリを削除する
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.states) {
      if (now > entry.expiresAt) {
        this.states.delete(key);
      }
    }
  }

  /**
   * テスト用: 全stateをクリアする
   */
  _reset(): void {
    this.states.clear();
  }
}

/** シングルトンインスタンス */
export const stateManager = new StateManager();

/** テスト用リセット関数 */
export function resetStateManager(): void {
  stateManager._reset();
}
