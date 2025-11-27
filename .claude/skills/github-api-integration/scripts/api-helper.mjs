#!/usr/bin/env node

/**
 * GitHub API Helper Script
 *
 * Usage:
 *   node api-helper.mjs validate-token
 *   node api-helper.mjs list-issues owner/repo
 *   node api-helper.mjs list-prs owner/repo
 *   node api-helper.mjs create-issue owner/repo "Issue Title" "Issue Body"
 *   node api-helper.mjs check-rate-limit
 */

import { execSync } from 'child_process';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN or GH_TOKEN environment variable is required');
  process.exit(1);
}

/**
 * Execute gh CLI command
 */
function gh(command) {
  try {
    return execSync(`gh ${command}`, {
      env: { ...process.env, GH_TOKEN: GITHUB_TOKEN },
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (error) {
    console.error('gh command failed:', error.message);
    if (error.stderr) {
      console.error('stderr:', error.stderr.toString());
    }
    throw error;
  }
}

/**
 * Execute curl command for GitHub API
 */
function curl(endpoint, method = 'GET', data = null) {
  let command = `curl -s -X ${method} \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com${endpoint}`;

  if (data) {
    command += ` -d '${JSON.stringify(data)}'`;
  }

  try {
    const result = execSync(command, { encoding: 'utf-8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('API request failed:', error.message);
    throw error;
  }
}

/**
 * Validate GitHub token
 */
function validateToken() {
  console.log('Validating GitHub token...');

  try {
    const result = gh('auth status');
    console.log('✅ Token is valid');
    console.log(result);
    return true;
  } catch (error) {
    console.error('❌ Token is invalid or expired');
    return false;
  }
}

/**
 * Check API rate limit
 */
function checkRateLimit() {
  console.log('Checking API rate limit...\n');

  try {
    const result = gh('api rate_limit');
    const data = JSON.parse(result);

    const core = data.resources.core;
    const graphql = data.resources.graphql;

    console.log('Core API:');
    console.log(`  Limit: ${core.limit}`);
    console.log(`  Used: ${core.used}`);
    console.log(`  Remaining: ${core.remaining}`);
    console.log(`  Resets at: ${new Date(core.reset * 1000).toLocaleString()}`);

    console.log('\nGraphQL API:');
    console.log(`  Limit: ${graphql.limit}`);
    console.log(`  Used: ${graphql.used}`);
    console.log(`  Remaining: ${graphql.remaining}`);
    console.log(`  Resets at: ${new Date(graphql.reset * 1000).toLocaleString()}`);

    return data;
  } catch (error) {
    console.error('Failed to check rate limit');
    throw error;
  }
}

/**
 * List issues for a repository
 */
function listIssues(repo, state = 'open', limit = 10) {
  console.log(`Listing ${state} issues for ${repo} (limit: ${limit})...\n`);

  try {
    const result = gh(`issue list --repo ${repo} --state ${state} --limit ${limit} --json number,title,author,labels`);
    const issues = JSON.parse(result);

    if (issues.length === 0) {
      console.log(`No ${state} issues found`);
      return [];
    }

    issues.forEach(issue => {
      const labels = issue.labels.map(l => l.name).join(', ');
      console.log(`#${issue.number}: ${issue.title}`);
      console.log(`  Author: ${issue.author.login}`);
      if (labels) {
        console.log(`  Labels: ${labels}`);
      }
      console.log('');
    });

    return issues;
  } catch (error) {
    console.error('Failed to list issues');
    throw error;
  }
}

/**
 * List pull requests for a repository
 */
function listPRs(repo, state = 'open', limit = 10) {
  console.log(`Listing ${state} pull requests for ${repo} (limit: ${limit})...\n`);

  try {
    const result = gh(`pr list --repo ${repo} --state ${state} --limit ${limit} --json number,title,author,reviewDecision`);
    const prs = JSON.parse(result);

    if (prs.length === 0) {
      console.log(`No ${state} pull requests found`);
      return [];
    }

    prs.forEach(pr => {
      console.log(`#${pr.number}: ${pr.title}`);
      console.log(`  Author: ${pr.author.login}`);
      console.log(`  Review Decision: ${pr.reviewDecision || 'None'}`);
      console.log('');
    });

    return prs;
  } catch (error) {
    console.error('Failed to list pull requests');
    throw error;
  }
}

/**
 * Create an issue
 */
function createIssue(repo, title, body, labels = []) {
  console.log(`Creating issue in ${repo}...`);
  console.log(`Title: ${title}\n`);

  try {
    let command = `issue create --repo ${repo} --title "${title}" --body "${body}"`;

    if (labels.length > 0) {
      command += ` --label "${labels.join(',')}"`;
    }

    const result = gh(command);
    console.log('✅ Issue created successfully');
    console.log(result);

    return result;
  } catch (error) {
    console.error('❌ Failed to create issue');
    throw error;
  }
}

/**
 * Get repository information
 */
function getRepoInfo(repo) {
  console.log(`Getting information for ${repo}...\n`);

  try {
    const result = gh(`repo view ${repo} --json name,description,owner,isPrivate,stargazerCount,forkCount,defaultBranchRef`);
    const data = JSON.parse(result);

    console.log(`Repository: ${data.owner.login}/${data.name}`);
    console.log(`Description: ${data.description || 'N/A'}`);
    console.log(`Private: ${data.isPrivate}`);
    console.log(`Stars: ${data.stargazerCount}`);
    console.log(`Forks: ${data.forkCount}`);
    console.log(`Default Branch: ${data.defaultBranchRef.name}`);

    return data;
  } catch (error) {
    console.error('Failed to get repository information');
    throw error;
  }
}

/**
 * List releases for a repository
 */
function listReleases(repo, limit = 5) {
  console.log(`Listing releases for ${repo} (limit: ${limit})...\n`);

  try {
    const result = gh(`release list --repo ${repo} --limit ${limit} --json tagName,name,isPrerelease,createdAt`);
    const releases = JSON.parse(result);

    if (releases.length === 0) {
      console.log('No releases found');
      return [];
    }

    releases.forEach(release => {
      console.log(`${release.tagName}: ${release.name}`);
      console.log(`  Prerelease: ${release.isPrerelease}`);
      console.log(`  Created: ${new Date(release.createdAt).toLocaleString()}`);
      console.log('');
    });

    return releases;
  } catch (error) {
    console.error('Failed to list releases');
    throw error;
  }
}

/**
 * Search repositories
 */
function searchRepos(query, limit = 10) {
  console.log(`Searching repositories: "${query}" (limit: ${limit})...\n`);

  try {
    const data = curl(`/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}`);

    if (data.total_count === 0) {
      console.log('No repositories found');
      return [];
    }

    console.log(`Total results: ${data.total_count}\n`);

    data.items.forEach(repo => {
      console.log(`${repo.full_name} (⭐ ${repo.stargazers_count})`);
      console.log(`  ${repo.description || 'No description'}`);
      console.log(`  ${repo.html_url}`);
      console.log('');
    });

    return data.items;
  } catch (error) {
    console.error('Failed to search repositories');
    throw error;
  }
}

/**
 * Main CLI
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
GitHub API Helper

Usage:
  validate-token                           - Validate GitHub token
  check-rate-limit                         - Check API rate limit
  list-issues <owner/repo> [state] [limit] - List issues (state: open/closed/all)
  list-prs <owner/repo> [state] [limit]    - List pull requests
  create-issue <owner/repo> <title> <body> - Create an issue
  get-repo <owner/repo>                    - Get repository information
  list-releases <owner/repo> [limit]       - List releases
  search-repos <query> [limit]             - Search repositories

Environment:
  GITHUB_TOKEN or GH_TOKEN must be set
    `);
    process.exit(1);
  }

  try {
    switch (command) {
      case 'validate-token':
        validateToken();
        break;

      case 'check-rate-limit':
        checkRateLimit();
        break;

      case 'list-issues':
        if (!args[1]) {
          console.error('Error: Repository required (e.g., owner/repo)');
          process.exit(1);
        }
        listIssues(args[1], args[2] || 'open', parseInt(args[3] || '10'));
        break;

      case 'list-prs':
        if (!args[1]) {
          console.error('Error: Repository required (e.g., owner/repo)');
          process.exit(1);
        }
        listPRs(args[1], args[2] || 'open', parseInt(args[3] || '10'));
        break;

      case 'create-issue':
        if (!args[1] || !args[2] || !args[3]) {
          console.error('Error: Repository, title, and body required');
          console.error('Usage: create-issue <owner/repo> <title> <body>');
          process.exit(1);
        }
        createIssue(args[1], args[2], args[3]);
        break;

      case 'get-repo':
        if (!args[1]) {
          console.error('Error: Repository required (e.g., owner/repo)');
          process.exit(1);
        }
        getRepoInfo(args[1]);
        break;

      case 'list-releases':
        if (!args[1]) {
          console.error('Error: Repository required (e.g., owner/repo)');
          process.exit(1);
        }
        listReleases(args[1], parseInt(args[2] || '5'));
        break;

      case 'search-repos':
        if (!args[1]) {
          console.error('Error: Search query required');
          process.exit(1);
        }
        searchRepos(args[1], parseInt(args[2] || '10'));
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('\nCommand failed:', error.message);
    process.exit(1);
  }
}

main();
