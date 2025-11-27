#!/usr/bin/env node

/**
 * ドキュメント内部リンク検証スクリプト
 *
 * 使用方法:
 *   node validate-links.mjs <directory>
 *
 * 機能:
 *   - 内部リンクの存在確認
 *   - アンカーリンクの検証
 *   - 壊れたリンクのレポート
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, extname, resolve, relative } from 'path';

/**
 * ディレクトリ内のMarkdownファイルを再帰的に取得
 */
function getMarkdownFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // node_modulesや.gitは除外
      if (!item.startsWith('.') && item !== 'node_modules') {
        getMarkdownFiles(fullPath, files);
      }
    } else if (extname(item).toLowerCase() === '.md') {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Markdownファイルからリンクを抽出
 */
function extractLinks(content, filePath) {
  const links = [];

  // Markdownリンク: [text](url)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const [fullMatch, text, url] = match;
    const lineNumber = content.slice(0, match.index).split('\n').length;

    // 外部リンク(http/https)は除外
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
      links.push({
        text,
        url,
        lineNumber,
        filePath
      });
    }
  }

  return links;
}

/**
 * ファイルからアンカー（見出し）を抽出
 */
function extractAnchors(content) {
  const anchors = new Set();

  // Markdown見出しからアンカーを生成
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const heading = match[1];
    // GitHubスタイルのアンカー生成
    const anchor = heading
      .toLowerCase()
      .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    anchors.add(anchor);
  }

  return anchors;
}

/**
 * リンクを検証
 */
function validateLink(link, baseDir, filesMap, anchorsMap) {
  const result = {
    ...link,
    valid: true,
    error: null
  };

  let targetPath = link.url;
  let anchor = null;

  // アンカー部分を分離
  if (targetPath.includes('#')) {
    const parts = targetPath.split('#');
    targetPath = parts[0];
    anchor = parts[1];
  }

  // 同一ファイル内のアンカーリンク
  if (targetPath === '' && anchor) {
    const currentAnchors = anchorsMap.get(link.filePath);
    if (currentAnchors && !currentAnchors.has(anchor)) {
      result.valid = false;
      result.error = `アンカー "#${anchor}" が見つかりません`;
    }
    return result;
  }

  // 相対パスを解決
  const linkDir = dirname(link.filePath);
  const resolvedPath = resolve(linkDir, targetPath);

  // .md拡張子がない場合は追加
  let checkPath = resolvedPath;
  if (!checkPath.endsWith('.md') && !existsSync(checkPath)) {
    checkPath = resolvedPath + '.md';
  }

  // ファイルの存在確認
  if (!existsSync(checkPath)) {
    result.valid = false;
    result.error = `ファイル "${targetPath}" が見つかりません`;
    return result;
  }

  // アンカーの検証
  if (anchor) {
    const targetAnchors = anchorsMap.get(checkPath);
    if (targetAnchors && !targetAnchors.has(anchor)) {
      result.valid = false;
      result.error = `ファイル "${targetPath}" にアンカー "#${anchor}" が見つかりません`;
    }
  }

  return result;
}

/**
 * 検証結果を表示
 */
function printResults(results, baseDir) {
  const validLinks = results.filter(r => r.valid);
  const invalidLinks = results.filter(r => !r.valid);

  console.log('\n🔗 ドキュメントリンク検証レポート\n');
  console.log('='.repeat(70));

  console.log(`\n📊 サマリー`);
  console.log(`   総リンク数: ${results.length}`);
  console.log(`   ✅ 有効: ${validLinks.length}`);
  console.log(`   ❌ 無効: ${invalidLinks.length}`);

  if (invalidLinks.length > 0) {
    console.log('\n❌ 壊れたリンク:\n');

    // ファイルごとにグループ化
    const byFile = {};
    for (const link of invalidLinks) {
      const relPath = relative(baseDir, link.filePath);
      if (!byFile[relPath]) {
        byFile[relPath] = [];
      }
      byFile[relPath].push(link);
    }

    for (const [file, links] of Object.entries(byFile)) {
      console.log(`📄 ${file}`);
      for (const link of links) {
        console.log(`   行 ${link.lineNumber}: [${link.text}](${link.url})`);
        console.log(`      → ${link.error}`);
      }
      console.log('');
    }
  }

  // 改善提案
  if (invalidLinks.length > 0) {
    console.log('\n💡 改善提案:');
    console.log('   1. ファイルパスのスペルを確認してください');
    console.log('   2. ファイルが移動または削除されていないか確認してください');
    console.log('   3. アンカー名は見出しテキストから自動生成されます');
    console.log('   4. 相対パスが正しいか確認してください');
  }

  console.log('\n' + '='.repeat(70));

  return invalidLinks.length === 0;
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node validate-links.mjs <directory>');
    console.log('\n例:');
    console.log('  node validate-links.mjs docs/');
    process.exit(1);
  }

  const targetDir = args[0];

  if (!existsSync(targetDir)) {
    console.error(`エラー: ディレクトリ "${targetDir}" が見つかりません`);
    process.exit(1);
  }

  console.log(`\n🔍 ${targetDir} 内のリンクを検証中...\n`);

  try {
    // Markdownファイルを収集
    const files = getMarkdownFiles(targetDir);
    console.log(`   ${files.length} 個のMarkdownファイルを発見`);

    // 各ファイルのアンカーを抽出
    const anchorsMap = new Map();
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      anchorsMap.set(file, extractAnchors(content));
    }

    // 各ファイルのリンクを抽出して検証
    const allResults = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const links = extractLinks(content, file);

      for (const link of links) {
        const result = validateLink(link, targetDir, files, anchorsMap);
        allResults.push(result);
      }
    }

    // 結果を表示
    const success = printResults(allResults, targetDir);

    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
