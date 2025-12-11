#!/usr/bin/env node
import fs from "fs/promises";

const AMBIGUOUS_PATTERNS = /(高速|速い|適切に|使いやすい|など|場合によって)/g;

async function verifyRequirements(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  const metrics = {
    total: 0,
    withId: 0,
    withAcceptanceCriteria: 0,
    ambiguous: 0,
    quality: 0,
  };

  const ambiguousLines = [];

  lines.forEach((line, index) => {
    if (line.match(/^##\s+(FR|NFR)-\d+/)) {
      metrics.total++;
      metrics.withId++;
    }
    if (
      line.includes("Given") &&
      line.includes("When") &&
      line.includes("Then")
    ) {
      metrics.withAcceptanceCriteria++;
    }
    const ambiguous = line.match(AMBIGUOUS_PATTERNS);
    if (ambiguous) {
      metrics.ambiguous++;
      ambiguousLines.push({
        line: index + 1,
        text: line.trim(),
        keyword: ambiguous[0],
      });
    }
  });

  const clarity = Math.round((1 - metrics.ambiguous / lines.length) * 100);
  const completeness =
    metrics.withAcceptanceCriteria > 0
      ? Math.round((metrics.withAcceptanceCriteria / metrics.total) * 100)
      : 0;
  const consistency = 100; // 簡易版では100%と仮定
  const verifiability = Math.round(
    (metrics.withAcceptanceCriteria / metrics.total) * 100,
  );

  metrics.quality = Math.round(
    (clarity + completeness + consistency + verifiability) / 4,
  );

  return {
    metrics,
    clarity,
    completeness,
    consistency,
    verifiability,
    ambiguousLines,
  };
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node verify-requirements.mjs <file>");
    process.exit(1);
  }

  const result = await verifyRequirements(filePath);

  console.log("=".repeat(80));
  console.log("要件検証レポート");
  console.log("=".repeat(80));
  console.log(`\n総要件数: ${result.metrics.total}`);
  console.log(`ID付き要件: ${result.metrics.withId}/${result.metrics.total}`);
  console.log(
    `受け入れ基準あり: ${result.metrics.withAcceptanceCriteria}/${result.metrics.total}`,
  );
  console.log(`\n品質メトリクス:`);
  console.log(`  明確性: ${result.clarity}%`);
  console.log(`  完全性: ${result.completeness}%`);
  console.log(`  一貫性: ${result.consistency}%`);
  console.log(`  検証可能性: ${result.verifiability}%`);
  console.log(`\n総合品質スコア: ${result.metrics.quality}%`);

  const grade =
    result.metrics.quality >= 90
      ? "優秀"
      : result.metrics.quality >= 80
        ? "良好"
        : result.metrics.quality >= 70
          ? "要改善"
          : "不可";
  console.log(`評価: ${grade}`);

  if (result.ambiguousLines.length > 0) {
    console.log(`\n曖昧な表現（${result.ambiguousLines.length}件）:`);
    result.ambiguousLines.slice(0, 5).forEach((item) => {
      console.log(`  行${item.line}: 「${item.keyword}」 → ${item.text}`);
    });
  }
}

main().catch(console.error);
