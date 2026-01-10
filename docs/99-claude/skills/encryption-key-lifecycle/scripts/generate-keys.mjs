#!/usr/bin/env node
/**
 * Secure Key Generation Script
 * 暗号学的に安全な鍵を生成します
 */

import crypto from "crypto";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer));
  });
}

function generateSymmetricKey(length, format = "base64") {
  const bytes = crypto.randomBytes(length);
  return format === "base64" ? bytes.toString("base64") : bytes.toString("hex");
}

function generateSessionSecret() {
  return crypto.randomBytes(32).toString("base64");
}

function generateAPIKey() {
  return crypto.randomBytes(48).toString("base64").substring(0, 64);
}

console.log("🔐 Secure Key Generation");
console.log("=======================\n");
console.log("Select key type to generate:");
console.log("  1) Symmetric Key (AES-256) - for data encryption");
console.log(
  "  2) Session Secret (32 bytes) - for NextAuth, session encryption",
);
console.log("  3) API Key (random 64 chars) - for API authentication");
console.log("  4) All of the above");
console.log("");

async function main() {
  const choice = await question("Enter choice (1-4): ");

  console.log("");

  switch (choice) {
    case "1":
      console.log("Generating AES-256 symmetric key...");
      const key = generateSymmetricKey(32, "base64");
      console.log("✅ Generated (base64):");
      console.log(key);
      console.log("\nAdd to .env or Railway Secrets:");
      console.log(`ENCRYPTION_KEY=${key}`);
      break;

    case "2":
      console.log("Generating session secret (32 bytes)...");
      const secret = generateSessionSecret();
      console.log("✅ Generated (base64):");
      console.log(secret);
      console.log("\nAdd to .env or Railway Secrets:");
      console.log(`NEXTAUTH_SECRET=${secret}`);
      break;

    case "3":
      console.log("Generating API key (64 random characters)...");
      const apiKey = generateAPIKey();
      console.log("✅ Generated:");
      console.log(apiKey);
      console.log("\nAdd to .env or Railway Secrets:");
      console.log(`API_KEY=${apiKey}`);
      break;

    case "4":
      console.log("Generating all key types...\n");

      const encryptionKey = generateSymmetricKey(32, "base64");
      console.log("1️⃣  AES-256 Symmetric Key:");
      console.log(`ENCRYPTION_KEY=${encryptionKey}\n`);

      const sessionSecret = generateSessionSecret();
      console.log("2️⃣  Session Secret:");
      console.log(`NEXTAUTH_SECRET=${sessionSecret}\n`);

      const apiKey2 = generateAPIKey();
      console.log("3️⃣  API Key:");
      console.log(`API_KEY=${apiKey2}\n`);

      console.log("✅ All keys generated successfully!\n");
      break;

    default:
      console.log("❌ Invalid choice");
      rl.close();
      process.exit(1);
  }

  console.log("");
  console.log("⚠️  SECURITY WARNINGS:");
  console.log("  1. これらの鍵は画面に表示されています");
  console.log("  2. ターミナル履歴に残る可能性があります");
  console.log("  3. 即座に安全な場所（Railway Secrets等）に保存してください");
  console.log("  4. この画面をクリアしてください: clear");
  console.log("  5. 鍵ファイルは絶対にGitにコミットしないでください\n");
  console.log("✅ Next steps:");
  console.log("  1. Copy the keys to your secret management system");
  console.log("  2. Clear this terminal: clear");
  console.log("  3. Verify keys are NOT in Git: git status\n");

  rl.close();
}

main();
