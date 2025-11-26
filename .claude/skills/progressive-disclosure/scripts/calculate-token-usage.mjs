#!/usr/bin/env node

/**
 * Token Usage Calculator for Claude Code Skills
 * Purpose: Calculate line counts and estimate tokens for skill files
 *
 * Usage: node calculate-token-usage.mjs <skill-directory>
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

/**
 * Estimate tokens from character count
 * Conservative estimate for mixed content (Japanese/English/code)
 */
function estimateTokens(chars) {
  // ~3 characters per token for mixed content
  return Math.ceil(chars / 3);
}

/**
 * Get file statistics
 */
function getFileStats(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;
  const chars = content.length;
  const tokens = estimateTokens(chars);

  return { path: filePath, lines, chars, tokens };
}

/**
 * Print status indicator based on line count
 */
function getStatusIndicator(lines) {
  if (lines <= 500) {
    return `${colors.green}✓ OK${colors.reset}`;
  } else if (lines <= 550) {
    return `${colors.yellow}⚠ 500行超過${colors.reset}`;
  } else {
    return `${colors.red}✗ 分割推奨${colors.reset}`;
  }
}

/**
 * Analyze skill directory
 */
function analyzeSkillDirectory(skillDir) {
  if (!fs.existsSync(skillDir)) {
    console.log(`${colors.red}Error: Directory not found: ${skillDir}${colors.reset}`);
    process.exit(1);
  }

  const skillName = path.basename(skillDir);

  console.log('==========================================');
  console.log(`File Size Analysis: ${skillName}`);
  console.log('==========================================');
  console.log('');

  let totalLines = 0;
  let totalChars = 0;

  // SKILL.md
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  const skillStats = getFileStats(skillMdPath);

  if (skillStats) {
    console.log('SKILL.md:');
    console.log(`  Lines: ${skillStats.lines}`);
    console.log(`  Estimated tokens: ${skillStats.tokens}`);
    console.log(`  Status: ${getStatusIndicator(skillStats.lines)}`);
    totalLines += skillStats.lines;
    totalChars += skillStats.chars;
  } else {
    console.log(`${colors.yellow}⚠ SKILL.md not found${colors.reset}`);
  }

  // Resources
  console.log('');
  console.log('Resources:');
  const resourcesDir = path.join(skillDir, 'resources');

  if (fs.existsSync(resourcesDir)) {
    const files = fs.readdirSync(resourcesDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(resourcesDir, file);
      const stats = getFileStats(filePath);

      if (stats) {
        console.log(`  - ${file}:`);
        console.log(`    Lines: ${stats.lines}`);
        console.log(`    Estimated tokens: ${stats.tokens}`);
        console.log(`    Status: ${getStatusIndicator(stats.lines)}`);
        totalLines += stats.lines;
        totalChars += stats.chars;
      }
    }

    if (files.length === 0) {
      console.log('  No resource files');
    }
  } else {
    console.log('  No resources directory');
  }

  // Summary
  const totalTokens = estimateTokens(totalChars);

  console.log('');
  console.log('==========================================');
  console.log('Summary');
  console.log('==========================================');
  console.log(`Total lines: ${totalLines}`);
  console.log(`Total characters: ${totalChars}`);
  console.log(`Estimated tokens: ${totalTokens}`);
  console.log('');

  // Overall evaluation
  if (totalLines <= 3000) {
    console.log(`${colors.green}✅ 全体サイズ良好${colors.reset}`);
  } else if (totalLines <= 5000) {
    console.log(`${colors.yellow}⚠ やや大きめ、最適化を検討${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ 大きすぎる、分割を推奨${colors.reset}`);
  }

  console.log('');
  console.log('参考:');
  if (totalLines > 0) {
    console.log(`- 推定トークン/行: ${Math.ceil(totalTokens / totalLines)} tokens/line`);
  }
  console.log('- SKILL.md推奨: <500行');
  console.log('- リソース推奨: 各<500行');
  console.log('');
  console.log('注: トークン見積もりは文字数÷3で計算（日英混在・コード考慮）');
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node calculate-token-usage.mjs <skill-directory>');
    console.log('');
    console.log('Example:');
    console.log('  node calculate-token-usage.mjs .claude/skills/progressive-disclosure');
    process.exit(1);
  }

  analyzeSkillDirectory(args[0]);
}

main();
