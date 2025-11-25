#!/usr/bin/env node

/**
 * detect-n-plus-one.mjs
 *
 * TypeScript/JavaScriptコードからN+1問題のパターンを検出するスクリプト。
 *
 * 使用方法:
 *   node detect-n-plus-one.mjs <source-dir>
 *
 * 例:
 *   node detect-n-plus-one.mjs src/
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// 色定義
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

/**
 * N+1パターンの種類
 */
const PatternType = {
  LOOP_QUERY: 'loop_query',
  FOREACH_QUERY: 'foreach_query',
  MAP_QUERY: 'map_query',
  MISSING_WITH: 'missing_with',
  SEQUENTIAL_FIND: 'sequential_find',
};

/**
 * 問題クラス
 */
class N1Issue {
  constructor(type, severity, file, line, codeSnippet, suggestion) {
    this.type = type;
    this.severity = severity;
    this.file = file;
    this.line = line;
    this.codeSnippet = codeSnippet;
    this.suggestion = suggestion;
  }
}

/**
 * ディレクトリを再帰的に走査
 */
function walkDirectory(dir, extensions = ['.ts', '.js', '.mjs']) {
  const files = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
          walk(fullPath);
        }
      } else if (stat.isFile() && extensions.includes(extname(entry))) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * forループ内のDBクエリを検出
 */
function detectForLoopQueries(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // for/for-ofループを検出
    if (/for\s*\(/.test(line) || /for\s+.*\s+of\s+/.test(line)) {
      // 次の20行以内にawait + DB操作があるか
      const loopContent = lines.slice(i, Math.min(i + 20, lines.length)).join('\n');

      const dbPatterns = [
        /await\s+.*\.findFirst\s*\(/,
        /await\s+.*\.findUnique\s*\(/,
        /await\s+.*\.findMany\s*\(/,
        /await\s+.*\.select\s*\(/,
        /await\s+db\.query\./,
        /await\s+tx\./,
      ];

      for (const pattern of dbPatterns) {
        if (pattern.test(loopContent)) {
          issues.push(
            new N1Issue(
              PatternType.LOOP_QUERY,
              'error',
              filePath,
              i + 1,
              line.trim().substring(0, 60),
              'forループ内でDBクエリを実行しています。INクエリまたはJOINに変更してください。'
            )
          );
          break;
        }
      }
    }
  }

  return issues;
}

/**
 * forEach/map内のDBクエリを検出
 */
function detectArrayMethodQueries(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // forEach/mapを検出
    if (/\.forEach\s*\(\s*async/.test(line) || /\.map\s*\(\s*async/.test(line)) {
      const methodContent = lines.slice(i, Math.min(i + 15, lines.length)).join('\n');

      const dbPatterns = [
        /await\s+.*\.findFirst/,
        /await\s+.*\.findUnique/,
        /await\s+.*\.select/,
        /await\s+db\./,
      ];

      for (const pattern of dbPatterns) {
        if (pattern.test(methodContent)) {
          const type = line.includes('.forEach') ? PatternType.FOREACH_QUERY : PatternType.MAP_QUERY;
          issues.push(
            new N1Issue(
              type,
              'error',
              filePath,
              i + 1,
              line.trim().substring(0, 60),
              `async ${type === PatternType.FOREACH_QUERY ? 'forEach' : 'map'}内でDBクエリを実行しています。Promise.allまたはバッチ取得に変更してください。`
            )
          );
          break;
        }
      }
    }
  }

  return issues;
}

/**
 * withオプション未使用を検出
 */
function detectMissingWith(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // findManyを検出
    if (/\.findMany\s*\(\s*\{/.test(line)) {
      // 次の10行以内にwithがあるか確認
      const queryContent = lines.slice(i, Math.min(i + 10, lines.length)).join('\n');

      // 閉じ括弧までを取得
      const bracketMatch = queryContent.match(/\.findMany\s*\(\s*\{[^}]*\}/s);
      if (bracketMatch) {
        const queryBlock = bracketMatch[0];

        // withがなく、後でリレーションデータにアクセスしている可能性
        if (!queryBlock.includes('with:')) {
          // その後の行でリレーションアクセスがあるか
          const afterContent = lines.slice(i + 1, Math.min(i + 30, lines.length)).join('\n');
          if (/\.\w+\.\w+/.test(afterContent) || /\.items/.test(afterContent) || /\.user/.test(afterContent)) {
            issues.push(
              new N1Issue(
                PatternType.MISSING_WITH,
                'warning',
                filePath,
                i + 1,
                line.trim().substring(0, 60),
                'リレーションデータに後でアクセスしている可能性があります。withオプションでEager Loadingを検討してください。'
              )
            );
          }
        }
      }
    }
  }

  return issues;
}

/**
 * 連続したfindFirst/findUniqueを検出
 */
function detectSequentialFinds(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  let findCount = 0;
  let findStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/await\s+.*\.(findFirst|findUnique)\s*\(/.test(line)) {
      if (findCount === 0) {
        findStartLine = i + 1;
      }
      findCount++;

      // 5行以内に3回以上のfindがある場合は警告
      if (findCount >= 3) {
        issues.push(
          new N1Issue(
            PatternType.SEQUENTIAL_FIND,
            'warning',
            filePath,
            findStartLine,
            `連続したfind操作（${findCount}回）`,
            '複数の連続したfind操作はINクエリまたはJOINでまとめることを検討してください。'
          )
        );
        findCount = 0;
      }
    } else if (line.trim() && !line.trim().startsWith('//')) {
      // 別の処理が入ったらリセット
      findCount = 0;
    }
  }

  return issues;
}

/**
 * ファイルを分析
 */
function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const issues = [];

    issues.push(...detectForLoopQueries(content, filePath));
    issues.push(...detectArrayMethodQueries(content, filePath));
    issues.push(...detectMissingWith(content, filePath));
    issues.push(...detectSequentialFinds(content, filePath));

    return issues;
  } catch (error) {
    console.error(`${colors.red}ファイル読み込みエラー: ${filePath}${colors.reset}`);
    return [];
  }
}

/**
 * レポートを出力
 */
function printReport(issues) {
  console.log('\n' + '='.repeat(60));
  console.log('N+1問題検出レポート');
  console.log('='.repeat(60) + '\n');

  if (issues.length === 0) {
    console.log(`${colors.green}✅ N+1問題は検出されませんでした。${colors.reset}\n`);
    return;
  }

  // 重要度別にグループ化
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  console.log(`${colors.cyan}サマリー${colors.reset}`);
  console.log(`  エラー: ${errors.length}`);
  console.log(`  警告: ${warnings.length}`);
  console.log();

  // エラーを表示
  if (errors.length > 0) {
    console.log(`\n${colors.red}### エラー (${errors.length}件) ###${colors.reset}\n`);
    for (const issue of errors) {
      console.log(`${colors.red}[${issue.type.toUpperCase()}]${colors.reset}`);
      console.log(`  📁 ${issue.file}:${issue.line}`);
      console.log(`  📝 ${issue.codeSnippet}`);
      console.log(`  💡 ${issue.suggestion}`);
      console.log();
    }
  }

  // 警告を表示
  if (warnings.length > 0) {
    console.log(`\n${colors.yellow}### 警告 (${warnings.length}件) ###${colors.reset}\n`);
    for (const issue of warnings) {
      console.log(`${colors.yellow}[${issue.type.toUpperCase()}]${colors.reset}`);
      console.log(`  📁 ${issue.file}:${issue.line}`);
      console.log(`  📝 ${issue.codeSnippet}`);
      console.log(`  💡 ${issue.suggestion}`);
      console.log();
    }
  }

  // 推奨事項
  console.log('='.repeat(60));
  console.log('推奨事項');
  console.log('='.repeat(60));
  console.log(`
1. ループ内のDBクエリをINクエリまたはJOINに変更
2. async forEach/mapをPromise.allでバッチ処理に変更
3. withオプションでEager Loadingを使用
4. 連続したfind操作をまとめる
`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node detect-n-plus-one.mjs <source-dir>');
    console.log('例: node detect-n-plus-one.mjs src/');
    process.exit(1);
  }

  const sourceDir = args[0];
  console.log(`\n分析中: ${sourceDir}\n`);

  const files = walkDirectory(sourceDir);
  console.log(`対象ファイル: ${files.length}件`);

  const allIssues = [];

  for (const file of files) {
    const issues = analyzeFile(file);
    allIssues.push(...issues);
  }

  printReport(allIssues);
}

main();