# Level 2: Intermediate

## 概要

Reactカスタムフックの設計パターンと実装ベストプラクティスを専門とするスキル。 再利用可能で保守性の高いカスタムフック作成を支援します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: カスタムフック合成パターン / 合成の原則 / 原則1: 単一責務の維持 / カスタムフック設計パターン / 状態管理パターン / useToggle
- 実務指針: コンポーネントのロジックを再利用したい時 / 複雑な状態管理をカプセル化したい時 / 副作用の処理を整理したい時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/composition-patterns.md`: composition-patterns のパターン集（把握する知識: カスタムフック合成パターン / 合成の原則 / 原則1: 単一責務の維持）
- `resources/design-patterns.md`: design-patterns のパターン集（把握する知識: カスタムフック設計パターン / 状態管理パターン / useToggle）
- `resources/extraction-criteria.md`: extraction-criteria の詳細ガイド（把握する知識: カスタムフック抽出の判断基準 / 抽出判断フローチャート / 抽出すべきケース）
- `resources/testing-strategies.md`: testing-strategies の詳細ガイド（把握する知識: カスタムフックテスト戦略 / 基本セットアップ / 基本的なテストパターン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Custom Hooks Patterns / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-hook-candidates.mjs`: hookcandidatesを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/advanced-hooks-template.md`: advanced-hooks-template のテンプレート
- `templates/basic-hooks-template.md`: basic-hooks-template のテンプレート

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
