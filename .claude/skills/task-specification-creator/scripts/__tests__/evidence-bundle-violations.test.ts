import { describe, it, expect } from "vitest";
import { evaluateViolations } from "../evidence-bundle-validator";

describe("evidence-bundle-violations", () => {
  // T4-09: currentViolations=0 かつ baseline>0 で合格判定になる
  it("T4-09: current=0, baseline=5 で pass 判定", () => {
    const result = evaluateViolations(0, 5);

    expect(result.verdict).toBe("pass");
    expect(result.currentViolations).toBe(0);
    expect(result.baseline).toBe(5);
  });

  // T4-10: currentViolations>0 で不合格判定になる
  it("T4-10: current=3, baseline=5 で fail 判定", () => {
    const result = evaluateViolations(3, 5);

    expect(result.verdict).toBe("fail");
    expect(result.currentViolations).toBe(3);
    expect(result.baseline).toBe(5);
  });

  // T4-11: current と baseline が別フィールドで記録される
  it("T4-11: currentViolations と baseline が独立したキーとして存在する", () => {
    const result = evaluateViolations(0, 10);

    expect(result).toHaveProperty("currentViolations");
    expect(result).toHaveProperty("baseline");
    expect(result).toHaveProperty("verdict");
    expect(result.currentViolations).not.toBe(result.baseline);
  });
});
