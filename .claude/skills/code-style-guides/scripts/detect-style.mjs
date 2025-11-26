#!/usr/bin/env node
/**
 * コードスタイル自動検出スクリプト
 *
 * 用途: 既存コードベースの支配的スタイルを自動検出
 * 実行: node detect-style.mjs [src-directory]
 * 出力: 検出されたスタイル（Airbnb/Google/Standard）、適合率、推奨設定
 */

import { readFile } from 'fs/promises';
import { resolve, join } from 'path';
import { glob } from 'glob';

async function detectStyle(targetDir = 'src') {
  const absolutePath = resolve(targetDir);

  console.log('🔍 Code Style Detection\n');
  console.log(`Target: ${absolutePath}\n`);

  try {
    // ファイル収集
    const files = await glob(`${absolutePath}/**/*.{ts,tsx,js,jsx}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    if (files.length === 0) {
      console.log('❌ No source files found');
      process.exit(1);
    }

    console.log(`📁 Analyzing ${files.length} files...\n`);

    // スタイルパターン検出
    const stylePatterns = {
      semicolon: { yes: 0, no: 0 },
      quotes: { single: 0, double: 0 },
      indent: { spaces2: 0, spaces4: 0, tabs: 0 },
      trailingComma: { yes: 0, no: 0 }
    };

    // ファイル解析
    for (const file of files.slice(0, 50)) {  // サンプル50ファイル
      const content = await readFile(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach(line => {
        // セミコロン検出
        if (line.trim().endsWith(';')) {
          stylePatterns.semicolon.yes++;
        } else if (line.trim().length > 0 && !line.trim().endsWith('{') && !line.trim().endsWith(',')) {
          stylePatterns.semicolon.no++;
        }

        // クォート検出
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        if (singleQuotes > doubleQuotes) stylePatterns.quotes.single++;
        if (doubleQuotes > singleQuotes) stylePatterns.quotes.double++;

        // インデント検出
        if (line.match(/^  [^ ]/)) stylePatterns.indent.spaces2++;
        if (line.match(/^    [^ ]/)) stylePatterns.indent.spaces4++;
        if (line.match(/^\t/)) stylePatterns.indent.tabs++;

        // 末尾カンマ検出
        if (line.trim().endsWith(',')) stylePatterns.trailingComma.yes++;
      });
    }

    // 検出結果
    console.log('📊 Detected Patterns:\n');

    // セミコロン
    const semiTotal = stylePatterns.semicolon.yes + stylePatterns.semicolon.no;
    const semiPercent = semiTotal > 0
      ? (stylePatterns.semicolon.yes / semiTotal * 100).toFixed(1)
      : 0;
    console.log(`  Semicolons: ${semiPercent}% used`);
    const semiStyle = semiPercent > 50 ? 'yes (recommended)' : 'no';
    console.log(`    → Detected style: ${semiStyle}\n`);

    // クォート
    const quoteTotal = stylePatterns.quotes.single + stylePatterns.quotes.double;
    const singlePercent = quoteTotal > 0
      ? (stylePatterns.quotes.single / quoteTotal * 100).toFixed(1)
      : 0;
    console.log(`  Quotes: ${singlePercent}% single quotes`);
    const quoteStyle = singlePercent > 50 ? 'single (recommended)' : 'double';
    console.log(`    → Detected style: ${quoteStyle}\n`);

    // インデント
    const indentTotal = stylePatterns.indent.spaces2 + stylePatterns.indent.spaces4 + stylePatterns.indent.tabs;
    const indent2Percent = indentTotal > 0
      ? (stylePatterns.indent.spaces2 / indentTotal * 100).toFixed(1)
      : 0;
    const indent4Percent = indentTotal > 0
      ? (stylePatterns.indent.spaces4 / indentTotal * 100).toFixed(1)
      : 0;

    console.log(`  Indent: 2 spaces ${indent2Percent}%, 4 spaces ${indent4Percent}%`);
    let indentStyle = '2 spaces (recommended)';
    if (indent4Percent > indent2Percent) indentStyle = '4 spaces';
    if (stylePatterns.indent.tabs > stylePatterns.indent.spaces2) indentStyle = 'tabs';
    console.log(`    → Detected style: ${indentStyle}\n`);

    // スタイルガイド推定
    console.log('🎯 Recommended Style Guide:\n');

    let recommendation = 'Custom';
    let score = 0;

    // Airbnb適合度
    if (semiPercent > 80 && singlePercent > 80 && indent2Percent > 50) {
      recommendation = 'Airbnb';
      score = 90;
    }
    // Google適合度
    else if (semiPercent > 80 && singlePercent > 80) {
      recommendation = 'Google';
      score = 85;
    }
    // Standard適合度
    else if (semiPercent < 20 && singlePercent > 80) {
      recommendation = 'Standard';
      score = 85;
    }

    console.log(`  ${recommendation} (${score}% match)`);
    console.log(`\n  📝 Suggested .eslintrc.json:`);
    console.log(`    {`);
    console.log(`      "extends": ["${recommendation.toLowerCase()}"],`);
    console.log(`      "rules": {`);
    console.log(`        "semi": ${semiPercent > 50 ? 'true' : 'false'},`);
    console.log(`        "quotes": ["error", "${singlePercent > 50 ? 'single' : 'double'}"]`);
    console.log(`      }`);
    console.log(`    }`);

    console.log('\n✅ Analysis complete');

  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    process.exit(1);
  }
}

// CLI実行
const targetDir = process.argv[2] || 'src';
detectStyle(targetDir);
