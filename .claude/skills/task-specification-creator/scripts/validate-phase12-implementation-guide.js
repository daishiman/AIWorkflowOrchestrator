#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const PART1_HEADING = /^##\s+Part 1\b.*$/im;
const PART2_HEADING = /^##\s+Part 2\b.*$/im;
const NEXT_PART_HEADING = /^##\s+Part\s+\d+\b/;

function parseArgs(argv) {
  const args = {
    workflow: null,
    json: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--workflow" && argv[i + 1]) {
      args.workflow = argv[i + 1];
      i += 1;
    } else if (token === "--json") {
      args.json = true;
    } else {
      throw new Error(`不明なオプションです: ${token}`);
    }
  }

  if (!args.workflow) {
    throw new Error("--workflow は必須です");
  }

  return args;
}

function readUtf8(filePath) {
  return readFileSync(filePath, "utf8");
}

function extractSection(content, headingPattern) {
  const match = headingPattern.exec(content);
  if (!match || match.index < 0) {
    return "";
  }

  const section = content.slice(match.index + match[0].length);
  const nextPartIndex = findNextPartHeadingIndex(section);
  if (nextPartIndex < 0) {
    return section.trim();
  }

  return section.slice(0, nextPartIndex).trim();
}

function findNextPartHeadingIndex(section) {
  const lines = section.split("\n");
  let inFence = false;
  let offset = 0;

  for (const line of lines) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      inFence = !inFence;
    } else if (!inFence && NEXT_PART_HEADING.test(line)) {
      return offset;
    }

    offset += line.length + 1;
  }

  return -1;
}

function hasTypescriptBlock(section) {
  const codeBlocks = section.match(/```(?:ts|tsx|typescript)\n[\s\S]*?```/gi) || [];
  return codeBlocks.some((block) => /\b(?:interface|type)\b/.test(block));
}

function hasHeading(section, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^###\\s+${escapedHeading}.*$`, "m").test(section);
}

function findNextHeadingIndex(section) {
  const lines = section.split("\n");
  let inFence = false;
  let offset = 0;

  for (const line of lines) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      inFence = !inFence;
    } else if (!inFence && /^#{2,3}\s+/.test(line)) {
      return offset;
    }

    offset += line.length + 1;
  }

  return -1;
}

function extractSubsection(section, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headingPattern = new RegExp(`^###\\s+${escapedHeading}.*$`, "m");
  const match = headingPattern.exec(section);
  if (!match || match.index < 0) {
    return "";
  }

  const tail = section.slice(match.index + match[0].length);
  const nextHeadingIndex = findNextHeadingIndex(tail);
  if (nextHeadingIndex < 0) {
    return tail.trim();
  }

  return tail.slice(0, nextHeadingIndex).trim();
}

function hasApiSignature(section) {
  return (
    hasHeading(section, "APIシグネチャ") ||
    hasHeading(section, "CLIシグネチャ") ||
    /window\.electronAPI\.skill\.[a-zA-Z]+\(/.test(section) ||
    /useSkillAnalysis\s*[:=]\s*\(/.test(section) ||
    /validate[A-Za-z0-9]+\s*\(/.test(section)
  );
}

function hasUsageExample(section) {
  const usageSection = extractSubsection(section, "使用例");
  return (
    usageSection.length > 0 &&
    /```(?:bash|ts|tsx|typescript)\n[\s\S]*?```/i.test(usageSection)
  );
}

function hasWhyFirst(section) {
  const whyIndex = section.search(/なぜ|必要/);
  const whatIndex = section.search(/何をしたか|何が変わるか|何をするか|この機能でできること/);
  return whyIndex >= 0 && whatIndex >= 0 && whyIndex < whatIndex;
}

function hasAnalogy(section) {
  return /例え|たとえば|イメージ|名簿|棚卸し|本棚|教室/.test(section);
}

function hasCreatedThings(section) {
  return hasHeading(section, "今回作ったもの");
}

function hasErrorHandling(section) {
  return hasHeading(section, "エラーハンドリング");
}

function hasEdgeCases(section) {
  return hasHeading(section, "エッジケース");
}

function hasSettingsOrConstants(section) {
  return hasHeading(section, "設定項目と定数一覧");
}

function hasTestStructure(section) {
  return hasHeading(section, "テスト構成");
}

function buildChecks(content) {
  const part1 = extractSection(content, PART1_HEADING);
  const part2 = extractSection(content, PART2_HEADING);

  return [
    {
      id: "part1_exists",
      label: "Part 1 が存在する",
      ok: part1.length > 0,
    },
    {
      id: "part2_exists",
      label: "Part 2 が存在する",
      ok: part2.length > 0,
    },
    {
      id: "part1_why_first",
      label: "Part 1 が『なぜ必要か』を先に説明している",
      ok: part1.length > 0 && hasWhyFirst(part1),
    },
    {
      id: "part1_analogy",
      label: "Part 1 に日常の例えがある",
      ok: part1.length > 0 && hasAnalogy(part1),
    },
    {
      id: "part1_created_things",
      label: "Part 1 に今回作ったものがある",
      ok: part1.length > 0 && hasCreatedThings(part1),
    },
    {
      id: "part2_typescript",
      label: "Part 2 に TypeScript の型定義がある",
      ok: part2.length > 0 && hasTypescriptBlock(part2),
    },
    {
      id: "part2_api_signature",
      label: "Part 2 に API/CLI シグネチャがある",
      ok: part2.length > 0 && hasApiSignature(part2),
    },
    {
      id: "part2_usage_example",
      label: "Part 2 に使用例がある",
      ok: part2.length > 0 && hasUsageExample(part2),
    },
    {
      id: "part2_error_handling",
      label: "Part 2 にエラーハンドリング説明がある",
      ok: part2.length > 0 && hasErrorHandling(part2),
    },
    {
      id: "part2_edge_cases",
      label: "Part 2 にエッジケース説明がある",
      ok: part2.length > 0 && hasEdgeCases(part2),
    },
    {
      id: "part2_settings_constants",
      label: "Part 2 に設定項目または定数一覧がある",
      ok: part2.length > 0 && hasSettingsOrConstants(part2),
    },
    {
      id: "part2_test_structure",
      label: "Part 2 にテスト構成がある",
      ok: part2.length > 0 && hasTestStructure(part2),
    },
  ];
}

export function validatePhase12ImplementationGuide(workflowDir) {
  const guidePath = path.join(
    workflowDir,
    "outputs",
    "phase-12",
    "implementation-guide.md",
  );

  if (!existsSync(guidePath)) {
    return {
      ok: false,
      guidePath,
      checks: [],
      errors: [`implementation-guide.md が存在しません: ${guidePath}`],
    };
  }

  const content = readUtf8(guidePath);
  const checks = buildChecks(content);
  const errors = checks.filter((check) => !check.ok).map((check) => check.label);

  return {
    ok: errors.length === 0,
    guidePath,
    checks,
    errors,
  };
}

function main() {
  const args = parseArgs(process.argv);
  const result = validatePhase12ImplementationGuide(args.workflow);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("[validate-phase12-implementation-guide]");
    console.log(`guidePath: ${result.guidePath}`);
    console.log(`checks: ${result.checks.filter((check) => check.ok).length}/${result.checks.length}`);
    if (result.ok) {
      console.log("PHASE12_IMPLEMENTATION_GUIDE_OK");
    } else {
      result.errors.forEach((error) => console.log(`- ${error}`));
    }
  }

  process.exit(result.ok ? 0 : 1);
}

main();
