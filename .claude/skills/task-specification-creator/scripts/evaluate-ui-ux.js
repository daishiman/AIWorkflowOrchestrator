import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import { glob } from "glob";
import { encodeScreenshot } from "./evaluate-ui-ux-screenshot.js";
import { loadPrompt } from "./evaluate-ui-ux-prompt-loader.js";
import { saveEvaluationReport } from "./evaluate-ui-ux-report-formatter.js";
import { generateUnassignedTasks } from "./evaluate-ui-ux-unassigned-task.js";

const client = new Anthropic();

const VALID_SEVERITIES = new Set(["HIGH", "MEDIUM", "LOW"]);

/**
 * Claude API レスポンスをバリデーション付きでパースする
 * 寛容バリデーション: 欠如フィールドはデフォルト空配列で補完
 * @param {string} jsonText
 * @returns {import('./evaluate-ui-ux-types').UXEvaluationResult}
 */
function parseEvaluationResponse(jsonText) {
  const parsed = JSON.parse(jsonText);

  const rawIssues = Array.isArray(parsed.usabilityIssues)
    ? parsed.usabilityIssues
    : [];
  const rawConcerns = Array.isArray(parsed.accessibilityConcerns)
    ? parsed.accessibilityConcerns
    : [];
  const rawImprovements = Array.isArray(parsed.improvements)
    ? parsed.improvements
    : [];

  return {
    usabilityIssues: rawIssues.map((i, idx) => ({
      id: String(i.id ?? `UX-${String(idx + 1).padStart(3, "0")}`),
      description: String(i.description ?? ""),
      severity: VALID_SEVERITIES.has(String(i.severity))
        ? String(i.severity)
        : "MEDIUM",
    })),
    accessibilityConcerns: rawConcerns.map((c, idx) => ({
      id: String(c.id ?? `A11Y-${String(idx + 1).padStart(3, "0")}`),
      concern: String(c.concern ?? ""),
      wcagCriteria: String(c.wcagCriteria ?? "unknown"),
      severity: VALID_SEVERITIES.has(String(c.severity))
        ? String(c.severity)
        : "MEDIUM",
    })),
    improvements: rawImprovements.map((i, idx) => ({
      priority: typeof i.priority === "number" ? i.priority : idx + 1,
      suggestion: String(i.suggestion ?? ""),
      effort: VALID_SEVERITIES.has(String(i.effort))
        ? String(i.effort)
        : "MEDIUM",
    })),
  };
}

/**
 * Claude API でスクリーンショットを評価
 * @param {string[]} screenshotPaths
 * @param {string} taskContext
 * @returns {Promise<import('./evaluate-ui-ux-types').UXEvaluationResult>}
 */
async function evaluateUIWithClaude(
  screenshotPaths,
  taskContext = "AIWorkflowOrchestrator multi_select UI コンポーネント",
) {
  if (screenshotPaths.length === 0) {
    throw new Error("評価対象のスクリーンショットが 0 件です");
  }

  const imageContents = screenshotPaths.map((p) => ({
    type: "image",
    source: {
      type: "base64",
      media_type: "image/png",
      data: encodeScreenshot(p),
    },
  }));

  const promptText = loadPrompt("evaluate-ui-ux.md", { taskContext }, [
    "評価プロンプト",
    "重要度基準",
  ]);

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          ...imageContents,
          { type: "text", text: promptText },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  const jsonText = content.text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return parseEvaluationResponse(jsonText);
}

/**
 * CLI エントリポイント
 */
async function main() {
  const args = process.argv.slice(2);
  const screenshotIndex = args.indexOf("--screenshot");
  const outputIndex = args.indexOf("--output");
  const taskIndex = args.indexOf("--task-id");

  if (screenshotIndex === -1) {
    console.error(
      "Usage: node evaluate-ui-ux.js --screenshot <path> [--output <dir>] [--task-id <id>]",
    );
    process.exit(1);
  }

  const screenshotPath = args[screenshotIndex + 1];
  const outputDir =
    outputIndex !== -1 ? args[outputIndex + 1] : "outputs/phase-11";
  const taskId =
    taskIndex !== -1 ? args[taskIndex + 1] : "TASK-UIUX-FEEDBACK-001";

  const screenshotPaths = screenshotPath.includes("*")
    ? await glob(screenshotPath)
    : [screenshotPath];

  if (screenshotPaths.length === 0) {
    throw new Error(
      `スクリーンショットが見つかりません: ${screenshotPath}`,
    );
  }

  console.log(`評価対象: ${screenshotPaths.length} 枚のスクリーンショット`);

  const result = await evaluateUIWithClaude(screenshotPaths, taskId);

  await saveEvaluationReport(
    result,
    path.join(outputDir, "ai-ux-evaluation.md"),
    taskId,
  );

  const generatedFiles = await generateUnassignedTasks(
    result,
    "unassigned-task",
    taskId,
  );

  console.log(
    `\n評価完了: ${generatedFiles.length} 件の unassigned-task を生成`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  evaluateUIWithClaude,
  encodeScreenshot,
  saveEvaluationReport,
  generateUnassignedTasks,
};
