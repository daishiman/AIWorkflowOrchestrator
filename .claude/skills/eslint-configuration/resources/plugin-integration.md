# ESLint Plugin Integration

## プラグインの役割

ESLintプラグインは、特定のフレームワークやパターンに対する専用ルールを提供します。

## 必須プラグイン

### TypeScript

**プラグイン**: `@typescript-eslint/eslint-plugin`

**インストール**:
```bash
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**設定**:
```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "plugin:@typescript-eslint/recommended"
  ]
}
```

**主要ルール**:
- `@typescript-eslint/no-unused-vars`: TypeScript版未使用変数
- `@typescript-eslint/no-explicit-any`: any使用警告
- `@typescript-eslint/explicit-function-return-type`: 関数戻り値型必須

### React

**プラグイン**: `eslint-plugin-react`, `eslint-plugin-react-hooks`

**インストール**:
```bash
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks
```

**設定**:
```json
{
  "plugins": ["react", "react-hooks"],
  "extends": [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

**主要ルール**:
- `react-hooks/rules-of-hooks`: Hooksルール違反検出
- `react-hooks/exhaustive-deps`: useEffect依存配列検証
- `react/prop-types`: PropTypes検証（TypeScript使用時はoff）

## 推奨プラグイン

### eslint-plugin-import

**目的**: インポート順序、循環依存検出

**インストール**:
```bash
pnpm add -D eslint-plugin-import
```

**設定**:
```json
{
  "plugins": ["import"],
  "extends": ["plugin:import/recommended", "plugin:import/typescript"],
  "rules": {
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always"
      }
    ],
    "import/no-cycle": "error"
  }
}
```

### eslint-plugin-boundaries

**目的**: アーキテクチャルール強制（Clean Architecture等）

**インストール**:
```bash
pnpm add -D eslint-plugin-boundaries
```

**設定例（ハイブリッドアーキテクチャ）**:
```json
{
  "plugins": ["boundaries"],
  "extends": ["plugin:boundaries/recommended"],
  "settings": {
    "boundaries/elements": [
      { "type": "app", "pattern": "app/*" },
      { "type": "features", "pattern": "features/*" },
      { "type": "shared-infrastructure", "pattern": "shared/infrastructure/*" },
      { "type": "shared-core", "pattern": "shared/core/*" }
    ],
    "boundaries/dependency-rules": [
      {
        "from": "app",
        "allow": ["features", "shared-infrastructure", "shared-core"]
      },
      {
        "from": "features",
        "allow": ["shared-infrastructure", "shared-core"]
      },
      {
        "from": "shared-infrastructure",
        "allow": ["shared-core"]
      },
      {
        "from": "shared-core",
        "allow": []
      }
    ]
  }
}
```

### eslint-plugin-security

**目的**: セキュリティ脆弱性検出

**インストール**:
```bash
pnpm add -D eslint-plugin-security
```

**設定**:
```json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn"
  }
}
```

### eslint-plugin-jsx-a11y

**目的**: Reactアクセシビリティ検証

**インストール**:
```bash
pnpm add -D eslint-plugin-jsx-a11y
```

**設定**:
```json
{
  "plugins": ["jsx-a11y"],
  "extends": ["plugin:jsx-a11y/recommended"],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "warn"
  }
}
```

## プラグイン統合パターン

### パターン1: 最小限

```json
{
  "extends": ["eslint:recommended"]
}
```

### パターン2: TypeScript標準

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ]
}
```

### パターン3: React+TypeScript完全版

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ]
}
```

### パターン4: エンタープライズ（全機能）

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:security/recommended",
    "plugin:boundaries/recommended",
    "prettier"
  ]
}
```

## トラブルシューティング

### プラグインが見つからない

**エラー**: `Failed to load plugin 'react'`

**解決**:
```bash
pnpm add -D eslint-plugin-react
```

### extendsの順序エラー

**エラー**: `Definition for rule 'xxx' was not found`

**解決**: extendsの順序を調整（prettierは必ず最後）

### parserOptions.projectエラー

**エラー**: `Parsing error: Cannot read file 'tsconfig.json'`

**解決**:
```json
{
  "parserOptions": {
    "project": "./tsconfig.json"  // 正しいパス指定
  }
}
```

## まとめ

**必須**: TypeScript、React（使用時）
**推奨**: import、jsx-a11y
**高度**: boundaries、security
**最後**: prettier（競合解決）
