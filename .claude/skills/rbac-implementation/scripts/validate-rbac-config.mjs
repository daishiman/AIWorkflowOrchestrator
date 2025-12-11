#!/usr/bin/env node

/**
 * RBAC設定検証スクリプト
 */

import fs from "fs";
import path from "path";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ Usage: node validate-rbac-config.mjs <config-file>");
    process.exit(1);
  }

  const configPath = path.resolve(process.cwd(), args[0]);
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  console.log("🔍 Validating RBAC Configuration...\n");

  const results = validateRBACConfig(config);
  printResults(results);

  if (results.errors.length > 0) {
    process.exit(1);
  }

  console.log("\n✅ RBAC configuration is valid!");
}

function validateRBACConfig(config) {
  const errors = [];
  const warnings = [];

  // ロール定義チェック
  if (!config.roles || config.roles.length === 0) {
    errors.push("No roles defined");
  }

  // 権限定義チェック
  if (!config.permissions || config.permissions.length === 0) {
    errors.push("No permissions defined");
  }

  // ロール・権限マッピングチェック
  if (!config.rolePermissions) {
    errors.push("Missing rolePermissions mapping");
  } else {
    for (const role of config.roles || []) {
      if (!config.rolePermissions[role]) {
        errors.push(`Missing permissions for role: ${role}`);
      }
    }
  }

  return { errors, warnings };
}

function printResults(results) {
  if (results.errors.length > 0) {
    console.log("❌ Errors:");
    results.errors.forEach((err, idx) => console.log(`  ${idx + 1}. ${err}`));
    console.log("");
  }

  if (results.warnings.length > 0) {
    console.log("⚠️  Warnings:");
    results.warnings.forEach((warn, idx) =>
      console.log(`  ${idx + 1}. ${warn}`),
    );
  }
}

main();
