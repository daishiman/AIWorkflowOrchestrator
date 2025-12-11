#!/usr/bin/env node
import fs from "fs/promises";

const WEIGHTS = {
  businessValue: 3,
  feasibility: 2,
  risk: -2,
  cost: -1,
};

function calculatePriorityScore(req) {
  return (
    req.businessValue * WEIGHTS.businessValue +
    req.feasibility * WEIGHTS.feasibility +
    req.risk * WEIGHTS.risk +
    req.cost * WEIGHTS.cost
  );
}

function classifyMoSCoW(score) {
  if (score >= 15) return "Must have";
  if (score >= 8) return "Should have";
  if (score >= 1) return "Could have";
  return "Won't have";
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: node calculate-priority.mjs <json-file>");
    console.error(
      'JSON format: [{ "id": "REQ-001", "name": "...", "businessValue": 5, "feasibility": 4, "risk": 2, "cost": 3 }]',
    );
    process.exit(1);
  }

  const data = JSON.parse(await fs.readFile(input, "utf-8"));
  const results = data.map((req) => ({
    ...req,
    score: calculatePriorityScore(req),
    classification: classifyMoSCoW(calculatePriorityScore(req)),
  }));

  results.sort((a, b) => b.score - a.score);

  console.log("=".repeat(100));
  console.log("要件優先順位分析");
  console.log("=".repeat(100));
  console.table(results);

  const summary = results.reduce((acc, r) => {
    acc[r.classification] = (acc[r.classification] || 0) + 1;
    return acc;
  }, {});

  console.log("\nMoSCoW分布:");
  Object.entries(summary).forEach(([key, count]) => {
    const percentage = Math.round((count / results.length) * 100);
    console.log(`  ${key}: ${count} (${percentage}%)`);
  });
}

main().catch(console.error);
