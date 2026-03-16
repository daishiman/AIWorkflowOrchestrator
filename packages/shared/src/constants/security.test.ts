// packages/shared/src/constants/security.test.ts
import { describe, it, expect } from "vitest";
import {
  TOOL_RISK_CONFIG,
  type RiskLevel,
  type ToolRiskConfigEntry,
} from "./security";

describe("TOOL_RISK_CONFIG", () => {
  describe("キー網羅性", () => {
    it("RiskLevel の全3キー（low / medium / high）が存在する", () => {
      const keys = Object.keys(TOOL_RISK_CONFIG);
      expect(keys).toContain("low");
      expect(keys).toContain("medium");
      expect(keys).toContain("high");
      expect(keys).toHaveLength(3);
    });
  });

  describe("dialogWidth 値検証", () => {
    it("low の dialogWidth は 400 である", () => {
      expect(TOOL_RISK_CONFIG.low.dialogWidth).toBe(400);
    });

    it("medium の dialogWidth は 480 である", () => {
      expect(TOOL_RISK_CONFIG.medium.dialogWidth).toBe(480);
    });

    it("high の dialogWidth は 640 である", () => {
      expect(TOOL_RISK_CONFIG.high.dialogWidth).toBe(640);
    });
  });

  describe("headerColorToken 形式検証", () => {
    it("全エントリの headerColorToken が '--risk-' プレフィックスを持つ", () => {
      const levels: RiskLevel[] = ["low", "medium", "high"];
      for (const level of levels) {
        expect(TOOL_RISK_CONFIG[level].headerColorToken).toMatch(/^--risk-/);
      }
    });
  });

  describe("セキュリティ不変条件（high リスク）", () => {
    it("high.allowPermanent は false である（恒久許可禁止）", () => {
      expect(TOOL_RISK_CONFIG.high.allowPermanent).toBe(false);
    });

    it("high.allowTime24h は false である（24時間許可禁止）", () => {
      expect(TOOL_RISK_CONFIG.high.allowTime24h).toBe(false);
    });

    it("high.allowTime7d は false である（7日間許可禁止）", () => {
      expect(TOOL_RISK_CONFIG.high.allowTime7d).toBe(false);
    });
  });

  describe("low / medium リスクの許可フラグ", () => {
    it("low と medium の全 allow フラグは true である", () => {
      const permissiveLevels: RiskLevel[] = ["low", "medium"];
      for (const level of permissiveLevels) {
        const entry = TOOL_RISK_CONFIG[level];
        expect(entry.allowPermanent).toBe(true);
        expect(entry.allowTime24h).toBe(true);
        expect(entry.allowTime7d).toBe(true);
      }
    });
  });

  // --- Phase 6: 補完テスト ---

  describe("定数の不変性", () => {
    it("TOOL_RISK_CONFIG の各エントリは ToolRiskConfigEntry の全フィールドを持つ", () => {
      const requiredFields: (keyof ToolRiskConfigEntry)[] = [
        "dialogWidth",
        "headerColorToken",
        "allowPermanent",
        "allowTime24h",
        "allowTime7d",
      ];
      const levels: RiskLevel[] = ["low", "medium", "high"];
      for (const level of levels) {
        for (const field of requiredFields) {
          expect(TOOL_RISK_CONFIG[level]).toHaveProperty(field);
        }
      }
    });

    it("dialogWidth は 400 / 480 / 640 のいずれかである", () => {
      const validWidths = [400, 480, 640] as const;
      const levels: RiskLevel[] = ["low", "medium", "high"];
      for (const level of levels) {
        expect(validWidths).toContain(TOOL_RISK_CONFIG[level].dialogWidth);
      }
    });

    it("headerColorToken は '--risk-low' / '--risk-medium' / '--risk-high' のいずれかである", () => {
      expect(TOOL_RISK_CONFIG.low.headerColorToken).toBe("--risk-low");
      expect(TOOL_RISK_CONFIG.medium.headerColorToken).toBe("--risk-medium");
      expect(TOOL_RISK_CONFIG.high.headerColorToken).toBe("--risk-high");
    });
  });

  describe("Object.freeze による不変性", () => {
    it("TOOL_RISK_CONFIG のトップレベルプロパティは凍結されている", () => {
      expect(Object.isFrozen(TOOL_RISK_CONFIG)).toBe(true);
    });

    it("各エントリも個別に凍結されている", () => {
      const levels: RiskLevel[] = ["low", "medium", "high"];
      for (const level of levels) {
        expect(Object.isFrozen(TOOL_RISK_CONFIG[level])).toBe(true);
      }
    });
  });

  describe("dialogWidth の順序性", () => {
    it("dialogWidth はリスクレベルに比例して大きくなる（low < medium < high）", () => {
      expect(TOOL_RISK_CONFIG.low.dialogWidth).toBeLessThan(
        TOOL_RISK_CONFIG.medium.dialogWidth,
      );
      expect(TOOL_RISK_CONFIG.medium.dialogWidth).toBeLessThan(
        TOOL_RISK_CONFIG.high.dialogWidth,
      );
    });
  });

  describe("インデックスアクセスの動作", () => {
    it("RiskLevel 型でインデックスアクセスした結果は undefined でない", () => {
      const levels: RiskLevel[] = ["low", "medium", "high"];
      for (const level of levels) {
        expect(TOOL_RISK_CONFIG[level]).toBeDefined();
      }
    });

    it("dialogWidth は数値型である", () => {
      const levels: RiskLevel[] = ["low", "medium", "high"];
      for (const level of levels) {
        expect(typeof TOOL_RISK_CONFIG[level].dialogWidth).toBe("number");
      }
    });

    it("headerColorToken は文字列型である", () => {
      const levels: RiskLevel[] = ["low", "medium", "high"];
      for (const level of levels) {
        expect(typeof TOOL_RISK_CONFIG[level].headerColorToken).toBe("string");
      }
    });
  });
});
