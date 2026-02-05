#!/usr/bin/env node
/**
 * build-single-html.js
 *
 * 分離されたHTML/CSS/JavaScriptファイルを1つのHTMLファイルに結合する。
 * GASデプロイ用のindex-single.htmlを生成。
 *
 * Usage:
 *   node build-single-html.js <slide-directory>
 *   node build-single-html.js ./
 *   node build-single-html.js "./05_Project/スライド/slide-2026-01-23-example/"
 *
 * Options:
 *   --output <filename>  出力ファイル名 (default: index-single.html)
 *   --help               ヘルプ表示
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

function showHelp() {
  console.log(`
Usage: node build-single-html.js <slide-directory> [options]

分離されたHTML/CSS/JavaScriptファイルを1つのHTMLファイルに結合します。

Arguments:
  slide-directory    index.html, styles.css, scripts.js があるディレクトリ

Options:
  --output <name>    出力ファイル名 (default: index-single.html)
  --help             このヘルプを表示
  `);
}

function parseArgs(args) {
  const options = { output: 'index-single.html', dir: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help' || args[i] === '-h') {
      showHelp();
      process.exit(0);
    } else if (args[i] === '--output' || args[i] === '-o') {
      options.output = args[++i];
    } else if (!args[i].startsWith('--')) {
      options.dir = args[i];
    }
  }

  return options;
}

function buildSingleHtml(dir, outputName) {
  const absDir = resolve(dir);

  const htmlPath = join(absDir, 'index.html');
  const cssPath = join(absDir, 'styles.css');
  const jsPath = join(absDir, 'scripts.js');
  const outputPath = join(absDir, outputName);

  // ファイル存在チェック
  if (!existsSync(htmlPath)) {
    console.error(`Error: index.html not found in ${absDir}`);
    process.exit(1);
  }

  let html = readFileSync(htmlPath, 'utf-8');

  // CSS のインライン化
  if (existsSync(cssPath)) {
    const css = readFileSync(cssPath, 'utf-8');
    // <link rel="stylesheet" href="styles.css"> を <style> に置換
    html = html.replace(
      /<link\s+rel="stylesheet"\s+href="styles\.css"\s*\/?>/,
      `<style>\n${css}\n</style>`
    );
    console.log(`  CSS inlined: styles.css (${(css.length / 1024).toFixed(1)}KB)`);
  } else {
    console.warn('  Warning: styles.css not found, skipping CSS inline');
  }

  // JavaScript のインライン化
  if (existsSync(jsPath)) {
    const js = readFileSync(jsPath, 'utf-8');
    // <script src="scripts.js"></script> を inline <script> に置換
    html = html.replace(
      /<script\s+src="scripts\.js"\s*><\/script>/,
      `<script>\n${js}\n</script>`
    );
    console.log(`  JavaScript inlined: scripts.js (${(js.length / 1024).toFixed(1)}KB)`);
  } else {
    console.warn('  Warning: scripts.js not found, skipping JavaScript inline');
  }

  writeFileSync(outputPath, html, 'utf-8');

  const size = (html.length / 1024).toFixed(1);
  console.log(`\n  Output: ${outputPath}`);
  console.log(`  Size: ${size}KB`);

  // GAS制限チェック (500KB)
  if (html.length > 500 * 1024) {
    console.warn(`\n  Warning: File size exceeds GAS limit (500KB). Current: ${size}KB`);
  }

  return outputPath;
}

// Main
const args = process.argv.slice(2);
const options = parseArgs(args);

if (!options.dir) {
  console.error('Error: Please specify the slide directory');
  showHelp();
  process.exit(1);
}

console.log(`Building single HTML from: ${resolve(options.dir)}`);
console.log('');
buildSingleHtml(options.dir, options.output);
console.log('\nDone!');
