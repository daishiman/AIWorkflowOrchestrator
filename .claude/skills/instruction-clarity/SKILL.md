---
name: instruction-clarity
description: |
  指示文の明瞭性と実行可能性を最大化するスキル。曖昧な指示を具体的・段階的・検証可能な形式へ変換し、
  実行者（AI・人間）が「次に何をすべきか」を即座に理解できる状態を作ります。

  Anchors:
  • Made to Stick（Chip Heath & Dan Heath）/ 適用: 簡潔性・具体性・信頼性の原則 / 目的: 記憶に残り行動を促す指示の設計
  • The Pyramid Principle（Barbara Minto）/ 適用: 論理構造とトップダウン思考 / 目的: 結論先行・根拠後付けによる理解速度向上
  • 5C Principle（Clear, Concise, Complete, Concrete, Correct）/ 適用: 指示文全体 / 目的: 優れた指示の5要素による品質保証

  Trigger:
  Use when instructions contain vague terms like "appropriately", "properly", "handle", or when steps lack clear success criteria, sequencing, or measurable outcomes. Apply before creating prompts, requirements, runbooks, or any directive documentation.
allowed-tools:
  - bash
  - node
version: 1.0.0
level: 1
last_updated: 2025-12-31
references:
  - book: "Made to Stick"
    author: "Chip Heath, Dan Heath"
    concepts:
      - "簡潔性（Simple）"
      - "具体性（Concrete）"
      - "信頼性（Credible）"
  - book: "The Pyramid Principle"
    author: "Barbara Minto"
    concepts:
      - "結論先行"
      - "論理グルーピング"
      - "トップダウン思考"
---

# 指示明瞭化（Instruction Clarity）

## 概要

曖昧な指示を明確・具体的・実行可能な形式へ変換するスキル。「適切に処理する」「よろしくやる」といった不明瞭な表現を、測定可能な成功基準と段階的ステップへ分解します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 指示の構造分析

**目的**: 現在の指示を5C原則で診断し、不足要素を特定する

**アクション**:

1. `references/Level1_basics.md` で5C Principleの基準を確認
2. `scripts/analyze-instruction.mjs` で自動診断、または `assets/instruction-checklist.md` で手動検査
3. 不明瞭な箇所（曖昧語、条件不足、成功基準欠如）を一覧化

**Task**: `agents/diagnose-instruction-quality.md` を参照

### Phase 2: 明瞭化と具体化

**目的**: 不足要素を補い、5C原則を満たす指示へ再構成する

**アクション**:

1. `assets/instruction-template.md` で標準フォーマットを参照
2. 結論先行（Pyramid Principle）で構造を再編成
3. 各ステップに成功基準・検証方法・例外処理を追加
4. `references/Level2_intermediate.md` のパターンを適用

**Task**: `agents/restructure-instruction.md` を参照

### Phase 3: 検証とフィードバック

**目的**: 変換後の指示が実行可能か確認し、改善記録を残す

**アクション**:

1. `assets/instruction-checklist.md` で全項目をチェック
2. 第三者レビュー（実行者視点で理解可能か）を実施
3. `log_usage.mjs` で使用実績と改善点を記録

**Task**: `agents/validate-instruction-clarity.md` を参照

## Task仕様ナビ

| Task名               | 役割                               | 入力                          | 出力                                 | 参照先                              | 実行タイミング |
| -------------------- | ---------------------------------- | ----------------------------- | ------------------------------------ | ----------------------------------- | -------------- |
| **指示品質診断**     | 5C原則で現状の指示を評価           | 元の指示文（テキスト）        | 診断レポート（不足要素・曖昧箇所）   | `references/Level1_basics.md`       | Phase 1で実施  |
| **構造再編成**       | Pyramid Principleで論理構造を整理  | 診断レポート + 元の指示       | 再構成された指示（結論先行・階層化） | `assets/instruction-template.md`    | Phase 2の前半  |
| **詳細化と基準追加** | 各ステップに成功基準と検証方法追加 | 再構成指示 + ドメイン知識     | 実行可能な指示（測定可能基準付き）   | `references/Level2_intermediate.md` | Phase 2の後半  |
| **第三者検証**       | 実行者視点での理解度確認           | 完成指示 + レビュアー（人間） | 承認記録・修正指摘                   | `assets/instruction-checklist.md`   | Phase 3で実施  |

## ベストプラクティス

### すべきこと

- プロンプト、要件定義、運用手順書など、実行を伴う文書を作成する時
- 「適切に」「よろしく」「処理する」などの曖昧な動詞を含む指示がある時
- 成功基準や完了条件が不明確な指示を改善する時
- AIエージェント向けの指示を設計する時（明確性が成功率に直結）
- 実行者が複数（人間・AI・異なるチーム）で、解釈のズレが許容できない時

### 避けるべきこと

- 5C診断をスキップして直接書き直す（改善箇所が不明確になる）
- 元の指示の意図を無視して過度に詳細化する（冗長性が理解を妨げる）
- 実行者のコンテキスト（前提知識・ツール・権限）を考慮せずに書く
- 成功基準を追加せずに「明確にした」と判断する

## リソース参照

### 参照資料

以下のリソースは必要に応じて参照してください。

**基礎から応用まで（段階的学習）**:

- `references/Level1_basics.md`: 5C Principleの基本と指示品質診断方法（初心者向け）
- `references/Level2_intermediate.md`: Pyramid Principleと実務パターン（実践向け）
- `references/Level3_advanced.md`: ドメイン特化指示の設計（応用向け）
- `references/Level4_expert.md`: 複雑な条件分岐と例外処理の記述（専門向け）

**パターンカタログ**:

- `references/5c-principle-guide.md`: 5C原則（Clear, Concise, Complete, Concrete, Correct）の詳細
- `references/pyramid-principle-guide.md`: 論理構造設計と結論先行の実践ガイド
- `references/common-vague-patterns.md`: 典型的な曖昧表現とその改善例

### テンプレート

**Phase 2で使用**:

- `assets/instruction-template.md`: 標準的な指示フォーマット（結論→手順→基準）
- `assets/instruction-checklist.md`: 5C原則チェックリスト（Phase 1・3で活用）
- `assets/success-criteria-template.md`: 成功基準の記述テンプレート

### スクリプト

**自動化ツール**:

- `scripts/analyze-instruction.mjs`: 指示文から曖昧性を自動検出（Phase 1で活用）
- `scripts/log_usage.mjs`: スキル使用記録と自動評価（Phase 3で実行）
- `scripts/validate-skill.mjs`: スキル構造検証（開発時用）

## 変更履歴

| Version | Date       | Changes                                                   |
| ------- | ---------- | --------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 初版: 18-skills.md仕様準拠、agents/references/scripts実装 |
