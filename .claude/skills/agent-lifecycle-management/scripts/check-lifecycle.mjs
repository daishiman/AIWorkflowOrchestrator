#!/usr/bin/env node
/**
 * check-lifecycle.mjs
 * エージェントのライフサイクル管理状況を確認するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/agent-lifecycle-management/scripts/check-lifecycle.mjs <agent_file.md>
 *
 * 出力:
 *   ライフサイクル管理の分析結果（バージョン、変更履歴、廃止予定等）を表示します。
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const LIFECYCLE_ELEMENTS = {
  version: {
    name: 'バージョン管理',
    patterns: [/version:\s*[\d.]+/i, /## 変更履歴/m],
    weight: 3,
    description: 'セマンティックバージョニングが適用されているか'
  },
  changelog: {
    name: '変更履歴',
    patterns: [/## 変更履歴/m, /changelog/i, /\|\s*バージョン\s*\|/m],
    weight: 2,
    description: '変更履歴が記録されているか'
  },
  deprecation: {
    name: '廃止予定管理',
    patterns: [/deprecated/i, /廃止予定/m, /非推奨/m],
    weight: 1,
    description: '廃止予定の機能が明記されているか'
  },
  migration: {
    name: '移行ガイド',
    patterns: [/migration/i, /移行/m, /アップグレード/m],
    weight: 1,
    description: 'バージョン間の移行ガイドがあるか'
  },
  dependencies: {
    name: '依存関係管理',
    patterns: [/dependencies/i, /依存/m, /requires/i],
    weight: 2,
    description: '依存関係が管理されているか'
  },
  status: {
    name: 'ステータス管理',
    patterns: [/status:/i, /ステータス/m, /stable|beta|alpha|experimental/i],
    weight: 1,
    description: 'エージェントのステータスが明記されているか'
  }
};

const VERSION_PATTERN = /version:\s*([\d]+)\.([\d]+)\.([\d]+)/i;

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let multilineValue = '';

  for (const line of lines) {
    if (line.match(/^\w+:/)) {
      if (currentKey && multilineValue) {
        yaml[currentKey] = multilineValue.trim();
        multilineValue = '';
      }
      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      currentKey = key;

      if (value.startsWith('[') && value.endsWith(']')) {
        yaml[key] = value.slice(1, -1).split(',').map(s => s.trim());
        currentKey = null;
      } else if (value && value !== '|') {
        yaml[key] = value;
        currentKey = null;
      }
    } else if (currentKey && line.startsWith('  ')) {
      multilineValue += line.trim() + '\n';
    }
  }

  if (currentKey && multilineValue) {
    yaml[currentKey] = multilineValue.trim();
  }

  return yaml;
}

function analyzeVersion(content, yaml) {
  const versionInfo = {
    hasVersion: false,
    version: null,
    major: 0,
    minor: 0,
    patch: 0,
    isPreRelease: false,
    status: 'unknown'
  };

  // YAML frontmatterからバージョンを取得
  if (yaml.version) {
    const match = yaml.version.match(/^(\d+)\.(\d+)\.(\d+)(-.*)?$/);
    if (match) {
      versionInfo.hasVersion = true;
      versionInfo.version = yaml.version;
      versionInfo.major = parseInt(match[1]);
      versionInfo.minor = parseInt(match[2]);
      versionInfo.patch = parseInt(match[3]);
      versionInfo.isPreRelease = !!match[4];
    }
  }

  // ステータスを推定
  if (versionInfo.major === 0) {
    versionInfo.status = 'development';
  } else if (versionInfo.isPreRelease) {
    versionInfo.status = 'pre-release';
  } else {
    versionInfo.status = 'stable';
  }

  return versionInfo;
}

function analyzeChangelog(content) {
  const changelog = {
    hasChangelog: false,
    entries: [],
    lastUpdate: null
  };

  // 変更履歴テーブルを検出
  const tableMatch = content.match(/## 変更履歴[\s\S]*?\n\n/);
  if (tableMatch) {
    changelog.hasChangelog = true;

    // バージョンエントリを抽出
    const versionEntries = content.match(/\|\s*([\d.]+)\s*\|/g);
    if (versionEntries) {
      changelog.entries = versionEntries.map(e => e.replace(/[|\s]/g, ''));
    }

    // 日付を抽出
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/g);
    if (dateMatch) {
      changelog.lastUpdate = dateMatch[0];
    }
  }

  return changelog;
}

function analyzeLifecycleElements(content) {
  const results = {};

  for (const [elementId, element] of Object.entries(LIFECYCLE_ELEMENTS)) {
    const matches = element.patterns.filter(pattern => pattern.test(content));
    results[elementId] = {
      ...element,
      found: matches.length > 0,
      matchCount: matches.length
    };
  }

  return results;
}

function detectDeprecations(content) {
  const deprecations = [];

  // 廃止予定パターン
  const patterns = [
    { regex: /deprecated:\s*(.+)/gi, type: 'explicit' },
    { regex: /廃止予定[:：]\s*(.+)/gm, type: 'explicit' },
    { regex: /\[DEPRECATED\]\s*(.+)/gi, type: 'marker' }
  ];

  for (const { regex, type } of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      deprecations.push({
        type,
        content: match[1].trim()
      });
    }
  }

  return deprecations;
}

function calculateScore(elements, versionInfo, changelog, deprecations) {
  let score = 5; // 基本スコア

  // バージョン管理
  if (versionInfo.hasVersion) score += 2;
  if (versionInfo.status === 'stable') score += 1;

  // 変更履歴
  if (changelog.hasChangelog) score += 1;
  if (changelog.entries.length >= 3) score += 1;

  // ライフサイクル要素
  for (const element of Object.values(elements)) {
    if (element.found) score += 0.5;
  }

  // 廃止予定管理
  if (deprecations.length > 0) score += 0.5;

  return Math.min(10, score);
}

function printResults(filePath, yaml, elements, versionInfo, changelog, deprecations) {
  const score = calculateScore(elements, versionInfo, changelog, deprecations);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('              ライフサイクル管理分析レポート                 ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`ファイル: ${filePath}`);
  console.log(`エージェント名: ${yaml.name || '不明'}`);
  console.log('───────────────────────────────────────────────────────────');

  console.log('\n【バージョン情報】');
  if (versionInfo.hasVersion) {
    console.log(`  ✅ バージョン: ${versionInfo.version}`);
    console.log(`     Major: ${versionInfo.major}, Minor: ${versionInfo.minor}, Patch: ${versionInfo.patch}`);
    console.log(`     ステータス: ${versionInfo.status}`);
    if (versionInfo.isPreRelease) {
      console.log('     ⚠️ プレリリース版');
    }
  } else {
    console.log('  ❌ バージョン情報がありません');
  }

  console.log('\n【変更履歴】');
  if (changelog.hasChangelog) {
    console.log(`  ✅ 変更履歴あり`);
    console.log(`     エントリ数: ${changelog.entries.length}`);
    if (changelog.lastUpdate) {
      console.log(`     最終更新: ${changelog.lastUpdate}`);
    }
  } else {
    console.log('  ❌ 変更履歴がありません');
  }

  console.log('\n【ライフサイクル要素】');
  for (const [elementId, element] of Object.entries(elements)) {
    const status = element.found ? '✅' : '❌';
    console.log(`  ${status} ${element.name}`);
  }

  console.log('\n【廃止予定項目】');
  if (deprecations.length === 0) {
    console.log('  廃止予定項目はありません');
  } else {
    for (const dep of deprecations) {
      console.log(`  ⚠️ ${dep.content}`);
    }
  }

  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`ライフサイクル管理スコア: ${score.toFixed(1)}/10`);

  if (score >= 8) {
    console.log('✅ 評価: 優れたライフサイクル管理です');
  } else if (score >= 5) {
    console.log('⚠️  評価: 一部改善が推奨されます');
  } else {
    console.log('❌ 評価: ライフサイクル管理の強化が必要です');
  }
  console.log('═══════════════════════════════════════════════════════════');

  // 推奨事項
  const recommendations = [];

  if (!versionInfo.hasVersion) {
    recommendations.push('- YAMLフロントマターにversion:を追加してください');
  }

  if (!changelog.hasChangelog) {
    recommendations.push('- ## 変更履歴セクションを追加してください');
  }

  if (!elements.deprecation.found) {
    recommendations.push('- 廃止予定機能がある場合は明記してください');
  }

  if (!elements.migration.found) {
    recommendations.push('- 破壊的変更がある場合は移行ガイドを追加してください');
  }

  if (recommendations.length > 0) {
    console.log('\n推奨事項:');
    recommendations.forEach(r => console.log(r));
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node check-lifecycle.mjs <agent_file.md>');
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

  const yaml = parseYamlFrontmatter(content);
  const elements = analyzeLifecycleElements(content);
  const versionInfo = analyzeVersion(content, yaml);
  const changelog = analyzeChangelog(content);
  const deprecations = detectDeprecations(content);

  printResults(filePath, yaml, elements, versionInfo, changelog, deprecations);

  const score = calculateScore(elements, versionInfo, changelog, deprecations);
  process.exit(score >= 5 ? 0 : 1);
}

main();
