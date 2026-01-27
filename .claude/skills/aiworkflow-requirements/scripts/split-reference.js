#!/usr/bin/env node
/**
 * リファレンスファイル分割スクリプト
 *
 * 用途: 500行を超えるreferences/ファイルを責務別に分割
 *
 * 使用方法:
 *   node scripts/split-reference.js --analyze              # 分割候補を分析
 *   node scripts/split-reference.js --split <file> <config.json>  # 実際に分割
 *
 * config.json形式:
 *   {
 *     "prefix": "ui-ux",
 *     "splits": [
 *       { "name": "portal", "sections": ["Portal", "モーダル"] },
 *       { "name": "navigation", "sections": ["ナビゲーション", "ルーティング"] }
 *     ]
 *   }
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFS_DIR = join(__dirname, "..", "references");
const LINE_THRESHOLD = 500;

/**
 * 大きなファイルを検出して分析
 */
async function analyzeFiles() {
  const files = await readdir(REFS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  console.log("📊 分割候補分析\n");
  console.log(`閾値: ${LINE_THRESHOLD}行\n`);

  const candidates = [];

  for (const file of mdFiles) {
    const content = await readFile(join(REFS_DIR, file), "utf-8");
    const lines = content.split("\n");
    const lineCount = lines.length;

    if (lineCount > LINE_THRESHOLD) {
      // H2見出しを抽出
      const h2Headings = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("## ")) {
          const text = lines[i].replace(/^## /, "").trim();
          h2Headings.push({ line: i + 1, text });
        }
      }

      candidates.push({
        file,
        lineCount,
        headings: h2Headings,
        excess: lineCount - LINE_THRESHOLD,
      });
    }
  }

  if (candidates.length === 0) {
    console.log("✅ 分割が必要なファイルはありません");
    return;
  }

  // 行数降順でソート
  candidates.sort((a, b) => b.lineCount - a.lineCount);

  console.log(`⚠️ ${candidates.length}ファイルが${LINE_THRESHOLD}行を超過:\n`);

  for (const c of candidates) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📄 ${c.file}`);
    console.log(`   ${c.lineCount}行 (+${c.excess}行超過)`);
    console.log(`   H2見出し (${c.headings.length}個):`);
    for (const h of c.headings) {
      console.log(`     L${h.line}: ${h.text}`);
    }
    console.log("");

    // 分割提案
    const prefix = c.file.replace(/\.md$/, "").split("-")[0];
    console.log(`   💡 分割提案 config.json:`);
    console.log(`   {`);
    console.log(`     "prefix": "${prefix}",`);
    console.log(`     "splits": [`);
    const suggestedSplits = suggestSplits(c.headings);
    for (let i = 0; i < suggestedSplits.length; i++) {
      const s = suggestedSplits[i];
      const comma = i < suggestedSplits.length - 1 ? "," : "";
      console.log(
        `       { "name": "${s.name}", "sections": ${JSON.stringify(s.sections)} }${comma}`,
      );
    }
    console.log(`     ]`);
    console.log(`   }`);
    console.log("");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n使用方法:");
  console.log("  1. 上記の提案を参考にconfig.jsonを作成（または調整）");
  console.log(
    "  2. node scripts/split-reference.js --split <file> <config.json>",
  );
}

/**
 * 見出しから分割提案を生成
 */
function suggestSplits(headings) {
  // シンプルに2-3グループに分割
  const splits = [];
  const groupSize = Math.ceil(headings.length / 3);

  for (let i = 0; i < headings.length; i += groupSize) {
    const group = headings.slice(i, i + groupSize);
    if (group.length > 0) {
      const name = group[0].text
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 20);
      splits.push({
        name: name || `part${splits.length + 1}`,
        sections: group.map((h) => h.text),
      });
    }
  }

  return splits;
}

/**
 * 設定に基づいてファイルを分割
 */
async function splitFile(sourceFile, configPath) {
  const configContent = await readFile(configPath, "utf-8");
  const config = JSON.parse(configContent);

  const content = await readFile(join(REFS_DIR, sourceFile), "utf-8");
  const lines = content.split("\n");

  // H1タイトルを取得
  const h1Match = content.match(/^# .+$/m);
  const originalTitle = h1Match ? h1Match[0].replace(/^# /, "") : sourceFile;

  // H2見出しの位置をマッピング
  const headingPositions = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      const text = lines[i].replace(/^## /, "").trim();
      headingPositions.push({ line: i, text });
    }
  }

  console.log(`🔪 ${sourceFile} を分割中...\n`);

  for (const split of config.splits) {
    // 対象セクションの行範囲を特定
    const sectionLines = [];

    for (const sectionName of split.sections) {
      const idx = headingPositions.findIndex((h) =>
        h.text.includes(sectionName),
      );
      if (idx === -1) {
        console.log(`  ⚠️ セクション "${sectionName}" が見つかりません`);
        continue;
      }

      const startLine = headingPositions[idx].line;
      const endLine =
        idx + 1 < headingPositions.length
          ? headingPositions[idx + 1].line
          : lines.length;

      sectionLines.push(...lines.slice(startLine, endLine));
    }

    if (sectionLines.length === 0) {
      console.log(`  ❌ ${split.name}: 抽出するセクションがありません`);
      continue;
    }

    // 新しいファイル名とタイトル
    const newFileName = `${config.prefix}-${split.name}.md`;
    const newTitle = `# ${split.name} ${originalTitle}`;

    // ファイル内容を構築
    const newContent = `${newTitle}\n\n${sectionLines.join("\n")}`;

    await writeFile(join(REFS_DIR, newFileName), newContent);
    console.log(`  ✅ ${newFileName} (${sectionLines.length}行)`);
  }

  console.log("\n💡 分割後の手順:");
  console.log("  1. 元ファイルから抽出したセクションを削除");
  console.log("  2. node scripts/generate-index.js でインデックス再生成");
  console.log("  3. SKILL.md の該当テーブルを更新");
}

/**
 * メイン
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--analyze") {
    await analyzeFiles();
  } else if (args[0] === "--split" && args.length >= 3) {
    await splitFile(args[1], args[2]);
  } else {
    console.log("使用方法:");
    console.log(
      "  node scripts/split-reference.js --analyze              # 分割候補を分析",
    );
    console.log(
      "  node scripts/split-reference.js --split <file> <config.json>  # 実際に分割",
    );
  }
}

main().catch((err) => {
  console.error("エラー:", err.message);
  process.exit(1);
});
