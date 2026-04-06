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
    `🔨 afterPack: Checking native modules for ${electronPlatformName}...`,
  );

  // electron-builder は packing 前に自身で @electron/rebuild を実行する。
  // afterPack 時点では app.asar.unpacked/node_modules に package.json が存在しないため
  // @electron/rebuild を再実行すると ENOENT でクラッシュする。
  // electron-builder の内部 rebuild が完了していれば afterPack での再 rebuild は不要。
  const unpackedBase =
    electronPlatformName === "darwin"
      ? join(
          appOutDir,
          "AI Workflow Orchestrator.app/Contents/Resources/app.asar.unpacked",
        )
      : join(appOutDir, "resources/app.asar.unpacked");

  const unpackedNodeModulesPath = join(unpackedBase, "node_modules");
  const betterSqlitePath = join(unpackedNodeModulesPath, "better-sqlite3");

  if (!existsSync(betterSqlitePath)) {
    console.log(
      "⚠️  better-sqlite3 not found in unpacked resources, skipping rebuild",
    );
    return;
  }

  // app.asar.unpacked には package.json がないため @electron/rebuild --module-dir では動かない。
  // electron-builder が事前に rebuild 済みのバイナリを確認して終了する。
  const nativeBinaryPath = join(
    betterSqlitePath,
    "build",
    "Release",
    "better_sqlite3.node",
  );
  if (existsSync(nativeBinaryPath)) {
    const arch = normalizeElectronBuilderArch(context.arch);
    console.log(
      `✅ better-sqlite3 native binary present (arch=${arch}), electron-builder rebuild already applied`,
    );
    return;
  }

  // バイナリが存在しない場合のみプロジェクトルートで rebuild を試みる。
  try {
    const arch = normalizeElectronBuilderArch(context.arch);
    const projectRoot = join(appOutDir, "..", "..", "..", "..");
    execSync(
      `npx @electron/rebuild -f -w better-sqlite3 --module-dir "${projectRoot}" --arch ${arch}`,
      { stdio: "inherit" },
    );
    console.log("✅ Native module rebuild complete");
  } catch (error) {
    console.error("❌ Native module rebuild failed:", error.message);
    throw error;
  }
}
