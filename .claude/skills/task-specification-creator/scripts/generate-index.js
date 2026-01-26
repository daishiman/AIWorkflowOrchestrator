#!/usr/bin/env node
/**
 * generate-index.js
 *
 * artifacts.jsonからindex.mdを自動生成するスクリプト
 *
 * @usage
 *   node generate-index.js --workflow docs/30-workflows/feature-name
 *   node generate-index.js --workflow docs/30-workflows/feature-name --regenerate
 */

import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve, basename } from 'path';

// Phase名マッピング
const PHASE_NAMES = {
  1: '要件定義',
  2: '設計',
  3: '設計レビューゲート',
  4: 'テスト作成',
  5: '実装',
  6: 'テスト拡充',
  7: 'テストカバレッジ確認',
  8: 'リファクタリング',
  9: '品質保証',
  10: '最終レビューゲート',
  11: '手動テスト検証',
  12: 'ドキュメント更新',
  13: 'PR作成',
};

// ステータス表示
const STATUS_DISPLAY = {
  pending: '未実施',
  in_progress: '実行中',
  completed: '完了',
  skipped: 'スキップ',
};

// 引数パース
function parseArgs(args) {
  const result = {
    workflow: null,
    regenerate: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--workflow' && args[i + 1]) {
      result.workflow = args[++i];
    } else if (arg === '--regenerate') {
      result.regenerate = true;
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    }
  }

  return result;
}

// ヘルプ表示
function showHelp() {
  console.log(`
Usage: node generate-index.js --workflow <path> [options]

Options:
  --workflow <path>   Path to workflow directory (required)
  --regenerate        Regenerate even if index.md exists
  --help, -h          Show this help message

Examples:
  node generate-index.js --workflow docs/30-workflows/feature-name
  node generate-index.js --workflow docs/30-workflows/feature-name --regenerate
  `);
}

// Phase仕様書ファイルを検索
function findPhaseFiles(workflowDir) {
  const files = readdirSync(workflowDir);
  const phaseFiles = {};

  for (const file of files) {
    const match = file.match(/^phase-(\d+)-(.+)\.md$/);
    if (match) {
      const phaseNum = parseInt(match[1], 10);
      phaseFiles[phaseNum] = file;
    }
  }

  return phaseFiles;
}

// index.md生成
function generateIndex(workflowDir, artifacts, phaseFiles) {
  const featureName = artifacts.feature;
  const createdDate = artifacts.created
    ? new Date(artifacts.created).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  let content = `# ${featureName} - タスク実行仕様書

## メタ情報

| 項目 | 内容 |
| ---- | ---- |
| 機能名 | ${featureName} |
| 作成日 | ${createdDate} |
| ステータス | ${STATUS_DISPLAY[artifacts.status] || artifacts.status} |
| 総Phase数 | 13 |

---

## Phase一覧

| Phase | 名称 | 仕様書 | ステータス |
| ----- | ---- | ------ | ---------- |
`;

  // Phase 1-13の一覧を生成
  for (let i = 1; i <= 13; i++) {
    const phaseName = PHASE_NAMES[i];
    const phaseFile = phaseFiles[i] || `phase-${i}-*.md`;
    const phaseStatus = artifacts.phases?.[String(i)]?.status || 'pending';
    const statusDisplay = STATUS_DISPLAY[phaseStatus] || phaseStatus;

    content += `| ${i} | ${phaseName} | [${phaseFile}](${phaseFile}) | ${statusDisplay} |\n`;
  }

  content += `
---

## 実行フロー

\`\`\`
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
\`\`\`

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: \`complete-phase.js\` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

\`\`\`bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \\
  --workflow ${workflowDir} --phase {{N}} \\
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
\`\`\`

---

## 成果物

| Phase | 主要成果物 |
| ----- | ---------- |
`;

  // 成果物一覧を生成
  for (let i = 1; i <= 13; i++) {
    const phaseArtifacts = artifacts.phases?.[String(i)]?.artifacts || [];
    const artifactList =
      phaseArtifacts.length > 0
        ? phaseArtifacts.map((a) => a.description || a.path).join(', ')
        : '-';
    content += `| ${i} | ${artifactList} |\n`;
  }

  content += `
---

*このファイルは \`generate-index.js\` によって自動生成されました。*
*最終更新: ${new Date().toISOString()}*
`;

  return content;
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.workflow) {
    console.error('Error: --workflow is required');
    showHelp();
    process.exit(2);
  }

  const workflowDir = resolve(process.cwd(), args.workflow);

  // ワークフローディレクトリ確認
  if (!existsSync(workflowDir)) {
    console.error(`Error: Workflow directory not found: ${workflowDir}`);
    process.exit(3);
  }

  // artifacts.json確認
  const artifactsPath = join(workflowDir, 'artifacts.json');
  if (!existsSync(artifactsPath)) {
    console.error(`Error: artifacts.json not found: ${artifactsPath}`);
    console.error('Run init-artifacts.js first.');
    process.exit(3);
  }

  // index.md存在確認
  const indexPath = join(workflowDir, 'index.md');
  if (existsSync(indexPath) && !args.regenerate) {
    console.error(`Error: index.md already exists: ${indexPath}`);
    console.error('Use --regenerate to overwrite.');
    process.exit(1);
  }

  // artifacts.json読み込み
  let artifacts;
  try {
    artifacts = JSON.parse(readFileSync(artifactsPath, 'utf-8'));
  } catch (e) {
    console.error(`Error: Failed to parse artifacts.json: ${e.message}`);
    process.exit(4);
  }

  // Phase仕様書ファイル検索
  const phaseFiles = findPhaseFiles(workflowDir);

  // index.md生成
  const indexContent = generateIndex(workflowDir, artifacts, phaseFiles);

  // ファイル出力
  writeFileSync(indexPath, indexContent, 'utf-8');

  console.log(`✅ index.md generated: ${indexPath}`);
  console.log(`   Feature: ${artifacts.feature}`);
  console.log(`   Phase files found: ${Object.keys(phaseFiles).length}/13`);

  process.exit(0);
}

main();
