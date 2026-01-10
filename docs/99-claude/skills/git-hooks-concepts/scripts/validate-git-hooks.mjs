#!/usr/bin/env node

/**
 * Git Hooks Validation Script
 * 目的: Git Hooks設定と動作の検証
 */

import { execSync } from "child_process";
import { existsSync, statSync } from "fs";
import { resolve } from "path";

// 色定義
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
};

function isGitRepository() {
  try {
    execSync("git rev-parse --git-dir", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function getGitDir() {
  try {
    const gitDir = execSync("git rev-parse --git-dir", {
      encoding: "utf-8",
    }).trim();
    return gitDir.startsWith("/") ? gitDir : resolve(gitDir);
  } catch {
    return ".git";
  }
}

function checkHookExists(hookName) {
  const gitDir = getGitDir();
  const hookPath = resolve(gitDir, "hooks", hookName);
  return existsSync(hookPath);
}

function isHookExecutable(hookName) {
  const gitDir = getGitDir();
  const hookPath = resolve(gitDir, "hooks", hookName);

  if (!existsSync(hookPath)) return false;

  try {
    const stats = statSync(hookPath);
    return (stats.mode & 0o111) !== 0;
  } catch {
    return false;
  }
}

function validateHook(hookName) {
  log.info(`Checking ${hookName}...`);

  if (!checkHookExists(hookName)) {
    log.warning(`${hookName} does not exist`);
    return false;
  }

  if (!isHookExecutable(hookName)) {
    log.error(`${hookName} is not executable`);
    log.info(`Fix: chmod +x .git/hooks/${hookName}`);
    return false;
  }

  log.success(`${hookName} exists and is executable`);
  return true;
}

function validateAllHooks() {
  const hooks = [
    "pre-commit",
    "prepare-commit-msg",
    "commit-msg",
    "post-commit",
    "pre-push",
  ];

  log.info("Validating Git Hooks configuration...\n");

  if (!isGitRepository()) {
    log.error("Not a Git repository");
    process.exit(1);
  }

  log.success("Git repository found\n");

  let validCount = 0;
  for (const hook of hooks) {
    if (validateHook(hook)) {
      validCount++;
    }
  }

  console.log("");
  log.info(`Summary: ${validCount}/${hooks.length} hooks configured`);

  if (validCount === 0) {
    log.warning("No Git hooks configured");
  } else if (validCount === hooks.length) {
    log.success("All hooks properly configured");
  }
}

function testHookSyntax(hookName) {
  const gitDir = getGitDir();
  const hookPath = resolve(gitDir, "hooks", hookName);

  if (!existsSync(hookPath)) {
    return { valid: false, error: "Hook does not exist" };
  }

  try {
    execSync(`bash -n "${hookPath}"`, { stdio: "ignore" });
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--syntax")) {
    log.info("Validating hook syntax...\n");
    const hooks = [
      "pre-commit",
      "prepare-commit-msg",
      "commit-msg",
      "post-commit",
      "pre-push",
    ];

    for (const hook of hooks) {
      const result = testHookSyntax(hook);
      if (result.valid) {
        log.success(`${hook} syntax is valid`);
      } else {
        log.error(`${hook} has syntax errors: ${result.error}`);
      }
    }
  } else {
    validateAllHooks();
  }
}

main();
