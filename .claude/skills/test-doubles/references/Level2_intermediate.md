# Level 2: Intermediate

## 概要

テストダブル（Mock、Stub、Fake、Spy）の適切な使い分けを専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Fakeパターン / 特徴 / 代表的なFake / Mockパターン / 基本パターン / 関数のMock

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/fake-patterns.md`: Fake Patternsリソース（把握する知識: Fakeパターン / 特徴 / 代表的なFake）
- `resources/mock-patterns.md`: Mock Patternsリソース（把握する知識: Mockパターン / 基本パターン / 関数のMock）
- `resources/stub-patterns.md`: Stub Patternsリソース（把握する知識: Stubパターン / 基本パターン / 固定値を返すStub）
- `resources/types-overview.md`: Types Overviewリソース（把握する知識: テストダブルの種類 / 5種類のテストダブル / 1. Dummy（ダミー））
- `resources/verification-strategies.md`: Verification Strategiesリソース（把握する知識: 検証戦略 / 状態検証（State Verification） / 定義）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Test Doubles / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/test-double-analyzer.mjs`: Test Double Analyzerスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/test-double-selection.md`: Test Double Selectionテンプレート

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
