---
name: alert-design
description: |
  アラート設計とAlert Fatigue回避の専門スキル。
  Mike Julianの『入門 監視』に基づく、アクション可能で過負荷を避けるアラートシステム設計を提供します。

  Anchors:
  • 『入門 監視』（Mike Julian）/ 適用: アラート設計とAlert Fatigue回避戦略 / 目的: アクション可能で過負荷を避けるアラートシステム構築

  Triggers:
  - アラートシステムを設計する時、Alert Fatigueを回避したい時に使用
  - アラート閾値を統計的に設定する時に使用
  - 通知ルーティング戦略を定義する時に使用
  - 既存アラートの有効性を改善する時に使用

allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Grep
  - Glob
---

# Alert Design - アラート設計とAlert Fatigue回避

## 概要

アラート設計とAlert Fatigue回避の専門スキル。Mike Julianの『入門 監視』に基づく、アクション可能で過負荷を避けるアラートシステム設計を提供します。

このスキルは以下の領域をカバーします：

- **アラートルール設計**: ビジネスロジックに基づく適切なアラート条件の定義
- **閾値設定方法論**: 統計的根拠に基づいた閾値設定プロセス
- **Alert Fatigue回避**: 過度な通知を減らし、重要なアラートのシグナル-ノイズ比を改善
- **アクション可能なアラート**: オペレーターが即座に対応可能なアラート設計
- **通知ルーティング**: 適切なチームメンバーへのアラート配信戦略

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. タスクの背景と現状を把握
2. 関連リソース（Level 1-4）を確認して知識ベースを整理
3. 必要なスクリプトやテンプレートを特定

**Task**: `agents/analyze-alert-context.md` を参照

### Phase 2: スキル適用と実装

**目的**: スキルの指針に従って具体的なアラート設計を実施

**アクション**:

1. `references/actionable-alert-design.md` を参照しながらアラート条件を定義
2. `references/threshold-setting-guide.md` に従って統計的根拠のある閾値を設定
3. `references/alert-fatigue-prevention.md` でよくあるアンチパターンを確認
4. `assets/alert-rules-template.yaml` を使用してアラートルールを記述

**Task**: `agents/design-alerts.md` を参照

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. `scripts/analyze-alert-effectiveness.mjs` でアラート有効性を検証
3. 成果物が目的に合致するか確認
4. `scripts/log_usage.mjs` を実行して記録を残す

**Task**: `agents/validate-alerts.md` を参照

## Task仕様ナビ

| タスクタイプ           | 説明                                                   | 参照リソース                                       | テンプレート              | 検証スクリプト                  |
| ---------------------- | ------------------------------------------------------ | -------------------------------------------------- | ------------------------- | ------------------------------- |
| アラートルール設計     | 監視対象のメトリクスに対するアラート条件を定義         | Level1_basics.md, actionable-alert-design.md       | alert-rules-template.yaml | validate-skill.mjs              |
| 閾値設定               | 統計的手法に基づいた適切な閾値値を決定                 | Level2_intermediate.md, threshold-setting-guide.md | alert-rules-template.yaml | analyze-alert-effectiveness.mjs |
| Alert Fatigue回避      | 過度な通知を削減し、信号対ノイズ比を改善               | Level3_advanced.md, alert-fatigue-prevention.md    | -                         | analyze-alert-effectiveness.mjs |
| 通知ルーティング設計   | アラートを適切なチームメンバーへ配信するポリシーを定義 | Level2_intermediate.md, actionable-alert-design.md | alert-rules-template.yaml | validate-skill.mjs              |
| アラート有効性レビュー | 既存アラートの実効性を測定・改善                       | Level4_expert.md, alert-fatigue-prevention.md      | -                         | analyze-alert-effectiveness.mjs |

## ベストプラクティス

### すべきこと

- **明確な目的を持つ**: アラートが何を検知し、誰がどのように対応すべきかを明確にする
- **統計的根拠を用いる**: ランダムな値ではなく、過去データに基づいた閾値を設定
- **アクション可能な設計**: アラート受信者が即座に対応できる明確な指示を含める
- **段階的エスカレーション**: 重大度に応じた通知ルーティングを設計
- **定期的なレビュー**: アラート有効性を定期的に測定し、改善を繰り返す
- **ノイズ削減**: 無視されているアラートや頻出するアラートを積極的に排除
- **ドキュメント化**: アラートルールの意図と設定理由を記録

### 避けるべきこと

- **任意の閾値設定**: 根拠のない数値でアラートを設定しない
- **過度な感度**: システムを揺さぶるノイズの多い設定を避ける
- **不足した感度**: 実際の問題を見落とすほど鈍感な設定を避ける
- **アクション不可能な設計**: 受信者が対応できないアラートを作成しない
- **チーム間の混乱**: 誰が何に対応すべきかが不明なルーティングを避ける
- **スタティック化**: ビジネス環境の変化に対応できない固定化されたルール

## リソース参照

### レベル別ガイド

- **Level 1 (基礎)**: `references/Level1_basics.md` - アラート設計の基本概念
- **Level 2 (実務)**: `references/Level2_intermediate.md` - 実装的なガイドと事例
- **Level 3 (応用)**: `references/Level3_advanced.md` - 複雑なシステムでの設計パターン
- **Level 4 (専門)**: `references/Level4_expert.md` - 業界標準と先進的なテクニック

### 領域別リソース

- **アラート設計**: `references/actionable-alert-design.md`
- **Alert Fatigue対策**: `references/alert-fatigue-prevention.md`
- **閾値設定方法論**: `references/threshold-setting-guide.md`
- **過去ドキュメント**: `references/legacy-skill.md`

### スクリプト

```bash
# スキル構造の検証
node .claude/skills/alert-design/scripts/validate-skill.mjs

# アラート有効性の分析
node .claude/skills/alert-design/scripts/analyze-alert-effectiveness.mjs

# 使用記録の保存
node .claude/skills/alert-design/scripts/log_usage.mjs
```

### テンプレート

- **アラートルール定義**: `assets/alert-rules-template.yaml`

## 変更履歴

| Version | Date       | Changes                                                                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | agents/3ファイル追加、Phase別Task参照を追加                                                                 |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に準拠した完全リファイン。Task仕様ナビを追加、Triggers・allowed-toolsを実装、本文構成を統一 |
| 0.9.0   | 2025-12-24 | 初期実装とアーティファクト統合                                                                              |
