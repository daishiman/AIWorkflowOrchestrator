---
name: .claude/skills/react-hooks-advanced/SKILL.md
description: |
  React Hooksの高度な使用パターンと最適化技術を専門とするスキル。
  ダン・アブラモフの思想に基づき、予測可能で効率的な状態管理を実現します。
  
  📖 参照書籍:
  - 『Learning React』（Alex Banks, Eve Porcello）: コンポーネント設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/dependency-array-patterns.md`: 完全性原則、ESLint準拠、無限ループと古いクロージャ問題の解決法
  - `resources/hooks-selection-guide.md`: Hooks選択ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/memoization-strategies.md`: useCallback/useMemo/React.memoの測定駆動最適化と効果的パターン
  - `resources/use-reducer-patterns.md`: useReducerパターン
  - `scripts/analyze-hooks-usage.mjs`: React Hooks使用状況分析スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/custom-hook-template.md`: カスタムフックテンプレート
  - `templates/use-reducer-template.md`: useReducerテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling react hooks advanced tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Learning React"
    author: "Alex Banks, Eve Porcello"
    concepts:
      - "コンポーネント設計"
      - "パフォーマンス"
---

# React Hooks Advanced

## 概要

React Hooksの高度な使用パターンと最適化技術を専門とするスキル。
ダン・アブラモフの思想に基づき、予測可能で効率的な状態管理を実現します。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- React Hooksの最適な使い分けを判断する時
- useEffectの依存配列を設計する時
- パフォーマンス最適化のためのメモ化戦略を検討する時
- 複雑な状態管理でuseReducerを活用する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/react-hooks-advanced/resources/Level1_basics.md
cat .claude/skills/react-hooks-advanced/resources/Level2_intermediate.md
cat .claude/skills/react-hooks-advanced/resources/Level3_advanced.md
cat .claude/skills/react-hooks-advanced/resources/Level4_expert.md
cat .claude/skills/react-hooks-advanced/resources/dependency-array-patterns.md
cat .claude/skills/react-hooks-advanced/resources/hooks-selection-guide.md
cat .claude/skills/react-hooks-advanced/resources/legacy-skill.md
cat .claude/skills/react-hooks-advanced/resources/memoization-strategies.md
cat .claude/skills/react-hooks-advanced/resources/use-reducer-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/react-hooks-advanced/scripts/analyze-hooks-usage.mjs --help
node .claude/skills/react-hooks-advanced/scripts/log_usage.mjs --help
node .claude/skills/react-hooks-advanced/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/react-hooks-advanced/templates/custom-hook-template.md
cat .claude/skills/react-hooks-advanced/templates/use-reducer-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
