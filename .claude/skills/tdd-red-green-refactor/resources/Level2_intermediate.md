# Level 2: Intermediate

## 概要

ケント・ベックのテスト駆動開発（TDD）サイクルを専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 目的 / 手順 / Step 1: 最小限の実装を考える / Step 1: テスト対象の決定 / Step 1: 改善点の特定 / 非機能要件

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/green-phase.md`: Green Phaseリソース（把握する知識: 目的 / 手順 / Step 1: 最小限の実装を考える）
- `resources/red-phase.md`: Red Phaseリソース（把握する知識: 目的 / 手順 / Step 1: テスト対象の決定）
- `resources/refactor-phase.md`: Refactor Phaseリソース（把握する知識: 目的 / 手順 / Step 1: 改善点の特定）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件）
- `resources/tdd-anti-patterns.md`: Tdd Anti Patternsリソース（把握する知識: TDDアンチパターン / プロセスに関するアンチパターン / 1. テストを後から書く（Test After））
- `resources/test-naming.md`: Test Namingリソース（把握する知識: テスト命名規則 / 命名パターン / パターン1: should + 期待動作 + when + 条件）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: TDD Red-Green-Refactor / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-coverage.mjs`: Analyze Coverageスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/test-template.md`: Testテンプレート

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
