#!/usr/bin/env node

/**
 * Token Estimator
 * Purpose: Estimate tokens based on character count and content type
 *
 * Usage: node estimate-tokens.mjs <file.md> [file2.md ...]
 *        node estimate-tokens.mjs <directory>
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
 * Conservative estimate for mixed content:
 * - Japanese text: ~1.5-2 chars/token (more efficient)
 * - English text: ~4 chars/token
 * - Code blocks: ~3-4 chars/token
 * - Markdown syntax: overhead
 * Average: ~3 chars/token for mixed content
 */
function estimateTokens(content) {
  const lines = content.split('\n').length;
  const chars = content.length;
  const tokens = Math.ceil(chars / 3);
  const tokensPerLine = lines > 0 ? Math.ceil(tokens / lines) : 0;

  return { lines, chars, tokens, tokensPerLine };
}

/**
 * Get evaluation status
 */
function getEvaluation(lines, tokens) {
  if (lines < 500 && tokens < 3000) {
    return {
      status: '✅',
      color: colors.green,
      message: '最適サイズ（行数・トークン共に良好）'
    };
  } else if (lines < 500) {
    return {
      status: '⚠️',
      color: colors.yellow,
      message: '行数は良好だがトークン多め（内容を圧縮検討）'
    };
  } else if (lines < 550) {
    return {
      status: '⚠️',
      color: colors.yellow,
      message: '500行超過、分割を検討（目標: 500行以内）'
    };
  } else {
    return {
      status: '✗',
      color: colors.red,
      message: '分割推奨（550行超過）'
    };
  }
}

/**
 * Analyze single file
 */
function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.red}Error: File not found: ${filePath}${colors.reset}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const estimate = estimateTokens(content);
  const evaluation = getEvaluation(estimate.lines, estimate.tokens);

  console.log(`File: ${path.basename(filePath)}`);
  console.log(`Lines: ${estimate.lines}`);
  console.log(`Characters: ${estimate.chars}`);
  console.log(`Estimated tokens: ${estimate.tokens}`);
  console.log('');
  console.log(`Status: ${evaluation.color}${evaluation.status} ${evaluation.message}${colors.reset}`);
  console.log('');
  console.log('参考:');
  console.log('- 目標行数: <500行（推奨）、<550行（許容）');
  console.log(`- 推定トークン/行: ${estimate.tokensPerLine} tokens/line`);
}

/**
 * Analyze multiple files or directory
 */
function analyzeMultiple(targets) {
  let totalLines = 0;
  let totalChars = 0;
  let totalTokens = 0;

  console.log('==========================================');
  console.log('Token Estimation Report');
  console.log('==========================================');
  console.log('');

  for (const target of targets) {
    if (!fs.existsSync(target)) {
      console.log(`${colors.yellow}⚠ Not found: ${target}${colors.reset}`);
      continue;
    }

    const stat = fs.statSync(target);

    if (stat.isDirectory()) {
      // Analyze all .md files in directory
      const files = fs.readdirSync(target)
        .filter(f => f.endsWith('.md'))
        .map(f => path.join(target, f));

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const estimate = estimateTokens(content);
        const evaluation = getEvaluation(estimate.lines, estimate.tokens);

        console.log(`${path.basename(file)}: ${estimate.lines}行, ${estimate.tokens}トークン ${evaluation.status}`);

        totalLines += estimate.lines;
        totalChars += estimate.chars;
        totalTokens += estimate.tokens;
      }
    } else {
      const content = fs.readFileSync(target, 'utf-8');
      const estimate = estimateTokens(content);
      const evaluation = getEvaluation(estimate.lines, estimate.tokens);

      console.log(`${path.basename(target)}: ${estimate.lines}行, ${estimate.tokens}トークン ${evaluation.status}`);

      totalLines += estimate.lines;
      totalChars += estimate.chars;
      totalTokens += estimate.tokens;
    }
  }

  console.log('');
  console.log('------------------------------------------');
  console.log(`合計: ${totalLines}行, ${totalTokens}トークン`);

  if (totalTokens < 20000) {
    console.log(`${colors.green}✅ 推奨範囲内（<20K tokens）${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ 推奨範囲超過（>20K tokens）- 最適化を検討${colors.reset}`);
  }
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node estimate-tokens.mjs <file.md> [file2.md ...]');
    console.log('       node estimate-tokens.mjs <directory>');
    console.log('');
    console.log('Examples:');
    console.log('  node estimate-tokens.mjs ./SKILL.md');
    console.log('  node estimate-tokens.mjs ./resources/');
    process.exit(1);
  }

  if (args.length === 1) {
    const target = args[0];
    const stat = fs.statSync(target);

    if (stat.isFile()) {
      analyzeFile(target);
    } else {
      analyzeMultiple([target]);
    }
  } else {
    analyzeMultiple(args);
  }
}

main();
