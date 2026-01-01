# Style Guide Customization Patterns

## カスタマイズの原則

### 1. ベース継承 + オーバーライド

**推奨アプローチ**: スタイルガイドをベースに、プロジェクト固有ルールで上書き

```json
{
  "extends": ["airbnb-base"],
  "rules": {
    // プロジェクト固有調整
    "no-console": "warn", // Airbnbはerror、開発中はwarn
    "max-len": "off" // Prettierに委譲
  }
}
```

### 2. 段階的厳格化

**Phase 1: 緩い設定**:

```json
{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": "warn", // warn開始
    "prefer-const": "warn"
  }
}
```

**Phase 2: スタイルガイド追加**:

```json
{
  "extends": ["airbnb-base"],
  "rules": {
    "no-console": "warn", // 一部緩和
    "import/prefer-default-export": "off"
  }
}
```

**Phase 3: 厳格化**:

```json
{
  "extends": ["airbnb-base"],
  "rules": {
    "no-console": "error", // errorに格上げ
    "complexity": ["error", 10]
  }
}
```

## 一般的なカスタマイズパターン

### パターン1: no-console緩和

**Airbnbデフォルト**: `error`

**開発環境での調整**:

```json
{
  "rules": {
    "no-console": "warn"
  },
  "overrides": [
    {
      "files": ["src/**/*.ts"],
      "excludedFiles": ["*.test.ts"],
      "rules": {
        "no-console": "error" // 本番コードは厳格
      }
    }
  ]
}
```

### パターン2: 行長調整

**Airbnbデフォルト**: 100文字

**調整**:

```json
{
  "rules": {
    "max-len": "off" // Prettierに委譲
  }
}
```

**Prettier設定**:

```json
{
  "printWidth": 80
}
```

### パターン3: インポート順序

**Airbnbデフォルト**: グルーピングあり

**カスタマイズ**:

```json
{
  "rules": {
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc"
        }
      }
    ]
  }
}
```

### パターン4: 命名規約

**TypeScript命名規約**:

```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      }
    ]
  }
}
```

## 環境別設定

### overrides活用

```json
{
  "extends": ["airbnb-base"],
  "overrides": [
    {
      "files": ["*.test.ts", "*.spec.ts"],
      "rules": {
        "no-unused-expressions": "off", // テストではchai/expect使用
        "@typescript-eslint/no-explicit-any": "off" // テストではany許容
      }
    },
    {
      "files": ["*.config.js", "*.config.ts"],
      "rules": {
        "import/no-default-export": "off" // 設定ファイルはdefault許容
      }
    }
  ]
}
```

### 環境変数ベース

```javascript
// .eslintrc.js
module.exports = {
  extends: ["airbnb-base"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
  },
};
```

## フレームワーク固有カスタマイズ

### Next.js

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@next/next/no-html-link-for-pages": "off", // App Router使用時
    "react/no-unescaped-entities": "off"
  }
}
```

### Vue.js

```json
{
  "extends": ["plugin:vue/vue3-recommended"],
  "rules": {
    "vue/multi-word-component-names": "off", // 単一語コンポーネント許可
    "vue/require-default-prop": "warn"
  }
}
```

### NestJS

```json
{
  "extends": ["airbnb-typescript/base"],
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "class-methods-use-this": "off" // NestJSデコレータ対応
  }
}
```

## プロジェクトタイプ別推奨カスタマイズ

### オープンソースライブラリ

```json
{
  "extends": ["airbnb-base"],
  "rules": {
    "no-console": "error", // 厳格
    "complexity": ["error", 5], // 厳格
    "@typescript-eslint/explicit-function-return-type": "error" // 型必須
  }
}
```

### 社内ツール

```json
{
  "extends": ["airbnb-base"],
  "rules": {
    "no-console": "warn", // 開発ログ許容
    "complexity": ["warn", 15], // やや緩め
    "import/prefer-default-export": "off" // named export優先
  }
}
```

### プロトタイプ

```json
{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": "warn", // 厳しくしない
    "no-console": "off", // デバッグ優先
    "complexity": "off" // 速度優先
  }
}
```

## まとめ

**原則**:

- ベース継承 + 最小限のオーバーライド
- 段階的厳格化
- チーム合意形成

**カスタマイズポイント**:

- no-console: warn or error
- 行長: offまたは調整
- インポート順序: プロジェクト構造に合わせる
- 命名規約: プロジェクト標準に合わせる

**環境別**:

- テストファイル: 緩め
- 設定ファイル: default export許容
- 本番コード: 厳格
