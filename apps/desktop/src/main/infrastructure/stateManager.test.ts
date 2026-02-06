import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { stateManager, resetStateManager } from "./stateManager";

describe("StateManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStateManager();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("generate", () => {
    it("ST-01: 連続生成で異なるstateが生成される", () => {
      const state1 = stateManager.generate("google");
      const state2 = stateManager.generate("google");

      expect(state1).not.toBe(state2);
      expect(state1).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(state2).toHaveLength(64);
    });
  });

  describe("validate", () => {
    it("ST-02: 生成したstateの検証が成功する", () => {
      const state = stateManager.generate("google");

      const result = stateManager.validate(state, "google");

      expect(result).toBe(true);
    });

    it("ST-03: 存在しないstateの検証が失敗する", () => {
      const result = stateManager.validate("nonexistent_state", "google");

      expect(result).toBe(false);
    });

    it("ST-04: 異なるプロバイダーでの検証が失敗する", () => {
      const state = stateManager.generate("google");

      const result = stateManager.validate(state, "github");

      expect(result).toBe(false);
    });

    it("ST-05: 10分経過後のstateが期限切れで拒否される", () => {
      const state = stateManager.generate("google");

      // 10分 + 1ms 経過
      vi.advanceTimersByTime(10 * 60 * 1000 + 1);

      const result = stateManager.validate(state, "google");

      expect(result).toBe(false);
    });

    it("ST-06: 同じstateの2回目の検証が失敗する（ワンタイムユース）", () => {
      const state = stateManager.generate("google");

      const firstResult = stateManager.validate(state, "google");
      const secondResult = stateManager.validate(state, "google");

      expect(firstResult).toBe(true);
      expect(secondResult).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("ST-07: 期限切れstateが自動削除される", () => {
      const expiredState = stateManager.generate("google");
      const _validState = stateManager.generate("github");

      // 10分 + 1ms 経過（両方とも期限切れ）
      vi.advanceTimersByTime(10 * 60 * 1000 + 1);

      // 新しいstateを生成（これは有効）
      const freshState = stateManager.generate("discord");

      stateManager.cleanup();

      // 期限切れのstateは検証失敗
      expect(stateManager.validate(expiredState, "google")).toBe(false);
      // 新しいstateは検証成功
      expect(stateManager.validate(freshState, "discord")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("ST-08: 空文字stateの検証が失敗する", () => {
      const result = stateManager.validate("", "google");
      expect(result).toBe(false);
    });

    it("ST-09: 有効期限ちょうど（10分）で期限切れにならない", () => {
      const state = stateManager.generate("google");
      // ちょうど10分: Date.now() === expiresAt → > ではないので通過
      vi.advanceTimersByTime(10 * 60 * 1000);
      const result = stateManager.validate(state, "google");
      // expiresAt = createdAt + 10min, Date.now() > expiresAt は false
      expect(result).toBe(true);
    });

    it("ST-10: 有効期限内（9分59秒999ms）で検証成功する", () => {
      const state = stateManager.generate("google");
      vi.advanceTimersByTime(10 * 60 * 1000 - 1);
      const result = stateManager.validate(state, "google");
      expect(result).toBe(true);
    });

    it("ST-11: 複数プロバイダーのstate同時管理", () => {
      const googleState = stateManager.generate("google");
      const githubState = stateManager.generate("github");
      const discordState = stateManager.generate("discord");

      expect(stateManager.validate(googleState, "google")).toBe(true);
      expect(stateManager.validate(githubState, "github")).toBe(true);
      expect(stateManager.validate(discordState, "discord")).toBe(true);
    });

    it("ST-12: cleanup後も有効なstateは保持される", () => {
      const state = stateManager.generate("google");
      stateManager.cleanup();
      const result = stateManager.validate(state, "google");
      expect(result).toBe(true);
    });

    it("ST-13: 大量state生成とcleanupのメモリ管理", () => {
      const states: string[] = [];
      for (let i = 0; i < 100; i++) {
        states.push(stateManager.generate("google"));
      }

      vi.advanceTimersByTime(10 * 60 * 1000 + 1);

      const freshState = stateManager.generate("google");
      stateManager.cleanup();

      for (const state of states) {
        expect(stateManager.validate(state, "google")).toBe(false);
      }
      expect(stateManager.validate(freshState, "google")).toBe(true);
    });
  });

  describe("Error Paths", () => {
    it("ST-15: プロバイダー不一致でstateが消費される", () => {
      const state = stateManager.generate("google");

      expect(stateManager.validate(state, "github")).toBe(false);
      // 正しいproviderでも再検証不可（既に削除済み）
      expect(stateManager.validate(state, "google")).toBe(false);
    });
  });

  describe("consumeState", () => {
    it("生成したstateの検証が成功する", () => {
      const state = stateManager.generate("google");
      expect(stateManager.consumeState(state)).toBe(true);
    });

    it("存在しないstateの検証が失敗する", () => {
      expect(stateManager.consumeState("nonexistent")).toBe(false);
    });

    it("期限切れstateの検証が失敗する", () => {
      const state = stateManager.generate("google");
      vi.advanceTimersByTime(10 * 60 * 1000 + 1);
      expect(stateManager.consumeState(state)).toBe(false);
    });

    it("ワンタイムユース: 2回目の検証が失敗する", () => {
      const state = stateManager.generate("google");
      expect(stateManager.consumeState(state)).toBe(true);
      expect(stateManager.consumeState(state)).toBe(false);
    });
  });

  describe("Integration Scenarios", () => {
    it("ST-16: 完全なOAuth stateフロー", () => {
      const state = stateManager.generate("google");
      expect(state).toHaveLength(64);
      expect(stateManager.validate(state, "google")).toBe(true);
      expect(stateManager.validate(state, "google")).toBe(false);
    });

    it("ST-17: 並行ログインフロー", () => {
      const googleState = stateManager.generate("google");
      const githubState = stateManager.generate("github");

      expect(stateManager.validate(githubState, "github")).toBe(true);
      expect(stateManager.validate(googleState, "google")).toBe(true);
    });

    it("ST-18: 長時間放置後のcleanup+検証失敗", () => {
      const state = stateManager.generate("google");
      vi.advanceTimersByTime(60 * 60 * 1000);
      stateManager.cleanup();
      expect(stateManager.validate(state, "google")).toBe(false);
    });
  });
});
