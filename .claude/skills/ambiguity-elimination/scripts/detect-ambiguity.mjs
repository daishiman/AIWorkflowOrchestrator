#!/usr/bin/env node

/**
 * 曖昧性検出スクリプト
 * 
 * 要件ドキュメントから5つの曖昧性パターンを検出し、レポートを生成します。
 * 
 * Usage:
 *   node detect-ambiguity.mjs <要件ファイルパス>
 *   node detect-ambiguity.mjs requirements.md
 *   node detect-ambiguity.mjs --json requirements.md > report.json
 */

import fs from 'fs/promises';

// 曖昧性パターンの定義
const AMBIGUITY_PATTERNS = {
  quantitative: {
    name: '量的曖昧性',
    regex: /(高速|速い|遅い|即座に|瞬時に|すぐに|リアルタイム|短時間|長時間|一定時間|多い|少ない|大量|少量|適量|大きい|小さい|巨大|微小|軽い|重い|膨大|頻繁に|たまに|しばしば|時々|定期的に|不定期に|随時|常に|めったに|まれに|高性能|低性能|高効率|低効率|高速処理|大容量|高スループット)/g
  },
  qualitative: {
    name: '質的曖昧性',
    regex: /(使いやすい|分かりやすい|簡単|直感的|親しみやすい|覚えやすい|学びやすい|快適|スムーズ|自然|適切に|正しく|うまく|きちんと|十分|満足|良好|優れた|信頼性の高い|安定した|堅牢|効率的|効果的|最適|合理的|無駄がない|スマート|洗練された|柔軟な|拡張可能な|カスタマイズ可能|汎用的|応用が利く)/g
  },
  scope: {
    name: '範囲の曖昧性',
    regex: /(など|等|その他|他|例えば|たとえば|をはじめとする|を含む|いくつかの|さまざまな|種々の|複数の|多数の|各種|一部の|一定の|主な|主要な|代表的な|典型的な|一般的な|基本的な)/g
  },
  conditional: {
    name: '条件の曖昧性',
    regex: /(場合によって|状況次第で|ケースバイケース|必要に応じて|適宜|随時|時には|場合がある|することがある|可能であれば|できれば|望ましくは|なるべく|極力|できる限り|してもよい|できる|検討する|考慮する|判断する|評価する|決定する)/g
  },
  subject: {
    name: '主体の曖昧性',
    regex: /(ユーザーは|管理者は|システムは|データは|ファイルは|情報は|される|できる|しなければならない|自動的に|自動で|自動化される|定期的に|随時|継続的に|権限のあるユーザー|許可されたユーザー|担当者|責任者|管理者)/g
  }
};

async function detectAmbiguities(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const results = {};

  for (const [key, pattern] of Object.entries(AMBIGUITY_PATTERNS)) {
    results[key] = { name: pattern.name, matches: [], count: 0 };
    
    lines.forEach((line, index) => {
      const matches = line.match(pattern.regex);
      if (matches) {
        matches.forEach(match => {
          results[key].matches.push({
            line: index + 1,
            text: line.trim(),
            keyword: match
          });
          results[key].count++;
        });
      }
    });
  }
  
  return results;
}

function generateTextReport(results, filePath) {
  const totalCount = Object.values(results).reduce((sum, r) => sum + r.count, 0);
  
  let report = '='.repeat(80) + '\n';
  report += '曖昧性検出レポート\n';
  report += '='.repeat(80) + '\n\n';
  report += `ファイル: ${filePath}\n`;
  report += `検出日時: ${new Date().toLocaleString('ja-JP')}\n`;
  report += `総検出数: ${totalCount}件\n\n`;
  
  if (totalCount === 0) {
    report += '✅ 曖昧な表現は検出されませんでした。\n\n';
    return report;
  }
  
  for (const [key, result] of Object.entries(results)) {
    if (result.count === 0) continue;
    
    report += `■ ${result.name}（${result.count}件）\n\n`;
    result.matches.forEach((match, i) => {
      report += `  ${i + 1}. 行${match.line}: 「${match.keyword}」\n`;
      report += `     > ${match.text}\n\n`;
    });
  }
  
  return report;
}

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const filePath = args.find(arg => !arg.startsWith('--'));
  
  if (!filePath) {
    console.error('Usage: node detect-ambiguity.mjs [--json] <file>');
    process.exit(1);
  }
  
  try {
    const results = await detectAmbiguities(filePath);
    
    if (isJson) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(generateTextReport(results, filePath));
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
