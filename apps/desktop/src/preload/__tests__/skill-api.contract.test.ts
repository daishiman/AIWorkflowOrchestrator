/**
 * Skill API Contract Tests (Preload Layer)
 *
 * UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 4
 *
 * Tests that verify the Preload layer correctly maps each skill: channel
 * to the appropriate IPC wrapper (safeInvoke vs safeInvokeUnwrap) and
 * passes the correct IPC_CHANNELS constant.
 *
 * Contract verification:
 * 1. Each Preload method uses the correct IPC wrapper
 * 2. Each method passes the correct IPC_CHANNELS constant
 * 3. Renderer receives the expected type (unwrapped data vs raw response)
 *
 * TDD Red Phase: Some tests may fail where the current mapping is incorrect.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

// Mock electron module - vi.hoisted() for hoisting
const { mockInvoke, mockOn, mockRemoveListener } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockOn: vi.fn(),
  mockRemoveListener: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  },
}));

// Import after mocking
import { skillAPI } from "../skill-api";

// ============================================================
// Test Fixtures
// ============================================================

const createMockSkillMetadata = () => ({
  name: "test-skill",
  description: "Test skill description",
  path: "/skills/test-skill",
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
});

const createMockImportedSkill = () => ({
  ...createMockSkillMetadata(),
  importedAt: new Date("2026-01-01"),
  status: "active" as const,
});

// ============================================================
// Setup
// ============================================================

beforeEach(() => {
  vi.clearAllMocks();
  mockInvoke.mockResolvedValue(undefined);
  mockOn.mockImplementation(() => {});
});

// ============================================================
// 1. IPC Channel Correctness
// Each Preload method must invoke the correct IPC_CHANNELS constant
// ============================================================

describe("1. IPC Channel Correctness", () => {
  it("PC-CH-01: list() invokes IPC_CHANNELS.SKILL_LIST", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: [] });
    await skillAPI.list();
    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_LIST);
  });

  it("PC-CH-02: rescan() invokes IPC_CHANNELS.SKILL_SCAN", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: [] });
    await skillAPI.rescan();
    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_SCAN);
  });

  it("PC-CH-03: getImported() invokes IPC_CHANNELS.SKILL_GET_IMPORTED", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: [] });
    await skillAPI.getImported();
    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_GET_IMPORTED);
  });

  it("PC-CH-04: import() invokes IPC_CHANNELS.SKILL_IMPORT", async () => {
    mockInvoke.mockResolvedValue(createMockImportedSkill());
    await skillAPI.import("test-skill");
    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_IMPORT,
      "test-skill",
    );
  });

  it("PC-CH-05: remove() invokes IPC_CHANNELS.SKILL_REMOVE", async () => {
    mockInvoke.mockResolvedValue({ success: true, removed: true });
    await skillAPI.remove("test-skill");
    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_REMOVE,
      "test-skill",
    );
  });

  it("PC-CH-06: execute() invokes IPC_CHANNELS.SKILL_EXECUTE", async () => {
    mockInvoke.mockResolvedValue({
      success: true,
      data: { executionId: "exec-1", success: true },
    });
    await skillAPI.execute({ skillName: "test-skill", prompt: "test" });
    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_EXECUTE, {
      skillName: "test-skill",
      prompt: "test",
    });
  });

  it("PC-CH-07: abort() invokes IPC_CHANNELS.SKILL_ABORT", async () => {
    mockInvoke.mockResolvedValue(undefined);
    await skillAPI.abort("exec-1");
    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_ABORT, "exec-1");
  });

  it("PC-CH-08: getExecutionStatus() invokes IPC_CHANNELS.SKILL_GET_STATUS", async () => {
    mockInvoke.mockResolvedValue(null);
    await skillAPI.getExecutionStatus("exec-1");
    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_GET_STATUS,
      "exec-1",
    );
  });

  it("PC-CH-09: importFromSource() invokes IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE", async () => {
    const source = { type: "github", repo: "owner/repo" } as const;
    mockInvoke.mockResolvedValue({ success: true, data: { success: true } });

    await skillAPI.importFromSource(source);

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE,
      source,
    );
  });

  it("PC-CH-10: exportSkill() invokes IPC_CHANNELS.SKILL_EXPORT", async () => {
    const destination = { type: "gist", gistId: "abc123" } as const;
    mockInvoke.mockResolvedValue({ success: true, data: { success: true } });

    await skillAPI.exportSkill("test-skill", destination);

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_EXPORT, {
      skillName: "test-skill",
      destination,
    });
  });

  it("PC-CH-11: validateSource() invokes IPC_CHANNELS.SKILL_VALIDATE_SOURCE", async () => {
    const source = {
      type: "url",
      url: "https://example.com/skill.md",
    } as const;
    mockInvoke.mockResolvedValue({
      success: true,
      data: { isReachable: true },
    });

    await skillAPI.validateSource(source);

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_VALIDATE_SOURCE,
      source,
    );
  });
});

// ============================================================
// 2. IPC Wrapper Selection Contract
// Profile A (wrapper) channels must use safeInvokeUnwrap
// Profile B/C (direct/primitive) channels must use safeInvoke
// ============================================================

describe("2. IPC Wrapper Selection (safeInvoke vs safeInvokeUnwrap)", () => {
  describe("Profile A channels use safeInvokeUnwrap (unwrap wrapper)", () => {
    it("PC-W-01: list() unwraps { success, data } and returns data directly", async () => {
      const mockData = [createMockSkillMetadata()];
      mockInvoke.mockResolvedValue({ success: true, data: mockData });

      const result = await skillAPI.list();

      // safeInvokeUnwrap extracts data from wrapper
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockData);
      // Should NOT be the raw wrapper
      expect(
        (result as unknown as Record<string, unknown>).success,
      ).toBeUndefined();
    });

    it("PC-W-02: rescan() unwraps { success, data } and returns data directly", async () => {
      const mockData = [createMockSkillMetadata()];
      mockInvoke.mockResolvedValue({ success: true, data: mockData });

      const result = await skillAPI.rescan();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockData);
    });

    it("PC-W-03: getImported() unwraps { success, data } and returns data directly", async () => {
      const mockData = [createMockImportedSkill()];
      mockInvoke.mockResolvedValue({ success: true, data: mockData });

      const result = await skillAPI.getImported();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockData);
    });

    it("PC-W-06: execute() unwraps { success, data } and returns data directly", async () => {
      const mockResponse = { executionId: "exec-1", success: true };
      mockInvoke.mockResolvedValue({ success: true, data: mockResponse });

      const result = await skillAPI.execute({
        skillName: "test-skill",
        prompt: "test",
      });

      expect(result).toEqual(mockResponse);
      expect(result.executionId).toBe("exec-1");
    });

    it("PC-W-UNWRAP-ERR: safeInvokeUnwrap throws when success is false", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "Something went wrong",
      });

      await expect(skillAPI.list()).rejects.toThrow("Something went wrong");
    });

    it("PC-W-UNWRAP-ERR-CODE: safeInvokeUnwrap maps errorCode to thrown Error.code", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "API Key is not configured",
        errorCode: "AUTHENTICATION_ERROR",
      });

      try {
        await skillAPI.execute({ skillName: "test-skill", prompt: "test" });
        expect.fail("Expected execute() to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error & { code?: string }).code).toBe(
          "AUTHENTICATION_ERROR",
        );
      }
    });
  });

  describe("Profile B channels use safeInvoke (pass through)", () => {
    it("PC-W-04: import() returns raw Main response (not unwrapped)", async () => {
      const mockImported = createMockImportedSkill();
      mockInvoke.mockResolvedValue(mockImported);

      const result = await skillAPI.import("test-skill");

      // safeInvoke passes through directly — the result IS the ImportedSkill
      expect(result).toEqual(mockImported);
      expect(result.name).toBe("test-skill");
    });

    it("PC-W-04-B: import() only calls SKILL_IMPORT (channel boundary guard)", async () => {
      const mockImported = createMockImportedSkill();
      mockInvoke.mockResolvedValue(mockImported);

      await skillAPI.import("test-skill");

      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(mockInvoke.mock.calls[0][0]).toBe(IPC_CHANNELS.SKILL_IMPORT);
      expect(
        mockInvoke.mock.calls.some(
          ([channel]) => channel === IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE,
        ),
      ).toBe(false);
    });

    it("PC-W-05: remove() returns raw Main response (not unwrapped)", async () => {
      const mockRemoveResult = { success: true, removed: true };
      mockInvoke.mockResolvedValue(mockRemoveResult);

      const result = await skillAPI.remove("test-skill");

      // safeInvoke passes through directly — the result IS the RemoveResult
      expect(result).toEqual(mockRemoveResult);
    });

    it("PC-W-05-B: share handlers keep raw errorCode payload", async () => {
      const mockErrorResult = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "invalid source.type" },
        errorCode: "ERR_1001",
      };
      mockInvoke.mockResolvedValue(mockErrorResult);

      const result = await skillAPI.importFromSource({
        type: "github",
        repo: "",
      });

      expect(result).toEqual(mockErrorResult);
      expect((result as { errorCode?: string }).errorCode).toBe("ERR_1001");
    });
  });

  describe("Profile C channels use safeInvoke (pass through)", () => {
    it("PC-W-07: abort() uses safeInvoke and returns void", async () => {
      mockInvoke.mockResolvedValue(undefined);

      const result = await skillAPI.abort("exec-1");

      // abort() signature returns Promise<void>
      // Main returns boolean, but Preload type says void
      // This verifies the current behavior: safeInvoke passes through
      expect(result).toBeUndefined();
    });

    it("PC-RED01: abort() receives boolean from Main but type says void", async () => {
      // Main handler returns boolean (true/false for abort result)
      mockInvoke.mockResolvedValue(true);

      const result = await skillAPI.abort("exec-1");

      // RED TEST: The Preload type says void but Main returns boolean
      // After safeInvoke, the actual value is boolean (not undefined/void)
      // This test documents the type inconsistency
      // The result is actually `true` from Main, but Preload says void
      // We test for the ACTUAL behavior: safeInvoke passes through whatever Main returns

      expect(result).toBe(true);
    });

    it("PC-W-08: getExecutionStatus() uses safeInvoke and returns value directly", async () => {
      const mockStatus = {
        executionId: "exec-1",
        status: "running",
        startedAt: new Date(),
      };
      mockInvoke.mockResolvedValue(mockStatus);

      const result = await skillAPI.getExecutionStatus("exec-1");

      expect(result).toEqual(mockStatus);
    });

    it("PC-W-08-NULL: getExecutionStatus() returns null for unknown execution", async () => {
      mockInvoke.mockResolvedValue(null);

      const result = await skillAPI.getExecutionStatus("nonexistent");

      expect(result).toBeNull();
    });
  });
});

// ============================================================
// 3. Channel Whitelist Verification
// All skill: channels used by skillAPI must be in ALLOWED_INVOKE_CHANNELS
// ============================================================

describe("3. Channel Whitelist Verification", () => {
  const invokeChannels = [
    { name: "SKILL_LIST", channel: IPC_CHANNELS.SKILL_LIST },
    { name: "SKILL_SCAN", channel: IPC_CHANNELS.SKILL_SCAN },
    { name: "SKILL_GET_IMPORTED", channel: IPC_CHANNELS.SKILL_GET_IMPORTED },
    { name: "SKILL_IMPORT", channel: IPC_CHANNELS.SKILL_IMPORT },
    { name: "SKILL_REMOVE", channel: IPC_CHANNELS.SKILL_REMOVE },
    { name: "SKILL_EXECUTE", channel: IPC_CHANNELS.SKILL_EXECUTE },
    { name: "SKILL_ABORT", channel: IPC_CHANNELS.SKILL_ABORT },
    { name: "SKILL_GET_STATUS", channel: IPC_CHANNELS.SKILL_GET_STATUS },
    {
      name: "SKILL_PERMISSION_RESPONSE",
      channel: IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
    },
    { name: "SKILL_READ_FILE", channel: IPC_CHANNELS.SKILL_READ_FILE },
    { name: "SKILL_WRITE_FILE", channel: IPC_CHANNELS.SKILL_WRITE_FILE },
    { name: "SKILL_CREATE_FILE", channel: IPC_CHANNELS.SKILL_CREATE_FILE },
    { name: "SKILL_DELETE_FILE", channel: IPC_CHANNELS.SKILL_DELETE_FILE },
    { name: "SKILL_LIST_BACKUPS", channel: IPC_CHANNELS.SKILL_LIST_BACKUPS },
    {
      name: "SKILL_RESTORE_BACKUP",
      channel: IPC_CHANNELS.SKILL_RESTORE_BACKUP,
    },
    {
      name: "SKILL_IMPORT_FROM_SOURCE",
      channel: IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE,
    },
    { name: "SKILL_EXPORT", channel: IPC_CHANNELS.SKILL_EXPORT },
    {
      name: "SKILL_VALIDATE_SOURCE",
      channel: IPC_CHANNELS.SKILL_VALIDATE_SOURCE,
    },
  ];

  it.each(invokeChannels)(
    "PC-WL-INV: $name is in ALLOWED_INVOKE_CHANNELS",
    ({ channel }) => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(channel);
    },
  );

  const onChannels = [
    { name: "SKILL_STREAM", channel: IPC_CHANNELS.SKILL_STREAM },
    { name: "SKILL_COMPLETE", channel: IPC_CHANNELS.SKILL_COMPLETE },
    { name: "SKILL_ERROR", channel: IPC_CHANNELS.SKILL_ERROR },
    {
      name: "SKILL_PERMISSION_REQUEST",
      channel: IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
    },
  ];

  it.each(onChannels)(
    "PC-WL-ON: $name is in ALLOWED_ON_CHANNELS",
    ({ channel }) => {
      expect(ALLOWED_ON_CHANNELS).toContain(channel);
    },
  );
});

// ============================================================
// 4. Event Listener Registration (safeOn)
// ============================================================

describe("4. Event Listener Registration", () => {
  it("PC-EV-01: onStream registers listener on SKILL_STREAM", () => {
    const callback = vi.fn();
    skillAPI.onStream(callback);

    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_STREAM,
      expect.any(Function),
    );
  });

  it("PC-EV-02: onPermissionRequest registers listener on SKILL_PERMISSION_REQUEST", () => {
    const callback = vi.fn();
    skillAPI.onPermissionRequest(callback);

    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      expect.any(Function),
    );
  });

  it("PC-EV-03: onComplete registers listener on SKILL_COMPLETE", () => {
    const callback = vi.fn();
    skillAPI.onComplete(callback);

    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_COMPLETE,
      expect.any(Function),
    );
  });

  it("PC-EV-04: onError registers listener on SKILL_ERROR", () => {
    const callback = vi.fn();
    skillAPI.onError(callback);

    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_ERROR,
      expect.any(Function),
    );
  });

  it("PC-EV-05: listener cleanup function calls removeListener", () => {
    const callback = vi.fn();
    const cleanup = skillAPI.onStream(callback);

    cleanup();

    expect(mockRemoveListener).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_STREAM,
      expect.any(Function),
    );
  });
});

// ============================================================
// 5. Skill File Operations - Wrapper Selection
// File operations use safeInvokeUnwrap (they return { success, data })
// ============================================================

describe("5. Skill File Operations - Wrapper Contract", () => {
  it("PC-FO-01: readFile uses safeInvokeUnwrap and returns string", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: "file content" });

    const result = await skillAPI.readFile("test-skill", "SKILL.md");

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_READ_FILE, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
    });
    expect(result).toBe("file content");
  });

  it("PC-FO-02: writeFile uses safeInvokeUnwrap and returns void", async () => {
    mockInvoke.mockResolvedValue({ success: true });

    const result = await skillAPI.writeFile(
      "test-skill",
      "SKILL.md",
      "new content",
    );

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_WRITE_FILE, {
      skillName: "test-skill",
      relativePath: "SKILL.md",
      content: "new content",
    });
    // safeInvokeUnwrap<void> extracts data which is undefined
    expect(result).toBeUndefined();
  });

  it("PC-FO-03: createFile uses safeInvokeUnwrap", async () => {
    mockInvoke.mockResolvedValue({ success: true });

    await skillAPI.createFile("test-skill", "new-file.md", "content");

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_CREATE_FILE, {
      skillName: "test-skill",
      relativePath: "new-file.md",
      content: "content",
    });
  });

  it("PC-FO-04: deleteFile uses safeInvokeUnwrap", async () => {
    mockInvoke.mockResolvedValue({ success: true });

    await skillAPI.deleteFile("test-skill", "old-file.md");

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_DELETE_FILE, {
      skillName: "test-skill",
      relativePath: "old-file.md",
    });
  });

  it("PC-FO-05: listBackups uses safeInvokeUnwrap and returns BackupInfo[]", async () => {
    const mockBackups = [
      { path: "/backups/v1", createdAt: new Date(), size: 1024 },
    ];
    mockInvoke.mockResolvedValue({ success: true, data: mockBackups });

    const result = await skillAPI.listBackups("test-skill");

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_LIST_BACKUPS, {
      skillName: "test-skill",
    });
    expect(result).toEqual(mockBackups);
  });

  it("PC-FO-06: restoreBackup uses safeInvokeUnwrap", async () => {
    mockInvoke.mockResolvedValue({ success: true });

    await skillAPI.restoreBackup("test-skill", "/backups/v1");

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_RESTORE_BACKUP, {
      skillName: "test-skill",
      backupPath: "/backups/v1",
    });
  });

  it("PC-FO-ERR: file operations throw when Main returns { success: false }", async () => {
    mockInvoke.mockResolvedValue({
      success: false,
      error: "File not found",
    });

    await expect(
      skillAPI.readFile("test-skill", "nonexistent.md"),
    ).rejects.toThrow("File not found");
  });
});

// ============================================================
// 6. IPC Channel Constants Verification
// No hardcoded strings - all channels from IPC_CHANNELS
// ============================================================

describe("6. No Hardcoded Channel Strings", () => {
  it("PC-HC-01: all invoke calls use IPC_CHANNELS constants (not string literals)", async () => {
    // This test verifies that after calling each API method,
    // the invoke was called with a value that exists in IPC_CHANNELS
    const allIpcChannelValues = Object.values(IPC_CHANNELS);

    // Call each method
    mockInvoke.mockResolvedValue({ success: true, data: [] });

    await skillAPI.list();
    await skillAPI.rescan();
    await skillAPI.getImported();

    mockInvoke.mockResolvedValue(createMockImportedSkill());
    await skillAPI.import("test");

    mockInvoke.mockResolvedValue({ success: true, removed: true });
    await skillAPI.remove("test");

    mockInvoke.mockResolvedValue({
      success: true,
      data: { executionId: "e1", success: true },
    });
    await skillAPI.execute({ skillName: "test", prompt: "p" });

    mockInvoke.mockResolvedValue(undefined);
    await skillAPI.abort("e1");

    mockInvoke.mockResolvedValue(null);
    await skillAPI.getExecutionStatus("e1");

    // Verify all invoked channels are IPC_CHANNELS values
    for (const call of mockInvoke.mock.calls) {
      const channelArg = call[0] as string;
      expect(allIpcChannelValues).toContain(channelArg);
    }
  });
});
