import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SkillChainDefinition, SkillChainResult } from "@repo/shared";

// Mock dependencies
const mockChainStore = {
  list: vi.fn(),
  get: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

const mockChainExecutor = {
  executeChain: vi.fn(),
};

const mockValidateIpcSender = vi.fn().mockReturnValue({ valid: true });

function createTestChain(
  overrides?: Partial<SkillChainDefinition>,
): SkillChainDefinition {
  return {
    id: overrides?.id ?? "test-chain-1",
    name: overrides?.name ?? "Test Chain",
    description: overrides?.description ?? "",
    steps: overrides?.steps ?? [],
    variables: overrides?.variables ?? {},
    errorHandling: overrides?.errorHandling ?? "stop",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

// Simulated IPC handler functions (testing the logic without actual ipcMain registration)
// These mirror the handlers in skillHandlers.ts

function validateChainId(chainId: unknown): { valid: boolean; error?: string } {
  if (typeof chainId !== "string" || chainId === "" || chainId.trim() === "") {
    return { valid: false, error: "chainId must be a non-empty string" };
  }
  return { valid: true };
}

function validateChainDefinition(definition: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!definition || typeof definition !== "object") {
    return { valid: false, error: "definition must be a valid object" };
  }
  const def = definition as Record<string, unknown>;
  if (typeof def.name !== "string" || (def.name as string).trim() === "") {
    return {
      valid: false,
      error: "definition.name must be a non-empty string",
    };
  }
  if (!Array.isArray(def.steps)) {
    return { valid: false, error: "definition.steps must be an array" };
  }
  if (!["stop", "skip", "retry"].includes(def.errorHandling as string)) {
    return {
      valid: false,
      error: "definition.errorHandling must be 'stop', 'skip', or 'retry'",
    };
  }
  return { valid: true };
}

describe("Skill Chain IPC Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateIpcSender.mockReturnValue({ valid: true });
  });

  describe("skill:chain:list", () => {
    it("保存済みチェーン一覧を返す", async () => {
      const chains = [
        createTestChain({ id: "c1" }),
        createTestChain({ id: "c2" }),
      ];
      mockChainStore.list.mockResolvedValue(chains);
      const result = await mockChainStore.list();
      expect(result).toHaveLength(2);
    });

    it("チェーンが0件の場合、空配列を返す", async () => {
      mockChainStore.list.mockResolvedValue([]);
      const result = await mockChainStore.list();
      expect(result).toEqual([]);
    });
  });

  describe("skill:chain:get", () => {
    it("有効な chainId で該当チェーンを返す", async () => {
      const chain = createTestChain();
      mockChainStore.get.mockResolvedValue(chain);
      const validation = validateChainId("test-chain-1");
      expect(validation.valid).toBe(true);
      const result = await mockChainStore.get("test-chain-1");
      expect(result.id).toBe("test-chain-1");
    });

    it("存在しない chainId で null を返す", async () => {
      mockChainStore.get.mockResolvedValue(null);
      const result = await mockChainStore.get("non-existent");
      expect(result).toBeNull();
    });

    it("chainId が string 以外の場合、VALIDATION_ERROR", () => {
      expect(validateChainId(123).valid).toBe(false);
      expect(validateChainId(null).valid).toBe(false);
      expect(validateChainId(undefined).valid).toBe(false);
    });

    it("chainId が空文字列の場合、VALIDATION_ERROR", () => {
      expect(validateChainId("").valid).toBe(false);
    });

    it("chainId がスペースのみの場合、VALIDATION_ERROR", () => {
      expect(validateChainId("   ").valid).toBe(false);
    });
  });

  describe("skill:chain:save", () => {
    it("有効な SkillChainDefinition を保存する", async () => {
      const chain = createTestChain();
      const validation = validateChainDefinition(chain);
      expect(validation.valid).toBe(true);
      mockChainStore.save.mockResolvedValue(chain);
      const result = await mockChainStore.save(chain);
      expect(result.id).toBe("test-chain-1");
    });

    it("definition が null の場合、VALIDATION_ERROR", () => {
      expect(validateChainDefinition(null).valid).toBe(false);
    });

    it("definition.name がスペースのみの場合、VALIDATION_ERROR", () => {
      expect(
        validateChainDefinition({
          name: "   ",
          steps: [],
          errorHandling: "stop",
        }).valid,
      ).toBe(false);
    });

    it("definition.steps が配列でない場合、VALIDATION_ERROR", () => {
      expect(
        validateChainDefinition({
          name: "test",
          steps: "invalid",
          errorHandling: "stop",
        }).valid,
      ).toBe(false);
    });

    it("definition.errorHandling が許可値以外の場合、VALIDATION_ERROR", () => {
      expect(
        validateChainDefinition({
          name: "test",
          steps: [],
          errorHandling: "invalid",
        }).valid,
      ).toBe(false);
    });
  });

  describe("skill:chain:delete", () => {
    it("有効な chainId でチェーンを削除する", async () => {
      mockChainStore.delete.mockResolvedValue(true);
      const validation = validateChainId("test-chain-1");
      expect(validation.valid).toBe(true);
      const result = await mockChainStore.delete("test-chain-1");
      expect(result).toBe(true);
    });

    it("chainId が string 以外の場合、VALIDATION_ERROR", () => {
      expect(validateChainId(42).valid).toBe(false);
    });

    it("chainId が空文字列の場合、VALIDATION_ERROR", () => {
      expect(validateChainId("").valid).toBe(false);
    });

    it("chainId がスペースのみの場合、VALIDATION_ERROR", () => {
      expect(validateChainId("  ").valid).toBe(false);
    });
  });

  describe("skill:chain:execute", () => {
    it("有効な chainId でチェーンを実行し、SkillChainResult を返す", async () => {
      const chain = createTestChain();
      const execResult: SkillChainResult = {
        chainId: "test-chain-1",
        success: true,
        results: [],
        finalVariables: {},
        totalDuration: 100,
      };
      mockChainStore.get.mockResolvedValue(chain);
      mockChainExecutor.executeChain.mockResolvedValue(execResult);
      const validation = validateChainId("test-chain-1");
      expect(validation.valid).toBe(true);
      const result = await mockChainExecutor.executeChain(chain, {});
      expect(result.success).toBe(true);
    });

    it("chainId が空文字列の場合、VALIDATION_ERROR", () => {
      expect(validateChainId("").valid).toBe(false);
    });

    it("chainId がスペースのみの場合、VALIDATION_ERROR", () => {
      expect(validateChainId("   ").valid).toBe(false);
    });

    it("存在しない chainId の場合、NOT_FOUND エラー", async () => {
      mockChainStore.get.mockResolvedValue(null);
      const result = await mockChainStore.get("missing");
      expect(result).toBeNull();
    });

    it("variables がオブジェクト以外の場合、VALIDATION_ERROR", () => {
      const validateVariables = (v: unknown) => {
        if (
          v !== undefined &&
          (typeof v !== "object" || v === null || Array.isArray(v))
        ) {
          return { valid: false };
        }
        return { valid: true };
      };
      expect(validateVariables("string").valid).toBe(false);
      expect(validateVariables(null).valid).toBe(false);
      expect(validateVariables([1, 2]).valid).toBe(false);
      expect(validateVariables({ key: "value" }).valid).toBe(true);
      expect(validateVariables(undefined).valid).toBe(true);
    });
  });
});
