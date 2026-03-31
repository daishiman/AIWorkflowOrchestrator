import { rebuild } from "@electron/rebuild";

/**
 * electron-builder の afterPack フック。
 * パッケージング後にネイティブモジュールを対象 Electron バージョンで再ビルドする。
 *
 * @param {import('electron-builder').AfterPackContext} context
 */
export default async function afterPack(context) {
  const { appOutDir, arch } = context;

  console.log(
    `[afterPack] Rebuilding native modules for Electron ${context.electronVersion} (${arch})`,
  );

  try {
    await rebuild({
      buildPath: appOutDir,
      electronVersion: context.electronVersion,
      arch,
      force: true,
      onlyModules: ["better-sqlite3"],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[afterPack] Native module rebuild failed for ${appOutDir}: ${message}`,
    );
  }

  console.log("[afterPack] Native module rebuild completed.");
}
