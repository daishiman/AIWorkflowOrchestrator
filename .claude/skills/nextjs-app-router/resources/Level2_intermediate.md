# Level 2: Intermediate

## 概要

Next.js App Routerのアーキテクチャと実装パターンを専門とするスキル。 Guillermo Rauchの「Server-First」「Convention over Configuration」思想に基づき、 高速で保守性の高いルーティング構造を設計・実装します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Layout階層設計 / Layout vs Template / Layout階層構造 / レンダリング戦略ガイド / 戦略一覧 / 判断フローチャート
- 実務指針: Next.js App Routerのルーティング構造を設計する時 / Server ComponentsとClient Componentsの使い分けを判断する時 / 動的ルートやRoute Groupsを実装する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/layout-hierarchy.md`: Layout階層設計（把握する知識: Layout階層設計 / Layout vs Template / Layout階層構造）
- `resources/rendering-strategies.md`: レンダリング戦略ガイド（把握する知識: レンダリング戦略ガイド / 戦略一覧 / 判断フローチャート）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 技術スタック仕様書）
- `resources/routing-patterns.md`: ルーティングパターン詳細（把握する知識: 基本ルーティング / フォルダ構造とURL対応 / 特殊ファイル優先順位）
- `resources/server-client-decision.md`: Server/Client Components 判断フロー（把握する知識: Server/Client Components 判断フロー / 基本判断フローチャート / Server Components）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Next.js App Router / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-routing-structure.mjs`: app/ディレクトリ構造の解析とルーティングパターン・コンポーネント分離の妥当性検証スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/layout-template.md`: Root/Group Layoutの実装とメタデータ・フォント設定を含むlayout.tsxテンプレート
- `templates/page-template.md`: Server/Client Components判断とデータフェッチ・動的ルートパラメータを含むpage.tsxテンプレート

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
