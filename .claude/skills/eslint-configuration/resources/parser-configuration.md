# ESLint Parser Configuration

## パーサーの役割

ESLintはデフォルトでEspreeパーサーを使用しますが、
TypeScriptやモダンJavaScript構文を解析するには専用パーサーが必要です。

## 主要パーサー

### 1. @typescript-eslint/parser

**用途**: TypeScriptプロジェクト

**設定**:
```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"  // 型チェックルール有効化
  }
}
```

**型チェックルール有効化**:
```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parserOptions": {
    "project": true  // 自動tsconfig.json検出
  }
}
```

**パフォーマンス考慮**:
- `project`指定は遅い（型情報が必要なルールのみ）
- 不要なら`project`を省略

### 2. @babel/eslint-parser

**用途**: Babel使用プロジェクト、最新JS構文

**設定**:
```json
{
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "requireConfigFile": false,
    "babelOptions": {
      "presets": ["@babel/preset-react"]
    }
  }
}
```

### 3. Espree（デフォルト）

**用途**: バニラJavaScript

**設定**:
```json
{
  "parserOptions": {
    "ecmaVersion": 2024,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true  // JSX有効化
    }
  }
}
```

## parserOptions詳細

### ecmaVersion
- `3`, `5`, `2015` (ES6), ..., `2024`
- `"latest"`: 最新版（推奨）

### sourceType
- `"script"`: 従来のスクリプト
- `"module"`: ES Modules（import/export）

### ecmaFeatures
```json
{
  "ecmaFeatures": {
    "jsx": true,              // JSX構文
    "globalReturn": false,    // グローバルreturn
    "impliedStrict": true     // strictモード
  }
}
```

### project（TypeScript専用）
```json
{
  "project": [
    "./tsconfig.json",
    "./tsconfig.node.json"  // 複数tsconfig対応
  ]
}
```

## プロジェクト別推奨設定

### TypeScript + React + Next.js

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ]
}
```

### TypeScript + Node.js

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "env": {
    "node": true,
    "es2024": true
  }
}
```

### JavaScript + React（Babel）

```json
{
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "requireConfigFile": false,
    "babelOptions": {
      "presets": ["@babel/preset-react"]
    }
  }
}
```

## トラブルシューティング

### パーサーエラー: "Parsing error: ..."

**原因**: パーサーが構文を理解できない

**解決策**:
1. パーサーバージョン確認
2. `parserOptions`を見直し
3. TypeScriptなら`tsconfig.json`パス確認

### 型チェックルールが動作しない

**原因**: `project`オプションが未設定

**解決策**:
```json
{
  "parserOptions": {
    "project": true  // または明示的にパス指定
  }
}
```

### パフォーマンスが遅い

**原因**: `project`オプション使用による型チェック

**解決策**:
- 型チェック不要なルールのみなら`project`を削除
- または`.eslintignore`で対象ファイル絞り込み

## まとめ

**選択基準**:
- TypeScript → `@typescript-eslint/parser`
- Babel使用 → `@babel/eslint-parser`
- バニラJS → Espree（デフォルト）

**パフォーマンス**:
- `project`は必要な時のみ
- 対象ファイルを`.eslintignore`で絞る
