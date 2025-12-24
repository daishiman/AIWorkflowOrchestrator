# Level 2: Intermediate

## 概要

エンタープライズアーキテクチャパターン（Hexagonal、Onion、Ports and Adapters等）の

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ヘキサゴナルアーキテクチャ（Ports and Adapters） / 核心概念 / 基本構造 / オニオンアーキテクチャ（Onion Architecture） / 1. Domain Model（最内層） / アーキテクチャ設計
- 実務指針: アーキテクチャパターンを選択・評価する時 / 外部システムとの境界を設計する時 / ドメイン中心の設計を実現する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/hexagonal-architecture.md`: ヘキサゴナルアーキテクチャ（Ports and Adapters）（把握する知識: ヘキサゴナルアーキテクチャ（Ports and Adapters） / 核心概念 / 基本構造）
- `resources/onion-architecture.md`: オニオンアーキテクチャ（Onion Architecture）（把握する知識: オニオンアーキテクチャ（Onion Architecture） / 基本構造 / 1. Domain Model（最内層））
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: アーキテクチャ設計 / 統合システム設計仕様書：Universal AI Workflow Orchestrator）
- `resources/vertical-slice.md`: 垂直スライスアーキテクチャ（Vertical Slice Architecture）（把握する知識: 垂直スライスアーキテクチャ（Vertical Slice Architecture） / 従来アーキテクチャとの比較 / 水平レイヤー（従来））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Architectural Patterns / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/evaluate-pattern-compliance.mjs`: アーキテクチャパターン準拠評価スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/pattern-comparison.md`: アーキテクチャパターン比較レポート

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
