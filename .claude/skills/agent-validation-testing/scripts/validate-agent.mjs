#!/usr/bin/env node
/**
 * validate-agent.mjs
 * エージェントファイルの構文検証と品質チェックを行うスクリプト
 *
 * 使用方法:
 *   node .claude/skills/agent-validation-testing/scripts/validate-agent.mjs <agent_file.md>
 *
 * 出力:
 *   YAML構文、Markdown構造、必須要素の検証結果を表示します。
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const REQUIRED_YAML_FIELDS = ['name', 'description'];
const OPTIONAL_YAML_FIELDS = ['tools', 'model', 'version'];
const REQUIRED_SECTIONS = [
  { pattern: /^#\s+\w+/m, name: 'タイトル（H1）' },
  { pattern: /^##\s+役割定義/m, name: '役割定義セクション' },
];
const RECOMMENDED_SECTIONS = [
  { pattern: /^##\s+(ワークフロー|タスク実行)/m, name: 'ワークフローセクション' },
  { pattern: /^##\s+(ツール使用方針|ツール)/m, name: 'ツール使用方針セクション' },
  { pattern: /^##\s+(品質基準|完了条件)/m, name: '品質基準セクション' },
  { pattern: /^##\s+依存関係/m, name: '依存関係セクション' },
];

class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  addError(message) {
    this.errors.push({ level: 'ERROR', message });
  }

  addWarning(message) {
    this.warnings.push({ level: 'WARNING', message });
  }

  addInfo(message) {
    this.info.push({ level: 'INFO', message });
  }

  get isValid() {
    return this.errors.length === 0;
  }
}

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { raw: null, parsed: {} };

  const raw = match[1];
  const parsed = {};
  const lines = raw.split('\n');
  let currentKey = null;
  let multilineValue = '';
  let inMultiline = false;

  for (const line of lines) {
    if (!inMultiline && line.match(/^[\w-]+:/)) {
      if (currentKey && multilineValue) {
        parsed[currentKey] = multilineValue.trim();
        multilineValue = '';
      }
      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      currentKey = key;

      if (value === '|') {
        inMultiline = true;
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Array value like [Read, Write, Edit]
        parsed[key] = value.slice(1, -1).split(',').map(s => s.trim());
        currentKey = null;
      } else if (value) {
        parsed[key] = value;
        currentKey = null;
      }
    } else if (currentKey) {
      multilineValue += line + '\n';
    }
  }

  if (currentKey && multilineValue) {
    parsed[currentKey] = multilineValue.trim();
  }

  return { raw, parsed };
}

function validateYaml(content, result) {
  const { raw, parsed } = parseYamlFrontmatter(content);

  if (!raw) {
    result.addError('YAML Frontmatterが見つかりません。ファイルは---で始まる必要があります。');
    return;
  }

  // Check required fields
  for (const field of REQUIRED_YAML_FIELDS) {
    if (!parsed[field]) {
      result.addError(`必須フィールド "${field}" が見つかりません`);
    }
  }

  // Check optional fields
  for (const field of OPTIONAL_YAML_FIELDS) {
    if (!parsed[field]) {
      result.addWarning(`推奨フィールド "${field}" が見つかりません`);
    }
  }

  // Validate name format (kebab-case)
  if (parsed.name && !/^[a-z][a-z0-9-]*$/.test(parsed.name)) {
    result.addWarning(`name "${parsed.name}" はkebab-case形式を推奨します`);
  }

  // Validate description length
  if (parsed.description) {
    const descLines = parsed.description.split('\n').filter(l => l.trim()).length;
    if (descLines < 4) {
      result.addWarning('descriptionは4行以上を推奨します');
    }
    if (descLines > 15) {
      result.addInfo('descriptionが長いです（15行超）。スキルへの分離を検討してください');
    }
  }

  // Validate tools format
  if (parsed.tools) {
    if (typeof parsed.tools === 'string' && !parsed.tools.startsWith('[')) {
      result.addWarning('tools属性は配列形式 [Read, Write, ...] を推奨します');
    }
  }

  // Validate model
  if (parsed.model && !['opus', 'sonnet', 'haiku'].includes(parsed.model)) {
    result.addWarning(`model "${parsed.model}" は opus/sonnet/haiku のいずれかを推奨します`);
  }

  // Validate version format
  if (parsed.version && !/^\d+\.\d+\.\d+$/.test(parsed.version)) {
    result.addWarning(`version "${parsed.version}" はセマンティックバージョニング形式(x.y.z)を推奨します`);
  }

  result.addInfo(`YAML解析完了: ${Object.keys(parsed).length}個のフィールド`);
}

function validateMarkdown(content, result) {
  // Check for required sections
  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(content)) {
      result.addError(`必須セクション "${section.name}" が見つかりません`);
    }
  }

  // Check for recommended sections
  for (const section of RECOMMENDED_SECTIONS) {
    if (!section.pattern.test(content)) {
      result.addWarning(`推奨セクション "${section.name}" が見つかりません`);
    }
  }

  // Check heading hierarchy
  const headings = content.match(/^#+\s+.+$/gm) || [];
  let lastLevel = 0;
  for (const heading of headings) {
    const level = heading.match(/^#+/)[0].length;
    if (level > lastLevel + 1) {
      result.addWarning(`見出しレベルのスキップを検出: ${heading.trim()}`);
    }
    lastLevel = level;
  }

  // Check for unclosed code blocks
  const codeBlocks = content.match(/```/g) || [];
  if (codeBlocks.length % 2 !== 0) {
    result.addError('閉じられていないコードブロックがあります');
  }

  // Check for broken links to skill files
  const skillRefs = content.match(/\.claude\/skills\/[\w-]+\/SKILL\.md/g) || [];
  const baseDir = process.cwd();
  for (const ref of skillRefs) {
    const fullPath = resolve(baseDir, ref);
    if (!existsSync(fullPath)) {
      result.addWarning(`スキル参照先が見つかりません: ${ref}`);
    }
  }

  // Count phases
  const phases = content.match(/### Phase \d+/g) || [];
  if (phases.length < 3) {
    result.addWarning(`Phase定義が${phases.length}個です（3個以上を推奨）`);
  } else {
    result.addInfo(`${phases.length}個のPhaseを検出`);
  }

  // Count checklists
  const checklists = content.match(/- \[ \]/g) || [];
  result.addInfo(`${checklists.length}個のチェックリスト項目を検出`);
}

function validateContent(content, result) {
  // Check line count
  const lines = content.split('\n');
  if (lines.length > 800) {
    result.addWarning(`ファイルが${lines.length}行あります（600行以下を推奨）`);
  } else {
    result.addInfo(`ファイル行数: ${lines.length}行`);
  }

  // Check for "使用タイミング" section
  if (!content.includes('使用タイミング')) {
    result.addWarning('descriptionに「使用タイミング」の記載を推奨します');
  }

  // Check for English activation hints
  if (!content.includes('Use proactively')) {
    result.addInfo('英語のactivationヒントの追加を検討してください');
  }
}

function printResults(result) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    エージェント検証レポート                  ');
  console.log('═══════════════════════════════════════════════════════════');

  if (result.errors.length > 0) {
    console.log('\n❌ エラー:');
    for (const err of result.errors) {
      console.log(`   ${err.message}`);
    }
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  警告:');
    for (const warn of result.warnings) {
      console.log(`   ${warn.message}`);
    }
  }

  if (result.info.length > 0) {
    console.log('\nℹ️  情報:');
    for (const info of result.info) {
      console.log(`   ${info.message}`);
    }
  }

  console.log('\n───────────────────────────────────────────────────────────');
  if (result.isValid) {
    console.log('✅ 検証結果: 合格（エラーなし）');
  } else {
    console.log(`❌ 検証結果: 不合格（${result.errors.length}個のエラー）`);
  }
  console.log('═══════════════════════════════════════════════════════════');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node validate-agent.mjs <agent_file.md>');
    process.exit(1);
  }

  const filePath = resolve(args[0]);
  let content;

  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`エラー: ファイル "${filePath}" を読み込めません`);
    process.exit(1);
  }

  console.log(`\n検証対象: ${filePath}\n`);

  const result = new ValidationResult();

  validateYaml(content, result);
  validateMarkdown(content, result);
  validateContent(content, result);

  printResults(result);

  process.exit(result.isValid ? 0 : 1);
}

main();
