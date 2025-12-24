# Level 2: Intermediate

## 概要

Given-When-Then形式によるテスト可能な受け入れ基準の定義スキル。 要件の完了条件を明確化し、自動テストへの変換を可能にします。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: エッジケースパターン集 / 入力データのエッジケース / 1. 文字列 / Given-When-Then パターン集 / 基本構造 / 各部の役割
- 実務指針: 機能要件の完了条件を定義する時 / ユーザーストーリーに受け入れ基準を追加する時 / テストケースの基盤を作成する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/edge-case-patterns.md`: エッジケースパターン集（把握する知識: エッジケースパターン集 / 入力データのエッジケース / 1. 文字列）
- `resources/gwt-patterns.md`: Given-When-Thenパターン集（把握する知識: Given-When-Then パターン集 / 基本構造 / 各部の役割）
- `resources/testability-guide.md`: 曖昧な基準を測定可能で検証可能な形に変換する4つの特性（具体性・測定可能性・観測可能性・再現可能性）の実践ガイド（把握する知識: テスト可能性ガイド / テスト可能性の4つの特性 / 1. 具体性（Specificity））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Acceptance Criteria Writing / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-acceptance-criteria.mjs`: 受け入れ基準検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/acceptance-criteria-template.md`: 受け入れ基準テンプレート

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
