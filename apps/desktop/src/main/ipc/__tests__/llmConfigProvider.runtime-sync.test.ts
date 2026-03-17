/**
 * LLMConfigProvider Runtime Sync テスト
 *
 * TDD Phase: Red（Phase 5 実装後に Green になることを期待）
 *
 * テストケース:
 *   UT-009: getSelectedLLMConfig() - config 未設定時に null を返す（GAP-03 fallback廃止）
 *
 * @see docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/outputs/phase-4/test-matrix.md
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  getSelectedLLMConfig,
  setSelectedLLMConfig,
  resetLLMConfig,
} from "../llmConfigProvider";

describe("LLMConfigProvider - Runtime Sync", () => {
  beforeEach(() => {
    // テスト間で状態をリセットする（P9 対策）
    resetLLMConfig();
  });

  describe("UT-009: getSelectedLLMConfig() - fallback廃止", () => {
    it("config が未設定の場合に null を返す（DEFAULT_CONFIG への無条件 fallback がない）", async () => {
      // Given: config が未設定（resetLLMConfig() で null に設定済み）

      // When: 設定を取得する
      const result = await getSelectedLLMConfig();

      // Then: DEFAULT_CONFIG ではなく null を返す（GAP-03 解決）
      // 現在の実装は DEFAULT_CONFIG を返す（Red 状態）
      // Phase 5 で null を返すよう変更される
      expect(result).toBeNull();
    });

    it("config が設定されている場合は設定値を返す", async () => {
      // Given: config を設定する
      setSelectedLLMConfig({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet-20241022",
      });

      // When: 設定を取得する
      const result = await getSelectedLLMConfig();

      // Then: 設定した値が返る
      expect(result).toEqual({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet-20241022",
      });
    });

    it("setSelectedLLMConfig(null) で設定をクリアした後に null を返す", async () => {
      // Given: 一度設定した後にクリアする
      setSelectedLLMConfig({ providerId: "openai", modelId: "gpt-4o" });
      setSelectedLLMConfig(null);

      // When: 設定を取得する
      const result = await getSelectedLLMConfig();

      // Then: null を返す（DEFAULT_CONFIG に fallback しない）
      // 現在の実装は DEFAULT_CONFIG を返す（Red 状態）
      // Phase 5 で null を返すよう変更される
      expect(result).toBeNull();
    });

    it("setSelectedLLMConfig() で providerId/modelId を更新できる", () => {
      // Given: 設定を更新する
      setSelectedLLMConfig({ providerId: "google", modelId: "gemini-1.5-pro" });

      // When/Then: 非同期処理なしで内部状態が更新されていることを確認
      // （getSelectedLLMConfig の async テストで間接的に検証済みだが、
      //   setSelectedLLMConfig 自体が副作用を持つことを明示する）
      expect(() =>
        setSelectedLLMConfig({
          providerId: "google",
          modelId: "gemini-1.5-pro",
        }),
      ).not.toThrow();
    });
  });
});
