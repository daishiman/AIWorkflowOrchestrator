#!/usr/bin/env node

/**
 * コード品質測定スクリプト
 *
 * Usage:
 *   node measure-code-quality.mjs <directory>
 *   node measure-code-quality.mjs src/features/
 *
 * 測定内容:
 * - 関数の行数
 * - 関数のパラメータ数
 * - 命名の品質スコア
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// 設定
const CONFIG = {
  supportedExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  maxFunctionLines: 20,
  maxParameters: 3,
  excludePatterns: ['node_modules', '.git', 'dist', 'build', '__tests__'],
};

// 結果格納
const results = {
  files: 0,
  functions: 0,
  goodFunctions: 0,
  largeFunctions: [],
  manyParameters: [],
  poorNames: [],
};

/**
 * ファイルを再帰的に取得
 */
function getFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    if (CONFIG.excludePatterns.includes(item)) continue;

    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      getFiles(fullPath, files);
    } else if (CONFIG.supportedExtensions.includes(extname(item))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 関数を分析
 */
function analyzeFunctions(content, filePath) {
  // 関数パターン（簡易）
  const functionPattern = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{)/g;

  let match;
  const lines = content.split('\n');

  while ((match = functionPattern.exec(content)) !== null) {
    results.functions++;

    const funcName = match[1] || match[2] || match[3];
    const startLine = content.substring(0, match.index).split('\n').length;

    // 関数の行数を計算（簡易）
    let braceCount = 0;
    let started = false;
    let endLine = startLine;

    for (let i = startLine - 1; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          started = true;
        } else if (char === '}') {
          braceCount--;
        }
      }
      if (started && braceCount === 0) {
        endLine = i + 1;
        break;
      }
    }

    const lineCount = endLine - startLine + 1;

    // 行数チェック
    if (lineCount > CONFIG.maxFunctionLines) {
      results.largeFunctions.push({
        file: filePath,
        name: funcName,
        line: startLine,
        lineCount,
      });
    } else {
      results.goodFunctions++;
    }

    // パラメータ数チェック
    const paramMatch = content.substring(match.index).match(/\(([^)]*)\)/);
    if (paramMatch && paramMatch[1]) {
      const params = paramMatch[1].split(',').filter(p => p.trim());
      if (params.length > CONFIG.maxParameters) {
        results.manyParameters.push({
          file: filePath,
          name: funcName,
          line: startLine,
          paramCount: params.length,
        });
      }
    }

    // 命名チェック
    if (funcName && isPoorName(funcName)) {
      results.poorNames.push({
        file: filePath,
        name: funcName,
        line: startLine,
      });
    }
  }
}

/**
 * 貧弱な命名を検出
 */
function isPoorName(name) {
  const poorPatterns = [
    /^[a-z]$/, // 単一文字
    /^(temp|tmp|data|info|value|result|item|thing)$/i, // 曖昧な名前
    /^(do|process|handle|manage)$/i, // 汎用的すぎる動詞
    /^(foo|bar|baz|test|xxx)$/i, // プレースホルダー
  ];

  return poorPatterns.some(pattern => pattern.test(name));
}

/**
 * ファイルを分析
 */
function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  results.files++;
  analyzeFunctions(content, filePath);
}

/**
 * 品質スコアを計算
 */
function calculateQualityScore() {
  if (results.functions === 0) return 100;

  const goodRatio = results.goodFunctions / results.functions;
  const largeDeduction = results.largeFunctions.length * 5;
  const paramDeduction = results.manyParameters.length * 3;
  const nameDeduction = results.poorNames.length * 2;

  const score = Math.max(0, Math.round(goodRatio * 100 - largeDeduction - paramDeduction - nameDeduction));
  return Math.min(100, score);
}

/**
 * 結果を出力
 */
function printResults() {
  const score = calculateQualityScore();

  console.log('\n📊 コード品質測定結果\n');
  console.log('='.repeat(60));

  // スコア
  const scoreEmoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
  console.log(`\n${scoreEmoji} 品質スコア: ${score}/100`);

  // 概要
  console.log(`\n📁 分析ファイル: ${results.files}件`);
  console.log(`📝 検出関数: ${results.functions}件`);
  console.log(`✅ 良好な関数: ${results.goodFunctions}件`);

  // 大きな関数
  console.log(`\n🔴 大きすぎる関数 (${CONFIG.maxFunctionLines}行超): ${results.largeFunctions.length}件`);
  for (const item of results.largeFunctions.slice(0, 10)) {
    console.log(`   ${item.file}:${item.line} - ${item.name}() [${item.lineCount}行]`);
  }
  if (results.largeFunctions.length > 10) {
    console.log(`   ... 他 ${results.largeFunctions.length - 10}件`);
  }

  // パラメータ過多
  console.log(`\n🟠 パラメータ過多 (${CONFIG.maxParameters}個超): ${results.manyParameters.length}件`);
  for (const item of results.manyParameters.slice(0, 10)) {
    console.log(`   ${item.file}:${item.line} - ${item.name}() [${item.paramCount}個]`);
  }
  if (results.manyParameters.length > 10) {
    console.log(`   ... 他 ${results.manyParameters.length - 10}件`);
  }

  // 貧弱な命名
  console.log(`\n🟡 改善が必要な命名: ${results.poorNames.length}件`);
  for (const item of results.poorNames.slice(0, 10)) {
    console.log(`   ${item.file}:${item.line} - ${item.name}()`);
  }
  if (results.poorNames.length > 10) {
    console.log(`   ... 他 ${results.poorNames.length - 10}件`);
  }

  // 推奨アクション
  console.log('\n' + '='.repeat(60));
  console.log('📋 推奨アクション:');

  if (results.largeFunctions.length > 0) {
    console.log('  1. 大きな関数をExtract Methodで分割');
  }
  if (results.manyParameters.length > 0) {
    console.log('  2. Introduce Parameter Objectでパラメータを整理');
  }
  if (results.poorNames.length > 0) {
    console.log('  3. より具体的で意図が伝わる命名に改善');
  }
  if (score >= 80) {
    console.log('  ✨ 良好な品質を維持してください！');
  }

  console.log('');
}

// メイン処理
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node measure-code-quality.mjs <directory>');
  process.exit(1);
}

const targetDir = args[0];
console.log(`🔍 ${targetDir} を分析中...`);

try {
  const files = getFiles(targetDir);
  console.log(`📁 ${files.length}ファイルを検査`);

  for (const file of files) {
    analyzeFile(file);
  }

  printResults();
} catch (error) {
  console.error(`❌ エラー: ${error.message}`);
  process.exit(1);
}
