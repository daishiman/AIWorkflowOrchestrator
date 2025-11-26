#!/usr/bin/env node

/**
 * Next.js App Router ルーティング構造分析スクリプト
 *
 * 使用方法:
 *   node analyze-routing-structure.mjs <app-directory>
 *
 * 例:
 *   node analyze-routing-structure.mjs ./src/app
 *   node analyze-routing-structure.mjs ./app
 */

import fs from 'fs';
import path from 'path';

const SPECIAL_FILES = [
  'page.tsx', 'page.ts', 'page.jsx', 'page.js',
  'layout.tsx', 'layout.ts', 'layout.jsx', 'layout.js',
  'template.tsx', 'template.ts', 'template.jsx', 'template.js',
  'loading.tsx', 'loading.ts', 'loading.jsx', 'loading.js',
  'error.tsx', 'error.ts', 'error.jsx', 'error.js',
  'not-found.tsx', 'not-found.ts', 'not-found.jsx', 'not-found.js',
  'route.tsx', 'route.ts', 'route.jsx', 'route.js',
];

const DYNAMIC_SEGMENT_PATTERNS = {
  single: /^\[([^\[\]\.]+)\]$/,        // [slug]
  catchAll: /^\[\.\.\.([^\]]+)\]$/,    // [...slug]
  optionalCatchAll: /^\[\[\.\.\.([^\]]+)\]\]$/, // [[...slug]]
};

class RoutingAnalyzer {
  constructor(appDir) {
    this.appDir = path.resolve(appDir);
    this.routes = [];
    this.layouts = [];
    this.routeGroups = [];
    this.parallelRoutes = [];
    this.dynamicRoutes = [];
    this.apiRoutes = [];
    this.issues = [];
  }

  analyze() {
    if (!fs.existsSync(this.appDir)) {
      console.error(`Error: Directory not found: ${this.appDir}`);
      process.exit(1);
    }

    console.log(`\n📂 Analyzing: ${this.appDir}\n`);
    console.log('='.repeat(60));

    this.scanDirectory(this.appDir, '');

    this.printRoutes();
    this.printLayouts();
    this.printRouteGroups();
    this.printParallelRoutes();
    this.printDynamicRoutes();
    this.printApiRoutes();
    this.printIssues();
    this.printSummary();
  }

  scanDirectory(dir, urlPath) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // Check for special files
    const specialFiles = {};
    for (const entry of entries) {
      if (entry.isFile() && SPECIAL_FILES.includes(entry.name)) {
        const type = entry.name.split('.')[0];
        specialFiles[type] = entry.name;
      }
    }

    // Record route if page or route exists
    if (specialFiles.page) {
      this.routes.push({
        path: urlPath || '/',
        file: path.join(dir, specialFiles.page),
        type: 'page',
      });
    }

    if (specialFiles.route) {
      this.apiRoutes.push({
        path: urlPath || '/',
        file: path.join(dir, specialFiles.route),
      });
    }

    if (specialFiles.layout) {
      this.layouts.push({
        path: urlPath || '/',
        file: path.join(dir, specialFiles.layout),
      });
    }

    // Check for issues
    if (specialFiles.page && specialFiles.route) {
      this.issues.push({
        type: 'conflict',
        message: `page and route conflict at ${urlPath || '/'}`,
        path: urlPath,
      });
    }

    if (specialFiles.error && !specialFiles.error.includes('use client')) {
      // Note: We can't actually check file contents here without reading
      // This is a simplified check
    }

    // Scan subdirectories
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const name = entry.name;
      const fullPath = path.join(dir, name);

      // Skip private folders
      if (name.startsWith('_')) continue;

      // Route Groups (folder)
      if (name.startsWith('(') && name.endsWith(')')) {
        const groupName = name.slice(1, -1);
        this.routeGroups.push({
          name: groupName,
          path: fullPath,
        });
        // Route groups don't affect URL
        this.scanDirectory(fullPath, urlPath);
        continue;
      }

      // Parallel Routes @folder
      if (name.startsWith('@')) {
        const slotName = name.slice(1);
        this.parallelRoutes.push({
          name: slotName,
          path: fullPath,
          parentPath: urlPath,
        });
        this.scanDirectory(fullPath, urlPath);
        continue;
      }

      // Intercepting Routes
      if (name.startsWith('(.)') || name.startsWith('(..)')) {
        // Skip URL path addition for intercepting routes
        this.scanDirectory(fullPath, urlPath);
        continue;
      }

      // Dynamic segments
      let segmentUrl = name;
      if (DYNAMIC_SEGMENT_PATTERNS.optionalCatchAll.test(name)) {
        const match = name.match(DYNAMIC_SEGMENT_PATTERNS.optionalCatchAll);
        this.dynamicRoutes.push({
          type: 'optionalCatchAll',
          param: match[1],
          path: path.join(urlPath, name),
        });
        segmentUrl = `[[...${match[1]}]]`;
      } else if (DYNAMIC_SEGMENT_PATTERNS.catchAll.test(name)) {
        const match = name.match(DYNAMIC_SEGMENT_PATTERNS.catchAll);
        this.dynamicRoutes.push({
          type: 'catchAll',
          param: match[1],
          path: path.join(urlPath, name),
        });
        segmentUrl = `[...${match[1]}]`;
      } else if (DYNAMIC_SEGMENT_PATTERNS.single.test(name)) {
        const match = name.match(DYNAMIC_SEGMENT_PATTERNS.single);
        this.dynamicRoutes.push({
          type: 'single',
          param: match[1],
          path: path.join(urlPath, name),
        });
        segmentUrl = `:${match[1]}`;
      }

      const newUrlPath = urlPath + '/' + segmentUrl;
      this.scanDirectory(fullPath, newUrlPath);
    }
  }

  printRoutes() {
    console.log('\n📄 Pages:');
    console.log('-'.repeat(40));
    if (this.routes.length === 0) {
      console.log('  (no pages found)');
    } else {
      for (const route of this.routes.sort((a, b) => a.path.localeCompare(b.path))) {
        console.log(`  ${route.path}`);
      }
    }
  }

  printLayouts() {
    console.log('\n🏗️  Layouts:');
    console.log('-'.repeat(40));
    if (this.layouts.length === 0) {
      console.log('  (no layouts found)');
    } else {
      for (const layout of this.layouts.sort((a, b) => a.path.localeCompare(b.path))) {
        console.log(`  ${layout.path || '/'} → ${path.basename(layout.file)}`);
      }
    }
  }

  printRouteGroups() {
    console.log('\n📁 Route Groups:');
    console.log('-'.repeat(40));
    if (this.routeGroups.length === 0) {
      console.log('  (no route groups found)');
    } else {
      for (const group of this.routeGroups) {
        console.log(`  (${group.name})`);
      }
    }
  }

  printParallelRoutes() {
    console.log('\n⚡ Parallel Routes:');
    console.log('-'.repeat(40));
    if (this.parallelRoutes.length === 0) {
      console.log('  (no parallel routes found)');
    } else {
      for (const slot of this.parallelRoutes) {
        console.log(`  @${slot.name} at ${slot.parentPath || '/'}`);
      }
    }
  }

  printDynamicRoutes() {
    console.log('\n🔀 Dynamic Routes:');
    console.log('-'.repeat(40));
    if (this.dynamicRoutes.length === 0) {
      console.log('  (no dynamic routes found)');
    } else {
      for (const route of this.dynamicRoutes) {
        const typeLabel = {
          single: '[param]',
          catchAll: '[...param]',
          optionalCatchAll: '[[...param]]',
        }[route.type];
        console.log(`  ${route.path} (${typeLabel}: ${route.param})`);
      }
    }
  }

  printApiRoutes() {
    console.log('\n🌐 API Routes:');
    console.log('-'.repeat(40));
    if (this.apiRoutes.length === 0) {
      console.log('  (no API routes found)');
    } else {
      for (const route of this.apiRoutes.sort((a, b) => a.path.localeCompare(b.path))) {
        console.log(`  ${route.path}`);
      }
    }
  }

  printIssues() {
    console.log('\n⚠️  Issues:');
    console.log('-'.repeat(40));
    if (this.issues.length === 0) {
      console.log('  ✅ No issues found');
    } else {
      for (const issue of this.issues) {
        console.log(`  ❌ ${issue.message}`);
      }
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('-'.repeat(40));
    console.log(`  Pages:          ${this.routes.length}`);
    console.log(`  Layouts:        ${this.layouts.length}`);
    console.log(`  Route Groups:   ${this.routeGroups.length}`);
    console.log(`  Parallel Routes: ${this.parallelRoutes.length}`);
    console.log(`  Dynamic Routes: ${this.dynamicRoutes.length}`);
    console.log(`  API Routes:     ${this.apiRoutes.length}`);
    console.log(`  Issues:         ${this.issues.length}`);
    console.log('='.repeat(60) + '\n');
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node analyze-routing-structure.mjs <app-directory>');
  console.log('Example: node analyze-routing-structure.mjs ./src/app');
  process.exit(1);
}

const analyzer = new RoutingAnalyzer(args[0]);
analyzer.analyze();
