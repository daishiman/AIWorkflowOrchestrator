# Level 2: Intermediate

## 概要

GoFのFactory系パターンを専門とするスキル。 Erich Gammaの『Design Patterns』に基づき、 オブジェクト生成の柔軟性と拡張性を提供する設計パターンを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Abstract Factory パターン / パターン構造 / 基本実装 / Builder パターン / Factory Method パターン / Registry Factory パターン
- 実務指針: IWorkflowExecutorの動的生成が必要な時 / 設定ベースのオブジェクト生成を実装する時 / 複雑なExecutorの段階的構築が必要な時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/abstract-factory.md`: abstract-factory の詳細ガイド（把握する知識: Abstract Factory パターン / パターン構造 / 基本実装）
- `resources/builder-pattern.md`: builder-pattern の詳細ガイド（把握する知識: Builder パターン / パターン構造 / 基本実装）
- `resources/factory-method.md`: factory-method の詳細ガイド（把握する知識: Factory Method パターン / パターン構造 / 基本実装）
- `resources/registry-factory.md`: registry-factory の詳細ガイド（把握する知識: Registry Factory パターン / パターン構造 / 基本実装）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Factory Patterns / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/generate-factory.mjs`: factoryを生成するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/builder-template.md`: builder-template のテンプレート
- `templates/factory-method-template.md`: factory-method-template のテンプレート

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
