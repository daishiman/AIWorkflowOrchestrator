# Level 2: Intermediate

## 概要

ドメイン駆動設計における値オブジェクトの設計と実装パターンを専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: よく使う値オブジェクトパターン / 識別子パターン / UserId / CustomerId / OrderId / バリデーション戦略 / バリデーションの原則 / 1. 生成時にバリデーション

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/common-patterns.md`: Common Patternsリソース（把握する知識: よく使う値オブジェクトパターン / 識別子パターン / UserId / CustomerId / OrderId）
- `resources/validation-strategies.md`: Validation Strategiesリソース（把握する知識: バリデーション戦略 / バリデーションの原則 / 1. 生成時にバリデーション）
- `resources/value-object-fundamentals.md`: Value Object Fundamentalsリソース（把握する知識: 値オブジェクトの基礎 / 値オブジェクトの本質 / 特性）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Value Object Patterns / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/detect-primitive-obsession.mjs`: Detect Primitive Obsessionスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/composite-value-object.ts`: Composite Value Objectテンプレート
- `templates/simple-value-object.ts`: Simple Value Objectテンプレート

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
