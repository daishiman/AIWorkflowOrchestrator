#!/usr/bin/env node
/* global require, process, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function parseArgs(argv) {
  const args = { workflow: null, json: false, writeMd: null };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--workflow") {
      args.workflow = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--json") {
      args.json = true;
      continue;
    }
    if (token === "--write-md") {
      args.writeMd = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function findPhaseFiles(workflowDir) {
  const files = fs
    .readdirSync(workflowDir)
    .filter((name) => /^phase-\d+-.+\.md$/.test(name))
    .sort();
  const map = new Map();
  for (const fileName of files) {
    const match = fileName.match(/^phase-(\d+)-/);
    if (match) {
      map.set(match[1], path.join(workflowDir, fileName));
    }
  }
  return map;
}

function parseMatrixRows(matrixText) {
  const rows = [];
  const lines = matrixText.split("\n");
  for (const line of lines) {
    const match = line.match(
      /^\|\s*`([^`]+)`\s*\|[^|]*\|\s*([0-9,\s]+)\s*\|\s*$/
    );
    if (!match) continue;
    const refPath = match[1].trim();
    const phases = match[2]
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    rows.push({ refPath, phases });
  }
  return rows;
}

function checkMatrixCoverage(rows, phaseFiles) {
  const missing = [];
  for (const row of rows) {
    for (const phase of row.phases) {
      const phaseFile = phaseFiles.get(phase);
      if (!phaseFile) {
        missing.push({
          type: "missing_phase_file",
          phase,
          refPath: row.refPath,
        });
        continue;
      }
      const phaseText = readText(phaseFile);
      if (!phaseText.includes(row.refPath)) {
        missing.push({
          type: "missing_reference",
          phase,
          refPath: row.refPath,
          file: phaseFile,
        });
      }
    }
  }
  return missing;
}

function getChangedAiworkflowRefs(repoRoot) {
  const cmd =
    "git diff --name-only -- .claude/skills/aiworkflow-requirements/references/*.md";
  const output = execSync(cmd, { cwd: repoRoot, encoding: "utf8" })
    .trim()
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
  return output;
}

function checkChangedRefsInMatrix(changedRefs, matrixText) {
  const outOfMatrix = [];
  for (const ref of changedRefs) {
    if (!matrixText.includes(ref)) {
      outOfMatrix.push(ref);
    }
  }
  return outOfMatrix;
}

function checkArtifactDependencies(workflowDir, phaseFiles) {
  const artifactsPath = path.join(workflowDir, "artifacts.json");
  const artifacts = JSON.parse(readText(artifactsPath));
  const issues = [];

  for (const [phase, meta] of Object.entries(artifacts.phases)) {
    const phaseFile = phaseFiles.get(phase);
    if (!phaseFile) {
      issues.push({
        type: "missing_phase_file_for_artifacts",
        phase,
      });
      continue;
    }
    const phaseText = readText(phaseFile);
    for (const dep of meta.dependencies) {
      const direct = phaseText.includes(`Phase ${dep}`);
      const jp = phaseText.includes(`Phase ${dep}（`);
      if (!direct && !jp) {
        issues.push({
          type: "dependency_not_mentioned",
          phase,
          dependency: dep,
          file: phaseFile,
        });
      }
    }
  }

  return issues;
}

function checkPhase12Structure(workflowDir) {
  const phase12 = fs
    .readdirSync(workflowDir)
    .find((name) => name.startsWith("phase-12-") && name.endsWith(".md"));
  if (!phase12) {
    return [{ type: "missing_phase12_file" }];
  }
  const phase12Path = path.join(workflowDir, phase12);
  const text = readText(phase12Path);
  const mustHave = [
    "### Step 1-A:",
    "### Step 1-B:",
    "### Step 1-C:",
    "### Step 1-D:",
    "### Step 1-E:",
    "### Step 1-F:",
    "### Step 1-G:",
    "### Step 2:",
  ];
  const missing = [];
  for (const token of mustHave) {
    if (!text.includes(token)) {
      missing.push({ type: "missing_phase12_step", token, file: phase12Path });
    }
  }
  return missing;
}

function checkPhase12Artifacts(workflowDir) {
  const artifacts = JSON.parse(readText(path.join(workflowDir, "artifacts.json")));
  const phase12File = fs
    .readdirSync(workflowDir)
    .find((name) => name.startsWith("phase-12-") && name.endsWith(".md"));
  if (!phase12File) {
    return [{ type: "missing_phase12_file" }];
  }
  const text = readText(path.join(workflowDir, phase12File));
  const missing = [];
  for (const artifact of artifacts.phases["12"].artifacts) {
    if (!text.includes(artifact)) {
      missing.push({
        type: "missing_phase12_artifact_reference",
        artifact,
        file: phase12File,
      });
    }
  }
  return missing;
}

function buildMarkdown(report) {
  const lines = [];
  lines.push("# Spec Consistency Audit");
  lines.push("");
  lines.push(`- Workflow: \`${report.workflow}\``);
  lines.push(`- GeneratedAt: \`${report.generatedAt}\``);
  lines.push(
    `- Result: ${report.summary.passed ? "PASS" : "FAIL"} (errors=${report.summary.errors})`
  );
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- MatrixCoverageMissing: ${report.summary.matrixCoverageMissing}`);
  lines.push(`- ChangedRefsOutOfMatrix: ${report.summary.changedRefsOutOfMatrix}`);
  lines.push(`- DependencyIssues: ${report.summary.dependencyIssues}`);
  lines.push(`- Phase12StepIssues: ${report.summary.phase12StepIssues}`);
  lines.push(`- Phase12ArtifactIssues: ${report.summary.phase12ArtifactIssues}`);
  lines.push("");

  if (report.changedRefsOutOfMatrix.length > 0) {
    lines.push("## Changed Refs Out Of Matrix");
    lines.push("");
    for (const item of report.changedRefsOutOfMatrix) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  const allIssues = [
    ...report.matrixCoverageMissing,
    ...report.dependencyIssues,
    ...report.phase12StepIssues,
    ...report.phase12ArtifactIssues,
  ];
  if (allIssues.length > 0) {
    lines.push("## Issues");
    lines.push("");
    for (const issue of allIssues) {
      lines.push(`- ${JSON.stringify(issue)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const workflowDir = path.resolve(
    args.workflow || path.join(__dirname, "..")
  );
  const repoRoot = path.resolve(workflowDir, "..", "..", "..");

  const matrixPath = path.join(workflowDir, "spec-extraction-matrix.md");
  const matrixText = readText(matrixPath);
  const matrixRows = parseMatrixRows(matrixText);
  const phaseFiles = findPhaseFiles(workflowDir);

  const matrixCoverageMissing = checkMatrixCoverage(matrixRows, phaseFiles);
  const changedRefs = getChangedAiworkflowRefs(repoRoot);
  const changedRefsOutOfMatrix = checkChangedRefsInMatrix(changedRefs, matrixText);
  const dependencyIssues = checkArtifactDependencies(workflowDir, phaseFiles);
  const phase12StepIssues = checkPhase12Structure(workflowDir);
  const phase12ArtifactIssues = checkPhase12Artifacts(workflowDir);

  const summary = {
    matrixCoverageMissing: matrixCoverageMissing.length,
    changedRefsOutOfMatrix: changedRefsOutOfMatrix.length,
    dependencyIssues: dependencyIssues.length,
    phase12StepIssues: phase12StepIssues.length,
    phase12ArtifactIssues: phase12ArtifactIssues.length,
  };
  summary.errors =
    summary.matrixCoverageMissing +
    summary.changedRefsOutOfMatrix +
    summary.dependencyIssues +
    summary.phase12StepIssues +
    summary.phase12ArtifactIssues;
  summary.passed = summary.errors === 0;

  const report = {
    generatedAt: new Date().toISOString(),
    workflow: workflowDir,
    summary,
    matrixRows: matrixRows.length,
    changedRefs,
    changedRefsOutOfMatrix,
    matrixCoverageMissing,
    dependencyIssues,
    phase12StepIssues,
    phase12ArtifactIssues,
  };

  if (args.writeMd) {
    const mdPath = path.resolve(args.writeMd);
    fs.mkdirSync(path.dirname(mdPath), { recursive: true });
    fs.writeFileSync(mdPath, buildMarkdown(report));
  }

  if (args.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(
      `[audit-spec-consistency] ${
        report.summary.passed ? "PASS" : "FAIL"
      } errors=${report.summary.errors}\n`
    );
  }

  process.exit(report.summary.passed ? 0 : 1);
}

main();
