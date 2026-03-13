#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function fail(message) {
  console.error(`[run-review-task] ${message}`);
  process.exit(1);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function parseArgs(argv) {
  const options = {
    runner: "codex",
    runnerCommand: process.env.REVIEW_RUNNER_CMD || "codex",
    mode: "exec",
    promptTransport: "auto",
    cwd: process.cwd(),
    dryRun: false,
    printPrompt: false,
    uncommitted: false,
    extraArgs: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    switch (current) {
      case "--runner":
        options.runner = next || fail("--runner requires a value");
        i += 1;
        break;
      case "--runner-command":
        options.runnerCommand = next || fail("--runner-command requires a value");
        i += 1;
        break;
      case "--mode":
        options.mode = next || fail("--mode requires a value");
        i += 1;
        break;
      case "--task-file":
        options.taskFile = next || fail("--task-file requires a value");
        i += 1;
        break;
      case "--prompt-file":
        options.promptFile = next || fail("--prompt-file requires a value");
        i += 1;
        break;
      case "--output-prompt":
        options.outputPrompt = next || fail("--output-prompt requires a value");
        i += 1;
        break;
      case "--base":
        options.base = next || fail("--base requires a value");
        i += 1;
        break;
      case "--commit":
        options.commit = next || fail("--commit requires a value");
        i += 1;
        break;
      case "--cd":
        options.cwd = next || fail("--cd requires a value");
        i += 1;
        break;
      case "--prompt-transport":
        options.promptTransport = next || fail("--prompt-transport requires a value");
        i += 1;
        break;
      case "--extra-arg":
        options.extraArgs.push(next || fail("--extra-arg requires a value"));
        i += 1;
        break;
      case "--uncommitted":
        options.uncommitted = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--print-prompt":
        options.printPrompt = true;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      default:
        fail(`Unknown argument: ${current}`);
    }
  }

  if (!options.taskFile && !options.promptFile) {
    fail("--task-file or --prompt-file is required");
  }

  if (!["codex", "claude-code", "generic-agent"].includes(options.runner)) {
    fail("--runner must be codex, claude-code, or generic-agent");
  }

  if (!["exec", "review"].includes(options.mode)) {
    fail("--mode must be exec or review");
  }

  if (!["auto", "arg", "stdin"].includes(options.promptTransport)) {
    fail("--prompt-transport must be auto, arg, or stdin");
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node .claude/skills/task-specification-creator/scripts/run-review-task.js \\
    --task-file docs/30-workflows/<feature>/phase-3-design-review.md

Options:
  --runner <codex|claude-code|generic-agent>   Runner family (default: codex)
  --runner-command <cmd>                       Executable name (default: codex)
  --mode <exec|review>                         exec=task spec review, review=git diff review
  --task-file <path>                           Task specification to embed in the prompt
  --prompt-file <path>                         Use an existing prompt file instead of generating one
  --output-prompt <path>                       Save the generated prompt for reuse by another agent
  --base <branch>                              Base branch for codex review
  --commit <sha>                               Commit for codex review
  --uncommitted                                Review staged/unstaged/untracked changes
  --cd <dir>                                   Working root for codex exec
  --prompt-transport <auto|arg|stdin>          How to send the prompt to non-codex runners
  --extra-arg <value>                          Extra argument for the runner (repeatable)
  --dry-run                                    Print the command without executing it
  --print-prompt                               Print the generated prompt to stdout
`);
}

function buildPrompt(options) {
  if (options.promptFile) {
    return readText(options.promptFile);
  }

  const taskFile = path.resolve(options.taskFile);
  const taskSpec = readText(taskFile);
  const reviewKind =
    options.mode === "review" ? "git diff review" : "task specification review";

  return [
    "あなたはレビュー担当AIです。日本語で、findings を最優先に出力してください。",
    "レビュー順序は findings -> open questions -> short summary とします。",
    "最後に PASS / MINOR / MAJOR / CRITICAL のいずれかを明記してください。",
    `レビュー種別: ${reviewKind}`,
    `対象仕様書: ${taskFile}`,
    "task-specification-creator の review gate 基準に従い、完了条件・戻り先・参照仕様・成果物・依存関係を確認してください。",
    "UI を含む場合は Phase 11 の screenshot 証跡有無も確認してください。",
    "",
    "## Task Specification",
    taskSpec,
  ].join("\n");
}

function buildCommand(options, prompt) {
  if (options.runner === "codex") {
    if (options.mode === "review") {
      const args = ["review"];

      if (options.base) {
        args.push("--base", options.base);
      } else if (options.commit) {
        args.push("--commit", options.commit);
      } else if (options.uncommitted || (!options.base && !options.commit)) {
        args.push("--uncommitted");
      }

      args.push(...options.extraArgs, prompt);
      return {
        command: options.runnerCommand,
        args,
        stdio: "inherit",
      };
    }

    const args = ["exec", "-C", options.cwd, ...options.extraArgs, prompt];
    return {
      command: options.runnerCommand,
      args,
      stdio: "inherit",
    };
  }

  const transport =
    options.promptTransport === "auto" ? "stdin" : options.promptTransport;
  const args = [...options.extraArgs];

  return {
    command: options.runnerCommand,
    args: transport === "arg" ? [...args, prompt] : args,
    stdio: transport === "stdin" ? ["pipe", "inherit", "inherit"] : "inherit",
    input: transport === "stdin" ? prompt : undefined,
  };
}

function formatCommand(command, args) {
  return [command, ...args]
    .map((part) => {
      if (/^[A-Za-z0-9_./:=,@-]+$/.test(part)) {
        return part;
      }
      return JSON.stringify(part);
    })
    .join(" ");
}

const options = parseArgs(process.argv.slice(2));
const prompt = buildPrompt(options);

if (options.outputPrompt) {
  writeText(path.resolve(options.outputPrompt), prompt);
}

if (options.printPrompt) {
  process.stdout.write(`${prompt}\n`);
}

const plan = buildCommand(options, prompt);
const commandLine = formatCommand(plan.command, plan.args);

if (options.dryRun) {
  console.log(commandLine);
  process.exit(0);
}

const result = spawnSync(plan.command, plan.args, {
  cwd: options.cwd,
  stdio: plan.stdio,
  input: plan.input,
  env: process.env,
});

if (result.error) {
  fail(result.error.message);
}

process.exit(result.status ?? 1);
