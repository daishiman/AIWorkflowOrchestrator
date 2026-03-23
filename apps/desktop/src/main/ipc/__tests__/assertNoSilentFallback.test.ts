/**
 * assertNoSilentFallback ガード Unit Test
 * P62 対策: DEFAULT_CONFIG への暗黙 fallback を防止するガードの検証
 * @module assertNoSilentFallback.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  assertNoSilentFallback,
  setSelectedLLMConfig,
  resetLLMConfig,
  LLMConfigNotSelectedError,
} from "../llmConfigProvider";
import type { SelectedLLMConfig } from "../llmConfigProvider";

describe("assertNoSilentFallback", () => {
  beforeEach(() => {
    resetLLMConfig();
  });

  // T-1: currentConfig が null の場合
  it("should throw LLMConfigNotSelectedError when config is null", () => {
    expect(() => assertNoSilentFallback()).toThrow(LLMConfigNotSelectedError);
  });

  // T-2: currentConfig が有効な SelectedLLMConfig の場合
  it("should return config when valid config is set", () => {
    const config: SelectedLLMConfig = {
      providerId: "openai",
      modelId: "gpt-4o",
    };
    setSelectedLLMConfig(config);

    const result = assertNoSilentFallback();
    expect(result).toEqual(config);
  });

  // T-3: エラーの code プロパティ
  it("should have error code 'LLM_CONFIG_NOT_SELECTED'", () => {
    try {
      assertNoSilentFallback();
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(LLMConfigNotSelectedError);
      expect((error as LLMConfigNotSelectedError).code).toBe(
        "LLM_CONFIG_NOT_SELECTED",
      );
    }
  });

  // T-4: エラーの instanceof 判定
  it("should throw an instance of LLMConfigNotSelectedError and Error", () => {
    try {
      assertNoSilentFallback();
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(LLMConfigNotSelectedError);
      expect(error).toBeInstanceOf(Error);
    }
  });

  // T-5: エラーメッセージにユーザー向け文言が含まれる
  it("should include user-facing message about Provider/Model selection", () => {
    try {
      assertNoSilentFallback();
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect((error as LLMConfigNotSelectedError).message).toContain(
        "選択されていません",
      );
    }
  });

  // T-6: setSelectedLLMConfig 後に assertNoSilentFallback
  it("should return the config that was set via setSelectedLLMConfig", () => {
    const config: SelectedLLMConfig = {
      providerId: "anthropic",
      modelId: "claude-sonnet-4-6",
    };
    setSelectedLLMConfig(config);

    const result = assertNoSilentFallback();
    expect(result.providerId).toBe("anthropic");
    expect(result.modelId).toBe("claude-sonnet-4-6");
  });

  // T-7: resetLLMConfig 後に assertNoSilentFallback
  it("should throw after resetLLMConfig even if config was previously set", () => {
    const config: SelectedLLMConfig = {
      providerId: "openai",
      modelId: "gpt-4o",
    };
    setSelectedLLMConfig(config);
    expect(() => assertNoSilentFallback()).not.toThrow();

    resetLLMConfig();
    expect(() => assertNoSilentFallback()).toThrow(LLMConfigNotSelectedError);
  });

  // T-13: setSelectedLLMConfig(null) 後の assertNoSilentFallback
  it("should throw after setSelectedLLMConfig(null)", () => {
    const config: SelectedLLMConfig = {
      providerId: "openai",
      modelId: "gpt-4o",
    };
    setSelectedLLMConfig(config);
    setSelectedLLMConfig(null);

    expect(() => assertNoSilentFallback()).toThrow(LLMConfigNotSelectedError);
  });

  // T-14: 複数回の set → reset → assert のシーケンス
  it("should correctly track state through multiple set/reset cycles", () => {
    const config1: SelectedLLMConfig = {
      providerId: "openai",
      modelId: "gpt-4o",
    };
    const config2: SelectedLLMConfig = {
      providerId: "anthropic",
      modelId: "claude-sonnet-4-6",
    };

    setSelectedLLMConfig(config1);
    expect(assertNoSilentFallback()).toEqual(config1);

    setSelectedLLMConfig(config2);
    expect(assertNoSilentFallback()).toEqual(config2);

    resetLLMConfig();
    expect(() => assertNoSilentFallback()).toThrow(LLMConfigNotSelectedError);

    setSelectedLLMConfig(config1);
    expect(assertNoSilentFallback()).toEqual(config1);
  });

  // T-15: エラーの name プロパティ
  it("should have error name 'LLMConfigNotSelectedError'", () => {
    try {
      assertNoSilentFallback();
      expect.unreachable("Should have thrown");
    } catch (error) {
      expect((error as LLMConfigNotSelectedError).name).toBe(
        "LLMConfigNotSelectedError",
      );
    }
  });
});
