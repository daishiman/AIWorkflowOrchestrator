# Code Style Guide Comparison

## 主要3スタイルガイド比較

### 1. Airbnb JavaScript Style Guide

**概要**:
- GitHub Stars: 145K+
- 最も広範な採用
- 厳格なルールセット

**主要ルール**:
- セミコロン: **必須**
- クォート: **シングル**
- 末尾カンマ: **推奨**（ES5+）
- インデント: **2スペース**
- アロー関数: **優先**
- const/let: **var禁止**

**extends設定**:
```json
{
  "extends": [
    "airbnb-base",        // JavaScript
    "airbnb",             // React含む
    "airbnb-typescript"   // TypeScript
  ]
}
```

**メリット**:
- コミュニティ標準として認知
- Reactとの相性が良い
- 詳細なドキュメント

**デメリット**:
- 厳格すぎる場合がある
- カスタマイズが必要な場合多い

**適用プロジェクト**:
- React/TypeScript
- コミュニティ標準に従いたい
- 高品質基準

### 2. Google JavaScript Style Guide

**概要**:
- Google社内標準
- 実用主義
- TypeScript公式推奨に近い

**主要ルール**:
- セミコロン: **必須**
- クォート: **シングル**
- インデント: **2スペース**
- const/let: **優先**
- goog.module: **Google固有**

**extends設定**:
```json
{
  "extends": ["google"]
}
```

**メリット**:
- 実用的
- TypeScript推奨スタイルに近い
- 過度に厳格ではない

**デメリット**:
- Airbnbほど詳細でない
- React特化ルールなし

**適用プロジェクト**:
- エンタープライズ
- TypeScript中心
- 実用性重視

### 3. StandardJS

**概要**:
- 設定ゼロ（opinionated）
- セミコロンなし
- シンプル

**主要ルール**:
- セミコロン: **なし**
- クォート: **シングル**
- インデント: **2スペース**
- スペース: **多用**

**extends設定**:
```json
{
  "extends": ["standard"]
}
```

**メリット**:
- 設定不要
- シンプル
- セミコロンなし派に最適

**デメリット**:
- カスタマイズ困難
- セミコロン必須派には不向き
- 企業採用は少なめ

**適用プロジェクト**:
- Node.js
- 設定を最小化したい
- セミコロンなし派

## 比較表

| 項目 | Airbnb | Google | Standard |
|------|--------|--------|----------|
| セミコロン | 必須 | 必須 | なし |
| クォート | シングル | シングル | シングル |
| インデント | 2スペース | 2スペース | 2スペース |
| 末尾カンマ | 推奨 | 任意 | 推奨 |
| アロー関数 | 優先 | 優先 | 優先 |
| React対応 | ✅ | ❌ | ✅ |
| TypeScript対応 | ✅ | ✅ | ✅ |
| カスタマイズ | 容易 | 容易 | 困難 |
| 厳格度 | 高 | 中 | 中 |

## 選択フローチャート

```
セミコロンなし派？
├─ Yes → Standard
└─ No ↓

React使用？
├─ Yes → Airbnb
└─ No ↓

実用主義？
├─ Yes → Google
└─ No → Airbnb Base
```

## プロジェクト別推奨

### React + TypeScript
**推奨**: Airbnb TypeScript
```bash
pnpm add -D eslint-config-airbnb-typescript
```

### Next.js
**推奨**: Next.js公式（Airbnbベース）
```json
{
  "extends": ["next/core-web-vitals"]
}
```

### Node.js API
**推奨**: Airbnb Base or Google
```bash
pnpm add -D eslint-config-airbnb-base
```

### Vue.js
**推奨**: Vue公式（独自）
```json
{
  "extends": ["plugin:vue/vue3-recommended"]
}
```

## カスタマイズ例

### Airbnbベース + プロジェクト調整

```json
{
  "extends": ["airbnb-base", "prettier"],
  "rules": {
    "no-console": "warn",  // Airbnbではerror、開発中はwarn
    "max-len": "off",  // Prettierに委譲
    "import/prefer-default-export": "off"  // Named export優先
  }
}
```

### Google + TypeScript厳格化

```json
{
  "extends": ["google", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",  // 厳格化
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## まとめ

**選択基準**:
- コミュニティ標準 → Airbnb
- 実用主義 → Google
- シンプル/設定ゼロ → Standard

**適用**:
- ベース継承 + プロジェクト調整
- チーム合意形成
- 段階的導入
