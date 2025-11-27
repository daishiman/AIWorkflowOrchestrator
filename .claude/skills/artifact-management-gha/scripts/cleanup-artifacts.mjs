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
 *   --dry-run            Show what would be deleted without deleting
 *   --token <string>     GitHub token (or set GITHUB_TOKEN env var)
 *
 * Examples:
 *   # Delete artifacts older than 30 days
 *   node cleanup-artifacts.mjs octocat my-repo
 *
 *   # Delete PR preview artifacts older than 7 days
 *   node cleanup-artifacts.mjs octocat my-repo --days 7 --pattern "pr-preview-"
 *
 *   # Dry run to see what would be deleted
 *   node cleanup-artifacts.mjs octocat my-repo --dry-run
 */

import { Octokit } from '@octokit/rest';

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node cleanup-artifacts.mjs <owner> <repo> [options]');
  process.exit(1);
}

const [owner, repo] = args;

// Parse options
const options = {
  days: 30,
  pattern: null,
  dryRun: false,
  token: process.env.GITHUB_TOKEN,
};

for (let i = 2; i < args.length; i++) {
  if (args[i] === '--days' && i + 1 < args.length) {
    options.days = parseInt(args[++i], 10);
  } else if (args[i] === '--pattern' && i + 1 < args.length) {
    options.pattern = args[++i];
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  } else if (args[i] === '--token' && i + 1 < args.length) {
    options.token = args[++i];
  }
}

if (!options.token) {
  console.error('Error: GitHub token not provided');
  console.error('Set GITHUB_TOKEN environment variable or use --token option');
  process.exit(1);
}

// Initialize Octokit
const octokit = new Octokit({
  auth: options.token,
});

/**
 * Calculate timestamp threshold
 */
const getThresholdTimestamp = (days) => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return threshold.getTime();
};

/**
 * Format bytes to human-readable size
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Main cleanup function
 */
async function cleanupArtifacts() {
  console.log(`\n🧹 GitHub Actions Artifact Cleanup`);
  console.log(`Repository: ${owner}/${repo}`);
  console.log(`Threshold: ${options.days} days`);
  if (options.pattern) {
    console.log(`Pattern: ${options.pattern}`);
  }
  if (options.dryRun) {
    console.log(`Mode: DRY RUN (no actual deletion)`);
  }
  console.log('');

  const threshold = getThresholdTimestamp(options.days);
  let deletedCount = 0;
  let deletedSize = 0;
  let totalCount = 0;
  let totalSize = 0;

  try {
    // Fetch all artifacts (paginated)
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
        totalCount++;
        totalSize += artifact.size_in_bytes;

        const createdAt = new Date(artifact.created_at).getTime();
        const ageInDays = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));

        // Check if artifact should be deleted
        const shouldDelete = createdAt < threshold &&
          (!options.pattern || artifact.name.includes(options.pattern));

        if (shouldDelete) {
          deletedCount++;
          deletedSize += artifact.size_in_bytes;

          console.log(`${options.dryRun ? '🔍' : '🗑️ '} ${artifact.name}`);
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
              console.log(`   ✅ Deleted`);
            } catch (error) {
              console.log(`   ❌ Failed: ${error.message}`);
            }
          }
          console.log('');
        }
      }

      page++;
    }

    // Summary
    console.log('━'.repeat(60));
    console.log(`📊 Summary`);
    console.log(`Total artifacts: ${totalCount}`);
    console.log(`Total size: ${formatBytes(totalSize)}`);
    console.log(`${options.dryRun ? 'Would delete' : 'Deleted'}: ${deletedCount} artifacts`);
    console.log(`${options.dryRun ? 'Would free' : 'Freed'}: ${formatBytes(deletedSize)}`);

    if (options.dryRun && deletedCount > 0) {
      console.log('');
      console.log('💡 Run without --dry-run to actually delete artifacts');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.status === 404) {
      console.error('Repository not found. Check owner/repo and token permissions.');
    } else if (error.status === 403) {
      console.error('Permission denied. Check token has "actions" scope.');
    }
    process.exit(1);
  }
}

/**
 * List artifacts with filtering
 */
async function listArtifacts() {
  try {
    const { data } = await octokit.rest.actions.listArtifactsForRepo({
      owner,
      repo,
      per_page: 100,
    });

    console.log(`\n📦 Artifacts in ${owner}/${repo}`);
    console.log('━'.repeat(60));

    let totalSize = 0;

    for (const artifact of data.artifacts) {
      const createdAt = new Date(artifact.created_at);
      const ageInDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`\n${artifact.name}`);
      console.log(`  ID: ${artifact.id}`);
      console.log(`  Size: ${formatBytes(artifact.size_in_bytes)}`);
      console.log(`  Age: ${ageInDays} days`);
      console.log(`  Created: ${artifact.created_at}`);
      console.log(`  Expires: ${artifact.expires_at}`);

      totalSize += artifact.size_in_bytes;
    }

    console.log('');
    console.log('━'.repeat(60));
    console.log(`Total: ${data.artifacts.length} artifacts`);
    console.log(`Total size: ${formatBytes(totalSize)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanupArtifacts();
