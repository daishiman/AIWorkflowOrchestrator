---
name: risk-management
description: |
  プロジェクト/プロダクトのリスクを識別・分析・対応・監視するための実務スキル。
  影響度・確率の評価とリスクレジスター更新を通じて、意思決定と実行計画の質を高める。

  Anchors:
  • PMBOK Guide (PMI) / 適用: リスク管理プロセス全体 / 目的: 標準プロセスの一貫性確保
  • ISO 31000 / 適用: 評価基準と対応方針 / 目的: 組織横断での判断基準統一
  • Waltzing with Bears / 適用: 開発リスク識別 / 目的: 早期発見と分類精度の向上
  • How to Measure Anything / 適用: 定量評価と不確実性低減 / 目的: 根拠ある数値推定

  Trigger:
  Use when you need to identify, analyze, prioritize, mitigate, or monitor project risks, build or update a risk register, or assess change impact and contingency plans.
  risk assessment, risk register, probability impact matrix, EMV, mitigation plan, contingency plan, risk monitoring
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# risk-management

## 概要

リスクの洗い出しから評価、対応策、監視までを一貫して整理し、リスクレジスターを更新しながら意思決定の精度を高める。
変更影響や不確実性の高い領域を可視化し、優先順位に基づいた対応計画を作成する。

---

## ワークフロー

```
識別 → 分析 → 対応計画 → 監視
  ↑                        ↓
  ←←←← フィードバック ←←←←←
```

### Phase 1: リスク識別

**目的**: 潜在的なリスクを網羅的に抽出し、識別版リスクレジスターを作成する

**アクション**:

1. プロジェクト目的・制約・前提を整理する
2. 主要カテゴリ（技術/スケジュール/要件/人員/外部）を設定する
3. 手法（ブレインストーミング、SWOT、チェックリスト）でリスクを抽出する
4. If-Then形式で記述し、初期レジスターに記録する

**Task**: `agents/risk-identification.md` を参照

### Phase 2: リスク分析

**目的**: 確率・影響度・EMVを評価し、優先順位を決定する

**アクション**:

1. 評価スケールと根拠データを定義する
2. リスクスコアとEMVを算出する
3. 高/中/低の優先度を割り当てる
4. 分析結果をレジスターに反映する

**Task**: `agents/risk-analysis.md` を参照

### Phase 3: リスク対応計画

**目的**: 対応戦略と具体的アクションを定義し、残存リスクを見積もる

**アクション**:

1. 回避/軽減/転嫁/受容を選定する
2. 実行アクション、責任者、期限を設定する
3. コスト・効果を比較し、承認事項を整理する
4. 残存リスクを再評価しレジスターに更新する

**Task**: `agents/risk-mitigation.md` を参照

### Phase 4: リスク監視と更新

**目的**: 進捗・トリガーを監視し、レジスターと報告を更新する

**アクション**:

1. 監視頻度と指標を決め、定期レビューを実施する
2. 対応状況・トリガー兆候・新規リスクを記録する
3. 更新版レジスターと監視レポートを共有する

**Task**: `agents/risk-monitoring.md` を参照

---

## Task仕様ナビ

| Task                | 起動タイミング                      | 入力                             | 出力                                   |
| ------------------- | ----------------------------------- | -------------------------------- | -------------------------------------- |
| risk-identification | キックオフ/変更要請時               | プロジェクト概要、前提、制約     | 識別版リスクレジスター                 |
| risk-analysis       | 識別完了後/定期レビュー時           | 識別版レジスター、履歴データ     | 評価済みレジスター、優先度リスト       |
| risk-mitigation     | 高・中リスク確定後                  | 評価済みレジスター、制約条件     | 対応計画付きレジスター、対応計画サマリ |
| risk-monitoring     | スプリント/マイルストーンレビュー時 | 対応計画付きレジスター、進捗情報 | 更新版レジスター、監視レポート         |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照
**注記**: Taskは責務単位で分離し、1 Task = 1 責務を基本とする。

---

## ベストプラクティス

### すべきこと

| 推奨事項                         | 理由                                   |
| -------------------------------- | -------------------------------------- |
| 早期にリスク識別を実施する       | 後戻りコストを抑え、対応余地を確保する |
| 根拠データと評価基準を明示する   | 評価の再現性と説明責任を担保する       |
| 優先順位に基づいて対応計画を絞る | 限られたリソースを集中投入する         |
| 監視頻度とトリガーを明文化する   | 兆候を早期に捉えエスカレーションする   |
| レジスターを常に最新版に保つ     | 判断材料の鮮度を維持する               |

### 避けるべきこと

| 禁止事項                           | 問題点                                 |
| ---------------------------------- | -------------------------------------- |
| リスク記述を曖昧なまま放置する     | 影響評価や対応計画の精度が落ちる       |
| 低確率リスクを記録せずに除外する   | 想定外のインパクトを見逃す             |
| 対応策の責任者と期限を決めない     | 実行されず形骸化する                   |
| 監視フェーズを省略して完了とする   | 新規リスクや再発を見逃す               |
| 評価根拠を共有せず属人的に判断する | 合意形成が進まず、再評価に時間を要する |

---

## リソース参照

### scripts/（決定論的処理）

| スクリプト                         | 機能                                   |
| ---------------------------------- | -------------------------------------- |
| `scripts/calculate-risk-score.mjs` | リスクスコア/EMVの計算とマトリクス表示 |
| `scripts/log_usage.mjs`            | 運用ログの追記                         |
| `scripts/validate-skill.mjs`       | スキル構造と必須ファイルの検証         |

### references/（詳細知識）

| リソース           | パス                                                                               | 読込条件                     |
| ------------------ | ---------------------------------------------------------------------------------- | ---------------------------- |
| 基本ガイド         | [references/Level1_basics.md](references/Level1_basics.md)                         | 初回適用時                   |
| 運用ガイド         | [references/Level2_intermediate.md](references/Level2_intermediate.md)             | リスク分析/対応計画の実務時  |
| 高度運用ガイド     | [references/Level3_advanced.md](references/Level3_advanced.md)                     | 高リスク/複雑案件の対応時    |
| 改善ループガイド   | [references/Level4_expert.md](references/Level4_expert.md)                         | 運用改善やレビューサイクル時 |
| 識別手法詳細       | [references/risk-identification.md](references/risk-identification.md)             | 識別フェーズの手法が必要時   |
| 識別ワークショップ | [references/risk-identification-guide.md](references/risk-identification-guide.md) | 識別セッション準備時         |
| 分析手法詳細       | [references/risk-analysis.md](references/risk-analysis.md)                         | 分析フェーズの手法参照時     |
| 分析フレームワーク | [references/risk-analysis-framework.md](references/risk-analysis-framework.md)     | 評価基準設計や見直し時       |

### assets/（テンプレート・素材）

| アセット                           | 用途                             |
| ---------------------------------- | -------------------------------- |
| `assets/risk-register-template.md` | プロジェクト全体のレジスター雛形 |
| `assets/risk-register.md`          | 個別リスク詳細シート             |

---

## 変更履歴

| Version | Date       | Changes                                  |
| ------- | ---------- | ---------------------------------------- |
| 1.1.0   | 2026-01-02 | 18-skills.md仕様準拠・変更履歴追加・整理 |
| 1.0.0   | 2025-12-28 | 初版作成                                 |
