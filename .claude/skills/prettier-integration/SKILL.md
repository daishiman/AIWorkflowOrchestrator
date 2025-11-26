---
name: prettier-integration
description: |
  ESLintとPrettierの統合とフォーマット自動化の専門知識。
  責務分離、競合解決、エディタ統合、保存時自動実行を設計します。

  使用タイミング:
  - ESLintとPrettierを統合する時
  - フォーマットルールの競合を解決する時
  - エディタでの保存時自動フォーマットを設定する時
  - lint/formatの責務を分離する時
  - 自動フォーマット適用戦略を設計する時
version: 1.0.0
---

# Prettier Integration Skill

## 概要

このスキルは、ESLintとPrettierの責務分離と効果的な統合戦略を提供します。

## 責務分離の原則

### ESLint役割
- **コード品質**: 論理エラー、潜在的バグの検出
- **保守性**: 複雑度、関数長、命名規約の検証
- **ベストプラクティス**: アンチパターンの検出

### Prettier役割
- **コードフォーマット**: インデント、改行、スペース
- **視覚的一貫性**: スタイルの統一
- **スタイル**: クォート、セミコロン、括弧の配置

## 統合戦略

### アプローチ1: 競合解決（推奨）

**eslint-config-prettierを使用**:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"  // 最後に配置してPrettierと競合するルールを無効化
  ]
}
```

**メリット**:
- ESLintとPrettierを独立実行
- 責務が明確に分離
- パフォーマンス最適化可能

### アプローチ2: 実行分離

**package.jsonスクリプト**:
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

**実行順序**: `pnpm lint` → `pnpm format`

### アプローチ3: エディタ統合

**VSCode設定例** (.vscode/settings.json):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**動作フロー**:
1. 保存時に自動フォーマット（Prettier）
2. ESLint自動修正（--fix）
3. 残るエラーを表示

## 競合ルールの解決

### Prettierに委譲すべきESLintルール

以下のルールは無効化（eslint-config-prettierが自動対応）:

- `indent`: Prettierが管理
- `quotes`: Prettierが管理
- `semi`: Prettierが管理
- `max-len`: Prettierが管理
- `comma-dangle`: Prettierが管理
- `arrow-parens`: Prettierが管理
- `object-curly-spacing`: Prettierが管理

### 共存可能なESLintルール

以下はESLintで管理（Prettierと競合しない）:

- `no-unused-vars`: ロジックチェック
- `no-console`: コード品質
- `complexity`: 複雑度制限
- `max-lines-per-function`: 保守性

## 自動フォーマット適用

### コミットフック統合（lint-staged）

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### CI/CD統合

```yaml
# GitHub Actions例
- name: Check formatting
  run: pnpm format:check

- name: Lint code
  run: pnpm lint
```

## 詳細リソース

```bash
# 競合解決ガイド
cat .claude/skills/prettier-integration/resources/conflict-resolution.md

# エディタ統合パターン
cat .claude/skills/prettier-integration/resources/editor-integration.md

# 自動化戦略
cat .claude/skills/prettier-integration/resources/automation-strategies.md
```

## テンプレート

```bash
# Prettier基本設定
cat .claude/skills/prettier-integration/templates/prettierrc-base.json

# VSCode設定
cat .claude/skills/prettier-integration/templates/vscode-settings.json
```

## スクリプト

```bash
# フォーマット検証
node .claude/skills/prettier-integration/scripts/format-check.mjs [target-directory]
```

## 関連スキル

- `.claude/skills/eslint-configuration/SKILL.md`: ESLintルール設定
- `.claude/skills/commit-hooks/SKILL.md`: コミットフック統合
- `.claude/skills/code-style-guides/SKILL.md`: スタイルガイド選択

## 参考文献

- **Prettier公式ドキュメント**: https://prettier.io/docs/
- **eslint-config-prettier**: https://github.com/prettier/eslint-config-prettier
- **『Maintainable JavaScript』** Nicholas C. Zakas著
