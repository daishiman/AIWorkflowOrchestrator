#!/usr/bin/env node
/**
 * capture-screenshots.js
 *
 * Phase 11 スクリーンショット撮影スクリプト（拡張版）
 *
 * Playwright を使用して Electron アプリの画面キャプチャを実行し、
 * 所定のディレクトリに命名規則に従って保存する。
 * JSON撮影計画による一括撮影、要素単位キャプチャ、インタラクション撮影に対応。
 *
 * @usage
 *   node capture-screenshots.js --workflow <workflow-dir> [options]
 *
 * @options
 *   --workflow <path>         ワークフローディレクトリ（必須）
 *                             例: docs/30-workflows/my-feature
 *   --url <url>               キャプチャ対象URL（デフォルト: http://localhost:5173）
 *   --routes <routes>         キャプチャするルート（カンマ区切り）
 *                             例: /,/settings,/agents
 *   --plan <json>             JSON撮影計画ファイルパス（一括撮影用）
 *                             例: outputs/phase-11/screenshot-plan.json
 *   --selector <css>          要素単位キャプチャ用CSSセレクタ
 *                             例: [data-testid='my-component']
 *   --action <type>           インタラクション種別（click/hover/focus）
 *   --action-target <css>     インタラクション対象のCSSセレクタ
 *   --tc-prefix <prefix>      テストケースIDプレフィックス（デフォルト: TC）
 *   --state <state>           撮影状態ラベル（デフォルト: after）
 *                             before / after / error / modal-open / etc.
 *   --fullpage                フルページスクリーンショット
 *   --dark                    ダークモードで撮影（prefers-color-scheme: dark）
 *   --viewport <WxH>          ビューポートサイズ（デフォルト: 1280x720）
 *   --wait <ms>               ページロード後の待機時間（デフォルト: 1000）
 *   --dry-run                 実行せずに出力パスのみ表示
 *   --help                    ヘルプを表示
 *
 * @examples
 *   # 基本: 現在のページをキャプチャ
 *   node capture-screenshots.js --workflow docs/30-workflows/my-feature
 *
 *   # JSON撮影計画から一括撮影
 *   node capture-screenshots.js \
 *     --workflow docs/30-workflows/my-feature \
 *     --plan outputs/phase-11/screenshot-plan.json
 *
 *   # 要素単位キャプチャ
 *   node capture-screenshots.js \
 *     --workflow docs/30-workflows/my-feature \
 *     --routes /settings \
 *     --selector "[data-testid='my-component']" \
 *     --state after
 *
 *   # インタラクション後にキャプチャ
 *   node capture-screenshots.js \
 *     --workflow docs/30-workflows/my-feature \
 *     --routes /settings \
 *     --action click --action-target "[data-testid='open-modal']" \
 *     --state modal-open
 *
 *   # ダークモード + フルページ
 *   node capture-screenshots.js \
 *     --workflow docs/30-workflows/my-feature \
 *     --routes /settings \
 *     --state after --dark --fullpage
 *
 *   # ドライラン（出力パス確認のみ）
 *   node capture-screenshots.js \
 *     --workflow docs/30-workflows/my-feature \
 *     --plan outputs/phase-11/screenshot-plan.json --dry-run
 *
 * @output
 *   <workflow>/outputs/phase-11/screenshots/TC-01-default-light.png
 *   <workflow>/outputs/phase-11/screenshots/TC-02-default-dark.png
 *   <workflow>/outputs/phase-11/screenshot-coverage.md  (plan使用時)
 */

import { execSync } from "child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "fs";
import { join, resolve } from "path";
import { createRequire } from "module";

/** 一時Playwrightスクリプトのファイル名（ESM対応のため .mjs 拡張子） */
const TMP_SCRIPT_NAME = ".capture-tmp.mjs";

/** キャプチャ結果JSONのファイル名 */
const CAPTURE_RESULTS_FILENAME = "capture-results.json";

/** カバレッジレポートのファイル名 */
const COVERAGE_REPORT_FILENAME = "screenshot-coverage.md";

// --- ヘルプ表示 ---

/**
 * ヘルプメッセージを表示する
 */
function showHelp() {
  console.log(`
Phase 11 スクリーンショット撮影スクリプト（拡張版）

Usage:
  node capture-screenshots.js --workflow <workflow-dir> [options]

Options:
  --workflow <path>         ワークフローディレクトリ（必須）
  --url <url>               キャプチャ対象URL（デフォルト: http://localhost:5173）
  --routes <routes>         キャプチャするルート（カンマ区切り）
  --plan <json>             JSON撮影計画ファイルパス（一括撮影用）
  --selector <css>          要素単位キャプチャ用CSSセレクタ
  --action <type>           インタラクション種別（click/hover/focus）
  --action-target <css>     インタラクション対象のCSSセレクタ
  --tc-prefix <prefix>      テストケースIDプレフィックス（デフォルト: TC）
  --state <state>           撮影状態ラベル（デフォルト: after）
  --fullpage                フルページスクリーンショット
  --dark                    ダークモードで撮影
  --viewport <WxH>          ビューポートサイズ（デフォルト: 1280x720）
  --wait <ms>               ページロード後の待機時間（デフォルト: 1000）
  --dry-run                 実行せずに出力パスのみ表示
  --help                    このヘルプを表示

Modes:
  1. ルートベース撮影（--routes）
  2. JSON撮影計画一括撮影（--plan）
  3. 要素単位撮影（--routes + --selector）
  4. インタラクション撮影（--routes + --action + --action-target）
`);
}

// --- 許可されたアクション種別 ---

/** --action オプションで許可されるアクション名 */
const VALID_ACTIONS = ["click", "hover", "focus"];

// --- 引数パース ---

/**
 * 値付きオプションの次の引数を安全に取得する。
 * 値が欠落している場合（配列末尾 or 次トークンが -- 始まり）はエラーを返す。
 * audit-unassigned-tasks.js の consumeValue パターンに準拠。
 * @param {string[]} argv - process.argv
 * @param {number} index - 現在のインデックス
 * @param {string} optionName - オプション名（エラーメッセージ用）
 * @returns {{ value: string|null, nextIndex: number, error: string|null }}
 */
function consumeValue(argv, index, optionName) {
  const next = argv[index + 1];
  if (next === undefined || next.startsWith("--")) {
    return {
      value: null,
      nextIndex: index,
      error: `${optionName} requires a value`,
    };
  }
  return { value: next, nextIndex: index + 1, error: null };
}

/**
 * コマンドライン引数をパースして設定オブジェクトを返す
 * @param {string[]} argv - process.argv
 * @returns {object} パースされた引数オブジェクト
 */
function parseArgs(argv) {
  const args = {
    workflow: null,
    url: "http://localhost:5173",
    routes: ["/"],
    plan: null,
    selector: null,
    action: null,
    actionTarget: null,
    tcPrefix: "TC",
    state: "after",
    fullpage: false,
    dark: false,
    viewport: { width: 1280, height: 720 },
    wait: 1000,
    dryRun: false,
    help: false,
  };

  const errors = [];

  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--workflow": {
        const r = consumeValue(argv, i, "--workflow");
        if (r.error) {
          errors.push(r.error);
        } else {
          args.workflow = r.value;
        }
        i = r.nextIndex;
        break;
      }
      case "--url": {
        const r = consumeValue(argv, i, "--url");
        if (r.error) {
          errors.push(r.error);
        } else {
          args.url = r.value;
        }
        i = r.nextIndex;
        break;
      }
      case "--routes": {
        const r = consumeValue(argv, i, "--routes");
        if (r.error) {
          errors.push(r.error);
        } else {
          args.routes = r.value.split(",").map((s) => s.trim()).filter(Boolean);
        }
        i = r.nextIndex;
        break;
      }
      case "--plan": {
        const r = consumeValue(argv, i, "--plan");
        if (r.error) {
          errors.push(r.error);
        } else {
          args.plan = r.value;
        }
        i = r.nextIndex;
        break;
      }
      case "--selector": {
        const r = consumeValue(argv, i, "--selector");
        if (r.error) {
          errors.push(r.error);
        } else {
          args.selector = r.value;
        }
        i = r.nextIndex;
        break;
      }
      case "--action": {
        const r = consumeValue(argv, i, "--action");
        if (r.error) {
          errors.push(r.error);
        } else if (!VALID_ACTIONS.includes(r.value)) {
          errors.push(
            `--action must be one of: ${VALID_ACTIONS.join(", ")} (got: ${r.value})`
          );
        } else {
          args.action = r.value;
        }
        i = r.nextIndex;
        break;
      }
      case "--action-target": {
        const r = consumeValue(argv, i, "--action-target");
        if (r.error) {
          errors.push(r.error);
        } else {
          args.actionTarget = r.value;
        }
        i = r.nextIndex;
        break;
      }
      case "--tc-prefix": {
        const r = consumeValue(argv, i, "--tc-prefix");
        if (r.error) {
          errors.push(r.error);
        } else {
          args.tcPrefix = r.value;
        }
        i = r.nextIndex;
        break;
      }
      case "--state": {
        const r = consumeValue(argv, i, "--state");
        if (r.error) {
          errors.push(r.error);
        } else {
          args.state = r.value;
        }
        i = r.nextIndex;
        break;
      }
      case "--fullpage":
        args.fullpage = true;
        break;
      case "--dark":
        args.dark = true;
        break;
      case "--viewport": {
        const r = consumeValue(argv, i, "--viewport");
        if (r.error) {
          errors.push(r.error);
        } else {
          const parts = r.value.split("x").map(Number);
          const w = parts[0];
          const h = parts[1];
          if (parts.length !== 2 || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
            errors.push(
              `--viewport must be in WxH format with positive integers (got: ${r.value})`
            );
          } else {
            args.viewport = { width: w, height: h };
          }
        }
        i = r.nextIndex;
        break;
      }
      case "--wait": {
        const r = consumeValue(argv, i, "--wait");
        if (r.error) {
          errors.push(r.error);
        } else {
          const ms = parseInt(r.value, 10);
          if (isNaN(ms) || ms < 0) {
            errors.push(
              `--wait must be a non-negative integer in milliseconds (got: ${r.value})`
            );
          } else {
            args.wait = ms;
          }
        }
        i = r.nextIndex;
        break;
      }
      case "--dry-run":
        args.dryRun = true;
        break;
      default:
        errors.push(`Unknown option: ${argv[i]}`);
    }
  }

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (errors.length > 0) {
    for (const err of errors) {
      console.error(`Error: ${err}`);
    }
    process.exit(1);
  }

  if (!args.workflow) {
    console.error("Error: --workflow is required");
    console.error(
      "Usage: node capture-screenshots.js --workflow <workflow-dir> [options]"
    );
    console.error("Run with --help for full options.");
    process.exit(1);
  }

  // --action と --action-target は両方指定するか、両方省略する
  if (args.action && !args.actionTarget) {
    console.error("Error: --action-target is required when --action is specified");
    process.exit(1);
  }
  if (!args.action && args.actionTarget) {
    console.error("Error: --action is required when --action-target is specified");
    process.exit(1);
  }

  return args;
}

// --- JSON撮影計画の読み込み ---

/**
 * JSON撮影計画ファイルを読み込み、パースし、最低限のスキーマを検証する。
 * @param {object} args - パースされた引数オブジェクト
 * @returns {object} 撮影計画データ
 */
function loadPlan(args) {
  const planPath = resolve(args.workflow, args.plan);
  if (!existsSync(planPath)) {
    console.error(`Error: Plan file not found: ${planPath}`);
    process.exit(1);
  }

  let plan;
  try {
    const raw = readFileSync(planPath, "utf-8");
    plan = JSON.parse(raw);
  } catch (err) {
    console.error(`Error: Failed to parse plan file: ${err.message}`);
    process.exit(1);
  }

  // 最低限のスキーマ検証
  if (plan === null || typeof plan !== "object" || Array.isArray(plan)) {
    console.error("Error: Plan file must contain a JSON object at the top level");
    process.exit(1);
  }
  if (!Array.isArray(plan.components)) {
    console.error(
      'Error: Plan file must contain a "components" array (found: ' +
        typeof plan.components +
        ")"
    );
    process.exit(1);
  }
  for (let ci = 0; ci < plan.components.length; ci++) {
    const comp = plan.components[ci];
    if (!comp.name || typeof comp.name !== "string") {
      console.error(
        `Error: components[${ci}].name must be a non-empty string`
      );
      process.exit(1);
    }
    if (!Array.isArray(comp.states)) {
      console.error(
        `Error: components[${ci}].states must be an array`
      );
      process.exit(1);
    }
    for (let si = 0; si < comp.states.length; si++) {
      const state = comp.states[si];
      if (!state.id || typeof state.id !== "string") {
        console.error(
          `Error: components[${ci}].states[${si}].id must be a non-empty string`
        );
        process.exit(1);
      }
      if (!state.label || typeof state.label !== "string") {
        console.error(
          `Error: components[${ci}].states[${si}].label must be a non-empty string`
        );
        process.exit(1);
      }
      if (
        state.action !== undefined &&
        !VALID_ACTIONS.includes(state.action)
      ) {
        console.error(
          `Error: components[${ci}].states[${si}].action must be one of: ${VALID_ACTIONS.join(", ")} (got: ${state.action})`
        );
        process.exit(1);
      }
    }
  }

  return plan;
}

// --- 撮影計画からスクリーンショット一覧を生成 ---

/**
 * JSON撮影計画からスクリーンショット定義一覧を生成する。
 * テーマごとにグループ化してコンテキスト切替を最小化する。
 * @param {object} plan - 撮影計画データ
 * @param {string} outputDir - 出力ディレクトリパス
 * @returns {object[]} スクリーンショット定義の配列
 */
function buildScreenshotsFromPlan(plan, outputDir) {
  const screenshots = [];

  for (const component of plan.components || []) {
    for (const state of component.states || []) {
      const theme = state.theme || "light";
      const filename = `${state.id}-${state.label}-${theme}.png`;
      const filepath = join(outputDir, filename);
      screenshots.push({
        id: state.id,
        component: component.name,
        route: component.route || "/",
        label: state.label,
        theme,
        filename,
        filepath,
        action: state.action || null,
        actionTarget: state.actionTarget || null,
        waitAfterAction: state.waitAfterAction || 0,
        selector: state.selector || null,
        note: state.note || null,
      });
    }
  }

  // テーマごとにグループ化してコンテキスト切替を最小化
  screenshots.sort((a, b) => {
    if (a.theme !== b.theme) return a.theme === "light" ? -1 : 1;
    if (a.route !== b.route) return a.route.localeCompare(b.route);
    return 0;
  });

  return screenshots;
}

// --- ルートベース撮影のスクリーンショット一覧を生成 ---

/**
 * ルートベースモードのスクリーンショット定義一覧を生成する
 * @param {object} args - パースされた引数オブジェクト
 * @param {string} outputDir - 出力ディレクトリパス
 * @returns {object[]} スクリーンショット定義の配列
 */
function buildScreenshotsFromRoutes(args, outputDir) {
  return args.routes.map((route, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const theme = args.dark ? "dark" : "light";
    const filename = `${args.tcPrefix}-${num}-${args.state}-${theme}.png`;
    const filepath = join(outputDir, filename);
    return {
      id: `${args.tcPrefix}-${num}`,
      component: null,
      route,
      label: args.state,
      theme,
      filename,
      filepath,
      action: args.action || null,
      actionTarget: args.actionTarget || null,
      waitAfterAction: 0,
      selector: args.selector || null,
      note: null,
    };
  });
}

// --- Playwright スクリプト生成 ---

/**
 * Playwrightで実行する一時スクリプト（.mjs）の内容を生成する。
 * 生成されるスクリプトはESM形式で、結果JSONを指定パスに書き出す。
 * @param {object} args - パースされた引数オブジェクト
 * @param {object[]} screenshots - スクリーンショット定義の配列
 * @param {string} resultsPath - 結果JSONの出力パス（POSIX形式）
 * @returns {{ script: string, screenshots: object[] }} 生成スクリプトとスクリーンショット定義
 */
function generatePlaywrightScript(args, screenshots, resultsPath) {
  const lightScreenshots = screenshots.filter((s) => s.theme === "light");
  const darkScreenshots = screenshots.filter((s) => s.theme === "dark");

  // データをJSON文字列化（スクリプト内に埋め込むため安全にエスケープ）
  // JSON.stringify を二重適用してJavaScript文字列リテラルとして安全に埋め込む。
  // さらにバッククォートをエスケープして、テンプレートリテラル内での破壊を防止。
  const escapeForTemplate = (str) => str.replace(/`/g, "\\`").replace(/\$/g, "\\$");
  const lightData = escapeForTemplate(JSON.stringify(JSON.stringify(lightScreenshots)));
  const darkData = escapeForTemplate(JSON.stringify(JSON.stringify(darkScreenshots)));
  const safeResultsPath = escapeForTemplate(JSON.stringify(resultsPath));
  const safeBaseUrl = escapeForTemplate(JSON.stringify(args.url));

  const vw = Number(args.viewport.width);
  const vh = Number(args.viewport.height);
  const waitMs = Number(args.wait);
  const fp = Boolean(args.fullpage);

  const script = `import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function performAction(page, action, target, waitAfter) {
  if (!action || !target) return;
  try {
    const el = await page.waitForSelector(target, { timeout: 5000 });
    switch (action) {
      case 'click':
        await el.click();
        break;
      case 'hover':
        await el.hover();
        break;
      case 'focus':
        await el.focus();
        break;
      default:
        console.warn('Unknown action: ' + action);
    }
    if (waitAfter > 0) {
      await page.waitForTimeout(waitAfter);
    } else {
      await page.waitForTimeout(300);
    }
  } catch (err) {
    console.warn('Action failed (' + action + ' on ' + target + '): ' + err.message);
  }
}

async function captureScreenshots(context, screenshots, baseUrl, defaultWait, fullPage) {
  const page = await context.newPage();
  const results = [];

  let lastRoute = null;
  for (const ss of screenshots) {
    try {
      // ルートが変わった場合のみ再ナビゲーション
      if (ss.route !== lastRoute) {
        await page.goto(baseUrl + ss.route, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(defaultWait);
        lastRoute = ss.route;
      }

      // インタラクション実行
      if (ss.action && ss.actionTarget) {
        await performAction(page, ss.action, ss.actionTarget, ss.waitAfterAction);
      }

      // 要素単位 or フルページキャプチャ
      if (ss.selector) {
        try {
          const el = await page.waitForSelector(ss.selector, { timeout: 5000 });
          await el.screenshot({ path: ss.filepath });
        } catch (selectorErr) {
          console.warn('Selector not found, falling back to full page: ' + ss.selector);
          await page.screenshot({ path: ss.filepath, fullPage: fullPage });
        }
      } else {
        await page.screenshot({ path: ss.filepath, fullPage: fullPage });
      }

      console.log('OK ' + ss.id + ' ' + ss.filename + ' -> ' + ss.filepath);
      results.push({ id: ss.id, filename: ss.filename, status: 'ok' });

      // インタラクション後はルートをリセット（次回再ナビゲーション）
      if (ss.action) {
        lastRoute = null;
      }
    } catch (err) {
      console.error('NG ' + ss.id + ' ' + ss.filename + ': ' + err.message);
      results.push({ id: ss.id, filename: ss.filename, status: 'error', error: err.message });
    }
  }

  await page.close();
  return results;
}

const browser = await chromium.launch({ headless: true });
const allResults = [];

try {
  // Light mode screenshots
  const lightScreenshots = JSON.parse(${lightData});
  if (lightScreenshots.length > 0) {
    console.log('\\n--- Light Mode (' + lightScreenshots.length + ' screenshots) ---');
    const lightCtx = await browser.newContext({
      viewport: { width: ${vw}, height: ${vh} },
      colorScheme: 'light',
    });
    const lightResults = await captureScreenshots(lightCtx, lightScreenshots, ${safeBaseUrl}, ${waitMs}, ${fp});
    allResults.push(...lightResults);
    await lightCtx.close();
  }

  // Dark mode screenshots
  const darkScreenshots = JSON.parse(${darkData});
  if (darkScreenshots.length > 0) {
    console.log('\\n--- Dark Mode (' + darkScreenshots.length + ' screenshots) ---');
    const darkCtx = await browser.newContext({
      viewport: { width: ${vw}, height: ${vh} },
      colorScheme: 'dark',
    });
    const darkResults = await captureScreenshots(darkCtx, darkScreenshots, ${safeBaseUrl}, ${waitMs}, ${fp});
    allResults.push(...darkResults);
    await darkCtx.close();
  }
} finally {
  await browser.close();
}

const okCount = allResults.filter(r => r.status === 'ok').length;
const ngCount = allResults.filter(r => r.status === 'error').length;
console.log('\\nDone: ' + okCount + '/' + allResults.length + ' screenshots captured (' + ngCount + ' errors)');

// 結果JSONを保存
writeFileSync(
  ${safeResultsPath},
  JSON.stringify({ results: allResults, timestamp: new Date().toISOString() }, null, 2)
);
console.log('Results saved to: ' + ${safeResultsPath});

if (ngCount > 0) {
  process.exit(1);
}
`;

  return { script, screenshots };
}

// --- カバレッジレポート生成 ---

/**
 * 撮影結果からカバレッジレポート（Markdown）を生成する
 * @param {object} plan - 撮影計画データ
 * @param {object[]} screenshots - スクリーンショット定義の配列
 * @param {object[]} results - 撮影結果の配列
 * @param {string} outputDir - 出力ディレクトリパス
 */
function generateCoverageReport(plan, screenshots, results, outputDir) {
  const coveragePath = join(outputDir, "..", COVERAGE_REPORT_FILENAME);

  // コンポーネントカバレッジ
  const components = new Set(
    (plan.components || []).map((c) => c.name)
  );
  const capturedComponents = new Set(
    results
      .filter((r) => r.status === "ok")
      .map((r) => {
        const ss = screenshots.find((s) => s.id === r.id);
        return ss ? ss.component : null;
      })
      .filter(Boolean)
  );

  // テーマカバレッジ
  const requiredThemes = new Set(["light", "dark"]);
  const capturedThemes = new Set(
    results
      .filter((r) => r.status === "ok")
      .map((r) => {
        const ss = screenshots.find((s) => s.id === r.id);
        return ss ? ss.theme : null;
      })
      .filter(Boolean)
  );

  // 全撮影アイテム
  const totalPlanned = screenshots.length;
  const totalCaptured = results.filter((r) => r.status === "ok").length;

  const pct = (n, d) =>
    d === 0 ? "N/A" : `${Math.round((n / d) * 100)}%`;

  const report = [
    "# 画面カバレッジレポート",
    "",
    `> 生成日時: ${new Date().toISOString()}`,
    `> タスクID: ${plan.taskId || "N/A"}`,
    "",
    "## カバレッジサマリー",
    "",
    "| カバレッジ種別 | 対象数 | 撮影数 | カバレッジ率 | 基準 |",
    "|--------------|-------|-------|------------|------|",
    `| コンポーネントカバレッジ | ${components.size} | ${capturedComponents.size} | ${pct(capturedComponents.size, components.size)} | **100%必須** |`,
    `| テーマカバレッジ | ${requiredThemes.size} | ${capturedThemes.size} | ${pct(capturedThemes.size, requiredThemes.size)} | **100%必須** |`,
    `| **総合カバレッジ** | **${totalPlanned}** | **${totalCaptured}** | **${pct(totalCaptured, totalPlanned)}** | **100%必須** |`,
    "",
    "## 撮影結果詳細",
    "",
    "| TC-ID | コンポーネント | 状態 | テーマ | ファイル名 | 結果 |",
    "|-------|--------------|------|--------|-----------|------|",
  ];

  for (const ss of screenshots) {
    const result = results.find((r) => r.id === ss.id);
    const status = result
      ? result.status === "ok"
        ? "OK"
        : "NG"
      : "未実行";
    report.push(
      `| ${ss.id} | ${ss.component || "-"} | ${ss.label} | ${ss.theme} | \`${ss.filename}\` | ${status} |`
    );
  }

  report.push("");

  // エラー詳細
  const errors = results.filter((r) => r.status === "error");
  if (errors.length > 0) {
    report.push("## エラー詳細");
    report.push("");
    for (const err of errors) {
      report.push(`- **${err.id}** (${err.filename}): ${err.error}`);
    }
    report.push("");
  }

  writeFileSync(coveragePath, report.join("\n"));
  console.log(`\nCoverage report saved to: ${coveragePath}`);
}

// --- ドライラン表示 ---

/**
 * ドライランモードで出力パスを表示する（実際の撮影は行わない）
 * @param {object} args - パースされた引数オブジェクト
 * @param {object[]} screenshots - スクリーンショット定義の配列
 * @param {string} outputDir - 出力ディレクトリパス
 */
function dryRun(args, screenshots, outputDir) {
  console.log("=== Dry Run ===");
  console.log(`Output directory: ${outputDir}`);
  console.log(`Base URL: ${args.url}`);
  console.log(`Mode: ${args.plan ? "Plan-based" : "Route-based"}`);
  if (args.plan) {
    console.log(`Plan file: ${args.plan}`);
  }
  console.log(
    `Viewport: ${args.viewport.width}x${args.viewport.height}`
  );
  console.log(`Total screenshots: ${screenshots.length}`);

  const lightCount = screenshots.filter((s) => s.theme === "light").length;
  const darkCount = screenshots.filter((s) => s.theme === "dark").length;
  console.log(`  Light mode: ${lightCount}`);
  console.log(`  Dark mode: ${darkCount}`);

  console.log("\nFiles that would be created:");
  for (const ss of screenshots) {
    const extra = [];
    if (ss.action) extra.push(`action=${ss.action}`);
    if (ss.selector) extra.push(`selector=${ss.selector}`);
    if (ss.note) extra.push(`note=${ss.note}`);
    const suffix = extra.length > 0 ? `  (${extra.join(", ")})` : "";
    console.log(
      `  ${ss.filepath}  [${ss.theme}] ${ss.route}${suffix}`
    );
  }
}

// --- Playwright 存在確認 ---

/**
 * Playwright がインストールされているか確認する。
 * ESM 環境では require.resolve が使えないため createRequire を利用する。
 * @returns {boolean} Playwright が利用可能かどうか
 */
function isPlaywrightAvailable() {
  try {
    const require = createRequire(import.meta.url);
    require.resolve("playwright");
    return true;
  } catch {
    return false;
  }
}

// --- メイン ---

/**
 * メインエントリーポイント。
 * 引数をパースし、撮影計画の構築・Playwrightスクリプト生成・実行を行う。
 */
function main() {
  const args = parseArgs(process.argv);

  // ワークフローディレクトリの存在確認
  if (!existsSync(args.workflow)) {
    console.error(`Error: Workflow directory not found: ${resolve(args.workflow)}`);
    process.exit(1);
  }

  // 出力ディレクトリ
  const outputDir = resolve(
    args.workflow,
    "outputs",
    "phase-11",
    "screenshots"
  );

  let screenshots;
  let plan = null;

  if (args.plan) {
    // JSON撮影計画モード
    plan = loadPlan(args);
    screenshots = buildScreenshotsFromPlan(plan, outputDir);
  } else {
    // ルートベースモード
    screenshots = buildScreenshotsFromRoutes(args, outputDir);
  }

  if (screenshots.length === 0) {
    console.log("No screenshots to capture.");
    return;
  }

  if (args.dryRun) {
    dryRun(args, screenshots, outputDir);
    return;
  }

  // Playwright がインストールされているか確認
  if (!isPlaywrightAvailable()) {
    console.error("Error: playwright is not installed.");
    console.error("Run: pnpm add -D playwright && pnpm exec playwright install chromium");
    process.exit(1);
  }

  // 出力ディレクトリ作成
  mkdirSync(outputDir, { recursive: true });

  // 結果JSONのパス（POSIX形式に正規化してクロスプラットフォーム対応）
  const resultsPath = join(outputDir, CAPTURE_RESULTS_FILENAME).replace(
    /\\/g,
    "/"
  );

  // Playwright スクリプトを生成・実行
  const { script } = generatePlaywrightScript(args, screenshots, resultsPath);
  const tmpScript = join(outputDir, TMP_SCRIPT_NAME);

  try {
    writeFileSync(tmpScript, script);
    console.log(`Capturing screenshots to: ${outputDir}`);
    console.log(`Base URL: ${args.url}`);
    console.log(`Mode: ${args.plan ? "Plan-based" : "Route-based"}`);
    console.log(`Total: ${screenshots.length} screenshots`);
    console.log(
      `Viewport: ${args.viewport.width}x${args.viewport.height}`
    );
    console.log("");

    execSync(`node "${tmpScript}"`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    // 撮影計画モードの場合、カバレッジレポートを生成
    if (plan) {
      const resultsFilePath = join(outputDir, CAPTURE_RESULTS_FILENAME);
      if (existsSync(resultsFilePath)) {
        try {
          const resultsData = JSON.parse(
            readFileSync(resultsFilePath, "utf-8")
          );
          generateCoverageReport(
            plan,
            screenshots,
            resultsData.results || [],
            outputDir
          );
        } catch (err) {
          console.warn(
            `Warning: Could not generate coverage report: ${err.message}`
          );
        }
      }
    }
  } catch (err) {
    console.error("Screenshot capture failed:", err.message);

    // 撮影不可時の代替: NOTE.txt を生成
    const noteFile = join(outputDir, "NOTE.txt");
    writeFileSync(
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
    if (existsSync(tmpScript)) {
      unlinkSync(tmpScript);
    }
  }
}

main();
