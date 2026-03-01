#!/usr/bin/env node

/**
 * Phase 11 スクリーンショット撮影スクリプト
 *
 * Playwright を使用して Electron アプリの画面キャプチャを実行し、
 * 所定のディレクトリに命名規則に従って保存する。
 *
 * Usage:
 *   node capture-screenshots.js --workflow <workflow-dir> [options]
 *
 * Options:
 *   --workflow <path>    ワークフローディレクトリ（必須）
 *                        例: docs/30-workflows/my-feature
 *   --url <url>          キャプチャ対象URL（デフォルト: http://localhost:5173）
 *   --routes <routes>    キャプチャするルート（カンマ区切り）
 *                        例: /,/settings,/agents
 *   --tc-prefix <prefix> テストケースIDプレフィックス（デフォルト: TC）
 *   --state <state>      撮影状態ラベル（デフォルト: after）
 *                        before / after / error
 *   --fullpage            フルページスクリーンショット
 *   --dark               ダークモードで撮影（prefers-color-scheme: dark）
 *   --viewport <WxH>     ビューポートサイズ（デフォルト: 1280x720）
 *   --wait <ms>          ページロード後の待機時間（デフォルト: 1000）
 *   --dry-run            実行せずに出力パスのみ表示
 *
 * Examples:
 *   # 基本: 現在のページをキャプチャ
 *   node capture-screenshots.js --workflow docs/30-workflows/my-feature
 *
 *   # 複数ルートをbefore状態でキャプチャ
 *   node capture-screenshots.js \
 *     --workflow docs/30-workflows/my-feature \
 *     --routes /,/settings,/agents \
 *     --state before
 *
 *   # ダークモード + フルページ
 *   node capture-screenshots.js \
 *     --workflow docs/30-workflows/my-feature \
 *     --routes /settings \
 *     --state after --dark --fullpage
 *
 * Output:
 *   <workflow>/outputs/phase-11/screenshots/TC-01-after.png
 *   <workflow>/outputs/phase-11/screenshots/TC-02-after.png
 *   ...
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// --- 引数パース ---
function parseArgs(argv) {
  const args = {
    workflow: null,
    url: "http://localhost:5173",
    routes: ["/"],
    tcPrefix: "TC",
    state: "after",
    fullpage: false,
    dark: false,
    viewport: { width: 1280, height: 720 },
    wait: 1000,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--workflow":
        args.workflow = argv[++i];
        break;
      case "--url":
        args.url = argv[++i];
        break;
      case "--routes":
        args.routes = argv[++i].split(",").map((r) => r.trim());
        break;
      case "--tc-prefix":
        args.tcPrefix = argv[++i];
        break;
      case "--state":
        args.state = argv[++i];
        break;
      case "--fullpage":
        args.fullpage = true;
        break;
      case "--dark":
        args.dark = true;
        break;
      case "--viewport": {
        const [w, h] = argv[++i].split("x").map(Number);
        args.viewport = { width: w, height: h };
        break;
      }
      case "--wait":
        args.wait = parseInt(argv[++i], 10);
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      default:
        console.error(`Unknown option: ${argv[i]}`);
        process.exit(1);
    }
  }

  if (!args.workflow) {
    console.error("Error: --workflow is required");
    console.error(
      "Usage: node capture-screenshots.js --workflow <workflow-dir>"
    );
    process.exit(1);
  }

  return args;
}

// --- Playwright スクリプト生成 ---
function generatePlaywrightScript(args, outputDir) {
  const screenshots = args.routes.map((route, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const filename = `${args.tcPrefix}-${num}-${args.state}.png`;
    const filepath = path.join(outputDir, filename);
    return { route, filename, filepath };
  });

  // Playwright スクリプトを一時ファイルとして生成
  const script = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: ${args.viewport.width}, height: ${args.viewport.height} },
    ${args.dark ? "colorScheme: 'dark'," : "colorScheme: 'light',"}
  });
  const page = await context.newPage();

  const screenshots = ${JSON.stringify(screenshots, null, 2)};

  for (const ss of screenshots) {
    try {
      await page.goto('${args.url}' + ss.route, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(${args.wait});
      await page.screenshot({
        path: ss.filepath,
        fullPage: ${args.fullpage},
      });
      console.log('✓ ' + ss.filename + ' -> ' + ss.filepath);
    } catch (err) {
      console.error('✗ ' + ss.filename + ': ' + err.message);
    }
  }

  await browser.close();
  console.log('\\nDone: ' + screenshots.length + ' screenshots captured');
})();
`;

  return script;
}

// --- メイン ---
function main() {
  const args = parseArgs(process.argv);

  // 出力ディレクトリ作成
  const outputDir = path.resolve(
    args.workflow,
    "outputs",
    "phase-11",
    "screenshots"
  );

  if (args.dryRun) {
    console.log("=== Dry Run ===");
    console.log(`Output directory: ${outputDir}`);
    console.log(`Base URL: ${args.url}`);
    console.log(`Routes: ${args.routes.join(", ")}`);
    console.log(`State: ${args.state}`);
    console.log(`Dark mode: ${args.dark}`);
    console.log(`Viewport: ${args.viewport.width}x${args.viewport.height}`);
    console.log("\nFiles that would be created:");
    args.routes.forEach((route, idx) => {
      const num = String(idx + 1).padStart(2, "0");
      const filename = `${args.tcPrefix}-${num}-${args.state}.png`;
      console.log(`  ${path.join(outputDir, filename)}  (${route})`);
    });
    return;
  }

  // Playwright がインストールされているか確認
  try {
    require.resolve("playwright");
  } catch {
    console.error("Error: playwright is not installed.");
    console.error("Run: pnpm add -D playwright");
    process.exit(1);
  }

  // 出力ディレクトリ作成
  fs.mkdirSync(outputDir, { recursive: true });

  // Playwright スクリプトを生成・実行
  const script = generatePlaywrightScript(args, outputDir);
  const tmpScript = path.join(outputDir, ".capture-tmp.js");

  try {
    fs.writeFileSync(tmpScript, script);
    console.log(`Capturing screenshots to: ${outputDir}`);
    console.log(`Base URL: ${args.url}`);
    console.log(`Routes: ${args.routes.join(", ")}`);
    console.log(`State: ${args.state}`);
    console.log(`Dark mode: ${args.dark}`);
    console.log(`Viewport: ${args.viewport.width}x${args.viewport.height}`);
    console.log("");

    execSync(`node "${tmpScript}"`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (err) {
    console.error("Screenshot capture failed:", err.message);

    // 撮影不可時の代替: NOTE.txt を生成
    const noteFile = path.join(outputDir, "NOTE.txt");
    fs.writeFileSync(
      noteFile,
      [
        "スクリーンショット撮影不可",
        "",
        `日時: ${new Date().toISOString()}`,
        `理由: ${err.message}`,
        "",
        "代替エビデンス:",
        "- DevToolsログまたはテスト実行結果を参照してください",
      ].join("\n")
    );
    console.log(`NOTE.txt created at: ${noteFile}`);
    process.exit(1);
  } finally {
    // 一時スクリプト削除
    if (fs.existsSync(tmpScript)) {
      fs.unlinkSync(tmpScript);
    }
  }
}

main();
