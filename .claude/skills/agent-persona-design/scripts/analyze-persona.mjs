#!/usr/bin/env node
/**
 * analyze-persona.mjs
 * エージェントのペルソナ設計を分析するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/agent-persona-design/scripts/analyze-persona.mjs <agent_file.md>
 *
 * 出力:
 *   ペルソナ設計の品質分析結果を表示します。
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const PERSONA_ELEMENTS = {
  role: {
    name: '役割定義',
    patterns: [/あなたは.+です/m, /## 役割定義/m],
    weight: 3
  },
  expertise: {
    name: '専門分野',
    patterns: [/専門分野[:：]/m, /専門知識[:：]/m],
    weight: 2
  },
  responsibilities: {
    name: '責任範囲',
    patterns: [/責任範囲[:：]/m, /責務[:：]/m],
    weight: 2
  },
  constraints: {
    name: '制約',
    patterns: [/制約[:：]/m, /しないこと[:：]/m, /行わないこと/m],
    weight: 2
  },
  expert_model: {
    name: '専門家モデル',
    patterns: [/モデル.+人物/m, /ベースとなる人物/m, /専門家/m],
    weight: 1
  },
  books: {
    name: '参照書籍',
    patterns: [/参照書籍/m, /『.+』/m],
    weight: 1
  },
  core_concepts: {
    name: '核心概念',
    patterns: [/核心概念/m, /コア.+概念/m, /思想/m],
    weight: 1
  }
};

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
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key.trim();
      if (value && value !== '|') {
        yaml[currentKey] = value;
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

function analyzePersona(content) {
  const results = {};

  for (const [elementId, element] of Object.entries(PERSONA_ELEMENTS)) {
    const matches = element.patterns.filter(pattern => pattern.test(content));
    results[elementId] = {
      ...element,
      found: matches.length > 0,
      matchCount: matches.length,
      score: matches.length > 0 ? 10 : 0
    };
  }

  return results;
}

function determineDesignType(content, yaml) {
  const hasExpertModel = /モデル.+人物|ベースとなる人物|専門家.*著者/m.test(content);
  const hasBooks = /『.+』/m.test(content);

  if (hasExpertModel && hasBooks) {
    return { type: 'expert', name: '専門家モデルベース設計' };
  }
  return { type: 'role', name: '役割ベース設計' };
}

function calculateOverallScore(results) {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const result of Object.values(results)) {
    totalWeight += result.weight;
    weightedScore += result.score * result.weight / 10;
  }

  return (weightedScore / totalWeight) * 10;
}

function printResults(filePath, yaml, results, designType) {
  const overallScore = calculateOverallScore(results);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('                  ペルソナ設計分析レポート                   ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`ファイル: ${filePath}`);
  console.log(`エージェント名: ${yaml.name || '不明'}`);
  console.log(`設計タイプ: ${designType.name}`);
  console.log('───────────────────────────────────────────────────────────');

  console.log('\n【ペルソナ要素の検出状況】');

  for (const [elementId, result] of Object.entries(results)) {
    const status = result.found ? '✅' : '❌';
    console.log(`  ${status} ${result.name}`);
  }

  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`総合スコア: ${overallScore.toFixed(1)}/10`);

  if (overallScore >= 8) {
    console.log('✅ 評価: 優れたペルソナ設計です');
  } else if (overallScore >= 6) {
    console.log('⚠️  評価: 一部改善が必要です');
  } else {
    console.log('❌ 評価: ペルソナ設計の見直しが必要です');
  }

  console.log('═══════════════════════════════════════════════════════════');

  // 改善提案
  const missing = Object.entries(results)
    .filter(([_, r]) => !r.found)
    .map(([_, r]) => r.name);

  if (missing.length > 0) {
    console.log('\n改善提案:');
    for (const m of missing) {
      console.log(`  - ${m}を追加してください`);
    }
  }

  // 設計タイプ別の推奨事項
  console.log(`\n【${designType.name}の推奨事項】`);
  if (designType.type === 'expert') {
    console.log('  - 専門家の代表的著作（1-3冊）を特定');
    console.log('  - 核心概念を3-5項目抽出');
    console.log('  - 思想の一貫性を保つ');
  } else {
    console.log('  - 役割を1文で明確に表現');
    console.log('  - 専門分野を3-5項目列挙');
    console.log('  - 責任範囲と制約を明確化');
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node analyze-persona.mjs <agent_file.md>');
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
  const results = analyzePersona(content);
  const designType = determineDesignType(content, yaml);

  printResults(filePath, yaml, results, designType);

  const overallScore = calculateOverallScore(results);
  process.exit(overallScore >= 6 ? 0 : 1);
}

main();
