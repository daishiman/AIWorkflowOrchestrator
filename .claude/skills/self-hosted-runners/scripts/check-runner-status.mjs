#!/usr/bin/env node

/**
 * GitHub Actions Self-Hosted Runner Status Checker
 *
 * セルフホストランナーのステータスを確認するスクリプト。
 *
 * Usage:
 *   node check-runner-status.mjs <owner> <repo> [token]
 *   node check-runner-status.mjs <org> [token]
 *
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub Personal Access Token (required if not passed as argument)
 *
 * Examples:
 *   # Repository runners
 *   node check-runner-status.mjs myorg myrepo
 *   node check-runner-status.mjs myorg myrepo ghp_xxxxx
 *
 *   # Organization runners
 *   node check-runner-status.mjs myorg
 *   GITHUB_TOKEN=ghp_xxxxx node check-runner-status.mjs myorg
 */

import https from "https";

// =====================================
// Configuration
// =====================================

const args = process.argv.slice(2);
const isOrgLevel =
  args.length === 1 || (args.length === 2 && args[1].startsWith("ghp_"));

let owner, repo, token;

if (isOrgLevel) {
  owner = args[0];
  token = args[1] || process.env.GITHUB_TOKEN;
} else {
  owner = args[0];
  repo = args[1];
  token = args[2] || process.env.GITHUB_TOKEN;
}

if (!owner || (!isOrgLevel && !repo) || !token) {
  console.error("Error: Missing required arguments");
  console.error("");
  console.error("Usage:");
  console.error(
    "  Repository: node check-runner-status.mjs <owner> <repo> [token]",
  );
  console.error("  Organization: node check-runner-status.mjs <org> [token]");
  console.error("");
  console.error("Environment Variables:");
  console.error("  GITHUB_TOKEN - GitHub Personal Access Token");
  process.exit(1);
}

// =====================================
// API Request Helper
// =====================================

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      port: 443,
      path: path,
      method: "GET",
      headers: {
        "User-Agent": "github-runner-status-checker",
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API request failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

// =====================================
// Fetch Runners
// =====================================

async function fetchRunners() {
  const path = isOrgLevel
    ? `/orgs/${owner}/actions/runners?per_page=100`
    : `/repos/${owner}/${repo}/actions/runners?per_page=100`;

  try {
    const data = await makeRequest(path);
    return data.runners || [];
  } catch (error) {
    console.error("Error fetching runners:", error.message);
    process.exit(1);
  }
}

// =====================================
// Display Functions
// =====================================

function displaySummary(runners) {
  const online = runners.filter((r) => r.status === "online").length;
  const offline = runners.filter((r) => r.status === "offline").length;
  const busy = runners.filter((r) => r.busy).length;
  const idle = runners.filter((r) => !r.busy).length;

  console.log("\n=================================");
  console.log("  Runner Summary");
  console.log("=================================");
  console.log(`Total Runners: ${runners.length}`);
  console.log(`Online: ${online} | Offline: ${offline}`);
  console.log(`Busy: ${busy} | Idle: ${idle}`);
  console.log("=================================\n");
}

function displayRunnerTable(runners) {
  console.log("Runner Details:\n");

  // Header
  console.log(
    "ID".padEnd(10) +
      "Name".padEnd(25) +
      "OS".padEnd(10) +
      "Status".padEnd(10) +
      "Busy".padEnd(8) +
      "Labels",
  );
  console.log("-".repeat(100));

  // Runners
  runners.forEach((runner) => {
    const id = runner.id.toString().padEnd(10);
    const name = (runner.name || "N/A").padEnd(25).substring(0, 25);
    const os = (runner.os || "N/A").padEnd(10);
    const status = getStatusIcon(runner.status).padEnd(10);
    const busy = (runner.busy ? "✓" : "-").padEnd(8);
    const labels = runner.labels.map((l) => l.name).join(", ");

    console.log(`${id}${name}${os}${status}${busy}${labels}`);
  });

  console.log("");
}

function getStatusIcon(status) {
  return status === "online" ? "🟢 Online" : "🔴 Offline";
}

function displayRunnerGroups(runners) {
  const groups = {};

  runners.forEach((runner) => {
    const key = `${runner.os}-${runner.status}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(runner);
  });

  console.log("Runners by OS and Status:\n");

  Object.keys(groups)
    .sort()
    .forEach((key) => {
      const [os, status] = key.split("-");
      const count = groups[key].length;
      const icon = status === "online" ? "🟢" : "🔴";

      console.log(`${icon} ${os} (${status}): ${count}`);
      groups[key].forEach((runner) => {
        const busyIcon = runner.busy ? "⚡" : "💤";
        console.log(`  ${busyIcon} ${runner.name}`);
      });
      console.log("");
    });
}

function displayLabelStats(runners) {
  const labelCounts = {};

  runners.forEach((runner) => {
    runner.labels.forEach((label) => {
      if (!labelCounts[label.name]) {
        labelCounts[label.name] = { total: 0, online: 0, busy: 0 };
      }
      labelCounts[label.name].total++;
      if (runner.status === "online") {
        labelCounts[label.name].online++;
      }
      if (runner.busy) {
        labelCounts[label.name].busy++;
      }
    });
  });

  console.log("Label Statistics:\n");

  const sortedLabels = Object.keys(labelCounts).sort((a, b) => {
    return labelCounts[b].total - labelCounts[a].total;
  });

  console.log(
    "Label".padEnd(30) +
      "Total".padEnd(10) +
      "Online".padEnd(10) +
      "Busy".padEnd(10) +
      "Utilization",
  );
  console.log("-".repeat(80));

  sortedLabels.forEach((label) => {
    const stats = labelCounts[label];
    const utilization =
      stats.online > 0
        ? `${Math.round((stats.busy / stats.online) * 100)}%`
        : "N/A";

    console.log(
      label.padEnd(30) +
        stats.total.toString().padEnd(10) +
        stats.online.toString().padEnd(10) +
        stats.busy.toString().padEnd(10) +
        utilization,
    );
  });

  console.log("");
}

function displayOfflineRunners(runners) {
  const offline = runners.filter((r) => r.status === "offline");

  if (offline.length === 0) {
    return;
  }

  console.log("⚠️  Offline Runners:\n");

  offline.forEach((runner) => {
    console.log(`🔴 ${runner.name}`);
    console.log(`   OS: ${runner.os}`);
    console.log(`   Labels: ${runner.labels.map((l) => l.name).join(", ")}`);
    console.log("");
  });
}

function displayJSON(runners) {
  console.log(JSON.stringify(runners, null, 2));
}

// =====================================
// Main
// =====================================

async function main() {
  const location = isOrgLevel
    ? `Organization: ${owner}`
    : `Repository: ${owner}/${repo}`;

  console.log(`\nFetching runners for ${location}...\n`);

  const runners = await fetchRunners();

  if (runners.length === 0) {
    console.log("No runners found.");
    return;
  }

  // Check for format flag
  const format = process.env.FORMAT || "table";

  if (format === "json") {
    displayJSON(runners);
    return;
  }

  displaySummary(runners);
  displayRunnerTable(runners);
  displayRunnerGroups(runners);
  displayLabelStats(runners);
  displayOfflineRunners(runners);
}

// =====================================
// Execute
// =====================================

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
