---
name: requirements-verification
description: |
  要件検証の専門スキル。要件の完全性、一貫性、実現可能性を体系的に評価し、品質を保証するためのフレームワークです。

  Anchors:
  • 『Software Requirements』（Karl Wiegers） / 適用: 要件検証全体 / 目的: 完全性・一貫性・実現可能性の評価
  • 『Don't Make Me Think』（Steve Krug） / 適用: ユーザー要件検証 / 目的: ユーザビリティ視点からの品質確認

  Trigger:
  要件検証時、要件品質確認時、要件レビュープロセス実施時に使用
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - Glob
  - Grep
---

# 要件検証（Requirements Verification）

## 概要

要件の品質を体系的に評価するためのスキル。カール・ウィーガーズの要求工学理論に基づき、
一貫性・整合性・完全性・実現可能性を検証し、後続フェーズへの問題を早期に発見します。

## ワークフロー

### Phase 1: 要件セットの分析

**目的**: 検証対象の要件を理解し、検証戦略を立案する

**アクション**:

1. 対象要件ドキュメント（仕様書、ユーザーストーリー等）を収集
2. 要件の構造（機能要件・非機能要件・制約等）を把握
3. 検証視点（一貫性・完全性・実現可能性等）を決定
4. [requirements-analysis](agents/requirements-analysis.md) を実行して背景把握

### Phase 2: 検証ルール適用と品質評価

**目的**: 複数の検証ルールを組織的に適用し、問題を検出する

**アクション**:

1. [consistency-checker](agents/consistency-checker.md) で一貫性を確認
2. [completeness-validator](agents/completeness-validator.md) で完全性を評価
3. [feasibility-assessor](agents/feasibility-assessor.md) で実現可能性を判定
4. 各レベル（基礎/実務/応用/専門）に応じて [references/](references/) から知識を参照

### Phase 3: 検証結果報告と改善提案

**目的**: 検出した課題をドキュメント化し、改善案を提示する

**アクション**:

1. 検証結果を標準テンプレート（[assets/verification-report-template.md](assets/verification-report-template.md)）でまとめる
2. 優先度別に課題をリスト化
3. [scripts/log_usage.mjs](scripts/log_usage.mjs) で実行記録を保存

## Task仕様ナビ

要件検証プロセスを細分化したTask仕様書。各Taskは隔離された実行コンテキストで実行され、
メインコンテキストに試行錯誤を持ち込みません。

| Task名             | ファイル                           | 役割                                 | 入力                        | 出力                                   | 実行タイミング |
| ------------------ | ---------------------------------- | ------------------------------------ | --------------------------- | -------------------------------------- | -------------- |
| **要件分析**       | `agents/requirements-analysis.md`  | 要件セットの構造と背景を理解         | 要件ドキュメント            | 分析レポート（構造図、依存関係マップ） | Phase 1 開始時 |
| **一貫性確認**     | `agents/consistency-checker.md`    | 要件間の矛盾や重複を検出             | 要件セット + 一貫性ルール   | 矛盾リスト（優先度付き）               | Phase 2        |
| **完全性検証**     | `agents/completeness-validator.md` | 不足している要件や曖昧性を把握       | 要件セット + チェックリスト | 欠落項目リスト（重要度別）             | Phase 2        |
| **実現可能性評価** | `agents/feasibility-assessor.md`   | 技術/コスト/時間的な実現可能性を判定 | 要件セット + リソース制約   | 実行可能性スコア + リスク分析          | Phase 2        |
| **改善提案**       | `agents/improvement-suggester.md`  | 検出した課題に対する改善案を作成     | 検証結果                    | 改善提案書（実装優先度付き）           | Phase 3        |

## ベストプラクティス

### すべきこと

- **要件の文脈を理解する**: [references/Level1_basics.md](references/Level1_basics.md) で基礎理論を確認してから検証を開始
- **段階的に検証する**: Phase 1 → 2 → 3 の順序を守り、各フェーズで判断を記録
- **複数視点から評価する**: ユーザー視点・技術視点・ビジネス視点から検証
- **検証ルールを明確化する**: 曖昧な基準で判定せず、[references/verification-techniques.md](references/verification-techniques.md) で定義されたルールを適用
- **改善提案を実行可能に**: 「悪い」と指摘するだけでなく、具体的な改善案を提示

### 避けるべきこと

- **詳細レベル検証をスキップ**: [references/Level3_advanced.md](references/Level3_advanced.md) の高度なテクニックを必ず確認
- **定性的評価だけに頼る**: 定量的メトリクス（完全性スコア、矛盾数等）も測定
- **発見者視点だけで判定**: [references/Level4_expert.md](references/Level4_expert.md) で専門的見地からも再検証
- **ユーザビリティ視点の欠落**: ユーザー要件検証時は [Don't Make Me Think] フレームワークを適用
- **検証結果の記録漏れ**: Phase 3 終了時に必ず [scripts/log_usage.mjs](scripts/log_usage.mjs) を実行

## リソース参照

### 参考資料（段階別）

- **基礎（Level 1）**: [references/Level1_basics.md](references/Level1_basics.md) — 要件検証の基本原則と手法
- **実務（Level 2）**: [references/Level2_intermediate.md](references/Level2_intermediate.md) — 実際の検証プロセスと対応例
- **応用（Level 3）**: [references/Level3_advanced.md](references/Level3_advanced.md) — 複雑な要件セットへの対応
- **専門（Level 4）**: [references/Level4_expert.md](references/Level4_expert.md) — トレードオフ分析と組織的改善

### 検証技法集

- [references/verification-techniques.md](references/verification-techniques.md) — 検証ルール一覧と適用方法
- [references/legacy-skill.md](references/legacy-skill.md) — 前バージョンの知識ベース

### アセット・テンプレート

- [assets/verification-checklist.md](assets/verification-checklist.md) — 検証チェックリスト（印刷用）
- [assets/verification-report-template.md](assets/verification-report-template.md) — 検証報告書テンプレート

### スクリプト

| スクリプト                        | 用途                           | 使用例                                                          |
| --------------------------------- | ------------------------------ | --------------------------------------------------------------- |
| `scripts/log_usage.mjs`           | 実行記録・フィードバックログ   | `node scripts/log_usage.mjs --result success --phase "Phase 3"` |
| `scripts/validate-skill.mjs`      | スキル構造検証（定期チェック） | `node scripts/validate-skill.mjs`                               |
| `scripts/verify-requirements.mjs` | 要件ファイルの形式検証         | `node scripts/verify-requirements.mjs <file.md>`                |

## 変更履歴

| Version | Date       | Changes                                                        |
| ------- | ---------- | -------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様へ準拠、Task仕様ナビ追加、Anchors・Trigger統合 |
| 0.9.0   | 2025-12-24 | 初版リリース                                                   |
