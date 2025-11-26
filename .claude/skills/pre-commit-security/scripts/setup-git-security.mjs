#!/usr/bin/env node
/**
 * Git Security Setup Script
 * プロジェクトにGitセキュリティメカニズムを自動セットアップします
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

console.log('🔐 Git Security Setup');
console.log('====================');
console.log(`Project: ${PROJECT_ROOT}\n`);

async function checkGitSecretsInstalled() {
  try {
    await execAsync('command -v git-secrets');
    return true;
  } catch {
    return false;
  }
}

async function installGitSecrets() {
  console.log('📦 Checking git-secrets installation...');

  const installed = await checkGitSecretsInstalled();

  if (!installed) {
    console.log('⚠️  git-secrets not found');

    if (process.platform === 'darwin') {
      console.log('Installing git-secrets via Homebrew...');
      await execAsync('brew install git-secrets');
    } else if (process.platform === 'linux') {
      console.log('Installing git-secrets from source...');
      await execAsync(`
        cd /tmp &&
        git clone https://github.com/awslabs/git-secrets.git &&
        cd git-secrets &&
        sudo make install
      `);
    } else {
      console.error('❌ Unsupported OS. Please install git-secrets manually:');
      console.error('   https://github.com/awslabs/git-secrets');
      process.exit(1);
    }
  } else {
    console.log('✅ git-secrets is already installed');
  }
}

async function initializeGitSecrets() {
  console.log('\n🔧 Initializing git-secrets...');

  try {
    await execAsync(`cd "${PROJECT_ROOT}" && git secrets --install --force`);
    console.log('✅ Git secrets hooks installed');
  } catch (error) {
    console.error('❌ Failed to initialize git-secrets:', error.message);
    process.exit(1);
  }
}

async function registerPatterns() {
  console.log('\n📝 Registering secret detection patterns...');

  const patterns = [
    // AWS公式パターン
    { cmd: 'git secrets --register-aws', desc: 'AWS patterns' },

    // OpenAI
    { cmd: "git secrets --add 'sk-proj-[a-zA-Z0-9]{48}'", desc: 'OpenAI API Key' },
    { cmd: "git secrets --add --allowed 'sk-proj-example'", desc: 'OpenAI (whitelist)' },

    // Anthropic
    { cmd: "git secrets --add 'sk-ant-api03-[a-zA-Z0-9_-]{95}'", desc: 'Anthropic API Key' },

    // Discord
    { cmd: "git secrets --add 'https://discord\\.com/api/webhooks/\\d+/[a-zA-Z0-9_-]+'", desc: 'Discord Webhook' },
    { cmd: "git secrets --add --allowed 'https://discord.com/api/webhooks/example'", desc: 'Discord (whitelist)' },

    // GitHub
    { cmd: "git secrets --add 'ghp_[a-zA-Z0-9]{36}'", desc: 'GitHub PAT' },
    { cmd: "git secrets --add 'github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}'", desc: 'GitHub fine-grained PAT' },

    // Stripe
    { cmd: "git secrets --add 'sk_live_[0-9a-zA-Z]{24,}'", desc: 'Stripe API Key' },
    { cmd: "git secrets --add --allowed 'sk_test_'", desc: 'Stripe test (whitelist)' },

    // PostgreSQL
    { cmd: "git secrets --add 'postgresql://[^:]+:[^@]+@[^/]+'", desc: 'PostgreSQL connection' },

    // Generic high-entropy
    { cmd: "git secrets --add '[a-zA-Z0-9]{32,}'", desc: 'High-entropy strings' },

    // Whitelists
    { cmd: "git secrets --add --allowed '.env.example'", desc: 'Whitelist .env.example' },
    { cmd: "git secrets --add --allowed 'tests/fixtures/'", desc: 'Whitelist test fixtures' },
  ];

  for (const { cmd, desc } of patterns) {
    try {
      await execAsync(`cd "${PROJECT_ROOT}" && ${cmd}`);
      console.log(`  ✅ ${desc}`);
    } catch (error) {
      console.log(`  ⚠️  ${desc} - ${error.message}`);
    }
  }

  console.log('✅ Detection patterns registered');
}

async function scanHistory() {
  console.log('\n🔍 Scanning existing repository history...');

  try {
    const { stdout } = await execAsync(`cd "${PROJECT_ROOT}" && git secrets --scan-history`);
    console.log('✅ No secrets found in Git history');
  } catch (error) {
    console.log('❌ WARNING: Secrets detected in Git history!');
    console.log('\nPlease review and take action:');
    console.log('  1. Rotate the exposed secrets immediately');
    console.log('  2. Clean Git history (see docs/git-history-cleaning.md)');
    console.log('  3. Force push after team coordination\n');

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    await new Promise(resolve => {
      rl.question('Continue setup anyway? (y/N) ', answer => {
        rl.close();
        if (answer.toLowerCase() !== 'y') {
          process.exit(1);
        }
        resolve();
      });
    });
  }
}

async function validateGitignore() {
  console.log('\n📋 Validating .gitignore...');

  const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
  const requiredPatterns = ['.env', '*.key', '*.pem', 'secrets/'];

  try {
    const content = await fs.readFile(gitignorePath, 'utf8');
    const missing = requiredPatterns.filter(pattern => !content.includes(pattern));

    if (missing.length > 0) {
      console.log('⚠️  Missing patterns in .gitignore:');
      missing.forEach(p => console.log(`  - ${p}`));
      console.log('\nConsider adding these patterns to .gitignore');
    } else {
      console.log('✅ .gitignore contains all required patterns');
    }
  } catch (error) {
    console.log('⚠️  .gitignore not found or not readable');
  }
}

async function main() {
  try {
    await installGitSecrets();
    await initializeGitSecrets();
    await registerPatterns();
    await scanHistory();
    await validateGitignore();

    console.log('\n🎉 Git Security Setup Complete!\n');
    console.log('Next steps:');
    console.log('  1. Commit your changes (hooks will now check for secrets)');
    console.log('  2. Share this script with your team');
    console.log('  3. Add CI/CD scanning (see .github/workflows/security.yml)');
    console.log('\nTo test the hook:');
    console.log('  echo "password=secretvalue" > test.txt');
    console.log('  git add test.txt');
    console.log('  git commit -m "test"  # Should be blocked\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
