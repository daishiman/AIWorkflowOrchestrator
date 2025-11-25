#!/usr/bin/env node

/**
 * Documentation Structure Analyzer
 * Purpose: Analyze and report on documentation structure quality
 *
 * Usage: node analyze-structure.mjs <skill-directory>
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

/**
 * Count files in directory matching pattern
 */
function countFiles(dirPath, extension) {
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const files = fs.readdirSync(dirPath);
  if (extension) {
    return files.filter(f => f.endsWith(extension)).length;
  }
  return files.filter(f => fs.statSync(path.join(dirPath, f)).isFile()).length;
}

/**
 * Analyze markdown files in directory
 */
function analyzeDirectory(dirPath, extension = '.md') {
  if (!fs.existsSync(dirPath)) {
    return { exists: false, fileCount: 0, files: [] };
  }

  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith(extension))
    .map(fileName => {
      const filePath = path.join(dirPath, fileName);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').length;

      let status = 'ok';
      if (lines > 550) {
        status = 'error';
      } else if (lines > 500) {
        status = 'warning';
      }

      return { name: fileName, lines, status };
    });

  return { exists: true, fileCount: files.length, files };
}

/**
 * Get status indicator
 */
function getStatusIndicator(status) {
  switch (status) {
    case 'ok': return `${colors.green}✓${colors.reset}`;
    case 'warning': return `${colors.yellow}⚠️ 超過${colors.reset}`;
    case 'error': return `${colors.red}✗ 要分割${colors.reset}`;
    default: return '';
  }
}

/**
 * Analyze skill directory structure
 */
function analyzeSkillStructure(skillDir) {
  if (!fs.existsSync(skillDir)) {
    console.log(`${colors.red}Error: Directory not found: ${skillDir}${colors.reset}`);
    process.exit(1);
  }

  const skillName = path.basename(skillDir);

  console.log('=== Documentation Structure Analysis ===');
  console.log(`Skill: ${skillName}`);
  console.log('');

  // File composition
  console.log('【ファイル構成】');
  const hasSkillMd = fs.existsSync(path.join(skillDir, 'SKILL.md'));
  console.log(`SKILL.md: ${hasSkillMd ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`);

  const resourceCount = countFiles(path.join(skillDir, 'resources'), '.md');
  console.log(`resources/: ${resourceCount}ファイル`);

  const scriptsCount = countFiles(path.join(skillDir, 'scripts'));
  console.log(`scripts/: ${scriptsCount}ファイル`);

  const templatesCount = countFiles(path.join(skillDir, 'templates'));
  console.log(`templates/: ${templatesCount}ファイル`);

  console.log('');

  // Line count check
  console.log('【行数チェック】');

  // SKILL.md
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (hasSkillMd) {
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const lines = content.split('\n').length;
    let status = 'ok';
    if (lines > 550) status = 'error';
    else if (lines > 500) status = 'warning';

    console.log(`SKILL.md: ${lines}行 ${getStatusIndicator(status)}`);
  }

  // Resource files
  const resourcesDir = path.join(skillDir, 'resources');
  const resourceAnalysis = analyzeDirectory(resourcesDir);

  if (resourceAnalysis.exists && resourceAnalysis.files.length > 0) {
    for (const file of resourceAnalysis.files) {
      console.log(`  ${file.name}: ${file.lines}行 ${getStatusIndicator(file.status)}`);
    }
  }

  console.log('');

  // Recommendations
  console.log('【推奨事項】');

  const issues = [];

  if (!hasSkillMd) {
    issues.push('- SKILL.mdが存在しません。作成してください。');
  }

  if (resourceCount === 0) {
    issues.push('- resourcesディレクトリが空です。詳細情報を分離することを検討してください。');
  }

  if (scriptsCount === 0) {
    issues.push('- scriptsディレクトリが空です。自動化スクリプトの追加を検討してください。');
  }

  const oversizedFiles = resourceAnalysis.files.filter(f => f.status !== 'ok');
  for (const file of oversizedFiles) {
    issues.push(`- ${file.name}が500行を超えています（${file.lines}行）。分割を検討してください。`);
  }

  if (issues.length === 0) {
    console.log(`${colors.green}✅ 構造に問題は見つかりませんでした${colors.reset}`);
  } else {
    for (const issue of issues) {
      console.log(issue);
    }
  }

  console.log('');
  console.log('=== 分析完了 ===');
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node analyze-structure.mjs <skill-directory>');
    console.log('');
    console.log('Example:');
    console.log('  node analyze-structure.mjs .claude/skills/documentation-architecture');
    process.exit(1);
  }

  analyzeSkillStructure(args[0]);
}

main();
