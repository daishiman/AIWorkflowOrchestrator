# Level 2: Intermediate

## 概要

Vitestの高度な機能と最適化パターンを専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 非同期テスト / async/await / 基本パターン / カバレッジ最適化 / カバレッジの設定 / 基本設定

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/async-testing.md`: Async Testingリソース（把握する知識: 非同期テスト / async/await / 基本パターン）
- `resources/coverage-optimization.md`: Coverage Optimizationリソース（把握する知識: カバレッジ最適化 / カバレッジの設定 / 基本設定）
- `resources/mocking-patterns.md`: Mocking Patternsリソース（把握する知識: モッキングパターン / 基本的なMock / vi.fn() - 関数のMock）
- `resources/performance-tips.md`: Performance Tipsリソース（把握する知識: パフォーマンス改善 / 並行実行 / スレッド設定）
- `resources/test-structure.md`: Test Structureリソース（把握する知識: テスト構造とライフサイクル / 基本構造 / describe/it/test）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Vitest Advanced / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/coverage-analyzer.mjs`: Coverage Analyzerスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/test-file-template.ts`: Test Fileテンプレート

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
