#!/usr/bin/env node

/**
 * validate-structure.mjs
 * エージェント構造の妥当性を検証するスクリプト
 *
 * Usage: node validate-structure.mjs <agent_file.md>
 *
 * 検証項目:
 *   1. YAML Frontmatterの構文チェック
 *   2. 必須フィールドの存在確認
 *   3. 必須セクションの存在確認
 *   4. ファイル構造の妥当性
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

const REQUIRED_FIELDS = ['name', 'description', 'tools', 'model', 'version'];
const VALID_TOOLS = ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash', 'Task', 'MultiEdit', 'TodoWrite'];
const VALID_MODELS = ['sonnet', 'opus', 'haiku'];
const REQUIRED_SECTIONS = ['## 役割', '## 専門分野', '## ワークフロー', '## ベストプラクティス'];
const REQUIRED_SECTIONS_EN = ['## Role', '## Specialties', '## Workflow', '## Best Practices'];

/**
 * YAML Frontmatterをチェック
 */
function checkYamlFrontmatter(content) {
  console.log('📝 [1/4] YAML Frontmatter構文チェック...');

  let errors = 0;
  let warnings = 0;

  // YAML Frontmatterの存在確認
  if (!content.includes('---')) {
    console.log(`${colors.red}  ✗ YAML Frontmatterが見つかりません${colors.reset}`);
    return { errors: 1, warnings: 0 };
  }

  // 基本的な構文チェック
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];

    // 基本的なYAML構文チェック
    const lines = frontmatter.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith(' ') && !line.startsWith('-') && !line.includes(':')) {
        console.log(`${colors.yellow}  ⚠ YAML構文に問題がある可能性: ${line}${colors.reset}`);
        warnings++;
      }
    }

    if (warnings === 0) {
      console.log(`${colors.green}  ✓ YAML構文が正しいです${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}  ✗ YAML Frontmatterの形式が不正です${colors.reset}`);
    errors++;
  }

  return { errors, warnings };
}

/**
 * 必須フィールドをチェック
 */
function checkRequiredFields(content) {
  console.log('🔍 [2/4] 必須フィールドの存在確認...');

  let errors = 0;
  let warnings = 0;

  for (const field of REQUIRED_FIELDS) {
    const regex = new RegExp(`^${field}:\\s*(.+)$`, 'm');
    const match = content.match(regex);

    if (match) {
      const value = match[1].trim();
      console.log(`${colors.green}  ✓ ${field}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}${colors.reset}`);

      // 追加の妥当性チェック
      if (field === 'tools') {
        const tools = value.replace(/[\[\]]/g, '').split(',').map(t => t.trim());
        for (const tool of tools) {
          if (tool && !VALID_TOOLS.includes(tool)) {
            console.log(`${colors.yellow}  ⚠ 未知のツール: ${tool}${colors.reset}`);
            warnings++;
          }
        }
      }

      if (field === 'model') {
        if (!VALID_MODELS.includes(value)) {
          console.log(`${colors.yellow}  ⚠ 未知のモデル: ${value}${colors.reset}`);
          warnings++;
        }
      }

      if (field === 'version') {
        if (!/^\d+\.\d+\.\d+$/.test(value)) {
          console.log(`${colors.yellow}  ⚠ バージョンがセマンティックバージョニング形式ではありません: ${value}${colors.reset}`);
          warnings++;
        }
      }
    } else {
      console.log(`${colors.red}  ✗ 必須フィールド '${field}' が見つかりません${colors.reset}`);
      errors++;
    }
  }

  return { errors, warnings };
}

/**
 * 必須セクションをチェック
 */
function checkRequiredSections(content) {
  console.log('📋 [3/4] 必須セクションの存在確認...');

  let errors = 0;
  let warnings = 0;

  for (let i = 0; i < REQUIRED_SECTIONS.length; i++) {
    const jpSection = REQUIRED_SECTIONS[i];
    const enSection = REQUIRED_SECTIONS_EN[i];

    if (content.includes(jpSection)) {
      console.log(`${colors.green}  ✓ セクションあり: ${jpSection}${colors.reset}`);
    } else if (content.includes(enSection)) {
      console.log(`${colors.green}  ✓ セクションあり: ${enSection}${colors.reset}`);
    } else {
      console.log(`${colors.red}  ✗ 必須セクションが見つかりません: ${jpSection}${colors.reset}`);
      errors++;
    }
  }

  // Phaseセクションのチェック
  const phaseCount = (content.match(/^### Phase/gm) || []).length;

  if (phaseCount >= 3 && phaseCount <= 7) {
    console.log(`${colors.green}  ✓ Phase数適切（${phaseCount} 個）${colors.reset}`);
  } else if (phaseCount > 7) {
    console.log(`${colors.yellow}  ⚠ Phase数が多すぎます（${phaseCount} 個）${colors.reset}`);
    warnings++;
  } else if (phaseCount > 0) {
    console.log(`${colors.yellow}  ⚠ Phase数が少ないです（${phaseCount} 個）${colors.reset}`);
    warnings++;
  } else {
    console.log(`${colors.red}  ✗ Phaseセクションが見つかりません${colors.reset}`);
    errors++;
  }

  return { errors, warnings };
}

/**
 * ファイル構造をチェック
 */
function checkFileStructure(content, filePath) {
  console.log('📁 [4/4] ファイル構造の妥当性検証...');

  let errors = 0;
  let warnings = 0;

  // ファイルサイズチェック
  const lineCount = content.split('\n').length;

  if (lineCount >= 450 && lineCount <= 550) {
    console.log(`${colors.green}  ✓ ファイルサイズ適切（${lineCount} 行）${colors.reset}`);
  } else if (lineCount > 550) {
    console.log(`${colors.yellow}  ⚠ ファイルが大きすぎます（${lineCount} 行） - スキル分割を検討${colors.reset}`);
    warnings++;
  } else {
    console.log(`${colors.blue}  ℹ ファイルが小さめです（${lineCount} 行）${colors.reset}`);
  }

  // スキル参照のチェック
  const skillRefCount = (content.match(/Skill\(/g) || []).length;

  if (skillRefCount > 0) {
    console.log(`${colors.green}  ✓ スキル参照あり（${skillRefCount} 個）${colors.reset}`);

    // 相対パスの使用を確認
    if (content.includes('Skill(.claude/skills/')) {
      console.log(`${colors.green}  ✓ 相対パス使用${colors.reset}`);
    } else {
      console.log(`${colors.yellow}  ⚠ 絶対パスが使用されている可能性があります${colors.reset}`);
      warnings++;
    }
  } else {
    console.log(`${colors.blue}  ℹ スキル参照なし（スタンドアロンエージェント）${colors.reset}`);
  }

  // 変更履歴の確認
  if (content.includes('## 変更履歴') || content.includes('## Changelog')) {
    console.log(`${colors.green}  ✓ 変更履歴セクションあり${colors.reset}`);
  } else {
    console.log(`${colors.yellow}  ⚠ 変更履歴セクションがありません${colors.reset}`);
    warnings++;
  }

  return { errors, warnings };
}

/**
 * メイン検証関数
 */
function validateStructure(agentFile) {
  console.log('=== エージェント構造検証 ===');
  console.log(`対象ファイル: ${agentFile}`);
  console.log('');

  if (!fs.existsSync(agentFile)) {
    console.log(`${colors.red}エラー: ファイルが見つかりません: ${agentFile}${colors.reset}`);
    return false;
  }

  const content = fs.readFileSync(agentFile, 'utf-8');

  let totalErrors = 0;
  let totalWarnings = 0;

  // 1. YAML Frontmatter構文チェック
  const yamlResult = checkYamlFrontmatter(content);
  totalErrors += yamlResult.errors;
  totalWarnings += yamlResult.warnings;

  // 2. 必須フィールドの存在確認
  const fieldsResult = checkRequiredFields(content);
  totalErrors += fieldsResult.errors;
  totalWarnings += fieldsResult.warnings;

  // 3. 必須セクションの存在確認
  const sectionsResult = checkRequiredSections(content);
  totalErrors += sectionsResult.errors;
  totalWarnings += sectionsResult.warnings;

  // 4. ファイル構造の妥当性
  const structureResult = checkFileStructure(content, agentFile);
  totalErrors += structureResult.errors;
  totalWarnings += structureResult.warnings;

  // 結果サマリー
  const lineCount = content.split('\n').length;

  console.log('');
  console.log('=== 検証結果サマリー ===');
  console.log(`ファイル: ${agentFile}`);
  console.log(`行数: ${lineCount}`);
  console.log(`エラー: ${colors.red}${totalErrors}${colors.reset}`);
  console.log(`警告: ${colors.yellow}${totalWarnings}${colors.reset}`);

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`\n${colors.green}✓ すべての検証に合格しました${colors.reset}`);
    return true;
  } else if (totalErrors === 0) {
    console.log(`\n${colors.yellow}⚠ 警告がありますが、致命的ではありません${colors.reset}`);
    return true;
  } else {
    console.log(`\n${colors.red}✗ エラーが検出されました。修正が必要です${colors.reset}`);
    return false;
  }
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用法: node validate-structure.mjs <agent_file.md>');
    console.log('');
    console.log('例:');
    console.log('  node validate-structure.mjs .claude/agents/skill-librarian.md');
    process.exit(1);
  }

  const success = validateStructure(args[0]);
  process.exit(success ? 0 : 1);
}

main();
