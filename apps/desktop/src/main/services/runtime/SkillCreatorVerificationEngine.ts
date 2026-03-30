import * as fs from "fs/promises";
import * as path from "path";
import type {
  RuntimeSkillCreatorVerifyCheck,
  RuntimeSkillCreatorVerifyCheckSeverity,
} from "@repo/shared";

// ── helpers ──────────────────────────────────────────

function createCheck(
  id: string,
  layer: "layer1" | "layer2",
  severity: RuntimeSkillCreatorVerifyCheckSeverity,
  summary: string,
  evidenceSummary?: string,
): RuntimeSkillCreatorVerifyCheck {
  return { id, layer, severity, summary, evidenceSummary };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function directoryExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function readFileContent(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return null;
  }
}

function hasMarkdownSection(content: string, heading: string): boolean {
  const pattern = new RegExp(`^##\\s+${escapeRegex(heading)}`, "m");
  return pattern.test(content);
}

function hasH1Heading(content: string): boolean {
  return /^#\s+.+/m.test(content);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Layer 1 Validator ────────────────────────────────

async function validateLayer1(
  skillDir: string,
): Promise<RuntimeSkillCreatorVerifyCheck[]> {
  const checks: RuntimeSkillCreatorVerifyCheck[] = [];

  // L1-001: SKILL.md existence
  const skillMdPath = path.join(skillDir, "SKILL.md");
  const skillMdExists = await fileExists(skillMdPath);
  checks.push(
    createCheck(
      "L1-001",
      "layer1",
      skillMdExists ? "info" : "error",
      skillMdExists ? "SKILL.md exists" : "SKILL.md is missing",
      `path: ${skillMdPath}`,
    ),
  );

  // L1-002: agents/ directory existence
  const agentsDir = path.join(skillDir, "agents");
  const agentsDirExists = await directoryExists(agentsDir);
  checks.push(
    createCheck(
      "L1-002",
      "layer1",
      agentsDirExists ? "info" : "error",
      agentsDirExists
        ? "agents/ directory exists"
        : "agents/ directory is missing",
      `path: ${agentsDir}`,
    ),
  );

  // L1-003: agents/ has at least one file
  if (agentsDirExists) {
    try {
      const entries = await fs.readdir(agentsDir);
      const hasFiles = entries.length > 0;
      checks.push(
        createCheck(
          "L1-003",
          "layer1",
          hasFiles ? "info" : "error",
          hasFiles
            ? `agents/ contains ${entries.length} file(s)`
            : "agents/ directory is empty",
          `path: ${agentsDir}, count: ${entries.length}`,
        ),
      );
    } catch {
      checks.push(
        createCheck(
          "L1-003",
          "layer1",
          "error",
          "Failed to read agents/ directory",
          `path: ${agentsDir}, reason: read error`,
        ),
      );
    }
  } else {
    checks.push(
      createCheck(
        "L1-003",
        "layer1",
        "error",
        "agents/ directory does not exist, cannot check contents",
        `path: ${agentsDir}`,
      ),
    );
  }

  // L1-004: references/ directory existence (warning)
  const refsDir = path.join(skillDir, "references");
  const refsDirExists = await directoryExists(refsDir);
  checks.push(
    createCheck(
      "L1-004",
      "layer1",
      refsDirExists ? "info" : "warning",
      refsDirExists
        ? "references/ directory exists"
        : "references/ directory is missing",
      `path: ${refsDir}`,
    ),
  );

  // L1-005: output-schema.json existence (warning)
  const schemaPath = path.join(skillDir, "output-schema.json");
  const schemaExists = await fileExists(schemaPath);
  checks.push(
    createCheck(
      "L1-005",
      "layer1",
      schemaExists ? "info" : "warning",
      schemaExists
        ? "output-schema.json exists"
        : "output-schema.json is missing",
      `path: ${schemaPath}`,
    ),
  );

  return checks;
}

// ── Layer 2 Validator ────────────────────────────────

async function validateLayer2(
  skillDir: string,
): Promise<RuntimeSkillCreatorVerifyCheck[]> {
  const checks: RuntimeSkillCreatorVerifyCheck[] = [];

  // ── SKILL.md content checks ──
  const skillMdPath = path.join(skillDir, "SKILL.md");
  const skillMdContent = await readFileContent(skillMdPath);

  if (skillMdContent !== null) {
    // L2-001: H1 heading
    const hasH1 = hasH1Heading(skillMdContent);
    checks.push(
      createCheck(
        "L2-001",
        "layer2",
        hasH1 ? "info" : "error",
        hasH1
          ? "SKILL.md has H1 heading"
          : "SKILL.md is missing H1 heading (skill name)",
        `path: ${skillMdPath}`,
      ),
    );

    // L2-002: 概要 section (mapped from "Trigger" in catalog — actually checks overview)
    const hasSummary = hasMarkdownSection(skillMdContent, "概要");
    checks.push(
      createCheck(
        "L2-002",
        "layer2",
        hasSummary ? "info" : "error",
        hasSummary
          ? "SKILL.md has overview section"
          : "SKILL.md is missing overview section",
        `path: ${skillMdPath}`,
      ),
    );

    // L2-003: Trigger section
    const hasTrigger = hasMarkdownSection(skillMdContent, "Trigger");
    checks.push(
      createCheck(
        "L2-003",
        "layer2",
        hasTrigger ? "info" : "error",
        hasTrigger
          ? "SKILL.md has Trigger section"
          : "SKILL.md is missing Trigger section",
        `path: ${skillMdPath}`,
      ),
    );

    // L2-004: Anchors section (warning)
    const hasAnchors = hasMarkdownSection(skillMdContent, "Anchors");
    checks.push(
      createCheck(
        "L2-004",
        "layer2",
        hasAnchors ? "info" : "warning",
        hasAnchors
          ? "SKILL.md has Anchors section"
          : "SKILL.md is missing Anchors section",
        `path: ${skillMdPath}`,
      ),
    );
  } else {
    // SKILL.md unreadable — skip L2-001〜L2-004
    for (const [id, label] of [
      ["L2-001", "H1 heading"],
      ["L2-002", "overview section"],
      ["L2-003", "Trigger section"],
      ["L2-004", "Anchors section"],
    ] as const) {
      checks.push(
        createCheck(
          id,
          "layer2",
          "error",
          `Cannot check ${label}: SKILL.md is unreadable`,
          `path: ${skillMdPath}, reason: file unreadable`,
        ),
      );
    }
  }

  // ── agent spec checks ──
  const agentsDir = path.join(skillDir, "agents");
  if (await directoryExists(agentsDir)) {
    try {
      const entries = await fs.readdir(agentsDir);
      const mdFiles = entries.filter((e) => e.endsWith(".md"));

      if (mdFiles.length > 0) {
        for (const file of mdFiles) {
          const filePath = path.join(agentsDir, file);
          const content = await readFileContent(filePath);

          if (content !== null) {
            // L2-005: agent H1 heading
            const agentHasH1 = hasH1Heading(content);
            checks.push(
              createCheck(
                "L2-005",
                "layer2",
                agentHasH1 ? "info" : "error",
                agentHasH1
                  ? `Agent ${file} has H1 heading`
                  : `Agent ${file} is missing H1 heading`,
                `path: ${filePath}`,
              ),
            );

            // L2-006: agent 責務 section
            const hasResponsibility = hasMarkdownSection(content, "責務");
            checks.push(
              createCheck(
                "L2-006",
                "layer2",
                hasResponsibility ? "info" : "warning",
                hasResponsibility
                  ? `Agent ${file} has responsibility section`
                  : `Agent ${file} is missing responsibility section`,
                `path: ${filePath}`,
              ),
            );
          } else {
            checks.push(
              createCheck(
                "L2-005",
                "layer2",
                "error",
                `Agent ${file} is unreadable`,
                `path: ${filePath}, reason: file unreadable`,
              ),
            );
          }
        }
      }
    } catch {
      checks.push(
        createCheck(
          "L2-005",
          "layer2",
          "error",
          "Failed to read agents/ directory for content validation",
          `path: ${agentsDir}, reason: read error`,
        ),
      );
    }
  }

  // ── L2-007: output-schema.json validity ──
  const schemaPath = path.join(skillDir, "output-schema.json");
  const schemaContent = await readFileContent(schemaPath);
  if (schemaContent !== null) {
    try {
      JSON.parse(schemaContent);
      checks.push(
        createCheck(
          "L2-007",
          "layer2",
          "info",
          "output-schema.json is valid JSON",
          `path: ${schemaPath}`,
        ),
      );
    } catch {
      checks.push(
        createCheck(
          "L2-007",
          "layer2",
          "error",
          "output-schema.json is not valid JSON",
          `path: ${schemaPath}, reason: JSON parse error`,
        ),
      );
    }
  }

  return checks;
}

// ── Engine ────────────────────────────────────────────

export class SkillCreatorVerificationEngine {
  async verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]> {
    const layer1Checks = await validateLayer1(skillDir);
    const layer2Checks = await validateLayer2(skillDir);
    return [...layer1Checks, ...layer2Checks];
  }
}
