#!/usr/bin/env node

/**
 * 可観測性設定検証スクリプト
 *
 * ファイル監視システムの可観測性設定（Prometheus/Grafana）を検証します。
 *
 * 使用例:
 *   node scripts/validate-observability.mjs --config prometheus.yml
 *   node scripts/validate-observability.mjs --dashboard dashboard.json
 *   node scripts/validate-observability.mjs --metrics-collector metrics.ts
 *
 * 終了コード:
 *   0: 成功
 *   1: 一般エラー
 *   2: 引数エラー
 *   3: ファイル不在
 *   4: 検証失敗
 */

import { readFileSync, existsSync } from "fs";
import { extname } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
可観測性設定検証スクリプト

Usage:
  node scripts/validate-observability.mjs [options] <file>

Options:
  --config       Prometheus設定ファイル（YAML）を検証
  --dashboard    Grafanaダッシュボード（JSON）を検証
  --metrics      メトリクスコレクター（TypeScript）を検証
  --all          すべてのデフォルトファイルを検証
  -h, --help     このヘルプを表示

Examples:
  node scripts/validate-observability.mjs --config prometheus.yml
  node scripts/validate-observability.mjs --dashboard assets/grafana-dashboard.json
  node scripts/validate-observability.mjs --all
  `);
}

// 必須メトリクス名（ファイル監視システム用）
const REQUIRED_METRICS = [
  "file_watcher_events_total",
  "file_watcher_event_latency_seconds",
  "file_watcher_errors_total",
  "file_watcher_queue_length",
];

// Grafanaダッシュボードの必須パネル
const REQUIRED_PANELS = ["latency", "throughput", "error", "queue"];

function validatePrometheusConfig(content) {
  const errors = [];

  // scrape_configsの存在確認
  if (!content.includes("scrape_configs")) {
    errors.push("scrape_configs セクションが見つかりません");
  }

  // job_nameの確認
  if (!content.includes("job_name")) {
    errors.push("job_name が定義されていません");
  }

  // scrape_intervalの確認
  if (content.includes("scrape_interval")) {
    const match = content.match(/scrape_interval:\s*(\d+)s/);
    if (match && parseInt(match[1]) < 15) {
      errors.push(
        `scrape_interval が15秒未満です（${match[1]}s）。負荷が高くなる可能性があります`,
      );
    }
  }

  return errors;
}

function validateGrafanaDashboard(content) {
  const errors = [];

  try {
    const dashboard = JSON.parse(content);

    // パネルの存在確認
    if (!dashboard.panels || !Array.isArray(dashboard.panels)) {
      errors.push("panels 配列が見つかりません");
      return errors;
    }

    // 必須パネルの確認
    const panelTitles = dashboard.panels.map((p) =>
      (p.title || "").toLowerCase(),
    );
    for (const required of REQUIRED_PANELS) {
      const found = panelTitles.some((title) => title.includes(required));
      if (!found) {
        errors.push(`${required} に関するパネルが見つかりません`);
      }
    }

    // データソースの確認
    const hasPrometheusDS = dashboard.panels.some((p) =>
      JSON.stringify(p).includes("prometheus"),
    );
    if (!hasPrometheusDS) {
      errors.push("Prometheusデータソースが設定されていません");
    }
  } catch (e) {
    errors.push(`JSON解析エラー: ${e.message}`);
  }

  return errors;
}

function validateMetricsCollector(content) {
  const errors = [];

  // 必須メトリクスの定義確認
  for (const metric of REQUIRED_METRICS) {
    if (!content.includes(metric)) {
      errors.push(`必須メトリクス ${metric} が定義されていません`);
    }
  }

  // Counter/Gauge/Histogramの使用確認
  const metricTypes = ["Counter", "Gauge", "Histogram"];
  for (const type of metricTypes) {
    if (!content.includes(type)) {
      errors.push(`${type} タイプのメトリクスが見つかりません`);
    }
  }

  // エクスポートの確認
  if (!content.includes("export") && !content.includes("module.exports")) {
    errors.push("メトリクスがエクスポートされていません");
  }

  return errors;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  if (args.length === 0) {
    console.error("Error: オプションまたはファイルパスを指定してください");
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  let allErrors = [];

  // --all オプション
  if (args.includes("--all")) {
    const defaultFiles = [
      { path: "assets/grafana-dashboard.json", type: "dashboard" },
      { path: "assets/metrics-collector.ts", type: "metrics" },
    ];

    for (const file of defaultFiles) {
      if (existsSync(file.path)) {
        const content = readFileSync(file.path, "utf-8");
        let errors = [];

        if (file.type === "dashboard") {
          errors = validateGrafanaDashboard(content);
        } else if (file.type === "metrics") {
          errors = validateMetricsCollector(content);
        }

        if (errors.length > 0) {
          console.log(`\n✗ ${file.path}:`);
          errors.forEach((e) => console.log(`  - ${e}`));
          allErrors.push(...errors);
        } else {
          console.log(`✓ ${file.path}: 検証成功`);
        }
      } else {
        console.log(`⚠ ${file.path}: ファイルが見つかりません（スキップ）`);
      }
    }
  } else {
    // 個別ファイル検証
    const filePath = args.find((a) => !a.startsWith("-"));
    if (!filePath) {
      console.error("Error: ファイルパスを指定してください");
      process.exit(EXIT_ARGS_ERROR);
    }

    if (!existsSync(filePath)) {
      console.error(`Error: ファイルが見つかりません: ${filePath}`);
      process.exit(EXIT_FILE_MISSING);
    }

    const content = readFileSync(filePath, "utf-8");
    let errors = [];

    if (args.includes("--config")) {
      errors = validatePrometheusConfig(content);
    } else if (args.includes("--dashboard")) {
      errors = validateGrafanaDashboard(content);
    } else if (args.includes("--metrics")) {
      errors = validateMetricsCollector(content);
    } else {
      // 拡張子から自動判定
      const ext = extname(filePath);
      if (ext === ".json") {
        errors = validateGrafanaDashboard(content);
      } else if (ext === ".ts" || ext === ".js") {
        errors = validateMetricsCollector(content);
      } else if (ext === ".yml" || ext === ".yaml") {
        errors = validatePrometheusConfig(content);
      } else {
        console.error(
          "Error: ファイルタイプを判定できません。--config/--dashboard/--metrics を指定してください",
        );
        process.exit(EXIT_ARGS_ERROR);
      }
    }

    if (errors.length > 0) {
      console.log(`✗ 検証失敗 (${errors.length}件のエラー):`);
      errors.forEach((e) => console.log(`  - ${e}`));
      allErrors = errors;
    } else {
      console.log(`✓ ${filePath}: 検証成功`);
    }
  }

  if (allErrors.length > 0) {
    process.exit(EXIT_VALIDATION_ERROR);
  }

  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
