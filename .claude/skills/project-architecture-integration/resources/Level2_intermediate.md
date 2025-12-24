# Level 2: Intermediate

## 概要

プロジェクト固有のアーキテクチャ設計原則を専門とするスキル。 ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API、 テスト戦略、エラーハンドリング、CI/CDの原則をエージェント設計に統合します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Hybrid Architecture Guide / アーキテクチャ構造 / 基本構造 / 技術スタック仕様書 / アーキテクチャ設計 / 統合システム設計仕様書：Universal AI Workflow Orchestrator
- 実務指針: エージェントがプロジェクト構造に準拠したファイルを生成する時 / データベース操作を行うエージェントを設計する時 / API連携エージェントを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/hybrid-architecture-guide.md`: Hybrid Architecture Guide（把握する知識: Hybrid Architecture Guide / アーキテクチャ構造 / 基本構造）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 技術スタック仕様書 / アーキテクチャ設計 / 統合システム設計仕様書：Universal AI Workflow Orchestrator）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Project Architecture Integration / リソース構造 / すべきこと）

### スクリプト運用
- `scripts/check-architecture-compliance.mjs`: check-architecture-compliance.mjs
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/architecture-compliance-checklist.md`: アーキテクチャ準拠チェックリスト

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
