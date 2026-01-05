---
name: progressive-disclosure
description: |
  3層開示モデル（メタデータ→本文→リソース）による段階的な情報提供で、トークン効率と知識スケーラビリティを両立。スキル発動信頼性を最大化し、必要な時に必要な知識だけをロードします。

  Anchors:
  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / 適用: 段階的な情報開示と実践的改善 / 目的: トークン効率を維持しながら深い知識を提供
  • Progressive Disclosure (Jakob Nielsen) / 適用: 認知負荷の最小化 / 目的: UX設計原則のスキルメタデータへの応用
  • Information Architecture (Louis Rosenfeld) / 適用: 階層的知識組織化 / 目的: 遅延読み込みとインデックス駆動設計

  Trigger:
  Use when designing skill metadata, optimizing token usage, implementing progressive disclosure patterns, improving skill activation reliability, organizing knowledge hierarchically, reducing context window consumption, or creating scalable documentation structures.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Progressive Disclosure

## 概要

3層開示モデル（メタデータ→本文→リソース）による段階的な情報提供で、トークン効率と知識スケーラビリティを両立するスキル。スキルメタデータ設計、トークン最適化、発動率向上の実務指針を提供します。

## ワークフロー

Progressive Disclosureの実践は、3つのPhaseに分割して実行します。

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. タスクの目的を1-2文で明文化
2. 必要な references/scripts/assets を特定
3. 前提条件を検証し、欠落を洗い出す

**出力**: 分析レポート、リソース特定リスト

**Task**: `agents/phase1-analysis.md` を参照

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 必要なreferencesを段階的に読み込む（Level1→Level2→Level3→Level4）
2. 関連リソースやテンプレートを参照しながら作業を実施
3. 重要な判断点をメモとして残す

**出力**: 最終成果物、判断ログ、使用リソースリスト

**Task**: `agents/phase2-execution.md` を参照

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

**出力**: 検証レポート、LOGS.mdエントリ、EVALS.jsonメトリクス

**Task**: `agents/phase3-validation.md` を参照

## Task仕様ナビ

| Task              | 起動タイミング | 入力             | 出力                         |
| ----------------- | -------------- | ---------------- | ---------------------------- |
| phase1-analysis   | Phase 1開始時  | タスク要求       | 分析レポート、リソースリスト |
| phase2-execution  | Phase 2開始時  | 分析レポート     | 成果物、判断ログ             |
| phase3-validation | Phase 3開始時  | 成果物、判断ログ | 検証レポート、記録           |

## ベストプラクティス

### すべきこと

- スキルのYAML Frontmatter（特にdescription）を設計する時
- トークン使用量を最小化する必要がある時
- スキルの自動発動率を向上させる時
- 大量の知識を効率的に提供する必要がある時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進める
- SKILL.mdに500行以上の詳細を記述する
- リソースの遅延読み込みを無視して全て一括ロードする
- メタデータ層のトリガー条件を曖昧に記述する

## リソース参照

### references/

| リソース                  | パス                                          | 用途                       |
| ------------------------- | --------------------------------------------- | -------------------------- |
| 基本運用                  | `references/Level1_basics.md`                 | SKILL.md完結の基本運用     |
| 実践手順                  | `references/Level2_intermediate.md`           | リソース活用の実践手順     |
| 高度な設計                | `references/Level3_advanced.md`               | 大規模スキルの設計パターン |
| エキスパート運用          | `references/Level4_expert.md`                 | トークン効率の極限最適化   |
| メタデータ設計ガイド      | `references/metadata-design.md`               | YAML Frontmatter設計の詳細 |
| 3層開示モデル詳細         | `references/three-layer-model.md`             | トークン削減効果の計算     |
| スキル発動最適化          | `references/skill-activation-optimization.md` | 発動率向上テクニック       |
| トークン効率戦略          | `references/token-efficiency-strategies.md`   | 遅延読み込み戦略           |
| コミットメントメカニズム  | `references/commitment-mechanism.md`          | AI評価の強制プロトコル     |
| スキル構造ガイド          | `references/skill-structure-guide.md`         | ディレクトリ構造設計       |
| Agent依存関係フォーマット | `references/agent-dependency-format-guide.md` | Agent間の依存関係設計      |

### scripts/

| スクリプト                  | 用途               | 使用例                                        |
| --------------------------- | ------------------ | --------------------------------------------- |
| `log_usage.mjs`             | 実行記録           | `node scripts/log_usage.mjs --result success` |
| `validate-skill.mjs`        | スキル構造検証     | `node scripts/validate-skill.mjs`             |
| `calculate-token-usage.mjs` | トークン使用量推定 | `node scripts/calculate-token-usage.mjs .`    |

### assets/

| テンプレート                   | 用途                         |
| ------------------------------ | ---------------------------- |
| `skill-metadata-template.yaml` | メタデータ設計のテンプレート |

## 変更履歴

| Version | Date       | Changes                                           |
| ------- | ---------- | ------------------------------------------------- |
| 2.0.0   | 2026-01-02 | 18-skills.md仕様完全準拠版に再構築                |
| 1.0.0   | 2025-12-24 | 初版作成（Spec alignment and required artifacts） |
