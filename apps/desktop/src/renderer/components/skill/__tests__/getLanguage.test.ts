import { describe, expect, it } from "vitest";
import { getLanguage } from "../SkillEditor";

describe("getLanguage", () => {
  it("拡張子から言語を推定できる", () => {
    expect(getLanguage("index.ts")).toBe("typescript");
    expect(getLanguage("main.js")).toBe("javascript");
    expect(getLanguage("SKILL.md")).toBe("markdown");
    expect(getLanguage("config.json")).toBe("json");
    expect(getLanguage("data.yaml")).toBe("yaml");
    expect(getLanguage("setup.sh")).toBe("shell");
  });

  it("未対応拡張子は plaintext を返す", () => {
    expect(getLanguage("Makefile")).toBe("plaintext");
    expect(getLanguage("archive.xyz")).toBe("plaintext");
    expect(getLanguage(".gitignore")).toBe("plaintext");
  });

  it("大文字拡張子にも対応する", () => {
    expect(getLanguage("README.MD")).toBe("markdown");
  });
});
