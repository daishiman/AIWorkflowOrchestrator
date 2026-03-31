import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export function normalizeElectronBuilderArch(arch) {
  if (arch === "x64" || arch === "arm64" || arch === "ia32") {
    return arch;
  }

  switch (arch) {
    case 0:
      return "ia32";
    case 1:
      return "x64";
    case 3:
      return "arm64";
    default:
      return process.arch;
  }
}

export default async function afterPack(context) {
  const appOutDir = context.appOutDir;
  const electronPlatformName = context.electronPlatformName;

  console.log(
    `🔨 afterPack: Rebuilding native modules for ${electronPlatformName}...`,
  );

  // electron-rebuild CLI は node_modules ディレクトリを受け取る。
  const unpackedNodeModulesPath = join(
    appOutDir,
    electronPlatformName === "darwin"
      ? "AI Workflow Orchestrator.app/Contents/Resources/app.asar.unpacked/node_modules"
      : "resources/app.asar.unpacked/node_modules",
  );
  const betterSqlitePath = join(unpackedNodeModulesPath, "better-sqlite3");

  if (!existsSync(betterSqlitePath)) {
    console.log(
      "⚠️  better-sqlite3 not found in unpacked resources, skipping rebuild",
    );
    return;
  }

  try {
    const arch = normalizeElectronBuilderArch(context.arch);
    execSync(
      `npx @electron/rebuild -f -w better-sqlite3 --module-dir "${unpackedNodeModulesPath}" --arch ${arch}`,
      { stdio: "inherit" },
    );
    console.log("✅ Native module rebuild complete");
  } catch (error) {
    console.error("❌ Native module rebuild failed:", error.message);
    throw error;
  }
}
