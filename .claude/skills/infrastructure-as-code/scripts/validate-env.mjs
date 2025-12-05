#!/usr/bin/env node

/**
 * Environment Variables Validator
 *
 * Compares .env.example with actual .env file to detect missing variables.
 *
 * Usage:
 *   node validate-env.mjs .env.example .env
 *   node validate-env.mjs .env.example .env.local
 */

import { readFileSync, existsSync } from "fs";

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, "utf-8");
  const variables = new Map();

  for (const line of content.split("\n")) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }

    // Parse KEY=value
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      const key = match[1];
      const value = line.slice(key.length + 1).trim();
      variables.set(key, value);
    }
  }

  return variables;
}

function categorizeVariables(variables) {
  const categories = {
    database: [],
    ai: [],
    discord: [],
    auth: [],
    app: [],
    public: [],
    other: [],
  };

  for (const key of variables.keys()) {
    if (
      key.includes("TURSO") ||
      key.includes("DATABASE") ||
      key.includes("DB_")
    ) {
      categories.database.push(key);
    } else if (
      key.includes("OPENAI") ||
      key.includes("ANTHROPIC") ||
      key.includes("AI_")
    ) {
      categories.ai.push(key);
    } else if (key.includes("DISCORD")) {
      categories.discord.push(key);
    } else if (
      key.includes("AUTH") ||
      key.includes("JWT") ||
      key.includes("SESSION")
    ) {
      categories.auth.push(key);
    } else if (key.startsWith("NEXT_PUBLIC_")) {
      categories.public.push(key);
    } else if (
      key.includes("NODE_ENV") ||
      key.includes("PORT") ||
      key.includes("LOG")
    ) {
      categories.app.push(key);
    } else {
      categories.other.push(key);
    }
  }

  return categories;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("Usage: node validate-env.mjs <template.env> <actual.env>");
    console.log("");
    console.log("Examples:");
    console.log("  node validate-env.mjs .env.example .env");
    console.log("  node validate-env.mjs .env.example .env.local");
    process.exit(1);
  }

  const [templatePath, actualPath] = args;

  // Parse template
  const template = parseEnvFile(templatePath);
  if (!template) {
    console.error(`❌ Template file not found: ${templatePath}`);
    process.exit(1);
  }

  // Parse actual env file
  const actual = parseEnvFile(actualPath);
  if (!actual) {
    console.error(`❌ Environment file not found: ${actualPath}`);
    console.log(`\n💡 Create it by copying the template:`);
    console.log(`   cp ${templatePath} ${actualPath}`);
    process.exit(1);
  }

  console.log(`\n📋 Validating environment variables`);
  console.log(`   Template: ${templatePath}`);
  console.log(`   Actual: ${actualPath}`);
  console.log("─".repeat(50));

  // Find missing variables
  const missing = [];
  const present = [];
  const extra = [];

  for (const key of template.keys()) {
    if (actual.has(key)) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }

  for (const key of actual.keys()) {
    if (!template.has(key)) {
      extra.push(key);
    }
  }

  // Categorize for display
  const categories = categorizeVariables(template);

  // Display results
  console.log(`\n✅ Present (${present.length}/${template.size}):`);
  for (const key of present) {
    console.log(`   • ${key}`);
  }

  if (missing.length > 0) {
    console.log(`\n❌ Missing (${missing.length}):`);
    for (const key of missing) {
      console.log(`   • ${key}`);
    }
  }

  if (extra.length > 0) {
    console.log(`\n⚠️  Extra variables (not in template):`);
    for (const key of extra) {
      console.log(`   • ${key}`);
    }
  }

  // Summary
  console.log("\n" + "═".repeat(50));

  if (missing.length === 0) {
    console.log("✅ All required environment variables are set!");
    process.exit(0);
  } else {
    console.log(`❌ ${missing.length} required variable(s) missing`);
    console.log(`\n💡 Add the missing variables to ${actualPath}:`);
    for (const key of missing) {
      const templateValue = template.get(key);
      console.log(`   ${key}=${templateValue}`);
    }
    process.exit(1);
  }
}

main();
