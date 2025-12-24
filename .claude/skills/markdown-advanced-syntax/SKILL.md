---
name: .claude/skills/markdown-advanced-syntax/SKILL.md
description: |
  Markdown高度構文を活用した技術文書作成の専門スキル。
  Mermaid図、高度なテーブル、コードブロック、数式表現等を適切に使用し、
  読み手にとって分かりやすく、メンテナンス性の高いドキュメントを作成します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/advanced-tables.md`: カラム整列、マージセル表現、複雑なデータ構造、読みやすさ最適化
  - `resources/code-blocks.md`: 言語固有ハイライト、差分表示、行番号、ファイル名表示、実行可能コード
  - `resources/front-matter.md`: YAMLメタデータ定義、title/version/author、ステータス管理、検索最適化
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/math-expressions.md`: LaTeX/KaTeX記法、インライン数式、ディスプレイ数式、数学記号
  - `resources/mermaid-diagrams.md`: フローチャート・シーケンス図・ER図・状態遷移図の作成ガイド、スタイリング
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-mermaid.mjs`: Mermaid構文の自動検証（構文エラー、レンダリング可能性チェック）
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/specification-template.md`: 仕様書テンプレート（Mermaid図・高度テーブル・コードブロック統合）
  
  Use proactively when handling markdown advanced syntax tasks.
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

# Markdown Advanced Syntax

## 概要

Markdown高度構文を活用した技術文書作成の専門スキル。
Mermaid図、高度なテーブル、コードブロック、数式表現等を適切に使用し、
読み手にとって分かりやすく、メンテナンス性の高いドキュメントを作成します。

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
- 複雑なフローやシステム構造を視覚化する時
- APIやデータモデルの構造を表形式で整理する時
- コードサンプルを明確に提示する時
- 数学的な概念や式を含むドキュメントを作成する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/markdown-advanced-syntax/resources/Level1_basics.md
cat .claude/skills/markdown-advanced-syntax/resources/Level2_intermediate.md
cat .claude/skills/markdown-advanced-syntax/resources/Level3_advanced.md
cat .claude/skills/markdown-advanced-syntax/resources/Level4_expert.md
cat .claude/skills/markdown-advanced-syntax/resources/advanced-tables.md
cat .claude/skills/markdown-advanced-syntax/resources/code-blocks.md
cat .claude/skills/markdown-advanced-syntax/resources/front-matter.md
cat .claude/skills/markdown-advanced-syntax/resources/legacy-skill.md
cat .claude/skills/markdown-advanced-syntax/resources/math-expressions.md
cat .claude/skills/markdown-advanced-syntax/resources/mermaid-diagrams.md
```

### スクリプト実行
```bash
node .claude/skills/markdown-advanced-syntax/scripts/log_usage.mjs --help
node .claude/skills/markdown-advanced-syntax/scripts/validate-mermaid.mjs --help
node .claude/skills/markdown-advanced-syntax/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/markdown-advanced-syntax/templates/specification-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
