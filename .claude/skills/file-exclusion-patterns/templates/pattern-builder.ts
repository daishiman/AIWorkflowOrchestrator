/**
 * ファイル除外パターンビルダー
 *
 * Chokidar向けの除外パターンを構築するためのユーティリティ
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// 型定義
// ============================================================

export interface PatternConfig {
  /** パッケージマネージャー関連を除外 */
  packageManagers?: boolean;
  /** バージョン管理システムを除外 */
  vcs?: boolean;
  /** ビルド成果物を除外 */
  buildArtifacts?: boolean;
  /** 一時ファイルを除外 */
  tempFiles?: boolean;
  /** OS固有ファイルを除外 */
  platformFiles?: boolean;
  /** IDE/エディタ設定を除外 */
  ideFiles?: boolean;
  /** ログファイルを除外 */
  logFiles?: boolean;
  /** テスト関連を除外 */
  testArtifacts?: boolean;
  /** カスタムパターン */
  custom?: string[];
  /** 除外から外すパターン（ホワイトリスト） */
  whitelist?: string[];
}

// ============================================================
// 標準パターン定義
// ============================================================

const PATTERNS = {
  packageManagers: [
    '**/node_modules/**',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',
    '**/__pycache__/**',
    '**/*.pyc',
    '**/venv/**',
    '**/.venv/**',
    '**/vendor/**',
  ],

  vcs: [
    '**/.git/**',
    '**/.svn/**',
    '**/.hg/**',
  ],

  buildArtifacts: [
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/.next/**',
    '**/.nuxt/**',
    '**/.output/**',
    '**/coverage/**',
    '**/.turbo/**',
    '**/.cache/**',
  ],

  tempFiles: [
    '**/*.swp',
    '**/*.swo',
    '**/*~',
    '**/.#*',
    '**/#*#',
    '**/~$*',
    '**/*.tmp',
    '**/*.temp',
    '**/*.bak',
    '**/*.backup',
  ],

  platformFiles: {
    darwin: [
      '**/.DS_Store',
      '**/.AppleDouble',
      '**/.LSOverride',
      '**/._*',
    ],
    win32: [
      '**/Thumbs.db',
      '**/ehthumbs.db',
      '**/Desktop.ini',
      '**/$RECYCLE.BIN/**',
    ],
    linux: [
      '**/.directory',
      '**/*~',
    ],
  },

  ideFiles: [
    '**/.idea/**',
    '**/.vscode/**',
    '**/*.sublime-*',
    '**/.project',
    '**/.classpath',
    '**/.settings/**',
  ],

  logFiles: [
    '**/*.log',
    '**/logs/**',
    '**/npm-debug.log*',
    '**/yarn-debug.log*',
    '**/yarn-error.log*',
  ],

  testArtifacts: [
    '**/coverage/**',
    '**/.nyc_output/**',
    '**/test-results/**',
    '**/playwright-report/**',
  ],
};

// ============================================================
// パターンビルダークラス
// ============================================================

export class ExclusionPatternBuilder {
  private patterns: Set<string> = new Set();
  private whitelist: Set<string> = new Set();

  /**
   * プリセット設定でビルダーを初期化
   */
  static fromConfig(config: PatternConfig): ExclusionPatternBuilder {
    const builder = new ExclusionPatternBuilder();

    if (config.packageManagers !== false) {
      builder.addPackageManagers();
    }
    if (config.vcs !== false) {
      builder.addVCS();
    }
    if (config.buildArtifacts !== false) {
      builder.addBuildArtifacts();
    }
    if (config.tempFiles !== false) {
      builder.addTempFiles();
    }
    if (config.platformFiles !== false) {
      builder.addPlatformFiles();
    }
    if (config.ideFiles) {
      builder.addIDEFiles();
    }
    if (config.logFiles) {
      builder.addLogFiles();
    }
    if (config.testArtifacts) {
      builder.addTestArtifacts();
    }
    if (config.custom) {
      builder.addPatterns(config.custom);
    }
    if (config.whitelist) {
      builder.addToWhitelist(config.whitelist);
    }

    return builder;
  }

  /**
   * 開発環境向けデフォルト設定
   */
  static forDevelopment(): ExclusionPatternBuilder {
    return ExclusionPatternBuilder.fromConfig({
      packageManagers: true,
      vcs: true,
      buildArtifacts: true,
      tempFiles: true,
      platformFiles: true,
      ideFiles: false, // 開発中はIDE設定変更を検知したい場合も
      logFiles: true,
    });
  }

  /**
   * 本番環境向けデフォルト設定
   */
  static forProduction(): ExclusionPatternBuilder {
    return ExclusionPatternBuilder.fromConfig({
      packageManagers: true,
      vcs: true,
      buildArtifacts: true,
      tempFiles: true,
      platformFiles: true,
      ideFiles: true,
      logFiles: true,
      testArtifacts: true,
    });
  }

  // ----------------------------------------------------------
  // パターン追加メソッド
  // ----------------------------------------------------------

  addPackageManagers(): this {
    PATTERNS.packageManagers.forEach((p) => this.patterns.add(p));
    return this;
  }

  addVCS(): this {
    PATTERNS.vcs.forEach((p) => this.patterns.add(p));
    return this;
  }

  addBuildArtifacts(): this {
    PATTERNS.buildArtifacts.forEach((p) => this.patterns.add(p));
    return this;
  }

  addTempFiles(): this {
    PATTERNS.tempFiles.forEach((p) => this.patterns.add(p));
    return this;
  }

  addPlatformFiles(platform?: NodeJS.Platform): this {
    const targetPlatform = platform || process.platform;
    const patterns =
      PATTERNS.platformFiles[targetPlatform as keyof typeof PATTERNS.platformFiles] || [];
    patterns.forEach((p) => this.patterns.add(p));
    return this;
  }

  addAllPlatformFiles(): this {
    Object.values(PATTERNS.platformFiles)
      .flat()
      .forEach((p) => this.patterns.add(p));
    return this;
  }

  addIDEFiles(): this {
    PATTERNS.ideFiles.forEach((p) => this.patterns.add(p));
    return this;
  }

  addLogFiles(): this {
    PATTERNS.logFiles.forEach((p) => this.patterns.add(p));
    return this;
  }

  addTestArtifacts(): this {
    PATTERNS.testArtifacts.forEach((p) => this.patterns.add(p));
    return this;
  }

  addPattern(pattern: string): this {
    this.patterns.add(pattern);
    return this;
  }

  addPatterns(patterns: string[]): this {
    patterns.forEach((p) => this.patterns.add(p));
    return this;
  }

  addToWhitelist(patterns: string[]): this {
    patterns.forEach((p) => this.whitelist.add(p));
    return this;
  }

  // ----------------------------------------------------------
  // .gitignore からの読み込み
  // ----------------------------------------------------------

  addFromGitignore(gitignorePath: string): this {
    try {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      const patterns = this.parseGitignore(content);
      patterns.forEach((p) => this.patterns.add(p));
    } catch (error) {
      // .gitignoreが存在しない場合は無視
    }
    return this;
  }

  private parseGitignore(content: string): string[] {
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && !line.startsWith('!'))
      .map((pattern) => {
        // 先頭の/を削除
        let p = pattern.replace(/^\//, '');
        // ディレクトリ指定の場合
        if (p.endsWith('/')) {
          p = p.slice(0, -1) + '/**';
        }
        // **/プレフィックスがない場合は追加
        if (!p.startsWith('**/')) {
          p = '**/' + p;
        }
        return p;
      });
  }

  // ----------------------------------------------------------
  // ビルド
  // ----------------------------------------------------------

  build(): string[] {
    const result = [...this.patterns];

    // ホワイトリストにあるパターンを除去
    // 注: Chokidarは否定パターンをサポートしないため、
    // フィルタリングは別途実装が必要
    return result.filter((p) => !this.whitelist.has(p));
  }

  /**
   * Chokidar用の ignored オプション形式で返す
   */
  buildForChokidar(): string[] | ((path: string) => boolean) {
    const patterns = this.build();

    if (this.whitelist.size === 0) {
      return patterns;
    }

    // ホワイトリストがある場合は関数形式で返す
    const minimatch = require('minimatch');
    return (filePath: string) => {
      // ホワイトリストにマッチする場合は除外しない
      for (const whitelistPattern of this.whitelist) {
        if (minimatch(filePath, whitelistPattern)) {
          return false;
        }
      }
      // 除外パターンにマッチする場合は除外
      for (const pattern of patterns) {
        if (minimatch(filePath, pattern)) {
          return true;
        }
      }
      return false;
    };
  }
}

// ============================================================
// ユーティリティ関数
// ============================================================

/**
 * デフォルトの除外パターンを取得
 */
export function getDefaultExclusionPatterns(): string[] {
  return ExclusionPatternBuilder.forDevelopment().build();
}

/**
 * 本番環境向けの除外パターンを取得
 */
export function getProductionExclusionPatterns(): string[] {
  return ExclusionPatternBuilder.forProduction().build();
}

/**
 * プロジェクトルートから.gitignoreを読み込んで除外パターンを生成
 */
export function buildPatternsFromProject(projectRoot: string): string[] {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  return ExclusionPatternBuilder.forDevelopment()
    .addFromGitignore(gitignorePath)
    .build();
}

// ============================================================
// 使用例
// ============================================================

/*
import { ExclusionPatternBuilder, getDefaultExclusionPatterns } from './pattern-builder';
import chokidar from 'chokidar';

// 方法1: シンプルなデフォルトパターン
const watcher1 = chokidar.watch('./src', {
  ignored: getDefaultExclusionPatterns(),
});

// 方法2: カスタムビルダー
const patterns = ExclusionPatternBuilder.forDevelopment()
  .addPattern('**\/*.generated.ts')
  .addFromGitignore('./.gitignore')
  .build();

const watcher2 = chokidar.watch('./src', {
  ignored: patterns,
});

// 方法3: 完全カスタム設定
const builder = new ExclusionPatternBuilder()
  .addPackageManagers()
  .addVCS()
  .addTempFiles()
  .addPlatformFiles()
  .addPatterns(['**\/*.secret.*', '**\/.env*']);

const watcher3 = chokidar.watch('./src', {
  ignored: builder.build(),
});
*/
