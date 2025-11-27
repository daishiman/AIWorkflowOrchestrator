#!/usr/bin/env node
/**
 * analyze-prompt.mjs
 * エージェントのプロンプト設計を分析するスクリプト
 *
 * 使用方法:
 *   node .claude/skills/prompt-engineering-for-agents/scripts/analyze-prompt.mjs <agent_file.md>
 *
 * 出力:
 *   プロンプト設計の品質分析結果と改善提案を表示します。
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROMPT_ELEMENTS = {
  role_definition: {
    name: '役割定義',
    patterns: [/あなたは.+です/m, /## 役割/m, /role:/i],
    weight: 3,
    description: 'エージェントの役割が明確に定義されているか'
  },
  task_scope: {
    name: 'タスク範囲',
    patterns: [/タスク/m, /責任範囲/m, /実施すること/m],
    weight: 2,
    description: '担当するタスクの範囲が明確か'
  },
  constraints: {
    name: '制約条件',
    patterns: [/制約/m, /しないこと/m, /禁止/m, /避ける/m],
    weight: 2,
    description: '制約や禁止事項が明記されているか'
  },
  output_format: {
    name: '出力形式',
    patterns: [/出力形式/m, /フォーマット/m, /## 成果物/m],
    weight: 2,
    description: '期待される出力形式が定義されているか'
  },
  examples: {
    name: '例示',
    patterns: [/例[:：]/m, /```/m, /example/i],
    weight: 1,
    description: '具体的な例が含まれているか'
  },
  context: {
    name: 'コンテキスト',
    patterns: [/コンテキスト/m, /背景/m, /前提/m],
    weight: 1,
    description: '必要な背景情報が提供されているか'
  },
  workflow: {
    name: 'ワークフロー',
    patterns: [/## ワークフロー/m, /Phase|Step|フェーズ|ステップ/m],
    weight: 2,
    description: '実行手順が明確に定義されているか'
  },
  tools: {
    name: 'ツール指定',
    patterns: [/tools:/i, /## ツール/m],
    weight: 1,
    description: '使用可能なツールが定義されているか'
  }
};

const ANTIPATTERNS = [
  {
    name: '曖昧な指示',
    pattern: /適宜|必要に応じて|いくつかの|など/g,
    severity: 'medium',
    suggestion: '具体的な条件や数値を明記してください'
  },
  {
    name: '過度な長文',
    check: (content) => {
      const sentences = content.split(/[。.!?！？]/).filter(s => s.trim());
      const longSentences = sentences.filter(s => s.length > 150);
      return longSentences.length > 5;
    },
    severity: 'low',
    suggestion: '長い文を分割して読みやすくしてください'
  },
  {
    name: '矛盾する指示',
    pattern: /必ず.+しない|絶対に.+ない|常に.+避ける/g,
    severity: 'high',
    suggestion: '指示に矛盾がないか確認してください'
  }
];

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

function analyzePromptElements(content) {
  const results = {};

  for (const [elementId, element] of Object.entries(PROMPT_ELEMENTS)) {
    const matches = element.patterns.filter(pattern => pattern.test(content));
    results[elementId] = {
      ...element,
      found: matches.length > 0,
      matchCount: matches.length
    };
  }

  return results;
}

function detectAntipatterns(content) {
  const detected = [];

  for (const antipattern of ANTIPATTERNS) {
    if (antipattern.pattern) {
      const matches = content.match(antipattern.pattern);
      if (matches && matches.length > 0) {
        detected.push({
          ...antipattern,
          occurrences: matches.length
        });
      }
    } else if (antipattern.check && antipattern.check(content)) {
      detected.push({
        ...antipattern,
        occurrences: 1
      });
    }
  }

  return detected;
}

function analyzeReadability(content) {
  const lines = content.split('\n');
  const headers = lines.filter(l => l.match(/^#+\s/)).length;
  const lists = lines.filter(l => l.match(/^[-*]\s|^\d+\.\s/)).length;
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  const tables = (content.match(/\|/g) || []).length > 10;

  return {
    headers,
    lists,
    codeBlocks,
    hasTables: tables,
    structureScore: Math.min(10, headers + lists * 0.5 + codeBlocks + (tables ? 2 : 0))
  };
}

function calculateScore(elements, antipatterns, readability) {
  let score = 0;
  let totalWeight = 0;

  // 要素スコア
  for (const element of Object.values(elements)) {
    totalWeight += element.weight;
    if (element.found) {
      score += element.weight;
    }
  }

  // アンチパターンペナルティ
  for (const ap of antipatterns) {
    if (ap.severity === 'high') score -= 2;
    else if (ap.severity === 'medium') score -= 1;
    else score -= 0.5;
  }

  // 読みやすさボーナス
  score += readability.structureScore * 0.2;

  return Math.max(0, Math.min(10, (score / totalWeight) * 8 + 2));
}

function printResults(filePath, yaml, elements, antipatterns, readability) {
  const score = calculateScore(elements, antipatterns, readability);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('                プロンプト設計分析レポート                  ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`ファイル: ${filePath}`);
  console.log(`エージェント名: ${yaml.name || '不明'}`);
  console.log('───────────────────────────────────────────────────────────');

  console.log('\n【プロンプト要素の検出状況】');
  for (const [elementId, element] of Object.entries(elements)) {
    const status = element.found ? '✅' : '❌';
    console.log(`  ${status} ${element.name}`);
    if (!element.found) {
      console.log(`     → ${element.description}`);
    }
  }

  console.log('\n【アンチパターン検出】');
  if (antipatterns.length === 0) {
    console.log('  ✅ アンチパターンは検出されませんでした');
  } else {
    for (const ap of antipatterns) {
      const severity = ap.severity === 'high' ? '🔴' : ap.severity === 'medium' ? '🟡' : '🟢';
      console.log(`  ${severity} ${ap.name} (${ap.occurrences}件)`);
      console.log(`     → ${ap.suggestion}`);
    }
  }

  console.log('\n【読みやすさ分析】');
  console.log(`  見出し数: ${readability.headers}`);
  console.log(`  リスト項目数: ${readability.lists}`);
  console.log(`  コードブロック数: ${readability.codeBlocks}`);
  console.log(`  テーブル使用: ${readability.hasTables ? 'あり' : 'なし'}`);
  console.log(`  構造スコア: ${readability.structureScore.toFixed(1)}/10`);

  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`プロンプト設計スコア: ${score.toFixed(1)}/10`);

  if (score >= 8) {
    console.log('✅ 評価: 優れたプロンプト設計です');
  } else if (score >= 6) {
    console.log('⚠️  評価: 一部改善が推奨されます');
  } else {
    console.log('❌ 評価: プロンプト設計の見直しが必要です');
  }
  console.log('═══════════════════════════════════════════════════════════');

  // 改善提案
  const missing = Object.entries(elements)
    .filter(([_, e]) => !e.found)
    .map(([_, e]) => e.name);

  if (missing.length > 0) {
    console.log('\n改善提案:');
    for (const m of missing) {
      console.log(`  - ${m}を追加してください`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node analyze-prompt.mjs <agent_file.md>');
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
  const elements = analyzePromptElements(content);
  const antipatterns = detectAntipatterns(content);
  const readability = analyzeReadability(content);

  printResults(filePath, yaml, elements, antipatterns, readability);

  const score = calculateScore(elements, antipatterns, readability);
  process.exit(score >= 6 ? 0 : 1);
}

main();
