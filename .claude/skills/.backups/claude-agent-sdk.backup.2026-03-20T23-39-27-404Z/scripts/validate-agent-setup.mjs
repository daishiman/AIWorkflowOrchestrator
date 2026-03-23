#!/usr/bin/env node

/**
 * Claude Agent SDK Setup Validation Script
 *
 * Validates that the Agent SDK integration is correctly configured.
 *
 * Usage:
 *   node validate-agent-setup.mjs [options]
 *
 * Options:
 *   --check-files     Check required files exist
 *   --check-deps      Check dependencies are installed
 *   --check-ipc       Check IPC channel alignment
 *   --check-security  Check security configuration
 *   --check-all       Run all checks (default)
 *   --help            Show help
 */

import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ROOT = join(__dirname, "../../../../..");
const DESKTOP_ROOT = join(PROJECT_ROOT, "apps/desktop");

const REQUIRED_FILES = [
  "apps/desktop/src/main/ipc/agentHandlers.ts",
  "apps/desktop/src/preload/index.ts",
  "apps/desktop/src/renderer/hooks/useAgent.ts",
];

const REQUIRED_IPC_CHANNELS = [
  "agent:start",
  "agent:stop",
  "agent:message",
  "agent:stream",
  "agent:permission",
  "agent:permission:res",
  "agent:status",
];

const REQUIRED_SECURITY_PATTERNS = [
  "rm -rf",
  "sudo",
  "chmod",
];

// ============================================================================
// Utilities
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  dim: "\x1b[2m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ ${message}`, colors.blue);
}

function header(title) {
  console.log();
  log(`${"─".repeat(50)}`, colors.dim);
  log(title, colors.blue);
  log(`${"─".repeat(50)}`, colors.dim);
}

// ============================================================================
// Checks
// ============================================================================

function checkFiles() {
  header("File Existence Check");

  let allExist = true;

  for (const file of REQUIRED_FILES) {
    const fullPath = join(PROJECT_ROOT, file);
    if (existsSync(fullPath)) {
      success(file);
    } else {
      error(`${file} - NOT FOUND`);
      allExist = false;
    }
  }

  return allExist;
}

function checkDependencies() {
  header("Dependencies Check");

  const packageJsonPath = join(DESKTOP_ROOT, "package.json");

  if (!existsSync(packageJsonPath)) {
    error("apps/desktop/package.json not found");
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (deps["@anthropic-ai/claude-agent-sdk"]) {
      success(`@anthropic-ai/claude-agent-sdk: ${deps["@anthropic-ai/claude-agent-sdk"]}`);
      return true;
    } else {
      error("@anthropic-ai/claude-agent-sdk not found in dependencies");
      info("Run: pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk");
      return false;
    }
  } catch (err) {
    error(`Failed to read package.json: ${err.message}`);
    return false;
  }
}

function checkIPCAlignment() {
  header("IPC Channel Alignment Check");

  const mainHandlerPath = join(
    PROJECT_ROOT,
    "apps/desktop/src/main/ipc/agentHandlers.ts"
  );
  const preloadPath = join(PROJECT_ROOT, "apps/desktop/src/preload/index.ts");

  if (!existsSync(mainHandlerPath)) {
    warning("Main handler file not found - skipping IPC check");
    return false;
  }

  if (!existsSync(preloadPath)) {
    warning("Preload file not found - skipping IPC check");
    return false;
  }

  try {
    const mainContent = readFileSync(mainHandlerPath, "utf-8");
    const preloadContent = readFileSync(preloadPath, "utf-8");

    let allChannelsAligned = true;

    for (const channel of REQUIRED_IPC_CHANNELS) {
      const inMain = mainContent.includes(`"${channel}"`);
      const inPreload = preloadContent.includes(`"${channel}"`);

      if (inMain && inPreload) {
        success(`${channel} - aligned`);
      } else if (inMain && !inPreload) {
        error(`${channel} - missing in preload`);
        allChannelsAligned = false;
      } else if (!inMain && inPreload) {
        error(`${channel} - missing in main handler`);
        allChannelsAligned = false;
      } else {
        warning(`${channel} - not found in either file`);
        allChannelsAligned = false;
      }
    }

    return allChannelsAligned;
  } catch (err) {
    error(`Failed to check IPC alignment: ${err.message}`);
    return false;
  }
}

function checkSecurity() {
  header("Security Configuration Check");

  const mainHandlerPath = join(
    PROJECT_ROOT,
    "apps/desktop/src/main/ipc/agentHandlers.ts"
  );

  if (!existsSync(mainHandlerPath)) {
    warning("Main handler file not found - skipping security check");
    return false;
  }

  try {
    const content = readFileSync(mainHandlerPath, "utf-8");

    let allPatternsFound = true;

    // Check blocked patterns
    info("Checking blocked command patterns:");
    for (const pattern of REQUIRED_SECURITY_PATTERNS) {
      if (content.includes(pattern)) {
        success(`"${pattern}" is blocked`);
      } else {
        warning(`"${pattern}" pattern not found in blocked list`);
        allPatternsFound = false;
      }
    }

    // Check for PreToolUse hook
    console.log();
    info("Checking security hooks:");
    if (content.includes("PreToolUse")) {
      success("PreToolUse hook is implemented");
    } else {
      error("PreToolUse hook not found - security may be compromised");
      allPatternsFound = false;
    }

    // Check for permission handling
    if (content.includes("APPROVAL_REQUIRED_TOOLS")) {
      success("Approval required tools are configured");
    } else {
      warning("APPROVAL_REQUIRED_TOOLS not found");
    }

    return allPatternsFound;
  } catch (err) {
    error(`Failed to check security: ${err.message}`);
    return false;
  }
}

function checkEnvironment() {
  header("Environment Check");

  const envPath = join(DESKTOP_ROOT, ".env.local");

  if (existsSync(envPath)) {
    success(".env.local exists");

    try {
      const content = readFileSync(envPath, "utf-8");
      if (content.includes("ANTHROPIC_API_KEY")) {
        success("ANTHROPIC_API_KEY is configured");
        return true;
      } else {
        warning("ANTHROPIC_API_KEY not found in .env.local");
        return false;
      }
    } catch (err) {
      error(`Failed to read .env.local: ${err.message}`);
      return false;
    }
  } else {
    warning(".env.local not found");
    info("Create .env.local with ANTHROPIC_API_KEY=sk-ant-...");
    return false;
  }
}

// ============================================================================
// Main
// ============================================================================

function showHelp() {
  console.log(`
Claude Agent SDK Setup Validation Script

Usage:
  node validate-agent-setup.mjs [options]

Options:
  --check-files     Check required files exist
  --check-deps      Check dependencies are installed
  --check-ipc       Check IPC channel alignment
  --check-security  Check security configuration
  --check-env       Check environment variables
  --check-all       Run all checks (default)
  --help            Show this help message
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  console.log();
  log("🔍 Claude Agent SDK Setup Validation", colors.blue);
  log(`   Project: ${PROJECT_ROOT}`, colors.dim);

  const runAll =
    args.length === 0 ||
    args.includes("--check-all");

  const results = {};

  if (runAll || args.includes("--check-files")) {
    results.files = checkFiles();
  }

  if (runAll || args.includes("--check-deps")) {
    results.deps = checkDependencies();
  }

  if (runAll || args.includes("--check-ipc")) {
    results.ipc = checkIPCAlignment();
  }

  if (runAll || args.includes("--check-security")) {
    results.security = checkSecurity();
  }

  if (runAll || args.includes("--check-env")) {
    results.env = checkEnvironment();
  }

  // Summary
  header("Summary");

  const allPassed = Object.values(results).every((r) => r === true);
  const passedCount = Object.values(results).filter((r) => r === true).length;
  const totalCount = Object.values(results).length;

  if (allPassed) {
    success(`All checks passed (${passedCount}/${totalCount})`);
    console.log();
    process.exit(0);
  } else {
    error(`Some checks failed (${passedCount}/${totalCount} passed)`);
    console.log();
    process.exit(1);
  }
}

main();
