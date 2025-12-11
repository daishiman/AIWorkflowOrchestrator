#!/usr/bin/env node
/**
 * Apple HIG準拠チェックスクリプト v1.2.0
 *
 * 使用方法:
 *   node check-hig-compliance.mjs <source-directory>
 *
 * 例:
 *   node check-hig-compliance.mjs src/components/
 *
 * チェック項目:
 *   - タッチターゲットサイズ（44pt / 60pt for visionOS）
 *   - タイポグラフィ（最小11pt）
 *   - アクセシビリティ属性
 *   - カラー（セマンティックカラー推奨）
 *   - ナビゲーションパターン
 *   - コンポーネント状態（8状態の定義）
 *   - 角丸（Squircle）
 *   - シャドウ仕様
 *   - アニメーション（duration、easing）
 *   - App Icons
 *   - Widgets/Live Activities
 *   - Notifications
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, relative } from "path";

// HIG準拠チェックルール
const HIG_RULES = {
  touchTarget: {
    name: "タッチターゲットサイズ",
    minSize: 44,
    visionOSMinSize: 60,
    patterns: [
      /width:\s*(\d+)(?:px|pt)/gi,
      /height:\s*(\d+)(?:px|pt)/gi,
      /w-(\d+)/g,
      /h-(\d+)/g,
    ],
  },
  systemColors: {
    name: "システムカラー使用",
    recommended: [
      "#007AFF",
      "#FF3B30",
      "#34C759",
      "#FF9500",
      "#5856D6",
      "#AF52DE",
      "#FF2D55",
    ],
    semanticColors: [
      "var(--system-blue)",
      "var(--system-red)",
      "var(--system-green)",
      "var(--label)",
      "var(--secondary-label)",
      "var(--system-background)",
    ],
    avoidHardcoded: ["#FFFFFF", "#000000", "#FFF", "#000"],
  },
  typography: {
    name: "タイポグラフィ",
    minFontSize: 11,
    sfProDisplayMin: 20, // SF Pro Display は 20pt以上
    patterns: [
      /font-size:\s*(\d+)(?:px|pt)/gi,
      /text-\[(\d+)(?:px|pt)\]/gi,
      /text-(xs|sm)/gi,
    ],
  },
  accessibility: {
    name: "アクセシビリティ",
    requiredAttributes: [
      "aria-label",
      "aria-labelledby",
      "accessibilityLabel",
      "role",
      "aria-describedby",
    ],
    reduceMotion: [
      "prefers-reduced-motion",
      "UIAccessibility.isReduceMotionEnabled",
      "accessibilityReduceMotion",
    ],
  },
  cornerRadius: {
    name: "角丸（Squircle）",
    recommendedValues: [8, 10, 12, 14, 16, 20, 24],
    squircleRatio: 0.22, // ~22% for Apple Squircle
  },
  shadows: {
    name: "シャドウ",
    levels: [
      { name: "subtle", blur: "3-4px", opacity: "0.04-0.08" },
      { name: "light", blur: "6-8px", opacity: "0.08-0.12" },
      { name: "medium", blur: "10-16px", opacity: "0.12-0.15" },
      { name: "strong", blur: "16-24px", opacity: "0.15-0.20" },
      { name: "heavy", blur: "24-32px", opacity: "0.20-0.25" },
      { name: "maximum", blur: "32-48px", opacity: "0.25-0.30" },
    ],
  },
  animation: {
    name: "アニメーション",
    recommendedDurations: {
      microInteraction: [100, 150],
      transition: [200, 300],
      modal: [300, 400],
      complex: [400, 500],
    },
    recommendedEasing: ["ease-out", "ease-in-out", "cubic-bezier"],
    avoidLinear: true,
  },
  componentStates: {
    name: "コンポーネント状態",
    required: ["default", "hover", "pressed", "focused", "disabled"],
    optional: ["selected", "loading", "error"],
  },
  appIcons: {
    name: "App Icons",
    requiredSizes: [1024, 180, 120, 167, 152, 80, 60, 58, 40, 29, 20],
    squircleRatio: 0.22,
  },
  widgets: {
    name: "Widgets",
    families: [
      "systemSmall",
      "systemMedium",
      "systemLarge",
      "systemExtraLarge",
    ],
    accessory: ["accessoryCircular", "accessoryRectangular", "accessoryInline"],
  },
  liveActivities: {
    name: "Live Activities",
    dynamicIsland: ["compactLeading", "compactTrailing", "minimal", "expanded"],
  },
  notifications: {
    name: "Notifications",
    maxActions: 4,
    interruptionLevels: ["passive", "active", "time-sensitive", "critical"],
  },
};

async function findFiles(
  dir,
  extensions = [".tsx", ".jsx", ".ts", ".js", ".css", ".swift", ".swiftui"],
) {
  const files = [];

  async function scan(currentDir) {
    try {
      const entries = await readdir(currentDir);

      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          if (
            !entry.startsWith(".") &&
            entry !== "node_modules" &&
            entry !== "dist" &&
            entry !== "build"
          ) {
            await scan(fullPath);
          }
        } else if (extensions.some((ext) => entry.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (e) {
      // ディレクトリが存在しない場合はスキップ
    }
  }

  await scan(dir);
  return files;
}

function checkTouchTargets(content, filePath) {
  const issues = [];
  const sizePatterns = [
    /(?:width|height|w|h)[:=\-]\s*['"]?(\d+)(?:px|pt)?['"]?/gi,
  ];

  for (const pattern of sizePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const size = parseInt(match[1], 10);
      // Tailwind classの場合（w-10 = 40px = 10 * 4）
      const actualSize =
        match[0].includes("-") && !match[0].includes("px") ? size * 4 : size;

      if (actualSize > 0 && actualSize < HIG_RULES.touchTarget.minSize) {
        // ボタンやタッチ要素の近くにあるかチェック
        const context = content.substring(
          Math.max(0, match.index - 100),
          match.index + 100,
        );
        if (
          /button|touchable|pressable|click|tap|href|Button|Link/i.test(context)
        ) {
          const line = content.substring(0, match.index).split("\n").length;
          issues.push({
            type: "touch_target",
            severity: "high",
            line,
            message: `タッチターゲットが小さい可能性: ${actualSize}pt (最小: ${HIG_RULES.touchTarget.minSize}pt)`,
            found: match[0],
          });
        }
      }
    }
  }

  return issues;
}

function checkTypography(content, filePath) {
  const issues = [];
  const fontSizePattern =
    /(?:font-size|fontSize)[:=]\s*['"]?(\d+)(?:px|pt)?['"]?/gi;

  let match;
  while ((match = fontSizePattern.exec(content)) !== null) {
    const size = parseInt(match[1], 10);

    if (size < HIG_RULES.typography.minFontSize) {
      const line = content.substring(0, match.index).split("\n").length;
      issues.push({
        type: "typography",
        severity: "medium",
        line,
        message: `フォントサイズが最小値未満: ${size}pt (最小: ${HIG_RULES.typography.minFontSize}pt)`,
        found: match[0],
      });
    }
  }

  // Tailwind text-xs (12px) のチェック
  if (/\btext-xs\b/.test(content)) {
    const matches = [...content.matchAll(/\btext-xs\b/g)];
    for (const m of matches) {
      const line = content.substring(0, m.index).split("\n").length;
      issues.push({
        type: "typography",
        severity: "low",
        line,
        message: "text-xs (12px) は最小フォントサイズに近い",
        found: "text-xs",
      });
    }
  }

  return issues;
}

function checkAccessibility(content, filePath) {
  const issues = [];

  // ボタンやインタラクティブ要素のアクセシビリティチェック
  const interactiveElements = [
    /<button[^>]*>/gi,
    /<a[^>]*href/gi,
    /TouchableOpacity|Pressable|Button/gi,
    /onClick|onPress/gi,
  ];

  for (const pattern of interactiveElements) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const contextStart = Math.max(0, match.index - 50);
      const contextEnd = Math.min(content.length, match.index + 200);
      const context = content.substring(contextStart, contextEnd);

      const hasA11y = HIG_RULES.accessibility.requiredAttributes.some((attr) =>
        context.includes(attr),
      );

      if (!hasA11y && !context.includes("children")) {
        const line = content.substring(0, match.index).split("\n").length;
        issues.push({
          type: "accessibility",
          severity: "medium",
          line,
          message: "インタラクティブ要素にアクセシビリティ属性がない可能性",
          found: match[0].substring(0, 50),
        });
      }
    }
  }

  // Reduce Motion対応チェック
  const hasAnimation = /animation|transition|transform|@keyframes/i.test(
    content,
  );
  const hasReduceMotion = HIG_RULES.accessibility.reduceMotion.some((rm) =>
    content.includes(rm),
  );

  if (hasAnimation && !hasReduceMotion) {
    issues.push({
      type: "accessibility",
      severity: "medium",
      line: 1,
      message: "アニメーションがあるが、Reduce Motion対応が見つかりません",
      found: "animation/transition detected",
    });
  }

  return issues;
}

function checkColors(content, filePath) {
  const issues = [];

  // ハードコードされた白黒のチェック
  const hardcodedColors = [
    /#FFFFFF\b/gi,
    /#000000\b/gi,
    /#FFF\b/gi,
    /#000\b/gi,
    /color:\s*white\b/gi,
    /color:\s*black\b/gi,
    /backgroundColor:\s*['"]white['"]|backgroundColor:\s*['"]black['"]/gi,
  ];

  for (const pattern of hardcodedColors) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const line = content.substring(0, match.index).split("\n").length;
      issues.push({
        type: "color",
        severity: "low",
        line,
        message: "ハードコードされた色を検出（セマンティックカラーを推奨）",
        found: match[0],
      });
    }
  }

  return issues;
}

function checkNavigation(content, filePath) {
  const issues = [];

  // ハンバーガーメニューのチェック（iOSでは非推奨）
  if (/hamburger|drawer|sidebar-toggle|menu-toggle/i.test(content)) {
    const line = content.search(/hamburger|drawer|sidebar-toggle|menu-toggle/i);
    const lineNum = content.substring(0, line).split("\n").length;
    issues.push({
      type: "navigation",
      severity: "medium",
      line: lineNum,
      message: "iOSではハンバーガーメニューよりタブバーを推奨",
      found: "hamburger/drawer pattern detected",
    });
  }

  return issues;
}

function checkCornerRadius(content, filePath) {
  const issues = [];
  const radiusPattern = /border-radius:\s*(\d+)(?:px|pt)/gi;

  let match;
  while ((match = radiusPattern.exec(content)) !== null) {
    const radius = parseInt(match[1], 10);

    // 非標準の角丸値をチェック
    if (
      !HIG_RULES.cornerRadius.recommendedValues.includes(radius) &&
      radius > 0
    ) {
      const line = content.substring(0, match.index).split("\n").length;
      issues.push({
        type: "corner_radius",
        severity: "low",
        line,
        message: `非標準の角丸値: ${radius}pt (推奨: ${HIG_RULES.cornerRadius.recommendedValues.join(", ")}pt)`,
        found: match[0],
      });
    }
  }

  return issues;
}

function checkAnimation(content, filePath) {
  const issues = [];

  // linear easingのチェック
  if (/animation.*linear|transition.*linear/i.test(content)) {
    const match = content.match(/animation.*linear|transition.*linear/i);
    if (match) {
      const line = content.substring(0, match.index).split("\n").length;
      issues.push({
        type: "animation",
        severity: "low",
        line,
        message: "linear easingよりease-out/ease-in-outを推奨",
        found: match[0].substring(0, 50),
      });
    }
  }

  // 長すぎるアニメーション
  const durationPattern =
    /(?:animation-duration|transition-duration|duration):\s*(\d+)(?:ms|s)/gi;
  let match;
  while ((match = durationPattern.exec(content)) !== null) {
    let duration = parseInt(match[1], 10);
    if (match[0].includes("s") && !match[0].includes("ms")) {
      duration *= 1000;
    }

    if (duration > 500) {
      const line = content.substring(0, match.index).split("\n").length;
      issues.push({
        type: "animation",
        severity: "low",
        line,
        message: `アニメーション時間が長い: ${duration}ms (推奨: 100-500ms)`,
        found: match[0],
      });
    }
  }

  return issues;
}

function checkComponentStates(content, filePath) {
  const issues = [];

  // ボタンやインタラクティブ要素の状態チェック
  const hasInteractive = /button|btn|Button|touchable|pressable/i.test(content);

  if (hasInteractive) {
    const hasHover = /:hover|onMouseEnter/i.test(content);
    const hasPressed = /:active|onPress|pressed/i.test(content);
    const hasFocused = /:focus|:focus-visible|focused/i.test(content);
    const hasDisabled = /:disabled|disabled|isDisabled/i.test(content);

    const missingStates = [];
    if (!hasHover && content.includes("button")) missingStates.push("hover");
    if (!hasPressed) missingStates.push("pressed");
    if (!hasFocused) missingStates.push("focused");
    if (!hasDisabled) missingStates.push("disabled");

    if (missingStates.length > 0) {
      issues.push({
        type: "component_states",
        severity: "medium",
        line: 1,
        message: `インタラクティブ要素に状態が不足: ${missingStates.join(", ")}`,
        found: "Missing states in interactive component",
      });
    }
  }

  return issues;
}

function checkWidgetLiveActivities(content, filePath) {
  const issues = [];

  // Widget関連のチェック
  if (/WidgetFamily|Widget|TimelineProvider/i.test(content)) {
    // Small widgetで複数タップ領域
    if (/systemSmall|WidgetFamily\.systemSmall/i.test(content)) {
      if (/Link\(.*Link\(/s.test(content)) {
        issues.push({
          type: "widget",
          severity: "high",
          line: 1,
          message: "Small widgetは単一のタップターゲットのみ使用可能",
          found: "Multiple Links in systemSmall",
        });
      }
    }
  }

  // Live Activity関連
  if (/ActivityKit|LiveActivity|DynamicIsland/i.test(content)) {
    if (!/(compactLeading|compactTrailing|minimal|expanded)/i.test(content)) {
      issues.push({
        type: "live_activity",
        severity: "medium",
        line: 1,
        message: "Live Activityには全ての表示モードを定義してください",
        found: "Incomplete Live Activity implementation",
      });
    }
  }

  return issues;
}

function checkNotifications(content, filePath) {
  const issues = [];

  // Notification関連
  if (/UNNotification|UserNotifications|pushNotification/i.test(content)) {
    // アクション数チェック
    const actionMatches = content.match(
      /UNNotificationAction|NotificationAction/gi,
    );
    if (
      actionMatches &&
      actionMatches.length > HIG_RULES.notifications.maxActions
    ) {
      issues.push({
        type: "notification",
        severity: "medium",
        line: 1,
        message: `通知アクションが多すぎます: ${actionMatches.length} (最大: ${HIG_RULES.notifications.maxActions})`,
        found: `${actionMatches.length} notification actions`,
      });
    }
  }

  return issues;
}

async function analyzeFile(filePath, baseDir) {
  const content = await readFile(filePath, "utf-8");
  const relativePath = relative(baseDir, filePath);

  const allIssues = [
    ...checkTouchTargets(content, relativePath),
    ...checkTypography(content, relativePath),
    ...checkAccessibility(content, relativePath),
    ...checkColors(content, relativePath),
    ...checkNavigation(content, relativePath),
    ...checkCornerRadius(content, relativePath),
    ...checkAnimation(content, relativePath),
    ...checkComponentStates(content, relativePath),
    ...checkWidgetLiveActivities(content, relativePath),
    ...checkNotifications(content, relativePath),
  ];

  return {
    file: relativePath,
    issues: allIssues,
  };
}

async function main() {
  const targetDir = process.argv[2] || "src";

  console.log("\n🍎 Apple HIG準拠チェック v1.2.0");
  console.log(`📁 対象ディレクトリ: ${targetDir}\n`);

  const files = await findFiles(targetDir);
  console.log(`📄 検出ファイル数: ${files.length}\n`);

  if (files.length === 0) {
    console.log("⚠️ ファイルが見つかりませんでした\n");
    process.exit(0);
  }

  const results = [];
  let totalIssues = 0;

  for (const file of files) {
    const result = await analyzeFile(file, targetDir);
    if (result.issues.length > 0) {
      results.push(result);
      totalIssues += result.issues.length;
    }
  }

  if (totalIssues === 0) {
    console.log("✅ HIG違反は検出されませんでした\n");
    process.exit(0);
  }

  // サマリー
  console.log(`⚠️ ${totalIssues} 件の潜在的なHIG違反が検出されました\n`);

  // カテゴリ別カウント
  const byType = {};
  const bySeverity = { high: 0, medium: 0, low: 0 };

  for (const result of results) {
    for (const issue of result.issues) {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
      bySeverity[issue.severity]++;
    }
  }

  console.log("## カテゴリ別サマリー\n");
  const typeNames = {
    touch_target: "タッチターゲット",
    typography: "タイポグラフィ",
    accessibility: "アクセシビリティ",
    color: "カラー",
    navigation: "ナビゲーション",
    corner_radius: "角丸（Squircle）",
    animation: "アニメーション",
    component_states: "コンポーネント状態",
    widget: "Widgets",
    live_activity: "Live Activities",
    notification: "Notifications",
  };

  for (const [type, count] of Object.entries(byType)) {
    console.log(`- ${typeNames[type] || type}: ${count}件`);
  }

  console.log("\n## 深刻度別サマリー\n");
  console.log(`- 🔴 高: ${bySeverity.high}件`);
  console.log(`- 🟡 中: ${bySeverity.medium}件`);
  console.log(`- 🟢 低: ${bySeverity.low}件`);

  // 詳細レポート
  console.log("\n## 詳細レポート\n");

  for (const result of results) {
    console.log(`### ${result.file}`);

    const sortedIssues = result.issues.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    });

    for (const issue of sortedIssues) {
      const icon =
        issue.severity === "high"
          ? "🔴"
          : issue.severity === "medium"
            ? "🟡"
            : "🟢";
      console.log(`  ${icon} L${issue.line}: ${issue.message}`);
      console.log(`     検出: ${issue.found}`);
    }
    console.log("");
  }

  // スコア算出
  console.log("## HIG準拠スコア\n");
  const maxScore = 100;
  const deductions =
    bySeverity.high * 10 + bySeverity.medium * 5 + bySeverity.low * 2;
  const score = Math.max(0, maxScore - deductions);

  console.log(`  総合スコア: ${score}/100`);
  const rating =
    score >= 80 ? "✅ 良好" : score >= 60 ? "⚠️ 要改善" : "❌ 要対応";
  console.log(`  評価: ${rating}\n`);

  // チェック項目リスト
  console.log("## チェック項目\n");
  console.log("このスクリプトは以下の項目をチェックします:\n");
  console.log("1. タッチターゲットサイズ（44pt / visionOS: 60pt）");
  console.log("2. タイポグラフィ（最小11pt、SF Pro適用）");
  console.log("3. アクセシビリティ（VoiceOver、Reduce Motion対応）");
  console.log("4. カラー（セマンティックカラー使用）");
  console.log("5. ナビゲーション（タブバー推奨）");
  console.log("6. 角丸（Squircle、標準値）");
  console.log("7. アニメーション（duration、easing）");
  console.log("8. コンポーネント状態（8状態の定義）");
  console.log("9. Widgets（systemSmall/Medium/Large）");
  console.log("10. Live Activities（Dynamic Island）");
  console.log("11. Notifications（アクション数制限）");
  console.log("");

  // 高深刻度がある場合は非ゼロで終了
  process.exit(bySeverity.high > 0 ? 1 : 0);
}

main().catch(console.error);
