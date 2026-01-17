---
name: context-optimization
description: |
  トークン使用量の最小化と必要情報の効率的抽出を支援するスキル。
  遅延読み込み、インデックス駆動設計、圧縮と精錬の手順を整理する。

  Anchors:
  • High Performance Browser Networking / 適用: パフォーマンス測定と最適化 / 目的: 遅延を考慮したコンテキスト設計
  • Progressive Disclosure パターン / 適用: 段階的な情報開示 / 目的: トークン使用量の抑制

  Trigger:
  Use when minimizing token usage, extracting necessary information efficiently, or optimizing context window utilization.
  context optimization, token minimization, lazy loading, index-driven design, summarization
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# context-optimization

## 概要

トークン使用量の最小化と必要情報の効率的抽出を行い、コンテキストを最適活用する。

## ワークフロー

### Phase 1: 要件整理

**目的**: 目的・制約・優先度を明確化する。

**アクション**:

1. 目的と成果物を整理する。
2. 必要情報と除外情報を整理する。
3. 優先順位と制約を整理する。

**Task**: `agents/analyze-context-requirements.md` を参照

### Phase 2: 戦略設計

**目的**: 参照順序と分割方針を設計する。

**アクション**:

1. 読み込み順序と優先度を設計する。
2. 分割単位と省略方針を整理する。
3. 出力形式を統一する。

**Task**: `agents/design-context-strategy.md` を参照

### Phase 3: 圧縮実装

**目的**: 圧縮・要約・抽出を実施する。

**アクション**:

1. 重要情報を抽出する。
2. 圧縮ルールに従って要約する。
3. 出力形式に整形する。

**Task**: `agents/implement-context-compression.md` を参照

### Phase 4: 検証と記録

**目的**: 構造と使用量を検証し記録する。

**アクション**:

1. `scripts/validate-skill.mjs` で構造を検証する。
2. `scripts/estimate-tokens.mjs` で使用量を見積もる。
3. `scripts/log_usage.mjs` で記録を更新する。

**Task**: `agents/validate-context-usage.md` を参照

## Task仕様ナビ

| Task                          | 起動タイミング | 入力         | 出力                       |
| ----------------------------- | -------------- | ------------ | -------------------------- |
| analyze-context-requirements  | Phase 1開始時  | 目的/制約    | 要件整理メモ、優先順位一覧 |
| design-context-strategy       | Phase 2開始時  | 要件整理メモ | 最適化戦略書、出力指針     |
| implement-context-compression | Phase 3開始時  | 最適化戦略書 | 圧縮サマリ、重要情報一覧   |
| validate-context-usage        | Phase 4開始時  | 圧縮サマリ   | 検証レポート、ログ更新内容 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項               | 理由                     |
| ---------------------- | ------------------------ |
| 優先順位を明文化する   | 必須情報を守るため       |
| 参照順序を設計する     | 遅延読み込みを活かすため |
| 圧縮ルールを統一する   | 再現性を高めるため       |
| テンプレートを参照する | 出力の一貫性を保つため   |

### 避けるべきこと

| 禁止事項               | 問題点               |
| ---------------------- | -------------------- |
| 全文を無条件に読み込む | トークン消費が増える |
| 省略理由を記載しない   | 判断根拠が失われる   |
| 検証なしで更新する     | 効果が確認できない   |

## リソース参照

### scripts/（決定論的処理）

| スクリプト                    | 機能                         |
| ----------------------------- | ---------------------------- |
| `scripts/estimate-tokens.mjs` | トークン見積もり             |
| `scripts/estimate-tokens.sh`  | 簡易見積もり                 |
| `scripts/validate-skill.mjs`  | スキル構造の検証             |
| `scripts/log_usage.mjs`       | 使用記録と評価メトリクス更新 |

### references/（詳細知識）

| リソース         | パス                                                                         | 読込条件       |
| ---------------- | ---------------------------------------------------------------------------- | -------------- |
| レベル1 基礎     | [references/Level1_basics.md](references/Level1_basics.md)                   | 初回整理時     |
| レベル2 実務     | [references/Level2_intermediate.md](references/Level2_intermediate.md)       | 設計時         |
| レベル3 応用     | [references/Level3_advanced.md](references/Level3_advanced.md)               | 詳細設計時     |
| レベル4 専門     | [references/Level4_expert.md](references/Level4_expert.md)                   | 改善ループ時   |
| 圧縮テクニック   | [references/compression-techniques.md](references/compression-techniques.md) | 圧縮時         |
| インデックス設計 | [references/index-driven-design.md](references/index-driven-design.md)       | 参照設計時     |
| 遅延読み込み     | [references/lazy-loading-patterns.md](references/lazy-loading-patterns.md)   | 省略方針検討時 |
| 旧スキル         | [references/legacy-skill.md](references/legacy-skill.md)                     | 互換確認時     |
| 仕様概要         | [references/18-skills-spec-summary.md](references/18-skills-spec-summary.md) | 仕様確認時     |
| 構造ガイド       | [references/skill-structure-guide.md](references/skill-structure-guide.md)   | 構造確認時     |

### assets/（テンプレート・素材）

| アセット                             | 用途                         |
| ------------------------------------ | ---------------------------- |
| `assets/context-summary-template.md` | コンテキスト整理テンプレート |

### 運用ファイル

| ファイル       | 目的                       |
| -------------- | -------------------------- |
| `EVALS.json`   | レベル評価・メトリクス管理 |
| `LOGS.md`      | 実行ログの蓄積             |
| `CHANGELOG.md` | 改善履歴の記録             |
