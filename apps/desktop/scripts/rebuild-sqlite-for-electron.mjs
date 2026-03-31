/**
 * better-sqlite3 を Electron のアーキテクチャに合わせてリビルドするスクリプト。
 *
 * Rosetta 2 環境では process.arch が x64 を返すが、Electron バイナリは arm64 の場合がある。
 * このスクリプトは Electron バイナリの実際のアーキテクチャを検出し、
 * electron-rebuild に正しい --arch フラグを渡す。
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function detectElectronArch() {
  try {
    const electronPkgDir = dirname(require.resolve("electron/package.json"));
    const electronPath = readFileSync(
      join(electronPkgDir, "path.txt"),
      "utf8",
    ).trim();
    const fullPath = join(electronPkgDir, "dist", electronPath);
    const fileOutput = execSync(`file "${fullPath}"`).toString();

    if (fileOutput.includes("arm64")) return "arm64";
    if (fileOutput.includes("x86_64") || fileOutput.includes("x64"))
      return "x64";
  } catch {
    // fallback
  }
  return process.arch;
}

const arch = detectElectronArch();
console.log(`Detected Electron arch: ${arch} (host: ${process.arch})`);

execSync(`npx electron-rebuild -f -w better-sqlite3 --arch ${arch}`, {
  stdio: "inherit",
});
