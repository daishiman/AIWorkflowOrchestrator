import * as fs from "fs/promises";
import * as path from "path";
import type {
  RuntimeSkillCreatorVerifyCheck,
  RuntimeSkillCreatorVerifyCheckSeverity,
} from "@repo/shared";

// ── helpers ──────────────────────────────────────────

function createCheck(
  id: string,
  layer: "layer1" | "layer2" | "layer3" | "layer4",
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
  const pattern = new RegExp(`^##\\s+${escapeRegex(heading)}\\s*$`, "m");
  return pattern.test(content);
}

function hasH1Heading(content: string): boolean {
  return /^#\s+.+/m.test(content);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isObjectLikeRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

// ── Layer 3 Validator ────────────────────────────────

const VALID_JSON_SCHEMA_TYPES = new Set([
  "object",
  "array",
  "string",
  "number",
  "integer",
  "boolean",
  "null",
]);

function extractSectionContent(
  content: string,
  heading: string,
): string | null {
  const sectionStart = new RegExp(`^##\\s+${escapeRegex(heading)}\\s*$`, "m");
  const match = sectionStart.exec(content);
  if (!match) return null;
  const afterHeading = content.slice(match.index + match[0].length);
  const nextSection = /^##\s/m.exec(afterHeading);
  return afterHeading.slice(
    0,
    nextSection ? nextSection.index : afterHeading.length,
  );
}

async function validateLayer3(
  skillDir: string,
): Promise<RuntimeSkillCreatorVerifyCheck[]> {
  const checks: RuntimeSkillCreatorVerifyCheck[] = [];

  // ── L3-001 / L3-002: output-schema.json の schema/type チェック ──
  const schemaPath = path.join(skillDir, "output-schema.json");
  const schemaContent = await readFileContent(schemaPath);

  if (schemaContent !== null) {
    let parsed: unknown = null;
    let parseSucceeded = false;
    try {
      parsed = JSON.parse(schemaContent);
      parseSucceeded = true;
    } catch {
      // JSON parse failure is already handled by L2-007; skip L3 checks
    }

    if (parseSucceeded) {
      if (!isObjectLikeRecord(parsed)) {
        checks.push(
          createCheck(
            "L3-001",
            "layer3",
            "warning",
            "output-schema.json root is not an object schema; $schema field cannot be validated",
            `path: ${schemaPath}`,
          ),
        );
        checks.push(
          createCheck(
            "L3-002",
            "layer3",
            "warning",
            "output-schema.json root is not an object schema; type field cannot be validated",
            `path: ${schemaPath}`,
          ),
        );
      } else {
        // L3-001: $schema フィールドの存在
        const hasSchemaField = "$schema" in parsed;
        checks.push(
          createCheck(
            "L3-001",
            "layer3",
            hasSchemaField ? "info" : "warning",
            hasSchemaField
              ? "output-schema.json has $schema field"
              : "output-schema.json is missing $schema field (JSON Schema draft-07 recommended)",
            `path: ${schemaPath}`,
          ),
        );

        // L3-002: type フィールドの有効性
        if (!("type" in parsed)) {
          checks.push(
            createCheck(
              "L3-002",
              "layer3",
              "warning",
              "output-schema.json is missing type field",
              `path: ${schemaPath}`,
            ),
          );
        } else {
          const typeValue = parsed["type"];
          const isValidType =
            (typeof typeValue === "string" &&
              VALID_JSON_SCHEMA_TYPES.has(typeValue)) ||
            (Array.isArray(typeValue) &&
              typeValue.length > 0 &&
              typeValue.every(
                (t): t is string =>
                  typeof t === "string" && VALID_JSON_SCHEMA_TYPES.has(t),
              ));
          checks.push(
            createCheck(
              "L3-002",
              "layer3",
              isValidType ? "info" : "error",
              isValidType
                ? `output-schema.json has valid type: ${JSON.stringify(typeValue)}`
                : `output-schema.json has invalid type: ${JSON.stringify(typeValue)}`,
              `path: ${schemaPath}`,
            ),
          );
        }
      }
    }
  }
  // output-schema.json が存在しない場合は L3-001/L3-002 を emit しない

  // ── L3-003: agent ファイルの責務記述の品質 ──
  const agentsDir = path.join(skillDir, "agents");
  if (await directoryExists(agentsDir)) {
    try {
      const entries = await fs.readdir(agentsDir);
      const mdFiles = entries.filter((e) => e.endsWith(".md"));

      for (const file of mdFiles) {
        const filePath = path.join(agentsDir, file);
        const content = await readFileContent(filePath);
        if (content !== null) {
          const sectionContent = extractSectionContent(content, "責務");
          const trimmedContent = sectionContent?.trim() ?? "";
          const contentLength = trimmedContent.length;
          const isSubstantial = contentLength >= 20;
          checks.push(
            createCheck(
              "L3-003",
              "layer3",
              isSubstantial ? "info" : "warning",
              isSubstantial
                ? `Agent ${file} has substantial responsibility description (${contentLength} chars)`
                : `Agent ${file} has minimal responsibility description (${contentLength} chars, minimum 20 required)`,
              `path: ${filePath}, length: ${contentLength}`,
            ),
          );
        }
      }
    } catch {
      // agents/ read error is handled by L1/L2; skip here
    }
  }

  // ── L3-004: SKILL.md の Trigger セクションの品質 ──
  const skillMdPath = path.join(skillDir, "SKILL.md");
  const skillMdContent = await readFileContent(skillMdPath);
  if (skillMdContent !== null) {
    const triggerContent = extractSectionContent(skillMdContent, "Trigger");
    const trimmedTrigger = triggerContent?.trim() ?? "";
    const triggerLength = trimmedTrigger.length;
    const isSubstantialTrigger = triggerLength >= 10;
    checks.push(
      createCheck(
        "L3-004",
        "layer3",
        isSubstantialTrigger ? "info" : "warning",
        isSubstantialTrigger
          ? `SKILL.md Trigger section has substantial content (${triggerLength} chars)`
          : `SKILL.md Trigger section has minimal content (${triggerLength} chars, minimum 10 required)`,
        `path: ${skillMdPath}, length: ${triggerLength}`,
      ),
    );
  }

  return checks;
}

// ── Layer 4 Validator ────────────────────────────────

async function validateLayer4(
  skillDir: string,
): Promise<RuntimeSkillCreatorVerifyCheck[]> {
  const checks: RuntimeSkillCreatorVerifyCheck[] = [];

  const skillMdPath = path.join(skillDir, "SKILL.md");
  const skillMdContent = await readFileContent(skillMdPath);

  if (skillMdContent !== null) {
    // ── L4-001: Anchors セクションにリスト項目が 1 件以上存在するか ──
    const anchorsContent = extractSectionContent(skillMdContent, "Anchors");
    if (anchorsContent !== null) {
      const hasListItem = /^\s*[-*]\s+.+/m.test(anchorsContent);
      checks.push(
        createCheck(
          "L4-001",
          "layer4",
          hasListItem ? "info" : "error",
          hasListItem
            ? "SKILL.md Anchors section has at least one list item"
            : "SKILL.md Anchors section has no list items",
          `path: ${skillMdPath}`,
        ),
      );
    } else {
      checks.push(
        createCheck(
          "L4-001",
          "layer4",
          "error",
          "SKILL.md is missing Anchors section",
          `path: ${skillMdPath}`,
        ),
      );
    }

    // ── L4-002: references/ 参照の整合性 ──
    const refsDir = path.join(skillDir, "references");
    if (await directoryExists(refsDir)) {
      // SKILL.md 内の references/ パス言及を抽出する
      const refPathPattern = /references\/([^\s)]+\.md)/g;
      const mentionedPaths: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = refPathPattern.exec(skillMdContent)) !== null) {
        mentionedPaths.push(match[1]);
      }

      if (mentionedPaths.length > 0) {
        const missingFiles: string[] = [];
        const escapedFiles: string[] = [];
        const refsRoot = path.resolve(refsDir);
        for (const refFile of mentionedPaths) {
          const refPath = path.resolve(refsDir, refFile);
          const relativeRefPath = path.relative(refsRoot, refPath);
          const isInsideRefs =
            relativeRefPath !== "" &&
            !relativeRefPath.startsWith("..") &&
            !path.isAbsolute(relativeRefPath);
          if (!isInsideRefs) {
            escapedFiles.push(refFile);
            continue;
          }
          if (!(await fileExists(refPath))) {
            missingFiles.push(refFile);
          }
        }
        const invalidFiles = [...missingFiles, ...escapedFiles];
        checks.push(
          createCheck(
            "L4-002",
            "layer4",
            invalidFiles.length === 0 ? "info" : "warning",
            invalidFiles.length === 0
              ? `All referenced files in references/ exist (${mentionedPaths.length} checked)`
              : `Some referenced files in references/ are missing or escape references/: ${invalidFiles.join(", ")}`,
            `path: ${refsDir}, mentioned: ${mentionedPaths.length}, missing: ${missingFiles.length}, escaped: ${escapedFiles.length}`,
          ),
        );
      }
      // references/ は存在するが SKILL.md 内に参照がない場合は L4-002 を emit しない
    }
    // references/ が存在しない場合は L4-002 を emit しない

    // ── L4-003: agent ファイル名が SKILL.md で言及されているか ──
    const agentsDir = path.join(skillDir, "agents");
    if (await directoryExists(agentsDir)) {
      try {
        const entries = await fs.readdir(agentsDir);
        const mdFiles = entries.filter((e) => e.endsWith(".md"));

        for (const file of mdFiles) {
          const fileMentionPattern = new RegExp(
            `(?<![A-Za-z0-9_-])${escapeRegex(file)}(?![A-Za-z0-9_-])`,
          );
          const isMentioned = fileMentionPattern.test(skillMdContent);
          checks.push(
            createCheck(
              "L4-003",
              "layer4",
              isMentioned ? "info" : "warning",
              isMentioned
                ? `Agent file ${file} is mentioned in SKILL.md`
                : `Agent file ${file} is not mentioned in SKILL.md`,
              `path: ${path.join(agentsDir, file)}`,
            ),
          );
        }
      } catch {
        // agents/ read error is handled by L1/L2; skip here
      }
    }
  }

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

    // L2-002: 概要 section
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
    const layer3Checks = await validateLayer3(skillDir);
    const layer4Checks = await validateLayer4(skillDir);
    return [...layer1Checks, ...layer2Checks, ...layer3Checks, ...layer4Checks];
  }
}
