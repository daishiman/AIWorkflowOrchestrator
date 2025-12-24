---
name: .claude/skills/interview-techniques/SKILL.md
description: |
  要求抽出のためのヒアリングスキル。オープンエンド質問、要求の深掘り、
  前提の明確化を通じて、ユーザーの真のニーズを引き出します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/5w1h-framework.md`: Why/Who/What/When/Where/Howによる網羅的要件理解手法
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/question-types.md`: 7種類の質問タイプ（オープン/クローズド/深堀り/仮説検証/シナリオ/比較/反転）と使い分け
  - `resources/why-analysis.md`: 5回のWhy繰り返しによる根本ニーズ発見手法
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/prepare-interview.mjs`: ヒアリング準備チェックリストと質問セット自動生成
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/interview-guide.md`: インタビュー実施ガイドとフロー制御テンプレート
  
  Use proactively when handling interview techniques tasks.
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

# Interview Techniques

## 概要

要求抽出のためのヒアリングスキル。オープンエンド質問、要求の深掘り、
前提の明確化を通じて、ユーザーの真のニーズを引き出します。

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
- ユーザーから要望をヒアリングする時
- 曖昧な要求を明確化する時
- 隠れたニーズを発見する時
- ステークホルダーの優先順位を確認する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/interview-techniques/resources/5w1h-framework.md
cat .claude/skills/interview-techniques/resources/Level1_basics.md
cat .claude/skills/interview-techniques/resources/Level2_intermediate.md
cat .claude/skills/interview-techniques/resources/Level3_advanced.md
cat .claude/skills/interview-techniques/resources/Level4_expert.md
cat .claude/skills/interview-techniques/resources/legacy-skill.md
cat .claude/skills/interview-techniques/resources/question-types.md
cat .claude/skills/interview-techniques/resources/why-analysis.md
```

### スクリプト実行
```bash
node .claude/skills/interview-techniques/scripts/log_usage.mjs --help
node .claude/skills/interview-techniques/scripts/prepare-interview.mjs --help
node .claude/skills/interview-techniques/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/interview-techniques/templates/interview-guide.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
