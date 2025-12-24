# Level 2: Intermediate

## 概要

フレーキー（不安定）なテストを防止する技術。 非決定性の排除、リトライロジック、安定性向上パターンを提供します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 非決定性パターンと対処法 / 目次 / 非決定性とは / 非機能要件 / リトライ戦略 / リトライの必要性
- 実務指針: テストが時々失敗する時 / テスト実行結果が不安定な時 / 並列実行時の問題が発生する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/non-determinism-patterns.md`: non-determinism-patterns のパターン集（把握する知識: 非決定性パターンと対処法 / 目次 / 非決定性とは）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件）
- `resources/retry-strategies.md`: .claude/skills/retry-strategies/SKILL.md の詳細ガイド（把握する知識: リトライ戦略 / 目次 / リトライの必要性）
- `resources/stability-checklist.md`: stability-checklist のチェックリスト（把握する知識: 目次 / テスト設計の安定性 / 基本原則）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 核心概念 / 1. 非決定性の排除 / 2. リトライロジック）

### スクリプト運用
- `scripts/detect-flaky-tests.mjs`: detectflakytestsを処理するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/stable-test-template.ts`: stable-test-template のテンプレート

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
