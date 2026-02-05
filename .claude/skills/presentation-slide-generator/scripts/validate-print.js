#!/usr/bin/env node

/**
 * validate-print.js
 *
 * A4横向き印刷品質を決定論的に検証するスクリプト。
 * HTMLファイルのCSS/HTMLを静的解析し、印刷時の既知問題パターンを検出する。
 *
 * 検出対象（繰り返し発生する問題パターン）:
 *   P01: Chrome拡張アイコン非表示CSS欠如
 *   P02: スライド番号ハードコード（data-total未使用）
 *   P03: data-total属性の設定漏れ
 *   P04: print-color-adjust: exact 欠如
 *   P05: 印刷CSSでのフォントサイズ（pt単位以外）
 *   P06: スライド寸法が277mm×156mm以外
 *   P07: ページネーション色指定の欠如
 *   P08: isolation: isolate 欠如
 *   P09: グラデーション文字の印刷フォールバック欠如
 *   P10: question-badge の印刷CSS欠如
 *   P11: 印刷時の左右パディング（8mm未満）
 *   P12: body>*:not(.slider) 非表示ルール欠如
 *
 * Usage:
 *   node validate-print.js <html-file-path>
 *   node validate-print.js ./index.html
 *   node validate-print.js ./index.html --fix-hints
 *
 * 終了コード:
 *   0: 全チェックパス
 *   1: Critical問題あり
 *   2: 引数エラー
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;
const EXIT_ARGS_ERROR = 2;

// 重要度定義
const SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

// チェック結果
const results = [];

function addResult(id, severity, title, passed, detail, fixHint) {
  results.push({ id, severity, title, passed, detail, fixHint });
}

function showHelp() {
  console.log(`
validate-print.js - A4印刷品質検証スクリプト

Usage:
  node validate-print.js <html-file-path> [options]

Options:
  --fix-hints    修正ヒントを表示
  --json         JSON形式で出力
  --help, -h     このヘルプを表示

検証項目:
  P01  Chrome拡張アイコン非表示CSS
  P02  スライド番号のハードコード検出
  P03  data-total属性の設定
  P04  print-color-adjust: exact
  P05  印刷CSSのフォントサイズ（pt単位）
  P06  スライド寸法（277mm x 156mm）
  P07  ページネーション色指定
  P08  isolation: isolate
  P09  グラデーション文字の印刷フォールバック
  P10  question-badge印刷CSS
  P11  印刷時左右パディング
  P12  body>*:not(.slider)非表示
`);
}

// ===== チェック関数群 =====

function checkP01_ChromeExtensionHiding(html, printCSS) {
  const hasBodyNotSlider = printCSS.includes('body > *:not(.slider)') ||
                           printCSS.includes('body>*:not(.slider)');
  const hasDisplayNone = hasBodyNotSlider && printCSS.includes('display: none');

  addResult('P01', SEVERITY.CRITICAL,
    'Chrome拡張アイコン非表示CSS',
    hasBodyNotSlider && hasDisplayNone,
    hasBodyNotSlider && hasDisplayNone
      ? 'body>*:not(.slider) { display: none } が設定されています'
      : 'body>*:not(.slider) の非表示ルールが見つかりません',
    `@media print {
  body > *:not(.slider) {
    display: none !important;
    visibility: hidden !important;
  }
}`
  );
}

function checkP02_SlideNumberHardcode(html, printCSS) {
  // "/ 21" や "/ 15" のようなハードコードされたスライド番号を検出
  const hardcodePattern = /["']\s*\/\s*\d{1,3}\s*["']/g;
  const matches = printCSS.match(hardcodePattern) || [];

  // content: "..." 内のハードコードも検出
  const contentHardcode = /content:\s*["'][^"']*\/\s*\d{1,3}[^"']*["']/g;
  const contentMatches = html.match(contentHardcode) || [];

  const allMatches = [...matches, ...contentMatches];
  const usesAttrDataTotal = printCSS.includes('attr(data-total)');

  addResult('P02', SEVERITY.CRITICAL,
    'スライド番号ハードコード',
    allMatches.length === 0 && usesAttrDataTotal,
    allMatches.length === 0
      ? usesAttrDataTotal
        ? 'attr(data-total) を使用した動的カウンターが設定されています'
        : 'ハードコードはないが attr(data-total) の使用が確認できません'
      : `ハードコードされたスライド番号を検出: ${allMatches.join(', ')}`,
    `/* ハードコード禁止。以下を使用: */
.slider__item::after {
  content: attr(data-slide-number) " / " attr(data-total);
}`
  );
}

function checkP03_DataTotalAttribute(html) {
  const sliderItems = html.match(/<div[^>]*class="[^"]*slider__item[^"]*"[^>]*>/g) || [];
  const totalSlides = sliderItems.length;

  if (totalSlides === 0) {
    addResult('P03', SEVERITY.CRITICAL,
      'data-total属性',
      false,
      '.slider__item 要素が見つかりません',
      '<div class="slider__item" data-total="N" data-slide-number="1">'
    );
    return;
  }

  const withDataTotal = sliderItems.filter(item => /data-total=/.test(item));
  const correctTotal = sliderItems.filter(item => {
    const match = item.match(/data-total="(\d+)"/);
    return match && parseInt(match[1]) === totalSlides;
  });

  addResult('P03', SEVERITY.CRITICAL,
    'data-total属性',
    withDataTotal.length === totalSlides && correctTotal.length === totalSlides,
    withDataTotal.length === totalSlides
      ? correctTotal.length === totalSlides
        ? `全${totalSlides}スライドに正しい data-total="${totalSlides}" が設定されています`
        : `data-total の値が不正です（期待値: ${totalSlides}）`
      : `${totalSlides}スライド中 ${withDataTotal.length}個にしか data-total がありません`,
    `全ての .slider__item に data-total="${totalSlides}" を設定してください`
  );
}

function checkP04_PrintColorAdjust(html, printCSS) {
  const hasPrintColorAdjust = printCSS.includes('print-color-adjust: exact') ||
                              printCSS.includes('-webkit-print-color-adjust: exact');

  addResult('P04', SEVERITY.HIGH,
    'print-color-adjust: exact',
    hasPrintColorAdjust,
    hasPrintColorAdjust
      ? 'print-color-adjust: exact が設定されています'
      : 'print-color-adjust: exact が見つかりません（背景色が印刷されない可能性）',
    `.slider__item {
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}`
  );
}

function checkP05_PrintFontSizePt(printCSS) {
  // @media print 内でrem/px/emのフォントサイズを検出
  const nonPtFontSizes = printCSS.match(/font-size:\s*[\d.]+(?:rem|px|em)\b/g) || [];
  // var()やcalc()は除外（CSS変数経由は許容）
  const problematic = nonPtFontSizes.filter(s => !s.includes('var(') && !s.includes('calc('));

  addResult('P05', SEVERITY.HIGH,
    '印刷CSSフォントサイズ（pt単位）',
    problematic.length === 0,
    problematic.length === 0
      ? '印刷CSS内のフォントサイズは全てpt単位です'
      : `印刷CSS内にpt以外のフォントサイズを検出: ${problematic.slice(0, 5).join(', ')}${problematic.length > 5 ? '...' : ''}`,
    '印刷CSSでは全てのフォントサイズをpt単位で指定してください（最小7pt）'
  );
}

function checkP06_SlideDimensions(printCSS) {
  const hasCorrectWidth = printCSS.includes('277mm') || printCSS.includes('277.0mm');
  const hasCorrectHeight = printCSS.includes('156mm') || printCSS.includes('156.0mm');

  addResult('P06', SEVERITY.CRITICAL,
    'スライド寸法（277mm x 156mm）',
    hasCorrectWidth && hasCorrectHeight,
    hasCorrectWidth && hasCorrectHeight
      ? 'スライド寸法 277mm x 156mm が設定されています'
      : `寸法が不正: width=${hasCorrectWidth ? 'OK' : 'NG'}, height=${hasCorrectHeight ? 'OK' : 'NG'}`,
    `.slider__item {
  width: 277mm !important;
  height: 156mm !important;
}`
  );
}

function checkP07_PaginationColor(html, printCSS) {
  // スライド番号の色指定を確認
  const hasSlideNumberColor = printCSS.includes('slider__item::after') &&
                              (printCSS.includes('color:') || printCSS.includes('color :'));

  // ページカウンターのCSS存在確認
  const hasPageCounter = printCSS.includes('::after') &&
                         (printCSS.includes('content:') && printCSS.includes('attr(data-'));

  addResult('P07', SEVERITY.HIGH,
    'ページネーション色指定',
    hasSlideNumberColor || hasPageCounter,
    hasSlideNumberColor
      ? 'スライド番号に色指定があります'
      : 'スライド番号の色指定が見つかりません（デフォルト黒になる可能性）',
    `.slider__item::after {
  color: var(--fuji-gray, #727169) !important;
}`
  );
}

function checkP08_Isolation(printCSS) {
  const hasIsolation = printCSS.includes('isolation: isolate');

  addResult('P08', SEVERITY.MEDIUM,
    'isolation: isolate',
    hasIsolation,
    hasIsolation
      ? 'isolation: isolate が設定されています'
      : 'isolation: isolate が見つかりません（stacking contextの問題が発生する可能性）',
    `.slider__item {
  isolation: isolate !important;
}`
  );
}

function checkP09_GradientPrintFallback(html, printCSS) {
  // HTML内にグラデーション文字（background-clip: text）があるか
  const hasGradientText = html.includes('background-clip: text') ||
                          html.includes('-webkit-background-clip: text');

  if (!hasGradientText) {
    addResult('P09', SEVERITY.LOW,
      'グラデーション文字の印刷フォールバック',
      true,
      'グラデーション文字は使用されていません',
      ''
    );
    return;
  }

  // 印刷CSSにフォールバックがあるか
  const hasGradientFallback = printCSS.includes('background: none') ||
                              printCSS.includes('-webkit-background-clip: unset') ||
                              printCSS.includes('background-clip: unset');

  addResult('P09', SEVERITY.HIGH,
    'グラデーション文字の印刷フォールバック',
    hasGradientFallback,
    hasGradientFallback
      ? 'グラデーション文字の印刷フォールバックが設定されています'
      : 'グラデーション文字が使用されていますが、印刷フォールバックがありません',
    `.stat-value, .gradient-text {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  color: var(--wave-blue) !important;
}`
  );
}

function checkP10_QuestionBadgePrint(html, printCSS) {
  const hasQuestionBadge = html.includes('question-badge');

  if (!hasQuestionBadge) {
    addResult('P10', SEVERITY.LOW,
      'question-badge印刷CSS',
      true,
      'question-badgeは使用されていません',
      ''
    );
    return;
  }

  const hasPrintBadgeCSS = printCSS.includes('question-badge') &&
                           (printCSS.includes('background') || printCSS.includes('print-color-adjust'));

  addResult('P10', SEVERITY.HIGH,
    'question-badge印刷CSS',
    hasPrintBadgeCSS,
    hasPrintBadgeCSS
      ? 'question-badgeの印刷CSSが設定されています'
      : 'question-badgeの印刷CSSが見つかりません（背景色が消える可能性）',
    `.question-badge {
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
  background: var(--sakura-pink) !important;
}`
  );
}

function checkP11_PrintPadding(printCSS) {
  // 8mmパディング確認
  const hasPadding = printCSS.includes('padding: 8mm') ||
                     printCSS.includes('padding:8mm') ||
                     (printCSS.includes('padding-left') && printCSS.includes('8mm')) ||
                     (printCSS.includes('padding-right') && printCSS.includes('8mm'));

  addResult('P11', SEVERITY.HIGH,
    '印刷時左右パディング（8mm）',
    hasPadding,
    hasPadding
      ? '8mmパディングが設定されています'
      : '8mmパディングが確認できません（左右端切れの可能性）',
    `.slider__item {
  padding: 8mm !important;
}`
  );
}

function checkP12_BodyNotSliderDetailed(html, printCSS) {
  const hasVisibilityHidden = printCSS.includes('visibility: hidden') ||
                              printCSS.includes('visibility:hidden');
  const hasWidthZero = printCSS.includes('width: 0') || printCSS.includes('width:0');
  const hasOverflowHidden = printCSS.includes('overflow: hidden') ||
                            printCSS.includes('overflow:hidden');
  const hasPseudoElements = printCSS.includes('html::before') ||
                            printCSS.includes('body::before') ||
                            printCSS.includes('html::after') ||
                            printCSS.includes('body::after');

  const score = [hasVisibilityHidden, hasWidthZero, hasOverflowHidden, hasPseudoElements]
    .filter(Boolean).length;

  addResult('P12', SEVERITY.MEDIUM,
    'Chrome拡張完全非表示（詳細）',
    score >= 2,
    score >= 2
      ? `Chrome拡張非表示ルール: ${score}/4項目が設定されています`
      : `Chrome拡張非表示ルールが不十分です（${score}/4項目のみ）`,
    `body > *:not(.slider) {
  display: none !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  position: absolute !important;
}
html::before, html::after,
body::before, body::after {
  display: none !important;
}`
  );
}

// ===== メイン処理 =====

function extractPrintCSS(html) {
  // @media print ブロックを全て抽出
  const printBlocks = [];
  let depth = 0;
  let inPrint = false;
  let currentBlock = '';

  // 簡易パーサー: @media print { ... } を抽出
  for (let i = 0; i < html.length; i++) {
    if (html.substring(i, i + 12) === '@media print') {
      inPrint = true;
      depth = 0;
      currentBlock = '';
      i += 11;
      continue;
    }

    if (inPrint) {
      if (html[i] === '{') {
        depth++;
        if (depth === 1) continue; // 最外側の { はスキップ
      }
      if (html[i] === '}') {
        depth--;
        if (depth === 0) {
          printBlocks.push(currentBlock);
          inPrint = false;
          continue;
        }
      }
      if (depth >= 1) {
        currentBlock += html[i];
      }
    }
  }

  return printBlocks.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const flags = args.filter(a => a.startsWith('--'));
  const positionalArgs = args.filter(a => !a.startsWith('--'));

  if (flags.includes('--help') || flags.includes('-h')) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const htmlPath = positionalArgs[0];
  const showFixHints = flags.includes('--fix-hints');
  const jsonOutput = flags.includes('--json');

  if (!htmlPath) {
    console.error('Error: HTMLファイルパスを指定してください');
    console.error('Usage: node validate-print.js <html-file-path>');
    process.exit(EXIT_ARGS_ERROR);
  }

  const absolutePath = htmlPath.startsWith('/') ? htmlPath : resolve(process.cwd(), htmlPath);

  if (!existsSync(absolutePath)) {
    console.error(`Error: ファイルが見つかりません: ${absolutePath}`);
    process.exit(EXIT_ARGS_ERROR);
  }

  const html = readFileSync(absolutePath, 'utf-8');
  const printCSS = extractPrintCSS(html);

  console.log('');
  console.log('========================================');
  console.log('  A4印刷品質検証 (validate-print.js)');
  console.log('========================================');
  console.log(`  対象: ${absolutePath}`);
  console.log(`  印刷CSSブロック: ${printCSS.length > 0 ? `${(printCSS.length / 1024).toFixed(1)}KB` : '未検出'}`);
  console.log('');

  if (printCSS.length === 0) {
    console.error('  CRITICAL: @media print ブロックが見つかりません');
    console.error('  印刷用CSSが全く定義されていません。');
    process.exit(EXIT_FAILURE);
  }

  // 全チェック実行
  checkP01_ChromeExtensionHiding(html, printCSS);
  checkP02_SlideNumberHardcode(html, printCSS);
  checkP03_DataTotalAttribute(html);
  checkP04_PrintColorAdjust(html, printCSS);
  checkP05_PrintFontSizePt(printCSS);
  checkP06_SlideDimensions(printCSS);
  checkP07_PaginationColor(html, printCSS);
  checkP08_Isolation(printCSS);
  checkP09_GradientPrintFallback(html, printCSS);
  checkP10_QuestionBadgePrint(html, printCSS);
  checkP11_PrintPadding(printCSS);
  checkP12_BodyNotSliderDetailed(html, printCSS);

  // JSON出力
  if (jsonOutput) {
    const output = {
      file: absolutePath,
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        critical: results.filter(r => !r.passed && r.severity === SEVERITY.CRITICAL).length,
        high: results.filter(r => !r.passed && r.severity === SEVERITY.HIGH).length,
        medium: results.filter(r => !r.passed && r.severity === SEVERITY.MEDIUM).length,
        low: results.filter(r => !r.passed && r.severity === SEVERITY.LOW).length
      }
    };
    console.log(JSON.stringify(output, null, 2));
    process.exit(output.summary.critical > 0 ? EXIT_FAILURE : EXIT_SUCCESS);
  }

  // 結果表示
  const maxIdLen = 4;
  const maxSevLen = 8;

  for (const r of results) {
    const icon = r.passed ? '  PASS' : '  FAIL';
    const sevLabel = r.passed ? '    ' : ` [${r.severity}]`;
    console.log(`${icon}  ${r.id}${sevLabel}  ${r.title}`);
    console.log(`        ${r.detail}`);

    if (!r.passed && showFixHints && r.fixHint) {
      console.log('        --- 修正ヒント ---');
      r.fixHint.split('\n').forEach(line => console.log(`        ${line}`));
      console.log('        -----------------');
    }
    console.log('');
  }

  // サマリー
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const critical = results.filter(r => !r.passed && r.severity === SEVERITY.CRITICAL).length;
  const high = results.filter(r => !r.passed && r.severity === SEVERITY.HIGH).length;
  const medium = results.filter(r => !r.passed && r.severity === SEVERITY.MEDIUM).length;

  console.log('========================================');
  console.log(`  結果: ${passed}/${results.length} パス`);
  if (failed > 0) {
    console.log(`  不合格: Critical=${critical}, High=${high}, Medium=${medium}`);
  }
  console.log('========================================');

  if (critical > 0) {
    console.log('\n  Criticalの問題があるため、印刷前に必ず修正してください。');
    console.log('  修正ヒントを表示: node validate-print.js <file> --fix-hints');
    process.exit(EXIT_FAILURE);
  }

  if (high > 0) {
    console.log('\n  Highの問題があります。印刷品質に影響する可能性があります。');
    process.exit(EXIT_SUCCESS); // Highは警告のみ
  }

  console.log('\n  全チェックパス。印刷品質に問題はありません。');
  process.exit(EXIT_SUCCESS);
}

main();
