#!/usr/bin/env node
/**
 * スライド検証スクリプト（16:9対応版）
 *
 * 機能:
 * - 全スライドのスクリーンショットを撮影（16:9ビューポート）
 * - 16:9アスペクト比の検証
 * - 問題のあるスライドを特定（テキスト切れ、改行問題など）
 * - 検証完了後のスクリーンショット削除
 *
 * 使用方法:
 *   node scripts/verify-slides.mjs <html-file-path> [output-dir] [options]
 *
 * オプション:
 *   --cleanup       スクリーンショットを削除して終了
 *   --auto-cleanup  検証後に自動でスクリーンショットを削除
 *   --check-ratio   16:9アスペクト比のみチェック（スクリーンショットなし）
 *
 * 例:
 *   node scripts/verify-slides.mjs ./index.html ./screenshots
 *   node scripts/verify-slides.mjs ./index.html --cleanup
 *   node scripts/verify-slides.mjs ./index.html --auto-cleanup
 *   node scripts/verify-slides.mjs ./index.html --check-ratio
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// コマンドライン引数のパース
const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positionalArgs = args.filter(a => !a.startsWith('--'));

const cleanupOnly = flags.includes('--cleanup');
const autoCleanup = flags.includes('--auto-cleanup');
const checkRatioOnly = flags.includes('--check-ratio');
const htmlPath = positionalArgs[0];
const outputDir = positionalArgs[1] || (htmlPath ? join(dirname(htmlPath), 'screenshots') : null);

// 16:9基準解像度
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;
const ASPECT_RATIO = 16 / 9;

// ヘルプ表示
if (flags.includes('--help') || flags.includes('-h')) {
  console.log(`
スライド検証スクリプト（16:9対応版）

使用方法:
  node verify-slides.mjs <html-file-path> [output-dir] [options]

オプション:
  --cleanup       指定ディレクトリのスクリーンショットを削除して終了
  --auto-cleanup  検証完了後に自動でスクリーンショットを削除
  --check-ratio   16:9アスペクト比のみチェック（スクリーンショットなし）
  --help, -h      このヘルプを表示

例:
  # スクリーンショット撮影（16:9ビューポート: 1920x1080）
  node verify-slides.mjs ./index.html ./screenshots

  # スクリーンショット削除のみ
  node verify-slides.mjs ./index.html --cleanup

  # 撮影後に自動削除
  node verify-slides.mjs ./index.html --auto-cleanup

  # 16:9アスペクト比の検証のみ
  node verify-slides.mjs ./index.html --check-ratio
`);
  process.exit(0);
}

/**
 * スクリーンショットディレクトリを削除
 */
function cleanupScreenshots(dir) {
  if (!dir) {
    console.error('❌ 削除対象のディレクトリが指定されていません');
    return false;
  }

  const absoluteDir = dir.startsWith('/') ? dir : join(process.cwd(), dir);

  if (!existsSync(absoluteDir)) {
    console.log(`⚠️  ディレクトリが存在しません: ${absoluteDir}`);
    return true;
  }

  try {
    const files = readdirSync(absoluteDir).filter(f => f.endsWith('.png'));

    if (files.length === 0) {
      console.log(`📁 削除対象のスクリーンショットがありません: ${absoluteDir}`);
      return true;
    }

    // スクリーンショットファイルを削除
    files.forEach(file => {
      const filePath = join(absoluteDir, file);
      rmSync(filePath);
    });

    console.log(`🗑️  ${files.length}枚のスクリーンショットを削除しました`);

    // ディレクトリが空なら削除
    const remaining = readdirSync(absoluteDir);
    if (remaining.length === 0) {
      rmSync(absoluteDir, { recursive: true });
      console.log(`📁 空のディレクトリを削除: ${absoluteDir}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ 削除中にエラーが発生: ${error.message}`);
    return false;
  }
}

/**
 * 16:9アスペクト比を検証
 */
function checkAspectRatio(htmlPath) {
  if (!htmlPath) {
    console.error('Usage: node verify-slides.mjs <html-file-path> --check-ratio');
    process.exit(1);
  }

  if (!existsSync(htmlPath)) {
    console.error(`Error: HTML file not found: ${htmlPath}`);
    process.exit(1);
  }

  const absoluteHtmlPath = htmlPath.startsWith('/') ? htmlPath : join(process.cwd(), htmlPath);

  console.log('📐 16:9アスペクト比を検証中...');
  console.log(`   HTML: ${absoluteHtmlPath}`);
  console.log(`   基準解像度: ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT} (16:9)`);

  const pythonScript = `
from playwright.sync_api import sync_playwright
import sys
import json

html_path = "${absoluteHtmlPath}"

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': ${VIEWPORT_WIDTH}, 'height': ${VIEWPORT_HEIGHT}})
        page.goto(f"file://{html_path}")
        page.wait_for_timeout(1500)

        # 16:9検証
        result = page.evaluate("""
            () => {
                const slideArea = document.querySelector('.slide-area');
                const sliderContainer = document.querySelector('.slider__container');
                const sliderItems = document.querySelectorAll('.slider__item');

                const checks = {
                    hasSlideArea: !!slideArea,
                    slideAreaSize: slideArea ? { width: slideArea.offsetWidth, height: slideArea.offsetHeight } : null,
                    slideAreaRatio: slideArea ? (slideArea.offsetWidth / slideArea.offsetHeight).toFixed(4) : null,
                    expectedRatio: (16/9).toFixed(4),
                    ratioMatch: false,
                    cssVariables: {
                        slideMaxWidth: getComputedStyle(document.documentElement).getPropertyValue('--slide-max-width').trim(),
                        slideMaxHeight: getComputedStyle(document.documentElement).getPropertyValue('--slide-max-height').trim(),
                    },
                    slideItemsCount: sliderItems.length,
                    slideItemsHaveAspectRatio: Array.from(sliderItems).every(item =>
                        getComputedStyle(item).aspectRatio.includes('16') || getComputedStyle(item).aspectRatio === 'auto'
                    )
                };

                if (slideArea) {
                    const ratio = slideArea.offsetWidth / slideArea.offsetHeight;
                    checks.ratioMatch = Math.abs(ratio - (16/9)) < 0.01;
                }

                return checks;
            }
        """)

        print(json.dumps(result, indent=2, ensure_ascii=False))

        browser.close()

        # 結果判定
        if not result['hasSlideArea']:
            print("\\n❌ 検証失敗: .slide-area要素が見つかりません")
            sys.exit(1)
        elif not result['ratioMatch']:
            print(f"\\n❌ 検証失敗: アスペクト比が16:9ではありません")
            print(f"   実際: {result['slideAreaRatio']} / 期待: {result['expectedRatio']}")
            sys.exit(1)
        else:
            print(f"\\n✅ 検証成功: 16:9アスペクト比が正しく設定されています")
            print(f"   スライドエリア: {result['slideAreaSize']['width']}x{result['slideAreaSize']['height']}px")
            sys.exit(0)

except Exception as e:
    print(f"❌ エラー: {e}")
    sys.exit(1)
`;

  try {
    execSync(`python3 -c '${pythonScript.replace(/'/g, "\\'")}'`, {
      stdio: 'inherit',
      timeout: 60000
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * スクリーンショットを撮影（16:9対応）
 */
function captureScreenshots(htmlPath, outputDir) {
  if (!htmlPath) {
    console.error('Usage: node verify-slides.mjs <html-file-path> [output-dir]');
    console.error('Example: node verify-slides.mjs ./index.html ./screenshots');
    process.exit(1);
  }

  if (!existsSync(htmlPath)) {
    console.error(`Error: HTML file not found: ${htmlPath}`);
    process.exit(1);
  }

  // 絶対パスに変換
  const absoluteHtmlPath = htmlPath.startsWith('/') ? htmlPath : join(process.cwd(), htmlPath);
  const absoluteOutputDir = outputDir.startsWith('/') ? outputDir : join(process.cwd(), outputDir);

  // 出力ディレクトリ作成
  if (!existsSync(absoluteOutputDir)) {
    mkdirSync(absoluteOutputDir, { recursive: true });
  }

  console.log('🔍 スライド検証を開始（16:9モード）...');
  console.log(`   HTML: ${absoluteHtmlPath}`);
  console.log(`   出力: ${absoluteOutputDir}`);
  console.log(`   ビューポート: ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT} (16:9)`);

  // Pythonスクリプトを生成して実行
  const pythonScript = `
from playwright.sync_api import sync_playwright
import os
import sys

html_path = "${absoluteHtmlPath}"
output_dir = "${absoluteOutputDir}"

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 16:9ビューポートを使用
        page = browser.new_page(viewport={'width': ${VIEWPORT_WIDTH}, 'height': ${VIEWPORT_HEIGHT}})
        page.goto(f"file://{html_path}")
        page.wait_for_timeout(2000)

        # 16:9検証
        slide_area = page.evaluate("document.querySelector('.slide-area')")
        if slide_area:
            area_info = page.evaluate("""
                () => {
                    const area = document.querySelector('.slide-area');
                    return { width: area.offsetWidth, height: area.offsetHeight };
                }
            """)
            ratio = area_info['width'] / area_info['height']
            expected = 16/9
            if abs(ratio - expected) < 0.01:
                print(f"📐 16:9検証OK: {area_info['width']}x{area_info['height']}px")
            else:
                print(f"⚠️  16:9警告: 比率が {ratio:.4f} です（期待値: {expected:.4f}）")
        else:
            print("⚠️  .slide-area要素が見つかりません（旧形式の可能性）")

        # 総スライド数を取得
        total = page.evaluate("document.querySelectorAll('.slider__item').length")
        print(f"📊 総スライド数: {total}")

        # slide-areaの幅を取得（なければビューポート幅）
        slide_width = page.evaluate("""
            () => {
                const area = document.querySelector('.slide-area');
                return area ? area.offsetWidth : window.innerWidth;
            }
        """)

        # 全スライドをスクリーンショット
        for i in range(total):
            page.evaluate(f"""
                const container = document.querySelector('.slider__container');
                const slideWidth = {slide_width};
                container.style.transform = 'translateX(' + (-{i} * slideWidth) + 'px)';
                const items = document.querySelectorAll('.slider__item');
                items.forEach((item, idx) => {{
                    const content = item.querySelector('.slider__content');
                    if (content) content.style.visibility = 'visible';
                }});
            """)
            page.wait_for_timeout(200)
            page.screenshot(path=f"{output_dir}/slide_{i+1:02d}.png")
            print(f"   ✅ スライド {i+1}/{total}")

        browser.close()
        print(f"\\n🎉 完了: {output_dir}")
        sys.exit(0)
except Exception as e:
    print(f"❌ エラー: {e}")
    sys.exit(1)
`;

  try {
    execSync(`python3 -c '${pythonScript.replace(/'/g, "\\'")}'`, {
      stdio: 'inherit',
      timeout: 300000 // 5分タイムアウト
    });

    // スクリーンショット数を確認
    const screenshots = readdirSync(absoluteOutputDir).filter(f => f.endsWith('.png'));
    console.log(`\n📁 ${screenshots.length}枚のスクリーンショットを保存`);

    return true;
  } catch (error) {
    console.error('スクリーンショット撮影に失敗しました');
    console.error('Playwrightがインストールされているか確認してください:');
    console.error('  pip install playwright && playwright install chromium');
    return false;
  }
}

// メイン処理
if (cleanupOnly) {
  // 削除のみモード
  console.log('🗑️  スクリーンショット削除モード');
  const targetDir = outputDir || (htmlPath ? join(dirname(htmlPath), 'screenshots') : null);
  const success = cleanupScreenshots(targetDir);
  process.exit(success ? 0 : 1);
} else if (checkRatioOnly) {
  // 16:9検証のみモード
  console.log('📐 16:9アスペクト比検証モード');
  const success = checkAspectRatio(htmlPath);
  process.exit(success ? 0 : 1);
} else {
  // 通常モード: スクリーンショット撮影（16:9対応）
  const success = captureScreenshots(htmlPath, outputDir);

  if (success && autoCleanup) {
    // 自動削除モード
    console.log('\n⏳ 3秒後にスクリーンショットを自動削除します...');
    console.log('   （中断するには Ctrl+C）\n');

    setTimeout(() => {
      cleanupScreenshots(outputDir);
      console.log('\n✨ 検証と削除が完了しました');
    }, 3000);
  } else if (success) {
    // 通常モード: 削除方法を案内
    console.log('\n💡 次のステップ:');
    console.log('   1. スクリーンショットを確認してレイアウト問題を特定');
    console.log('   2. 問題のあるスライドのHTMLを修正');
    console.log('   3. 再度このスクリプトを実行して検証');
    console.log('\n📐 16:9アスペクト比のみを検証する場合:');
    console.log(`   node verify-slides.mjs ${htmlPath} --check-ratio`);
    console.log('\n🗑️  確認完了後、以下のコマンドでスクリーンショットを削除:');
    console.log(`   node verify-slides.mjs ${htmlPath} --cleanup`);
  } else {
    process.exit(1);
  }
}
