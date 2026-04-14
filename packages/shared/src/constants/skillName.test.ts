import { describe, expect, it } from "vitest";
import { MAX_SKILL_NAME_LENGTH, SKILL_NAME_PATTERN } from "./skillName";

describe("skillName constants", () => {
  it("exports the expected maximum length", () => {
    expect(MAX_SKILL_NAME_LENGTH).toBe(64);
    expect(Number.isInteger(MAX_SKILL_NAME_LENGTH)).toBe(true);
  });

  describe("SKILL_NAME_PATTERN", () => {
    it("exports the expected regular expression source", () => {
      expect(SKILL_NAME_PATTERN).toBeInstanceOf(RegExp);
      expect(SKILL_NAME_PATTERN.source).toBe("^[a-z0-9]+(-[a-z0-9]+)*$");
    });

    it.each(["my-skill", "myskill", "my-skill-2"])(
      "matches valid name %s",
      (name) => {
        expect(SKILL_NAME_PATTERN.test(name)).toBe(true);
      },
    );

    it.each(["my_skill", "-my-skill", "my-skill-", "MY-SKILL", "", "スキル"])(
      "rejects invalid name %s",
      (name) => {
        expect(SKILL_NAME_PATTERN.test(name)).toBe(false);
      },
    );
  });
});
