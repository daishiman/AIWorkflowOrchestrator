# Level 2: Intermediate

## 概要

ケント・ベックが提唱したテスト駆動開発（TDD）の原則を体系化したスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: テスト駆動設計の創発 / TDDが促進する設計原則 / SOLID原則への自然な準拠 / 目的 / 原則 / アンチパターン

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/design-emergence.md`: Design Emergenceリソース（把握する知識: テスト駆動設計の創発 / TDDが促進する設計原則 / SOLID原則への自然な準拠）
- `resources/red-green-refactor.md`: Red Green Refactorリソース（把握する知識: 目的 / 原則 / アンチパターン）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件）
- `resources/small-steps.md`: Small Stepsリソース（把握する知識: 原則: 一度に一つのことだけを変更 / なぜ小さなステップか？ / ステップサイズの指標）
- `resources/test-first-principles.md`: Test First Principlesリソース（把握する知識: テストファースト原則 / 原則1: テストは仕様である / 概念）
- `resources/legacy-code-strategies.md`: Legacy Code Strategiesリソース（把握する知識: レガシーコード対応戦略 / 接合部（Seams）の概念 / Seamとは）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: TDD Principles / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/tdd-cycle-validator.mjs`: Tdd Cycle Validatorスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/tdd-session-template.md`: Tdd Sessionテンプレート

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
