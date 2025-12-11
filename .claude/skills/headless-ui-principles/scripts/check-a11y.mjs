#!/usr/bin/env node

/**
 * アクセシビリティチェックスクリプト
 *
 * 使用方法:
 *   node check-a11y.mjs <component-file.tsx>
 *
 * チェック内容:
 *   - ARIA属性の存在確認
 *   - キーボードハンドラの確認
 *   - フォーカス管理の確認
 *   - 必須属性の検出
 */

import fs from "fs";
import path from "path";

// 必須ARIAパターン
const ARIA_PATTERNS = {
  dialog: {
    required: ['role="dialog"', "aria-modal", "aria-labelledby"],
    recommended: ["aria-describedby"],
    keyboard: ["Escape"],
  },
  menu: {
    required: ['role="menu"', "aria-haspopup"],
    recommended: ["aria-expanded", "aria-activedescendant"],
    keyboard: ["ArrowDown", "ArrowUp", "Escape", "Enter"],
  },
  tabs: {
    required: ['role="tablist"', 'role="tab"', 'role="tabpanel"'],
    recommended: ["aria-selected", "aria-controls", "aria-labelledby"],
    keyboard: ["ArrowLeft", "ArrowRight", "Home", "End"],
  },
  accordion: {
    required: ["aria-expanded", "aria-controls"],
    recommended: ['role="region"', "aria-labelledby"],
    keyboard: ["Enter", "Space"],
  },
  combobox: {
    required: ['role="combobox"', "aria-expanded", "aria-haspopup"],
    recommended: [
      "aria-activedescendant",
      "aria-autocomplete",
      "aria-controls",
    ],
    keyboard: ["ArrowDown", "ArrowUp", "Escape", "Enter"],
  },
  listbox: {
    required: ['role="listbox"', 'role="option"'],
    recommended: ["aria-selected", "aria-activedescendant"],
    keyboard: ["ArrowDown", "ArrowUp", "Home", "End"],
  },
};

// フォーカス管理パターン
const FOCUS_PATTERNS = [
  { name: "フォーカストラップ", pattern: /focusTrap|trapFocus/i },
  { name: "フォーカス復帰", pattern: /returnFocus|restoreFocus/i },
  { name: "自動フォーカス", pattern: /autoFocus|\.focus\(\)/i },
  { name: "tabIndex管理", pattern: /tabIndex/i },
];

/**
 * コンポーネントタイプを検出
 */
function detectComponentType(content) {
  const types = [];

  if (/dialog|modal/i.test(content)) types.push("dialog");
  if (/menu(?!item)/i.test(content)) types.push("menu");
  if (/tabs?(?!index)/i.test(content)) types.push("tabs");
  if (/accordion/i.test(content)) types.push("accordion");
  if (/combobox|autocomplete/i.test(content)) types.push("combobox");
  if (/listbox|select/i.test(content)) types.push("listbox");

  return types;
}

/**
 * ARIA属性をチェック
 */
function checkAriaAttributes(content, componentType) {
  const pattern = ARIA_PATTERNS[componentType];
  if (!pattern) return null;

  const results = {
    type: componentType,
    required: { found: [], missing: [] },
    recommended: { found: [], missing: [] },
    keyboard: { found: [], missing: [] },
  };

  // 必須属性
  pattern.required.forEach((attr) => {
    if (
      content.includes(attr) ||
      new RegExp(attr.replace(/"/g, "'")).test(content)
    ) {
      results.required.found.push(attr);
    } else {
      results.required.missing.push(attr);
    }
  });

  // 推奨属性
  pattern.recommended.forEach((attr) => {
    if (
      content.includes(attr) ||
      new RegExp(attr.replace(/"/g, "'")).test(content)
    ) {
      results.recommended.found.push(attr);
    } else {
      results.recommended.missing.push(attr);
    }
  });

  // キーボードハンドラ
  pattern.keyboard.forEach((key) => {
    if (new RegExp(`['"]${key}['"]`, "i").test(content)) {
      results.keyboard.found.push(key);
    } else {
      results.keyboard.missing.push(key);
    }
  });

  return results;
}

/**
 * フォーカス管理をチェック
 */
function checkFocusManagement(content) {
  const results = [];

  FOCUS_PATTERNS.forEach(({ name, pattern }) => {
    if (pattern.test(content)) {
      results.push({ name, found: true });
    } else {
      results.push({ name, found: false });
    }
  });

  return results;
}

/**
 * 一般的なA11yパターンをチェック
 */
function checkGeneralA11y(content) {
  const issues = [];

  // onClick without keyboard handler
  const onClickCount = (content.match(/onClick/g) || []).length;
  const keyHandlerCount = (content.match(/onKeyDown|onKeyUp|onKeyPress/g) || [])
    .length;
  if (onClickCount > keyHandlerCount) {
    issues.push({
      type: "warning",
      message: `onClick(${onClickCount})がキーボードハンドラ(${keyHandlerCount})より多い`,
      suggestion: "onKeyDownを追加してキーボードアクセシビリティを確保",
    });
  }

  // div/span with onClick (should be button)
  if (/(<div|<span)[^>]*onClick/i.test(content)) {
    issues.push({
      type: "error",
      message: "div/spanにonClickが設定されている",
      suggestion: "buttonまたはrole='button'を使用",
    });
  }

  // img without alt
  if (/<img[^>]*(?!alt=)[^>]*>/i.test(content)) {
    issues.push({
      type: "error",
      message: "imgにalt属性がない可能性",
      suggestion: "alt属性を追加（装飾的な場合はalt=''）",
    });
  }

  // Missing type on button
  if (/<button(?![^>]*type=)[^>]*>/i.test(content)) {
    issues.push({
      type: "warning",
      message: "buttonにtype属性がない",
      suggestion: 'type="button"を追加（フォーム内でないボタンの場合）',
    });
  }

  return issues;
}

/**
 * スコア計算
 */
function calculateScore(ariaResults, focusResults, generalIssues) {
  let score = 100;

  // ARIA属性の減点
  ariaResults.forEach((result) => {
    score -= result.required.missing.length * 10;
    score -= result.recommended.missing.length * 3;
    score -= result.keyboard.missing.length * 5;
  });

  // フォーカス管理の減点
  focusResults.forEach((result) => {
    if (!result.found) score -= 5;
  });

  // 一般的な問題の減点
  generalIssues.forEach((issue) => {
    if (issue.type === "error") score -= 10;
    if (issue.type === "warning") score -= 5;
  });

  return Math.max(0, score);
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node check-a11y.mjs <component-file.tsx>");
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath);

  console.log(`\n♿ アクセシビリティチェック: ${fileName}`);
  console.log("=".repeat(50));

  // コンポーネントタイプ検出
  const types = detectComponentType(content);
  console.log(
    `\n🔍 検出されたコンポーネントタイプ: ${types.length > 0 ? types.join(", ") : "汎用"}`,
  );

  // ARIA属性チェック
  const ariaResults = types
    .map((type) => checkAriaAttributes(content, type))
    .filter(Boolean);

  if (ariaResults.length > 0) {
    console.log("\n📋 ARIA属性チェック:");
    ariaResults.forEach((result) => {
      console.log(`\n  【${result.type}】`);

      // 必須属性
      console.log("  必須属性:");
      if (result.required.found.length > 0) {
        result.required.found.forEach((attr) => console.log(`    ✅ ${attr}`));
      }
      if (result.required.missing.length > 0) {
        result.required.missing.forEach((attr) =>
          console.log(`    ❌ ${attr} (不足)`),
        );
      }

      // 推奨属性
      if (result.recommended.missing.length > 0) {
        console.log("  推奨属性:");
        result.recommended.missing.forEach((attr) =>
          console.log(`    ⚠️  ${attr} (推奨)`),
        );
      }

      // キーボードハンドラ
      console.log("  キーボード操作:");
      if (result.keyboard.found.length > 0) {
        result.keyboard.found.forEach((key) => console.log(`    ✅ ${key}`));
      }
      if (result.keyboard.missing.length > 0) {
        result.keyboard.missing.forEach((key) =>
          console.log(`    ❌ ${key} (不足)`),
        );
      }
    });
  }

  // フォーカス管理チェック
  const focusResults = checkFocusManagement(content);
  console.log("\n🎯 フォーカス管理:");
  focusResults.forEach((result) => {
    const icon = result.found ? "✅" : "⚪";
    console.log(`  ${icon} ${result.name}`);
  });

  // 一般的なA11yチェック
  const generalIssues = checkGeneralA11y(content);
  if (generalIssues.length > 0) {
    console.log("\n⚠️  一般的な問題:");
    generalIssues.forEach((issue) => {
      const icon = issue.type === "error" ? "❌" : "⚠️ ";
      console.log(`  ${icon} ${issue.message}`);
      console.log(`     → ${issue.suggestion}`);
    });
  }

  // スコア計算
  const score = calculateScore(ariaResults, focusResults, generalIssues);
  console.log("\n📊 アクセシビリティスコア:");
  let scoreIcon = "✅";
  if (score < 70) scoreIcon = "❌";
  else if (score < 90) scoreIcon = "⚠️ ";
  console.log(`  ${scoreIcon} ${score}/100`);

  if (score < 100) {
    console.log("\n💡 改善のヒント:");
    if (ariaResults.some((r) => r.required.missing.length > 0)) {
      console.log("  - 必須ARIA属性を追加してください");
    }
    if (ariaResults.some((r) => r.keyboard.missing.length > 0)) {
      console.log("  - キーボードナビゲーションを実装してください");
    }
    if (focusResults.some((r) => !r.found)) {
      console.log("  - フォーカス管理を改善してください");
    }
  }

  console.log("\n");
  process.exit(score >= 70 ? 0 : 1);
}

main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});
