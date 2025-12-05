/**
 * macOS Notarization Script
 *
 * electron-builderのafterSignフックで呼び出される
 * Apple Developer IDで署名されたアプリを公証する
 *
 * 必要な環境変数:
 * - APPLE_ID: Apple Developer アカウントのメールアドレス
 * - APPLE_APP_SPECIFIC_PASSWORD: App-specific password
 * - APPLE_TEAM_ID: Apple Developer Team ID
 */

import { notarize } from "@electron/notarize";

export default async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  // macOS以外はスキップ
  if (electronPlatformName !== "darwin") {
    console.log("Skipping notarization: not macOS");
    return;
  }

  // CI環境でない場合はスキップ（ローカル開発用）
  if (!process.env.CI && !process.env.FORCE_NOTARIZE) {
    console.log("Skipping notarization: not in CI environment");
    console.log("Set FORCE_NOTARIZE=true to notarize locally");
    return;
  }

  // 必要な環境変数の確認
  const requiredEnvVars = [
    "APPLE_ID",
    "APPLE_APP_SPECIFIC_PASSWORD",
    "APPLE_TEAM_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.log(
      `Skipping notarization: missing environment variables: ${missingVars.join(", ")}`,
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Notarizing ${appPath}...`);

  try {
    await notarize({
      tool: "notarytool",
      appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });

    console.log(`Successfully notarized ${appName}`);
  } catch (error) {
    console.error("Notarization failed:", error);
    throw error;
  }
}
