#!/usr/bin/env node
/**
 * Command Structure Validator
 *
 * コマンドファイル（.claude/commands/*.md）の構造を検証します。
 *
 * 検証項目:
 * - YAML Frontmatter の存在と正しさ
 * - description フィールドの存在（必須）
 * - 各オプションフィールドの形式
 * - 本文の基本構造
 *
 * Usage:
 *   node validate-command.mjs <command-file.md>
 *   node validate-command.mjs .claude/commands/my-command.md
 */

import fs from 'fs';
import path from 'path';

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(type, message) {
  const icons = {
    error: `${COLORS.red}❌${COLORS.reset}`,
    success: `${COLORS.green}✅${COLORS.reset}`,
    warning: `${COLORS.yellow}⚠️${COLORS.reset}`,
    info: `${COLORS.blue}ℹ️${COLORS.reset}`
  };
  console.log(`${icons[type]} ${message}`);
}

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const frontmatterText = match[1];
  const frontmatter = {};

  // シンプルなYAMLパース（基本的なキー: 値形式）
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let currentValue = [];
  let inMultiline = false;

  for (const line of lines) {
    // マルチライン値の継続
    if (inMultiline) {
      if (line.match(/^  /)) {
        currentValue.push(line.replace(/^  /, ''));
        continue;
      } else {
        frontmatter[currentKey] = currentValue.join('\n').trim();
        inMultiline = false;
        currentValue = [];
      }
    }

    // 新しいキー
    const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();

      if (value === '|' || value === '>') {
        inMultiline = true;
        currentValue = [];
      } else if (value === '') {
        // 空の値またはマルチライン開始
        frontmatter[currentKey] = '';
      } else {
        frontmatter[currentKey] = value;
      }
    }
  }

  // 最後のマルチライン値を保存
  if (inMultiline && currentKey) {
    frontmatter[currentKey] = currentValue.join('\n').trim();
  }

  return frontmatter;
}

function validateFrontmatter(frontmatter) {
  const errors = [];
  const warnings = [];

  // 必須フィールド: description
  if (!frontmatter.description) {
    errors.push('description フィールドが必須です');
  } else {
    const descLines = frontmatter.description.split('\n').length;
    if (descLines < 2) {
      warnings.push(`description が短すぎます（${descLines}行）。4-8行を推奨`);
    } else if (descLines > 10) {
      warnings.push(`description が長すぎます（${descLines}行）。4-8行を推奨`);
    }
  }

  // オプションフィールドの検証
  if (frontmatter['allowed-tools']) {
    const tools = frontmatter['allowed-tools'];
    // 基本的な形式チェック
    if (!tools.match(/^[A-Za-z,\s\(\)\*\/:]+$/)) {
      warnings.push('allowed-tools の形式を確認してください');
    }
  }

  if (frontmatter.model) {
    const validModels = [
      'claude-opus-4-20250514',
      'claude-sonnet-4-5-20250929',
      'claude-3-5-haiku-20241022'
    ];
    if (!validModels.some(m => frontmatter.model.includes(m))) {
      warnings.push(`model "${frontmatter.model}" が標準モデル名と一致しません`);
    }
  }

  if (frontmatter['disable-model-invocation'] !== undefined) {
    const value = frontmatter['disable-model-invocation'];
    if (value !== 'true' && value !== 'false') {
      errors.push('disable-model-invocation は true または false である必要があります');
    }
  }

  return { errors, warnings };
}

function validateBody(content) {
  const warnings = [];

  // Frontmatter を除去して本文を取得
  const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  if (!bodyMatch) {
    return { errors: [], warnings: ['本文が見つかりません'] };
  }

  const body = bodyMatch[1].trim();

  if (body.length === 0) {
    return { errors: [], warnings: ['本文が空です'] };
  }

  // # タイトルの存在確認
  if (!body.match(/^#\s+.+/m)) {
    warnings.push('# タイトルがありません');
  }

  // 行数チェック
  const lineCount = body.split('\n').length;
  if (lineCount < 5) {
    warnings.push(`本文が短すぎます（${lineCount}行）`);
  } else if (lineCount > 200) {
    warnings.push(`本文が長すぎます（${lineCount}行）。コマンドを分割することを検討してください`);
  }

  return { errors: [], warnings };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
${COLORS.bold}Command Structure Validator${COLORS.reset}

Usage:
  node validate-command.mjs <command-file.md>

Example:
  node validate-command.mjs .claude/commands/my-command.md
`);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    log('error', `ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n${COLORS.bold}Validating: ${filePath}${COLORS.reset}\n`);

  // Frontmatter パース
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter) {
    log('error', 'YAML Frontmatter が見つかりません（--- で囲まれたセクション）');
    process.exit(1);
  }

  log('success', 'YAML Frontmatter が存在します');

  // Frontmatter 検証
  const { errors: fmErrors, warnings: fmWarnings } = validateFrontmatter(frontmatter);

  // 本文検証
  const { errors: bodyErrors, warnings: bodyWarnings } = validateBody(content);

  // 結果表示
  const allErrors = [...fmErrors, ...bodyErrors];
  const allWarnings = [...fmWarnings, ...bodyWarnings];

  if (allErrors.length > 0) {
    console.log(`\n${COLORS.red}Errors:${COLORS.reset}`);
    allErrors.forEach(e => log('error', e));
  }

  if (allWarnings.length > 0) {
    console.log(`\n${COLORS.yellow}Warnings:${COLORS.reset}`);
    allWarnings.forEach(w => log('warning', w));
  }

  // サマリー
  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Errors: ${allErrors.length}`);
  console.log(`  Warnings: ${allWarnings.length}`);

  // 検出されたフィールド
  console.log(`\n${COLORS.bold}Detected Fields:${COLORS.reset}`);
  Object.keys(frontmatter).forEach(key => {
    const value = frontmatter[key];
    const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
    log('info', `${key}: ${displayValue.replace(/\n/g, ' ')}`);
  });

  if (allErrors.length > 0) {
    process.exit(1);
  }

  log('success', '\n検証完了 - 重大なエラーはありません');
}

main();
