import { describe, expect, it } from "vitest";
import { formatVerifyChecksAsFeedback } from "../formatVerifyChecksAsFeedback";
import type { RuntimeSkillCreatorVerifyCheck } from "@repo/shared/types";

describe("formatVerifyChecksAsFeedback", () => {
  it("error のみのチェックをフォーマットする", () => {
    const checks: RuntimeSkillCreatorVerifyCheck[] = [
      {
        id: "L1-001",
        layer: "layer1",
        severity: "error",
        summary: "SKILL.md が存在しません",
      },
    ];
    const result = formatVerifyChecksAsFeedback(checks);
    expect(result).toContain("[ERROR] L1-001: SKILL.md が存在しません");
    expect(result).toContain("以下の検証チェックに失敗しました");
  });

  it("warning のみのチェックをフォーマットする", () => {
    const checks: RuntimeSkillCreatorVerifyCheck[] = [
      {
        id: "L1-004",
        layer: "layer1",
        severity: "warning",
        summary: "references/ が見つかりません",
      },
    ];
    const result = formatVerifyChecksAsFeedback(checks);
    expect(result).toContain("[WARNING] L1-004: references/ が見つかりません");
  });

  it("error と warning を混在させた場合、error が先に表示される", () => {
    const checks: RuntimeSkillCreatorVerifyCheck[] = [
      {
        id: "L1-004",
        layer: "layer1",
        severity: "warning",
        summary: "references/ が見つかりません",
      },
      {
        id: "L1-001",
        layer: "layer1",
        severity: "error",
        summary: "SKILL.md が存在しません",
      },
    ];
    const result = formatVerifyChecksAsFeedback(checks);
    const errorIndex = result.indexOf("[ERROR]");
    const warningIndex = result.indexOf("[WARNING]");
    expect(errorIndex).toBeLessThan(warningIndex);
  });

  it("全チェック info（PASS）の場合は空文字列を返す", () => {
    const checks: RuntimeSkillCreatorVerifyCheck[] = [
      {
        id: "L1-001",
        layer: "layer1",
        severity: "info",
        summary: "OK",
      },
    ];
    const result = formatVerifyChecksAsFeedback(checks);
    expect(result).toBe("");
  });

  it("空配列の場合は空文字列を返す", () => {
    const result = formatVerifyChecksAsFeedback([]);
    expect(result).toBe("");
  });
});
