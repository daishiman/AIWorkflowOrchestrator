# Level 2: Intermediate

## 概要

アラート設計とAlert Fatigue回避の専門スキル。 Mike Julianの『入門 監視』に基づく、アクション可能で過負荷を避けるアラートシステム設計を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: アクション可能アラート設計 / アクション可能性の5要素 / 1. 問題の明確化 / Alert Fatigue回避戦略 / Alert Fatigueとは / 回避戦略
- 実務指針: アラートルールと閾値を設計する時 / Alert Fatigue（アラート疲れ）を回避する時 / 通知ルーティングとエスカレーションポリシーを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/actionable-alert-design.md`: アクション可能なアラート設計ガイド（把握する知識: アクション可能アラート設計 / アクション可能性の5要素 / 1. 問題の明確化）
- `resources/alert-fatigue-prevention.md`: Alert Fatigue回避戦略と実践手法（把握する知識: Alert Fatigue回避戦略 / Alert Fatigueとは / 回避戦略）
- `resources/threshold-setting-guide.md`: 統計的根拠に基づく閾値設定ガイド（把握する知識: 閾値設定ガイド / 閾値設計の基本原則 / 原則1: データ駆動）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Alert Design - アラート設計とAlert Fatigue回避 / 核心概念 / 1. アクション可能なアラート）

### スクリプト運用
- `scripts/analyze-alert-effectiveness.mjs`: アラート有効性分析スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/alert-rules-template.yaml`: アラートルール定義テンプレート

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
