#!/usr/bin/env node

/**
 * アイコン生成スクリプト
 *
 * 使用方法:
 *   node .claude/skills/electron-packaging/scripts/generate-icons.mjs <source-image> [output-dir]
 *
 * 機能:
 *   - 1024x1024のソース画像から各プラットフォーム用アイコンを生成
 *   - macOS用 icns
 *   - Windows用 ico
 *   - Linux用 PNG各サイズ
 *
 * 依存関係:
 *   - sharp (npm install sharp)
 *   - png2icons (npm install png2icons) - ico生成用
 *
 * または、外部ツール使用:
 *   - sips (macOS標準)
 *   - iconutil (macOS標準)
 *   - ImageMagick (convert コマンド)
 */

import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";

const sourceImage = process.argv[2];
const outputDir = process.argv[3] || "./build/icons";

const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];

async function checkDependencies() {
  const checks = [];

  // sharpチェック
  try {
    await import("sharp");
    checks.push({ name: "sharp", available: true });
  } catch {
    checks.push({ name: "sharp", available: false });
  }

  // sipsチェック (macOS)
  try {
    execSync("which sips", { stdio: "pipe" });
    checks.push({ name: "sips", available: true });
  } catch {
    checks.push({ name: "sips", available: false });
  }

  // iconutilチェック (macOS)
  try {
    execSync("which iconutil", { stdio: "pipe" });
    checks.push({ name: "iconutil", available: true });
  } catch {
    checks.push({ name: "iconutil", available: false });
  }

  // ImageMagickチェック
  try {
    execSync("which convert", { stdio: "pipe" });
    checks.push({ name: "imagemagick", available: true });
  } catch {
    checks.push({ name: "imagemagick", available: false });
  }

  return checks;
}

async function generateWithSharp(sourcePath, outputPath, size) {
  const sharp = (await import("sharp")).default;
  await sharp(sourcePath).resize(size, size).png().toFile(outputPath);
}

async function generateWithSips(sourcePath, outputPath, size) {
  execSync(`sips -z ${size} ${size} "${sourcePath}" --out "${outputPath}"`, {
    stdio: "pipe",
  });
}

async function generatePNGs(sourcePath, outDir, method) {
  console.log("📷 PNG各サイズを生成中...");

  for (const size of sizes) {
    const outputPath = path.join(outDir, `${size}x${size}.png`);

    if (method === "sharp") {
      await generateWithSharp(sourcePath, outputPath, size);
    } else if (method === "sips") {
      await generateWithSips(sourcePath, outputPath, size);
    }

    console.log(`  ✓ ${size}x${size}.png`);
  }

  // icon.pngをコピー（256x256をデフォルトとして）
  await fs.copyFile(
    path.join(outDir, "256x256.png"),
    path.join(outDir, "icon.png"),
  );
  console.log("  ✓ icon.png (256x256)");
}

async function generateICNS(sourcePath, outDir) {
  console.log("\n🍎 macOS用 icns を生成中...");

  const iconsetDir = path.join(outDir, "icon.iconset");
  await fs.mkdir(iconsetDir, { recursive: true });

  const iconsetSizes = [16, 32, 64, 128, 256, 512, 1024];

  for (const size of iconsetSizes) {
    // 通常サイズ
    await fs.copyFile(
      path.join(outDir, `${size}x${size}.png`),
      path.join(iconsetDir, `icon_${size}x${size}.png`),
    );

    // @2x（512以下のみ）
    if (size <= 512) {
      const doubleSize = size * 2;
      if (sizes.includes(doubleSize)) {
        await fs.copyFile(
          path.join(outDir, `${doubleSize}x${doubleSize}.png`),
          path.join(iconsetDir, `icon_${size}x${size}@2x.png`),
        );
      }
    }
  }

  // iconutilでicns生成
  execSync(
    `iconutil -c icns "${iconsetDir}" -o "${path.join(outDir, "icon.icns")}"`,
    {
      stdio: "pipe",
    },
  );

  // iconsetディレクトリを削除
  await fs.rm(iconsetDir, { recursive: true });

  console.log("  ✓ icon.icns");
}

async function generateICO(outDir) {
  console.log("\n🪟 Windows用 ico を生成中...");

  const icoSizes = ["256x256", "128x128", "64x64", "48x48", "32x32", "16x16"];
  const inputFiles = icoSizes
    .map((s) => path.join(outDir, `${s}.png`))
    .join(" ");

  try {
    // ImageMagickで生成
    execSync(`convert ${inputFiles} "${path.join(outDir, "icon.ico")}"`, {
      stdio: "pipe",
    });
    console.log("  ✓ icon.ico (ImageMagick使用)");
  } catch {
    // png2iconsで生成を試みる
    try {
      const png2icons = await import("png2icons");
      const input = await fs.readFile(path.join(outDir, "256x256.png"));
      const output = png2icons.createICO(input, png2icons.BILINEAR, 0, true);
      await fs.writeFile(path.join(outDir, "icon.ico"), output);
      console.log("  ✓ icon.ico (png2icons使用)");
    } catch {
      console.log("  ⚠️ ico生成スキップ (ImageMagickまたはpng2iconsが必要)");
    }
  }
}

async function main() {
  if (!sourceImage) {
    console.log(`
📸 Electronアイコン生成スクリプト

使用方法:
  node generate-icons.mjs <source-image> [output-dir]

例:
  node generate-icons.mjs ./logo.png ./build/icons

注意:
  - ソース画像は1024x1024以上の正方形PNG推奨
  - 依存関係: sharp (npm install sharp)
  - macOS icns生成: iconutil (macOS標準)
  - Windows ico生成: ImageMagick または png2icons
`);
    process.exit(1);
  }

  console.log("🔍 依存関係をチェック中...");
  const deps = await checkDependencies();
  console.log(
    deps.map((d) => `  ${d.available ? "✓" : "✗"} ${d.name}`).join("\n"),
  );
  console.log();

  // 画像処理ツールを決定
  const hasSharp = deps.find((d) => d.name === "sharp")?.available;
  const hasSips = deps.find((d) => d.name === "sips")?.available;

  if (!hasSharp && !hasSips) {
    console.error("❌ sharpまたはsipsが必要です。");
    console.error("   npm install sharp を実行してください。");
    process.exit(1);
  }

  const method = hasSharp ? "sharp" : "sips";
  console.log(`🔧 ${method}を使用して画像処理を行います\n`);

  try {
    // ソース画像の確認
    await fs.access(sourceImage);

    // 出力ディレクトリ作成
    await fs.mkdir(outputDir, { recursive: true });

    // PNG生成
    await generatePNGs(sourceImage, outputDir, method);

    // macOS icns生成（macOSのみ）
    if (process.platform === "darwin") {
      const hasIconutil = deps.find((d) => d.name === "iconutil")?.available;
      if (hasIconutil) {
        await generateICNS(sourceImage, outputDir);
      } else {
        console.log("\n⚠️ icns生成スキップ (iconutilが必要)");
      }
    }

    // Windows ico生成
    await generateICO(outputDir);

    console.log("\n═══════════════════════════════════════");
    console.log("✅ アイコン生成完了！");
    console.log("═══════════════════════════════════════");
    console.log(`出力先: ${path.resolve(outputDir)}`);
    console.log();
  } catch (error) {
    console.error("❌ エラー:", error.message);
    process.exit(1);
  }
}

main();
