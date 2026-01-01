---
name: hallucination-prevention
description: |
  AIのハルシネーション（幻覚・誤情報生成）を防止するスキル。プロンプトレベル、パラメータレベル、検証レベルの3層防御により、信頼性の高いAI出力を実現します。

  Anchors:
  • The Pragmatic Programmer / 適用: 実践的改善と品質維持 / 目的: 段階的検証とフィードバックループ構築
  • Thinking, Fast and Slow / 適用: System 1/2思考分離 / 目的: 直感的推測の抑制と論理的検証の強制
  • Design by Contract / 適用: 入出力契約設計 / 目的: 事前条件・事後条件・不変条件による出力保証

  Trigger:
  Use when preventing AI hallucinations, ensuring factual accuracy, requiring verifiable outputs, or implementing truth constraints.
  Keywords: hallucination prevention, fact-checking, verification, accuracy, factual output, citation required, ground truth, temperature tuning, prompt safety
version: 2.0.0
last_updated: 2025-12-31
---

# Hallucination Prevention

## 概要

AIのハルシネーション（幻覚・誤情報生成）を防止するスキル。
プロンプトレベル、パラメータレベル、検証レベルの3層防御により、
信頼性の高いAI出力を実現します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: タスク分析と前提整理

**目的**: タスクの目的と前提条件を明確にし、ハルシネーションリスクを特定する

**Task仕様**: `agents/phase1-analysis.md`

**実行内容**:

- ユーザー要求の意図を正確に理解
- 事実要求と推測要求を分離
- ハルシネーションリスク要素（日付、固有名詞、数値、技術仕様）を洗い出し
- 必要な参照リソース（references/Level1-4.md, scripts/, assets/）を決定

**入力**: ユーザー要求、タスクコンテキスト

**出力**: タスク分析レポート（目的、成功基準、リスク要素、参照リソース）

### Phase 2: ハルシネーション防止策の実装

**目的**: 3層防御（プロンプト、パラメータ、検証）を実装する

**Task仕様**: `agents/phase2-implementation.md`

**実行内容**:

- **プロンプトレベル防御**: 事実要求の明示、推測禁止、不確実性表明（`references/prompt-level-defense.md` 参照）
- **パラメータレベル調整**: Temperature（0.0-0.3）、Top-p設定（`references/parameter-tuning.md` 参照）
- **検証メカニズム組み込み**: 事実チェックポイント、引用元明示（`references/verification-mechanisms.md`, `assets/verification-checklist.md` 参照）

**入力**: タスク分析レポート、参照リソース

**出力**: 実装レポート（3層防御の詳細、設定値と理由）

### Phase 3: 検証と記録

**目的**: 実装結果を検証し、フィードバックループを回す

**Task仕様**: `agents/phase3-verification.md`

**実行内容**:

- `assets/verification-checklist.md` による成果物検証
- `scripts/validate-skill.mjs` によるスキル構造確認
- `scripts/log_usage.mjs` による実行記録保存
- 改善提案の記録

**入力**: 実装レポート、成功基準

**出力**: 検証レポート（判定結果、改善提案、次回への引き継ぎ事項）

## ベストプラクティス

### すべきこと

- 事実に基づく出力が必要な時
- AIの誤情報を防ぎたい時
- 信頼性の高い出力が求められる時
- 出力に根拠を持たせたい時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/hallucination-prevention/references/Level1_basics.md
cat .claude/skills/hallucination-prevention/references/Level2_intermediate.md
cat .claude/skills/hallucination-prevention/references/Level3_advanced.md
cat .claude/skills/hallucination-prevention/references/Level4_expert.md
cat .claude/skills/hallucination-prevention/references/legacy-skill.md
cat .claude/skills/hallucination-prevention/references/parameter-tuning.md
cat .claude/skills/hallucination-prevention/references/prompt-level-defense.md
cat .claude/skills/hallucination-prevention/references/verification-mechanisms.md
```

### スクリプト実行

```bash
node .claude/skills/hallucination-prevention/scripts/log_usage.mjs --help
node .claude/skills/hallucination-prevention/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/hallucination-prevention/assets/verification-checklist.md
```

## 変更履歴

| Version | Date       | Changes                                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md spec compliance: agents/ Tasks, EVALS.json, LOGS.md, updated frontmatter with Anchors/Trigger |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                |
