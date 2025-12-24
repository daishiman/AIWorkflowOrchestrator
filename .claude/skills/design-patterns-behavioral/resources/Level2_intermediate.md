# Level 2: Intermediate

## 概要

GoF（Gang of Four）の行動パターンを専門とするスキル。 エリック・ガンマの『デザインパターン』に基づき、オブジェクト間の通信と 責務の分散を効果的に設計するパターンを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Chain of Responsibility Pattern（責任の連鎖パターン） / パターン構造 / 構成要素 / Command Pattern（コマンドパターン） / Observer Pattern（オブザーバーパターン） / パターン選択ガイド
- 実務指針: ワークフローエンジンでアルゴリズムの切り替えが必要な時 / 共通処理フローを定義し、個別実装を分離したい時 / 操作の実行、取り消し、キューイングが必要な時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/chain-of-responsibility-pattern.md`: chain-of-responsibility-pattern の詳細ガイド（把握する知識: Chain of Responsibility Pattern（責任の連鎖パターン） / パターン構造 / 構成要素）
- `resources/command-pattern.md`: command-pattern の詳細ガイド（把握する知識: Command Pattern（コマンドパターン） / パターン構造 / 構成要素）
- `resources/observer-pattern.md`: observer-pattern の詳細ガイド（把握する知識: Observer Pattern（オブザーバーパターン） / パターン構造 / 構成要素）
- `resources/pattern-selection-guide.md`: pattern-selection-guide のガイド（把握する知識: パターン選択ガイド / 判断フローチャート / パターン比較マトリックス）
- `resources/state-pattern.md`: state-pattern の詳細ガイド（把握する知識: State Pattern（ステートパターン） / パターン構造 / 構成要素）
- `resources/strategy-pattern.md`: strategy-pattern の詳細ガイド（把握する知識: Strategy Pattern（戦略パターン） / パターン構造 / 構成要素）
- `resources/template-method-pattern.md`: template-method-pattern の詳細ガイド（把握する知識: Template Method Pattern（テンプレートメソッドパターン） / パターン構造 / 構成要素）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Design Patterns - Behavioral / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-pattern-usage.mjs`: patternusageを検証するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/strategy-implementation.md`: strategy-implementation のテンプレート
- `templates/template-method-implementation.md`: template-method-implementation のテンプレート

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
