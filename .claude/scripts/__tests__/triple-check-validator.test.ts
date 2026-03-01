import { describe, it, expect } from "vitest";
import {
  validateTripleCheck,
  type TripleCheckInput,
} from "../triple-check-validator";

describe("triple-check-validator", () => {
  // ================================================
  // 正常系: 全要素PASS
  // ================================================
  describe("全要素PASS", () => {
    it("TC-06: 三点突合3要素すべてPASSの場合にoverallStatus=PASSを返す", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: {
            total: 3,
            details: ["既存の課題A", "既存の課題B", "既存の課題C"],
          },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("PASS");
      expect(result.checks.artifacts.status).toBe("PASS");
      expect(result.checks.changelog.status).toBe("PASS");
      expect(result.checks.audit.status).toBe("PASS");
      expect(result.failedChecks).toHaveLength(0);
    });
  });

  // ================================================
  // 異常系: artifacts FAIL
  // ================================================
  describe("artifacts FAIL", () => {
    it("TC-02: artifacts.json が pending の場合にFAILする", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "pending",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.checks.artifacts.status).toBe("FAIL");
      expect(result.checks.artifacts.detail).toContain("pending");
      expect(result.failedChecks).toContain("artifacts");
    });
  });

  // ================================================
  // 異常系: changelog FAIL
  // ================================================
  describe("changelog FAIL", () => {
    it("TC-03: changelog が unsynced の場合にFAILする", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "unsynced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.checks.changelog.status).toBe("FAIL");
      expect(result.checks.changelog.detail).toContain("unsynced");
      expect(result.failedChecks).toContain("changelog");
    });
  });

  // ================================================
  // 異常系: audit FAIL
  // ================================================
  describe("audit FAIL", () => {
    it("audit の currentViolations.total > 0 の場合にFAILする", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 2, details: ["違反A", "違反B"] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.checks.audit.status).toBe("FAIL");
      expect(result.checks.audit.detail).toContain("2");
      expect(result.failedChecks).toContain("audit");
    });

    it("TC-04: audit の currentViolations.total === 0 の場合にPASSする", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: {
            total: 5,
            details: [
              "baseline1",
              "baseline2",
              "baseline3",
              "baseline4",
              "baseline5",
            ],
          },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.checks.audit.status).toBe("PASS");
    });
  });

  // ================================================
  // 部分一致パターン
  // ================================================
  describe("部分一致（2/3 PASS）", () => {
    it("artifacts のみ FAIL の場合に failedChecks に artifacts を含む", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "in-progress",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["artifacts"]);
    });

    it("changelog のみ FAIL の場合に failedChecks に changelog を含む", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "partial",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["changelog"]);
    });

    it("audit のみ FAIL の場合に failedChecks に audit を含む", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 1, details: ["新規違反"] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["audit"]);
    });
  });

  // ================================================
  // 全要素FAIL
  // ================================================
  describe("全要素FAIL", () => {
    it("3要素すべてFAILの場合に failedChecks に3要素を含む", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "pending",
        changelogPath: "unsynced",
        auditResult: {
          currentViolations: {
            total: 5,
            details: ["a", "b", "c", "d", "e"],
          },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toHaveLength(3);
      expect(result.failedChecks).toContain("artifacts");
      expect(result.failedChecks).toContain("changelog");
      expect(result.failedChecks).toContain("audit");
    });
  });

  // ================================================
  // baselineViolations は判定に影響しないことの確認
  // ================================================
  describe("baselineViolations の非影響", () => {
    it("baselineViolations.total > 0 でもcurrent=0ならauditはPASS", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: {
            total: 100,
            details: ["大量の既存課題"],
          },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("PASS");
      expect(result.checks.audit.status).toBe("PASS");
    });
  });

  // ================================================
  // Phase 6 追加: 全8パターン組み合わせテスト（TC-06-C1〜C8）
  // ================================================
  describe("Phase 6 追加: 三点突合 全8パターン組み合わせ", () => {
    it("TC-06-C1: PASS/PASS/PASS -> overallStatus=PASS, failedChecks=[]", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("PASS");
      expect(result.failedChecks).toEqual([]);
    });

    it("TC-06-C2: FAIL/PASS/PASS -> failedChecks=['artifacts']", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "pending",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["artifacts"]);
    });

    it("TC-06-C3: PASS/FAIL/PASS -> failedChecks=['changelog']", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "unsynced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["changelog"]);
    });

    it("TC-06-C4: PASS/PASS/FAIL -> failedChecks=['audit']", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 1, details: ["違反1"] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["audit"]);
    });

    it("TC-06-C5: FAIL/FAIL/PASS -> failedChecks=['artifacts', 'changelog']", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "pending",
        changelogPath: "unsynced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["artifacts", "changelog"]);
    });

    it("TC-06-C6: FAIL/PASS/FAIL -> failedChecks=['artifacts', 'audit']", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "pending",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 2, details: ["違反A", "違反B"] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["artifacts", "audit"]);
    });

    it("TC-06-C7: PASS/FAIL/FAIL -> failedChecks=['changelog', 'audit']", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "partial",
        auditResult: {
          currentViolations: { total: 3, details: ["v1", "v2", "v3"] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["changelog", "audit"]);
    });

    it("TC-06-C8: FAIL/FAIL/FAIL -> failedChecks=['artifacts', 'changelog', 'audit']", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "in-progress",
        changelogPath: "unsynced",
        auditResult: {
          currentViolations: { total: 10, details: ["大量違反"] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.failedChecks).toEqual(["artifacts", "changelog", "audit"]);
    });
  });

  // ================================================
  // Phase 6 追加: 境界値テスト
  // ================================================
  describe("Phase 6 追加: 境界値テスト", () => {
    it("auditResult.currentViolations.total が 0 の場合にauditはPASS", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 0, details: [] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.checks.audit.status).toBe("PASS");
    });

    it("auditResult.currentViolations.total が 1 の場合にauditはFAIL", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 1, details: ["境界値違反"] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.checks.audit.status).toBe("FAIL");
      expect(result.checks.audit.detail).toContain("1");
    });

    it("全3要素がFAILの場合にfailedChecksが正確に3要素を含む", () => {
      const input: TripleCheckInput = {
        artifactsJsonPath: "error",
        changelogPath: "error",
        auditResult: {
          currentViolations: { total: 99, details: ["致命的"] },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.failedChecks).toHaveLength(3);
      expect(result.failedChecks).toEqual(
        expect.arrayContaining(["artifacts", "changelog", "audit"]),
      );
    });

    it("auditResult が大量の details を含む場合も正しく処理する", () => {
      const largeDetails = Array.from(
        { length: 100 },
        (_, i) => `違反事項${i + 1}: 内容詳細`,
      );
      const input: TripleCheckInput = {
        artifactsJsonPath: "completed",
        changelogPath: "synced",
        auditResult: {
          currentViolations: { total: 100, details: largeDetails },
          baselineViolations: { total: 0, details: [] },
        },
      };
      const result = validateTripleCheck(input);
      expect(result.overallStatus).toBe("FAIL");
      expect(result.checks.audit.status).toBe("FAIL");
      expect(result.checks.audit.detail).toContain("100");
    });
  });
});
