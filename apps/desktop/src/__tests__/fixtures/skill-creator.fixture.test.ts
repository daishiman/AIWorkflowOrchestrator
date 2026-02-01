/**
 * Skill-Creator Fixture Validation Tests
 *
 * TASK-8C-F: skill-creator出力フィクスチャの検証テスト
 * フィクスチャファイルの存在・構造・検証スクリプトとの統合を検証する。
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { execSync } from "child_process";

const FIXTURES_DIR = path.join(
  __dirname,
  "..",
  "__fixtures__",
  "skill-creator",
);
const SKILL_RUNNER_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
  ".claude",
  "skills",
  "skill-fixture-runner",
);

const fixturePath = (...segments: string[]) =>
  path.join(FIXTURES_DIR, ...segments);

const runnerScriptPath = (...segments: string[]) =>
  path.join(SKILL_RUNNER_DIR, ...segments);

/** YAML Frontmatter をパースするヘルパー */
const parseFrontmatter = (content: string) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const raw = match[1];
  const result: Record<string, unknown> = {};
  const lines = raw.split(/\r?\n/);
  let currentKey = "";
  let currentArray: string[] | null = null;

  for (const line of lines) {
    if (line.match(/^\s*-\s+/)) {
      if (currentArray !== null) {
        currentArray.push(line.replace(/^\s*-\s+/, "").trim());
      }
      continue;
    }
    if (currentArray !== null) {
      result[currentKey] = currentArray;
      currentArray = null;
    }
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      if (value === "" || value === "|") {
        currentKey = key;
        currentArray = [];
      } else {
        result[key] = value;
      }
    }
  }
  if (currentArray !== null) {
    result[currentKey] = currentArray;
  }
  return result;
};

/** ファイル存在チェックヘルパー */
const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/** ディレクトリ存在チェックヘルパー */
const dirExists = async (dirPath: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
};

/** 検証スクリプト実行ヘルパー（非ゼロ終了コード対応） */
const runValidationScript = (command: string): string => {
  try {
    return execSync(command, { encoding: "utf-8" });
  } catch (err: unknown) {
    const execErr = err as { stdout?: string };
    return execErr.stdout ?? "";
  }
};

/** 検証スクリプトのJSON出力をパースするヘルパー */
const parseValidationOutput = (stdout: string): Record<string, unknown> => {
  return JSON.parse(stdout.trim()) as Record<string, unknown>;
};

/** コマンド実行のEXIT_CODEを取得するヘルパー */
const getExitCode = (command: string): number => {
  try {
    execSync(command, { encoding: "utf-8" });
    return 0;
  } catch (err: unknown) {
    const execErr = err as { status?: number };
    return execErr.status ?? 1;
  }
};

// ========================================
// complete-skill フィクスチャテスト
// ========================================
describe("Skill-Creator Fixture: complete-skill", () => {
  // TC-001: complete-skill/SKILL.md が存在する
  it("TC-001: complete-skill/SKILL.md should exist", async () => {
    expect(await fileExists(fixturePath("complete-skill", "SKILL.md"))).toBe(
      true,
    );
  });

  // TC-002: complete-skill/SKILL.md の YAML Frontmatter に name, description, allowed-tools が存在する
  it("TC-002: complete-skill/SKILL.md should have valid YAML frontmatter with required fields", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "SKILL.md"),
      "utf-8",
    );
    expect(content).toMatch(/^---\r?\n[\s\S]*?\r?\n---/);
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(fm!["name"]).toBeDefined();
    expect(fm!["description"]).toBeDefined();
    expect(fm!["allowed-tools"]).toBeDefined();
  });

  // TC-003: complete-skill/package.json が存在し、valid JSON である
  it("TC-003: complete-skill/package.json should exist and be valid JSON", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "package.json"),
      "utf-8",
    );
    const pkg = JSON.parse(content);
    expect(pkg.name).toBeDefined();
    expect(pkg.version).toBeDefined();
  });

  // TC-004: complete-skill/EVALS.json が存在し、skill_name フィールドを持つ
  it("TC-004: complete-skill/EVALS.json should exist and have skill_name", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "EVALS.json"),
      "utf-8",
    );
    const evals = JSON.parse(content);
    expect(evals.skill_name).toBeDefined();
  });

  // TC-005: complete-skill/agents/ ディレクトリが存在し、.md ファイルを含む
  it("TC-005: complete-skill/agents/ should exist and contain .md files", async () => {
    const agentsDir = fixturePath("complete-skill", "agents");
    expect(await dirExists(agentsDir)).toBe(true);
    const files = await fs.readdir(agentsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    expect(mdFiles.length).toBeGreaterThanOrEqual(1);
  });

  // TC-006: complete-skill/agents/analyze-request.md に TASK_TITLE セクションが存在する
  it("TC-006: analyze-request.md should contain TASK_TITLE section", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "agents", "analyze-request.md"),
      "utf-8",
    );
    expect(content).toContain("TASK_TITLE");
  });

  // TC-007: complete-skill/references/ ディレクトリが存在し、.md ファイルを含む
  it("TC-007: complete-skill/references/ should exist and contain .md files", async () => {
    const refsDir = fixturePath("complete-skill", "references");
    expect(await dirExists(refsDir)).toBe(true);
    const files = await fs.readdir(refsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    expect(mdFiles.length).toBeGreaterThanOrEqual(1);
  });

  // TC-008: complete-skill/scripts/ ディレクトリが存在し、.js ファイルを含む
  it("TC-008: complete-skill/scripts/ should exist and contain .js files", async () => {
    const scriptsDir = fixturePath("complete-skill", "scripts");
    expect(await dirExists(scriptsDir)).toBe(true);
    const files = await fs.readdir(scriptsDir);
    const jsFiles = files.filter((f) => f.endsWith(".js"));
    expect(jsFiles.length).toBeGreaterThanOrEqual(1);
  });

  // TC-009: complete-skill/scripts/utils.js に EXIT_CODES が定義されている
  it("TC-009: scripts/utils.js should define EXIT_CODES", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "scripts", "utils.js"),
      "utf-8",
    );
    expect(content).toContain("EXIT_CODES");
  });

  // TC-010: complete-skill/assets/ ディレクトリが存在する
  it("TC-010: complete-skill/assets/ should exist", async () => {
    expect(await dirExists(fixturePath("complete-skill", "assets"))).toBe(true);
  });

  // TC-011: complete-skill/schemas/ ディレクトリが存在し、.json ファイルを含む
  it("TC-011: complete-skill/schemas/ should exist and contain .json files", async () => {
    const schemasDir = fixturePath("complete-skill", "schemas");
    expect(await dirExists(schemasDir)).toBe(true);
    const files = await fs.readdir(schemasDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    expect(jsonFiles.length).toBeGreaterThanOrEqual(1);
  });

  // TC-012: complete-skill/schemas/agent-definition.json が valid JSON Schema である
  it("TC-012: schemas/agent-definition.json should be valid JSON Schema", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "schemas", "agent-definition.json"),
      "utf-8",
    );
    const schema = JSON.parse(content);
    expect(schema.$schema).toContain("json-schema.org");
    expect(schema.type).toBeDefined();
  });
});

// ========================================
// minimal-skill フィクスチャテスト
// ========================================
describe("Skill-Creator Fixture: minimal-skill", () => {
  // TC-013: minimal-skill/SKILL.md が存在する
  it("TC-013: minimal-skill/SKILL.md should exist", async () => {
    expect(await fileExists(fixturePath("minimal-skill", "SKILL.md"))).toBe(
      true,
    );
  });

  // TC-014: minimal-skill/SKILL.md の YAML Frontmatter が正しい
  it("TC-014: minimal-skill/SKILL.md should have valid YAML frontmatter", async () => {
    const content = await fs.readFile(
      fixturePath("minimal-skill", "SKILL.md"),
      "utf-8",
    );
    expect(content).toMatch(/^---\r?\n[\s\S]*?\r?\n---/);
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(fm!["name"]).toBe("fixture-minimal-skill");
  });

  // TC-015: minimal-skill/ に agents/, references/, scripts/ ディレクトリが存在しない
  it("TC-015: minimal-skill should not have agents/, references/, scripts/", async () => {
    expect(await dirExists(fixturePath("minimal-skill", "agents"))).toBe(false);
    expect(await dirExists(fixturePath("minimal-skill", "references"))).toBe(
      false,
    );
    expect(await dirExists(fixturePath("minimal-skill", "scripts"))).toBe(
      false,
    );
  });
});

// ========================================
// partial-skill フィクスチャテスト
// ========================================
describe("Skill-Creator Fixture: partial-skill", () => {
  // TC-016: partial-skill/SKILL.md が存在する
  it("TC-016: partial-skill/SKILL.md should exist", async () => {
    expect(await fileExists(fixturePath("partial-skill", "SKILL.md"))).toBe(
      true,
    );
  });

  // TC-017: partial-skill/agents/ ディレクトリが存在する
  it("TC-017: partial-skill/agents/ should exist", async () => {
    expect(await dirExists(fixturePath("partial-skill", "agents"))).toBe(true);
  });

  // TC-018: partial-skill/agents/single-agent.md が存在する
  it("TC-018: partial-skill/agents/single-agent.md should exist", async () => {
    expect(
      await fileExists(
        fixturePath("partial-skill", "agents", "single-agent.md"),
      ),
    ).toBe(true);
  });

  // TC-019: partial-skill/ に references/, scripts/, assets/, schemas/ が存在しない
  it("TC-019: partial-skill should not have references/, scripts/, assets/, schemas/", async () => {
    expect(await dirExists(fixturePath("partial-skill", "references"))).toBe(
      false,
    );
    expect(await dirExists(fixturePath("partial-skill", "scripts"))).toBe(
      false,
    );
    expect(await dirExists(fixturePath("partial-skill", "assets"))).toBe(false);
    expect(await dirExists(fixturePath("partial-skill", "schemas"))).toBe(
      false,
    );
  });
});

// ========================================
// invalid-skill フィクスチャテスト
// ========================================
describe("Skill-Creator Fixture: invalid-skill", () => {
  // TC-020: invalid-skill/SKILL.md が存在する
  it("TC-020: invalid-skill/SKILL.md should exist", async () => {
    expect(await fileExists(fixturePath("invalid-skill", "SKILL.md"))).toBe(
      true,
    );
  });

  // TC-021: invalid-skill/SKILL.md の YAML Frontmatter がパース時に問題を検出する
  it("TC-021: invalid-skill/SKILL.md should have problematic frontmatter", async () => {
    const content = await fs.readFile(
      fixturePath("invalid-skill", "SKILL.md"),
      "utf-8",
    );
    expect(content).toMatch(/^---\r?\n[\s\S]*?\r?\n---/);
    const fm = parseFrontmatter(content);
    // allowed-tools が配列でないことを確認
    if (fm && fm["allowed-tools"]) {
      const tools = fm["allowed-tools"];
      expect(Array.isArray(tools) && tools.length > 0).toBe(false);
    }
  });
});

// ========================================
// orchestration-skill フィクスチャテスト
// ========================================
describe("Skill-Creator Fixture: orchestration-skill", () => {
  // TC-022: orchestration-skill/SKILL.md が存在する
  it("TC-022: orchestration-skill/SKILL.md should exist", async () => {
    expect(
      await fileExists(fixturePath("orchestration-skill", "SKILL.md")),
    ).toBe(true);
  });

  // TC-023: orchestration-skill/assets/chain-config.yaml が存在し、パース可能である
  it("TC-023: chain-config.yaml should exist and be parseable", async () => {
    const filePath = fixturePath(
      "orchestration-skill",
      "assets",
      "chain-config.yaml",
    );
    expect(await fileExists(filePath)).toBe(true);
    const content = await fs.readFile(filePath, "utf-8");
    // YAML の基本構造確認（steps キーが存在する）
    expect(content).toContain("steps:");
  });

  // TC-024: orchestration-skill/assets/parallel-config.yaml が存在し、パース可能である
  it("TC-024: parallel-config.yaml should exist and be parseable", async () => {
    const filePath = fixturePath(
      "orchestration-skill",
      "assets",
      "parallel-config.yaml",
    );
    expect(await fileExists(filePath)).toBe(true);
    const content = await fs.readFile(filePath, "utf-8");
    // YAML の基本構造確認（tasks キーが存在する）
    expect(content).toContain("tasks:");
    expect(content).toContain("result_aggregation:");
  });
});

// ========================================
// 検証スクリプトテスト
// ========================================
describe("Validation Scripts", () => {
  // TC-025: validate-skill-structure.js が complete-skill を valid と判定する
  it("TC-025: validate-skill-structure.js should validate complete-skill", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")} --target ${fixturePath("complete-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed.valid).toBe(true);
  });

  // TC-026: validate-skill-structure.js が invalid-skill でもstructure自体はvalidと判定する（SKILL.mdが存在するため）
  it("TC-026: validate-skill-structure.js should validate invalid-skill structure", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")} --target ${fixturePath("invalid-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    // invalid-skill もSKILL.mdは存在するのでstructure自体はvalid
    expect(parsed.valid).toBe(true);
  });

  // TC-027: validate-skill-md.js が complete-skill/SKILL.md を valid と判定する
  it("TC-027: validate-skill-md.js should validate complete-skill/SKILL.md", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("complete-skill", "SKILL.md")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed.valid).toBe(true);
  });

  // TC-028: validate-skill-md.js が invalid-skill/SKILL.md でエラーを返す
  it("TC-028: validate-skill-md.js should return errors for invalid-skill/SKILL.md", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("invalid-skill", "SKILL.md")}`,
    );
    const parsed = JSON.parse(output);
    expect(parsed.valid).toBe(false);
    expect(parsed.errors.length).toBeGreaterThan(0);
  });

  // TC-029: validate-agents.js が complete-skill/agents/ を valid と判定する
  it("TC-029: validate-agents.js should validate complete-skill/agents/", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-agents.js")} --target ${fixturePath("complete-skill", "agents")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed.valid).toBe(true);
  });

  // TC-030: validate-schemas.js が complete-skill/schemas/ を valid と判定する
  it("TC-030: validate-schemas.js should validate complete-skill/schemas/", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-schemas.js")} --target ${fixturePath("complete-skill", "schemas")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed.valid).toBe(true);
  });

  // TC-031: run-all-validations.js が complete-skill に対して全検証をパスする
  it("TC-031: run-all-validations.js should pass for complete-skill", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "run-all-validations.js")} --target ${fixturePath("complete-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed.overall).toBe(true);
  });

  // TC-032: run-all-validations.js が invalid-skill に対してエラーを含む結果を返す
  it("TC-032: run-all-validations.js should return errors for invalid-skill", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "run-all-validations.js")} --target ${fixturePath("invalid-skill")}`,
    );
    const parsed = JSON.parse(output);
    expect(parsed.overall).toBe(false);
  });
});

// ========================================
// skill-fixture-runner スキル構造テスト
// ========================================
describe("skill-fixture-runner Skill", () => {
  // TC-033: skill-fixture-runner/SKILL.md が存在する
  it("TC-033: skill-fixture-runner/SKILL.md should exist", async () => {
    expect(await fileExists(path.join(SKILL_RUNNER_DIR, "SKILL.md"))).toBe(
      true,
    );
  });

  // TC-034: skill-fixture-runner/SKILL.md の YAML Frontmatter が正しい
  it("TC-034: skill-fixture-runner/SKILL.md should have valid frontmatter", async () => {
    const content = await fs.readFile(
      path.join(SKILL_RUNNER_DIR, "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(fm!["name"]).toBe("skill-fixture-runner");
  });

  // TC-035: skill-fixture-runner/scripts/ ディレクトリが存在する
  it("TC-035: skill-fixture-runner/scripts/ should exist", async () => {
    expect(await dirExists(path.join(SKILL_RUNNER_DIR, "scripts"))).toBe(true);
  });

  // TC-036: skill-fixture-runner/scripts/run-all-validations.js が存在する
  it("TC-036: run-all-validations.js should exist", async () => {
    expect(
      await fileExists(runnerScriptPath("scripts", "run-all-validations.js")),
    ).toBe(true);
  });

  // TC-037: skill-fixture-runner/EVALS.json が存在する
  it("TC-037: skill-fixture-runner/EVALS.json should exist", async () => {
    expect(await fileExists(path.join(SKILL_RUNNER_DIR, "EVALS.json"))).toBe(
      true,
    );
  });
});

// ========================================
// YAML Frontmatter 詳細検証テスト
// ========================================
describe("YAML Frontmatter Detailed Validation", () => {
  // TC-038: complete-skill/SKILL.md の version フィールドが semver 形式である
  it("TC-038: complete-skill/SKILL.md version should be semver format", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(fm!["version"]).toMatch(/^\d+\.\d+\.\d+$/);
  });

  // TC-039: complete-skill/SKILL.md の allowed-tools が配列である
  it("TC-039: complete-skill/SKILL.md allowed-tools should be an array", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(Array.isArray(fm!["allowed-tools"])).toBe(true);
  });

  // TC-040: complete-skill/SKILL.md の allowed-tools の各要素が文字列である
  it("TC-040: complete-skill/SKILL.md allowed-tools elements should be strings", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    const tools = fm!["allowed-tools"] as string[];
    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) {
      expect(typeof tool).toBe("string");
    }
  });

  // TC-041: minimal-skill/SKILL.md の name フィールドが kebab-case である
  it("TC-041: minimal-skill/SKILL.md name should be kebab-case", async () => {
    const content = await fs.readFile(
      fixturePath("minimal-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(fm!["name"]).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
  });

  // TC-042: invalid-skill/SKILL.md のパースで具体的なエラーメッセージが返される
  it("TC-042: invalid-skill/SKILL.md should produce specific error messages via validate-skill-md.js", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("invalid-skill", "SKILL.md")}`,
    );
    const parsed = JSON.parse(output);
    expect(parsed.valid).toBe(false);
    expect(parsed.errors.length).toBeGreaterThan(0);
    for (const error of parsed.errors) {
      expect(error.length).toBeGreaterThan(0);
    }
  });
});

// ========================================
// エージェント仕様書フォーマット詳細テスト
// ========================================
describe("Agent Specification Format Validation", () => {
  // TC-043: analyze-request.md の PERSONA_NAME が存在する
  it("TC-043: analyze-request.md should have PERSONA_NAME", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "agents", "analyze-request.md"),
      "utf-8",
    );
    expect(content).toContain("PERSONA_NAME");
  });

  // TC-044: analyze-request.md の STEPS が番号付きリストである
  it("TC-044: analyze-request.md STEPS should be a numbered list", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "agents", "analyze-request.md"),
      "utf-8",
    );
    const stepsSection = content.split("## STEPS")[1]?.split("##")[0] ?? "";
    expect(stepsSection).toMatch(/1\.\s+/);
    expect(stepsSection).toMatch(/2\.\s+/);
  });

  // TC-045: analyze-request.md の INPUTS, OUTPUTS セクションが存在する
  it("TC-045: analyze-request.md should have INPUTS and OUTPUTS sections", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "agents", "analyze-request.md"),
      "utf-8",
    );
    expect(content).toContain("## INPUTS");
    expect(content).toContain("## OUTPUTS");
  });

  // TC-046: generate-code.md が analyze-request.md と同じフォーマットである
  it("TC-046: generate-code.md should have same format as analyze-request.md", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "agents", "generate-code.md"),
      "utf-8",
    );
    expect(content).toContain("TASK_TITLE");
    expect(content).toContain("PERSONA_NAME");
    expect(content).toContain("## STEPS");
    expect(content).toContain("## INPUTS");
    expect(content).toContain("## OUTPUTS");
  });

  // TC-047: partial-skill/agents/single-agent.md が最小エージェントフォーマットに準拠する
  it("TC-047: single-agent.md should conform to minimal agent format", async () => {
    const content = await fs.readFile(
      fixturePath("partial-skill", "agents", "single-agent.md"),
      "utf-8",
    );
    expect(content).toContain("TASK_TITLE");
    expect(content).toContain("## STEPS");
    expect(content).toContain("## INPUTS");
    expect(content).toContain("## OUTPUTS");
  });
});

// ========================================
// 検証スクリプト出力フォーマットテスト
// ========================================
describe("Validation Script Output Format", () => {
  // TC-048: validate-skill-structure.js の出力が { valid, errors, structure } 形式である
  it("TC-048: validate-skill-structure.js output should have { valid, errors, structure }", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")} --target ${fixturePath("complete-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty("valid");
    expect(parsed).toHaveProperty("errors");
    expect(parsed).toHaveProperty("structure");
    expect(typeof parsed.valid).toBe("boolean");
    expect(Array.isArray(parsed.errors)).toBe(true);
  });

  // TC-049: validate-skill-md.js の出力が { valid, errors, frontmatter, body } 形式である
  it("TC-049: validate-skill-md.js output should have { valid, errors, frontmatter, body }", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("complete-skill", "SKILL.md")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty("valid");
    expect(parsed).toHaveProperty("errors");
    expect(parsed).toHaveProperty("frontmatter");
    expect(parsed).toHaveProperty("body");
  });

  // TC-050: validate-agents.js の出力が { valid, errors, agents } 形式である
  it("TC-050: validate-agents.js output should have { valid, errors, agents }", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-agents.js")} --target ${fixturePath("complete-skill", "agents")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty("valid");
    expect(parsed).toHaveProperty("errors");
    expect(parsed).toHaveProperty("agents");
    expect(Array.isArray(parsed.agents)).toBe(true);
  });

  // TC-051: validate-schemas.js の出力が { valid, errors, schemas } 形式である
  it("TC-051: validate-schemas.js output should have { valid, errors, schemas }", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-schemas.js")} --target ${fixturePath("complete-skill", "schemas")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty("valid");
    expect(parsed).toHaveProperty("errors");
    expect(parsed).toHaveProperty("schemas");
    expect(Array.isArray(parsed.schemas)).toBe(true);
  });

  // TC-052: run-all-validations.js の出力が { overall, results } 形式である
  it("TC-052: run-all-validations.js output should have { overall, results }", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "run-all-validations.js")} --target ${fixturePath("complete-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty("overall");
    expect(parsed).toHaveProperty("results");
    expect(Array.isArray(parsed.results)).toBe(true);
  });

  // TC-053: 存在しないディレクトリを指定した場合、適切なエラーが返される
  it("TC-053: non-existent directory should return appropriate error", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")} --target ${fixturePath("non-existent-skill")}`,
    );
    expect(output).toBeTruthy();
    const parsed = JSON.parse(output);
    expect(parsed.valid).toBe(false);
    expect(parsed.errors.length).toBeGreaterThan(0);
  });
});

// ========================================
// オーケストレーション設定テスト
// ========================================
describe("Orchestration Config Validation", () => {
  // TC-054: chain-config.yaml に steps 配列が存在する
  it("TC-054: chain-config.yaml should have steps array", async () => {
    const content = await fs.readFile(
      fixturePath("orchestration-skill", "assets", "chain-config.yaml"),
      "utf-8",
    );
    expect(content).toContain("steps:");
    // steps配列にidを持つエントリが存在する
    expect(content).toMatch(/- id: step-/);
  });

  // TC-055: chain-config.yaml の steps が最低2つのスキルを含む
  it("TC-055: chain-config.yaml steps should contain at least 2 entries", async () => {
    const content = await fs.readFile(
      fixturePath("orchestration-skill", "assets", "chain-config.yaml"),
      "utf-8",
    );
    const stepMatches = content.match(/- id: step-/g);
    expect(stepMatches).not.toBeNull();
    expect(stepMatches!.length).toBeGreaterThanOrEqual(2);
  });

  // TC-056: chain-config.yaml に error_handling が定義されている
  it("TC-056: chain-config.yaml should have error_handling", async () => {
    const content = await fs.readFile(
      fixturePath("orchestration-skill", "assets", "chain-config.yaml"),
      "utf-8",
    );
    expect(content).toContain("error_handling:");
    expect(content).toContain("on_step_error:");
  });

  // TC-057: parallel-config.yaml に tasks 配列が存在する
  it("TC-057: parallel-config.yaml should have tasks array", async () => {
    const content = await fs.readFile(
      fixturePath("orchestration-skill", "assets", "parallel-config.yaml"),
      "utf-8",
    );
    expect(content).toContain("tasks:");
    expect(content).toMatch(/- id: task-/);
  });

  // TC-058: parallel-config.yaml に result_aggregation 設定が存在する
  it("TC-058: parallel-config.yaml should have result_aggregation", async () => {
    const content = await fs.readFile(
      fixturePath("orchestration-skill", "assets", "parallel-config.yaml"),
      "utf-8",
    );
    expect(content).toContain("result_aggregation:");
    expect(content).toContain("strategy:");
  });
});

// ========================================
// クロスバリデーションテスト
// ========================================
describe("Cross-Validation", () => {
  // TC-059: complete-skill の agents/*.md が schemas/agent-definition.json の required を満たす
  it("TC-059: agents/*.md should satisfy agent-definition.json required fields", async () => {
    const schemaContent = await fs.readFile(
      fixturePath("complete-skill", "schemas", "agent-definition.json"),
      "utf-8",
    );
    const schema = JSON.parse(schemaContent);
    const requiredFields = schema.required as string[];

    const agentsDir = fixturePath("complete-skill", "agents");
    const files = await fs.readdir(agentsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(agentsDir, file), "utf-8");
      for (const field of requiredFields) {
        expect(content).toContain(field);
      }
    }
  });

  // TC-060: complete-skill の scripts/utils.js の EXIT_CODES がスクリプトパターンに準拠する
  it("TC-060: scripts/utils.js EXIT_CODES should follow the script pattern", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "scripts", "utils.js"),
      "utf-8",
    );
    expect(content).toContain("SUCCESS");
    expect(content).toContain("ERROR");
    expect(content).toContain("ARGS_ERROR");
    expect(content).toContain("FILE_NOT_FOUND");
    expect(content).toContain("VALIDATION_FAILED");
  });

  // TC-061: 全フィクスチャの SKILL.md の name フィールドが一意である
  it("TC-061: all fixture SKILL.md names should be unique", async () => {
    const fixtures = [
      "complete-skill",
      "minimal-skill",
      "partial-skill",
      "invalid-skill",
      "orchestration-skill",
    ];
    const names: string[] = [];

    for (const fixture of fixtures) {
      const content = await fs.readFile(
        fixturePath(fixture, "SKILL.md"),
        "utf-8",
      );
      const fm = parseFrontmatter(content);
      if (fm && fm["name"]) {
        names.push(fm["name"] as string);
      }
    }

    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  // TC-062: complete-skill の全ディレクトリが skill-creator の出力ディレクトリと一致する
  it("TC-062: complete-skill directories should match skill-creator output structure", async () => {
    const expectedDirs = [
      "agents",
      "references",
      "scripts",
      "assets",
      "schemas",
    ];
    for (const dir of expectedDirs) {
      expect(await dirExists(fixturePath("complete-skill", dir))).toBe(true);
    }
  });
});

// ========================================
// 境界値フィクスチャテスト (TASK-8C-G)
// ========================================
describe("Boundary Value Fixtures", () => {
  // TC-063: boundary-skill/SKILL.md の name が 64 文字である
  it("TC-063: boundary-skill/SKILL.md name should be exactly 64 characters", async () => {
    const content = await fs.readFile(
      fixturePath("boundary-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    const name = fm!["name"] as string;
    expect(name.length).toBe(64);
  });

  // TC-064: boundary-skill/SKILL.md の description が 10 文字である
  it("TC-064: boundary-skill/SKILL.md description should be exactly 10 characters", async () => {
    const content = await fs.readFile(
      fixturePath("boundary-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    const description = fm!["description"] as string;
    expect(description.length).toBe(10);
  });

  // TC-065: boundary-skill/SKILL.md に Anchors セクションがある
  it("TC-065: boundary-skill/SKILL.md should have Anchors section", async () => {
    const content = await fs.readFile(
      fixturePath("boundary-skill", "SKILL.md"),
      "utf-8",
    );
    expect(content).toContain("## Anchors");
  });

  // TC-066: boundary-skill/SKILL.md に Trigger セクションがある
  it("TC-066: boundary-skill/SKILL.md should have Trigger section", async () => {
    const content = await fs.readFile(
      fixturePath("boundary-skill", "SKILL.md"),
      "utf-8",
    );
    expect(content).toContain("## Trigger");
  });

  // TC-067: boundary-skill/SKILL.md の version が semver 形式である
  it("TC-067: boundary-skill/SKILL.md version should be semver format", async () => {
    const content = await fs.readFile(
      fixturePath("boundary-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(fm!["version"]).toMatch(/^\d+\.\d+\.\d+$/);
  });

  // TC-068: boundary-skill/agents/boundary-agent.md が全必須セクションを持つ
  it("TC-068: boundary-agent.md should have all required sections", async () => {
    const content = await fs.readFile(
      fixturePath("boundary-skill", "agents", "boundary-agent.md"),
      "utf-8",
    );
    expect(content).toContain("TASK_TITLE");
    expect(content).toContain("## STEPS");
    expect(content).toContain("## INPUTS");
    expect(content).toContain("## OUTPUTS");
  });

  // TC-069: boundary-skill/schemas/boundary-schema.json が $schema を持つ
  it("TC-069: boundary-schema.json should have $schema property", async () => {
    const content = await fs.readFile(
      fixturePath("boundary-skill", "schemas", "boundary-schema.json"),
      "utf-8",
    );
    const schema = JSON.parse(content);
    expect(schema.$schema).toContain("json-schema.org");
    expect(schema.type).toBe("object");
  });

  // TC-070: boundary-skill/assets/chain-config.yaml の steps が 2 である
  it("TC-070: chain-config.yaml should have exactly 2 steps", async () => {
    const content = await fs.readFile(
      fixturePath("boundary-skill", "assets", "chain-config.yaml"),
      "utf-8",
    );
    const stepMatches = content.match(/- id: step-/g);
    expect(stepMatches).not.toBeNull();
    expect(stepMatches!.length).toBe(2);
  });

  // TC-071: boundary-skill/assets/parallel-config.yaml の tasks が 2 である
  it("TC-071: parallel-config.yaml should have exactly 2 tasks", async () => {
    const content = await fs.readFile(
      fixturePath("boundary-skill", "assets", "parallel-config.yaml"),
      "utf-8",
    );
    const taskMatches = content.match(/- id: task-/g);
    expect(taskMatches).not.toBeNull();
    expect(taskMatches!.length).toBe(2);
  });

  // TC-072: validate-skill-structure.js が boundary-skill を valid と判定する
  it("TC-072: validate-skill-structure.js should validate boundary-skill", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")} --target ${fixturePath("boundary-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = parseValidationOutput(result);
    expect(parsed.valid).toBe(true);
  });

  // TC-073: validate-skill-md.js が boundary-skill を valid と判定する
  it("TC-073: validate-skill-md.js should validate boundary-skill/SKILL.md", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("boundary-skill", "SKILL.md")}`,
      { encoding: "utf-8" },
    );
    const parsed = parseValidationOutput(result);
    expect(parsed.valid).toBe(true);
  });

  // TC-074: run-all-validations.js が boundary-skill を overall valid と判定する
  it("TC-074: run-all-validations.js should pass for boundary-skill", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "run-all-validations.js")} --target ${fixturePath("boundary-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = parseValidationOutput(result);
    expect(parsed.overall).toBe(true);
  });
});

// ========================================
// エラーパターンフィクスチャテスト (TASK-8C-G)
// ========================================
describe("Error Pattern Fixtures", () => {
  // TC-075: missing-fields-skill/SKILL.md の validate-skill-md.js がエラーを返す
  it("TC-075: validate-skill-md.js should return errors for missing-fields-skill", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("missing-fields-skill", "SKILL.md")}`,
    );
    const parsed = parseValidationOutput(output);
    expect(parsed.valid).toBe(false);
    expect((parsed.errors as string[]).length).toBeGreaterThan(0);
  });

  // TC-076: forbidden-files-skill/ の validate-skill-structure.js がエラーを返す
  it("TC-076: validate-skill-structure.js should return errors for forbidden-files-skill", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")} --target ${fixturePath("forbidden-files-skill")}`,
    );
    const parsed = parseValidationOutput(output);
    expect(parsed.valid).toBe(false);
    expect((parsed.errors as string[]).length).toBeGreaterThan(0);
  });

  // TC-077: invalid-name-skill/ の validate-skill-md.js がエラーを返す
  it("TC-077: validate-skill-md.js should return errors for invalid-name-skill", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("invalid-name-skill", "SKILL.md")}`,
    );
    const parsed = parseValidationOutput(output);
    expect(parsed.valid).toBe(false);
    expect((parsed.errors as string[]).length).toBeGreaterThan(0);
  });

  // TC-078: empty-agents-skill/ の validate-agents.js がエラーを返す
  it("TC-078: validate-agents.js should return errors for empty-agents-skill", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-agents.js")} --target ${fixturePath("empty-agents-skill", "agents")}`,
    );
    const parsed = parseValidationOutput(output);
    expect(parsed.valid).toBe(false);
    expect((parsed.errors as string[]).length).toBeGreaterThan(0);
  });

  // TC-079: invalid-schema-skill/ の validate-schemas.js がエラーを返す
  it("TC-079: validate-schemas.js should return errors for invalid-schema-skill", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-schemas.js")} --target ${fixturePath("invalid-schema-skill", "schemas")}`,
    );
    const parsed = parseValidationOutput(output);
    expect(parsed.valid).toBe(false);
    expect((parsed.errors as string[]).length).toBeGreaterThan(0);
  });

  // TC-080: missing-fields-skill/ のエラーメッセージに name が含まれる
  it("TC-080: missing-fields-skill error should mention name field", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("missing-fields-skill", "SKILL.md")}`,
    );
    const parsed = parseValidationOutput(output);
    const errors = parsed.errors as string[];
    expect(errors.some((e) => e.toLowerCase().includes("name"))).toBe(true);
  });

  // TC-081: forbidden-files-skill/ のエラーメッセージに README.md が含まれる
  it("TC-081: forbidden-files-skill error should mention README.md", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")} --target ${fixturePath("forbidden-files-skill")}`,
    );
    const parsed = parseValidationOutput(output);
    const errors = parsed.errors as string[];
    expect(errors.some((e) => e.includes("README.md"))).toBe(true);
  });

  // TC-082: invalid-name-skill/ のエラーメッセージに kebab-case が含まれる
  it("TC-082: invalid-name-skill error should mention kebab-case", () => {
    const output = runValidationScript(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("invalid-name-skill", "SKILL.md")}`,
    );
    const parsed = parseValidationOutput(output);
    const errors = parsed.errors as string[];
    expect(errors.some((e) => e.toLowerCase().includes("kebab-case"))).toBe(
      true,
    );
  });
});

// ========================================
// 検証スクリプトエッジケーステスト (TASK-8C-G)
// ========================================
describe("Validation Script Edge Cases", () => {
  // TC-083: validate-skill-structure.js が --target 未指定で EXIT_CODE=2 を返す
  it("TC-083: validate-skill-structure.js should exit with code 2 without --target", () => {
    const exitCode = getExitCode(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")}`,
    );
    expect(exitCode).toBe(2);
  });

  // TC-084: validate-skill-md.js が --target 未指定で EXIT_CODE=2 を返す
  it("TC-084: validate-skill-md.js should exit with code 2 without --target", () => {
    const exitCode = getExitCode(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")}`,
    );
    expect(exitCode).toBe(2);
  });

  // TC-085: validate-agents.js が --target 未指定で EXIT_CODE=2 を返す
  it("TC-085: validate-agents.js should exit with code 2 without --target", () => {
    const exitCode = getExitCode(
      `node ${runnerScriptPath("scripts", "validate-agents.js")}`,
    );
    expect(exitCode).toBe(2);
  });

  // TC-086: validate-schemas.js が --target 未指定で EXIT_CODE=2 を返す
  it("TC-086: validate-schemas.js should exit with code 2 without --target", () => {
    const exitCode = getExitCode(
      `node ${runnerScriptPath("scripts", "validate-schemas.js")}`,
    );
    expect(exitCode).toBe(2);
  });

  // TC-087: validate-skill-structure.js が存在しないパスで EXIT_CODE=3 を返す
  it("TC-087: validate-skill-structure.js should exit with code 3 for non-existent path", () => {
    const exitCode = getExitCode(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")} --target /tmp/non-existent-path-for-testing`,
    );
    expect(exitCode).toBe(3);
  });

  // TC-088: run-all-validations.js が agents/ なしで agents 検証をスキップする
  it("TC-088: run-all-validations.js should skip agents validation when no agents/ dir", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "run-all-validations.js")} --target ${fixturePath("minimal-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = parseValidationOutput(result);
    const results = parsed.results as Array<{ script: string }>;
    const agentsResult = results.find((r) =>
      r.script.includes("validate-agents"),
    );
    expect(agentsResult).toBeUndefined();
  });

  // TC-089: run-all-validations.js が schemas/ なしで schemas 検証をスキップする
  it("TC-089: run-all-validations.js should skip schemas validation when no schemas/ dir", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "run-all-validations.js")} --target ${fixturePath("minimal-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = parseValidationOutput(result);
    const results = parsed.results as Array<{ script: string }>;
    const schemasResult = results.find((r) =>
      r.script.includes("validate-schemas"),
    );
    expect(schemasResult).toBeUndefined();
  });

  // TC-090: run-all-validations.js が --target 未指定で EXIT_CODE=2 を返す
  it("TC-090: run-all-validations.js should exit with code 2 without --target", () => {
    const exitCode = getExitCode(
      `node ${runnerScriptPath("scripts", "run-all-validations.js")}`,
    );
    expect(exitCode).toBe(2);
  });
});

// ========================================
// テスト品質改善テスト (TASK-8C-G)
// ========================================
describe("Test Quality Improvements", () => {
  // TC-091: complete-skill の SKILL.md を Frontmatter パースで name を検証できる
  it("TC-091: complete-skill name should be verifiable via parsed frontmatter", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(fm!["name"]).toBe("fixture-complete-skill");
  });

  // TC-092: complete-skill の SKILL.md を Frontmatter パースで description を検証できる
  it("TC-092: complete-skill description should be verifiable via parsed frontmatter", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    // description フィールドが存在すること（パーサーは `|` 記法を配列として返す）
    expect(fm!).toHaveProperty("description");
    // validate-skill-md.js のスクリプト出力でも description 検証可能
    const output = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("complete-skill", "SKILL.md")}`,
      { encoding: "utf-8" },
    );
    const parsed = parseValidationOutput(output);
    expect(parsed.valid).toBe(true);
  });

  // TC-093: complete-skill の SKILL.md を Frontmatter パースで allowed-tools を配列検証できる
  it("TC-093: complete-skill allowed-tools should be verifiable as array via parsed frontmatter", async () => {
    const content = await fs.readFile(
      fixturePath("complete-skill", "SKILL.md"),
      "utf-8",
    );
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    const tools = fm!["allowed-tools"];
    expect(Array.isArray(tools)).toBe(true);
    expect((tools as string[]).length).toBeGreaterThan(0);
    for (const tool of tools as string[]) {
      expect(typeof tool).toBe("string");
    }
  });

  // TC-094: validate-skill-structure.js の JSON 出力をパースして valid プロパティを検証できる
  it("TC-094: validate-skill-structure.js output should be structurally verifiable", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-structure.js")} --target ${fixturePath("complete-skill")}`,
      { encoding: "utf-8" },
    );
    const parsed = parseValidationOutput(result);
    expect(typeof parsed.valid).toBe("boolean");
    expect(parsed.valid).toBe(true);
    expect(Array.isArray(parsed.errors)).toBe(true);
    expect((parsed.errors as string[]).length).toBe(0);
    const structure = parsed.structure as {
      directories: string[];
      files: string[];
    };
    expect(structure.directories).toContain("agents");
  });

  // TC-095: validate-skill-md.js の JSON 出力をパースして frontmatter プロパティを検証できる
  it("TC-095: validate-skill-md.js output should have parseable frontmatter", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-skill-md.js")} --target ${fixturePath("complete-skill", "SKILL.md")}`,
      { encoding: "utf-8" },
    );
    const parsed = parseValidationOutput(result);
    expect(parsed.valid).toBe(true);
    const frontmatter = parsed.frontmatter as Record<string, unknown>;
    expect(frontmatter).not.toBeNull();
    expect(frontmatter.name).toBe("fixture-complete-skill");
    expect(Array.isArray(frontmatter["allowed-tools"])).toBe(true);
  });

  // TC-096: validate-agents.js の JSON 出力をパースして agents 配列を検証できる
  it("TC-096: validate-agents.js output should have parseable agents array", () => {
    const result = execSync(
      `node ${runnerScriptPath("scripts", "validate-agents.js")} --target ${fixturePath("complete-skill", "agents")}`,
      { encoding: "utf-8" },
    );
    const parsed = parseValidationOutput(result);
    expect(parsed.valid).toBe(true);
    const agents = parsed.agents as Array<{
      name: string;
      hasRequiredSections: boolean;
    }>;
    expect(agents.length).toBeGreaterThan(0);
    for (const agent of agents) {
      expect(agent.name).toBeDefined();
      expect(agent.hasRequiredSections).toBe(true);
    }
  });
});
