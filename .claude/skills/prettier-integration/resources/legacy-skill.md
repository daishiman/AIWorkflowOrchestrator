---
name: .claude/skills/prettier-integration/SKILL.md
description: |
  ESLintとPrettierの統合とフォーマット自動化の専門知識。
  責務分離、競合解決、エディタ統合、保存時自動実行を設計します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/prettier-integration/resources/automation-strategies.md`: Prettier Automation Strategies
  - `.claude/skills/prettier-integration/resources/conflict-resolution.md`: Prettier-ESLint Conflict Resolution
  - `.claude/skills/prettier-integration/resources/editor-integration.md`: Prettier Editor Integration
  - `.claude/skills/prettier-integration/scripts/format-check.mjs`: Prettierフォーマット検証スクリプト
  - `.claude/skills/prettier-integration/templates/prettierrc-base.json`: prettierrc-base設定ファイル
  - `.claude/skills/prettier-integration/templates/vscode-settings.json`: vscode-settings設定ファイル

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

このスキルは、ESLint と Prettier の責務分離と効果的な統合戦略を提供します。

## 責務分離の原則

### ESLint 役割

- **コード品質**: 論理エラー、潜在的バグの検出
- **保守性**: 複雑度、関数長、命名規約の検証
- **ベストプラクティス**: アンチパターンの検出

### Prettier 役割

- **コードフォーマット**: インデント、改行、スペース
- **視覚的一貫性**: スタイルの統一
- **スタイル**: クォート、セミコロン、括弧の配置

## 統合戦略

### アプローチ 1: 競合解決（推奨）

**eslint-config-prettier を使用**:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier" // 最後に配置してPrettierと競合するルールを無効化
  ]
}
```

**メリット**:

- ESLint と Prettier を独立実行
- 責務が明確に分離
- パフォーマンス最適化可能

### アプローチ 2: 実行分離

**package.json スクリプト**:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

**実行順序**: `pnpm lint` → `pnpm format`

### アプローチ 3: エディタ統合

**VSCode 設定例** (.vscode/settings.json):

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
2. ESLint 自動修正（--fix）
3. 残るエラーを表示

## 競合ルールの解決

### Prettier に委譲すべき ESLint ルール

以下のルールは無効化（eslint-config-prettier が自動対応）:

- `indent`: Prettier が管理
- `quotes`: Prettier が管理
- `semi`: Prettier が管理
- `max-len`: Prettier が管理
- `comma-dangle`: Prettier が管理
- `arrow-parens`: Prettier が管理
- `object-curly-spacing`: Prettier が管理

### 共存可能な ESLint ルール

以下は ESLint で管理（Prettier と競合しない）:

- `no-unused-vars`: ロジックチェック
- `no-console`: コード品質
- `complexity`: 複雑度制限
- `max-lines-per-function`: 保守性

## 自動フォーマット適用

### コミットフック統合（lint-staged）

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### CI/CD 統合

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

- `.claude/skills/eslint-configuration/SKILL.md`: ESLint ルール設定
- `.claude/skills/commit-hooks/SKILL.md`: コミットフック統合
- `.claude/skills/code-style-guides/SKILL.md`: スタイルガイド選択

## 参考文献

- **Prettier 公式ドキュメント**: https://prettier.io/docs/
- **eslint-config-prettier**: https://github.com/prettier/eslint-config-prettier
- **『Maintainable JavaScript』** Nicholas C. Zakas 著
