# Figma連携戦略ガイド

## 概要

デザイナーとエンジニアの間の**Single Source of Truth**を確立し、
デザインとコードの乖離を防ぐための連携戦略を定義します。

---

## 連携フロー概要

```
┌─────────────────────────────────────────────────────┐
│                  Figma (デザイン)                    │
│  ・Variables (色、スペーシング等)                    │
│  ・コンポーネント定義                               │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│           Tokens Studio / Design Tokens Plugin       │
│  ・Figma変数をJSONにエクスポート                     │
│  ・自動同期設定                                      │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  tokens.json                         │
│  ・デザイントークンのJSONファイル                    │
│  ・Gitでバージョン管理                              │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│           Style Dictionary / Token Transformer       │
│  ・プラットフォーム別に変換                         │
│  ・CSS Variables / Tailwind / TypeScript生成        │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  コードベース                        │
│  ・dist/tokens.css                                  │
│  ・dist/tokens.ts                                   │
│  ・tailwind.config.js                               │
└─────────────────────────────────────────────────────┘
```

---

## Figma側の設定

### Variables構造

```
Collections/
├── Global/
│   ├── Colors
│   │   ├── blue/50-900
│   │   ├── gray/50-900
│   │   └── ...
│   ├── Spacing
│   │   ├── 0, 1, 2, 4, 6, 8...
│   │   └── ...
│   └── Typography
│       ├── font-family
│       ├── font-size
│       └── ...
├── Semantic/
│   ├── Colors
│   │   ├── primary
│   │   ├── secondary
│   │   └── text/primary, secondary
│   └── ...
└── Component/
    ├── Button
    │   ├── bg/primary, secondary
    │   └── padding/x, y
    └── ...
```

### 命名規則

```
[collection]/[category]/[name]

例:
global/color/blue-500
semantic/color/primary
component/button/bg-primary
```

---

## トークン同期の実装

### Tokens Studio設定

```json
// tokens.config.json
{
  "source": {
    "figma": {
      "fileKey": "YOUR_FIGMA_FILE_KEY",
      "accessToken": "${FIGMA_ACCESS_TOKEN}"
    }
  },
  "output": {
    "format": "json",
    "path": "./tokens"
  },
  "sync": {
    "bidirectional": false,
    "onPush": ["validate", "build"]
  }
}
```

### エクスポートされるJSON形式

```json
{
  "color": {
    "global": {
      "blue": {
        "500": {
          "value": "#3B82F6",
          "type": "color"
        }
      }
    },
    "semantic": {
      "primary": {
        "value": "{color.global.blue.500}",
        "type": "color"
      }
    }
  },
  "spacing": {
    "4": {
      "value": "16px",
      "type": "dimension"
    }
  }
}
```

---

## Style Dictionary変換

### 設定ファイル

```javascript
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: {
          outputReferences: true
        }
      }]
    },
    typescript: {
      transformGroup: 'js',
      buildPath: 'dist/ts/',
      files: [{
        destination: 'tokens.ts',
        format: 'typescript/es6-declarations'
      }]
    },
    tailwind: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [{
        destination: 'tailwind-tokens.js',
        format: 'javascript/module-flat'
      }]
    }
  }
};
```

### 出力例

**CSS Variables (dist/css/variables.css)**:
```css
:root {
  --color-global-blue-500: #3B82F6;
  --color-semantic-primary: var(--color-global-blue-500);
  --spacing-4: 16px;
}
```

**TypeScript (dist/ts/tokens.ts)**:
```typescript
export const color = {
  global: {
    blue: {
      500: '#3B82F6',
    },
  },
  semantic: {
    primary: 'var(--color-semantic-primary)',
  },
};

export const spacing = {
  4: '16px',
};
```

**Tailwind Config (dist/tailwind-tokens.js)**:
```javascript
module.exports = {
  colors: {
    blue: {
      500: '#3B82F6',
    },
    primary: 'var(--color-semantic-primary)',
  },
  spacing: {
    4: '16px',
  },
};
```

---

## CI/CD統合

### GitHub Actions ワークフロー

```yaml
# .github/workflows/design-tokens.yml
name: Design Tokens Sync

on:
  push:
    paths:
      - 'tokens/**'
  workflow_dispatch:

jobs:
  build-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm ci

      - name: Validate tokens
        run: pnpm run tokens:validate

      - name: Build tokens
        run: pnpm run tokens:build

      - name: Create PR with changes
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: update design tokens'
          commit-message: 'chore: update design tokens'
          branch: design-tokens-update
```

### package.json スクリプト

```json
{
  "scripts": {
    "tokens:pull": "tokens-studio pull",
    "tokens:validate": "node scripts/validate-tokens.mjs",
    "tokens:build": "style-dictionary build",
    "tokens:sync": "pnpm run tokens:pull && pnpm run tokens:validate && pnpm run tokens:build"
  }
}
```

---

## 変更管理フロー

### 通常フロー

```
1. デザイナーがFigmaでトークンを変更
   ↓
2. Tokens Studioでエクスポート
   ↓
3. PRが自動作成される
   ↓
4. エンジニアがレビュー
   ↓
5. マージ後、CI/CDで自動ビルド
```

### 緊急修正フロー

```
1. エンジニアがコードでトークンを修正
   ↓
2. PRをマージ
   ↓
3. デザイナーに通知（Slack等）
   ↓
4. Figmaを更新して同期
```

---

## トラブルシューティング

### よくある問題

#### 1. 値の不一致

**症状**: Figmaとコードで色が異なる

**原因**:
- 同期が古い
- 参照が壊れている

**解決策**:
```bash
pnpm run tokens:sync
git diff tokens/
```

#### 2. 変換エラー

**症状**: Style Dictionaryがエラー

**原因**:
- 無効な参照
- 形式の不一致

**解決策**:
```bash
pnpm run tokens:validate
# エラー箇所を確認して修正
```

#### 3. Tailwind反映されない

**症状**: Tailwindに新しい色がない

**原因**:
- tailwind.config.jsの更新漏れ
- キャッシュ

**解決策**:
```bash
pnpm run tokens:build
# tailwind.config.jsを確認
# 開発サーバーを再起動
```

---

## チェックリスト

### 初期設定時

- [ ] Figma Variablesが適切に構造化されているか
- [ ] Tokens Studioが設定されているか
- [ ] Style Dictionary設定が作成されているか
- [ ] CI/CDパイプラインが設定されているか

### 変更時

- [ ] 変更がFigmaから開始されたか
- [ ] PRでレビューされたか
- [ ] 変換後の出力が正しいか
- [ ] 既存コンポーネントへの影響を確認したか

### 運用時

- [ ] 定期的な同期が行われているか
- [ ] 乖離が発生していないか
- [ ] ドキュメントが最新か
