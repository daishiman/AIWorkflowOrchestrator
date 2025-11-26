# lint-staged Patterns

## 基本パターン

### パターン1: ESLint + Prettier

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**実行順**: ESLint → Prettier

### パターン2: ファイルタイプ別

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

### パターン3: ディレクトリ別

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "tests/**/*.test.ts": ["eslint --fix"],
    "*.md": ["prettier --write"]
  }
}
```

## 高度なパターン

### 関連テスト実行

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
    `vitest related --run ${filenames.join(' ')}`
  ]
};
```

**効果**: 変更ファイルに関連するテストのみ実行

### 型チェック追加

```javascript
module.exports = {
  '*.{ts,tsx}': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    'tsc --noEmit',  // 全体の型チェック
    `prettier --write ${filenames.join(' ')}`
  ]
};
```

**注意**: `tsc`は全体チェックなので遅い

### 条件分岐

```javascript
module.exports = {
  '*.{ts,tsx}': (filenames) => {
    const commands = ['eslint --fix'];

    // テストファイルならカバレッジチェック
    if (filenames.some(f => f.includes('.test.'))) {
      commands.push('vitest --coverage');
    }

    commands.push('prettier --write');
    return commands.map(cmd => `${cmd} ${filenames.join(' ')}`);
  }
};
```

## パフォーマンス最適化

### パターン1: chunkSize調整

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': {
    chunkSize: 10,  // 10ファイルずつ処理
    commands: ['eslint --fix', 'prettier --write']
  }
};
```

### パターン2: キャッシュ活用

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --cache --fix",
      "prettier --cache --write"
    ]
  }
}
```

### パターン3: 並列実行制御

```javascript
module.exports = {
  concurrent: true,  // 並列実行（デフォルト）
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write']
};
```

## エラーハンドリング

### 一部失敗時の継続

**デフォルト**: 1ファイルでもエラーならコミット中止

**継続設定**:
```javascript
module.exports = {
  '*.{ts,tsx}': {
    commands: ['eslint --fix', 'prettier --write'],
    continueOnError: false  // デフォルト
  }
};
```

### エラー詳細出力

```bash
# デバッグモード
DEBUG=lint-staged* git commit
```

## グロブパターン

### 基本パターン

- `*.js`: カレントディレクトリのJSファイル
- `**/*.js`: すべてのサブディレクトリのJSファイル
- `src/**/*.ts`: srcディレクトリ配下のTSファイル

### 除外パターン

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix"],
    "!**/*.test.ts": ["eslint --fix"]  // テスト除外
  }
}
```

**別解**: `.eslintignore`で除外

### 複数拡張子

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs,cjs}": ["eslint --fix"]
  }
}
```

## コマンド形式

### 配列形式

```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**実行**: 順次実行

### 関数形式

```javascript
module.exports = {
  '*.ts': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`
  ]
};
```

**利点**: ファイル名リストを動的に操作可能

### 文字列形式

```json
{
  "lint-staged": {
    "*.ts": "eslint --fix"
  }
}
```

**実行**: ファイル名が自動で引数に追加

## 統合例

### Monorepo

```javascript
module.exports = {
  'packages/*/src/**/*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  'apps/*/src/**/*.{ts,tsx}': [
    'eslint --fix',
    'vitest related --run'
  ]
};
```

### Markdown + コード

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.md": ["prettier --write", "markdownlint --fix"]
  }
}
```

## まとめ

**基本構成**:
- ソースコード: ESLint → Prettier
- 設定/ドキュメント: Prettierのみ

**最適化**:
- chunkSize調整
- キャッシュ有効化
- 対象ファイル絞り込み

**高度な使用**:
- 関数形式で条件分岐
- 関連テスト実行
- Monorepo対応
