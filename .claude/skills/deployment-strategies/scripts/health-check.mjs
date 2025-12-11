#!/usr/bin/env node

/**
 * Health Check Script
 *
 * Performs health check against a specified endpoint.
 * Supports retry logic and detailed output.
 *
 * Usage:
 *   node health-check.mjs https://app.example.com/api/health
 *   node health-check.mjs https://app.example.com/api/health --retries 5 --interval 10
 */

const args = process.argv.slice(2);

function parseArgs() {
  const options = {
    url: null,
    retries: 3,
    interval: 5,
    timeout: 10,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--retries" || arg === "-r") {
      options.retries = parseInt(args[++i], 10);
    } else if (arg === "--interval" || arg === "-i") {
      options.interval = parseInt(args[++i], 10);
    } else if (arg === "--timeout" || arg === "-t") {
      options.timeout = parseInt(args[++i], 10);
    } else if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else if (!arg.startsWith("-")) {
      options.url = arg;
    }
  }

  return options;
}

function printUsage() {
  console.log(`
Health Check Script

Usage:
  node health-check.mjs <url> [options]

Options:
  --retries, -r <n>    Number of retries (default: 3)
  --interval, -i <s>   Interval between retries in seconds (default: 5)
  --timeout, -t <s>    Request timeout in seconds (default: 10)
  --verbose, -v        Show detailed output
  --help, -h           Show this help message

Examples:
  node health-check.mjs https://app.example.com/api/health
  node health-check.mjs https://app.example.com/api/health --retries 5 --interval 10
  node health-check.mjs https://app.example.com/api/health -v
`);
}

async function checkHealth(url, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - start;

    let body = null;
    try {
      body = await response.json();
    } catch {
      // Response might not be JSON
    }

    return {
      success: response.ok,
      status: response.status,
      duration,
      body,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return {
        success: false,
        error: `Timeout after ${timeout}s`,
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatStatus(status) {
  if (status >= 200 && status < 300) {
    return `✅ ${status}`;
  } else if (status >= 400 && status < 500) {
    return `⚠️ ${status}`;
  } else if (status >= 500) {
    return `❌ ${status}`;
  }
  return `${status}`;
}

async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function main() {
  const options = parseArgs();

  if (!options.url) {
    console.error("❌ Error: URL is required\n");
    printUsage();
    process.exit(1);
  }

  console.log(`\n🔍 Health Check: ${options.url}`);
  console.log("─".repeat(50));

  let lastResult = null;

  for (let attempt = 1; attempt <= options.retries; attempt++) {
    console.log(`\nAttempt ${attempt}/${options.retries}...`);

    const result = await checkHealth(options.url, options.timeout);
    lastResult = result;

    if (result.success) {
      console.log(`✅ Health check passed!`);
      console.log(`   Status: ${formatStatus(result.status)}`);
      console.log(`   Duration: ${formatDuration(result.duration)}`);

      if (options.verbose && result.body) {
        console.log("\n📋 Response:");
        console.log(JSON.stringify(result.body, null, 2));
      }

      // Check for degraded status
      if (result.body?.status === "degraded") {
        console.log("\n⚠️  Service is degraded");
        if (result.body.checks) {
          for (const [name, check] of Object.entries(result.body.checks)) {
            if (check.status !== "pass") {
              console.log(
                `   - ${name}: ${check.status} - ${check.message || ""}`,
              );
            }
          }
        }
      }

      process.exit(0);
    } else {
      console.log(`❌ Health check failed`);

      if (result.status) {
        console.log(`   Status: ${formatStatus(result.status)}`);
      }

      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }

      if (options.verbose && result.body) {
        console.log("\n📋 Response:");
        console.log(JSON.stringify(result.body, null, 2));
      }

      if (attempt < options.retries) {
        console.log(`\n⏳ Waiting ${options.interval}s before retry...`);
        await sleep(options.interval);
      }
    }
  }

  // All retries exhausted
  console.log("\n" + "═".repeat(50));
  console.log("❌ Health check failed after all retries");

  if (lastResult?.body?.checks) {
    console.log("\n📋 Final check status:");
    for (const [name, check] of Object.entries(lastResult.body.checks)) {
      const icon =
        check.status === "pass" ? "✅" : check.status === "warn" ? "⚠️" : "❌";
      console.log(
        `   ${icon} ${name}: ${check.status}${check.message ? ` - ${check.message}` : ""}`,
      );
    }
  }

  process.exit(1);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
