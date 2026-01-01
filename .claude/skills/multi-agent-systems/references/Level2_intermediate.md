# Level 2: Intermediate

## 概要

マルチエージェントシステム設計を専門とするスキル。 エージェント間協調、ハンドオフプロトコル、情報受け渡しにより、 効果的な分散システムを構築します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Collaboration Patterns / 4つの協調パターン / 1. 委譲（Delegation） / ============================================================================= / Multi-Agent Systems / リソース読み取り
- 実務指針: 複数エージェントの協調を設計する時 / ハンドオフプロトコルを定義する時 / エージェント間の依存関係を設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/collaboration-patterns.md`: Collaboration Patterns（把握する知識: Collaboration Patterns / 4つの協調パターン / 1. 委譲（Delegation））
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: =============================================================================）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Multi-Agent Systems / リソース読み取り）

### スクリプト運用
- `scripts/analyze-collaboration.mjs`: 協調パターン検証とハンドオフプロトコル分析スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/handoff-protocol-template.json`: エージェント間情報受け渡しの標準化されたJSONフォーマットテンプレート

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
