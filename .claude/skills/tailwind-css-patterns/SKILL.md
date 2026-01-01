---
name: .claude/skills/tailwind-css-patterns/SKILL.md
description: |
  Tailwind CSSを活用した効率的で保守性の高いスタイリングパターンの専門知識。
  Class Variance Authority (CVA)、Tailwind Merge、レスポンシブデザイン、
  ダークモード対応の実装パターンを提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/cva-guide.md`: CVA Guideリソース
  - `references/dark-mode-guide.md`: Dark Mode Guideリソース
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/responsive-patterns.md`: Responsive Patternsリソース
  - `scripts/analyze-tailwind.mjs`: Analyze Tailwindスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/component-variants-template.tsx`: Component Variantsテンプレート
  - `assets/tailwind-config-template.js`: Tailwind Configテンプレート
  
  Use proactively when handling tailwind css patterns tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# .claude/skills/tailwind-css-patterns/SKILL.md

## 概要

Tailwind CSSを活用した効率的で保守性の高いスタイリングパターンの専門知識。
Class Variance Authority (CVA)、Tailwind Merge、レスポンシブデザイン、
ダークモード対応の実装パターンを提供します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

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
- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/tailwind-css-patterns/references/Level1_basics.md
cat .claude/skills/tailwind-css-patterns/references/Level2_intermediate.md
cat .claude/skills/tailwind-css-patterns/references/Level3_advanced.md
cat .claude/skills/tailwind-css-patterns/references/Level4_expert.md
cat .claude/skills/tailwind-css-patterns/references/cva-guide.md
cat .claude/skills/tailwind-css-patterns/references/dark-mode-guide.md
cat .claude/skills/tailwind-css-patterns/references/legacy-skill.md
cat .claude/skills/tailwind-css-patterns/references/responsive-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/tailwind-css-patterns/scripts/analyze-tailwind.mjs --help
node .claude/skills/tailwind-css-patterns/scripts/log_usage.mjs --help
node .claude/skills/tailwind-css-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/tailwind-css-patterns/assets/component-variants-template.tsx
cat .claude/skills/tailwind-css-patterns/assets/tailwind-config-template.js
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
