#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

// Extract description from SKILL.md (before "Anchors:" section)
function extractDescription(content) {
  const lines = content.split("\n");
  let inDescription = false;
  let description = [];

  for (const line of lines) {
    if (line.trim().startsWith("description:")) {
      inDescription = true;
      continue;
    }

    if (inDescription) {
      // Stop at Anchors section or next YAML field
      if (
        line.trim().startsWith("anchors:") ||
        line.trim().startsWith("tags:") ||
        line.trim().startsWith("---") ||
        (line.match(/^[a-z_]+:/) && !line.trim().startsWith("  "))
      ) {
        break;
      }

      // Skip empty lines at the start
      if (!description.length && !line.trim()) {
        continue;
      }

      // Stop at metadata sections (📖, 📚, Trigger:, etc.)
      if (
        line.trim().startsWith("📖") ||
        line.trim().startsWith("📚") ||
        line.trim().startsWith("Trigger:") ||
        line.trim().startsWith("Anchors:")
      ) {
        break;
      }

      description.push(line.trim());
    }
  }

  // Clean up the description
  let result = description.join(" ").replace(/\s+/g, " ").trim();

  // Remove leading ">" or "|" characters
  result = result.replace(/^[>|]\s*/, "");

  // Get first 1-2 sentences
  // Try to split by Japanese period first, then English period
  let sentences;
  if (result.includes("。")) {
    sentences = result.split("。").filter((s) => s.trim());
    // Take first 1-2 sentences
    result = sentences.slice(0, 2).join("。");
    if (result && !result.endsWith("。")) {
      result += "。";
    }
  } else if (result.includes(". ")) {
    sentences = result.split(/\.\s+/);
    // Take first 1-2 sentences
    result = sentences.slice(0, 2).join(". ");
    if (result && !result.endsWith(".")) {
      result += ".";
    }
  }

  // Truncate if still too long (over 150 characters)
  if (result.length > 150) {
    result = result.substring(0, 150) + "...";
  }

  return result;
}

// Read all SKILL.md files and extract data
function getAllSkills() {
  const skillsDir = path.join(projectRoot, ".claude/skills");
  const skills = {};

  const dirs = fs.readdirSync(skillsDir);

  for (const dir of dirs) {
    const skillPath = path.join(skillsDir, dir, "SKILL.md");
    if (fs.existsSync(skillPath)) {
      const content = fs.readFileSync(skillPath, "utf-8");
      const description = extractDescription(content);
      const relativePath = `.claude/skills/${dir}/SKILL.md`;

      skills[dir] = {
        path: relativePath,
        description: description || "説明なし",
      };
    }
  }

  return skills;
}

// Agent to skills mapping based on existing skill_list.md
const agentSkillMap = {
  "API Document Writer": [
    "openapi-specification",
    "swagger-ui",
    "api-versioning",
    "request-response-examples",
    "authentication-docs",
    "api-documentation-best-practices",
  ],
  "Architecture Police": [
    "clean-architecture-principles",
    "solid-principles",
    "dependency-analysis",
    "architectural-patterns",
    "code-smell-detection",
  ],
  "Auth Specialist": [
    "oauth2-flows",
    "session-management",
    "rbac-implementation",
    "nextauth-patterns",
    "security-headers",
  ],
  "Code Quality Manager": [
    "eslint-configuration",
    "prettier-integration",
    "static-analysis",
    "code-style-guides",
    "commit-hooks",
  ],
  "Command Architect": [
    "command-naming-conventions",
    "command-placement-priority",
    "command-structure-fundamentals",
    "command-arguments-system",
    "command-basic-patterns",
    "command-advanced-patterns",
    "command-activation-mechanisms",
    "command-security-design",
    "command-error-handling",
    "command-documentation-patterns",
    "command-best-practices",
    "command-performance-optimization",
    "command-agent-skill-integration",
    "skill-name",
  ],
  "DB Schema Architect": [
    "database-normalization",
    "indexing-strategies",
    "sql-anti-patterns",
    "json-optimization",
    "foreign-key-constraints",
    "transaction-management",
    "query-optimization",
    "database-migrations",
  ],
  "Database Administrator": [
    "database-migrations",
    "backup-recovery",
    "query-performance-tuning",
    "database-seeding",
    "connection-pooling",
    "database-monitoring",
  ],
  "Dependency Manager": [
    "semantic-versioning",
    "dependency-auditing",
    "lock-file-management",
    "upgrade-strategies",
    "monorepo-dependency-management",
  ],
  "DevOps/CI Engineer": [
    "ci-cd-pipelines",
    "infrastructure-as-code",
    "deployment-strategies",
    "monitoring-alerting",
    "docker-best-practices",
    "security-scanning",
  ],
  "Domain Modeler": [
    "domain-driven-design",
    "ubiquitous-language",
    "value-object-patterns",
    "domain-services",
    "bounded-context",
  ],
  "E2E Tester Agent": [
    "playwright-testing",
    "test-data-management",
    "flaky-test-prevention",
    "visual-regression-testing",
    "api-mocking",
  ],
  "Electron Architect": ["electron-architecture"],
  "Electron Builder": ["electron-packaging"],
  "Electron DevOps": ["electron-packaging", "electron-distribution"],
  "Electron Release Manager": ["electron-distribution"],
  "Electron Security Engineer": ["electron-security-hardening"],
  "Electron UI Developer": ["electron-ui-patterns", "accessibility-wcag"],
  "Frontend Tester": ["frontend-testing"],
  "Gateway Developer": [
    "api-client-patterns",
    "retry-strategies",
    "http-best-practices",
    "authentication-flows",
    "rate-limiting",
  ],
  "GitHub Actions Workflow Architect": [
    "github-actions-syntax",
    "github-actions-expressions",
    "github-actions-debugging",
    "workflow-templates",
    "reusable-workflows",
    "matrix-builds",
    "caching-strategies-gha",
    "secrets-management-gha",
    "self-hosted-runners",
    "parallel-jobs-gha",
    "conditional-execution-gha",
    "artifact-management-gha",
    "deployment-environments-gha",
    "notification-integration-gha",
    "cost-optimization-gha",
    "docker-build-push-action",
    "github-api-integration",
    "workflow-security",
    "composite-actions",
    "concurrency-control",
  ],
  "Hook Master": [
    "git-hooks-concepts",
    "claude-code-hooks",
    "automation-scripting",
    "linting-formatting-automation",
    "approval-gates",
  ],
  "Network Sync Agent": [
    "multipart-upload",
    "network-resilience",
    "retry-strategies",
    "websocket-patterns",
    "agent-architecture-patterns",
    "multi-agent-systems",
  ],
  "Local File Watcher Agent": [
    "event-driven-file-watching",
    "debounce-throttle-patterns",
    "file-exclusion-patterns",
    "nodejs-stream-processing",
    "graceful-shutdown-patterns",
    "file-watcher-security",
    "file-watcher-observability",
  ],
  "Logic Developer": [
    "refactoring-techniques",
    "tdd-red-green-refactor",
    "clean-code-practices",
    "transaction-script",
    "test-doubles",
  ],
  "Manual Writer": [
    "user-centric-writing",
    "tutorial-design",
    "troubleshooting-guides",
    "information-architecture",
    "localization-i18n",
  ],
  "MCP Tool Integration Specialist": [
    "mcp-protocol",
    "api-connector-design",
    "tool-security",
    "resource-oriented-api",
    "integration-patterns",
  ],
  "Meta-Agent Designer": [
    "agent-architecture-patterns",
    "agent-structure-design",
    "agent-persona-design",
    "tool-permission-management",
    "agent-dependency-design",
    "multi-agent-systems",
    "project-architecture-integration",
    "agent-quality-standards",
    "agent-validation-testing",
    "agent-template-patterns",
    "prompt-engineering-for-agents",
    "agent-lifecycle-management",
  ],
  "Process Manager": [
    "pm2-ecosystem-config",
    "log-rotation-strategies",
    "memory-monitoring-strategies",
    "graceful-shutdown-patterns",
    "health-check-implementation",
    "process-lifecycle-management",
  ],
  "Product Manager": [
    "agile-project-management",
    "sprint-planning",
    "user-story-mapping",
    "estimation-techniques",
    "stakeholder-communication",
    "product-vision",
    "prioritization-frameworks",
    "metrics-tracking",
    "backlog-management",
    "risk-management",
  ],
  "Prompt Engineering Specialist": [
    "chain-of-thought",
    "few-shot-learning-patterns",
    "role-prompting",
    "prompt-versioning-management",
    "hallucination-prevention",
    "structured-output",
    "context-window-optimization",
    "error-recovery-prompts",
    "prompt-injection-defense",
    "multi-turn-conversation",
    "task-decomposition",
    "prompt-engineering-for-agents",
    "structured-output-design",
    "chain-of-thought-reasoning",
    "prompt-testing-evaluation",
    "context-optimization",
    "agent-persona-design",
    "documentation-architecture",
    "best-practices-curation",
  ],
  "Repository Developer": [
    "repository-pattern",
    "orm-best-practices",
    "transaction-management",
    "query-optimization",
    "connection-pooling",
    "database-migrations",
  ],
  "Requirements Analyst": [
    "requirements-triage",
    "ambiguity-elimination",
    "use-case-modeling",
    "acceptance-criteria-writing",
    "functional-non-functional-requirements",
    "interview-techniques",
    "requirements-verification",
    "requirements-documentation",
  ],
  "Router Developer": [
    "nextjs-app-router",
    "server-components-patterns",
    "seo-optimization",
    "web-performance",
    "error-boundary",
    "data-fetching-strategies",
  ],
  "Schema Definition Specialist": [
    "zod-validation",
    "type-safety-patterns",
    "api-contract-design",
    "form-validation",
    "data-transformation",
    "input-sanitization",
    "error-message-design",
    "json-schema",
  ],
  "Security Auditor Agent": [
    "authentication-authorization-security",
    "cryptographic-practices",
    "security-configuration-review",
    "dependency-security-scanning",
    "code-static-analysis-security",
    "rate-limiting",
    "input-sanitization",
    "security-reporting",
    "ci-cd-pipelines",
  ],
  "Secret Manager": [
    "secret-management-architecture",
    "zero-trust-security",
    "gitignore-management",
    "pre-commit-security",
    "encryption-key-lifecycle",
    "environment-isolation",
    "railway-secrets-management",
    "github-actions-security",
    "tool-permission-management",
    "best-practices-curation",
    "project-architecture-integration",
    "agent-architecture-patterns",
    "context-optimization",
  ],
  "Skill Librarian": [
    "knowledge-management",
    "progressive-disclosure",
    "documentation-architecture",
    "context-optimization",
    "best-practices-curation",
    "skill-creation-workflow",
    "skill-librarian-commands",
    "skill-creator",
    "skill-name-1",
    "skill-name-2",
    "skill-name",
  ],
  "Spec Writer": [
    "markdown-advanced-syntax",
    "technical-documentation-standards",
    "api-documentation-best-practices",
    "structured-writing",
    "version-control-for-docs",
  ],
  "SRE Observer": [
    "structured-logging",
    "observability-pillars",
    "slo-sli-design",
    "alert-design",
    "distributed-tracing",
  ],
  "State Manager": [
    "react-hooks-advanced",
    "data-fetching-strategies",
    "state-lifting",
    "custom-hooks-patterns",
    "error-boundary",
    "performance-optimization-react",
  ],
  "UI Designer": [
    "design-system-architecture",
    "component-composition-patterns",
    "headless-ui-principles",
    "tailwind-css-patterns",
    "accessibility-wcag",
    "apple-hig-guidelines",
  ],
  "Unit Tester": [
    "tdd-principles",
    "test-doubles",
    "vitest-advanced",
    "boundary-value-analysis",
    "test-naming-conventions",
  ],
  "Workflow Engine": [
    "design-patterns-behavioral",
    "plugin-architecture",
    "interface-segregation",
    "factory-patterns",
    "open-closed-principle",
  ],
};

// Generate the new skill_list.md
function generateSkillList(skills) {
  let output = "# スキル一覧\n\n";

  // Process each agent
  for (const [agentName, skillNames] of Object.entries(agentSkillMap)) {
    output += `## ${agentName}\n\n`;
    output += "| パス | 概要 |\n";
    output += "| ---- | ---- |\n";

    for (const skillName of skillNames) {
      const skill = skills[skillName];
      if (skill) {
        output += `| \`${skill.path}\` | ${skill.description} |\n`;
      } else {
        console.warn(
          `Warning: Skill "${skillName}" not found for agent "${agentName}"`,
        );
      }
    }

    output += "\n";
  }

  return output;
}

// Main execution
console.log("Reading all SKILL.md files...");
const skills = getAllSkills();
console.log(`Found ${Object.keys(skills).length} skills`);

console.log("Generating new skill_list.md...");
const newContent = generateSkillList(skills);

const outputPath = path.join(projectRoot, ".claude/skills/skill_list.md");
fs.writeFileSync(outputPath, newContent, "utf-8");

console.log(`✅ Successfully regenerated ${outputPath}`);
