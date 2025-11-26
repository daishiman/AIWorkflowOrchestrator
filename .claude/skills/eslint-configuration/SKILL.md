---
name: eslint-configuration
description: |
  ESLintルール設定とカスタマイズの専門知識。
  プロジェクト品質基準に基づくルールセット選択、パーサー設定、プラグイン統合を行います。

  使用タイミング:
  - ESLint設定ファイル（.eslintrc.*）を作成・更新する時
  - プロジェクトに適したルールセットを選択する時
  - TypeScript/JavaScript向けパーサー設定が必要な時
  - プラグイン（React、境界チェック等）を統合する時
  - Prettierとの競合ルールを解決する時
version: 1.0.0
---

# ESLint Configuration Skill

## 概要

このスキルは、Nicholas C. Zakas（ESLint作者）の『Maintainable JavaScript』に基づく、
プロジェクト品質基準に適したESLint設定の設計と実装を支援します。

## コア概念

### 1. ESLintアーキテクチャ

**プラグイン拡張機構**:
- カスタムルールの追加
- エコシステム統合（React、TypeScript、Import等）

**共有設定継承**:
- `extends`によるベース設定の継承
- ルールのオーバーライドと段階的厳格化

**パーサー指定**:
- TypeScript: `@typescript-eslint/parser`
- Babel: `@babel/eslint-parser`
- デフォルト: Espree

**環境設定**:
- `env`: ブラウザ、Node.js、ES6等のグローバル変数定義

### 2. ルール選択の判断基準

**必須（error）**:
- バグを引き起こす可能性が高いルール
- 例: `no-unused-vars`, `no-undef`, `no-unreachable`

**推奨（warn）**:
- 保守性向上、即座の修正不要
- 例: `prefer-const`, `no-console`

**無効（off）**:
- プロジェクト方針と不一致
- フォーマッターと競合
- 例: `quotes`（Prettierと競合）

### 3. プロジェクト別設定戦略

**TypeScriptプロジェクト**:
```yaml
推奨ベース:
  - eslint:recommended
  - plugin:@typescript-eslint/recommended
  - plugin:@typescript-eslint/recommended-requiring-type-checking
パーサー: @typescript-eslint/parser
```

**Reactプロジェクト**:
```yaml
推奨ベース:
  - plugin:react/recommended
  - plugin:react-hooks/recommended
  - plugin:jsx-a11y/recommended (アクセシビリティ)
```

**Next.jsプロジェクト**:
```yaml
推奨ベース:
  - next/core-web-vitals
  - next/typescript
```

## 設計原則

1. **段階的厳格化**: 初期は緩め、プロジェクト成熟で厳格化
2. **チーム合意**: ルール選択はチーム全体で合意
3. **実用主義**: 完璧より80%の品質を100%に適用
4. **自動化**: ツールによる品質保証、人間の意志に依存しない

## ルールカテゴリ

### エラー検出
- `no-unused-vars`: 未使用変数検出
- `no-undef`: 未定義変数検出
- `no-unreachable`: 到達不可能コード検出

### ベストプラクティス
- `prefer-const`: 再代入なし変数をconstに
- `eqeqeq`: === 使用強制
- `no-var`: varの使用禁止

### スタイル（Prettierと競合注意）
- `indent`: インデント（Prettierに委譲推奨）
- `quotes`: クォートスタイル（Prettierに委譲推奨）
- `semi`: セミコロン（Prettierに委譲推奨）

## 詳細リソース

詳細な設定パターンとルール説明は以下を参照:

```bash
# ルール選択ガイド
cat .claude/skills/eslint-configuration/resources/rule-selection-guide.md

# パーサー設定詳細
cat .claude/skills/eslint-configuration/resources/parser-configuration.md

# プラグイン統合パターン
cat .claude/skills/eslint-configuration/resources/plugin-integration.md
```

## テンプレート

```bash
# TypeScript基本設定
cat .claude/skills/eslint-configuration/templates/typescript-base.json

# React+TypeScript設定
cat .claude/skills/eslint-configuration/templates/react-typescript.json

# Next.js設定
cat .claude/skills/eslint-configuration/templates/nextjs.json
```

## スクリプト

```bash
# ESLint設定検証
node .claude/skills/eslint-configuration/scripts/validate-config.mjs .eslintrc.json
```

## 関連スキル

- `.claude/skills/prettier-integration/SKILL.md`: Prettier統合と競合解決
- `.claude/skills/static-analysis/SKILL.md`: 複雑度メトリクス設定
- `.claude/skills/code-style-guides/SKILL.md`: スタイルガイド選択

## 参考文献

- **『Maintainable JavaScript』** Nicholas C. Zakas著
  - Chapter 1: Basic Formatting
  - Chapter 8: Avoid Nulls
  - Chapter 13: Build and Deploy Process
- **ESLint公式ドキュメント**: https://eslint.org/docs/
