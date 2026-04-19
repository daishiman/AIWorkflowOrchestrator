#!/usr/bin/env node
/**
 * features 生成スクリプト
 * スキルの説明から機能一覧を生成します
 *
 * 使用例:
 *   node generate_features.js --description "文章を要約するスキル"
 *   node generate_features.js --description "文章を要約するスキル" --agent "<agent-content>"
 */

import { execFileSync } from "node:child_process";
import { EXIT_CODES, getArg } from "./utils.js";

const args = process.argv.slice(2);

const description = getArg(args, "--description") ?? getArg(args, "-d") ?? "";
const agentContent = getArg(args, "--agent") ?? "";

if (!description) {
  process.stderr.write("Error: --description is required\n");
  process.exit(EXIT_CODES.ARGS_ERROR ?? 2);
}

try {
  const agentSection = agentContent
    ? `\nエージェント仕様:\n${agentContent.substring(0, 500)}\n`
    : "";
  const prompt =
    `スキルの説明: ${description}${agentSection}\n\n` +
    `このスキルの機能一覧（features）をJSON配列で出力してください。` +
    `各要素は短い説明文（1文）で、3〜6個程度。\n\n` +
    `出力形式（JSON配列のみ）:\n["機能1", "機能2", "機能3"]`;

  const result = execFileSync("claude", ["--print", prompt], {
    timeout: 30000,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  const match = result.match(/\[[\s\S]*?\]/);
  if (!match) throw new Error("No JSON array in response");
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed) || parsed.length === 0)
    throw new Error("Empty array");
  const features = parsed.filter(
    (item) => typeof item === "string" && item.length > 0,
  );
  if (features.length === 0) throw new Error("No valid string features");
  process.stdout.write(JSON.stringify(features) + "\n");
} catch {
  process.stderr.write("Error: failed to generate features with claude\n");
  process.exit(EXIT_CODES.ERROR ?? 1);
}
