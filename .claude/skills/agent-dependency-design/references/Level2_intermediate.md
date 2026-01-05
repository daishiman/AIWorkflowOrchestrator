# Level 2: Intermediate

## 概要

エージェント依存関係とインターフェース設計を専門とするスキル。 スキル参照、コマンド連携、エージェント間協調のプロトコルを定義し、 循環依存を防ぎながら効果的なマルチエージェントシステムを構築します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Dependency Patterns / 依存関係の種類 / 2. エージェント依存（Agent Dependency） / Agent Dependency Design / リソース構造 / リソース読み取り
- 実務指針: エージェントがスキルを参照する必要がある時 / エージェント間の情報受け渡しを設計する時 / 依存関係の循環を検出・解消する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/dependency-patterns.md`: 4種類の依存関係（スキル・エージェント・コマンド・ツール）のパターンと標準ハンドオフプロトコル（JSON形式）、循環依存検出・解消策（把握する知識: Dependency Patterns / 依存関係の種類 / 2. エージェント依存（Agent Dependency））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Agent Dependency Design / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-circular-deps.mjs`: 循環依存検出スクリプト (Node.js)
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/handoff-protocol-template.json`: ハンドオフプロトコルテンプレート

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
