---
name: file-exclusion-patterns
description: |
    ファイル監視システムにおける効率的な除外パターン設計の専門知識。
    .gitignore互換のglob pattern、プラットフォーム固有の一時ファイル除外、
    パフォーマンス最適化のための早期除外戦略を提供。
    使用タイミング:
    - ファイル監視の除外パターンを設計する時
    - .gitignoreからパターンを抽出・変換する時
    - 一時ファイル・システムファイルを除外したい時
    - 監視対象を効率的に絞り込みたい時
    - クロスプラットフォーム対応の除外設定を行う時

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/file-exclusion-patterns/resources/standard-patterns.md`: 標準除外パターンカタログ（node_modules、.git等）
  - `.claude/skills/file-exclusion-patterns/templates/pattern-builder.ts`: パターンビルダーとChokidar変換テンプレート

  Use proactively when implementing file-exclusion-patterns patterns or solving related problems.
version: 1.0.0
---


# File Exclusion Patterns

## 概要

このスキルは、ファイル監視システムにおける除外パターン設計の専門知識を提供します。効率的な除外パターンにより、監視負荷を削減し、不要なイベント発火を防ぎます。

---

## 核心概念

### Glob Patternの基本

| パターン | 意味 | 例 |
|----------|------|-----|
| `*` | 任意の文字列（パス区切り除く） | `*.log` → access.log |
| `**` | 任意の階層のディレクトリ | `**/node_modules` → a/b/node_modules |
| `?` | 任意の1文字 | `file?.txt` → file1.txt |
| `[abc]` | 文字クラス | `[Ff]ile` → File, file |
| `[!abc]` | 否定文字クラス | `[!.]*.js` → .で始まらない.js |
| `!(pattern)` | 否定パターン | `!(*.md)` → .md以外 |
| `{a,b}` | 選択パターン | `*.{js,ts}` → .jsまたは.ts |

### 除外設計の原則

1. **早期除外**: ディレクトリレベルで除外（ファイルレベルより効率的）
2. **明示性**: 暗黙のルールより明示的なパターン
3. **保守性**: .gitignoreとの整合性を維持
4. **プラットフォーム対応**: OS固有ファイルを考慮

---

## 標準除外パターンカタログ

### パッケージマネージャー関連

```typescript
const packageManagerPatterns = [
  // Node.js
  '**/node_modules/**',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',

  // Python
  '**/__pycache__/**',
  '**/*.pyc',
  '**/.venv/**',
  '**/venv/**',

  // その他
  '**/vendor/**',
  '**/bower_components/**',
];
```

### バージョン管理システム

```typescript
const vcsPatterns = [
  '**/.git/**',
  '**/.svn/**',
  '**/.hg/**',
  '**/.bzr/**',
];
```

### ビルド成果物

```typescript
const buildPatterns = [
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/.next/**',
  '**/.nuxt/**',
  '**/.output/**',
  '**/coverage/**',
  '**/.turbo/**',
];
```

### 一時ファイル

```typescript
const tempFilePatterns = [
  // エディタ
  '**/*.swp',
  '**/*.swo',
  '**/*~',
  '**/.#*',
  '**/#*#',

  // Office
  '**/~$*',
  '**/*.tmp',

  // 汎用
  '**/*.temp',
  '**/*.bak',
  '**/*.backup',
  '**/tmp/**',
  '**/temp/**',
];
```

### プラットフォーム固有

```typescript
const platformPatterns = {
  // macOS
  macos: [
    '**/.DS_Store',
    '**/.AppleDouble',
    '**/.LSOverride',
    '**/._*',
    '**/.Spotlight-V100/**',
    '**/.Trashes/**',
  ],

  // Windows
  windows: [
    '**/Thumbs.db',
    '**/ehthumbs.db',
    '**/Desktop.ini',
    '**/$RECYCLE.BIN/**',
  ],

  // Linux
  linux: [
    '**/.directory',
    '**/*~',
  ],
};
```

### IDE/エディタ設定

```typescript
const idePatterns = [
  '**/.idea/**',
  '**/.vscode/**',
  '**/*.sublime-*',
  '**/.project',
  '**/.classpath',
  '**/.settings/**',
];
```

---

## Chokidar向けパターン変換

### .gitignoreからの変換

```typescript
/**
 * .gitignoreパターンをChokidar用に変換
 */
function convertGitignoreToChokidar(gitignoreLine: string): string | null {
  let pattern = gitignoreLine.trim();

  // コメントと空行をスキップ
  if (!pattern || pattern.startsWith('#')) {
    return null;
  }

  // 否定パターンは非対応（スキップ）
  if (pattern.startsWith('!')) {
    return null;
  }

  // 先頭の/を削除（相対パスに変換）
  pattern = pattern.replace(/^\//, '');

  // ディレクトリ指定（末尾の/）
  if (pattern.endsWith('/')) {
    pattern = pattern.slice(0, -1) + '/**';
  }

  // **/プレフィックスがない場合は追加
  if (!pattern.startsWith('**/') && !pattern.startsWith('/')) {
    pattern = '**/' + pattern;
  }

  return pattern;
}
```

### 複合パターンの構築

```typescript
interface ExclusionConfig {
  includePackageManagers: boolean;
  includeVCS: boolean;
  includeBuildArtifacts: boolean;
  includeTempFiles: boolean;
  includePlatformFiles: boolean;
  includeIDEFiles: boolean;
  customPatterns: string[];
}

function buildExclusionPatterns(config: ExclusionConfig): string[] {
  const patterns: string[] = [];

  if (config.includePackageManagers) {
    patterns.push(...packageManagerPatterns);
  }
  if (config.includeVCS) {
    patterns.push(...vcsPatterns);
  }
  if (config.includeBuildArtifacts) {
    patterns.push(...buildPatterns);
  }
  if (config.includeTempFiles) {
    patterns.push(...tempFilePatterns);
  }
  if (config.includePlatformFiles) {
    const platform = process.platform;
    if (platform === 'darwin') {
      patterns.push(...platformPatterns.macos);
    } else if (platform === 'win32') {
      patterns.push(...platformPatterns.windows);
    } else {
      patterns.push(...platformPatterns.linux);
    }
  }
  if (config.includeIDEFiles) {
    patterns.push(...idePatterns);
  }

  patterns.push(...config.customPatterns);

  return [...new Set(patterns)]; // 重複除去
}
```

---

## 推奨パターンセット

### 開発環境（最小）

```typescript
const minimalDevPatterns = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/*.tmp',
  '**/.DS_Store',
];
```

### 開発環境（標準）

```typescript
const standardDevPatterns = [
  // パッケージ
  '**/node_modules/**',

  // VCS
  '**/.git/**',

  // ビルド
  '**/dist/**',
  '**/build/**',
  '**/.next/**',

  // 一時ファイル
  '**/*.swp',
  '**/*~',
  '**/*.tmp',

  // プラットフォーム
  '**/.DS_Store',
  '**/Thumbs.db',

  // ログ
  '**/*.log',
  '**/logs/**',
];
```

### 本番環境（厳格）

```typescript
const productionPatterns = [
  // 標準パターン全て
  ...standardDevPatterns,

  // 追加の除外
  '**/coverage/**',
  '**/.turbo/**',
  '**/.cache/**',
  '**/test/**',
  '**/tests/**',
  '**/__tests__/**',
  '**/*.test.*',
  '**/*.spec.*',
];
```

---

## パターン評価と最適化

### 効率性チェック

```typescript
/**
 * パターンの効率性を評価
 */
function evaluatePatternEfficiency(
  pattern: string
): { efficient: boolean; suggestion?: string } {
  // ディレクトリ優先: ファイルパターンよりディレクトリパターンの方が効率的
  if (!pattern.includes('/**') && !pattern.endsWith('/')) {
    if (!pattern.includes('.')) {
      return {
        efficient: false,
        suggestion: `${pattern}/**（ディレクトリとして除外）`,
      };
    }
  }

  // 曖昧なパターンの警告
  if (pattern === '*' || pattern === '**') {
    return {
      efficient: false,
      suggestion: 'より具体的なパターンを使用してください',
    };
  }

  return { efficient: true };
}
```

### カバレッジ分析

```typescript
/**
 * 除外パターンがカバーするファイル数を推定
 */
async function analyzePatternCoverage(
  watchPath: string,
  patterns: string[]
): Promise<{
  totalFiles: number;
  excludedFiles: number;
  coveragePercent: number;
  patternBreakdown: Map<string, number>;
}> {
  // 実装は用途に応じて
  // micromatchやminimatchを使用してパターンマッチング
}
```

---

## 判断基準チェックリスト

### 設計時

- [ ] 監視対象ディレクトリのファイル構成を把握したか？
- [ ] プロジェクトの.gitignoreを確認したか？
- [ ] 使用するOSのシステムファイルを考慮したか？
- [ ] パッケージマネージャーのロックファイルを除外したか？

### 実装時

- [ ] ディレクトリパターン（`/**`）を優先しているか？
- [ ] パターンの重複がないか？
- [ ] 除外パターンがビジネスに必要なファイルを除外していないか？

### テスト時

- [ ] 意図したファイルが除外されているか？
- [ ] 必要なファイルが監視対象に含まれているか？
- [ ] パフォーマンスが改善されているか？

---

## アンチパターン

### ❌ 避けるべきパターン

```typescript
// 1. 過度に広いパターン
ignored: '*' // すべて除外

// 2. 重複するパターン
ignored: [
  '**/node_modules/**',
  'node_modules/**',      // 重複
  './node_modules/**',    // 重複
]

// 3. ファイル単位の除外（非効率）
ignored: [
  '**/node_modules/package1/file1.js',
  '**/node_modules/package1/file2.js',
  // ディレクトリごと除外すべき
]

// 4. 拡張子のみの除外（意図しない除外の可能性）
ignored: '*.json' // package.jsonも除外される
```

### ✅ 推奨パターン

```typescript
// 1. 具体的なパターン
ignored: '**/node_modules/**'

// 2. 重複のない設計
ignored: ['**/node_modules/**'] // 1つで十分

// 3. ディレクトリ単位の除外
ignored: ['**/node_modules/**'] // 効率的

// 4. 必要に応じた例外
ignored: [
  '**/*.json',
  '!**/package.json', // 例外（Chokidarでは非対応、フィルタリングで対応）
]
```

---

## 関連スキル

- `.claude/skills/event-driven-file-watching/SKILL.md` - ファイル監視
- `.claude/skills/debounce-throttle-patterns/SKILL.md` - イベント最適化
- `.claude/skills/context-optimization/SKILL.md` - パフォーマンス最適化

---

## リソース参照

```bash
# 標準パターンカタログ
cat .claude/skills/file-exclusion-patterns/resources/standard-patterns.md

# .gitignore変換ガイド
cat .claude/skills/file-exclusion-patterns/resources/gitignore-conversion.md

# パターンビルダーテンプレート
cat .claude/skills/file-exclusion-patterns/templates/pattern-builder.ts
```
