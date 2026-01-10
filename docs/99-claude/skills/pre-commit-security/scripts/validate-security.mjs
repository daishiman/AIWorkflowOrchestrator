#!/usr/bin/env node
/**
 * Pre-commit Hook検証スクリプト
 * hookの動作確認と検出精度を測定する
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../../..");

// コマンドライン引数解析
const args = process.argv.slice(2);
const testMode = args.includes("--test-mode");
const verbose = args.includes("--verbose");

console.log("🔐 Pre-commit Hook Validation");
console.log("==============================");
console.log(`Mode: ${testMode ? "Test" : "Validation"}`);
console.log(`Verbose: ${verbose}\n`);

// テストケース
const testCases = {
  truePositive: [
    {
      desc: "OpenAI API Key",
      content:
        'OPENAI_API_KEY="sk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEF"',
    },
    {
      desc: "Anthropic API Key",
      content:
        'ANTHROPIC_KEY="sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTU"',
    },
    {
      desc: "AWS Access Key",
      content: "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE",
    },
    {
      desc: "Generic Password",
      content: 'password="MySecretPassword123!"',
    },
  ],
  trueNegative: [
    { desc: "Example Key", content: 'API_KEY="example"' },
    { desc: "Sample Key", content: 'API_KEY="sample"' },
    { desc: "Test Key", content: 'API_KEY="test"' },
    { desc: "Mock Key", content: 'API_KEY="mock"' },
  ],
};

async function checkToolAvailability() {
  console.log("🔧 Checking tool availability...\n");

  const tools = {
    "git-secrets": "git-secrets",
    gitleaks: "gitleaks",
  };

  const available = {};

  for (const [name, cmd] of Object.entries(tools)) {
    try {
      await execAsync(`command -v ${cmd}`);
      console.log(`  ✅ ${name} is available`);
      available[name] = true;
    } catch {
      console.log(`  ❌ ${name} is not available`);
      available[name] = false;
    }
  }

  console.log("");
  return available;
}

async function testTruePositive(tool, testCase) {
  const testFile = path.join(PROJECT_ROOT, ".security-test-tp.txt");

  try {
    // テストファイル作成
    await fs.writeFile(testFile, testCase.content);

    // スキャン実行
    let detected = false;
    try {
      if (tool === "git-secrets") {
        await execAsync(
          `cd "${PROJECT_ROOT}" && git secrets --scan ${testFile}`,
        );
      } else if (tool === "gitleaks") {
        await execAsync(
          `cd "${PROJECT_ROOT}" && gitleaks detect --source ${testFile} --verbose --no-git`,
        );
      }
    } catch (error) {
      // エラー（検出）が期待される
      detected = true;
    }

    // クリーンアップ
    await fs.unlink(testFile);

    return {
      success: detected,
      expected: true,
      actual: detected,
      desc: testCase.desc,
    };
  } catch (error) {
    // クリーンアップ（エラー時）
    try {
      await fs.unlink(testFile);
    } catch {}

    return {
      success: false,
      expected: true,
      actual: false,
      desc: testCase.desc,
      error: error.message,
    };
  }
}

async function testTrueNegative(tool, testCase) {
  const testFile = path.join(PROJECT_ROOT, ".security-test-tn.txt");

  try {
    // テストファイル作成
    await fs.writeFile(testFile, testCase.content);

    // スキャン実行
    let detected = false;
    try {
      if (tool === "git-secrets") {
        await execAsync(
          `cd "${PROJECT_ROOT}" && git secrets --scan ${testFile}`,
        );
      } else if (tool === "gitleaks") {
        await execAsync(
          `cd "${PROJECT_ROOT}" && gitleaks detect --source ${testFile} --verbose --no-git`,
        );
      }
    } catch (error) {
      // エラー（検出）は期待されない
      detected = true;
    }

    // クリーンアップ
    await fs.unlink(testFile);

    return {
      success: !detected,
      expected: false,
      actual: detected,
      desc: testCase.desc,
    };
  } catch (error) {
    // クリーンアップ（エラー時）
    try {
      await fs.unlink(testFile);
    } catch {}

    return {
      success: false,
      expected: false,
      actual: true,
      desc: testCase.desc,
      error: error.message,
    };
  }
}

async function runTestMode(available) {
  console.log("🧪 Running Test Mode...\n");

  const tools = Object.keys(available).filter((tool) => available[tool]);

  if (tools.length === 0) {
    console.log("❌ No tools available for testing");
    process.exit(1);
  }

  const results = {};

  for (const tool of tools) {
    console.log(`\n📦 Testing ${tool}...`);
    results[tool] = {
      truePositive: [],
      trueNegative: [],
    };

    // True Positive テスト
    console.log("\n  True Positive Tests:");
    for (const testCase of testCases.truePositive) {
      const result = await testTruePositive(tool, testCase);
      results[tool].truePositive.push(result);

      if (result.success) {
        console.log(`    ✅ ${result.desc}`);
      } else {
        console.log(
          `    ❌ ${result.desc} - Expected detection, but not detected`,
        );
      }

      if (verbose && result.error) {
        console.log(`       Error: ${result.error}`);
      }
    }

    // True Negative テスト
    console.log("\n  True Negative Tests:");
    for (const testCase of testCases.trueNegative) {
      const result = await testTrueNegative(tool, testCase);
      results[tool].trueNegative.push(result);

      if (result.success) {
        console.log(`    ✅ ${result.desc}`);
      } else {
        console.log(
          `    ❌ ${result.desc} - Expected no detection, but detected`,
        );
      }

      if (verbose && result.error) {
        console.log(`       Error: ${result.error}`);
      }
    }
  }

  // メトリクス計算
  console.log("\n\n📊 Metrics:\n");

  for (const tool of tools) {
    const tp = results[tool].truePositive.filter((r) => r.success).length;
    const fpFromTp = results[tool].truePositive.filter(
      (r) => !r.success,
    ).length;
    const tn = results[tool].trueNegative.filter((r) => r.success).length;
    const fp = results[tool].trueNegative.filter((r) => !r.success).length;

    const totalPositive = testCases.truePositive.length;
    const totalNegative = testCases.trueNegative.length;

    const tpRate = (tp / totalPositive) * 100;
    const tnRate = (tn / totalNegative) * 100;
    const fpRate = (fp / totalNegative) * 100;
    const fnRate = (fpFromTp / totalPositive) * 100;

    console.log(`${tool}:`);
    console.log(
      `  True Positive Rate:  ${tpRate.toFixed(1)}% (${tp}/${totalPositive})`,
    );
    console.log(
      `  True Negative Rate:  ${tnRate.toFixed(1)}% (${tn}/${totalNegative})`,
    );
    console.log(
      `  False Positive Rate: ${fpRate.toFixed(1)}% (${fp}/${totalNegative})`,
    );
    console.log(
      `  False Negative Rate: ${fnRate.toFixed(1)}% (${fpFromTp}/${totalPositive})`,
    );

    // 目標値との比較
    console.log("\n  Status:");
    if (tpRate >= 95) {
      console.log("    ✅ True Positive Rate meets target (≥95%)");
    } else {
      console.log("    ❌ True Positive Rate below target (<95%)");
    }

    if (tnRate >= 98) {
      console.log("    ✅ True Negative Rate meets target (≥98%)");
    } else {
      console.log("    ⚠️  True Negative Rate below target (<98%)");
    }

    if (fpRate <= 5) {
      console.log("    ✅ False Positive Rate meets target (≤5%)");
    } else {
      console.log("    ⚠️  False Positive Rate above target (>5%)");
    }

    if (fnRate <= 2) {
      console.log("    ✅ False Negative Rate meets target (≤2%)");
    } else {
      console.log("    ❌ False Negative Rate above target (>2%)");
    }

    console.log("");
  }
}

async function runValidationMode(available) {
  console.log("🔍 Running Validation Mode...\n");

  // Hook設定確認
  console.log("1. Checking hook configuration...");
  try {
    const { stdout: hooksPath } = await execAsync(
      `cd "${PROJECT_ROOT}" && git config core.hooksPath`,
    );
    console.log(`   ✅ Hooks path: ${hooksPath.trim()}`);

    // hook実行権限確認
    const hookPath = path.join(
      PROJECT_ROOT,
      hooksPath.trim() || ".git/hooks",
      "pre-commit",
    );
    try {
      const stats = await fs.stat(hookPath);
      if (stats.mode & 0o111) {
        console.log(`   ✅ Hook is executable`);
      } else {
        console.log(`   ❌ Hook is not executable`);
      }
    } catch {
      console.log(`   ⚠️  Hook file not found: ${hookPath}`);
    }
  } catch {
    console.log(`   ⚠️  core.hooksPath not set (using default .git/hooks)`);
  }

  // ツール設定確認
  console.log("\n2. Checking tool configuration...");
  for (const [name, isAvailable] of Object.entries(available)) {
    if (isAvailable) {
      if (name === "git-secrets") {
        try {
          const { stdout } = await execAsync(
            `cd "${PROJECT_ROOT}" && git secrets --list`,
          );
          const patterns = stdout.split("\n").filter((line) => line.trim());
          console.log(
            `   ✅ git-secrets: ${patterns.length} patterns registered`,
          );
          if (verbose) {
            patterns.forEach((p) => console.log(`      - ${p}`));
          }
        } catch {
          console.log(`   ⚠️  git-secrets: Not initialized`);
        }
      } else if (name === "gitleaks") {
        const configPath = path.join(PROJECT_ROOT, ".gitleaks.toml");
        try {
          await fs.access(configPath);
          console.log(`   ✅ gitleaks: Config file exists (.gitleaks.toml)`);
        } catch {
          console.log(`   ⚠️  gitleaks: No config file (using defaults)`);
        }
      }
    }
  }

  console.log("\n✅ Validation complete");
}

async function main() {
  try {
    const available = await checkToolAvailability();

    if (testMode) {
      await runTestMode(available);
    } else {
      await runValidationMode(available);
    }
  } catch (error) {
    console.error("\n❌ Validation failed:", error.message);
    if (verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
