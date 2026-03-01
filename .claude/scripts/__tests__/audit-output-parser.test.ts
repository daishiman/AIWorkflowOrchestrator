import { describe, it, expect } from "vitest";
import {
  parseAuditOutput,
  evaluateAuditResult,
  type AuditResult,
} from "../audit-output-parser";

describe("audit-output-parser", () => {
  // ================================================
  // parseAuditOutput: 正常系
  // ================================================
  describe("parseAuditOutput - 正常系", () => {
    it("正常なJSON出力をパースする", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: 0, details: [] },
        baselineViolations: { total: 3, details: ["a", "b", "c"] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result!.currentViolations.total).toBe(0);
      expect(result.result!.currentViolations.details).toHaveLength(0);
      expect(result.result!.baselineViolations.total).toBe(3);
      expect(result.result!.baselineViolations.details).toHaveLength(3);
    });

    it("baselineViolationsが存在しない場合はエラーを返す（必須フィールド）", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: 2, details: ["x", "y"] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("baselineViolations");
    });

    it("currentViolations.total が 0 の場合に正しくパースする", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: 0, details: [] },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(true);
      expect(result.result!.currentViolations.total).toBe(0);
    });

    it("currentViolations.total が正の値の場合に正しくパースする", () => {
      const stdout = JSON.stringify({
        currentViolations: {
          total: 5,
          details: ["違反1", "違反2", "違反3", "違反4", "違反5"],
        },
        baselineViolations: { total: 1, details: ["既存"] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(true);
      expect(result.result!.currentViolations.total).toBe(5);
      expect(result.result!.currentViolations.details).toHaveLength(5);
    });
  });

  // ================================================
  // parseAuditOutput: 異常系 - 不正なJSON
  // ================================================
  describe("parseAuditOutput - 不正なJSON", () => {
    it("不正なJSON文字列の場合にエラーを返す", () => {
      const result = parseAuditOutput("not a json");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("JSON");
    });

    it("空文字列の場合にエラーを返す", () => {
      const result = parseAuditOutput("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("空");
    });

    it("空白のみの場合にエラーを返す", () => {
      const result = parseAuditOutput("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("JSON配列の場合にエラーを返す", () => {
      const result = parseAuditOutput("[1, 2, 3]");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("オブジェクト");
    });
  });

  // ================================================
  // parseAuditOutput: 異常系 - フィールド不足
  // ================================================
  describe("parseAuditOutput - フィールド不足", () => {
    it("currentViolationsフィールドが存在しない場合にエラーを返す", () => {
      const stdout = JSON.stringify({
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("currentViolations");
    });

    it("currentViolations.totalが数値でない場合にエラーを返す", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: "not-a-number", details: [] },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("整数");
    });

    it("currentViolations.totalが負の値の場合にエラーを返す", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: -1, details: [] },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("0以上");
    });

    it("currentViolationsがオブジェクト型でない場合にエラーを返す", () => {
      const stdout = JSON.stringify({
        currentViolations: "invalid",
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("オブジェクト");
    });
  });

  // ================================================
  // parseAuditOutput: detailsの欠落時の挙動
  // ================================================
  describe("parseAuditOutput - details の処理", () => {
    it("currentViolations.detailsが存在しない場合はエラーを返す（配列必須）", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: 0 },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("details");
      expect(result.error).toContain("配列");
    });
  });

  // ================================================
  // evaluateAuditResult: PASS/FAIL 判定
  // ================================================
  describe("evaluateAuditResult", () => {
    it("currentViolations.total === 0 の場合にPASSを返す", () => {
      const auditResult: AuditResult = {
        currentViolations: { total: 0, details: [] },
        baselineViolations: {
          total: 5,
          details: ["a", "b", "c", "d", "e"],
        },
      };
      const result = evaluateAuditResult(auditResult);
      expect(result.status).toBe("PASS");
      expect(result.message).toContain("0");
    });

    it("currentViolations.total > 0 の場合にFAILを返す", () => {
      const auditResult: AuditResult = {
        currentViolations: { total: 2, details: ["違反X", "違反Y"] },
        baselineViolations: { total: 0, details: [] },
      };
      const result = evaluateAuditResult(auditResult);
      expect(result.status).toBe("FAIL");
      expect(result.message).toContain("2");
    });

    it("FAILの場合にdetails内容がmessageに含まれる", () => {
      const auditResult: AuditResult = {
        currentViolations: {
          total: 1,
          details: ["LOGS.mdの更新漏れ"],
        },
        baselineViolations: { total: 0, details: [] },
      };
      const result = evaluateAuditResult(auditResult);
      expect(result.status).toBe("FAIL");
      expect(result.message).toContain("LOGS.mdの更新漏れ");
    });

    it("baselineViolationsはPASS/FAIL判定に影響しない", () => {
      const auditResult: AuditResult = {
        currentViolations: { total: 0, details: [] },
        baselineViolations: {
          total: 100,
          details: ["大量の既存課題"],
        },
      };
      const result = evaluateAuditResult(auditResult);
      expect(result.status).toBe("PASS");
    });

    it("detailsが空でもFAIL判定できる", () => {
      const auditResult: AuditResult = {
        currentViolations: { total: 3, details: [] },
        baselineViolations: { total: 0, details: [] },
      };
      const result = evaluateAuditResult(auditResult);
      expect(result.status).toBe("FAIL");
      expect(result.message).toContain("3");
    });

    it("baselineViolations.total > 0 かつ current=0 の場合にPASSしbaselineの注釈を含む", () => {
      const auditResult: AuditResult = {
        currentViolations: { total: 0, details: [] },
        baselineViolations: { total: 7, details: ["既存1"] },
      };
      const result = evaluateAuditResult(auditResult);
      expect(result.status).toBe("PASS");
      expect(result.message).toContain("baseline");
      expect(result.message).toContain("7");
    });

    it("baseline.total === 0 の場合にbaseline注釈が含まれない", () => {
      const auditResult: AuditResult = {
        currentViolations: { total: 0, details: [] },
        baselineViolations: { total: 0, details: [] },
      };
      const result = evaluateAuditResult(auditResult);
      expect(result.status).toBe("PASS");
      expect(result.message).not.toContain("baseline");
    });
  });

  // ================================================
  // Phase 6 追加: 異常系テスト（TC-04-D1〜D8）
  // ================================================
  describe("Phase 6 追加: parseAuditOutput 異常系・境界値", () => {
    it("TC-04-D1: 正常なJSON（current=0）の場合にPASSする", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: 0, details: [] },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result!.currentViolations.total).toBe(0);
    });

    it("TC-04-D2: 正常なJSON（current>0）の場合にパースは成功しevaluateでFAILとなる", () => {
      const stdout = JSON.stringify({
        currentViolations: {
          total: 3,
          details: ["違反1", "違反2", "違反3"],
        },
        baselineViolations: { total: 0, details: [] },
      });
      const parseResult = parseAuditOutput(stdout);
      expect(parseResult.isValid).toBe(true);
      const evalResult = evaluateAuditResult(parseResult.result!);
      expect(evalResult.status).toBe("FAIL");
      expect(evalResult.message).toContain("3");
    });

    it("TC-04-D3: 不正なJSON文字列の場合にParseErrorを返す", () => {
      const result = parseAuditOutput("not json");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("JSON");
    });

    it("TC-04-D4: currentViolationsフィールド欠損の場合にParseErrorを返す", () => {
      const stdout = JSON.stringify({
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("currentViolations");
    });

    it("TC-04-D5: total が文字列（'abc'）の場合にParseErrorを返す", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: "abc", details: [] },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("整数");
    });

    it("TC-04-D6: total が負の数値（-1）の場合にParseErrorを返す", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: -1, details: [] },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("0以上");
    });

    it("TC-04-D7: 空文字列の場合にParseErrorを返す", () => {
      const result = parseAuditOutput("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("TC-04-D8: baseline情報付き正常JSONの場合にPASSする（currentのみで判定）", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: 0, details: [] },
        baselineViolations: {
          total: 5,
          details: ["b1", "b2", "b3", "b4", "b5"],
        },
      });
      const parseResult = parseAuditOutput(stdout);
      expect(parseResult.isValid).toBe(true);
      const evalResult = evaluateAuditResult(parseResult.result!);
      expect(evalResult.status).toBe("PASS");
    });
  });

  describe("Phase 6 追加: 追加の異常系テスト", () => {
    it("空白文字列のみの入力（' \\n\\t '）の場合にエラーを返す", () => {
      const result = parseAuditOutput(" \n\t ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("JSONが配列の場合（[1,2,3]）にエラーを返す", () => {
      const result = parseAuditOutput("[1,2,3]");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("オブジェクト");
    });

    it("totalが小数の場合（0.5）にエラーを返す", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: 0.5, details: [] },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("整数");
    });

    it("totalが非数値（'abc'）の場合にエラーを返す", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: "abc", details: [] },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("整数");
    });

    it("detailsに非文字列要素が混在する場合に文字列のみフィルタリングする", () => {
      const stdout = JSON.stringify({
        currentViolations: {
          total: 3,
          details: ["有効な文字列", 123, null, "別の有効な文字列", true],
        },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(true);
      expect(result.result!.currentViolations.details).toEqual([
        "有効な文字列",
        "別の有効な文字列",
      ]);
    });

    it("非常に大きなtotal値（999999）の場合も正しく処理する", () => {
      const stdout = JSON.stringify({
        currentViolations: { total: 999999, details: [] },
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(true);
      expect(result.result!.currentViolations.total).toBe(999999);
      const evalResult = evaluateAuditResult(result.result!);
      expect(evalResult.status).toBe("FAIL");
    });

    it("currentViolationsがnullの場合にエラーを返す", () => {
      const stdout = JSON.stringify({
        currentViolations: null,
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("currentViolations");
    });

    it("currentViolationsが配列の場合にエラーを返す", () => {
      const stdout = JSON.stringify({
        currentViolations: [1, 2, 3],
        baselineViolations: { total: 0, details: [] },
      });
      const result = parseAuditOutput(stdout);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("currentViolations");
    });
  });
});
