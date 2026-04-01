import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { SkillCreatorVerificationEngine } from "../SkillCreatorVerificationEngine";
import type { RuntimeSkillCreatorVerifyCheck } from "@repo/shared";

// ── fixture helper ───────────────────────────────────

interface SkillFixtureOptions {
  /** SKILL.md の内容。false で作成しない */
  skillMd?: string | false;
  /** agents/ 配下のファイル群。false で agents/ 自体を作らない */
  agents?: Record<string, string> | false;
  /** references/ を作るか */
  references?: boolean;
  /** output-schema.json の内容。false で作成しない */
  outputSchema?: string | false;
  /** references/ 配下に配置するファイル群 key: ファイル名, value: 内容 */
  referenceFiles?: Record<string, string>;
  /** SKILL.md 内に参照として記載する references/ パス一覧 */
  skillMdReferenceLinks?: string[];
}

async function createSkillFixture(
  baseDir: string,
  options: SkillFixtureOptions,
): Promise<string> {
  const skillDir = path.join(
    baseDir,
    `test-skill-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(skillDir, { recursive: true });

  if (typeof options.skillMd === "string") {
    await fs.writeFile(path.join(skillDir, "SKILL.md"), options.skillMd);
  }

  if (options.agents !== false && options.agents !== undefined) {
    const agentsDir = path.join(skillDir, "agents");
    await fs.mkdir(agentsDir, { recursive: true });
    for (const [name, content] of Object.entries(options.agents)) {
      await fs.writeFile(path.join(agentsDir, name), content);
    }
  }

  if (options.references) {
    await fs.mkdir(path.join(skillDir, "references"), { recursive: true });
  }

  if (typeof options.outputSchema === "string") {
    await fs.writeFile(
      path.join(skillDir, "output-schema.json"),
      options.outputSchema,
    );
  }

  if (
    options.referenceFiles &&
    Object.keys(options.referenceFiles).length > 0
  ) {
    const refsDir = path.join(skillDir, "references");
    await fs.mkdir(refsDir, { recursive: true });
    for (const [name, content] of Object.entries(options.referenceFiles)) {
      await fs.writeFile(path.join(refsDir, name), content);
    }
  }

  if (
    options.skillMdReferenceLinks &&
    options.skillMdReferenceLinks.length > 0
  ) {
    const skillPath = path.join(skillDir, "SKILL.md");
    const current = await fs.readFile(skillPath, "utf-8");
    const appended =
      current +
      `\n\n## References\n` +
      options.skillMdReferenceLinks.map((p) => `- ${p}`).join("\n") +
      `\n`;
    await fs.writeFile(skillPath, appended);
  }

  return skillDir;
}

// ── テスト本体 ───────────────────────────────────────

describe("SkillCreatorVerificationEngine", () => {
  let engine: SkillCreatorVerificationEngine;
  let tmpDir: string;

  beforeEach(async () => {
    engine = new SkillCreatorVerificationEngine();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "verify-engine-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // ── helper ──
  function findCheck(
    checks: RuntimeSkillCreatorVerifyCheck[],
    id: string,
  ): RuntimeSkillCreatorVerifyCheck | undefined {
    return checks.find((c) => c.id === id);
  }

  // ── T-ENG-01: 完全な skill ディレクトリ ──
  describe("T-ENG-01: complete skill directory", () => {
    it("returns all checks as pass with mixed layer1/layer2", async () => {
      const skillDir = await createSkillFixture(tmpDir, {
        skillMd: [
          "# My Skill",
          "",
          "## 概要",
          "A test skill",
          "",
          "## Trigger",
          "When triggered",
          "",
          "## Anchors",
          "- anchor1",
        ].join("\n"),
        agents: {
          "planner.md": "# Planner\n\n## 責務\nPlans things",
        },
        references: true,
        outputSchema: '{"type":"object"}',
      });

      const checks = await engine.verify(skillDir);

      // Layer 1 checks
      expect(findCheck(checks, "L1-001")?.severity).toBe("info");
      expect(findCheck(checks, "L1-002")?.severity).toBe("info");
      expect(findCheck(checks, "L1-003")?.severity).toBe("info");
      expect(findCheck(checks, "L1-004")?.severity).toBe("info");
      expect(findCheck(checks, "L1-005")?.severity).toBe("info");

      // Layer 2 checks
      expect(findCheck(checks, "L2-001")?.severity).toBe("info");
      expect(findCheck(checks, "L2-002")?.severity).toBe("info");
      expect(findCheck(checks, "L2-003")?.severity).toBe("info");
      expect(findCheck(checks, "L2-004")?.severity).toBe("info");
      expect(findCheck(checks, "L2-007")?.severity).toBe("info");

      // Mixed layers
      const layers = new Set(checks.map((c) => c.layer));
      expect(layers.has("layer1")).toBe(true);
      expect(layers.has("layer2")).toBe(true);
    });
  });

  // ── T-ENG-02: 空ディレクトリ ──
  describe("T-ENG-02: empty directory", () => {
    it("returns Layer 1 errors and Layer 2 also runs", async () => {
      const skillDir = await createSkillFixture(tmpDir, {
        skillMd: false,
        agents: false,
        references: false,
        outputSchema: false,
      });

      const checks = await engine.verify(skillDir);

      expect(findCheck(checks, "L1-001")?.severity).toBe("error");
      expect(findCheck(checks, "L1-002")?.severity).toBe("error");
      expect(findCheck(checks, "L1-004")?.severity).toBe("warning");
      expect(findCheck(checks, "L1-005")?.severity).toBe("warning");

      // Layer 2 SKILL.md checks should be error (unreadable)
      expect(findCheck(checks, "L2-001")?.severity).toBe("error");
    });
  });

  // ── T-ENG-03: SKILL.md のみ存在 ──
  describe("T-ENG-03: only SKILL.md exists", () => {
    it("Layer 1 partial fail, Layer 2 SKILL.md checks run", async () => {
      const skillDir = await createSkillFixture(tmpDir, {
        skillMd: "# Test\n\n## 概要\nTest\n\n## Trigger\nT\n\n## Anchors\nA",
        agents: false,
        references: false,
        outputSchema: false,
      });

      const checks = await engine.verify(skillDir);

      // L1: SKILL.md pass, agents fail
      expect(findCheck(checks, "L1-001")?.severity).toBe("info");
      expect(findCheck(checks, "L1-002")?.severity).toBe("error");

      // L2: SKILL.md content checks should run
      expect(findCheck(checks, "L2-001")?.severity).toBe("info");
      expect(findCheck(checks, "L2-002")?.severity).toBe("info");
      expect(findCheck(checks, "L2-003")?.severity).toBe("info");
    });
  });

  // ── Layer 1 individual checks ──
  describe("Layer 1 checks", () => {
    it("T-L1-01/02: SKILL.md existence", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# Test",
        agents: { "a.md": "# A\n\n## 責務\nDo" },
      });
      const passChecks = await engine.verify(passDir);
      const passCheck = findCheck(passChecks, "L1-001");
      expect(passCheck?.layer).toBe("layer1");
      expect(passCheck?.severity).toBe("info");

      // Clean up and create fail scenario
      const failTmpDir = await fs.mkdtemp(
        path.join(os.tmpdir(), "verify-fail-"),
      );
      try {
        const failDir = await createSkillFixture(failTmpDir, {
          skillMd: false,
          agents: { "a.md": "# A" },
        });
        const failChecks = await engine.verify(failDir);
        const failCheck = findCheck(failChecks, "L1-001");
        expect(failCheck?.severity).toBe("error");
        expect(failCheck?.evidenceSummary).toContain("path:");
      } finally {
        await fs.rm(failTmpDir, { recursive: true, force: true });
      }
    });

    it("T-L1-03/04: agents/ directory existence", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# T",
        agents: { "a.md": "# A" },
      });
      expect(findCheck(await engine.verify(passDir), "L1-002")?.severity).toBe(
        "info",
      );
    });

    it("T-L1-05/06: agents/ has files", async () => {
      // Pass: agents with files
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# T",
        agents: { "a.md": "# A" },
      });
      expect(findCheck(await engine.verify(passDir), "L1-003")?.severity).toBe(
        "info",
      );

      // Fail: agents empty — need separate fixture
      const emptyTmp = await fs.mkdtemp(
        path.join(os.tmpdir(), "verify-empty-"),
      );
      try {
        const emptyDir = await createSkillFixture(emptyTmp, {
          skillMd: "# T",
          agents: {}, // empty agents directory
        });
        expect(
          findCheck(await engine.verify(emptyDir), "L1-003")?.severity,
        ).toBe("error");
      } finally {
        await fs.rm(emptyTmp, { recursive: true, force: true });
      }
    });

    it("T-L1-07/08: references/ existence", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# T",
        agents: { "a.md": "# A" },
        references: true,
      });
      expect(findCheck(await engine.verify(passDir), "L1-004")?.severity).toBe(
        "info",
      );
    });

    it("T-L1-09/10: output-schema.json existence", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# T",
        agents: { "a.md": "# A" },
        outputSchema: "{}",
      });
      expect(findCheck(await engine.verify(passDir), "L1-005")?.severity).toBe(
        "info",
      );
    });
  });

  // ── Layer 2 individual checks ──
  describe("Layer 2 checks", () => {
    it("T-L2-01/02: SKILL.md H1 heading", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# My Skill\n\n## 概要\nTest",
        agents: { "a.md": "# A" },
      });
      expect(findCheck(await engine.verify(passDir), "L2-001")?.layer).toBe(
        "layer2",
      );
      expect(findCheck(await engine.verify(passDir), "L2-001")?.severity).toBe(
        "info",
      );

      // Fail: no H1
      const failTmp = await fs.mkdtemp(path.join(os.tmpdir(), "verify-l2-"));
      try {
        const failDir = await createSkillFixture(failTmp, {
          skillMd: "## Only H2\nNo H1 here",
          agents: { "a.md": "# A" },
        });
        expect(
          findCheck(await engine.verify(failDir), "L2-001")?.severity,
        ).toBe("error");
      } finally {
        await fs.rm(failTmp, { recursive: true, force: true });
      }
    });

    it("T-L2-03/04: overview section", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## 概要\nOverview here",
        agents: { "a.md": "# A" },
      });
      expect(findCheck(await engine.verify(passDir), "L2-002")?.severity).toBe(
        "info",
      );
    });

    it("T-L2-05/06: Trigger section", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## Trigger\nWhen X",
        agents: { "a.md": "# A" },
      });
      expect(findCheck(await engine.verify(passDir), "L2-003")?.severity).toBe(
        "info",
      );

      const failTmp = await fs.mkdtemp(path.join(os.tmpdir(), "verify-l2-"));
      try {
        const failDir = await createSkillFixture(failTmp, {
          skillMd: "# S\n\n## Triggered\nWhen X",
          agents: { "a.md": "# A" },
        });
        expect(
          findCheck(await engine.verify(failDir), "L2-003")?.severity,
        ).toBe("error");
      } finally {
        await fs.rm(failTmp, { recursive: true, force: true });
      }
    });

    it("T-L2-07/08: Anchors section", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## Anchors\n- A",
        agents: { "a.md": "# A" },
      });
      expect(findCheck(await engine.verify(passDir), "L2-004")?.severity).toBe(
        "info",
      );
    });

    it("T-L2-09/10: agent H1 heading", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# S",
        agents: { "planner.md": "# Planner Agent\n\n## 責務\nPlans" },
      });
      const checks = await engine.verify(passDir);
      const l2005 = checks.filter((c) => c.id === "L2-005");
      expect(l2005.some((c) => c.severity === "info")).toBe(true);

      // Fail: no H1 in agent
      const failTmp = await fs.mkdtemp(path.join(os.tmpdir(), "verify-ag-"));
      try {
        const failDir = await createSkillFixture(failTmp, {
          skillMd: "# S",
          agents: { "planner.md": "## No H1\nJust H2" },
        });
        const failChecks = await engine.verify(failDir);
        const failL2005 = failChecks.filter((c) => c.id === "L2-005");
        expect(failL2005.some((c) => c.severity === "error")).toBe(true);
      } finally {
        await fs.rm(failTmp, { recursive: true, force: true });
      }
    });

    it("T-L2-11/12: agent responsibility section", async () => {
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# S",
        agents: { "p.md": "# P\n\n## 責務\nDoes things" },
      });
      const checks = await engine.verify(passDir);
      const l2006 = checks.filter((c) => c.id === "L2-006");
      expect(l2006.some((c) => c.severity === "info")).toBe(true);
    });

    it("T-L2-13/14: output-schema.json validity", async () => {
      // Pass: valid JSON
      const passDir = await createSkillFixture(tmpDir, {
        skillMd: "# S",
        agents: { "a.md": "# A" },
        outputSchema: '{"type":"object"}',
      });
      expect(findCheck(await engine.verify(passDir), "L2-007")?.severity).toBe(
        "info",
      );

      // Fail: invalid JSON
      const failTmp = await fs.mkdtemp(path.join(os.tmpdir(), "verify-js-"));
      try {
        const failDir = await createSkillFixture(failTmp, {
          skillMd: "# S",
          agents: { "a.md": "# A" },
          outputSchema: "{not valid json",
        });
        expect(
          findCheck(await engine.verify(failDir), "L2-007")?.severity,
        ).toBe("error");
      } finally {
        await fs.rm(failTmp, { recursive: true, force: true });
      }

      // Pass: primitive JSON should not crash Layer 3 checks
      const primitiveTmp = await fs.mkdtemp(
        path.join(os.tmpdir(), "verify-primitive-"),
      );
      try {
        const primitiveDir = await createSkillFixture(primitiveTmp, {
          skillMd: "# S",
          agents: { "a.md": "# A" },
          outputSchema: "true",
        });
        const primitiveChecks = await engine.verify(primitiveDir);
        expect(findCheck(primitiveChecks, "L2-007")?.severity).toBe("info");
        expect(findCheck(primitiveChecks, "L3-001")?.severity).toBe("warning");
        expect(findCheck(primitiveChecks, "L3-002")?.severity).toBe("warning");
      } finally {
        await fs.rm(primitiveTmp, { recursive: true, force: true });
      }
    });
  });

  // ── Phase 6: Edge Cases ──
  describe("Edge cases", () => {
    // ── 部分構造 ──
    it("agents/ only (no SKILL.md) — L1 partial fail, L2 SKILL.md checks error", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: false,
        agents: { "a.md": "# A\n\n## 責務\nR" },
      });
      const checks = await engine.verify(dir);
      expect(findCheck(checks, "L1-001")?.severity).toBe("error");
      expect(findCheck(checks, "L1-002")?.severity).toBe("info");
      // SKILL.md unreadable → L2 checks are error
      expect(findCheck(checks, "L2-001")?.severity).toBe("error");
    });

    it("agents/ with only non-.md files — L2 agent checks not emitted", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S",
        agents: { "config.json": '{"key":"val"}' },
      });
      const checks = await engine.verify(dir);
      // L1-003 pass (has files)
      expect(findCheck(checks, "L1-003")?.severity).toBe("info");
      // No L2-005/L2-006 emitted (only .md files are checked)
      const agentChecks = checks.filter(
        (c) => c.id === "L2-005" || c.id === "L2-006",
      );
      expect(agentChecks.length).toBe(0);
    });

    it("empty SKILL.md — L1 pass, L2 all fields fail", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "",
        agents: { "a.md": "# A" },
      });
      const checks = await engine.verify(dir);
      expect(findCheck(checks, "L1-001")?.severity).toBe("info");
      expect(findCheck(checks, "L2-001")?.severity).toBe("error");
      expect(findCheck(checks, "L2-002")?.severity).toBe("error");
      expect(findCheck(checks, "L2-003")?.severity).toBe("error");
    });

    // ── 破損ファイル ──
    it("output-schema.json is empty — L2 JSON parse fail", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S",
        agents: { "a.md": "# A" },
        outputSchema: "",
      });
      const checks = await engine.verify(dir);
      expect(findCheck(checks, "L2-007")?.severity).toBe("error");
    });

    it("output-schema.json truncated JSON — L2 JSON parse fail", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S",
        agents: { "a.md": "# A" },
        outputSchema: '{"type": "ob',
      });
      const checks = await engine.verify(dir);
      expect(findCheck(checks, "L2-007")?.severity).toBe("error");
    });

    it("agents/ .md file is 0 bytes — L2 heading error", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S",
        agents: { "empty.md": "" },
      });
      const checks = await engine.verify(dir);
      const l2005 = checks.filter((c) => c.id === "L2-005");
      expect(l2005.some((c) => c.severity === "error")).toBe(true);
    });

    // ── fs 異常 ──
    it("skill directory does not exist — all checks fail gracefully", async () => {
      const checks = await engine.verify(
        path.join(tmpDir, "nonexistent-skill"),
      );
      expect(findCheck(checks, "L1-001")?.severity).toBe("error");
      expect(findCheck(checks, "L1-002")?.severity).toBe("error");
      expect(checks.length).toBeGreaterThan(0);
    });

    // ── 境界値 ──
    it("directory with Japanese/space characters — paths handled correctly", async () => {
      const specialDir = path.join(tmpDir, "テスト スキル");
      await fs.mkdir(specialDir, { recursive: true });
      await fs.writeFile(
        path.join(specialDir, "SKILL.md"),
        "# テスト\n\n## 概要\nテスト",
      );
      await fs.mkdir(path.join(specialDir, "agents"));
      await fs.writeFile(
        path.join(specialDir, "agents", "agent.md"),
        "# エージェント\n\n## 責務\nテスト",
      );

      const checks = await engine.verify(specialDir);
      expect(findCheck(checks, "L1-001")?.severity).toBe("info");
      expect(findCheck(checks, "L1-002")?.severity).toBe("info");
      expect(findCheck(checks, "L2-001")?.severity).toBe("info");
    });
  });

  // ── Layer 3 checks ──
  describe("Layer 3 checks", () => {
    describe("L3-001: output-schema.json $schema フィールド", () => {
      it("T-L3-01: $schema フィールドがある場合 L3-001 が info を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Trigger\nWhen you need to do something important",
          agents: {
            "a.md": "# A\n\n## 責務\nDoes important things for the system user",
          },
          outputSchema: JSON.stringify({
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
          }),
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-001")?.severity).toBe("info");
        expect(findCheck(checks, "L3-001")?.layer).toBe("layer3");
      });

      it("T-L3-02: $schema フィールドがない場合 L3-001 が warning を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Trigger\nWhen you need to do something",
          agents: { "a.md": "# A\n\n## 責務\nDoes things for users" },
          outputSchema: JSON.stringify({ type: "object" }),
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-001")?.severity).toBe("warning");
        expect(findCheck(checks, "L3-001")?.layer).toBe("layer3");
      });
    });

    describe("L3-002: output-schema.json type フィールド", () => {
      it("T-L3-03: type が 'object' の場合 L3-002 が info を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          outputSchema: JSON.stringify({
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
          }),
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-002")?.severity).toBe("info");
        expect(findCheck(checks, "L3-002")?.layer).toBe("layer3");
      });

      it("T-L3-04: type が 'invalid_type' の場合 L3-002 が error を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          outputSchema: JSON.stringify({ type: "invalid_type" }),
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-002")?.severity).toBe("error");
      });

      it("T-L3-05: type フィールドがない場合 L3-002 が warning を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          outputSchema: JSON.stringify({
            $schema: "http://json-schema.org/draft-07/schema#",
          }),
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-002")?.severity).toBe("warning");
      });

      it("T-L3-10: output-schema.json が存在しない場合 L3-001/L3-002 が emit されない", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Trigger\nWhen you need to do something",
          agents: { "a.md": "# A\n\n## 責務\nDoes things for users" },
          outputSchema: false,
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-001")).toBeUndefined();
        expect(findCheck(checks, "L3-002")).toBeUndefined();
      });
    });

    describe("L3-003: agent 責務記述の品質", () => {
      it("T-L3-06: 責務記述が 20 文字以上の場合 L3-003 が info を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: {
            "a.md": "# A\n\n## 責務\nDoes important things for the system",
          },
        });
        const checks = await engine.verify(dir);
        const l3003 = checks.filter((c) => c.id === "L3-003");
        expect(l3003.some((c) => c.severity === "info")).toBe(true);
        expect(l3003[0]?.layer).toBe("layer3");
      });

      it("T-L3-07: 責務記述が 4 文字の場合 L3-003 が warning を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nABC" },
        });
        const checks = await engine.verify(dir);
        const l3003 = checks.filter((c) => c.id === "L3-003");
        expect(l3003.some((c) => c.severity === "warning")).toBe(true);
      });
    });

    describe("L3-004: SKILL.md Trigger セクションの品質", () => {
      it("T-L3-08: Trigger 記述が 10 文字以上の場合 L3-004 が info を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Trigger\nWhen you need to do something important",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-004")?.severity).toBe("info");
        expect(findCheck(checks, "L3-004")?.layer).toBe("layer3");
      });

      it("T-L3-09: Trigger 記述が 5 文字の場合 L3-004 が warning を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Trigger\nABC",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-004")?.severity).toBe("warning");
      });
    });

    // ── Layer3 Edge Cases ──
    describe("Layer 3 edge cases", () => {
      it("T-L3-EC-01: output-schema.json が {} 空オブジェクトの場合 L3-002 が warning", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          outputSchema: JSON.stringify({}),
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-002")?.severity).toBe("warning");

        const booleanSchemaDir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          outputSchema: "true",
        });
        const booleanChecks = await engine.verify(booleanSchemaDir);
        expect(findCheck(booleanChecks, "L3-001")?.severity).toBe("warning");
        expect(findCheck(booleanChecks, "L3-002")?.severity).toBe("warning");

        const nullSchemaDir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          outputSchema: "null",
        });
        const nullChecks = await engine.verify(nullSchemaDir);
        expect(findCheck(nullChecks, "L3-001")?.severity).toBe("warning");
        expect(findCheck(nullChecks, "L3-002")?.severity).toBe("warning");

        const arraySchemaDir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          outputSchema: "[]",
        });
        const arrayChecks = await engine.verify(arraySchemaDir);
        expect(findCheck(arrayChecks, "L3-001")?.severity).toBe("warning");
        expect(findCheck(arrayChecks, "L3-002")?.severity).toBe("warning");
      });

      it("T-L3-EC-02: type が配列 ['object', 'null'] の場合 L3-002 が info", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          outputSchema: JSON.stringify({ type: ["object", "null"] }),
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-002")?.severity).toBe("info");

        const emptyArrayDir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          outputSchema: JSON.stringify({ type: [] }),
        });
        const emptyArrayChecks = await engine.verify(emptyArrayDir);
        expect(findCheck(emptyArrayChecks, "L3-002")?.severity).toBe("error");
      });

      it("T-L3-EC-03: agents/ に複数 .md ファイルがある場合各 agent 分の L3-003 が emit される", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: {
            "a.md": "# A\n\n## 責務\nDoes important things for the system",
            "b.md": "# B\n\n## 責務\nABC",
          },
        });
        const checks = await engine.verify(dir);
        const l3003 = checks.filter((c) => c.id === "L3-003");
        expect(l3003.length).toBe(2);
        expect(l3003.some((c) => c.severity === "info")).toBe(true);
        expect(l3003.some((c) => c.severity === "warning")).toBe(true);
      });

      it("T-L3-EC-04: 責務セクション直後に空行のみの場合 L3-003 が warning", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S",
          agents: { "a.md": "# A\n\n## 責務\n\n\n## Other\nOther content" },
        });
        const checks = await engine.verify(dir);
        const l3003 = checks.filter((c) => c.id === "L3-003");
        expect(l3003.some((c) => c.severity === "warning")).toBe(true);
      });

      it("T-L3-EC-05: Trigger が複数行で合計 10 文字以上の場合 L3-004 が info", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Trigger\nLine one\nLine two here",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L3-004")?.severity).toBe("info");
      });
    });
  });

  // ── Layer 4 checks ──
  describe("Layer 4 checks", () => {
    describe("L4-001: Anchors リスト項目の存在", () => {
      it("T-L4-01: Anchors セクションにリスト項目が 1 件以上ある場合 L4-001 が info を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n- anchor1\n- anchor2",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-001")?.severity).toBe("info");
        expect(findCheck(checks, "L4-001")?.layer).toBe("layer4");
      });

      it("T-L4-02: Anchors セクションにリスト項目がない場合 L4-001 が error を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\nNo list items here.",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-001")?.severity).toBe("error");
        expect(findCheck(checks, "L4-001")?.layer).toBe("layer4");
      });

      it("T-L4-03: Anchors セクション自体がない場合 L4-001 が error を返す", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## 概要\nNo anchors section",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-001")?.severity).toBe("error");
      });
    });

    describe("L4-002: references/ 参照の整合性", () => {
      it("T-L4-04: references/spec.md が実在し SKILL.md で参照されている場合 L4-002 が info", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n- a",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          referenceFiles: { "spec.md": "# Spec" },
          skillMdReferenceLinks: ["references/spec.md"],
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-002")?.severity).toBe("info");
        expect(findCheck(checks, "L4-002")?.layer).toBe("layer4");
      });

      it("T-L4-05: SKILL.md で references/missing.md を参照するが実在しない場合 L4-002 が warning", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n- a",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          references: true,
          skillMdReferenceLinks: ["references/missing.md"],
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-002")?.severity).toBe("warning");
      });

      it("T-L4-06: references/ ディレクトリが存在しない場合 L4-002 が emit されない", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n- a",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          references: false,
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-002")).toBeUndefined();
      });
    });

    describe("L4-003: agent ファイル名の SKILL.md 言及確認", () => {
      it("T-L4-07: planner.md が SKILL.md 本文で言及されている場合 L4-003 が info", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n- a\n\nUse planner.md for planning.",
          agents: { "planner.md": "# Planner\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        const l4003 = checks.filter((c) => c.id === "L4-003");
        expect(l4003.some((c) => c.severity === "info")).toBe(true);
        expect(l4003[0]?.layer).toBe("layer4");
      });

      it("T-L4-08: planner.md が SKILL.md 本文で言及されていない場合 L4-003 が warning", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n- a",
          agents: { "planner.md": "# Planner\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        const l4003 = checks.filter((c) => c.id === "L4-003");
        expect(l4003.some((c) => c.severity === "warning")).toBe(true);

        const falsePositiveDir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n- a\n\nmyplanner.md は別ファイルです。",
          agents: { "planner.md": "# Planner\n\n## 責務\nDoes things" },
        });
        const falsePositiveChecks = await engine.verify(falsePositiveDir);
        const falsePositiveL4003 = falsePositiveChecks.filter(
          (c) => c.id === "L4-003",
        );
        expect(falsePositiveL4003.some((c) => c.severity === "info")).toBe(
          false,
        );
        expect(falsePositiveL4003.some((c) => c.severity === "warning")).toBe(
          true,
        );
      });
    });

    // ── Layer4 Edge Cases ──
    describe("Layer 4 edge cases", () => {
      it("T-L4-EC-01: Anchors に * 形式のリスト項目がある場合 L4-001 が info", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n* anchor1\n* anchor2",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-001")?.severity).toBe("info");
      });

      it("T-L4-EC-02: references/ ディレクトリが空の場合 L4-002 が emit されない", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n- a",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          references: true,
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-002")).toBeUndefined();
      });

      it("T-L4-EC-03: SKILL.md で複数参照し一部が実在しない場合 L4-002 が warning", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n- a",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
          referenceFiles: { "exists.md": "# Exists" },
          skillMdReferenceLinks: [
            "references/exists.md",
            "references/missing.md",
            "references/../escape.md",
          ],
        });
        await fs.writeFile(path.join(dir, "escape.md"), "# Escape");
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-002")?.severity).toBe("warning");
      });

      it("T-L4-EC-04: agent ファイル名に日本語が含まれる場合 L4-003 の判定が正しく動作する", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd:
            "# S\n\n## Anchors\n- a\n\n詳しくは企画エージェント.md を参照",
          agents: { "企画エージェント.md": "# 企画\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        const l4003 = checks.filter((c) => c.id === "L4-003");
        expect(l4003.some((c) => c.severity === "info")).toBe(true);
      });

      it("T-L4-EC-05: Anchors にインデントあり '  - anchor1' の場合 L4-001 が info", async () => {
        const dir = await createSkillFixture(tmpDir, {
          skillMd: "# S\n\n## Anchors\n  - anchor1\n  - anchor2",
          agents: { "a.md": "# A\n\n## 責務\nDoes things" },
        });
        const checks = await engine.verify(dir);
        expect(findCheck(checks, "L4-001")?.severity).toBe("info");
      });
    });
  });

  // ── verify→improve→reverify loop ──
  describe("verify→improve→reverify loop", () => {
    it("T-LOOP-01: L4-001 が fail する fixture を改善後に re-verify で info になること", async () => {
      // 1. fail fixture を作成する
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## Anchors\nNo list items.",
        agents: { "a.md": "# A\n\n## 責務\nDoes things for users" },
      });

      // 2. 初回 verify: L4-001 が error
      const firstChecks = await engine.verify(dir);
      expect(findCheck(firstChecks, "L4-001")?.severity).toBe("error");

      // 3. improve: SKILL.md を修正する
      await fs.writeFile(
        path.join(dir, "SKILL.md"),
        "# S\n\n## Anchors\n- anchor1\n- anchor2",
      );

      // 4. re-verify: L4-001 が info
      const secondChecks = await engine.verify(dir);
      expect(findCheck(secondChecks, "L4-001")?.severity).toBe("info");
    });

    it("T-LOOP-02: L3-001 が warn する fixture を改善後に re-verify で info になること", async () => {
      // 1. $schema なし fixture を作成する
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## Trigger\nWhen you need to do something",
        agents: { "a.md": "# A\n\n## 責務\nDoes things for users" },
        outputSchema: JSON.stringify({ type: "object" }),
      });

      // 2. 初回 verify: L3-001 が warning
      const firstChecks = await engine.verify(dir);
      expect(findCheck(firstChecks, "L3-001")?.severity).toBe("warning");

      // 3. improve: output-schema.json を修正する
      await fs.writeFile(
        path.join(dir, "output-schema.json"),
        JSON.stringify({
          $schema: "http://json-schema.org/draft-07/schema#",
          type: "object",
        }),
      );

      // 4. re-verify: L3-001 が info
      const secondChecks = await engine.verify(dir);
      expect(findCheck(secondChecks, "L3-001")?.severity).toBe("info");
    });

    it("T-LOOP-03: Facade.verifySkill() が Layer3/4 チェック結果を含む配列を返すこと", async () => {
      const { RuntimeSkillCreatorFacade } =
        await import("../RuntimeSkillCreatorFacade");

      const dir = await createSkillFixture(tmpDir, {
        skillMd: [
          "# My Skill",
          "",
          "## 概要",
          "A skill description",
          "",
          "## Trigger",
          "When the user requests skill creation",
          "",
          "## Anchors",
          "- anchor1",
        ].join("\n"),
        agents: {
          "planner.md":
            "# Planner\n\n## 責務\nPlans the skill creation process",
        },
        outputSchema: JSON.stringify({
          $schema: "http://json-schema.org/draft-07/schema#",
          type: "object",
        }),
      });

      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: {} as any,
        verificationEngine: new SkillCreatorVerificationEngine(),
      });

      const result = await facade.verifySkill(dir);
      expect(result.some((c) => c.layer === "layer3")).toBe(true);
      expect(result.some((c) => c.layer === "layer4")).toBe(true);
    });

    it("T-LOOP-04: WorkflowEngine と VerificationEngine の結合で verifyResult が更新されること", async () => {
      const { RuntimeSkillCreatorFacade } =
        await import("../RuntimeSkillCreatorFacade");

      const dir = await createSkillFixture(tmpDir, {
        skillMd: [
          "# My Skill",
          "",
          "## 概要",
          "Overview",
          "",
          "## Trigger",
          "When triggered by user action",
          "",
          "## Anchors",
          "- anchor1",
          "",
          "Use planner.md for planning.",
        ].join("\n"),
        agents: {
          "planner.md":
            "# Planner\n\n## 責務\nPlans the workflow in detail for this skill",
        },
        references: true,
        outputSchema: JSON.stringify({
          $schema: "http://json-schema.org/draft-07/schema#",
          type: "object",
        }),
      });

      const workflowSnapshot = {
        planId: "plan-001",
        currentPhase: "verify" as const,
        verifyResult: {
          status: "pass" as const,
          nextAction: "handoff" as const,
        },
      };
      const mockWorkflowEngine = {
        recordVerifyPass: vi.fn().mockReturnValue(workflowSnapshot),
        recordImproveAttempt: vi.fn(),
        recordVerifyFailure: vi.fn(),
        getWorkflowState: vi.fn().mockReturnValue(workflowSnapshot),
      };

      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: {} as any,
        workflowEngine: mockWorkflowEngine as never,
        verificationEngine: new SkillCreatorVerificationEngine(),
      });

      const result = await facade.verifyAndImproveLoop(
        "plan-001",
        dir,
        "test-skill",
        "api-key",
      );

      expect(result.finalStatus).toBe("pass");
      expect(result.totalAttempts).toBe(0);
      expect(result.workflowSnapshot).toEqual(workflowSnapshot);
      expect(mockWorkflowEngine.recordVerifyPass).toHaveBeenCalledTimes(1);
      expect(
        mockWorkflowEngine.recordVerifyPass.mock.calls[0][1].some(
          (check: RuntimeSkillCreatorVerifyCheck) => check.layer === "layer3",
        ),
      ).toBe(true);
      expect(
        mockWorkflowEngine.recordVerifyPass.mock.calls[0][1].some(
          (check: RuntimeSkillCreatorVerifyCheck) => check.layer === "layer4",
        ),
      ).toBe(true);

      const governanceState = facade.getGovernanceState();
      expect(governanceState.phase).toBe("verify");
      expect(governanceState.recentAuditEvents.at(-1)?.eventType).toBe(
        "session_end",
      );
    });

    // ── verify→improve→reverify Edge Cases ──
    it("T-LOOP-EC-01: verify→ファイル削除→re-verify で L3 チェックが変化すること", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## Trigger\nWhen you need to do something",
        agents: { "a.md": "# A\n\n## 責務\nDoes things for users" },
        outputSchema: JSON.stringify({
          $schema: "http://json-schema.org/draft-07/schema#",
          type: "object",
        }),
      });

      // 1回目: L3-001 が info（$schema あり）
      const firstChecks = await engine.verify(dir);
      expect(findCheck(firstChecks, "L3-001")?.severity).toBe("info");

      // output-schema.json を削除する
      await fs.rm(path.join(dir, "output-schema.json"));

      // 2回目: L3-001 が emit されない
      const secondChecks = await engine.verify(dir);
      expect(findCheck(secondChecks, "L3-001")).toBeUndefined();
    });

    it("T-LOOP-EC-02: verify→改善なし→re-verify で同じ severity が返ること（冪等性）", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## Anchors\nNo list items.",
        agents: { "a.md": "# A\n\n## 責務\nDoes things for users" },
      });

      const firstChecks = await engine.verify(dir);
      const secondChecks = await engine.verify(dir);

      expect(findCheck(firstChecks, "L4-001")?.severity).toBe(
        findCheck(secondChecks, "L4-001")?.severity,
      );
    });

    it("T-LOOP-EC-03: 複数の Layer3/4 チェックが fail する fixture で全 fail が配列に含まれること", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## Trigger\nABC\n\n## Anchors\nNo list items.",
        agents: { "a.md": "# A\n\n## 責務\nXYZ" },
        outputSchema: JSON.stringify({ type: "invalid_type" }),
      });

      const checks = await engine.verify(dir);
      // L3-001: warning ($schema なし)
      expect(findCheck(checks, "L3-001")?.severity).toBe("warning");
      // L3-002: error (invalid type)
      expect(findCheck(checks, "L3-002")?.severity).toBe("error");
      // L3-003: warning (短い責務)
      const l3003 = checks.filter((c) => c.id === "L3-003");
      expect(l3003.some((c) => c.severity === "warning")).toBe(true);
      // L3-004: warning (短い Trigger)
      expect(findCheck(checks, "L3-004")?.severity).toBe("warning");
      // L4-001: error (Anchors にリスト項目なし)
      expect(findCheck(checks, "L4-001")?.severity).toBe("error");
    });
  });

  // ── Facade Injection ──
  describe("Facade injection", () => {
    it("T-FAC-01: engine injected returns results", async () => {
      // Dynamically import Facade to test injection
      const { RuntimeSkillCreatorFacade } =
        await import("../RuntimeSkillCreatorFacade");

      const skillDir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## 概要\nO\n\n## Trigger\nT\n\n## Anchors\nA",
        agents: { "a.md": "# A\n\n## 責務\nR" },
      });

      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: {} as any,
        verificationEngine: new SkillCreatorVerificationEngine(),
      });

      const result = await facade.verifySkill(skillDir);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((c) => c.layer === "layer1")).toBe(true);
      expect(result.some((c) => c.layer === "layer2")).toBe(true);
      const governanceState = facade.getGovernanceState();
      expect(governanceState.phase).toBe("verify");
      expect(governanceState.recentAuditEvents.at(-1)?.eventType).toBe(
        "session_end",
      );
    });

    it("T-FAC-02: engine not injected returns empty array", async () => {
      const { RuntimeSkillCreatorFacade } =
        await import("../RuntimeSkillCreatorFacade");

      const facade = new RuntimeSkillCreatorFacade({
        skillExecutor: {} as any,
      });

      const result = await facade.verifySkill("/nonexistent");
      expect(result).toEqual([]);
    });
  });
});
