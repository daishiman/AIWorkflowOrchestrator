---
name: prioritization-frameworks
description: |
  優先順位付けフレームワークの専門スキル。
  MoSCoW法、RICE Scoring、Kano分析を提供します。

  Anchors:
  • 『Inspired』（Marty Cagan） / 適用: プロダクト優先順位 / 目的: 価値最大化

  Trigger:
  優先順位付け時、バックログ整理時、機能評価時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# 優先順位付けフレームワークスキル

## 概要

MoSCoW法、RICE Scoring、Kano Modelなどの優先順位付けフレームワーク。
客観的な基準に基づいて、限られたリソースで最大の価値を提供するための
意思決定手法を体系化します。

このスキルは、プロダクト開発、バックログ管理、ロードマップ策定において、
複数の要件や施策から最適な優先順位を決定するための体系的なアプローチを提供します。

詳細な手順や背景は `references/` ディレクトリのレベル別ガイドを参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にし、適用するフレームワークを特定

**アクション**:

1. 優先順位付けの対象（フィーチャー、バグ修正、技術債など）を確認
2. ステークホルダーと制約条件（リソース、予算、時間）を把握
3. 使用するフレームワーク（MoSCoW、RICE、Kano Model）を決定
4. `references/Level1_basics.md` でフレームワークの基本を確認

### Phase 2: スキル適用

**目的**: 選定したフレームワークに従って優先順位付けを実施

**アクション**:

1. 関連リソース（Level2_intermediate.md など）を参照しながら作業を進行
2. 評価基準を定義し、候補項目を定量・定性的に評価
3. 定期的に評価結果をレビューし、判断ポイントをドキュメント化
4. 必要に応じてスクリプト（rice-calculator.py など）を活用

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. 決定理由と評価プロセスをドキュメント化
2. `scripts/validate-skill.mjs` でスキル実装の妥当性を確認
3. ステークホルダーとの合意を取得
4. `scripts/log_usage.mjs` を実行して記録を保存

## Task仕様ナビ

| フレームワーク   | 用途                         | 適用シーン                     | リソース               |
| ---------------- | ---------------------------- | ------------------------------ | ---------------------- |
| MoSCoW法         | 要件の分類と優先度決定       | スプリント計画、リリース計画   | Level1_basics.md       |
| RICE Scoring     | 定量的なスコアリング         | ロードマップ策定、複数案の比較 | Level2_intermediate.md |
| Kano Model       | 顧客満足度と要件の関係分析   | 要件定義、機能企画             | Level3_advanced.md     |
| Value vs Effort  | シンプルな2軸分析            | 迅速な優先順位付け             | Level1_basics.md       |
| Weighted Scoring | カスタム重み付けスコアリング | 複数基準の統合評価             | Level4_expert.md       |

## ベストプラクティス

### すべきこと

- 優先順位付けの前にステークホルダー合意を得る
- 複数のフレームワークを比較検討し、最適なものを選択する
- 定量と定性の両面から評価を実施する
- 評価基準と結果を透明性高くドキュメント化する
- 定期的に優先順位を見直し、変更理由を記録する
- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと

- 単一の視点のみで優先順位を決定する
- フレームワークに無理やり当てはめようとする
- 評価基準を明確にせずに判断する
- 一度決めた優先順位を見直さない
- アンチパターンや注意点を確認せずに進めることを避ける
- Level3_advanced.md や Level4_expert.md の応用パターンを無視する

## リソース参照

### レベル別学習ガイド

| レベル   | リソース                           | 内容                                                         |
| -------- | ---------------------------------- | ------------------------------------------------------------ |
| 1 (基礎) | `references/Level1_basics.md`       | MoSCoW法、Value vs Effort、基本的な意思決定フレームワーク    |
| 2 (実務) | `references/Level2_intermediate.md` | RICE Scoring、実務導入パターン、複数フレームワークの使い分け |
| 3 (応用) | `references/Level3_advanced.md`     | Kano Model、定性評価の統合、複雑な意思決定                   |
| 4 (専門) | `references/Level4_expert.md`       | Weighted Scoring、カスタムフレームワーク、大規模組織への適用 |

### スクリプトとツール

| スクリプト                   | 用途                                                   | 実行方法                                    |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------- |
| `scripts/rice-calculator.py` | RICE Scoreの自動算出（Reach×Impact×Confidence÷Effort） | `python3 scripts/rice-calculator.py --help` |
| `scripts/validate-skill.mjs` | スキル実装の構造検証                                   | `node scripts/validate-skill.mjs --help`    |
| `scripts/log_usage.mjs`      | 使用記録と自動評価                                     | `node scripts/log_usage.mjs --help`         |

### テンプレートと参考資料

- `references/legacy-skill.md`: 旧SKILL.mdの全文
- `assets/`: フレームワーク適用テンプレート（Level2以上で詳細記載）

### 参照書籍

- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善と品質維持

## 変更履歴

| Version | Date       | Changes                                                                                                            |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 1.0.1   | 2025-12-31 | 18-skills.md仕様に準拠：YAMLフロントマター改善、Task仕様ナビ追加、リソース参照リニューアル、ベストプラクティス拡充 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                        |
