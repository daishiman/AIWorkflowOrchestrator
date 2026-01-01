---
name: static-analysis
description: |
  静的コード解析と品質メトリクスの専門スキル。複雑度分析、Code Smell検出、保守性評価によるコード品質の定量化を実現します。

  Anchors:
  • 『Clean Code』（Robert C. Martin）/ 適用: コード品質 / 目的: バグと保守性問題の早期発見
  • 『Code Complete』（Steve McConnell）/ 適用: 複雑度管理 / 目的: 認知負荷の軽減とメンテナンス性向上

  Trigger:
  静的解析設定時、コード品質チェック時、自動コードレビュー構築時に使用。複雑度メトリクス測定、Code Smell検出、閾値基準適用時に自動選択
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# 静的解析スキル

## 概要

静的解析メトリクスと品質指標の専門知識です。コード品質を定量的に測定し、複雑度を分析し、技術的債務を特定します。このスキルは CI/CD パイプラインへの統合、自動コードレビュー、品質ゲート構築に活用されます。

詳細な手順や背景は `references/Level1_basics.md`（基礎）と `references/Level2_intermediate.md`（実務）を参照してください。高度な適用については `references/Level3_advanced.md` と `references/Level4_expert.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 分析対象の言語・フレームワークを特定
3. 適用するメトリクス（複雑度、重複コード、保守性など）を決定
4. 閾値ガイドライン（`references/threshold-guidelines.md`）を参照

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 対象コードの複雑度分析を実施（`scripts/analyze-complexity.mjs` など）
2. Code Smell検出（`references/code-smells.md`）
3. 複雑度メトリクス測定（`references/complexity-metrics.md`）
4. テンプレート（`assets/basic-metrics.json`、`assets/strict-metrics.json`）を適用
5. 改善優先度を決定

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 分析結果が閾値ガイドラインに合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す
4. CI/CD パイプラインへの統合確認

## Task 仕様ナビ

| Task             | 対応フェーズ | リソース                | テンプレート        | 説明                                       |
| ---------------- | ------------ | ----------------------- | ------------------- | ------------------------------------------ |
| 複雑度分析       | Phase 2      | complexity-metrics.md   | basic-metrics.json  | サイクロマティック複雑度、認知複雑度を測定 |
| Code Smell検出   | Phase 2      | code-smells.md          | -                   | 保守性を低下させるパターン検出             |
| 閾値設定         | Phase 1      | threshold-guidelines.md | strict-metrics.json | メトリクス基準値を定義・適用               |
| パイプライン統合 | Phase 2      | Level3_advanced.md      | -                   | CI/CDへの自動化を構成                      |
| 品質レポート作成 | Phase 3      | Level2_intermediate.md  | basic-metrics.json  | 分析結果の文書化                           |

## ベストプラクティス

### すべきこと

- `references/Level1_basics.md` を参照し、適用範囲を明確にする
- `references/Level2_intermediate.md` を参照し、実務手順を整理する
- `references/threshold-guidelines.md` で言語別・プロジェクト別の基準値を確認
- 複雑度が高い関数・クラスは `references/code-smells.md` で詳細分析
- 定期的に `scripts/analyze-complexity.mjs` でメトリクスを更新
- 分析結果を `scripts/log_usage.mjs` で記録

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- 実測値のない仮定で閾値を設定
- 改善優先度を決めずに複数の問題を同時に対応
- メトリクス結果の根拠なき却下
- 言語・フレームワークを考慮しない一律基準の適用

## リソース参照

### リソースドキュメント

| リソース                            | 用途                         |
| ----------------------------------- | ---------------------------- |
| `references/Level1_basics.md`        | スキルの基礎知識、入門ガイド |
| `references/Level2_intermediate.md`  | 実務的な手順、事例紹介       |
| `references/Level3_advanced.md`      | 高度な分析技法、最適化       |
| `references/Level4_expert.md`        | 専門的な適用、カスタマイズ   |
| `references/code-smells.md`          | Code Smell パターンカタログ  |
| `references/complexity-metrics.md`   | 複雑度メトリクス説明書       |
| `references/threshold-guidelines.md` | 言語別・文脈別の基準値ガイド |
| `references/legacy-skill.md`         | 旧SKILL.mdの全文（参考用）   |

### スクリプト

| スクリプト                       | 説明               | 使用例                                                 |
| -------------------------------- | ------------------ | ------------------------------------------------------ |
| `scripts/analyze-complexity.mjs` | 複雑度分析実行     | `node analyze-complexity.mjs --path src --format json` |
| `scripts/log_usage.mjs`          | 使用記録・自動評価 | `node log_usage.mjs --task "複雑度分析"`               |
| `scripts/validate-skill.mjs`     | スキル構造検証     | `node validate-skill.mjs`                              |

### テンプレート

| テンプレート                    | 用途                   | 適用シーン                             |
| ------------------------------- | ---------------------- | -------------------------------------- |
| `assets/basic-metrics.json`  | 基本的なメトリクス定義 | プロジェクト開始時、簡易分析           |
| `assets/strict-metrics.json` | 厳格なメトリクス定義   | 品質重視プロジェクト、エンタープライズ |

## 変更履歴

| Version | Date       | Changes                                                                                         |
| ------- | ---------- | ----------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様対応：Anchors・Trigger追加、Task仕様ナビ・allowed-tools追加、ワークフロー充実化 |
