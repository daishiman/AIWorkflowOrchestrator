#!/usr/bin/env node

/**
 * GitHub Actions Environment Status Checker
 *
 * 環境のステータス、デプロイメント履歴、保護ルールを確認するスクリプト。
 *
 * 使用方法:
 *   node check-environment.mjs [environment-name]
 *   node check-environment.mjs production
 *   node check-environment.mjs --all
 *
 * 必要な環境変数:
 *   GITHUB_TOKEN: GitHub Personal Access Token (repo スコープ)
 *   GITHUB_REPOSITORY: owner/repo 形式 (例: octocat/Hello-World)
 */

import { execSync } from "child_process";

// 設定
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || detectRepository();
const [OWNER, REPO] = GITHUB_REPOSITORY?.split("/") || [];

// 引数解析
const args = process.argv.slice(2);
const showAll = args.includes("--all") || args.includes("-a");
const environmentName = args.find((arg) => !arg.startsWith("--"));

/**
 * メイン処理
 */
async function main() {
  console.log("🔍 GitHub Actions Environment Checker\n");

  // 検証
  if (!GITHUB_TOKEN) {
    console.error("❌ GITHUB_TOKEN environment variable is required");
    console.error("   Set it with: export GITHUB_TOKEN=ghp_xxxxxxxxxxxx");
    process.exit(1);
  }

  if (!OWNER || !REPO) {
    console.error("❌ GITHUB_REPOSITORY environment variable is required");
    console.error("   Set it with: export GITHUB_REPOSITORY=owner/repo");
    process.exit(1);
  }

  console.log(`📦 Repository: ${OWNER}/${REPO}\n`);

  try {
    if (showAll) {
      await listAllEnvironments();
    } else if (environmentName) {
      await checkEnvironment(environmentName);
    } else {
      console.error("❌ Usage: node check-environment.mjs [environment-name]");
      console.error("   Or:    node check-environment.mjs --all");
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * すべての環境を一覧表示
 */
async function listAllEnvironments() {
  console.log("📋 All Environments:\n");

  const environments = await fetchEnvironments();

  if (environments.length === 0) {
    console.log("   No environments found.");
    return;
  }

  environments.forEach((env, index) => {
    console.log(`${index + 1}. ${env.name}`);
    if (env.url) {
      console.log(`   URL: ${env.url}`);
    }
    console.log(
      `   Protection rules: ${env.protection_rules.length > 0 ? "✅" : "❌"}`,
    );
    console.log("");
  });

  console.log(`Total: ${environments.length} environment(s)`);
}

/**
 * 特定の環境の詳細情報を表示
 */
async function checkEnvironment(name) {
  console.log(`🔎 Checking environment: ${name}\n`);

  // 環境情報取得
  const environment = await fetchEnvironment(name);

  // 基本情報
  console.log("📌 Basic Information:");
  console.log(`   Name: ${environment.name}`);
  console.log(`   URL: ${environment.url || "Not set"}`);
  console.log(`   ID: ${environment.id}`);
  console.log("");

  // 保護ルール
  console.log("🛡️  Protection Rules:");
  const rules = environment.protection_rules || [];

  if (rules.length === 0) {
    console.log("   No protection rules configured");
  } else {
    rules.forEach((rule) => {
      if (rule.type === "required_reviewers") {
        console.log(
          `   ✅ Required Reviewers: ${rule.reviewers.length} reviewer(s)`,
        );
        rule.reviewers.forEach((reviewer) => {
          const type = reviewer.type === "User" ? "👤" : "👥";
          console.log(
            `      ${type} ${reviewer.reviewer.login || reviewer.reviewer.name}`,
          );
        });
      } else if (rule.type === "wait_timer") {
        const minutes = rule.wait_timer;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        console.log(
          `   ⏳ Wait Timer: ${hours > 0 ? `${hours}h ` : ""}${mins}m`,
        );
      }
    });
  }
  console.log("");

  // デプロイメントブランチ設定
  console.log("🌿 Deployment Branches:");
  const branchPolicy = environment.deployment_branch_policy;
  if (!branchPolicy) {
    console.log("   All branches allowed");
  } else if (branchPolicy.protected_branches) {
    console.log("   Protected branches only");
  } else if (branchPolicy.custom_branch_policies) {
    console.log("   Custom branch policy enabled");
  }
  console.log("");

  // デプロイメント履歴（最新5件）
  console.log("📜 Recent Deployments (last 5):");
  const deployments = await fetchDeployments(name);

  if (deployments.length === 0) {
    console.log("   No deployments found");
  } else {
    deployments.slice(0, 5).forEach((deployment, index) => {
      const status = getDeploymentStatusIcon(deployment.state);
      const date = new Date(deployment.created_at).toLocaleString();
      console.log(`   ${index + 1}. ${status} ${deployment.task} - ${date}`);
      console.log(`      Ref: ${deployment.ref}`);
      console.log(`      Creator: ${deployment.creator.login}`);
      if (deployment.description) {
        console.log(`      Description: ${deployment.description}`);
      }
      console.log("");
    });
  }

  // シークレットとバリアブル（名前のみ）
  console.log("🔐 Environment Secrets:");
  const secrets = await fetchEnvironmentSecrets(name);
  if (secrets.length === 0) {
    console.log("   No secrets configured");
  } else {
    secrets.forEach((secret) => {
      const updated = new Date(secret.updated_at).toLocaleDateString();
      console.log(`   🔑 ${secret.name} (updated: ${updated})`);
    });
  }
  console.log("");

  console.log("📊 Environment Variables:");
  const variables = await fetchEnvironmentVariables(name);
  if (variables.length === 0) {
    console.log("   No variables configured");
  } else {
    variables.forEach((variable) => {
      const updated = new Date(variable.updated_at).toLocaleDateString();
      console.log(`   📝 ${variable.name} (updated: ${updated})`);
    });
  }
}

/**
 * GitHub API: すべての環境を取得
 */
async function fetchEnvironments() {
  const response = await githubAPI(`/repos/${OWNER}/${REPO}/environments`);
  return response.environments || [];
}

/**
 * GitHub API: 特定の環境を取得
 */
async function fetchEnvironment(name) {
  return await githubAPI(`/repos/${OWNER}/${REPO}/environments/${name}`);
}

/**
 * GitHub API: デプロイメント履歴を取得
 */
async function fetchDeployments(environment) {
  const response = await githubAPI(
    `/repos/${OWNER}/${REPO}/deployments?environment=${environment}&per_page=5`,
  );
  return response || [];
}

/**
 * GitHub API: 環境シークレットを取得
 */
async function fetchEnvironmentSecrets(name) {
  const response = await githubAPI(
    `/repos/${OWNER}/${REPO}/environments/${name}/secrets`,
  );
  return response.secrets || [];
}

/**
 * GitHub API: 環境変数を取得
 */
async function fetchEnvironmentVariables(name) {
  const response = await githubAPI(
    `/repos/${OWNER}/${REPO}/environments/${name}/variables`,
  );
  return response.variables || [];
}

/**
 * GitHub API リクエスト
 */
async function githubAPI(endpoint) {
  const url = `https://api.github.com${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Resource not found: ${endpoint}`);
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API request failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * リポジトリを自動検出（git remoteから）
 */
function detectRepository() {
  try {
    const remote = execSync("git remote get-url origin", {
      encoding: "utf8",
    }).trim();
    const match = remote.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
  } catch {
    // git コマンドが失敗した場合は無視
  }
  return null;
}

/**
 * デプロイメントステータスのアイコン
 */
function getDeploymentStatusIcon(state) {
  const icons = {
    success: "✅",
    failure: "❌",
    error: "❌",
    pending: "⏳",
    in_progress: "🔄",
    queued: "⏸️",
    inactive: "💤",
  };
  return icons[state] || "❓";
}

// スクリプト実行
main();
