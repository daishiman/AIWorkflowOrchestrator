#!/usr/bin/env node

/**
 * verify-all-specs.js
 *
 * タスク仕様書の全体整合性を自動検証するスクリプト。
 * Phase 1〜13の全13ファイルを一括検証し、検証レポートを生成する。
 *
 * 使用方法:
 *   node verify-all-specs.js --workflow <path>
 *   node verify-all-specs.js --workflow docs/30-workflows/feature-name
 *
 * オプション:
 *   --workflow <path>   ワークフローディレクトリのパス（必須）
 *   --output <path>     検証レポート出力先（デフォルト: outputs/verification-report.md）
 *   --strict            厳格モード（警告もエラーとして扱う）
 *   --json              JSON形式で結果を出力
 */

import fs from "fs";
import path from "path";

// ====== 定数定義 ======

const PHASE_COUNT = 13;
const PHASE_NAMES = {
  1: "要件定義",
  2: "設計",
  3: "設計レビューゲート",
  4: "テスト作成",
  5: "実装",
  6: "テスト拡充",
  7: "テストカバレッジ確認",
  8: "リファクタリング",
  9: "品質保証",
  10: "最終レビューゲート",
  11: "手動テスト検証",
  12: "ドキュメント更新",
  13: "PR作成",
};

const REQUIRED_SECTIONS = [
  "メタ情報",
  "目的",
  "実行タスク",
  "参照資料",
  "成果物",
  "完了条件",
];

const AMBIGUOUS_EXPRESSIONS = [
  "適切に",
  "必要に応じて",
  "など",
  "〜等",
  "適宜",
  "場合による",
  "状況に応じて",
  "できれば",
  "可能であれば",
  "必要なら",
];

const PHASE_DEPENDENCIES = {
  1: [],
  2: [1],
  3: [1, 2],
  4: [1, 2, 3],
  5: [4],
  6: [5],
  7: [5, 6],
  8: [1, 2, 5, 6, 7],
  9: [5],
  10: [1, 2, 5],
  11: [1, 2, 5, 6, 7, 8, 9, 10],
  12: [1, 2, 5, 6, 7, 8, 9, 10, 11],
  13: [1, 2, 5, 6, 7, 8, 9, 10, 11, 12],
};

// ====== ユーティリティ関数 ======

function parseArgs(args) {
  const options = {
    workflow: null,
    output: null,
    strict: false,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--workflow":
        options.workflow = args[++i];
        break;
      case "--output":
        options.output = args[++i];
        break;
      case "--strict":
        options.strict = true;
        break;
      case "--json":
        options.json = true;
        break;
    }
  }

  return options;
}

function findPhaseFiles(workflowDir) {
  const files = {};
  const pattern = /^phase-(\d+)-.*\.md$/;

  if (!fs.existsSync(workflowDir)) {
    return files;
  }

  const entries = fs.readdirSync(workflowDir);
  for (const entry of entries) {
    const match = entry.match(pattern);
    if (match) {
      const phaseNum = parseInt(match[1], 10);
      files[phaseNum] = path.join(workflowDir, entry);
    }
  }

  return files;
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function loadArtifacts(workflowDir) {
  const artifactsPath = path.join(workflowDir, "artifacts.json");
  if (!fs.existsSync(artifactsPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(artifactsPath, "utf-8"));
  } catch {
    return null;
  }
}

function collectPhaseStatuses(artifacts) {
  if (!artifacts?.phases) {
    return [];
  }

  if (Array.isArray(artifacts.phases)) {
    return artifacts.phases
      .map((phase) => String(phase?.status || "").trim())
      .filter(Boolean);
  }

  return Object.values(artifacts.phases)
    .map((phase) => String(phase?.status || "").trim())
    .filter(Boolean);
}

function isWorkflowStarted(artifacts) {
  const nonStarted = new Set(["pending", "not_started"]);
  return collectPhaseStatuses(artifacts).some(
    (status) => !nonStarted.has(status)
  );
}

// ====== 検証関数 ======

function verifyCompleteness(workflowDir) {
  const issues = [];
  const phaseFiles = findPhaseFiles(workflowDir);

  // Phase 1〜13の存在確認
  for (let i = 1; i <= PHASE_COUNT; i++) {
    if (!phaseFiles[i]) {
      issues.push({
        type: "error",
        category: "completeness",
        phase: i,
        message: `Phase ${i}（${PHASE_NAMES[i]}）の仕様書ファイルが存在しません`,
      });
    }
  }

  // index.mdの存在確認
  const indexPath = path.join(workflowDir, "index.md");
  if (!fs.existsSync(indexPath)) {
    issues.push({
      type: "error",
      category: "completeness",
      phase: null,
      message: "index.md（メインタスク仕様書）が存在しません",
    });
  }

  // artifacts.jsonの存在確認
  const artifactsPath = path.join(workflowDir, "artifacts.json");
  if (!fs.existsSync(artifactsPath)) {
    issues.push({
      type: "warning",
      category: "completeness",
      phase: null,
      message: "artifacts.jsonが存在しません",
    });
  }

  return { phaseFiles, issues };
}

function verifyStructure(phaseNum, content) {
  const issues = [];

  // 必須セクションの確認
  for (const section of REQUIRED_SECTIONS) {
    const patterns = [
      new RegExp(`^##\\s+${section}`, "m"),
      new RegExp(`^##\\s+.*${section}`, "m"),
    ];

    const found = patterns.some((p) => p.test(content));
    if (!found) {
      issues.push({
        type: "error",
        category: "structure",
        phase: phaseNum,
        message: `必須セクション「${section}」が見つかりません`,
      });
    }
  }

  // メタ情報テーブルの確認
  if (!content.includes("| Phase") && !content.includes("| 項目")) {
    issues.push({
      type: "warning",
      category: "structure",
      phase: phaseNum,
      message: "メタ情報がテーブル形式ではありません",
    });
  }

  // 完了条件がチェックリスト形式か確認（未完了/完了の両方を許容）
  const completionSection = content.match(
    /##\s*完了条件[\s\S]*?(?=\n##(?!#)|$)/
  );
  if (completionSection) {
    const hasChecklist = /-\s*\[[ xX]\]/.test(completionSection[0]);
    if (!hasChecklist) {
      issues.push({
        type: "warning",
        category: "structure",
        phase: phaseNum,
        message:
          "完了条件がチェックリスト形式（- [ ] / - [x]）ではありません",
      });
    }
  }

  return issues;
}

function verifyQuality(phaseNum, content) {
  const issues = [];

  // 曖昧表現の検出
  for (const expr of AMBIGUOUS_EXPRESSIONS) {
    if (content.includes(expr)) {
      // 出現回数をカウント
      const count = (content.match(new RegExp(expr, "g")) || []).length;
      issues.push({
        type: "warning",
        category: "quality",
        phase: phaseNum,
        message: `曖昧表現「${expr}」が${count}箇所で使用されています`,
      });
    }
  }

  // 完了条件の検証可能性チェック（簡易）
  const completionSection = content.match(
    /##\s*完了条件[\s\S]*?(?=\n##(?!#)|$)/
  );
  if (completionSection) {
    const badPatterns = [
      "十分に",
      "適切な",
      "良い",
      "高品質",
      "きれいな",
      "理解できる",
    ];
    for (const pattern of badPatterns) {
      if (completionSection[0].includes(pattern)) {
        issues.push({
          type: "warning",
          category: "quality",
          phase: phaseNum,
          message: `完了条件に検証不可能な表現「${pattern}」が含まれています`,
        });
      }
    }
  }

  return issues;
}

function verifyConsistency(phaseNum, content, workflowDir, workflowStarted) {
  const issues = [];
  const dependencies = PHASE_DEPENDENCIES[phaseNum] || [];

  // 参照資料セクションの確認
  const refSection = content.match(/##\s*参照資料[\s\S]*?(?=\n##(?!#)|$)/);
  const metaSection = content.match(/##\s*メタ情報[\s\S]*?(?=\n##(?!#)|$)/);
  const searchableContent = content.replace(/```[\s\S]*?```/g, "");
  if (workflowStarted && refSection && dependencies.length > 0) {
    // 依存Phaseの成果物が文書内で参照されているか
    for (const depPhase of dependencies) {
      const patterns = [
        `phase-${depPhase}`,
        `Phase ${depPhase}`,
        `Phase${depPhase}`,
      ];
      const found = patterns.some(
        (p) =>
          refSection[0].includes(p) ||
          metaSection?.[0]?.includes(p) ||
          searchableContent.includes(p),
      );
      if (!found) {
        issues.push({
          type: "warning",
          category: "consistency",
          phase: phaseNum,
          message: `依存するPhase ${depPhase}の成果物が文書内で参照されていない可能性があります`,
        });
      }
    }
  }

  // 参照パスの存在確認
  // インラインコード内のパスのみを対象にする（改行をまたぐ誤検出を防止）
  // `../task-*.md` の親仕様参照も検証し、ブリッジ欠落を早期検出する。
  const pathMatches =
    content.match(
      /`[^`\n]*(?:outputs\/|phase-\d+|(?:\.\.\/)+task-[^`\n]+\.md|task-[^`\n]+\.md)[^`\n]*`/g
    ) || [];
  for (const pathMatch of pathMatches) {
    const cleanPath = pathMatch.replace(/`/g, "");
    // outputsディレクトリ内のパスは生成前なのでスキップ
    if (!cleanPath.startsWith("outputs/") && !cleanPath.includes("/outputs/")) {
      if (cleanPath.includes("{{")) {
        continue;
      }

      // ワークフロー相対・リポジトリ相対の両方で存在確認する
      const candidates = path.isAbsolute(cleanPath)
        ? [cleanPath]
        : [path.join(workflowDir, cleanPath), cleanPath, path.resolve(cleanPath)];
      const exists = candidates.some((candidate) => fs.existsSync(candidate));

      if (!exists) {
        issues.push({
          type: "info",
          category: "consistency",
          phase: phaseNum,
          message: `参照パス「${cleanPath}」の存在を確認してください`,
        });
      }
    }
  }

  return issues;
}

// ====== メイン処理 ======

function runVerification(options) {
  const results = {
    timestamp: new Date().toISOString(),
    workflowDir: options.workflow,
    summary: {
      totalPhases: 0,
      verifiedPhases: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      passed: false,
    },
    phases: {},
    globalIssues: [],
  };

  // 完全性検証
  const { phaseFiles, issues: completenessIssues } = verifyCompleteness(
    options.workflow
  );
  results.globalIssues.push(...completenessIssues);
  const artifacts = loadArtifacts(options.workflow);
  const workflowStarted = isWorkflowStarted(artifacts);

  // 各Phase検証
  for (const [phaseNum, filePath] of Object.entries(phaseFiles)) {
    const num = parseInt(phaseNum, 10);
    const content = readFileContent(filePath);

    if (!content) {
      results.phases[num] = {
        file: filePath,
        status: "error",
        issues: [
          {
            type: "error",
            category: "read",
            phase: num,
            message: "ファイルを読み込めませんでした",
          },
        ],
      };
      continue;
    }

    const phaseIssues = [
      ...verifyStructure(num, content),
      ...verifyQuality(num, content),
      ...verifyConsistency(num, content, options.workflow, workflowStarted),
    ];

    results.phases[num] = {
      file: filePath,
      status:
        phaseIssues.filter((i) => i.type === "error").length > 0
          ? "error"
          : phaseIssues.filter((i) => i.type === "warning").length > 0
            ? "warning"
            : "pass",
      issues: phaseIssues,
    };
    results.summary.verifiedPhases++;
  }

  // サマリー計算
  results.summary.totalPhases = PHASE_COUNT;
  const allIssues = [
    ...results.globalIssues,
    ...Object.values(results.phases).flatMap((p) => p.issues),
  ];
  results.summary.errors = allIssues.filter((i) => i.type === "error").length;
  results.summary.warnings = allIssues.filter(
    (i) => i.type === "warning"
  ).length;
  results.summary.info = allIssues.filter((i) => i.type === "info").length;
  results.summary.passed = options.strict
    ? results.summary.errors === 0 && results.summary.warnings === 0
    : results.summary.errors === 0;

  return results;
}

function generateMarkdownReport(results) {
  const lines = [];

  lines.push("# タスク仕様書 検証レポート");
  lines.push("");
  lines.push(`> 検証日時: ${results.timestamp}`);
  lines.push(`> 対象: ${results.workflowDir}`);
  lines.push("");

  // サマリー
  lines.push("## サマリー");
  lines.push("");
  lines.push(`| 項目 | 値 |`);
  lines.push(`|------|-----|`);
  lines.push(`| 総Phase数 | ${results.summary.totalPhases} |`);
  lines.push(`| 検証済みPhase | ${results.summary.verifiedPhases} |`);
  lines.push(`| エラー | ${results.summary.errors} |`);
  lines.push(`| 警告 | ${results.summary.warnings} |`);
  lines.push(`| 情報 | ${results.summary.info} |`);
  lines.push(
    `| **結果** | **${results.summary.passed ? "✅ PASS" : "❌ FAIL"}** |`
  );
  lines.push("");

  // グローバル問題
  if (results.globalIssues.length > 0) {
    lines.push("## グローバル問題");
    lines.push("");
    for (const issue of results.globalIssues) {
      const icon =
        issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "ℹ️";
      lines.push(`- ${icon} [${issue.category}] ${issue.message}`);
    }
    lines.push("");
  }

  // Phase別結果
  lines.push("## Phase別検証結果");
  lines.push("");

  for (let i = 1; i <= PHASE_COUNT; i++) {
    const phase = results.phases[i];
    if (!phase) {
      lines.push(`### Phase ${i}: ${PHASE_NAMES[i]}`);
      lines.push("");
      lines.push("❌ ファイルが存在しません");
      lines.push("");
      continue;
    }

    const statusIcon =
      phase.status === "pass"
        ? "✅"
        : phase.status === "warning"
          ? "⚠️"
          : "❌";
    lines.push(`### Phase ${i}: ${PHASE_NAMES[i]} ${statusIcon}`);
    lines.push("");

    if (phase.issues.length === 0) {
      lines.push("問題なし");
    } else {
      for (const issue of phase.issues) {
        const icon =
          issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "ℹ️";
        lines.push(`- ${icon} [${issue.category}] ${issue.message}`);
      }
    }
    lines.push("");
  }

  // 推奨アクション
  if (!results.summary.passed) {
    lines.push("## 推奨アクション");
    lines.push("");
    lines.push("1. 上記のエラー（❌）を優先的に修正してください");
    lines.push("2. 警告（⚠️）も可能な限り対応してください");
    lines.push("3. 修正後、再度検証を実行してください:");
    lines.push("   ```bash");
    lines.push(
      `   node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow ${results.workflowDir}`
    );
    lines.push("   ```");
    lines.push("");
  }

  return lines.join("\n");
}

// ====== エントリーポイント ======

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.workflow) {
    console.error("エラー: --workflow オプションは必須です");
    console.error(
      "使用方法: node verify-all-specs.js --workflow <path> [--strict] [--json]"
    );
    process.exit(1);
  }

  if (!fs.existsSync(options.workflow)) {
    console.error(`エラー: ワークフローディレクトリが存在しません: ${options.workflow}`);
    process.exit(1);
  }

  const results = runVerification(options);

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    const report = generateMarkdownReport(results);

    // レポート出力
    const outputPath =
      options.output ||
      path.join(options.workflow, "outputs", "verification-report.md");
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, report, "utf-8");
    console.log(`検証レポートを出力しました: ${outputPath}`);

    // サマリー表示
    console.log("");
    console.log("=== 検証結果サマリー ===");
    console.log(`Phase数: ${results.summary.verifiedPhases}/${results.summary.totalPhases}`);
    console.log(`エラー: ${results.summary.errors}`);
    console.log(`警告: ${results.summary.warnings}`);
    console.log(`結果: ${results.summary.passed ? "✅ PASS" : "❌ FAIL"}`);
  }

  process.exit(results.summary.passed ? 0 : 1);
}

main();
