#!/usr/bin/env node

/**
 * GitHub Actions Artifact Cleanup Script
 *
 * Usage:
 *   node cleanup-artifacts.mjs <owner> <repo> [options]
 *
 * Options:
 *   --days <number>       Delete artifacts older than N days (default: 30)
 *   --pattern <string>    Only delete artifacts matching pattern
 *   --dry-run             Show what would be deleted without deleting
 *   --list                List artifacts without deleting
 *   --token <string>      GitHub token (or set GITHUB_TOKEN env var)
 *   -h, --help            Show this help
 *
 * Exit codes:
 *   0: success
 *   1: general error
 *   2: argument error
 *   3: dependency error
 */

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_DEP_ERROR = 3;

function showHelp() {
  console.log(`
GitHub Actions Artifact Cleanup

Usage:
  node cleanup-artifacts.mjs <owner> <repo> [options]

Options:
  --days <number>       Delete artifacts older than N days (default: 30)
  --pattern <string>    Only delete artifacts matching pattern
  --dry-run             Show what would be deleted without deleting
  --list                List artifacts without deleting
  --token <string>      GitHub token (or set GITHUB_TOKEN env var)
  -h, --help            Show this help

Examples:
  node cleanup-artifacts.mjs octocat my-repo
  node cleanup-artifacts.mjs octocat my-repo --days 7 --pattern "pr-preview-"
  node cleanup-artifacts.mjs octocat my-repo --dry-run
  node cleanup-artifacts.mjs octocat my-repo --list
  `);
}

function parseArgs(args) {
  const options = {
    days: 30,
    pattern: null,
    dryRun: false,
    list: false,
    token: process.env.GITHUB_TOKEN,
  };

  for (let i = 2; i < args.length; i += 1) {
    if (args[i] === "--days" && i + 1 < args.length) {
      options.days = parseInt(args[i + 1], 10);
      i += 1;
    } else if (args[i] === "--pattern" && i + 1 < args.length) {
      options.pattern = args[i + 1];
      i += 1;
    } else if (args[i] === "--dry-run") {
      options.dryRun = true;
    } else if (args[i] === "--list") {
      options.list = true;
    } else if (args[i] === "--token" && i + 1 < args.length) {
      options.token = args[i + 1];
      i += 1;
    } else if (args[i].startsWith("-")) {
      console.error(`Error: Unknown option: ${args[i]}`);
      process.exit(EXIT_ARGS_ERROR);
    }
  }

  return options;
}

async function loadOctokit() {
  try {
    const { Octokit } = await import("@octokit/rest");
    return Octokit;
  } catch (error) {
    console.error("Error: @octokit/rest is required to run this script");
    console.error("Install it with: npm install @octokit/rest");
    process.exit(EXIT_DEP_ERROR);
  }
}

const getThresholdTimestamp = (days) => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return threshold.getTime();
};

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

async function listArtifacts(octokit, owner, repo) {
  const { data } = await octokit.rest.actions.listArtifactsForRepo({
    owner,
    repo,
    per_page: 100,
  });

  console.log(`\n📦 Artifacts in ${owner}/${repo}`);
  console.log("━".repeat(60));

  let totalSize = 0;

  for (const artifact of data.artifacts) {
    const createdAt = new Date(artifact.created_at);
    const ageInDays = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    console.log(`\n${artifact.name}`);
    console.log(`  ID: ${artifact.id}`);
    console.log(`  Size: ${formatBytes(artifact.size_in_bytes)}`);
    console.log(`  Age: ${ageInDays} days`);
    console.log(`  Created: ${artifact.created_at}`);
    console.log(`  Expires: ${artifact.expires_at}`);

    totalSize += artifact.size_in_bytes;
  }

  console.log("\n" + "━".repeat(60));
  console.log(`Total: ${data.artifacts.length} artifacts`);
  console.log(`Total size: ${formatBytes(totalSize)}`);
}

async function cleanupArtifacts(octokit, owner, repo, options) {
  console.log(`\n🧹 GitHub Actions Artifact Cleanup`);
  console.log(`Repository: ${owner}/${repo}`);
  console.log(`Threshold: ${options.days} days`);
  if (options.pattern) {
    console.log(`Pattern: ${options.pattern}`);
  }
  if (options.dryRun) {
    console.log(`Mode: DRY RUN (no actual deletion)`);
  }
  console.log("");

  const threshold = getThresholdTimestamp(options.days);
  let deletedCount = 0;
  let deletedSize = 0;
  let totalCount = 0;
  let totalSize = 0;

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data } = await octokit.rest.actions.listArtifactsForRepo({
      owner,
      repo,
      per_page: 100,
      page,
    });

    if (data.artifacts.length === 0) {
      hasMore = false;
      break;
    }

    for (const artifact of data.artifacts) {
      totalCount += 1;
      totalSize += artifact.size_in_bytes;

      const createdAt = new Date(artifact.created_at).getTime();
      const ageInDays = Math.floor(
        (Date.now() - createdAt) / (1000 * 60 * 60 * 24),
      );

      const shouldDelete =
        createdAt < threshold &&
        (!options.pattern || artifact.name.includes(options.pattern));

      if (shouldDelete) {
        deletedCount += 1;
        deletedSize += artifact.size_in_bytes;

        console.log(`${options.dryRun ? "🔍" : "🗑️ "} ${artifact.name}`);
        console.log(`   ID: ${artifact.id}`);
        console.log(`   Size: ${formatBytes(artifact.size_in_bytes)}`);
        console.log(`   Age: ${ageInDays} days`);
        console.log(`   Created: ${artifact.created_at}`);

        if (!options.dryRun) {
          try {
            await octokit.rest.actions.deleteArtifact({
              owner,
              repo,
              artifact_id: artifact.id,
            });
            console.log("   ✅ Deleted");
          } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
          }
        }
        console.log("");
      }
    }

    page += 1;
  }

  console.log("━".repeat(60));
  console.log(`📊 Summary`);
  console.log(`Total artifacts: ${totalCount}`);
  console.log(`Total size: ${formatBytes(totalSize)}`);
  console.log(
    `${options.dryRun ? "Would delete" : "Deleted"}: ${deletedCount} artifacts`,
  );
  console.log(
    `${options.dryRun ? "Would free" : "Freed"}: ${formatBytes(deletedSize)}`,
  );

  if (options.dryRun && deletedCount > 0) {
    console.log("\n💡 Run without --dry-run to actually delete artifacts");
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  if (args.length < 2) {
    console.error("Error: owner and repo are required");
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  const [owner, repo] = args;
  const options = parseArgs(args);

  if (!options.token) {
    console.error("Error: GitHub token not provided");
    console.error("Set GITHUB_TOKEN env var or use --token");
    process.exit(EXIT_ARGS_ERROR);
  }

  const Octokit = await loadOctokit();
  const octokit = new Octokit({ auth: options.token });

  try {
    if (options.list) {
      await listArtifacts(octokit, owner, repo);
      process.exit(EXIT_SUCCESS);
    }

    await cleanupArtifacts(octokit, owner, repo, options);
    process.exit(EXIT_SUCCESS);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.status === 404) {
      console.error(
        "Repository not found. Check owner/repo and token permissions.",
      );
    } else if (error.status === 403) {
      console.error("Permission denied. Check token has actions scope.");
    }
    process.exit(EXIT_ERROR);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
