---
name: risk-management
description: |
  プロジェクトリスク管理の専門スキル。
  リスク識別、評価、軽減策立案を体系的に提供します。

  Anchors:
  • 『PMBOK Guide』（PMI） / 適用: リスク管理 / 目的: プロジェクト成功率向上
  • 『プロジェクト管理知識体系』（著: デビッド・アイ） / 適用: リスク評価 / 目的: 客観的なリスク分析

  Trigger:
  リスク管理計画時、プロジェクトリスク分析時、リスク軽減計画策定時、変更インパクト評価時、アーキテクチャ決定時
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# リスク管理スキル

## 概要

プロジェクトリスクの識別、評価、軽減戦略の体系的手法です。プロアクティブなリスク管理により、プロジェクトの成功確率を最大化し、予期しないトラブルを事前に防止します。

このスキルは以下の場面で活用されます：

- プロジェクト開始時のリスク洗い出しと評価
- スプリント計画時のリスク特定と対応策検討
- アーキテクチャ決定時の影響分析
- 変更管理とインパクト評価

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認し、リスク管理の基本フローを理解
2. リスク識別、評価、軽減、監視の各段階を把握
3. 必要な references/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的なリスク管理作業を進める

**アクション**:

1. **リスク識別**: ブレインストーミング、SWOT分析、チェックリスト、デルファイ法を活用
2. **リスク評価**: 確率・影響度マトリクスやEMV分析により優先度を決定
3. **リスク軽減**: 対応戦略（回避、軽減、受容、転嫁）を策定
4. 関連リソースやテンプレートを参照しながら作業を実施
5. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. リスクレジスター、分析結果、対応策が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す
4. `scripts/calculate-risk-score.mjs` を活用してリスクスコアを算出

## Task仕様ナビ

| フェーズ   | タスク                       | リソース                                    | スクリプト               |
| ---------- | ---------------------------- | ------------------------------------------- | ------------------------ |
| リスク識別 | リスクの包括的な洗い出し     | Level1_basics.md, risk-identification.md    | -                        |
| リスク識別 | 識別したリスクの詳細分析     | risk-identification-guide.md                | -                        |
| リスク評価 | 確率・影響度分析             | risk-analysis.md, Level2_intermediate.md    | calculate-risk-score.mjs |
| リスク評価 | EMV分析・優先順位付け        | risk-analysis-framework.md                  | calculate-risk-score.mjs |
| リスク軽減 | 対応戦略の策定               | Level3_advanced.md                          | -                        |
| リスク監視 | リスクレジスターの作成・更新 | risk-register.md, risk-register-template.md | log_usage.mjs            |
| 検証       | スキル構造の確認             | -                                           | validate-skill.mjs       |

## ベストプラクティス

### すべきこと

- **早期実施**: プロジェクト初期段階でリスク識別と評価を実施
- **体系的実施**: リスク識別 → 評価 → 軽減 → 監視のサイクルを遵守
- **定期的レビュー**: スプリント単位でリスク評価を見直す
- **ステークホルダー参加**: リスク識別時にチーム全体を巻き込む
- **ドキュメント化**: リスクレジスターを公開・共有する
- **数量化**: 確率・影響度、EMVを用いた客観的評価を心がける
- **対応策の明確化**: 各リスクに対して具体的な対応策を決定

### 避けるべきこと

- リスク評価後に対応策を検討しないまま放置する
- リスク分析に時間をかけすぎてプロジェクト開始が遅延する
- 属人的な判断のみでリスク評価を行う
- 低確率リスクを過度に懸念する
- リスク監視を放置し、新しいリスクに気づかない
- 評価済みリスクへの対応状況を追跡しない
- Level4_expert.md の高度な分析手法を理解せずに適用する

## リソース参照

### Resources

- **`references/Level1_basics.md`**: リスク管理の基本概念と初期的なリスク識別手法
- **`references/Level2_intermediate.md`**: リスク評価・軽減の実務的なアプローチ
- **`references/Level3_advanced.md`**: 高度なリスク分析と複雑なシナリオへの対応
- **`references/Level4_expert.md`**: 専門的なリスク管理フレームワークと組織的な運用
- **`references/legacy-skill.md`**: 旧SKILL.mdの全文
- **`references/risk-identification.md`**: リスク識別手法の詳細ガイド（ブレインストーミング、SWOT、チェックリスト、デルファイ法）
- **`references/risk-identification-guide.md`**: リスク識別ガイド
- **`references/risk-analysis.md`**: 確率・影響度マトリクス、EMV分析、モンテカルロシミュレーション等の分析手法
- **`references/risk-analysis-framework.md`**: リスク分析フレームワークの詳細ガイド

### Scripts

- **`scripts/calculate-risk-score.mjs`**: リスクスコア・EMV自動計算ツール（Node.js実行可能）
  ```bash
  node .claude/skills/risk-management/scripts/calculate-risk-score.mjs --help
  ```
- **`scripts/log_usage.mjs`**: 使用記録・自動評価スクリプト
  ```bash
  node .claude/skills/risk-management/scripts/log_usage.mjs --help
  ```
- **`scripts/validate-skill.mjs`**: スキル構造検証スクリプト
  ```bash
  node .claude/skills/risk-management/scripts/validate-skill.mjs --help
  ```

### Templates

- **`assets/risk-register.md`**: リスクレジスター標準テンプレート（評価、対応策、監視計画含む）
- **`assets/risk-register-template.md`**: リスクレジスターのテンプレート

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に準拠した構成へ更新        |
