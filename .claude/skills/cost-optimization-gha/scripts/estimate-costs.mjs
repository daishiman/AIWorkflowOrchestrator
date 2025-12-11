#!/usr/bin/env node

/**
 * GitHub Actions ワークフローのコスト見積もりツール
 *
 * 使用方法:
 *   node estimate-costs.mjs <workflow.yaml>
 *   node estimate-costs.mjs .github/workflows/ci.yml
 *
 * 機能:
 * - ランナータイプ別のコスト計算
 * - 実行時間の見積もり
 * - 月間コストの予測
 * - 最適化提案
 */

import { readFileSync } from "fs";
import { parse } from "yaml";

// ランナーコスト (USD/分)
const RUNNER_COSTS = {
  "ubuntu-latest": 0.008,
  "ubuntu-latest-4-cores": 0.016,
  "ubuntu-latest-8-cores": 0.032,
  "ubuntu-latest-16-cores": 0.064,
  "windows-latest": 0.016,
  "windows-latest-8-cores": 0.032,
  "macos-13": 0.08,
  "macos-latest": 0.08,
  "macos-14": 0.16,
  "macos-14-large": 0.16,
  "self-hosted": 0.0,
};

// ステップタイプ別の平均実行時間 (分)
const STEP_DURATIONS = {
  "actions/checkout": 0.5,
  "actions/setup-node": 0.5,
  "actions/cache": 0.2,
  "actions/upload-artifact": 1.0,
  "actions/download-artifact": 0.5,
  "pnpm ci": 2.0,
  "pnpm install": 3.0,
  "pnpm run build": 5.0,
  "pnpm test": 3.0,
  "pnpm run lint": 1.0,
  "docker build": 10.0,
  default: 1.0,
};

class CostEstimator {
  constructor(workflowPath) {
    this.workflowPath = workflowPath;
    this.workflow = null;
    this.estimates = [];
  }

  /**
   * ワークフローファイルを読み込み
   */
  loadWorkflow() {
    try {
      const content = readFileSync(this.workflowPath, "utf8");
      this.workflow = parse(content);
      return true;
    } catch (error) {
      console.error(`❌ Error loading workflow: ${error.message}`);
      return false;
    }
  }

  /**
   * ステップの実行時間を推定
   */
  estimateStepDuration(step) {
    if (step.uses) {
      const action = step.uses.split("@")[0];
      return STEP_DURATIONS[action] || STEP_DURATIONS.default;
    }

    if (step.run) {
      const command = step.run.trim().split("\n")[0];
      for (const [key, duration] of Object.entries(STEP_DURATIONS)) {
        if (command.includes(key)) {
          return duration;
        }
      }
    }

    return STEP_DURATIONS.default;
  }

  /**
   * ジョブの実行時間を推定
   */
  estimateJobDuration(job) {
    if (!job.steps) return 0;

    let totalDuration = 0;
    for (const step of job.steps) {
      totalDuration += this.estimateStepDuration(step);
    }

    return totalDuration;
  }

  /**
   * マトリックス数を計算
   */
  calculateMatrixCount(strategy) {
    if (!strategy || !strategy.matrix) return 1;

    let count = 1;
    for (const [key, values] of Object.entries(strategy.matrix)) {
      if (Array.isArray(values)) {
        count *= values.length;
      }
    }

    return count;
  }

  /**
   * ジョブのコストを計算
   */
  estimateJobCost(jobName, job) {
    const runnerType = job["runs-on"] || "ubuntu-latest";
    const costPerMinute =
      RUNNER_COSTS[runnerType] || RUNNER_COSTS["ubuntu-latest"];
    const duration = this.estimateJobDuration(job);
    const matrixCount = this.calculateMatrixCount(job.strategy);

    const totalDuration = duration * matrixCount;
    const cost = totalDuration * costPerMinute;

    return {
      jobName,
      runnerType,
      costPerMinute,
      duration,
      matrixCount,
      totalDuration,
      cost,
    };
  }

  /**
   * ワークフロー全体のコストを計算
   */
  estimateWorkflowCost() {
    if (!this.workflow.jobs) {
      console.error("❌ No jobs found in workflow");
      return;
    }

    console.log("\n📊 Workflow Cost Estimation\n");
    console.log(`Workflow: ${this.workflow.name || "Unnamed"}\n`);

    let totalCost = 0;
    let totalDuration = 0;

    for (const [jobName, job] of Object.entries(this.workflow.jobs)) {
      const estimate = this.estimateJobCost(jobName, job);
      this.estimates.push(estimate);

      totalCost += estimate.cost;
      totalDuration += estimate.totalDuration;

      console.log(`Job: ${estimate.jobName}`);
      console.log(`  Runner: ${estimate.runnerType}`);
      console.log(`  Duration: ${estimate.duration.toFixed(1)} min`);
      if (estimate.matrixCount > 1) {
        console.log(`  Matrix: ${estimate.matrixCount} jobs`);
        console.log(
          `  Total Duration: ${estimate.totalDuration.toFixed(1)} min`,
        );
      }
      console.log(`  Cost: $${estimate.cost.toFixed(4)}`);
      console.log("");
    }

    console.log("─".repeat(50));
    console.log(`Total Duration: ${totalDuration.toFixed(1)} minutes`);
    console.log(`Total Cost per run: $${totalCost.toFixed(4)}`);
    console.log("");

    this.estimateMonthlyCost(totalCost);
    this.provideOptimizationSuggestions();
  }

  /**
   * 月間コストを見積もり
   */
  estimateMonthlyCost(costPerRun) {
    console.log("📅 Monthly Cost Estimates:\n");

    const scenarios = [
      { name: "Low frequency (5 runs/day)", runsPerDay: 5 },
      { name: "Medium frequency (20 runs/day)", runsPerDay: 20 },
      { name: "High frequency (50 runs/day)", runsPerDay: 50 },
      { name: "Very high frequency (100 runs/day)", runsPerDay: 100 },
    ];

    for (const scenario of scenarios) {
      const monthlyCost = costPerRun * scenario.runsPerDay * 30;
      console.log(`  ${scenario.name}: $${monthlyCost.toFixed(2)}/month`);
    }
    console.log("");
  }

  /**
   * 最適化提案を生成
   */
  provideOptimizationSuggestions() {
    console.log("💡 Optimization Suggestions:\n");

    const suggestions = [];

    // macOS ランナーのチェック
    const macosJobs = this.estimates.filter((e) =>
      e.runnerType.includes("macos"),
    );
    if (macosJobs.length > 0) {
      const macOsCost = macosJobs.reduce((sum, e) => sum + e.cost, 0);
      const potentialSavings = macOsCost * 0.9; // 90% 削減可能
      suggestions.push({
        priority: "🔴",
        title: "Replace macOS runners with Linux where possible",
        impact: `Potential savings: $${potentialSavings.toFixed(4)} per run`,
        details: `${macosJobs.length} job(s) using macOS (10-20x more expensive than Linux)`,
      });
    }

    // Windows ランナーのチェック
    const windowsJobs = this.estimates.filter((e) =>
      e.runnerType.includes("windows"),
    );
    if (windowsJobs.length > 0) {
      const windowsCost = windowsJobs.reduce((sum, e) => sum + e.cost, 0);
      const potentialSavings = windowsCost * 0.5; // 50% 削減可能
      suggestions.push({
        priority: "🟡",
        title:
          "Consider Linux for Windows jobs if platform-specific features not needed",
        impact: `Potential savings: $${potentialSavings.toFixed(4)} per run`,
        details: `${windowsJobs.length} job(s) using Windows (2x more expensive than Linux)`,
      });
    }

    // 長時間実行ジョブのチェック
    const longJobs = this.estimates.filter((e) => e.totalDuration > 10);
    if (longJobs.length > 0) {
      suggestions.push({
        priority: "🟡",
        title: "Optimize long-running jobs with caching",
        impact: "Potential 40-70% time reduction",
        details: `${longJobs.length} job(s) running over 10 minutes`,
      });
    }

    // マトリックスビルドのチェック
    const matrixJobs = this.estimates.filter((e) => e.matrixCount > 1);
    if (matrixJobs.length > 0) {
      suggestions.push({
        priority: "🟢",
        title: "Review matrix strategy for unnecessary combinations",
        impact: "Reduce redundant builds",
        details: `${matrixJobs.length} job(s) using matrix strategy`,
      });
    }

    // キャッシングのチェック
    const hasCache =
      this.workflow.jobs &&
      Object.values(this.workflow.jobs).some((job) =>
        job.steps?.some((step) => step.uses?.includes("actions/cache")),
      );
    if (!hasCache) {
      suggestions.push({
        priority: "🔴",
        title: "Add dependency caching",
        impact: "Potential 40-70% time reduction",
        details: "No cache steps detected in workflow",
      });
    }

    // 提案を表示
    if (suggestions.length === 0) {
      console.log("  ✅ Workflow appears well-optimized!\n");
    } else {
      suggestions.sort((a, b) => {
        const priorities = { "🔴": 0, "🟡": 1, "🟢": 2 };
        return priorities[a.priority] - priorities[b.priority];
      });

      for (const suggestion of suggestions) {
        console.log(`  ${suggestion.priority} ${suggestion.title}`);
        console.log(`     Impact: ${suggestion.impact}`);
        console.log(`     Details: ${suggestion.details}\n`);
      }
    }

    this.calculateOptimizedCost();
  }

  /**
   * 最適化後のコストを計算
   */
  calculateOptimizedCost() {
    const currentCost = this.estimates.reduce((sum, e) => sum + e.cost, 0);

    // 最適化による削減率を推定
    let optimizationFactor = 1.0;

    // macOS → Linux: 90% 削減
    const macosRatio =
      this.estimates.filter((e) => e.runnerType.includes("macos")).length /
      this.estimates.length;
    optimizationFactor -= macosRatio * 0.9;

    // キャッシング: 50% 削減
    const hasCache =
      this.workflow.jobs &&
      Object.values(this.workflow.jobs).some((job) =>
        job.steps?.some((step) => step.uses?.includes("actions/cache")),
      );
    if (!hasCache) {
      optimizationFactor *= 0.5;
    }

    const optimizedCost = currentCost * optimizationFactor;
    const savings = currentCost - optimizedCost;
    const savingsPercent = (savings / currentCost) * 100;

    if (savings > 0) {
      console.log("💰 Potential Cost Savings:\n");
      console.log(`  Current cost: $${currentCost.toFixed(4)} per run`);
      console.log(`  Optimized cost: $${optimizedCost.toFixed(4)} per run`);
      console.log(
        `  Savings: $${savings.toFixed(4)} (${savingsPercent.toFixed(0)}%)\n`,
      );

      console.log("  Monthly savings (20 runs/day):");
      console.log(`    Current: $${(currentCost * 20 * 30).toFixed(2)}/month`);
      console.log(
        `    Optimized: $${(optimizedCost * 20 * 30).toFixed(2)}/month`,
      );
      console.log(`    Savings: $${(savings * 20 * 30).toFixed(2)}/month\n`);
    }
  }

  /**
   * メイン実行
   */
  run() {
    if (!this.loadWorkflow()) {
      process.exit(1);
    }

    this.estimateWorkflowCost();
  }
}

// スクリプト実行
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node estimate-costs.mjs <workflow.yaml>");
  console.error("Example: node estimate-costs.mjs .github/workflows/ci.yml");
  process.exit(1);
}

const estimator = new CostEstimator(args[0]);
estimator.run();
