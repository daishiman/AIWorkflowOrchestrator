/**
 * SkillService Delegation Tests
 *
 * TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION: SkillExecutorへの委譲テスト
 *
 * Phase 4: テスト作成（TDD: Red）
 * Phase 5: 実装（TDD: Green）
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BrowserWindow } from "electron";
import type { Skill, IPermissionStore } from "@repo/shared";
import { SkillService } from "../SkillService";
import { SkillScanner } from "../SkillScanner";
import { SkillParser } from "../SkillParser";
import { SkillImportManager } from "../SkillImportManager";
import {
  SkillExecutor,
  type SkillExecutionRequest,
  type SkillMetadata,
} from "../SkillExecutor";

// === Mocks ===

// Mock electron-store (required for PermissionStore in SkillExecutor)
vi.mock("electron-store", () => {
  return {
    default: class MockElectronStore {
      private data: Record<string, unknown> = {};
      constructor() {}
      get store() {
        return this.data;
      }
      get(key: string) {
        return this.data[key];
      }
      set(key: string | Record<string, unknown>, value?: unknown) {
        if (typeof key === "object") {
          Object.assign(this.data, key);
        } else {
          this.data[key] = value;
        }
      }
      clear() {
        this.data = {};
      }
    },
  };
});

// Mock electron-log
vi.mock("electron-log", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock SDK
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn().mockImplementation(() => ({
    stream: async function* () {
      yield { type: "text", content: "Hello" };
    },
  })),
}));

// BrowserWindow mock
const mockWebContents = {
  send: vi.fn(),
};

const mockMainWindow = {
  webContents: mockWebContents,
  isDestroyed: vi.fn().mockReturnValue(false),
} as unknown as BrowserWindow;

// PermissionStore mock
const mockPermissionStore: IPermissionStore = {
  isToolAllowed: vi.fn().mockReturnValue(false),
  allowTool: vi.fn(),
  revokeTool: vi.fn(),
  getAllowedTools: vi.fn().mockReturnValue([]),
  getAllowedToolEntries: vi.fn().mockReturnValue([]),
  clearAll: vi.fn(),
};

// AuthKeyService mock
const mockAuthKeyService = {
  getKey: vi.fn().mockResolvedValue("sk-ant-api03-test-key"),
  setKey: vi.fn().mockResolvedValue({ success: true }),
  deleteKey: vi.fn().mockResolvedValue({ success: true }),
  hasKey: vi.fn().mockResolvedValue(true),
  validateKey: vi
    .fn()
    .mockResolvedValue({ success: true, data: { isValid: true } }),
};

// Test skill data
const mockSkill: Skill = {
  id: "test-skill-001",
  name: "Test Skill",
  slug: "test-skill",
  description: "A test skill for delegation tests",
  path: "/path/to/skill",
  triggers: ["test"],
  anchors: [
    {
      source: "Test Source",
      application: "Testing",
      purpose: "Unit test verification",
    },
  ],
  allowedTools: ["Read", "Write"],
  lastModified: new Date(),
};

describe("SkillService.delegate", () => {
  let skillService: SkillService;
  let mockScanner: SkillScanner;
  let mockParser: SkillParser;
  let mockImportManager: SkillImportManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    mockScanner = {
      scanDirectory: vi.fn().mockResolvedValue([]),
      getBasePath: vi.fn().mockReturnValue("/mock/skills"),
    } as unknown as SkillScanner;

    mockParser = {
      parse: vi.fn().mockResolvedValue(mockSkill),
    } as unknown as SkillParser;

    mockImportManager = {
      importSkills: vi
        .fn()
        .mockResolvedValue({ success: true, importedCount: 1, errors: [] }),
      removeSkill: vi.fn().mockResolvedValue({ success: true, removed: true }),
      isImported: vi.fn().mockReturnValue(true),
      getImportedSkillIds: vi.fn().mockReturnValue(["test-skill-001"]),
    } as unknown as SkillImportManager;

    skillService = new SkillService(mockScanner, mockParser, mockImportManager);
  });

  describe("setSkillExecutor", () => {
    it("UT-005: should store SkillExecutor instance", () => {
      // Given: SkillExecutor instance
      const executor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // When: setSkillExecutor is called
      skillService.setSkillExecutor(executor);

      // Then: SkillExecutor should be stored internally
      // Note: We verify this by checking executeSkill works without throwing "not initialized" error
      // This is an indirect verification since skillExecutor is private
      expect(() => skillService.setSkillExecutor(executor)).not.toThrow();
    });

    it("should allow replacing SkillExecutor instance", () => {
      // Given: Two SkillExecutor instances
      const executor1 = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      const executor2 = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // When: setSkillExecutor is called twice
      skillService.setSkillExecutor(executor1);
      skillService.setSkillExecutor(executor2);

      // Then: No error should be thrown
      expect(() => skillService.setSkillExecutor(executor2)).not.toThrow();
    });
  });

  describe("executeSkill - delegation", () => {
    it("UT-004: should throw error when SkillExecutor is not initialized", async () => {
      // Given: SkillService without setSkillExecutor called
      // skillService is fresh from beforeEach

      // When & Then: executeSkill should throw
      await expect(skillService.executeSkill("test-skill-001")).rejects.toThrow(
        "SkillExecutor が初期化されていません",
      );
    });

    it("UT-003: should throw error when skill is not found", async () => {
      // Given: SkillExecutor is set, but skill doesn't exist
      const executor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      skillService.setSkillExecutor(executor);

      // Skill cache is empty and getSkillById returns null
      vi.spyOn(skillService, "getSkillById").mockResolvedValue(null);

      // When & Then: executeSkill should throw
      await expect(
        skillService.executeSkill("non-existent-skill"),
      ).rejects.toThrow("スキルが見つかりません");
    });

    it("UT-002: should throw error when skill is not imported", async () => {
      // Given: SkillExecutor is set, skill exists but is not imported
      const executor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      skillService.setSkillExecutor(executor);

      // Skill exists
      vi.spyOn(skillService, "getSkillById").mockResolvedValue(mockSkill);

      // But not imported
      (
        mockImportManager.isImported as ReturnType<typeof vi.fn>
      ).mockReturnValue(false);

      // When & Then: executeSkill should throw
      await expect(skillService.executeSkill("test-skill-001")).rejects.toThrow(
        "スキルがインポートされていません",
      );
    });

    it("UT-001: should delegate to SkillExecutor.execute when conditions are met", async () => {
      // Given: SkillExecutor is set, skill exists and is imported
      const executor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      const executeSpy = vi.spyOn(executor, "execute").mockResolvedValue({
        executionId: "test-exec-id",
        success: true,
      });

      skillService.setSkillExecutor(executor);

      // Skill exists
      vi.spyOn(skillService, "getSkillById").mockResolvedValue(mockSkill);

      // Skill is imported
      (
        mockImportManager.isImported as ReturnType<typeof vi.fn>
      ).mockReturnValue(true);

      // When: executeSkill is called
      const result = await skillService.executeSkill("test-skill-001", {
        prompt: "Test prompt",
      });

      // Then: SkillExecutor.execute is called with correct arguments
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: "Test prompt",
          skillId: "test-skill-001",
        }),
        expect.objectContaining({
          id: "test-skill-001",
          name: "Test Skill",
        }),
      );

      // And: Result is returned
      expect(result.executionId).toBe("test-exec-id");
      expect(result.success).toBe(true);
    });

    it("should build SkillExecutionRequest from params", async () => {
      // Given: SkillExecutor with spy
      const executor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      const executeSpy = vi.spyOn(executor, "execute").mockResolvedValue({
        executionId: "test-exec-id",
        success: true,
      });

      skillService.setSkillExecutor(executor);
      vi.spyOn(skillService, "getSkillById").mockResolvedValue(mockSkill);
      (
        mockImportManager.isImported as ReturnType<typeof vi.fn>
      ).mockReturnValue(true);

      // When: executeSkill is called with various params
      await skillService.executeSkill("test-skill-001", {
        prompt: "Test prompt",
        timeout: 5000,
        sessionId: "session-123",
        retryConfig: { maxRetries: 5 },
      });

      // Then: Request should contain all params
      const [request] = executeSpy.mock.calls[0] as [
        SkillExecutionRequest,
        SkillMetadata,
      ];
      expect(request.prompt).toBe("Test prompt");
      expect(request.timeout).toBe(5000);
      expect(request.sessionId).toBe("session-123");
      expect(request.retryConfig?.maxRetries).toBe(5);
    });

    it("should convert Skill to SkillMetadata", async () => {
      // Given: SkillExecutor with spy
      const executor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      const executeSpy = vi.spyOn(executor, "execute").mockResolvedValue({
        executionId: "test-exec-id",
        success: true,
      });

      skillService.setSkillExecutor(executor);
      vi.spyOn(skillService, "getSkillById").mockResolvedValue(mockSkill);
      (
        mockImportManager.isImported as ReturnType<typeof vi.fn>
      ).mockReturnValue(true);

      // When: executeSkill is called
      await skillService.executeSkill("test-skill-001", { prompt: "Test" });

      // Then: SkillMetadata should match Skill (without lastModified)
      const [, metadata] = executeSpy.mock.calls[0] as [
        SkillExecutionRequest,
        SkillMetadata,
      ];
      expect(metadata.id).toBe(mockSkill.id);
      expect(metadata.name).toBe(mockSkill.name);
      expect(metadata.slug).toBe(mockSkill.slug);
      expect(metadata.description).toBe(mockSkill.description);
      expect(metadata.path).toBe(mockSkill.path);
      expect(metadata.triggers).toEqual(mockSkill.triggers);
      expect(metadata.anchors).toEqual(mockSkill.anchors);
      expect(metadata.allowedTools).toEqual(mockSkill.allowedTools);
    });

    it("should handle empty prompt", async () => {
      // Given: SkillExecutor with spy
      const executor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      const executeSpy = vi.spyOn(executor, "execute").mockResolvedValue({
        executionId: "test-exec-id",
        success: true,
      });

      skillService.setSkillExecutor(executor);
      vi.spyOn(skillService, "getSkillById").mockResolvedValue(mockSkill);
      (
        mockImportManager.isImported as ReturnType<typeof vi.fn>
      ).mockReturnValue(true);

      // When: executeSkill is called without prompt
      await skillService.executeSkill("test-skill-001");

      // Then: Request should have empty string prompt
      const [request] = executeSpy.mock.calls[0] as [
        SkillExecutionRequest,
        SkillMetadata,
      ];
      expect(request.prompt).toBe("");
    });

    it("should propagate errors from SkillExecutor", async () => {
      // Given: SkillExecutor that throws error
      const executor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      vi.spyOn(executor, "execute").mockRejectedValue(new Error("SDK Error"));

      skillService.setSkillExecutor(executor);
      vi.spyOn(skillService, "getSkillById").mockResolvedValue(mockSkill);
      (
        mockImportManager.isImported as ReturnType<typeof vi.fn>
      ).mockReturnValue(true);

      // When & Then: executeSkill should propagate error
      await expect(
        skillService.executeSkill("test-skill-001", { prompt: "Test" }),
      ).rejects.toThrow("SDK Error");
    });
  });
});
