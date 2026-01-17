#!/usr/bin/env node
/**
 * detect-mode.js
 *
 * モード判定スクリプト
 * - create: 新規タスク仕様書作成
 * - execute: Phase実行
 * - update: 仕様書更新
 * - detect-unassigned: 未タスク検出
 *
 * @usage
 *   node detect-mode.js --request "新規タスク"
 *   node detect-mode.js --workflow docs/30-workflows/feature-name
 *   node detect-mode.js --workflow docs/30-workflows/feature-name --phase 12
 */

import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

// Parse command line arguments
function parseArgs(args) {
  const result = {
    request: null,
    workflow: null,
    phase: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--request' && args[i + 1]) {
      result.request = args[++i];
    } else if (arg === '--workflow' && args[i + 1]) {
      result.workflow = args[++i];
    } else if (arg === '--phase' && args[i + 1]) {
      result.phase = parseInt(args[++i], 10);
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    }
  }

  return result;
}

// Show help
function showHelp() {
  console.log(`
Usage: node detect-mode.js [options]

Options:
  --request <text>     Request text to analyze for mode detection
  --workflow <path>    Path to existing workflow directory
  --phase <number>     Phase number for execute mode
  --help, -h           Show this help message

Modes:
  create              New task specification creation (default if no workflow exists)
  execute             Phase execution (if workflow exists and phase is specified)
  update              Specification update (if workflow exists)
  detect-unassigned   Unassigned task detection (if phase is 12)

Examples:
  node detect-mode.js --request "新規タスク仕様書を作成"
  node detect-mode.js --workflow docs/30-workflows/feature-name
  node detect-mode.js --workflow docs/30-workflows/feature-name --phase 5
  `);
}

// Detect mode based on inputs
function detectMode(options) {
  const { request, workflow, phase } = options;

  // If workflow path is provided, check if it exists
  if (workflow) {
    const workflowPath = resolve(process.cwd(), workflow);

    if (existsSync(workflowPath)) {
      // Workflow exists
      if (phase === 12) {
        return {
          mode: 'detect-unassigned',
          reason: 'Phase 12 is specified, which triggers unassigned task detection',
          workflowPath,
          phase,
        };
      } else if (phase) {
        return {
          mode: 'execute',
          reason: `Phase ${phase} execution requested for existing workflow`,
          workflowPath,
          phase,
        };
      } else {
        // Check artifacts.json for current state
        const artifactsPath = join(workflowPath, 'artifacts.json');
        if (existsSync(artifactsPath)) {
          try {
            const artifacts = JSON.parse(readFileSync(artifactsPath, 'utf-8'));
            if (artifacts.phases && Object.keys(artifacts.phases).length > 0) {
              return {
                mode: 'update',
                reason: 'Workflow exists with completed phases, update mode recommended',
                workflowPath,
                artifacts,
              };
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        return {
          mode: 'update',
          reason: 'Workflow exists, update mode recommended',
          workflowPath,
        };
      }
    } else {
      // Workflow does not exist
      return {
        mode: 'create',
        reason: 'Specified workflow does not exist, create mode recommended',
        workflowPath,
      };
    }
  }

  // Analyze request text
  if (request) {
    const requestLower = request.toLowerCase();

    // Check for create keywords
    const createKeywords = [
      '新規',
      '作成',
      '新しい',
      'create',
      'new',
      'タスク仕様書',
      '実装',
      '機能追加',
      '開発',
    ];
    const updateKeywords = ['更新', '修正', '変更', 'update', 'modify', '編集'];
    const executeKeywords = ['実行', 'phase', 'フェーズ', 'execute', 'run'];
    const detectKeywords = ['未タスク', '検出', 'detect', 'unassigned', 'todo', 'fixme'];

    if (detectKeywords.some((k) => requestLower.includes(k))) {
      return {
        mode: 'detect-unassigned',
        reason: 'Request contains unassigned task detection keywords',
        request,
      };
    }

    if (executeKeywords.some((k) => requestLower.includes(k))) {
      return {
        mode: 'execute',
        reason: 'Request contains execution keywords',
        request,
      };
    }

    if (updateKeywords.some((k) => requestLower.includes(k))) {
      return {
        mode: 'update',
        reason: 'Request contains update keywords',
        request,
      };
    }

    if (createKeywords.some((k) => requestLower.includes(k))) {
      return {
        mode: 'create',
        reason: 'Request contains creation keywords',
        request,
      };
    }
  }

  // Default to create mode
  return {
    mode: 'create',
    reason: 'Default mode: no specific indicators found',
    request,
  };
}

// Main execution
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const result = detectMode(args);

  // Output as JSON
  console.log(JSON.stringify(result, null, 2));

  // Exit with appropriate code
  process.exit(0);
}

main();
