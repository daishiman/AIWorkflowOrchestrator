/**
 * IPC Consolidation Tests
 *
 * TDD Red Phase: Tests for TASK-FIX-4-1-IPC-CONSOLIDATION.
 * Validates that old channels are removed and unified to new spec-compliant channels.
 *
 * @module @repo/desktop/preload/__tests__/channels.ipc-consolidation
 */

import { describe, it, expect } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

// ============================================================
// 1. Old Channel Removal Tests
// ============================================================
describe("TASK-FIX-4-1: Old Channel Removal", () => {
  describe("SKILL_LIST_AVAILABLE should not exist", () => {
    it("should NOT have SKILL_LIST_AVAILABLE in IPC_CHANNELS", () => {
      // After consolidation, SKILL_LIST_AVAILABLE should be removed
      expect(
        (IPC_CHANNELS as Record<string, string>).SKILL_LIST_AVAILABLE,
      ).toBeUndefined();
    });

    it("should NOT have skill:list-available in ALLOWED_INVOKE_CHANNELS", () => {
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain("skill:list-available");
    });
  });

  describe("SKILL_LIST_IMPORTED should not exist", () => {
    it("should NOT have SKILL_LIST_IMPORTED in IPC_CHANNELS", () => {
      // After consolidation, SKILL_LIST_IMPORTED should be removed
      expect(
        (IPC_CHANNELS as Record<string, string>).SKILL_LIST_IMPORTED,
      ).toBeUndefined();
    });

    it("should NOT have skill:list-imported in ALLOWED_INVOKE_CHANNELS", () => {
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain("skill:list-imported");
    });
  });
});

// ============================================================
// 2. Unified Channel Tests - SKILL_LIST replaces SKILL_LIST_AVAILABLE
// ============================================================
describe("TASK-FIX-4-1: Channel Unification - SKILL_LIST", () => {
  it("should have SKILL_LIST defined as skill:list", () => {
    expect(IPC_CHANNELS.SKILL_LIST).toBe("skill:list");
  });

  it("should include SKILL_LIST in ALLOWED_INVOKE_CHANNELS", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_LIST);
  });

  it("should NOT include SKILL_LIST in ALLOWED_ON_CHANNELS", () => {
    expect(ALLOWED_ON_CHANNELS).not.toContain(IPC_CHANNELS.SKILL_LIST);
  });
});

// ============================================================
// 3. Unified Channel Tests - SKILL_GET_IMPORTED replaces SKILL_LIST_IMPORTED
// ============================================================
describe("TASK-FIX-4-1: Channel Unification - SKILL_GET_IMPORTED", () => {
  it("should have SKILL_GET_IMPORTED defined as skill:getImported", () => {
    expect(IPC_CHANNELS.SKILL_GET_IMPORTED).toBe("skill:getImported");
  });

  it("should include SKILL_GET_IMPORTED in ALLOWED_INVOKE_CHANNELS", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_GET_IMPORTED);
  });

  it("should NOT include SKILL_GET_IMPORTED in ALLOWED_ON_CHANNELS", () => {
    expect(ALLOWED_ON_CHANNELS).not.toContain(IPC_CHANNELS.SKILL_GET_IMPORTED);
  });
});

// ============================================================
// 4. Hardcoded String Removal Tests
// ============================================================
describe("TASK-FIX-4-1: Hardcoded String Removal", () => {
  it("should have SKILL_COMPLETE as proper constant", () => {
    // Verify the constant exists and has correct value
    expect(IPC_CHANNELS.SKILL_COMPLETE).toBe("skill:complete");
  });

  it("should have SKILL_ERROR as proper constant", () => {
    // Verify the constant exists and has correct value
    expect(IPC_CHANNELS.SKILL_ERROR).toBe("skill:error");
  });

  it("should include SKILL_COMPLETE in ALLOWED_ON_CHANNELS", () => {
    expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.SKILL_COMPLETE);
  });

  it("should include SKILL_ERROR in ALLOWED_ON_CHANNELS", () => {
    expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.SKILL_ERROR);
  });
});

// ============================================================
// 5. Spec-Compliant Channel Completeness
// ============================================================
describe("TASK-FIX-4-1: Spec-Compliant Channel Completeness", () => {
  // 仕様書で定義された12チャンネル
  const specInvokeChannels = [
    { key: "SKILL_LIST", value: "skill:list" },
    { key: "SKILL_SCAN", value: "skill:scan" },
    { key: "SKILL_GET_IMPORTED", value: "skill:getImported" },
    { key: "SKILL_UPDATE", value: "skill:update" },
    { key: "SKILL_EXECUTE", value: "skill:execute" },
    { key: "SKILL_ABORT", value: "skill:abort" },
    { key: "SKILL_GET_STATUS", value: "skill:get-status" },
    { key: "SKILL_PERMISSION_RESPONSE", value: "skill:permission:response" },
  ];

  const specOnChannels = [
    { key: "SKILL_COMPLETE", value: "skill:complete" },
    { key: "SKILL_ERROR", value: "skill:error" },
    { key: "SKILL_STREAM", value: "skill:stream" },
    { key: "SKILL_PERMISSION_REQUEST", value: "skill:permission:request" },
  ];

  describe("All spec invoke channels should be defined and whitelisted", () => {
    specInvokeChannels.forEach(({ key, value }) => {
      it(`should have ${key} defined as ${value}`, () => {
        expect((IPC_CHANNELS as Record<string, string>)[key]).toBe(value);
      });

      it(`should include ${key} in ALLOWED_INVOKE_CHANNELS`, () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(value);
      });
    });
  });

  describe("All spec on channels should be defined and whitelisted", () => {
    specOnChannels.forEach(({ key, value }) => {
      it(`should have ${key} defined as ${value}`, () => {
        expect((IPC_CHANNELS as Record<string, string>)[key]).toBe(value);
      });

      it(`should include ${key} in ALLOWED_ON_CHANNELS`, () => {
        expect(ALLOWED_ON_CHANNELS).toContain(value);
      });
    });
  });
});

// ============================================================
// 6. No Duplicate Channels
// ============================================================
describe("TASK-FIX-4-1: No Duplicate Channels", () => {
  it("should not have duplicate skill:list variants", () => {
    // skill:list should be the only list channel
    const listChannels = Object.values(IPC_CHANNELS).filter(
      (v) => typeof v === "string" && v.includes(":list"),
    );
    // Should have skill:list but NOT skill:list-available
    expect(listChannels).toContain("skill:list");
    expect(listChannels).not.toContain("skill:list-available");
    expect(listChannels).not.toContain("skill:list-imported");
  });

  it("should not have duplicate imported channels", () => {
    // skill:getImported should be the only imported channel
    const importedChannels = Object.values(IPC_CHANNELS).filter(
      (v) =>
        typeof v === "string" &&
        (v.includes("Imported") || v.includes("-imported")),
    );
    expect(importedChannels).toContain("skill:getImported");
    expect(importedChannels).not.toContain("skill:list-imported");
  });
});

// ============================================================
// 7. Whitelist Cleanup
// ============================================================
describe("TASK-FIX-4-1: Whitelist Cleanup", () => {
  it("should not have old channel strings in ALLOWED_INVOKE_CHANNELS", () => {
    const oldChannels = ["skill:list-available", "skill:list-imported"];
    oldChannels.forEach((channel) => {
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(channel);
    });
  });

  it("should not have old channel strings in ALLOWED_ON_CHANNELS", () => {
    const oldChannels = ["skill:list-available", "skill:list-imported"];
    oldChannels.forEach((channel) => {
      expect(ALLOWED_ON_CHANNELS).not.toContain(channel);
    });
  });
});
