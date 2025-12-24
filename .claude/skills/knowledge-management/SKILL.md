---
name: .claude/skills/knowledge-management/SKILL.md
description: |
  SECIモデル（野中郁次郎）に基づく組織知識の形式知化と共有を専門とするスキル。
  暗黙知を形式知に変換し、体系化することで再利用可能な知識として組織全体で活用可能にします。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/curation-framework.md`: 知識の収集・評価・統合・更新プロセスと情報源の信頼性評価基準
  - `resources/freshness-strategy.md`: 陳腐化検出メカニズム、更新優先順位、定期レビュースケジュール、自動監視
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/quality-assurance.md`: 完全性・明確性・再現性の3軸評価、品質スコア算出、検証プロセス
  - `resources/seci-combination.md`: 形式知の統合・体系化プロセス、知識の階層構造設計、参照関係の整理
  - `resources/seci-externalization.md`: 暗黙知の言語化・概念化手法、パターン抽象化、検証可能性の確保
  - `resources/seci-model-details.md`: SECIサイクルの理論的背景、4フェーズの詳細手順、適用事例とパターン
  - `resources/seci-socialization.md`: 暗黙知の源泉特定、情報収集手法、一次情報源の評価基準
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-knowledge.mjs`: ドキュメント品質の自動検証（必須セクション、ファイルサイズ、陳腐化チェック）
  - `scripts/validate-knowledge.sh`: 知識ドキュメントの品質検証シェルスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/knowledge-document-template.md`: 標準的な知識文書化テンプレート（SECIモデル準拠）
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling knowledge management tasks.
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

# Knowledge Management

## 概要

SECIモデル（野中郁次郎）に基づく組織知識の形式知化と共有を専門とするスキル。
暗黙知を形式知に変換し、体系化することで再利用可能な知識として組織全体で活用可能にします。

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
- ベストプラクティスやノウハウを文書化する時
- コードレビューコメントや議論を形式知化する時
- 経験や勘に基づく暗黙知を明示的な知識に変換する時
- 知識ベースの品質評価や陳腐化チェックを行う時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/knowledge-management/resources/Level1_basics.md
cat .claude/skills/knowledge-management/resources/Level2_intermediate.md
cat .claude/skills/knowledge-management/resources/Level3_advanced.md
cat .claude/skills/knowledge-management/resources/Level4_expert.md
cat .claude/skills/knowledge-management/resources/curation-framework.md
cat .claude/skills/knowledge-management/resources/freshness-strategy.md
cat .claude/skills/knowledge-management/resources/legacy-skill.md
cat .claude/skills/knowledge-management/resources/quality-assurance.md
cat .claude/skills/knowledge-management/resources/seci-combination.md
cat .claude/skills/knowledge-management/resources/seci-externalization.md
cat .claude/skills/knowledge-management/resources/seci-model-details.md
cat .claude/skills/knowledge-management/resources/seci-socialization.md
```

### スクリプト実行
```bash
node .claude/skills/knowledge-management/scripts/log_usage.mjs --help
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs --help
.claude/skills/knowledge-management/scripts/validate-knowledge.sh
node .claude/skills/knowledge-management/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/knowledge-management/templates/knowledge-document-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
