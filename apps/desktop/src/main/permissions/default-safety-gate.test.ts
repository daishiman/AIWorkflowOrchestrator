/**
 * DefaultSafetyGate テスト
 *
 * Phase 4: テストファースト - 実装ファイル未作成の状態で RED テストを記述
 *
 * @module default-safety-gate.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import type { IPermissionStore } from "@repo/shared";

import { DefaultSafetyGate } from "./default-safety-gate";
import type { SkillMetadataProvider } from "./default-safety-gate";

// =============================================================================
// モックファクトリ
// =============================================================================

function createMockPermissionStore(): IPermissionStore {
  return {
    isToolAllowed: vi.fn().mockReturnValue(false),
    allowTool: vi.fn(),
    revokeTool: vi.fn(),
    getAllowedTools: vi.fn().mockReturnValue([]),
    getAllowedToolEntries: vi.fn().mockReturnValue([]),
    clearAll: vi.fn(),
    revokeSessionEntries: vi.fn().mockReturnValue(0),
  };
}

function createMockMetadataProvider(): SkillMetadataProvider {
  return {
    getRequiredTools: vi.fn().mockResolvedValue([]),
    getAccessPaths: vi.fn().mockResolvedValue([]),
  };
}

// =============================================================================
// テストスイート
// =============================================================================

describe("DefaultSafetyGate", () => {
  let mockPermissionStore: IPermissionStore;
  let mockMetadataProvider: SkillMetadataProvider;
  let gate: DefaultSafetyGate;

  beforeEach(() => {
    vi.resetAllMocks();

    mockPermissionStore = createMockPermissionStore();
    mockMetadataProvider = createMockMetadataProvider();

    gate = new DefaultSafetyGate({
      permissionStore: mockPermissionStore,
      metadataProvider: mockMetadataProvider,
      protectedPaths: ["/etc", "/usr/local/bin"],
    });
  });

  // ===========================================================================
  // CRITICAL_TOOL_REQUIRED
  // ===========================================================================

  describe("CRITICAL_TOOL_REQUIRED", () => {
    it("C-1: critical ツール1件 -> status: blocked, overallGrade: UNSAFE", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Bash", riskLevel: "critical" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      expect(result.overallGrade).toBe("UNSAFE");

      const criticalDetails = result.details.filter(
        (d) => d.checkId === "CRITICAL_TOOL_REQUIRED",
      );
      expect(criticalDetails).toHaveLength(1);
      expect(criticalDetails[0]).toMatchObject({
        checkId: "CRITICAL_TOOL_REQUIRED",
        toolName: "Bash",
        riskLevel: "critical",
        status: "blocked",
      });
      expect(criticalDetails[0].message).toBeTruthy();
    });

    it("C-2: critical ツール2件 -> 2件の blocked detail", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Bash", riskLevel: "critical" },
        { name: "Execute", riskLevel: "critical" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      expect(result.overallGrade).toBe("UNSAFE");

      const criticalDetails = result.details.filter(
        (d) => d.checkId === "CRITICAL_TOOL_REQUIRED",
      );
      expect(criticalDetails).toHaveLength(2);
      expect(criticalDetails[0].status).toBe("blocked");
      expect(criticalDetails[1].status).toBe("blocked");
      expect(criticalDetails[0].toolName).toBe("Bash");
      expect(criticalDetails[1].toolName).toBe("Execute");
    });

    it("C-3: critical ツール0件 -> CRITICAL detail なし", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Read", riskLevel: "low" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      const criticalDetails = result.details.filter(
        (d) => d.checkId === "CRITICAL_TOOL_REQUIRED",
      );
      expect(criticalDetails).toHaveLength(0);
    });
  });

  // ===========================================================================
  // HIGH_TOOL_REQUIRED
  // ===========================================================================

  describe("HIGH_TOOL_REQUIRED", () => {
    it("H-1: high ツール1件 -> status: warned", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Write", riskLevel: "high" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      const highDetails = result.details.filter(
        (d) => d.checkId === "HIGH_TOOL_REQUIRED",
      );
      expect(highDetails).toHaveLength(1);
      expect(highDetails[0]).toMatchObject({
        checkId: "HIGH_TOOL_REQUIRED",
        toolName: "Write",
        riskLevel: "high",
        status: "warned",
      });
      expect(highDetails[0].message).toBeTruthy();
    });

    it("H-2: high ツール0件 -> HIGH detail なし", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Read", riskLevel: "low" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      const highDetails = result.details.filter(
        (d) => d.checkId === "HIGH_TOOL_REQUIRED",
      );
      expect(highDetails).toHaveLength(0);
    });
  });

  // ===========================================================================
  // NO_PERMANENT_APPROVAL
  // ===========================================================================

  describe("NO_PERMANENT_APPROVAL", () => {
    it("N-1: medium ツール1件, isToolAllowed=false -> status: warned", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Edit", riskLevel: "medium" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);
      vi.mocked(mockPermissionStore.isToolAllowed).mockReturnValue(false);

      const result = await gate.evaluate("test-skill");

      const noApprovalDetails = result.details.filter(
        (d) => d.checkId === "NO_PERMANENT_APPROVAL",
      );
      expect(noApprovalDetails).toHaveLength(1);
      expect(noApprovalDetails[0]).toMatchObject({
        checkId: "NO_PERMANENT_APPROVAL",
        toolName: "Edit",
        riskLevel: "medium",
        status: "warned",
      });
      expect(noApprovalDetails[0].message).toBeTruthy();
    });

    it("N-2: medium ツール1件, isToolAllowed=true -> detail なし", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Edit", riskLevel: "medium" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);
      vi.mocked(mockPermissionStore.isToolAllowed).mockReturnValue(true);

      const result = await gate.evaluate("test-skill");

      const noApprovalDetails = result.details.filter(
        (d) => d.checkId === "NO_PERMANENT_APPROVAL",
      );
      expect(noApprovalDetails).toHaveLength(0);
    });

    it("N-3: low ツール1件, isToolAllowed=false -> status: warned", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Glob", riskLevel: "low" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);
      vi.mocked(mockPermissionStore.isToolAllowed).mockReturnValue(false);

      const result = await gate.evaluate("test-skill");

      const noApprovalDetails = result.details.filter(
        (d) => d.checkId === "NO_PERMANENT_APPROVAL",
      );
      expect(noApprovalDetails).toHaveLength(1);
      expect(noApprovalDetails[0]).toMatchObject({
        checkId: "NO_PERMANENT_APPROVAL",
        toolName: "Glob",
        riskLevel: "low",
        status: "warned",
      });
    });
  });

  // ===========================================================================
  // ALL_LOW_TOOLS
  // ===========================================================================

  describe("ALL_LOW_TOOLS", () => {
    it("L-1: 全ツールが low -> status: passed, checkId: ALL_LOW_TOOLS", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Read", riskLevel: "low" },
        { name: "Glob", riskLevel: "low" },
        { name: "Grep", riskLevel: "low" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      const allLowDetails = result.details.filter(
        (d) => d.checkId === "ALL_LOW_TOOLS",
      );
      expect(allLowDetails).toHaveLength(1);
      expect(allLowDetails[0]).toMatchObject({
        checkId: "ALL_LOW_TOOLS",
        status: "passed",
      });
    });

    it("L-2: low + medium 混在 -> ALL_LOW_TOOLS detail なし", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Read", riskLevel: "low" },
        { name: "Edit", riskLevel: "medium" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      const allLowDetails = result.details.filter(
        (d) => d.checkId === "ALL_LOW_TOOLS",
      );
      expect(allLowDetails).toHaveLength(0);
    });
  });

  // ===========================================================================
  // PROTECTED_PATH_ACCESS
  // ===========================================================================

  describe("PROTECTED_PATH_ACCESS", () => {
    beforeEach(() => {
      gate = new DefaultSafetyGate({
        permissionStore: mockPermissionStore,
        metadataProvider: mockMetadataProvider,
        protectedPaths: ["/etc"],
      });
    });

    it("P-1: /etc/passwd アクセス, protectedPaths=['/etc'] -> status: blocked", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([
        "/etc/passwd",
      ]);

      const result = await gate.evaluate("test-skill");

      const protectedDetails = result.details.filter(
        (d) => d.checkId === "PROTECTED_PATH_ACCESS" && d.status === "blocked",
      );
      expect(protectedDetails.length).toBeGreaterThanOrEqual(1);
      expect(protectedDetails[0]).toMatchObject({
        checkId: "PROTECTED_PATH_ACCESS",
        status: "blocked",
      });
      expect(protectedDetails[0].message).toContain("/etc/passwd");
    });

    it("P-2: /home/user アクセス, protectedPaths=['/etc'] -> blocked detail なし", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([
        "/home/user",
      ]);

      const result = await gate.evaluate("test-skill");

      const blockedProtected = result.details.filter(
        (d) => d.checkId === "PROTECTED_PATH_ACCESS" && d.status === "blocked",
      );
      expect(blockedProtected).toHaveLength(0);
    });

    it("P-3: 保護パスと完全一致 /etc -> status: blocked", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([
        "/etc",
      ]);

      const result = await gate.evaluate("test-skill");

      const protectedDetails = result.details.filter(
        (d) => d.checkId === "PROTECTED_PATH_ACCESS" && d.status === "blocked",
      );
      expect(protectedDetails).toHaveLength(1);
    });

    it("P-4: /etcfoo は /etc にマッチしない -> blocked detail なし", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([
        "/etcfoo",
      ]);

      const result = await gate.evaluate("test-skill");

      const blockedProtected = result.details.filter(
        (d) => d.checkId === "PROTECTED_PATH_ACCESS" && d.status === "blocked",
      );
      expect(blockedProtected).toHaveLength(0);
    });

    it("P-5: accessPaths 空配列 -> PROTECTED_PATH detail なし", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      const protectedDetails = result.details.filter(
        (d) => d.checkId === "PROTECTED_PATH_ACCESS",
      );
      expect(protectedDetails).toHaveLength(0);
    });

    it("P-6: 末尾スラッシュ付き protectedPaths でも正規化されてマッチする", async () => {
      const trailingSlashGate = new DefaultSafetyGate({
        permissionStore: mockPermissionStore,
        metadataProvider: mockMetadataProvider,
        protectedPaths: ["/etc/"],
      });

      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([
        "/etc/passwd",
      ]);

      const result = await trailingSlashGate.evaluate("test-skill");

      const protectedDetails = result.details.filter(
        (d) => d.checkId === "PROTECTED_PATH_ACCESS",
      );
      expect(protectedDetails).toHaveLength(1);
      expect(protectedDetails[0].status).toBe("blocked");
    });
  });

  // ===========================================================================
  // Grade Aggregation
  // ===========================================================================

  describe("Grade Aggregation", () => {
    it("G-1: blocked あり -> UNSAFE", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Bash", riskLevel: "critical" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      expect(result.overallGrade).toBe("UNSAFE");
    });

    it("G-2: warned のみ -> SAFE_WITH_WARNINGS", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Write", riskLevel: "high" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      expect(result.overallGrade).toBe("SAFE_WITH_WARNINGS");
    });

    it("G-3: 全 passed -> SAFE", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Read", riskLevel: "low" },
        { name: "Glob", riskLevel: "low" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);
      vi.mocked(mockPermissionStore.isToolAllowed).mockReturnValue(true);

      const result = await gate.evaluate("test-skill");

      expect(result.overallGrade).toBe("SAFE");
    });

    it("G-4: details 空（ツール0件 + パス0件） -> SAFE", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      expect(result.overallGrade).toBe("SAFE");
      expect(result.details).toHaveLength(0);
    });
  });

  // ===========================================================================
  // Error Cases
  // ===========================================================================

  describe("Error Cases", () => {
    it("R-1: evaluate が正しい skillName を metadataProvider に渡す", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      await gate.evaluate("my-custom-skill");

      expect(mockMetadataProvider.getRequiredTools).toHaveBeenCalledWith(
        "my-custom-skill",
      );
      expect(mockMetadataProvider.getAccessPaths).toHaveBeenCalledWith(
        "my-custom-skill",
      );
    });

    it("R-2: evaluatedAt が現在時刻に近い値", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([]);

      const before = Date.now();
      const result = await gate.evaluate("test-skill");
      const after = Date.now();

      expect(result.evaluatedAt).toBeGreaterThanOrEqual(before);
      expect(result.evaluatedAt).toBeLessThanOrEqual(after);
    });

    it("R-3: metadataProvider.getRequiredTools が reject -> SKILL_NOT_FOUND エラーを伝播", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockRejectedValue(
        new Error("SKILL_NOT_FOUND: skill 'unknown-skill' not found"),
      );

      await expect(gate.evaluate("unknown-skill")).rejects.toThrow(
        "SKILL_NOT_FOUND",
      );
    });

    it("R-4: metadataProvider.getAccessPaths が reject -> HISTORY_UNAVAILABLE エラーを伝播", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockRejectedValue(
        new Error("HISTORY_UNAVAILABLE: access history is unavailable"),
      );

      await expect(gate.evaluate("test-skill")).rejects.toThrow(
        "HISTORY_UNAVAILABLE",
      );
    });
  });

  // ===========================================================================
  // Result Structure
  // ===========================================================================

  describe("Result Structure", () => {
    it("evaluate 結果が SafetyGateResult の構造に準拠する", async () => {
      vi.mocked(mockMetadataProvider.getRequiredTools).mockResolvedValue([
        { name: "Bash", riskLevel: "critical" },
        { name: "Write", riskLevel: "high" },
        { name: "Edit", riskLevel: "medium" },
      ]);
      vi.mocked(mockMetadataProvider.getAccessPaths).mockResolvedValue([
        "/etc/config",
      ]);
      vi.mocked(mockPermissionStore.isToolAllowed).mockReturnValue(false);

      const result = await gate.evaluate("complex-skill");

      // 必須フィールドの存在確認
      expect(result).toHaveProperty("skillName", "complex-skill");
      expect(result).toHaveProperty("evaluatedAt");
      expect(typeof result.evaluatedAt).toBe("number");
      expect(result).toHaveProperty("overallGrade");
      expect(["SAFE", "SAFE_WITH_WARNINGS", "UNSAFE"]).toContain(
        result.overallGrade,
      );
      expect(result).toHaveProperty("details");
      expect(Array.isArray(result.details)).toBe(true);

      // 各 detail が SafetyCheckDetail 構造に準拠
      for (const detail of result.details) {
        expect(detail).toHaveProperty("checkId");
        expect(detail).toHaveProperty("toolName");
        expect(detail).toHaveProperty("riskLevel");
        expect(detail).toHaveProperty("status");
        expect(detail).toHaveProperty("message");
        expect(["passed", "warned", "blocked"]).toContain(detail.status);
      }
    });
  });
});
