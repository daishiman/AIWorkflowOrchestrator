#!/usr/bin/env node
/**
 * エラーメッセージ検証スクリプト
 * エラーメッセージファイル（JSON）の品質をチェックします
 *
 * 使用方法:
 *   node validate-error-messages.mjs <messages.json> [--fix] [--locale=ja]
 *
 * オプション:
 *   --fix           修正提案を適用
 *   --locale=<lang> 検証対象の言語（デフォルト: ja）
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// 検証ルール
const VALIDATION_RULES = {
  // 技術用語のチェック
  technicalTerms: {
    patterns: [
      /null/i,
      /undefined/i,
      /exception/i,
      /error code/i,
      /HTTP \d{3}/i,
      /server error/i,
      /database/i,
      /query/i,
      /token/i,
      /parameter/i,
      /invalid/i,
      /malformed/i,
    ],
    message:
      "技術用語が含まれています。ユーザーフレンドリーな表現に変更してください",
    severity: "warning",
  },

  // 長さチェック
  length: {
    maxTitle: 50,
    maxDetail: 200,
    message: "メッセージが長すぎます",
    severity: "warning",
  },

  // アクション指向チェック
  actionOriented: {
    actionWords: {
      ja: ["してください", "ください", "お試し", "確認", "入力"],
      en: ["please", "try", "check", "enter", "contact"],
    },
    message: "ユーザーへのアクション指示がありません",
    severity: "info",
  },

  // プレースホルダーチェック
  placeholders: {
    pattern: /\{[^}]+\}/g,
    message: "プレースホルダーのフォーマットを確認してください",
    severity: "info",
  },

  // 敬語チェック（日本語）
  politeness: {
    casualPatterns: [/だよ/, /してね/, /ごめん/],
    message: "カジュアルな表現が含まれています。敬語に統一してください",
    severity: "warning",
    locales: ["ja"],
  },

  // 句読点チェック
  punctuation: {
    patterns: {
      ja: /[。、]$/,
      en: /[.!?]$/,
    },
    message: "文末に句読点がありません",
    severity: "info",
  },

  // 空文字チェック
  empty: {
    message: "空のメッセージがあります",
    severity: "error",
  },
};

// 検証結果
const issues = [];

// メッセージを検証
function validateMessage(key, value, locale, path = []) {
  const currentPath = [...path, key].join(".");

  if (typeof value === "object" && value !== null) {
    // ネストされたオブジェクトを再帰的に処理
    for (const [k, v] of Object.entries(value)) {
      validateMessage(k, v, locale, [...path, key]);
    }
    return;
  }

  if (typeof value !== "string") {
    return;
  }

  // 空文字チェック
  if (value.trim() === "") {
    issues.push({
      path: currentPath,
      value,
      rule: "empty",
      message: VALIDATION_RULES.empty.message,
      severity: VALIDATION_RULES.empty.severity,
    });
    return;
  }

  // 技術用語チェック
  for (const pattern of VALIDATION_RULES.technicalTerms.patterns) {
    if (pattern.test(value)) {
      issues.push({
        path: currentPath,
        value,
        rule: "technicalTerms",
        message: `${VALIDATION_RULES.technicalTerms.message}: "${value.match(pattern)?.[0]}"`,
        severity: VALIDATION_RULES.technicalTerms.severity,
      });
      break;
    }
  }

  // 長さチェック
  const { maxTitle, maxDetail } = VALIDATION_RULES.length;
  const maxLen = key.includes("title") ? maxTitle : maxDetail;
  if (value.length > maxLen) {
    issues.push({
      path: currentPath,
      value,
      rule: "length",
      message: `${VALIDATION_RULES.length.message} (${value.length}/${maxLen}文字)`,
      severity: VALIDATION_RULES.length.severity,
    });
  }

  // アクション指向チェック（actionやdetailフィールドのみ）
  if (key.includes("action") || key.includes("detail")) {
    const actionWords =
      VALIDATION_RULES.actionOriented.actionWords[locale] || [];
    const hasAction = actionWords.some((word) =>
      value.toLowerCase().includes(word.toLowerCase()),
    );
    if (!hasAction) {
      issues.push({
        path: currentPath,
        value,
        rule: "actionOriented",
        message: VALIDATION_RULES.actionOriented.message,
        severity: VALIDATION_RULES.actionOriented.severity,
      });
    }
  }

  // 敬語チェック（日本語）
  if (locale === "ja" && VALIDATION_RULES.politeness.locales.includes(locale)) {
    for (const pattern of VALIDATION_RULES.politeness.casualPatterns) {
      if (pattern.test(value)) {
        issues.push({
          path: currentPath,
          value,
          rule: "politeness",
          message: VALIDATION_RULES.politeness.message,
          severity: VALIDATION_RULES.politeness.severity,
        });
        break;
      }
    }
  }

  // プレースホルダーの整合性チェック
  const placeholders = value.match(VALIDATION_RULES.placeholders.pattern) || [];
  for (const placeholder of placeholders) {
    const name = placeholder.slice(1, -1);
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      issues.push({
        path: currentPath,
        value,
        rule: "placeholders",
        message: `不正なプレースホルダー名: ${placeholder}`,
        severity: "warning",
      });
    }
  }
}

// 結果をフォーマット
function formatResults() {
  if (issues.length === 0) {
    return "✅ すべてのメッセージが検証に合格しました";
  }

  const grouped = {
    error: issues.filter((i) => i.severity === "error"),
    warning: issues.filter((i) => i.severity === "warning"),
    info: issues.filter((i) => i.severity === "info"),
  };

  const severityLabels = {
    error: "❌ エラー",
    warning: "⚠️  警告",
    info: "💡 情報",
  };

  let output = "\n📋 エラーメッセージ検証結果\n";
  output += "═".repeat(60) + "\n";

  for (const [severity, items] of Object.entries(grouped)) {
    if (items.length === 0) continue;

    output += `\n${severityLabels[severity]} (${items.length}件)\n`;
    output += "─".repeat(60) + "\n";

    for (const item of items) {
      output += `\n📍 ${item.path}\n`;
      output += `   "${item.value.substring(0, 50)}${item.value.length > 50 ? "..." : ""}"\n`;
      output += `   → ${item.message}\n`;
    }
  }

  output += "\n" + "═".repeat(60) + "\n";
  output += `📊 合計: ${issues.length}件\n`;
  output += `   エラー: ${grouped.error.length}\n`;
  output += `   警告: ${grouped.warning.length}\n`;
  output += `   情報: ${grouped.info.length}\n`;

  return output;
}

// カバレッジレポート
function generateCoverageReport(messages, locale) {
  const stats = {
    total: 0,
    withAction: 0,
    withPlaceholder: 0,
    averageLength: 0,
  };

  function countMessages(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null) {
        countMessages(value);
      } else if (typeof value === "string") {
        stats.total++;
        stats.averageLength += value.length;

        const actionWords =
          VALIDATION_RULES.actionOriented.actionWords[locale] || [];
        if (
          actionWords.some((w) => value.toLowerCase().includes(w.toLowerCase()))
        ) {
          stats.withAction++;
        }

        if (VALIDATION_RULES.placeholders.pattern.test(value)) {
          stats.withPlaceholder++;
        }
      }
    }
  }

  countMessages(messages);

  if (stats.total > 0) {
    stats.averageLength = Math.round(stats.averageLength / stats.total);
  }

  let report = "\n📈 カバレッジレポート\n";
  report += "─".repeat(40) + "\n";
  report += `総メッセージ数: ${stats.total}\n`;
  report += `アクション指示付き: ${stats.withAction} (${Math.round((stats.withAction / stats.total) * 100)}%)\n`;
  report += `プレースホルダー付き: ${stats.withPlaceholder} (${Math.round((stats.withPlaceholder / stats.total) * 100)}%)\n`;
  report += `平均文字数: ${stats.averageLength}\n`;

  return report;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
エラーメッセージ検証スクリプト

使用方法:
  node validate-error-messages.mjs <messages.json> [options]

オプション:
  --locale=<lang>  検証対象の言語（デフォルト: ja）
  --coverage       カバレッジレポートを表示
  --json           JSON形式で出力
  --help           ヘルプを表示

例:
  node validate-error-messages.mjs locales/ja/errors.json
  node validate-error-messages.mjs locales/en/errors.json --locale=en
  node validate-error-messages.mjs locales/ja/errors.json --coverage

検証内容:
  - 技術用語の使用
  - メッセージの長さ
  - アクション指向の表現
  - プレースホルダーのフォーマット
  - 敬語の一貫性（日本語）
  - 空メッセージ
`);
    process.exit(0);
  }

  const filePath = resolve(args.find((a) => !a.startsWith("--")));
  const localeArg = args.find((a) => a.startsWith("--locale="));
  const locale = localeArg ? localeArg.split("=")[1] : "ja";
  const showCoverage = args.includes("--coverage");
  const jsonOutput = args.includes("--json");

  try {
    const content = readFileSync(filePath, "utf-8");
    const messages = JSON.parse(content);

    validateMessage("root", messages, locale);

    if (jsonOutput) {
      console.log(JSON.stringify({ issues, locale, file: filePath }, null, 2));
    } else {
      console.log(formatResults());
      if (showCoverage) {
        console.log(generateCoverageReport(messages, locale));
      }
    }

    const hasErrors = issues.some((i) => i.severity === "error");
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
