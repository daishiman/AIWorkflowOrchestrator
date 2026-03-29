import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { SkillCreatorVerificationEngine } from "../SkillCreatorVerificationEngine";
import type { RuntimeSkillCreatorVerifyCheck } from "@repo/shared";

// ── fixture helper ───────────────────────────────────

// TODO(human): createSkillFixture を実装してください
// この関数は一時ディレクトリにスキルの構造を組み立てます。
// options に応じて SKILL.md, agents/, references/, output-schema.json を配置します。
interface SkillFixtureOptions {
  /** SKILL.md の内容。false で作成しない */
  skillMd?: string | false;
  /** agents/ 配下のファイル群。false で agents/ 自体を作らない */
  agents?: Record<string, string> | false;
  /** references/ を作るか */
  references?: boolean;
  /** output-schema.json の内容。false で作成しない */
  outputSchema?: string | false;
}

async function createSkillFixture(
  baseDir: string,
  options: SkillFixtureOptions,
): Promise<string> {
  const skillDir = path.join(baseDir, "test-skill");
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
