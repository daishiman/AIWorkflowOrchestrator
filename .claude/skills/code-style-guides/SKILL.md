---
name: code-style-guides
description: |
  業界標準コードスタイルガイドの選択と適用の専門知識。
  Airbnb、Google、Standard等のスタイルガイド適用とカスタマイズを行います。

  使用タイミング:
  - プロジェクトのスタイルガイドを選択する時
  - 既存コードパターンに基づいてスタイルを決定する時
  - チーム規約とスタイルガイドを整合させる時
  - カスタムスタイルルールを設計する時
  - スタイルガイド移行を計画する時
version: 1.0.0
---

# Code Style Guides Skill

## 概要

このスキルは、主要なJavaScript/TypeScriptスタイルガイドの選択と適用を支援します。

## 主要スタイルガイド

### 1. Airbnb JavaScript Style Guide

**特徴**:
- 最も広範なコミュニティ採用
- 厳格なルールセット
- React推奨設定あり

**適用方法**:
```json
{
  "extends": [
    "airbnb-base",  // JavaScript
    "airbnb",       // React含む
    "airbnb-typescript"  // TypeScript
  ]
}
```

**主要ルール**:
- セミコロン必須
- シングルクォート推奨
- 末尾カンマ推奨
- アロー関数優先

**適用プロジェクト**:
- React/TypeScriptプロジェクト
- 高品質基準を求めるチーム
- コミュニティ標準に従いたい場合

### 2. Google JavaScript Style Guide

**特徴**:
- Google社内標準
- 実用主義
- TypeScript公式推奨に近い

**適用方法**:
```json
{
  "extends": ["google"]
}
```

**主要ルール**:
- セミコロン必須
- シングルクォート推奨
- インデント2スペース
- const/let推奨（var禁止）

**適用プロジェクト**:
- エンタープライズプロジェクト
- TypeScript中心の開発
- 実用性重視

### 3. Standard JS

**特徴**:
- セミコロンなし
- 設定ゼロ（opinionated）
- シンプル

**適用方法**:
```json
{
  "extends": ["standard"]
}
```

**主要ルール**:
- セミコロンなし
- シングルクォート
- インデント2スペース
- スペース多用

**適用プロジェクト**:
- 設定を最小化したい場合
- セミコロンなし派
- Node.jsプロジェクト

## カスタマイズ戦略

### ベース継承 + オーバーライド

```json
{
  "extends": ["airbnb-base"],
  "rules": {
    // プロジェクト固有ルールで上書き
    "no-console": "off",  // 開発中はconsole許可
    "max-len": ["error", { "code": 100 }]  // 行長を100に緩和
  }
}
```

### 段階的適用

**Phase 1: 基本ルールのみ**:
- eslint:recommended
- 必須エラールールのみ

**Phase 2: スタイルガイド導入**:
- airbnb-base追加
- warnレベルで運用

**Phase 3: 厳格化**:
- warnをerrorに格上げ
- 追加ルール有効化

## スタイルガイド選択フローチャート

```
プロジェクトタイプ?
├─ React? → Airbnb
├─ TypeScript? → Airbnb TypeScript or Google
├─ Node.js? → Standard or Airbnb Base
└─ シンプル重視? → Standard
```

## 既存コード分析

### パターン検出

**インデント**:
```bash
# スペース使用率を確認
grep -r "^  " src/ | wc -l  # 2スペース
grep -r "^    " src/ | wc -l  # 4スペース
grep -r "^\t" src/ | wc -l  # タブ
```

**セミコロン**:
```bash
# セミコロン使用率
grep -r ";" src/**/*.js | wc -l
```

## 詳細リソース

```bash
# スタイルガイド比較
cat .claude/skills/code-style-guides/resources/style-guide-comparison.md

# カスタマイズパターン
cat .claude/skills/code-style-guides/resources/customization-patterns.md

# 移行戦略
cat .claude/skills/code-style-guides/resources/migration-strategies.md
```

## テンプレート

```bash
# Airbnb基本設定
cat .claude/skills/code-style-guides/templates/airbnb-base.json

# Google設定
cat .claude/skills/code-style-guides/templates/google.json

# Standard設定
cat .claude/skills/code-style-guides/templates/standard.json
```

## スクリプト

```bash
# スタイル自動検出
node .claude/skills/code-style-guides/scripts/detect-style.mjs [src-directory]
```

## 関連スキル

- `.claude/skills/eslint-configuration/SKILL.md`: ESLint設定基盤
- `.claude/skills/prettier-integration/SKILL.md`: フォーマット統合

## 参考文献

- **Airbnb JavaScript Style Guide**: https://github.com/airbnb/javascript
- **Google JavaScript Style Guide**: https://google.github.io/styleguide/jsguide.html
- **StandardJS**: https://standardjs.com/
- **『Clean Code』** Robert C. Martin著
