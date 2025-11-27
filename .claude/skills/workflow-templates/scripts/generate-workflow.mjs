#!/usr/bin/env node

/**
 * Workflow Template Generator
 *
 * プロジェクトタイプに基づいて適切なGitHub Actionsワークフローテンプレートを生成します。
 *
 * Usage:
 *   node generate-workflow.mjs <project-type> <output-path>
 *
 * Examples:
 *   node generate-workflow.mjs nodejs .github/workflows/
 *   node generate-workflow.mjs docker .github/workflows/
 *   node generate-workflow.mjs ci .github/workflows/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// テンプレートディレクトリのパス
const TEMPLATE_DIR = resolve(__dirname, '../templates');

// 利用可能なプロジェクトタイプとテンプレートのマッピング
const PROJECT_TYPES = {
  nodejs: {
    template: 'nodejs-template.yaml',
    description: 'Node.js CI/CD workflow with auto-detection of package manager',
    outputName: 'nodejs-ci.yaml',
  },
  docker: {
    template: 'docker-template.yaml',
    description: 'Docker build and push workflow with security scanning',
    outputName: 'docker-build.yaml',
  },
  ci: {
    template: 'ci-template.yaml',
    description: 'Generic CI workflow for any project type',
    outputName: 'ci.yaml',
  },
  cd: {
    template: 'cd-template.yaml',
    description: 'Generic CD workflow for deployment',
    outputName: 'cd.yaml',
  },
};

/**
 * 使用方法を表示
 */
function showUsage() {
  console.log(`
Workflow Template Generator
============================

Usage:
  node generate-workflow.mjs <project-type> <output-path>

Project Types:
${Object.entries(PROJECT_TYPES)
  .map(([type, info]) => `  ${type.padEnd(10)} - ${info.description}`)
  .join('\n')}

Examples:
  node generate-workflow.mjs nodejs .github/workflows/
  node generate-workflow.mjs docker .github/workflows/
  node generate-workflow.mjs ci .github/workflows/

Options:
  --list, -l     List all available project types
  --help, -h     Show this help message
`);
}

/**
 * 利用可能なプロジェクトタイプを一覧表示
 */
function listProjectTypes() {
  console.log('\nAvailable Project Types:\n');
  console.log('Type       Template File          Description');
  console.log('─────────  ──────────────────────  ─────────────────────────────────────');

  for (const [type, info] of Object.entries(PROJECT_TYPES)) {
    console.log(
      `${type.padEnd(10)} ${info.template.padEnd(22)} ${info.description}`
    );
  }
  console.log('');
}

/**
 * プロジェクトタイプを自動検出
 */
function detectProjectType(projectRoot = '.') {
  const checks = [
    {
      files: ['package.json'],
      type: 'nodejs',
      confidence: 'high',
    },
    {
      files: ['Dockerfile'],
      type: 'docker',
      confidence: 'high',
    },
    {
      files: ['requirements.txt', 'setup.py', 'pyproject.toml'],
      type: 'ci',
      confidence: 'medium',
      note: 'Python project detected. Consider customizing the CI template.',
    },
    {
      files: ['go.mod'],
      type: 'ci',
      confidence: 'medium',
      note: 'Go project detected. Consider customizing the CI template.',
    },
    {
      files: ['Cargo.toml'],
      type: 'ci',
      confidence: 'medium',
      note: 'Rust project detected. Consider customizing the CI template.',
    },
  ];

  for (const check of checks) {
    const hasFile = check.files.some(file =>
      existsSync(join(projectRoot, file))
    );

    if (hasFile) {
      return {
        type: check.type,
        confidence: check.confidence,
        note: check.note,
      };
    }
  }

  return {
    type: 'ci',
    confidence: 'low',
    note: 'No specific project type detected. Using generic CI template.',
  };
}

/**
 * テンプレートを読み込んでカスタマイズ
 */
function generateWorkflow(projectType, customizations = {}) {
  const typeInfo = PROJECT_TYPES[projectType];

  if (!typeInfo) {
    throw new Error(
      `Unknown project type: ${projectType}\n` +
      `Available types: ${Object.keys(PROJECT_TYPES).join(', ')}`
    );
  }

  const templatePath = join(TEMPLATE_DIR, typeInfo.template);

  if (!existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  let content = readFileSync(templatePath, 'utf-8');

  // カスタマイズ処理（必要に応じて拡張）
  if (customizations.branchName) {
    content = content.replace(
      /\$default-branch/g,
      customizations.branchName
    );
  }

  return {
    content,
    filename: typeInfo.outputName,
  };
}

/**
 * ワークフローファイルを出力
 */
function writeWorkflow(outputPath, filename, content) {
  // 出力ディレクトリの作成
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
    console.log(`✓ Created directory: ${outputPath}`);
  }

  const fullPath = join(outputPath, filename);

  // ファイルが既に存在する場合は確認
  if (existsSync(fullPath)) {
    console.warn(`⚠ File already exists: ${fullPath}`);
    console.warn('  Overwriting...');
  }

  writeFileSync(fullPath, content, 'utf-8');
  console.log(`✓ Generated workflow: ${fullPath}`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  // フラグ処理
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    showUsage();
    process.exit(0);
  }

  if (args.includes('--list') || args.includes('-l')) {
    listProjectTypes();
    process.exit(0);
  }

  // 引数の検証
  if (args.length < 2) {
    console.error('❌ Error: Missing required arguments');
    showUsage();
    process.exit(1);
  }

  const [projectType, outputPath] = args;

  try {
    console.log('\nWorkflow Generator\n');
    console.log(`Project type: ${projectType}`);
    console.log(`Output path:  ${outputPath}`);
    console.log('');

    // プロジェクトタイプが 'auto' の場合は自動検出
    let finalProjectType = projectType;

    if (projectType === 'auto') {
      console.log('🔍 Auto-detecting project type...');
      const detected = detectProjectType();
      finalProjectType = detected.type;

      console.log(`   Detected: ${detected.type} (confidence: ${detected.confidence})`);
      if (detected.note) {
        console.log(`   Note: ${detected.note}`);
      }
      console.log('');
    }

    // ワークフロー生成
    const { content, filename } = generateWorkflow(finalProjectType, {
      branchName: 'main',  // デフォルトブランチ名（必要に応じて変更）
    });

    // ファイル出力
    writeWorkflow(outputPath, filename, content);

    console.log('');
    console.log('✅ Workflow generation completed!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review and customize the generated workflow');
    console.log('  2. Commit and push to trigger the workflow');
    console.log('  3. Check the Actions tab in your GitHub repository');
    console.log('');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// スクリプト実行
main();
