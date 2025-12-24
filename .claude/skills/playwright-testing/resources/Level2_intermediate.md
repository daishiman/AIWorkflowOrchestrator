# Level 2: Intermediate

## 概要

Playwrightによるブラウザ自動化テストの実装技術。 安定した待機戦略、適切なセレクタ選択、効率的なテスト設計を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: テスト設計原則 / 1. テストの独立性 / 2. テストの原子性 / セレクタの種類と優先順位 / 1. Role-based Selectors (最優先) / 2. Label-based Selectors
- 実務指針: E2Eテストの実装が必要な時 / ブラウザ自動化テストが求められる時 / フレーキーテストの問題を解決する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/playwright-best-practices.md`: Playwrightテスト設計のベストプラクティス（安定性、保守性、並列実行）（把握する知識: テスト設計原則 / 1. テストの独立性 / 2. テストの原子性）
- `resources/selector-strategies.md`: data-testid、Role-based、Label-basedセレクタの優先順位と使い分け（把握する知識: セレクタの種類と優先順位 / 1. Role-based Selectors (最優先) / 2. Label-based Selectors）
- `resources/waiting-strategies.md`: 自動待機、明示的待機、条件ベース待機の使い分けとフレーキーテスト回避（把握する知識: 待機戦略の重要性 / 待機戦略の種類 / 1. 自動待機 (Auto-waiting)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 核心概念 / 1. Playwright の基本アーキテクチャ / 2. 安定した待機戦略）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/validate-test-structure.mjs`: Playwrightテストファイルの構造と命名規則を検証

### テンプレート運用
- `templates/test-template.ts`: Page Object Model、Fixture活用を含むPlaywrightテストのTypeScriptテンプレート

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
