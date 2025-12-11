# ESLint Rule Selection Guide

## ルール選択の判断フレームワーク

### 優先度分類

#### P0: 必須（error）

バグや重大な問題を引き起こす可能性が高いルール

**変数・スコープ**:

- `no-unused-vars`: 未使用変数（デッドコード検出）
- `no-undef`: 未定義変数（タイポ検出）
- `no-redeclare`: 再宣言禁止

**制御フロー**:

- `no-unreachable`: 到達不可能コード
- `no-constant-condition`: 定数条件（無限ループ検出）
- `no-dupe-keys`: 重複オブジェクトキー

**非推奨API**:

- `no-deprecated-api`: 非推奨API使用禁止

#### P1: 推奨（warn）

保守性向上、即座の修正不要

**モダン構文**:

- `prefer-const`: 再代入なし変数をconstに
- `prefer-arrow-callback`: アロー関数推奨
- `prefer-template`: テンプレート文字列推奨

**保守性**:

- `no-console`: console.log削除忘れ防止
- `no-debugger`: debugger削除忘れ防止

#### P2: 無効（off）

プロジェクト方針と不一致、または他ツールと競合

**Prettierと競合**:

- `indent`: Prettierに委譲
- `quotes`: Prettierに委譲
- `semi`: Prettierに委譲
- `max-len`: Prettierに委譲

## プロジェクトタイプ別推奨ルール

### TypeScriptプロジェクト

**必須ルール**:

```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-non-null-assertion": "warn"
  }
}
```

**型安全重視の場合**:

```json
{
  "extends": ["plugin:@typescript-eslint/recommended-requiring-type-checking"],
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
```

### Reactプロジェクト

**必須ルール**:

```json
{
  "rules": {
    "react/prop-types": "off", // TypeScript使用時
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/alt-text": "error" // アクセシビリティ
  }
}
```

### Node.jsプロジェクト

**必須ルール**:

```json
{
  "env": {
    "node": true
  },
  "rules": {
    "no-process-exit": "error",
    "no-sync": "warn", // 非同期推奨
    "global-require": "warn"
  }
}
```

## ルール厳格度の判断基準

### 厳格度レベル

**Level 1: 最小限**

- eslint:recommended
- プラグイン推奨設定のみ

**適用ケース**:

- レガシーコードベース移行中
- 初めてのlinter導入

**Level 2: 標準**

- eslint:recommended
- Airbnb/Google ベース
- 一部カスタムルール

**適用ケース**:

- 標準的な開発プロジェクト
- チームスキル中程度

**Level 3: 厳格**

- 全推奨ルール有効
- 複雑度制限厳しめ
- 型チェック必須

**適用ケース**:

- 高信頼性要求（金融、医療等）
- 上級者チーム
- 新規開発

## 段階的適用戦略

### Phase 1: 基礎導入

```json
{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": "error",
    "no-undef": "error"
  }
}
```

### Phase 2: スタイルガイド追加

```json
{
  "extends": ["eslint:recommended", "airbnb-base"],
  "rules": {
    // 一部緩和
    "no-console": "warn", // errorではなくwarn
    "max-len": "off" // 初期は無効
  }
}
```

### Phase 3: 厳格化

```json
{
  "extends": [
    "eslint:recommended",
    "airbnb-base",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "no-console": "error", // warnからerrorへ
    "complexity": ["error", 10],
    "max-lines-per-function": ["error", 50]
  }
}
```

## プラグイン選択ガイド

### 必須プラグイン

**TypeScript**:

- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`

**React**:

- `eslint-plugin-react`
- `eslint-plugin-react-hooks`

**アクセシビリティ**:

- `eslint-plugin-jsx-a11y`

### 推奨プラグイン

**インポート管理**:

- `eslint-plugin-import`: インポート順序、循環依存検出

**セキュリティ**:

- `eslint-plugin-security`: セキュリティ脆弱性検出

**アーキテクチャ**:

- `eslint-plugin-boundaries`: レイヤー間依存関係強制

**テスト**:

- `eslint-plugin-vitest`: Vitestルール
- `eslint-plugin-playwright`: Playwrightルール

## カスタムルール作成

### 基本構造

```javascript
module.exports = {
  rules: {
    "custom-rule-name": {
      meta: {
        type: "problem", // problem | suggestion | layout
        docs: {
          description: "Rule description",
          category: "Best Practices",
        },
        fixable: "code", // 自動修正可能
        schema: [], // オプションスキーマ
      },
      create(context) {
        return {
          // AST訪問関数
          FunctionDeclaration(node) {
            // ルールロジック
          },
        };
      },
    },
  },
};
```

### 適用例

**プロジェクト固有命名規約**:

```javascript
{
  rules: {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I']  // Interface名はI始まり
      }
    ]
  }
}
```

## チーム合意形成

### 合意プロセス

1. **現状分析**: 既存コードのパターン把握
2. **ルール提案**: 3つのレベル（最小/標準/厳格）を提示
3. **段階適用**: 最小→標準→厳格と段階的移行
4. **フィードバック**: 1週間運用後レビュー
5. **調整**: チームの受容性に基づいて調整

### 合意形成の質問

- 「未使用変数はerror? warn?」
- 「複雑度の閾値は？（5/10/15）」
- 「console.logは許可? 禁止?」
- 「TypeScript厳格モードは必須?」

## まとめ

**原則**:

- バグ検出 → 必須（error）
- 保守性向上 → 推奨（warn）
- フォーマット → 無効（Prettierに委譲）

**適用**:

- チームスキルレベルに応じた閾値
- 段階的厳格化
- 定期的レビューと調整
