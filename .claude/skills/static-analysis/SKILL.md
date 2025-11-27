---
name: static-analysis
description: |
  静的解析メトリクスと品質指標の専門知識。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/static-analysis/resources/code-smells.md`: Code Smellsリソース
  - `.claude/skills/static-analysis/resources/complexity-metrics.md`: Complexity Metricsリソース
  - `.claude/skills/static-analysis/resources/threshold-guidelines.md`: Threshold Guidelinesリソース

  - `.claude/skills/static-analysis/templates/basic-metrics.json`: Basic Metricsテンプレート
  - `.claude/skills/static-analysis/templates/strict-metrics.json`: Strict Metricsテンプレート

  - `.claude/skills/static-analysis/scripts/analyze-complexity.mjs`: Analyze Complexityスクリプト

version: 1.0.0
---

# Static Analysis Skill

## 概要

このスキルは、Evan Burchard『Refactoring JavaScript』に基づく、
コード複雑度測定と品質メトリクス設定を支援します。

## メトリクス種別

### 1. 複雑度指標

**循環的複雑度（Cyclomatic Complexity）**:

- 定義: コード内の独立した経路数
- 測定: if, for, while, case 等の分岐点をカウント
- ESLint ルール: `complexity`
- 推奨閾値:
  - 低: ≤5（単純な関数）
  - 中: 6-10（標準的な関数）
  - 高: 11-20（複雑、リファクタリング推奨）
  - 非常に高: >20（テスト困難、即座にリファクタリング）

**認知的複雑度（Cognitive Complexity）**:

- 定義: 人間が理解するコストを測定
- 循環的複雑度との違い: ネストを重視
- ESLint プラグイン: `eslint-plugin-sonarjs`
- 推奨閾値: ≤15

**ネスト深度（Nesting Depth）**:

- 定義: コードブロックの入れ子レベル
- ESLint ルール: `max-depth`
- 推奨閾値: ≤4

### 2. 規模指標

**関数長（Lines per Function）**:

- ESLint ルール: `max-lines-per-function`
- 推奨閾値: ≤50 行
- 根拠: Robert C. Martin『Clean Code』- 小さな関数原則

**ファイル行数（Lines per File）**:

- ESLint ルール: `max-lines`
- 推奨閾値: ≤300 行
- 例外: 設定ファイル、型定義

**パラメータ数（Parameters per Function）**:

- ESLint ルール: `max-params`
- 推奨閾値: ≤3
- 超過時: オブジェクトパラメータ化を検討

### 3. 保守性指標

**重複コード率**:

- ESLint プラグイン: `eslint-plugin-sonarjs`
- ルール: `no-duplicate-string`, `no-identical-functions`

**コメント率**:

- 目標: 10-20%（過度なコメントは自己説明性の欠如を示唆）

**命名規約遵守率**:

- ESLint ルール: `camelcase`, `@typescript-eslint/naming-convention`

### 4. 技術的負債指標

**コード臭（Code Smells）**:

- 長すぎるメソッド: `max-lines-per-function`
- 長すぎるパラメータリスト: `max-params`
- 重複コード: `no-duplicate-string`
- 深いネスト: `max-depth`

## 閾値設定戦略

### チームスキルレベル考慮

**初級者多数**:

```json
{
  "rules": {
    "complexity": ["error", 15],
    "max-lines-per-function": ["warn", 80],
    "max-depth": ["error", 5]
  }
}
```

**上級者チーム**:

```json
{
  "rules": {
    "complexity": ["error", 8],
    "max-lines-per-function": ["error", 40],
    "max-depth": ["error", 3]
  }
}
```

### コードベース特性

**レガシー移行中**:

- 段階的厳格化
- 初期は`warn`、目標は`error`

**新規開発**:

- 厳格な閾値を最初から設定
- 品質を最初から作り込む

## 詳細リソース

```bash
# 複雑度メトリクス詳細
cat .claude/skills/static-analysis/resources/complexity-metrics.md

# 閾値設定ガイド
cat .claude/skills/static-analysis/resources/threshold-guidelines.md

# Code Smells検出
cat .claude/skills/static-analysis/resources/code-smells.md
```

## テンプレート

```bash
# 基本メトリクス設定
cat .claude/skills/static-analysis/templates/basic-metrics.json

# 厳格メトリクス設定
cat .claude/skills/static-analysis/templates/strict-metrics.json
```

## スクリプト

```bash
# 複雑度分析
node .claude/skills/static-analysis/scripts/analyze-complexity.mjs [src-directory]
```

## 関連スキル

- `.claude/skills/eslint-configuration/SKILL.md`: ルール設定基盤
- `.claude/skills/code-style-guides/SKILL.md`: スタイルガイド適用

## 参考文献

- **『Refactoring JavaScript』** Evan Burchard 著
  - Chapter 3: Complexity and Decomposition
  - Chapter 5: Code Smells
- **『Clean Code』** Robert C. Martin 著
  - Chapter 3: Functions
  - Chapter 10: Classes
