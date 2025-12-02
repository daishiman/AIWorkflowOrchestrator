#!/usr/bin/env node

/**
 * IPC通信パターン分析スクリプト
 *
 * 使用方法:
 *   node .claude/skills/electron-architecture/scripts/analyze-ipc.mjs [project-dir]
 *
 * 機能:
 *   - IPCチャネルの一覧化
 *   - Main/Preload/Renderer間の通信パターン検出
 *   - セキュリティ問題の検出
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const projectDir = process.argv[2] || process.cwd();

// 検出パターン
const patterns = {
  // Main側のハンドラー
  ipcMainHandle: /ipcMain\.handle\s*\(\s*['"`]([^'"`]+)['"`]/g,
  ipcMainOn: /ipcMain\.on\s*\(\s*['"`]([^'"`]+)['"`]/g,

  // Preload側
  ipcRendererInvoke: /ipcRenderer\.invoke\s*\(\s*['"`]([^'"`]+)['"`]/g,
  ipcRendererSend: /ipcRenderer\.send\s*\(\s*['"`]([^'"`]+)['"`]/g,
  ipcRendererOn: /ipcRenderer\.on\s*\(\s*['"`]([^'"`]+)['"`]/g,

  // セキュリティ問題
  directExpose: /contextBridge\.exposeInMainWorld\s*\(\s*['"`]\w+['"`]\s*,\s*ipcRenderer\s*\)/g,
  requireExpose: /contextBridge\.exposeInMainWorld\s*\(\s*['"`]\w+['"`]\s*,\s*require\s*\)/g,
  nodeIntegration: /nodeIntegration\s*:\s*true/g,
  contextIsolationOff: /contextIsolation\s*:\s*false/g,
};

const results = {
  channels: {
    main: { handle: [], on: [] },
    preload: { invoke: [], send: [], on: [] },
  },
  security: {
    issues: [],
    warnings: [],
  },
  files: [],
};

async function analyzeFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const relativePath = path.relative(projectDir, filePath);
  const fileInfo = { path: relativePath, channels: [], issues: [] };

  // Main側のチャネル検出
  for (const match of content.matchAll(patterns.ipcMainHandle)) {
    results.channels.main.handle.push({ channel: match[1], file: relativePath });
    fileInfo.channels.push({ type: 'main:handle', channel: match[1] });
  }

  for (const match of content.matchAll(patterns.ipcMainOn)) {
    results.channels.main.on.push({ channel: match[1], file: relativePath });
    fileInfo.channels.push({ type: 'main:on', channel: match[1] });
  }

  // Preload側のチャネル検出
  for (const match of content.matchAll(patterns.ipcRendererInvoke)) {
    results.channels.preload.invoke.push({ channel: match[1], file: relativePath });
    fileInfo.channels.push({ type: 'preload:invoke', channel: match[1] });
  }

  for (const match of content.matchAll(patterns.ipcRendererSend)) {
    results.channels.preload.send.push({ channel: match[1], file: relativePath });
    fileInfo.channels.push({ type: 'preload:send', channel: match[1] });
  }

  for (const match of content.matchAll(patterns.ipcRendererOn)) {
    results.channels.preload.on.push({ channel: match[1], file: relativePath });
    fileInfo.channels.push({ type: 'preload:on', channel: match[1] });
  }

  // セキュリティ問題検出
  if (patterns.directExpose.test(content)) {
    results.security.issues.push({
      severity: 'critical',
      message: 'ipcRendererが直接公開されています',
      file: relativePath,
    });
    fileInfo.issues.push('ipcRenderer直接公開');
  }

  if (patterns.requireExpose.test(content)) {
    results.security.issues.push({
      severity: 'critical',
      message: 'requireが直接公開されています',
      file: relativePath,
    });
    fileInfo.issues.push('require直接公開');
  }

  if (patterns.nodeIntegration.test(content)) {
    results.security.warnings.push({
      severity: 'high',
      message: 'nodeIntegrationが有効です',
      file: relativePath,
    });
    fileInfo.issues.push('nodeIntegration有効');
  }

  if (patterns.contextIsolationOff.test(content)) {
    results.security.issues.push({
      severity: 'critical',
      message: 'contextIsolationが無効です',
      file: relativePath,
    });
    fileInfo.issues.push('contextIsolation無効');
  }

  if (fileInfo.channels.length > 0 || fileInfo.issues.length > 0) {
    results.files.push(fileInfo);
  }
}

async function findUnmatchedChannels() {
  const mainChannels = new Set([
    ...results.channels.main.handle.map(c => c.channel),
    ...results.channels.main.on.map(c => c.channel),
  ]);

  const preloadChannels = new Set([
    ...results.channels.preload.invoke.map(c => c.channel),
    ...results.channels.preload.send.map(c => c.channel),
  ]);

  // Preloadで呼び出されているがMainで定義されていないチャネル
  for (const channel of preloadChannels) {
    if (!mainChannels.has(channel)) {
      results.security.warnings.push({
        severity: 'medium',
        message: `チャネル "${channel}" はPreloadで使用されていますが、Mainで定義されていません`,
      });
    }
  }

  // Mainで定義されているがPreloadで使用されていないチャネル
  for (const channel of mainChannels) {
    if (!preloadChannels.has(channel)) {
      results.security.warnings.push({
        severity: 'low',
        message: `チャネル "${channel}" はMainで定義されていますが、使用されていません`,
      });
    }
  }
}

async function main() {
  console.log('🔍 Electron IPC分析を開始...\n');
  console.log(`📁 プロジェクト: ${projectDir}\n`);

  try {
    // TypeScript/JavaScriptファイルを検索
    const files = await glob('**/*.{ts,tsx,js,jsx,mjs}', {
      cwd: projectDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
      absolute: true,
    });

    console.log(`📄 ${files.length} ファイルを分析中...\n`);

    for (const file of files) {
      await analyzeFile(file);
    }

    await findUnmatchedChannels();

    // 結果を表示
    console.log('═══════════════════════════════════════');
    console.log('📡 IPCチャネル一覧');
    console.log('═══════════════════════════════════════\n');

    console.log('Main Process:');
    console.log('  handle:', results.channels.main.handle.map(c => c.channel).join(', ') || 'なし');
    console.log('  on:', results.channels.main.on.map(c => c.channel).join(', ') || 'なし');

    console.log('\nPreload:');
    console.log('  invoke:', results.channels.preload.invoke.map(c => c.channel).join(', ') || 'なし');
    console.log('  send:', results.channels.preload.send.map(c => c.channel).join(', ') || 'なし');
    console.log('  on:', results.channels.preload.on.map(c => c.channel).join(', ') || 'なし');

    console.log('\n═══════════════════════════════════════');
    console.log('🛡️ セキュリティ分析');
    console.log('═══════════════════════════════════════\n');

    if (results.security.issues.length === 0 && results.security.warnings.length === 0) {
      console.log('✅ セキュリティ問題は検出されませんでした\n');
    } else {
      for (const issue of results.security.issues) {
        console.log(`❌ [${issue.severity.toUpperCase()}] ${issue.message}`);
        if (issue.file) console.log(`   ファイル: ${issue.file}`);
      }

      for (const warning of results.security.warnings) {
        console.log(`⚠️  [${warning.severity.toUpperCase()}] ${warning.message}`);
        if (warning.file) console.log(`   ファイル: ${warning.file}`);
      }
      console.log();
    }

    // サマリー
    const totalChannels =
      results.channels.main.handle.length +
      results.channels.main.on.length;
    const totalIssues = results.security.issues.length;
    const totalWarnings = results.security.warnings.length;

    console.log('═══════════════════════════════════════');
    console.log('📊 サマリー');
    console.log('═══════════════════════════════════════\n');
    console.log(`IPCチャネル数: ${totalChannels}`);
    console.log(`セキュリティ問題: ${totalIssues}`);
    console.log(`警告: ${totalWarnings}`);
    console.log();

  } catch (error) {
    console.error('エラー:', error.message);
    process.exit(1);
  }
}

main();
