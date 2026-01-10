#!/usr/bin/env node

/**
 * SEO分析スクリプト
 *
 * 使用方法:
 *   node analyze-seo.mjs <app-directory>
 *
 * 例:
 *   node analyze-seo.mjs ./src/app
 */

import fs from "fs";
import path from "path";

class SEOAnalyzer {
  constructor(appDir) {
    this.appDir = path.resolve(appDir);
    this.issues = [];
    this.suggestions = [];
    this.stats = {
      pages: 0,
      pagesWithMetadata: 0,
      pagesWithDynamicMetadata: 0,
      pagesWithOgImage: 0,
      pagesWithJsonLd: 0,
      hasSitemap: false,
      hasRobots: false,
    };
  }

  analyze() {
    if (!fs.existsSync(this.appDir)) {
      console.error(`Error: Directory not found: ${this.appDir}`);
      process.exit(1);
    }

    console.log(`\n🔍 SEO Analysis: ${this.appDir}\n`);
    console.log("=".repeat(60));

    this.checkRootFiles();
    this.scanDirectory(this.appDir);
    this.printStats();
    this.printIssues();
    this.printSuggestions();
  }

  checkRootFiles() {
    console.log("\n📁 Root Level Files:");
    console.log("-".repeat(40));

    // sitemap.ts チェック
    const sitemapPath = path.join(this.appDir, "sitemap.ts");
    const sitemapTsxPath = path.join(this.appDir, "sitemap.tsx");
    this.stats.hasSitemap =
      fs.existsSync(sitemapPath) || fs.existsSync(sitemapTsxPath);
    console.log(
      `  sitemap.ts: ${this.stats.hasSitemap ? "✅ Found" : "❌ Missing"}`,
    );

    // robots.ts チェック
    const robotsPath = path.join(this.appDir, "robots.ts");
    const robotsTsxPath = path.join(this.appDir, "robots.tsx");
    this.stats.hasRobots =
      fs.existsSync(robotsPath) || fs.existsSync(robotsTsxPath);
    console.log(
      `  robots.ts: ${this.stats.hasRobots ? "✅ Found" : "❌ Missing"}`,
    );

    // Root Layout チェック
    const layoutPath = path.join(this.appDir, "layout.tsx");
    const hasRootLayout = fs.existsSync(layoutPath);
    console.log(`  layout.tsx: ${hasRootLayout ? "✅ Found" : "❌ Missing"}`);

    if (hasRootLayout) {
      this.analyzeRootLayout(layoutPath);
    }

    // favicon チェック
    const faviconPath = path.join(this.appDir, "favicon.ico");
    const iconPath = path.join(this.appDir, "icon.png");
    const iconTsxPath = path.join(this.appDir, "icon.tsx");
    const hasIcon =
      fs.existsSync(faviconPath) ||
      fs.existsSync(iconPath) ||
      fs.existsSync(iconTsxPath);
    console.log(`  favicon/icon: ${hasIcon ? "✅ Found" : "⚠️  Missing"}`);

    // opengraph-image チェック
    const ogImagePath = path.join(this.appDir, "opengraph-image.png");
    const ogImageTsxPath = path.join(this.appDir, "opengraph-image.tsx");
    const hasOgImage =
      fs.existsSync(ogImagePath) || fs.existsSync(ogImageTsxPath);
    console.log(
      `  opengraph-image: ${hasOgImage ? "✅ Found" : "⚠️  Optional"}`,
    );

    if (!this.stats.hasSitemap) {
      this.issues.push({
        type: "error",
        message: "sitemap.ts が見つかりません",
      });
    }

    if (!this.stats.hasRobots) {
      this.issues.push({
        type: "error",
        message: "robots.ts が見つかりません",
      });
    }
  }

  analyzeRootLayout(layoutPath) {
    const content = fs.readFileSync(layoutPath, "utf-8");

    // title.template チェック
    const hasTitleTemplate =
      content.includes("template:") && content.includes("%s");
    if (!hasTitleTemplate) {
      this.suggestions.push(
        "Root Layoutに title.template を設定することを推奨",
      );
    }

    // 基本メタデータチェック
    const hasMetadataExport =
      content.includes("export const metadata") ||
      content.includes("export async function generateMetadata");
    if (!hasMetadataExport) {
      this.issues.push({
        type: "warning",
        message: "Root Layoutにメタデータエクスポートがありません",
      });
    }
  }

  scanDirectory(dir, relativePath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        // Route Groups、Parallel Routes などを除外しない
        this.scanDirectory(fullPath, relPath);
      } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
        this.analyzePage(fullPath, relativePath);
      }
    }
  }

  analyzePage(pagePath, routePath) {
    this.stats.pages++;
    const content = fs.readFileSync(pagePath, "utf-8");

    console.log(`\n📄 ${routePath || "/"}`);
    console.log("-".repeat(40));

    // 静的メタデータチェック
    const hasStaticMetadata = content.includes("export const metadata");

    // 動的メタデータチェック
    const hasDynamicMetadata = content.includes(
      "export async function generateMetadata",
    );

    if (hasStaticMetadata || hasDynamicMetadata) {
      this.stats.pagesWithMetadata++;
      console.log(
        `  Metadata: ${hasDynamicMetadata ? "✅ Dynamic" : "✅ Static"}`,
      );

      if (hasDynamicMetadata) {
        this.stats.pagesWithDynamicMetadata++;
      }
    } else {
      console.log(`  Metadata: ❌ Missing`);
      this.issues.push({
        type: "warning",
        message: `${routePath || "/"} にメタデータがありません`,
      });
    }

    // OGP画像チェック
    const pageDir = path.dirname(pagePath);
    const hasOgImage =
      fs.existsSync(path.join(pageDir, "opengraph-image.tsx")) ||
      fs.existsSync(path.join(pageDir, "opengraph-image.png")) ||
      content.includes("openGraph:") ||
      content.includes("og:image");

    if (hasOgImage) {
      this.stats.pagesWithOgImage++;
      console.log(`  OGP Image: ✅`);
    } else {
      console.log(`  OGP Image: ⚠️  Not configured`);
    }

    // JSON-LD チェック
    const hasJsonLd =
      content.includes("application/ld+json") ||
      content.includes("JsonLd") ||
      content.includes("@context");

    if (hasJsonLd) {
      this.stats.pagesWithJsonLd++;
      console.log(`  JSON-LD: ✅`);
    } else {
      console.log(`  JSON-LD: ⚠️  Not configured`);
    }

    // 動的ルートの場合の追加チェック
    if (routePath.includes("[")) {
      if (!hasDynamicMetadata) {
        this.issues.push({
          type: "warning",
          message: `動的ルート ${routePath} に generateMetadata がありません`,
        });
      }
    }
  }

  printStats() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary:");
    console.log("-".repeat(40));
    console.log(`  Total Pages: ${this.stats.pages}`);
    console.log(
      `  With Metadata: ${this.stats.pagesWithMetadata} (${this.percentage(this.stats.pagesWithMetadata, this.stats.pages)}%)`,
    );
    console.log(
      `  With Dynamic Metadata: ${this.stats.pagesWithDynamicMetadata}`,
    );
    console.log(
      `  With OGP Image: ${this.stats.pagesWithOgImage} (${this.percentage(this.stats.pagesWithOgImage, this.stats.pages)}%)`,
    );
    console.log(
      `  With JSON-LD: ${this.stats.pagesWithJsonLd} (${this.percentage(this.stats.pagesWithJsonLd, this.stats.pages)}%)`,
    );
    console.log(`  Has Sitemap: ${this.stats.hasSitemap ? "✅" : "❌"}`);
    console.log(`  Has Robots.txt: ${this.stats.hasRobots ? "✅" : "❌"}`);

    // SEOスコア計算
    const score = this.calculateSEOScore();
    console.log(`\n  📈 SEO Score: ${score}/100`);
  }

  calculateSEOScore() {
    let score = 0;

    // メタデータカバレッジ (40点)
    if (this.stats.pages > 0) {
      score += Math.round(
        (this.stats.pagesWithMetadata / this.stats.pages) * 40,
      );
    }

    // OGPカバレッジ (20点)
    if (this.stats.pages > 0) {
      score += Math.round(
        (this.stats.pagesWithOgImage / this.stats.pages) * 20,
      );
    }

    // サイトマップ (15点)
    if (this.stats.hasSitemap) score += 15;

    // robots.txt (15点)
    if (this.stats.hasRobots) score += 15;

    // JSON-LD (10点)
    if (this.stats.pages > 0) {
      score += Math.round((this.stats.pagesWithJsonLd / this.stats.pages) * 10);
    }

    return score;
  }

  percentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  printIssues() {
    console.log("\n⚠️  Issues:");
    console.log("-".repeat(40));

    if (this.issues.length === 0) {
      console.log("  ✅ No issues found");
    } else {
      const errors = this.issues.filter((i) => i.type === "error");
      const warnings = this.issues.filter((i) => i.type === "warning");

      for (const error of errors) {
        console.log(`  ❌ ${error.message}`);
      }
      for (const warning of warnings) {
        console.log(`  ⚠️  ${warning.message}`);
      }
    }
  }

  printSuggestions() {
    console.log("\n💡 Suggestions:");
    console.log("-".repeat(40));

    // 自動生成の提案
    if (this.stats.pagesWithMetadata < this.stats.pages) {
      this.suggestions.push("すべてのページにメタデータを設定してください");
    }

    if (this.stats.pagesWithOgImage < this.stats.pages) {
      this.suggestions.push(
        "OGP画像の設定を検討してください（ソーシャルシェア時の表示向上）",
      );
    }

    if (this.stats.pagesWithJsonLd === 0) {
      this.suggestions.push(
        "構造化データ（JSON-LD）の追加を検討してください（リッチリザルト獲得）",
      );
    }

    if (this.suggestions.length === 0) {
      console.log("  ✅ No additional suggestions");
    } else {
      for (const suggestion of this.suggestions) {
        console.log(`  → ${suggestion}`);
      }
    }

    console.log("\n" + "=".repeat(60) + "\n");
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node analyze-seo.mjs <app-directory>");
  console.log("Example: node analyze-seo.mjs ./src/app");
  process.exit(1);
}

const analyzer = new SEOAnalyzer(args[0]);
analyzer.analyze();
